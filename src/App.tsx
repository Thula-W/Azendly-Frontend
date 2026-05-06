import { useState, useEffect, FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import Dashboard from './components/Dashboard/JobDashboard';

function AppContent() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const [formStep, setFormStep] = useState(-1);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [formAnswers, setFormAnswers] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
    setAuthModal({ ...authModal, isOpen: false });
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const handleJoinWaitlist = (e: FormEvent) => {
    e.preventDefault();
    if (userData.name && userData.email) {
      setIsJoined(true);
      setFormStep(0);
    }
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

  const handleSubmitFeedback = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-500/30">
      <Background />
      <Navbar 
        isScrolled={isScrolled} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        openAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onBillingClick={() => navigate('/dashboard?view=billing')}
        isModalOpen={authModal.isOpen || isDashboardModalOpen}
      />

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Problem />
              <Solution />
              <HowItWorks />
              <Pricing openAuth={(mode) => setAuthModal({ isOpen: true, mode })} />
              <Waitlist 
                formStep={formStep}
                userData={userData}
                setUserData={setUserData}
                formAnswers={formAnswers}
                isJoined={isJoined}
                isSubmitted={isSubmitted}
                handleJoinWaitlist={handleJoinWaitlist}
                handleOptionSelect={handleOptionSelect}
                handleSubmitFeedback={handleSubmitFeedback}
                setIsSubmitted={setIsSubmitted}
              />
              <FoundersVision />
            </>
          } />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard onModalToggle={setIsDashboardModalOpen} /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        setMode={(mode) => setAuthModal({ ...authModal, mode })}
        onLogin={handleLogin}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}


