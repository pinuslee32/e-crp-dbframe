"use client";

import { useEffect, useState } from "react";

interface Admin {
  id: number;
  username: string;
  name: string;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch {
      console.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "등록에 실패했습니다.");
        return;
      }

      setFormData({ username: "", password: "", name: "" });
      setShowForm(false);
      fetchAdmins();
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 관리자를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "삭제에 실패했습니다.");
        return;
      }

      fetchAdmins();
    } catch {
      alert("서버 연결에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ marginTop: 100 }}>
          <span className="glyphicon glyphicon-refresh spinning"></span> 로딩중...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>
          <span className="glyphicon glyphicon-user"></span> 관리자 관리
        </h1>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <span className="glyphicon glyphicon-plus"></span> 관리자 추가
        </button>
      </div>

      {showForm && (
        <div className="panel panel-default" style={{ marginBottom: 20 }}>
          <div className="panel-heading">
            <h3 className="panel-title">새 관리자 등록</h3>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>아이디</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>비밀번호</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>이름</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? "등록 중..." : "등록"}
              </button>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => setShowForm(false)}
                style={{ marginLeft: 10 }}
              >
                취소
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">관리자 목록 ({admins.length}명)</h3>
        </div>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>아이디</th>
              <th>이름</th>
              <th>등록일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                <td>{admin.username}</td>
                <td>{admin.name}</td>
                <td>{new Date(admin.createdAt).toLocaleDateString("ko-KR")}</td>
                <td>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => handleDelete(admin.id, admin.name)}
                  >
                    <span className="glyphicon glyphicon-trash"></span> 삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
