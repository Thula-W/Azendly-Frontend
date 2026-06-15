import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut, LayoutDashboard, CreditCard } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

interface NavbarProps {
  isScrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  openAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onBillingClick?: () => void;
  isModalOpen?: boolean;
}

export default function Navbar({ isScrolled, mobileMenuOpen, setMobileMenuOpen, openAuth, isAuthenticated, onLogout, onBillingClick, isModalOpen }: NavbarProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isBilling = searchParams.get('view') === 'billing';
  const isDashboard = location.pathname === '/dashboard' && !isBilling;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-4'
        } ${isModalOpen ? 'hidden lg:hidden' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/azendly.png" alt="Azendly Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {!isAuthenticated ? (
              NAV_LINKS.map(link => {
                if (link.name === 'Login') {
                  return (
                    <button 
                      key={link.name} 
                      onClick={() => openAuth('login')}
                      className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </button>
                  );
                }
                if (link.name === 'Get Started') {
                  return (
                    <button 
                      key={link.name} 
                      onClick={() => openAuth('signup')}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                    >
                      {link.name}
                    </button>
                  );
                }
                return (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {link.name}
                  </a>
                );
              })
            ) : (
              <div className="flex items-center gap-6">
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium flex items-center gap-2 transition-colors ${isDashboard ? 'text-cyan-400' : 'text-white'}`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                {/* <button 
                  onClick={onBillingClick}
                  className={`text-sm font-medium transition-colors flex items-center gap-2 ${isBilling ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <CreditCard size={16} />
                  Billing
                </button> */}
                <button 
                  onClick={onLogout}
                  className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0B] pt-24 pb-12 px-6 lg:hidden max-h-[80vh] overflow-y-auto custom-scrollbar border-b border-white/10"
          >
            <div className="flex flex-col gap-6">
              {!isAuthenticated ? (
                NAV_LINKS.map(link => (
                  <button 
                    key={link.name} 
                    onClick={() => {
                      if (link.name === 'Login') openAuth('login');
                      else if (link.name === 'Get Started') openAuth('signup');
                      else {
                        const el = document.querySelector(link.href);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`text-2xl font-bold border-b border-white/5 pb-4 text-left ${
                      link.highlight 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400' 
                        : link.name === 'Login'
                          ? 'text-gray-400'
                          : 'text-white'
                    }`}
                  >
                    {link.name}
                  </button>
                ))
              ) : (
                <>
                  <Link 
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-2xl font-bold border-b border-white/5 pb-4 text-left flex items-center justify-between ${isDashboard ? 'text-cyan-400' : 'text-white'}`}
                  >
                    Dashboard
                    <LayoutDashboard size={24} />
                  </Link>
                  <button 
                    onClick={() => {
                      onBillingClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className={`text-2xl font-bold border-b border-white/5 pb-4 text-left flex items-center justify-between ${isBilling ? 'text-cyan-400' : 'text-white'}`}
                  >
                    Billing
                    <CreditCard size={24} />
                  </button>
                  <button 
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-2xl font-bold border-b border-white/5 pb-4 text-left text-red-400 flex items-center justify-between"
                  >
                    Logout
                    <LogOut size={24} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
