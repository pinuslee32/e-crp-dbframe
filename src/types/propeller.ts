export type RotationDirection = "RIGHT" | "LEFT";

export interface Propeller {
  id: number;
  name: string;
  bladeCount: number;
  sectionType: string;
  hasSectionFile: boolean;
  rotationDirection: RotationDirection;
  powerRatio: string;
  scaleRatio: number;
  hasOffsetFile: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    files: number;
    analyses: number;
  };
}

export interface PropellerFormData {
  name: string;
  bladeCount: number;
  sectionType: string;
  hasSectionFile: boolean;
  rotationDirection: RotationDirection;
  powerRatio: string;
  scaleRatio: number;
  hasOffsetFile: boolean;
}
