// 產業地圖共用 3D 拆解引擎（無人機 / 機器人）。
// 幾何由各地圖的 *-model.js 提供（build(ctx)），本檔負責 renderer、分層展開 / 組裝、
// 抽層動畫、浮動標籤與射線點選 — 事件協定與 AI / LEO 地圖相同：
//   window.selectChipLayer(i) ←→ CustomEvent('chip-layer-select')
import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

export const colors = {
  dark: 0x333a4b, slate: 0x454e69, steel: 0x788da6, sky: 0x96b6cd, mist: 0xb0c8cf,
  lilac: 0xa6a0c7, gold: 0xe6b36b, copper: 0xe39770, teal: 0x6f9e91, pcb: 0x608577,
  cream: 0xf2e5c7, cell: 0x4f5f8c, carbon: 0x2c3140, safety: 0xd9833b,
};

export function initModel(spec) {
  const mount = document.querySelector('#chip-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    mount.innerHTML = '<div class="model-error">此瀏覽器無法顯示 3D 模型。請開啟硬體加速，或使用支援 WebGL 的瀏覽器。<br>技術說明與股票代碼仍可由左側選單查看。</div>';
    throw error;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', spec.ariaLabel);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-7, 7, 7, -7, 0.1, 100);
  const camPos = spec.cameraPos ?? [11, 10, 14];
  const camTarget = spec.cameraTarget ?? [0, 2, 0];
  camera.position.set(...camPos);
  camera.lookAt(...camTarget);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...camTarget);
  controls.enableDamping = !reduced;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.3;
  controls.minAzimuthAngle = -0.15;
  controls.maxAzimuthAngle = 1.4;

  scene.add(new THREE.HemisphereLight(0xfff8ee, 0x79749a, 2.5));
  const sun = new THREE.DirectionalLight(0xffedda, 3.2);
  sun.position.set(-5, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -11; sun.shadow.camera.right = 11;
  sun.shadow.camera.top = 11; sun.shadow.camera.bottom = -11;
  sun.shadow.normalBias = 0.05;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc9d5ff, 1.4);
  fill.position.set(6, 4, -5);
  scene.add(fill);

  const gradient = new THREE.DataTexture(new Uint8Array([85, 140, 210, 255]), 4, 1, THREE.RedFormat);
  gradient.needsUpdate = true;
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;

  const root = new THREE.Group();
  scene.add(root);
  const groups = Array.from({ length: 6 }, (_, i) => {
    const g = new THREE.Group();
    g.userData.layer = i;
    root.add(g);
    return g;
  });

  function mat(color) { return new THREE.MeshToonMaterial({ color, gradientMap: gradient }); }
  function edges(g, geo, mesh, angle = 1) {
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, angle),
      new THREE.LineBasicMaterial({ color: 0x30384e, transparent: true, opacity: 0.62 }),
    );
    edge.position.copy(mesh.position);
    edge.rotation.copy(mesh.rotation);
    g.add(edge);
  }
  function box(g, w, h, d, x, y, z, color, outline = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    if (outline) edges(g, geo, mesh);
    return mesh;
  }
  function cyl(g, rTop, rBottom, h, x, y, z, color, { axis = 'y', seg = 18, outline = true, tilt = 0 } = {}) {
    const geo = new THREE.CylinderGeometry(rTop, rBottom, h, seg);
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.position.set(x, y, z);
    if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    if (tilt) mesh.rotation.x += tilt;
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    if (outline) edges(g, geo, mesh, 30);
    return mesh;
  }
  function ring(g, r, tube, x, y, z, color, axis = 'y') {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 24), mat(color));
    if (axis === 'y') mesh.rotation.x = Math.PI / 2;
    if (axis === 'x') mesh.rotation.y = Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    g.add(mesh);
    return mesh;
  }
  function line(g, points, color = colors.gold, width = 0.025) {
    const path = new THREE.CurvePath();
    for (let i = 1; i < points.length; i++)
      path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i - 1]), new THREE.Vector3(...points[i])));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(2, points.length * 2), width, 5, false), mat(color));
    g.add(mesh);
    return mesh;
  }
  function instances(g, geo, positions, color) {
    const m = new THREE.InstancedMesh(geo, mat(color), positions.length);
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => { dummy.position.set(...p); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    return m;
  }
  function grid(nx, nz, sx, sz, y, cx = 0, cz = 0) {
    const out = [];
    for (let a = 0; a < nx; a++)
      for (let b = 0; b < nz; b++) out.push([cx + (a - (nx - 1) / 2) * sx, y, cz + (b - (nz - 1) / 2) * sz]);
    return out;
  }

  // 幾何由各地圖提供
  spec.build({ THREE, groups, colors, mat, edges, box, cyl, ring, line, instances, grid });
  groups.forEach((g) => g.traverse((o) => { if (o.isMesh) o.userData.layer = g.userData.layer; }));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = spec.groundY ?? -0.7;
  ground.receiveShadow = true;
  scene.add(ground);
  const guide = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineDashedMaterial({ color: 0xc2a27f, dashSize: 0.12, gapSize: 0.09, transparent: true, opacity: 0.55 }),
  );
  scene.add(guide);

  const { expandedY, assembledY, layerNames, labelsData } = spec;
  let active = -1, mode = 'expanded', solo = false, started = performance.now(), packed = 0;
  const selectedGoal = new THREE.Vector3();
  const state = groups.map((g, i) => ({
    position: new THREE.Vector3(0, expandedY[i], 0),
    from: new THREE.Vector3(0, expandedY[i], 0),
    to: new THREE.Vector3(0, expandedY[i], 0),
    fromYaw: 0, toYaw: 0, fromScale: 1, toScale: 1, opacity: 1, targetOpacity: 1,
  }));
  groups.forEach((g, i) => g.position.copy(state[i].position));

  const label = document.querySelector('#part-label'), labels = document.querySelector('#model-labels');
  labelsData.forEach(({ i }) => {
    const b = document.createElement('button');
    b.className = 'model-label';
    b.dataset.part = i;
    b.innerHTML = `<span>0${i + 1}</span><b>${layerNames[i]}</b>`;
    b.setAttribute('aria-label', '抽出' + layerNames[i]);
    b.onclick = () => window.selectChipLayer(i);
    labels.append(b);
  });

  function setTargets() {
    const y = mode === 'assembled' ? assembledY : expandedY;
    const narrow = mount.clientWidth < 480;
    const right = new THREE.Vector3().subVectors(camera.position, controls.target).cross(camera.up).normalize().negate();
    selectedGoal.copy(right).multiplyScalar(solo ? 0 : narrow ? 1.8 : 4.1);
    selectedGoal.y = solo ? 2.2 : narrow ? 3.7 : 2.2;
    groups.forEach((g, i) => {
      const s = state[i];
      s.from.copy(g.position);
      s.fromYaw = g.rotation.y;
      s.fromScale = g.scale.x;
      s.to.copy(right).multiplyScalar(active >= 0 ? (narrow ? -1.4 : -1.7) : 0);
      s.to.y = active >= 0 && narrow ? y[i] * 0.7 - 0.5 : y[i];
      s.toScale = active < 0 ? 1 : narrow ? 0.68 : 1;
      if (i === active) {
        s.to.copy(selectedGoal);
        s.toScale = solo ? (narrow ? 1.05 : 1.5) : narrow ? 0.85 : 1;
      }
      s.toYaw = i === active ? -0.22 : 0;
      s.targetOpacity = active < 0 || i === active ? 1 : 0.22;
      g.visible = !(solo && active >= 0 && i !== active);
    });
    started = performance.now();
    guide.visible = active >= 0 && !solo;
    label.classList.toggle('visible', active >= 0);
    mount.dataset.state = active < 0 ? mode : 'extracted';
    mount.dataset.activeLayer = String(active);
    mount.dataset.solo = String(solo);
    document.querySelectorAll('.model-label').forEach((b) => {
      b.classList.toggle('chosen', Number(b.dataset.part) === active);
      b.tabIndex = active < 0 ? 0 : -1;
    });
    document.querySelector('#solo').disabled = active < 0;
    document.querySelector('#solo').setAttribute('aria-pressed', solo);
    document.querySelectorAll('[data-mode]').forEach((b) => {
      const on = active < 0 && b.dataset.mode === mode;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', on);
    });
  }
  window.addEventListener('chip-layer-select', (e) => { active = e.detail; solo = false; setTargets(); });
  for (const b of document.querySelectorAll('[data-mode]'))
    b.onclick = () => {
      active = -1;
      mode = b.dataset.mode;
      solo = false;
      setTargets();
      document.querySelector('#selection-caption').textContent =
        mode === 'expanded' ? '展開全貌 · 點選任一層抽出' : '完整組裝 · 點選任一層抽出';
    };
  document.querySelector('#solo').onclick = () => { if (active < 0) return; solo = !solo; setTargets(); };
  document.querySelector('#reset-view').onclick = () => {
    camera.position.set(...camPos);
    controls.target.set(...camTarget);
    controls.update();
    setTargets();
  };

  let pointerDown;
  renderer.domElement.addEventListener('pointerdown', (e) => (pointerDown = { x: e.clientX, y: e.clientY }));
  const ray = new THREE.Raycaster();
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!pointerDown || Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) > 5) return;
    const rect = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(
      new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, (-(e.clientY - rect.top) / rect.height) * 2 + 1),
      camera,
    );
    const hit = ray
      .intersectObjects(groups, true)
      .find((h) => h.object.userData.layer !== undefined && h.object.visible && h.object.parent.visible);
    if (hit) window.selectChipLayer(hit.object.userData.layer);
  });

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight, aspect = w / h;
    const half = spec.frameHalf ?? 6.1;
    camera.left = -half * aspect; camera.right = half * aspect;
    camera.top = half; camera.bottom = -half;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  new ResizeObserver(() => { resize(); setTargets(); }).observe(mount);
  resize();
  setTargets();

  const temp = new THREE.Vector3(), anchor = new THREE.Vector3();
  function project(v) {
    temp.copy(v).project(camera);
    return { x: (temp.x * 0.5 + 0.5) * mount.clientWidth, y: (-0.5 * temp.y + 0.5) * mount.clientHeight };
  }
  let last = performance.now(), visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(mount);
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible) return;
    controls.update();
    const goalZoom = active < 0 ? (mount.clientWidth < 480 ? 1.25 : 1.65) : solo ? 1.16 : mount.clientWidth < 480 ? 1 : 1.15;
    camera.zoom = reduced ? goalZoom : THREE.MathUtils.damp(camera.zoom, goalZoom, 6, dt);
    camera.updateProjectionMatrix();
    const t = reduced ? 1 : Math.min((now - started) / 1050, 1), ease = 1 - Math.pow(1 - t, 4);
    groups.forEach((g, i) => {
      const s = state[i];
      g.position.lerpVectors(s.from, s.to, ease);
      if (active === i && t < 1 && !reduced) g.position.y += Math.sin(t * Math.PI) * 0.85;
      g.rotation.y = THREE.MathUtils.lerp(s.fromYaw, s.toYaw, ease);
      g.scale.setScalar(THREE.MathUtils.lerp(s.fromScale, s.toScale, ease));
      s.opacity = reduced ? s.targetOpacity : THREE.MathUtils.damp(s.opacity, s.targetOpacity, 7, dt);
      g.traverse((o) => {
        if (o.isMesh) {
          o.material.transparent = s.opacity < 0.99;
          o.material.opacity = s.opacity;
          o.material.depthWrite = s.opacity > 0.9;
        }
        if (o.isLineSegments) o.material.opacity = 0.55 * s.opacity;
      });
    });
    packed = reduced ? +(mode === 'assembled') : THREE.MathUtils.damp(packed, +(mode === 'assembled'), 6, dt);
    labelsData.forEach(({ i, point, packed: alt }) => {
      const b = labels.querySelector(`[data-part="${i}"]`);
      temp.set(...point);
      if (alt) temp.lerp(anchor.set(...alt), packed);
      groups[i].localToWorld(temp);
      const p = project(temp);
      b.style.transform = `translate(${Math.min(p.x, mount.clientWidth - b.offsetWidth - 4)}px,${p.y}px)`;
      b.style.opacity = active < 0 ? 1 : 0;
      b.style.pointerEvents = active < 0 ? 'auto' : 'none';
    });
    if (active >= 0) {
      temp.copy(groups[active].position);
      const p = project(temp);
      label.style.left = p.x + 'px';
      label.style.top = p.y + (mount.clientWidth < 480 ? 65 : 90) + 'px';
      const s = groups[active].position;
      guide.geometry.setFromPoints([new THREE.Vector3(-1.3, expandedY[active], 0.7), s]);
      guide.computeLineDistances();
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  mount.dataset.ready = 'true';
}
