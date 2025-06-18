'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SelectableMeshProps } from './types';

export function SelectableMesh({ 
  meshData, 
  isSelected, 
  isHovered,
  onSelect, 
  onHover,
  onUnhover 
}: SelectableMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const { geometryData, matrixWorld } = meshData;
    
    if (!geometryData || !geometryData.vertices || geometryData.vertices.length === 0) {
      console.warn(`No valid geometry data for mesh dbId: ${meshData.dbId}, fragId: ${meshData.fragId}`);
      return;
    }

    console.log(`Creating geometry for dbId: ${meshData.dbId}, fragId: ${meshData.fragId}`);
    console.log('Vertex count:', geometryData.vertexCount);
    console.log('Vertices length:', geometryData.vertices.length);
    console.log('Has indices:', !!geometryData.indices);
    console.log('Indices length:', geometryData.indices?.length || 0);

    // 既存のジオメトリを破棄
    if (geometry) {
      geometry.dispose();
    }

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
    console.log('Set position attribute with', transformedVertices.length / 3, 'vertices');

    // 法線の処理
    if (geometryData.normals && geometryData.normals.length > 0) {
      const transformedNormals = new Float32Array(geometryData.normals.length);
      for (let i = 0; i < geometryData.normals.length; i += 3) {
        transformedNormals[i] = geometryData.normals[i];
        transformedNormals[i + 1] = geometryData.normals[i + 2];
        transformedNormals[i + 2] = -geometryData.normals[i + 1];
      }
      newGeometry.setAttribute('normal', new THREE.BufferAttribute(transformedNormals, 3));
      console.log('Set transformed normal attribute');
    } else {
      newGeometry.computeVertexNormals();
      console.log('Computed vertex normals');
    }

    // インデックスの処理
    if (geometryData.indices && geometryData.indices.length > 0) {
      newGeometry.setIndex(new THREE.BufferAttribute(geometryData.indices, 1));
      console.log('Set index attribute with', geometryData.indices.length / 3, 'triangles');
    }

    // バウンディングボックスとバウンディングスフィアを計算
    newGeometry.computeBoundingBox();
    newGeometry.computeBoundingSphere();

    // 変換行列を適用
    if (matrixWorld && Array.isArray(matrixWorld) && matrixWorld.length === 16) {
      const matrix = new THREE.Matrix4();
      matrix.fromArray(matrixWorld);
      newGeometry.applyMatrix4(matrix);
      console.log('Applied transformation matrix');
    }

    // ジオメトリの最終チェック
    const bbox = newGeometry.boundingBox;
    if (bbox) {
      const size = bbox.getSize(new THREE.Vector3());
      console.log(`Geometry bounding box size: ${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}`);
      
      // 非常に小さいジオメトリの警告
      if (size.length() < 0.001) {
        console.warn(`Very small geometry detected for mesh ${meshData.fragId}, size:`, size.length());
      }
    }

    setGeometry(newGeometry);

    // クリーンアップ
    return () => {
      if (newGeometry) {
        newGeometry.dispose();
      }
    };
  }, [meshData]);

  // 色の計算
  const getColor = () => {
    if (isSelected) return '#ff6b6b'; // 選択時は赤
    if (isHovered) return '#4ecdc4'; // ホバー時は青緑
    const hue = (meshData.fragId * 0.1) % 1;
    return new THREE.Color().setHSL(hue, 0.7, 0.5);
  };

  const getWireframeColor = () => {
    if (isSelected) return '#ff9999';
    if (isHovered) return '#7fdddd';
    const hue = (meshData.fragId * 0.1) % 1;
    return new THREE.Color().setHSL(hue, 1.0, 0.8);
  };

  if (!geometry) {
    return null; // ジオメトリが準備できるまで何も描画しない
  }

  return (
    <group>
      {/* ソリッドメッシュ */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(meshData);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(meshData);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover();
        }}
      >
        <meshPhongMaterial
          color={getColor()}
          transparent={isHovered || isSelected}
          opacity={isSelected ? 0.8 : isHovered ? 0.9 : 1.0}
          side={THREE.DoubleSide}
          depthTest={true}
          depthWrite={true}
        />
      </mesh>

      {/* ワイヤーフレーム */}
      <mesh ref={wireframeRef} geometry={geometry}>
        <meshBasicMaterial
          color={getWireframeColor()}
          wireframe={true}
          transparent={true}
          opacity={isSelected ? 1.0 : isHovered ? 0.8 : 0.3}
          side={THREE.DoubleSide}
          depthTest={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}