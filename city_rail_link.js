import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';

/**
 * City Rail Link (CRL) Page - Deep Linking Script
 * 
 * Manages tab activation and scrolling for both query parameters and hash anchors.
 * See URLS_LIST.md for full directory of URLs.
 */

// Route mapping: links queries / hashes to tab indices and optional sub-anchors
const ROUTE_MAP = {
    // === TAB 0: ABOUT CRL ===
    'about': { tabIndex: 0 },
    'about-crl': { tabIndex: 0 },
    'tababoutclr': { tabIndex: 0 },
    'tababoutcrl': { tabIndex: 0 },
    'crl-briefing-vedio': { tabIndex: 0, subAnchor: '#crlBriefingVideo' },
    'crl-briefing-video': { tabIndex: 0, subAnchor: '#crlBriefingVideo' },
    '0': { tabIndex: 0 },

    // === TAB 1: BENEFITS OF CRL ===
    'benefits': { tabIndex: 1 },
    'benefits-of-crl': { tabIndex: 1 },
    'benifts-crl': { tabIndex: 1 },
    'tabbenefits': { tabIndex: 1 },
    'timesavings': { tabIndex: 1, subAnchor: '#timeSavings' },
    'time-savings': { tabIndex: 1, subAnchor: '#timeSavings' },
    '1': { tabIndex: 1 },

    // === TAB 2: TRAIN & BUS TO WQ ===
    'train-bus': { tabIndex: 2 },
    'train-and-bus': { tabIndex: 2 },
    'trainandbus': { tabIndex: 2 },
    'tabtrainbus': { tabIndex: 2 },
    'animated': { tabIndex: 2, subAnchor: '#animated' },
    'animated-map': { tabIndex: 2, subAnchor: '#animated' },
    '2': { tabIndex: 2 },

    // === TAB 3: WALK / BIKE TO WQ ===
    'walk-bike': { tabIndex: 3 },
    'walk-and-bike': { tabIndex: 3 },
    'bike': { tabIndex: 3 },
    'tabwalkbike': { tabIndex: 3 },
    '3': { tabIndex: 3 },

    // === TAB 4: PLAN YOUR TRIP ===
    'plan-trip': { tabIndex: 4 },
    'plan-your-trip': { tabIndex: 4 },
    'tabplantrip': { tabIndex: 4 },
    '4': { tabIndex: 4 }
};

// Station quick-scroll buttons
const SCROLL_BUTTONS = [
    { button: '#trainButton', target: '#trainTarget' },
    { button: '#traintobusButton', target: '#traintobusTarget' },
    { button: '#TeWaihorotiuStationWalkButton', target: '#TeWaihorotiuStationWalkTarget' },
    { button: '#TeWaihorotiuStationScootButton', target: '#TeWaihorotiuStationScootTarget' },
    { button: '#TeWaihorotiuStationCycleButton', target: '#TeWaihorotiuStationCycleTarget' },
    { button: '#WaitemataWalkButton', target: '#WaitemataWalkTarget' },
    { button: '#WaitemataCycleButton', target: '#WaitemataCycleTarget' },
    { button: '#WaitemataScootButton', target: '#WaitemataScootTarget' }
];

$w.onReady(function () {
    // 1. Setup Station Scroll Buttons
    SCROLL_BUTTONS.forEach(function (item) {
        try {
            if ($w(item.button) && $w(item.target)) {
                $w(item.button).onClick(() => {
                    try {
                        $w(item.target).scrollTo().catch(() => {});
                    } catch (e) {}
                });
            }
        } catch (e) {}
    });

    // 2. Tab Navigation (Client browser only, non-blocking)
    if (wixWindowFrontend.rendering.env === 'browser') {
        setTimeout(() => {
            openRequestedTab();
        }, 150);

        if (typeof wixLocationFrontend.onChange === 'function') {
            wixLocationFrontend.onChange(() => {
                setTimeout(() => {
                    openRequestedTab();
                }, 50);
            });
        }
    }
});

function openRequestedTab() {
    try {
        let key = '';

        // Priority 1: Query parameter ?tab=...
        if (wixLocationFrontend.query && wixLocationFrontend.query.tab) {
            key = wixLocationFrontend.query.tab.toString().toLowerCase().trim();
        } 
        // Priority 2: Hash in URL #...
        else if (wixLocationFrontend.url && wixLocationFrontend.url.includes('#')) {
            const urlParts = wixLocationFrontend.url.split('#');
            if (urlParts.length > 1) {
                key = urlParts[1].toLowerCase().trim();
            }
        }

        if (!key) {
            return;
        }

        const route = ROUTE_MAP[key];
        if (!route) {
            return;
        }

        const tabsElement = $w('#pageTabs');
        if (!tabsElement || !tabsElement.tabs || !tabsElement.tabs[route.tabIndex]) {
            return;
        }

        const targetTab = tabsElement.tabs[route.tabIndex];

        // Switch to target tab if needed
        if (!tabsElement.currentTab || tabsElement.currentTab.id !== targetTab.id) {
            if (typeof tabsElement.changeTab === 'function') {
                tabsElement.changeTab(targetTab);
            }
        }

        // Scroll to sub-anchor (if specific section like #animated video) or tabs header
        setTimeout(() => {
            if (route.subAnchor && $w(route.subAnchor) && typeof $w(route.subAnchor).scrollTo === 'function') {
                $w(route.subAnchor).scrollTo().catch(() => {});
            } else if (typeof tabsElement.scrollTo === 'function') {
                tabsElement.scrollTo().catch(() => {});
            }
        }, 100);

    } catch (err) {
        console.error('[CRL Tabs] Error in openRequestedTab:', err);
    }
}
