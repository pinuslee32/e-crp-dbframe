"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropellerFormData } from "@/types/propeller";

interface Props {
  initialData?: PropellerFormData;
  propellerId?: number;
}

const defaultFormData: PropellerFormData = {
  name: "",
  bladeCount: 4,
  sectionType: "NACA 66 mod",
  hasSectionFile: false,
  rotationDirection: "RIGHT",
  powerRatio: "5:5",
  scaleRatio: 1.0,
  hasOffsetFile: false,
};

export default function PropellerForm({ initialData, propellerId }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<PropellerFormData>(
    initialData || defaultFormData
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!propellerId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `/api/propellers/${propellerId}` : "/api/propellers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "요청에 실패했습니다.");
      }

      router.push("/propellers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-horizontal">
      {error && (
        <div className="alert alert-danger">
          <span className="glyphicon glyphicon-exclamation-sign"></span> {error}
        </div>
      )}

      <div className="form-group">
        <label className="col-sm-3 control-label required">프로펠러 이름</label>
        <div className="col-sm-9">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="예: KP1711"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-3 control-label required">날개수</label>
        <div className="col-sm-9">
          <input
            type="number"
            name="bladeCount"
            value={formData.bladeCount}
            onChange={handleChange}
            required
            min={1}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-3 control-label required">사용단면</label>
        <div className="col-sm-9">
          <input
            type="text"
            name="sectionType"
            value={formData.sectionType}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="예: NACA 66 mod"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-3 control-label required">회전방향</label>
        <div className="col-sm-9">
          <select
            name="rotationDirection"
            value={formData.rotationDirection}
            onChange={handleChange}
            className="form-control"
          >
            <option value="RIGHT">RIGHT (우회전)</option>
            <option value="LEFT">LEFT (좌회전)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-3 control-label required">Power Ratio</label>
        <div className="col-sm-9">
          <select
            name="powerRatio"
            value={formData.powerRatio}
            onChange={handleChange}
            className="form-control"
          >
            <option value="5:5">5:5</option>
            <option value="4:6">4:6</option>
            <option value="6:4">6:4</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-3 control-label required">스케일 비율</label>
        <div className="col-sm-9">
          <input
            type="number"
            name="scaleRatio"
            value={formData.scaleRatio}
            onChange={handleChange}
            required
            step="0.0001"
            min={0}
            className="form-control"
            placeholder="예: 42.063"
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-sm-offset-3 col-sm-9">
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                name="hasSectionFile"
                checked={formData.hasSectionFile}
                onChange={handleChange}
              />{" "}
              사용단면 파일 있음
            </label>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="col-sm-offset-3 col-sm-9">
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                name="hasOffsetFile"
                checked={formData.hasOffsetFile}
                onChange={handleChange}
              />{" "}
              Offset 파일 있음
            </label>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="col-sm-offset-3 col-sm-9">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="glyphicon glyphicon-refresh glyphicon-spin"></span>{" "}
                처리 중...
              </>
            ) : isEdit ? (
              <>
                <span className="glyphicon glyphicon-ok"></span> 수정하기
              </>
            ) : (
              <>
                <span className="glyphicon glyphicon-plus"></span> 등록하기
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-default"
            style={{ marginLeft: "10px" }}
          >
            취소
          </button>
        </div>
      </div>
    </form>
  );
}
