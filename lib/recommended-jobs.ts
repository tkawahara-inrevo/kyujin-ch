import { PREFECTURES_BY_AREA } from "@/lib/job-locations";

type RecommendedJobBase = {
  id: string;
  categoryTag: string | null;
  targetType: string;
  graduationYear: number | null;
  region: string | null;
  location: string | null;
  tags: string[];
  createdAt: Date;
};

const ALL_PREFECTURES = Array.from(
  new Set(Object.values(PREFECTURES_BY_AREA).flat()),
);

function extractPrefecture(location?: string | null): string | null {
  if (!location) return null;
  return ALL_PREFECTURES.find((prefecture) => location.includes(prefecture)) ?? null;
}

function getRecommendationScore(
  currentJob: RecommendedJobBase,
  candidate: RecommendedJobBase,
): number {
  let score = 0;

  if (
    currentJob.categoryTag &&
    candidate.categoryTag &&
    currentJob.categoryTag === candidate.categoryTag
  ) {
    score += 4;
  }

  if (currentJob.targetType === candidate.targetType) {
    score += 3;

    if (
      currentJob.targetType === "NEW_GRAD" &&
      currentJob.graduationYear &&
      candidate.graduationYear === currentJob.graduationYear
    ) {
      score += 1;
    }
  }

  if (currentJob.region && candidate.region && currentJob.region === candidate.region) {
    score += 2;
  }

  const currentPrefecture = extractPrefecture(currentJob.location);
  const candidatePrefecture = extractPrefecture(candidate.location);
  if (
    currentPrefecture &&
    candidatePrefecture &&
    currentPrefecture === candidatePrefecture
  ) {
    score += 2;
  }

  const sharedTags = candidate.tags.filter((tag) => currentJob.tags.includes(tag)).length;
  score += Math.min(sharedTags, 2);

  return score;
}

export function rankRecommendedJobs<T extends RecommendedJobBase & { companyId?: string; company?: { id?: string } }>(
  currentJob: RecommendedJobBase,
  candidates: T[],
  limit = 3,
): T[] {
  const sorted = [...candidates].sort((a, b) => {
    const scoreDiff = getRecommendationScore(currentJob, b) - getRecommendationScore(currentJob, a);
    if (scoreDiff !== 0) return scoreDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // 同一会社は1件のみ
  const seenCompanies = new Set<string>();
  const result: T[] = [];
  for (const candidate of sorted) {
    const cid = candidate.companyId ?? candidate.company?.id;
    if (cid) {
      if (seenCompanies.has(cid)) continue;
      seenCompanies.add(cid);
    }
    result.push(candidate);
    if (result.length >= limit) break;
  }
  return result;
}
