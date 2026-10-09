import { VIEWPORTS, type Viewport } from "@refresh/scan-contracts/findings";

type ViewportFinding = { id: string; viewports: Viewport[] };

const unionViewports = (
  left: readonly Viewport[],
  right: readonly Viewport[],
): Viewport[] =>
  VIEWPORTS.filter(
    (viewport) => left.includes(viewport) || right.includes(viewport),
  );

export const mergeViewports = <T extends ViewportFinding>(
  findings: readonly T[],
): T[] => {
  const merged = new Map<string, T>();
  for (const finding of findings) {
    const existing = merged.get(finding.id);
    const viewports = existing
      ? unionViewports(existing.viewports, finding.viewports)
      : finding.viewports;
    merged.set(finding.id, { ...(existing ?? finding), viewports });
  }
  return [...merged.values()];
};
