"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ComparisonData {
  id: number;
  jValue: string;
  efdKt: string;
  efdKq10: string;
  efdEta: string;
  cfdKt: string;
  cfdKq10: string;
  cfdEta: string;
  ktDiffPercent: string;
  kqDiffPercent: string;
  etaDiffPercent: string;
}

interface AnalysisGroup {
  analysisId: number;
  propellerName: string;
  propellerId: number;
  jCoefficient: string;
  method: string;
  comparisons: ComparisonData[];
}

export default function ComparisonsPage() {
  const [analysisGroups, setAnalysisGroups] = useState<AnalysisGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState<number | null>(null);

  useEffect(() => {
    fetchComparisons();
  }, []);

  const fetchComparisons = async () => {
    try {
      const res = await fetch("/api/comparisons");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAnalysisGroups(data);
        if (data.length > 0) {
          setExpandedAnalysis(data[0].analysisId);
        }
      } else {
        setAnalysisGroups([]);
      }
    } catch (err) {
      console.error("Failed to fetch comparisons:", err);
      setError(err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (analysisId: number) => {
    setExpandedAnalysis(expandedAnalysis === analysisId ? null : analysisId);
  };

  const formatNumber = (value: string | number, decimals: number = 4) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "-" : num.toFixed(decimals);
  };

  const getDiffClass = (diff: string | number) => {
    const num = typeof diff === "string" ? parseFloat(diff) : diff;
    if (isNaN(num)) return "";
    if (Math.abs(num) <= 2) return "text-success";
    if (Math.abs(num) <= 5) return "text-warning";
    return "text-danger";
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

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" style={{ marginTop: "20px" }}>
          <strong>오류:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="row">
          <div className="col-md-8">
            <h1>데이터 분석</h1>
            <p className="text-muted">EFD vs CFD 비교 분석</p>
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="panel panel-default">
        <div className="panel-body">
          <strong>오차율 기준:</strong>
          <span className="label label-success" style={{ marginLeft: "10px" }}>2% 이하</span>
          <span className="label label-warning" style={{ marginLeft: "5px" }}>2~5%</span>
          <span className="label label-danger" style={{ marginLeft: "5px" }}>5% 초과</span>
        </div>
      </div>

      {analysisGroups.length === 0 ? (
        <div className="panel panel-default">
          <div className="panel-body text-center" style={{ padding: "50px" }}>
            <span
              className="glyphicon glyphicon-signal"
              style={{ fontSize: "48px", color: "#ccc" }}
            ></span>
            <p style={{ marginTop: "20px" }}>등록된 비교 데이터가 없습니다.</p>
            <p className="text-muted">성능해석에서 EFD vs CFD 비교 데이터를 추가해주세요.</p>
          </div>
        </div>
      ) : (
        <div className="panel-group" id="accordion">
          {analysisGroups.map((group) => (
            <div className="panel panel-default" key={group.analysisId}>
              <div className="panel-heading" style={{ cursor: "pointer" }} onClick={() => toggleExpand(group.analysisId)}>
                <h4 className="panel-title">
                  <span className={`glyphicon ${expandedAnalysis === group.analysisId ? "glyphicon-chevron-down" : "glyphicon-chevron-right"}`}></span>
                  {" "}
                  <Link href={`/propellers/${group.propellerId}`} onClick={(e) => e.stopPropagation()}>
                    {group.propellerName}
                  </Link>
                  {" - "}
                  <span className="text-muted">J = {formatNumber(group.jCoefficient, 2)}</span>
                  {" "}
                  <span className="label label-info">{group.method}</span>
                  <span className="badge pull-right">{group.comparisons.length}개 비교점</span>
                </h4>
              </div>
              {expandedAnalysis === group.analysisId && (
                <div className="panel-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped table-condensed">
                      <thead>
                        <tr className="active">
                          <th rowSpan={2} className="text-center" style={{ verticalAlign: "middle" }}>J</th>
                          <th colSpan={3} className="text-center">EFD (실험)</th>
                          <th colSpan={3} className="text-center">CFD (해석)</th>
                          <th colSpan={3} className="text-center">오차율 (%)</th>
                        </tr>
                        <tr className="active">
                          <th className="text-center">Kt</th>
                          <th className="text-center">10Kq</th>
                          <th className="text-center">Eta</th>
                          <th className="text-center">Kt</th>
                          <th className="text-center">10Kq</th>
                          <th className="text-center">Eta</th>
                          <th className="text-center">Kt</th>
                          <th className="text-center">10Kq</th>
                          <th className="text-center">Eta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.comparisons
                          .sort((a, b) => parseFloat(a.jValue) - parseFloat(b.jValue))
                          .map((comp) => (
                            <tr key={comp.id}>
                              <td className="text-center"><strong>{formatNumber(comp.jValue, 2)}</strong></td>
                              <td className="text-right">{formatNumber(comp.efdKt)}</td>
                              <td className="text-right">{formatNumber(comp.efdKq10)}</td>
                              <td className="text-right">{formatNumber(comp.efdEta)}</td>
                              <td className="text-right">{formatNumber(comp.cfdKt)}</td>
                              <td className="text-right">{formatNumber(comp.cfdKq10)}</td>
                              <td className="text-right">{formatNumber(comp.cfdEta)}</td>
                              <td className={`text-right ${getDiffClass(comp.ktDiffPercent)}`}>
                                <strong>{formatNumber(comp.ktDiffPercent, 2)}</strong>
                              </td>
                              <td className={`text-right ${getDiffClass(comp.kqDiffPercent)}`}>
                                <strong>{formatNumber(comp.kqDiffPercent, 2)}</strong>
                              </td>
                              <td className={`text-right ${getDiffClass(comp.etaDiffPercent)}`}>
                                <strong>{formatNumber(comp.etaDiffPercent, 2)}</strong>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 평균 오차율 */}
                  <div className="row" style={{ marginTop: "15px" }}>
                    <div className="col-md-4">
                      <div className="well well-sm text-center">
                        <small className="text-muted">평균 Kt 오차</small>
                        <h4 className={getDiffClass(
                          group.comparisons.reduce((sum, c) => sum + Math.abs(parseFloat(c.ktDiffPercent)), 0) / group.comparisons.length
                        )}>
                          {(group.comparisons.reduce((sum, c) => sum + Math.abs(parseFloat(c.ktDiffPercent)), 0) / group.comparisons.length).toFixed(2)}%
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="well well-sm text-center">
                        <small className="text-muted">평균 10Kq 오차</small>
                        <h4 className={getDiffClass(
                          group.comparisons.reduce((sum, c) => sum + Math.abs(parseFloat(c.kqDiffPercent)), 0) / group.comparisons.length
                        )}>
                          {(group.comparisons.reduce((sum, c) => sum + Math.abs(parseFloat(c.kqDiffPercent)), 0) / group.comparisons.length).toFixed(2)}%
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="well well-sm text-center">
                        <small className="text-muted">평균 Eta 오차</small>
                        <h4 className={getDiffClass(
                          group.comparisons.reduce((sum, c) => sum + Math.abs(parseFloat(c.etaDiffPercent)), 0) / group.comparisons.length
                        )}>
                          {(group.comparisons.reduce((sum, c) => sum + Math.abs(parseFloat(c.etaDiffPercent)), 0) / group.comparisons.length).toFixed(2)}%
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
