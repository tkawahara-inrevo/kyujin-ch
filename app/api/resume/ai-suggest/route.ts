import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const client = new Anthropic();

const SECTION_PROMPTS: Record<string, string> = {
  pr_text: `あなたは就職・転職活動のプロフェッショナルなキャリアアドバイザーです。
以下の情報をもとに、履歴書の「自己PR・特技・アピールポイント」欄の文章を作成または添削してください。

【要件】
- 200〜400字程度
- 具体的なエピソードを含める
- 採用担当者が読みやすい自然な日本語
- 自己PRとして効果的な構成（強み→根拠→貢献意欲）

【現在の入力】
{current_text}

【経歴情報】
{context}

改善した文章のみを返してください（説明や前置きは不要）。`,

  work_description: `あなたは就職・転職活動のプロフェッショナルなキャリアアドバイザーです。
職務経歴書の業務内容欄を改善してください。

【要件】
- 箇条書きで3〜5項目
- 具体的な数字・規模感を含める
- 成果・実績を明記する
- 採用担当者に伝わりやすい表現

【会社名・役職】
{company_info}

【現在の入力】
{current_text}

改善した文章のみを返してください（箇条書き形式で）。`,

  job_preference: `以下の情報をもとに、履歴書の「本人希望欄」の文章を作成してください。
簡潔かつ丁寧に、希望条件を1〜3文でまとめてください。

【入力情報】
{current_text}

文章のみを返してください。`,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { section, currentText, context } = await req.json();

  const promptTemplate = SECTION_PROMPTS[section];
  if (!promptTemplate) {
    return new Response("Invalid section", { status: 400 });
  }

  const prompt = promptTemplate
    .replace("{current_text}", currentText || "（未入力）")
    .replace("{context}", context || "")
    .replace("{company_info}", context || "");

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
