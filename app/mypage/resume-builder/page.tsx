import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ResumeWizard } from "./resume-wizard";

export default async function ResumeBuilderPage() {
  const user = await getCurrentUser();

  const [educations, workExperiences, certifications, resumeProfile] = await Promise.all([
    prisma.education.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.workExperience.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.certification.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.resumeProfile.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16">
      <Header />
      <div className="mx-auto max-w-[800px] px-4 py-8 md:px-6">
        <ResumeWizard
          user={{
            lastName: user.lastName ?? "",
            firstName: user.firstName ?? "",
            lastNameKana: user.lastNameKana ?? "",
            firstNameKana: user.firstNameKana ?? "",
            birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "",
            gender: user.gender ?? "",
            email: user.email,
            phone: user.phone ?? "",
            postalCode: user.postalCode ?? "",
            prefecture: user.prefecture ?? "",
            cityTown: user.cityTown ?? "",
            addressLine: user.addressLine ?? "",
          }}
          savedEducations={educations.map((e) => ({
            id: e.id,
            schoolType: e.schoolType,
            schoolName: e.schoolName,
            faculty: e.faculty ?? "",
            status: e.status,
            year: e.year,
            month: e.month,
            sortOrder: e.sortOrder,
          }))}
          savedWorkExperiences={workExperiences.map((w) => ({
            id: w.id,
            companyName: w.companyName,
            department: w.department ?? "",
            jobType: w.jobType ?? "",
            startYear: w.startYear,
            startMonth: w.startMonth,
            endYear: w.endYear,
            endMonth: w.endMonth,
            isCurrent: w.isCurrent,
            description: w.description ?? "",
            sortOrder: w.sortOrder,
          }))}
          savedCertifications={certifications.map((c) => ({
            id: c.id,
            name: c.name,
            year: c.year,
            month: c.month,
            sortOrder: c.sortOrder,
          }))}
          savedPrText={resumeProfile?.prText ?? ""}
          savedJobPreference={resumeProfile?.jobPreference ?? ""}
        />
      </div>
      <Footer />
    </main>
  );
}
