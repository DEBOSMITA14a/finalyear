import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../auth.css';
import { storeChildProfile } from './api.js';

const initialModeFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'signin' ? 'signin' : 'signup';
};

function AuthPage() {
  const [mode, setMode] = useState(initialModeFromUrl);
  const [phase, setPhase] = useState('form');
  const [isSubmitting, setSubmitting] = useState(false);
  const [otpMessage, setOtpMessage] = useState({
    title: 'Verify Your Identity',
    subtitle: "We've sent a 6-digit verification code to your device. Enter it below to continue."
  });
  const [countdown, setCountdown] = useState(30);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const isOtp = phase === 'otp';
  const activeSubmitText = useMemo(() => {
    if (isSubmitting) return mode === 'signin' ? 'Signing in...' : 'Creating account...';
    return mode === 'signin' ? 'Sign In' : 'Start Your Journey';
  }, [isSubmitting, mode]);

  useEffect(() => {
    if (!isOtp) return;
    otpRefs.current[0]?.focus();
  }, [isOtp]);

  useEffect(() => {
    if (!isOtp) return;

    setCountdown(30);
    const interval = window.setInterval(() => {
      setCountdown((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOtp, otpMessage.title]);

  const showOtp = () => {
    setSubmitting(false);
    setPhase('otp');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (mode === 'signup') {
      const childName = formData.get('childName') || 'Alex';
      const childAge = formData.get('childAge') || '5';
      storeChildProfile({
        name: String(childName),
        age: String(childAge)
      });
    } else if (!window.sessionStorage.getItem('neurovice_child_profile')) {
      storeChildProfile({
        name: 'Alex',
        age: '5'
      });
    }

    setSubmitting(true);
    window.setTimeout(showOtp, 650);
  };

  const handleOtpChange = (index, value) => {
    const nextValue = value.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);

    if (nextValue && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').slice(0, otp.length).split('');
    const nextOtp = otp.map((value, index) => pasted[index] || value);
    setOtp(nextOtp);
    otpRefs.current[Math.min(pasted.length, otp.length - 1)]?.focus();
  };

  const handleOtpSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 900);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setOtpMessage({
      title: 'Code Resent Successfully',
      subtitle: "We've sent a new 6-digit verification code to your registered device. Please check your messages."
    });
    setCountdown(30);
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="auth-layout" data-mode={mode} data-phase={phase}>
      <div className="bg-glow top-right"></div>
      <div className="bg-glow bottom-left"></div>

      <aside className={`auth-brand-section ${isOtp ? 'otp-mode' : ''}`}>
        <div className="brand-top">
          <a href="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </a>
        </div>

        <div className="brand-hero">
          <h1 className="brand-heading">Understand Your Child Better</h1>
          <p className="brand-subtext">Join a community of parents using NeuroVice for precise clinical insights and a sanctuary for child development.</p>

          <div className="feature-grid">
            {[
              ['01', 'Gamified Assessments', 'Interactive evaluations designed for young minds.'],
              ['02', 'Expert Reviewed', 'Insights validated by developmental specialists.'],
              ['03', 'Progress Tracking', 'Visualize growth with clinical-grade analytics.'],
              ['04', 'Clinical Security', 'Your family data is encrypted and protected.']
            ].map(([number, title, copy]) => (
              <div className="feature-card" key={number}>
                <span className="feature-mark">{number}</span>
                <h4>{title}</h4>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="brand-footer">
          &copy; 2026 NeuroVice &middot; Clinical Ethics Protocol
        </div>
      </aside>

      <main className={`auth-panel-section ${isOtp ? 'otp-mode' : ''}`}>
        <div className="auth-card" id="auth-card">
          <div className={`auth-header ${isOtp ? 'hidden' : ''}`} id="auth-main-header">
            <h2>NeuroVice</h2>
            <p>Continue your journey</p>
          </div>

          <div className={`auth-header ${isOtp ? '' : 'hidden'}`} id="auth-otp-header">
            <div className="shield-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 id="otp-title">{otpMessage.title}</h2>
            <p id="otp-subtitle">{otpMessage.subtitle}</p>
          </div>

          {!isOtp && (
            <div className="auth-tabs" id="auth-tabs" data-active={mode}>
              <div className="tab-highlight"></div>
              <button className={`tab-btn ${mode === 'signup' ? 'active' : ''}`} data-tab="signup" onClick={() => setMode('signup')}>Create Account</button>
              <button className={`tab-btn ${mode === 'signin' ? 'active' : ''}`} data-tab="signin" onClick={() => setMode('signin')}>Sign In</button>
            </div>
          )}

          <div className="forms-container">
            {mode === 'signup' && !isOtp && (
              <form id="form-signup" className="auth-form active" onSubmit={handleFormSubmit}>
                <div className="input-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input name="parentName" type="text" placeholder="John Doe" required />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input name="email" type="email" placeholder="john@example.com" required />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Child Name</label>
                    <input name="childName" type="text" placeholder="Alex" required />
                  </div>
                  <div className="input-group">
                    <label>Age (0-18)</label>
                    <input name="childAge" type="number" min="0" max="18" placeholder="5" required />
                  </div>
                </div>

                <div className="input-group phone-group">
                  <label>WhatsApp Number</label>
                  <div className="phone-input">
                    <select className="country-code" defaultValue="+91">
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input name="whatsapp" type="tel" placeholder="9876543210" required />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Password</label>
                    <input name="password" type="password" placeholder="........" required />
                  </div>
                  <div className="input-group">
                    <label>Confirm Password</label>
                    <input name="confirmPassword" type="password" placeholder="........" required />
                  </div>
                </div>

                <button type="submit" className="cta-btn primary" disabled={isSubmitting}>{activeSubmitText}</button>

                <p className="terms-text">
                  By creating an account, you agree to our Terms of Service and Clinical Ethics Protocol.
                </p>
              </form>
            )}

            {mode === 'signin' && !isOtp && (
              <form id="form-signin" className="auth-form active" onSubmit={handleFormSubmit}>
                <div className="input-group">
                  <label>Email or WhatsApp Number</label>
                  <input name="identifier" type="text" placeholder="john@example.com or +91..." required />
                </div>
                <div className="input-group">
                  <div className="label-row">
                    <label>Password</label>
                    <a href="#" className="forgot-link">Forgot Password?</a>
                  </div>
                  <input name="password" type="password" placeholder="........" required />
                </div>

                <button type="submit" className="cta-btn primary" style={{ marginTop: '24px' }} disabled={isSubmitting}>{activeSubmitText}</button>
              </form>
            )}

            {isOtp && (
              <form id="form-otp" className="auth-form active" onSubmit={handleOtpSubmit}>
                <div className="otp-inputs">
                  {otp.map((value, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      type="text"
                      maxLength="1"
                      className="otp-box"
                      value={value}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>

                <button type="submit" className="cta-btn primary" style={{ marginTop: '32px' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="resend-section">
                  <p>
                    Didn't receive a code?{' '}
                    <button type="button" id="resend-btn" className="resend-link" disabled={countdown > 0} onClick={handleResend}>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                  </p>
                </div>

                <div className="trust-label">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  End-to-end encrypted verification
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<AuthPage />);
