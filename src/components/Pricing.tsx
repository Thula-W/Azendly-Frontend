import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface PricingProps {
  openAuth: (mode: 'login' | 'signup') => void;
}

export default function Pricing({ openAuth }: PricingProps) {
  const plans = [
    {
      name: "STARTER",
      price: "$X",
      description: "For individuals or occasional hiring",
      features: [
        "Up to X resumes / month",
        "Rank candidates based on job requirements",
        "Basic filtering",
        "Downloadable reports",
        "Email support"
      ],
      cta: "Get Started",
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10"
    },
    {
      name: "GROWTH",
      price: "$X",
      description: "For teams hiring regularly",
      features: [
        "Up to X resumes / month",
        "Advanced ranking & filtering",
        "Faster processing",
        "Saved report history",
        "Priority email support"
      ],
      cta: "Get Started",
      popular: true,
      color: "text-blue-400",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/10"
    },
    {
      name: "SCALE",
      price: "Custom",
      description: "For high-volume hiring teams and agencies",
      features: [
        "High or unlimited resume capacity",
        "Advanced filtering & customization",
        "Integrations (ATS, workflows)",
        "Dedicated support",
        "Custom requirements"
      ],
      cta: "Contact Us",
      color: "text-purple-400",
      border: "border-purple-500/20",
      glow: "shadow-purple-500/10"
    }
  ];

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-[0.3em] text-cyan-400 uppercase mb-6">Pricing</h2>
          <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Pricing based on your hiring volume
          </h3>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose a plan based on how many resumes you screen each month.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-px rounded-3xl bg-gradient-to-br ${
                plan.popular ? 'from-blue-500/40 to-purple-500/40' : 'from-white/10 to-white/5'
              }`}
            >
              <div className="bg-[#0D0D0F] rounded-[calc(1.5rem-1px)] p-8 h-full flex flex-col">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h4 className={`text-sm font-bold tracking-[0.2em] mb-4 ${plan.color}`}>{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-gray-500 font-medium">/ month</span>}
                  </div>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                      <Check className={`w-5 h-5 shrink-0 ${plan.color}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative group/btn">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
                  <button 
                    onClick={() => openAuth(plan.cta === 'Contact Us' ? 'signup' : 'signup')}
                    className={`relative w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-[1.02]' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-6">
          <p className="text-gray-500 text-sm italic">
            Need more resumes? You can upgrade anytime.
          </p>
          <p className="text-gray-400 font-medium">
              No hidden fees. Cancel anytime.
            </p>
        </div>
      </div>
    </section>
  );
}
