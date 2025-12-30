import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/propellers - 프로펠러 목록 조회
export async function GET() {
  try {
    const propellers = await prisma.propeller.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            files: true,
            analyses: true,
          },
        },
      },
    });

    return NextResponse.json(propellers);
  } catch (error) {
    console.error("Failed to fetch propellers:", error);
    return NextResponse.json(
      { error: "프로펠러 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/propellers - 프로펠러 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const propeller = await prisma.propeller.create({
      data: {
        name: body.name,
        bladeCount: body.bladeCount,
        sectionType: body.sectionType,
        hasSectionFile: body.hasSectionFile || false,
        rotationDirection: body.rotationDirection,
        powerRatio: body.powerRatio,
        scaleRatio: body.scaleRatio,
        hasOffsetFile: body.hasOffsetFile || false,
      },
    });

    return NextResponse.json(propeller, { status: 201 });
  } catch (error) {
    console.error("Failed to create propeller:", error);
    return NextResponse.json(
      { error: "프로펠러 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
