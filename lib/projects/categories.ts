export const PROJECT_CATEGORIES = [
  "Web Development",
  "WordPress",
  "UI / UX Design",
  "E-commerce",
  "Mobile App",
  "Web Application",
  "Landing Page",
  "Portfolio",
  "Corporate Website",
  "Custom Software",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export const PROJECT_CATEGORIES_BN: Record<string, string> = {
  "Web Development": "ওয়েব ডেভেলপমেন্ট",
  WordPress: "ওয়ার্ডপ্রেস",
  "UI / UX Design": "ইউআই / ইউএক্স ডিজাইন",
  "E-commerce": "ই-কমার্স",
  "Mobile App": "মোবাইল অ্যাপ",
  "Web Application": "ওয়েব অ্যাপ্লিকেশন",
  "Landing Page": "ল্যান্ডিং পেজ",
  Portfolio: "পোর্টফোলিও",
  "Corporate Website": "প্রাতিষ্ঠানিক ওয়েবসাইট",
  "Custom Software": "কাস্টম সফটওয়্যার",
};

export function categoryLabel(category: string | null | undefined, locale: "bn" | "en") {
  if (!category) return "";
  return locale === "bn" ? PROJECT_CATEGORIES_BN[category] ?? category : category;
}
