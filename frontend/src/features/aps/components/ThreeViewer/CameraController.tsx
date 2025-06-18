'use client';

import { CameraControllerProps } from './types';
import { useCameraControl } from './hooks/useCameraControl';

export function CameraController({ meshData }: CameraControllerProps) {
  useCameraControl(meshData);
  return null;
}