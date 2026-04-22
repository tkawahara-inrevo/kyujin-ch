import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const corporateNumber = (url.searchParams.get("number") || "").replace(/[^\d]/g, "");
  if (!/^\d{13}$/.test(corporateNumber)) {
    return NextResponse.json({ message: "法人番号は13桁の数字で入力してください" }, { status: 400 });
  }

  const applicationId = process.env.NTA_CORPORATE_NUMBER_API_APP_ID;
  if (!applicationId) {
    return NextResponse.json(
      {
        message:
          "法人番号の存在確認には、国税庁 法人番号公表サイトのWeb-API用アプリケーションID設定が必要です",
      },
      { status: 503 }
    );
  }

  const apiUrl = new URL("https://api.houjin-bangou.nta.go.jp/4/num");
  apiUrl.searchParams.set("id", applicationId);
  apiUrl.searchParams.set("number", corporateNumber);
  apiUrl.searchParams.set("type", "01");
  apiUrl.searchParams.set("history", "0");

  const response = await fetch(apiUrl, { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json(
      { message: "法人番号の照会に失敗しました。時間をおいて再度お試しください" },
      { status: 502 }
    );
  }

  const xml = await response.text();
  const corporationBlock = xml.match(/<corporation>([\s\S]*?)<\/corporation>/)?.[1];
  const name = corporationBlock?.match(/<name>([\s\S]*?)<\/name>/)?.[1];
  const foundNumber = corporationBlock?.match(/<corporateNumber>(\d{13})<\/corporateNumber>/)?.[1];

  if (!corporationBlock || !name || !foundNumber) {
    return NextResponse.json({ message: "該当する法人番号が見つかりませんでした" }, { status: 404 });
  }

  return NextResponse.json({
    corporateNumber: foundNumber,
    companyName: decodeXml(name).trim(),
  });
}
