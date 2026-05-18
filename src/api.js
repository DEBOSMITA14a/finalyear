const profileStorageKey = 'neurovice_child_profile';
const assessmentStorageKey = 'neurovice_latest_assessment';

export function readStoredChildProfile() {
  try {
    const stored = window.sessionStorage.getItem(profileStorageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeChildProfile(profile) {
  window.sessionStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

function normalizeProfile(data) {
  const child = data?.child || data?.profile?.child || data?.children?.[0] || data;

  return {
    name: child?.name || child?.childName || child?.firstName || 'Alex',
    age: child?.age || child?.childAge || '5',
    id: child?.id || child?.childId || null
  };
}

export async function getAccountChildProfile() {
  try {
    const response = await fetch('/api/account/me', {
      headers: {
        Accept: 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Account profile unavailable');

    const profile = normalizeProfile(await response.json());
    storeChildProfile(profile);
    return profile;
  } catch {
    return readStoredChildProfile() || { name: 'Alex', age: '5', id: null };
  }
}

export async function submitAssessment(payload) {
  try {
    const response = await fetch('/api/assessments/nichq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Assessment submit failed');
    return { ok: true, data: await response.json(), localOnly: false };
  } catch {
    window.sessionStorage.setItem(assessmentStorageKey, JSON.stringify(payload));
    return { ok: true, data: payload, localOnly: true };
  }
}

export function hasStoredAssessment() {
  return Boolean(window.sessionStorage.getItem(assessmentStorageKey));
}
