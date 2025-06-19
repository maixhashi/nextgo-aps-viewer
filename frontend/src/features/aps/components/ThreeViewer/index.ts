export { ThreeViewer } from './index';
export type { 
  ExtractedMeshData, 
  SelectableMeshProps, 
  ElementInfoPanelProps,
  ExtractedMeshesProps,
  CameraControllerProps,
  TransformInfo,
  TransformChangeEvent
} from './types';

// Transform store exports
export { 
  transformState, 
  transformModes, 
  setSelectedElement, 
  setHoveredElement, 
  cycleTransformMode, 
  setTransforming, 
  getCurrentTransformMode 
} from './store/transformStore';
export type { TransformMode, TransformState } from './store/transformStore';