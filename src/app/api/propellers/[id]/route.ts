import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/propellers/[id] - 프로펠러 상세 조회
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const propeller = await prisma.propeller.findUnique({
      where: { id: parseInt(id) },
      include: {
        files: true,
        analyses: {
          include: {
            files: true,
            cases: true,
          },
        },
      },
    });

    if (!propeller) {
      return NextResponse.json(
        { error: "프로펠러를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(propeller);
  } catch (error) {
    console.error("Failed to fetch propeller:", error);
    return NextResponse.json(
      { error: "프로펠러 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT /api/propellers/[id] - 프로펠러 수정
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const propeller = await prisma.propeller.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        bladeCount: body.bladeCount,
        sectionType: body.sectionType,
        hasSectionFile: body.hasSectionFile,
        rotationDirection: body.rotationDirection,
        powerRatio: body.powerRatio,
        scaleRatio: body.scaleRatio,
        hasOffsetFile: body.hasOffsetFile,
      },
    });

    return NextResponse.json(propeller);
  } catch (error) {
    console.error("Failed to update propeller:", error);
    return NextResponse.json(
      { error: "프로펠러 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/propellers/[id] - 프로펠러 삭제
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.propeller.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "프로펠러가 삭제되었습니다." });
  } catch (error) {
    console.error("Failed to delete propeller:", error);
    return NextResponse.json(
      { error: "프로펠러 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
