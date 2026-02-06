// ═══════════════════════════════════════════════════════════════
// PRAXIS Chrome Extension — Content Script
// Injects "Enhance with PRAXIS" button into AI chat platforms
// ═══════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // Prevent double injection
    if (window.__praxisInjected) return;
    window.__praxisInjected = true;

    // ─── Platform Detection ────────────────────────────────────
    // ─── Helper: Insert text with paragraph breaks ──────────
    function setFormattedContent(el, text) {
        el.focus();

        if (el.getAttribute('contenteditable') === 'true') {
            // Clear existing content
            el.innerHTML = '';

            // Split on double-newlines for paragraph separation
            const paragraphs = text.split(/\n{2,}/).filter(p => p.trim());

            if (paragraphs.length <= 1) {
                // Single block — still split on single newlines for line breaks
                const lines = text.split(/\n/).filter(l => l.trim());
                lines.forEach((line, i) => {
                    const p = document.createElement('p');
                    p.textContent = line.trim();
                    el.appendChild(p);
                });
            } else {
                paragraphs.forEach(para => {
                    const p = document.createElement('p');
                    p.textContent = para.trim();
                    el.appendChild(p);
                });
            }

            // Trigger input events so the platform registers the change
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));

            // For ProseMirror-based editors (Claude, ChatGPT), also dispatch keyboard event
            el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Unidentified' }));
            el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Unidentified' }));
        } else if (el.tagName === 'TEXTAREA') {
            // Use native setter to bypass React/framework controlled input
            const nativeSet = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
            )?.set;
            if (nativeSet) {
                nativeSet.call(el, text);
            } else {
                el.value = text;
            }
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            el.innerText = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    const PLATFORMS = {
        chatgpt: {
            match: () => location.hostname.includes('chatgpt.com') || location.hostname.includes('chat.openai.com'),
            getTextarea: () => {
                // ChatGPT 5.2 uses ProseMirror — try multiple selectors from most specific to broadest
                return document.querySelector('#prompt-textarea') ||
                    document.querySelector('[id*="prompt-textarea"]') ||
                    document.querySelector('div[contenteditable="true"].ProseMirror') ||
                    document.querySelector('div[contenteditable="true"][data-placeholder]') ||
                    document.querySelector('main div[contenteditable="true"]') ||
                    document.querySelector('form div[contenteditable="true"]') ||
                    document.querySelector('form textarea') ||
                    document.querySelector('div[contenteditable="true"]');
            },
            getTextContent: (el) => el.innerText || el.textContent || el.value || '',
            setTextContent: (el, text) => setFormattedContent(el, text),
            platform: 'chatgpt',
        },
        claude: {
            match: () => location.hostname.includes('claude.ai'),
            getTextarea: () => document.querySelector(
                '[contenteditable="true"].ProseMirror, div[contenteditable="true"], fieldset [contenteditable]'
            ),
            getTextContent: (el) => el.innerText || el.textContent || '',
            setTextContent: (el, text) => setFormattedContent(el, text),
            platform: 'claude',
        },
        gemini: {
            match: () => location.hostname.includes('gemini.google.com'),
            getTextarea: () => document.querySelector(
                '.ql-editor, [contenteditable="true"], div[role="textbox"]'
            ),
            getTextContent: (el) => el.innerText || el.textContent || '',
            setTextContent: (el, text) => setFormattedContent(el, text),
            platform: 'gemini',
        },
        grok: {
            match: () => location.hostname.includes('grok.com') || location.hostname.includes('x.com/i/grok'),
            getTextarea: () => document.querySelector(
                'textarea, [contenteditable="true"], div[role="textbox"]'
            ),
            getTextContent: (el) => el.innerText || el.textContent || el.value || '',
            setTextContent: (el, text) => setFormattedContent(el, text),
            platform: 'grok',
        },
    };

    let currentPlatform = null;
    for (const [, cfg] of Object.entries(PLATFORMS)) {
        if (cfg.match()) {
            currentPlatform = cfg;
            break;
        }
    }
    if (!currentPlatform) return;

    // ─── Button Creation ───────────────────────────────────────
    let enhanceBtn = null;
    let isEnhancing = false;

    function createEnhanceButton() {
        if (enhanceBtn && document.body.contains(enhanceBtn)) return;

        enhanceBtn = document.createElement('button');
        enhanceBtn.id = 'praxis-enhance-btn';
        enhanceBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span>Enhance</span>
    `;
        enhanceBtn.title = 'Enhance with PRAXIS';
        enhanceBtn.addEventListener('click', handleEnhanceClick);

        document.body.appendChild(enhanceBtn);
        positionButton();
    }

    function positionButton() {
        if (!enhanceBtn) return;
        const textarea = currentPlatform.getTextarea();
        if (!textarea) return;

        const rect = textarea.getBoundingClientRect();
        enhanceBtn.style.position = 'fixed';
        enhanceBtn.style.top = `${rect.top - 36}px`;
        enhanceBtn.style.right = `${window.innerWidth - rect.right}px`;
        enhanceBtn.style.zIndex = '99999';
    }

    // ─── Enhance Handler ──────────────────────────────────────
    async function handleEnhanceClick(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isEnhancing) return;

        const textarea = currentPlatform.getTextarea();
        if (!textarea) return;

        const prompt = currentPlatform.getTextContent(textarea).trim();
        if (!prompt) {
            showToast('Type a prompt first');
            return;
        }

        isEnhancing = true;
        enhanceBtn.classList.add('praxis-loading');
        enhanceBtn.querySelector('span').textContent = 'Enhancing...';

        try {
            const response = await chrome.runtime.sendMessage({
                type: 'PRAXIS_ENHANCE_FROM_PAGE',
                prompt,
                platform: currentPlatform.platform,
            });

            if (response.error) {
                if (response.needsLogin) {
                    showToast('Sign in to PRAXIS extension first');
                } else {
                    showToast(response.error);
                }
                return;
            }

            if (response.enhanced) {
                currentPlatform.setTextContent(textarea, response.enhanced);
                showToast('✦ Enhanced by PRAXIS');
            }
        } catch (err) {
            showToast('PRAXIS connection error');
        } finally {
            isEnhancing = false;
            enhanceBtn.classList.remove('praxis-loading');
            enhanceBtn.querySelector('span').textContent = 'Enhance';
        }
    }

    // ─── Toast Notification ────────────────────────────────────
    function showToast(msg) {
        const existing = document.getElementById('praxis-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'praxis-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('praxis-toast-visible'), 10);
        setTimeout(() => {
            toast.classList.remove('praxis-toast-visible');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ─── Message Listener ─────────────────────────────────────
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'PRAXIS_GET_PROMPT') {
            const textarea = currentPlatform.getTextarea();
            const prompt = textarea ? currentPlatform.getTextContent(textarea).trim() : '';
            sendResponse({ prompt });
            return true;
        }

        if (message.type === 'PRAXIS_ENHANCED') {
            // Paste enhanced prompt into active textarea if user wants
            const textarea = currentPlatform.getTextarea();
            if (textarea && message.enhanced) {
                currentPlatform.setTextContent(textarea, message.enhanced);
                showToast('✦ Enhanced prompt pasted');
            }
        }
    });

    // ─── Observer: Watch for textarea appearance ───────────────
    function tryInject() {
        const textarea = currentPlatform.getTextarea();
        if (textarea) {
            createEnhanceButton();
            return true;
        }
        return false;
    }

    // Initial attempt
    if (!tryInject()) {
        // Retry with increasing delays for SPAs like ChatGPT that render late
        const retryDelays = [500, 1000, 2000, 3000, 5000, 8000];
        retryDelays.forEach(delay => {
            setTimeout(() => {
                if (!enhanceBtn || !document.body.contains(enhanceBtn)) {
                    tryInject();
                }
            }, delay);
        });
    }

    // MutationObserver for SPAs that load dynamically
    const observer = new MutationObserver(() => {
        tryInject();
        positionButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // Reposition on scroll/resize
    window.addEventListener('scroll', positionButton, { passive: true });
    window.addEventListener('resize', positionButton, { passive: true });
})();
