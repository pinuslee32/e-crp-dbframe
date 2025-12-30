import Link from "next/link";
import prisma from "@/lib/prisma";

async function getStats() {
  const [propellerCount, analysisCount, fileCount] = await Promise.all([
    prisma.propeller.count(),
    prisma.performanceAnalysis.count(),
    Promise.all([
      prisma.propellerFile.count(),
      prisma.analysisFile.count(),
    ]).then(([a, b]) => a + b),
  ]);

  return { propellerCount, analysisCount, fileCount };
}

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="container">
      {/* 히어로 섹션 */}
      <div className="jumbotron text-center">
        <h1>E-CRP DB Frame</h1>
        <p>CRP(Contra-Rotating Propeller) 계열화 데이터 관리 시스템</p>
      </div>

      {/* 메뉴 카드 */}
      <div className="row">
        <div className="col-md-4">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">
                <span className="glyphicon glyphicon-cog"></span> 프로펠러 관리
              </h3>
            </div>
            <div className="panel-body">
              <p>프로펠러 설계 및 모델링 데이터 관리</p>
              <ul>
                <li>프로펠러 기본 정보 등록</li>
                <li>설계 파일 업로드</li>
                <li>형상 데이터 관리</li>
              </ul>
            </div>
            <div className="panel-footer">
              <Link href="/propellers" className="btn btn-primary btn-block">
                바로가기 <span className="glyphicon glyphicon-chevron-right"></span>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-success">
            <div className="panel-heading">
              <h3 className="panel-title">
                <span className="glyphicon glyphicon-stats"></span> 성능해석
              </h3>
            </div>
            <div className="panel-body">
              <p>CFD 해석 결과 및 데이터 관리</p>
              <ul>
                <li>해석 조건 입력</li>
                <li>결과 데이터 관리</li>
                <li>해석 이미지 업로드</li>
              </ul>
            </div>
            <div className="panel-footer">
              <Link href="/analyses" className="btn btn-success btn-block">
                바로가기 <span className="glyphicon glyphicon-chevron-right"></span>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">
                <span className="glyphicon glyphicon-signal"></span> 데이터 분석
              </h3>
            </div>
            <div className="panel-body">
              <p>EFD vs CFD 비교 분석</p>
              <ul>
                <li>실험-해석 데이터 비교</li>
                <li>오차율 분석</li>
                <li>그래프 시각화</li>
              </ul>
            </div>
            <div className="panel-footer">
              <Link href="/comparisons" className="btn btn-info btn-block">
                바로가기 <span className="glyphicon glyphicon-chevron-right"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="row" style={{ marginTop: "30px" }}>
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-body stat-card">
              <p className="stat-number">{stats.propellerCount}</p>
              <p className="stat-label">등록된 프로펠러</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-body stat-card">
              <p className="stat-number">{stats.analysisCount}</p>
              <p className="stat-label">성능해석 건수</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-body stat-card">
              <p className="stat-number">{stats.fileCount}</p>
              <p className="stat-label">업로드된 파일</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
