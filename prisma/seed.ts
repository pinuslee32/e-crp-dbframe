import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 프로펠러 데이터 생성
  const propeller1 = await prisma.propeller.create({
    data: {
      name: "KP1711",
      bladeCount: 4,
      sectionType: "NACA 66 mod",
      hasSectionFile: true,
      rotationDirection: "RIGHT",
      powerRatio: "5:5",
      scaleRatio: 42.063,
      hasOffsetFile: true,
    },
  });
  console.log("Created propeller:", propeller1.name);

  const propeller2 = await prisma.propeller.create({
    data: {
      name: "KP1812",
      bladeCount: 5,
      sectionType: "NACA 66 mod",
      hasSectionFile: true,
      rotationDirection: "LEFT",
      powerRatio: "4:6",
      scaleRatio: 38.5,
      hasOffsetFile: true,
    },
  });
  console.log("Created propeller:", propeller2.name);

  const propeller3 = await prisma.propeller.create({
    data: {
      name: "CRP_After_2009",
      bladeCount: 4,
      sectionType: "NACA 66",
      hasSectionFile: false,
      rotationDirection: "RIGHT",
      powerRatio: "5:5",
      scaleRatio: 42.063,
      hasOffsetFile: true,
    },
  });
  console.log("Created propeller:", propeller3.name);

  // 성능해석 데이터 생성 - KP1711
  const jValues = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  for (const j of jValues) {
    await prisma.performanceAnalysis.create({
      data: {
        propellerId: propeller1.id,
        density: 998.05,
        viscosity: 0.00015,
        afterRps: 15,
        forwardRps: 20,
        rpsRatio: 0.75,
        reynoldsNumber: 0.000011,
        jCoefficient: j,
        velocity: j * 20 * 0.158,
        thrust: 120.12 * (1 - j * 0.8),
        torque: 6.83 * (1 - j * 0.5),
        kt: 0.4536 * (1 - j * 0.9),
        kq10: 0.662 * (1 - j * 0.7),
        efficiency: j * 0.8,
        method: "Lag K-e",
      },
    });
  }
  console.log(`Created ${jValues.length} analyses for ${propeller1.name}`);

  // 성능해석 데이터 생성 - KP1812
  for (const j of [0.3, 0.4, 0.5, 0.6]) {
    await prisma.performanceAnalysis.create({
      data: {
        propellerId: propeller2.id,
        density: 998.05,
        viscosity: 0.00015,
        afterRps: 18,
        forwardRps: 22,
        rpsRatio: 0.818,
        reynoldsNumber: 0.000012,
        jCoefficient: j,
        velocity: j * 22 * 0.165,
        thrust: 135.5 * (1 - j * 0.75),
        torque: 7.2 * (1 - j * 0.45),
        kt: 0.4825 * (1 - j * 0.85),
        kq10: 0.705 * (1 - j * 0.65),
        efficiency: j * 0.82,
        method: "K-w",
      },
    });
  }
  console.log(`Created 4 analyses for ${propeller2.name}`);

  // EFD vs CFD 비교 데이터 생성
  const analysis1 = await prisma.performanceAnalysis.findFirst({
    where: { propellerId: propeller1.id, jCoefficient: 0.5 },
  });

  if (analysis1) {
    await prisma.efdCfdComparison.createMany({
      data: [
        {
          analysisId: analysis1.id,
          jValue: 0.2,
          efdKt: 0.4536,
          efdKq10: 0.662,
          efdEta: 0.219,
          cfdKt: 0.437425,
          cfdKq10: 0.626592,
          cfdEta: 0.222213,
          ktDiffPercent: -3.57,
          kqDiffPercent: -5.35,
          etaDiffPercent: 1.93,
        },
        {
          analysisId: analysis1.id,
          jValue: 0.3,
          efdKt: 0.4004,
          efdKq10: 0.5943,
          efdEta: 0.322,
          cfdKt: 0.38805,
          cfdKq10: 0.567215,
          cfdEta: 0.326649,
          ktDiffPercent: -3.08,
          kqDiffPercent: -4.56,
          etaDiffPercent: 1.44,
        },
        {
          analysisId: analysis1.id,
          jValue: 0.4,
          efdKt: 0.3452,
          efdKq10: 0.5252,
          efdEta: 0.418,
          cfdKt: 0.336797,
          cfdKq10: 0.506119,
          cfdEta: 0.423639,
          ktDiffPercent: -2.43,
          kqDiffPercent: -3.63,
          etaDiffPercent: 1.35,
        },
      ],
    });
    console.log("Created EFD vs CFD comparison data");
  }

  // 해석 케이스 데이터 생성
  if (analysis1) {
    await prisma.analysisCase.create({
      data: {
        analysisId: analysis1.id,
        caseName: "R-K-E_J0.2~0.9",
        basePrism: 5,
        baseThickness: 1.0,
        surfacePrism: 8,
        surfaceThickness: 0.5,
        turbulentModel: "Lag-K-E",
        viscosity: 0.0010025,
        solverVersion: "STAR-CCM+ 16.06.010",
      },
    });
    console.log("Created analysis case");
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
