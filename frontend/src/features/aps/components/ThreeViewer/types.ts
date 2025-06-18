// メッシュデータの型定義
export interface ExtractedMeshData {
  dbId: number;
  fragId: number;
  geometryData: {
    vertices: Float32Array;
    normals?: Float32Array;
    indices?: Uint32Array;
    vertexCount: number;
  };
  matrixWorld: number[];
  material?: any;
  elementInfo?: {
    name?: string;
    category?: string;
    type?: string;
    properties?: { [key: string]: any };
    boundingBox?: {
      min: number[];
      max: number[];
      center: number[];
      size: number[];
    };
  };
}

// コンポーネントのProps型定義
export interface SelectableMeshProps {
  meshData: ExtractedMeshData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (meshData: ExtractedMeshData) => void;
  onHover: (meshData: ExtractedMeshData) => void;
  onUnhover: () => void;
}

export interface ElementInfoPanelProps {
  selectedElement: ExtractedMeshData | null;
  onClose: () => void;
  onPropertyChange: (property: string, value: any) => void;
}

export interface ExtractedMeshesProps {
  meshData: ExtractedMeshData[];
  selectedElement: ExtractedMeshData | null;
  hoveredElement: ExtractedMeshData | null;
  onSelect: (meshData: ExtractedMeshData) => void;
  onHover: (meshData: ExtractedMeshData) => void;
  onUnhover: () => void;
}

export interface CameraControllerProps {
  meshData: ExtractedMeshData[];
}