import { jest } from '@jest/globals';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { transformApiResponse } from '../lib/dashboard-data.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const source = readFileSync(new URL('../components/dashboard/Dashboard.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
const loadedModule = { exports: {} };
const require = name => name === 'react' ? React : name.includes('dashboard-data') ? { transformApiResponse } : () => React.createElement('div', null, 'Globe');
new Function('require', 'module', 'exports', compiled)(require, loadedModule, loadedModule.exports);
const Dashboard = loadedModule.exports.default;
let tree;
const originalFetch = globalThis.fetch;
afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
  tree = null;
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});
const mount = async () => { await act(async () => { tree = TestRenderer.create(React.createElement(Dashboard)); }); };
const textContent = node => typeof node === 'string' ? node : Array.isArray(node) ? node.map(textContent).join(' ') : node?.children ? textContent(node.children) : '';
const rendered = () => textContent(tree.toJSON());
const response = data => ({ ok: true, json: async () => data });
const snapshot = { meta: { source: 'fallback', isLive: false }, city: { aqi: 320, pm25: 145 }, stations: [] };
test('initial state contains no invented readings; unmount aborts request', async () => {
  let signal;
  globalThis.fetch = jest.fn((_, options) => { signal = options.signal; return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))); });
  await mount();
  expect(rendered()).toContain('No current observations.');
  expect(rendered()).not.toContain('418');
  await act(async () => tree.unmount()); tree = null;
  expect(signal.aborted).toBe(true);
});
test('fallback HTTP success renders synthetic disclosure and never live badge', async () => {
  globalThis.fetch = jest.fn(async () => response(snapshot));
  await mount();
  expect(rendered()).toContain('Synthetic reference');
  expect(rendered()).not.toContain('Ground Node Live');
  expect(globalThis.fetch).toHaveBeenCalledWith('/api/delhi/air-quality', expect.anything());
});
test('malformed response displays dismissible error and no substitute measurements', async () => {
  globalThis.fetch = jest.fn(async () => response(null));
  await mount();
  expect(rendered()).toContain('Telemetry unavailable');
  await act(async () => tree.root.findByProps({ children: 'Dismiss' }).props.onClick());
  expect(rendered()).not.toContain('Telemetry unavailable');
});
test('a request timeout clears loading and reports unavailable', async () => {
  jest.useFakeTimers();
  globalThis.fetch = jest.fn((_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason))));
  await mount();
  await act(async () => { await jest.advanceTimersByTimeAsync(12001); });
  expect(rendered()).toContain('Telemetry unavailable');
  expect(tree.root.findByProps({ title: 'Refresh telemetry' }).props.disabled).toBe(false);
});
test('late completion of a cancelled request cannot overwrite a newer refresh', async () => {
  let resolveOld;
  globalThis.fetch = jest.fn().mockImplementationOnce(async () => ({ ok: true, json: () => new Promise(resolve => { resolveOld = resolve; }) })).mockResolvedValueOnce(response(snapshot));
  await mount();
  await act(async () => tree.root.findByProps({ title: 'Refresh telemetry' }).props.onClick());
  await act(async () => resolveOld({ ...snapshot, meta: { source: 'openaq', isLive: true, stale: false }, city: { aqi: 99 } }));
  expect(rendered()).toContain('Synthetic reference');
  expect(rendered()).not.toContain('Ground Node Live');
});
