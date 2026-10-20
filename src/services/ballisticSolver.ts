import { WorldCoordinate } from '../types/map';
import { FiringSolution, SolutionStatusCode, WindSettings } from '../types/ballistics';
import { MortarId } from '../types/mortar';
import { DistanceService } from '../utils/distance';
import { BearingService } from '../utils/bearing';
import { ALL_BALLISTIC_TABLES, getMortarSystem } from '../data/ballistics';

export class BallisticSolver {
  /**
   * Main ballistic calculation pipeline.
   * Produces an exact, validated FiringSolution object used across all components.
   */
  static solve(
    mortarPos: WorldCoordinate,
    targetPos: WorldCoordinate,
    mortarId: MortarId,
    ammoId: string,
    chargeInput: number, // -1 or specific charge number
    autoCharge: boolean,
    wind: WindSettings
  ): FiringSolution {
    const mortarDef = getMortarSystem(mortarId);
    const milCircle = mortarDef.milCircle;

    // 1. Geometry
    const horizontalDistance = DistanceService.calculateHorizontalDistance(mortarPos, targetPos);
    const slantDistance = DistanceService.calculateSlantDistance(mortarPos, targetPos);
    const bearingDeg = BearingService.calculateBearingDeg(mortarPos, targetPos);
    const bearingMil = BearingService.degToMil(bearingDeg, milCircle);
    const cardinalDirection = BearingService.getCardinal(bearingDeg);

    const mortarAltitude = mortarPos.z ?? 0;
    const targetAltitude = targetPos.z ?? 0;
    const heightDifference = DistanceService.calculateHeightDifference(mortarPos, targetPos);

    // Initial default invalid solution structure
    const baseSolution: FiringSolution = {
      mortarId,
      ammoId,
      charge: chargeInput >= 0 ? chargeInput : 0,
      isAutoCharge: autoCharge || chargeInput < 0,
      horizontalDistance: Number(horizontalDistance.toFixed(1)),
      slantDistance: Number(slantDistance.toFixed(1)),
      bearingDeg: Number(bearingDeg.toFixed(1)),
      bearingMil,
      cardinalDirection,
      mortarAltitude,
      targetAltitude,
      heightDifference,
      elevationMil: null,
      elevationDeg: null,
      timeOfFlight: null,
      peakAltitude: null,
      impactAngleDeg: null,
      dispersionMeters: null,
      isInterpolated: false,
      windApplied: false,
      statusCode: 'VALID',
      statusMessage: 'Ready',
      statusMessageAr: 'جاهز للاستهداف',
      verificationStatus: 'verified',
    };

    // Identical position check
    if (horizontalDistance < 1) {
      return {
        ...baseSolution,
        statusCode: 'IDENTICAL_POSITION',
        statusMessage: 'Target and mortar are at the same location',
        statusMessageAr: 'الهدف والهاون في نفس الموقع تماماً',
      };
    }

    // Check ballistic table
    const ammoTable = ALL_BALLISTIC_TABLES[ammoId];
    if (!ammoTable || Object.keys(ammoTable.charges).length === 0) {
      return {
        ...baseSolution,
        statusCode: 'NO_VERIFIED_DATA',
        statusMessage: `No ballistic table for ammunition "${ammoId}"`,
        statusMessageAr: `لا يتوفر جدول رماية موثق للذخيرة المحددة`,
        verificationStatus: 'unsupported',
      };
    }

    // 2. Select Charge (Auto or Manual)
    const availableCharges = Object.keys(ammoTable.charges)
      .map(Number)
      .sort((a, b) => a - b);

    const minPossible = Math.min(...availableCharges.map((c) => ammoTable.charges[c].minRange));
    const maxPossible = Math.max(...availableCharges.map((c) => ammoTable.charges[c].maxRange));

    const solutionWithLimits: FiringSolution = {
      ...baseSolution,
      minVerifiedRange: minPossible,
      maxVerifiedRange: maxPossible,
    };

    let selectedCharge = chargeInput;

    if (autoCharge || chargeInput < 0) {
      // Find valid charges capable of reaching this horizontal distance
      const validCharges = availableCharges.filter((c) => {
        const table = ammoTable.charges[c];
        return (
          table &&
          horizontalDistance >= table.minRange &&
          horizontalDistance <= table.maxRange
        );
      });

      if (validCharges.length === 0) {
        let msg = `Out of verified range (${minPossible}m - ${maxPossible}m)`;
        let msgAr = `خارج نطاق الرمي الموثق (${minPossible}م - ${maxPossible}م)`;
        if (horizontalDistance < minPossible) {
          msg = `Target too close (Min range: ${minPossible}m)`;
          msgAr = `الهدف قريب جداً (أدنى مدى: ${minPossible}م)`;
        } else if (horizontalDistance > maxPossible) {
          msg = `Target out of range (Max range: ${maxPossible}m)`;
          msgAr = `الهدف خارج أقصى مدى (${maxPossible}م)`;
        }

        // Default to closest charge for reference display
        const fallbackCharge = horizontalDistance > maxPossible 
          ? availableCharges[availableCharges.length - 1] 
          : availableCharges[0];

        return {
          ...solutionWithLimits,
          charge: fallbackCharge,
          statusCode: 'OUT_OF_RANGE',
          statusMessage: msg,
          statusMessageAr: msgAr,
        };
      }

      // Standard mortar doctrine: Choose lowest valid charge for steep plunge, less barrel wear, and shorter blast signature
      selectedCharge = validCharges[0];
    }

    // Verify selected charge exists
    const chargeTable = ammoTable.charges[selectedCharge];
    if (!chargeTable) {
      return {
        ...solutionWithLimits,
        charge: selectedCharge,
        statusCode: 'INCOMPLETE_TABLE',
        statusMessage: `Charge ${selectedCharge} data table is missing`,
        statusMessageAr: `جدول بيانات الحشوة ${selectedCharge} غير متوفر`,
      };
    }

    // Range checks for selected charge
    if (horizontalDistance < chargeTable.minRange) {
      return {
        ...solutionWithLimits,
        charge: selectedCharge,
        statusCode: 'OUT_OF_RANGE',
        statusMessage: `Distance ${Math.round(horizontalDistance)}m is below Charge ${selectedCharge} min (${chargeTable.minRange}m)`,
        statusMessageAr: `المسافة ${Math.round(horizontalDistance)}م أقل من أدنى مدى للحشوة ${selectedCharge} (${chargeTable.minRange}م)`,
      };
    }

    if (horizontalDistance > chargeTable.maxRange) {
      return {
        ...solutionWithLimits,
        charge: selectedCharge,
        statusCode: 'OUT_OF_RANGE',
        statusMessage: `Distance ${Math.round(horizontalDistance)}m exceeds Charge ${selectedCharge} max (${chargeTable.maxRange}m)`,
        statusMessageAr: `المسافة ${Math.round(horizontalDistance)}م تتجاوز أقصى مدى للحشوة ${selectedCharge} (${chargeTable.maxRange}م)`,
      };
    }

    // 3. Interpolation in Charge Table
    const entries = chargeTable.entries;
    let rawElevMil = 0;
    let tof = 0;
    let heightCorrRate = 0;
    let peakAlt = 0;
    let impactAngle = 0;
    let dispersion = 0;
    let isInterpolated = false;

    // Exact match search
    const exact = entries.find((e) => Math.abs(e.range - horizontalDistance) < 0.05);
    if (exact) {
      rawElevMil = exact.elevationMil;
      tof = exact.timeOfFlight;
      heightCorrRate = exact.heightCorrectionMilPer100m ?? 1.0;
      peakAlt = exact.peakAltitude ?? 0;
      impactAngle = exact.impactAngleDeg ?? 65;
      dispersion = exact.dispersionMeters ?? 5;
    } else {
      // Find bounding entries
      let lower = entries[0];
      let upper = entries[entries.length - 1];

      for (let i = 0; i < entries.length - 1; i++) {
        if (horizontalDistance >= entries[i].range && horizontalDistance <= entries[i + 1].range) {
          lower = entries[i];
          upper = entries[i + 1];
          break;
        }
      }

      const rangeSpan = upper.range - lower.range;
      const factor = rangeSpan > 0 ? (horizontalDistance - lower.range) / rangeSpan : 0;

      rawElevMil = lower.elevationMil + factor * (upper.elevationMil - lower.elevationMil);
      tof = lower.timeOfFlight + factor * (upper.timeOfFlight - lower.timeOfFlight);
      
      const lowerHc = lower.heightCorrectionMilPer100m ?? 1.0;
      const upperHc = upper.heightCorrectionMilPer100m ?? 1.0;
      heightCorrRate = lowerHc + factor * (upperHc - lowerHc);

      const lowerPa = lower.peakAltitude ?? 0;
      const upperPa = upper.peakAltitude ?? 0;
      peakAlt = lowerPa + factor * (upperPa - lowerPa);

      const lowerIa = lower.impactAngleDeg ?? 65;
      const upperIa = upper.impactAngleDeg ?? 65;
      impactAngle = lowerIa + factor * (upperIa - lowerIa);

      const lowerDisp = lower.dispersionMeters ?? 5;
      const upperDisp = upper.dispersionMeters ?? 5;
      dispersion = lowerDisp + factor * (upperDisp - lowerDisp);

      isInterpolated = true;
    }

    // 4. Height Correction
    // Mortar high-angle rule:
    // When target is above mortar (dz > 0), target requires flatter trajectory to reach higher ground, so elevation mils decrease (closer to 45° / 800 mil).
    // In mils: correction = -(dz / 100) * heightCorrRate
    const heightCorrectionMil = Number((-(heightDifference / 100) * heightCorrRate).toFixed(1));
    let finalElevMil = Math.round(rawElevMil + heightCorrectionMil);

    // 5. Elevation Limits Validation
    if (finalElevMil < mortarDef.minElevationMil || finalElevMil > mortarDef.maxElevationMil) {
      return {
        ...baseSolution,
        charge: selectedCharge,
        rawElevationMil: Math.round(rawElevMil),
        heightCorrectionMil,
        statusCode: 'ELEVATION_LIMIT_EXCEEDED',
        statusMessage: `Calculated elevation (${finalElevMil} mil) outside tube limits [${mortarDef.minElevationMil} - ${mortarDef.maxElevationMil}]`,
        statusMessageAr: `الزاوية المحسوبة (${finalElevMil} مل) خارج حدود زوايا المدفع [${mortarDef.minElevationMil} - ${mortarDef.maxElevationMil}]`,
      };
    }

    // Elevation in degrees
    const finalElevDeg = Number(((finalElevMil / milCircle) * 360).toFixed(2));

    // 6. Wind Correction (if enabled)
    let windApplied = false;
    let crosswindDeflectionMil = 0;
    let headwindCorrectionMeters = 0;

    if (wind.enabled && wind.speed > 0) {
      windApplied = true;
      // Convert wind direction to angle relative to firing line
      // If wind convention is 'FROM', wind blows FROM that heading
      // Vector of wind velocity direction:
      const windVectorDeg = wind.convention === 'FROM' 
        ? (wind.directionDeg + 180) % 360 
        : wind.directionDeg;

      const relativeAngleRad = ((windVectorDeg - bearingDeg) * Math.PI) / 180;
      
      // Crosswind (perpendicular to line of fire):
      // Positive = wind pushes projectile right -> aim left (negative azimuth mils)
      const crosswindSpeed = wind.speed * Math.sin(relativeAngleRad); // m/s
      // Deflection in mils: approximate Reforger mortar crosswind coefficient (~0.5 - 0.8 mil per m/s per km)
      const distKm = horizontalDistance / 1000;
      crosswindDeflectionMil = Number((crosswindSpeed * 0.7 * distKm).toFixed(1));

      // Head/Tailwind (along line of fire):
      // Positive = tailwind (pushes further) -> aim higher or lower
      const headwindSpeed = wind.speed * Math.cos(relativeAngleRad);
      headwindCorrectionMeters = Number((headwindSpeed * 1.5 * distKm).toFixed(1));
    }

    return {
      ...solutionWithLimits,
      charge: selectedCharge,
      elevationMil: finalElevMil,
      elevationDeg: finalElevDeg,
      rawElevationMil: Math.round(rawElevMil),
      heightCorrectionMil,
      timeOfFlight: Number(tof.toFixed(1)),
      peakAltitude: Math.round(peakAlt),
      impactAngleDeg: Number(impactAngle.toFixed(1)),
      dispersionMeters: Number(dispersion.toFixed(1)),
      isInterpolated,
      windApplied,
      crosswindDeflectionMil,
      headwindCorrectionMeters,
      statusCode: 'VALID',
      statusMessage: 'Firing solution validated',
      statusMessageAr: 'تم حساب حل الرماية بنجاح',
      verificationStatus: 'verified',
    };
  }
}
