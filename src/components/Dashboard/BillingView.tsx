import React from 'react';
import { ArrowLeft, Check, CreditCard, Plus } from 'lucide-react';

interface BillingViewProps {
  onBack: () => void;
}

export default function BillingView({ onBack }: BillingViewProps) {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for small teams and individuals.',
      features: ['Up to 50 resumes/mo', 'Standard processing', 'Basic filtering'],
      current: true
    },
    {
      name: 'Growth',
      price: '$29',
      description: 'For growing teams with regular needs.',
      features: ['Up to 250 resumes/mo', 'Fast processing', 'Advanced filtering'],
    },
    {
      name: 'Pro',
      price: '$79',
      description: 'For high-volume recruiting operations.',
      features: ['Up to 1000 resumes/mo', 'Priority AI processing', 'Bulk exports'],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Advanced features for large corporations.',
      features: ['Unlimited capacity', 'Custom AI tuning', 'ATS Integrations'],
    }
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0F] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-4">Plans & Subscription</h1>
          <p className="text-gray-400">Choose the right plan for your team's hiring needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative p-8 rounded-[2.5rem] border transition-all ${
                plan.highlight 
                  ? 'bg-gradient-to-b from-purple-500/10 to-cyan-500/10 border-cyan-500/50 shadow-2xl shadow-cyan-500/10' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-cyan-400" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              {plan.current ? (
                <div className="space-y-4">
                  <div className="w-full py-4 px-6 rounded-2xl bg-white/10 text-white font-bold text-center text-sm border border-white/10">
                    Current Plan
                  </div>
                </div>
              ) : (
                <button 
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm transition-all hover:scale-105 shadow-xl ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-cyan-500/20'
                      : 'bg-white text-black shadow-white/5'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade Plan'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
