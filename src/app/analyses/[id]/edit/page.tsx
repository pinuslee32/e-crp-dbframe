"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AnalysisForm from "@/components/analyses/AnalysisForm";
import { AnalysisFormData } from "@/types/analysis";

export default function EditAnalysisPage() {
  const params = useParams();
  const [initialData, setInitialData] = useState<AnalysisFormData | null>(null);
  const [propellerName, setPropellerName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/analyses/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPropellerName(data.propeller?.name || "");
          setInitialData({
            propellerId: data.propellerId,
            density: parseFloat(data.density),
            viscosity: parseFloat(data.viscosity),
            afterRps: parseFloat(data.afterRps),
            forwardRps: parseFloat(data.forwardRps),
            reynoldsNumber: data.reynoldsNumber
              ? parseFloat(data.reynoldsNumber)
              : null,
            jCoefficient: parseFloat(data.jCoefficient),
            velocity: data.velocity ? parseFloat(data.velocity) : null,
            thrust: data.thrust ? parseFloat(data.thrust) : null,
            torque: data.torque ? parseFloat(data.torque) : null,
            kt: data.kt ? parseFloat(data.kt) : null,
            kq10: data.kq10 ? parseFloat(data.kq10) : null,
            efficiency: data.efficiency ? parseFloat(data.efficiency) : null,
            method: data.method || "",
          });
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

  if (!initialData) {
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
        <li>
          <Link href={`/analyses/${params.id}`}>
            {propellerName} - J={initialData.jCoefficient.toFixed(2)}
          </Link>
        </li>
        <li className="active">수정</li>
      </ol>

      <div className="page-header">
        <h1>성능해석 수정</h1>
        <p className="text-muted">해석 정보를 수정하세요</p>
      </div>

      <AnalysisForm
        initialData={initialData}
        analysisId={parseInt(params.id as string)}
      />
    </div>
  );
}
