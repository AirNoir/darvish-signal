// 機器人（六軸協作手臂）3D 拆解模型 — 教學示意，直立姿態分層，非特定機種複刻。
// 分層：0 視覺與夾爪 / 1 手腕與諧波減速機 / 2 前臂 / 3 肘關節伺服 / 4 上臂與肩 / 5 基座與控制器
import { initModel, colors } from './sector-model.js';

initModel({
  ariaLabel: '可旋轉與拆解的機器人手臂 3D 模型',
  groundY: -0.4,
  frameHalf: 6.4,
  cameraTarget: [0, 2.3, 0],
  expandedY: [5.3, 4.35, 3.35, 2.45, 1.3, 0],
  assembledY: [4.25, 3.55, 2.75, 2.25, 1.1, 0],
  layerNames: ['視覺與夾爪', '手腕與諧波減速機', '前臂桿件', '肘關節伺服', '上臂與肩關節', '基座與控制器'],
  labelsData: [
    { i: 0, point: [0.55, 0.3, -0.6], packed: [0.55, 0.3, -1.4] },
    { i: 1, point: [0.6, 0.25, -0.55], packed: [1.5, 0.25, -0.8] },
    { i: 2, point: [0.5, 0.45, -0.55], packed: [0.5, 0.45, -1.6] },
    { i: 3, point: [0.75, 0.2, -0.5], packed: [1.7, 0.2, -0.9] },
    { i: 4, point: [0.7, 0.55, -0.6], packed: [0.7, 0.55, -1.8] },
    { i: 5, point: [1.95, 0.35, -0.9] },
  ],
  build({ THREE, groups, box, cyl, ring, line, instances, grid }) {
    // 0 — 視覺與夾爪：法蘭在底部（接手腕）、夾爪與相機朝上
    const eff = groups[0];
    cyl(eff, 0.24, 0.2, 0.17, 0, 0.09, 0, colors.mist, { seg: 16 }); // 連接法蘭
    box(eff, 0.5, 0.3, 0.34, 0, 0.35, 0, colors.cream); // 夾爪本體
    box(eff, 0.2, 0.16, 0.14, 0, 0.38, 0.26, colors.dark); // 相機模組
    cyl(eff, 0.055, 0.055, 0.05, 0, 0.38, 0.35, colors.sky, { axis: 'z', seg: 12, outline: false }); // 鏡頭
    ring(eff, 0.075, 0.014, 0, 0.38, 0.355, colors.gold, 'z');
    for (const s of [-1, 1]) { // 兩指（朝上）
      box(eff, 0.09, 0.34, 0.16, s * 0.16, 0.67, 0, colors.slate);
      box(eff, 0.07, 0.16, 0.14, s * 0.12, 0.86, 0, colors.steel, false); // 指尖內收
    }
    line(eff, [[0, 0.2, 0.1], [0, 0.38, 0.19]], colors.copper, 0.015);

    // 1 — 手腕與諧波減速機：三軸手腕 + 剖面露出的諧波減速機
    const wrist = groups[1];
    cyl(wrist, 0.22, 0.22, 0.42, 0, 0.5, 0, colors.cream, { seg: 18 }); // 腕軸 6
    cyl(wrist, 0.24, 0.24, 0.34, 0, 0.18, 0, colors.cream, { axis: 'x', seg: 18 }); // 腕軸 5
    // 諧波減速機剖面（axis 5 外露）：外圈剛輪、金色柔輪、橢圓波發生器
    ring(wrist, 0.26, 0.045, 0.24, 0.18, 0, colors.slate, 'x');
    ring(wrist, 0.19, 0.03, 0.26, 0.18, 0, colors.gold, 'x');
    cyl(wrist, 0.12, 0.12, 0.05, 0.28, 0.18, 0, colors.copper, { axis: 'x', seg: 14, outline: false });
    cyl(wrist, 0.2, 0.2, 0.3, 0, -0.14, 0, colors.cream, { seg: 18 }); // 腕軸 4 接前臂
    ring(wrist, 0.21, 0.02, 0, 0.33, 0, colors.steel);

    // 2 — 前臂桿件：鋁合金臂管 + 線纜導管
    const fore = groups[2];
    cyl(fore, 0.19, 0.22, 1.05, 0, 0.5, 0, colors.cream, { seg: 18 });
    ring(fore, 0.2, 0.025, 0, 1.0, 0, colors.steel);
    ring(fore, 0.23, 0.025, 0, 0.02, 0, colors.steel);
    line(fore, [[0.2, 0.05, 0.08], [0.24, 0.5, 0.1], [0.2, 0.95, 0.08]], colors.dark, 0.035); // 線纜
    box(fore, 0.1, 0.2, 0.02, 0, 0.5, 0.215, colors.safety, false); // 品牌飾條

    // 3 — 肘關節伺服：關節鼓 + 伺服馬達 + 減速機剖面
    const elbow = groups[3];
    cyl(elbow, 0.28, 0.28, 0.46, 0, 0.25, 0, colors.cream, { axis: 'x', seg: 20 }); // 關節鼓
    cyl(elbow, 0.16, 0.16, 0.28, -0.35, 0.25, 0, colors.slate, { axis: 'x', seg: 16 }); // 伺服馬達
    ring(elbow, 0.17, 0.028, -0.5, 0.25, 0, colors.copper, 'x'); // 編碼器
    ring(elbow, 0.3, 0.05, 0.26, 0.25, 0, colors.slate, 'x'); // 剛輪
    ring(elbow, 0.22, 0.035, 0.28, 0.25, 0, colors.gold, 'x'); // 柔輪
    cyl(elbow, 0.13, 0.13, 0.06, 0.31, 0.25, 0, colors.copper, { axis: 'x', seg: 14, outline: false }); // 波發生器
    box(elbow, 0.2, 0.12, 0.3, -0.05, -0.05, 0, colors.steel, false); // 接頭

    // 4 — 上臂與肩關節
    const upper = groups[4];
    cyl(upper, 0.24, 0.27, 1.0, 0, 0.75, 0, colors.cream, { seg: 18 }); // 上臂管
    cyl(upper, 0.32, 0.32, 0.5, 0, 0.12, 0, colors.cream, { axis: 'x', seg: 20 }); // 肩關節鼓
    ring(upper, 0.34, 0.05, 0.28, 0.12, 0, colors.slate, 'x');
    ring(upper, 0.25, 0.035, 0.3, 0.12, 0, colors.gold, 'x');
    line(upper, [[0.26, 0.3, 0.1], [0.3, 0.8, 0.12], [0.26, 1.2, 0.1]], colors.dark, 0.035);
    box(upper, 0.1, 0.3, 0.02, 0, 0.75, 0.265, colors.safety, false);

    // 5 — 基座與控制器：底座迴轉軸 + 控制櫃 + 教導器
    const base = groups[5];
    cyl(base, 0.42, 0.5, 0.3, 0, 0.15, 0, colors.slate, { seg: 22 }); // 底座
    cyl(base, 0.34, 0.38, 0.35, 0, 0.47, 0, colors.cream, { seg: 20 }); // 迴轉軸 1
    ring(base, 0.36, 0.03, 0, 0.32, 0, colors.gold); // 迴轉軸承
    instances(base, new THREE.BoxGeometry(0.1, 0.03, 0.1),
      [[0.3, 0.02, 0.3], [-0.3, 0.02, 0.3], [0.3, 0.02, -0.3], [-0.3, 0.02, -0.3]], colors.steel); // 地腳
    box(base, 0.95, 0.75, 0.65, 1.55, 0.38, 0, colors.dark); // 控制櫃
    instances(base, new THREE.BoxGeometry(0.7, 0.03, 0.04),
      [[1.55, 0.2, 0.34], [1.55, 0.3, 0.34], [1.55, 0.4, 0.34]], colors.steel); // 散熱柵
    box(base, 0.2, 0.08, 0.3, 1.3, 0.8, 0.1, colors.sky, false); // 狀態燈
    box(base, 0.3, 0.42, 0.06, 2.2, 0.3, 0.2, colors.mist); // 教導器
    box(base, 0.22, 0.26, 0.02, 2.2, 0.34, 0.24, colors.sky, false); // 螢幕
    line(base, [[0.4, 0.1, 0], [1.05, 0.1, 0]], colors.dark, 0.04); // 動力線
    line(base, [[2.05, 0.3, 0.2], [1.9, 0.15, 0.1], [2.0, 0.05, 0]], colors.dark, 0.025);
  },
});
