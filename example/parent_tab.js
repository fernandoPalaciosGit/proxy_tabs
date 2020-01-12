import bindTabEvents from './multitab_events';

const WINDOW_CONTEXT_NAME = 'My-app';
const TAB_CONTEXT_NAME = 'My-second-app';

// create proxy handlers to open communication with tabs
bindTabEvents(WINDOW_CONTEXT_NAME);
// create new tab context
const childTab = window.open('URL', TAB_CONTEXT_NAME);
// add metadata to the new tab to have some data reference to parent tab
Object.assign(childTab, {
    tabCount: 1,
    tabName: TAB_CONTEXT_NAME,
});
