import { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { FORM_STEPS } from '../constants';

interface WaitlistProps {
  formStep: number;
  userData: { name: string; email: string };
  setUserData: (data: { name: string; email: string }) => void;
  formAnswers: string[];
  isJoined: boolean;
  isSubmitted: boolean;
  isJoiningWaitlist: boolean;
  verificationPending: boolean;
  isVerifyingFromLink: boolean;
  verifyLinkError: string | null;
  joinError: string | null;
  handleJoinWaitlist: (e: FormEvent) => void;
  handleRetryVerification: () => void;
  handleOptionSelect: (option: string) => void;
  handleSubmitFeedback: (e: FormEvent) => void;
  setIsSubmitted: (submitted: boolean) => void;
}

export default function Waitlist({
  formStep,
  userData,
  setUserData,
  formAnswers,
  isJoined,
  isSubmitted,
  isJoiningWaitlist,
  verificationPending,
  isVerifyingFromLink,
  verifyLinkError,
  joinError,
  handleJoinWaitlist,
  handleRetryVerification,
  handleOptionSelect,
  handleSubmitFeedback,
  setIsSubmitted
}: WaitlistProps) {
  return (
    <section id="early-access" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-px rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
          <div className="bg-[#111113] rounded-[calc(1.5rem-1px)] p-8 md:p-16 relative overflow-hidden">
            {/* Form Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] -z-10" />

            <div className="text-center mb-12">
              {isVerifyingFromLink ? (
                <>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight text-white">
                    CONFIRMING YOUR <br className="md:hidden" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                      EMAIL
                    </span>
                  </h3>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    One moment while we verify your link…
                  </p>
                </>
              ) : verificationPending ? (
                <>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight text-white">
                    VERIFY YOUR <br className="md:hidden" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                      EMAIL
                    </span>
                  </h3>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    We sent a confirmation link to <span className="text-white font-medium">{userData.email}</span>. Open it to unlock the next step.
                  </p>
                </>
              ) : !isJoined ? (
                <>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight text-white">
                    BE THE FIRST TO <br className="md:hidden"  />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                      HIRE FASTER.
                    </span>
                  </h3>
                  <div className="space-y-4">
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                      Join the Azendly waitlist and get early access to smarter resume screening before everyone else.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight text-white">
                    HELP US MAKE AZENDLY <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                      BETTER FOR YOU.
                    </span>
                  </h3>
                  <p className="text-xl text-cyan-400 font-bold tracking-widest uppercase">
                    You’re in. Early access secured.
                  </p>
                </>
              )}
            </div>

            {!isSubmitted ? (
              <div>
                {isVerifyingFromLink ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto text-center py-12 flex flex-col items-center gap-6"
                  >
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" aria-hidden />
                    <p className="text-gray-500 text-sm">Securing your spot on the waitlist</p>
                  </motion.div>
                ) : verificationPending ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto text-center space-y-8 py-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
                      <Mail className="w-10 h-10 text-cyan-400" aria-hidden />
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      After you verify, this page will continue with a few quick questions. You can close this tab and use the link from your email, or try again with a different address below.
                    </p>
                    <button
                      type="button"
                      onClick={handleRetryVerification}
                      className="w-full py-4 rounded-2xl border border-white/15 text-white font-semibold hover:bg-white/5 transition-colors"
                    >
                      Try again with another email
                    </button>
                  </motion.div>
                ) : formStep === -1 ? (
                  <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleJoinWaitlist}
                    className="space-y-6 max-w-md mx-auto"
                  >
                    {(joinError || verifyLinkError) && (
                      <p className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3" role="alert">
                        {joinError ?? verifyLinkError}
                      </p>
                    )}
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          placeholder="Name"
                          value={userData.name}
                          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="email" 
                          required
                          placeholder="Email Address"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isJoiningWaitlist}
                      aria-busy={isJoiningWaitlist}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest disabled:opacity-70 disabled:pointer-events-none disabled:hover:scale-100 inline-flex items-center justify-center gap-2"
                    >
                      {isJoiningWaitlist && (
                        <Loader2 className="w-5 h-5 shrink-0 animate-spin" aria-hidden />
                      )}
                      {isJoiningWaitlist ? 'Joining…' : 'GET EARLY ACCESS'}
                    </button>
                    <p className="text-center text-sm text-gray-500 leading-relaxed">
                      Get early access when we launch. No spam just important updates and your invite.
                    </p>
                  </motion.form>
                ) : (
                  <div>
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-12 max-w-xs mx-auto">
                      {FORM_STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                              formStep >= idx ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' : 'bg-white/5 text-gray-500'
                            }`}
                          >
                            {formStep > idx ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                          </div>
                          {idx < FORM_STEPS.length - 1 && (
                            <div className={`h-[2px] w-8 md:w-12 mx-2 transition-all duration-500 ${
                              formStep > idx ? 'bg-cyan-500' : 'bg-white/5'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={formStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="text-center space-y-2 mb-8">
                          <h4 className="text-xl md:text-2xl font-medium">
                            {FORM_STEPS[formStep].question}
                          </h4>
                        </div>
                        <div className="grid gap-4">
                          {FORM_STEPS[formStep].options.map((option) => (
                            <label
                              key={option}
                              className={`flex items-center gap-4 w-full p-5 rounded-2xl border cursor-pointer transition-all ${
                                formAnswers[formStep] === option 
                                  ? 'bg-white/10 border-cyan-500/50 text-white' 
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                formAnswers[formStep] === option ? 'border-cyan-400' : 'border-gray-600'
                              }`}>
                                {formAnswers[formStep] === option && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                )}
                              </div>
                              <input 
                                type="radio" 
                                name={`step-${formStep}`} 
                                className="hidden" 
                                checked={formAnswers[formStep] === option}
                                onChange={() => handleOptionSelect(option)}
                              />
                              <span className="text-lg">{option}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-12 text-center">
                      <p className="text-sm text-gray-500 mb-6 italic">Only takes 10 seconds </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                          onClick={handleSubmitFeedback}
                          disabled={formAnswers.length < FORM_STEPS.length}
                          className={`px-8 py-4 rounded-full font-bold transition-all ${
                            formAnswers.length === FORM_STEPS.length 
                              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-105' 
                              : 'bg-white/5 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          SUBMIT
                        </button>
                        <button 
                          onClick={() => setIsSubmitted(true)}
                          className="text-gray-500 hover:text-white transition-colors text-sm font-medium"
                        >
                          Skip for now
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                </div>
                <h4 className="text-3xl font-bold mb-4">Thanks you’re all set.</h4>
                <p className="text-gray-400 text-lg">
                  We’ll be in touch soon with your early access.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
