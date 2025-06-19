'use client';

export function SceneLighting() {
  return (
    <>
      {/* 環境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 指向性ライト */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 補助ライト */}
      <directionalLight
        position={[-10, -10, -5]}
        intensity={0.3}
      />
    </>
  );
}