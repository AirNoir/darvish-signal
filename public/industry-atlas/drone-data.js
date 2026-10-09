// 無人機產業地圖資料：產業鏈環節 + 台股代表性公司。
// 整理代表性角色，並非特定機種供應鏈或完整名單；市場別 TWSE = 上市、TPEx = 上櫃。
window.SECTOR={
 id:'drone',
 shortName:'無人機',
 title:'無人機產業地圖',
 eyebrow:'DARVISH LAB / DRONE ATLAS',
 tagline:'從複合材料機身到資料鏈，拆開一架無人機，找到產業鏈上的台灣企業。',
 stages:[
  {name:'機身與複合材料',en:'AIRFRAME & COMPOSITES',desc:'碳纖維複合材料構成輕量化機身與結構件；航太級結構決定酬載能力與續航表現。',codes:['4536','2634']},
  {name:'動力與馬達',en:'PROPULSION & MOTORS',desc:'無刷馬達與電子變速器（ESC）驅動旋翼；動力系統的效率與可靠度直接影響飛行時間。',codes:['8033','1504']},
  {name:'飛控航電與整機',en:'FLIGHT CONTROL & SYSTEMS',desc:'飛控電腦整合慣性感測、衛星定位與導航演算法；台灣整機廠涵蓋測繪、農噴、巡檢與安防應用。',codes:['8495','5371','6928','8033']},
  {name:'酬載與光學',en:'PAYLOAD & OPTICS',desc:'光電吊艙、變焦鏡頭與影像感測器是無人機的眼睛，支援空拍測繪、紅外熱像與目標追蹤。',codes:['3019','3227']},
  {name:'通訊與資料鏈',en:'DATALINK & COMMS',desc:'影像回傳與遙控指令仰賴無線資料鏈；微波元件、天線與網通模組決定距離與抗干擾能力。',codes:['6285','3380','3491','6928']},
  {name:'電池與能源',en:'BATTERY & POWER',desc:'高能量密度鋰電池模組是續航的天花板；電池管理系統（BMS）兼顧安全與壽命。',codes:['6121','3323']},
  {name:'運算晶片',en:'COMPUTE & SOC',desc:'影像處理、避障與邊緣 AI 需要高效能低功耗晶片；連網晶片支援遠距操控與圖傳。',codes:['2454','3227']},
  {name:'國防應用與地面系統',en:'DEFENSE & GROUND SEGMENT',desc:'軍用無人機與反制系統是政策推動重點；地面控制站使用強固型電腦於野外與國防場景。',codes:['2634','3005','8222']}
 ],
 companies:[
  {name:'拓凱',en:'Topkey',code:'4536',market:'TWSE',category:'複合材料',brief:'碳纖維複合材料大廠，產品涵蓋航太結構件與運動器材。',role:'以碳纖維複合材料技術供應航太等級結構件，是無人機輕量化機身與結構的代表性材料夥伴。',site:'https://www.topkey.com.tw'},
  {name:'漢翔',en:'AIDC',code:'2634',market:'TWSE',category:'航太與國防',brief:'台灣航太龍頭，軍民用機體結構與航空系統整合。',role:'承擔軍用航空器與無人機系統的研製整合角色，涵蓋機體結構、系統工程與國防專案。',site:'https://www.aidc.com.tw'},
  {name:'雷虎科技',en:'Thunder Tiger',code:'8033',market:'TWSE',category:'整機與動力',brief:'遙控模型起家，發展無人機整機、無刷馬達與動力系統。',role:'從遙控模型累積的動力與機構技術延伸到無人機整機，涵蓋多旋翼、無人直升機與水下載具。',site:'https://www.thundertiger.com'},
  {name:'東元',en:'TECO',code:'1504',market:'TWSE',category:'馬達與電驅',brief:'工業馬達大廠，布局電動化與驅動系統。',role:'以馬達與驅動技術為基礎，參與無人載具電動動力系統的供應鏈。',site:'https://www.teco.com.tw'},
  {name:'經緯航太',en:'GEOSAT',code:'8495',market:'TPEx',category:'整機與系統',brief:'測繪與農用無人機整機廠，提供航拍測繪與智慧農業服務。',role:'自主開發定翼與多旋翼無人機，應用於國土測繪、農噴與災防巡檢，是台灣無人機整機代表廠商。',site:'https://www.geosat.com.tw'},
  {name:'中光電',en:'Coretronic',code:'5371',market:'TPEx',category:'整機與系統',brief:'投影與顯示大廠，旗下中光電智能機器人深耕無人機。',role:'子公司中光電智能機器人開發巡檢與安防無人機系統，提供自主飛行與智慧巡檢方案。',site:'https://www.coretronic.com'},
  {name:'攸泰科技',en:'UYeh Tech',code:'6928',market:'TWSE',category:'通訊與系統',brief:'強固型運算與衛星通訊，切入無人機系統市場。',role:'結合衛星通訊與強固運算能力，發展無人機系統與超視距（BVLOS）通訊應用。',site:'https://www.uyehtech.com'},
  {name:'亞光',en:'Asia Optical',code:'3019',market:'TWSE',category:'光學酬載',brief:'光學鏡頭與光電系統廠，供應各式光學模組。',role:'光學鏡頭與光電模組能力延伸至無人機酬載，涵蓋空拍鏡頭與光電感測應用。',site:'https://www.asiaoptical.com'},
  {name:'原相',en:'PixArt',code:'3227',market:'TPEx',category:'影像感測',brief:'影像感測器設計公司，專精光學感測與移動偵測。',role:'影像與光學感測器支援無人機的避障、定高與光流定位等感知功能。',site:'https://www.pixart.com'},
  {name:'啟碁',en:'WNC',code:'6285',market:'TWSE',category:'通訊與資料鏈',brief:'無線通訊模組與天線大廠，涵蓋車用與網通產品。',role:'無線模組、天線與射頻設計能力對應無人機資料鏈與通訊次系統需求。',site:'https://www.wnc.com.tw'},
  {name:'明泰',en:'Alpha Networks',code:'3380',market:'TWSE',category:'通訊與資料鏈',brief:'網通設備設計製造廠，產品涵蓋有線與無線網路。',role:'網通設備與無線傳輸技術支援無人機圖傳、地面網路與回傳基礎設施。',site:'https://www.alphanetworks.com'},
  {name:'昇達科',en:'Universal Microwave',code:'3491',market:'TWSE',category:'微波元件',brief:'微波與毫米波元件廠，供應衛星與點對點通訊。',role:'微波／毫米波被動元件應用於衛星通訊與高頻資料鏈，對應長距離無人機通訊需求。',site:'https://www.umt.com.tw'},
  {name:'新普',en:'Simplo',code:'6121',market:'TPEx',category:'電池模組',brief:'全球筆電電池模組龍頭，擴展電動載具電池。',role:'鋰電池模組與電池管理系統能力延伸至無人載具的高能量密度電池需求。',site:'https://www.simplo.com.tw'},
  {name:'加百裕',en:'Celxpert',code:'3323',market:'TPEx',category:'電池模組',brief:'鋰電池模組廠，產品涵蓋筆電、電動工具與載具。',role:'提供鋰電池模組設計製造，對應無人機與電動載具的電池組需求。',site:'https://www.celxpert.com.tw'},
  {name:'聯發科',en:'MediaTek',code:'2454',market:'TWSE',category:'運算晶片',brief:'全球前列 IC 設計公司，SoC 涵蓋行動、連網與車用。',role:'SoC 與連網晶片提供影像處理、邊緣運算與通訊能力，是無人機大腦的晶片選項之一。',site:'https://www.mediatek.tw'},
  {name:'神基',en:'Getac',code:'3005',market:'TWSE',category:'強固運算',brief:'強固型筆電與平板大廠，深耕國防與野外應用。',role:'強固型電腦應用於無人機地面控制站，支援國防、巡檢與戶外任務環境。',site:'https://www.getacgroup.com'},
  {name:'寶一',en:'Power One',code:'8222',market:'TPEx',category:'航太零組件',brief:'航太發動機零組件加工廠，供應國際引擎大廠。',role:'航太等級發動機零組件加工能力，對應無人機與航空動力系統的精密製造需求。',site:'https://www.pfc.com.tw'}
 ]
,
 layers:[
 {
  "zh": "螺旋槳與馬達",
  "en": "PROPULSION",
  "icon": "✛",
  "desc": "四組無刷馬達帶動槳葉產生升力，電子變速器（ESC）以每秒數百次的頻率調整轉速，是懸停穩定性與續航的核心。",
  "tags": [
   "無刷馬達",
   "ESC 電變",
   "槳葉動力"
  ],
  "codes": [
   "8033",
   "1504"
  ]
 },
 {
  "zh": "飛控航電",
  "en": "FLIGHT CONTROLLER",
  "icon": "◈",
  "desc": "飛控電腦融合 IMU、氣壓計與衛星定位訊號，計算姿態並下達動力指令；上下堆疊的電路板是無人機的大腦與小腦。",
  "tags": [
   "飛控",
   "IMU 慣性感測",
   "GNSS 定位"
  ],
  "codes": [
   "8495",
   "5371",
   "2454"
  ]
 },
 {
  "zh": "通訊資料鏈",
  "en": "DATALINK",
  "icon": "⌁",
  "desc": "影像回傳與遙控指令走無線資料鏈；天線、射頻模組與貼片陣列決定傳輸距離、頻寬與抗干擾能力。",
  "tags": [
   "資料鏈",
   "天線",
   "微波元件"
  ],
  "codes": [
   "6285",
   "3380",
   "3491",
   "6928"
  ]
 },
 {
  "zh": "機身與機臂",
  "en": "AIRFRAME",
  "icon": "▣",
  "desc": "碳纖維上下板夾住電裝，四支機臂把動力推到對角線上；輕量化與剛性的平衡決定了酬載能力。",
  "tags": [
   "碳纖複材",
   "結構件",
   "腳架"
  ],
  "codes": [
   "4536",
   "2634"
  ]
 },
 {
  "zh": "電池模組",
  "en": "BATTERY",
  "icon": "▤",
  "desc": "高能量密度鋰電池是續航的天花板；電池管理系統（BMS）監控每顆電芯的電壓與溫度，兼顧安全與壽命。",
  "tags": [
   "鋰電池",
   "BMS",
   "快拆電池包"
  ],
  "codes": [
   "6121",
   "3323"
  ]
 },
 {
  "zh": "酬載雲台",
  "en": "GIMBAL PAYLOAD",
  "icon": "◎",
  "desc": "三軸雲台把相機與機身震動隔離，光學鏡頭與影像感測器是無人機的眼睛，支援測繪、巡檢與熱像偵測。",
  "tags": [
   "三軸雲台",
   "光學鏡頭",
   "影像感測"
  ],
  "codes": [
   "3019",
   "3227"
  ]
 }
]
};
