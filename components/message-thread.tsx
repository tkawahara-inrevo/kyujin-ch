import { MessageBubble } from "@/components/message-bubble";

const messages = [
  {
    id: 1,
    text: "ご応募ありがとうございます！",
    timestamp: "2026/1/30 21:26:53",
    mine: false,
  },
  {
    id: 2,
    text: "ご応募ありがとうございます！",
    timestamp: "2026/1/30 21:26:53",
    mine: true,
  },
  {
    id: 3,
    text: "ご応募ありがとうございます！",
    timestamp: "2026/1/30 21:26:53",
    mine: false,
  },
  {
    id: 4,
    text: "ご応募ありがとうございます！",
    timestamp: "2026/1/30 21:26:53",
    mine: false,
  },
  {
    id: 5,
    text: "ご応募ありがとうございます！",
    timestamp: "2026/1/30 21:26:53",
    mine: true,
  },
];

export function MessageThread() {
  return (
    <section className="rounded-[18px] border border-[#d7d7d7] bg-white p-4">
      <div className="rounded-[16px] bg-[#f5f5f5] p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              text={message.text}
              timestamp={message.timestamp}
              mine={message.mine}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <input
          className="h-[64px] flex-1 rounded-[14px] border border-[#cfcfcf] bg-white px-5 text-[18px] outline-none"
          placeholder="メッセージを書く..."
        />
        <button className="h-[64px] min-w-[110px] rounded-[14px] bg-[#a5a5a5] px-6 text-[16px] font-bold text-white">
          送信
        </button>
      </div>
    </section>
  );
}