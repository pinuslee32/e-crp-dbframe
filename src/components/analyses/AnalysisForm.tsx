"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisFormData } from "@/types/analysis";
import { Propeller } from "@/types/propeller";

interface Props {
  initialData?: AnalysisFormData;
  analysisId?: number;
}

const defaultFormData: AnalysisFormData = {
  propellerId: 0,
  density: 998.05,
  viscosity: 0.00015,
  afterRps: 15,
  forwardRps: 20,
  reynoldsNumber: null,
  jCoefficient: 0.2,
  velocity: null,
  thrust: null,
  torque: null,
  kt: null,
  kq10: null,
  efficiency: null,
  method: "",
};

export default function AnalysisForm({ initialData, analysisId }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<AnalysisFormData>(
    initialData || defaultFormData
  );
  const [propellers, setPropellers] = useState<Propeller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!analysisId;

  useEffect(() => {
    fetchPropellers();
  }, []);

  const fetchPropellers = async () => {
    try {
      const res = await fetch("/api/propellers");
      const data = await res.json();
      setPropellers(data);
    } catch (error) {
      console.error("Failed to fetch propellers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.propellerId) {
      setError("프로펠러를 선택해주세요.");
      setLoading(false);
      return;
    }

    try {
      const url = isEdit ? `/api/analyses/${analysisId}` : "/api/analyses";
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

      router.push("/analyses");
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

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // RPS Ratio 계산
  const rpsRatio =
    formData.forwardRps > 0
      ? (formData.afterRps / formData.forwardRps).toFixed(4)
      : "-";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger">
          <span className="glyphicon glyphicon-exclamation-sign"></span> {error}
        </div>
      )}

      {/* 프로펠러 선택 */}
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">프로펠러 선택</h3>
        </div>
        <div className="panel-body">
          <div className="form-group">
            <label className="required">프로펠러</label>
            <select
              name="propellerId"
              value={formData.propellerId}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value={0}>-- 프로펠러 선택 --</option>
              {propellers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.bladeCount}날개, {p.sectionType})
                </option>
              ))}
            </select>
          </div>
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
            <div className="col-md-4">
              <div className="form-group">
                <label className="required">Density</label>
                <input
                  type="number"
                  name="density"
                  value={formData.density}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="required">Viscosity</label>
                <input
                  type="number"
                  name="viscosity"
                  value={formData.viscosity}
                  onChange={handleChange}
                  required
                  step="0.00001"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="required">J (전진계수)</label>
                <input
                  type="number"
                  name="jCoefficient"
                  value={formData.jCoefficient}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label className="required">After RPS</label>
                <input
                  type="number"
                  name="afterRps"
                  value={formData.afterRps}
                  onChange={handleChange}
                  required
                  step="0.1"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="required">Forward RPS</label>
                <input
                  type="number"
                  name="forwardRps"
                  value={formData.forwardRps}
                  onChange={handleChange}
                  required
                  step="0.1"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>RPS Ratio (자동계산)</label>
                <input
                  type="text"
                  value={rpsRatio}
                  className="form-control"
                  disabled
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>Reynolds Number</label>
                <input
                  type="number"
                  name="reynoldsNumber"
                  value={formData.reynoldsNumber || ""}
                  onChange={handleChange}
                  step="0.000001"
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Velocity</label>
                <input
                  type="number"
                  name="velocity"
                  value={formData.velocity || ""}
                  onChange={handleChange}
                  step="0.001"
                  className="form-control"
                />
              </div>
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
            <div className="col-md-4">
              <div className="form-group">
                <label>Thrust</label>
                <input
                  type="number"
                  name="thrust"
                  value={formData.thrust || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Torque</label>
                <input
                  type="number"
                  name="torque"
                  value={formData.torque || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Method</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- 선택 --</option>
                  <option value="Lag K-e">Lag K-e</option>
                  <option value="K-w">K-w</option>
                  <option value="RANS">RANS</option>
                  <option value="URANS">URANS</option>
                  <option value="LES">LES</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>
                  K<sub>T</sub>
                </label>
                <input
                  type="number"
                  name="kt"
                  value={formData.kt || ""}
                  onChange={handleChange}
                  step="0.0001"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>
                  10K<sub>Q</sub>
                </label>
                <input
                  type="number"
                  name="kq10"
                  value={formData.kq10 || ""}
                  onChange={handleChange}
                  step="0.0001"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>
                  η<sub>O</sub> (효율)
                </label>
                <input
                  type="number"
                  name="efficiency"
                  value={formData.efficiency || ""}
                  onChange={handleChange}
                  step="0.0001"
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="form-group">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (
            <>
              <span className="glyphicon glyphicon-refresh"></span> 처리 중...
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
    </form>
  );
}
