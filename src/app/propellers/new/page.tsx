import Link from "next/link";
import PropellerForm from "@/components/propellers/PropellerForm";

export default function NewPropellerPage() {
  return (
    <div className="container">
      <ol className="breadcrumb">
        <li>
          <Link href="/">홈</Link>
        </li>
        <li>
          <Link href="/propellers">프로펠러 관리</Link>
        </li>
        <li className="active">새 프로펠러 등록</li>
      </ol>

      <div className="page-header">
        <h1>새 프로펠러 등록</h1>
        <p className="text-muted">프로펠러 기본 정보를 입력하세요</p>
      </div>

      <div className="panel panel-default">
        <div className="panel-body">
          <PropellerForm />
        </div>
      </div>
    </div>
  );
}
