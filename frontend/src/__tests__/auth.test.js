import ts from 'typescript';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../components/auth/AuthGuard.jsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, allowJs: true } }).outputText;
const loadedModule = { exports: {} };
const require = name => name === 'react/jsx-runtime' ? runtime : name === 'react' ? React : name.includes('ClerkSafeProvider') ? { useClerkStatus: () => ({ isConfigured: false }) } : {};
new Function('require', 'module', 'exports', compiled)(require, loadedModule, loadedModule.exports);
const AuthGuard = loadedModule.exports.default;
test('guest mode cannot display an authentication-required child', () => {
  const html = renderToStaticMarkup(React.createElement(AuthGuard, { requireAuth: true }, 'Private feature'));
  expect(html).toContain('Authentication is unavailable');
  expect(html).not.toContain('Private feature');
});
test('public pages still work with Clerk unavailable', () => {
  expect(renderToStaticMarkup(React.createElement(AuthGuard, { requireAuth: false }, 'Public page'))).toContain('Public page');
});
