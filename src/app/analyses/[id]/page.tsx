"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PerformanceAnalysis } from "@/types/analysis";

export default function AnalysisDetailPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/analyses/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data);
        }
      } catch (error) {
        console.error("Failed to fetch analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container">
        <div className="alert alert-warning">
          <span className="glyphicon glyphicon-warning-sign"></span>{" "}
          성능해석을 찾을 수 없습니다.
          <Link
            href="/analyses"
            className="alert-link"
            style={{ marginLeft: "10px" }}
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <ol className="breadcrumb">
        <li>
          <Link href="/">홈</Link>
        </li>
        <li>
          <Link href="/analyses">성능해석</Link>
        </li>
        <li className="active">
          {analysis.propeller?.name} - J={Number(analysis.jCoefficient).toFixed(2)}
        </li>
      </ol>

      <div className="page-header">
        <div className="row">
          <div className="col-md-8">
            <h1>
              {analysis.propeller?.name}{" "}
              <small>J = {Number(analysis.jCoefficient).toFixed(2)}</small>
            </h1>
            <p className="text-muted">성능해석 상세 정보</p>
          </div>
          <div className="col-md-4 text-right" style={{ paddingTop: "20px" }}>
            <Link
              href={`/analyses/${analysis.id}/edit`}
              className="btn btn-primary"
            >
              <span className="glyphicon glyphicon-pencil"></span> 수정
            </Link>
          </div>
        </div>
      </div>

      {/* 프로펠러 정보 */}
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">
            <span className="glyphicon glyphicon-cog"></span> 프로펠러 정보
          </h3>
        </div>
        <div className="panel-body">
          <p>
            <strong>프로펠러:</strong>{" "}
            <Link href={`/propellers/${analysis.propeller?.id}`}>
              {analysis.propeller?.name}
            </Link>
          </p>
        </div>
      </div>

      {/* Input 항목 */}
      <div className="panel panel-info">
        <div className="panel-heading">
          <h3 className="panel-title">
            <span className="glyphicon glyphicon-log-in"></span> Input 항목
          </h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>Density</dt>
                <dd>{Number(analysis.density).toFixed(2)}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>Viscosity</dt>
                <dd>{Number(analysis.viscosity).toFixed(5)}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>J (전진계수)</dt>
                <dd>{Number(analysis.jCoefficient).toFixed(2)}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>Velocity</dt>
                <dd>{analysis.velocity ? Number(analysis.velocity).toFixed(3) : "-"}</dd>
              </dl>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>After RPS</dt>
                <dd>{Number(analysis.afterRps).toFixed(1)}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>Forward RPS</dt>
                <dd>{Number(analysis.forwardRps).toFixed(1)}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>RPS Ratio</dt>
                <dd>
                  {analysis.rpsRatio ? Number(analysis.rpsRatio).toFixed(4) : "-"}
                </dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>Reynolds Number</dt>
                <dd>
                  {analysis.reynoldsNumber
                    ? Number(analysis.reynoldsNumber).toExponential(2)
                    : "-"}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Output 항목 */}
      <div className="panel panel-success">
        <div className="panel-heading">
          <h3 className="panel-title">
            <span className="glyphicon glyphicon-log-out"></span> Output 항목
          </h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-2 col-sm-4">
              <dl>
                <dt>Thrust</dt>
                <dd className="h4">
                  {analysis.thrust ? Number(analysis.thrust).toFixed(2) : "-"}
                </dd>
              </dl>
            </div>
            <div className="col-md-2 col-sm-4">
              <dl>
                <dt>Torque</dt>
                <dd className="h4">
                  {analysis.torque ? Number(analysis.torque).toFixed(2) : "-"}
                </dd>
              </dl>
            </div>
            <div className="col-md-2 col-sm-4">
              <dl>
                <dt>
                  K<sub>T</sub>
                </dt>
                <dd className="h4">
                  {analysis.kt ? Number(analysis.kt).toFixed(4) : "-"}
                </dd>
              </dl>
            </div>
            <div className="col-md-2 col-sm-4">
              <dl>
                <dt>
                  10K<sub>Q</sub>
                </dt>
                <dd className="h4">
                  {analysis.kq10 ? Number(analysis.kq10).toFixed(4) : "-"}
                </dd>
              </dl>
            </div>
            <div className="col-md-2 col-sm-4">
              <dl>
                <dt>
                  η<sub>O</sub>
                </dt>
                <dd className="h4">
                  {analysis.efficiency
                    ? Number(analysis.efficiency).toFixed(4)
                    : "-"}
                </dd>
              </dl>
            </div>
            <div className="col-md-2 col-sm-4">
              <dl>
                <dt>Method</dt>
                <dd>
                  {analysis.method ? (
                    <span className="label label-info">{analysis.method}</span>
                  ) : (
                    "-"
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 해석 결과 파일 */}
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="row">
            <div className="col-md-6">
              <h3 className="panel-title">
                <span className="glyphicon glyphicon-picture"></span> 해석 결과 파일
              </h3>
            </div>
            <div className="col-md-6 text-right">
              <button className="btn btn-default btn-sm">
                <span className="glyphicon glyphicon-upload"></span> 파일 업로드
              </button>
            </div>
          </div>
        </div>
        <div className="panel-body">
          {analysis.files && analysis.files.length > 0 ? (
            <div className="row">
              {analysis.files.map((file) => (
                <div key={file.id} className="col-md-4">
                  <div className="thumbnail">
                    <div
                      style={{
                        height: "150px",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="glyphicon glyphicon-picture"
                        style={{ fontSize: "48px", color: "#ccc" }}
                      ></span>
                    </div>
                    <div className="caption">
                      <p>
                        <span className="label label-default">{file.fileType}</span>
                      </p>
                      <p className="text-muted small">{file.originalName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center">등록된 파일이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
