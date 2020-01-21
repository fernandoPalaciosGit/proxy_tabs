import {describe, it, beforeEach, afterEach} from 'mocha';
import {expect} from 'chai';
import sinon from 'sinon'
import {ProxyTabs, ERROR_CONTEXT, ERROR_MESSAGE_WITH_DATA} from '../proxy_tabs';
import {JSDOM} from 'jsdom';
import $ from 'jquery';

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

    afterEach(() => {
        sinon.restore();
    });

    describe('Proxy event instance', () => {
        beforeEach(() => {
            proxy = new ProxyTabs(window, ID);
        });

        it('Should create context with a uniq window named', () => {
            expect(proxy.context.name).to.include(ID);
        });

        it('Should create event reference for binding handling', () => {
            proxy.setProxyEvents(EVENT_HANDLERS);
            expect(proxy.getProxyEvents()).to.be.equals('message.actionEventOne message.actionEventTwo');
        });

        it('Should define event handlers', () => {
            proxy.setProxyEvents(EVENT_HANDLERS);
            const [hookOne, hookTwo] = proxy.proxyEvents;

            expect(hookOne.event).to.be.equals('message.actionEventOne');
            expect(hookOne.handler).to.be.a('function');
            expect(hookTwo.event).to.be.equals('message.actionEventTwo');
            expect(hookTwo.handler).to.be.a('function');
        });

        it('Should bind event handlers', () => {
            sinon.spy(EVENT_HANDLERS, 'actionEventOne');
            proxy.setProxyEvents(EVENT_HANDLERS);
            sinon.stub(proxy, 'validateCommunication').returns(true);
            const [hookOne] = proxy.proxyEvents;
            const message = 'message';

            hookOne.handler(message);
            sinon.assert.calledOnce(EVENT_HANDLERS.actionEventOne);
            sinon.assert.calledWithExactly(EVENT_HANDLERS.actionEventOne, message);
        });
    });

    describe('Should avoid create proxy and throw error', () => {
        it('if context is undefined', () => {
            const getProxy = () => new ProxyTabs({}, ID);
            expect(getProxy).to.throw(ERROR_CONTEXT);
        });

        it('if ID context is undefined', () => {
            const getProxy = () => new ProxyTabs(window);
            expect(getProxy).to.throw(ERROR_CONTEXT);
        });
    });

    describe('bindHandlers: subscribe message type events', () => {
        beforeEach(() => {
            proxy = new ProxyTabs(window, ID);
        });

        it('should unbind message event type', () => {
            sinon.spy($.prototype, 'off');
            proxy.setProxyEvents(EVENT_HANDLERS).bindHandlers();

            sinon.assert.calledOnce($.prototype.off);
            sinon.assert.calledWithExactly($.prototype.off, 'message.actionEventOne message.actionEventTwo');
        });

        it('should bind message event type', () => {
            sinon.spy($.prototype, 'on');
            proxy.setProxyEvents(EVENT_HANDLERS).bindHandlers();
            const [hookOne, hookTwo] = $.prototype.on.args;

            sinon.assert.calledTwice($.prototype.on);
            expect(hookOne[0]).to.be.equals('message.actionEventOne');
            expect(hookOne[1]).to.eql(proxy.proxyEvents[0].handler);
            expect(hookTwo[0]).to.be.equals('message.actionEventTwo');
            expect(hookTwo[1]).to.eql(proxy.proxyEvents[1].handler);
        });
    });

    describe('validateCommunication: Should send validated information', () => {
        let proxyMessage;

        beforeEach(() => {
            proxy = new ProxyTabs(window, ID);
            sinon.spy(EVENT_HANDLERS, 'actionEventOne');
            sinon.spy(proxy, 'validateCommunication');
            proxy.setProxyEvents(EVENT_HANDLERS);
        });

        describe('if valid should launch handler', () => {
            afterEach(() => {
                const [{handler}] = proxy.proxyEvents;
                handler(proxyMessage);

                sinon.assert.calledOnce(EVENT_HANDLERS.actionEventOne);
                sinon.assert.calledWithExactly(EVENT_HANDLERS.actionEventOne, proxyMessage);
            });

            it('on request same origin and data is an string referenced to the subscription event', () => {
                proxyMessage = {
                    originalEvent: {
                        origin: jsdomConfig.url,
                        data: 'actionEventOne',
                    },
                };
            });

            it('on request same origin and data is an object like {event} referenced to the subscription event', () => {
                proxyMessage = {
                    originalEvent: {
                        origin: jsdomConfig.url,
                        data: JSON.stringify({event: 'actionEventOne', test: 123}),
                    },
                };
            });
        });

        describe('if invalid should launch handler', () => {
            afterEach(() => {
                const [{handler}] = proxy.proxyEvents;
                handler(proxyMessage);

                sinon.assert.notCalled(EVENT_HANDLERS.actionEventOne);
            });

            it('on request cross domain origin', () => {
                proxyMessage = {
                    originalEvent: {
                        origin: 'https://google.es',
                        data: 'actionEventOne',
                    },
                };
            });

            it('when has different event reference', () => {
                proxyMessage = {
                    originalEvent: {
                        origin: jsdomConfig.url,
                        data: 'advertisement-event',
                    },
                };
            });

            it('when has different event', () => {
                proxyMessage = {
                    originalEvent: {
                        origin: jsdomConfig.url,
                        data: JSON.stringify({event: 'advertisement-event', test: 123}),
                    },
                };
            });
        });
    });

    describe('closeCrossDomainMessage: remove two-way communication between tabs', () => {
        beforeEach(() => {
            const opener = new JSDOM(
                `<!DOCTYPE html><html lang=""><head><script></script><title></title></head><body><div id="widget"></div></body></html>`,
            );
            sinon.replace(window, 'opener', opener.window);
        });

        it('should remove opener reference', () => {
            ProxyTabs.closeCrossDomainMessage();
            expect(window.opener).to.be.null;
        });

        it('should unbind message communication', () => {
            sinon.spy($.prototype, 'off');

            ProxyTabs.closeCrossDomainMessage();

            sinon.assert.calledOnce($.prototype.off);
            sinon.assert.calledWithExactly($.prototype.off, 'message');
        });
    });

    describe('trigger message: dispatch message events between tabs', () => {
        let proxyMessage;

        beforeEach(() => {
            const opener = new JSDOM(
                `<!DOCTYPE html><html lang=""><head><script></script><title></title></head><body><div id="widget"></div></body></html>`,
            );
            sinon.replace(window, 'opener', {
                parent: opener.window,
                closed: false,
            });
            sinon.spy(window.opener.parent, 'postMessage');
        });

        it('if window.postMessage has compatibility and opener.parent is available', () => {
            proxyMessage = 'actionEventOne';

            ProxyTabs.trigger(proxyMessage);

            sinon.assert.calledOnce(window.opener.parent.postMessage);
            sinon.assert.calledWithExactly(window.opener.parent.postMessage, proxyMessage, jsdomConfig.url);
        });

        it('if data event has {event} propery', () => {
            proxyMessage = {
                event: 'actionEventOne',
                test: 123,
            };

            ProxyTabs.trigger(proxyMessage);

            sinon.assert.calledOnce(window.opener.parent.postMessage);
            sinon.assert.calledWithExactly(window.opener.parent.postMessage, JSON.stringify(proxyMessage), jsdomConfig.url);
        });

        it('Should throw Error if message has no {event} propery', () => {
            proxyMessage = {
                test: 123,
            };

            expect(() => ProxyTabs.trigger(proxyMessage)).to.throw(ERROR_MESSAGE_WITH_DATA);
            sinon.assert.notCalled(window.opener.parent.postMessage);
        });
    });
});
