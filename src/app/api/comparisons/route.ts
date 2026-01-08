import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/comparisons - EFD vs CFD 비교 데이터 목록 조회
export async function GET() {
  try {
    const comparisons = await prisma.efdCfdComparison.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        analysis: {
          include: {
            propeller: {
              select: {
                id: true,
                name: true,
              },
            },
            cases: true,
          },
        },
      },
    });

    // 분석별로 그룹화
    const groupedByAnalysis = comparisons.reduce((acc, comparison) => {
      const analysisId = comparison.analysisId;
      if (!acc[analysisId]) {
        const analysisCase = comparison.analysis.cases[0];
        acc[analysisId] = {
          analysisId,
          propellerName: comparison.analysis.propeller.name,
          propellerId: comparison.analysis.propeller.id,
          jCoefficient: comparison.analysis.jCoefficient,
          method: comparison.analysis.method,
          // Case 정보
          case: analysisCase ? {
            caseName: analysisCase.caseName,
            basePrism: analysisCase.basePrism,
            baseThickness: analysisCase.baseThickness,
            surfacePrism: analysisCase.surfacePrism,
            surfaceThickness: analysisCase.surfaceThickness,
            turbulentModel: analysisCase.turbulentModel,
            viscosity: analysisCase.viscosity,
            solverVersion: analysisCase.solverVersion,
          } : null,
          comparisons: [],
        };
      }
      acc[analysisId].comparisons.push({
        id: comparison.id,
        jValue: comparison.jValue,
        // EFD
        efdKt: comparison.efdKt,
        efdKq10: comparison.efdKq10,
        efdEta: comparison.efdEta,
        // CFD
        vin: comparison.vin,
        cfdThrust: comparison.cfdThrust,
        cfdKt: comparison.cfdKt,
        cfdTorque: comparison.cfdTorque,
        cfdKq10: comparison.cfdKq10,
        cfdEta: comparison.cfdEta,
        // Diff
        ktDiffPercent: comparison.ktDiffPercent,
        kqDiffPercent: comparison.kqDiffPercent,
        etaDiffPercent: comparison.etaDiffPercent,
      });
      return acc;
    }, {} as Record<number, any>);

    return NextResponse.json(Object.values(groupedByAnalysis));
  } catch (error) {
    console.error("Failed to fetch comparisons:", error);
    return NextResponse.json(
      { error: "비교 데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
