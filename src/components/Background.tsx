export default function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      {/* Floating Cubes (Mockup style) */}
      <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-cyan-500/10 border border-cyan-500/20 rotate-12 blur-sm animate-pulse" />
      <div className="absolute top-[40%] left-[5%] w-24 h-24 bg-purple-500/10 border border-purple-500/20 -rotate-12 blur-sm animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-cyan-500/5 border border-cyan-500/10 rotate-45 blur-sm animate-pulse" style={{ animationDelay: '3s' }} />
      
      {/* Floating Hexagons (Subtle) */}
      <svg className="absolute top-20 right-20 w-64 h-64 text-white/5 animate-pulse" viewBox="0 0 100 100">
        <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
