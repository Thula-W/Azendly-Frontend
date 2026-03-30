export default function FoundersVision() {
  return (
    <section id="founder" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="p-px rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
          <div className="bg-[#0D0D0F] rounded-[calc(1.5rem-1px)] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
            <div className="p-[3px] rounded-2xl bg-gradient-to-br from-purple-500/40 to-cyan-500/40">
              <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-[calc(1rem-3px)] overflow-hidden flex items-center justify-center bg-[#0D0D0F]">
                <img 
                  src="../public/azendly.png" 
                  alt="Azendly Logo" 
                  className="w-3/4 h-auto opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-purple-400 uppercase mb-4">Founder's Vision</h2>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
                FROM THE FOUNDER
              </h3>
              <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                <p>
                  We’re building Azendly to solve a problem we kept seeing over and over again too many resumes, too much time spent screening, and still not enough confidence in the final shortlist.
                </p>
                <p>
                  If you’ve ever had to go through hundreds of resumes just to find a few that might fit, you know how frustrating it can be.
                </p>
                <p>
                  Azendly is our attempt to make that process simpler and more reliable.
                </p>
                <p>
                  If this is something you deal with, we’d genuinely love to hear from you.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px flex-grow bg-white/10" />
                <p className="text-sm font-bold text-white uppercase tracking-widest">Sincerely, The Azendly Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
