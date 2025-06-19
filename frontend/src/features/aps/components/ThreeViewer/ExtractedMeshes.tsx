'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';
import { SelectableMesh } from './SelectableMesh';
import { ExtractedMeshesProps } from './types';
import { transformState } from './store/transformStore';

export function ExtractedMeshes({ 
  meshData, 
  selectedElement, 
  hoveredElement,
  onSelect, 
  onHover,
  onUnhover 
}: ExtractedMeshesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const snap = useSnapshot(transformState);

  useEffect(() => {
    if (!groupRef.current || !meshData || meshData.length === 0) return;

    console.log('=== ExtractedMeshes: Processing mesh data ===');
    console.log('Mesh data count:', meshData.length);
    console.log('Selected element:', selectedElement?.dbId);
    console.log('Transform selected:', snap.selectedElement?.dbId);

    // 選択されたメッシュのIDを取得（両方の状態をチェック）
    const selectedMeshIds = new Set<string>();
    
    if (selectedElement) {
      selectedMeshIds.add(`${selectedElement.dbId}-${selectedElement.fragId}`);
    }
    
    if (snap.selectedElement) {
      selectedMeshIds.add(`${snap.selectedElement.dbId}-${snap.selectedElement.fragId}`);
    }

    // 既存の子要素をチェック - 選択されたメッシュは絶対に削除しない
    const childrenToRemove: THREE.Object3D[] = [];
    groupRef.current.children.forEach(child => {
      const childMeshId = child.name ? child.name.replace('mesh-', '') : '';
      
      if (selectedMeshIds.has(childMeshId)) {
        console.log('PRESERVING selected mesh in scene:', child.name);
        // 選択されたメッシュは絶対に保持
      } else {
        // 現在のメッシュデータに存在しない場合のみ削除対象に
        const existsInCurrentData = meshData.some(mesh => 
          `${mesh.dbId}-${mesh.fragId}` === childMeshId
        );
        
        if (!existsInCurrentData) {
          childrenToRemove.push(child);
        }
      }
    });

    // 選択されていない、かつ現在のデータに存在しないメッシュのみ削除
    childrenToRemove.forEach(child => {
      console.log('Removing unused mesh:', child.name);
      groupRef.current?.remove(child);
      
      if (child instanceof THREE.Group) {
        child.children.forEach(mesh => {
          if (mesh instanceof THREE.Mesh) {
            if (mesh.geometry) mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => mat.dispose());
            } else if (mesh.material) {
              mesh.material.dispose();
            }
          }
        });
      }
    });

    console.log(`ExtractedMeshes: Cleaned up ${childrenToRemove.length} meshes, preserved selected meshes`);
  }, [meshData, selectedElement, snap.selectedElement]);

  return (
    <group ref={groupRef}>
      {meshData.map((mesh, index) => {
        const isLocalSelected = selectedElement?.dbId === mesh.dbId && selectedElement?.fragId === mesh.fragId;
        const isTransformSelected = snap.selectedElement?.dbId === mesh.dbId && snap.selectedElement?.fragId === mesh.fragId;
        const isSelected = isLocalSelected || isTransformSelected;
        const isHovered = hoveredElement?.dbId === mesh.dbId && hoveredElement?.fragId === mesh.fragId;

        return (
          <SelectableMesh
            key={`${mesh.dbId}-${mesh.fragId}`}
            meshData={mesh}
            isSelected={isSelected}
            isHovered={isHovered}
            onSelect={onSelect}
            onHover={onHover}
            onUnhover={onUnhover}
          />
        );
      })}
    </group>
  );
}