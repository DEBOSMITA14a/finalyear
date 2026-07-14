import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './result.css';
import {
  getAccountChildProfile,
  getLatestAssessment,
  runAnalysis
} from './api.js';
import { assessmentGroups } from './assessmentData.js';

const fallbackProfile = { name: 'Alex', age: '5', id: null };

const scoreBands = {
  0: {
    label: 'Very low concern',
    summary:
      'Current responses show very few elevated concerns in this screening snapshot.',
    nextSteps: [
      'Keep observing routines, classroom transitions, and social interactions over time.',
      'Repeat the screening later if new concerns begin to show up across settings.',
      'Use this as a low-concern baseline unless new developmental questions arise.'
    ]
  },
  10: {
    label: 'Low concern',
    summary:
      'There are mild signals here, but the overall pattern remains in a low-concern range.',
    nextSteps: [
      'Track the most noticeable behavior for the next two to three weeks.',
      'Check whether the same pattern appears at home and in school or daycare.',
      'Repeat the assessment if the behavior becomes more frequent or disruptive.'
    ]
  },
  20: {
    label: 'Watchful range',
    summary:
      'A few concern areas are beginning to stand out and may benefit from closer monitoring.',
    nextSteps: [
      'Pick one or two situations to observe consistently, such as transitions or seated tasks.',
      'Ask another caregiver or teacher whether they are seeing similar patterns.',
      'Compare the next screening to see whether the same domains stay elevated.'
    ]
  },
  30: {
    label: 'Emerging concern',
    summary:
      'The current pattern suggests early attention, regulation, or behavior concerns worth watching more intentionally.',
    nextSteps: [
      'Start a short behavior log with dates, triggers, and how long the difficulty lasts.',
      'Compare which settings feel hardest for your child and which ones go more smoothly.',
      'Bring the pattern up during a routine pediatric follow-up if it continues.'
    ]
  },
  40: {
    label: 'Mild-to-moderate concern',
    summary:
      'This score range suggests difficulties are becoming more noticeable and may be affecting daily routines.',
    nextSteps: [
      'Document specific examples involving focus, impulsivity, transitions, or task completion.',
      'Ask school staff or caregivers for concrete examples instead of general impressions.',
      'Plan a follow-up conversation with a pediatrician if the same issues persist across settings.'
    ]
  },
  50: {
    label: 'Moderate concern',
    summary:
      'The screening shows a moderate level of concern and a stronger need for structured follow-up.',
    nextSteps: [
      'Bring this summary to a pediatrician, psychologist, or developmental specialist.',
      'Review whether these behaviors are affecting learning, routines, or peer relationships.',
      'Track whether the highest subscore domains are stable or increasing over time.'
    ]
  },
  60: {
    label: 'Moderately elevated',
    summary:
      'The pattern is meaningfully elevated and suggests concerns that should be reviewed more formally.',
    nextSteps: [
      'Schedule a developmental or behavioral follow-up rather than waiting for concerns to grow.',
      'Gather observations from both home and school so the clinician sees multiple settings.',
      'Prioritize the top scoring domains first when discussing practical concerns.'
    ]
  },
  70: {
    label: 'High concern',
    summary:
      'This range suggests a high level of concern in the current screening profile.',
    nextSteps: [
      'Arrange a clinical review and bring both this score and the domain breakdown.',
      'List the situations where your child struggles most so the visit stays focused and useful.',
      'Use the top two domains as the first priority areas for follow-up discussion.'
    ]
  },
  80: {
    label: 'Very high concern',
    summary:
      'The profile is strongly elevated and points to broad difficulties that likely need formal assessment.',
    nextSteps: [
      'Move ahead with a pediatric, developmental, or psychological evaluation soon.',
      'Collect examples from home, school, and other supervised settings before the appointment.',
      'Ask directly how the highest scoring domains relate to learning, regulation, and safety.'
    ]
  },
  90: {
    label: 'Urgent follow-up range',
    summary:
      'This screening is in a very elevated range and suggests prompt professional follow-up is important.',
    nextSteps: [
      'Schedule a clinician review as soon as possible and share the full scoring breakdown.',
      'If behavior is affecting safety, routines, or school functioning, mention that clearly in the appointment request.',
      'Keep a short record of recent high-impact incidents to support the next clinical step.'
    ]
  }
};

const backendScoreKeys = [
  'finalRiskScore',
  'score',
  'riskScore',
  'overallScore',
  'finalScore',
  'final_risk_score',
  'risk_score'
];

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function calculateConcernScore(items) {
  if (!items.length) return 0;

  const total = items.reduce(
    (sum, item) => sum + Number(item.score || 0),
    0
  );
  const average = total / items.length;

  return clampScore(Math.round(((average - 1) / 4) * 100));
}

function getBandStart(score) {
  if (score >= 100) return 90;
  return Math.min(Math.floor(score / 10) * 10, 90);
}

function getBandLabel(start) {
  return start === 90 ? '90-100' : `${start}-${start + 9}`;
}

function analyzeAssessment(assessment) {
  const answers = assessment?.answers || [];

  if (!answers.length) return null;

  const overallScore = calculateConcernScore(answers);
  const bandStart = getBandStart(overallScore);
  const guidance = scoreBands[bandStart];

  const subscores = assessmentGroups
    .map((group) => {
      const domainAnswers = answers.filter(
        (answer) => answer.domain === group.id
      );

      return {
        id: group.id,
        title: group.title,
        shortTitle: group.shortTitle,
        score: calculateConcernScore(domainAnswers),
        theme: group.theme,
        count: domainAnswers.length
      };
    })
    .filter((group) => group.count > 0);

  const dominantDomains = [...subscores]
    .sort((first, second) => second.score - first.score)
    .slice(0, 2);

  const domainPhrase = dominantDomains.length
    ? dominantDomains
        .map((domain) => domain.shortTitle.toLowerCase())
        .join(' and ')
    : 'attention and regulation';

  return {
    overallScore,
    bandLabel: getBandLabel(bandStart),
    guidance,
    subscores,
    patternSummary: `${guidance.summary} The strongest signals in this response set are currently around ${domainPhrase}.`
  };
}

function readStoredProfile() {
  try {
    const stored = window.sessionStorage.getItem(
      'neurovice_child_profile'
    );

    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Could not read the stored child profile:', error);
    return null;
  }
}

function toFiniteNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const cleanedValue = value.trim().replace('%', '');

    if (!cleanedValue) return null;

    const numericValue = Number(cleanedValue);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  return null;
}

function hasBackendScore(candidate) {
  if (!candidate || typeof candidate !== 'object') return false;

  return backendScoreKeys.some(
    (key) => candidate[key] !== undefined && candidate[key] !== null
  );
}

function normalizeBackendResult(data) {
  const possiblePayloads = [
    data,
    data?.data,
    data?.result,
    data?.analysis,
    data?.payload,
    data?.response,
    data?.data?.result,
    data?.data?.analysis
  ]
    .flatMap((candidate) =>
      Array.isArray(candidate) ? candidate : [candidate]
    )
    .filter(
      (candidate) => candidate !== null && candidate !== undefined
    );

  const payload =
    possiblePayloads.find((candidate) => hasBackendScore(candidate)) ??
    possiblePayloads[0] ??
    null;

  let scoreValue = null;

  if (typeof payload === 'number' || typeof payload === 'string') {
    scoreValue = payload;
  } else if (payload && typeof payload === 'object') {
    const scoreKey = backendScoreKeys.find(
      (key) => payload[key] !== undefined && payload[key] !== null
    );

    if (scoreKey) scoreValue = payload[scoreKey];
  }

  const score = toFiniteNumber(scoreValue);

  const interpretation =
    payload?.interpretation ??
    payload?.summary ??
    payload?.patternSummary ??
    payload?.riskInterpretation ??
    payload?.message ??
    null;

  return {
    payload,
    score,
    interpretation
  };
}

function ResultPage() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [assessment, setAssessment] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadResult() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        let activeProfile = readStoredProfile();
        let childId = activeProfile?.id ?? activeProfile?.childId;

        if (!childId) {
          const accountProfile = await getAccountChildProfile();

          activeProfile = {
            ...activeProfile,
            ...accountProfile
          };
          childId = activeProfile?.id ?? activeProfile?.childId;
        }

        if (!isCancelled) {
          setProfile({
            ...fallbackProfile,
            ...activeProfile
          });
        }

        const latestAssessment = await getLatestAssessment();

        if (!isCancelled) {
          setAssessment(latestAssessment || null);
        }

        if (!childId) {
          throw new Error(
            'Child ID was not found. Please sign in again and open the result page after selecting or creating the child profile.'
          );
        }

        const aiData = await runAnalysis(childId);

        console.log('Analysis API response:', aiData);

        if (!isCancelled) {
          setResult(aiData);
        }
      } catch (error) {
        console.error(
          'Failed to fetch AI analysis from Spring Boot:',
          error
        );

        if (!isCancelled) {
          setResult(null);
          setErrorMessage(
            error?.message || 'The backend result could not be loaded.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      isCancelled = true;
    };
  }, []);

  const analysis = useMemo(
    () => analyzeAssessment(assessment),
    [assessment]
  );

  const normalizedResult = useMemo(
    () => normalizeBackendResult(result),
    [result]
  );

  const backendScore = normalizedResult.score;
  const rawScore = backendScore ?? analysis?.overallScore ?? null;
  const hasValidScore = Number.isFinite(rawScore);
  const finalScore = hasValidScore ? clampScore(rawScore) : null;
  const bandStart = hasValidScore ? getBandStart(finalScore) : 0;
  const bandLabel = hasValidScore
    ? getBandLabel(bandStart)
    : analysis?.bandLabel || 'N/A';
  const guidance = scoreBands[bandStart] || scoreBands[0];
  const displayScore = hasValidScore ? finalScore.toFixed(2) : '--';
  const scoreProgress = hasValidScore ? finalScore : 0;
  const displaySummary =
    normalizedResult.interpretation ??
    analysis?.patternSummary ??
    'The result interpretation is not available yet.';
  const hasResult =
    hasValidScore || Boolean(normalizedResult.payload) || Boolean(analysis);

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#fcfcf8',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
          <div
            style={{
              width: '56px',
              height: '56px',
              border: '5px solid rgba(42, 67, 58, 0.1)',
              borderTop: '5px solid #2a433a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
          <p
            style={{
              marginTop: '24px',
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: '16px',
              color: '#2a433a',
              fontWeight: '500'
            }}
          >
            Analyzing results...
          </p>
        </div>
      )}

      <main className="result-page">
        <div className="result-bg" aria-hidden="true">
          <span className="result-ring ring-one"></span>
          <span className="result-ring ring-two"></span>
        </div>

        <nav className="result-nav" aria-label="Result navigation">
          <a className="result-brand" href="/dashboard.html">
            <span>N</span>
            Dashboard
          </a>
          <div className="result-nav-actions">
            <a href="/assessment.html">Retake assessment</a>
            <a href="/dashboard.html">Back to care path</a>
          </div>
        </nav>

        <header className="result-hero">
          <div className="result-headline">
            <p className="result-kicker">Dynamic screening result</p>
            <h1>{profile.name}'s result overview</h1>
            <p>
              {hasResult
                ? `This page is generated from the latest saved assessment for age ${profile.age}, including a live concern score and domain-level subscores.`
                : 'Complete the assessment first to generate a live score, domain breakdown, and score-range-based guidance.'}
            </p>
          </div>
        </header>

        <section className="result-layout">
          <section className="result-column">
            <article className="result-panel summary-panel">
              <div className="panel-title">
                <p className="result-kicker">Pattern interpretation</p>
                <h2>What this pattern suggests</h2>
              </div>

              {hasResult ? (
                <>
                  <p>{displaySummary}</p>
                  <div className="diagnostic-banner">
                    <strong>
                      {hasValidScore
                        ? guidance.label
                        : 'Score unavailable'}
                    </strong>
                    <span>
                      {hasValidScore
                        ? `Score band ${bandLabel}. Use this as screening guidance only, not a diagnosis.`
                        : 'The backend response did not include a valid numeric score.'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Once the assessment is completed, this section will
                    describe how the current response pattern looks overall
                    and which domains stand out most clearly.
                  </p>
                  <div className="diagnostic-banner">
                    <strong>No assessment yet</strong>
                    <span>
                      {errorMessage ||
                        'Complete the assessment to unlock the generated interpretation and next-step guidance.'}
                    </span>
                  </div>
                </>
              )}
            </article>

            <article className="result-panel">
              <div className="panel-title">
                <p className="result-kicker">Next steps</p>
                <h2>What parents can do next</h2>
              </div>
              <ul className="result-list">
                {guidance.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="result-column">
            <article className="result-panel result-score-panel">
              <div className="panel-title">
                <p className="result-kicker">Score chart</p>
                <h2>Overall screening score</h2>
              </div>

              <div className="score-chart-block">
                <div className="score-circle-shell">
                  <div
                    className="score-circle"
                    style={{
                      '--score-progress': `${scoreProgress}%`
                    }}
                    aria-label={
                      hasValidScore
                        ? `Screening score ${displayScore} out of 100`
                        : 'Screening score unavailable'
                    }
                  >
                    <strong
                      style={{
                        position: 'relative',
                        top: '18px',
                        fontSize: '50px'
                      }}
                    >
                      {displayScore}
                    </strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="score-chart-copy">
                  <span className="score-label">
                    Overall concern score
                  </span>
                  <p>
                    {hasValidScore
                      ? guidance.label
                      : 'Waiting for backend score'}
                  </p>
                  <small>
                    {hasValidScore
                      ? `This score is grouped into the ${bandLabel} range and updates from the latest backend analysis.`
                      : errorMessage ||
                        'A live score will appear here after a completed assessment is saved.'}
                  </small>
                </div>
              </div>
            </article>

            <article className="result-panel score-panel">
              <div className="panel-title">
                <p className="result-kicker">Subscores</p>
                <h2>Domain breakdown</h2>
              </div>

              <div className="score-list">
                {(analysis?.subscores || []).map((item) => (
                  <div
                    className={`score-item tone-${item.theme}`}
                    key={item.id}
                  >
                    <div className="score-item-copy">
                      <span>{item.shortTitle}</span>
                      <small>{item.title}</small>
                    </div>
                    <div className="score-item-chart">
                      <div className="score-track" aria-hidden="true">
                        <div
                          className="score-fill"
                          style={{
                            '--score-width': `${item.score}%`
                          }}
                        ></div>
                      </div>
                      <strong>{item.score}/100</strong>
                    </div>
                  </div>
                ))}

                {!analysis && (
                  <div className="result-empty-state">
                    <p>
                      Subscores will appear here after the assessment is
                      completed and saved.
                    </p>
                  </div>
                )}
              </div>
            </article>
          </section>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<ResultPage />);