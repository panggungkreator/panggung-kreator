export interface PageCapability {
  slug: string;
  label: string;
  group: string;
  hasView: boolean;
  hasCreate: boolean;
  hasEdit: boolean;
  hasDelete: boolean;
}

export const ADMIN_PAGE_REGISTRY: PageCapability[] = [
  { slug: "members",       label: "Membership",       group: "DATA CENTER", hasView: true, hasCreate: false, hasEdit: true,  hasDelete: false },
  { slug: "transactions",  label: "Transactions",      group: "DATA CENTER", hasView: true, hasCreate: false, hasEdit: false, hasDelete: false },
  { slug: "attendance",    label: "Attendance",        group: "DATA CENTER", hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: false },
  { slug: "packages",      label: "Packages",          group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "voucher",       label: "Voucher",           group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "payment",       label: "Payment",           group: "AKADEMI",     hasView: true, hasCreate: false, hasEdit: true,  hasDelete: false },
  { slug: "mentoring",     label: "Mentoring",         group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: false },
  { slug: "resources",     label: "Resources",         group: "AKADEMI",     hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "acara",         label: "Acara & Event",     group: "KOMUNITAS",   hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "venue",         label: "Venue",             group: "KOMUNITAS",   hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "partner",       label: "Partner",           group: "KOMUNITAS",   hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "cms_galeri",    label: "Kelola Galeri",     group: "CMS",         hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
  { slug: "media_library", label: "Media Library",     group: "CMS",         hasView: true, hasCreate: true,  hasEdit: false, hasDelete: true  },
  { slug: "analytics",     label: "Analytics",         group: "ANALYTICS",   hasView: true, hasCreate: false, hasEdit: false, hasDelete: false },
  { slug: "system",        label: "System & Logs",     group: "SYSTEM",      hasView: true, hasCreate: true,  hasEdit: true,  hasDelete: true  },
];
