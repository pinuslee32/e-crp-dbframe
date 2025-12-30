import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/analyses - 성능해석 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propellerId = searchParams.get("propellerId");

    const where = propellerId ? { propellerId: parseInt(propellerId) } : {};

    const analyses = await prisma.performanceAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        propeller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            files: true,
            cases: true,
          },
        },
      },
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Failed to fetch analyses:", error);
    return NextResponse.json(
      { error: "성능해석 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/analyses - 성능해석 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // RPS Ratio 자동 계산
    const rpsRatio = body.afterRps / body.forwardRps;

    const analysis = await prisma.performanceAnalysis.create({
      data: {
        propellerId: body.propellerId,
        density: body.density,
        viscosity: body.viscosity,
        afterRps: body.afterRps,
        forwardRps: body.forwardRps,
        rpsRatio: rpsRatio,
        reynoldsNumber: body.reynoldsNumber || null,
        jCoefficient: body.jCoefficient,
        velocity: body.velocity || null,
        thrust: body.thrust || null,
        torque: body.torque || null,
        kt: body.kt || null,
        kq10: body.kq10 || null,
        efficiency: body.efficiency || null,
        method: body.method || null,
      },
      include: {
        propeller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error("Failed to create analysis:", error);
    return NextResponse.json(
      { error: "성능해석 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
