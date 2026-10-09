import * as THREE from '../industry-atlas/vendor/three.module.js';
import {OrbitControls} from '../industry-atlas/vendor/OrbitControls.js';

const mount = document.querySelector('#industry-stage'),
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const palette = {ink: 0x35435d, pcb: 0x7dafa2, copper: 0xdcac72, cream: 0xf2e5c8, steel: 0xb6c4d4, purple: 0xb6a4d1, blue: 0x8caccb, dark: 0x46566e, white: 0xf2ede1, beam: 0xe39a86};

// Hand-drawn toon look shared with the AI atlas: stepped shading, paper hatching, ink outlines.
const gradient = new THREE.DataTexture(new Uint8Array([100, 155, 215, 255]), 4, 1, THREE.RedFormat);
gradient.needsUpdate = true;
gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
const paper = document.createElement('canvas');
paper.width = paper.height = 128;
const ctx = paper.getContext('2d');
ctx.fillStyle = '#fffdf6';
ctx.fillRect(0, 0, 128, 128);
ctx.strokeStyle = '#a1a0a01c';
ctx.lineWidth = 0.6;
for (let i = -128; i < 256; i += 12) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128); ctx.stroke(); }
const texture = new THREE.CanvasTexture(paper);
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
function material(c, side = THREE.FrontSide) {
  return new THREE.MeshToonMaterial({color: c, gradientMap: gradient, map: texture, side});
}

const parts = Array.from({length: 16}, (_, i) => { const g = new THREE.Group(); g.userData.industry = i; return g; });
const UP = new THREE.Vector3(0, 1, 0);

function solid(g, geometry, color, x = 0, y = 0, z = 0, rotation, side) {
  const m = new THREE.Mesh(geometry, material(color, side));
  m.position.set(x, y, z);
  if (rotation) m.rotation.set(...rotation);
  m.userData.industry = g.userData.industry;
  g.add(m);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 26), new THREE.LineBasicMaterial({color: palette.ink, transparent: true, opacity: 0.65}));
  edge.position.copy(m.position);
  edge.rotation.copy(m.rotation);
  g.add(edge);
  m.userData.edge = edge;
  return m;
}
function box(g, w, h, d, x, y, z, c = palette.steel, rot) { return solid(g, new THREE.BoxGeometry(w, h, d), c, x, y, z, rot); }
function cyl(g, r, h, x, y, z, c = palette.steel, rot, seg = 40) { return solid(g, new THREE.CylinderGeometry(r, r, h, seg), c, x, y, z, rot); }
function pipe(g, points, c = palette.copper, r = 0.04) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, r, 7, false), material(c));
  m.userData.industry = g.userData.industry;
  g.add(m);
  return m;
}
function trace(g, points) { return pipe(g, points, palette.copper, 0.015); }
// Point a Y-axis primitive (cylinder/cone) along a direction, keeping its outline aligned.
function aim(m, dir) {
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  if (m.userData.edge) m.userData.edge.quaternion.copy(m.quaternion);
  return m;
}
// Dashed signal / laser beam between two points.
function beam(g, a, b, n = 9, c = palette.beam, r = 0.035) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dir = B.clone().sub(A), len = dir.length() / n;
  for (let i = 0; i < n; i++) {
    const p = A.clone().addScaledVector(dir, (i + 0.5) / n);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len * 0.62, 10), material(c));
    m.position.copy(p);
    m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    m.userData.industry = g.userData.industry;
    g.add(m);
  }
}
// Build a sub-assembly in local space, then bake its transform into the part (keeps picking flat).
function assembly(g, build, pos = [0, 0, 0], rot = [0, 0, 0], scale = 1) {
  const tmp = new THREE.Group();
  tmp.userData.industry = g.userData.industry;
  build(tmp);
  tmp.position.set(...pos);
  tmp.rotation.set(...rot);
  tmp.scale.setScalar(scale);
  tmp.updateMatrix();
  [...tmp.children].forEach(o => { o.applyMatrix4(tmp.matrix); g.add(o); });
}
function wafer(g, y, base, die = palette.cream, r = 1.13) {
  cyl(g, r, 0.045, 0, y, 0, base);
  box(g, 0.5, 0.046, 0.08, 0, y, r - 0.02, base); // orientation flat
  if (die) for (let x = -0.72; x <= 0.73; x += 0.24) for (let z = -0.72; z <= 0.73; z += 0.24)
    if (Math.hypot(x, z) < r - 0.22) box(g, 0.19, 0.012, 0.19, x, y + 0.031, z, die);
}
function miniSat(g, x, y, z, s = 1, ry = 0) {
  assembly(g, a => {
    box(a, 0.34, 0.22, 0.26, 0, 0, 0, palette.cream);
    box(a, 0.62, 0.02, 0.24, -0.5, 0, 0, palette.blue);
    box(a, 0.62, 0.02, 0.24, 0.5, 0, 0, palette.blue);
    box(a, 0.16, 0.03, 0.16, 0, -0.125, 0, palette.copper);
  }, [x, y, z], [0, ry, 0], s);
}
function paraboloid(g, r, depth, c = palette.white) {
  const pts = [];
  for (let i = 0; i <= 12; i++) { const x = r * i / 12; pts.push(new THREE.Vector2(x, depth * (x / r) ** 2)); }
  return solid(g, new THREE.LatheGeometry(pts, 40), c, 0, 0, 0, null, THREE.DoubleSide);
}

/* ---------- LAB 0 · UPSTREAM ---------- */
// 00 Compound semiconductor wafers: GaAs + GaN wafers with die grid, plus a magnified epi stack.
{
  const g = parts[0];
  wafer(g, 0, palette.purple, null);
  assembly(g, a => {
    wafer(a, 0, palette.blue, null);
    cyl(a, 1.06, 0.02, 0, 0.032, 0, palette.copper); // epitaxial layer
    for (let x = -0.72; x <= 0.73; x += 0.24) for (let z = -0.72; z <= 0.73; z += 0.24)
      if (Math.hypot(x, z) < 0.88) box(a, 0.19, 0.014, 0.19, x, 0.05, z, palette.cream);
  }, [0.35, 0.42, -0.3]);
  // Magnified epi cross-section: substrate, buffer, channel, barrier, cap.
  const layers = [[0.42, palette.purple], [0.08, palette.steel], [0.07, palette.blue], [0.05, palette.copper], [0.04, palette.cream]];
  let y = -0.05;
  layers.forEach(([h, c]) => { box(g, 0.75, h, 0.6, 1.75, y + h / 2, 1.1, c); y += h + 0.035; });
}
// 01 RF IC / MMIC: QFN-style package, PA + LNA dies, bond wires, on-chip lines and spiral inductors.
{
  const g = parts[1];
  box(g, 1.9, 0.14, 1.9, 0, 0, 0, palette.dark);
  box(g, 1.25, 0.03, 1.25, 0, 0.085, 0, palette.copper);
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
    const o = -0.66 + i * 0.22;
    box(g, 0.1, 0.03, 0.2, o, 0.085, s * 0.84, palette.copper);
    box(g, 0.2, 0.03, 0.1, s * 0.84, 0.085, o, palette.copper);
  }
  box(g, 0.78, 0.07, 0.62, -0.12, 0.135, 0.12, palette.purple); // PA MMIC
  box(g, 0.36, 0.07, 0.36, 0.38, 0.135, -0.36, palette.blue); // LNA
  [[-0.45, 0.32], [-0.12, 0.32], [0.2, 0.32]].forEach(([x, z]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 28), material(palette.copper));
    ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.175, z); ring.userData.industry = 1; g.add(ring);
  });
  trace(g, [[-0.48, 0.175, -0.05], [-0.12, 0.175, -0.05], [0.24, 0.175, -0.05]]);
  trace(g, [[-0.48, 0.175, -0.12], [0.24, 0.175, -0.12]]);
  box(g, 0.14, 0.02, 0.14, 0.38, 0.18, -0.36, palette.cream);
  for (let i = 0; i < 5; i++) {
    const x = -0.44 + i * 0.16;
    pipe(g, [[x, 0.17, 0.42], [x, 0.36, 0.62], [x, 0.11, 0.84]], palette.copper, 0.012);
    pipe(g, [[x, 0.17, -0.18], [x, 0.34, -0.5], [x - 0.1, 0.11, -0.84]], palette.copper, 0.012);
  }
  for (let i = 0; i < 3; i++) {
    const z = -0.48 + i * 0.12;
    pipe(g, [[0.56, 0.17, z], [0.72, 0.32, z], [0.84, 0.11, z]], palette.copper, 0.012);
  }
}
// 02 High-frequency PCB: exploded low-loss laminate stack, microstrip lines, patch array, vias.
{
  const g = parts[2];
  const stack = [[0, palette.copper, 0.03], [0.22, palette.cream, 0.1], [0.4, palette.copper, 0.03], [0.6, palette.white, 0.1]];
  stack.forEach(([y, c, h]) => box(g, 2.6, h, 1.8, 0, y, 0, c));
  for (let i = 0; i < 3; i++) trace(g, [[-1.2, 0.43, -0.5 + i * 0.5], [1.2, 0.43, -0.5 + i * 0.5]]);
  const top = 0.66;
  pipe(g, [[-1.2, top, 0], [-0.55, top, 0]], palette.copper, 0.022);
  for (const z of [-0.45, 0.45]) {
    pipe(g, [[-0.55, top, 0], [-0.55, top, z], [0.05, top, z]], palette.copper, 0.018);
    for (const x of [0.25, 0.85]) box(g, 0.34, 0.02, 0.3, x, top, z, palette.copper);
    pipe(g, [[0.05, top, z], [0.67, top, z]], palette.copper, 0.012);
  }
  pipe(g, [[-1.2, top, 0.75], [-0.9, top, 0.75], [-0.85, top, 0.62], [-0.7, top, 0.75], [-0.5, top, 0.62], [-0.3, top, 0.75]], palette.copper, 0.014);
  for (const [x, z] of [[-1.05, -0.7], [-1.05, 0.7], [1.15, -0.7], [1.15, 0.7], [-0.55, 0]]) cyl(g, 0.04, 0.66, x, 0.33, z, palette.copper, null, 12);
  box(g, 0.24, 0.16, 0.24, -1.4, top + 0.02, 0, palette.steel); // edge launch
}
// 03 Microwave components: flanged waveguide, cavity filter with tuning screws, SMA connectors.
{
  const g = parts[3];
  const L = 1.9, W = 0.5, H = 0.28, t = 0.04;
  box(g, L, t, W, 0, H / 2, -0.75, palette.copper);
  box(g, L, t, W, 0, -H / 2, -0.75, palette.copper);
  box(g, L, H, t, 0, 0, -0.75 - W / 2 + t / 2, palette.copper);
  box(g, L, H, t, 0, 0, -0.75 + W / 2 - t / 2, palette.copper);
  for (const x of [-L / 2, L / 2]) {
    box(g, 0.06, 0.62, 0.84, x, 0, -0.75, palette.steel);
    box(g, 0.065, H - t, W - 2 * t, x, 0, -0.75, palette.dark);
    for (const [dy, dz] of [[-0.22, -0.32], [-0.22, 0.32], [0.22, -0.32], [0.22, 0.32]]) cyl(g, 0.035, 0.08, x, dy, -0.75 + dz, palette.dark, [0, 0, Math.PI / 2], 10);
  }
  box(g, 1.5, 0.36, 0.7, -0.15, 0.0, 0.55, palette.steel);
  box(g, 1.42, 0.03, 0.62, -0.15, 0.19, 0.55, palette.white);
  for (let i = 0; i < 5; i++) {
    const x = -0.71 + i * 0.28;
    cyl(g, 0.075, 0.05, x, 0.23, 0.55, palette.copper, null, 6);
    cyl(g, 0.025, 0.18, x, 0.32, 0.55, palette.copper, null, 10);
  }
  function sma(x, y, z, rot) {
    assembly(g, a => {
      cyl(a, 0.09, 0.12, 0, 0, 0, palette.copper, null, 6);
      cyl(a, 0.065, 0.2, 0, 0.16, 0, palette.copper, null, 20);
      cyl(a, 0.02, 0.08, 0, 0.3, 0, palette.cream, null, 8);
    }, [x, y, z], rot);
  }
  sma(-0.98, 0, 0.55, [0, 0, Math.PI / 2]);
  sma(0.68, 0, 0.55, [0, 0, -Math.PI / 2]);
  pipe(g, [[0.95, 0, 0.55], [1.3, 0, 0.55], [1.45, 0.1, 0.25], [1.45, 0.25, -0.1]], palette.steel, 0.035);
  sma(1.45, 0.25, -0.1, [0, 0, 0]);
}

/* ---------- LAB 1 · SATELLITE ---------- */
// 04 Phased-array antenna tile: radome frame, element grid, beamformer layer below.
{
  const g = parts[4];
  box(g, 2.3, 0.14, 2.3, 0, 0, 0, palette.dark);
  box(g, 2.2, 0.04, 2.2, 0, 0.09, 0, palette.pcb);
  for (let x = 0; x < 8; x++) for (let z = 0; z < 8; z++) box(g, 0.17, 0.025, 0.17, (x - 3.5) * 0.26, 0.12, (z - 3.5) * 0.26, palette.copper);
  for (const s of [-1, 1]) { box(g, 2.36, 0.1, 0.06, 0, 0.12, s * 1.15, palette.cream); box(g, 0.06, 0.1, 2.36, s * 1.15, 0.12, 0, palette.cream); }
  box(g, 2.1, 0.06, 2.1, 0, -0.55, 0, palette.pcb);
  for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) box(g, 0.28, 0.06, 0.28, (x - 1.5) * 0.5, -0.49, (z - 1.5) * 0.5, (x + z) % 2 ? palette.purple : palette.blue);
  for (const x of [-0.95, 0.95]) for (const z of [-0.95, 0.95]) cyl(g, 0.035, 0.48, x, -0.3, z, palette.steel, null, 10);
  box(g, 0.5, 0.14, 0.3, 0, -0.65, 1.1, palette.dark);
}
// 05 Solar wing + power: accordion-folded array on a boom, battery pack and power unit.
{
  const g = parts[5];
  const n = 4, pw = 0.95, ang = 0.32;
  let x = 0.3;
  for (let i = 0; i < n; i++) {
    const tilt = i % 2 ? -ang : ang;
    assembly(g, a => {
      box(a, pw, 0.04, 1.5, 0, 0, 0, palette.dark);
      for (let cx = 0; cx < 3; cx++) for (let cz = 0; cz < 5; cz++) box(a, 0.27, 0.012, 0.26, (cx - 1) * 0.3, 0.026, (cz - 2) * 0.29, palette.blue);
    }, [x + Math.cos(ang) * pw / 2, 1.1 + (i % 2 ? 0.15 : 0), 0], [0, 0, tilt]);
    x += Math.cos(ang) * pw;
  }
  pipe(g, [[-0.25, 1.1, 0], [0.3, 1.1, 0]], palette.steel, 0.05);
  cyl(g, 0.12, 0.14, 0.3, 1.1, 0, palette.copper, [0, 0, Math.PI / 2]);
  box(g, 1.2, 0.12, 0.85, -0.6, 0, 0.1, palette.dark);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) cyl(g, 0.11, 0.48, -1.0 + i * 0.27, 0.3, -0.17 + j * 0.27, j % 2 ? palette.cream : palette.white, null, 20);
  box(g, 1.2, 0.05, 0.85, -0.6, 0.58, 0.1, palette.steel);
  box(g, 0.8, 0.45, 0.6, -0.55, 0.2, -0.85, palette.steel);
  for (let i = 0; i < 4; i++) box(g, 0.05, 0.3, 0.62, -0.8 + i * 0.16, 0.5, -0.85, palette.cream);
  pipe(g, [[-0.25, 1.1, 0], [-0.3, 0.8, -0.4], [-0.55, 0.45, -0.8]], palette.copper, 0.025);
}
// 06 Structure + thermal: box frame, honeycomb panel, radiator with fins and heat pipes.
{
  const g = parts[6];
  const X = 1.0, Y = 0.8, Z = 0.8;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.08, 2 * Y, 0.08, sx * X, 0, sz * Z, palette.steel);
  for (const sy of [-1, 1]) {
    for (const sz of [-1, 1]) box(g, 2 * X, 0.08, 0.08, 0, sy * Y, sz * Z, palette.steel);
    for (const sx of [-1, 1]) box(g, 0.08, 0.08, 2 * Z, sx * X, sy * Y, 0, palette.steel);
  }
  box(g, 2 * X, 0.06, 2 * Z, 0, -Y, 0, palette.cream);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) cyl(g, 0.11, 0.015, -0.75 + i * 0.3 + (j % 2) * 0.15, -Y + 0.035, -0.6 + j * 0.4, palette.copper, null, 6);
  box(g, 0.08, 1.2, 1.2, -0.25, 0.05, 0, palette.cream);
  const rz = Z + 0.55;
  box(g, 2.0, 1.5, 0.06, 0, 0, rz, palette.white);
  for (let i = 0; i < 9; i++) box(g, 0.035, 1.4, 0.32, -0.88 + i * 0.22, 0, rz + 0.18, palette.white);
  for (let i = 0; i < 3; i++) pipe(g, [[-0.95, -0.45 + i * 0.45, rz - 0.06], [0.95, -0.45 + i * 0.45, rz - 0.06]], palette.copper, 0.035);
  box(g, 0.5, 0.35, 0.3, 0.4, -0.5, 0.2, palette.purple);
}
// 07 OBC / payload: open chassis with slotted board stack, one board pulled out, backplane.
{
  const g = parts[7];
  box(g, 1.9, 0.08, 1.4, 0, 0, 0, palette.steel);
  for (const s of [-1, 1]) box(g, 0.06, 1.15, 1.4, s * 0.95, 0.6, 0, palette.steel);
  box(g, 1.9, 1.15, 0.06, 0, 0.6, -0.7, palette.dark);
  box(g, 1.9, 0.05, 1.4, 0, 1.2, 0, palette.steel);
  for (let i = 0; i < 6; i++) box(g, 1.7, 0.03, 0.035, 0, 1.24, -0.55 + i * 0.22, palette.cream);
  for (let i = 0; i < 4; i++) {
    const x = -0.6 + i * 0.4, out = i === 2 ? 0.9 : 0;
    box(g, 0.05, 0.95, 1.2, x, 0.58, 0.02 + out, palette.pcb);
    box(g, 0.08, 0.3, 0.3, x + 0.06, 0.65, 0.1 + out, i % 2 ? palette.purple : palette.dark);
    box(g, 0.06, 0.15, 0.18, x + 0.05, 0.3, 0.4 + out, palette.cream);
    box(g, 0.06, 0.15, 0.18, x + 0.05, 0.9, 0.4 + out, palette.blue);
    box(g, 0.1, 0.8, 0.08, x, 0.58, -0.6 + out, palette.copper);
    box(g, 0.12, 0.95, 0.06, x, 0.58, 0.63 + out, palette.dark);
  }
}

/* ---------- LAB 2 · SPACE ---------- */
// 08 Launch vehicle on pad: tower, two-stage rocket, fairing cut away to show stacked satellites.
{
  const g = parts[8];
  box(g, 2.6, 0.25, 2.2, 0, 0.125, 0, palette.dark);
  box(g, 0.9, 0.08, 0.9, 0.35, 0.29, 0, palette.steel);
  const tx = -0.75;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.06, 5.0, 0.06, tx + sx * 0.22, 2.75, sz * 0.22, palette.steel);
  for (let y = 0.6; y < 5.2; y += 0.55) for (const sz of [-1, 1]) {
    box(g, 0.5, 0.04, 0.04, tx, y, sz * 0.22, palette.steel);
    box(g, 0.04, 0.04, 0.5, tx + sz * 0.22, y, 0, palette.steel);
  }
  box(g, 0.75, 0.08, 0.12, tx + 0.45, 3.4, 0, palette.copper);
  const rx = 0.35, R = 0.3;
  cyl(g, R, 3.2, rx, 1.95, 0, palette.white);
  cyl(g, R + 0.01, 0.18, rx, 3.6, 0, palette.dark);
  cyl(g, R, 0.55, rx, 3.95, 0, palette.white);
  cyl(g, R + 0.01, 0.12, rx, 0.95, 0, palette.dark);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; box(g, 0.04, 0.4, 0.25, rx + Math.cos(a) * 0.36, 0.55, Math.sin(a) * 0.36, palette.dark, [0, -a, 0]); }
  const open = Math.atan2(10, 12), start = open + Math.PI / 2;
  solid(g, new THREE.CylinderGeometry(0.36, 0.36, 1.1, 40, 1, true, start, Math.PI), palette.cream, rx, 4.78, 0, null, THREE.DoubleSide);
  solid(g, new THREE.ConeGeometry(0.36, 0.75, 40, 1, true, start, Math.PI), palette.cream, rx, 5.705, 0, null, THREE.DoubleSide);
  cyl(g, 0.3, 0.06, rx, 4.25, 0, palette.dark);
  for (let i = 0; i < 7; i++) box(g, 0.44, 0.06, 0.32, rx, 4.33 + i * 0.12, 0, i % 2 ? palette.blue : palette.copper, [0, open, 0]);
}
// 09 Constellation ops: globe with graticule, three inclined orbital rings carrying satellites.
{
  const g = parts[9];
  const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), material(palette.blue));
  globe.userData.industry = 9; g.add(globe);
  const ring = (r, rot, c, tube) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 72), material(c));
    m.rotation.set(...rot); m.userData.industry = 9; g.add(m); return m;
  };
  for (const lat of [-0.5, 0, 0.5]) ring(Math.cos(lat) * 1.005, [Math.PI / 2, 0, 0], palette.steel, 0.008).position.y = Math.sin(lat);
  for (let i = 0; i < 4; i++) ring(1.005, [0, i * Math.PI / 4, 0], palette.steel, 0.008);
  [[0.3, 0.5, 0.81], [-0.6, 0.2, 0.77], [0.75, -0.35, 0.56]].forEach(p => {
    const v = new THREE.Vector3(...p).normalize();
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.012, 20, 10, 0, Math.PI * 2, 0, 0.35), material(palette.pcb));
    cap.quaternion.setFromUnitVectors(UP, v); cap.userData.industry = 9; g.add(cap);
  });
  const orbits = [[1.55, [1.2, 0, 0.3]], [1.6, [1.9, 0.6, -0.4]], [1.5, [Math.PI / 2, 0.9, 1.1]]];
  orbits.forEach(([r, rot], k) => {
    ring(r, rot, palette.copper, 0.014);
    const e = new THREE.Euler(...rot);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + k * 0.6;
      const p = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0).applyEuler(e);
      miniSat(g, p.x, p.y, p.z, 0.42, a + k);
    }
  });
}
// 10 Inter-satellite laser link: two satellite buses with gimballed optical terminals and a beam.
{
  const g = parts[10];
  const A = new THREE.Vector3(-1.45, 0.95, 0), B = new THREE.Vector3(1.45, 1.35, 0);
  [[-1, A], [1, B]].forEach(([s, P]) => {
    const bx = P.x + s * 0.55;
    box(g, 0.9, 0.7, 0.9, bx, P.y - 0.75, 0, palette.cream);
    box(g, 0.06, 0.5, 1.9, bx + s * 0.52, P.y - 0.75, 0, palette.dark);
    for (let i = 0; i < 6; i++) box(g, 0.065, 0.42, 0.26, bx + s * 0.53, P.y - 0.75, -0.75 + i * 0.3, palette.blue);
    cyl(g, 0.25, 0.1, P.x, P.y - 0.36, 0, palette.dark);
    box(g, 0.07, 0.45, 0.07, P.x, P.y - 0.15, 0.22, palette.steel);
    box(g, 0.07, 0.45, 0.07, P.x, P.y - 0.15, -0.22, palette.steel);
    const dir = (s < 0 ? B.clone().sub(A) : A.clone().sub(B)).normalize();
    aim(cyl(g, 0.18, 0.55, P.x, P.y, 0, palette.steel), dir);
    aim(cyl(g, 0.15, 0.04, P.x + dir.x * 0.29, P.y + dir.y * 0.29, 0, palette.purple), dir);
  });
  const d = B.clone().sub(A).normalize();
  beam(g, A.clone().addScaledVector(d, 0.32).toArray(), B.clone().addScaledVector(d, -0.32).toArray(), 11, palette.beam, 0.04);
}
// 11 Environmental test: thermal-vacuum chamber with open door, plus a vibration shaker table.
{
  const g = parts[11];
  const cz = -0.2, L = 2.0, R = 0.85;
  solid(g, new THREE.CylinderGeometry(R, R, L, 40, 1, true), palette.steel, -0.7, R + 0.3, cz, [Math.PI / 2, 0, 0], THREE.DoubleSide);
  cyl(g, R, 0.08, -0.7, R + 0.3, cz - L / 2, palette.dark, [Math.PI / 2, 0, 0]);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 8, 40), material(palette.dark));
  ring.position.set(-0.7, R + 0.3, cz + L / 2); ring.userData.industry = 11; g.add(ring);
  // door swung ~130° open on its left hinge
  const da = 1.8, dir = new THREE.Vector3(Math.cos(da), 0, Math.sin(da));
  const door = cyl(g, R + 0.04, 0.1, -0.7 - R + dir.x * (R + 0.04), R + 0.3, cz + L / 2 + 0.06 + dir.z * (R + 0.04), palette.steel);
  aim(door, new THREE.Vector3(-dir.z, 0, dir.x));
  cyl(g, 0.05, 0.5, -0.7 - R, R + 0.3, cz + L / 2 + 0.06, palette.dark, null, 12);
  for (const s of [-1, 1]) box(g, 0.12, 0.3, 0.12, -0.7 + s * 0.55, 0.15, cz, palette.dark);
  box(g, 1.5, 0.08, 1.6, -0.7, 0.04, cz, palette.dark);
  for (const s of [-1, 1]) box(g, 0.05, 0.04, 1.8, -0.7 + s * 0.35, 0.5, cz + 0.1, palette.copper);
  box(g, 0.6, 0.5, 0.55, -0.7, 0.8, cz + 0.2, palette.cream);
  box(g, 0.04, 0.4, 0.5, -0.7 + 0.33, 0.85, cz + 0.2, palette.blue);
  cyl(g, 0.12, 0.35, -0.95, R * 2 + 0.45, cz - 0.4, palette.steel, null, 20);
  pipe(g, [[-0.95, R * 2 + 0.3, cz - 0.4], [-0.95, R * 2 + 0.1, cz - 0.4]], palette.copper, 0.04);
  const sx = 1.55;
  box(g, 1.1, 0.55, 1.1, sx, 0.275, 0.2, palette.dark);
  cyl(g, 0.42, 0.25, sx, 0.68, 0.2, palette.copper);
  box(g, 1.0, 0.07, 1.0, sx, 0.84, 0.2, palette.steel);
  for (const x of [-0.38, 0.38]) for (const z of [-0.38, 0.38]) cyl(g, 0.04, 0.05, sx + x, 0.89, 0.2 + z, palette.dark, null, 6);
  box(g, 0.45, 0.4, 0.45, sx, 1.08, 0.2, palette.purple);
  box(g, 0.1, 0.1, 0.1, sx + 0.27, 1.2, 0.2, palette.beam);
  pipe(g, [[sx + 0.32, 1.2, 0.2], [sx + 0.7, 1.0, 0.4], [sx + 0.6, 0.3, 0.8]], palette.beam, 0.015);
}

/* ---------- LAB 3 · GROUND ---------- */
// 12 Gateway site: pad, two large tracking dishes + a small one, equipment shelter, fence.
{
  const g = parts[12];
  box(g, 4.4, 0.1, 3.0, 0, 0, 0, palette.cream);
  function dish(x, z, r, el, az) {
    assembly(g, a => {
      cyl(a, r * 0.16, r * 0.9, 0, r * 0.45, 0, palette.dark, null, 20);
      box(a, r * 0.42, r * 0.18, r * 0.3, 0, r * 0.95, 0, palette.steel);
      assembly(a, d => {
        paraboloid(d, r, r * 0.32, palette.white);
        cyl(d, r * 0.09, r * 0.2, 0, r * 0.82, 0, palette.copper, null, 16);
        for (let i = 0; i < 3; i++) { const t = i * Math.PI * 2 / 3; pipe(d, [[Math.cos(t) * r * 0.92, r * 0.29, Math.sin(t) * r * 0.92], [0, r * 0.72, 0]], palette.steel, r * 0.018); }
      }, [0, r * 1.1, 0], [el, 0, 0]);
    }, [x, 0.05, z], [0, az, 0]);
  }
  dish(-1.15, -0.35, 1.0, 0.75, 0.7);
  dish(0.95, -0.55, 0.85, 0.75, 0.7);
  dish(1.55, 0.95, 0.4, 0.75, 0.7);
  box(g, 1.1, 0.6, 0.7, -1.3, 0.35, 1.0, palette.steel);
  box(g, 1.2, 0.06, 0.8, -1.3, 0.68, 1.0, palette.dark);
  box(g, 0.25, 0.42, 0.02, -1.05, 0.27, 1.36, palette.dark);
  box(g, 0.25, 0.12, 0.25, -0.6, 0.71, 0.9, palette.cream);
  for (let x = -2.1; x <= 2.11; x += 0.42) box(g, 0.03, 0.3, 0.03, x, 0.2, 1.45, palette.steel);
  box(g, 4.2, 0.02, 0.02, 0, 0.32, 1.45, palette.steel);
  pipe(g, [[-0.75, 0.08, 1.0], [-0.2, 0.08, 0.3], [0.95, 0.08, -0.55]], palette.dark, 0.03);
}
// 13 User terminal: flat rectangular phased-array dish tilted on a mast, kickstand base, cable.
{
  const g = parts[13];
  assembly(g, a => {
    box(a, 1.35, 0.1, 2.0, 0, 0, 0, palette.white);
    for (let x = 0; x < 5; x++) for (let z = 0; z < 8; z++) box(a, 0.2, 0.008, 0.2, (x - 2) * 0.25, 0.054, (z - 3.5) * 0.235, palette.cream);
    box(a, 0.4, 0.12, 0.3, 0, -0.1, 0, palette.steel);
  }, [0, 1.75, 0], [0.62, 0.7, 0]);
  cyl(g, 0.065, 1.6, 0, 0.85, 0, palette.steel, null, 20);
  box(g, 1.3, 0.08, 0.14, 0, 0.04, 0, palette.dark, [0, 0.4, 0]);
  box(g, 1.3, 0.08, 0.14, 0, 0.04, 0, palette.dark, [0, 0.4 + Math.PI / 2, 0]);
  cyl(g, 0.12, 0.12, 0, 0.12, 0, palette.dark, null, 20);
  pipe(g, [[0.06, 0.2, 0.04], [0.25, 0.06, 0.3], [0.7, 0.04, 0.55], [1.1, 0.04, 0.4]], palette.dark, 0.025);
}
// 14 Network gear / modem: router body with vents, LEDs, rear ports, antennas, plus a modem.
{
  const g = parts[14];
  box(g, 2.0, 0.42, 1.3, 0, 0.21, 0, palette.white);
  for (let i = 0; i < 7; i++) box(g, 0.08, 0.01, 0.75, -0.6 + i * 0.2, 0.425, -0.05, palette.dark);
  for (let i = 0; i < 5; i++) box(g, 0.07, 0.05, 0.02, -0.7 + i * 0.16, 0.28, 0.655, i % 2 ? palette.blue : palette.pcb);
  for (let i = 0; i < 4; i++) {
    box(g, 0.02, 0.16, 0.2, 1.005, 0.2, -0.45 + i * 0.25, palette.dark);
    box(g, 0.022, 0.06, 0.12, 1.008, 0.2, -0.45 + i * 0.25, palette.copper);
  }
  cyl(g, 0.06, 0.1, 1.04, 0.2, 0.52, palette.copper, [0, 0, Math.PI / 2], 6);
  for (const z of [-0.5, 0.5]) {
    cyl(g, 0.06, 0.12, 0.88, 0.48, z, palette.dark, null, 16);
    cyl(g, 0.045, 1.0, 0.88, 0.95, z, palette.dark, [0, 0, z > 0 ? -0.18 : 0.12], 16);
  }
  pipe(g, [[1.02, 0.2, -0.2], [1.4, 0.15, -0.2], [1.55, 0.1, -0.6], [1.4, 0.05, -1.1]], palette.blue, 0.03);
  box(g, 0.32, 1.0, 0.85, -1.55, 0.5, -0.1, palette.cream);
  box(g, 0.33, 0.04, 0.6, -1.55, 0.8, -0.1, palette.dark);
  for (let i = 0; i < 3; i++) box(g, 0.02, 0.05, 0.05, -1.385, 0.6 - i * 0.12, 0.33, palette.pcb);
  pipe(g, [[-1.4, 0.2, -0.3], [-1.15, 0.05, -0.5], [-0.6, 0.05, -0.8], [-0.2, 0.15, -0.66]], palette.blue, 0.03);
}
// 15 Satellite telecom service: lattice cell tower, sector antennas, satellite direct-to-phone link.
{
  const g = parts[15];
  box(g, 3.2, 0.08, 2.0, 0.6, 0, 0, palette.cream);
  const H = 3.0, b = 0.45, tp = 0.13;
  const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  legs.forEach(([sx, sz]) => pipe(g, [[sx * b, 0, sz * b], [sx * tp, H, sz * tp]], palette.steel, 0.035));
  for (let k = 0; k < 6; k++) {
    const y0 = k * H / 6, y1 = (k + 1) * H / 6, w0 = b + (tp - b) * k / 6, w1 = b + (tp - b) * (k + 1) / 6;
    for (let s = 0; s < 4; s++) {
      const [ax, az] = legs[s], [bx, bz] = legs[(s + 1) % 4];
      pipe(g, [[ax * w0, y0, az * w0], [bx * w1, y1, bz * w1]], palette.steel, 0.015);
    }
  }
  box(g, 0.5, 0.05, 0.5, 0, H, 0, palette.dark);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3 + 0.4;
    box(g, 0.18, 0.75, 0.07, Math.cos(a) * 0.3, H + 0.1, Math.sin(a) * 0.3, palette.white, [0, -a + Math.PI / 2, 0]);
  }
  pipe(g, [[0, H + 0.05, 0], [0, H + 0.6, 0]], palette.steel, 0.02);
  const sat = [1.6, 3.6, -0.2], phone = [1.55, 0.45, 0.55];
  miniSat(g, sat[0], sat[1], sat[2], 1.1, 0.4);
  box(g, 0.36, 0.74, 0.05, phone[0], phone[1], phone[2], palette.dark, [0, 0.7, 0]);
  box(g, 0.3, 0.6, 0.02, phone[0] + 0.02, phone[1] + 0.01, phone[2] + 0.025, palette.blue, [0, 0.7, 0]);
  beam(g, [sat[0], sat[1] - 0.2, sat[2]], [phone[0], phone[1] + 0.48, phone[2]], 10, palette.beam, 0.035);
  beam(g, [0.25, H + 0.05, 0.1], [phone[0] - 0.15, phone[1] + 0.3, phone[2]], 8, palette.purple, 0.022);
}

// Screen-space footprint of an object as seen from a camera direction (orthographic).
function footprint(obj, from) {
  const f = from.clone().normalize().negate(), r = new THREE.Vector3().crossVectors(f, UP).normalize(), u = new THREE.Vector3().crossVectors(r, f);
  const bb = new THREE.Box3().setFromObject(obj), p = new THREE.Vector3();
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  obj.updateMatrixWorld(true);
  obj.traverse(o => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 3) {
      p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const a = p.dot(r), b = p.dot(u);
      x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b);
    }
  });
  return {w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, r, u, bb};
}
// Normalize every part: centre on its bounds and fit the same on-screen box from the main view.
const VIEW = new THREE.Vector3(10, 8, 12), FIT_W = 5.0, FIT_H = 3.7;
const partInfo = parts.map(g => {
  const fp = footprint(g, VIEW), c = fp.bb.getCenter(new THREE.Vector3());
  g.children.forEach(o => o.position.sub(c));
  const k = Math.min(FIT_W / fp.w, FIT_H / fp.h, 1.6);
  g.scale.setScalar(k);
  return {top: fp.bb.getSize(new THREE.Vector3()).y * k / 2};
});

// Screen-aligned 2×2 slots for each lab (camera looks from +x,+y,+z).
const right = new THREE.Vector3(12, 0, -10).normalize();
const slot = (col, row) => [right.x * col * 3.0, 1 + row, right.z * col * 3.0];
const quad = ids => Object.fromEntries(ids.map((id, k) => [id, slot(k % 2 ? 1 : -1, k < 2 ? 2.0 : -2.8)]));
const layouts = [quad([0, 1, 2, 3]), quad([4, 5, 6, 7]), quad([8, 9, 10, 11]), quad([12, 13, 14, 15])];
const toward = new THREE.Vector3(10, 8, 12).normalize();
const center = new THREE.Vector3(0, 1, 0);

let renderer;
try { renderer = new THREE.WebGLRenderer({antialias: true, alpha: true}); }
catch (error) { mount.innerHTML = '<p class="model-error">此瀏覽器無法顯示 3D 模型；仍可點選產業組件，查看相關股票與公司資料。</p>'; throw error; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.append(renderer.domElement);
renderer.domElement.setAttribute('aria-label', '可拆解的低軌衛星產業組件手繪風 3D 模型');
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xfff6de, 0x8c93b0, 2.8));
const key = new THREE.DirectionalLight(0xffebcb, 3); key.position.set(-4, 8, 7); scene.add(key);
const fill = new THREE.DirectionalLight(0xd5e1ff, 1.2); fill.position.set(5, 3, -5); scene.add(fill);
const camera = new THREE.OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
camera.position.set(10, 9, 12);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = !reduced;
controls.minPolarAngle = 0.3; controls.maxPolarAngle = 1.5;
const modelRoot = new THREE.Group();
scene.add(modelRoot);
let currentLab = 0, active = 0, extracted = false, assembled = false, solo = false, last = performance.now(), visible = true;
const states = parts.map(() => ({goal: new THREE.Vector3(), opacity: 1, targetOpacity: 1}));
const labelHost = document.querySelector('#industry-labels');

function updateTargets() {
  const ids = window.INDUSTRY_LABS[currentLab].parts;
  parts.forEach((g, i) => {
    g.visible = ids.includes(i) && (!solo || i === active);
    if (!ids.includes(i)) return;
    const goal = states[i].goal.set(...layouts[currentLab][i]);
    if (assembled) goal.sub(center).multiplyScalar(0.8).add(center);
    if (extracted && i === active && !solo) { goal.lerp(center, 0.3).addScaledVector(toward, 1.6); goal.y += 0.35; }
    if (solo) goal.copy(center);
    states[i].targetOpacity = extracted && i !== active ? 0.25 : 1;
  });
  document.querySelector('.lab-model-note').textContent = currentLab === 0
    ? '晶圓、晶片與元件為放大示意，非共同實物比例。'
    : '依產業角色重建的技術示意模型 · 非特定公司產品或實際比例';
  document.querySelector('#lab-caption').textContent = extracted ? '已抽出 · ' + window.INDUSTRIES[active].component : assembled ? '收合全貌 · 點選零件拆解' : '展開全貌 · 點選零件拆解';
  document.querySelector('#lab-assemble').textContent = assembled ? '展開模型' : '收合模型';
  document.querySelector('#lab-assemble').setAttribute('aria-pressed', assembled);
  document.querySelector('#lab-solo').setAttribute('aria-pressed', solo);
  mount.dataset.lab = currentLab;
  mount.dataset.activeIndustry = active;
  mount.dataset.state = extracted ? 'extracted' : assembled ? 'assembled' : 'expanded';
}
function setScene(lab) {
  if (lab === currentLab && modelRoot.children.length) return;
  currentLab = lab;
  modelRoot.clear();
  window.INDUSTRY_LABS[lab].parts.forEach(i => { modelRoot.add(parts[i]); parts[i].position.set(...layouts[lab][i]); states[i].opacity = 1; });
  labelHost.innerHTML = window.INDUSTRY_LABS[lab].parts.map(i => `<button class="lab-part-label" data-model-part="${i}" aria-label="抽出 ${window.INDUSTRIES[i].name}">${String(i).padStart(2, '0')} <strong>${window.INDUSTRIES[i].name}</strong></button>`).join('');
  labelHost.querySelectorAll('button').forEach(b => b.onclick = () => window.selectIndustry(Number(b.dataset.modelPart)));
}
window.addEventListener('industry-select', e => {
  const {index, lab, extract} = e.detail;
  setScene(lab);
  active = index; extracted = extract; solo = false; assembled = false;
  updateTargets();
});
document.querySelector('#lab-assemble').onclick = () => { assembled = !assembled; extracted = false; solo = false; updateTargets(); };
document.querySelector('#lab-solo').onclick = () => { solo = !solo; extracted = true; updateTargets(); };
document.querySelector('#lab-reset').onclick = () => {
  camera.position.set(10, 9, 12); controls.target.set(0, 1, 0); controls.update();
  assembled = false; solo = false; extracted = false; updateTargets();
};
let down;
renderer.domElement.addEventListener('pointerdown', e => down = {x: e.clientX, y: e.clientY});
const ray = new THREE.Raycaster();
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const b = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1), camera);
  const hit = ray.intersectObjects(modelRoot.children, true).find(h => h.object.userData.industry !== undefined && h.object.parent.visible);
  if (hit) window.selectIndustry(hit.object.userData.industry);
});
function resize() {
  const w = mount.clientWidth, h = mount.clientHeight;
  if (!w || !h) return;
  const aspect = w / h, span = Math.max(5.4, 6.5 / aspect);
  camera.left = -span * aspect; camera.right = span * aspect; camera.top = span; camera.bottom = -span;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
new ResizeObserver(resize).observe(mount);
new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(mount);

// Render component thumbnails from the same models; no stock photography in the UI.
const thumbRenderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
thumbRenderer.setSize(200, 150);
thumbRenderer.outputColorSpace = THREE.SRGBColorSpace;
const thumbScene = new THREE.Scene();
thumbScene.add(new THREE.HemisphereLight(0xfff4dd, 0x888ba8, 3));
const tl = new THREE.DirectionalLight(0xffebd1, 3); tl.position.set(-3, 7, 5); thumbScene.add(tl);
const tc = new THREE.OrthographicCamera(-2, 2, 1.5, -1.5, 0.1, 100);
parts.forEach((part, i) => {
  const clone = part.clone(true);
  clone.position.set(0, 0, 0);
  const fp = footprint(clone, new THREE.Vector3(8, 6, 9));
  clone.position.sub(fp.r.clone().multiplyScalar(fp.cx)).sub(fp.u.clone().multiplyScalar(fp.cy));
  thumbScene.add(clone);
  const extent = Math.max(fp.h, fp.w / 1.33) * 0.56;
  tc.left = -extent * 1.33; tc.right = extent * 1.33; tc.top = extent; tc.bottom = -extent;
  tc.position.set(8, 6, 9); tc.lookAt(0, 0, 0); tc.updateProjectionMatrix();
  thumbRenderer.render(thumbScene, tc);
  const img = document.querySelector(`[data-sketch="${i}"]`);
  if (img) { img.src = thumbRenderer.domElement.toDataURL('image/png'); img.hidden = false; }
  thumbScene.remove(clone);
});
thumbRenderer.dispose();

const initial = window.getIndustrySelection();
setScene(initial.lab);
active = initial.index;
updateTargets();
resize();
const projected = new THREE.Vector3();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!visible) return;
  controls.update();
  camera.zoom = THREE.MathUtils.damp(camera.zoom, solo ? 1.75 : extracted ? 0.95 : 1, 6, dt);
  camera.updateProjectionMatrix();
  modelRoot.children.forEach(g => {
    const i = g.userData.industry, s = states[i];
    if (reduced) g.position.copy(s.goal); else g.position.lerp(s.goal, 1 - Math.exp(-5 * dt));
    s.opacity = THREE.MathUtils.damp(s.opacity, s.targetOpacity, 7, dt);
    g.traverse(o => {
      if (o.isMesh) { o.material.transparent = s.opacity < 0.99; o.material.opacity = s.opacity; o.material.depthWrite = s.opacity > 0.9; }
      if (o.isLineSegments) o.material.opacity = 0.65 * s.opacity;
    });
    const label = labelHost.querySelector(`[data-model-part="${i}"]`);
    if (label) {
      projected.copy(g.position);
      projected.y += partInfo[i].top + 0.45;
      projected.project(camera);
      label.style.left = Math.max(70, Math.min(mount.clientWidth - 70, (projected.x * 0.5 + 0.5) * mount.clientWidth)) + 'px';
      label.style.top = Math.max(22, Math.min(mount.clientHeight - 40, (-projected.y * 0.5 + 0.5) * mount.clientHeight)) + 'px';
      label.style.display = solo && i !== active ? 'none' : '';
      label.classList.toggle('chosen', extracted && i === active);
    }
  });
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
mount.dataset.ready = 'true';
