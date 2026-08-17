import wixLocationFrontend from 'wix-location-frontend';

const TAB_INDEXES = {
    'about-crl': 0,
    'benefits-of-crl': 1,
    'train-and-bus': 2,
    'walk-bike': 3,
    'plan-your-trip': 4
};

const SCROLL_BUTTONS = [
    {
        button: '#trainButton',
        target: '#trainTarget'
    },
    {
        button: '#traintobusButton',
        target: '#traintobusTarget'
    },
    {
        button: '#TeWaihorotiuStationWalkButton',
        target: '#TeWaihorotiuStationWalkTarget'
    },
    {
        button: '#TeWaihorotiuStationScootButton',
        target: '#TeWaihorotiuStationScootTarget'
    },
    {
        button: '#TeWaihorotiuStationCycleButton',
        target: '#TeWaihorotiuStationCycleTarget'
    },
    {
        button: '#WaitemataWalkButton',
        target: '#WaitemataWalkTarget'
    },
    {
        button: '#WaitemataCycleButton',
        target: '#WaitemataCycleTarget'
    },
    {
        button: '#WaitemataScootButton',
        target: '#WaitemataScootTarget'
    }
];

$w.onReady(async function () {

    const tabsElement = $w('#pageTabs');

    async function openRequestedTab() {

        const requestedTab = wixLocationFrontend.query.tab;
        const tabIndex = TAB_INDEXES[requestedTab];

        if (
            tabIndex === undefined ||
            !tabsElement.tabs[tabIndex]
        ) {
            return;
        }

        const targetTab = tabsElement.tabs[tabIndex];

        if (tabsElement.currentTab.id !== targetTab.id) {
            await tabsElement.changeTab(targetTab);
        }

        await tabsElement.scrollTo();
    }

    // Open the tab requested in the page URL.
    await openRequestedTab();

    // Respond when the URL changes while the visitor
    // is already on this page.
    wixLocationFrontend.onChange(async function () {
        await openRequestedTab();
    });

    // Connect each station button to its target element.
    SCROLL_BUTTONS.forEach(function (item) {

        $w(item.button).onClick(async function () {
            await $w(item.target).scrollTo();
        });

    });

});