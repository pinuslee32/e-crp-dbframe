"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PerformanceAnalysis } from "@/types/analysis";

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<PerformanceAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const res = await fetch("/api/analyses");
      const data = await res.json();
      setAnalyses(data);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      setAnalyses(analyses.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Failed to delete analysis:", error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="row">
          <div className="col-md-8">
            <h1>성능해석</h1>
            <p className="text-muted">CFD 해석 결과 및 데이터 관리</p>
          </div>
          <div className="col-md-4 text-right" style={{ paddingTop: "20px" }}>
            <Link href="/analyses/new" className="btn btn-primary">
              <span className="glyphicon glyphicon-plus"></span> 새 성능해석 등록
            </Link>
          </div>
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="panel panel-default">
          <div className="panel-body empty-state">
            <span
              className="glyphicon glyphicon-inbox"
              style={{ fontSize: "48px", color: "#ccc" }}
            ></span>
            <p style={{ marginTop: "20px" }}>등록된 성능해석이 없습니다.</p>
            <Link href="/analyses/new" className="btn btn-primary">
              첫 성능해석을 등록해보세요
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel panel-default">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>프로펠러</th>
                  <th>J</th>
                  <th>Density</th>
                  <th>RPS (Aft/Fwd)</th>
                  <th>Thrust</th>
                  <th>Torque</th>
                  <th>KT</th>
                  <th>10KQ</th>
                  <th>ηO</th>
                  <th>Method</th>
                  <th className="text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((analysis) => (
                  <tr key={analysis.id}>
                    <td>
                      <Link
                        href={`/propellers/${analysis.propeller?.id}`}
                        className="propeller-name"
                      >
                        {analysis.propeller?.name || "-"}
                      </Link>
                    </td>
                    <td>{Number(analysis.jCoefficient).toFixed(2)}</td>
                    <td>{Number(analysis.density).toFixed(2)}</td>
                    <td>
                      {Number(analysis.afterRps).toFixed(1)} /{" "}
                      {Number(analysis.forwardRps).toFixed(1)}
                    </td>
                    <td>{analysis.thrust ? Number(analysis.thrust).toFixed(2) : "-"}</td>
                    <td>{analysis.torque ? Number(analysis.torque).toFixed(2) : "-"}</td>
                    <td>{analysis.kt ? Number(analysis.kt).toFixed(4) : "-"}</td>
                    <td>{analysis.kq10 ? Number(analysis.kq10).toFixed(4) : "-"}</td>
                    <td>
                      {analysis.efficiency
                        ? Number(analysis.efficiency).toFixed(4)
                        : "-"}
                    </td>
                    <td>
                      {analysis.method ? (
                        <span className="label label-info">{analysis.method}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-center action-buttons">
                      <Link
                        href={`/analyses/${analysis.id}`}
                        className="btn btn-default btn-xs"
                      >
                        <span className="glyphicon glyphicon-eye-open"></span>
                      </Link>
                      <Link
                        href={`/analyses/${analysis.id}/edit`}
                        className="btn btn-default btn-xs"
                      >
                        <span className="glyphicon glyphicon-pencil"></span>
                      </Link>
                      <button
                        onClick={() => handleDelete(analysis.id)}
                        className="btn btn-danger btn-xs"
                      >
                        <span className="glyphicon glyphicon-trash"></span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
