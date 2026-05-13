import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { ResumePDF } from "@/lib/resume/pdf-resume";
import { CareerPDF } from "@/lib/resume/pdf-career";
import { generateResumeXlsx } from "@/lib/resume/xlsx-resume";
import { generateCareerXlsx } from "@/lib/resume/xlsx-career";
import type { ResumeData } from "@/lib/resume/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { data, docType, format } = body as {
    data: ResumeData;
    docType: "resume" | "career";
    format: "pdf" | "xlsx";
  };

  try {
    if (format === "pdf") {
      const element = docType === "resume"
        ? React.createElement(ResumePDF, { data })
        : React.createElement(CareerPDF, { data });
      const pdfBuffer = await renderToBuffer(element as React.ReactElement<DocumentProps>);

      const filename = docType === "resume" ? "履歴書.pdf" : "職務経歴書.pdf";
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    if (format === "xlsx") {
      const xlsxBuffer = docType === "resume"
        ? await generateResumeXlsx(data)
        : await generateCareerXlsx(data);

      const filename = docType === "resume" ? "履歴書.xlsx" : "職務経歴書.xlsx";
      return new NextResponse(new Uint8Array(xlsxBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (err) {
    console.error("Document generation error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
