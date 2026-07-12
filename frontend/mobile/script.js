// ─── Configuration ─────────────────────────────────────────
const BASE_URL = "https://sruti2006-fake-news-detector-api.hf.space";
const API_URL = `${BASE_URL}/analyze`;

// ─── Sample News Data ──────────────────────────────────────
const SAMPLES = [
    { text: "ମୁଖ୍ୟମନ୍ତ୍ରୀ ନୂତନ ଯୋଜନା ଘୋଷଣା କରିଛନ୍ତି", danger: false },
    { text: "କଟକରେ ନୂଆ ପୁଲ ଉଦ୍ଘାଟନ କରାଗଲା", danger: false },
    { text: "ସ୍ୱାସ୍ଥ୍ୟ ବିଭାଗ ଡେଙ୍ଗୁ ରୋଗ ପ୍ରତିରୋଧ ପାଇଁ ସଚେତନତା ଅଭିଯାନ ଆରମ୍ଭ କରିଛି", danger: false },
    { text: "ସାବଧାନ! ବଜାରକୁ ଆସିଗଲାଣି ପ୍ଲାଷ୍ଟିକ ଚାଉଳ, ଖାଇଲେ ମଣିଷ ତୁରନ୍ତ ମରିଯାଉଛି!!!", danger: true },
    { text: "ନାସା ପକ୍ଷରୁ ସୂଚନା: ଆସନ୍ତା ଶନିବାର ରାତିରେ ସମ୍ପୂର୍ଣ୍ଣ ପୃଥିବୀ ଅନ୍ଧକାର ହୋଇଯିବ।", danger: true }
];

// ─── State ─────────────────────────────────────────────────
let historyArray = [];
try {
    historyArray = JSON.parse(localStorage.getItem("truthexa_history") || "[]");
} catch (e) {
    console.warn("localStorage not available", e);
}

// ─── Bootstrap ─────────────────────────────────────────────
function bootstrapApp() {
    renderHistory();
    document.getElementById("newsInput")?.focus();
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrapApp();
} else {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
}
document.addEventListener('truthexa-ready', bootstrapApp);

// ─── Input Handling ────────────────────────────────────────
function handleInput() {
    const input = document.getElementById("newsInput");
    const sendBtn = document.getElementById("sendBtn");
    const hero = document.getElementById("heroSection");
    const chat = document.getElementById("chatContainer");
    const chips = document.getElementById("sampleChips");

    // Auto-resize
    input.style.height = 'auto';
    const sh = input.scrollHeight;
    input.style.height = Math.min(Math.max(sh, 22), 120) + 'px';

    // Enable/disable send
    const hasText = input.value.trim().length > 0;
    sendBtn.disabled = !hasText;

    // Hide hero + chips if there's input or messages
    const hasMessages = chat && chat.children.length > 0;
    if (hero) {
        if (hasText || hasMessages) {
            hero.style.display = 'none';
        } else {
            hero.style.display = 'flex';
        }
    }
    if (chips) {
        chips.style.display = (hasText || hasMessages) ? 'none' : 'block';
    }
}

// ─── Sample News Chips ─────────────────────────────────────
function useSample(index) {
    const sample = SAMPLES[index];
    if (!sample) return;
    const input = document.getElementById("newsInput");
    input.value = sample.text;
    handleInput();
    // Auto-submit after a brief delay so the user sees the text fill in
    setTimeout(() => analyzeNews(), 300);
}



// ─── Fetch with Retry ──────────────────────────────────────
async function fetchWithRetry(url, options, { maxRetries = 3, onColdStart } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
            const delay = Math.min(1500 * Math.pow(2, attempt - 1), 8000);
            await new Promise(r => setTimeout(r, delay));
            if (onColdStart) onColdStart(attempt);
        }
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            if (response.status >= 500 && attempt < maxRetries) {
                lastErr = new Error(`HTTP ${response.status}`);
                continue;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (err) {
            if (attempt < maxRetries && (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
                lastErr = err;
                continue;
            }
            throw err;
        }
    }
    throw lastErr;
}

// ─── Analyze / Send ────────────────────────────────────────
async function analyzeNews() {
    const input = document.getElementById("newsInput");
    const text = input.value.trim();
    if (!text) {
        showToast("Please enter some Odia news content to verify.", "warning");
        return;
    }

    const chat = document.getElementById("chatContainer");
    const hero = document.getElementById("heroSection");
    const chips = document.getElementById("sampleChips");

    // Hide hero and chips
    if (hero) hero.style.display = 'none';
    if (chips) chips.style.display = 'none';

    // Create user message
    const userEl = document.createElement('div');
    userEl.className = 'msg-user';
    userEl.textContent = text;
    chat.appendChild(userEl);

    // Clear input
    input.value = '';
    handleInput();

    // Build loading indicator
    const loadEl = document.createElement('div');
    loadEl.className = 'msg-loading';
    loadEl.innerHTML = '<div class="mini-spinner"></div><span class="loader-msg">Analysing...</span>';
    chat.appendChild(loadEl);
    scrollChat();

    // Local clickbait check
    const clickbaitPatterns = [
        "ବଡ ଖୁଲାସା", "ବଡ଼ ଖୁଲାସା", "ଭୟଙ୍କର", "ଚମତ୍କାର", "ଆଶ୍ଚର୍ୟଜନକ",
        "ଆଶ୍ଚର୍ଯ୍ୟଜନକ", "100% ସତ୍ୟ", "ତୁରନ୍ତ ଶେୟର", "ଲିଙ୍କ କ୍ଲିକ୍"
    ];
    const foundPatterns = clickbaitPatterns.filter(p => text.includes(p));

    try {
        const response = await fetchWithRetry(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        }, {
            onColdStart: (attempt) => {
                const loaderMsg = loadEl.querySelector('.loader-msg');
                if (loaderMsg) {
                    loaderMsg.textContent = `Please wait...`;
                }
            }
        });

        const result = await response.json();
        const prediction = result.prediction || "unknown";
        const confidence = result.confidence || 0;
        const pct = Math.round(confidence * 100);
        const isReal = prediction.toLowerCase() === "real";
        const verdictClass = isReal ? "real" : "fake";

        // Clamp pointer position to prevent overflow at extreme values
        const pointerLeft = Math.max(3, Math.min(97, pct));

        // Verdict icon
        const verdictIcon = isReal
            ? '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

        const warningHtml = foundPatterns.length > 0 ? `
            <div class="msg-result-warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div>
                    <strong>Sensational Clickbait Detected</strong>
                    <span>Contains flag phrase(s): "${foundPatterns.join('", "')}"</span>
                </div>
            </div>` : '';

        const resultHtml = `
            <div class="msg-result-inner ${verdictClass}">
                <div class="verdict-section">
                    <div class="verdict-badge ${verdictClass}">
                        ${verdictIcon}
                        <span>${prediction.toUpperCase()}</span>
                    </div>
                    <div class="pct-column">
                        <span class="verdict-pct" id="vpct-${Date.now()}">${pct}%</span>
                        <span class="confidence-label">Confidence</span>
                    </div>
                </div>
                <div class="confidence-section">
                    <div class="bar-track">
                        <div class="bar-pointer" style="left:${pointerLeft}%">
                            <div class="bar-dot"></div>
                        </div>
                    </div>
                </div>
                ${warningHtml}
            </div>`;

        const resultEl = document.createElement('div');
        resultEl.className = 'msg-result';
        resultEl.innerHTML = resultHtml;
        chat.replaceChild(resultEl, loadEl);

        // Match "Confidence" label width to the percentage text width
        const pctSpan = resultEl.querySelector('.verdict-pct');
        const confLabel = resultEl.querySelector('.confidence-label');
        if (pctSpan && confLabel) {
            const pctWidth = pctSpan.getBoundingClientRect().width;
            const defaultFs = parseFloat(getComputedStyle(confLabel).fontSize);
            const naturalWidth = confLabel.getBoundingClientRect().width;
            if (naturalWidth > 0 && pctWidth > 0) {
                const scale = pctWidth / naturalWidth;
                confLabel.style.fontSize = (defaultFs * scale) + 'px';
            }
        }

        saveToHistory(text, prediction, pct);

    } catch (err) {
        console.error(err);
        const errEl = document.createElement('div');
        errEl.className = 'msg-error';
        errEl.setAttribute('data-retry-text', text);
        errEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Failed. Tap to retry.</span>
            <span class="retry-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                Tap to retry
            </span>`;
        errEl.addEventListener('click', function retryClick() {
            const retryText = this.getAttribute('data-retry-text');
            if (retryText) {
                const input = document.getElementById('newsInput');
                input.value = retryText;
                this.remove();
                analyzeNews();
            }
        });
        chat.replaceChild(errEl, loadEl);
        showToast("Something went wrong. Try again.", "error");
    }

    scrollChat();
}

function scrollChat() {
    const chat = document.getElementById("chatContainer");
    requestAnimationFrame(() => {
        chat.scrollTop = chat.scrollHeight;
    });
}

// ─── History ────────────────────────────────────────────────
function saveToHistory(text, verdict, confidence) {
    const item = {
        text,
        verdict,
        confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    historyArray.unshift(item);
    if (historyArray.length > 5) historyArray.pop();
    try {
        localStorage.setItem("truthexa_history", JSON.stringify(historyArray));
    } catch (e) {
        console.warn("localStorage not available", e);
    }
    renderHistory();
}

function toggleHistory() {
    const sheet = document.getElementById("historySheet");
    const overlay = document.getElementById("historyOverlay");
    if (!sheet || !overlay) return;
    const isOpen = sheet.classList.toggle('open');
    overlay.classList.toggle('open', isOpen);
}

function closeHistory() {
    const sheet = document.getElementById("historySheet");
    const overlay = document.getElementById("historyOverlay");
    if (sheet) sheet.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

function renderHistory() {
    const list = document.getElementById("historyList");
    const clearBtn = document.getElementById("clearHistoryBtn");
    if (!list) return;

    if (historyArray.length === 0) {
        list.innerHTML = `
            <div class="empty-history-state">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>No verifications yet.<br>Your recent checks will appear here.</span>
            </div>`;
        if (clearBtn) clearBtn.style.display = 'none';
        return;
    }

    if (clearBtn) clearBtn.style.display = 'block';
    list.innerHTML = '';

    historyArray.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.onclick = () => {
            document.getElementById("newsInput").value = item.text;
            handleInput();
            closeHistory();
        };
        div.innerHTML = `
            <div class="history-text">${item.text}</div>
            <div class="history-meta">
                <span>${item.timestamp}</span>
                <span class="history-badge ${item.verdict.toLowerCase()}">${item.verdict} (${item.confidence}%)</span>
            </div>`;
        list.appendChild(div);
    });
}

function clearHistory() {
    historyArray = [];
    try {
        localStorage.removeItem("truthexa_history");
    } catch (e) {
        console.warn("localStorage not available", e);
    }
    renderHistory();
    showToast("History cleared.", "success");
}

// ─── Toast ──────────────────────────────────────────────────
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<polyline points="20 6 9 17 4 12"></polyline>',
        error: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
        warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
        info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'
    };

    toast.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">${icons[type] || icons.info}</svg>
        <span>${message}</span>`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
