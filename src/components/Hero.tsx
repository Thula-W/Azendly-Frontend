import { motion } from 'motion/react';
import { scrollToWaitlist } from '../lib/scrollToWaitlist';

export default function Hero({ onGetStarted }){
  return ( 
    <section className="pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-5xl mx-auto">
            STOP WASTING HOURS<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              ON RESUMES THAT DON'T MATCH.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-8">
            Azendly ranks candidates based on your requirements so you can focus only on the ones that actually match.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="gradient-border px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20"
            >
              GET STARTED FOR FREE
            </button>
            {/* <p className="text-sm text-gray-500 font-medium animate-pulse">
              Takes only 10 seconds
            </p> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
