import wixLocationFrontend from 'wix-location-frontend';

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

    // 2. Open requested tab
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

        if (wixLocationFrontend.query && wixLocationFrontend.query.tab) {
            requestedTab = wixLocationFrontend.query.tab;
        } else if (wixLocationFrontend.query && wixLocationFrontend.query.section) {
            requestedTab = wixLocationFrontend.query.section;
        } else if (wixLocationFrontend.url && wixLocationFrontend.url.includes('#')) {
            const urlParts = wixLocationFrontend.url.split('#');
            if (urlParts.length > 1 && urlParts[1]) {
                requestedTab = urlParts[1];
            }
        }

        if (!requestedTab) {
            return;
        }

        const tabKey = requestedTab.toString().toLowerCase().trim();
        const tabIndex = TAB_INDEXES[tabKey];

        if (tabIndex === undefined) {
            return;
        }

        const tabsElement = $w('#pageTabs');
        if (!tabsElement || !tabsElement.tabs || !tabsElement.tabs[tabIndex]) {
            return;
        }

        const targetTab = tabsElement.tabs[tabIndex];

        if (!tabsElement.currentTab || tabsElement.currentTab.id !== targetTab.id) {
            await tabsElement.changeTab(targetTab);
        }

        try {
            await tabsElement.scrollTo();
        } catch (scrollErr) {}

    } catch (e) {
        console.error('[CRL Tabs] Error in openRequestedTab:', e);
    }
}


