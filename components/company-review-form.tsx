export function CompanyReviewForm() {
  return (
    <section className="mt-6 rounded-[18px] bg-[#f4f4f4] p-5">
      <div>
        <label className="block text-[13px] font-bold text-[#333]">評価</label>
        <select className="mt-2 h-[34px] rounded-[6px] border border-[#cfcfcf] bg-white px-3 text-[13px] outline-none">
          <option>★★★★★</option>
          <option>★★★★☆</option>
          <option>★★★☆☆</option>
          <option>★★☆☆☆</option>
          <option>★☆☆☆☆</option>
        </select>
      </div>

      <div className="mt-4">
        <input
          className="h-[42px] w-full rounded-[6px] border border-[#cfcfcf] bg-white px-4 text-[13px] outline-none"
          placeholder="タイトル"
        />
      </div>

      <div className="mt-3 flex gap-3">
        <textarea
          className="min-h-[90px] flex-1 rounded-[6px] border border-[#cfcfcf] bg-white px-4 py-3 text-[13px] outline-none"
          placeholder="本文"
        />
        <button className="h-[90px] min-w-[86px] rounded-[10px] bg-[#a3a3a3] px-4 text-[14px] font-bold text-white">
          送信
        </button>
      </div>
    </section>
  );
}