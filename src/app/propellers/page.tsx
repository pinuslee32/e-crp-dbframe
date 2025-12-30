"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Propeller } from "@/types/propeller";

export default function PropellersPage() {
  const [propellers, setPropellers] = useState<Propeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPropellers();
  }, []);

  const fetchPropellers = async () => {
    try {
      const res = await fetch("/api/propellers");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched propellers:", data);
      if (Array.isArray(data)) {
        setPropellers(data);
      } else {
        console.error("API did not return an array:", data);
        setPropellers([]);
      }
    } catch (err) {
      console.error("Failed to fetch propellers:", err);
      setError(err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.");
      setPropellers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/propellers/${id}`, { method: "DELETE" });
      setPropellers(propellers.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete propeller:", error);
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
            <h1>프로펠러 관리</h1>
            <p className="text-muted">프로펠러 설계 및 모델링 데이터 관리</p>
          </div>
          <div className="col-md-4 text-right" style={{ paddingTop: "20px" }}>
            <Link href="/propellers/new" className="btn btn-primary">
              <span className="glyphicon glyphicon-plus"></span> 새 프로펠러 등록
            </Link>
          </div>
        </div>
      </div>

      {propellers.length === 0 ? (
        <div className="panel panel-default">
          <div className="panel-body empty-state">
            <span
              className="glyphicon glyphicon-inbox"
              style={{ fontSize: "48px", color: "#ccc" }}
            ></span>
            <p style={{ marginTop: "20px" }}>등록된 프로펠러가 없습니다.</p>
            <Link href="/propellers/new" className="btn btn-primary">
              첫 프로펠러를 등록해보세요
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel panel-default">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>날개수</th>
                  <th>사용단면</th>
                  <th>회전방향</th>
                  <th>Power Ratio</th>
                  <th>스케일 비율</th>
                  <th>파일</th>
                  <th>해석</th>
                  <th className="text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {propellers.map((propeller) => (
                  <tr key={propeller.id}>
                    <td>
                      <Link
                        href={`/propellers/${propeller.id}`}
                        className="propeller-name"
                      >
                        {propeller.name}
                      </Link>
                    </td>
                    <td>{propeller.bladeCount}</td>
                    <td>{propeller.sectionType}</td>
                    <td>
                      <span
                        className={`label ${
                          propeller.rotationDirection === "RIGHT"
                            ? "label-success"
                            : "label-warning"
                        }`}
                      >
                        {propeller.rotationDirection}
                      </span>
                    </td>
                    <td>{propeller.powerRatio}</td>
                    <td>{propeller.scaleRatio}</td>
                    <td>
                      <span className="badge">{propeller._count?.files || 0}</span>
                    </td>
                    <td>
                      <span className="badge">{propeller._count?.analyses || 0}</span>
                    </td>
                    <td className="text-center action-buttons">
                      <Link
                        href={`/propellers/${propeller.id}/edit`}
                        className="btn btn-default btn-xs"
                      >
                        <span className="glyphicon glyphicon-pencil"></span> 수정
                      </Link>
                      <button
                        onClick={() => handleDelete(propeller.id)}
                        className="btn btn-danger btn-xs"
                      >
                        <span className="glyphicon glyphicon-trash"></span> 삭제
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
