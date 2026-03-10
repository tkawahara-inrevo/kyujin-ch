import Image from "next/image";
import Link from "next/link";

type InteractionTabsProps = {
  current?: "applications" | "favorites" | "messages";
};

const items = [
  {
    key: "applications",
    label: "応募済み",
    href: "/applications",
    icon: "/assets/Checkbox_Check.png",
  },
  {
    key: "favorites",
    label: "気になる",
    href: "/favorites",
    icon: "/assets/Bookmark.png",
  },
  {
    key: "messages",
    label: "メッセージ",
    href: "/messages",
    icon: "/assets/Chat_Circle.png",
  },
] as const;

export function InteractionTabs({
  current = "applications",
}: InteractionTabsProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-8">
      {items.map((item) => {
        const isActive = item.key === current;

        return (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-center gap-3 text-[14px] font-semibold text-[#333]"
          >
            <Image
              src={item.icon}
              alt=""
              width={20}
              height={20}
              className={isActive ? "opacity-100" : "opacity-90"}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}