import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const mount=document.querySelector('#chip-stage');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch(error){mount.innerHTML='<div class="model-error">此瀏覽器無法顯示 3D 模型。請開啟硬體加速，或使用支援 WebGL 的瀏覽器。<br>技術說明與股票代碼仍可由左側選單查看。</div>';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;mount.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','可旋轉與拆解的 AI 晶片 3D 模型');
const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(-7,7,7,-7,.1,100);camera.position.set(11,10,14);camera.lookAt(0,2,0);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2,0);controls.enableDamping=!reduced;controls.dampingFactor=.08;controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.35;controls.maxPolarAngle=1.3;controls.minAzimuthAngle=-.15;controls.maxAzimuthAngle=1.4;
scene.add(new THREE.HemisphereLight(0xfff8ee,0x79749a,2.5));const sun=new THREE.DirectionalLight(0xffedda,3.2);sun.position.set(-5,10,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-11;sun.shadow.camera.right=11;sun.shadow.camera.top=11;sun.shadow.camera.bottom=-11;sun.shadow.normalBias=.05;scene.add(sun);const fill=new THREE.DirectionalLight(0xc9d5ff,1.4);fill.position.set(6,4,-5);scene.add(fill);
const colors={silicon:0x454e69,compute:0x96b6cd,cache:0xb0c8cf,gold:0xe6b36b,copper:0xe39770,substrate:0x6f9e91,pcb:0x608577,hbm:0xa6a0c7,cream:0xf2e5c7,dark:0x333a4b};
const gradient=new THREE.DataTexture(new Uint8Array([85,140,210,255]),4,1,THREE.RedFormat);gradient.needsUpdate=true;gradient.minFilter=THREE.NearestFilter;gradient.magFilter=THREE.NearestFilter;
const root=new THREE.Group();scene.add(root);const groups=Array.from({length:6},(_,i)=>{const g=new THREE.Group();g.userData.layer=i;root.add(g);return g;});
const materials=[];
function mat(color){const m=new THREE.MeshToonMaterial({color,gradientMap:gradient});materials.push(m);return m;}
function box(g,w,h,d,x,y,z,color,outline=true){const geo=new THREE.BoxGeometry(w,h,d);const mesh=new THREE.Mesh(geo,mat(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.layer=g.userData.layer;g.add(mesh);if(outline){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x30384e,transparent:true,opacity:.62}));edge.position.copy(mesh.position);g.add(edge);}return mesh;}
function line(g,points,color=colors.gold,width=.025){const path=new THREE.CurvePath();for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i-1]),new THREE.Vector3(...points[i])));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(2,points.length*2),width,4,false),mat(color));mesh.userData.layer=g.userData.layer;g.add(mesh);return mesh;}
function balls(g,positions,r,color){const m=new THREE.InstancedMesh(new THREE.SphereGeometry(r,8,6),mat(color),positions.length);const dummy=new THREE.Object3D();positions.forEach((p,i)=>{dummy.position.set(...p);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)});m.userData.layer=g.userData.layer;m.castShadow=true;g.add(m);return m;}
function pads(g,w,d,y,spacing,r=.035,color=colors.gold){const positions=[];for(let x=-w/2;x<=w/2;x+=spacing)for(let z=-d/2;z<=d/2;z+=spacing)positions.push([x,y,z]);return balls(g,positions,r,color);}
function routes(g,w,d,y,count,color=colors.gold){for(let i=0;i<count;i++){const z=(i/(count-1)-.5)*(d-.5);const x=(i%5)*.12;line(g,[[-w/2+.12,y,z],[-w/4+x,y,z],[-w/8+x,y,z*.5],[w/3,y,z*.5],[w/2-.12,y,z]],color,.018);}}
// GPU: silicon die, repeated compute clusters and a central cache region. Layout
// follows NVIDIA's GH100 block structure; this is a simplified teaching model.
const compute=groups[0];box(compute,2.45,.16,2.4,0,.03,0,colors.silicon);box(compute,2.3,.055,2.25,0,.14,0,colors.gold);box(compute,2.18,.065,2.13,0,.19,0,colors.compute);
for(let x=0;x<4;x++)for(let z=0;z<4;z++){const px=(x-1.5)*.5,pz=(z-1.5)*.47;box(compute,.38,.065,.32,px,.25,pz,(x+z)%3===0?colors.cache:colors.compute);for(let t=0;t<3;t++)box(compute,.08,.012,.21,px+(t-1)*.1,.29,pz,colors.silicon,false);}
box(compute,.12,.055,2.02,0,.31,0,colors.cream);for(let i=0;i<15;i++){const z=-1+i*.14;line(compute,[[-1.05,.32,z],[-.9,.32,z],[.9,.32,z],[1.05,.32,z]],colors.gold,.01)}
// Advanced packaging is the bonding interface, not an extra independent silicon
// wafer. Separate bump arrays and seal/frame show the interconnection plane.
const pkg=groups[1];const bumpPositions=[];for(let x=-1.05;x<1.06;x+=.14)for(let z=-1;z<1.06;z+=.14)bumpPositions.push([x,0,z]);for(const x of [-1.7,1.7])for(const z of [-.8,.8])for(let a=-.32;a<.33;a+=.13)for(let b=-.3;b<.31;b+=.13)bumpPositions.push([x+a,0,z+b]);balls(pkg,bumpPositions,.046,colors.copper);box(pkg,4.75,.08,.09,0,-.1,-1.72,colors.cream);box(pkg,4.75,.08,.09,0,-.1,1.72,colors.cream);box(pkg,.09,.08,3.5,-2.38,-.1,0,colors.cream);box(pkg,.09,.08,3.5,2.38,-.1,0,colors.cream);for(let i=0;i<12;i++)line(pkg,[[-2.25,-.09,-1.4+i*.25],[-1.6,-.09,-1.4+i*.25],[-1.2,-.09,-.7+i*.13]],colors.gold,.012);
// HBM sits alongside the GPU on the same interposer. Eight DRAM plates and
// TSV columns are intentionally exaggerated to make the stack visible.
const memory=groups[2];for(const x of [-1.72,1.72])for(const z of [-.82,.82]){box(memory,.89,.09,.95,x,0,z,colors.silicon);for(let n=0;n<8;n++){const y=.12+n*.09;box(memory,.79,.058,.86,x,y,z,n%2?colors.hbm:0xbfc0da);box(memory,.79,.012,.86,x,y-.035,z,colors.gold,false);}for(const dx of [-.26,.26])for(const dz of [-.29,.29])line(memory,[[x+dx,.04,z+dz],[x+dx,.82,z+dz]],colors.copper,.018);box(memory,.79,.045,.86,x,.86,z,colors.hbm);for(let t=0;t<4;t++)box(memory,.56,.008,.024,x,.89,z-.22+t*.14,colors.cream,false);}
// Large silicon interposer: horizontal redistribution routes and vertical TSVs.
const interposer=groups[3];box(interposer,4.5,.11,3.25,0,0,0,colors.silicon);box(interposer,4.42,.018,3.18,0,.065,0,0x788da6);routes(interposer,4.3,3,.087,15);for(let i=0;i<10;i++){const z=-1.3+i*.29;line(interposer,[[-1.75,.1,z],[-1.3,.1,z],[-.9,.1,z*.55],[1.35,.1,z*.55],[1.75,.1,z]],colors.copper,.012)}pads(interposer,4.1,2.85,-.1,.3,.038);for(let i=0;i<14;i++){const x=-2+i*.3;line(interposer,[[x,-.1,1.5],[x,.09,1.5]],colors.gold,.025);}
// ABF alternates insulating films/copper, with via pathways and BGA balls.
const abf=groups[4];for(let n=0;n<5;n++){const y=-.18+n*.075;box(abf,4.95,.045,3.7,0,y,0,n%2?0x99baa7:colors.substrate);routes(abf,4.7,3.4,y+.027,9,n%2?colors.copper:colors.gold);}for(let i=0;i<18;i++){const x=-2.3+i*.27;line(abf,[[x,-.2,1.75],[x,.16,1.75]],colors.copper,.03)}pads(abf,4.5,3.15,-.31,.37,.09,0xd2d2df);
// PCB and power/connector foundation follows the actual H100 SXM5 module photo.
const pcb=groups[5];box(pcb,6.2,.22,4.25,0,0,0,colors.pcb);routes(pcb,5.9,3.9,.13,16,colors.copper);for(const x of [-2.65,2.65])for(let z=-1.55;z<=1.56;z+=.48){box(pcb,.48,.24,.34,x,.24,z,colors.silicon);box(pcb,.31,.02,.25,x,.37,z,colors.dark,false);for(const dx of [-.2,.2])box(pcb,.045,.08,.24,x+dx,.2,z,colors.gold,false);}for(let i=0;i<7;i++){const x=-1.55+i*.51;box(pcb,.32,.22,.34,x,.24,1.73,colors.cream);box(pcb,.31,.08,.33,x,.39,1.73,colors.silicon);}for(let i=0;i<15;i++){const x=-2.7+i*.38;box(pcb,.25,.09,.25,x,.17,-1.85,colors.gold,false);}const displayBase=box(pcb,6.5,.21,4.55,0,-.31,0,colors.dark);for(const x of [-2.8,2.8])for(const z of [-1.8,1.8]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.13,.04,6,16),mat(colors.copper));ring.rotation.x=Math.PI/2;ring.position.set(x,.14,z);pcb.add(ring);}

const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.7;ground.receiveShadow=true;scene.add(ground);
const guide=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0xc2a27f,dashSize:.12,gapSize:.09,transparent:true,opacity:.55}));scene.add(guide);
const expandedY=[3.3,2.7,3.3,2.05,.95,.05],assembledY=[.99,.8,.99,.66,.37,.02];
let active=-1,mode='expanded',solo=false,started=performance.now();
const selectedAnchor=new THREE.Vector3(4.2,2,-2.4),selectedGoal=new THREE.Vector3();
const state=groups.map((g,i)=>({position:new THREE.Vector3(0,expandedY[i],0),from:new THREE.Vector3(0,expandedY[i],0),to:new THREE.Vector3(0,expandedY[i],0),fromYaw:0,toYaw:0,fromScale:1,toScale:1,opacity:1,targetOpacity:1}));groups.forEach((g,i)=>g.position.copy(state[i].position));
const label=document.querySelector('#part-label'),labels=document.querySelector('#model-labels');
const labelsData=[{i:0,point:[1.2,.35,0]},{i:2,point:[1.85,.9,-.7]},{i:1,point:[2.3,0,.4]},{i:3,point:[2.25,0,.9]},{i:4,point:[2.5,-.03,1.1]},{i:5,point:[3.1,.1,1.2]}];
labelsData.forEach(({i})=>{const b=document.createElement('button');b.className='model-label';b.dataset.part=i;b.innerHTML=`<span>0${i+1}</span><b>${['AI 運算','先進封裝','HBM','中介層','ABF','PCB'][i]}</b>`;b.setAttribute('aria-label','抽出'+['AI 運算核心','先進封裝','HBM 記憶體','矽中介層','ABF 載板','PCB 伺服器'][i]);b.onclick=()=>window.selectChipLayer(i);labels.append(b);});
function setTargets(){
 const y=mode==='assembled'?assembledY:expandedY;
 const narrow=mount.clientWidth<480;
 const right=new THREE.Vector3().subVectors(camera.position,controls.target).cross(camera.up).normalize().negate();
 selectedGoal.copy(right).multiplyScalar(solo?0:narrow?1.8:4.1);selectedGoal.y=solo?2.2:narrow?3.7:2.2;
 groups.forEach((g,i)=>{
  const s=state[i];s.from.copy(g.position);s.fromYaw=g.rotation.y;s.fromScale=g.scale.x;
  s.to.copy(right).multiplyScalar(active>=0?(narrow?-1.4:-1.7):0);s.to.y=active>=0&&narrow?y[i]*.7-.5:y[i];
  s.toScale=active<0?1:narrow?.68:1;
  if(i===active){s.to.copy(selectedGoal);s.toScale=solo?(narrow?1.05:1.5):narrow?.85:1;}
  s.toYaw=i===active?-.22:0;s.targetOpacity=active<0||i===active?1:.22;
  g.visible=!(solo&&active>=0&&i!==active);
 });
 started=performance.now();guide.visible=active>=0&&!solo;label.classList.toggle('visible',active>=0);
 mount.dataset.state=active<0?mode:'extracted';mount.dataset.activeLayer=String(active);mount.dataset.solo=String(solo);
 document.querySelectorAll('.model-label').forEach(b=>{b.classList.toggle('chosen',Number(b.dataset.part)===active);b.tabIndex=active<0?0:-1;});
 document.querySelector('#solo').disabled=active<0;document.querySelector('#solo').setAttribute('aria-pressed',solo);
 document.querySelectorAll('[data-mode]').forEach(b=>{const on=active<0&&b.dataset.mode===mode;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});
}
window.addEventListener('chip-layer-select',e=>{active=e.detail;solo=false;setTargets();});
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{active=-1;mode=b.dataset.mode;solo=false;setTargets();document.querySelector('#selection-caption').textContent=mode==='expanded'?'展開全貌 · 點選任一層抽出':'完整組裝 · 點選任一層抽出';};
document.querySelector('#solo').onclick=()=>{if(active<0)return;solo=!solo;setTargets();};document.querySelector('#reset-view').onclick=()=>{camera.position.set(11,10,14);controls.target.set(0,2,0);controls.update();setTargets();};
let pointerDown;renderer.domElement.addEventListener('pointerdown',e=>pointerDown={x:e.clientX,y:e.clientY});const ray=new THREE.Raycaster();renderer.domElement.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>5)return;const rect=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(groups,true).find(h=>h.object.userData.layer!==undefined&&h.object.visible&&h.object.parent.visible);if(hit)window.selectChipLayer(hit.object.userData.layer);});
function resize(){const w=mount.clientWidth,h=mount.clientHeight,aspect=w/h;camera.left=-6.1*aspect;camera.right=6.1*aspect;camera.top=6.1;camera.bottom=-6.1;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(()=>{resize();setTargets();}).observe(mount);resize();setTargets();
const temp=new THREE.Vector3();function project(v){temp.copy(v).project(camera);return {x:(temp.x*.5+.5)*mount.clientWidth,y:(-.5*temp.y+.5)*mount.clientHeight};}
let last=performance.now(),visible=true;new IntersectionObserver(([entry])=>{visible=entry.isIntersecting}).observe(mount);
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible)return;controls.update();const goalZoom=active<0?(mount.clientWidth<480?1.25:1.65):solo?1.16:(mount.clientWidth<480?1:1.15);camera.zoom=reduced?goalZoom:THREE.MathUtils.damp(camera.zoom,goalZoom,6,dt);camera.updateProjectionMatrix();const t=reduced?1:Math.min((now-started)/1050,1),ease=1-Math.pow(1-t,4);groups.forEach((g,i)=>{const s=state[i];g.position.lerpVectors(s.from,s.to,ease);if(active===i&&t<1&&!reduced)g.position.y+=Math.sin(t*Math.PI)*.85;g.rotation.y=THREE.MathUtils.lerp(s.fromYaw,s.toYaw,ease);g.scale.setScalar(THREE.MathUtils.lerp(s.fromScale,s.toScale,ease));s.opacity=reduced?s.targetOpacity:THREE.MathUtils.damp(s.opacity,s.targetOpacity,7,dt);g.traverse(o=>{if(o.isMesh){o.material.transparent=s.opacity<.99;o.material.opacity=s.opacity;o.material.depthWrite=s.opacity>.9;}if(o.isLineSegments)o.material.opacity=.55*s.opacity;});});
labelsData.forEach(({i,point})=>{const b=labels.querySelector(`[data-part="${i}"]`);temp.set(...point);groups[i].localToWorld(temp);const p=project(temp);b.style.transform=`translate(${p.x}px,${p.y}px)`;b.style.opacity=active<0?1:0;b.style.pointerEvents=active<0?'auto':'none';});
if(active>=0){temp.copy(groups[active].position);const p=project(temp);label.style.left=p.x+'px';label.style.top=(p.y+(mount.clientWidth<480?65:90))+'px';const s=groups[active].position;guide.geometry.setFromPoints([new THREE.Vector3(-1.3,expandedY[active],.7),s]);guide.computeLineDistances();}
renderer.render(scene,camera);}
requestAnimationFrame(frame);mount.dataset.ready='true';
