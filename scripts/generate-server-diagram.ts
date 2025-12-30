const puppeteer = require('puppeteer');
const path = require('path');

const serverDiagram = `
graph TB
    subgraph Client["Client Layer"]
        Browser["웹 브라우저<br/>Chrome / Edge / Firefox"]
    end

    subgraph Server["Application Server"]
        subgraph NextJS["Next.js Server (Node.js)"]
            SSR["Server Side Rendering"]
            APIServer["API Routes Handler"]
            Static["Static File Server"]
        end
    end

    subgraph ORM["ORM Layer"]
        Prisma["Prisma Client<br/>Query Builder"]
    end

    subgraph Database["Database Server"]
        PostgreSQL[("PostgreSQL<br/>v14+")]
    end

    subgraph Storage["File Storage"]
        FileSystem["Local File System<br/>/uploads"]
    end

    Browser <-->|HTTP/HTTPS| NextJS
    SSR --> Browser
    APIServer <--> Prisma
    Static --> Browser
    Prisma <-->|TCP| PostgreSQL
    APIServer <--> FileSystem

    classDef client fill:#3498db,stroke:#2980b9,color:#fff
    classDef server fill:#27ae60,stroke:#1e8449,color:#fff
    classDef orm fill:#f39c12,stroke:#d68910,color:#fff
    classDef db fill:#e74c3c,stroke:#c0392b,color:#fff
    classDef storage fill:#1abc9c,stroke:#16a085,color:#fff

    class Browser client
    class SSR,APIServer,Static server
    class Prisma orm
    class PostgreSQL db
    class FileSystem storage
`;

async function generateDiagram() {
  const outputPath = path.join(__dirname, '../Document/서버구성도.png');

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
      transform: scale(2);
      transform-origin: top left;
    }
  </style>
</head>
<body>
  <div class="mermaid">
${serverDiagram}
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

  console.log('서버 구성도 생성 중...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1600, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

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

  console.log(`서버 구성도 생성 완료: ${outputPath}`);
}

generateDiagram().catch(console.error);
