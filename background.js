// Keep track of active scans to avoid redundant requests
const activeScans = new Set();
const CACHE_TTL_MS = 10 * 60 * 1000; // Cache results for 10 minutes

// Listen for tab updates (fires when page changes, loads, or refreshes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only trigger scan when the page has fully completed loading
    if (changeInfo.status === 'complete' && tab.url) {

        console.log("detected page loaded...")
        
        // Safety check: Skip system pages, local file paths, and Web Store domains entirely
        if (
            tab.url.startsWith('chrome://') || 
            tab.url.startsWith('about:') ||
            tab.url.startsWith('chrome-extension://') ||
            tab.url.includes('chromewebstore.google.com') ||
            tab.url.includes('chrome.google.com/webstore')
        ) {
            return;
        }

        const domain = new URL(tab.url).hostname;
        const path = new URL(tab.url).pathname;
        const sanitizedPathKey = (domain + path).replace(/[^a-zA-Z0-9]/g, '_');
        checkDomainThreat(sanitizedPathKey, tabId);
    }
});

// Primary scanning function
async function checkDomainThreat(domain, tabId) {
    if (activeScans.has(domain)) return; // Prevent double scans
    activeScans.add(domain);
    var request = false;

    try {
        // 1. Check local browser cache first
        const cacheKey = `threat_${domain}`;
        const cachedData = await chrome.storage.local.get([cacheKey]);

        if (cachedData[cacheKey]) {
            const { risk, timestamp } = cachedData[cacheKey];
            console.log(`[Cache Hit] Domain: ${domain} | Last seen: ${timestamp} | Risk: ${risk}%`);
            if (Date.now() - timestamp > CACHE_TTL_MS) {
                // updateExtensionBadge(tabId, risk);
                // expired cache
                console.log(`Cache for Domain: ${domain} has expired`);
                request = true;
            } else {
                // not expired, get old info
                if (risk >= 40) triggerAlertBanner(tabId);
                activeScans.delete(domain);
                return;
            }
        } else {
            // no cachekey
            request = true;
        }

        if (request) {
            console.log(`[Scanning] Dispatching request for: ${domain}`);

            // 2. Query your local testing backend
            // const response = await fetch('http://localhost:8080/api/keywords', {
            //     method: 'GET',
            //     headers: {
            //     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.M6Xj9Wa4WVTerJsfye8I4E5YMJZHK-mrIVO39KVIWKk'
            //     },
            // });
            const response = await fetch('http://localhost:8080/api/extension', {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Server returned HTTP ${response.status}`);
            }

            const result = await response.json(); // Expected output: { domain, risk, isScam }
            // console.log(result)

            // 3. Store result in cache
            await chrome.storage.local.set({
                [cacheKey]: {
                    risk: result.risk, //empty
                    timestamp: Date.now()
                }
            });

            await chrome.storage.local.set({
                ['keywords']: {
                    keywords: result
                }
            });

            // 4. Programmatically injects a highly secure, isolated warning banner
            // updateExtensionBadge(tabId, result.risk);
            triggerAlertBanner(tabId);
        }

    } catch (error) {
        console.error(`[Scan Error] Failed to scan ${domain}:`, error);
    } finally {
        activeScans.delete(domain);
    }
}

// Visual Indicator: Update the badge overlay on the extension icon
// function updateExtensionBadge(tabId, riskScore) {
//     let badgeText = 'SAFE';
//     let badgeColor = '#48bb78'; // Green

//     if (riskScore > 50) {
//         badgeText = `${riskScore}%`;
//         badgeColor = riskScore > 80 ? '#e53e3e' : '#dd6b20'; // Red if critical, Orange if warning
//     }

//     chrome.action.setBadgeText({ tabId, text: badgeText });
//     chrome.action.setBadgeBackgroundColor({ tabId, color: badgeColor });
// }

function triggerAlertBanner(tabId) {
    // Execute alert.js on the active page context
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["alert.js"],
        // injectImmediately: false // Let Chrome decide the safest idle execution window
    })
    .then(() => {
        console.log(`[Alert Engine] alert.js successfully injected on tab ${tabId}`);
    })
    .catch((err) => {
        // Gracefully catch and log policy blocks, system pages, and restricted domains
        if (
        err.message.includes("ExtensionsSettings") || 
        err.message.includes("cannot be scripted") ||
        err.message.includes("dreaded policy")
        ) {
            console.warn(
                `[Security Guard] Tab ${tabId} cannot be scripted due to browser system policies or enterprise GPO. Injection skipped safely.`
            );
        } else {
            // Log genuine unexpected scripting failures
            console.error(`[Alert Error] Scripting failed on tab ${tabId}:`, err);
        }
    });
}