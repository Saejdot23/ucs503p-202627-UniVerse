/**
 * Landing Page — preserved exactly from the original design.
 * The campus hero image should be placed at:
 *   src/assets/images/campus-hero.png  (or .jpg/.webp)
 *
 * If the image is not yet in the repo, the hero falls back to a
 * dark gradient. Drop the image in and re-import to activate it.
 *
 * All design tokens, animations, and layout are preserved from the
 * original App.tsx prototype provided in the project brief.
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImg from '../../assets/logo.png'

// Attempt to import the hero image; fallback handled at render time
let campusImg = null
try {
  campusImg = new URL('../../assets/background-image.png', import.meta.url).href
} catch {
  // Image not yet added — hero shows gradient fallback
}

// ── Navigation ────────────────────────────────────────────────────────────────

function Nav({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('Home')
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (link) => {
    setActive(link)
    if (link === 'Login') onLoginClick()
    else if (link === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' })
    else if (link === 'About') document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    else if (link === 'Features') document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      padding: '20px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.4s ease, backdrop-filter 0.4s ease',
      background: scrolled ? 'rgba(24,8,7,0.72)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <UniLogo />
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, color: '#E8D2AE', letterSpacing: '0.02em' }}>UniVerse</span>
      </div>

      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        {['Home', 'About', 'Features', 'Login'].map(link => (
          <button
            key={link}
            onClick={() => handleNavClick(link)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400,
              letterSpacing: '0.06em',
              color: active === link ? '#2E86AB' : 'rgba(232,210,174,0.8)',
              borderBottom: active === link ? `1.5px solid ${link === 'Login' ? '#2E86AB' : '#5B2C4D'}` : '1.5px solid transparent',
              paddingBottom: 2,
              transition: 'color 0.25s, border-color 0.25s',
            }}
          >
            {link}
          </button>
        ))}
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ onGetStarted }) {
  const ref = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (ref.current) ref.current.style.backgroundPositionY = `calc(50% + ${window.scrollY * 0.35}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Campus background */}
      <div
        ref={ref}
        style={{
          position: 'absolute', inset: 0,
          background: campusImg
            ? `url(${campusImg}) center 50% / cover no-repeat`
            : 'linear-gradient(135deg, #281004 0%, #180807 50%, #0e0504 100%)',
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(24,8,7,0.68) 0%, rgba(24,8,7,0.28) 55%, rgba(24,8,7,0.05) 100%)',
        zIndex: 1,
      }} />

      {/* Wave transition */}
      <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, zIndex: 3, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 120 }}>
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#180807" stopOpacity="0" />
              <stop offset="100%" stopColor="#180807" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d="M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,70 L1440,120 L0,120 Z" fill="#180807" />
          <path d="M0,60 C300,110 600,10 900,70 C1100,110 1300,30 1440,80 L1440,120 L0,120 Z" fill="url(#wg)" opacity="0.5" />
        </svg>
      </div>

      {/* Hero content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        minHeight: '100vh', padding: '120px 48px 160px', maxWidth: 700,
      }}>
        <div className="anim-fade-up delay-100" style={{
          fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.22em', color: '#2E86AB', textTransform: 'uppercase',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ display: 'inline-block', width: 28, height: 1, background: '#2E86AB' }} />
          Thapar's Student Community
        </div>

        <h1 className="anim-fade-up delay-200" style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(46px, 6.5vw, 88px)',
          fontWeight: 600, lineHeight: 1.08,
          margin: '0 0 28px', letterSpacing: '-0.01em',
        }}>
          <span style={{ color: '#E8D2AE', display: 'block' }}>Your Campus,</span>
          <span style={{ color: '#E8D2AE', display: 'block' }}>Your Universe.</span>
        </h1>

        <p className="anim-fade-up delay-350" style={{
          fontFamily: 'var(--font-sans)', fontSize: 'clamp(16px, 1.8vw, 20px)',
          fontWeight: 300, lineHeight: 1.65, color: 'rgba(232,210,174,0.92)',
          margin: '0 0 14px', maxWidth: 500,
        }}>
          Learn from someone on your campus.<br />Share what you know. Find what you need.
        </p>

        <p className="anim-fade-up delay-500" style={{
          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400,
          lineHeight: 1.7, color: 'rgba(232,210,174,0.55)',
          margin: '0 0 44px', maxWidth: 440, letterSpacing: '0.01em',
        }}>
          A private student platform for skill exchange, mentorship,<br />lending and campus utilities.
        </p>

        <div className="anim-fade-up delay-650" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <HeroButton onClick={onGetStarted} primary>
            <GoogleIcon /> Get Started with Google
          </HeroButton>
          <HeroButton onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore →
          </HeroButton>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="bounce-arrow anim-fade delay-800" style={{
        position: 'absolute', bottom: 140, left: '50%', transform: 'translateX(-50%)',
        zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        color: 'rgba(232,210,174,0.4)',
      }}>
        <span style={{ fontSize: 10, letterSpacing: '0.15em', fontFamily: 'var(--font-sans)' }}>SCROLL</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <path d="M8 0 L8 20 M2 14 L8 20 L14 14" stroke="rgba(232,210,174,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}

function HeroButton({ children, onClick, primary }) {
  const [hov, setHov] = useState(false)
  const base = primary
    ? { background: '#180807', color: '#E8D2AE', border: '1px solid rgba(232,210,174,0.15)', borderRadius: 4, padding: '13px 26px' }
    : { background: 'transparent', color: 'rgba(232,210,174,0.9)', border: '1px solid #2E86AB', borderRadius: 4, padding: '13px 26px' }
  const hover = primary
    ? { background: '#281004', borderColor: 'rgba(232,210,174,0.3)' }
    : { background: 'rgba(46,134,171,0.1)' }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...base, ...(hov ? hover : {}),
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: primary ? 500 : 400,
        letterSpacing: '0.04em', cursor: 'pointer',
        transition: 'background 0.25s, border-color 0.25s',
      }}
    >
      {children}
    </button>
  )
}

// ── What Is section ────────────────────────────────────────────────────────────

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Stars({ count = 80 }) {
  const stars = useRef(Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.4 + 0.3, o: Math.random() * 0.5 + 0.15, key: i,
  }))).current
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {stars.map(s => <circle key={s.key} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#E8D2AE" opacity={s.o} />)}
    </svg>
  )
}

function WhatIsSection() {
  const { ref: titleRef, visible: tV } = useInView(0.3)
  const { ref: c1Ref, visible: c1V } = useInView(0.2)
  const { ref: c2Ref, visible: c2V } = useInView(0.2)

  return (
    <section id="about" style={{
      position: 'relative',
      background: '#180807',
      padding: '120px 48px 140px', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '65%', overflow: 'hidden' }}><Stars count={70} /></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
        <div ref={titleRef} style={{ opacity: tV ? 1 : 0, transform: tV ? 'none' : 'translateY(24px)', transition: 'opacity 0.9s, transform 0.9s', textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.22em', color: '#2E86AB', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ display: 'inline-block', width: 28, height: 1, background: '#2E86AB' }} />
            About the Platform
            <span style={{ display: 'inline-block', width: 28, height: 1, background: '#2E86AB' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px,5vw,62px)', fontWeight: 600, color: '#E8D2AE', margin: '0 0 20px', lineHeight: 1.1 }}>What is UniVerse?</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(16px,1.8vw,20px)', fontWeight: 300, color: 'rgba(232,210,174,0.7)', margin: '0 auto', maxWidth: 520, lineHeight: 1.7 }}>One campus. Many things to discover.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 2, background: 'rgba(232,210,174,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <AboutCard
            cardRef={c1Ref} visible={c1V} delay={0}
            accentColor="#5B2C4D" label="Skill Swap"
            title={<>Learn something new.<br />Teach what you know.</>}
            desc="Exchange skills directly with peers on your campus. No money, no middleman — just students helping students grow."
            icon={<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M6 12 L30 12 M6 12 L12 6 M6 12 L12 18" stroke="#5B2C4D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M30 24 L6 24 M30 24 L24 18 M30 24 L24 30" stroke="#2E86AB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            linkColor="#5B2C4D"
          />
          <AboutCard
            cardRef={c2Ref} visible={c2V} delay={0.15}
            accentColor="#2E86AB" label="Utility Channels"
            title={<>Find what you need.<br />Share what you have.</>}
            desc="Borrow books, lend equipment, find study partners. A private campus-only network for everyday student needs."
            icon={<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="8" width="28" height="20" rx="2" stroke="#2E86AB" strokeWidth="1.8"/><path d="M4 14 L32 14" stroke="#2E86AB" strokeWidth="1.5" strokeDasharray="3 3"/><circle cx="10" cy="22" r="2" fill="#5B2C4D"/><circle cx="18" cy="22" r="2" fill="#5B2C4D" opacity="0.6"/><circle cx="26" cy="22" r="2" fill="#5B2C4D" opacity="0.3"/></svg>}
            linkColor="#2E86AB"
            bgDark
          />
        </div>
      </div>

      {/* Solid wave transition to Features section */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 80 }}
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#E8D2AE"
          />
        </svg>
      </div>
    </section>
  )
}

function AboutCard({ cardRef, visible, delay, accentColor, label, title, desc, icon, linkColor, bgDark }) {
  return (
    <div ref={cardRef} style={{
      padding: '64px 52px',
      background: bgDark ? 'rgba(40,16,4,0.6)' : 'rgba(24,8,7,0.7)',
      backdropFilter: 'blur(8px)',
      borderTop: `2px solid ${accentColor}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(32px)',
      transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
    }}>
      <div style={{ marginBottom: 28 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.22em', color: accentColor, textTransform: 'uppercase', marginBottom: 14 }}>{label}</div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 600, color: '#E8D2AE', margin: '0 0 16px', lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(232,210,174,0.55)', lineHeight: 1.75, margin: 0 }}>{desc}</p>
      <div style={{ marginTop: 36 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: linkColor, letterSpacing: '0.06em', borderBottom: `1px solid ${linkColor}66`, paddingBottom: 2, cursor: 'pointer' }}>Learn more →</span>
      </div>
    </div>
  )
}

// ── Features section ──────────────────────────────────────────────────────────

function FeaturesSection() {
  const { ref, visible } = useInView(0.15)
  const features = [
    { icon: '◎', label: 'Campus-Only', desc: 'Verified Thapar students only. A private, trusted space.' },
    { icon: '⊕', label: 'Skill Exchange', desc: 'Teach coding. Learn guitar. Trade knowledge freely.' },
    { icon: '⊞', label: 'Mentorship', desc: 'Connect with seniors who have walked the path.' },
    { icon: '⊠', label: 'Lending Network', desc: 'Borrow textbooks, tools, and resources from peers.' },
    { icon: '◈', label: 'Campus Utilities', desc: 'Lost & found, campus discussions, project collabs.' },
    { icon: '◉', label: 'Community Feed', desc: "What's happening on campus, by students, for students." },
  ]

  return (
    <section id="features" style={{ background: 'var(--warm-cream)', padding: '120px 48px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(40,16,4,0.05) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(91,44,77,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 80, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'opacity 0.9s, transform 0.9s' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.22em', color: '#5B2C4D', textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: '#5B2C4D', display: 'inline-block' }} />Features<span style={{ width: 28, height: 1, background: '#5B2C4D', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px,4vw,52px)', fontWeight: 600, color: '#180807', margin: 0, letterSpacing: '-0.01em' }}>
            Built for every student,<br /><span style={{ color: '#5B2C4D' }}>every moment on campus.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 1, background: 'rgba(40,16,4,0.08)' }}>
          {features.map((f, i) => (
            <FeatureCard key={f.label} {...f} visible={visible} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, label, desc, visible, delay }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#e0c99e' : '#E8D2AE',
        padding: '44px 36px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s, background 0.25s`,
        cursor: 'default',
      }}
    >
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#2E86AB', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.16em', color: '#5B2C4D', textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>{label}</div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(24,8,7,0.65)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  )
}

// ── CTA section ───────────────────────────────────────────────────────────────

function CTASection({ onGetStarted }) {
  const { ref, visible } = useInView(0.3)
  return (
    <section style={{ background: '#180807', padding: '120px 48px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Stars count={50} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,44,77,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      </div>
      <div ref={ref} style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', textAlign: 'center', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)', transition: 'opacity 1s, transform 1s' }}>
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="rgba(232,210,174,0.12)" strokeWidth="1"/>
            <circle cx="32" cy="32" r="18" stroke="rgba(46,134,171,0.25)" strokeWidth="1"/>
            <circle cx="32" cy="32" r="7" fill="#5B2C4D" opacity="0.8"/>
            <circle cx="32" cy="2" r="3" fill="#2E86AB"/>
            <circle cx="50" cy="50" r="2.5" fill="#E8D2AE" opacity="0.5"/>
            <circle cx="10" cy="42" r="2" fill="#5B2C4D" opacity="0.6"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px,4.5vw,58px)', fontWeight: 600, color: '#E8D2AE', margin: '0 0 20px', lineHeight: 1.15 }}>
          Ready to join your<br />campus universe?
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(232,210,174,0.55)', marginBottom: 44, lineHeight: 1.7 }}>
          Exclusively for Thapar University students.<br />Sign in with your institute email to get started.
        </p>
        <HeroButton primary onClick={onGetStarted}>
          <GoogleIcon /> Continue with Google
        </HeroButton>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: '#0e0504', borderTop: '1px solid rgba(232,210,174,0.06)', padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <UniLogo size={22} faded />
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'rgba(232,210,174,0.5)' }}>UniVerse</span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(232,210,174,0.25)', letterSpacing: '0.04em' }}>
        A platform for Thapar University students · Patiala, India
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(232,210,174,0.2)' }}>
        © 2026 UniVerse
      </div>
    </footer>
  )
}

// ── Shared SVGs ───────────────────────────────────────────────────────────────

function UniLogo({ size = 30, faded = false }) {
  return (
    <img
      src={logoImg}
      alt="UniVerse logo"
      width={size}
      height={size}
      style={{ opacity: faded ? 0.5 : 1, objectFit: 'contain', flexShrink: 0 }}
    />
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = '/api/v1/auth/google'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#180807' }}>
      <Nav onLoginClick={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} />
      <WhatIsSection />
      <FeaturesSection />
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  )
}
