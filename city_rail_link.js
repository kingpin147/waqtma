import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';

const TAB_INDEXES = {
    // Tab 0: ABOUT CRL
    'about': 0,
    'about-crl': 0,
    'crl-briefing-vedio': 0,
    'crl-briefing-video': 0,

    // Tab 1: BENEFITS OF CRL (Time Savings)
    'benefits': 1,
    'benefits-of-crl': 1,
    'benifts-crl': 1,
    'trainandbus': 1,
    'timesavings': 1,
    'time-savings': 1,

    // Tab 2: TRAIN & BUS TO WQ (Animated Map)
    'train-bus': 2,
    'train-and-bus': 2,
    'trainbus': 2,
    'animated': 2,
    'animated-map': 2,

    // Tab 3: WALK / BIKE TO WQ
    'walk-bike': 3,
    'walk-and-bike': 3,
    'bike': 3,

    // Tab 4: PLAN YOUR TRIP
    'plan-trip': 4,
    'plan-your-trip': 4
};

// Map URL anchor keys to candidate Wix Element IDs in Dev Mode
const ANCHOR_CANDIDATES = {
    'crl-briefing-vedio': ['#crlBriefingVideoTarget', '#crlBriefingVedioTarget', '#crl-briefing-vedio', '#crl-briefing-video', '#crlVideo', '#crlBriefingVideo'],
    'crl-briefing-video': ['#crlBriefingVideoTarget', '#crlBriefingVedioTarget', '#crl-briefing-vedio', '#crl-briefing-video', '#crlVideo', '#crlBriefingVideo'],
    'trainandbus': ['#traintobusTarget', '#trainandbusTarget', '#trainTarget', '#trainAndBusTarget', '#trainandbus', '#timeSavingsTarget', '#timesavings', '#timeSavings'],
    'timesavings': ['#traintobusTarget', '#trainandbusTarget', '#timeSavingsTarget', '#timesavings', '#trainandbus'],
    'animated': ['#animatedTarget', '#animatedMapTarget', '#animated', '#animated-map', '#animatedMap'],
    'animated-map': ['#animatedTarget', '#animatedMapTarget', '#animated', '#animated-map', '#animatedMap'],
    'bike': ['#bikeTarget', '#bike', '#walkBikeTarget'],
    'plan-your-trip': ['#planYourTripTarget', '#plan-your-trip', '#planTripTarget']
};

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

    // 1. Connect station scroll buttons
    SCROLL_BUTTONS.forEach(function (item) {
        try {
            if ($w(item.button) && $w(item.target)) {
                $w(item.button).onClick(async () => {
                    try {
                        await $w(item.target).scrollTo();
                    } catch (e) {}
                });
            }
        } catch (e) {}
    });

    // 2. Open requested tab and scroll to anchor
    setTimeout(async () => {
        await openRequestedTab();
    }, 100);

    // 3. Listen for URL changes
    if (typeof wixLocationFrontend.onChange === 'function') {
        wixLocationFrontend.onChange(async () => {
            await openRequestedTab();
        });
    }

});

async function openRequestedTab() {
    try {
        let requestedTab = '';
        let sectionAnchor = '';

        // 1. Extract query parameters
        if (wixLocationFrontend.query) {
            if (wixLocationFrontend.query.tab) {
                requestedTab = wixLocationFrontend.query.tab.toString().toLowerCase().trim();
            }
            if (wixLocationFrontend.query.section) {
                sectionAnchor = wixLocationFrontend.query.section.toString().toLowerCase().trim();
            }
        }

        // 2. Extract hash anchor from URL (#crl-briefing-vedio, #trainandbus, #animated)
        if (wixLocationFrontend.url && wixLocationFrontend.url.includes('#')) {
            const urlParts = wixLocationFrontend.url.split('#');
            if (urlParts.length > 1 && urlParts[1]) {
                const urlHash = urlParts[1].toLowerCase().trim();
                if (urlHash) {
                    sectionAnchor = urlHash;
                }
            }
        }

        // 3. Deduce tab from sectionAnchor if no ?tab= query parameter exists
        if (!requestedTab && sectionAnchor) {
            requestedTab = sectionAnchor;
        }

        if (!requestedTab && !sectionAnchor) {
            return;
        }

        const tabKey = (requestedTab || sectionAnchor).toLowerCase().trim();
        const tabIndex = TAB_INDEXES[tabKey];

        if (tabIndex === undefined) {
            return;
        }

        const tabsElement = $w('#pageTabs');
        if (!tabsElement || !tabsElement.tabs || !tabsElement.tabs[tabIndex]) {
            return;
        }

        const targetTab = tabsElement.tabs[tabIndex];

        // 4. Switch to active tab
        if (!tabsElement.currentTab || tabsElement.currentTab.id !== targetTab.id) {
            await tabsElement.changeTab(targetTab);
        }

        // 5. Wait for Wix DOM layout to render active tab contents
        await new Promise(resolve => setTimeout(resolve, 300));

        // 6. Pinpoint Anchor Scroll: Find target element AFTER tab switch
        let scrollHandled = false;

        if (sectionAnchor) {
            // Build candidate list for target element selector
            let candidates = ANCHOR_CANDIDATES[sectionAnchor] || [];
            candidates = [
                ...candidates,
                `#${sectionAnchor}`,
                `#${sectionAnchor}Target`,
                `#${sectionAnchor}Anchor`,
                `#${sectionAnchor}Section`
            ];

            for (const selector of candidates) {
                try {
                    const targetElement = $w(selector);
                    if (targetElement && typeof targetElement.scrollTo === 'function') {
                        // Pass 1: Immediate Scroll
                        await targetElement.scrollTo();
                        scrollHandled = true;

                        // Pass 2: Re-align at 350ms after media mounts
                        setTimeout(async () => {
                            try { await targetElement.scrollTo(); } catch (e) {}
                        }, 350);

                        // Pass 3: Final lock at 800ms
                        setTimeout(async () => {
                            try { await targetElement.scrollTo(); } catch (e) {}
                        }, 800);

                        console.log('[CRL Tabs] Successfully scrolled to anchor:', selector);
                        break;
                    }
                } catch (anchorErr) {
                    // Try next candidate
                }
            }
        }

        // 7. Fallback: Scroll to tab container top ONLY if no sub-anchor was targeted
        if (!scrollHandled) {
            try {
                await tabsElement.scrollTo();
            } catch (scrollErr) {}
        }

    } catch (e) {
        console.error('[CRL Tabs] Error in openRequestedTab:', e);
    }
}






