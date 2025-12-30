"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PropellerForm from "@/components/propellers/PropellerForm";
import { PropellerFormData } from "@/types/propeller";

export default function EditPropellerPage() {
  const params = useParams();
  const [initialData, setInitialData] = useState<PropellerFormData | null>(null);
  const [propellerName, setPropellerName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropeller = async () => {
      try {
        const res = await fetch(`/api/propellers/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPropellerName(data.name);
          setInitialData({
            name: data.name,
            bladeCount: data.bladeCount,
            sectionType: data.sectionType,
            hasSectionFile: data.hasSectionFile,
            rotationDirection: data.rotationDirection,
            powerRatio: data.powerRatio,
            scaleRatio: parseFloat(data.scaleRatio),
            hasOffsetFile: data.hasOffsetFile,
          });
        }
      } catch (error) {
        console.error("Failed to fetch propeller:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropeller();
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
          프로펠러를 찾을 수 없습니다.
          <Link
            href="/propellers"
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
          <Link href="/propellers">프로펠러 관리</Link>
        </li>
        <li>
          <Link href={`/propellers/${params.id}`}>{propellerName}</Link>
        </li>
        <li className="active">수정</li>
      </ol>

      <div className="page-header">
        <h1>프로펠러 수정</h1>
        <p className="text-muted">프로펠러 정보를 수정하세요</p>
      </div>

      <div className="panel panel-default">
        <div className="panel-body">
          <PropellerForm
            initialData={initialData}
            propellerId={parseInt(params.id as string)}
          />
        </div>
      </div>
    </div>
  );
}
