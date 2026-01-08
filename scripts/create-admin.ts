/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer: string) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("\n=== E-CRP DB Frame 관리자 계정 생성 ===\n");

  const username = await question("아이디: ");
  const password = await question("비밀번호: ");
  const name = await question("이름: ");

  if (!username || !password || !name) {
    console.error("\n모든 필드를 입력해주세요.");
    process.exit(1);
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    console.error(`\n아이디 "${username}"는 이미 존재합니다.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
      name,
    },
  });

  console.log(`\n관리자 계정이 생성되었습니다:`);
  console.log(`  - ID: ${admin.id}`);
  console.log(`  - 아이디: ${admin.username}`);
  console.log(`  - 이름: ${admin.name}`);
  console.log();
}

main()
  .catch((e: Error) => {
    console.error("오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });
