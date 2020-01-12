import ProxyTabs from "proxy_tabs";

const WINDOW_CONTEXT_NAME = 'My-app';
const TAB_CONTEXT_NAME = 'My-second-app';
const proxyTabs = new ProxyTabs(window, WINDOW_CONTEXT_NAME);
const EVENT_HANDLER = {
    'childTabCounter': ({originalEvent = {}}) => {
        const {tabCount, tabName} = originalEvent.source;

        if (_.isNumber(tabCount) && _.isString(tabName)) {
            console.info(`Another tab has opened: ${{tabCount, tabName}.toString()}`);
        }
    },
    'childTabThrowsError': ({originalEvent = {}}) => {
        const {error} = originalEvent.data;

        if (!!error) {
            console.error(`Some errors happens in the actual tab: ${error.toString()}`);
        }
    },
};


// create proxy handlers to open communication with tabs
proxyTabs.setProxyEvents(EVENT_HANDLER).bindHandlers();
// create new tab context
const childTab = window.open('URL', TAB_CONTEXT_NAME);
// add metadata to the new tab to have some data reference to parent tab
Object.assign(childTab, {
    tabCount: 1,
    tabName: TAB_CONTEXT_NAME,
});
