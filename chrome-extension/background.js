// ═══════════════════════════════════════════════════════════════
// PRAXIS Chrome Extension — Background Service Worker
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://praxis.saidborna.com';

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PRAXIS_ENHANCE_FROM_PAGE') {
        handleEnhanceFromPage(message, sender)
            .then(sendResponse)
            .catch((err) => sendResponse({ error: err.message }));
        return true; // Keep channel open for async
    }

    if (message.type === 'PRAXIS_CHECK_AUTH') {
        chrome.storage.local.get(['praxis_token', 'praxis_user'], (data) => {
            sendResponse({
                isAuthenticated: !!(data.praxis_token && data.praxis_user),
                user: data.praxis_user || null,
            });
        });
        return true;
    }
});

async function handleEnhanceFromPage(message, sender) {
    const data = await chrome.storage.local.get('praxis_token');
    const token = data.praxis_token;

    if (!token) {
        return { error: 'Not authenticated', needsLogin: true };
    }

    try {
        const res = await fetch(`${API_BASE}/api/extension/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                prompt: message.prompt,
                platform: message.platform || 'general',
            }),
        });

        const result = await res.json();

        if (!res.ok) {
            if (res.status === 401) {
                await chrome.storage.local.remove(['praxis_token', 'praxis_user']);
                return { error: 'Session expired', needsLogin: true };
            }
            return { error: result.error || 'Enhancement failed' };
        }

        return {
            enhanced: result.enhanced,
            qualityScore: result.qualityScore,
            usage: result.usage,
        };
    } catch (err) {
        return { error: 'Connection error' };
    }
}

// Badge: show auth state on icon
chrome.storage.onChanged.addListener((changes) => {
    if (changes.praxis_token) {
        updateBadge(!!changes.praxis_token.newValue);
    }
});

function updateBadge(isLoggedIn) {
    if (isLoggedIn) {
        chrome.action.setBadgeText({ text: '' });
    } else {
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    }
}

// Initial badge state
chrome.storage.local.get('praxis_token', (data) => {
    updateBadge(!!data.praxis_token);
});
