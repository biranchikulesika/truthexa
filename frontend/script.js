        // Switch between tabs on mobile screens
                function switchMobileTab(tabName) {
            const grid = document.getElementById("workspaceGrid");
            if (!grid) return;
            if (tabName === 'result') {
                grid.classList.add('show-result-mobile');
            } else {
                grid.classList.remove('show-result-mobile');
            }
        }

        const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('run.app')
            ? window.location.origin
            : "https://sruti2006-fake-news-detector-api.hf.space";
        const API_URL = `${BASE_URL}/analyze`;
                let historyArray = [];
try {
    historyArray = JSON.parse(localStorage.getItem("truthexa_history") || "[]");
} catch(e) {
    console.warn("localStorage not available", e);
}
        const loadSamples = [
            "ମୁଖ୍ୟମନ୍ତ୍ରୀ ନୂତନ ଯୋଜନା ଘୋଷଣା କରିଛନ୍ତି",
            "କଟକରେ ନୂଆ ପୁଲ ଉଦ୍ଘାଟନ କରାଗଲା",
            "ସ୍ୱାସ୍ଥ୍ୟ ବିଭାଗ ଡେଙ୍ଗୁ ରୋଗ ପ୍ରତିରୋଧ ପାଇଁ ସଚେତନତା ଅଭିଯାନ ଆରମ୍ଭ କରିଛି",
            "ସାବଧାନ! ବଜାରକୁ ଆସିଗଲାଣି ପ୍ଲାଷ୍ଟିକ ଚାଉଳ, ଖାଇଲେ ମଣିଷ ତୁରନ୍ତ ମରିଯାଉଛି!!!",
            "ନାସା ପକ୍ଷରୁ ସୂଚନା: ଆସନ୍ତା ଶନିବାର ରାତିରେ ସମ୍ପୂର୍ଣ୍ଣ ପୃଥିବୀ ଅନ୍ଧକାର ହୋଇଯିବ।"
        ];
let sampleIndex = 0; // index for cycling samples

        // On document start: Check server status and render history log
        window.addEventListener("DOMContentLoaded", () => {
            checkServerStatus();
            renderHistory();
        });

        // Periodic Health Check for API Status (every 10 seconds)
        async function checkServerStatus() {
            const dot = document.getElementById("apiStatusDot");
            const text = document.getElementById("apiStatusText");
            if (!dot || !text) return;
            try {
                                // Health check: request the /health endpoint to know if the model is ready
            const healthUrl = `${BASE_URL}/health`;
            console.log('Health check URL:', healthUrl);
            const response = await fetch(healthUrl, { method: 'GET' });
            console.log('Health check response', response.status, response.headers.get('content-type'));
            const contentType = response.headers.get('content-type') || '';
            // Treat 200‑OK or 206‑Partial with JSON as valid, otherwise assume the container is still warming up
            if (response.ok && (response.status === 200 || response.status === 206) && contentType.includes('application/json')) {
                const payload = await response.json();
                // If model is loaded, consider it online
                if (payload.model_type && (payload.mbert_loaded || payload.tfidf_loaded)) {
                    dot.className = 'status-dot online';
                    text.innerText = `Online (Model)`;
                } else {
                    dot.className = 'status-dot';
                    text.innerText = 'Waking up… (please wait)';
                }
            } else if (response.status === 404 || response.status === 206) {
                // 404 or 206 likely means the HF space is still initializing
                dot.className = 'status-dot';
                text.innerText = 'Waking up… (please wait)';
            } else {
                dot.className = 'status-dot';
                text.innerText = 'Local Server Offline';
            }
            } catch (e) {
                dot.className = "status-dot";
                text.innerText = "Local Server Offline";
            }
        }
        setInterval(checkServerStatus, 10000);

        function handleInput() {

            // Auto-resize textarea on mobile
            const newsInput = document.getElementById("newsInput");
            if (window.innerWidth <= 768) {
                newsInput.style.setProperty('height', '1px', 'important');
                let sh = newsInput.scrollHeight;
                const newHeight = Math.min(Math.max(sh, 56), 350);
                newsInput.style.setProperty('height', newHeight + 'px', 'important');
                // Do not forcefully set scrollTop to 0, let the browser handle it if it maxes out
            } else {
                newsInput.style.removeProperty('height');
            }

            const text = document.getElementById("newsInput").value;
            const wordCounter = document.getElementById("wordCounter");
            const floatingBtn = document.getElementById("floatingActionBtn");
            const analyzeBtn = document.querySelector(".analyzeBtnClass");
            const placeholder = document.getElementById("resultPlaceholder");
            const display = document.getElementById("resultDisplay");
            const placeholderTitle = document.getElementById("placeholderTitle");
            const placeholderText = document.getElementById("placeholderText");
            
            
            // Hide hero section if text is present or chat history exists
            const chatContainer = document.getElementById('mobileChatContainer');
            const hasChatHistory = chatContainer && chatContainer.children.length > 0;
            const hasResult = display && display.style.display !== 'none' && display.style.display !== '';
            const isAnalyzing = document.querySelector(".btnIconLoadingClass") && document.querySelector(".btnIconLoadingClass").style.display === "block";
            const hasError = document.getElementById("resultError") && document.getElementById("resultError").style.display !== 'none' && document.getElementById("resultError").style.display !== '';
            
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                if (window.innerWidth <= 768) {
                    if (text.trim().length > 0 || hasChatHistory || hasResult || isAnalyzing || hasError) {
                        heroSection.style.setProperty('display', 'none', 'important');
                    } else {
                        heroSection.style.setProperty('display', 'flex', 'important');
                    }
                } else {
                    heroSection.style.removeProperty('display');
                }
            }
document.querySelectorAll(".analyzeBtnClass").forEach(btn => {
                btn.disabled = text.trim().length === 0;
            });
            // Update placeholder text based on content
            if (placeholderText) {
                if (text.trim().length > 0) {
                    if (placeholderTitle) placeholderTitle.style.display = 'none';
                    placeholderText.innerText = "Click on analyze article to start.";
                } else {
                    if (placeholderTitle) placeholderTitle.style.display = 'none';
                    placeholderText.innerText = "Paste the news on the news content.";
                }
            }

            // Clear analysis result if text is changed
            if (placeholder && display) {
                display.style.display = "none";
                display.classList.remove("active");
                placeholder.style.display = "flex";
                const resultError = document.getElementById("resultError");
                if (resultError) resultError.style.display = "none";
                switchMobileTab("input");
}
            
            // Update button
            if (floatingBtn) {
                if (text.length > 0) {
                    floatingBtn.innerHTML = "✕ Clear";
                } else {
                    floatingBtn.innerHTML = "📋 Paste";
                }
            }
            
            // Count words
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            if (wordCounter) {
                wordCounter.innerText = `${words} word${words !== 1 ? 's' : ''}`;
            }
        }

        async function handleFloatingAction() {
            const newsInput = document.getElementById("newsInput");
            if (newsInput.value.length > 0) {
                // Clear action
                newsInput.value = "";
                handleInput();
                switchMobileTab('input');
            } else {
                // Paste action
                try {
                    if (!navigator.clipboard || !navigator.clipboard.readText) {
                        showToast("Clipboard access not supported. Please paste manually (Ctrl+V / Cmd+V).", "warning");
                        return;
                    }
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        newsInput.value = text;
                        handleInput();
                    } else {
                        showToast("Clipboard is empty.", "warning");
                    }
                } catch (err) {
                    console.error('Failed to read clipboard contents: ', err);
                    showToast("Please paste manually (Ctrl+V / Cmd+V) - Clipboard access blocked.", "warning");
                }
            }
        }

        async function analyzeNews() {
            const text = document.getElementById("newsInput").value.trim();
            const placeholder = document.getElementById("resultPlaceholder");
            const display = document.getElementById("resultDisplay");
            const loader = document.getElementById("loaderContainer");
            const analyzeBtn = document.querySelector(".analyzeBtnClass");

            if (!text) {
                showToast("Please enter some Odia news content to verify.", "warning");
                return;
            }

            // Switch to result tab on mobile so the user sees loading feedback immediately
            
            const isMobile = window.innerWidth <= 768;
            let currentChatLoader = null;
            let currentChatResult = null;
            
            if (isMobile) {
                // Hide hero section
                document.querySelector('.hero-section').style.display = 'none';
                
                const chatContainer = document.getElementById('mobileChatContainer');
                chatContainer.style.display = 'flex';
                
                // Add user message bubble
                const userBubble = document.createElement('div');
                userBubble.style.cssText = 'align-self: flex-end; background: rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 12px 16px; max-width: 90%; word-break: break-word; color: white; font-size: 0.95rem; line-height: 1.5; margin-bottom: 8px; box-sizing: border-box;';
                userBubble.innerText = text;
                chatContainer.appendChild(userBubble);
                
                // Add loading bubble
                currentChatLoader = document.createElement('div');
                currentChatLoader.style.cssText = 'align-self: flex-start; background: transparent; padding: 0 0 16px 0; display: flex; align-items: center; gap: 12px; margin-top: 8px; box-sizing: border-box;';
                currentChatLoader.innerHTML = `<div class="glow-spinner" style="width: 24px; height: 24px; border-width: 2px;"></div><span style="color: var(--text-secondary); font-size: 0.9rem;">Analysing...</span>`;
                chatContainer.appendChild(currentChatLoader);
                
                // Scroll to bottom
                chatContainer.scrollTop = chatContainer.scrollHeight;
                
                // Clear input
                document.getElementById('newsInput').value = '';
                handleInput();
            } else {
                switchMobileTab('result');
            }


            // Enter Loading State
            analyzeBtn.disabled = true;
            document.querySelector(".analyzeBtnTextClass").innerText = "Analysing...";
            document.querySelector(".btnIconLoadingClass").style.display = "block";
            
            placeholder.style.display = "none";
            display.style.display = "none";
            display.classList.remove("active");
            document.getElementById("resultError").style.display = "none";
            loader.style.display = "flex";

            // Local Clickbait Heuristic Check
            const clickbaitPatterns = [
                "ବଡ ଖୁଲାସା", "ବଡ଼ ଖୁଲାସା", "ଭୟଙ୍କର", "ଚମତ୍କାର", "ଆଶ୍ଚର୍ୟଜନକ", 
                "ଆଶ୍ଚର୍ଯ୍ୟଜନକ", "100% ସତ୍ୟ", "ତୁରନ୍ତ ଶେୟର", "ଲିଙ୍କ କ୍ଲିକ୍"
            ];
            const foundPatterns = clickbaitPatterns.filter(pattern => text.includes(pattern));

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // FastAPI expects a JSON object with a 'text' field
                    body: JSON.stringify({ text })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();
                // FastAPI returns fields directly
                const prediction = result.prediction || "unknown";
                const confidence = result.confidence || 0;
                const model_used = result.model_used || "model";

                if (isMobile && currentChatLoader) {
                    const color = prediction.toLowerCase() === "real" ? "var(--real-color)" : "var(--fake-color)";
                    const verdictClass = prediction.toLowerCase() === "real" ? "verdict-real" : "verdict-fake";
                    const pct = Math.round(confidence * 100);
                    
                    const warningHtml = foundPatterns.length > 0 ? `
                    <div class="warning-box active" style="margin-top: 16px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <div>
                            <strong style="display: block; margin-bottom: 2px;">Sensational Clickbait Detected</strong>
                            <span>Your text contains known clickbait templates commonly found in fabricated Odia news reporting.</span>
                        </div>
                    </div>` : '';
                    
                    const bubbleHtml = `
                    <div class="card result-card active" style="display: flex; flex-direction: column; width: 100%; padding: 24px;">
                        <div class="result-display active" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 10px 0;">
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 32px; width: 100%; max-width: 320px; margin: 0 auto;">
                                    <div class="circular-gauge" style="width: 180px; height: 180px;">
                                        <svg viewBox="0 0 80 80">
                                            <circle class="bg-circle" cx="40" cy="40" r="36"></circle>
                                            <circle class="fill-circle" cx="40" cy="40" r="36" style="stroke-dashoffset: 0; stroke: ${color}"></circle>
                                        </svg>
                                        <div class="percentage-label" style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px;">
                                            <div class="verdict-badge ${verdictClass}" style="font-size: 2.2rem; font-weight: 900; letter-spacing: 6px; padding: 0; margin-right: -6px; line-height: 1.1;">${prediction.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    
                                    <div style="width: 100%; position: relative; padding-bottom: 36px; margin-top: 10px;">
                                        <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 8px; position: relative; height: 20px;">
                                            <span>Low</span>
                                            <div style="position: absolute; top: 0px; left: ${pct}%; transform: translateX(-50%); transition: left 1.2s cubic-bezier(0.16, 1, 0.3, 1);">
                                                <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-primary);">${pct}%</span>
                                            </div>
                                            <span>High</span>
                                        </div>
                                        <div style="width: 100%; height: 8px; border-radius: 4px; background: linear-gradient(to right, #ef4444, #f97316, #eab308, #10b981); position: relative;">
                                            <div style="position: absolute; top: 10px; left: ${pct}%; transform: translateX(-50%); transition: left 1.2s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; align-items: center; gap: 2px;">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color: var(--text-primary);">
                                                    <polygon points="12,2 24,22 0,22"></polygon>
                                                </svg>
                                                <span style="font-size: 0.55rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Confidence</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="font-size: 0.74rem; color: var(--text-muted); text-align: center; margin-top: 4px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; gap: 0px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.7;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span>Verified using NLP classifiers (<span style="font-weight: 600; color: var(--text-secondary);">${model_used}</span>)</span>
                            </div>
                            ${warningHtml}
                        </div>
                    </div>`;
                    
                    const resultBubble = document.createElement('div');
                    resultBubble.style.cssText = 'align-self: flex-start; width: 100%; margin-top: 8px; box-sizing: border-box;';
                    resultBubble.innerHTML = bubbleHtml;
                    
                    const chatContainer = document.getElementById('mobileChatContainer');
                    chatContainer.replaceChild(resultBubble, currentChatLoader);
                    currentChatLoader = null;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
                // Show Verdict Badge & Classify
                const badge = document.getElementById("verdictBadge");
                badge.innerText = prediction.toUpperCase();
                
                if (prediction.toLowerCase() === "real") {
                    badge.className = "verdict-badge verdict-real";
                } else {
                    badge.className = "verdict-badge verdict-fake";
                }

                // Update Confidence Gauge
                const pct = Math.round(confidence * 100);
                document.getElementById("confidencePercent").innerText = `${pct}%`;
                
                // Animate confidence pointer
                document.getElementById("confidencePointer").style.left = `${pct}%`;
                document.getElementById("confidencePercentContainer").style.left = `${pct}%`;
                
                // Set color theme for gauge stroke
                if (prediction.toLowerCase() === "real") {
                    document.getElementById("gaugeFill").style.stroke = "var(--real-color)";
                } else {
                    document.getElementById("gaugeFill").style.stroke = "var(--fake-color)";
                }



                // Metadata mappings
                document.getElementById("metaModelUsed").innerText = model_used;
                document.getElementById("metaTextLen").innerText = text.length;

                // Configure Clickbait Warning panel
                const warningBox = document.getElementById("warningBox");
                if (foundPatterns.length > 0) {
                    warningBox.classList.add("active");
                    document.getElementById("warningMsg").innerText = `Contains flag phrase(s): "${foundPatterns.join('", "')}". Clickbait patterns often point to fabricated news.`;
                } else {
                    warningBox.classList.remove("active");
                }

                // Save to Scan History
                saveToHistory(text, prediction, pct);

                // Exit loading, show results
                loader.style.display = "none";
                display.style.display = "flex";
                setTimeout(() => display.classList.add("active"), 50);

            } catch (err) {
                console.error(err);
                loader.style.display = "none";
                document.getElementById("resultError").style.display = "flex";
                document.getElementById("errorDetails").innerText = `Model connection failed: ${err.message || 'Please check your internet connection and try again.'}`;
                showToast("Verification model server is offline.", "error");
                if (isMobile && currentChatLoader) {
                    const errBubble = document.createElement('div');
                    errBubble.style.cssText = 'align-self: flex-start; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 12px 16px; max-width: 100%; width: 100%; color: #fca5a5; font-size: 0.85rem; margin-top: 8px; box-sizing: border-box;';
                    errBubble.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>Error: Failed to connect to verification server.</span></div>`;
                    
                    const chatContainer = document.getElementById('mobileChatContainer');
                    chatContainer.replaceChild(errBubble, currentChatLoader);
                    currentChatLoader = null;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            } finally {
                analyzeBtn.disabled = document.getElementById("newsInput").value.trim().length === 0;
                document.querySelector(".analyzeBtnTextClass").innerText = "Analyse Article →";
                document.querySelector(".btnIconLoadingClass").style.display = "none";
            }
        }

        // History Manager Functions
        function saveToHistory(text, verdict, confidence) {
            const newItem = {
                text: text,
                verdict: verdict,
                confidence: confidence,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            // Limit to top 5 history records
            historyArray.unshift(newItem);
            if (historyArray.length > 5) historyArray.pop();
            
            try {
                localStorage.setItem("truthexa_history", JSON.stringify(historyArray));
            } catch(e) {
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
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span style="font-size: 0.9rem;">No verifications yet.<br>Your recent checks will appear here.</span>
                    </div>
                `;
                if (clearBtn) clearBtn.style.display = "none";
                return;
            }

            if (clearBtn) clearBtn.style.display = "block";
            list.innerHTML = "";

            historyArray.forEach((item, index) => {
                const div = document.createElement("div");
                div.className = "history-item";
                div.onclick = () => {
                    document.getElementById("newsInput").value = item.text;
                    if (typeof handleInput === 'function') handleInput();
                    if (typeof updateCharCounter === 'function') updateCharCounter();
                    switchMobileTab('input');
                    toggleHistoryDrawer(); // Close drawer after selection
                };
                
                div.innerHTML = `
                    <div class="history-text">${item.text}</div>
                    <div class="history-meta">
                        <span>${item.timestamp}</span>
                        <span class="history-badge ${item.verdict.toLowerCase()}">${item.verdict} (${item.confidence}%)</span>
                    </div>
                `;
                list.appendChild(div);
            });
        }

        function clearHistory() {
            historyArray = [];
            try {
                localStorage.removeItem("truthexa_history");
            } catch(e) {
                console.warn("localStorage not available", e);
            }
            renderHistory();
            showToast("Scan history cleared successfully.", "success");
        }

        // Beautiful Toast Alerts
        function showToast(message, type = "info") {
            const container = document.getElementById("toastContainer");
            if (!container) return;
            
            const toast = document.createElement("div");
            toast.className = `toast toast-${type}`;
            
            let icon = '';
            if (type === 'success') {
                icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (type === 'error') {
                icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            } else if (type === 'warning') {
                icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            } else {
                icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            }
            
            toast.innerHTML = `
                ${icon}
                <span style="font-weight: 600; font-family: sans-serif;">${message}</span>
            `;
            
            container.appendChild(toast);
            
            // Trigger transition
            setTimeout(() => {
                toast.classList.add("show");
            }, 10);
            
            // Dismiss after 4 seconds
            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 4000);
        }
