-- Seed: 20 bilingual blog posts (English + Bangla). Requires migration 0010.

-- Idempotent: existing slugs are left untouched.

begin;

insert into public.post_categories (name, slug, name_bn) values
  ($q$Business$q$, $q$business$q$, $q$ব্যবসা$q$),
  ($q$Design$q$, $q$design$q$, $q$ডিজাইন$q$),
  ($q$Development$q$, $q$development$q$, $q$ডেভেলপমেন্ট$q$),
  ($q$SEO & Marketing$q$, $q$seo$q$, $q$এসইও ও মার্কেটিং$q$),
  ($q$Security & Care$q$, $q$care$q$, $q$নিরাপত্তা ও রক্ষণাবেক্ষণ$q$)
on conflict (slug) do update set name_bn = coalesce(public.post_categories.name_bn, excluded.name_bn);

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$business$q$),
       $q$how-much-does-a-website-cost-in-bangladesh$q$, $q$How much does a website cost in Bangladesh?$q$, $q$বাংলাদেশে একটি ওয়েবসাইট বানাতে কত খরচ হয়?$q$, $q$A plain-language guide to what you actually pay for — design, development, domain, hosting and care — and how to compare quotes fairly.$q$, $q$ডিজাইন, ডেভেলপমেন্ট, ডোমেইন, হোস্টিং ও রক্ষণাবেক্ষণ — আসলে কীসের জন্য টাকা দিচ্ছেন, আর কোটেশন কীভাবে ন্যায্যভাবে তুলনা করবেন, সহজ ভাষায়।$q$,
       $q$"How much for a website?" is the first question almost every client asks us, and the honest answer is: it depends on what the site has to do. A five-page brochure site and an online shop with bKash checkout are different projects, even if both are called "a website".

## What you are really paying for

- **Planning and design.** Deciding what goes on each page, how visitors move through the site and how it looks on a phone.
- **Development.** Turning the design into working pages, forms, a blog, user accounts or payments.
- **Content.** Writing text, preparing photos, translating into Bangla or English.
- **Domain and hosting.** A yearly cost you pay as long as the site is online.
- **Care after launch.** Updates, backups, security fixes and small changes.

## Typical ranges

As a rough guide, a small business site with a handful of pages usually starts around **৳15,000**, while a larger business site with a blog, bilingual content and more custom sections often starts around **৳35,000**. Online payments, user accounts or a custom dashboard add to that. Our [pricing page](/pricing) has an estimator you can play with.

## How to compare quotes

1. Ask for a **written scope**: the list of pages and features included.
2. Check who **owns the code and the domain** after launch. It should be you.
3. Ask what happens **after launch** — is there support, and what does it cost?
4. Compare like with like. A cheap quote that skips mobile testing or backups is not cheaper in the long run.

## Our advice

Start with the smallest site that does the job well, launch it, and grow from there. A clear brief saves more money than any discount.$q$,
       $q$"একটা ওয়েবসাইট বানাতে কত লাগবে?" — প্রায় সব ক্লায়েন্টের প্রথম প্রশ্ন এটাই। সৎ উত্তর হলো: সাইটটিকে কী কাজ করতে হবে তার ওপর নির্ভর করে। পাঁচ পেজের একটি পরিচিতিমূলক সাইট আর বিকাশ পেমেন্টসহ একটি অনলাইন শপ — দুটোকেই "ওয়েবসাইট" বলা হলেও এরা সম্পূর্ণ আলাদা প্রজেক্ট।

## আসলে কীসের জন্য টাকা দিচ্ছেন

- **পরিকল্পনা ও ডিজাইন।** কোন পেজে কী থাকবে, ভিজিটর কীভাবে ঘুরবে, মোবাইলে দেখতে কেমন হবে।
- **ডেভেলপমেন্ট।** ডিজাইনকে কার্যকর পেজ, ফর্ম, ব্লগ, ইউজার অ্যাকাউন্ট বা পেমেন্টে রূপ দেওয়া।
- **কনটেন্ট।** লেখা তৈরি, ছবি প্রস্তুত করা, বাংলা বা ইংরেজিতে অনুবাদ।
- **ডোমেইন ও হোস্টিং।** সাইট অনলাইনে থাকা পর্যন্ত প্রতি বছরের খরচ।
- **লঞ্চের পরের যত্ন।** আপডেট, ব্যাকআপ, নিরাপত্তা ঠিক রাখা ও ছোটখাটো পরিবর্তন।

## সাধারণ খরচের ধারণা

মোটামুটি হিসাবে, কয়েক পেজের একটি ছোট ব্যবসার সাইট সাধারণত **৳১৫,০০০** থেকে শুরু হয়। ব্লগ, দ্বিভাষিক কনটেন্ট ও আরও কাস্টম অংশসহ বড় ব্যবসার সাইট প্রায়ই **৳৩৫,০০০** থেকে শুরু হয়। অনলাইন পেমেন্ট, ইউজার অ্যাকাউন্ট বা কাস্টম ড্যাশবোর্ড যোগ হলে খরচ বাড়ে। আমাদের [প্রাইসিং পেজে](/pricing) একটি হিসাবযন্ত্র আছে, চাইলে নিজেই হিসাব করে দেখতে পারেন।

## কোটেশন কীভাবে তুলনা করবেন

১. **লিখিত স্কোপ** চান: কোন কোন পেজ ও ফিচার থাকছে তার তালিকা।
২. লঞ্চের পর **কোড ও ডোমেইনের মালিক কে** — তা দেখে নিন। মালিক হওয়া উচিত আপনার।
৩. **লঞ্চের পর** কী হবে জিজ্ঞেস করুন — সাপোর্ট আছে কি না, খরচ কত।
৪. একই জিনিসের সঙ্গে একই জিনিস তুলনা করুন। মোবাইল টেস্টিং বা ব্যাকআপ বাদ দেওয়া সস্তা কোটেশন দীর্ঘমেয়াদে সস্তা নয়।

## আমাদের পরামর্শ

যে কাজ দরকার তা ভালোভাবে করে — এমন সবচেয়ে ছোট সাইট দিয়ে শুরু করুন, চালু করুন, তারপর ধীরে ধীরে বড় করুন। পরিষ্কার একটি ব্রিফ যেকোনো ছাড়ের চেয়ে বেশি টাকা বাঁচায়।$q$,
       $q$A plain-language guide to what you actually pay for — design, development, domain, hosting and care — and how to compare quotes fairly.$q$, $q$ডিজাইন, ডেভেলপমেন্ট, ডোমেইন, হোস্টিং ও রক্ষণাবেক্ষণ — আসলে কীসের জন্য টাকা দিচ্ছেন, আর কোটেশন কীভাবে ন্যায্যভাবে তুলনা করবেন, সহজ ভাষায়।$q$, 'published', now() - interval '77 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$development$q$),
       $q$wordpress-or-custom-website$q$, $q$WordPress or a custom-built website: which one do you need?$q$, $q$ওয়ার্ডপ্রেস নাকি কাস্টম ওয়েবসাইট: আপনার কোনটা দরকার?$q$, $q$Both are good choices for different jobs. Here is how we decide which one to recommend.$q$, $q$ভিন্ন ভিন্ন কাজের জন্য দুটোই ভালো। কোনটা সুপারিশ করব, আমরা কীভাবে সিদ্ধান্ত নিই তা এখানে।$q$,
       $q$We build both WordPress sites and custom web applications, so we have no reason to push one over the other. The right choice depends on who will edit the site and what it needs to do.

## When WordPress is the better fit

- Your team wants to **edit pages and publish news themselves** using a familiar dashboard.
- The site is mostly **content**: pages, posts, events, publications.
- You want a large choice of themes and plugins and a lower starting budget.

WordPress is mature and well understood. The trade-off is that plugins need regular updates, and a site overloaded with plugins can become slow.

## When a custom build is the better fit

- You need **features that don't exist as a plugin**: client portals, booking flows, dashboards, custom search.
- **Speed and security** matter a lot and you want only the code you need.
- You expect the product to **grow** and want full control over how it works.

We usually build custom sites with Next.js and a Postgres database. They load fast and scale well, but changes to the structure need a developer.

## A simple test

Ask yourself: *"Is this mainly a place to publish, or mainly a tool people use?"* Publishing usually points to WordPress. A tool usually points to a custom build.

If you're unsure, tell us what you want visitors to do on the site and we'll recommend one, with reasons.$q$,
       $q$আমরা ওয়ার্ডপ্রেস সাইট ও কাস্টম ওয়েব অ্যাপ্লিকেশন — দুটোই বানাই, তাই একটিকে অন্যটির ওপর চাপিয়ে দেওয়ার কোনো কারণ আমাদের নেই। সঠিক সিদ্ধান্ত নির্ভর করে সাইটটি কে এডিট করবে আর সাইটটিকে কী কাজ করতে হবে তার ওপর।

## কখন ওয়ার্ডপ্রেস ভালো

- আপনার টিম পরিচিত একটি ড্যাশবোর্ড থেকে **নিজেরাই পেজ এডিট ও খবর প্রকাশ** করতে চায়।
- সাইটটি মূলত **কনটেন্ট**-নির্ভর: পেজ, পোস্ট, ইভেন্ট, প্রকাশনা।
- অনেক থিম ও প্লাগইনের সুযোগ এবং কম শুরুর বাজেট চান।

ওয়ার্ডপ্রেস পরিপক্ব ও পরিচিত। তবে প্লাগইনগুলো নিয়মিত আপডেট করতে হয়, আর অতিরিক্ত প্লাগইনে সাইট ধীর হয়ে যেতে পারে।

## কখন কাস্টম বিল্ড ভালো

- এমন **ফিচার দরকার যা কোনো প্লাগইনে নেই**: ক্লায়েন্ট পোর্টাল, বুকিং ব্যবস্থা, ড্যাশবোর্ড, কাস্টম সার্চ।
- **গতি ও নিরাপত্তা** খুব গুরুত্বপূর্ণ, আর আপনি কেবল প্রয়োজনীয় কোডটুকুই চান।
- প্রোডাক্টটি **বড় হবে** বলে আশা করেন এবং এটি কীভাবে কাজ করবে তার পুরো নিয়ন্ত্রণ চান।

আমরা সাধারণত Next.js ও Postgres ডেটাবেস দিয়ে কাস্টম সাইট বানাই। এগুলো দ্রুত লোড হয় ও সহজে বড় করা যায়, তবে কাঠামোয় পরিবর্তনের জন্য ডেভেলপার লাগে।

## একটি সহজ পরীক্ষা

নিজেকে প্রশ্ন করুন: *"এটা কি মূলত প্রকাশ করার জায়গা, নাকি মানুষ ব্যবহার করবে এমন একটি টুল?"* প্রকাশের জায়গা হলে সাধারণত ওয়ার্ডপ্রেস। টুল হলে সাধারণত কাস্টম বিল্ড।

নিশ্চিত না হলে আমাদের জানান সাইটে ভিজিটররা কী করবে — আমরা কারণসহ একটি সুপারিশ দেব।$q$,
       $q$Both are good choices for different jobs. Here is how we decide which one to recommend.$q$, $q$ভিন্ন ভিন্ন কাজের জন্য দুটোই ভালো। কোনটা সুপারিশ করব, আমরা কীভাবে সিদ্ধান্ত নিই তা এখানে।$q$, 'published', now() - interval '73 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$business$q$),
       $q$choosing-a-domain-name-and-hosting$q$, $q$Choosing a domain name and hosting without regrets$q$, $q$ডোমেইন নাম ও হোস্টিং বাছাই: পরে আফসোস না করার উপায়$q$, $q$.com or .com.bd? Shared hosting or cloud? A short checklist so your address and your server don't hold you back later.$q$, $q$.com নাকি .com.bd? শেয়ার্ড হোস্টিং নাকি ক্লাউড? ছোট একটি চেকলিস্ট, যাতে পরে আপনার ঠিকানা বা সার্ভার বাধা না হয়।$q$,
       $q$Your domain is your address on the internet, and your hosting is the building the site lives in. Both are cheap to get right at the start and annoying to fix later.

## Picking the domain

- **Short and easy to say.** If you have to spell it out on the phone, it's too complicated.
- **Avoid hyphens and numbers** unless they are part of your brand.
- **.com or .com.bd?** A .com is familiar worldwide. A .com.bd signals a Bangladeshi business and is often available when the .com is taken. Many organisations register both and redirect one to the other.
- **Register it in your own name** and keep the login. We have seen businesses lose their domain because a former freelancer owned the account.

## Picking the hosting

- **Shared hosting** is fine for small WordPress sites with modest traffic.
- **Cloud platforms** suit custom web apps that need to scale and deploy automatically.
- Check that **SSL (https) is included**, backups are taken, and support answers when something breaks.

## Don't forget renewal

Put renewal dates in your calendar and turn on auto-renew. An expired domain takes your website and your email offline at the same time.

When we build a site we set all of this up in the client's name and hand over the access details at launch.$q$,
       $q$ডোমেইন হলো ইন্টারনেটে আপনার ঠিকানা, আর হোস্টিং হলো সেই ভবন যেখানে সাইটটি থাকে। শুরুতে দুটোই সহজে ঠিকভাবে নেওয়া যায়, কিন্তু পরে ঠিক করা ঝামেলার।

## ডোমেইন বাছাই

- **ছোট ও বলতে সহজ।** ফোনে বানান করে বলতে হলে বুঝবেন নামটা জটিল।
- **হাইফেন ও সংখ্যা এড়িয়ে চলুন**, যদি না সেগুলো আপনার ব্র্যান্ডের অংশ হয়।
- **.com নাকি .com.bd?** .com সারা বিশ্বে পরিচিত। .com.bd বাংলাদেশি প্রতিষ্ঠানের পরিচয় দেয় এবং .com না পেলেও অনেক সময় পাওয়া যায়। অনেক প্রতিষ্ঠান দুটোই নিবন্ধন করে একটিকে অন্যটিতে রিডাইরেক্ট করে।
- **নিজের নামে নিবন্ধন করুন** এবং লগইন তথ্য নিজের কাছে রাখুন। আগের কোনো ফ্রিল্যান্সারের নামে অ্যাকাউন্ট থাকায় ডোমেইন হারানোর ঘটনা আমরা দেখেছি।

## হোস্টিং বাছাই

- ট্রাফিক কম এমন ছোট ওয়ার্ডপ্রেস সাইটের জন্য **শেয়ার্ড হোস্টিং** যথেষ্ট।
- যেসব কাস্টম ওয়েব অ্যাপ বড় হবে ও স্বয়ংক্রিয়ভাবে ডিপ্লয় হবে, সেগুলোর জন্য **ক্লাউড প্ল্যাটফর্ম** ভালো।
- দেখে নিন **SSL (https) অন্তর্ভুক্ত** কি না, ব্যাকআপ নেওয়া হয় কি না, আর সমস্যা হলে সাপোর্ট সাড়া দেয় কি না।

## নবায়নের কথা ভুলবেন না

নবায়নের তারিখ ক্যালেন্ডারে রাখুন এবং অটো-রিনিউ চালু করুন। ডোমেইনের মেয়াদ শেষ হলে ওয়েবসাইট ও ইমেইল একসঙ্গে বন্ধ হয়ে যায়।

আমরা সাইট বানানোর সময় এসব ক্লায়েন্টের নামেই সেটআপ করি এবং লঞ্চের সময় সব অ্যাক্সেস তথ্য বুঝিয়ে দিই।$q$,
       $q$.com or .com.bd? Shared hosting or cloud? A short checklist so your address and your server don't hold you back later.$q$, $q$.com নাকি .com.bd? শেয়ার্ড হোস্টিং নাকি ক্লাউড? ছোট একটি চেকলিস্ট, যাতে পরে আপনার ঠিকানা বা সার্ভার বাধা না হয়।$q$, 'published', now() - interval '69 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$design$q$),
       $q$why-mobile-first-design-matters$q$, $q$Why we design for the phone first$q$, $q$কেন আমরা আগে মোবাইলের জন্য ডিজাইন করি$q$, $q$Most of your visitors will meet your website on a small screen. Designing for that screen first makes the whole site better.$q$, $q$আপনার বেশিরভাগ ভিজিটর ছোট স্ক্রিনেই সাইটটি প্রথম দেখবেন। আগে সেই স্ক্রিনের জন্য ডিজাইন করলে পুরো সাইটই ভালো হয়।$q$,
       $q$In Bangladesh, a large share of people go online mainly through their phones. That means the phone is not the "small version" of your website — for many visitors it is the only version.

## What mobile-first means in practice

We start every design at a width of around 360 pixels, the size of a typical Android phone, and only then expand it for tablets and laptops. Starting small forces good decisions:

- **Only the important things fit**, so we decide early what matters most.
- **Buttons are big enough to tap** with a thumb.
- **Text stays readable** without zooming.
- **Pages load faster**, because we don't start with heavy desktop-only extras.

## Common mobile problems we fix

- Menus that cover the whole screen and can't be closed easily.
- Tables and images that make the page scroll sideways.
- Phone numbers that aren't tappable.
- Forms with tiny fields and no proper keyboard (for example, a number keypad for phone numbers).

## How to check your own site

Open it on an ordinary phone on mobile data, not office Wi-Fi. Try to find your contact details and send a message. If that takes more than a few seconds or any zooming, your visitors are feeling it too.

Every site we build is tested at 360, 390 and 1280 pixels before it goes live.$q$,
       $q$বাংলাদেশে অনেক মানুষ মূলত ফোন দিয়েই ইন্টারনেট ব্যবহার করেন। তাই ফোন আপনার ওয়েবসাইটের "ছোট সংস্করণ" নয় — অনেক ভিজিটরের কাছে এটিই একমাত্র সংস্করণ।

## বাস্তবে মোবাইল-ফার্স্ট মানে কী

আমরা প্রতিটি ডিজাইন শুরু করি প্রায় ৩৬০ পিক্সেল প্রস্থ থেকে — সাধারণ একটি অ্যান্ড্রয়েড ফোনের মাপ — তারপর ট্যাবলেট ও ল্যাপটপের জন্য বড় করি। ছোট থেকে শুরু করলে ভালো সিদ্ধান্ত নিতে বাধ্য হতে হয়:

- **শুধু জরুরি জিনিসই জায়গা পায়**, তাই শুরুতেই ঠিক করতে হয় কোনটা সবচেয়ে গুরুত্বপূর্ণ।
- **বাটনগুলো যথেষ্ট বড় হয়**, বুড়ো আঙুলে সহজে চাপা যায়।
- **লেখা জুম না করেই পড়া যায়।**
- **পেজ দ্রুত লোড হয়**, কারণ শুরু থেকেই ভারী ডেস্কটপ-কেন্দ্রিক জিনিস থাকে না।

## মোবাইলের যেসব সাধারণ সমস্যা আমরা ঠিক করি

- পুরো স্ক্রিন ঢেকে ফেলা মেনু, যা সহজে বন্ধ করা যায় না।
- টেবিল ও ছবি, যেগুলোর কারণে পেজ পাশে সরে যায়।
- ফোন নম্বর, যেগুলোতে চাপ দিয়ে কল করা যায় না।
- ছোট ঘরের ফর্ম, যেখানে সঠিক কিবোর্ড আসে না (যেমন ফোন নম্বরের জন্য সংখ্যার কিবোর্ড)।

## নিজের সাইট কীভাবে যাচাই করবেন

অফিসের ওয়াই-ফাই নয়, মোবাইল ডেটায় সাধারণ একটি ফোনে সাইটটি খুলুন। যোগাযোগের তথ্য খুঁজে একটি বার্তা পাঠানোর চেষ্টা করুন। এতে কয়েক সেকেন্ডের বেশি লাগলে বা জুম করতে হলে, আপনার ভিজিটররাও একই সমস্যায় পড়ছেন।

আমাদের বানানো প্রতিটি সাইট লাইভ হওয়ার আগে ৩৬০, ৩৯০ ও ১২৮০ পিক্সেলে পরীক্ষা করা হয়।$q$,
       $q$Most of your visitors will meet your website on a small screen. Designing for that screen first makes the whole site better.$q$, $q$আপনার বেশিরভাগ ভিজিটর ছোট স্ক্রিনেই সাইটটি প্রথম দেখবেন। আগে সেই স্ক্রিনের জন্য ডিজাইন করলে পুরো সাইটই ভালো হয়।$q$, 'published', now() - interval '65 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$development$q$),
       $q$make-your-website-load-faster$q$, $q$Seven practical ways to make your website load faster$q$, $q$ওয়েবসাইট দ্রুত লোড করার সাতটি কার্যকর উপায়$q$, $q$Slow pages lose visitors, especially on mobile data. These fixes give the biggest improvement for the least effort.$q$, $q$ধীর পেজ ভিজিটর হারায়, বিশেষ করে মোবাইল ডেটায়। কম পরিশ্রমে সবচেয়ে বেশি উন্নতি আনে এমন কিছু সমাধান।$q$,
       $q$Speed is not a luxury. Visitors on mobile data give up quickly when a page stays blank, and search engines take page experience into account too. Here are the fixes we apply first.

## 1. Compress your images

Photos straight from a phone camera are often several megabytes. Resizing them to the size they're shown at and saving them as WebP usually cuts them to a small fraction of that with no visible difference.

## 2. Load images lazily

Images further down the page don't need to load until the visitor scrolls to them.

## 3. Remove what you don't use

Unused plugins, sliders, chat widgets and tracking scripts all add weight. Every extra script has to be downloaded and run.

## 4. Use good hosting and a CDN

A content delivery network serves files from a location closer to the visitor.

## 5. Limit web fonts

Each font weight is another file. Two or three weights are usually enough.

## 6. Cache what doesn't change

Pages and files that rarely change can be cached so they're served instantly.

## 7. Measure, don't guess

Run your site through Google PageSpeed Insights and look at the mobile score. Fix the biggest item first, then measure again.

Small improvements add up. A page that feels instant builds trust before the visitor has read a single word.$q$,
       $q$গতি কোনো বিলাসিতা নয়। মোবাইল ডেটায় থাকা ভিজিটর পেজ ফাঁকা দেখলে দ্রুতই চলে যান, আর সার্চ ইঞ্জিনও পেজের অভিজ্ঞতা বিবেচনা করে। আমরা প্রথমে যেসব সমাধান করি:

## ১. ছবি কমপ্রেস করুন

ফোনের ক্যামেরা থেকে সরাসরি নেওয়া ছবি প্রায়ই কয়েক মেগাবাইট হয়। যে মাপে দেখানো হবে সেই মাপে ছোট করে WebP হিসেবে সেভ করলে সাধারণত আকার অনেক কমে যায়, অথচ চোখে পার্থক্য বোঝা যায় না।

## ২. ছবি ধীরে (lazy) লোড করুন

পেজের নিচের দিকের ছবিগুলো ভিজিটর স্ক্রল করে সেখানে না পৌঁছানো পর্যন্ত লোড করার দরকার নেই।

## ৩. যা ব্যবহার করেন না তা সরিয়ে দিন

অব্যবহৃত প্লাগইন, স্লাইডার, চ্যাট উইজেট ও ট্র্যাকিং স্ক্রিপ্ট — সবই ওজন বাড়ায়। প্রতিটি বাড়তি স্ক্রিপ্ট ডাউনলোড ও চালাতে হয়।

## ৪. ভালো হোস্টিং ও CDN ব্যবহার করুন

কনটেন্ট ডেলিভারি নেটওয়ার্ক ভিজিটরের কাছাকাছি কোনো জায়গা থেকে ফাইল পাঠায়।

## ৫. ওয়েব ফন্ট সীমিত রাখুন

প্রতিটি ফন্ট-ওজন আলাদা একটি ফাইল। সাধারণত দুই-তিনটি ওজনই যথেষ্ট।

## ৬. যা বদলায় না তা ক্যাশ করুন

যেসব পেজ ও ফাইল কমই বদলায়, সেগুলো ক্যাশ করলে সঙ্গে সঙ্গে পাঠানো যায়।

## ৭. অনুমান নয়, মেপে দেখুন

Google PageSpeed Insights-এ সাইটটি পরীক্ষা করে মোবাইলের স্কোর দেখুন। সবচেয়ে বড় সমস্যাটি আগে ঠিক করুন, তারপর আবার মাপুন।

ছোট ছোট উন্নতি মিলে বড় পরিবর্তন আনে। যে পেজ চোখের পলকে খোলে, তা ভিজিটর একটি শব্দ পড়ার আগেই আস্থা তৈরি করে।$q$,
       $q$Slow pages lose visitors, especially on mobile data. These fixes give the biggest improvement for the least effort.$q$, $q$ধীর পেজ ভিজিটর হারায়, বিশেষ করে মোবাইল ডেটায়। কম পরিশ্রমে সবচেয়ে বেশি উন্নতি আনে এমন কিছু সমাধান।$q$, 'published', now() - interval '61 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$seo$q$),
       $q$seo-basics-for-small-businesses$q$, $q$SEO basics every small business website should get right$q$, $q$প্রতিটি ছোট ব্যবসার ওয়েবসাইটে যে এসইও মৌলিক বিষয়গুলো ঠিক থাকা দরকার$q$, $q$You don't need tricks to be found on Google. You need clear pages, honest titles and a site that works well.$q$, $q$গুগলে খুঁজে পাওয়ার জন্য কোনো কৌশল লাগে না। লাগে পরিষ্কার পেজ, সৎ শিরোনাম আর ভালোভাবে কাজ করা একটি সাইট।$q$,
       $q$Search engine optimisation sounds technical, but most of it is common sense: make it easy for search engines to understand what each page is about, and make the page genuinely useful.

## The essentials

- **One clear topic per page.** A "Services" page that lists everything is harder to rank than a separate page for each service.
- **A unique title and description** for every page. These are what people see in the search results.
- **Use the words your customers use.** If people search "website design in Dhaka", say that naturally on the page.
- **Headings that make sense.** One main heading, then sub-headings in order.
- **Descriptive image text (alt text)** so images are understood and accessible.
- **A sitemap** submitted in Google Search Console.

## Technical health

- The site must work well on phones and load quickly.
- Every page should use https.
- Broken links and missing pages should be fixed or redirected.

## Content that earns visits

Answer the questions your customers ask you on the phone. A helpful article about "how to choose a domain" will attract people long after you publish it.

## Be patient

SEO is slow. New sites usually take months to build visibility. Anyone promising first-page results in a week is guessing — or worse.$q$,
       $q$সার্চ ইঞ্জিন অপটিমাইজেশন শুনতে প্রযুক্তিগত মনে হলেও এর বেশিরভাগই সাধারণ বুদ্ধির ব্যাপার: প্রতিটি পেজ কী নিয়ে তা সার্চ ইঞ্জিনকে সহজে বুঝতে দিন, আর পেজটিকে সত্যিই কাজের করে তুলুন।

## মৌলিক বিষয়গুলো

- **প্রতিটি পেজে একটি পরিষ্কার বিষয়।** সবকিছু তালিকা করা একটি "সার্ভিস" পেজের চেয়ে প্রতিটি সার্ভিসের আলাদা পেজ সার্চে সহজে আসে।
- **প্রতিটি পেজের আলাদা শিরোনাম ও বিবরণ।** সার্চ ফলাফলে মানুষ এগুলোই দেখে।
- **গ্রাহকেরা যে শব্দ ব্যবহার করেন, সেটাই লিখুন।** মানুষ যদি "ঢাকায় ওয়েবসাইট ডিজাইন" লিখে খোঁজে, পেজে স্বাভাবিকভাবে সেটাই বলুন।
- **অর্থবহ হেডিং।** একটি প্রধান হেডিং, তারপর ক্রমানুসারে উপ-হেডিং।
- **ছবির বর্ণনামূলক লেখা (alt text)**, যাতে ছবি বোঝা যায় ও সবার জন্য সহজলভ্য হয়।
- Google Search Console-এ জমা দেওয়া একটি **সাইটম্যাপ**।

## প্রযুক্তিগত স্বাস্থ্য

- সাইটকে ফোনে ভালোভাবে চলতে ও দ্রুত লোড হতে হবে।
- প্রতিটি পেজে https থাকতে হবে।
- ভাঙা লিংক ও হারিয়ে যাওয়া পেজ ঠিক বা রিডাইরেক্ট করতে হবে।

## যে কনটেন্ট ভিজিটর আনে

গ্রাহকেরা ফোনে আপনাকে যেসব প্রশ্ন করেন, সেগুলোর উত্তর লিখুন। "কীভাবে ডোমেইন বাছাই করবেন" নিয়ে একটি কাজের লেখা প্রকাশের অনেক পরেও মানুষ আনবে।

## ধৈর্য ধরুন

এসইও ধীরে কাজ করে। নতুন সাইটের পরিচিতি গড়তে সাধারণত কয়েক মাস লাগে। এক সপ্তাহে প্রথম পেজে আনার প্রতিশ্রুতি যে দেয়, সে আন্দাজে বলছে — বা আরও খারাপ কিছু করছে।$q$,
       $q$You don't need tricks to be found on Google. You need clear pages, honest titles and a site that works well.$q$, $q$গুগলে খুঁজে পাওয়ার জন্য কোনো কৌশল লাগে না। লাগে পরিষ্কার পেজ, সৎ শিরোনাম আর ভালোভাবে কাজ করা একটি সাইট।$q$, 'published', now() - interval '57 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$seo$q$),
       $q$google-business-profile-for-local-customers$q$, $q$Get found by local customers with a Google Business Profile$q$, $q$গুগল বিজনেস প্রোফাইল দিয়ে স্থানীয় গ্রাহকের কাছে পৌঁছান$q$, $q$When someone searches for a business near them, the map results come first. A free profile puts you there.$q$, $q$কেউ কাছাকাছি কোনো প্রতিষ্ঠান খুঁজলে প্রথমে ম্যাপের ফলাফল আসে। একটি বিনামূল্যের প্রোফাইল আপনাকে সেখানে নিয়ে যায়।$q$,
       $q$If you have a shop, office, school or clinic that people visit, a Google Business Profile is one of the most valuable free tools you can set up. It controls how you appear in Google Maps and in the local results at the top of a search.

## Setting it up well

1. **Use your real business name** — no extra keywords stuffed in.
2. **Pick the most accurate category.** This affects which searches you show up for.
3. **Add your exact location, phone number and opening hours**, including holiday hours.
4. **Link to your website** and make sure the same name, address and phone appear there too.
5. **Upload real photos** of your premises, team and work.

## Keep it alive

- Reply to reviews, both good and bad, politely and quickly.
- Post updates when you have news or offers.
- Update your hours before Eid and other holidays.

## Connect it with your website

Your website should have a clear contact page with your address, a map and a tappable phone number. Search engines look for consistent details across your profile, website and social pages.

A complete profile plus a fast, clear website is often enough to win the local customers who are already looking for you.$q$,
       $q$আপনার যদি এমন দোকান, অফিস, স্কুল বা ক্লিনিক থাকে যেখানে মানুষ সরাসরি আসে, তাহলে গুগল বিজনেস প্রোফাইল সবচেয়ে মূল্যবান বিনামূল্যের টুলগুলোর একটি। গুগল ম্যাপে এবং সার্চের ওপরের স্থানীয় ফলাফলে আপনি কীভাবে দেখাবেন, তা এটিই ঠিক করে।

## ভালোভাবে সেটআপ করুন

১. **প্রতিষ্ঠানের আসল নাম ব্যবহার করুন** — বাড়তি কিওয়ার্ড জুড়ে দেবেন না।
২. **সবচেয়ে সঠিক ক্যাটাগরি বেছে নিন।** কোন সার্চে আপনাকে দেখাবে তা এর ওপর নির্ভর করে।
৩. **সঠিক ঠিকানা, ফোন নম্বর ও খোলার সময়** দিন, ছুটির দিনের সময়সহ।
৪. **আপনার ওয়েবসাইটের লিংক দিন** এবং সেখানেও একই নাম, ঠিকানা ও ফোন নম্বর আছে কি না দেখে নিন।
৫. প্রতিষ্ঠান, টিম ও কাজের **আসল ছবি আপলোড করুন**।

## প্রোফাইল সচল রাখুন

- ভালো-মন্দ সব রিভিউয়ের উত্তর ভদ্রভাবে ও দ্রুত দিন।
- খবর বা অফার থাকলে আপডেট পোস্ট করুন।
- ঈদ ও অন্যান্য ছুটির আগে খোলার সময় হালনাগাদ করুন।

## ওয়েবসাইটের সঙ্গে যুক্ত করুন

আপনার ওয়েবসাইটে ঠিকানা, ম্যাপ ও চাপ দিলেই কল হয় এমন ফোন নম্বরসহ একটি পরিষ্কার যোগাযোগ পেজ থাকা উচিত। সার্চ ইঞ্জিন প্রোফাইল, ওয়েবসাইট ও সোশ্যাল পেজে একই তথ্য আছে কি না দেখে।

একটি সম্পূর্ণ প্রোফাইল আর দ্রুত, পরিষ্কার একটি ওয়েবসাইট — প্রায়ই এটুকুই যথেষ্ট সেই স্থানীয় গ্রাহকদের পেতে, যারা ইতিমধ্যে আপনাকে খুঁজছেন।$q$,
       $q$When someone searches for a business near them, the map results come first. A free profile puts you there.$q$, $q$কেউ কাছাকাছি কোনো প্রতিষ্ঠান খুঁজলে প্রথমে ম্যাপের ফলাফল আসে। একটি বিনামূল্যের প্রোফাইল আপনাকে সেখানে নিয়ে যায়।$q$, 'published', now() - interval '53 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$design$q$),
       $q$bangla-typography-on-the-web$q$, $q$Making Bangla text look good on the web$q$, $q$ওয়েবে বাংলা লেখা সুন্দর দেখানোর উপায়$q$, $q$Bangla needs a little more care than English: the right font, enough line height and correct characters for search.$q$, $q$ইংরেজির চেয়ে বাংলায় একটু বেশি যত্ন লাগে: সঠিক ফন্ট, যথেষ্ট লাইন-উচ্চতা আর সার্চের জন্য সঠিক অক্ষর।$q$,
       $q$Many websites in Bangladesh still show Bangla text in whatever font the visitor's phone happens to have. The result is uneven letters, broken conjuncts and lines that feel cramped. A few deliberate choices fix most of this.

## Choose a proper web font

Load a Bangla font that is designed for screens, such as Hind Siliguri or Noto Sans Bengali, instead of relying on the device. Load only the weights you use so the page stays fast.

## Give the text room

Bangla letters have marks above and below the main line. They need **more line height** than English — we usually use around 1.7 to 1.8 for body text — and slightly larger sizes for small labels.

## Don't letter-space Bangla

Tight or wide letter spacing that looks stylish in English headings can break the joins between Bangla letters. We turn it off for Bangla.

## Watch the characters

Letters like য়, ড় and ঢ় can be typed in two different ways that look identical but are stored differently. If your site has a search box, both forms should match, or visitors will get "no results" for words that are clearly on the page.

## Use Bangla digits where it feels natural

Dates, prices and counts read more naturally as ১২৩ on a Bangla page. On our own site, numbers switch with the language.

Small details like these make a Bangla site feel like it was made for its readers — not translated as an afterthought.$q$,
       $q$বাংলাদেশের অনেক ওয়েবসাইট এখনো ভিজিটরের ফোনে যে ফন্ট আছে, তাতেই বাংলা দেখায়। ফলে অক্ষর অসমান দেখায়, যুক্তাক্ষর ভেঙে যায়, লাইনগুলো ঘিঞ্জি লাগে। কয়েকটি সচেতন সিদ্ধান্তেই এর বেশিরভাগ ঠিক হয়ে যায়।

## সঠিক ওয়েব ফন্ট বেছে নিন

ডিভাইসের ওপর নির্ভর না করে স্ক্রিনের জন্য বানানো একটি বাংলা ফন্ট লোড করুন, যেমন হিন্দ শিলিগুড়ি বা নোটো সান্স বেঙ্গলি। পেজ দ্রুত রাখতে শুধু ব্যবহৃত ওজনগুলোই লোড করুন।

## লেখাকে জায়গা দিন

বাংলা অক্ষরের মূল রেখার ওপরে ও নিচে চিহ্ন থাকে। তাই ইংরেজির চেয়ে **বেশি লাইন-উচ্চতা** লাগে — মূল লেখায় আমরা সাধারণত ১.৭ থেকে ১.৮ ব্যবহার করি — আর ছোট লেবেলে একটু বড় আকার।

## বাংলায় অক্ষরের ফাঁক বদলাবেন না

ইংরেজি হেডিংয়ে যে ঘন বা ফাঁকা অক্ষর-বিন্যাস সুন্দর দেখায়, তা বাংলা অক্ষরের সংযোগ ভেঙে দিতে পারে। বাংলার জন্য আমরা এটি বন্ধ রাখি।

## অক্ষরের দিকে খেয়াল রাখুন

য়, ড়, ঢ়-এর মতো অক্ষর দুইভাবে টাইপ করা যায় — দেখতে একই, কিন্তু সংরক্ষিত হয় আলাদাভাবে। সাইটে সার্চ বক্স থাকলে দুই রূপই মেলাতে হবে, নইলে পেজে স্পষ্টভাবে থাকা শব্দ খুঁজলেও ভিজিটর "কোনো ফলাফল নেই" দেখবেন।

## যেখানে স্বাভাবিক, সেখানে বাংলা সংখ্যা ব্যবহার করুন

বাংলা পেজে তারিখ, দাম ও সংখ্যা ১২৩ হিসেবে পড়তে বেশি স্বাভাবিক লাগে। আমাদের নিজেদের সাইটে ভাষার সঙ্গে সংখ্যাও বদলে যায়।

এমন ছোট ছোট খুঁটিনাটিতেই একটি বাংলা সাইট পাঠকের জন্য বানানো মনে হয় — পরে কোনোমতে অনুবাদ করা মনে হয় না।$q$,
       $q$Bangla needs a little more care than English: the right font, enough line height and correct characters for search.$q$, $q$ইংরেজির চেয়ে বাংলায় একটু বেশি যত্ন লাগে: সঠিক ফন্ট, যথেষ্ট লাইন-উচ্চতা আর সার্চের জন্য সঠিক অক্ষর।$q$, 'published', now() - interval '49 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$development$q$),
       $q$planning-a-bilingual-bangla-english-website$q$, $q$Planning a bilingual Bangla–English website$q$, $q$বাংলা-ইংরেজি দ্বিভাষিক ওয়েবসাইটের পরিকল্পনা$q$, $q$Two languages are more than a translate button. Decide early on URLs, content ownership and what happens when a translation is missing.$q$, $q$দুই ভাষা মানে শুধু একটি অনুবাদ বাটন নয়। URL, কনটেন্টের দায়িত্ব আর অনুবাদ না থাকলে কী হবে — শুরুতেই ঠিক করুন।$q$,
       $q$Many organisations in Bangladesh speak to two audiences: local visitors who prefer Bangla, and partners, donors or customers abroad who read English. A bilingual site serves both — if it's planned properly.

## Give each language its own address

We use addresses like `/bn/about` and `/en/about`. Each language version can be shared, bookmarked and found by search engines on its own, and the site tells Google that the two pages are translations of each other.

## Remember the visitor's choice

When someone switches to English, the site should keep them in English as they move around — and remember it next time.

## Decide who writes each language

Machine translation is a starting point, not a finished text. Decide who on your team will review the Bangla and English versions, especially for important pages.

## Plan for missing translations

Not every blog post will be translated on day one. A sensible fallback — showing the other language rather than an empty page — keeps the site usable while translations catch up.

## Translate the small things too

Buttons, error messages, dates and numbers are easy to forget. A site where the article is in Bangla but the form errors are in English feels unfinished.

Our own website works this way: Bangla by default, English one tap away, and every page available in both.$q$,
       $q$বাংলাদেশের অনেক প্রতিষ্ঠান দুই ধরনের পাঠকের সঙ্গে কথা বলে: বাংলা পছন্দ করেন এমন স্থানীয় ভিজিটর, আর ইংরেজি পড়েন এমন বিদেশি পার্টনার, দাতা বা গ্রাহক। দ্বিভাষিক সাইট দুজনেরই কাজে আসে — যদি ঠিকভাবে পরিকল্পনা করা হয়।

## প্রতিটি ভাষার আলাদা ঠিকানা দিন

আমরা `/bn/about` ও `/en/about`-এর মতো ঠিকানা ব্যবহার করি। প্রতিটি ভাষার সংস্করণ আলাদাভাবে শেয়ার, বুকমার্ক ও সার্চে খুঁজে পাওয়া যায়, আর সাইট গুগলকে জানিয়ে দেয় যে পেজ দুটি একে অপরের অনুবাদ।

## ভিজিটরের পছন্দ মনে রাখুন

কেউ ইংরেজিতে গেলে সাইটের ভেতরে ঘোরার সময় তাকে ইংরেজিতেই রাখা উচিত — আর পরের বারও তা মনে রাখা উচিত।

## কে কোন ভাষায় লিখবে, ঠিক করুন

মেশিন অনুবাদ শুরু মাত্র, চূড়ান্ত লেখা নয়। বিশেষ করে গুরুত্বপূর্ণ পেজের বাংলা ও ইংরেজি সংস্করণ আপনার টিমের কে দেখবেন, তা ঠিক করুন।

## অনুবাদ না থাকলে কী হবে, ভাবুন

প্রথম দিনেই সব ব্লগ পোস্ট অনূদিত হবে না। ফাঁকা পেজের বদলে অন্য ভাষাটি দেখানোর মতো একটি যুক্তিসংগত বিকল্প থাকলে অনুবাদ শেষ না হওয়া পর্যন্তও সাইট ব্যবহারযোগ্য থাকে।

## ছোট জিনিসগুলোও অনুবাদ করুন

বাটন, ত্রুটির বার্তা, তারিখ ও সংখ্যা সহজেই বাদ পড়ে যায়। লেখা বাংলায় অথচ ফর্মের ত্রুটি ইংরেজিতে — এমন সাইট অসম্পূর্ণ মনে হয়।

আমাদের নিজেদের ওয়েবসাইট এভাবেই কাজ করে: ডিফল্ট বাংলা, এক চাপে ইংরেজি, আর প্রতিটি পেজ দুই ভাষাতেই।$q$,
       $q$Two languages are more than a translate button. Decide early on URLs, content ownership and what happens when a translation is missing.$q$, $q$দুই ভাষা মানে শুধু একটি অনুবাদ বাটন নয়। URL, কনটেন্টের দায়িত্ব আর অনুবাদ না থাকলে কী হবে — শুরুতেই ঠিক করুন।$q$, 'published', now() - interval '45 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$development$q$),
       $q$accepting-online-payments-in-bangladesh$q$, $q$Accepting online payments in Bangladesh: bKash, Nagad and cards$q$, $q$বাংলাদেশে অনলাইন পেমেন্ট নেওয়া: বিকাশ, নগদ ও কার্ড$q$, $q$What you need before adding a checkout to your website, and how to choose between mobile wallets and a payment gateway.$q$, $q$ওয়েবসাইটে চেকআউট যোগ করার আগে কী কী লাগবে, আর মোবাইল ওয়ালেট ও পেমেন্ট গেটওয়ের মধ্যে কীভাবে বাছবেন।$q$,
       $q$Taking payments on your website — for products, course fees, event tickets or donations — saves time for you and your customers. Here's what to think about before you start.

## Your options

- **Mobile wallets** such as bKash and Nagad are what many customers use every day. Each offers merchant integration for websites.
- **Payment gateways** such as SSLCommerz bring cards, mobile wallets and internet banking together in one checkout.

Many businesses start with one gateway that covers several methods, then add a direct wallet integration if most customers use it.

## What you'll need

Payment providers need to verify your business before you can go live. Expect to provide trade licence or registration documents, bank details and a working website with clear policies. Check the provider's current requirements, as they change from time to time.

## Pages your site must have

- Clear prices and what's included.
- Refund and return policy.
- Terms of service and privacy policy.
- Contact details that actually work.

## Do it safely

- Never store card details on your own server — the gateway handles that.
- Confirm each payment on the server, not just in the visitor's browser.
- Send a receipt by email and keep a record in your admin panel.

Start in the provider's test mode, try every path (success, failure, cancel), and only then switch to live payments.$q$,
       $q$ওয়েবসাইটে পেমেন্ট নেওয়া — পণ্য, কোর্স ফি, ইভেন্টের টিকিট বা অনুদানের জন্য — আপনার ও গ্রাহকের দুজনেরই সময় বাঁচায়। শুরু করার আগে যা ভাবতে হবে:

## আপনার বিকল্পগুলো

- **মোবাইল ওয়ালেট** যেমন বিকাশ ও নগদ — অনেক গ্রাহক প্রতিদিন এগুলোই ব্যবহার করেন। প্রতিটিই ওয়েবসাইটের জন্য মার্চেন্ট ইন্টিগ্রেশন দেয়।
- **পেমেন্ট গেটওয়ে** যেমন SSLCommerz — কার্ড, মোবাইল ওয়ালেট ও ইন্টারনেট ব্যাংকিং এক চেকআউটে নিয়ে আসে।

অনেক প্রতিষ্ঠান কয়েকটি মাধ্যম আছে এমন একটি গেটওয়ে দিয়ে শুরু করে, পরে বেশিরভাগ গ্রাহক কোনো নির্দিষ্ট ওয়ালেট ব্যবহার করলে সেটির সরাসরি ইন্টিগ্রেশন যোগ করে।

## যা যা লাগবে

লাইভ হওয়ার আগে পেমেন্ট প্রোভাইডার আপনার প্রতিষ্ঠান যাচাই করে। সাধারণত ট্রেড লাইসেন্স বা নিবন্ধনের কাগজ, ব্যাংকের তথ্য এবং পরিষ্কার নীতিমালাসহ একটি সচল ওয়েবসাইট লাগে। প্রোভাইডারের বর্তমান শর্ত দেখে নিন, কারণ সময়ে সময়ে বদলায়।

## সাইটে যে পেজগুলো থাকতেই হবে

- পরিষ্কার দাম ও তাতে কী অন্তর্ভুক্ত।
- রিফান্ড ও রিটার্ন নীতি।
- সেবার শর্তাবলি ও গোপনীয়তা নীতি।
- সত্যিই কাজ করে এমন যোগাযোগের তথ্য।

## নিরাপদে করুন

- কখনো নিজের সার্ভারে কার্ডের তথ্য রাখবেন না — সেটা গেটওয়ে দেখে।
- প্রতিটি পেমেন্ট শুধু ভিজিটরের ব্রাউজারে নয়, সার্ভারে নিশ্চিত করুন।
- ইমেইলে রসিদ পাঠান এবং অ্যাডমিন প্যানেলে রেকর্ড রাখুন।

প্রোভাইডারের টেস্ট মোডে শুরু করুন, প্রতিটি পথ (সফল, ব্যর্থ, বাতিল) চেষ্টা করুন, তারপরই লাইভ পেমেন্টে যান।$q$,
       $q$What you need before adding a checkout to your website, and how to choose between mobile wallets and a payment gateway.$q$, $q$ওয়েবসাইটে চেকআউট যোগ করার আগে কী কী লাগবে, আর মোবাইল ওয়ালেট ও পেমেন্ট গেটওয়ের মধ্যে কীভাবে বাছবেন।$q$, 'published', now() - interval '41 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$care$q$),
       $q$website-security-checklist$q$, $q$A website security checklist for non-technical owners$q$, $q$অপ্রযুক্তিগত মালিকদের জন্য ওয়েবসাইট নিরাপত্তা চেকলিস্ট$q$, $q$Most hacked websites aren't targeted — they're simply unpatched. Ten checks you can do or ask your developer about.$q$, $q$বেশিরভাগ হ্যাক হওয়া সাইট আলাদাভাবে টার্গেট করা নয় — শুধু হালনাগাদ করা হয়নি। দশটি বিষয় যা নিজে দেখতে বা ডেভেলপারকে জিজ্ঞেস করতে পারেন।$q$,
       $q$Website attacks are mostly automated. Bots scan thousands of sites a day looking for old software and weak passwords. The good news is that basic habits stop most of them.

## The checklist

1. **https everywhere.** The padlock should appear on every page.
2. **Strong, unique passwords** for the admin panel, hosting and domain accounts.
3. **Two-step verification** wherever it's offered.
4. **Software kept up to date** — the platform, themes and plugins.
5. **Remove unused plugins and old admin accounts.**
6. **Give people only the access they need.** An editor doesn't need full admin rights.
7. **Automatic backups**, stored somewhere other than the website itself.
8. **Spam protection on forms**, such as a simple captcha or a hidden honeypot field.
9. **File uploads checked** for type and size.
10. **Someone watching.** Uptime alerts and a person responsible for acting on them.

## If something goes wrong

Change all passwords, restore from a clean backup, update everything, and find out how the attacker got in so it doesn't happen again.

## Ask your developer

"What do you update, how often, and how would we recover if the site were hacked tomorrow?" A good developer will have a clear answer.$q$,
       $q$ওয়েবসাইটে আক্রমণ বেশিরভাগই স্বয়ংক্রিয়। বট প্রতিদিন হাজার হাজার সাইট স্ক্যান করে পুরোনো সফটওয়্যার আর দুর্বল পাসওয়ার্ড খোঁজে। সুখবর হলো, কিছু মৌলিক অভ্যাসই বেশিরভাগ আক্রমণ ঠেকিয়ে দেয়।

## চেকলিস্ট

১. **সব জায়গায় https।** প্রতিটি পেজে তালার চিহ্ন থাকা উচিত।
২. অ্যাডমিন প্যানেল, হোস্টিং ও ডোমেইন অ্যাকাউন্টের জন্য **শক্তিশালী ও আলাদা পাসওয়ার্ড**।
৩. যেখানে সুযোগ আছে, সেখানে **দুই ধাপের যাচাই**।
৪. **সফটওয়্যার হালনাগাদ রাখা** — প্ল্যাটফর্ম, থিম ও প্লাগইন।
৫. **অব্যবহৃত প্লাগইন ও পুরোনো অ্যাডমিন অ্যাকাউন্ট সরিয়ে ফেলা।**
৬. **যার যতটুকু দরকার, ততটুকুই অ্যাক্সেস।** একজন এডিটরের পূর্ণ অ্যাডমিন অধিকার দরকার নেই।
৭. **স্বয়ংক্রিয় ব্যাকআপ**, যা ওয়েবসাইটের বাইরে অন্য কোথাও রাখা।
৮. **ফর্মে স্প্যাম সুরক্ষা**, যেমন সহজ ক্যাপচা বা লুকানো হানিপট ঘর।
৯. **আপলোড করা ফাইলের** ধরন ও আকার যাচাই।
১০. **কেউ নজর রাখছেন।** সাইট বন্ধ হলে সতর্কবার্তা, আর সেটা দেখে ব্যবস্থা নেওয়ার দায়িত্বে একজন মানুষ।

## কিছু ঘটে গেলে

সব পাসওয়ার্ড বদলান, পরিষ্কার একটি ব্যাকআপ থেকে সাইট ফিরিয়ে আনুন, সবকিছু হালনাগাদ করুন, আর আক্রমণকারী কীভাবে ঢুকল তা খুঁজে বের করুন যাতে আবার না ঘটে।

## ডেভেলপারকে জিজ্ঞেস করুন

"আপনি কী কী আপডেট করেন, কত দিন পরপর, আর কাল সাইট হ্যাক হলে আমরা কীভাবে ফিরে আসব?" একজন ভালো ডেভেলপারের কাছে এর পরিষ্কার উত্তর থাকবে।$q$,
       $q$Most hacked websites aren't targeted — they're simply unpatched. Ten checks you can do or ask your developer about.$q$, $q$বেশিরভাগ হ্যাক হওয়া সাইট আলাদাভাবে টার্গেট করা নয় — শুধু হালনাগাদ করা হয়নি। দশটি বিষয় যা নিজে দেখতে বা ডেভেলপারকে জিজ্ঞেস করতে পারেন।$q$, 'published', now() - interval '37 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$care$q$),
       $q$why-websites-need-maintenance$q$, $q$Why a website needs care after launch$q$, $q$লঞ্চের পরেও কেন ওয়েবসাইটের যত্ন দরকার$q$, $q$A website is closer to a vehicle than a printed brochure. A little regular maintenance avoids expensive breakdowns.$q$, $q$ওয়েবসাইট ছাপানো ব্রোশারের চেয়ে বরং গাড়ির মতো। নিয়মিত একটু যত্ন নিলে ব্যয়বহুল বিকল হওয়া এড়ানো যায়।$q$,
       $q$Launch day feels like the finish line, but it's really the start. The software your site runs on keeps changing, browsers update, and your business changes too.

## What maintenance covers

- **Updates** to the platform, plugins and libraries, tested before they go live.
- **Backups** taken regularly and tested by actually restoring them.
- **Uptime and error monitoring**, so problems are spotted before customers report them.
- **Security fixes** when vulnerabilities are announced.
- **Small content changes** — new team members, updated prices, a new page.
- **Performance checks** as content and traffic grow.

## What happens without it

Sites that are left alone for a year or two often end up with outdated plugins, a contact form that silently stopped sending emails, or a security problem. Fixing that in a hurry costs more than steady care.

## How we handle it

We offer simple monthly care plans so a client site always has someone responsible for it. See the care plans on our [pricing page](/pricing), or ask us to review your existing site — even if someone else built it.$q$,
       $q$লঞ্চের দিনটা শেষ সীমানার মতো মনে হয়, কিন্তু আসলে এটাই শুরু। সাইট যে সফটওয়্যারে চলে তা বদলাতে থাকে, ব্রাউজার আপডেট হয়, আর আপনার প্রতিষ্ঠানও বদলায়।

## রক্ষণাবেক্ষণে কী থাকে

- প্ল্যাটফর্ম, প্লাগইন ও লাইব্রেরির **আপডেট**, লাইভে যাওয়ার আগে পরীক্ষা করে।
- নিয়মিত **ব্যাকআপ**, এবং সত্যিই ফিরিয়ে এনে পরীক্ষা করা।
- **আপটাইম ও ত্রুটি পর্যবেক্ষণ**, যাতে গ্রাহক জানানোর আগেই সমস্যা ধরা পড়ে।
- দুর্বলতা জানা গেলে **নিরাপত্তা সমাধান**।
- **ছোট কনটেন্ট পরিবর্তন** — নতুন সদস্য, হালনাগাদ দাম, নতুন পেজ।
- কনটেন্ট ও ভিজিটর বাড়লে **গতি পরীক্ষা**।

## যত্ন না নিলে কী হয়

এক-দুই বছর ফেলে রাখা সাইটে প্রায়ই পুরোনো প্লাগইন থাকে, কন্টাক্ট ফর্ম নিঃশব্দে ইমেইল পাঠানো বন্ধ করে দেয়, বা নিরাপত্তা সমস্যা দেখা দেয়। তাড়াহুড়ো করে সেগুলো ঠিক করতে নিয়মিত যত্নের চেয়ে বেশি খরচ হয়।

## আমরা যেভাবে করি

আমরা সহজ মাসিক কেয়ার প্ল্যান দিই, যাতে ক্লায়েন্টের সাইটের দায়িত্বে সবসময় কেউ থাকে। আমাদের [প্রাইসিং পেজে](/pricing) কেয়ার প্ল্যানগুলো দেখুন, অথবা আপনার বর্তমান সাইটটি — অন্য কেউ বানালেও — একবার দেখে দিতে বলুন।$q$,
       $q$A website is closer to a vehicle than a printed brochure. A little regular maintenance avoids expensive breakdowns.$q$, $q$ওয়েবসাইট ছাপানো ব্রোশারের চেয়ে বরং গাড়ির মতো। নিয়মিত একটু যত্ন নিলে ব্যয়বহুল বিকল হওয়া এড়ানো যায়।$q$, 'published', now() - interval '33 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$design$q$),
       $q$what-makes-a-good-nonprofit-website$q$, $q$What makes a good website for an NGO or nonprofit$q$, $q$এনজিও বা অলাভজনক প্রতিষ্ঠানের ভালো ওয়েবসাইট কেমন হয়$q$, $q$Donors, partners and the communities you serve all visit your site for different reasons. Design for each of them.$q$, $q$দাতা, পার্টনার আর যাদের জন্য কাজ করেন — সবাই ভিন্ন কারণে আপনার সাইটে আসেন। প্রত্যেকের কথা ভেবে ডিজাইন করুন।$q$,
       $q$We've built websites for nonprofits and student organisations, and the same lessons come up every time. A nonprofit site has to build trust quickly with people who may never meet you.

## Show the work, not just the mission

A mission statement is a start, but people believe photos, numbers and stories from real programmes. Keep a simple, regularly updated section for activities and news.

## Make transparency easy

Publish annual reports, audited accounts where available, governing body members and registration details. Donors and partners look for these before they get in touch.

## Clear ways to help

Whether it's donating, volunteering or partnering, each should have one obvious button and a short, simple form.

## Speak to both audiences

Local communities may prefer Bangla, while international partners read English. A bilingual site with a language switcher serves both without duplicating your whole team's effort.

## Let the team update it

Programmes change all the time. Choose a setup — often WordPress — where staff can publish news and upload reports without calling a developer.

## Keep it light

Many of the people you serve may browse on older phones and slower connections. A fast, simple site respects their time and data.$q$,
       $q$আমরা অলাভজনক ও ছাত্র সংগঠনের জন্য ওয়েবসাইট বানিয়েছি, আর প্রতিবারই একই শিক্ষাগুলো সামনে আসে। যারা হয়তো কখনো আপনার সঙ্গে দেখা করবেন না, তাদের আস্থা দ্রুত অর্জন করতে হয় অলাভজনক প্রতিষ্ঠানের সাইটকে।

## শুধু লক্ষ্য নয়, কাজ দেখান

লক্ষ্যের বিবৃতি একটা শুরু, কিন্তু মানুষ বিশ্বাস করে বাস্তব কার্যক্রমের ছবি, সংখ্যা ও গল্প। কার্যক্রম ও খবরের জন্য নিয়মিত হালনাগাদ হয় এমন একটি সহজ অংশ রাখুন।

## স্বচ্ছতা সহজ করুন

বার্ষিক প্রতিবেদন, পাওয়া গেলে নিরীক্ষিত হিসাব, পরিচালনা পর্ষদের সদস্য ও নিবন্ধনের তথ্য প্রকাশ করুন। যোগাযোগের আগে দাতা ও পার্টনাররা এগুলোই খোঁজেন।

## সাহায্যের পরিষ্কার উপায়

অনুদান, স্বেচ্ছাসেবা বা পার্টনারশিপ — প্রতিটির জন্য একটি স্পষ্ট বাটন আর ছোট, সহজ একটি ফর্ম থাকা উচিত।

## দুই ধরনের পাঠকের সঙ্গে কথা বলুন

স্থানীয় মানুষ হয়তো বাংলা পছন্দ করেন, আর আন্তর্জাতিক পার্টনাররা ইংরেজি পড়েন। ভাষা বদলের সুবিধাসহ একটি দ্বিভাষিক সাইট দুই পক্ষকেই সেবা দেয়, পুরো টিমের কাজ দ্বিগুণ না করেই।

## টিমকে হালনাগাদ করতে দিন

কার্যক্রম সবসময় বদলায়। এমন ব্যবস্থা বেছে নিন — প্রায়ই ওয়ার্ডপ্রেস — যেখানে কর্মীরা ডেভেলপার না ডেকেই খবর প্রকাশ ও প্রতিবেদন আপলোড করতে পারেন।

## হালকা রাখুন

আপনি যাদের জন্য কাজ করেন, তাদের অনেকেই হয়তো পুরোনো ফোনে ও ধীর সংযোগে ব্রাউজ করেন। দ্রুত ও সহজ সাইট তাদের সময় ও ডেটার প্রতি সম্মান দেখায়।$q$,
       $q$Donors, partners and the communities you serve all visit your site for different reasons. Design for each of them.$q$, $q$দাতা, পার্টনার আর যাদের জন্য কাজ করেন — সবাই ভিন্ন কারণে আপনার সাইটে আসেন। প্রত্যেকের কথা ভেবে ডিজাইন করুন।$q$, 'published', now() - interval '29 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$business$q$),
       $q$how-to-write-a-website-brief$q$, $q$How to write a website brief your developer will love$q$, $q$এমন ওয়েবসাইট ব্রিফ লিখুন, যা ডেভেলপারের কাজ সহজ করে$q$, $q$A one-page brief gets you a more accurate quote, fewer revisions and a site that does what you actually need.$q$, $q$এক পৃষ্ঠার একটি ব্রিফ দিলে আরও সঠিক কোটেশন পাবেন, সংশোধন কম লাগবে, আর সাইটটি সত্যিই আপনার দরকারি কাজ করবে।$q$,
       $q$You don't need technical knowledge to write a great brief. You need to describe your business, your visitors and what success looks like. Here's a simple structure.

## 1. About you

Two or three sentences about your organisation and what makes it different.

## 2. Who the site is for

List your main visitor types — for example customers, partners, job seekers — and what each one wants to find.

## 3. The one main goal

What should most visitors do? Call you, send an enquiry, buy, donate, register? Pick one main goal and a couple of secondary ones.

## 4. Pages and features

A rough list is enough: Home, About, Services, Blog, Contact, plus anything special like bookings, payments or a members' area.

## 5. Content

Who will write the text and provide photos? Do you need Bangla, English or both?

## 6. Examples

Share two or three websites you like and say *what* you like about them.

## 7. Budget and timeline

A budget range helps your developer suggest the right approach instead of guessing. If there's a fixed launch date, say so.

You can send us a brief through our [contact form](/contact) — even a rough one is a great start.$q$,
       $q$দারুণ একটি ব্রিফ লিখতে প্রযুক্তিগত জ্ঞান লাগে না। লাগে আপনার প্রতিষ্ঠান, ভিজিটর আর সফলতা দেখতে কেমন — তার বর্ণনা। একটি সহজ কাঠামো:

## ১. আপনার পরিচয়

আপনার প্রতিষ্ঠান সম্পর্কে দুই-তিন বাক্য, আর অন্যদের থেকে আপনি কোথায় আলাদা।

## ২. সাইটটি কার জন্য

প্রধান ভিজিটরদের তালিকা দিন — যেমন গ্রাহক, পার্টনার, চাকরিপ্রার্থী — আর প্রত্যেকে কী খুঁজতে আসেন।

## ৩. একটি প্রধান লক্ষ্য

বেশিরভাগ ভিজিটর কী করবেন? ফোন করবেন, তথ্য চাইবেন, কিনবেন, অনুদান দেবেন, নিবন্ধন করবেন? একটি প্রধান লক্ষ্য আর দুয়েকটি সহায়ক লক্ষ্য বেছে নিন।

## ৪. পেজ ও ফিচার

মোটামুটি একটি তালিকাই যথেষ্ট: হোম, পরিচিতি, সেবা, ব্লগ, যোগাযোগ, সঙ্গে বিশেষ কিছু থাকলে — যেমন বুকিং, পেমেন্ট বা সদস্যদের জন্য আলাদা অংশ।

## ৫. কনটেন্ট

লেখা কে লিখবেন, ছবি কে দেবেন? বাংলা, ইংরেজি নাকি দুটোই লাগবে?

## ৬. উদাহরণ

পছন্দের দুই-তিনটি ওয়েবসাইট দিন এবং সেগুলোর *কী* ভালো লাগে তা বলুন।

## ৭. বাজেট ও সময়সীমা

একটি বাজেট-পরিসর জানালে ডেভেলপার আন্দাজ না করে সঠিক পদ্ধতি সুপারিশ করতে পারেন। লঞ্চের নির্দিষ্ট তারিখ থাকলে তা-ও জানান।

আমাদের [যোগাযোগ ফর্মে](/contact) ব্রিফ পাঠাতে পারেন — মোটামুটি একটি খসড়াও চমৎকার শুরু।$q$,
       $q$A one-page brief gets you a more accurate quote, fewer revisions and a site that does what you actually need.$q$, $q$এক পৃষ্ঠার একটি ব্রিফ দিলে আরও সঠিক কোটেশন পাবেন, সংশোধন কম লাগবে, আর সাইটটি সত্যিই আপনার দরকারি কাজ করবে।$q$, 'published', now() - interval '25 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$seo$q$),
       $q$landing-pages-that-convert$q$, $q$Landing pages that turn visitors into enquiries$q$, $q$যে ল্যান্ডিং পেজ ভিজিটরকে গ্রাহকে পরিণত করে$q$, $q$If you're paying for ads, the page they land on matters as much as the ad. A simple structure that works.$q$, $q$বিজ্ঞাপনে টাকা খরচ করলে, সেটি যে পেজে নিয়ে যায় তা বিজ্ঞাপনের মতোই গুরুত্বপূর্ণ। কার্যকর একটি সহজ কাঠামো।$q$,
       $q$Many businesses in Bangladesh run Facebook or Google ads that send people to a homepage full of everything. A focused landing page usually does much better.

## One page, one offer

A landing page has a single job. Remove the main menu, unrelated links and anything that distracts from the action you want.

## A structure that works

1. **A headline that matches the ad.** If the ad says "Website in 14 days", the page should say the same.
2. **Who it's for and what they get**, in two or three short lines.
3. **Proof** — client logos, a short testimonial, or real numbers from your work.
4. **What's included and the price or starting price.** Hiding the price makes people leave.
5. **A short form or a click-to-call / WhatsApp button.**
6. **Answers to the three most common questions.**

## Keep the form short

Ask only for what you need to reply: name, phone or email, and one question. Every extra field loses people.

## Measure it

Track how many visitors send an enquiry. Try one change at a time — a new headline, a different button — and keep what works.$q$,
       $q$বাংলাদেশের অনেক প্রতিষ্ঠান ফেসবুক বা গুগল বিজ্ঞাপন দিয়ে মানুষকে এমন হোমপেজে পাঠায়, যেখানে সবকিছুই আছে। একটি নির্দিষ্ট ল্যান্ডিং পেজ সাধারণত অনেক ভালো ফল দেয়।

## এক পেজ, এক অফার

ল্যান্ডিং পেজের কাজ একটাই। মূল মেনু, অপ্রাসঙ্গিক লিংক আর যা কিছু আপনার কাঙ্ক্ষিত কাজ থেকে মনোযোগ সরায় — সব সরিয়ে দিন।

## কার্যকর একটি কাঠামো

১. **বিজ্ঞাপনের সঙ্গে মিল রেখে শিরোনাম।** বিজ্ঞাপনে "১৪ দিনে ওয়েবসাইট" লেখা থাকলে পেজেও তা-ই থাকা উচিত।
২. **কার জন্য এবং তারা কী পাবেন**, ছোট দুই-তিন লাইনে।
৩. **প্রমাণ** — ক্লায়েন্টের লোগো, ছোট একটি মতামত, বা কাজের আসল সংখ্যা।
৪. **কী কী অন্তর্ভুক্ত আর দাম বা শুরুর দাম।** দাম লুকালে মানুষ চলে যায়।
৫. **ছোট একটি ফর্ম বা কল / হোয়াটসঅ্যাপ বাটন।**
৬. **সবচেয়ে বেশি আসা তিনটি প্রশ্নের উত্তর।**

## ফর্ম ছোট রাখুন

উত্তর দিতে যা লাগে, শুধু তা-ই জিজ্ঞেস করুন: নাম, ফোন বা ইমেইল, আর একটি প্রশ্ন। প্রতিটি বাড়তি ঘর কিছু মানুষকে হারায়।

## মেপে দেখুন

কতজন ভিজিটর তথ্য চেয়ে বার্তা পাঠান, তা হিসাব রাখুন। একবারে একটি পরিবর্তন চেষ্টা করুন — নতুন শিরোনাম, ভিন্ন বাটন — আর যা কাজ করে তা রেখে দিন।$q$,
       $q$If you're paying for ads, the page they land on matters as much as the ad. A simple structure that works.$q$, $q$বিজ্ঞাপনে টাকা খরচ করলে, সেটি যে পেজে নিয়ে যায় তা বিজ্ঞাপনের মতোই গুরুত্বপূর্ণ। কার্যকর একটি সহজ কাঠামো।$q$, 'published', now() - interval '21 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$design$q$),
       $q$web-accessibility-basics$q$, $q$Web accessibility: small changes that help everyone$q$, $q$ওয়েব অ্যাক্সেসিবিলিটি: ছোট পরিবর্তন, সবার উপকার$q$, $q$An accessible website works for people with disabilities — and turns out to be easier for everyone else too.$q$, $q$অ্যাক্সেসিবল ওয়েবসাইট প্রতিবন্ধী মানুষের জন্য কাজ করে — আর দেখা যায়, অন্য সবার জন্যও তা সহজ হয়ে ওঠে।$q$,
       $q$Accessibility means people can use your site whatever their abilities: people with low vision, colour blindness or motor difficulties, people using screen readers, and anyone holding a phone in bright sunlight with one hand.

## Quick wins

- **Enough contrast.** Light grey text on white looks elegant but is hard to read. Aim for a strong contrast between text and background.
- **Text size.** Body text should be comfortable to read without zooming.
- **Descriptive links.** "Read our pricing guide" is better than "click here".
- **Alt text for images** that carry meaning.
- **Labels on every form field**, not just placeholder text that disappears.
- **Keyboard friendly.** Every menu, button and form should work with the Tab key, with a visible focus outline.
- **Don't rely on colour alone.** Show errors with a message, not only a red border.

## Test it yourself

Try using your site with only the keyboard. Zoom the browser to 200%. Turn your phone brightness down. You'll find problems quickly.

## Why it matters

It's the right thing to do, it reaches more people, and many accessibility improvements also help SEO and usability. We build these basics into every project rather than adding them at the end.$q$,
       $q$অ্যাক্সেসিবিলিটি মানে যেকোনো সক্ষমতার মানুষ আপনার সাইট ব্যবহার করতে পারবেন: কম দৃষ্টিশক্তির মানুষ, বর্ণান্ধ বা চলাচলে অসুবিধা আছে এমন মানুষ, স্ক্রিন রিডার ব্যবহারকারী, আর কড়া রোদে এক হাতে ফোন ধরে থাকা যে কেউ।

## সহজ কিছু উন্নতি

- **যথেষ্ট কনট্রাস্ট।** সাদার ওপর হালকা ধূসর লেখা সুন্দর দেখালেও পড়া কঠিন। লেখা ও পটভূমির মধ্যে জোরালো পার্থক্য রাখুন।
- **লেখার আকার।** মূল লেখা জুম না করেই আরামে পড়া যাওয়া উচিত।
- **বর্ণনামূলক লিংক।** "এখানে ক্লিক করুন"-এর চেয়ে "আমাদের প্রাইসিং গাইড পড়ুন" ভালো।
- অর্থবহ ছবির জন্য **alt text**।
- **প্রতিটি ফর্মের ঘরে লেবেল** — শুধু টাইপ শুরু করলেই হারিয়ে যায় এমন প্লেসহোল্ডার নয়।
- **কিবোর্ডে ব্যবহারযোগ্য।** প্রতিটি মেনু, বাটন ও ফর্ম Tab কি দিয়ে চালানো যাবে, এবং ফোকাস স্পষ্ট দেখা যাবে।
- **শুধু রঙের ওপর নির্ভর করবেন না।** ত্রুটি শুধু লাল বর্ডারে নয়, বার্তা দিয়েও দেখান।

## নিজেই পরীক্ষা করুন

শুধু কিবোর্ড দিয়ে সাইটটি ব্যবহার করে দেখুন। ব্রাউজার ২০০% জুম করুন। ফোনের উজ্জ্বলতা কমিয়ে দিন। দ্রুতই সমস্যা চোখে পড়বে।

## কেন গুরুত্বপূর্ণ

এটাই সঠিক কাজ, এতে আরও বেশি মানুষের কাছে পৌঁছানো যায়, আর অনেক অ্যাক্সেসিবিলিটি উন্নতি এসইও ও ব্যবহারযোগ্যতাও বাড়ায়। আমরা শেষে যোগ না করে প্রতিটি প্রজেক্টে শুরু থেকেই এই মৌলিক বিষয়গুলো রাখি।$q$,
       $q$An accessible website works for people with disabilities — and turns out to be easier for everyone else too.$q$, $q$অ্যাক্সেসিবল ওয়েবসাইট প্রতিবন্ধী মানুষের জন্য কাজ করে — আর দেখা যায়, অন্য সবার জন্যও তা সহজ হয়ে ওঠে।$q$, 'published', now() - interval '17 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$care$q$),
       $q$website-backups-explained$q$, $q$Website backups explained: what, where and how often$q$, $q$ওয়েবসাইট ব্যাকআপ: কী, কোথায় আর কত দিন পরপর$q$, $q$A backup you've never restored is only a hope. How to set up backups you can actually rely on.$q$, $q$যে ব্যাকআপ কখনো ফিরিয়ে আনা হয়নি, তা শুধুই আশা। ভরসা করা যায় এমন ব্যাকআপ কীভাবে সেটআপ করবেন।$q$,
       $q$Accidents happen: a plugin update breaks the site, someone deletes the wrong page, or the server fails. A good backup turns a disaster into a short inconvenience.

## What to back up

- **The database** — pages, posts, users, form entries, orders.
- **Uploaded files** — images, documents, attachments.
- **The code and configuration** — usually kept safely in a Git repository for custom sites.

## Where to keep it

Not only on the same server as the website. If the server fails or is compromised, the backups go with it. Keep at least one copy in separate storage.

## How often

It depends on how often your content changes. A busy site with orders or daily posts needs daily backups; a small brochure site may be fine with weekly ones. Keep several older copies too, in case a problem isn't noticed straight away.

## Test the restore

Every few months, actually restore a backup to a test copy of the site. It's the only way to know it works.

## A safety net for everyday mistakes

On our own platform, deleted posts, projects and files go to a **recycle bin for 30 days** before they're removed for good, so an accidental delete can be undone in one click.$q$,
       $q$দুর্ঘটনা ঘটেই: প্লাগইন আপডেটে সাইট ভেঙে যায়, কেউ ভুল পেজ মুছে ফেলেন, বা সার্ভার বিকল হয়। ভালো একটি ব্যাকআপ দুর্যোগকে ছোট্ট একটি অসুবিধায় পরিণত করে।

## কী ব্যাকআপ রাখবেন

- **ডেটাবেস** — পেজ, পোস্ট, ইউজার, ফর্মে জমা পড়া তথ্য, অর্ডার।
- **আপলোড করা ফাইল** — ছবি, ডকুমেন্ট, সংযুক্তি।
- **কোড ও কনফিগারেশন** — কাস্টম সাইটের ক্ষেত্রে সাধারণত Git রিপোজিটরিতে নিরাপদে থাকে।

## কোথায় রাখবেন

শুধু ওয়েবসাইটের একই সার্ভারে নয়। সার্ভার বিকল বা আক্রান্ত হলে ব্যাকআপও সঙ্গে যায়। অন্তত একটি কপি আলাদা স্টোরেজে রাখুন।

## কত দিন পরপর

কনটেন্ট কত ঘন ঘন বদলায় তার ওপর নির্ভর করে। অর্ডার বা প্রতিদিন পোস্ট হয় এমন ব্যস্ত সাইটে প্রতিদিন ব্যাকআপ লাগে; ছোট পরিচিতিমূলক সাইটে সাপ্তাহিকই যথেষ্ট হতে পারে। সমস্যা সঙ্গে সঙ্গে ধরা না পড়লে কাজে লাগাতে কয়েকটি পুরোনো কপিও রেখে দিন।

## ফিরিয়ে এনে পরীক্ষা করুন

কয়েক মাস পরপর একটি ব্যাকআপ সত্যিই সাইটের একটি পরীক্ষামূলক কপিতে ফিরিয়ে আনুন। কাজ করে কি না জানার এটাই একমাত্র উপায়।

## প্রতিদিনের ভুলের জন্য নিরাপত্তা জাল

আমাদের নিজেদের প্ল্যাটফর্মে মুছে ফেলা পোস্ট, প্রজেক্ট ও ফাইল স্থায়ীভাবে মুছে যাওয়ার আগে **৩০ দিন রিসাইকেল বিনে** থাকে, তাই ভুল করে মুছে ফেললেও এক ক্লিকে ফিরিয়ে আনা যায়।$q$,
       $q$A backup you've never restored is only a hope. How to set up backups you can actually rely on.$q$, $q$যে ব্যাকআপ কখনো ফিরিয়ে আনা হয়নি, তা শুধুই আশা। ভরসা করা যায় এমন ব্যাকআপ কীভাবে সেটআপ করবেন।$q$, 'published', now() - interval '13 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$business$q$),
       $q$facebook-page-or-website$q$, $q$Is a Facebook page enough, or do you need a website?$q$, $q$ফেসবুক পেজই কি যথেষ্ট, নাকি ওয়েবসাইট দরকার?$q$, $q$Facebook is great for reaching people. A website is where you own the relationship. Most businesses benefit from both.$q$, $q$মানুষের কাছে পৌঁছাতে ফেসবুক দারুণ। কিন্তু সম্পর্কের মালিকানা থাকে ওয়েবসাইটে। বেশিরভাগ প্রতিষ্ঠানের দুটোই কাজে লাগে।$q$,
       $q$Many Bangladeshi businesses started on Facebook, and for good reason: it's free, customers are already there, and messaging is easy. So why bother with a website?

## What Facebook does well

- Reaching people who already use the platform.
- Quick updates, photos and conversations.
- Paid ads with detailed targeting.

## Where a website is better

- **You own it.** Page reach, rules and features can change at any time, and pages can be restricted or lost. Your website and domain stay yours.
- **People find it on Google.** Many customers search before they buy, and a website shows up for those searches.
- **It looks established.** Partners, banks, foreign clients and job seekers often look for a proper website.
- **It does more.** Online booking, payments, client portals, detailed service pages, downloadable reports.
- **Your own email address** at your domain looks far more professional than a free email account.

## Use them together

Use Facebook to start conversations and your website to give the full picture and capture enquiries. Link each one to the other, keep the same name and contact details on both, and post your website articles on your page.

A small, fast website doesn't need to be expensive — and it's the one online presence that's entirely yours.$q$,
       $q$বাংলাদেশের অনেক প্রতিষ্ঠান ফেসবুকে শুরু করেছে, আর এর যুক্তিসংগত কারণও আছে: এটা বিনামূল্যে, গ্রাহকেরা আগে থেকেই সেখানে আছেন, আর মেসেজ করা সহজ। তাহলে ওয়েবসাইট কেন?

## ফেসবুক যা ভালো করে

- প্ল্যাটফর্মটি আগে থেকে ব্যবহার করেন এমন মানুষের কাছে পৌঁছানো।
- দ্রুত আপডেট, ছবি ও কথোপকথন।
- নির্দিষ্ট দর্শককে লক্ষ্য করে পেইড বিজ্ঞাপন।

## যেখানে ওয়েবসাইট ভালো

- **মালিক আপনি।** পেজের রিচ, নিয়ম ও ফিচার যেকোনো সময় বদলাতে পারে, পেজ সীমিত বা হারিয়েও যেতে পারে। কিন্তু ওয়েবসাইট ও ডোমেইন আপনারই থাকে।
- **গুগলে খুঁজে পাওয়া যায়।** অনেক গ্রাহক কেনার আগে সার্চ করেন, আর সেসব সার্চে ওয়েবসাইট আসে।
- **প্রতিষ্ঠিত মনে হয়।** পার্টনার, ব্যাংক, বিদেশি ক্লায়েন্ট ও চাকরিপ্রার্থীরা প্রায়ই একটি পূর্ণাঙ্গ ওয়েবসাইট খোঁজেন।
- **বেশি কাজ করে।** অনলাইন বুকিং, পেমেন্ট, ক্লায়েন্ট পোর্টাল, বিস্তারিত সেবার পেজ, ডাউনলোডযোগ্য প্রতিবেদন।
- নিজের ডোমেইনে **নিজস্ব ইমেইল ঠিকানা** বিনামূল্যের ইমেইলের চেয়ে অনেক বেশি পেশাদার দেখায়।

## দুটো একসঙ্গে ব্যবহার করুন

কথোপকথন শুরু করতে ফেসবুক, আর পুরো তথ্য দিতে ও তথ্য-অনুরোধ নিতে ওয়েবসাইট ব্যবহার করুন। একটিতে অন্যটির লিংক দিন, দুই জায়গায় একই নাম ও যোগাযোগের তথ্য রাখুন, আর ওয়েবসাইটের লেখাগুলো পেজে শেয়ার করুন।

ছোট, দ্রুত একটি ওয়েবসাইট ব্যয়বহুল হতে হয় না — আর অনলাইনে এটিই একমাত্র উপস্থিতি, যা পুরোপুরি আপনার।$q$,
       $q$Facebook is great for reaching people. A website is where you own the relationship. Most businesses benefit from both.$q$, $q$মানুষের কাছে পৌঁছাতে ফেসবুক দারুণ। কিন্তু সম্পর্কের মালিকানা থাকে ওয়েবসাইটে। বেশিরভাগ প্রতিষ্ঠানের দুটোই কাজে লাগে।$q$, 'published', now() - interval '9 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$seo$q$),
       $q$website-analytics-for-beginners$q$, $q$Website analytics for beginners: the five numbers that matter$q$, $q$শুরুর জন্য ওয়েবসাইট অ্যানালিটিক্স: যে পাঁচটি সংখ্যা জরুরি$q$, $q$Analytics dashboards can be overwhelming. Start with a handful of numbers that tell you whether your site is working.$q$, $q$অ্যানালিটিক্স ড্যাশবোর্ড দেখে দিশেহারা লাগতে পারে। এমন কয়েকটি সংখ্যা দিয়ে শুরু করুন, যা বলে দেয় সাইট কাজ করছে কি না।$q$,
       $q$Installing analytics is easy. Knowing what to look at is harder. Ignore most of the dashboard at first and watch these five things each month.

## 1. Visitors

How many people came, and is the trend going up or down over several months? Single days jump around; trends matter.

## 2. Where they came from

Search, social media, ads, other websites or typing your address directly. This tells you which efforts are paying off.

## 3. Top pages

Which pages do people actually read? You'll often find a blog post or service page doing far more work than the homepage.

## 4. Device type

If most visitors are on phones — and in Bangladesh they often are — your mobile experience is your real website.

## 5. Enquiries (conversions)

The number that matters most: contact forms sent, calls tapped, orders placed. Set these up as goals so you can see which sources bring real customers, not just visits.

## A note on privacy

Collect only what you need, mention analytics in your privacy policy, and avoid tracking personal details. Simple, privacy-friendly analytics are usually enough for small businesses.

Review these numbers once a month, make one improvement, and check again next month.$q$,
       $q$অ্যানালিটিক্স বসানো সহজ। কী দেখতে হবে তা জানাই কঠিন। শুরুতে ড্যাশবোর্ডের বেশিরভাগ অংশ এড়িয়ে যান, আর প্রতি মাসে এই পাঁচটি জিনিস দেখুন।

## ১. ভিজিটর

কতজন এসেছেন, আর কয়েক মাস ধরে প্রবণতা বাড়ছে না কমছে? এক দিনের হিসাব ওঠানামা করে; প্রবণতাই আসল।

## ২. কোথা থেকে এসেছেন

সার্চ, সোশ্যাল মিডিয়া, বিজ্ঞাপন, অন্য ওয়েবসাইট, নাকি সরাসরি ঠিকানা লিখে। এতে বোঝা যায় কোন চেষ্টাগুলো ফল দিচ্ছে।

## ৩. শীর্ষ পেজ

মানুষ আসলে কোন পেজগুলো পড়েন? প্রায়ই দেখবেন একটি ব্লগ পোস্ট বা সেবার পেজ হোমপেজের চেয়ে অনেক বেশি কাজ করছে।

## ৪. ডিভাইসের ধরন

বেশিরভাগ ভিজিটর যদি ফোনে থাকেন — বাংলাদেশে প্রায়ই তাই — তাহলে মোবাইলের অভিজ্ঞতাই আপনার আসল ওয়েবসাইট।

## ৫. তথ্য-অনুরোধ (কনভার্সন)

সবচেয়ে গুরুত্বপূর্ণ সংখ্যা: জমা পড়া যোগাযোগ ফর্ম, ফোন কল, অর্ডার। এগুলো লক্ষ্য হিসেবে সেট করুন, যাতে দেখা যায় কোন উৎস শুধু ভিজিট নয়, আসল গ্রাহক আনছে।

## গোপনীয়তা নিয়ে একটি কথা

শুধু প্রয়োজনীয় তথ্যই সংগ্রহ করুন, গোপনীয়তা নীতিতে অ্যানালিটিক্সের কথা উল্লেখ করুন, আর ব্যক্তিগত তথ্য ট্র্যাক করা এড়িয়ে চলুন। ছোট প্রতিষ্ঠানের জন্য সাধারণত সহজ, গোপনীয়তা-বান্ধব অ্যানালিটিক্সই যথেষ্ট।

মাসে একবার এই সংখ্যাগুলো দেখুন, একটি উন্নতি করুন, পরের মাসে আবার যাচাই করুন।$q$,
       $q$Analytics dashboards can be overwhelming. Start with a handful of numbers that tell you whether your site is working.$q$, $q$অ্যানালিটিক্স ড্যাশবোর্ড দেখে দিশেহারা লাগতে পারে। এমন কয়েকটি সংখ্যা দিয়ে শুরু করুন, যা বলে দেয় সাইট কাজ করছে কি না।$q$, 'published', now() - interval '5 days'
on conflict (slug) do nothing;

insert into public.posts (author_id, category_id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, seo_description, seo_description_bn, status, published_at)
select (select id from public.profiles where role = 'ADMIN' order by created_at limit 1),
       (select id from public.post_categories where slug = $q$development$q$),
       $q$website-launch-checklist$q$, $q$The checklist we run before every website launch$q$, $q$প্রতিটি ওয়েবসাইট লঞ্চের আগে আমরা যে চেকলিস্ট মিলিয়ে নিই$q$, $q$Twenty minutes of checks before launch saves days of embarrassment after. Here is our pre-launch list.$q$, $q$লঞ্চের আগে বিশ মিনিটের যাচাই পরে কয়েক দিনের বিব্রতকর অবস্থা থেকে বাঁচায়। আমাদের লঞ্চ-পূর্ব তালিকা।$q$,
       $q$Launching a website is exciting, and that's exactly when small things get missed. This is the list we go through before any site goes live.

## Content

- Spelling checked in every language, including buttons and error messages.
- No placeholder text or sample images left behind.
- Contact details, prices and dates are correct.
- Privacy policy and terms are in place.

## Functionality

- Every form sends — and the email actually arrives.
- Links work, including the ones in the footer.
- Search, logins and payments tested end to end.
- The 404 page is helpful, not a dead end.

## Devices

- Tested at phone, tablet and laptop widths.
- Nothing scrolls sideways on a small phone.
- Phone numbers and email addresses are tappable.

## Technical

- https working on every page, with the non-www and www versions redirecting to one address.
- Page titles, descriptions and social sharing images set.
- Sitemap and robots.txt in place; the site isn't accidentally blocking search engines.
- Analytics and uptime monitoring installed.
- Backups running.

## Handover

- The client has logins for the domain, hosting and admin panel.
- A short guide to editing content.
- A plan for updates and support.

Then — and only then — we press the button.$q$,
       $q$ওয়েবসাইট লঞ্চ রোমাঞ্চকর, আর ঠিক তখনই ছোট ছোট জিনিস বাদ পড়ে যায়। যেকোনো সাইট লাইভ হওয়ার আগে আমরা এই তালিকাটি মিলিয়ে নিই।

## কনটেন্ট

- প্রতিটি ভাষায় বানান যাচাই, বাটন ও ত্রুটির বার্তাসহ।
- কোনো নমুনা লেখা বা নমুনা ছবি রয়ে যায়নি।
- যোগাযোগের তথ্য, দাম ও তারিখ সঠিক।
- গোপনীয়তা নীতি ও শর্তাবলি আছে।

## কার্যকারিতা

- প্রতিটি ফর্ম জমা হয় — আর ইমেইল সত্যিই পৌঁছায়।
- ফুটারের লিংকসহ সব লিংক কাজ করে।
- সার্চ, লগইন ও পেমেন্ট শুরু থেকে শেষ পর্যন্ত পরীক্ষিত।
- ৪০৪ পেজ কাজের, কানাগলি নয়।

## ডিভাইস

- ফোন, ট্যাবলেট ও ল্যাপটপের মাপে পরীক্ষিত।
- ছোট ফোনে কিছুই পাশে সরে যায় না।
- ফোন নম্বর ও ইমেইল ঠিকানায় চাপ দিলে কাজ করে।

## প্রযুক্তিগত

- প্রতিটি পেজে https চালু, www ও www-ছাড়া ঠিকানা একটিতে রিডাইরেক্ট হয়।
- পেজের শিরোনাম, বিবরণ ও সোশ্যাল শেয়ারের ছবি সেট করা।
- সাইটম্যাপ ও robots.txt আছে; সাইট ভুল করে সার্চ ইঞ্জিনকে আটকে রাখছে না।
- অ্যানালিটিক্স ও আপটাইম পর্যবেক্ষণ বসানো।
- ব্যাকআপ চালু।

## হস্তান্তর

- ডোমেইন, হোস্টিং ও অ্যাডমিন প্যানেলের লগইন ক্লায়েন্টের কাছে।
- কনটেন্ট এডিট করার ছোট একটি নির্দেশিকা।
- আপডেট ও সাপোর্টের পরিকল্পনা।

তারপর — কেবল তারপরই — আমরা বাটনটি চাপি।$q$,
       $q$Twenty minutes of checks before launch saves days of embarrassment after. Here is our pre-launch list.$q$, $q$লঞ্চের আগে বিশ মিনিটের যাচাই পরে কয়েক দিনের বিব্রতকর অবস্থা থেকে বাঁচায়। আমাদের লঞ্চ-পূর্ব তালিকা।$q$, 'published', now() - interval '1 days'
on conflict (slug) do nothing;

commit;
