'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Globe, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppState } from '../store'
import { getFontCSSProperties } from '../utils/fonts'

const t = {
  ar: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم الكامل',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    passwordPlaceholder: 'أدخل كلمة المرور',
    namePlaceholder: 'أدخل اسمك الكامل',
    loginBtn: 'دخول',
    registerBtn: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    switchRegister: 'سجّل الآن',
    switchLogin: 'سجّل دخولك',
    successRegister: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني.',
    tagline: 'اكتشف نفسك. طوّر مسارك.',
    back: 'الرئيسية',
  },
  en: {
    login: 'Sign In',
    register: 'Create Account',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    namePlaceholder: 'Enter your full name',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    switchRegister: 'Register',
    switchLogin: 'Sign In',
    successRegister: 'Account created! Check your email.',
    tagline: 'Discover yourself. Evolve your path.',
    back: 'Home',
  },
}

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const { language, setLanguage } = useAppState()
  const [mode, setMode]           = useState<'login' | 'register'>('login')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [name, setName]           = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [langOpen, setLangOpen]   = useState(false)

  const tr   = t[language]
  const isAr = language === 'ar'

  useEffect(() => {
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    const fontProps = getFontCSSProperties(language)
    Object.entries(fontProps).forEach(([p, v]) =>
      document.documentElement.style.setProperty(p, v)
    )
  }, [language])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else (window as any).navigateTo('/dashboard')
    } else {
      const { error } = await signUp(email, password, name)
      if (error) setError(error)
      else setSuccess(tr.successRegister)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <button
          onClick={() => (window as any).navigateTo('/')}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← {tr.back}
        </button>

        {/* Logo */}
        <span className="text-[#FFBD00] font-bold tracking-widest text-sm uppercase">Harmony</span>

        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-1 text-xs border border-red-600/40 rounded-full px-3 py-1.5 text-red-400 hover:bg-red-600/10 transition"
          >
            <Globe size={12} />
            {language.toUpperCase()}
            <ChevronDown size={10} />
          </button>
          {langOpen && (
            <div className="absolute top-full mt-2 bg-gray-900 border border-red-600/20 rounded-xl overflow-hidden z-50 right-0">
              {(['en', 'ar'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setLangOpen(false) }}
                  className={`block w-full px-5 py-2.5 text-sm text-white hover:bg-red-600 transition text-left ${language === lang ? 'bg-red-600/20' : ''}`}
                >
                  {lang === 'en' ? 'English' : 'العربية'}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/30 mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? tr.login : tr.register}
            </h1>
            <p className="text-sm text-gray-500">{tr.tagline}</p>
          </div>

          {/* Card */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 shadow-2xl">

            {/* Tabs */}
            <div className="flex gap-1 bg-black/50 rounded-xl p-1 mb-6">
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m === 'login' ? tr.login : tr.register}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{tr.name}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={tr.namePlaceholder}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/60 transition"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">{tr.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={tr.emailPlaceholder}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/60 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">{tr.password}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={tr.passwordPlaceholder}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/60 transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error / Success */}
              {error   && <p className="text-red-400 text-xs bg-red-600/10 border border-red-600/20 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-green-400 text-xs bg-green-600/10 border border-green-600/20 rounded-lg px-3 py-2">{success}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_8px_25px_rgba(220,38,38,0.3)] active:scale-95 mt-2"
              >
                {loading ? '...' : mode === 'login' ? tr.loginBtn : tr.registerBtn}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-xs text-gray-500 mt-5">
              {mode === 'login' ? tr.noAccount : tr.hasAccount}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
                className="text-red-400 hover:text-red-300 transition font-medium"
              >
                {mode === 'login' ? tr.switchRegister : tr.switchLogin}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
