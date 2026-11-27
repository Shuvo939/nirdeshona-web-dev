// Central site configuration and marketing content.
// Edit copy, services, packages and FAQs here — pages read from this file.

export const site = {
  name: "Nirdeshona Web",
  legalName: "Nirdeshona Web Development",
  tagline: "Websites, web apps and digital products that work for real people.",
  description:
    "Nirdeshona Web Development builds fast, modern websites, web applications, WordPress solutions and Android apps — and runs Facebook and social media for organisations, businesses and individuals.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://web.nirdeshona.com",
  email: "contact.nirdeshona@gmail.com",
  phone: "+8801887336695",
  phoneDisplay: "+880 1887-336695",
  whatsapp: "https://wa.me/8801887336695",
  location: "Dhaka, Bangladesh",
  founded: 2022,
};

export type ServiceSlug =
  | "web-development"
  | "wordpress"
  | "design"
  | "custom-development"
  | "ecommerce"
  | "android-app"
  | "social-media"
  | "maintenance";

export type Service = {
  slug: ServiceSlug;
  title: string;
  short: string;
  intro: string;
  icon: "code" | "globe" | "palette" | "cpu" | "cart" | "smartphone" | "megaphone" | "shield";
  deliverables: string[];
  outcomes: { title: string; text: string }[];
  stack: string[];
  idealFor: string[];
  timeline: string;
  startingFrom: string;
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    short: "Fast, secure websites and web apps built with Next.js and modern tooling.",
    intro:
      "From a polished company site to a full web application with logins, dashboards and payments — we build on a modern stack that stays fast, secure and easy to grow.",
    icon: "code",
    deliverables: [
      "Responsive, mobile-first website or web app",
      "Content management (admin panel) tailored to your team",
      "User accounts, roles and secure authentication",
      "SEO foundations: metadata, sitemap, structured URLs",
      "Performance budget — fast on slow mobile connections",
      "Deployment, domain and SSL setup",
    ],
    outcomes: [
      { title: "Speed that converts", text: "Pages load quickly on real phones and real networks, so visitors stay." },
      { title: "Built to grow", text: "Clean architecture means new features don't require a rewrite." },
      { title: "You stay in control", text: "Edit content yourself through an admin panel designed for your workflow." },
    ],
    stack: ["Next.js", "React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "shadcn/ui", "PostgreSQL", "Supabase", "Neon", "NextAuth.js", "Vercel", "Cloudflare", "GitHub", "SEO"],
    idealFor: ["Organisations & NGOs", "Startups", "Content & knowledge platforms", "Service businesses"],
    timeline: "3 – 8 weeks",
    startingFrom: "৳25,000",
    faqs: [
      { q: "Will I be able to update the content myself?", a: "Yes. Every site includes an admin panel or CMS so your team can publish and edit without touching code." },
      { q: "Do you handle hosting and the domain?", a: "We set up hosting, domain DNS and SSL for you, and hand over full access to your own accounts." },
    ],
  },
  {
    slug: "wordpress",
    title: "WordPress Solutions",
    short: "Custom themes, plugins and business-ready WordPress sites.",
    intro:
      "When WordPress is the right fit, we build it properly — lightweight custom themes, only the plugins you need, and a dashboard your team will actually enjoy using.",
    icon: "globe",
    deliverables: [
      "Custom theme designed for your brand (no bloated page builders)",
      "Bengali and English content support",
      "Custom post types, fields and plugins where needed",
      "Speed, caching and image optimisation",
      "Security hardening and backups",
      "Migration from an existing site",
    ],
    outcomes: [
      { title: "Familiar editing", text: "Your team gets the WordPress dashboard they already know." },
      { title: "Lean and fast", text: "Custom code instead of heavy builders keeps pages quick." },
      { title: "Safe by default", text: "Hardened setup, updates and backups reduce risk." },
    ],
    stack: ["WordPress", "PHP", "ACF", "Gutenberg", "WooCommerce", "HTML5", "CSS3", "JavaScript", "Cloudflare", "Bunny.net", "Brevo", "SEO"],
    idealFor: ["NGOs and associations", "Blogs and news sites", "Small businesses", "Schools and institutions"],
    timeline: "2 – 5 weeks",
    startingFrom: "৳15,000",
    faqs: [
      { q: "Can you fix or speed up my existing WordPress site?", a: "Yes — we audit, clean up plugins, optimise images and caching, and fix security issues." },
      { q: "Do you use page builders like Elementor?", a: "Only if you specifically need one. By default we build custom themes that are faster and easier to maintain." },
    ],
  },
  {
    slug: "design",
    title: "UI / UX Design",
    short: "Clean, intuitive interfaces designed around people and real workflows.",
    intro:
      "Good design is how a product works, not only how it looks. We map your users' journeys, then design interfaces that feel obvious — on a small phone first.",
    icon: "palette",
    deliverables: [
      "User flows and information architecture",
      "Wireframes for key screens",
      "High-fidelity UI design and clickable prototype",
      "Design system: colours, typography, components",
      "Accessibility and contrast review",
      "Developer-ready handoff",
    ],
    outcomes: [
      { title: "Fewer confused users", text: "Clear flows reduce support requests and drop-offs." },
      { title: "Consistent brand", text: "A reusable design system keeps every page on-brand." },
      { title: "Faster builds", text: "Decisions made in design save time and money in development." },
    ],
    stack: ["Figma", "Design systems", "Prototyping", "Accessibility (WCAG)", "Tailwind CSS", "shadcn/ui", "HTML5", "CSS3"],
    idealFor: ["New products", "Redesigns", "Dashboards & admin panels", "Mobile-first audiences"],
    timeline: "1 – 4 weeks",
    startingFrom: "৳10,000",
    faqs: [
      { q: "Can you design only, and let my developer build it?", a: "Absolutely. We deliver organised design files and documentation for any developer." },
      { q: "Do you design logos and brand identity?", a: "We help with simple brand kits — logo concepts, palette and type — as part of a website project." },
    ],
  },
  {
    slug: "custom-development",
    title: "Custom Development",
    short: "Portals, dashboards and internal tools built for your exact process.",
    intro:
      "Spreadsheets and WhatsApp groups only go so far. We build custom portals, booking systems, membership platforms and dashboards that match the way you already work.",
    icon: "cpu",
    deliverables: [
      "Discovery workshop and written specification",
      "Custom database design",
      "Role-based dashboards and client portals",
      "Integrations: email, SMS, payment gateways, APIs",
      "File uploads and document management",
      "Training and documentation for your team",
    ],
    outcomes: [
      { title: "Save hours every week", text: "Automate the repetitive work your team does by hand today." },
      { title: "One source of truth", text: "All your data in one secure place, not scattered across files." },
      { title: "Fits your process", text: "Software shaped around your workflow — not the other way round." },
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "SQL", "SQLite", "Supabase", "Neon", "Firebase", "NextAuth.js", "Payload CMS", "Sanity CMS", "Strapi", "Typesense", "Resend", "Brevo", "Cloudflare R2", "Docker", "Render", "GitHub", "REST APIs"],
    idealFor: ["Membership organisations", "Training centres", "Agencies & studios", "Operations teams"],
    timeline: "4 – 12 weeks",
    startingFrom: "৳40,000",
    faqs: [
      { q: "We're not sure exactly what we need. Can you help?", a: "Yes — most custom projects start with a short discovery phase where we map the problem and propose a solution with a fixed scope." },
      { q: "Who owns the code?", a: "You do. On final payment, the code repository and all accounts are transferred to you." },
    ],
  },
  {
    slug: "ecommerce",
    title: "E-commerce",
    short: "Online stores with local payments, inventory and order management.",
    intro:
      "Sell online with a store that's quick to browse on mobile, supports local payment methods and gives you a clear view of orders and stock.",
    icon: "cart",
    deliverables: [
      "Product catalogue with categories and variants",
      "Cart, checkout and order tracking",
      "bKash / Nagad / card payment integration",
      "Inventory and order management dashboard",
      "Delivery charge and coupon rules",
      "Order notification emails",
    ],
    outcomes: [
      { title: "Mobile checkout", text: "A checkout designed for thumbs and slow networks." },
      { title: "Less manual work", text: "Orders, stock and customers managed in one place." },
      { title: "Trust signals", text: "Clear policies and smooth payments help customers buy." },
    ],
    stack: ["Next.js", "WordPress", "WooCommerce", "SSLCommerz", "bKash", "Nagad", "PostgreSQL", "Supabase", "Typesense", "Cloudflare", "Bunny.net", "Resend", "Brevo", "SEO"],
    idealFor: ["Retail brands", "Home businesses", "Bookshops", "Digital products"],
    timeline: "3 – 8 weeks",
    startingFrom: "৳35,000",
    faqs: [
      { q: "Which payment gateways do you support?", a: "We commonly integrate SSLCommerz, bKash, Nagad and cash on delivery. Others are possible on request." },
      { q: "Can I import my existing product list?", a: "Yes — we can import products from a spreadsheet or your current platform." },
    ],
  },
  {
    slug: "android-app",
    title: "Android App Development",
    short: "Native Android apps in Kotlin — fast, offline-ready and published on Google Play.",
    intro:
      "Give your customers, members or field team an app they keep on their phone. We design and build native Android apps with Kotlin and Jetpack Compose, connect them to your website or database, and take care of the Google Play release.",
    icon: "smartphone",
    deliverables: [
      "Native Android app built with Kotlin and Jetpack Compose",
      "Clean, Material-style design that works on small and large screens",
      "Offline support, local storage and background sync",
      "Login, push notifications and in-app content from your admin panel",
      "API or database connection shared with your website",
      "Google Play Console setup, store listing and release",
    ],
    outcomes: [
      { title: "Always in their pocket", text: "An app icon on the home screen brings people back far more often than a bookmark." },
      { title: "Works on real networks", text: "Screens load from local data first, so the app stays usable on slow or patchy connections." },
      { title: "One system, two front doors", text: "Your website and app share the same data, so you update content once." },
    ],
    stack: ["Android", "Kotlin", "Jetpack Compose", "Room", "Firebase", "Firebase Cloud Messaging", "Supabase", "Google Play Console", "Figma", "GitHub"],
    idealFor: ["Businesses with repeat customers", "Schools, coaching centres & NGOs", "Field teams and internal tools", "Content and learning platforms"],
    timeline: "5 – 12 weeks",
    startingFrom: "৳40,000",
    faqs: [
      { q: "Do you build iPhone (iOS) apps too?", a: "Our focus is Android, which most people in Bangladesh use. If you also need iOS, we'll discuss a cross-platform plan during discovery." },
      { q: "Will you publish the app on Google Play?", a: "Yes. We prepare the store listing, screenshots and privacy policy, and publish under your own Google Play developer account." },
      { q: "Can the app use the same content as my website?", a: "Yes. We connect the app to the same database or API, so anything you publish from the admin panel appears in both." },
    ],
  },
  {
    slug: "social-media",
    title: "Facebook & Social Media",
    short: "Professional Facebook pages, ad campaigns, boosts and monthly social media management.",
    intro:
      "Most customers in Bangladesh find you on Facebook before they ever visit a website. We set up a professional page, design posts that match your brand, and run ads and boosts that are targeted, tracked and reported — so every taka spent has a reason.",
    icon: "megaphone",
    deliverables: [
      "Professional Facebook page setup: name, username, profile, cover, About and call-to-action button",
      "Meta Business Suite and Business Manager setup with safe admin access",
      "Branded post and story templates",
      "Ad account, Meta Pixel and conversion tracking",
      "Targeted ad campaigns and post boosts",
      "Monthly content calendar, page management and performance report",
    ],
    outcomes: [
      { title: "A page people trust", text: "A complete, consistent page makes a strong first impression and answers questions before they are asked." },
      { title: "Ads that reach the right people", text: "Careful targeting and tracking mean your budget goes to people likely to buy, join or enquire." },
      { title: "Clear numbers every month", text: "A plain report on reach, messages, leads and cost — and what we'll change next month." },
    ],
    stack: ["Facebook", "Instagram", "Meta Business Suite", "Facebook Ads Manager", "Meta Pixel", "WhatsApp Business", "Canva", "Figma"],
    idealFor: ["Shops and online sellers", "Restaurants and local services", "Organisations and campaigns", "Personal brands"],
    timeline: "Setup in 3 – 5 days",
    startingFrom: "৳5,000",
    faqs: [
      { q: "Is the ad budget included in your fee?", a: "No. Ad spend is paid directly to Meta from your own card or account, so you always see exactly where the money goes. Our fee covers planning, design, setup and management." },
      { q: "Who owns the page and the ad account?", a: "You do. Everything is created under your business, and we work as a partner with limited access that you can remove at any time." },
      { q: "Can you fix a page that was hacked or restricted?", a: "We can help secure the account, review restrictions and submit appeals through Meta's official channels, though the final decision is Meta's." },
    ],
  },
  {
    slug: "maintenance",
    title: "Care & Maintenance",
    short: "Updates, backups, monitoring and priority support after launch.",
    intro:
      "Launch is the beginning. Our care plans keep your site updated, backed up, secure and improving — with a support portal for every request.",
    icon: "shield",
    deliverables: [
      "Monthly updates and security patches",
      "Automated backups and restore testing",
      "Uptime and error monitoring",
      "Content changes and small improvements",
      "Support tickets through the client portal",
      "Monthly health report",
    ],
    outcomes: [
      { title: "Peace of mind", text: "Problems are caught and fixed before visitors notice." },
      { title: "A team on call", text: "Raise a ticket any time and track it to resolution." },
      { title: "Always improving", text: "Small, steady improvements every month." },
    ],
    stack: ["Client portal", "Uptime monitoring", "Automated backups", "Analytics", "GitHub", "Docker", "Cloudflare", "Vercel", "Render", "SEO"],
    idealFor: ["Any site we've built", "Existing sites that need a caretaker"],
    timeline: "Monthly plan",
    startingFrom: "৳3,000/mo",
    faqs: [
      { q: "Can you maintain a site you didn't build?", a: "Yes, after a short audit to understand the setup and fix any urgent issues." },
      { q: "How fast do you respond to tickets?", a: "Within 24 hours on standard plans; urgent issues are prioritised the same day." },
    ],
  },
];

// Every technology we work with, grouped. The homepage, About page and
// service pages all read from here so they stay consistent.
export const techCategories: { name: string; items: string[] }[] = [
  { name: "Frontend", items: ["Next.js", "React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "shadcn/ui"] },
  { name: "Backend & data", items: ["PostgreSQL", "SQL", "SQLite", "Supabase", "Neon", "Firebase", "NextAuth.js", "Typesense"] },
  { name: "CMS & e-commerce", items: ["WordPress", "WooCommerce", "Sanity CMS", "Payload CMS", "Strapi"] },
  { name: "Hosting & DevOps", items: ["Vercel", "Cloudflare", "Bunny.net", "Render", "Docker", "GitHub"] },
  { name: "Mobile apps", items: ["Android", "Kotlin", "Jetpack Compose", "Room", "Firebase Cloud Messaging", "Google Play Console"] },
  { name: "Email, design & growth", items: ["Resend", "Brevo", "Figma", "Canva", "SEO"] },
  { name: "Social media & ads", items: ["Meta Business Suite", "Facebook Ads Manager", "Meta Pixel", "Instagram", "WhatsApp Business"] },
];

export const allTech = techCategories.flatMap((c) => c.items);

export function getService(slug: string) {
  return services.find((service) => service.slug === slug) ?? null;
}

export const processSteps = [
  { title: "Discover", text: "A short call to understand your goals, audience and constraints. You get a clear written scope and quote." },
  { title: "Design", text: "We sketch the structure and design key pages, mobile first, and refine them with your feedback." },
  { title: "Build", text: "Development in small, reviewable steps with a live preview link you can check any time." },
  { title: "Launch", text: "Testing on real devices, domain and SSL setup, analytics, and a handover session for your team." },
  { title: "Care", text: "Ongoing support through the client portal — updates, fixes and improvements as you grow." },
];

export const values = [
  { title: "Clarity first", text: "Plain language, written scopes and transparent pricing. No surprises." },
  { title: "Mobile first", text: "Most of your visitors are on phones. We design and test for them first." },
  { title: "Built to last", text: "Clean code, modern tools and documentation, so your site ages well." },
  { title: "You own it", text: "Your domain, your code, your accounts — always transferred to you." },
];

export type Package = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

// Indicative starting prices — adjust to your current rates.
export const packages: Package[] = [
  {
    name: "Starter",
    price: "৳15,000",
    description: "A clean, professional presence for individuals and small organisations.",
    features: [
      "Up to 5 pages",
      "Mobile-first responsive design",
      "Contact form with email notifications",
      "Basic SEO setup",
      "Domain, hosting and SSL setup",
      "1 month of free support",
    ],
    cta: "Start a Starter project",
  },
  {
    name: "Business",
    price: "৳35,000",
    description: "A complete website with admin panel, blog and room to grow.",
    features: [
      "Up to 15 pages",
      "Admin panel / CMS",
      "Blog with categories and comments",
      "Advanced SEO and analytics",
      "Performance optimisation",
      "3 months of free support",
    ],
    highlighted: true,
    cta: "Start a Business project",
  },
  {
    name: "Custom",
    price: "Let's talk",
    description: "Web apps, portals and platforms tailored to your exact workflow.",
    features: [
      "Discovery and written specification",
      "User accounts and role-based access",
      "Custom dashboards and integrations",
      "Payment gateway integration",
      "Client portal and support tickets",
      "Dedicated priority support",
    ],
    cta: "Discuss your project",
  },
];

export const carePlans: Package[] = [
  {
    name: "Basic Care",
    price: "৳3,000",
    period: "/month",
    description: "Keep things updated, backed up and secure.",
    features: ["Monthly updates", "Weekly backups", "Uptime monitoring", "1 hour of changes"],
    cta: "Choose Basic Care",
  },
  {
    name: "Growth Care",
    price: "৳7,000",
    period: "/month",
    description: "For active sites that change and grow every month.",
    features: ["Everything in Basic", "Daily backups", "Priority tickets", "4 hours of changes", "Monthly report"],
    highlighted: true,
    cta: "Choose Growth Care",
  },
];

export const faqGroups: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Getting started",
    items: [
      { q: "How do we start a project?", a: "Build your quote on the pricing page — choose a plan, add your details and confirm — or send us a message through the contact page. We'll reply within 24 hours with a written scope and a fixed quote." },
      { q: "What do you need from me?", a: "Your goals, any content you already have (text, logo, photos) and examples of sites you like. We'll guide you through the rest." },
      { q: "How long does a website take?", a: "A simple site typically takes 2–4 weeks; larger sites and web apps take 4–12 weeks depending on scope and how quickly feedback comes back." },
    ],
  },
  {
    title: "Pricing & payment",
    items: [
      { q: "How much does a website cost?", a: "Our packages start from ৳15,000 for a small site. Custom web apps are quoted after a short discovery call. See the pricing page for details." },
      { q: "How do payments work?", a: "Usually 50% to start, and 50% at launch. Larger projects can be split into milestones. We accept bank transfer and mobile banking." },
      { q: "Are there any ongoing costs?", a: "Domain and hosting renew yearly (often low cost or free on modern platforms). Care plans for maintenance are optional." },
    ],
  },
  {
    title: "Working together",
    items: [
      { q: "Will I see progress during the build?", a: "Yes. You get a live preview link that updates as we work, so you can review and comment at every stage." },
      { q: "How do I request changes or get support?", a: "Clients get access to our client portal where you can open support tickets, track their status and see your project's progress." },
      { q: "Do I own the website?", a: "Yes. After final payment, the code, domain and all accounts are fully yours." },
    ],
  },
  {
    title: "Technical",
    items: [
      { q: "Which technologies do you use?", a: "Mostly Next.js, React, TypeScript and PostgreSQL for custom work, WordPress where it's the better fit, and Kotlin with Jetpack Compose for Android apps. Everything is hosted on reliable, modern infrastructure." },
      { q: "Will my site work in Bengali?", a: "Yes — we build bilingual and Bengali-first sites regularly, with proper fonts and search that handles Bengali text." },
      { q: "Is my site going to be secure?", a: "We use HTTPS everywhere, secure authentication, row-level database security, spam protection and regular updates." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Pricing extras — indicative prices, adjust to your current rates.   */
/* ------------------------------------------------------------------ */

export type AddOn = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit?: string;
  /** Social media extras can be ordered with a website or on their own. */
  group?: "social";
  /** Billed every month instead of once. */
  monthly?: boolean;
};

export const addOns: AddOn[] = [
  { id: "page", name: "Extra page", description: "Each additional designed page beyond the package.", price: 2000, unit: "per page" },
  { id: "bilingual", name: "Bengali + English", description: "Full bilingual setup with a language switcher.", price: 8000 },
  { id: "blog", name: "Blog / news section", description: "Categories, tags, search and comments.", price: 6000 },
  { id: "auth", name: "User accounts", description: "Sign up, login, profiles and roles.", price: 10000 },
  { id: "payments", name: "Online payments", description: "bKash, Nagad or SSLCommerz checkout.", price: 12000 },
  { id: "seo", name: "SEO launch pack", description: "Keyword research, metadata, sitemap, Search Console.", price: 5000 },
  { id: "copy", name: "Copywriting", description: "We write the text for your main pages.", price: 1500, unit: "per page" },
  { id: "logo", name: "Logo & brand kit", description: "Logo concepts, colours and typography.", price: 7000 },
  { id: "migration", name: "Content migration", description: "Move posts and pages from your old site.", price: 6000 },
  { id: "fb-page", name: "Facebook page setup", description: "Professional page with profile, cover, About, username and call-to-action button.", price: 5000, group: "social" },
  { id: "social-kit", name: "Social media design kit", description: "Branded templates plus 10 ready-to-post designs.", price: 6000, group: "social" },
  { id: "ads-setup", name: "Ads & boost setup", description: "Ad account, Meta Pixel, audiences and your first campaign.", price: 4000, group: "social" },
  { id: "social-mgmt", name: "Monthly page management", description: "12 posts a month, replies to comments and a monthly report.", price: 8000, unit: "per month", group: "social", monthly: true },
  { id: "ads-mgmt", name: "Monthly ads & boost management", description: "Plan, run and optimise campaigns. Ad spend is paid to Meta separately.", price: 5000, unit: "per month", group: "social", monthly: true },
];

// What's included in each package (true = included, string = detail, false = not included).
export const packageMatrix: { feature: string; values: [boolean | string, boolean | string, boolean | string] }[] = [
  { feature: "Pages", values: ["Up to 5", "Up to 15", "Unlimited"] },
  { feature: "Mobile-first responsive design", values: [true, true, true] },
  { feature: "Contact form with email alerts", values: [true, true, true] },
  { feature: "Admin panel / CMS", values: [false, true, true] },
  { feature: "Blog with categories & comments", values: [false, true, true] },
  { feature: "Bengali + English", values: ["Add-on", true, true] },
  { feature: "SEO setup", values: ["Basic", "Advanced", "Advanced"] },
  { feature: "Analytics", values: [false, true, true] },
  { feature: "User accounts & roles", values: [false, "Add-on", true] },
  { feature: "Payments integration", values: [false, "Add-on", true] },
  { feature: "Client portal & support tickets", values: [false, true, true] },
  { feature: "Free support after launch", values: ["1 month", "3 months", "6 months"] },
  { feature: "Typical timeline", values: ["2–3 weeks", "3–6 weeks", "Scoped"] },
];

export const paymentTerms = [
  { title: "50% to start", text: "Work begins after the written scope is agreed and the first half is paid." },
  { title: "50% at launch", text: "The rest is due when your site is live and you're happy with it." },
  { title: "Milestones for big projects", text: "Larger projects can be split into 3–4 smaller payments." },
  { title: "Bank or mobile banking", text: "Bank transfer, bKash or Nagad — whatever's easiest for you." },
];

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

// Edit freely — shown on the About page.
export const milestones = [
  { year: "2022", title: "Nirdeshona is founded", text: "Started as an initiative to give people and organisations clear direction." },
  { year: "2023", title: "First major web project", text: "Began building and maintaining the website for INS, a Bangladeshi nonprofit." },
  { year: "2025", title: "More clients, more platforms", text: "Community platforms, portfolios and knowledge sites for new clients." },
  { year: "2026", title: "Nirdeshona Web Development", text: "A dedicated studio with a client portal, support tickets and care plans." },
];

export const team = [
  {
    name: "Jahidul Haque Shuvo",
    role: "Founder & Director",
    bio: "Founded Nirdeshona in 2022. Leads strategy, design and development, and works directly with every client.",
    photo: null as string | null,
  },
];

export const comparison: { label: string; us: boolean | string; freelancer: boolean | string; agency: boolean | string }[] = [
  { label: "Written scope & fixed quote", us: true, freelancer: "Sometimes", agency: true },
  { label: "Talk directly to the person building it", us: true, freelancer: true, agency: false },
  { label: "Client portal with progress & tickets", us: true, freelancer: false, agency: "Sometimes" },
  { label: "Mobile-first, Bengali-ready", us: true, freelancer: "Sometimes", agency: "Sometimes" },
  { label: "You own the code and accounts", us: true, freelancer: "Sometimes", agency: "Sometimes" },
  { label: "Support after launch", us: true, freelancer: false, agency: true },
  { label: "Affordable for small organisations", us: true, freelancer: true, agency: false },
];
