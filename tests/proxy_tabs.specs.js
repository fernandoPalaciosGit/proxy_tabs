import {describe, it, beforeEach} from 'mocha';
import ProxyTabs from '../proxy_tabs';

const actionEventOne = () => {
};
const actionEventTwo = () => {
};
const EVENT_HANDLERS = {
    actionEventOne: actionEventOne,
    actionEventTwo: actionEventTwo,
};
const ID = 'MY_PAGE';

describe('Test Proxy communication between window contexts', () => {
    let proxy;

    beforeEach(() => {
        proxy = new ProxyTabs(window, ID);
    });

    it('Should create context with a uniq window named', () => {
        // compare two contexts names
    });

    describe('Should avoid create proxy and throw error', () => {
        it('if context is undefined', () => {
        });

        it('if ID context is undefined', () => {
        });
    });

    describe('getProxyEvents: returns the event reference for binding handling', () => {
    });

    describe('setProxyEvents: set event handlers', () => {
    });

    describe('bindHandlers: subscribe message type events', () => {
    });

    describe('validateCommunication: send validated information', () => {
    });

    describe('closeCrossDomainMessage: remove two-way communication between tabs', () => {
    });

    describe('postMessage: dispatch message events between tabs', () => {
    });
});
