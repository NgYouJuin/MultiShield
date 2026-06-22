/**
 * alert.js (Programmatic Content Script)
 * This script runs directly within the webpage's DOM context.
 * It automatically scans the page text, evaluates heuristic risk scoring,
 * caches results in storage, alerts background.js, and renders the warning banner.
 * The console logs is on the page itself, not the extension.
 */
(() => {
    const containerId = 'multishield-security-extension-root';
    const domain = window.location.hostname;
    const path = window.location.pathname;
    const sanitizedPathKey = (domain + path).replace(/[^a-zA-Z0-9]/g, '_');
    const cacheKey = `threat_${sanitizedPathKey}`;

    console.log(`[MultiShield Scanner] alert.js automatically initiated on: "${domain}"`);
    // debugger;

    // Verify the Chrome runtime APIs are mounted before querying
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
        console.error("[MultiShield Scanner] CRITICAL ERROR: Chrome extension Storage APIs are unavailable in this window context!");
        return;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCANNING ENGINE DATABASE & ALGORITHMS (Moved from Popup view to Content Script)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /**
     * Calculates the Levenshtein Distance between two strings
     * and returns a similarity ratio from 0.0 to 1.0.
     */
    const calculateStringSimilarity = (str1, str2) => {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        
        if (s1 === s2) return 1.0;
        if (s1.length === 0 || s2.length === 0) return 0.0;
        
        const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
        
        for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
        for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
        
        for (let j = 1; j <= s2.length; j += 1) {
            for (let i = 1; i <= s1.length; i += 1) {
                const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        
        const distance = track[s2.length][s1.length];
        const maxLength = Math.max(s1.length, s2.length);
        
        // Convert edit distance to a normalized 0.0 - 1.0 ratio
        return parseFloat((1.0 - distance / maxLength).toFixed(3));
    };

    const calculateKeywordSeverity = (word, type = '', domTag = 'p', pageText = '', distancePenalty = 1.0) => {
        // need to dynamically adjust strictness based on settings
        let score = 0;
        
        // 1. DYNAMIC CATEGORY-BASED BASE SCORING
        const categoryBaseScores = {
            "phishing": 8.0,
            "tech support scam": 8.0,
            "government official impersonation": 5.5,
            "investment scam": 5.5,
            "loan scam": 5.5,
            "job scam": 3.0,
            "e-commerce scam": 3.0,
            "romance scam": 3.0
        };

        const normalizedType = type.toLowerCase().trim();
        score = categoryBaseScores[normalizedType] || 1.5; // Default score if scam type unrecognized

        // 2. Apply HTML Tag Multipliers dynamically calculated from DOM
        if (domTag === 'input' || domTag === 'button') score *= 1.4;
        else if (domTag === 'a' || domTag === 'form') score *= 1.25;
        else if (domTag === 'h1' || domTag === 'h2' || domTag === 'strong') score *= 1.1;
        else score *= 0.8;

        // 3. Contextual Proximity Indicators
        if (pageText) {
            const proximityIndicators = ["wallet", "connect", "secure", "confirm", "claim", "withdraw", "bank", "login", "paynow", "audit", "official"];
            let matchesCount = 0;
            proximityIndicators.forEach(indicator => {
                if (pageText.toLowerCase().includes(indicator) && !word.toLowerCase().includes(indicator)) matchesCount++;
            });
            score += (matchesCount * 0.4);
        }
        score *= distancePenalty;

        score = Math.min(10.0, Math.max(0.1, parseFloat(score.toFixed(1))));
        let severity = "LOW", color = [0.27, 0.61, 0.27], bgColor = [0.93, 0.97, 0.93], action = "Log Match";

        if (score >= 9.0) { severity = "CRITICAL"; color = [0.76, 0.12, 0.12]; bgColor = [0.98, 0.93, 0.93]; action = "Isolation"; }
        else if (score >= 6.5) { severity = "HIGH"; color = [0.92, 0.40, 0.00]; bgColor = [0.98, 0.95, 0.90]; action = "Block CTA"; }
        else if (score >= 4.0) { severity = "MEDIUM"; color = [0.94, 0.73, 0.15]; bgColor = [0.98, 0.97, 0.90]; action = "Warning"; }

        // return { word, score: score.toFixed(1), severity, color, bgColor, action };
        return { score, severity, color, bgColor, action };
    };

    const calculateOverallRiskScore = (evaluatedKeywords) => {
        if (!evaluatedKeywords || evaluatedKeywords.length === 0) return 0;
        
        const scores = evaluatedKeywords.map(k => parseFloat(k.score));
        const maxScore = Math.max(...scores);
        
        let finalScore = maxScore * 8.5;
        
        const worstIndex = scores.indexOf(maxScore);
        evaluatedKeywords.forEach((k, idx) => {
        if (idx !== worstIndex && parseFloat(k.score) >= 4.0) {
            finalScore += 1.5;
        }
        });
        
        return Math.min(100, Math.max(0, Math.round(finalScore)));
    };

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCAN EXECUTION PIPELINE
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const initScanner = async () => {
        const categoryMeasures = {
            "phishing": "Avoid entering login credentials or banking details on this page.",
            "tech support scam": "Do not download remote software or call listed phone numbers.",
            "government official impersonation": "Verify agency identity directly; officials never demand immediate money transfers.",
            "investment scam": "Do not transfer capital; verify the platform on official registries.",
            "loan scam": "Never pay upfront administrative or legal fees to release funds.",
            "job scam": "Refuse to pay for training or execute pre-paid tasks.",
            "e-commerce scam": "Use secure platform escrows; never pay sellers directly via bank.",
            "romance scam": "Do not send funds to individuals you met only online."
        };
        let rawKeywordList = [];
        console.log("[MultiShield Scanner] Fetching keywords database...");

        try {
            // Safe helper supporting both Manifest V2 (callback) and Manifest V3 (Promise)
            const getStoredKeywords = () => {
                return new Promise((resolve) => {
                    try {
                        chrome.storage.local.get(['keywords'], (result) => {
                            if (chrome.runtime.lastError) {
                                console.warn("[MultiShield Scanner] Storage error (runtime check):", chrome.runtime.lastError.message);
                                resolve(null);
                            } else {
                                resolve(result);
                            }
                        });
                    } catch (err) {
                        // Catching context-invalidated crashes
                        console.warn("[MultiShield Scanner] Safe fetch failed. Fallbacks loaded.", err);
                        resolve(null);
                    }
                });
            };

            const result = await getStoredKeywords();
            console.log("[MultiShield Scanner] Storage fetch complete. Processing results...");

            if (result && result.keywords && Array.from(result.keywords).length > 0) {
                rawKeywordList = result.keywords;
            } else if (result && result.keywords && result.keywords.keywords) {
                rawKeywordList = result.keywords.keywords;
            } else {
                console.log("[MultiShield Scanner] Storage returned empty, mounting fallback keywords list.");
                rawKeywordList = fallbackKeywords;
            }
        } catch (storageError) {
            console.warn("[MultiShield Scanner] Unable to parse DB keywords, using default rules.", storageError);
            // rawKeywordList = fallbackKeywords;
            return;
        }

        // 1. Extract and Normalize Page Text
        const rawPageText = document.body ? document.body.innerText : "";
        
        // RESTORED LOGGER: Output the page text to verify extraction works
        // console.log("[MultiShield Debug] Scanned Page Raw Text Content:\n", rawPageText);
        
        // Collapse linebreaks, tabs, and spaces to allow matching across HTML structure splits
        // const normalizedPageText = rawPageText.toLowerCase().replace(/\s+/g, ' ');
        const pageElements = Array.from(document.querySelectorAll('input, button, a, h1, h2, strong, p, span, div'));
        const calculatedKeywords = [];

        // 2. Scan and evaluate occurrences on-the-fly
        // == OLD ==
        // rawKeywordList.forEach(item => {
        //     const rawWord = item.keyword || item.word;
        //     const type = item.type_of_scam || item.type || "Threat Detected";
            
        //     if (!rawWord) return; // Skip invalid entries

        //     const normalizedKeyword = rawWord.toLowerCase().trim().replace(/\s+/g, ' ');

        //     // Perform robust whitespace-insensitive phrase matching
        //     if (normalizedPageText.includes(normalizedKeyword)) {
        //         let domTag = 'p'; 
        //         try {
        //             // Search targeting tags
        //             const elements = Array.from(document.querySelectorAll('input, button, a, h1, h2, strong'));
        //             const match = elements.find(el => {
        //                 const elementText = (el.innerText || '').toLowerCase().replace(/\s+/g, ' ');
        //                 const elementPlaceholder = (el.placeholder || '').toLowerCase().replace(/\s+/g, ' ');
        //                 return elementText.includes(normalizedKeyword) || elementPlaceholder.includes(normalizedKeyword);
        //             });
        //             if (match) domTag = match.tagName.toLowerCase(); 
        //         } catch (e) {
        //             console.warn("[MultiShield DOM Trace Error]", e);
        //         }

        //         const evaluation = calculateKeywordSeverity(rawWord, type, domTag, rawPageText);
        //         // const evaluation = calculateKeywordSeverity(rawWord, type, domTag, rawPageText, matchEvaluation.distancePenalty);
        //         calculatedKeywords.push({
        //             word: rawWord,
        //             type: type,
        //             severity: evaluation.severity,
        //             color: evaluation.color,
        //             bgColor: evaluation.bgColor,
        //             score: evaluation.score,
        //             action: evaluation.action
        //         });
        //     }
        // });

        // == NEW ==
        rawKeywordList.forEach(item => {
            const rawWord = item.keyword || item.word;
            const type = item.type_of_scam || item.type || "Threat Detected";
            
            if (!rawWord) return;

            let highestSimilarityFound = 0.0;
            let matchedElementTag = 'p';

            // Loop through DOM elements to find if any contain text with high similarity to DB keyword
            for (let el of pageElements) {
                // Read normal text or placeholder values
                const elementText = (el.innerText || '').trim();
                const placeholderText = (el.placeholder || '').trim();
                
                const targetText = elementText || placeholderText;
                if (!targetText || targetText.length < 3) continue;

                // Compare candidates of similar length profiles to DB keyword (reduces Levenshtein overhead)
                if (Math.abs(targetText.length - rawWord.length) <= 12) {
                    const similarity = calculateStringSimilarity(targetText, rawWord);
                    
                    if (similarity > highestSimilarityFound) {
                        highestSimilarityFound = similarity;
                        matchedElementTag = el.tagName.toLowerCase();
                    }

                    console.log(similarity, targetText);
                }
            }

            // If match exceeds similarity threshold (e.g., 0.75), record it as a hit
            if (highestSimilarityFound >= 0.75) {
                const evaluation = calculateKeywordSeverity(rawWord, type, matchedElementTag, rawPageText, highestSimilarityFound);
                calculatedKeywords.push({
                    word: rawWord,
                    type: type,
                    severity: evaluation.severity,
                    color: evaluation.color,
                    bgColor: evaluation.bgColor,
                    score: evaluation.score,
                    action: evaluation.action,
                    similarityScore: highestSimilarityFound
                });
            }
        });

        // 3. Sort dynamic findings descending by score (Critical threats at the top)
        calculatedKeywords.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

        // 4.1 Update Badge count or Alert UI if findings exist
        if (calculatedKeywords.length > 0) {
            console.log(`[MultiShield Alert] Detected ${calculatedKeywords.length} security threats.`, calculatedKeywords);
        } else {
            console.log("[MultiShield Scanner] Check complete. No threats identified on this page.");
        }

        // 4.2 Determining the highest contributing type(_of_scam)
        const categoryWeights = {};
        calculatedKeywords.forEach(item => {
            const cat = item.type;
            categoryWeights[cat] = (categoryWeights[cat] || 0) + item.score;
        });
        let highestCategory = "";
        let maxWeight = 0;
        for (const [cat, weight] of Object.entries(categoryWeights)) {
            if (weight > maxWeight) {
                maxWeight = weight;
                highestCategory = cat;
            }
        }
        const formattedCategory = highestCategory || "Malicious Patterns";

        // 4.3 Determine overall aggregate threat score
        const overallScore = calculateOverallRiskScore(calculatedKeywords);
        const isScam = overallScore >= 40;

        // 5. Package scan result variables
        const threatRecord = {
            domain: domain,
            risk: overallScore,
            isScam: isScam,
            timestamp: Date.now(),
            keywords: calculatedKeywords,
            rawKeywords: calculatedKeywords.map(k => k.word).join(', '),
            title: overallScore >= 80 ? "CRITICAL SECURITY ALERT" : "SUSPICIOUS ACTIVITY FLAGGED",
            description: overallScore >= 80
            ? `This website has been flagged as ${formattedCategory}. ` + (categoryMeasures[formattedCategory.toLowerCase()] || "")
            : "Several threat indicators have been discovered on this landing tree. Proceed with caution.",
            severity: overallScore >= 80 ? "danger" : "warning"
        };

        console.log(`[MultiShield Scanner] Scan completed! Calculated Score: ${overallScore}% | matches: ${calculatedKeywords.length}`);

        // 6. Cache completed scan metrics in chrome storage and notify background worker
        console.log("Visualizing cache key: "+cacheKey);
        chrome.storage.local.set({ [cacheKey]: threatRecord }, () => {
            // Message background.js directly to update icon badges without popup interaction
            chrome.runtime.sendMessage({ action: "update_badge", risk: overallScore });
        });

        // 7. Render isolated warning banner on webpage if score exceeds the threshold
        if (isScam) {
            let container = document.getElementById(containerId);
            let shadowRoot;

            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                container.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    z-index: 2147483647 !important;
                    pointer-events: none !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                `;
                shadowRoot = container.attachShadow({ mode: 'open' });
                if (document.documentElement) {
                    document.documentElement.prepend(container);
                } else if (document.body) {
                    document.body.prepend(container);
                }
            } else {
                shadowRoot = container.shadowRoot;
                shadowRoot.innerHTML = '';
            }

            const isDanger = threatRecord.severity === 'danger';
            const bgColor = isDanger ? '#fff5f5' : '#fffaf0';
            const borderColor = isDanger ? '#feb2b2' : '#fbd38d';
            const titleColor = isDanger ? '#9b2c2c' : '#c05621';
            const pulseColor = isDanger ? 'rgba(229, 62, 98, 0.4)' : 'rgba(221, 107, 32, 0.4)';
            // const badgeIcon = isDanger ? '☠️' : '⚠️';

            const css = `
            .scam-warning-banner {
                display: flex;
                align-items: flex-start;
                gap: 14px;
                padding: 16px 20px;
                background-color: ${bgColor};
                border: 2px solid ${borderColor};
                border-bottom: 3px solid ${borderColor};
                border-radius: 12px;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15);
                width: 90%;
                max-width: 350px;
                margin: 20px 0 0 auto;
                pointer-events: auto;
                opacity: 0;
                transform: translateY(-20px);
                transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
                color: #2d3748;
                box-sizing: border-box;
            }
            .banner-icon {
                font-size: 24px;
                line-height: 1;
                flex-shrink: 0;
                margin-top: 2px;
                animation: alertPulse 1.5s infinite ease-in-out;
            }
            .banner-content {
                flex-grow: 1;
                padding-right: 20px;
                text-align: left;
            }
            .banner-title {
                font-size: 13px;
                font-weight: 800;
                color: ${titleColor};
                margin-bottom: 4px;
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }
            .banner-desc {
                font-size: 11px;
                line-height: 1.5;
                color: #4a5568;
                font-weight: 500;
            }
            .banner-close {
                border: none;
                background: transparent;
                font-size: 16px;
                font-weight: 700;
                color: #a0aec0;
                cursor: pointer;
                line-height: 1;
                padding: 4px;
                transition: color 0.15s;
            }
            .banner-close:hover {
                color: #4a5568;
            }
            @keyframes alertPulse {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 transparent); }
                50% { transform: scale(1.18); filter: drop-shadow(0 0 8px ${pulseColor}); }
            }
            `;

            const logoUrl = chrome.runtime.getURL('MultiShield_logo.png');
            const badgeIcon = `<img class="banner-logo" src="${logoUrl}" alt="Extension Logo" style="width: 26px; height: 26px;" />`;

            shadowRoot.innerHTML = `
            <style>${css}</style>
            <div class="scam-warning-banner" id="scam-warning-banner">
                <div class="banner-icon">${badgeIcon}</div>
                <div class="banner-content">
                <div class="banner-title">[${threatRecord.title}]</div>
                <div class="banner-desc">${threatRecord.description}</div>
                </div>
                <button class="banner-close" id="btn-close-scam-banner">✕</button>
            </div>
            `;

            const bannerElement = shadowRoot.getElementById('scam-warning-banner');
            const closeBtn = shadowRoot.getElementById('btn-close-scam-banner');

            requestAnimationFrame(() => {
                bannerElement.style.transform = 'translateY(0)';
                bannerElement.style.opacity = '1';
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    bannerElement.style.transform = 'translateY(-20px)';
                    bannerElement.style.opacity = '0';
                    setTimeout(() => {
                        container.remove();
                    }, 350);
                });
            }
        }
    };

    try {
        console.log("[MultiShield] Running direct scanner initiation...");
        initScanner();
    } catch (e) {
        console.error("[MultiShield] Immediate execution failed:", e);
    }
})();