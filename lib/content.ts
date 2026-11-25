// Locale-aware access to the marketing content in lib/site.ts (+ lib/site-bn.ts).
// Pages call getContent(locale) and get the same shapes in Bangla or English.

import type { Locale } from "./i18n/config";
import * as en from "./site";
import * as bn from "./site-bn";

export function getContent(locale: Locale) {
  if (locale === "en") {
    return {
      site: en.site,
      services: en.services,
      techCategories: en.techCategories,
      processSteps: en.processSteps,
      values: en.values,
      packages: en.packages,
      carePlans: en.carePlans,
      faqGroups: en.faqGroups,
      addOns: en.addOns,
      packageMatrix: en.packageMatrix,
      paymentTerms: en.paymentTerms,
      milestones: en.milestones,
      team: en.team,
      comparison: en.comparison,
    };
  }
  return {
    site: { ...en.site, ...bn.siteBn },
    services: en.services.map((s) => ({ ...s, ...bn.servicesBn[s.slug] })),
    techCategories: en.techCategories.map((c) => ({ ...c, name: bn.techCategoryNamesBn[c.name] ?? c.name })),
    processSteps: bn.processStepsBn,
    values: bn.valuesBn,
    packages: en.packages.map((p, i) => ({ ...p, ...bn.packagesBn[i] })),
    carePlans: en.carePlans.map((p, i) => ({ ...p, ...bn.carePlansBn[i] })),
    faqGroups: bn.faqGroupsBn,
    addOns: en.addOns.map((a) => ({ ...a, ...bn.addOnsBn[a.id] })),
    packageMatrix: bn.packageMatrixBn,
    paymentTerms: bn.paymentTermsBn,
    milestones: bn.milestonesBn,
    team: en.team.map((t, i) => ({ ...t, ...bn.teamBn[i] })),
    comparison: bn.comparisonBn,
  };
}

export type Content = ReturnType<typeof getContent>;

export function getLocalizedService(locale: Locale, slug: string) {
  return getContent(locale).services.find((s) => s.slug === slug) ?? null;
}
