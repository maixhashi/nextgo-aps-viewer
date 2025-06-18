import { ExtractedMeshData } from './types';

declare global {
  interface Window {
    extractedGeometries: ExtractedMeshData[];
  }
}

export {};