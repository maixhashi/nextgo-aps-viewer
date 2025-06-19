'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls as DreiTransformControls, OrbitControls } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import * as THREE from 'three';
import { transformState, getCurrentTransformMode, setTransforming } from './store/transformStore';
import { getCachedMesh } from './SelectableMesh';

export function TransformControls() {
  const snap = useSnapshot(transformState);
  const { scene } = useThree();
  const orbitControlsRef = useRef<any>();
  const transformControlsRef = useRef<any>();
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);

  // Get the selected mesh object - 複数の方法で検索
  const findSelectedObject = () => {
    if (!snap.selectedElement) return null;
    
    const { dbId, fragId } = snap.selectedElement;
    
    // 1. キャッシュから取得を試行
    let foundObject = getCachedMesh(dbId, fragId);
    if (foundObject && foundObject.parent) {
      console.log('Found object in cache:', foundObject.name);
      return foundObject;
    }
    
    // 2. シーン内を検索
    const objectName = `mesh-${dbId}-${fragId}`;
    foundObject = null;
    
    scene.traverse((child) => {
      if (child.name === objectName && child instanceof THREE.Mesh) {
        foundObject = child;
      }
    });
    
    if (foundObject) {
      console.log('Found object in scene:', foundObject.name);
      return foundObject;
    }
    
    console.warn(`Could not find mesh object: ${objectName}`);
    return null;
  };

  // Update selected object when selection changes
  useEffect(() => {
    const newSelectedObject = findSelectedObject();
    
    if (newSelectedObject !== selectedObject) {
      console.log('Selected object changed:', {
        old: selectedObject?.name,
        new: newSelectedObject?.name,
        hasParent: newSelectedObject?.parent ? true : false,
        inScene: newSelectedObject ? scene.getObjectById(newSelectedObject.id) !== undefined : false
      });
      
      setSelectedObject(newSelectedObject);
    }
  }, [snap.selectedElement, scene]);

  // Validate object is still in scene graph - より頻繁にチェック
  useEffect(() => {
    if (!selectedObject) return;

    const validateObject = () => {
      const isInScene = selectedObject.parent && scene.getObjectById(selectedObject.id) !== undefined;
      if (!isInScene) {
        console.warn('Selected object is no longer in scene graph, searching again...');
        const newObject = findSelectedObject();
        if (newObject) {
          console.log('Found replacement object');
          setSelectedObject(newObject);
        } else {
          console.warn('Could not find replacement object, clearing selection');
          setSelectedObject(null);
        }
      }
    };

    // 初回チェック
    validateObject();

    // 定期的にチェック
    const interval = setInterval(validateObject, 100);

    return () => clearInterval(interval);
  }, [selectedObject, scene]);

  // Handle transform controls events
  useEffect(() => {
    const transformControls = transformControlsRef.current;
    const orbitControls = orbitControlsRef.current;

    if (!transformControls || !orbitControls || !selectedObject) return;

    // Verify object is still valid before setting up events
    const isObjectValid = selectedObject.parent && scene.getObjectById(selectedObject.id);
    if (!isObjectValid) {
      console.warn('Object is not valid for transform controls');
      return;
    }

    console.log('Setting up transform controls for:', selectedObject.name);

    // Event handlers
    const handleDragStart = (event: any) => {
      console.log('Transform drag started');
      setTransforming(true);
      orbitControls.enabled = false;
    };

    const handleDragEnd = (event: any) => {
      console.log('Transform drag ended');
      setTransforming(false);
      orbitControls.enabled = true;
    };

    const handleObjectChange = () => {
      if (selectedObject && snap.selectedElement) {
        // Verify object is still valid
        if (!selectedObject.parent || !scene.getObjectById(selectedObject.id)) {
          console.warn('Object became invalid during transform');
          return;
        }

        const position = selectedObject.position;
        const rotation = selectedObject.rotation;
        const scale = selectedObject.scale;
        
        // Dispatch custom event for position change
        const transformEvent = new CustomEvent('elementTransformChanged', {
          detail: {
            dbId: snap.selectedElement.dbId,
            fragId: snap.selectedElement.fragId,
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
            scale: { x: scale.x, y: scale.y, z: scale.z },
            element: snap.selectedElement
          }
        });
        window.dispatchEvent(transformEvent);
      }
    };

    // Add event listeners
    transformControls.addEventListener('dragging-changed', handleDragStart);
    transformControls.addEventListener('objectChange', handleObjectChange);

    // Cleanup
    return () => {
      try {
        if (transformControls) {
          transformControls.removeEventListener('dragging-changed', handleDragStart);
          transformControls.removeEventListener('objectChange', handleObjectChange);
        }
      } catch (error) {
        console.warn('Error removing transform controls event listeners:', error);
      }
    };
  }, [selectedObject, snap.selectedElement, scene]);

  // TransformControlsが無効なオブジェクトを参照しないようにする
  const isValidObject = selectedObject && selectedObject.parent && scene.getObjectById(selectedObject.id);

  return (
    <>
      {/* Orbit Controls */}
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.75}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      
      {/* Transform Controls - only show when an element is selected and object is valid */}
      {isValidObject && (
        <DreiTransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode={getCurrentTransformMode()}
          showX={true}
          showY={true}
          showZ={true}
          size={1}
          space="world"
        />
      )}
    </>
  );
}