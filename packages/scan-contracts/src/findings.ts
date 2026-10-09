import { z } from "zod";

export const SEVERITIES = ["critical", "serious", "moderate", "minor"] as const;
export const WCAG_LEVELS = ["A", "AA"] as const;
export const VIEWPORTS = ["desktop", "mobile"] as const;

export const SeveritySchema = z.enum(SEVERITIES);
export type Severity = z.infer<typeof SeveritySchema>;

export const WcagLevelSchema = z.enum(WCAG_LEVELS);
export type WcagLevel = z.infer<typeof WcagLevelSchema>;

export const ViewportSchema = z.enum(VIEWPORTS);
export type Viewport = z.infer<typeof ViewportSchema>;

export const UNDERSTANDING_BASE_URL =
  "https://www.w3.org/WAI/WCAG22/Understanding/";

export const CriterionRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: WcagLevelSchema,
  understandingUrl: z.url().startsWith(UNDERSTANDING_BASE_URL),
});
export type CriterionRef = z.infer<typeof CriterionRefSchema>;

const NodeFindingSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  criteria: z.array(CriterionRefSchema).min(1),
  pageUrl: z.string(),
  selector: z.string(),
  html: z.string(),
  viewports: z.array(ViewportSchema).min(1),
});

export const ViolationSchema = NodeFindingSchema.extend({
  level: WcagLevelSchema,
  severity: SeveritySchema,
  description: z.string(),
  fixGuidance: z.string(),
});
export type Violation = z.infer<typeof ViolationSchema>;

export const ReviewItemSchema = NodeFindingSchema.extend({
  guidance: z.string(),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

export const CHECK_SCOPES = ["page", "site"] as const;
export const CheckScopeSchema = z.enum(CHECK_SCOPES);
export type CheckScope = z.infer<typeof CheckScopeSchema>;

export const ManualCheckSchema = z.object({
  criterion: CriterionRefSchema,
  scope: CheckScopeSchema,
  pages: z.array(z.string()),
  guidance: z.string(),
});
export type ManualCheck = z.infer<typeof ManualCheckSchema>;
