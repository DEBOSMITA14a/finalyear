import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assessment.css';
import { allQuestions, assessmentSections, ratingLabels } from './assessmentData.js';
import { getAccountChildProfile, submitAssessment } from './api.js';

const fallbackProfile = { name: 'Alex', age: '5', id: null };

function AssessmentPage() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitNote, setSubmitNote] = useState('');

  const section = assessmentSections[sectionIndex];
  const answeredCount = Object.keys(answers).length;
  const totalCount = allQuestions.length;
  const progress = Math.round((answeredCount / totalCount) * 100);
  const sectionAnswered = section.questions.filter((question) => answers[question.id]).length;
  const sectionComplete = sectionAnswered === section.questions.length;
  const allComplete = answeredCount === totalCount;

  const domainSummaries = useMemo(() => {
    return assessmentSections.map((item) => {
      const answered = item.questions.filter((question) => answers[question.id]).length;
      return {
        ...item,
        answered,
        total: item.questions.length,
        percent: Math.round((answered / item.questions.length) * 100)
      };
    });
  }, [answers]);

  useEffect(() => {
    let isMounted = true;

    getAccountChildProfile().then((childProfile) => {
      if (isMounted) setProfile({ ...fallbackProfile, ...childProfile });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const answerQuestion = (questionId, score) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: score
    }));
  };

  const goNext = () => {
    if (sectionIndex < assessmentSections.length - 1) {
      setSectionIndex((value) => value + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (sectionIndex > 0) {
      setSectionIndex((value) => value - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!allComplete) return;

    setStatus('submitting');
    setSubmitNote('');

    const payload = {
      assessmentType: 'nichq-parent-55',
      scale: '1-5',
      child: {
        id: profile.id,
        name: profile.name,
        age: profile.age
      },
      answers: allQuestions.map((question) => ({
        questionId: question.id,
        domain: question.domain,
        type: question.type,
        score: answers[question.id]
      })),
      submittedAt: new Date().toISOString()
    };

    const result = await submitAssessment(payload);
    setStatus('submitted');
    setSubmitNote(result.localOnly
      ? 'Saved locally for now. Once the backend endpoint is live, this same payload will be posted automatically.'
      : 'Submitted to NeuroVice analysis.'
    );
  };

  return (
    <main className="assessment-page">
      <div className="assessment-bg" aria-hidden="true">
        <span></span>
        <span></span>
      </div>

      <nav className="assessment-nav">
        <a className="assessment-brand" href="/dashboard.html">
          <span>N</span>
          Dashboard
        </a>
        <div className="assessment-progress-chip">
          <strong>{progress}%</strong>
          Complete
        </div>
      </nav>

      <header className="assessment-hero">
        <div>
          <p className="assessment-kicker">Parent assessment</p>
          <h1>{profile.name}'s baseline assessment</h1>
          <p>
            Answer each item based on recent patterns. Your ratings are sent as structured numbers for backend scoring and AI/ML analysis.
          </p>
        </div>

        <aside className="assessment-disclaimer">
          <span>Clinical note</span>
          <p>This screening flow supports care planning and does not replace medical advice from a pediatrician or qualified clinician.</p>
        </aside>
      </header>

      <section className="assessment-shell">
        <aside className="assessment-sidebar">
          <div className="sidebar-card">
            <span className="assessment-kicker">Sections</span>
            {domainSummaries.map((item, index) => (
              <button
                className={`section-tab ${index === sectionIndex ? 'active' : ''}`}
                key={item.id}
                type="button"
                onClick={() => setSectionIndex(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.shortTitle}</strong>
                <small>{item.answered}/{item.total}</small>
                <i style={{ '--section-percent': `${item.percent}%` }}></i>
              </button>
            ))}
          </div>
        </aside>

        <section className={`question-panel theme-${section.theme}`}>
          <div className="question-panel-head">
            <div>
              <p className="assessment-kicker">Part {sectionIndex + 1} of {assessmentSections.length}</p>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
            <div className="section-meter">
              <strong>{sectionAnswered}</strong>
              <span>of {section.questions.length}</span>
            </div>
          </div>

          <div className="questions-list">
            {section.questions.map((question) => (
              <article className="question-card" key={question.id}>
                <div className="question-copy">
                  <span>Question {question.id}</span>
                  <h3>{question.text}</h3>
                </div>

                <div className="rating-grid" role="radiogroup" aria-label={`Question ${question.id} rating`}>
                  {ratingLabels[question.type].map((label, index) => {
                    const score = index + 1;
                    const selected = answers[question.id] === score;

                    return (
                      <button
                        className={`rating-pill ${selected ? 'selected' : ''}`}
                        key={label}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => answerQuestion(question.id, score)}
                      >
                        <strong>{score}</strong>
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="assessment-actions">
            <button className="ghost-assessment-btn" type="button" onClick={goBack} disabled={sectionIndex === 0}>
              Previous part
            </button>

            {sectionIndex < assessmentSections.length - 1 ? (
              <button className="solid-assessment-btn" type="button" onClick={goNext} disabled={!sectionComplete}>
                Continue to next part
              </button>
            ) : (
              <button className="solid-assessment-btn" type="button" onClick={handleSubmit} disabled={!allComplete || status === 'submitting'}>
                {status === 'submitting' ? 'Submitting...' : 'Submit assessment'}
              </button>
            )}
          </div>

          {submitNote && (
            <div className="submit-note">
              <strong>Assessment captured.</strong>
              <p>{submitNote}</p>
              <div className="submit-note-actions">
                <a href="/result.html">View result page</a>
                <a href="/dashboard.html">Return to dashboard</a>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<AssessmentPage />);
