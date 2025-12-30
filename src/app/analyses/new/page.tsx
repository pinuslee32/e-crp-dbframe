import Link from "next/link";
import AnalysisForm from "@/components/analyses/AnalysisForm";

export default function NewAnalysisPage() {
  return (
    <div className="container">
      <ol className="breadcrumb">
        <li>
          <Link href="/">홈</Link>
        </li>
        <li>
          <Link href="/analyses">성능해석</Link>
        </li>
        <li className="active">새 성능해석 등록</li>
      </ol>

      <div className="page-header">
        <h1>새 성능해석 등록</h1>
        <p className="text-muted">해석 조건 및 결과 데이터를 입력하세요</p>
      </div>

      <AnalysisForm />
    </div>
  );
}
