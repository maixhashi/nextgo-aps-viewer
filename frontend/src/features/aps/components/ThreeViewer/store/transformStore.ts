import { proxy } from 'valtio';
import { ExtractedMeshData } from '../types';

export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface TransformState {
  selectedElement: ExtractedMeshData | null;
  hoveredElement: ExtractedMeshData | null;
  mode: number; // 参考例と同じく数値インデックス
  isTransforming: boolean;
}

// 参考例と同じモード配列
export const transformModes: TransformMode[] = ['translate', 'rotate', 'scale'];

// Valtio proxy state - 参考例のパターン
export const transformState = proxy<TransformState>({
  selectedElement: null,
  hoveredElement: null,
  mode: 0, // 0=translate, 1=rotate, 2=scale
  isTransforming: false
});

// Actions
export const setSelectedElement = (element: ExtractedMeshData | null) => {
  console.log('Transform store: Setting selected element:', element?.dbId);
  transformState.selectedElement = element;
};

export const setHoveredElement = (element: ExtractedMeshData | null) => {
  transformState.hoveredElement = element;
};

export const cycleTransformMode = () => {
  const oldMode = transformState.mode;
  transformState.mode = (transformState.mode + 1) % transformModes.length;
  console.log('Transform mode cycled:', transformModes[oldMode], '->', transformModes[transformState.mode]);
};

export const setTransforming = (isTransforming: boolean) => {
  console.log('Transform state changed:', isTransforming);
  transformState.isTransforming = isTransforming;
};

export const getCurrentTransformMode = (): TransformMode => {
  return transformModes[transformState.mode];
};

// Reset function
export const resetTransformState = () => {
  transformState.selectedElement = null;
  transformState.hoveredElement = null;
  transformState.mode = 0;
  transformState.isTransforming = false;
};