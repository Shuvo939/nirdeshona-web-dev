"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Activity,
  Trash2,
  Bell,
  Building2,
  ClipboardList,
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  MessageSquareText,
  Newspaper,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

// Icons are referenced by name so server layouts can pass plain data.
const ICONS = {
  activity: Activity,
  trash: Trash2,
  bell: Bell,
  building: Building2,
  clipboard: ClipboardList,
  folder: FolderKanban,
  image: ImageIcon,
  dashboard: LayoutDashboard,
  lifebuoy: LifeBuoy,
  comment: MessageCircle,
  inbox: MessageSquareText,
  newspaper: Newspaper,
  settings: Settings,
  shield: ShieldCheck,
  user: UserRound,
  users: Users,
};

export type SideNavIcon = keyof typeof ICONS;
export type SideNavLink = { href: string; label: string; icon: SideNavIcon; badge?: number; exact?: boolean };
export type SideNavGroup = { label?: string; links: SideNavLink[] };

function isActive(pathname: string, link: SideNavLink) {
  if (link.exact) return pathname === link.href;
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export default function SideNav({ groups, mobile = false, label }: { groups: SideNavGroup[]; mobile?: boolean; label: string }) {
  const pathname = usePathname();
  const mobileRef = useRef<HTMLElement>(null);

  // Keep the active tab visible in the horizontally scrolling mobile bar.
  useEffect(() => {
    if (!mobile) return;
    const el = mobileRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const scroller = mobileRef.current?.parentElement;
    if (el && scroller) scroller.scrollTo({ left: el.offsetLeft - scroller.clientWidth / 2 + el.offsetWidth / 2, behavior: "auto" });
  }, [pathname, mobile]);

  if (mobile) {
    return (
      <nav ref={mobileRef} aria-label={label} className="flex min-w-max gap-1.5">
        {groups.flatMap((g) => g.links).map((link) => {
          const Icon = ICONS[link.icon];
          const active = isActive(pathname, link);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                active ? "bg-neutral-950 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:text-neutral-950"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
              {link.label}
              {!!link.badge && (
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-white/20" : "bg-red-500 text-white"}`}>{link.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label={label} className="flex flex-col gap-6">
      {groups.map((group, i) => (
        <div key={group.label ?? i}>
          {group.label && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{group.label}</p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const Icon = ICONS[link.icon];
              const active = isActive(pathname, link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-neutral-400 group-hover:text-neutral-700"}`} strokeWidth={1.8} />
                  <span className="min-w-0 flex-1 truncate">{link.label}</span>
                  {!!link.badge && (
                    <span
                      className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                        active ? "bg-white/20 text-white" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
