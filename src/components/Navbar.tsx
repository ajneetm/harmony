import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAppState } from '../store';
import { translations } from '../utils';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language } = useAppState();
  const t = translations[language];

  // مراقبة التمرير لتغيير خلفية الـ Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'لماذا هارموني', href: '#why-harmony' },
    { name: 'ماذا يختلف', href: '#differentiation' },
    { name: 'كيف يعمل', href: '#how-it-works' },
    { name: 'الاستفادة', href: '#benefits' },
    { name: 'المبتكر', href: '#innovator' },
    { name: 'الشريك الدولي', href: '#partner' },
    { name: 'الاعتمادات', href: '#accreditations' },
    { name: 'تواصل معنا', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    // إذا كان الرابط يبدأ بـ #، نستخدم الـ Scroll
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // استخدام وظيفة التنقل المخصصة الموجودة في مشروعك
      (window as any).navigateTo(href);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-md py-2 border-b border-red-600/20' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavClick('/')}>
            <span className="text-red-600 font-bold text-2xl tracking-tighter">HARMONY</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <div className={`flex items-baseline space-x-4 space-x-reverse ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-300 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black/95 border-b border-red-600/20 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-red-600/10"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};