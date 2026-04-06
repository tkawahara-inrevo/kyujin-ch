export type CompanyProfileStatus = {
  isComplete: boolean;
  missingFields: string[];
};

export function checkCompanyProfileComplete(company: {
  name: string | null;
  businessDescription?: string | null;
  prefecture?: string | null;
  location?: string | null;
}): CompanyProfileStatus {
  const missingFields: string[] = [];

  if (!company.name?.trim()) missingFields.push("会社名");
  if (!company.businessDescription?.trim()) missingFields.push("事業内容");
  if (!company.prefecture?.trim() && !company.location?.trim()) missingFields.push("所在地");

  return { isComplete: missingFields.length === 0, missingFields };
}
