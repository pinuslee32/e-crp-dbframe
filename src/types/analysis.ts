export interface PerformanceAnalysis {
  id: number;
  propellerId: number;
  propeller?: {
    id: number;
    name: string;
  };

  // Input
  density: number;
  viscosity: number;
  afterRps: number;
  forwardRps: number;
  rpsRatio: number | null;
  reynoldsNumber: number | null;
  jCoefficient: number;
  velocity: number | null;

  // Output
  thrust: number | null;
  torque: number | null;
  kt: number | null;
  kq10: number | null;
  efficiency: number | null;
  method: string | null;

  createdAt: string;
  files?: AnalysisFile[];
  cases?: AnalysisCase[];
}

export interface AnalysisFile {
  id: number;
  analysisId: number;
  fileType: "PRESSURE" | "WAKE" | "GRAPH_TURBULENT" | "GRAPH_FORCE";
  filePath: string;
  originalName: string;
  fileSize: number | null;
  createdAt: string;
}

export interface AnalysisCase {
  id: number;
  analysisId: number;
  caseName: string;
  basePrism: number | null;
  baseThickness: number | null;
  surfacePrism: number | null;
  surfaceThickness: number | null;
  turbulentModel: string | null;
  viscosity: number | null;
  solverVersion: string | null;
  createdAt: string;
}

export interface AnalysisFormData {
  propellerId: number;
  density: number;
  viscosity: number;
  afterRps: number;
  forwardRps: number;
  reynoldsNumber: number | null;
  jCoefficient: number;
  velocity: number | null;
  thrust: number | null;
  torque: number | null;
  kt: number | null;
  kq10: number | null;
  efficiency: number | null;
  method: string;
}
