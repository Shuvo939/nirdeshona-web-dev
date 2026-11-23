// Central site configuration and marketing content.
// Edit copy, services, packages and FAQs here — pages read from this file.

export const site = {
  name: "Nirdeshona Web",
  legalName: "Nirdeshona Web Development",
  tagline: "Websites, web apps and digital products that work for real people.",
  description:
    "Nirdeshona Web Development builds fast, modern websites, web applications and WordPress solutions for organisations, businesses and individuals.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://web.nirdeshona.com",
  email: "contact.nirdeshona@gmail.com",
  location: "Dhaka, Bangladesh",
  founded: 2022,
};

export type ServiceSlug =
  | "web-development"
  | "wordpress"
  | "design"
  | "custom-development"
  | "ecommerce"
  | "maintenance";

export type Service = {
  slug: ServiceSlug;
  title: string;
  short: string;
  intro: string;
  icon: "code" | "globe" | "palette" | "cpu" | "cart" | "shield";
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
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase", "Vercel", "Cloudflare"],
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
    stack: ["WordPress", "PHP", "ACF", "Gutenberg", "WooCommerce", "Cloudflare"],
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
    stack: ["Figma", "Design systems", "Prototyping", "Accessibility (WCAG)"],
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
    stack: ["Next.js", "PostgreSQL", "Row-level security", "Resend", "Cloudflare R2", "REST APIs"],
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
    stack: ["Next.js", "WooCommerce", "SSLCommerz", "bKash", "PostgreSQL"],
    idealFor: ["Retail brands", "Home businesses", "Bookshops", "Digital products"],
    timeline: "3 – 8 weeks",
    startingFrom: "৳35,000",
    faqs: [
      { q: "Which payment gateways do you support?", a: "We commonly integrate SSLCommerz, bKash, Nagad and cash on delivery. Others are possible on request." },
      { q: "Can I import my existing product list?", a: "Yes — we can import products from a spreadsheet or your current platform." },
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
    stack: ["Client portal", "Uptime monitoring", "Automated backups", "Analytics"],
    idealFor: ["Any site we've built", "Existing sites that need a caretaker"],
    timeline: "Monthly plan",
    startingFrom: "৳3,000/mo",
    faqs: [
      { q: "Can you maintain a site you didn't build?", a: "Yes, after a short audit to understand the setup and fix any urgent issues." },
      { q: "How fast do you respond to tickets?", a: "Within one business day on standard plans; urgent issues are prioritised the same day." },
    ],
  },
];

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
      { q: "How do we start a project?", a: "Send us a message through the contact page with a short description of what you need. We'll reply within one business day to schedule a quick call and then send a written scope and quote." },
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
      { q: "Which technologies do you use?", a: "Mostly Next.js, React, TypeScript and PostgreSQL for custom work, and WordPress where it's the better fit. Everything is hosted on reliable, modern infrastructure." },
      { q: "Will my site work in Bengali?", a: "Yes — we build bilingual and Bengali-first sites regularly, with proper fonts and search that handles Bengali text." },
      { q: "Is my site going to be secure?", a: "We use HTTPS everywhere, secure authentication, row-level database security, spam protection and regular updates." },
    ],
  },
];
