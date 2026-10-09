const toSegments = (id: string): number[] => id.split(".").map(Number);

export const compareCriterionIds = (left: string, right: string): number => {
  const leftSegments = toSegments(left);
  const rightSegments = toSegments(right);
  for (const [index, segment] of leftSegments.entries()) {
    const difference = segment - (rightSegments[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return leftSegments.length - rightSegments.length;
};
