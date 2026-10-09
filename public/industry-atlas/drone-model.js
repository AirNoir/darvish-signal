// 無人機（四旋翼）3D 拆解模型 — 教學示意，比例與間距放大，非特定機種複刻。
// 分層：0 螺旋槳與馬達 / 1 飛控航電 / 2 通訊資料鏈 / 3 機身與機臂 / 4 電池 / 5 酬載雲台
import { initModel, colors } from './sector-model.js';

const ARMS = [[1.15, 1.15], [1.15, -1.15], [-1.15, 1.15], [-1.15, -1.15]];

initModel({
  ariaLabel: '可旋轉與拆解的無人機 3D 模型',
  groundY: -1.2,
  expandedY: [4.5, 3.55, 2.75, 1.85, 0.9, -0.15],
  assembledY: [2.08, 1.86, 2.0, 1.72, 1.45, 0.9],
  layerNames: ['螺旋槳與馬達', '飛控航電', '通訊資料鏈', '機身與機臂', '電池模組', '酬載雲台'],
  labelsData: [
    { i: 0, point: [1.15, 0.45, -1.75] },
    { i: 1, point: [0.55, 0.3, -0.75], packed: [0.55, 0.3, -1.9] },
    { i: 2, point: [0.9, 0.55, -0.5], packed: [2.0, 0.55, -0.9] },
    { i: 3, point: [1.8, 0.1, -1.3] },
    { i: 4, point: [0.85, 0.2, -0.55], packed: [0.85, 0.2, -2.2] },
    { i: 5, point: [0.55, 0.25, -0.75], packed: [0.55, -0.4, -1.5] },
  ],
  build({ THREE, groups, box, cyl, ring, line, instances, grid }) {
    // 0 — 螺旋槳與馬達：四組無刷馬達 + 雙葉槳 + 槳帽
    const prop = groups[0];
    ARMS.forEach(([x, z], k) => {
      cyl(prop, 0.16, 0.19, 0.22, x, 0.11, z, colors.dark, { seg: 16 }); // 馬達定子
      ring(prop, 0.17, 0.03, x, 0.23, z, colors.copper); // 線圈示意
      cyl(prop, 0.14, 0.14, 0.08, x, 0.28, z, colors.slate, { seg: 16 }); // 轉子鐘罩
      cyl(prop, 0.045, 0.045, 0.1, x, 0.36, z, colors.gold, { seg: 10, outline: false }); // 軸
      const yaw = (k % 2 ? 1 : -1) * 0.65;
      for (const s of [0, Math.PI]) {
        const blade = box(prop, 0.82, 0.03, 0.14, 0, 0, 0, colors.carbon, false);
        blade.position.set(x + Math.cos(s + yaw) * 0.45, 0.42, z + Math.sin(s + yaw) * 0.45);
        blade.rotation.y = -(s + yaw);
        blade.rotation.x = 0.12;
      }
      cyl(prop, 0.05, 0.07, 0.07, x, 0.45, z, colors.safety, { seg: 10, outline: false }); // 槳帽
    });

    // 1 — 飛控航電：堆疊電路板（FC + ESC 分電板）、IMU、GPS 天線
    const fc = groups[1];
    box(fc, 0.95, 0.05, 0.95, 0, 0.025, 0, colors.pcb);
    box(fc, 0.8, 0.05, 0.8, 0, 0.2, 0, colors.pcb);
    for (const [x, z] of [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]])
      cyl(fc, 0.03, 0.03, 0.15, x, 0.115, z, colors.gold, { seg: 8, outline: false }); // 銅柱
    box(fc, 0.3, 0.07, 0.3, 0, 0.26, 0, colors.dark); // 主控 SoC
    box(fc, 0.16, 0.05, 0.16, 0.28, 0.25, -0.22, colors.slate); // IMU
    instances(fc, new THREE.BoxGeometry(0.09, 0.04, 0.09), grid(3, 2, 0.16, 0.2, 0.07, -0.25, 0.25), colors.slate);
    cyl(fc, 0.3, 0.3, 0.06, 0.75, 0.6, 0.45, colors.cream, { seg: 20 }); // GPS 蘑菇頭
    cyl(fc, 0.04, 0.04, 0.55, 0.75, 0.3, 0.45, colors.steel, { seg: 8, outline: false });
    line(fc, [[0.45, 0.05, 0.4], [0.75, 0.05, 0.45], [0.75, 0.28, 0.45]], colors.copper, 0.02);

    // 2 — 通訊資料鏈：射頻板、雙天線、貼片陣列
    const rf = groups[2];
    box(rf, 1.0, 0.05, 0.7, 0, 0.025, 0, colors.pcb);
    box(rf, 0.26, 0.08, 0.2, -0.25, 0.09, 0, colors.slate); // RF 模組
    box(rf, 0.14, 0.012, 0.1, -0.25, 0.14, 0, colors.gold, false);
    instances(rf, new THREE.BoxGeometry(0.1, 0.03, 0.1), grid(2, 2, 0.16, 0.16, 0.065, 0.28, 0.12), colors.sky); // 貼片
    for (const s of [-1, 1]) {
      cyl(rf, 0.035, 0.035, 0.75, s * 0.42, 0.45, -0.28, colors.dark, { seg: 8, tilt: s * 0.28 }); // 天線
      cyl(rf, 0.05, 0.05, 0.1, s * 0.42, 0.1, -0.3, colors.steel, { seg: 8, outline: false });
    }
    line(rf, [[0.1, 0.05, 0.05], [0.42, 0.05, -0.25]], colors.copper, 0.018);

    // 3 — 機身與機臂：碳纖上下板、四支機臂、腳架
    const frame = groups[3];
    box(frame, 1.5, 0.07, 1.5, 0, 0.26, 0, colors.carbon); // 上板
    box(frame, 1.7, 0.07, 1.7, 0, 0.0, 0, colors.carbon); // 下板
    for (const [x, z] of ARMS) {
      // 機臂：建立後才旋轉對角線方向，描邊會錯位 → 關閉 outline
      const arm = cyl(frame, 0.09, 0.09, 1.3, x * 0.55, 0.13, z * 0.55, colors.dark, { seg: 10, outline: false });
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = Math.atan2(z, x);
      cyl(frame, 0.17, 0.17, 0.06, x, 0.13, z, colors.slate, { seg: 14 }); // 馬達座
    }
    for (const s of [-1, 1]) { // 腳架
      cyl(frame, 0.05, 0.05, 0.75, s * 0.75, -0.35, 0, colors.steel, { seg: 8, tilt: s * 0.35 });
      cyl(frame, 0.05, 0.05, 1.1, s * 0.95, -0.72, 0, colors.steel, { axis: 'z', seg: 8, outline: false });
    }

    // 4 — 電池模組：電池包 + 束帶 + 電芯 + XT 插頭
    const bat = groups[4];
    box(bat, 1.25, 0.42, 0.72, 0, 0.21, 0, colors.cell);
    box(bat, 0.16, 0.46, 0.76, -0.3, 0.21, 0, colors.safety, false); // 束帶
    box(bat, 0.16, 0.46, 0.76, 0.3, 0.21, 0, colors.safety, false);
    instances(bat, new THREE.CylinderGeometry(0.09, 0.09, 0.4, 10),
      grid(5, 1, 0.22, 0, 0.21, 0, 0.47).map(([x, y]) => [x, y, 0.47]), colors.steel); // 電芯示意
    box(bat, 0.18, 0.14, 0.12, 0.68, 0.2, 0, colors.gold); // XT 插頭
    line(bat, [[0.77, 0.2, 0], [1.0, 0.2, 0], [1.0, 0.45, -0.3]], colors.copper, 0.03);

    // 5 — 酬載雲台：三軸雲台 + 相機 + 鏡頭
    const gim = groups[5];
    cyl(gim, 0.16, 0.16, 0.14, 0, 0.55, 0, colors.slate, { seg: 14 }); // 偏航馬達
    box(gim, 0.08, 0.35, 0.08, 0.28, 0.33, 0, colors.steel, false); // 垂臂
    box(gim, 0.4, 0.08, 0.08, 0.1, 0.18, 0, colors.steel, false); // 橫臂
    cyl(gim, 0.1, 0.1, 0.1, -0.14, 0.18, 0, colors.slate, { axis: 'x', seg: 12 }); // 橫滾馬達
    box(gim, 0.46, 0.34, 0.4, 0, 0.0, 0, colors.dark); // 相機本體
    cyl(gim, 0.14, 0.14, 0.18, 0, 0.0, 0.28, colors.slate, { axis: 'z', seg: 16 }); // 鏡筒
    cyl(gim, 0.1, 0.1, 0.03, 0, 0.0, 0.38, colors.sky, { axis: 'z', seg: 16, outline: false }); // 鏡片
    ring(gim, 0.14, 0.02, 0, 0.0, 0.375, colors.gold, 'z'); // 鏡圈（torus 預設朝 +z，不旋轉）
    box(gim, 0.14, 0.08, 0.1, 0.18, 0.22, 0.12, colors.cream, false); // 感測器
  },
});
