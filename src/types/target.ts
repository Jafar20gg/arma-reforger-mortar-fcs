import { WorldCoordinate } from './map';

export interface TargetInstance {
  id: string;
  name: string;
  position: WorldCoordinate;
  color: string;
  icon: 'crosshair' | 'target' | 'diamond' | 'square' | 'triangle';
  locked: boolean;
  visible: boolean;
  showOverlay: boolean;
  expandedOverlay: boolean;
  notes?: string;
  group?: string;
}
