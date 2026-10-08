import * as THREE from '../industry-atlas/vendor/three.module.js';
import { OrbitControls } from '../industry-atlas/vendor/OrbitControls.js';

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
renderer.domElement.setAttribute('aria-label', '可旋轉與拆解的低軌通訊衛星 3D 模型');

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-7, 7, 7, -7, 0.1, 100);
camera.position.set(11, 10, 14);
camera.lookAt(0, 2, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
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
sun.shadow.camera.left = -11;
sun.shadow.camera.right = 11;
sun.shadow.camera.top = 11;
sun.shadow.camera.bottom = -11;
sun.shadow.normalBias = 0.05;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc9d5ff, 1.4);
fill.position.set(6, 4, -5);
scene.add(fill);

const colors = {
  dark: 0x333a4b,
  slate: 0x454e69,
  steel: 0x788da6,
  sky: 0x96b6cd,
  mist: 0xb0c8cf,
  lilac: 0xa6a0c7,
  gold: 0xe6b36b,
  copper: 0xe39770,
  teal: 0x6f9e91,
  pcb: 0x608577,
  cream: 0xf2e5c7,
  cell: 0x4f5f8c,
};

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
const materials = [];
function mat(color) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: gradient });
  materials.push(m);
  return m;
}
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
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  if (outline) edges(g, geo, mesh);
  return mesh;
}
// Cylinder along Y by default; `axis` 'x' or 'z' lays it on its side.
function cyl(g, rTop, rBottom, h, x, y, z, color, { axis = 'y', seg = 18, outline = true, tilt = 0 } = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, seg);
  const mesh = new THREE.Mesh(geo, mat(color));
  mesh.position.set(x, y, z);
  if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  if (tilt) mesh.rotation.x += tilt;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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
// Repeated small parts (antenna tiles, solar cells, battery cells) as one instanced mesh.
function instances(g, geo, positions, color) {
  const m = new THREE.InstancedMesh(geo, mat(color), positions.length);
  const dummy = new THREE.Object3D();
  positions.forEach((p, i) => {
    dummy.position.set(...p);
    dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix);
  });
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function grid(nx, nz, sx, sz, y, cx = 0, cz = 0) {
  const out = [];
  for (let a = 0; a < nx; a++)
    for (let b = 0; b < nz; b++) out.push([cx + (a - (nx - 1) / 2) * sx, y, cz + (b - (nz - 1) / 2) * sz]);
  return out;
}

// Simplified flat-panel LEO broadband satellite (Starlink V2 mini / OneWeb class).
// The model is shown Earth-side up: the nadir-facing phased array sits on top of the
// stack so its tile grid faces the viewer. Proportions are exaggerated for teaching.
// Bus envelope: x ±1.5, z ±1.0. Every layer is built from local y = 0 upwards.
const BUS_W = 3.0, BUS_D = 2.0;

// 0 — Phased array antenna: dark backplane, grid of radiating tiles with patch elements,
// split into four sub-arrays by cream frame ribs.
const antenna = groups[0];
box(antenna, BUS_W + 0.1, 0.08, BUS_D + 0.1, 0, 0.04, 0, colors.dark);
box(antenna, BUS_W + 0.1, 0.05, 0.08, 0, 0.105, -BUS_D / 2 - 0.01, colors.cream);
box(antenna, BUS_W + 0.1, 0.05, 0.08, 0, 0.105, BUS_D / 2 + 0.01, colors.cream);
box(antenna, 0.08, 0.05, BUS_D + 0.1, -BUS_W / 2 - 0.01, 0.105, 0, colors.cream);
box(antenna, 0.08, 0.05, BUS_D + 0.1, BUS_W / 2 + 0.01, 0.105, 0, colors.cream);
box(antenna, 0.06, 0.05, BUS_D - 0.05, 0, 0.105, 0, colors.cream, false);
box(antenna, BUS_W - 0.05, 0.05, 0.06, 0, 0.105, 0, colors.cream, false);
{
  const tiles = [], patches = [];
  for (const qx of [-0.75, 0.75])
    for (const qz of [-0.5, 0.5]) {
      tiles.push(...grid(6, 4, 0.235, 0.225, 0.1, qx, qz));
      patches.push(...grid(6, 4, 0.235, 0.225, 0.133, qx, qz));
    }
  instances(antenna, new THREE.BoxGeometry(0.19, 0.04, 0.18), tiles, colors.sky);
  instances(antenna, new THREE.CylinderGeometry(0.055, 0.055, 0.016, 12), patches, colors.gold);
}

// 1 — RF front-end: high-frequency board strip with GaAs/GaN MMIC rows (PA/LNA),
// copper waveguide runs, cavity filters and edge connectors.
const rf = groups[1];
box(rf, 2.8, 0.05, 1.7, 0, 0.025, 0, colors.pcb);
for (let r = 0; r < 4; r++) {
  const z = -0.6 + r * 0.4;
  for (let c = 0; c < 7; c++) {
    const x = -1.1 + c * 0.32;
    box(rf, 0.18, 0.06, 0.16, x, 0.08, z, colors.slate);
    box(rf, 0.1, 0.012, 0.08, x, 0.116, z, colors.gold, false);
  }
  box(rf, 2.3, 0.05, 0.07, 0.05, 0.075, z + 0.17, colors.copper, false);
  line(rf, [[1.15, 0.1, z + 0.17], [1.25, 0.1, z + 0.17], [1.25, 0.1, -0.78]], colors.copper, 0.03);
}
box(rf, 0.12, 0.08, 1.6, 1.32, 0.09, 0, colors.copper);
for (let i = 0; i < 4; i++) {
  cyl(rf, 0.075, 0.075, 0.16, -1.28, 0.13, -0.6 + i * 0.4, colors.gold, { seg: 14 });
  cyl(rf, 0.03, 0.03, 0.1, -1.28, 0.24, -0.6 + i * 0.4, colors.cream, { seg: 8, outline: false });
}

// 2 — Payload processing & on-board computer: stacked digital processor cards on
// standoffs, plus an enclosed OBC box with heat-sink fins, on a shared tray.
const payload = groups[2];
box(payload, 2.1, 0.035, 1.5, -0.35, 0.018, 0, colors.steel);
for (let n = 0; n < 3; n++) {
  const y = 0.08 + n * 0.11;
  box(payload, 1.05, 0.03, 1.2, -0.82, y, 0, n === 1 ? colors.teal : colors.pcb);
  box(payload, 0.32, 0.035, 0.32, -0.92, y + 0.03, -0.15, colors.slate, n === 2);
  box(payload, 0.18, 0.03, 0.12, -0.5, y + 0.028, 0.3, colors.dark, false);
  box(payload, 0.18, 0.03, 0.12, -0.5, y + 0.028, -0.4, colors.dark, false);
}
box(payload, 0.2, 0.01, 0.2, -0.92, 0.356, -0.15, colors.gold, false);
for (const dx of [-0.48, 0.48])
  for (const dz of [-0.55, 0.55])
    cyl(payload, 0.022, 0.022, 0.3, -0.82 + dx, 0.18, dz, colors.copper, { seg: 8, outline: false });
box(payload, 0.62, 0.26, 0.9, 0.3, 0.165, 0, colors.mist);
for (let i = 0; i < 6; i++) box(payload, 0.5, 0.06, 0.03, 0.3, 0.325, -0.36 + i * 0.145, colors.steel, false);
for (let i = 0; i < 3; i++) box(payload, 0.03, 0.08, 0.06, 0.62, 0.12, -0.25 + i * 0.25, colors.gold, false);
line(payload, [[-0.28, 0.12, 0.45], [0, 0.12, 0.45], [0, 0.08, 0.35]], colors.gold, 0.02);

// 3 — Power system: two three-panel folding solar wings on drive booms (SADA), a
// Li-ion battery pack and the power-control unit, tied together by the power harness.
const power = groups[3];
const WING_Y = 0.2;
box(power, 0.75, 0.06, 0.95, 0.95, 0.03, 0, colors.cream);
instances(power, new THREE.CylinderGeometry(0.065, 0.065, 0.22, 12), grid(4, 5, 0.165, 0.175, 0.17, 0.95, 0), colors.lilac);
instances(power, new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), grid(4, 5, 0.165, 0.175, 0.29, 0.95, 0), colors.gold);
box(power, 0.75, 0.04, 0.06, 0.95, 0.27, 0.47, colors.steel, false);
box(power, 0.75, 0.04, 0.06, 0.95, 0.27, -0.47, colors.steel, false);
box(power, 0.36, 0.2, 0.45, 0.25, 0.1, 0.25, colors.steel);
line(power, [[-1.55, WING_Y, 0], [0.25, WING_Y, 0], [0.25, WING_Y, 0.25]], colors.gold, 0.025);
line(power, [[0.6, WING_Y, 0], [1.55, WING_Y, 0]], colors.gold, 0.025);
for (const side of [-1, 1]) {
  cyl(power, 0.1, 0.1, 0.22, side * 1.6, WING_Y, 0, colors.slate, { axis: 'x', seg: 14 });
  cyl(power, 0.035, 0.035, 0.32, side * 1.86, WING_Y, 0, colors.steel, { axis: 'x', seg: 8, outline: false });
  const PANEL = 0.66, GAP = 0.05, DEPTH = 1.35;
  for (let p = 0; p < 3; p++) {
    const cx = side * (2.02 + PANEL / 2 + p * (PANEL + GAP));
    box(power, PANEL, 0.035, DEPTH, cx, WING_Y, 0, colors.cream);
    instances(power, new THREE.BoxGeometry(0.14, 0.02, 0.15), grid(4, 8, 0.155, 0.162, WING_Y + 0.022, cx, 0), colors.cell);
    box(power, PANEL - 0.06, 0.008, 0.025, cx, WING_Y + 0.03, 0, colors.gold, false);
    if (p < 2)
      for (const hz of [-0.45, 0.45])
        cyl(power, 0.025, 0.025, 0.14, side * (2.02 + PANEL + p * (PANEL + GAP) + GAP / 2), WING_Y, hz, colors.copper, { axis: 'z', seg: 8, outline: false });
  }
}

// 4 — Bus structure & thermal: open frame chassis with corner posts, perimeter rails,
// a mid equipment deck, white radiator panels with heat pipes, and an MLI-wrapped end.
const bus = groups[4];
const BH = 1.0;
box(bus, BUS_W, 0.04, BUS_D, 0, 0.02, 0, colors.slate);
for (const x of [-BUS_W / 2, BUS_W / 2])
  for (const z of [-BUS_D / 2, BUS_D / 2]) box(bus, 0.1, BH, 0.1, x, BH / 2, z, colors.steel);
for (const y of [0.05, BH - 0.04]) {
  for (const z of [-BUS_D / 2, BUS_D / 2]) box(bus, BUS_W, 0.07, 0.07, 0, y, z, colors.steel);
  for (const x of [-BUS_W / 2, BUS_W / 2]) box(bus, 0.07, 0.07, BUS_D, x, y, 0, colors.steel);
}
box(bus, BUS_W - 0.1, 0.03, BUS_D - 0.1, 0, 0.46, 0, colors.mist);
for (const z of [-BUS_D / 2, BUS_D / 2]) {
  box(bus, BUS_W - 0.12, BH - 0.14, 0.035, 0, BH / 2, z, colors.cream);
  for (let i = 0; i < 9; i++)
    box(bus, 0.035, BH - 0.24, 0.03, -1.2 + i * 0.3, BH / 2, z + Math.sign(z) * 0.03, colors.copper, false);
  box(bus, BUS_W - 0.3, 0.035, 0.03, 0, BH - 0.16, z + Math.sign(z) * 0.03, colors.copper, false);
}
box(bus, 0.035, BH - 0.14, BUS_D - 0.12, -BUS_W / 2, BH / 2, 0, colors.gold);
for (let i = 0; i < 4; i++) box(bus, 0.03, 0.012, BUS_D - 0.3, -BUS_W / 2 - 0.02, 0.2 + i * 0.2, 0, 0xc9965a, false);
line(bus, [[BUS_W / 2, 0.08, -BUS_D / 2 + 0.05], [BUS_W / 2, BH - 0.08, BUS_D / 2 - 0.05]], colors.steel, 0.03);
line(bus, [[BUS_W / 2, 0.08, BUS_D / 2 - 0.05], [BUS_W / 2, BH - 0.08, -BUS_D / 2 + 0.05]], colors.steel, 0.03);

// 5 — Propulsion & ADCS: Hall-effect thruster with PPU and krypton/argon tank,
// three reaction wheels and twin star-tracker cameras on the base plate.
const prop = groups[5];
box(prop, BUS_W - 0.06, 0.06, BUS_D - 0.06, 0, 0.03, 0, colors.dark);
cyl(prop, 0.24, 0.24, 0.85, -0.45, 0.3, -0.45, colors.cream, { axis: 'x', seg: 20 });
for (const s of [-1, 1]) {
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(colors.cream));
  cap.rotation.z = -s * Math.PI / 2;
  cap.position.set(-0.45 + s * 0.425, 0.3, -0.45);
  prop.add(cap);
}
box(prop, 0.08, 0.2, 0.5, -0.45, 0.14, -0.45, colors.steel, false);
line(prop, [[0.05, 0.3, -0.45], [0.75, 0.3, -0.45], [0.75, 0.25, 0], [1.25, 0.25, 0]], colors.copper, 0.025);
box(prop, 0.4, 0.22, 0.5, 0.8, 0.17, 0.45, colors.steel);
cyl(prop, 0.24, 0.24, 0.3, 1.42, 0.27, 0, colors.slate, { axis: 'x', seg: 22 });
cyl(prop, 0.27, 0.24, 0.06, 1.6, 0.27, 0, colors.dark, { axis: 'x', seg: 22 });
ring(prop, 0.17, 0.035, 1.635, 0.27, 0, colors.gold, 'x');
cyl(prop, 0.07, 0.07, 0.06, 1.64, 0.27, 0, colors.lilac, { axis: 'x', seg: 12, outline: false });
box(prop, 0.3, 0.2, 0.1, 1.42, 0.12, 0, colors.steel, false);
for (const [x, z] of [[-1.05, 0.45], [-0.45, 0.45], [0.15, 0.45]]) {
  cyl(prop, 0.2, 0.2, 0.12, x, 0.13, z, colors.lilac, { seg: 22 });
  ring(prop, 0.2, 0.025, x, 0.19, z, colors.gold);
  cyl(prop, 0.06, 0.06, 0.04, x, 0.2, z, colors.gold, { seg: 10, outline: false });
}
for (const x of [-1.25, -0.85]) {
  box(prop, 0.2, 0.18, 0.2, x, 0.15, 0.82, colors.slate);
  cyl(prop, 0.11, 0.07, 0.24, x, 0.27, 0.98, colors.cream, { axis: 'z', seg: 16, tilt: -0.6 });
}

groups.forEach((g) => g.traverse((o) => { if (o.isMesh) o.userData.layer = g.userData.layer; }));

const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.7;
ground.receiveShadow = true;
scene.add(ground);
const guide = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
  new THREE.LineDashedMaterial({ color: 0xc2a27f, dashSize: 0.12, gapSize: 0.09, transparent: true, opacity: 0.55 }),
);
scene.add(guide);

// Expanded: antenna on top, base plate at the bottom. Assembled (stacked from y = 1):
// base plate → bus frame holding wheels, tank, boards and battery → RF strip → array lid.
const expandedY = [4.45, 3.75, 2.95, 2.05, 0.6, -0.45],
  assembledY = [2.06, 1.86, 1.5, 1.5, 1.06, 1.0];
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
const layerNames = ['相位陣列天線', '射頻前端', '酬載與衛星電腦', '電源系統', '衛星本體與熱控', '推進與姿態控制'];
// Tag anchors float just outside the hull; wing, bus and base plate use a second anchor when
// assembled so the tags stay off the hull in both modes.
const labelsData = [
  { i: 0, point: [0.72, 0.15, -2.36] },
  { i: 1, point: [1.56, 0.1, -1.54] },
  { i: 2, point: [2.57, 0.35, -0.44] },
  { i: 3, point: [3.9, WING_Y, -0.6], packed: [3.9, WING_Y, 0.65] },
  { i: 4, point: [1.6, 0.35, -1.1], packed: [0.76, 0.1, 2.15] },
  { i: 5, point: [1.9, 0.27, -0.3], packed: [0.36, 0.0, 4.45] },
];
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
window.addEventListener('chip-layer-select', (e) => {
  active = e.detail;
  solo = false;
  setTargets();
});
for (const b of document.querySelectorAll('[data-mode]'))
  b.onclick = () => {
    active = -1;
    mode = b.dataset.mode;
    solo = false;
    setTargets();
    document.querySelector('#selection-caption').textContent =
      mode === 'expanded' ? '展開全貌 · 點選任一層抽出' : '完整組裝 · 點選任一層抽出';
  };
document.querySelector('#solo').onclick = () => {
  if (active < 0) return;
  solo = !solo;
  setTargets();
};
document.querySelector('#reset-view').onclick = () => {
  camera.position.set(11, 10, 14);
  controls.target.set(0, 2, 0);
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
  camera.left = -6.1 * aspect;
  camera.right = 6.1 * aspect;
  camera.top = 6.1;
  camera.bottom = -6.1;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
new ResizeObserver(() => {
  resize();
  setTargets();
}).observe(mount);
resize();
setTargets();

const temp = new THREE.Vector3(), anchor = new THREE.Vector3();
function project(v) {
  temp.copy(v).project(camera);
  return { x: (temp.x * 0.5 + 0.5) * mount.clientWidth, y: (-0.5 * temp.y + 0.5) * mount.clientHeight };
}
let last = performance.now(), visible = true;
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
}).observe(mount);
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
