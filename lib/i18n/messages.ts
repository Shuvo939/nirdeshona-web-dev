import type { Locale } from "./config";

/**
 * Bangla versions of the English messages that server actions and API
 * routes return (validation errors, auth errors, upload errors). Forms pass
 * whatever the server sent through `tm()`, so the server code can keep a
 * single English source of truth. Unknown messages are shown unchanged.
 */
const BN: Record<string, string> = {
  // generic
  "Invalid request.": "অনুরোধটি সঠিক নয়।",
  "Please sign in.": "অনুগ্রহ করে লগ ইন করুন।",
  "Please sign in again.": "অনুগ্রহ করে আবার লগ ইন করুন।",
  Unauthorized: "অনুমতি নেই।",
  "Something went wrong. Please try again.": "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",

  // auth
  "Enter a valid email address": "সঠিক ইমেইল ঠিকানা লিখুন",
  "Enter your password": "পাসওয়ার্ড লিখুন",
  "Please enter your full name": "আপনার পুরো নাম লিখুন",
  "Password must be at least 8 characters long": "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
  "Password must be at least 8 characters long.": "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
  "Incorrect email or password.": "ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
  "Please confirm your email address first — check your inbox.": "আগে আপনার ইমেইল ঠিকানা নিশ্চিত করুন — ইনবক্স দেখুন।",
  "An account with this email already exists. Try logging in.": "এই ইমেইলে আগেই একটি অ্যাকাউন্ট আছে। লগ ইন করে দেখুন।",
  "Too many attempts. Please wait a minute and try again.": "অনেকবার চেষ্টা করা হয়েছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।",
  "New password should be different from the old password.": "নতুন পাসওয়ার্ড পুরোনোটির চেয়ে আলাদা হতে হবে।",

  // profile
  "Enter your full name": "আপনার পুরো নাম লিখুন",
  "Name is too long": "নামটি অনেক বড়",
  "Phone number is too long": "ফোন নম্বরটি অনেক বড়",
  "Use digits, spaces and + only": "শুধু সংখ্যা, স্পেস ও + ব্যবহার করুন",
  "Organisation name is too long": "প্রতিষ্ঠানের নামটি অনেক বড়",
  "Keep your bio under 500 characters": "পরিচিতি ৫০০ অক্ষরের মধ্যে রাখুন",
  "File storage is not configured yet.": "ফাইল স্টোরেজ এখনো চালু করা হয়নি।",
  "No file uploaded.": "কোনো ফাইল আপলোড হয়নি।",
  "Please upload a JPG, PNG, WebP or GIF image.": "JPG, PNG, WebP বা GIF ছবি আপলোড করুন।",
  "Image must be smaller than 5 MB.": "ছবি ৫ MB-এর ছোট হতে হবে।",
  "That image couldn't be processed.": "ছবিটি প্রসেস করা যায়নি।",

  // tickets
  "Choose an organisation": "একটি প্রতিষ্ঠান বেছে নিন",
  "Subject must be at least 4 characters": "বিষয় কমপক্ষে ৪ অক্ষরের হতে হবে",
  "Subject is too long": "বিষয়টি অনেক বড়",
  "Please describe the issue in a little more detail": "সমস্যাটি আরেকটু বিস্তারিত লিখুন",
  "Message is too long": "বার্তাটি অনেক বড়",
  "Write a message first": "আগে একটি বার্তা লিখুন",
  "You don't have access to that organisation.": "ওই প্রতিষ্ঠানে আপনার প্রবেশাধিকার নেই।",
  "That project doesn't belong to this organisation.": "এই প্রজেক্টটি এই প্রতিষ্ঠানের নয়।",
  "You've opened several tickets recently. Please wait a little before opening another.":
    "সম্প্রতি আপনি কয়েকটি টিকেট খুলেছেন। নতুন টিকেট খোলার আগে একটু অপেক্ষা করুন।",
  "Ticket not found.": "টিকেট পাওয়া যায়নি।",
  "This ticket is closed. Reopen it to reply.": "এই টিকেটটি বন্ধ। উত্তর দিতে আবার খুলুন।",
  "This ticket is closed.": "এই টিকেটটি বন্ধ।",
  "This file type isn't allowed.": "এই ধরনের ফাইল অনুমোদিত নয়।",
  "Files must be 10 MB or smaller.": "ফাইল ১০ MB বা তার ছোট হতে হবে।",
  "File uploads aren't configured yet.": "ফাইল আপলোড এখনো চালু করা হয়নি।",
  "Invalid file.": "ফাইলটি সঠিক নয়।",
  "Attachments couldn't be read. Please re-attach the files.": "সংযুক্তিগুলো পড়া যায়নি। ফাইলগুলো আবার যুক্ত করুন।",
  "Invalid attachments.": "সংযুক্তিগুলো সঠিক নয়।",
  "Invalid attachment.": "সংযুক্তিটি সঠিক নয়।",
  "Upload failed.": "আপলোড ব্যর্থ হয়েছে।",
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Attach at most (\d+) files\.$/, (m) => `সর্বোচ্চ ${toBnDigits(m[1])}টি ফাইল যুক্ত করা যাবে।`],
];

export function toBnDigits(value: string) {
  return value.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

export function translateMessage<T extends string | null | undefined>(locale: Locale, message: T): T {
  if (!message || locale !== "bn") return message;
  const direct = BN[message];
  if (direct) return direct as T;
  for (const [re, fn] of PATTERNS) {
    const m = message.match(re);
    if (m) return fn(m) as T;
  }
  return message;
}

export function translateFieldErrors(locale: Locale, errors: Record<string, string> | undefined) {
  if (!errors || locale !== "bn") return errors;
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, translateMessage(locale, v)]));
}
