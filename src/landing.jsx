import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../style.css';
import { initLandingEffects } from './landingEffects.js';

function LandingPage() {
  useEffect(() => {
    initLandingEffects();
  }, []);

  return (
    <>
      <div className="animated-nav-shell">
        <nav className="animated-nav" id="site-nav" aria-label="Primary navigation" data-expanded="true">
          <a href="#hero-section" className="nav-brand" aria-label="Neurovice home">
            <svg className="nav-brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3l7 18-7-4-7 4 7-18z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            <span>Neurovice</span>
          </a>

          <div className="nav-items">
            <a href="#hero-section" className="nav-link">Home</a>
            <a href="#section-2" className="nav-link">Assessments</a>
            <a href="#section-5" className="nav-link">How It Works</a>
            <a href="#section-8" className="nav-link">Trust</a>
            <a href="/auth.html?mode=signin" className="nav-link">Log in</a>
            <a href="/auth.html?mode=signup&intent=assessment" className="nav-start-link">Start</a>
          </div>

          <button className="nav-menu-button" type="button" aria-label="Open navigation" aria-expanded="true">
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>

      <div id="grid-bg"></div>
      <div id="particles-container"></div>

      <div id="neuro-core">
        <img src="/image/static/Gemini_Generated_Image_ryom5iryom5iryom.png" alt="Neuro Core" />
      </div>

      <main>
        <section id="hero-section">
          <div className="sticky-container">
            <canvas id="hero-canvas"></canvas>
            <div className="video-overlay"></div>

            <div className="hero-text-beats">
              <div className="text-beat" id="beat-1">
                <h2 className="animate-words">Understand Your Child's Development, Early.</h2>
              </div>
              <div className="text-beat" id="beat-2">
                <p className="animate-words">Play-based assessments powered by AI and reviewed by experts - giving you clarity, confidence, and the right next steps.</p>
              </div>
              <div className="text-beat" id="beat-3">
                <div className="hero-actions">
                  <a href="/auth.html?mode=signup&intent=assessment" className="cta-button primary">Start Free Assessment</a>
                  <a href="/auth.html?mode=signup&intent=consultation" className="cta-button secondary">Book Consultation</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="journey-container">
          <canvas id="journey-squares-bg" className="squares-background" aria-hidden="true"></canvas>

          <section className="journey-section min-apple" id="section-1">
            <div className="content-wrapper align-center">
              <h1 className="section-title animate-words">Small Signs Today Can Matter Tomorrow</h1>
              <ul className="stagger-list">
                <li>Delayed speech</li>
                <li>Difficulty focusing</li>
                <li>Social interaction challenges</li>
                <li>Slower motor development</li>
              </ul>
              <p className="section-ending animate-words">Early understanding can make all the difference.</p>
            </div>
          </section>

          <section className="journey-section min-apple full-width-section" id="section-2">
            <div className="align-center">
              <h1 className="section-title animate-words">What NeuroVice Understands</h1>
              <div className="interactive-cards-wrapper">
                <div className="interactive-cards-container">
                  {[
                    ['Cognitive Ability', 'Understanding how your child thinks and learns'],
                    ['Motor Skills', 'Tracking physical coordination and movement'],
                    ['Attention & Focus', 'Measuring concentration through play'],
                    ['Behavioral Patterns', 'Identifying emotional responses over time'],
                    ['Hyperactivity', 'Observing restlessness, excessive movement, and difficulty staying still'],
                    ['Impulsivity', 'Recognizing quick, unplanned actions and challenges with self-control'],
                    ['Oppositional Behavior', 'Understanding patterns of defiance, resistance, and emotional outbursts']
                  ].map(([title, copy], index) => (
                    <div className="i-card" data-index={index} key={title}>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  ))}
                </div>

                <div className="nav-arrows-container">
                  <button className="nav-arrow left-arrow" aria-label="Previous card">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <button className="nav-arrow right-arrow" aria-label="Next card">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="journey-section min-apple" id="section-3">
            <div className="align-center features-wrapper">
              <div className="clean-cards-container">
                {[
                  ['Gamified Assessments', 'Engaging play scenarios that map complex behavioral data organically.'],
                  ['Expert-Reviewed Insights', 'Verified clinical accuracy built into every assessment endpoint.'],
                  ['Progress Tracking', 'Granular developmental milestones tracked chronologically.'],
                  ['Privacy First', 'End-to-end encrypted medical-grade data custody architecture.']
                ].map(([title, copy]) => (
                  <div className="minimal-card feature-card" key={title}>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="journey-section min-apple" id="section-4">
            <div className="content-wrapper align-center">
              <h1 className="section-title animate-words">Clear Insights, Not Confusion</h1>
              <ul className="stagger-list horizontal-list">
                <li>Simple reports</li>
                <li>Development benchmarks</li>
                <li>Actionable next steps</li>
                <li>Expert-backed recommendations</li>
              </ul>
            </div>
          </section>

          <section className="journey-section min-apple" id="section-5">
            <div className="content-wrapper align-center">
              <h1 className="section-title animate-words">How It Works</h1>
              <div className="stepper-flow">
                <div className="step"><span>1</span> Create Profile</div>
                <div className="step"><span>2</span> Complete Assessments</div>
                <div className="step"><span>3</span> Get Insights</div>
                <div className="step"><span>4</span> Consult Expert</div>
              </div>
            </div>
          </section>

          <section className="journey-section min-apple" id="section-6">
            <div className="content-wrapper align-center">
              <h1 className="section-title animate-words">Guided by Experts. Designed for Parents.</h1>
              <p className="expert-para">NeuroVice bridges the gap between home environments and clinical rigors.</p>
              <ul className="stagger-list inline-bullets">
                <li>Interpretation of results</li>
                <li>Personalized recommendations</li>
                <li>Online consultations</li>
                <li>Ongoing monitoring</li>
              </ul>
            </div>
          </section>

          <section className="journey-section min-apple" id="section-7">
            <div className="content-wrapper align-center">
              <h1 className="mega-statement animate-words">Early Awareness Changes Outcomes</h1>
            </div>
          </section>

          <section className="journey-section min-apple" id="section-8">
            <div className="content-wrapper align-center">
              <h1 className="section-title animate-words">Built for Trust</h1>
              <ul className="stagger-list check-list">
                <li>Secure medical-grade data</li>
                <li>Parent-controlled access</li>
                <li>Expert-reviewed results</li>
                <li>Clinical approach</li>
              </ul>
            </div>
          </section>

          <section className="journey-section min-apple testimonial-section" id="section-9">
            <div className="content-wrapper align-center">
              <div className="testimonials-grid">
                <blockquote className="minimal-testimonial">
                  "Finally, clarity without the weeks of waiting and clinical anxiety."
                  <cite>- Sarah M., Parent</cite>
                </blockquote>
                <blockquote className="minimal-testimonial">
                  "The insights allowed us to adapt immediately and see profound improvements."
                  <cite>- Dr. James T., Clinician</cite>
                </blockquote>
              </div>
            </div>
          </section>

          <section className="journey-section min-apple final-cta-section" id="section-10">
            <div className="cta-content">
              <h1 className="mega-statement animate-words">Don't Wait to Understand What Matters Most</h1>
              <p className="cta-sub animate-words">Early insight leads to better outcomes.</p>
              <div className="hero-actions">
                <a href="/auth.html?mode=signup&intent=assessment" className="cta-button primary">Start Free</a>
                <a href="/auth.html?mode=signup&intent=consultation" className="cta-button secondary">Book Consultation</a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<LandingPage />);
