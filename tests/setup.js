import {JSDOM} from 'jsdom';

const jsdom = new JSDOM(
    `<!DOCTYPE html><html lang=""><head><script></script><title></title></head><body><div id="widget"></div></body></html>`,
    {
        url: 'https://odigeo.org',
        referrer: 'https://odigeo.com',
        contentType: 'text/html',
        includeNodeLocations: true,
        storageQuota: 10000000,
    },
);
global.navigator = {
    userAgent: 'node.js',
};
global.document = jsdom.window.document;
global.window = global.self = jsdom.window;
