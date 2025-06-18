'use client';

import { OrbitControls } from '@react-three/drei';

export function SceneControls() {
  return (
    <OrbitControls 
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      dampingFactor={0.05}
      screenSpacePanning={false}
      maxDistance={5000}
      minDistance={1}
    />
  );
}