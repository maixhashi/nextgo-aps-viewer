'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';
import { useCursor } from '@react-three/drei';
import { SelectableMeshProps } from './types';
import { transformState, setSelectedElement, setHoveredElement, cycleTransformMode } from './store/transformStore';

// グローバルなメッシュキャッシュ
const meshCache = new Map<string, THREE.Mesh>();

export function SelectableMesh({ 
  meshData, 
  isSelected, 
  isHovered,
  onSelect, 
  onHover,
  onUnhover 
}: SelectableMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);
  
  const snap = useSnapshot(transformState);
  
  // Use cursor hook for better UX
  useCursor(localHovered);

  // メッシュのユニークキー
  const meshKey = `${meshData.dbId}-${meshData.fragId}`;
  const meshName = `mesh-${meshKey}`;

  // ジオメトリとマテリアルをメモ化
  const { geometry, material } = useMemo(() => {
    const { geometryData, matrixWorld } = meshData;
    
    if (!geometryData || !geometryData.vertices || geometryData.vertices.length === 0) {
      console.warn(`No valid geometry data for mesh dbId: ${meshData.dbId}, fragId: ${meshData.fragId}`);
      return { geometry: null, material: null };
    }

    console.log('Creating geometry and material for', meshKey);

    // 新しいジオメトリを作成
    const newGeometry = new THREE.BufferGeometry();
    
    // 座標系変換
    const transformedVertices = new Float32Array(geometryData.vertices.length);
    for (let i = 0; i < geometryData.vertices.length; i += 3) {
      transformedVertices[i] = geometryData.vertices[i];
      transformedVertices[i + 1] = geometryData.vertices[i + 2];
      transformedVertices[i + 2] = -geometryData.vertices[i + 1];
    }
    
    newGeometry.setAttribute('position', new THREE.BufferAttribute(transformedVertices, 3));

    // 法線の処理
    if (geometryData.normals && geometryData.normals.length > 0) {
      const transformedNormals = new Float32Array(geometryData.normals.length);
      for (let i = 0; i < geometryData.normals.length; i += 3) {
        transformedNormals[i] = geometryData.normals[i];
        transformedNormals[i + 1] = geometryData.normals[i + 2];
        transformedNormals[i + 2] = -geometryData.normals[i + 1];
      }
      newGeometry.setAttribute('normal', new THREE.BufferAttribute(transformedNormals, 3));
    } else {
      newGeometry.computeVertexNormals();
    }

    // インデックスの処理
    if (geometryData.indices && geometryData.indices.length > 0) {
      newGeometry.setIndex(new THREE.BufferAttribute(geometryData.indices, 1));
    }

    // バウンディングボックスとバウンディングスフィアを計算
    newGeometry.computeBoundingBox();
    newGeometry.computeBoundingSphere();

    // 変換行列を適用
    if (matrixWorld && Array.isArray(matrixWorld) && matrixWorld.length === 16) {
      const matrix = new THREE.Matrix4();
      matrix.fromArray(matrixWorld);
      newGeometry.applyMatrix4(matrix);
    }

    // 色の計算
    const getColor = () => {
      if (isSelected) return '#ff6080';
      if (isHovered || localHovered) return '#4ecdc4';
      return 'white';
    };

    // マテリアルを作成
    const newMaterial = new THREE.MeshPhongMaterial({
      color: getColor(),
      transparent: isHovered || isSelected || localHovered,
      opacity: isSelected ? 0.9 : isHovered || localHovered ? 0.8 : 1.0,
      side: THREE.DoubleSide,
    });

    return { geometry: newGeometry, material: newMaterial };
  }, [meshData.dbId, meshData.fragId]); // 依存関係を最小限に

  // マテリアルの色を更新
  useEffect(() => {
    if (material) {
      const getColor = () => {
        if (isSelected) return '#ff6080';
        if (isHovered || localHovered) return '#4ecdc4';
        return 'white';
      };

      material.color.set(getColor());
      material.transparent = isHovered || isSelected || localHovered;
      material.opacity = isSelected ? 0.9 : isHovered || localHovered ? 0.8 : 1.0;
      material.needsUpdate = true;
    }
  }, [isSelected, isHovered, localHovered, material]);

  // メッシュをキャッシュに保存し、名前を設定
  useEffect(() => {
    if (meshRef.current && geometry && material) {
      const mesh = meshRef.current;
      mesh.name = meshName;
      
      // キャッシュに保存
      meshCache.set(meshKey, mesh);
      
      console.log('Mesh cached and named:', meshName, mesh);
      
      // シーングラフの確認
      if (mesh.parent) {
        console.log('Mesh is in scene graph:', meshName);
      }
    }
  }, [meshKey, meshName, geometry, material]);

  // クリーンアップ - 選択されている場合は保持
  useEffect(() => {
    return () => {
      // 選択されている場合はキャッシュを保持
      if (snap.selectedElement?.dbId === meshData.dbId && snap.selectedElement?.fragId === meshData.fragId) {
        console.log('Keeping cached mesh for selected element:', meshKey);
        return;
      }
      
      // 選択されていない場合のみクリーンアップ
      const cachedMesh = meshCache.get(meshKey);
      if (cachedMesh && geometry && material) {
        console.log('Cleaning up mesh:', meshKey);
        meshCache.delete(meshKey);
        geometry.dispose();
        material.dispose();
      }
    };
  }, [meshKey, snap.selectedElement, geometry, material]);

  // イベントハンドラー
  const handleClick = (e: any) => {
    e.stopPropagation();
    console.log('Mesh clicked:', meshData.dbId, meshData.fragId);
    onSelect(meshData);
    setSelectedElement(meshData);
  };

  const handleContextMenu = (e: any) => {
    if (isSelected) {
      e.stopPropagation();
      e.preventDefault();
      cycleTransformMode();
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setLocalHovered(true);
    onHover(meshData);
    setHoveredElement(meshData);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setLocalHovered(false);
    onUnhover();
    setHoveredElement(null);
  };

  if (!geometry || !material) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      dispose={null} // 自動破棄を無効化
    />
  );
}

// キャッシュからメッシュを取得するヘルパー関数
export const getCachedMesh = (dbId: number, fragId: number): THREE.Mesh | null => {
  const meshKey = `${dbId}-${fragId}`;
  return meshCache.get(meshKey) || null;
};