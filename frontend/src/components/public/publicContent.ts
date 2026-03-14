export type DetailSlug =
  | "strict-school-isolation"
  | "central-provisioning"
  | "finance-and-analytics"
  | "feature-controls"
  | "academic-operations"
  | "role-based-team-setup"
  | "daily-insight"
  | "built-to-grow";

export type PlanSlug = "starter" | "growth" | "enterprise";

export interface DetailContent {
  slug: DetailSlug;
  title: string;
  eyebrow: string;
  summary: string;
  points: string[];
  outcomes: string[];
}

export interface PlanContent {
  slug: PlanSlug;
  name: string;
  price: string;
  billingBasis: string;
  summary: string;
  included: string[];
  recommendedFor: string;
}

export const detailPages: Record<DetailSlug, DetailContent> = {
  "strict-school-isolation": {
    slug: "strict-school-isolation",
    eyebrow: "Tenant Security",
    title: "Strict school isolation",
    summary: "Each school operates inside its own tenant boundary so one institution never bleeds into another.",
    points: [
      "Tenant-aware access is enforced across users, operational modules, and analytics visibility.",
      "Platform owners can manage many schools from one system without mixing tenant data.",
      "This model supports private schools, campus groups, and expanding education businesses."
    ],
    outcomes: ["Cleaner governance", "Safer multi-school operations", "Production-ready tenant boundaries"]
  },
  "central-provisioning": {
    slug: "central-provisioning",
    eyebrow: "Platform Operations",
    title: "Central provisioning",
    summary: "Super admins create schools, assign subscription plans, and launch the first school admin from a single control layer.",
    points: [
      "New tenants are created intentionally, not through public sign-up.",
      "Plan selection, feature enablement, and tenant activation happen at onboarding time.",
      "School admins can then continue setup inside their own dashboard."
    ],
    outcomes: ["Cleaner school onboarding", "Better governance", "More predictable expansion"]
  },
  "finance-and-analytics": {
    slug: "finance-and-analytics",
    eyebrow: "Insights",
    title: "Finance and analytics",
    summary: "Acadex turns fees, collections, attendance, and academic performance into one operating picture.",
    points: [
      "Track invoicing, payments, and outstanding balances by school tenant.",
      "Expose dashboards that help admins see activity without stitching together reports manually.",
      "Move from isolated records to leadership-level visibility."
    ],
    outcomes: ["Faster reporting", "More confident decisions", "Better fee visibility"]
  },
  "feature-controls": {
    slug: "feature-controls",
    eyebrow: "Monetization",
    title: "Feature controls",
    summary: "Plans and feature flags allow the platform to scale commercially without forking the product.",
    points: [
      "Enable modules such as analytics, finance, SMS, or parent access by subscription plan.",
      "Keep a single codebase while tailoring value by customer segment.",
      "Roll out advanced modules as schools grow."
    ],
    outcomes: ["Plan-based packaging", "Controlled rollouts", "Cleaner SaaS operations"]
  },
  "academic-operations": {
    slug: "academic-operations",
    eyebrow: "School Workflow",
    title: "Academic operations",
    summary: "Classes, attendance, grading, reports, and school communication stay connected inside one workspace.",
    points: [
      "School admins and staff manage academic structure from the same dashboard.",
      "Attendance, examinations, and report workflows stay aligned with class setup.",
      "This reduces tool-switching and keeps school data consistent."
    ],
    outcomes: ["Better daily coordination", "Less admin friction", "Stronger academic visibility"]
  },
  "role-based-team-setup": {
    slug: "role-based-team-setup",
    eyebrow: "School Users",
    title: "Role-based team setup",
    summary: "School admins can add teachers, students, parents, and other school-level users inside their own tenant.",
    points: [
      "The school team grows from inside the tenant dashboard instead of through public registration.",
      "Roles align access with responsibility.",
      "This keeps onboarding secure and easier to govern."
    ],
    outcomes: ["Controlled user creation", "Cleaner permissions", "Safer school onboarding"]
  },
  "daily-insight": {
    slug: "daily-insight",
    eyebrow: "Operations",
    title: "Daily insight",
    summary: "Key school activity is visible at a glance so admins can respond quickly to what matters today.",
    points: [
      "View attendance movement, announcements, fee status, and exam activity in one place.",
      "Reduce blind spots in daily school management.",
      "Support both strategic review and operational follow-through."
    ],
    outcomes: ["Faster intervention", "Stronger visibility", "Less reactive management"]
  },
  "built-to-grow": {
    slug: "built-to-grow",
    eyebrow: "Scalability",
    title: "Built to grow",
    summary: "Acadex supports the move from small operational setups to a more structured school operating system.",
    points: [
      "Start with core modules and expand into finance, analytics, and feature-flagged experiences.",
      "Support growth from one school to many without rebuilding the foundation.",
      "Keep the product aligned with long-term platform goals."
    ],
    outcomes: ["Lower transition risk", "Better scalability", "Longer product lifespan"]
  }
};

export const planPages: Record<PlanSlug, PlanContent> = {
  starter: {
    slug: "starter",
    name: "Starter",
    price: "D100 per student",
    billingBasis: "Billed in Gambian dalasi by active student count",
    summary: "A focused entry plan for one school in The Gambia beginning its move into a structured digital workflow.",
    included: [
      "Student records and class management",
      "Attendance tracking and announcements",
      "School admin access for daily operations"
    ],
    recommendedFor: "Independent schools starting with essential operations"
  },
  growth: {
    slug: "growth",
    name: "Growth",
    price: "D150 per personnel",
    billingBasis: "Billed in Gambian dalasi by school personnel count",
    summary: "A broader operating plan for schools that need finance, dashboards, and stronger admin control.",
    included: [
      "Teacher and staff management",
      "Finance module and payment tracking",
      "Advanced dashboards and reporting"
    ],
    recommendedFor: "Growing schools ready for deeper management visibility"
  },
  enterprise: {
    slug: "enterprise",
    name: "Enterprise",
    price: "Custom blended pricing",
    billingBasis: "Priced in Gambian dalasi by student count, personnel count, or both",
    summary: "A tailored rollout for larger institutions, multi-school operators, or complex implementation needs.",
    included: [
      "Multi-school rollout and central oversight",
      "Custom feature enablement and analytics",
      "Priority onboarding and implementation support"
    ],
    recommendedFor: "Campus groups, education networks, and platform-scale operators"
  }
};
