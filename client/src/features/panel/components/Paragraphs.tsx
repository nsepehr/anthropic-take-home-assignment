/** Plain-text detail split on blank lines into paragraphs; no markdown. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <div className={className}>
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
