import Link from "next/link";

export const metadata = {
  title: "お申込みに関する注意事項 | 求人ちゃんねる",
};

export default function ApplicationNotesPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-[24px] font-bold text-gray-900">
          求人ちゃんねるお申込みに関する注意事項
        </h1>

        <div className="space-y-8 text-[14px] leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-3 font-bold text-gray-900">無効化基準</h2>
            <p className="mb-4">下記条件に該当する場合は、無効対象（課金対象外）とすることができます。</p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <tbody>
                  <tr className="border border-[#e5e5e5]">
                    <th className="w-[180px] shrink-0 border-r border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-left align-top font-semibold text-[#333]">
                      明らかに虚偽の氏名
                    </th>
                    <td className="px-4 py-3 align-top">
                      <p>実在性がない場合は連絡・本人特定ができないため無効と判断されます。</p>
                      <p className="mt-1">例）</p>
                      <ul className="mt-1 list-disc pl-5 space-y-0.5">
                        <li>「ああああ」「テスト」「名無し」など意味のない文字列</li>
                        <li>記号や数字だけ（例：12345、@@@）</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border border-t-0 border-[#e5e5e5]">
                    <th className="border-r border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-left align-top font-semibold text-[#333]">
                      明らかに虚偽の電話番号
                    </th>
                    <td className="px-4 py-3 align-top">
                      <p>形式的に成立していない場合は無効とされます。</p>
                      <p className="mt-1">例）</p>
                      <ul className="mt-1 list-disc pl-5 space-y-0.5">
                        <li>桁数が不正</li>
                        <li>0000000000、1234567890 など不自然な並び</li>
                        <li>記号や文字が混在（例：090-xxxx-aaaa）</li>
                        <li>実在しない市外局番・携帯番号帯</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border border-t-0 border-[#e5e5e5]">
                    <th className="border-r border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-left align-top font-semibold text-[#333]">
                      明らかに虚偽のメールアドレス
                    </th>
                    <td className="px-4 py-3 align-top">
                      <p>メール送信ができない、または本人に届かない場合は連絡手段として成立しないため無効となります。</p>
                      <p className="mt-1">例）</p>
                      <ul className="mt-1 list-disc pl-5 space-y-0.5">
                        <li>「@」がない（例：testmail.com）</li>
                        <li>ドメインが存在しない（例：abc@xyz.zzz）</li>
                        <li>明らかなダミー（例：test@test.com、aaa@aaa.com）</li>
                        <li>記号の使い方が不正（例：@@や連続ドット）</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border border-t-0 border-[#e5e5e5]">
                    <th className="border-r border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-left align-top font-semibold text-[#333]">
                      自社従業員
                    </th>
                    <td className="px-4 py-3 align-top">
                      <p>自社従業員は無効対象となります。</p>
                      <ul className="mt-1 list-disc pl-5 space-y-0.5">
                        <li>正社員・契約社員・アルバイトなど雇用関係がある</li>
                        <li>グループ会社ルールにより内部応募扱いになるケース</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border border-t-0 border-[#e5e5e5]">
                    <th className="border-r border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-left align-top font-semibold text-[#333]">
                      求職者の重複（同月の応募）
                    </th>
                    <td className="px-4 py-3 align-top">
                      同一人物と判断された場合には無効化対象となります。
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-bold text-gray-900">料金表</h2>
            <p>
              料金表は{" "}
              <Link href="/price" className="text-[#2f6cff] underline hover:opacity-80">
                こちら
              </Link>
              {" "}から確認することが可能です。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
