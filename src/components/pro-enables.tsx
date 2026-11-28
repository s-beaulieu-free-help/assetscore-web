export const PRO_ENABLES = [
  "Evaluate more investment opportunities.",
  "Discover companies matching your criteria.",
  "Understand your portfolio's strengths and weaknesses.",
  "Compare investments using a consistent analytical framework.",
] as const;

export function ProEnables({ className = "" }: { className?: string }) {
  return (
    <ul className={`space-y-2 text-sm leading-6 text-foreground ${className}`}>
      {PRO_ENABLES.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
