import Image from "next/image";

const categories = [
  { label: "エンジニア", icon: "/assets/Engineer.png" },
  { label: "デザイナー", icon: "/assets/Design.png" },
  { label: "セールス", icon: "/assets/Bag.png" },
  { label: "マーケター", icon: "/assets/Graph.png" },
  { label: "事務・管理", icon: "/assets/List.png" },
  { label: "そのほか", icon: "/assets/Talk_01.png" },
  { label: "エンジニア", icon: "/assets/Engineer.png" },
  { label: "エンジニア", icon: "/assets/Engineer.png" },
];

export function CategoryStrip() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <div className="flex items-center gap-5 overflow-x-auto">
          <button className="shrink-0 text-[#c9c9c9] text-xl">‹</button>

          {categories.map((category, index) => (
            <div
              key={`${category.label}-${index}`}
              className="flex min-w-[86px] flex-col items-center gap-2"
            >
              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[14px] bg-white">
                <Image
                  src={category.icon}
                  alt={category.label}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-[13px] font-semibold text-[#444] whitespace-nowrap">
                {category.label}
              </span>
            </div>
          ))}

          <button className="shrink-0 text-[#c9c9c9] text-xl">›</button>
        </div>
      </div>
    </section>
  );
}