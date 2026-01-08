-- AlterTable
ALTER TABLE "efd_cfd_comparisons" ADD COLUMN     "cfd_thrust" DECIMAL(12,4),
ADD COLUMN     "cfd_torque" DECIMAL(12,4),
ADD COLUMN     "vin" DECIMAL(10,4);
