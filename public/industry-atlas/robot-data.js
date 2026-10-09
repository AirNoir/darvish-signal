// 機器人產業地圖資料：產業鏈環節 + 台股代表性公司。
// 整理代表性角色，並非特定機種供應鏈或完整名單；市場別 TWSE = 上市、TPEx = 上櫃。
window.SECTOR={
 id:'robot',
 shortName:'機器人',
 title:'機器人產業地圖',
 eyebrow:'DARVISH LAB / ROBOTICS ATLAS',
 tagline:'從減速機、伺服驅動到 AI 視覺，拆開一台機器人，找到關節裡的台灣企業。',
 stages:[
  {name:'減速機與關節傳動',en:'REDUCERS & JOINTS',desc:'諧波與行星減速機是機器人關節的核心，決定精度、剛性與壽命；人形機器人讓關節需求倍增。',codes:['2049','4583','1536','6923']},
  {name:'線性傳動與滑軌',en:'LINEAR MOTION',desc:'滾珠螺桿與線性滑軌提供直線運動的精密定位，是自動化設備與直角座標機器人的骨架。',codes:['2049','1597','4540','4576']},
  {name:'伺服馬達與驅動',en:'SERVO & DRIVES',desc:'伺服馬達與驅動器把控制訊號轉成精準動作；台灣廠商涵蓋工業伺服到關節模組。',codes:['2308','1504','1503','4576']},
  {name:'控制器與工業電腦',en:'CONTROLLERS & IPC',desc:'運動控制器與工業電腦是機器人的小腦與神經系統，整合即時控制、安全與通訊。',codes:['2395','6166','8234','2308']},
  {name:'機器視覺與 AI',en:'VISION & AI',desc:'3D 視覺與 AI 讓機器人看得懂環境：定位取放、瑕疵檢測與人機協作的安全感知。',codes:['2359','3455','3227']},
  {name:'氣動與末端執行器',en:'PNEUMATICS & GRIPPERS',desc:'氣動元件與夾爪是機器人與工件接觸的最後一哩，決定抓取的速度與柔性。',codes:['1590']},
  {name:'整機與協作機器人',en:'COBOTS & ROBOT MAKERS',desc:'台灣協作機器人以內建視覺為特色，從工業手臂走向半導體、檢測與服務場景。',codes:['4585','6188','2464']},
  {name:'系統整合與人形機器人',en:'INTEGRATION & HUMANOID',desc:'自動化系統整合把機器人放進產線；AI 工廠與人形機器人是下一階段的整合戰場。',codes:['2317','2464','2308']}
 ],
 companies:[
  {name:'上銀',en:'HIWIN',code:'2049',market:'TWSE',category:'傳動元件',brief:'全球線性傳動大廠：滾珠螺桿、線性滑軌與諧波減速機。',role:'滾珠螺桿與滑軌是精密機械的基礎，諧波減速機與機器人手臂布局直指機器人關節核心。',site:'https://www.hiwin.tw'},
  {name:'台灣精銳',en:'APEX Dynamics',code:'4583',market:'TWSE',category:'減速機',brief:'行星減速機領導廠商，供應自動化與機器人市場。',role:'行星減速機對應機器人與自動化設備的高扭力關節與傳動需求。',site:'https://www.apexdyna.com.tw'},
  {name:'和大',en:'Hota',code:'1536',market:'TWSE',category:'齒輪傳動',brief:'精密齒輪與傳動系統廠，電動車與減速機布局。',role:'精密齒輪加工能力延伸到諧波減速機與機器人關節模組，是人形機器人題材的傳動要角。',site:'https://www.hota.com.tw'},
  {name:'盈錫',en:'Yinsh',code:'6923',market:'TPEx',category:'精密零件',brief:'精密螺帽大廠，跨入減速機與關節模組。',role:'工具機精密螺帽起家，產品線延伸至減速機相關精密零件，卡位機器人關節供應鏈。',site:'https://www.yinsh.com'},
  {name:'直得',en:'Chieftek',code:'1597',market:'TWSE',category:'線性傳動',brief:'微小型線性滑軌與線性馬達廠。',role:'微小型滑軌與線性馬達對應半導體設備與精密自動化的直線運動需求。',site:'https://www.chieftek.com'},
  {name:'全球傳動',en:'TBI Motion',code:'4540',market:'TPEx',category:'線性傳動',brief:'滾珠螺桿與線性傳動元件廠。',role:'滾珠螺桿、滑軌與線性模組供應自動化設備與機器人的直線傳動。',site:'https://www.tbimotion.com.tw'},
  {name:'大銀微系統',en:'HIWIN Mikrosystem',code:'4576',market:'TWSE',category:'驅動與定位',brief:'線性馬達與精密定位系統廠，上銀集團成員。',role:'線性馬達、力矩馬達與驅動器支援機器人與半導體設備的高精度運動控制。',site:'https://www.hiwinmikro.tw'},
  {name:'台達電',en:'Delta',code:'2308',market:'TWSE',category:'自動化與電源',brief:'電源與工業自動化龍頭，伺服、驅動到機器人全布局。',role:'伺服驅動、運動控制、SCARA 機器人與智慧產線方案，是台灣工業自動化的整合代表。',site:'https://www.deltaww.com'},
  {name:'東元',en:'TECO',code:'1504',market:'TWSE',category:'馬達與電驅',brief:'工業馬達大廠，布局伺服與機電整合。',role:'工業馬達與機電整合能力對應機器人與自動化設備的動力需求。',site:'https://www.teco.com.tw'},
  {name:'士電',en:'Shihlin Electric',code:'1503',market:'TWSE',category:'重電與機電',brief:'重電設備與自動化機電廠。',role:'機電與自動化設備能力支援產線電控與機器人周邊系統。',site:'https://www.seec.com.tw'},
  {name:'研華',en:'Advantech',code:'2395',market:'TWSE',category:'工業電腦',brief:'全球工業電腦龍頭，邊緣運算與物聯網平台。',role:'工業電腦與邊緣 AI 平台是機器人控制器與智慧工廠的運算底座。',site:'https://www.advantech.tw'},
  {name:'凌華',en:'ADLINK',code:'6166',market:'TWSE',category:'工業電腦',brief:'邊緣運算與量測自動化廠，深耕機器人控制。',role:'機器人控制器、ROS 生態與邊緣運算模組，直接對應機器人大腦的需求。',site:'https://www.adlinktech.com'},
  {name:'新漢',en:'NEXCOM',code:'8234',market:'TPEx',category:'工業電腦',brief:'工業電腦廠，發展開放式機器人控制平台。',role:'以開放架構切入機器人控制器與智慧製造，提供 EtherCAT 運動控制方案。',site:'https://www.nexcom.com.tw'},
  {name:'所羅門',en:'Solomon',code:'2359',market:'TWSE',category:'機器視覺',brief:'AI 3D 視覺方案商，國際機器人大廠合作夥伴。',role:'AI 3D 視覺讓機器手臂能辨識與取放未知物件，是台灣機器視覺的代表廠商。',site:'https://www.solomon-3d.com'},
  {name:'由田',en:'Utechzone',code:'3455',market:'TPEx',category:'機器視覺',brief:'AOI 光學檢測設備廠。',role:'光學檢測與影像演算法能力對應機器人視覺檢測與自動化品檢場景。',site:'https://www.utechzone.com.tw'},
  {name:'原相',en:'PixArt',code:'3227',market:'TPEx',category:'影像感測',brief:'影像感測器設計公司，專精光學感測。',role:'光學與影像感測器支援機器人的視覺、測距與人機介面感知。',site:'https://www.pixart.com'},
  {name:'亞德客-KY',en:'AirTAC',code:'1590',market:'TWSE',category:'氣動元件',brief:'氣動元件大廠，發展電動夾爪與線性傳動。',role:'氣動元件與夾爪是自動化末端執行器的主力，電動缸布局延伸到機器人應用。',site:'https://www.airtac.com'},
  {name:'達明',en:'Techman Robot',code:'4585',market:'TWSE',category:'協作機器人',brief:'內建視覺的協作機器人廠，全球出貨前列。',role:'台灣協作機器人代表：手臂內建視覺與 AI，應用於電子組裝、檢測與半導體場景。',site:'https://www.tm-robot.com'},
  {name:'廣明',en:'Quanta Storage',code:'6188',market:'TPEx',category:'自動化與零組件',brief:'廣達集團成員，達明機器人母公司。',role:'從儲存裝置轉型自動化，孵化達明機器人並供應機器人零組件與整合服務。',site:'https://www.qsitw.com'},
  {name:'盟立',en:'Mirle',code:'2464',market:'TWSE',category:'系統整合',brief:'自動化系統整合大廠，半導體與面板搬運系統。',role:'把機器人放進產線的整合者：無人搬運、智慧倉儲與廠務自動化系統。',site:'https://www.mirle.com.tw'},
  {name:'鴻海',en:'Foxconn',code:'2317',market:'TWSE',category:'系統整合',brief:'全球電子製造龍頭，AI 工廠與機器人布局。',role:'以燈塔工廠與 AI 平台推進製造自動化，並與國際夥伴布局人形機器人與機器人製造。',site:'https://www.honhai.com'}
 ]
};
