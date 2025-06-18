import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ExtractedMeshData } from '../types';

export function useCameraControl(meshData: ExtractedMeshData[]) {
  const [hasAdjusted, setHasAdjusted] = useState(false);

  useFrame(({ camera, scene }) => {
    // メッシュが追加された後、一度だけカメラを調整
    if (meshData.length > 0 && !hasAdjusted) {
      const box = new THREE.Box3().setFromObject(scene);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        
        // カメラ距離を計算
        const distance = maxSize * 1.5;
        const cameraDistance = Math.max(distance, 5); // 最小距離を5に設定
        
        // カメラ位置を設定（斜め上から見下ろす角度）
        camera.position.set(
          center.x + cameraDistance * 0.8,
          center.y + cameraDistance * 0.8,
          center.z + cameraDistance * 0.8
        );
        
        // カメラをシーンの中心に向ける
        camera.lookAt(center);
        camera.updateProjectionMatrix();
        
        console.log('=== Camera adjusted for selectable meshes ===');
        console.log('Scene center:', center.toArray());
        console.log('Scene size:', size.toArray());
        console.log('Camera position:', camera.position.toArray());
        
        setHasAdjusted(true);
      }
    }
  });

  return null;
}