import ProxyTabs from 'proxy_tabs';

document.getElementById('trigger_tab_counter').addEventListener('click', () => {
    ProxyTabs.postMessage('childTabCounter');
});

window.onerror = (msg, fileName, lineNumber, column, error) => {
    ProxyTabs.postMessage({
        event: 'childTabThrowsError',
        error,
    });
};
