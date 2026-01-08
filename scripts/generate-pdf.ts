const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

async function generatePDF(inputFile: string, outputFile: string) {
  const docPath = path.join(__dirname, '../Document', inputFile);
  const outputPath = path.join(__dirname, '../Document', outputFile);
  const docDir = path.join(__dirname, '../Document');

  console.log(`[${inputFile}] 마크다운 파일 읽는 중...`);
  let markdown = fs.readFileSync(docPath, 'utf-8');

  // 상대 경로 이미지를 base64로 변환
  const imgRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;
  let match;
  while ((match = imgRegex.exec(markdown)) !== null) {
    const altText = match[1];
    const imgPath = path.join(docDir, match[2]);
    if (fs.existsSync(imgPath)) {
      const imgBuffer = fs.readFileSync(imgPath);
      const base64 = imgBuffer.toString('base64');
      const ext = path.extname(imgPath).slice(1);
      const dataUri = `data:image/${ext};base64,${base64}`;
      markdown = markdown.replace(match[0], `![${altText}](${dataUri})`);
    }
  }

  console.log(`[${inputFile}] HTML로 변환 중...`);
  let htmlContent = marked(markdown);

  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${inputFile.replace('.md', '')}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #333;
      padding: 0;
      margin: 0;
    }

    h1 {
      font-size: 22pt;
      color: #1a5276;
      border-bottom: 3px solid #2980b9;
      padding-bottom: 8px;
      margin-top: 20px;
      margin-bottom: 15px;
    }

    h2 {
      font-size: 14pt;
      color: #2471a3;
      border-bottom: 2px solid #85c1e9;
      padding-bottom: 5px;
      margin-top: 20px;
      margin-bottom: 12px;
      background-color: #eaf2f8;
      padding: 8px;
      border-radius: 4px 4px 0 0;
    }

    h3 {
      font-size: 11pt;
      color: #1f618d;
      margin-top: 15px;
      margin-bottom: 8px;
      border-left: 4px solid #3498db;
      padding-left: 10px;
    }

    h4 {
      font-size: 10pt;
      color: #2c3e50;
      margin-top: 12px;
      margin-bottom: 6px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #aeb6bf;
      padding: 6px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: linear-gradient(180deg, #3498db 0%, #2980b9 100%);
      color: white;
      font-weight: bold;
      text-align: center;
    }

    tr:nth-child(even) {
      background-color: #f8f9f9;
    }

    tr:hover {
      background-color: #ebf5fb;
    }

    pre {
      background-color: #2c3e50;
      color: #ecf0f1;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Noto Sans Mono', 'DejaVu Sans Mono', 'Liberation Mono', 'Courier New', monospace;
      font-size: 9pt;
      line-height: 1.3;
      margin: 12px 0;
      page-break-inside: avoid;
      white-space: pre;
    }

    code {
      font-family: 'Noto Sans Mono', 'DejaVu Sans Mono', 'Liberation Mono', 'Courier New', monospace;
      background-color: #ecf0f1;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 9pt;
    }

    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    hr {
      border: none;
      border-top: 2px solid #d5dbdb;
      margin: 25px 0;
    }

    ul, ol {
      margin: 8px 0;
      padding-left: 25px;
    }

    li {
      margin: 4px 0;
    }

    strong {
      color: #1a5276;
    }

    em {
      color: #5d6d7e;
      font-style: italic;
    }

    p {
      margin: 8px 0;
    }

    blockquote {
      border-left: 4px solid #3498db;
      margin: 12px 0;
      padding: 8px 15px;
      background-color: #ebf5fb;
      color: #2c3e50;
    }

    /* 이미지 스타일 */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* 페이지 나눔 제어 */
    h1, h2, h3, h4 {
      page-break-after: avoid;
    }

    table, pre, blockquote, img {
      page-break-inside: avoid;
    }

    /* 첫 페이지 타이틀 스타일 */
    h1:first-of-type {
      text-align: center;
      font-size: 26pt;
      margin-top: 40px;
      margin-bottom: 30px;
      border-bottom: none;
      color: #1a5276;
    }

    /* 문서 정보 스타일 */
    body > p:last-of-type {
      text-align: right;
      color: #7f8c8d;
      font-size: 9pt;
      margin-top: 30px;
      border-top: 1px solid #d5dbdb;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `;

  console.log(`[${inputFile}] PDF 생성 중...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width: 100%; font-size: 8pt; text-align: center; color: #7f8c8d;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
    margin: {
      top: '15mm',
      right: '12mm',
      bottom: '20mm',
      left: '12mm'
    }
  });

  await browser.close();

  console.log(`[${inputFile}] PDF 생성 완료: ${outputPath}`);
}

async function main() {
  const files = [
    { input: '기능명세서.md', output: '기능명세서.pdf' },
    { input: 'DB스키마설계.md', output: 'DB스키마설계.pdf' },
    { input: 'E-CRP-DB-Frame-설계문서.md', output: 'E-CRP-DB-Frame-설계문서.pdf' }
  ];

  for (const file of files) {
    await generatePDF(file.input, file.output);
  }
}

main().catch(console.error);
