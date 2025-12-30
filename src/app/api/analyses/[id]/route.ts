import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/analyses/[id] - 성능해석 상세 조회
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const analysis = await prisma.performanceAnalysis.findUnique({
      where: { id: parseInt(id) },
      include: {
        propeller: {
          select: {
            id: true,
            name: true,
          },
        },
        files: true,
        cases: true,
        comparisons: true,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "성능해석을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Failed to fetch analysis:", error);
    return NextResponse.json(
      { error: "성능해석 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT /api/analyses/[id] - 성능해석 수정
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    // RPS Ratio 자동 계산
    const rpsRatio = body.afterRps / body.forwardRps;

    const analysis = await prisma.performanceAnalysis.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Failed to update analysis:", error);
    return NextResponse.json(
      { error: "성능해석 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/analyses/[id] - 성능해석 삭제
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.performanceAnalysis.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "성능해석이 삭제되었습니다." });
  } catch (error) {
    console.error("Failed to delete analysis:", error);
    return NextResponse.json(
      { error: "성능해석 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
