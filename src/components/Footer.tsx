import { Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <img src="../assests/azendly.png" alt="Azendly Logo" className="h-8 w-auto opacity-50" />
        </div>
        
        <div className="text-sm text-gray-500 font-medium tracking-wide">
          &copy; 2026 Azendly. All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <a href="https://www.linkedin.com/company/azendly/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="mailto:azendly.ai@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
