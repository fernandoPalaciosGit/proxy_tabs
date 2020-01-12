const EVENT_HANDLER = {
    'childTab': ({originalEvent = {}}) => {
        const {tabCount, tabName} = originalEvent.source;

        if (_.isNumber(tabCount) && _.isString(tabName)) {
            console.info(`Another tab has opened: ${{tabCount, tabName}.toString()}`);
        }
    },
    'childTabThrowsError': ({originalEvent = {}}) => {
        const {error} = originalEvent.source;

        if (!!error) {
            console.error(`Some errors happens in the actual tab: ${error.toString()}`);
        }
    },
};

module.exports = (idContext) => {
    const proxyTabs = new ProxyTabs(window, idContext);

    proxyTabs.setProxyEvents(EVENT_HANDLER).bindHandlers();
};
