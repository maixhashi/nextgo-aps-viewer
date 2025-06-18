'use client';

import { Grid } from '@react-three/drei';

export function SceneGrid() {
  return (
    <Grid 
      args={[1000, 1000]} 
      cellSize={10} 
      cellThickness={0.5} 
      cellColor="#6b7280" 
      sectionSize={100} 
      sectionThickness={1} 
      sectionColor="#374151"
      fadeDistance={500}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  );
}