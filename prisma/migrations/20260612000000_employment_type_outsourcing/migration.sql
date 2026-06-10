-- 業務委託を雇用形態に追加
ALTER TYPE "EmploymentType" ADD VALUE IF NOT EXISTS 'OUTSOURCING';
