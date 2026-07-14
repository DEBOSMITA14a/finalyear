import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./assessment.css";
//import { allQuestions, assessmentSections, ratingLabels } from './assessmentData.js';
import { getAccountChildProfile, submitAssessment } from "./api.js";
//import { useEffect, useState } from "react";
import {
  getAllQuestionaires,
  startAssessment,
  submitAssessmentSection,
  getAssessmentStatus
} from "./api";

const fallbackProfile = { name: "Alex", age: "5", id: null };
const ratingLabels = {
  symptom: [
    "Never",
    "Rarely",
    "Sometimes",
    "Often",
    "Very Often"
  ]
};

function AssessmentPage() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitNote, setSubmitNote] = useState("");
  const [sections, setSections] = useState([]);
  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // New state for button disabling

  const mappedSections = sections.map((section) => {
    // Parse questions if it's a JSON string
    let parsedQuestions = [];
    try {
      if (typeof section.questions === 'string') {
        parsedQuestions = JSON.parse(section.questions);
      } else if (Array.isArray(section.questions)) {
        parsedQuestions = section.questions;
      }
    } catch (e) {
      console.error("Failed to parse questions:", e);
    }

    return {
      id: section.sectionId, // Use sectionId from backend model!
      dbId: section.id, // Keep the database ID just in case
      title: section.sectionName,
      shortTitle: section.sectionName,
      description: section.description, // Fixed: was sectionDescription
      questions: parsedQuestions.map((q) => ({
        id: q.id || q.questionId, // Support both id and questionId
        text: q.text || q.questionText, // Support both text and questionText
        type: "symptom",
      })),
    };
  });

  const section = mappedSections[sectionIndex];
  const answeredCount = Object.keys(answers).length;
  //const totalCount = allQuestions.length;
  const totalCount =
  mappedSections.reduce(
    (sum, s) => sum + (s.questions?.length || 0),
    0
  );
  const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const sectionAnswered = section?.questions?.filter(
    (question) => answers[question.id],
  ).length || 0;
  const sectionComplete = section ? sectionAnswered === section.questions.length : false;
  const allComplete = totalCount > 0 && answeredCount === totalCount;

  const domainSummaries = useMemo(() => {
    return mappedSections.map((item) => {
      const questions = item.questions || [];
      const answered = questions.filter(
        (question) => answers[question.id],
      ).length;
      const total = questions.length;
      return {
        ...item,
        answered,
        total,
        percent: total > 0 ? Math.round((answered / total) * 100) : 0,
      };
    });
  }, [answers]);

  useEffect(() => {
    // Load stored child profile
    try {
      const storedProfile = JSON.parse(
        sessionStorage.getItem("neurovice_child_profile"),
      );
      if (storedProfile) {
        setProfile(storedProfile);
      }
    } catch (e) {
      console.error("Failed to load stored profile:", e);
    }

    async function loadQuestionnaire() {
      console.log("Starting to load questionnaire...");
      try {
        const data = await getAllQuestionaires();
        console.log("QUESTIONNAIRES RECEIVED:", data);
        setSections(data || []);
      } catch (err) {
        console.error("ERROR LOADING QUESTIONNAIRES:", err);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    }

    loadQuestionnaire();
  }, []);

  useEffect(() => {
    async function createAssessment() {
      try {
        const profile = JSON.parse(
          sessionStorage.getItem("neurovice_child_profile"),
        );

        if (!profile?.id) return;

        const response = await startAssessment({
          childId: profile.id,
        });

        console.log(response);

        setAssessmentId(response.assessmentId);

        sessionStorage.setItem(
  "assessmentId",
  response.assessmentId
);
      } catch (err) {
        console.error(err);
      }
    }

    createAssessment();
  }, []);

  const answerQuestion = (questionId, score) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: score,
    }));
  };

  const goNext = async () => {
    if (!assessmentId || submitting) return;

    setSubmitting(true); // Disable buttons
    try {
      // Prepare section answers as Map<String, Integer> (questionId -> score) with "q" prefix
      const sectionAnswers = {};
      section.questions.forEach(q => {
        const questionKey = typeof q.id.toString().toLowerCase().startsWith("q") 
          ? q.id.toString() 
          : "q" + q.id;
        sectionAnswers[questionKey] = answers[q.id];
      });

      await submitAssessmentSection(
        assessmentId,
        {
          sectionId: section.id, // This is the sectionId from the backend (not the db id)
          answers: sectionAnswers
        }
      );

      if (sectionIndex < mappedSections.length - 1) {
        setSectionIndex(value => value + 1);
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    } finally {
      setSubmitting(false); // Re-enable buttons
    }
  };

  const goBack = () => {
    if (sectionIndex > 0) {
      setSectionIndex((value) => value - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!allComplete || submitting) return;

    setSubmitting(true); // Disable buttons
    setStatus("submitting");
    setSubmitNote("");

    try {
      // First, submit the last section (in case it's not already submitted)
      const sectionAnswers = {};
      section.questions.forEach(q => {
        const questionKey = typeof q.id.toString().toLowerCase().startsWith("q") 
          ? q.id.toString() 
          : "q" + q.id;
        sectionAnswers[questionKey] = answers[q.id];
      });
      await submitAssessmentSection(assessmentId, {
        sectionId: section.id,
        answers: sectionAnswers
      });

      // Check the status
      const status = await getAssessmentStatus(assessmentId);
      console.log(status);

      // Mark assessment as completed in sessionStorage
      try {
        const stored = window.sessionStorage.getItem('neurovice_completed_steps');
        let completedSteps = stored ? JSON.parse(stored) : [];
        if (!completedSteps.includes('assessment')) {
          completedSteps.push('assessment');
          window.sessionStorage.setItem('neurovice_completed_steps', JSON.stringify(completedSteps));
        }
      } catch (e) {
        console.error('Failed to save completed steps', e);
      }

      setStatus("submitted");
      setSubmitNote("Assessment completed successfully!");
    } finally {
      setSubmitting(false); // Re-enable buttons
    }
  };

  
  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,

      [questionId]: value,
    }));
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
            Answer each item based on recent patterns. Your ratings are sent as
            structured numbers for backend scoring and AI/ML analysis.
          </p>
        </div>

        <aside className="assessment-disclaimer">
          <span>Clinical note</span>
          <p>
            This screening flow supports care planning and does not replace
            medical advice from a pediatrician or qualified clinician.
          </p>
        </aside>
      </header>

      <section className="assessment-shell">
        <aside className="assessment-sidebar">
          <div className="sidebar-card">
            <span className="assessment-kicker">Sections</span>
            {domainSummaries.map((item, index) => (
              <button
                className={`section-tab ${index === sectionIndex ? "active" : ""}`}
                key={item.id}
                type="button"
                onClick={() => setSectionIndex(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.shortTitle}</strong>
                <small>
                  {item.answered}/{item.total}
                </small>
                <i style={{ "--section-percent": `${item.percent}%` }}></i>
              </button>
            ))}
          </div>
        </aside>

        {loading ? (
          <section className="question-panel" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(0, 0, 0, 0.2)',
              borderTop: '4px solid #000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </section>
        ) : section ? (
          <section className="question-panel">
            <div className="question-panel-head">
              <div>
                <p className="assessment-kicker">
                  Part {sectionIndex + 1} of {mappedSections.length}
                </p>
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

                  <div
                    className="rating-grid"
                    role="radiogroup"
                    aria-label={`Question ${question.id} rating`}
                  >
                    {ratingLabels[question.type].map((label, index) => {
                      const score = index + 1;
                      const selected = answers[question.id] === score;

                      return (
                        <button
                          className={`rating-pill ${selected ? "selected" : ""}`}
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
              <button
                className="ghost-assessment-btn"
                type="button"
                onClick={goBack}
                disabled={sectionIndex === 0 || submitting}
              >
                Previous part
              </button>

              {sectionIndex < mappedSections.length - 1 ? (
                <button
                  className="solid-assessment-btn"
                  type="button"
                  onClick={goNext}
                  disabled={!sectionComplete || submitting}
                >
                  {submitting ? "Submitting..." : "Continue to next part"}
                </button>
              ) : (
                <button
                  className="solid-assessment-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allComplete || submitting}
                >
                  {submitting ? "Submitting..." : "Submit assessment"}
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
        ) : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<AssessmentPage />);
