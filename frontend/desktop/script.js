const BASE_URL = "https://sruti2006-fake-news-detector-api.hf.space";
const API_URL = `${BASE_URL}/analyze`;

const SAMPLES = [
    "ମୁଖ୍ୟମନ୍ତ୍ରୀ ନୂତନ ଯୋଜନା ଘୋଷଣା କରିଛନ୍ତି",
    "କଟକରେ ନୂଆ ପୁଲ ଉଦ୍ଘାଟନ କରାଗଲା",
    "ସ୍ୱାସ୍ଥ୍ୟ ବିଭାଗ ଡେଙ୍ଗୁ ରୋଗ ପ୍ରତିରୋଧ ପାଇଁ ସଚେତନତା ଅଭିଯାନ ଆରମ୍ଭ କରିଛି",
    "ସାବଧାନ! ବଜାରକୁ ଆସିଗଲାଣି ପ୍ଲାଷ୍ଟିକ ଚାଉଳ, ଖାଇଲେ ମଣିଷ ତୁରନ୍ତ ମରିଯାଉଛି!!!",
    "ନାସା ପକ୍ଷରୁ ସୂଚନା: ଆସନ୍ତା ଶନିବାର ରାତିରେ ସମ୍ପୂର୍ଣ୍ଣ ପୃଥିବୀ ଅନ୍ଧକାର ହୋଇଯିବ।"
];

let historyArray = [];
try {
    historyArray = JSON.parse(localStorage.getItem("truthexa_history") || "[]");
} catch (e) {
    console.warn("localStorage not available", e);
}

// ─── Bootstrap ─────────────────────────────────────────────
function bootstrapApp() {
    renderHistory();
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrapApp();
} else {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
}
document.addEventListener('truthexa-ready', bootstrapApp);

// ─── Input Handling ────────────────────────────────────────
function handleInput() {
    const text = document.getElementById("newsInput").value;
    const wordCounter = document.getElementById("wordCounter");
    const clearBtn = document.getElementById("clearBtn");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const placeholder = document.getElementById("resultPlaceholder");
    const display = document.getElementById("resultDisplay");
    const placeholderText = document.getElementById("placeholderText");

    // Toggle clear button
    if (clearBtn) {
        clearBtn.style.display = text.length > 0 ? 'inline-block' : 'none';
    }

    // Enable/disable analyze button
    analyzeBtn.disabled = text.trim().length === 0;

    // Update placeholder text
    if (placeholderText) {
        placeholderText.innerText = text.trim().length > 0
            ? "Click 'Analyse Article' to start."
            : "Paste news content to begin analysis.";
    }

    // Clear results if text changes
    if (placeholder && display) {
        display.style.display = "none";
        display.classList.remove("active");
        placeholder.style.display = "flex";
        const resultError = document.getElementById("resultError");
        if (resultError) resultError.style.display = "none";
    }

    // Count words
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (wordCounter) {
        wordCounter.innerText = words;
        wordCounter.style.display = words > 0 ? 'flex' : 'none';
    }
}

function clearInput() {
    document.getElementById("newsInput").value = "";
    handleInput();
}

function loadSample() {
    const newsInput = document.getElementById("newsInput");
    newsInput.value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    handleInput();
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

// ─── Analyze ───────────────────────────────────────────────
async function analyzeNews() {
    const text = document.getElementById("newsInput").value.trim();
    const placeholder = document.getElementById("resultPlaceholder");
    const display = document.getElementById("resultDisplay");
    const loader = document.getElementById("loaderContainer");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const btnText = document.getElementById("analyzeBtnText");
    const loadingIcon = document.getElementById("btnLoadingIcon");
    const loaderMsg = document.getElementById("loaderMessage");

    if (!text) {
        showToast("Please enter some Odia news content to verify.", "warning");
        return;
    }

    // Enter loading state
    analyzeBtn.disabled = true;
    btnText.innerText = "Analysing...";
    loadingIcon.style.display = "block";

    placeholder.style.display = "none";
    display.style.display = "none";
    display.classList.remove("active");
    document.getElementById("resultError").style.display = "none";
    loader.style.display = "flex";
    if (loaderMsg) loaderMsg.innerText = "Analysing...";

    // Local clickbait check
    const clickbaitPatterns = [
        "ବଡ ଖୁଲାସା", "ବଡ଼ ଖୁଲାସା", "ଭୟଙ୍କର", "ଚମତ୍କାର", "ଆଶ୍ଚର୍ୟଜନକ",
        "ଆଶ୍ଚର୍ଯ୍ୟଜନକ", "100% ସତ୍ୟ", "ତୁରନ୍ତ ଶେୟର", "ଲିଙ୍କ କ୍ଲିକ୍"
    ];
    const foundPatterns = clickbaitPatterns.filter(pattern => text.includes(pattern));

    try {
        const response = await fetchWithRetry(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        }, {
            onColdStart: (attempt) => {
                if (loaderMsg) {
                    loaderMsg.innerText = `Please wait...`;
                }
            }
        });

        const result = await response.json();
        const prediction = result.prediction || "unknown";
        const confidence = result.confidence || 0;
        const isReal = prediction.toLowerCase() === "real";

        // Show verdict badge
        const badge = document.getElementById("verdictBadge");
        badge.innerText = prediction.toUpperCase();
        badge.className = `verdict-badge ${isReal ? "verdict-real" : "verdict-fake"}`;

        // Update confidence display
        const pct = Math.round(confidence * 100);
        const pointer = document.getElementById("confidencePointer");
        if (pointer) pointer.style.left = `${pct}%`;

        // Fill circle gauge
        const gaugeFill = document.getElementById("gaugeFill");
        gaugeFill.style.stroke = isReal ? "var(--real-color)" : "var(--fake-color)";
        gaugeFill.style.strokeDashoffset = "0";

        // Update confidence display
        const confVal = document.getElementById("confidenceValue");
        if (confVal) confVal.innerText = `${pct}%`;

        // Clickbait warning
        const warningBox = document.getElementById("warningBox");
        const warningMsg = document.getElementById("warningMsg");
        if (foundPatterns.length > 0) {
            warningBox.classList.add("active");
            if (warningMsg) {
                warningMsg.innerText = `Contains flag phrase(s): "${foundPatterns.join('", "')}". Clickbait patterns often point to fabricated news.`;
            }
        } else {
            warningBox.classList.remove("active");
        }

        // Save & show results
        saveToHistory(text, prediction, pct);
        loader.style.display = "none";
        display.style.display = "flex";
        setTimeout(() => display.classList.add("active"), 50);

    } catch (err) {
        console.error(err);
        loader.style.display = "none";
        document.getElementById("resultError").style.display = "flex";
        document.getElementById("errorDetails").innerText = "Something went wrong. Please try again.";
        showToast("Something went wrong. Try again.", "error");
    } finally {
        analyzeBtn.disabled = document.getElementById("newsInput").value.trim().length === 0;
        btnText.innerText = "Analyse Article →";
        loadingIcon.style.display = "none";
    }
}

// ─── History ────────────────────────────────────────────────
function saveToHistory(text, verdict, confidence) {
    const newItem = {
        text,
        verdict,
        confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    historyArray.unshift(newItem);
    if (historyArray.length > 5) historyArray.pop();
    try {
        localStorage.setItem("truthexa_history", JSON.stringify(historyArray));
    } catch (e) {
        console.warn("localStorage not available", e);
    }
    renderHistory();
}

function toggleHistoryDrawer() {
    const drawer = document.getElementById("historyDrawer");
    const overlay = document.getElementById("historyOverlay");
    if (drawer && overlay) {
        drawer.classList.toggle("open");
        overlay.classList.toggle("open");
    }
}

function renderHistory() {
    const list = document.getElementById("historyList");
    const clearBtn = document.getElementById("clearHistoryBtn");
    if (!list) return;

    if (historyArray.length === 0) {
        list.innerHTML = `
            <div class="empty-history-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span style="font-size:0.9rem;">No verifications yet.<br>Your recent checks will appear here.</span>
            </div>`;
        if (clearBtn) clearBtn.style.display = "none";
        return;
    }

    if (clearBtn) clearBtn.style.display = "block";
    list.innerHTML = "";

    historyArray.forEach((item) => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.onclick = () => {
            document.getElementById("newsInput").value = item.text;
            handleInput();
            toggleHistoryDrawer();
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
    showToast("Scan history cleared successfully.", "success");
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">${icons[type] || icons.info}</svg>
        <span style="font-weight:600;">${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
