'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SelectableMesh } from './SelectableMesh';
import { ExtractedMeshesProps } from './types';

export function ExtractedMeshes({ 
  meshData, 
  selectedElement, 
  hoveredElement,
  onSelect, 
  onHover,
  onUnhover 
}: ExtractedMeshesProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current || !meshData || meshData.length === 0) return;

    console.log('=== ThreeViewer: Processing selectable mesh data ===');
    console.log('Mesh data count:', meshData.length);

    // 既存のメッシュをクリア
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
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
    }

    console.log(`Creating ${meshData.length} selectable meshes`);
  }, [meshData]);

  return (
    <group ref={groupRef}>
      {meshData.map((mesh, index) => (
        <SelectableMesh
          key={`${mesh.dbId}-${mesh.fragId}`}
          meshData={mesh}
          isSelected={selectedElement?.dbId === mesh.dbId && selectedElement?.fragId === mesh.fragId}
          isHovered={hoveredElement?.dbId === mesh.dbId && hoveredElement?.fragId === mesh.fragId}
          onSelect={onSelect}
          onHover={onHover}
          onUnhover={onUnhover}
        />
      ))}
    </group>
  );
}