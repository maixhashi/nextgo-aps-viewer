import { ExtractedMeshData } from './types';

declare global {
  interface Window {
    extractedGeometries: ExtractedMeshData[];
  }

  interface WindowEventMap {
    'meshDataExtracted': CustomEvent<{
      meshData: ExtractedMeshData[];
    }>;
    'elementPropertyChanged': CustomEvent<{
      dbId: number;
      fragId: number;
      property: string;
      value: any;
      element: ExtractedMeshData;
    }>;
    'elementTransformChanged': CustomEvent<{
      dbId: number;
      fragId: number;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      scale: { x: number; y: number; z: number };
      element: ExtractedMeshData;
    }>;
  }
}

export {};
