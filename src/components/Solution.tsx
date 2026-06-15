import { motion } from 'motion/react';
import { Search, UserCheck, Target } from 'lucide-react';

export default function Solution() {
  const items = [
    { 
      text: "No more digging through irrelevant resumes.", 
      icon: Search,
      iconColor: "text-purple-400"
    },
    { 
      text: "No more missing top candidates.", 
      icon: UserCheck,
      iconColor: "text-indigo-400"
    },
    { 
      text: "Save your time and hire faster than your competitors.", 
      icon: Target,
      iconColor: "text-cyan-400"
    }
  ];

  return (
    <section id="solution" className="py-32 px-6 bg-white/[0.02] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-sm font-bold tracking-[0.3em] text-cyan-400 uppercase mb-6">The Solution</h2>
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-12 leading-tight">
            STOP READING <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">EVERY RESUME.</span>
          </h3>
          <div className="space-y-8 text-xl md:text-2xl text-gray-400 leading-relaxed max-w-5xl mx-auto">
            <p className="text-white font-medium max-w-3xl mx-auto">
              Azendly ranks candidates based on your requirements, so you can quickly identify the best fits without manual screening.
            </p>
            
            <div className="grid lg:grid-cols-3 gap-8 py-8">
              {items.map((item, i) => (
                <div key={i} className="relative group p-px rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/50 hover:to-purple-500/50 transition-all duration-500">
                  <div className="bg-[#0D0D0F] rounded-[calc(1.5rem-1px)] p-6 md:p-10 h-full flex flex-row lg:flex-col items-start lg:items-start text-left gap-6">
                    <div className={`p-4 rounded-2xl bg-white/5 ${item.iconColor} shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                      <item.icon size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-lg md:text-2xl font-bold text-white leading-tight tracking-tight">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">
              Shortlist faster. Hire before your competitors do.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
