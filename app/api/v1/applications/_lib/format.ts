/**
 * Application → モバイルAPI 変換
 */
import type { Application, Job, Company } from "@prisma/client";
import { toJobSummary } from "../../jobs/_lib/format";

type WithJob = Application & {
  job: Job & { company: Pick<Company, "id" | "name" | "description" | "websiteUrl"> };
};

export function toApplication(app: WithJob) {
  return {
    id: app.id,
    jobId: app.jobId,
    job: toJobSummary(app.job),
    motivation: app.motivation,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
  };
}
