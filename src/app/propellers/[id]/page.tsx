"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Propeller } from "@/types/propeller";

export default function PropellerDetailPage() {
  const params = useParams();
  const [propeller, setPropeller] = useState<Propeller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropeller = async () => {
      try {
        const res = await fetch(`/api/propellers/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPropeller(data);
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

  if (!propeller) {
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
        <li className="active">{propeller.name}</li>
      </ol>

      <div className="page-header">
        <div className="row">
          <div className="col-md-8">
            <h1>{propeller.name}</h1>
            <p className="text-muted">프로펠러 상세 정보</p>
          </div>
          <div className="col-md-4 text-right" style={{ paddingTop: "20px" }}>
            <Link
              href={`/propellers/${propeller.id}/edit`}
              className="btn btn-primary"
            >
              <span className="glyphicon glyphicon-pencil"></span> 수정
            </Link>
          </div>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <span className="glyphicon glyphicon-info-sign"></span> 기본 정보
          </h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>날개수</dt>
                <dd>{propeller.bladeCount}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>사용단면</dt>
                <dd>{propeller.sectionType}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>회전방향</dt>
                <dd>
                  <span
                    className={`label ${
                      propeller.rotationDirection === "RIGHT"
                        ? "label-success"
                        : "label-warning"
                    }`}
                  >
                    {propeller.rotationDirection}
                  </span>
                </dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>Power Ratio</dt>
                <dd>{propeller.powerRatio}</dd>
              </dl>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>스케일 비율</dt>
                <dd>{propeller.scaleRatio}</dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>사용단면 파일</dt>
                <dd>
                  {propeller.hasSectionFile ? (
                    <span className="text-success">
                      <span className="glyphicon glyphicon-ok"></span> 있음
                    </span>
                  ) : (
                    <span className="text-muted">없음</span>
                  )}
                </dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>Offset 파일</dt>
                <dd>
                  {propeller.hasOffsetFile ? (
                    <span className="text-success">
                      <span className="glyphicon glyphicon-ok"></span> 있음
                    </span>
                  ) : (
                    <span className="text-muted">없음</span>
                  )}
                </dd>
              </dl>
            </div>
            <div className="col-md-3 col-sm-6">
              <dl>
                <dt>등록일</dt>
                <dd>{new Date(propeller.createdAt).toLocaleDateString("ko-KR")}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 파일 목록 */}
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="row">
            <div className="col-md-6">
              <h3 className="panel-title">
                <span className="glyphicon glyphicon-folder-open"></span> 첨부 파일
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
          <p className="text-muted text-center">등록된 파일이 없습니다.</p>
        </div>
      </div>

      {/* 성능해석 목록 */}
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="row">
            <div className="col-md-6">
              <h3 className="panel-title">
                <span className="glyphicon glyphicon-stats"></span> 성능해석
              </h3>
            </div>
            <div className="col-md-6 text-right">
              <button className="btn btn-primary btn-sm">
                <span className="glyphicon glyphicon-plus"></span> 새 해석 등록
              </button>
            </div>
          </div>
        </div>
        <div className="panel-body">
          <p className="text-muted text-center">등록된 성능해석이 없습니다.</p>
        </div>
      </div>
    </div>
  );
}
