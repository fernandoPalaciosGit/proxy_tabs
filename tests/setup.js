import {JSDOM} from 'jsdom';

const jsdomConfig = {
    url: 'https://odigeo.org',
    referrer: 'https://odigeo.com',
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000,
};
const jsdom = new JSDOM(
    `<!DOCTYPE html><html lang=""><head><script></script><title></title></head><body><div id="widget"></div></body></html>`,
    jsdomConfig,
);
jsdom.window.opener = {};
global.jsdomConfig = jsdomConfig;
global.navigator = {
    userAgent: 'node.js',
};
global.Window = jsdom.window.constructor;
global.window = jsdom.window;
global.document = jsdom.window.document;
