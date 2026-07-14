import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './dashboard.css';
import { readStoredChildProfile, hasStoredAssessment } from './api.js';

const fallbackProfile = {
  name: 'Alex',
  age: '5'
};

const steps = [
  {
    id: 'assessment',
    number: '01',
    label: 'Assessment',
    title: 'Development Baseline',
    eyebrow: 'Expert reviewed intake',
    copy: 'Begin with a guided assessment that maps attention, speech, motor patterns, behavior, and parent observations into one clear baseline.',
    duration: '12 min',
    primary: 'Start assessment',
    repeat: 'Retake assessment'
  },
  {
    id: 'game-one',
    number: '02',
    label: 'Game',
    title: 'Attention Sky',
    eyebrow: 'Focus and response play',
    copy: 'A play session designed to observe sustained attention, impulse control, and response timing through short adaptive rounds.',
    duration: '8 min',
    primary: 'Open game',
    repeat: 'Play again'
  },
  {
    id: 'result',
    number: '03',
    label: 'Results',
    title: 'Diagnostic Report',
    eyebrow: 'Screening interpretation & guidance',
    copy: 'Review your child\'s detailed performance analysis, attention profile, and recommended next steps or professional guidance.',
    duration: 'Ready',
    primary: 'View results',
    repeat: 'View results'
  }
];

function DashboardPage() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [activeStep, setActiveStep] = useState(0);

  // 1. Load what is completed
  const [completed, setCompleted] = useState(() => {
    const completedSet = new Set();
    if (hasStoredAssessment()) completedSet.add('assessment');
    try {
      const stored = window.sessionStorage.getItem('neurovice_completed_steps');
      if (stored) {
        JSON.parse(stored).forEach(id => completedSet.add(id));
      }
    } catch (e) {
      console.error("Failed parsing steps", e);
    }
    return completedSet;
  });

  // 2. AGGRESSIVE AUTO-ADVANCE: Forcibly lock the UI to the correct step
  useEffect(() => {
    if (completed.has('game-one')) {
      setActiveStep(2); // Instantly force Step 3 (Results)
    } else if (completed.has('assessment')) {
      setActiveStep(1); // Instantly force Step 2 (Game)
    } else {
      setActiveStep(0);
    }
  }, [completed]);

  // 3. Load Profile Name
  useEffect(() => {
    const storedProfile = readStoredChildProfile();
    if (storedProfile && storedProfile.name) {
      setProfile(storedProfile);
    }
  }, []);

  const active = steps[activeStep];
  const completedCount = completed.size;
  const progress = Math.round((completedCount / steps.length) * 100);
  const nextStep = steps[Math.min(activeStep + 1, steps.length - 1)];
  const canProceed = completed.has(active.id) && activeStep < steps.length - 1;

  const stageState = useMemo(() => {
    return steps.map((step, index) => {
      if (completed.has(step.id)) return 'complete';
      if (step.id === 'result' && completed.has('game-one')) return 'ready';
      if (index === 0 || completed.has(steps[index - 1].id)) return 'ready';
      return 'locked';
    });
  }, [completed]);

  const completeCurrentStep = () => {
    setCompleted((previous) => {
      const next = new Set(previous);
      next.add(active.id);
      try {
        window.sessionStorage.setItem('neurovice_completed_steps', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Failed to save completed steps', e);
      }
      return next;
    });
  };

  const handlePrimaryAction = () => {
    if (active.id === 'assessment') {
      window.location.href = '/assessment.html';
    } else if (active.id === 'result') {
      completeCurrentStep();
      
      // BULLETPROOF ID FETCH: Grab it right when the button is clicked, directly from storage
      let currentChildId = profile?.id;
      try {
        const sessionProfile = JSON.parse(sessionStorage.getItem('neurovice_child_profile') || 'null');
        const localProfile = JSON.parse(localStorage.getItem('neurovice_child_profile') || 'null');
        currentChildId = sessionProfile?.id || localProfile?.id || currentChildId;
      } catch(e) {
        console.error("Error reading storage during click", e);
      }

      if (!currentChildId) {
        alert("System error: Could not find the Child ID. Please ensure you are logged in and try again.");
        return; // Stops navigation if the ID is missing so you don't hit a broken API
      }

      // Sends the real ID perfectly to the URL
      window.location.href = `/result.html?childId=${currentChildId}`;
      
    } else if (active.id === 'game-one') {
      window.location.href = '/game.html'; 
    } else {
      completeCurrentStep();
    }
  };

  const proceed = () => {
    if (canProceed) setActiveStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const selectStep = (index) => {
    if (stageState[index] === 'locked') return;
    setActiveStep(index);
  };

  return (
    <>
      <main className={`dashboard-page ${active.id === 'game-one' ? 'theme-kid-sky' : ''}`}>
        <div className="dashboard-bg" aria-hidden="true">
          <div className="flow-line flow-one"></div>
          <div className="flow-line flow-two"></div>
        </div>

      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <a className="dashboard-brand" href="/">
          <span className="brand-sigil">N</span>
          <span>NeuroVice</span>
        </a>
        <div className="dashboard-nav-actions">
          <a href="/auth.html?mode=signin">Switch Account</a>
        </div>
      </nav>

      <section className="dashboard-hero">
        <div className="child-summary">
          <span className="dashboard-kicker">Child profile</span>
          <h1>{profile.name}&apos;s care path</h1>
          <p>Age {profile.age}. Start with the assessment, then move through each game when you are ready.</p>
          <div className="child-meta">
            <span>{progress}% path complete</span>
            <span>{completedCount} of {steps.length} steps finished</span>
          </div>
        </div>

        <div className="core-orbit" aria-hidden="true">
          <img src="/image/static/Gemini_Generated_Image_ryom5iryom5iryom.png" alt="" />
          <span className="orbit orbit-a"></span>
          <span className="orbit orbit-b"></span>
          <span className="orbit-dot dot-a"></span>
          <span className="orbit-dot dot-b"></span>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Care path dashboard">
        <div className="path-panel">
          <div className="panel-heading">
            <span className="dashboard-kicker">Step sequence</span>
            <h2>Today&apos;s path</h2>
          </div>

          <div className="path-rail" style={{ '--path-progress': `${progress}%` }}>
            {steps.map((step, index) => (
              <button
                className={`path-step ${activeStep === index ? 'active' : ''} ${stageState[index]}`}
                key={step.id}
                type="button"
                onClick={() => selectStep(index)}
              >
                <span className="step-node">{step.number}</span>
                <span className="step-copy">
                  <strong>{step.title}</strong>
                  <small>{stageState[index] === 'locked' ? 'Finish previous step' : stageState[index]}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <article className="active-stage">
          <div className="stage-topline">
            <span>{active.number}</span>
            <span>{active.label}</span>
            <span>{active.duration}</span>
          </div>

          <div className="stage-content">
            <p className="dashboard-kicker">{active.eyebrow}</p>
            <h2>{active.title}</h2>
            <p>{active.copy}</p>
          </div>

          <div className="stage-actions">
            <button
              className="primary-action"
              type="button"
              onClick={handlePrimaryAction}
            >
              {completed.has(active.id) ? active.repeat : active.primary}
            </button>
            <button className="secondary-action" type="button" onClick={proceed} disabled={!canProceed}>
              {activeStep === steps.length - 1 ? 'Path complete' : `Proceed to ${nextStep.label}`}
            </button>
          </div>

          <div className="stage-note">
            <span></span>
            <p>Each step can be repeated. Your latest attempt becomes the active result once backend reporting is connected.</p>
          </div>
        </article>
      </section>

      <section className="segments-row" aria-label="Available steps">
        {steps.map((step, index) => (
          <button
            className={`segment-card ${activeStep === index ? 'active' : ''} ${stageState[index]}`}
            key={step.id}
            type="button"
            onClick={() => selectStep(index)}
          >
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.eyebrow}</p>
          </button>
        ))}
      </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<DashboardPage />);