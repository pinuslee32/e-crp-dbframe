const puppeteer = require('puppeteer');
const path = require('path');

const serviceDiagram = `
graph TB
    subgraph Client["Client Layer"]
        Browser["웹 브라우저<br/>Chrome / Edge / Firefox"]
    end

    subgraph NextJS["Next.js Application"]
        Pages["Pages<br/>(메인, 프로펠러, 성능해석, 데이터분석)"]
        API["API Routes<br/>(REST API)"]
        Components["Components<br/>(공통 UI 컴포넌트)"]
    end

    subgraph DataLayer["Data Layer"]
        Prisma["Prisma ORM"]
        PostgreSQL[("PostgreSQL")]
    end

    Browser --> Pages
    Pages --> Components
    Pages --> API
    API --> Prisma
    Prisma --> PostgreSQL

    classDef client fill:#3498db,stroke:#2980b9,color:#fff
    classDef app fill:#27ae60,stroke:#1e8449,color:#fff
    classDef data fill:#f39c12,stroke:#d68910,color:#fff
    classDef db fill:#e74c3c,stroke:#c0392b,color:#fff

    class Browser client
    class Pages,API,Components app
    class Prisma data
    class PostgreSQL db
`;

async function generateDiagram() {
  const outputPath = path.join(__dirname, '../Document/서비스구조도.png');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 40px;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid {
      font-family: 'Malgun Gothic', sans-serif;
    }
  </style>
</head>
<body>
  <div class="mermaid">
${serviceDiagram}
  </div>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#3498db',
        primaryTextColor: '#fff',
        primaryBorderColor: '#2980b9',
        lineColor: '#5d6d7e',
        secondaryColor: '#ecf0f1',
        tertiaryColor: '#fafafa',
        fontSize: '18px'
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 30,
        nodeSpacing: 80,
        rankSpacing: 80
      }
    });
  </script>
</body>
</html>
  `;

  console.log('서비스 구조도 생성 중...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1600, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Mermaid 렌더링 대기
  await page.waitForSelector('.mermaid svg', { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 2000));

  // mermaid div 요소만 캡처
  const mermaidElement = await page.$('.mermaid');
  if (mermaidElement) {
    await mermaidElement.screenshot({
      path: outputPath,
      omitBackground: false
    });
  }

  await browser.close();

  console.log(`서비스 구조도 생성 완료: ${outputPath}`);
}

generateDiagram().catch(console.error);
