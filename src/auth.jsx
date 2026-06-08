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
  // phases: 'parent_form', 'otp', 'child_form'
  const [phase, setPhase] = useState('parent_form');
  const [isSubmitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpMessage, setOtpMessage] = useState({
    title: 'Verify Your Identity',
    subtitle: "We've sent a 6-digit verification code to your device. Enter it below to continue."
  });
  const [countdown, setCountdown] = useState(30);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const isOtp = phase === 'otp';
  const activeSubmitText = useMemo(() => {
    if (isSubmitting) return mode === 'signin' ? 'Signing in...' : 'Processing...';
    return mode === 'signin' ? 'Sign In' : 'Continue to Verification';
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

  const handleParentSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(showOtp, 650);
  };

  const handleChildSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const childName = formData.get('childName') || 'Alex';
    const dobString = formData.get('dateOfBirth');
    
    let age = '5';
    if (dobString) {
      const dobDate = new Date(dobString);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        calculatedAge--;
      }
      age = String(Math.max(0, calculatedAge));
    }
    
    // Simulate calculating age or just storing
    storeChildProfile({
      name: String(childName),
      age: age
    });

    setSubmitting(true);
    window.setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 900);
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
    const nextOtp = otp.map((value, idx) => pasted[idx] || value);
    setOtp(nextOtp);
    otpRefs.current[Math.min(pasted.length, otp.length - 1)]?.focus();
  };

  const handleOtpSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      if (mode === 'signup') {
        setPhase('child_form');
      } else {
        window.location.href = '/dashboard.html';
      }
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <p>
              {phase === 'child_form' ? 'Tell us about your child' : 'Continue your journey'}
            </p>
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

          {phase === 'parent_form' && (
            <div className="auth-tabs" id="auth-tabs" data-active={mode}>
              <div className="tab-highlight"></div>
              <button className={`tab-btn ${mode === 'signup' ? 'active' : ''}`} data-tab="signup" onClick={() => setMode('signup')}>Create Account</button>
              <button className={`tab-btn ${mode === 'signin' ? 'active' : ''}`} data-tab="signin" onClick={() => setMode('signin')}>Sign In</button>
            </div>
          )}

          <div className="forms-container">
            {mode === 'signup' && phase === 'parent_form' && (
              <form id="form-signup-parent" className="auth-form active" onSubmit={handleParentSubmit}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input name="userName" type="text" placeholder="John Doe" required />
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input name="emailAddress" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="input-group phone-group">
                    <label>WhatsApp Number</label>
                    <div className="phone-input">
                      <select className="country-code" defaultValue="+91">
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input name="whatsappNumber" type="tel" pattern="[0-9]{10}" maxLength="10" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} placeholder="9876543210" required />
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Address</label>
                    <input name="address" type="text" placeholder="123 Main St" required />
                  </div>
                  <div className="input-group">
                    <label>Aadhaar ID</label>
                    <input name="aadhaarId" type="text" pattern="[0-9]{12}" maxLength="12" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} placeholder="123456789012" required />
                  </div>
                </div>

                <div className="input-group">
                  <label>Relation with Child</label>
                  <select name="relationWithChild" style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-primary)', outline: 'none' }} required>
                    <option value="" disabled selected>Select Relation</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Password</label>
                    <div className="password-input" style={{ position: 'relative' }}>
                      <input name="password" type={showPassword ? "text" : "password"} placeholder="........" style={{ paddingRight: '40px' }} required />
                      <button type="button" onClick={togglePasswordVisibility} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {showPassword ? (
                            <>
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </>
                          ) : (
                            <>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Confirm Password</label>
                    <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="........" required />
                  </div>
                </div>

                <button type="submit" className="cta-btn primary" disabled={isSubmitting}>{activeSubmitText}</button>

                <p className="terms-text">
                  By creating an account, you agree to our Terms of Service and Clinical Ethics Protocol.
                </p>
              </form>
            )}

            {mode === 'signin' && phase === 'parent_form' && (
              <form id="form-signin" className="auth-form active" onSubmit={handleParentSubmit}>
                <div className="input-group">
                  <label>Email or WhatsApp Number</label>
                  <input name="identifier" type="text" placeholder="john@example.com or +91..." required />
                </div>
                <div className="input-group">
                  <div className="label-row">
                    <label>Password</label>
                    <a href="#" className="forgot-link">Forgot Password?</a>
                  </div>
                  <div className="password-input" style={{ position: 'relative' }}>
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="........" style={{ paddingRight: '40px' }} required />
                    <button type="button" onClick={togglePasswordVisibility} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
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

            {mode === 'signup' && phase === 'child_form' && (
              <form id="form-signup-child" className="auth-form active" onSubmit={handleChildSubmit}>
                <div className="input-group">
                  <label>Child Name</label>
                  <input name="childName" type="text" placeholder="Alex" required />
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label>Date of Birth</label>
                    <input name="dateOfBirth" type="date" style={{ colorScheme: 'dark' }} required />
                  </div>
                  <div className="input-group">
                    <label>Gender</label>
                    <select name="gender" style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-primary)', outline: 'none' }} required>
                      <option value="" disabled selected>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Aadhaar ID</label>
                  <input name="aadharId" type="text" pattern="[0-9]{12}" maxLength="12" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} placeholder="123456789012" required />
                </div>

                <button type="submit" className="cta-btn primary" style={{ marginTop: '24px' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Complete Profile & Start'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<AuthPage />);
