import { motion } from 'motion/react';

export default function Problem() {
  return (
    <section id="problem" className="py-32 px-6 relative overflow-hidden">
      {/* Subtle background glow for problem section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-sm font-bold tracking-[0.3em] text-purple-400 uppercase mb-6">The Problem</h2>
          <h3 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-12 leading-tight max-w-4xl mx-auto uppercase">
            HIRING SHOULDN’T MEAN DIGGING THROUGH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              HUNDREDS OF IRRELEVANT RESUMES.
            </span>
          </h3>
          
          <div className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto space-y-8">
            <p>
              You post a role and within hours resumes start to flood. Most candidates don’t match your requirements. A few seem promising. But finding the right one? It takes hours of manual screening. And while you’re still reviewing resumes… top candidates are already getting offers.
            </p>
            <p className="text-white font-bold border-t border-white/5 pt-8">
              The real cost isn’t just time. <span className="text-cyan-400">It’s missing the best talent.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
