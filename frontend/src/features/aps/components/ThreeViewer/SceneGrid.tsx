'use client';

import { Grid } from '@react-three/drei';

export function SceneGrid() {
  return (
    <Grid
      args={[100, 100]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#6f6f6f"
      sectionSize={10}
      sectionThickness={1}
      sectionColor="#9d4b4b"
      fadeDistance={100}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  );
}