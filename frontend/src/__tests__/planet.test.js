import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as THREE from 'three';

test('planet renders to its container and cleans up/restores each mounted instance', () => {
  const callbacks = new Set();
  const ticker = { add: fn => callbacks.add(fn), remove: fn => callbacks.delete(fn), lagSmoothing() {} };
  const renderer = { setSize: jest.fn(), setPixelRatio() {}, setClearColor() {}, capabilities: { getMaxAnisotropy: () => 1 }, render: jest.fn(), dispose: jest.fn(), forceContextLoss: jest.fn() };
  const textures = [];
  const load = jest.fn(path => { const texture = new THREE.Texture(); texture.dispose = jest.fn(); textures.push({ path, texture }); return texture; });
  const listeners = new Map();
  const windowListeners = new Set();
  const canvas = { parentElement: { clientWidth: 400, clientHeight: 320 }, addEventListener: (n, fn) => listeners.set(n, fn), removeEventListener: n => listeners.delete(n) };
  const disconnect = jest.fn();
  const original = { window: globalThis.window, document: globalThis.document, ResizeObserver: globalThis.ResizeObserver };
  Object.assign(globalThis, {
    window: { devicePixelRatio: 1, addEventListener: (_, fn) => windowListeners.add(fn), removeEventListener: (_, fn) => windowListeners.delete(fn) },
    document: { querySelector: () => canvas }, ResizeObserver: class { observe() {} disconnect = disconnect; },
  });
  try {
    const source = readFileSync(new URL('../components/3D/planet.ts', import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
    const loadedModule = { exports: {} };
    const require = name => name === 'gsap' ? { ticker } : name === 'three' ? { ...THREE, WebGLRenderer: function() { return renderer; }, TextureLoader: function() { return { load }; } } : 'void main() {}';
    new Function('require', 'module', 'exports', compiled)(require, loadedModule, loadedModule.exports);
    for (let i = 0; i < 3; i++) {
      const planet = loadedModule.exports.default();
      expect(renderer.setSize).toHaveBeenLastCalledWith(400, 320, false);
      expect(callbacks.size).toBe(1);
      [...callbacks][0](1);
      expect(renderer.render).toHaveBeenCalled();
      const event = { preventDefault: jest.fn() };
      listeners.get('webglcontextlost')(event);
      expect(callbacks.size).toBe(0);
      listeners.get('webglcontextrestored')();
      expect(callbacks.size).toBe(1);
      planet.destroy(); planet.destroy();
      expect(callbacks.size).toBe(0);
      expect(windowListeners.size).toBe(0);
      expect(listeners.size).toBe(0);
    }
    expect(renderer.dispose).toHaveBeenCalledTimes(3);
    expect(disconnect).toHaveBeenCalledTimes(3);
    for (const { path, texture } of textures) {
      expect(path).toMatch(/^\/earth\//);
      expect(texture.dispose).toHaveBeenCalledTimes(1);
    }
  } finally { Object.assign(globalThis, original); }
});
