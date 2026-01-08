const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const puppeteer = require("puppeteer");

function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase().slice(1);
    const mimeType = ext === "jpg" ? "jpeg" : ext;
    return `data:image/${mimeType};base64,${imageBuffer.toString("base64")}`;
  } catch (err) {
    console.error(`이미지 로드 실패: ${imagePath}`, err.message);
    return "";
  }
}

async function convertMdToPdf(mdPath, pdfPath) {
  // 마크다운 파일 읽기
  const mdContent = fs.readFileSync(mdPath, "utf-8");
  const mdDir = path.dirname(path.resolve(mdPath));

  // 이미지 경로를 base64 데이터 URI로 변환
  const processedMd = mdContent.replace(
    /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
    (match, alt, imgPath) => {
      const absolutePath = path.join(mdDir, imgPath);
      const base64Data = imageToBase64(absolutePath);
      if (base64Data) {
        return `![${alt}](${base64Data})`;
      }
      return match;
    }
  );

  // 마크다운을 HTML로 변환
  const htmlContent = marked(processedMd);

  // HTML 템플릿
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      font-size: 11px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      font-size: 24px;
    }
    h2 {
      color: #34495e;
      border-bottom: 2px solid #bdc3c7;
      padding-bottom: 8px;
      margin-top: 30px;
      font-size: 18px;
    }
    h3 {
      color: #7f8c8d;
      font-size: 14px;
    }
    h4 {
      font-size: 12px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      font-size: 10px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #3498db;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', monospace;
      font-size: 10px;
    }
    pre {
      background-color: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 10px;
    }
    pre code {
      background-color: transparent;
      color: inherit;
    }
    blockquote {
      border-left: 4px solid #3498db;
      margin: 15px 0;
      padding: 10px 20px;
      background-color: #ecf0f1;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
    }
    hr {
      border: none;
      border-top: 1px solid #bdc3c7;
      margin: 30px 0;
    }
    ul, ol {
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `;

  // Puppeteer로 PDF 생성
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    margin: {
      top: "20mm",
      right: "15mm",
      bottom: "20mm",
      left: "15mm",
    },
    printBackground: true,
  });

  await browser.close();
  console.log(`PDF 생성 완료: ${pdfPath}`);
}

// 실행
const mdFile = process.argv[2] || "Document/E-CRP-DB-Frame-설계문서.md";
const pdfFile = process.argv[3] || mdFile.replace(".md", ".pdf");

convertMdToPdf(mdFile, pdfFile).catch(console.error);
