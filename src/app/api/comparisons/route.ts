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
          },
        },
      },
    });

    // 분석별로 그룹화
    const groupedByAnalysis = comparisons.reduce((acc, comparison) => {
      const analysisId = comparison.analysisId;
      if (!acc[analysisId]) {
        acc[analysisId] = {
          analysisId,
          propellerName: comparison.analysis.propeller.name,
          propellerId: comparison.analysis.propeller.id,
          jCoefficient: comparison.analysis.jCoefficient,
          method: comparison.analysis.method,
          comparisons: [],
        };
      }
      acc[analysisId].comparisons.push({
        id: comparison.id,
        jValue: comparison.jValue,
        efdKt: comparison.efdKt,
        efdKq10: comparison.efdKq10,
        efdEta: comparison.efdEta,
        cfdKt: comparison.cfdKt,
        cfdKq10: comparison.cfdKq10,
        cfdEta: comparison.cfdEta,
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
