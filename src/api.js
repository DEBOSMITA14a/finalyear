const profileStorageKey = 'neurovice_child_profile';
const assessmentStorageKey = 'neurovice_latest_assessment';
const authSessionKey = 'neurovice_auth_session';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(
  /\/$/,
  ''
);

export const API_ENDPOINTS = {
  signUp: '/api/auth/otp/request',
  signIn: '/api/auth/signin',
  verifyOtp: '/api/auth/otp/verify',
  resendOtp: '/api/auth/resend-otp',
  me: '/api/account/me',
  submitAssessment: '/api/assessments/nichq',
  latestAssessment: '/api/assessments/nichq/latest',
  createChild: '/api/child/create',
  startAssessment: '/api/assessment/start',
  submitAssessmentSection: (assessmentId) =>
    `/api/assessment/${assessmentId}/section`,
  assessmentStatus: (assessmentId) => `/api/assessment/${assessmentId}/status`,
  assessmentDiagnosis: (assessmentId) =>
    `/api/assessment/${assessmentId}/diagnosis`,
  runAnalysis: '/api/analysis/run',
  gameData: '/api/game-data',
  getAllQuestionaires: '/api/questionaires/getallquestionaires'
};

function apiUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${endpoint}`;
}

async function apiRequest(endpoint, options = {}) {
  console.log('=== API REQUEST START ===');
  console.log('Endpoint:', endpoint);
  console.log('Full URL:', apiUrl(endpoint));
  console.log('Options:', options);

  const response = await fetch(apiUrl(endpoint), {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  console.log('=== API RESPONSE ===');
  console.log('Status:', response.status, response.statusText);
  const text = await response.text();
  console.log('Raw response text:', text);

  let data;
  try {
    data = JSON.parse(text);
    console.log('Parsed JSON:', data);
  } catch (e) {
    console.log('Failed to parse JSON, using raw text:', e);
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.message ||
          data?.error ||
          data?.msg ||
          `Request failed with status ${response.status}`;
    console.log('Error message:', message);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  console.log('=== API REQUEST COMPLETE ===');
  return data;
}

function normalizeProfile(data) {
  const child =
    data?.child || data?.profile?.child || data?.children?.[0] || data;

  return {
    name: child?.name || child?.childName || child?.firstName || 'Alex',
    age: child?.age || child?.childAge || '5',
    id: child?.id || child?.childId || null
  };
}

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

export function readAuthSession() {
  try {
    const stored = window.sessionStorage.getItem(authSessionKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeAuthSession(session) {
  window.sessionStorage.setItem(authSessionKey, JSON.stringify(session));
}

export function readStoredAssessment() {
  try {
    const stored = window.sessionStorage.getItem(assessmentStorageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeAssessment(assessment) {
  window.sessionStorage.setItem(
    assessmentStorageKey,
    JSON.stringify(assessment)
  );
}

// Signup Parent (stores data locally, calls /api/auth/otp/request)
export async function signUpParent(signupData) {
  console.log('signUpParent called with:', signupData);
  // Store signup data in session for later use
  const session = {
    email: signupData.emailAddress,
    signupData: signupData
  };
  storeAuthSession(session);

  // Call /api/auth/otp/request with email only
  const payload = { email: signupData.emailAddress };
  console.log('signUpParent: sending to otp/request:', payload);
  const data = await apiRequest(API_ENDPOINTS.signUp, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  console.log('signUpParent: otp/request response:', data);

  return data;
}

export async function signInParent(payload) {
  const data = await apiRequest(API_ENDPOINTS.signIn, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const session = normalizeProfile(
    data?.profile || data?.user || data,
    readStoredChildProfile() || { name: 'Alex', age: '5', id: null }
  );
  storeAuthSession(session);
  storeChildProfile(session);
  return { ok: true, localOnly: false, ...session };
}

// Verify OTP (ONLY email and otp - matches your backend's OtpVerify DTO!)
export async function verifyOtp(code) {
  const session = readAuthSession();
  console.log('verifyOtp: session from storage:', session);
  if (!session) {
    throw new Error('Authentication session not found');
  }
  if (!session.email) {
    throw new Error('Email not found in authentication session');
  }

  const payload = {
    email: session.email,
    otp: String(code)
  };
  console.log('verifyOtp: sending payload to backend (email+otp only!):', payload);
  const data = await apiRequest(API_ENDPOINTS.verifyOtp, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  console.log('verifyOtp: backend response:', data);

  return data;
}

// Create parent (calls your /api/user/create endpoint)
export async function createParent(userData) {
  // Map form fields to backend expected fields
  const mappedData = {
    username: userData.userName,
    email: userData.emailAddress,
    whatsappNumber: userData.whatsappNumber,
    address: userData.address,
    relationWithChild: userData.relationWithChild,
    aadhaarId: userData.aadhaarId,
    password: userData.password
  };
  
  console.log('Creating parent with mapped data:', mappedData);
  const data = await apiRequest('/api/user/create', {
    method: 'POST',
    body: JSON.stringify(mappedData)
  });
  console.log('Parent created, response:', data);
  return data;
}

export async function resendOtp() {
  const session = readAuthSession();
  const body = {};
  if (session?.challengeId) body.challengeId = session.challengeId;

  const data = await apiRequest(API_ENDPOINTS.resendOtp, {
    method: 'POST',
    body: JSON.stringify(body)
  });

  return { ok: true, localOnly: false, data };
}

export async function getAccountChildProfile() {
  try {
    const data = await apiRequest(API_ENDPOINTS.me);
    const profile = normalizeProfile(data);
    storeChildProfile(profile);
    return profile;
  } catch {
    return readStoredChildProfile() || { name: 'Alex', age: '5', id: null };
  }
}

export async function submitAssessment(payload) {
  try {
    const data = await apiRequest(API_ENDPOINTS.submitAssessment, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    storeAssessment(data?.assessment || data || payload);
    return { ok: true, data, localOnly: false };
  } catch {
    storeAssessment(payload);
    return { ok: true, data: payload, localOnly: true };
  }
}

export async function getLatestAssessment() {
  try {
    const data = await apiRequest(API_ENDPOINTS.latestAssessment);
    const assessment = data?.assessment || data;
    if (assessment?.answers) storeAssessment(assessment);
    return assessment?.answers ? assessment : readStoredAssessment();
  } catch {
    return readStoredAssessment();
  }
}

export function hasStoredAssessment() {
  return Boolean(window.sessionStorage.getItem(assessmentStorageKey));
}

export async function createChild(payload) {
  // Get parentId from sessionStorage and convert to number!
  const parentIdStr = window.sessionStorage.getItem('parentId');
  const childPayload = { ...payload };
  if (parentIdStr) {
    childPayload.parentId = Number(parentIdStr);
  }
  console.log('Creating child with:', childPayload);

  const data = await apiRequest(API_ENDPOINTS.createChild, {
    method: 'POST',
    body: JSON.stringify(childPayload)
  });
  const profile = normalizeProfile(data);
  storeChildProfile(profile);
  return data;
}

export async function startAssessment(payload) {
  const data = await apiRequest(API_ENDPOINTS.startAssessment, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  storeAssessment(data?.assessment || data);
  return data;
}

export async function submitAssessmentSection(assessmentId, payload) {
  const data = await apiRequest(
    API_ENDPOINTS.submitAssessmentSection(assessmentId),
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
  storeAssessment(data?.assessment || data);
  return data;
}

export async function getAssessmentStatus(assessmentId) {
  return apiRequest(API_ENDPOINTS.assessmentStatus(assessmentId));
}

export async function getAssessmentDiagnosis(assessmentId) {
  return apiRequest(API_ENDPOINTS.assessmentDiagnosis(assessmentId));
}

export async function runAnalysis(childId) {
  const params = new URLSearchParams({
    childId: String(childId)
  });

  const endpoint =
    `${API_ENDPOINTS.runAnalysis}?${params.toString()}`;

  try {
    return await apiRequest(endpoint, {
      method: 'POST'
    });
  } catch (postError) {
    // Try GET when the backend does not accept POST,
    // or when the POST request is blocked before a response arrives.
    if (
      postError?.status &&
      postError.status !== 404 &&
      postError.status !== 405
    ) {
      throw postError;
    }

    console.warn(
      'POST analysis request failed. Trying GET instead.',
      postError
    );

    return apiRequest(endpoint, {
      method: 'GET'
    });
  }
}

export async function sendGameData(payload) {
  return apiRequest(API_ENDPOINTS.gameData, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getAllQuestionaires() {
  return apiRequest(API_ENDPOINTS.getAllQuestionaires);
}
