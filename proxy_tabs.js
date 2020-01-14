import $ from 'jquery';

const COMMUNICATE_TABS = 'message';
const ERROR_CONTEXT = 'Proxy Tabs should have window context and ID to be named';
const ERROR_MESSAGE_WITH_DATA = 'postMessage triggered with data should have {event} property';
const getJsonParsed = (data) => {
    try {
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

class ProxyTabs {
    constructor(context, idContext) {
        if (!context || !idContext) throw new Error(ERROR_CONTEXT);
        this.context = context;
        this.proxyEvents = [];
        this.activateCrossDomainMessage(idContext);
    }

    activateCrossDomainMessage(idContext) {
        this.context.name = `${idContext}${+new Date()}`;
    }

    validateCommunication({data, origin}, event) {
        const parsedData = getJsonParsed(data);

        return origin === window.location.origin && (data === event || parsedData.event === event);
    }

    setProxyEvents(handlerEvents = {}) {
        for (const [event, handler] of Object.entries(handlerEvents)) {
            this.proxyEvents.push({
                event: `${COMMUNICATE_TABS}.${event}`,
                handler: (message) => {
                    if (this.validateCommunication(message.originalEvent, event)) {
                        handler(message);
                    }
                },
            });
        }
        return this;
    }

    getProxyEvents() {
        return this.proxyEvents.map(({event}) => event).join(' ');
    }

    bindHandlers() {
        $(this.context).off(this.getProxyEvents());
        this.proxyEvents.map(({event, handler}) => $(this.context).on(event, handler));
    }

    static hasOpenedParentWindow() {
        return _.get(window, 'opener.parent') && !window.opener.closed;
    }

    static closeCrossDomainMessage() {
        window.opener = null;
        $(window).off(COMMUNICATE_TABS);
    }

    /*
   * @param {string} data - 'event_name' (to subscribe handlers in a new ProxyTabs())
   * @param {object} data - {event: 'event_name', ...data_to_send_to_other_window}
   */
    static postMessage(data) {
        if (window.postMessage && ProxyTabs.hasOpenedParentWindow()) {
            if (_.isObject(data) && !data.event) throw new Error(ERROR_MESSAGE_WITH_DATA);
            if (_.isObject(data)) data = JSON.stringify(data);
            window.opener.parent.postMessage(data, window.location.origin);
        }
    }
}

module.exports = ProxyTabs;
