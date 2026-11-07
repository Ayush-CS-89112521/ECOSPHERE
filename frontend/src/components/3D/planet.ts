import gsap from "gsap";

import earthVertex from "./shaders/earth/vertex.glsl";
import earthFragment from "./shaders/earth/fragment.glsl";
import atmosphereVertex from "./shaders/atmosphere/vertex.glsl"
import atmosphereFragment from "./shaders/atmosphere/fragment.glsl"


import * as THREE from "three";

export interface PlanetInstance {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  earthGroup: THREE.Group;
  camera: THREE.PerspectiveCamera;
  destroy: () => void;
}

const initPlanet = (canvasSelector: string = "canvas.planet-3D"): PlanetInstance => {
  const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;

  if (!canvas) {
    throw new Error(`Canvas with selector "${canvasSelector}" not found`);
  }

  // scene
  const scene = new THREE.Scene();

  // camera
  const size = {
    width: canvas.parentElement?.clientWidth || 1,
    height: canvas.parentElement?.clientHeight || 1,
    pixelRation: window.devicePixelRatio,
  };

  const camera = new THREE.PerspectiveCamera(
    15,
    size.width / size.height,
    0.1,
    10000,
  );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 20;
  scene.add(camera);

  // renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(size.width, size.height, false);
  renderer.setPixelRatio(size.pixelRation);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // texture
  const TL = new THREE.TextureLoader();
  const dayTexture = TL.load("/earth/day.jpg");
  const nightTexture = TL.load("/earth/night.jpg");
  const specularCloudsTexture = TL.load("/earth/specularClouds.jpg");

  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;

  const baseAnisotropy = renderer.capabilities.getMaxAnisotropy();

  dayTexture.anisotropy = baseAnisotropy;
  specularCloudsTexture.anisotropy = baseAnisotropy;
  nightTexture.anisotropy = baseAnisotropy;

  // geometry
  const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
  const atmosphereGeometry = new THREE.SphereGeometry(2, 64, 64);

  const atmosphereDayColor = "#4a96e8";
  const atmosphereTwilightColor = "#1950E5";
  // material
  const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertex,
    fragmentShader: earthFragment,
    uniforms: {
      uDayTexture: new THREE.Uniform(dayTexture),
      uNightTexture: new THREE.Uniform(nightTexture),
      uSpecularCloudsTexture: new THREE.Uniform(specularCloudsTexture),
      uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
      uAtmosphereDayColor: new THREE.Uniform(
        new THREE.Color(atmosphereDayColor),
      ),
      uAtmosphereTwilightColor: new THREE.Uniform(
        new THREE.Color(atmosphereTwilightColor),
      ),
    },
    transparent: true,
  });

  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    uniforms: {
      uOpacity: { value: 1 },
      uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
      uAtmosphereDayColor: new THREE.Uniform(
        new THREE.Color(atmosphereDayColor),
      ),
      uAtmosphereTwilightColor: new THREE.Uniform(
        new THREE.Color(atmosphereTwilightColor),
      ),
    },
    depthWrite: false,
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  atmosphere.scale.set(1.13, 1.13, 1.13);

  const earthGroup = new THREE.Group().add(earth, atmosphere)

  let sunSpherical = new THREE.Spherical(1, Math.PI * 0.48, -1.8);
  const sunDirection = new THREE.Vector3();

  sunDirection.setFromSpherical(sunSpherical);

  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);

  scene.add(earthGroup);


  // animation loop
  const tickerCallback = (time: number) => {
    earth.rotation.y = time * 0.2;
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tickerCallback);

  gsap.ticker.lagSmoothing(0);

  const handleResize = () => {
    size.width = canvas.parentElement?.clientWidth || 1;
    size.height = canvas.parentElement?.clientHeight || 1;
    size.pixelRation = window.devicePixelRatio;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height, false);
    renderer.setPixelRatio(size.pixelRation);
  };
  window.addEventListener("resize", handleResize);
  const resizeObserver = new ResizeObserver(handleResize);
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

  // WebGL context loss handler
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    gsap.ticker.remove(tickerCallback);
  };
  canvas.addEventListener("webglcontextlost", handleContextLost, false);
  const handleContextRestored = () => gsap.ticker.add(tickerCallback);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);

  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    gsap.ticker.remove(tickerCallback);
    window.removeEventListener("resize", handleResize);
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    earthGeometry.dispose();
    atmosphereGeometry.dispose();
    earthMaterial.dispose();
    atmosphereMaterial.dispose();
    dayTexture.dispose();
    nightTexture.dispose();
    specularCloudsTexture.dispose();
    renderer.dispose();
    if (typeof renderer.forceContextLoss === "function") {
      renderer.forceContextLoss();
    }
  };

  return { scene, renderer, earthGroup, camera, destroy };
};

export default initPlanet;
