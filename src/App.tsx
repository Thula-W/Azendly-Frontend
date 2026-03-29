/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { FORM_STEPS } from './constants';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Waitlist from './components/Waitlist';
import FoundersVision from './components/FoundersVision';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { verifyWaitlistToken } from './lib/verifyWaitlist';
import { scrollToWaitlist } from './lib/scrollToWaitlist';

function shouldVerifyFromEmailLink(): boolean {
  if (typeof window === 'undefined') return false;
  const p = new URLSearchParams(window.location.search);
  return p.get('waitlist_verify') === '1' && !!p.get('token');
}

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const [formStep, setFormStep] = useState(-1); // -1 for Name/Email step
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [formAnswers, setFormAnswers] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isVerifyingFromLink, setIsVerifyingFromLink] = useState(shouldVerifyFromEmailLink);
  const [verifyLinkError, setVerifyLinkError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Email links: same scroll as “JOIN THE WAITLIST”; one delayed pass after paint in case layout isn’t ready yet.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasVerifyParams = params.get('waitlist_verify') === '1' && !!params.get('token');
    const hasWaitlistHash = window.location.hash === '#early-access';
    if (!hasVerifyParams && !hasWaitlistHash) return;

    scrollToWaitlist();
    const t = window.setTimeout(scrollToWaitlist, 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (params.get('waitlist_verify') !== '1' || !token) return;

    let cancelled = false;

    (async () => {
      const result = await verifyWaitlistToken(token);
      if (cancelled) return;

      const stripVerifyParams = () => {
        params.delete('waitlist_verify');
        params.delete('token');
        const rest = params.toString();
        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`
        );
      };

      if (result.ok === false) {
        setVerifyLinkError(result.error);
        setIsVerifyingFromLink(false);
        stripVerifyParams();
        requestAnimationFrame(() => scrollToWaitlist());
        return;
      }

      setUserData((prev) => ({ ...prev, email: result.email }));
      setIsJoined(true);
      setFormStep(0);
      setVerificationPending(false);
      setIsVerifyingFromLink(false);
      stripVerifyParams();
      requestAnimationFrame(() => scrollToWaitlist());
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleJoinWaitlist = async (e: FormEvent) => {
    e.preventDefault();
    setIsJoiningWaitlist(true);
    setJoinError(null);
    setVerifyLinkError(null);
    try {
      const anonKey = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(
        "https://swdrghckoedbyhtjttrv.supabase.co/functions/v1/join-waitlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`
          },
          body: JSON.stringify(userData)
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setVerificationPending(true);
        return;
      }

      setJoinError(typeof data.error === 'string' ? data.error : 'Could not join the waitlist. Try again.');
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const handleRetryVerification = () => {
    setVerificationPending(false);
    setJoinError(null);
    setVerifyLinkError(null);
    setUserData({ name: '', email: '' });
  };

  const handleOptionSelect = (option: string) => {
    const currentStep = FORM_STEPS[formStep];
    const newAnswers = [...formAnswers];
    
    if (currentStep.multiSelect) {
      const currentAnswers = Array.isArray(newAnswers[formStep]) ? newAnswers[formStep] : [];
      if (currentAnswers.includes(option)) {
        newAnswers[formStep] = currentAnswers.filter((a: string) => a !== option);
      } else {
        newAnswers[formStep] = [...currentAnswers, option];
      }
    } else {
      newAnswers[formStep] = option;
      if (formStep < FORM_STEPS.length - 1) {
        setTimeout(() => setFormStep(formStep + 1), 300);
      }
    }
    
    setFormAnswers(newAnswers);
  };

  const handleNextStep = () => {
    if (formStep < FORM_STEPS.length - 1) {
      setFormStep(formStep + 1);
    }
  };

  const handleSubmitFeedback = async () => {
    const anonKey = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY;

    try {
      await fetch(
        "https://swdrghckoedbyhtjttrv.supabase.co/functions/v1/submit-answers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`
          },
          body: JSON.stringify({
            email: userData.email,
            answers: formAnswers
          })
        }
      );
    } catch (error) {
      console.error('Failed to submit feedback answers', error);
    } finally {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-500/30">
      <Background />
      <Navbar 
        isScrolled={isScrolled} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        openAuth={(mode) => setAuthModal({ isOpen: true, mode })}
      />

      <main className="relative z-10">
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        {/*<Pricing openAuth={(mode) => setAuthModal({ isOpen: true, mode })} /> */}
        <Waitlist 
          formStep={formStep}
          userData={userData}
          setUserData={setUserData}
          formAnswers={formAnswers}
          isJoined={isJoined}
          isSubmitted={isSubmitted}
          isJoiningWaitlist={isJoiningWaitlist}
          verificationPending={verificationPending}
          isVerifyingFromLink={isVerifyingFromLink}
          verifyLinkError={verifyLinkError}
          joinError={joinError}
          handleJoinWaitlist={handleJoinWaitlist}
          handleRetryVerification={handleRetryVerification}
          handleOptionSelect={handleOptionSelect}
          handleSubmitFeedback={handleSubmitFeedback}
          setIsSubmitted={setIsSubmitted}
        />
        <FoundersVision />
      </main>

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        setMode={(mode) => setAuthModal({ ...authModal, mode })}
      />

      <Footer />
    </div>
  );
}

