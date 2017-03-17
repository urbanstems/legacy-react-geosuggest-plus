import jsdom from 'jsdom';
import createGoogleStub from './mocks/google';

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = window.navigator;
global.window.google = createGoogleStub();
