import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../constants';

interface NavbarProps {
  isScrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  openAuth: (mode: 'login' | 'signup') => void;
}

export default function Navbar({ isScrolled, mobileMenuOpen, setMobileMenuOpen, openAuth }: NavbarProps) {
  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <img src="../assets/azendly.png" alt="Azendly Logo" className="h-10 w-auto" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(link => {
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
              if (link.highlight) {
                return (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                  >
                    {link.name}
                  </a>
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
            })}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0B] pt-24 pb-12 px-6 lg:hidden max-h-[80vh] overflow-y-auto custom-scrollbar border-b border-white/10"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map(link => (
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
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
