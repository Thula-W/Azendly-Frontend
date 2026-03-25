import { motion } from 'motion/react';

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload resumes",
      desc: "Drop in a batch of resumes.",
      color: "text-purple-400",
      bg: "bg-purple-400/5",
      border: "border-purple-400/10",
      glow: "shadow-[0_0_40px_rgba(192,132,252,0.1)]"
    },
    {
      step: "02",
      title: "Define what you need",
      desc: "Set the key skills, experience, and requirements.",
      color: "text-indigo-400",
      bg: "bg-indigo-400/5",
      border: "border-indigo-400/10",
      glow: "shadow-[0_0_40px_rgba(232,121,249,0.1)]"
    },
    {
      step: "03",
      title: "Get ranked candidates",
      desc: "See a clear list of the top talents.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/5",
      border: "border-cyan-400/10",
      glow: "shadow-[0_0_40px_rgba(34,211,238,0.1)]"
    }
  ];

  return (
    <section id="how-it-works" className="py-40 px-10 md:px-20 lg:px-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-28">
          <h2 className="text-sm font-bold tracking-[0.4em] text-purple-400 uppercase mb-6">How it works</h2>
          <h3 className="text-5xl md:text-7xl font-black tracking-tighter">THREE SIMPLE STEPS.</h3>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="relative p-px rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-purple-500/20 to-cyan-500/20 hover:from-purple-500/40 hover:to-cyan-500/40 transition-all duration-500"
            >
              <div className="relative p-6 md:p-12 rounded-3xl md:rounded-[2.5rem] bg-[#0D0D0F] h-full group overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row lg:flex-col items-start gap-4 md:gap-8">
                  <div className="flex flex-row items-center gap-4 md:block shrink-0">
                    <span className={`text-4xl md:text-6xl font-black tracking-tighter ${item.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                      {item.step}
                    </span>
                    <h4 className="md:hidden text-xl font-bold group-hover:text-white transition-colors tracking-tight">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex-1">
                    <h4 className="hidden md:block text-2xl font-bold mb-4 group-hover:text-white transition-colors tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed text-left">
                      {item.desc}
                    </p>
                  </div>
                </div>
                
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
