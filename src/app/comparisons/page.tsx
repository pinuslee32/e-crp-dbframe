"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ComparisonData {
  id: number;
  jValue: string;
  efdKt: string;
  efdKq10: string;
  efdEta: string;
  vin: string;
  cfdThrust: string;
  cfdKt: string;
  cfdTorque: string;
  cfdKq10: string;
  cfdEta: string;
  ktDiffPercent: string;
  kqDiffPercent: string;
  etaDiffPercent: string;
}

interface CaseData {
  caseName: string;
  basePrism: number | null;
  baseThickness: string | null;
  surfacePrism: number | null;
  surfaceThickness: string | null;
  turbulentModel: string | null;
  viscosity: string | null;
  solverVersion: string | null;
}

interface AnalysisGroup {
  analysisId: number;
  propellerName: string;
  propellerId: number;
  jCoefficient: string;
  method: string;
  case: CaseData | null;
  comparisons: ComparisonData[];
}

export default function CfdDbRecordPage() {
  const [analysisGroups, setAnalysisGroups] = useState<AnalysisGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null);

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
          setSelectedAnalysis(data[0].analysisId);
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

  const formatNumber = (value: string | number | null | undefined, decimals: number = 4) => {
    if (value === null || value === undefined) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "-" : num.toFixed(decimals);
  };

  const formatPercent = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "-";
    return `${num.toFixed(2)}%`;
  };

  const selectedGroup = analysisGroups.find(g => g.analysisId === selectedAnalysis);
  const sortedComparisons = selectedGroup?.comparisons
    .sort((a, b) => parseFloat(a.jValue) - parseFloat(b.jValue)) || [];

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
        <h1>
          <span className="glyphicon glyphicon-stats" style={{ marginRight: "10px" }}></span>
          CFD DB Record
        </h1>
      </div>

      {analysisGroups.length === 0 ? (
        <div className="panel panel-default">
          <div className="panel-body text-center" style={{ padding: "50px" }}>
            <span
              className="glyphicon glyphicon-signal"
              style={{ fontSize: "48px", color: "#ccc" }}
            ></span>
            <p style={{ marginTop: "20px" }}>등록된 CFD DB Record가 없습니다.</p>
            <p className="text-muted">성능해석에서 EFD vs CFD 비교 데이터를 추가해주세요.</p>
          </div>
        </div>
      ) : (
        <div>
          {/* DB Case Table */}
          {selectedGroup?.case && (
            <div className="panel panel-info" style={{ marginBottom: "20px" }}>
              <div className="panel-heading">
                <h3 className="panel-title">
                  Case 1 : {selectedGroup.case.caseName}
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-condensed" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th rowSpan={2} className="text-center" style={{ verticalAlign: "middle", backgroundColor: "#d9edf7" }}>Base</th>
                      <th colSpan={2} className="text-center" style={{ backgroundColor: "#d9edf7" }}>Default Control</th>
                      <th colSpan={2} className="text-center" style={{ backgroundColor: "#d9edf7" }}>Surface Control</th>
                      <th rowSpan={2} className="text-center" style={{ verticalAlign: "middle", backgroundColor: "#d9edf7" }}>Turbulent</th>
                      <th rowSpan={2} className="text-center" style={{ verticalAlign: "middle", backgroundColor: "#d9edf7" }}>Viscosity</th>
                      <th rowSpan={2} className="text-center" style={{ verticalAlign: "middle", backgroundColor: "#d9edf7" }}>STAR-CCM+ ver</th>
                      <th rowSpan={2} className="text-center" style={{ verticalAlign: "middle", backgroundColor: "#d9edf7" }}>파일명</th>
                    </tr>
                    <tr>
                      <th className="text-center" style={{ backgroundColor: "#d9edf7" }}>Number Prism</th>
                      <th className="text-center" style={{ backgroundColor: "#d9edf7" }}>Total Thickness</th>
                      <th className="text-center" style={{ backgroundColor: "#d9edf7" }}>Number Prism</th>
                      <th className="text-center" style={{ backgroundColor: "#d9edf7" }}>Total Thickness</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center">{selectedGroup.case.caseName?.split("_")[0] || "-"}</td>
                      <td className="text-center">{selectedGroup.case.basePrism ?? "-"}</td>
                      <td className="text-center">{selectedGroup.case.baseThickness ? parseFloat(selectedGroup.case.baseThickness).toFixed(1) : "-"}</td>
                      <td className="text-center">{selectedGroup.case.surfacePrism ?? "-"}</td>
                      <td className="text-center">{selectedGroup.case.surfaceThickness ? parseFloat(selectedGroup.case.surfaceThickness).toFixed(1) : "-"}</td>
                      <td className="text-center">{selectedGroup.case.turbulentModel || "-"}</td>
                      <td className="text-center">{selectedGroup.case.viscosity ? parseFloat(selectedGroup.case.viscosity).toFixed(7) : "-"}</td>
                      <td className="text-center">{selectedGroup.case.solverVersion || "-"}</td>
                      <td className="text-center">{selectedGroup.case.caseName || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="row">
            {/* EFD Table (Left) */}
            <div className="col-md-4">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">EFD</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-condensed" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#337ab7", color: "white" }}>
                        <th className="text-center" style={{ width: "25%" }}>J</th>
                        <th className="text-center" style={{ width: "25%" }}>KT</th>
                        <th className="text-center" style={{ width: "25%" }}>10KQ</th>
                        <th className="text-center" style={{ width: "25%" }}>ETAO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedComparisons.map((comp) => (
                        <tr key={comp.id}>
                          <td className="text-center">{formatNumber(comp.jValue, 1)}</td>
                          <td className="text-right">{formatNumber(comp.efdKt, 4)}</td>
                          <td className="text-right">{formatNumber(comp.efdKq10, 4)}</td>
                          <td className="text-right">{formatNumber(comp.efdEta, 3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* EFD vs CFD1(Ref.) Table (Right) */}
            <div className="col-md-8">
              <div className="panel panel-success">
                <div className="panel-heading">
                  <h3 className="panel-title">EFD vs CFD1(Ref.)</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-condensed" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#5cb85c", color: "white" }}>
                        <th className="text-center">J</th>
                        <th className="text-center">Vin</th>
                        <th className="text-center">THRUST</th>
                        <th className="text-center">KT</th>
                        <th className="text-center">Diff (%)</th>
                        <th className="text-center">TORQUE</th>
                        <th className="text-center">10KQ</th>
                        <th className="text-center">Diff (%)</th>
                        <th className="text-center">ETAO</th>
                        <th className="text-center">Diff (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedComparisons.map((comp) => (
                        <tr key={comp.id}>
                          <td className="text-center">{formatNumber(comp.jValue, 1)}</td>
                          <td className="text-right">{formatNumber(comp.vin, 1)}</td>
                          <td className="text-right">{formatNumber(comp.cfdThrust, 3)}</td>
                          <td className="text-right">{formatNumber(comp.cfdKt, 6)}</td>
                          <td className="text-right" style={{
                            color: parseFloat(comp.ktDiffPercent) < 0 ? "#d9534f" : "#5cb85c",
                            fontWeight: "bold"
                          }}>
                            {formatPercent(comp.ktDiffPercent)}
                          </td>
                          <td className="text-right">{formatNumber(comp.cfdTorque, 4)}</td>
                          <td className="text-right">{formatNumber(comp.cfdKq10, 6)}</td>
                          <td className="text-right" style={{
                            color: parseFloat(comp.kqDiffPercent) < 0 ? "#d9534f" : "#5cb85c",
                            fontWeight: "bold"
                          }}>
                            {formatPercent(comp.kqDiffPercent)}
                          </td>
                          <td className="text-right">{formatNumber(comp.cfdEta, 6)}</td>
                          <td className="text-right" style={{
                            color: parseFloat(comp.etaDiffPercent) < 0 ? "#d9534f" : "#5cb85c",
                            fontWeight: "bold"
                          }}>
                            {formatPercent(comp.etaDiffPercent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Note */}
      {sortedComparisons.length > 0 && (
        <div className="alert alert-info">
          <strong>분석 결과:</strong> 실험 값을 기준으로 CFD1(Ref.)의 KT, KQ는 낮게 추정되며 편차가 낮은 0.2에서 최대 5.35% 낮은 결과를 보임
        </div>
      )}

      {/* Link to Analysis Detail */}
      {selectedGroup && (
        <div className="text-right" style={{ marginTop: "20px" }}>
          <Link href={`/propellers/${selectedGroup.propellerId}`} className="btn btn-default">
            <span className="glyphicon glyphicon-arrow-left"></span> 프로펠러 상세 보기
          </Link>
        </div>
      )}
    </div>
  );
}
