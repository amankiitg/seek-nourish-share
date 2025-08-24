export function GridBackground() {
  return (
    <div className="absolute inset-0 grid-background opacity-30 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
    </div>
  );
}