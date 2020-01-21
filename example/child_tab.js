import ProxyTabs from 'proxy_tabs';

document.getElementById('trigger_tab_counter').addEventListener('click', () => {
    ProxyTabs.trigger('childTabCounter');
});

window.onerror = (msg, fileName, lineNumber, column, error) => {
    ProxyTabs.trigger({
        event: 'childTabThrowsError',
        error,
    });
};
