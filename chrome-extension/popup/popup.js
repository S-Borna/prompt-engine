// ═══════════════════════════════════════════════════════════════
// PRAXIS Chrome Extension — Popup Logic
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://praxis.saidborna.com';

// ─── DOM REFS ─────────────────────────────────────────────────
const welcomeModal = document.getElementById('welcome-modal');
const welcomeContinueBtn = document.getElementById('welcome-continue-btn');
const loginView = document.getElementById('login-view');
const mainView = document.getElementById('main-view');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const promptInput = document.getElementById('prompt-input');
const platformSelect = document.getElementById('platform-select');
const enhanceBtn = document.getElementById('enhance-btn');
const enhanceText = document.getElementById('enhance-text');
const enhanceLoading = document.getElementById('enhance-loading');
const resultSection = document.getElementById('result-section');
const resultText = document.getElementById('result-text');
const scoreBadge = document.getElementById('score-badge');
const copyBtn = document.getElementById('copy-btn');
const usageBar = document.getElementById('usage-bar');
const usageFill = document.getElementById('usage-fill');
const usageText = document.getElementById('usage-text');

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Check if first-time user
    const { praxis_seen_welcome } = await chrome.storage.local.get('praxis_seen_welcome');

    if (!praxis_seen_welcome) {
        // Show welcome modal for first-time users
        welcomeModal.classList.remove('hidden');
        return;
    }

    // Returning users — check session
    const session = await getSession();
    if (session) {
        showMainView(session);
    } else {
        showLoginView();
    }
});

// ─── WELCOME MODAL ────────────────────────────────────────────
welcomeContinueBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({ praxis_seen_welcome: true });
    welcomeModal.classList.add('hidden');
    showLoginView();
});

// ─── AUTH ──────────────────────────────────────────────────────
loginBtn.addEventListener('click', handleLogin);
loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});

async function handleLogin() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showError('Email and password required');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    hideError();

    try {
        const res = await fetch(`${API_BASE}/api/extension/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.error || 'Invalid credentials');
            return;
        }

        // Store session
        await chrome.storage.local.set({
            praxis_token: data.token,
            praxis_user: data.user,
        });

        showMainView(data.user);
    } catch (err) {
        showError('Connection failed. Try again.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['praxis_token', 'praxis_user']);
    showLoginView();
    resultSection.classList.add('hidden');
});

// ─── ENHANCE ──────────────────────────────────────────────────
enhanceBtn.addEventListener('click', handleEnhance);

promptInput.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleEnhance();
});

async function handleEnhance() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    const token = (await chrome.storage.local.get('praxis_token')).praxis_token;
    if (!token) {
        showLoginView();
        return;
    }

    enhanceBtn.disabled = true;
    enhanceText.classList.add('hidden');
    enhanceLoading.classList.remove('hidden');
    resultSection.classList.add('hidden');

    try {
        const res = await fetch(`${API_BASE}/api/extension/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                prompt,
                platform: platformSelect.value,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 401) {
                await chrome.storage.local.remove(['praxis_token', 'praxis_user']);
                showLoginView();
                showError('Session expired. Please sign in again.');
                return;
            }
            if (res.status === 403 && data.upgradeUrl) {
                resultText.textContent = `${data.message}\n\nUpgrade at: ${API_BASE}${data.upgradeUrl}`;
                resultSection.classList.remove('hidden');
                return;
            }
            resultText.textContent = data.error || 'Enhancement failed';
            resultSection.classList.remove('hidden');
            return;
        }

        // Show result
        resultText.textContent = data.enhanced;
        resultSection.classList.remove('hidden');

        // Score badge
        if (data.qualityScore) {
            const score = data.qualityScore;
            scoreBadge.classList.remove('hidden', 'excellent', 'strong', 'good');
            if (score >= 85) {
                scoreBadge.classList.add('excellent');
                scoreBadge.textContent = `✦ Excellent — ${score}/100`;
            } else if (score >= 70) {
                scoreBadge.classList.add('strong');
                scoreBadge.textContent = `◆ Strong — ${score}/100`;
            } else {
                scoreBadge.classList.add('good');
                scoreBadge.textContent = `● Enhanced — ${score}/100`;
            }
        }

        // Update usage
        if (data.usage) {
            updateUsage(data.usage);
        }

        // Notify content script so it can paste if focused
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'PRAXIS_ENHANCED',
                    enhanced: data.enhanced,
                }).catch(() => { }); // Ignore if no content script
            }
        });

    } catch (err) {
        resultText.textContent = 'Connection error. Check your internet.';
        resultSection.classList.remove('hidden');
    } finally {
        enhanceBtn.disabled = false;
        enhanceText.classList.remove('hidden');
        enhanceLoading.classList.add('hidden');
    }
}

// ─── COPY ─────────────────────────────────────────────────────
copyBtn.addEventListener('click', () => {
    const text = resultText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.className = 'copied-toast';
        toast.textContent = 'Copied to clipboard';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1500);
    });
});

// ─── HELPERS ──────────────────────────────────────────────────
async function getSession() {
    const data = await chrome.storage.local.get(['praxis_token', 'praxis_user']);
    if (data.praxis_token && data.praxis_user) {
        return data.praxis_user;
    }
    return null;
}

function showLoginView() {
    loginView.classList.remove('hidden');
    mainView.classList.add('hidden');
    loginEmail.value = '';
    loginPassword.value = '';
    hideError();
}

function showMainView(user) {
    loginView.classList.add('hidden');
    mainView.classList.remove('hidden');

    const tierClass = user.tier === 'PRO' ? 'tier-pro'
        : user.tier === 'CREATOR' ? 'tier-creator'
            : 'tier-free';

    userInfo.innerHTML = `
    ${user.email}
    <span class="tier-badge ${tierClass}">${user.tier}</span>
  `;

    // Show usage for free users
    if (user.tier === 'FREE') {
        updateUsage({
            promptsUsed: user.promptsUsed || 0,
            limit: 5,
            tier: 'FREE',
        });
    }

    // Try to grab text from active tab's input field
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'PRAXIS_GET_PROMPT' })
                .then((response) => {
                    if (response?.prompt) {
                        promptInput.value = response.prompt;
                    }
                })
                .catch(() => { }); // No content script on this page
        }
    });
}

function updateUsage(usage) {
    if (!usage || usage.tier === 'PRO' || usage.tier === 'CREATOR') {
        usageBar.classList.add('hidden');
        return;
    }

    usageBar.classList.remove('hidden');
    const used = usage.promptsUsed || 0;
    const limit = usage.limit || 5;
    const pct = Math.min((used / limit) * 100, 100);

    usageFill.style.width = `${pct}%`;
    usageFill.classList.remove('warning', 'critical');
    if (pct >= 90) usageFill.classList.add('critical');
    else if (pct >= 60) usageFill.classList.add('warning');

    usageText.textContent = `${used}/${limit} today`;
}

function showError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
}

function hideError() {
    loginError.classList.add('hidden');
}
