// True global variables accessible anywhere in popup.js
let globalKeywords = []; // Holds the retrieved keyword threat objects array
let activeDomain = "";
let cachedThreatRecord = null;
document.addEventListener('DOMContentLoaded', () => {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HTML Pop-up implementation Pt1
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Grab DOM Elements
    const alertsTab = document.getElementById('tab-control-alerts');
    const settingsTab = document.getElementById('tab-control-settings');
    const alertsPanel = document.getElementById('alerts-panel');
    const settingsPanel = document.getElementById('settings-panel');

    const tipButton = document.getElementById('btn-download-tip');
    const downloadMenu = document.getElementById('download-dropdown-menu');

    const btnResetSettings = document.getElementById('btn-settings-reset');
    const btnSaveSettings = document.getElementById('btn-settings-save');

    const tableBody = document.getElementById('popup-analysis-table-body');
    const keywordsBox = document.getElementById('keywords-box');
    const matchedLabel = document.getElementById('matched-keywords-count-label');
    const uiMeterFill = document.getElementById('ui-threat-meter-fill');
    const uiMeterText = document.getElementById('ui-threat-meter-text');
    const uiMessageLabel = document.getElementById('ui-threat-message-label');

    // Handle Tab Switching programmatically
    const switchTab = (targetIndex) => {
        const panels = [alertsPanel, settingsPanel];
        const buttons = [alertsTab, settingsTab];

        buttons.forEach((btn, idx) => {
        const isCurrent = (idx + 1) === targetIndex;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        });

        panels.forEach((panel, idx) => {
        panel.classList.toggle('active', (idx + 1) === targetIndex);
        });
    };

    if (alertsTab) {
        alertsTab.addEventListener('click', () => switchTab(1));
    }
    
    if (settingsTab) {
        settingsTab.addEventListener('click', () => switchTab(2));
    }

    // (2) Handle Upward-Dropped Menu Programmatically (CSP-compliant)
    if (tipButton) {
        tipButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevents click from instantly hiding again
            if (downloadMenu) {
                downloadMenu.classList.toggle('visible');
            }
        });
    }

    // Hide the menu if user clicks anywhere else in the popup safely
    document.addEventListener('click', (event) => {
        if (downloadMenu && !downloadMenu.contains(event.target) && !tipButton.contains(event.target)) {
            downloadMenu.classList.remove('visible');
        }
    });
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // DYNAMIC POPUP HYDRATION PIPELINE
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const hydratePopupUI = async () => {
        // 1. Resolve the hostname of the active browser window tab
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (tabs[0] && tabs[0].url) {
                try {
                    const domain = new URL(tabs[0].url).hostname;
                    const path = new URL(tabs[0].url).pathname;
                    const sanitizedPathKey = (domain + path).replace(/[^a-zA-Z0-9]/g, '_');
                    activeDomain = sanitizedPathKey;
                    await renderCachedMetrics(activeDomain);
                } catch (e) {
                    console.warn("[Popup] Failed to parse active tab URL context:", e);
                }
                }
            });
        } else {
            // Sandbox fallback hostname for local previews
            await renderCachedMetrics(activeDomain);
        }
    };

    const renderCachedMetrics = async (domain) => {
        const cacheKey = `threat_${domain}`;
        
        // Read the evaluated threat record generated autonomously by alert.js background scanner
        cachedThreatRecord = await getStorageData(cacheKey, null);

        if (!cachedThreatRecord) {
            // Safeguard: Fallback layout if no scan record exists for this tab yet
            if (uiMeterText) uiMeterText.textContent = "No Scan Data";
            if (uiMessageLabel) uiMessageLabel.textContent = "Navigate to an external website to populate threat matrices.";
            return;
        }

        const { risk, keywords, rawKeywords } = cachedThreatRecord;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // POPULATE GLOBAL VARIABLE WITH THE KEYWORDS LIST
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        globalKeywords = keywords; // Store array of keyword metadata globally
        console.log("[Popup] Loaded globalKeywords dynamically from storage:", globalKeywords);
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // A. Update UI Threat Meter Bar filling & coloring
        if (uiMeterFill && uiMeterText) {
            uiMeterFill.style.width = `${risk}%`;
            uiMeterText.textContent = `${risk}%`;

            if (risk >= 80) {
                uiMeterFill.style.backgroundColor = '#e53e3e'; // Crimson Red (Critical)
            } else if (risk >= 50) {
                uiMeterFill.style.backgroundColor = '#dd6b20'; // Orange (High Danger)
            } else if (risk >= 30) {
                uiMeterFill.style.backgroundColor = '#d69e2e'; // Yellow (Medium Warning)
            } else {
                uiMeterFill.style.backgroundColor = '#38a169'; // Low/Safe Forest Green
            }
        }

        // B. Sync toolbar icon action badge text label button
        // if (btnActivateBadge) {
        //     btnActivateBadge.textContent = `Set Icon Badge to ${risk}%`;
        // }

        // C. Hydrate localized warning labels text matching the risk score
        if (uiMessageLabel) {
            if (risk >= 75) {
                uiMessageLabel.innerHTML = `This page is highly likely a <strong class="scam">scam</strong>!`;
            } else if (risk >= 40) {
                uiMessageLabel.innerHTML = `This page contains <strong class="scam" style="color: #dd6b20;">suspicious</strong> threat indicators.`;
            } else {
                uiMessageLabel.innerHTML = `This page appears to be <strong style="color: #38a169; font-weight: 700;">safe</strong>. No critical markers detected.`;
            }
        }

        // D. Update copyable keywords textbox contents
        if (keywordsBox) {
            console.log(rawKeywords);
            console.log(keywords)
            // keywordsBox.value = rawKeywords.map((kw) => kw.word).join(",");
            keywordsBox.value = rawKeywords;
        }

        // E. Update Table header counter text tracking rows length
        if (matchedLabel) {
            matchedLabel.textContent = `Matched Keywords: (${keywords.length})`;
        }

        // F. Map and render pre-sorted keywords breakdown rows into HTML table view
        // change to show page keyword instead of referenced
        if (tableBody) {
            tableBody.innerHTML = '';
            keywords.forEach(kw => {
                const tr = document.createElement('tr');
                const badgeBg = kw.severity === 'CRITICAL' ? '#fed7d7' : kw.severity === 'HIGH' ? '#feebc8' : kw.severity === 'MEDIUM' ? '#fefcbf' : '#f0fff4';
                const badgeColor = kw.severity === 'CRITICAL' ? '#9b2c2c' : kw.severity === 'HIGH' ? '#9c4221' : kw.severity === 'MEDIUM' ? '#975a16' : '#22543d';

                tr.innerHTML = `
                <td>
                    <span style="font-weight: 600;">${kw.word}</span>
                    <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor}; margin-left: 6px; display: inline-block; vertical-align: middle; letter-spacing: 0.03em;">${kw.severity}</span>
                </td>
                <td class="scam-type"><a href="#">${kw.type}</a></td>
                `;
                tableBody.appendChild(tr);
            });
        }
    };

    // Run Hydration on popup bootstrap initialization
    hydratePopupUI();

    const evaluateScore = (threatLevel) => (threatLevel >= 90)? "CRITICAL" : 
            (threatLevel >= 65)? "HIGH" :
            (threatLevel >= 40)? "MEDIUM": "LOW"

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // UNIFIED REPORT DOWNLOAD ENGINE
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Helper function to initiate the actual browser download sequence safely.
    // Supports string data downloads as well as binary array parts (PDF structure blocks).
    const triggerFileBlobDownload = (content, filename, contentType) => {
        // Use Array.isArray instead of instanceof Array to prevent cross-context boundary failures
        const blobParts = Array.isArray(content) ? content : [content];
        const blob = new Blob(blobParts, { type: contentType });
        const url = URL.createObjectURL(blob);
        
        // Check if running inside an actual Chrome Extension context with download privileges
        if (typeof chrome !== 'undefined' && chrome.downloads && chrome.downloads.download) {
            chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: true // Prompts directory window safely
            }, () => {
                // Memory clean up
                URL.revokeObjectURL(url);
            });
        } else {
            // Fallback mechanism to ensure sandbox previews/local testing pages still open and download fine
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Small delay before revoking to prevent browser drop abort
            setTimeout(() => URL.revokeObjectURL(url), 150);
        }
    };

    // Helper utility to convert a standard base64 string to a binary Uint8Array
    const base64ToUint8Array = (base64) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const policies = {
        "low": "Low (Passive)",
        "medium": "Balanced",
        "high": "High (Strict)"
    }

    // 1. Plain text formatter (Structured exactly like the Nessus Audit Report)
    const generateTxtReport = (data) => {
        const crit = data.keywords.filter((kw) => kw.severity == "CRITICAL").length;
        const high = data.keywords.filter((kw) => kw.severity == "HIGH").length;
        const med = data.keywords.filter((kw) => kw.severity == "MEDIUM").length;
        const low = data.keywords.filter((kw) => kw.severity == "LOW").length;
        const info = data.keywords.filter((kw) => kw.severity == "INFO").length;
        return `###############################################################################################################
# MULTISHIELD VULNERABILITY ASSESSMENT REPORT
       +####+         
  +++###.  .####+    
 -+#.   ####    #+.   __  __       _ _   _  _____ _     _      _     _ 
 +#  ##. ## +## -#-  |  \\/  |     | | | (_)/ ____| |   (_)    | |   | |
 -#+ ####  ####.     | \\  / |_   _| | |_ _| (___ | |__  _  ___| | __| |
   #### ###  #####.  | |\\/| | | | | | __| |\\___ \\| '_ \\| |/ _ \\ |/ _  |
 +#+ ## #    ## #+   | |  | | |_| | | |_| |____) | | | | |  __/ | (_| |
  -#- # ### #+ ##    |_|  |_|\\__,_|_|\\__|_|_____/|_| |_|_|\\___|_|\\__,_|
   .##+  #.  ###    
     .########      
        .-..        
###############################################################################################################

---------------------------------------------------------------------------------------------------------------
I. EXECUTIVE SUMMARY & SCAN METADATA
---------------------------------------------------------------------------------------------------------------
  Target Address:        ${data.domain}
  Scan Policy:           ${policies[data.sensitivity]}
  Scan Completed:        ${data.timestamp}
  Audit Hash ID:         ${data.reportHash}
  Risk Status:           ${evaluateScore(data.threatLevel)} RISK DETECTED (${data.threatLevel}% Severity Score)
  Scanner Engine:        MultiShield Engine (v0.5)

---------------------------------------------------------------------------------------------------------------
II. SEVERITY DISTRIBUTION
---------------------------------------------------------------------------------------------------------------
  [ CRITICAL: ${crit} ]  [ HIGH: ${high} ]  [ MEDIUM: ${med} ]  [ LOW: ${low} ]  [ INFO: ${info} ]
  [${Array(data.threatLevel+1).join('#')}${Array(101-data.threatLevel).join('.')}]  ${data.threatLevel}%   

---------------------------------------------------------------------------------------------------------------
III. DETAILED KEYWORD ANALYSIS MATRIX [${data.matchCount} TOTAL MATCHES]
---------------------------------------------------------------------------------------------------------------
  Matched Threat Signatures:
${data.keywords.map((kw, i) => `  ${String(i+1).padStart(2, '0')}. Word: "${kw.word.padEnd(15, ' ')}" -> Severity: [${kw.severity.padEnd(8, ' ')}] | Class: ${kw.type} | Score: ${kw.score}`).join('\n')}

  Risk Factor:
  Critical / CVSS Base Score: 10.0 (CVSS2#AV:N/AC:L/Au:N/C:C/I:C/A:C)

  Plugin Output:
  The scanner validated the following raw keywords on the live page DOM stream:
  [ ${data.rawKeywords} ]

  Plugin Details:
  Plugin ID: 150325 | Family: Phishing & Fraud | Version: v1.4.2-beta | Agent ID: LOCAL-SCAN-01

###############################################################################################################`;
    };

    // 2. Pure JavaScript PDF Compiler.
    // This compiles synchronously using pure binary blocks (Uint8Array) to prevent encoding conflicts.
    const generateBasicPDF = (data, logoJpegBase64, imgWidth = 48, imgHeight = 48) => {
        // Utility to convert text lines to exact binary Uint8Arrays to count length with zero encoding conflicts
        const getByteLength = (str) => new TextEncoder().encode(str).length;
        // Escape routine to guarantee secure stream processing
        const escapePDF = (str) => {
            if (str === undefined || str === null) return '';
            return String(str).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
        };       

        const escapedDomain = escapePDF(data.domain);
        const escapedRisk = escapePDF(`${evaluateScore(data.threatLevel)} RISK - ${data.threatLevel}%`);
        const escapedTimestamp = escapePDF(data.timestamp);
        const escapedReportHash = escapePDF(data.reportHash);
        const escapedPolicy = escapePDF(policies[data.sensitivity])

        // --- PARTITION KEYWORDS DYNAMICALLY INTO PAGES ---
        const pagesKeywords = [];
        let currentIndex = 0;

        // Page 1 always takes up to 12 keywords
        let firstPageChunk = data.keywords.slice(0, 12);
        pagesKeywords.push(firstPageChunk);
        currentIndex += firstPageChunk.length;

        // Slice subsequent pages dynamically
        while (currentIndex < data.keywords.length) {
          const remainingCount = data.keywords.length - currentIndex;
          // If this is the last page, limit capacity to 12 to leave room for the footer blocks.
          // Otherwise, it's a middle page and can hold up to 16 keywords.
          const isLastPage = (remainingCount <= 12);
          const chunkSize = isLastPage ? 12 : 16;
          
          const chunk = data.keywords.slice(currentIndex, currentIndex + chunkSize);
          pagesKeywords.push(chunk);
          currentIndex += chunk.length;
        }

        const numPages = pagesKeywords.length;
        const pageStreams = [];

        // Build individual page content streams
        pagesKeywords.forEach((pageKeywords, pageIdx) => {
            const p = pageIdx + 1;
            const isFirstPage = (p === 1);
            const isLastPage = (p === numPages);

            let pageStream = "";

            // Common Page Frame: Header stripe and running co-branded logos
            pageStream += "0.0 0.65 0.6 rg\n0 825 595 17 re f\n0.9 0.9 0.9 rg\n0 821 595 4 re f\n";
            // Title Logo Block
            pageStream += "BT\n/F2 16 Tf\n0.15 0.22 0.33 rg\n50 780 Td\n(MULTISHIELD VULNERABILITY ASSESSMENT REPORT) Tj\n/F1 9 Tf\n0.4 0.4 0.4 rg\n0 -15 Td\n(Scan Target: " + escapedDomain.toUpperCase() + " | Scan Risk Policy: " + escapedPolicy.toUpperCase() + ") Tj\nET\n";
            pageStream += "0.15 0.22 0.33 rg\n496 751 48 48 re f\n1 1 1 rg\n498 753 44 44 re f\nq\n40 0 0 40 500 755 cm\n/MyLogo Do\nQ\n50 745 495 1.5 re f\n";
            // section divider
            pageStream += "0.15 0.22 0.33 rg\n50 745 495 1.5 re f\n";

            if (isFirstPage) {
                // Render Primary Scan Metadata Box on Page 1
                pageStream += "0.7 0.7 0.7 RG\n0.5 w\n50 635 495 90 re s\n50 665 m 545 665 l S\n50 695 m 545 695 l S\n170 635 m 170 725 l S\n297.5 635 m 297.5 725 l S\n417.5 635 m 417.5 725 l S\n";
                pageStream += "0.95 0.96 0.97 rg\n50.5 695.5 119 29 re f\n50.5 665.5 119 29 re f\n50.5 635.5 119 29 re f\n298 695.5 119 29 re f\n298 665.5 119 29 re f\n298 635.5 119 29 re f\n";
                pageStream += "BT\n/F2 8.5 Tf\n0.2 0.2 0.2 rg\n55 706 Td\n(Target Address:) Tj\n0 -30 Td\n(Scan Policy:) Tj\n0 -30 Td\n(Scan Completed:) Tj\nET\n";
                pageStream += `BT\n/F1 8.5 Tf\n0.1 0.1 0.1 rg\n175 706 Td\n(${escapedDomain}) Tj\n0 -30 Td\n(${escapedPolicy}) Tj\n0 -30 Td\n(${escapedTimestamp}) Tj\nET\n`;
                pageStream += "BT\n/F2 8.5 Tf\n0.2 0.2 0.2 rg\n303 706 Td\n(Audit Hash ID:) Tj\n0 -30 Td\n(Risk Status:) Tj\n0 -30 Td\n(Scanner Engine:) Tj\nET\n";
                pageStream += `BT\n/F1 8.5 Tf\n0.1 0.1 0.1 rg\n422.5 706 Td\n(${escapedReportHash}) Tj\n/F2 8.5 Tf\n0.76 0.12 0.12 rg\n0 -30 Td\n(${escapedRisk}) Tj\n/F1 8.5 Tf\n0.1 0.1 0.1 rg\n0 -30 Td\n(MultiShield Engine (v0.5)) Tj\nET\n`;

                // Draw Dynamic Severity Distribution Bar on Page 1
                let critCount = 0, highCount = 0, medCount = 0, lowCount = 0, infoCount = 0;
                data.keywords.forEach(kw => {
                    if (kw.severity === "CRITICAL") critCount++;
                    else if (kw.severity === "HIGH") highCount++;
                    else if (kw.severity === "MEDIUM") medCount++;
                    else if (kw.severity === "LOW") lowCount++;
                    else if (kw.severity === "INFO") infoCount++;
                });

                const totalCount = data.matchCount;
                if (totalCount === 0) {
                    pageStream += "0.5 0.5 0.5 rg\n50 595 495 16 re f\nBT\n/F2 8 Tf\n1 1 1 rg\n253 599 Td\n(0 MATCHES) Tj\nET\n";
                } else {
                    const segments = [
                        { name: "CRITICAL", count: critCount, color: "0.76 0.12 0.12" },
                        { name: "HIGH", count: highCount, color: "0.92 0.40 0.00" },
                        { name: "MEDIUM", count: medCount, color: "0.94 0.73 0.15" },
                        { name: "LOW", count: lowCount, color: "0.27 0.61 0.27" },
                        { name: "INFO", count: infoCount, color: "0.14 0.48 0.74" }
                    ];
                    let currentX = 50;
                    segments.forEach(seg => {
                        if (seg.count > 0) {
                            const segWidth = (seg.count / totalCount) * 495;
                            pageStream += `${seg.color} rg\n${currentX} 595 ${segWidth} 16 re f\n`;
                            const labelText = `${seg.count} ${seg.name}`;
                            const labelWidth = labelText.length * 4.6;
                            if (segWidth >= labelWidth) {
                                pageStream += `BT\n/F2 8 Tf\n1 1 1 rg\n${currentX + (segWidth - labelWidth) / 2} 599 Td\n(${labelText}) Tj\nET\n`;
                            } else if (segWidth >= 12) {
                                pageStream += `BT\n/F2 8 Tf\n1 1 1 rg\n${currentX + (segWidth - (String(seg.count).length * 5)) / 2} 599 Td\n(${seg.count}) Tj\nET\n`;
                            }
                            currentX += segWidth;
                        }
                    });
                }

                // Draw container stroked grey border
                // pageStream += "0.7 0.7 0.7 RG\n50 573 495 16 re s\n";
                pageStream += "0.886 0.910 0.941 rg\n50 560 495 16 re f\n";
                const meterFillWidth = (data.threatLevel / 100) * 495;
                if (meterFillWidth > 0) {
                    let threatMeterColor = "0.22 0.631 0.412"; // Forest Green (Safe)
                    if (data.threatLevel >= 80) {
                    threatMeterColor = "0.898 0.243 0.243"; // Crimson Red (Critical)
                    } else if (data.threatLevel >= 50) {
                    threatMeterColor = "0.867 0.420 0.125"; // Orange (High)
                    } else if (data.threatLevel >= 30) {
                    threatMeterColor = "0.839 0.620 0.180"; // Yellow/Gold (Medium)
                    }
                    pageStream += `${threatMeterColor} rg\n50 560 ${meterFillWidth.toFixed(2)} 16 re f\n`;
                }
                pageStream += "0.7 0.7 0.7 RG\n50 560 495 16 re s\n"; // Stroke container border

                // Draw bold, legible score label centered horizontally
                const threatText = `THREAT LEVEL: ${data.threatLevel}%`;
                const threatTextWidth = threatText.length * 4.9; // Approximate pixel width
                const threatTextX = 50 + (495 - threatTextWidth) / 2;
                pageStream += `BT\n/F2 8.5 Tf\n0.15 0.15 0.15 rg\n${threatTextX.toFixed(2)} 579 Td\n(${threatText}) Tj\nET\n`;
                // ======================================================================

                pageStream += `BT\n/F2 11 Tf\n0.15 0.22 0.33 rg\n50 530 Td\n(DETAILED KEYWORD ANALYSIS MATRIX [${totalCount} TOTAL MATCHES]) Tj\nET\n`;
            } else {
                pageStream += `BT\n/F2 11 Tf\n0.15 0.22 0.33 rg\n50 665 Td\n(DETAILED KEYWORD ANALYSIS MATRIX (CONTINUED)) Tj\nET\n`;
            }

            // Build keyword cards grid for this page
            const colWidth = 110, colHeight = 85, colGap = 18, rowGap = 10;
            const startY = isFirstPage ? 430 : 560; // Subsequent pages can start their grids higher up

            pageKeywords.forEach((kw, index) => {
                const row = Math.floor(index / 4);
                const col = index % 4;
                const x = 50 + col * (colWidth + colGap);
                const y = startY - row * (colHeight + rowGap);

                pageStream += `${kw.bgColor.join(" ")} rg\n${x} ${y} ${colWidth} ${colHeight - 15} re f\n${kw.color.join(" ")} rg\n${x} ${y + colHeight - 15} ${colWidth} 15 re f\n${kw.color.join(" ")} RG\n0.5 w\n${x} ${y} ${colWidth} ${colHeight} re s\n`;
                pageStream += `BT\n/F2 7.5 Tf\n1 1 1 rg\n${x + 5} ${y + colHeight - 11} Td\n(${kw.severity}) Tj\nET\nBT\n/F2 8 Tf\n0.15 0.15 0.15 rg\n${x + 5} ${y + colHeight - 27} Td\n(${escapePDF(kw.word)}) Tj\nET\n`;
                pageStream += `BT\n/F1 7 Tf\n0.3 0.3 0.3 rg\n${x + 5} ${y + colHeight - 40} Td\n(${escapePDF(kw.type)}) Tj\n/F1 6.5 Tf\n0 -11 Td\n(Score: ${escapePDF(kw.score)}) Tj\n0 -10 Td\n(Match: EXACT) Tj\n0 -10 Td\n(Act: ${escapePDF(kw.action)}) Tj\nET\n`;
            });

            // if (isLastPage) {
            //     // Draw Recommended Remediation Actions at the bottom of the last page
            //     pageStream += "0.15 0.22 0.33 rg\n";
            //     pageStream += "50 310 7 7 re f\n50 285 7 7 re f\n50 260 7 7 re f\n";
            //     pageStream += "1 1 1 RG\n1 w\n";
            //     pageStream += "51 313.5 m 53 311.5 l 56.5 315.5 l S\n51 288.5 m 53 286.5 l 56.5 290.5 l S\n51 263.5 m 53 261.5 l 56.5 265.5 l S\n";
                
            //     pageStream += "BT\n/F2 11 Tf\n0.15 0.22 0.33 rg\n50 340 Td\n(RECOMMENDED REMEDIATION ACTIONS) Tj\nET\n";
            //     pageStream += "BT\n/F1 8.5 Tf\n0.15 0.15 0.15 rg\n65 310 Td\n(Block outbound enterprise browser navigation to verified high-risk phishing domains.) Tj\n0 -25 Td\n(Deploy localized browser safety adjustments to protect session tokens and administrative cookies.) Tj\n0 -25 Td\n(Configure the heuristic detection engine sensitivity inside Settings panel for dynamic scanning.) Tj\nET\n";

            //     // Draw Security Assurance Validation Box at the bottom of the last page
            //     pageStream += "0.7 0.7 0.7 RG\n0.5 w\n50 110 495 100 re s\n0.95 0.96 0.97 rg\n50.5 190.5 494 19 re f\n0.7 0.7 0.7 RG\n50 190 m 545 190 l S\n";
            //     pageStream += "BT\n/F2 8.5 Tf\n0.15 0.22 0.33 rg\n58 196 Td\n(SECURITY ASSURANCE AUDIT VALIDATION) Tj\nET\n";
            //     pageStream += `BT\n/F1 8.5 Tf\n0.2 0.2 0.2 rg\n58 170 Td\n(This executive threat risk report has been validated and cryptographically cataloged.) Tj\n0 -15 Td\n(Authority: Phishing Protection Protocol | Verification Status: SYSTEM COMPLIANT & ENFORCED) Tj\n0 -15 Td\n(Certificate ID: NESSUS-SEC-9941X | Hash Verification: [${escapedReportHash}]) Tj\nET\n`;
            // }

            // Common Page Footer Line and Page Counter Metadata
            pageStream += "0.15 0.22 0.33 rg\n50 68 495 1.5 re f\n";
            // pageStream += "BT\n/F1 8 Tf\n0.5 0.5 0.5 rg\n50 52 Td\n(CONFIDENTIAL SCAN REPORT - AUDITED USING NESSUS PROFESSIONAL VULNERABILITY POLICY) Tj\nET\n";
            pageStream += `BT\n/F1 8 Tf\n0.5 0.5 0.5 rg\n495 52 Td\n(Page ${p} of ${numPages}) Tj\nET\n`;

            pageStreams.push(pageStream);
        });

        // Convert the JPEG base64 to byte arrays synchronously (bypassing CSP/canvas dependencies)
        const imageBytes = base64ToUint8Array(logoJpegBase64);

        // --- ENFORCING ENCODER COHERENCY ON ALL DYNAMICALLY BUILT OBJECTS ---
        const encoder = new TextEncoder();
        const pdfObjects = [];

        // Helper to register an object dynamically
        const registerPDFObject = (id, bytes) => {
          pdfObjects.push({ id, bytes });
        };

        // Object 1: Catalog Dictionary
        registerPDFObject(1, encoder.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));

        // Object 2: Parent Page Tree
        let kidsStr = "";
        for (let p = 1; p <= numPages; p++) {
          kidsStr += `${10 + 2 * (p - 1)} 0 R `;
        }
        registerPDFObject(2, encoder.encode(`2 0 obj\n<< /Type /Pages /Kids [ ${kidsStr.trim()} ] /Count ${numPages} >>\nendobj\n`));

        // Object 4: Standard Helvetica Font
        registerPDFObject(4, encoder.encode("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"));

        // Object 5: Standard Helvetica-Bold Font
        registerPDFObject(5, encoder.encode("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n"));

        // Object 7: Image Stream Object (Decoded as native JPEG)
        const obj7Header = encoder.encode(`7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
        const obj7Footer = encoder.encode("\nendstream\nendobj\n");
        const obj7Bytes = new Uint8Array(obj7Header.length + imageBytes.length + obj7Footer.length);
        obj7Bytes.set(obj7Header, 0);
        obj7Bytes.set(imageBytes, obj7Header.length);
        obj7Bytes.set(obj7Footer, obj7Header.length + imageBytes.length);
        registerPDFObject(7, obj7Bytes);

        // Compile Page node objects and Contents stream objects dynamically inside the loop
        pageStreams.forEach((streamText, pageIdx) => {
            const p = pageIdx + 1;
            const pageObjID = 10 + 2 * (p - 1);
            const contentsObjID = pageObjID + 1;

            // Define Page metadata node
            const pageObjText = `${pageObjID} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /MyLogo 7 0 R >> >> /MediaBox [ 0 0 595 842 ] /Contents ${contentsObjID} 0 R >>\nendobj\n`;
            registerPDFObject(pageObjID, encoder.encode(pageObjText));

            // Define Page stream content
            const pageStreamBytes = encoder.encode(streamText);
            const contentsObjTextHeader = `${contentsObjID} 0 obj\n<< /Length ${pageStreamBytes.length} >>\nstream\n`;
            const contentsObjTextFooter = "\nendstream\nendobj\n";

            const contentsBytes = new Uint8Array(contentsObjTextHeader.length + pageStreamBytes.length + contentsObjTextFooter.length);
            contentsBytes.set(encoder.encode(contentsObjTextHeader), 0);
            contentsBytes.set(pageStreamBytes, encoder.encode(contentsObjTextHeader).length);
            contentsBytes.set(encoder.encode(contentsObjTextFooter), encoder.encode(contentsObjTextHeader).length + pageStreamBytes.length);
            registerPDFObject(contentsObjID, contentsBytes);
        });

        // Sort compiled elements by Object ID to satisfy structural layout indexing rules
        pdfObjects.sort((a, b) => a.id - b.id);

        const partHeader = encoder.encode("%PDF-1.4\n");
        const objectOffsets = {}; // Maps Object ID -> absolute byte offset
        let currentOffset = partHeader.length;

        const assembledParts = [partHeader];

        // Append objects and map absolute offsets synchronously
        pdfObjects.forEach((obj) => {
            objectOffsets[obj.id] = currentOffset;
            assembledParts.push(obj.bytes);
            currentOffset += obj.bytes.length;
        });

        const maxID = pdfObjects[pdfObjects.length - 1].id;
        const xrefHeader = `xref\n0 ${maxID + 1}\n`;
        let xrefBody = "";

        const formatXrefLine = (offset, generation, isFree) => {
            const offStr = String(offset).padStart(10, '0');
            const genStr = String(generation).padStart(5, '0');
            const type = isFree ? 'f' : 'n';
            return `${offStr} ${genStr} ${type} \n`;
        };

        // Write sequential Cross-Reference entries, filling unmapped slots dynamically
        for (let i = 0; i <= maxID; i++) {
            if (i === 0) {
                xrefBody += formatXrefLine(0, 65535, true);
            } else if (objectOffsets[i] !== undefined) {
                xrefBody += formatXrefLine(objectOffsets[i], 0, false);
            } else {
                // Unused slot padding
                xrefBody += formatXrefLine(0, 65535, true);
            }
        }

        const startXref = currentOffset;
        const trailer = `trailer\n<< /Size ${maxID + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
        const trailerBytes = encoder.encode(xrefHeader + xrefBody + trailer);

        assembledParts.push(trailerBytes);
        return assembledParts;
    };

    // Unified centralized controller that routes formatting commands
    const executeUnifiedDownload = async (format) => {
        const keywordsInput = document.getElementById('keywords-box').value;
        let currentDomain = "unknown-sandbox-site.com";

        // Fetch user configurations dynamically from storage
        const selectedSensitivity = await getStorageData('risk-sensitivity');

        const compilePayloadAndDownload = (domain) => {
            // Surrounding text payload simulation
            const fullPageTextSample = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

            const { risk, keywords, rawKeywords } = cachedThreatRecord;
            const calculatedKeywords = globalKeywords;
            const overallScore = risk;

            const payload = {
                domain: domain,
                timestamp: new Date().toISOString(),
                threatLevel: overallScore,
                matchCount: calculatedKeywords.length,
                rawKeywords: keywordsInput,
                reportHash: Math.random().toString(36).substring(2, 10).toUpperCase(),
                keywords: calculatedKeywords,
                sensitivity: selectedSensitivity
            };

            switch (format) {
                case 'txt':
                    const txtData = generateTxtReport(payload);
                    triggerFileBlobDownload(txtData, `threat_report_${domain}.txt`, 'text/plain;charset=utf-8');
                    break;

                case 'pdf':
                    const logoBase64JPEG = "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";
                    const pdfData = generateBasicPDF(payload, logoBase64JPEG, 180, 180);
                    triggerFileBlobDownload(pdfData, `threat_report_${domain}.pdf`, 'application/pdf');
                    break;
            }

        //   triggerToast(`${format.toUpperCase()} report downloaded!`);
        };

        // Standard dynamic background context inquiry
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url) {
                try {
                    currentDomain = new URL(tabs[0].url).hostname;
                } catch(e) {}
            }
                compilePayloadAndDownload(currentDomain);
            });
        } else {
                compilePayloadAndDownload(currentDomain);
        }
    };

    // 3. Bind UI elements to the unified router
    const bindUIEvent = (elementId, format, isAnchor = false) => {
        const btn = document.getElementById(elementId);
        if (btn) {
            btn.addEventListener('click', async (e) => {
                if (isAnchor) e.preventDefault();
                await executeUnifiedDownload(format);
            });
        }
    };

    // Set up the unified controller bindings
    bindUIEvent('btn-download-main', 'txt');
    bindUIEvent('menu-download-txt', 'txt', true);
    bindUIEvent('menu-download-pdf', 'pdf', true);
    // bindUIEvent('menu-download-csv', 'csv', true);

    const downloadTxtButton = document.getElementById('btn-download-txt');
    const downloadPdfButton = document.getElementById('btn-download-pdf');

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // PROMISIFIED STORAGE PERSISTENCE API & WEB FALLBACKS (DYNAMIC CACHING ENGINE)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const getStorageData = (key, defaultValue) => {
        return new Promise((resolve) => {
            if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
                // Preview / Sandboxed Web Session Fallback
                const val = localStorage.getItem(key);
                resolve(val !== null ? val : defaultValue);
                return;
            }
            chrome.storage.local.get([key], (result) => {
                if (chrome.runtime.lastError || !result || result[key] === undefined) {
                    resolve(defaultValue);
                } else {
                    resolve(result[key]);
                }
            });
        });
    };
    const setStorageData = (key, value) => {
        return new Promise((resolve, reject) => {
            if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
                // Preview / Sandboxed Web Session Fallback
                localStorage.setItem(key, value);
                resolve();
                return;
            }
            chrome.storage.local.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve();
            });
        });
    };

    // Load Settings and Hydrate Forms On Initialization
    const loadSavedSettings = async () => {
        const safeDomains = await getStorageData('safe-domains', 'github.com, supabase.com');
        // const realtimeScan = await getStorageData('realtime-scan', 'true');
        // const deepHeuristics = await getStorageData('deep-heuristics', 'false');
        const riskSensitivity = await getStorageData('risk-sensitivity', 'medium');

        document.getElementById('set-safe-domains').value = safeDomains;
        // document.getElementById('set-realtime-scan').checked = realtimeScan === 'true';
        // document.getElementById('set-deep-heuristics').checked = deepHeuristics === 'true';
        document.getElementById('set-risk-sensitivity').value = riskSensitivity;
    };

    // Instantly trigger setting form load state
    loadSavedSettings();

    // Settings Save Handler
    if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', async () => {
            const safeDomains = document.getElementById('set-safe-domains').value;
            // const realtimeScan = document.getElementById('set-realtime-scan').checked ? 'true' : 'false';
            // const deepHeuristics = document.getElementById('set-deep-heuristics').checked ? 'true' : 'false';
            const riskSensitivity = document.getElementById('set-risk-sensitivity').value;

            await setStorageData('safe-domains', safeDomains);
            // await setStorageData('realtime-scan', realtimeScan);
            // await setStorageData('deep-heuristics', deepHeuristics);
            await setStorageData('risk-sensitivity', riskSensitivity);

            triggerToast('Settings saved successfully!');
        });
    }

    // Settings Reset Handler
    if (btnResetSettings) {
        btnResetSettings.addEventListener('click', async () => {
            const defaultSafeDomains = 'github.com, supabase.com';
            // const defaultRealtimeScan = 'true';
            // const defaultDeepHeuristics = 'false';
            const defaultRiskSensitivity = 'medium';

            document.getElementById('set-safe-domains').value = defaultSafeDomains;
            // document.getElementById('set-realtime-scan').checked = true;
            // document.getElementById('set-deep-heuristics').checked = false;
            document.getElementById('set-risk-sensitivity').value = defaultRiskSensitivity;

            await setStorageData('safe-domains', defaultSafeDomains);
            // await setStorageData('realtime-scan', defaultRealtimeScan);
            // await setStorageData('deep-heuristics', defaultDeepHeuristics);
            await setStorageData('risk-sensitivity', defaultRiskSensitivity);

            triggerToast('Defaults restored.');
        });
    }

    // Custom Toast Engine
    function triggerToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        
        // Layout configurations tailored specifically to sit absolute inside extension dimensions
        toast.style.position = 'absolute';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#1e293b';
        toast.style.color = '#ffffff';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '6px';
        toast.style.fontSize = '13px';
        toast.style.fontWeight = '500';
        toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
        toast.style.zIndex = '10000';
        toast.style.pointerEvents = 'none';
        toast.style.whiteSpace = 'nowrap';
        toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        
        // Inject inside the wrapper box context rather than body viewport
        const targetParent = document.getElementById('extension-frame-root') || document.body;
        targetParent.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(5px)';
            setTimeout(() => toast.remove(), 150);
        }, 2000);
    }
});

// Robust, zero-dependency switching script
function toggleTab(targetIndex) {
    // 1. Fetch element collections
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // 2. Clear out active classes and update Accessibility ARIA statuses
    tabButtons.forEach((btn, idx) => {
        const isCurrent = (idx + 1) === targetIndex;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    // 3. Toggle panel visibilities
    tabPanels.forEach((panel, idx) => {
        panel.classList.toggle('active', (idx + 1) === targetIndex);
    });
}
