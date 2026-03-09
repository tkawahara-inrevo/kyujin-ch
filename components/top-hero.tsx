export function TopHero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-6 pt-1">
        <div className="grid grid-cols-2">
          <button className="rounded-t-[16px] border-[2px] border-b-0 border-[#3b6ff6] bg-white py-4 text-[14px] font-bold text-[#3b6ff6]">
            就職最新情報
          </button>
          <button className="rounded-t-[16px] border-[2px] border-b-0 border-[#ff5a78] bg-white py-4 text-[14px] font-bold text-[#ff5a78]">
            求人を探す
          </button>
        </div>
      </div>

      <div className="bg-[#efefef]">
        <div className="mx-auto flex h-[260px] max-w-[1280px] items-center justify-center px-6">
          <div className="text-center">
            <button className="rounded-md bg-white px-10 py-4 text-[18px] font-bold text-[#333] shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              まずは会員登録
            </button>
            <p className="mt-4 text-[11px] text-[#666] underline underline-offset-2">
              ログインはこちら
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}