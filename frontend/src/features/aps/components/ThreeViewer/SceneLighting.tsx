'use client';

export function SceneLighting() {
  return (
    <>
      {/* ライティング */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-100, -100, -100]} intensity={0.5} />
      <pointLight position={[100, -100, 100]} intensity={0.3} />
    </>
  );
}