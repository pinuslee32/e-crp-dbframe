-- E-CRP DB Frame Schema
-- PostgreSQL 15+
-- Created: 2025-12-30

-- ============================================
-- ENUM Types
-- ============================================

CREATE TYPE rotation_direction AS ENUM ('RIGHT', 'LEFT');

CREATE TYPE propeller_file_type AS ENUM (
    'OFFSET',           -- Offset 파일 (.dat)
    'SECTION',          -- 사용단면 파일 (.blk)
    'IMAGE_TOP',        -- 형상 사진 (top)
    'IMAGE_FRONT',      -- 형상 사진 (front)
    'IMAGE_SIDE',       -- 형상 사진 (side)
    'DRAWING',          -- 제작도면 파일
    'GEOMETRY_DATA',    -- Propeller Geometry Data (.out)
    'GEOMETRY_INFO',    -- 형상 정보 파일 (.csv)
    'CAD_IGS',          -- 형상 파일 (.igs)
    'CAD_STL',          -- 형상 파일 (.stl)
    'CAD_STP'           -- 형상 파일 (.stp)
);

CREATE TYPE analysis_file_type AS ENUM (
    'PRESSURE',         -- 해석결과 (Pressure)
    'WAKE',             -- 해석결과 (Wake)
    'GRAPH_TURBULENT',  -- Turbulent Graph
    'GRAPH_FORCE'       -- Rotating propeller force Graph
);

-- ============================================
-- Tables
-- ============================================

-- 프로펠러 기본 정보
CREATE TABLE propellers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    blade_count INTEGER NOT NULL,
    section_type VARCHAR(50) NOT NULL,
    has_section_file BOOLEAN DEFAULT false,
    rotation_direction rotation_direction NOT NULL,
    power_ratio VARCHAR(10) NOT NULL,
    scale_ratio DECIMAL(10,4) NOT NULL,
    has_offset_file BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_blade_count CHECK (blade_count > 0),
    CONSTRAINT chk_scale_ratio CHECK (scale_ratio > 0)
);

-- 프로펠러 파일
CREATE TABLE propeller_files (
    id SERIAL PRIMARY KEY,
    propeller_id INTEGER NOT NULL,
    file_type propeller_file_type NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_propeller_files_propeller
        FOREIGN KEY (propeller_id)
        REFERENCES propellers(id)
        ON DELETE CASCADE
);

-- 성능해석
CREATE TABLE performance_analyses (
    id SERIAL PRIMARY KEY,
    propeller_id INTEGER NOT NULL,

    -- Input 항목
    density DECIMAL(12,6) NOT NULL,
    viscosity DECIMAL(12,8) NOT NULL,
    after_rps DECIMAL(10,4) NOT NULL,
    forward_rps DECIMAL(10,4) NOT NULL,
    rps_ratio DECIMAL(6,4) GENERATED ALWAYS AS (after_rps / forward_rps) STORED,
    reynolds_number DECIMAL(15,8),
    j_coefficient DECIMAL(6,4) NOT NULL,
    velocity DECIMAL(12,6),

    -- Output 항목
    thrust DECIMAL(12,4),
    torque DECIMAL(12,4),
    kt DECIMAL(8,6),
    kq_10 DECIMAL(8,6),
    efficiency DECIMAL(8,6),
    method VARCHAR(50),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_analyses_propeller
        FOREIGN KEY (propeller_id)
        REFERENCES propellers(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_density CHECK (density > 0),
    CONSTRAINT chk_viscosity CHECK (viscosity > 0),
    CONSTRAINT chk_after_rps CHECK (after_rps > 0),
    CONSTRAINT chk_forward_rps CHECK (forward_rps > 0),
    CONSTRAINT chk_j_coefficient CHECK (j_coefficient >= 0)
);

-- 해석 결과 파일
CREATE TABLE analysis_files (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL,
    file_type analysis_file_type NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_analysis_files_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES performance_analyses(id)
        ON DELETE CASCADE
);

-- 해석 케이스
CREATE TABLE analysis_cases (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL,
    case_name VARCHAR(100) NOT NULL,
    base_prism INTEGER,
    base_thickness DECIMAL(6,4),
    surface_prism INTEGER,
    surface_thickness DECIMAL(6,4),
    turbulent_model VARCHAR(30),
    viscosity DECIMAL(12,8),
    solver_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_cases_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES performance_analyses(id)
        ON DELETE CASCADE
);

-- EFD vs CFD 비교
CREATE TABLE efd_cfd_comparisons (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL,
    j_value DECIMAL(6,4) NOT NULL,

    -- EFD (실험) 데이터
    efd_kt DECIMAL(8,6),
    efd_kq_10 DECIMAL(8,6),
    efd_eta DECIMAL(8,6),

    -- CFD (해석) 데이터
    cfd_kt DECIMAL(8,6),
    cfd_kq_10 DECIMAL(8,6),
    cfd_eta DECIMAL(8,6),

    -- 차이율 (%)
    kt_diff_percent DECIMAL(8,4),
    kq_diff_percent DECIMAL(8,4),
    eta_diff_percent DECIMAL(8,4),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_comparisons_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES performance_analyses(id)
        ON DELETE CASCADE
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_propeller_files_pid ON propeller_files(propeller_id);
CREATE INDEX idx_propeller_files_type ON propeller_files(file_type);
CREATE INDEX idx_analyses_pid ON performance_analyses(propeller_id);
CREATE INDEX idx_analyses_j ON performance_analyses(j_coefficient);
CREATE INDEX idx_analysis_files_aid ON analysis_files(analysis_id);
CREATE INDEX idx_cases_aid ON analysis_cases(analysis_id);
CREATE INDEX idx_comparisons_aid ON efd_cfd_comparisons(analysis_id);

-- ============================================
-- Triggers
-- ============================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- propellers 테이블 트리거
CREATE TRIGGER trg_propellers_updated_at
    BEFORE UPDATE ON propellers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views
-- ============================================

-- 프로펠러 전체 현황 뷰
CREATE VIEW v_propeller_summary AS
SELECT
    p.id,
    p.name,
    p.blade_count,
    p.section_type,
    p.rotation_direction,
    p.power_ratio,
    p.scale_ratio,
    COUNT(DISTINCT pf.id) AS file_count,
    COUNT(DISTINCT pa.id) AS analysis_count,
    p.created_at,
    p.updated_at
FROM propellers p
LEFT JOIN propeller_files pf ON p.id = pf.propeller_id
LEFT JOIN performance_analyses pa ON p.id = pa.propeller_id
GROUP BY p.id;

-- 성능해석 상세 뷰
CREATE VIEW v_analysis_detail AS
SELECT
    pa.id,
    p.name AS propeller_name,
    pa.density,
    pa.viscosity,
    pa.after_rps,
    pa.forward_rps,
    pa.rps_ratio,
    pa.reynolds_number,
    pa.j_coefficient,
    pa.velocity,
    pa.thrust,
    pa.torque,
    pa.kt,
    pa.kq_10,
    pa.efficiency,
    pa.method,
    COUNT(DISTINCT af.id) AS result_file_count,
    COUNT(DISTINCT ac.id) AS case_count,
    pa.created_at
FROM performance_analyses pa
JOIN propellers p ON pa.propeller_id = p.id
LEFT JOIN analysis_files af ON pa.id = af.analysis_id
LEFT JOIN analysis_cases ac ON pa.id = ac.analysis_id
GROUP BY pa.id, p.name;

-- EFD vs CFD 비교 뷰
CREATE VIEW v_efd_cfd_comparison AS
SELECT
    c.id,
    p.name AS propeller_name,
    c.j_value,
    c.efd_kt,
    c.cfd_kt,
    c.kt_diff_percent,
    c.efd_kq_10,
    c.cfd_kq_10,
    c.kq_diff_percent,
    c.efd_eta,
    c.cfd_eta,
    c.eta_diff_percent
FROM efd_cfd_comparisons c
JOIN performance_analyses pa ON c.analysis_id = pa.id
JOIN propellers p ON pa.propeller_id = p.id
ORDER BY p.name, c.j_value;
