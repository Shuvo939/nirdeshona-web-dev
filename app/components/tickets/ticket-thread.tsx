import { ShieldCheck } from "lucide-react";

import { formatDate } from "@/app/components/marketing";
import type { TicketMessage } from "@/lib/tickets";

function initials(name: string | null) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export default function TicketThread({ messages, viewerId }: { messages: TicketMessage[]; viewerId: string }) {
  return (
    <ol className="flex flex-col gap-4">
      {messages.map((m) => {
        const mine = m.sender_id === viewerId;
        const staff = m.role === "ADMIN";
        return (
          <li key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
              {m.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(m.full_name)
              )}
            </div>
            <div className={`flex min-w-0 max-w-[85%] flex-col ${mine ? "items-end" : "items-start"}`}>
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="font-medium text-neutral-800">{mine ? "You" : m.full_name || "User"}</span>
                {staff && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-white">
                    <ShieldCheck className="h-3 w-3" /> Nirdeshona team
                  </span>
                )}
                <time dateTime={new Date(m.created_at).toISOString()}>{formatDate(m.created_at, true)}</time>
              </div>
              <div
                className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                  mine ? "rounded-tr-md bg-neutral-950 text-white" : "rounded-tl-md border border-neutral-200 bg-white text-neutral-800"
                }`}
              >
                {m.message}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
