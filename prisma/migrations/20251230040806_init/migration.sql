-- CreateEnum
CREATE TYPE "RotationDirection" AS ENUM ('RIGHT', 'LEFT');

-- CreateEnum
CREATE TYPE "PropellerFileType" AS ENUM ('OFFSET', 'SECTION', 'IMAGE_TOP', 'IMAGE_FRONT', 'IMAGE_SIDE', 'DRAWING', 'GEOMETRY_DATA', 'GEOMETRY_INFO', 'CAD_IGS', 'CAD_STL', 'CAD_STP');

-- CreateEnum
CREATE TYPE "AnalysisFileType" AS ENUM ('PRESSURE', 'WAKE', 'GRAPH_TURBULENT', 'GRAPH_FORCE');

-- CreateTable
CREATE TABLE "propellers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "blade_count" INTEGER NOT NULL,
    "section_type" VARCHAR(50) NOT NULL,
    "has_section_file" BOOLEAN NOT NULL DEFAULT false,
    "rotation_direction" "RotationDirection" NOT NULL,
    "power_ratio" VARCHAR(10) NOT NULL,
    "scale_ratio" DECIMAL(10,4) NOT NULL,
    "has_offset_file" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propeller_files" (
    "id" SERIAL NOT NULL,
    "propeller_id" INTEGER NOT NULL,
    "file_type" "PropellerFileType" NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_size" BIGINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propeller_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_analyses" (
    "id" SERIAL NOT NULL,
    "propeller_id" INTEGER NOT NULL,
    "density" DECIMAL(12,6) NOT NULL,
    "viscosity" DECIMAL(12,8) NOT NULL,
    "after_rps" DECIMAL(10,4) NOT NULL,
    "forward_rps" DECIMAL(10,4) NOT NULL,
    "rps_ratio" DECIMAL(6,4),
    "reynolds_number" DECIMAL(15,8),
    "j_coefficient" DECIMAL(6,4) NOT NULL,
    "velocity" DECIMAL(12,6),
    "thrust" DECIMAL(12,4),
    "torque" DECIMAL(12,4),
    "kt" DECIMAL(8,6),
    "kq_10" DECIMAL(8,6),
    "efficiency" DECIMAL(8,6),
    "method" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_files" (
    "id" SERIAL NOT NULL,
    "analysis_id" INTEGER NOT NULL,
    "file_type" "AnalysisFileType" NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_size" BIGINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_cases" (
    "id" SERIAL NOT NULL,
    "analysis_id" INTEGER NOT NULL,
    "case_name" VARCHAR(100) NOT NULL,
    "base_prism" INTEGER,
    "base_thickness" DECIMAL(6,4),
    "surface_prism" INTEGER,
    "surface_thickness" DECIMAL(6,4),
    "turbulent_model" VARCHAR(30),
    "viscosity" DECIMAL(12,8),
    "solver_version" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "efd_cfd_comparisons" (
    "id" SERIAL NOT NULL,
    "analysis_id" INTEGER NOT NULL,
    "j_value" DECIMAL(6,4) NOT NULL,
    "efd_kt" DECIMAL(8,6),
    "efd_kq_10" DECIMAL(8,6),
    "efd_eta" DECIMAL(8,6),
    "cfd_kt" DECIMAL(8,6),
    "cfd_kq_10" DECIMAL(8,6),
    "cfd_eta" DECIMAL(8,6),
    "kt_diff_percent" DECIMAL(8,4),
    "kq_diff_percent" DECIMAL(8,4),
    "eta_diff_percent" DECIMAL(8,4),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "efd_cfd_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "propellers_name_key" ON "propellers"("name");

-- CreateIndex
CREATE INDEX "propeller_files_propeller_id_idx" ON "propeller_files"("propeller_id");

-- CreateIndex
CREATE INDEX "propeller_files_file_type_idx" ON "propeller_files"("file_type");

-- CreateIndex
CREATE INDEX "performance_analyses_propeller_id_idx" ON "performance_analyses"("propeller_id");

-- CreateIndex
CREATE INDEX "performance_analyses_j_coefficient_idx" ON "performance_analyses"("j_coefficient");

-- CreateIndex
CREATE INDEX "analysis_files_analysis_id_idx" ON "analysis_files"("analysis_id");

-- CreateIndex
CREATE INDEX "analysis_cases_analysis_id_idx" ON "analysis_cases"("analysis_id");

-- CreateIndex
CREATE INDEX "efd_cfd_comparisons_analysis_id_idx" ON "efd_cfd_comparisons"("analysis_id");

-- AddForeignKey
ALTER TABLE "propeller_files" ADD CONSTRAINT "propeller_files_propeller_id_fkey" FOREIGN KEY ("propeller_id") REFERENCES "propellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_analyses" ADD CONSTRAINT "performance_analyses_propeller_id_fkey" FOREIGN KEY ("propeller_id") REFERENCES "propellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_files" ADD CONSTRAINT "analysis_files_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "performance_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_cases" ADD CONSTRAINT "analysis_cases_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "performance_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "efd_cfd_comparisons" ADD CONSTRAINT "efd_cfd_comparisons_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "performance_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
