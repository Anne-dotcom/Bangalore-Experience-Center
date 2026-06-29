import './style.css'
import * as THREE from 'three'
import olamHero from './assets/images/olam-hero.png'

function buildProtoHTML(accent, darkBg, appTitle, items) {
  const itemsJson = JSON.stringify(items)
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-tap-highlight-color:transparent}
body{background:${darkBg};color:#fff;height:100vh;overflow:hidden;user-select:none}
.scr{display:none;flex-direction:column;height:100%}.scr.on{display:flex;animation:fi .22s ease}
@keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.hdr{padding:30px 18px 12px}
.hdr-s{font-size:10px;color:rgba(255,255,255,.42);letter-spacing:2px;text-transform:uppercase}
.hdr-t{font-size:21px;font-weight:700;color:${accent};margin-top:3px}
.srch{margin:0 18px 12px;background:rgba(255,255,255,.07);border-radius:10px;padding:10px 14px;color:rgba(255,255,255,.35);font-size:13px}
.sec{padding:0 18px 10px;font-size:10px;color:rgba(255,255,255,.35);letter-spacing:2px;text-transform:uppercase}
.row{display:flex;gap:10px;padding:0 18px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.card{flex-shrink:0;width:128px;background:rgba(255,255,255,.06);border-radius:14px;overflow:hidden;cursor:pointer;transition:.15s;border:1px solid rgba(255,255,255,.06)}
.card:active{transform:scale(.94);opacity:.85}
.ci{height:80px;display:flex;align-items:center;justify-content:center;font-size:28px}
.cb{padding:9px 10px}.cn{font-size:12px;font-weight:600}.ct{font-size:10px;margin-top:2px}.cp{font-size:11px;color:rgba(255,255,255,.45);margin-top:3px}
.lst{flex:1;overflow-y:auto;scrollbar-width:none;padding:0 18px;margin-top:8px}
.li{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer}
.li:active{opacity:.6}
.av{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.lnm{font-size:13px;font-weight:500}.ld{font-size:11px;color:rgba(255,255,255,.38);margin-top:2px}.lf{flex:1}
.ba{font-size:11px;font-weight:600}
.nav{display:flex;border-top:1px solid rgba(255,255,255,.07);padding:10px 0 14px}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;opacity:.38;transition:.2s}
.ni.on{opacity:1}.ni i{font-size:18px;font-style:normal}.ni span{font-size:9px;letter-spacing:.5px;text-transform:uppercase}
.det{background:${darkBg}}
.bk{padding:30px 18px 8px;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;opacity:.9}
.hero{height:170px;margin:0 18px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:56px}
.db{padding:16px 18px}
.dt{font-size:22px;font-weight:700}
.tgs{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}
.tg{padding:4px 10px;border-radius:999px;font-size:10px;font-weight:600;letter-spacing:.3px;text-transform:uppercase}
.dd{font-size:13px;color:rgba(255,255,255,.6);line-height:1.65;margin-top:13px}
.sts{display:flex;gap:8px;margin-top:14px}
.sb{flex:1;background:rgba(255,255,255,.06);border-radius:12px;padding:11px;text-align:center}
.sv{font-size:17px;font-weight:700}.sl{font-size:9px;color:rgba(255,255,255,.4);margin-top:2px;text-transform:uppercase;letter-spacing:.5px}
.cta{margin:14px 18px;padding:14px;border-radius:13px;text-align:center;font-weight:700;font-size:14px;cursor:pointer;transition:.15s}
.cta:active{opacity:.8;transform:scale(.98)}
</style></head><body>
<div class="scr on" id="H">
  <div class="hdr"><div class="hdr-s">Good morning</div><div class="hdr-t">${appTitle}</div></div>
  <div class="srch">🔍 Search…</div>
  <div class="sec">Featured</div>
  <div class="row" id="cr"></div>
  <div class="lst" id="ls">
    <div class="sec" style="padding-left:0;padding-top:14px">All Items</div>
    <div id="ll"></div>
  </div>
  <div class="nav">
    <div class="ni on"><i>⊞</i><span>Home</span></div>
    <div class="ni" onclick="sn(this)"><i>↗</i><span>Post</span></div>
    <div class="ni" onclick="sn(this)"><i>◎</i><span>Track</span></div>
    <div class="ni" onclick="sn(this)"><i>⊙</i><span>Profile</span></div>
  </div>
</div>
<div class="scr det" id="D">
  <div class="bk" style="color:${accent}" onclick="go('H','D')">← Back</div>
  <div class="hero" id="dh"></div>
  <div class="db">
    <div class="dt" id="dn"></div>
    <div class="tgs" id="dg"></div>
    <div class="dd" id="dd"></div>
    <div class="sts" id="dss"></div>
  </div>
  <div class="cta" id="dc" style="background:${accent}"></div>
</div>
<script>
var A='${accent}',data=${itemsJson};
var cr=document.getElementById('cr'),ll=document.getElementById('ll');
data.forEach(function(it,i){
  var c=document.createElement('div');c.className='card';c.onclick=function(){det(i)};
  c.innerHTML='<div class="ci" style="background:'+it.bg+'">'+it.e+'</div><div class="cb"><div class="cn">'+it.n+'</div><div class="ct" style="color:'+A+'">'+it.sub+'</div><div class="cp">'+it.val+'</div></div>';
  cr.appendChild(c);
  var l=document.createElement('div');l.className='li';l.onclick=function(){det(i)};
  l.innerHTML='<div class="av" style="background:'+it.bg+'">'+it.e+'</div><div class="lf"><div class="lnm">'+it.n+'</div><div class="ld">'+it.tags[0]+' · '+it.tags[1]+'</div></div><div class="ba" style="color:'+A+'">'+it.st+'</div>';
  ll.appendChild(l);
});
function sn(el){document.querySelectorAll('.ni').forEach(function(n){n.classList.remove('on')});el.classList.add('on')}
function go(s,h){document.getElementById(s).classList.add('on');document.getElementById(h).classList.remove('on')}
function det(i){
  var it=data[i];
  document.getElementById('dh').style.background=it.bg;document.getElementById('dh').textContent=it.e;
  document.getElementById('dn').textContent=it.n;
  var dg=document.getElementById('dg');dg.innerHTML='';
  it.tags.forEach(function(t){var s=document.createElement('span');s.className='tg';s.style.background='rgba(255,255,255,.08)';s.style.color='rgba(255,255,255,.78)';s.textContent=t;dg.appendChild(s)});
  document.getElementById('dd').textContent=it.desc;
  var ds=document.getElementById('dss');ds.innerHTML='';
  it.stats.forEach(function(s){ds.innerHTML+='<div class="sb"><div class="sv" style="color:'+A+'">'+s.v+'</div><div class="sl">'+s.l+'</div></div>'});
  document.getElementById('dc').textContent=it.cta;document.getElementById('dc').style.color='${darkBg}';
  go('D','H');
}
</script></body></html>`
}

document.querySelector('#app').innerHTML = `
  <div id="splash-screen">
    <canvas id="splashCanvas"></canvas>
    <div class="splash-glow"></div>
    <div id="splash-logo-anim"></div>
  </div>

  <div id="home-screen">
    <canvas id="homeCanvas"></canvas>
    <div class="home-horizon"></div>
    <h1 class="home-heading">Turning Visions into Digital Reality</h1>
    <div class="home-scroll-cue">
      <span class="scroll-label">SCROLL TO EXPERIENCE</span>
    </div>
  </div>

  <div class="container">
    <div class="brand-logo" id="mainLogo">
      <span>U <span class="logo-sq"></span></span>
      <span>S T</span>
    </div>

    <canvas id="particleCanvas"></canvas>
    <div id="card-layer"></div>

    <div id="project-overview-screen" class="hidden">
      <canvas id="overviewAmbientCanvas"></canvas>
      <div class="overview-grid">
        <div class="overview-visual-wrapper">
          <div class="overview-visual" id="overviewImage"></div>
          <div class="visual-content">
            <h1 id="overviewTitle">OLAM</h1>
            <p id="overviewDesc">An app suite that empowers farmers through direct trade.</p>
          </div>
        </div>

        <div class="overview-meta">
          <h2>PROJECT<br>OVERVIEW</h2>
          <div class="meta-list" id="metaList"></div>

          <div class="meta-icons">
            <div class="icon-btn" data-type="video">
              <div class="icon-video-thumb" id="iconVideoThumb">
                <div class="icon-play-btn"></div>
              </div>
              <span class="icon-label">VIDEO</span>
            </div>
            <div class="icon-btn" data-type="prototype">
              <div class="icon-phone-frame">
                <div class="icon-phone-screen"></div>
                <div class="icon-phone-btn"></div>
              </div>
              <span class="icon-label">PROTOTYPE</span>
            </div>
            <div class="icon-btn" data-type="gallery">
              <div class="icon-gallery-pair">
                <div class="icon-gallery-back" id="iconGallery2"></div>
                <div class="icon-gallery-front" id="iconGallery1"></div>
              </div>
              <span class="icon-label">GALLERY</span>
            </div>
          </div>
        </div>
      </div>

      <div class="overview-tracker" id="overviewTracker"></div>
    </div>
  </div>
`

const projectData = [
  {
    title: 'OLAM',
    desc: 'An app suite that empowers farmers through direct trade.',
    img: olamHero,
    color: '112, 229, 255',
    rgb: [112, 229, 255],
    tags: ['Industry', 'Mobile First', 'Research'],
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    prototypeUrl: null,
    prototypeSrcdoc: buildProtoHTML('#6de878','#0b180c','OLAM Market',[
      {e:'🌾',n:'Basmati Rice',sub:'Grade A',val:'₹2,400/qt',bg:'linear-gradient(135deg,#1a2e1a,#2d5a27)',tags:['Organic','Certified','Punjab'],st:'Live',desc:'Premium long-grain basmati from certified Punjab cooperatives. Min 5 qt. Cold-chain delivery in 48h.',stats:[{v:'92%',l:'Quality'},{v:'48h',l:'Delivery'},{v:'4.8★',l:'Rating'}],cta:'Connect with Farmer →'},
      {e:'🌿',n:'Raw Cotton',sub:'Premium',val:'₹6,800/qt',bg:'linear-gradient(135deg,#2a1e14,#4a3520)',tags:['Maharashtra','Grade A','Raw'],st:'Live',desc:'Pesticide-free raw cotton from Maharashtra cooperatives. Year-round availability with direct farmer contact.',stats:[{v:'99%',l:'Purity'},{v:'3 qt',l:'Min Order'},{v:'4.6★',l:'Rating'}],cta:'Request Quote →'},
      {e:'🫘',n:'Organic Wheat',sub:'Certified',val:'₹1,950/qt',bg:'linear-gradient(135deg,#1e1a14,#3a3220)',tags:['Madhya Pradesh','No Pesticide','Hard'],st:'Live',desc:'Hard wheat, no pesticides, certified organic. Suitable for flour milling and direct export. High protein content.',stats:[{v:'13%',l:'Protein'},{v:'10 qt',l:'Stock'},{v:'4.7★',l:'Rating'}],cta:'Place Order →'},
    ]),
    gallery: [
      olamHero,
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80',
    ],
  },
  {
    title: 'HERO',
    desc: 'Redefining modern urban commuter systems.',
    img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80',
    color: '255, 156, 99',
    rgb: [255, 156, 99],
    tags: ['Mobility', 'Smart systems', 'User-centric'],
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    prototypeUrl: null,
    prototypeSrcdoc: buildProtoHTML('#ff9c63','#120a05','HERO Transit',[
      {e:'🚇',n:'Metro Line A',sub:'Rapid Rail',val:'12 min',bg:'linear-gradient(135deg,#2a1a0d,#4a3020)',tags:['On Time','Direct','6 Stops'],st:'12min',desc:'Express metro connecting Central Hub to Airport District. Real-time crowding data with smart seat recommendations.',stats:[{v:'12',l:'Min Away'},{v:'6',l:'Stops'},{v:'98%',l:'On-Time'}],cta:'Book Seat →'},
      {e:'🚌',n:'Express Bus 47',sub:'Smart E-Bus',val:'4 min',bg:'linear-gradient(135deg,#1a200d,#2a3a14)',tags:['Eco Fleet','Live GPS','AC'],st:'4min',desc:'Electric express bus on the North Corridor. Live GPS tracking with estimated arrival and real-time seat availability.',stats:[{v:'4',l:'Min Away'},{v:'22',l:'Seats Left'},{v:'E-Bus',l:'Fleet'}],cta:'Track Live →'},
      {e:'🛴',n:'EV Scooter',sub:'Last Mile',val:'500m away',bg:'linear-gradient(135deg,#200d1a,#3a1430)',tags:['Fast Unlock','₹2/min','Helmet'],st:'Near',desc:'8 EV scooters within 500m. Helmet included. Unlock instantly. No deposit. Earn green credits on every ride.',stats:[{v:'8',l:'Available'},{v:'87%',l:'Battery'},{v:'₹2',l:'Per Min'}],cta:'Unlock Scooter →'},
    ]),
    gallery: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80',
      'https://images.unsplash.com/photo-1556804335-2fa563e93aae?w=1200&q=80',
    ],
  },
  {
    title: 'NEXUS',
    desc: 'Quantum networking architectures for modular data systems.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    color: '154, 255, 170',
    rgb: [154, 255, 170],
    tags: ['Distributed scale', 'Secure mesh', 'Enterprise-ready'],
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    prototypeUrl: null,
    prototypeSrcdoc: buildProtoHTML('#9affa8','#050f06','NEXUS Network',[
      {e:'🔗',n:'Node Cluster A',sub:'Active Mesh',val:'99.98% uptime',bg:'linear-gradient(135deg,#0a1f0b,#1a3a1c)',tags:['Quantum','Encrypted','12 nodes'],st:'Healthy',desc:'Primary mesh cluster handling 4.2Tb/s throughput. Quantum-encrypted tunnels with automatic failover routing across 12 distributed nodes.',stats:[{v:'4.2Tb',l:'Throughput'},{v:'0.4ms',l:'Latency'},{v:'12',l:'Nodes'}],cta:'View Topology →'},
      {e:'🛡️',n:'Security Layer',sub:'Zero Trust',val:'All clear',bg:'linear-gradient(135deg,#0d0a1f,#1c1a3a)',tags:['Zero Trust','AES-256','Real-time'],st:'Secure',desc:'Zero-trust perimeter with continuous identity verification. AES-256 encryption on all data-in-transit and data-at-rest.',stats:[{v:'0',l:'Threats'},{v:'256bit',l:'Encryption'},{v:'100%',l:'Coverage'}],cta:'Security Report →'},
      {e:'📡',n:'Edge Relay B',sub:'PoP Station',val:'24 Gbps',bg:'linear-gradient(135deg,#1a1a0a,#2e2e14)',tags:['Edge','PoP','Low Latency'],st:'Online',desc:'Point-of-presence relay station at Edge Zone B. Handles content delivery and compute offloading for southern region clients.',stats:[{v:'24',l:'Gbps'},  {v:'8ms',l:'To Core'},{v:'98%',l:'Cache Hit'}],cta:'Configure Relay →'},
    ]),
    gallery: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
    ],
  },
  {
    title: 'HORIZON',
    desc: 'Next generation digital space operations dashboards.',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    color: '255, 214, 107',
    rgb: [255, 214, 107],
    tags: ['Operational clarity', 'Real-time insight', 'Visual intelligence'],
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    prototypeUrl: null,
    prototypeSrcdoc: buildProtoHTML('#ffd66b','#12110a','HORIZON OPS',[
      {e:'🛰️',n:'Orbit Station 1',sub:'Geo-Sync',val:'Active',bg:'linear-gradient(135deg,#1a1800,#2e2a00)',tags:['GEO','Comm Sat','Nominal'],st:'Nominal',desc:'Geostationary communications satellite maintaining 35,786km altitude. All systems nominal. Fuel reserves at 68%. Expected service life: 14 years.',stats:[{v:'35.8k',l:'km Alt'},{v:'68%',l:'Fuel'},{v:'14yr',l:'Life Left'}],cta:'Open Dashboard →'},
      {e:'📊',n:'Mission Control',sub:'Live Ops',val:'6 Active',bg:'linear-gradient(135deg,#1a0e00,#2e1800)',tags:['Real-Time','6 Missions','All Clear'],st:'Active',desc:'Central operations hub monitoring 6 concurrent missions. Telemetry refresh rate 10Hz. Automated alert escalation enabled for all critical systems.',stats:[{v:'6',l:'Missions'},{v:'10Hz',l:'Telemetry'},{v:'A-OK',l:'Status'}],cta:'View All Missions →'},
      {e:'🔭',n:'Deep Space Array',sub:'Observation',val:'Online',bg:'linear-gradient(135deg,#0a1018,#14202e)',tags:['Radio','Deep Space','Recording'],st:'Online',desc:'16-dish radio array tracking signals from 340 million km. Current target: Europa flyby data. Estimated downlink completion: 4h 12m.',stats:[{v:'340M',l:'km Range'},{v:'16',l:'Dishes'},{v:'4h',l:'Downlink'}],cta:'View Signal Data →'},
    ]),
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&q=80',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80',
      'https://images.unsplash.com/photo-1484600899469-230e8d1d59c0?w=1200&q=80',
    ],
  },
  {
    title: 'ALPHA',
    desc: 'Exploring ecological patterns through neural data networks.',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    color: '211, 176, 255',
    rgb: [211, 176, 255],
    tags: ['AI research', 'Ecosystem modeling', 'Adaptive systems'],
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    prototypeUrl: null,
    prototypeSrcdoc: buildProtoHTML('#d3b0ff','#0d0814','ALPHA Research',[
      {e:'🌿',n:'Biome Delta-3',sub:'Rainforest',val:'Healthy',bg:'linear-gradient(135deg,#0e1a0a,#1a3014)',tags:['Amazon','Dense','Monitored'],st:'Stable',desc:'Tropical rainforest biome with active neural monitoring across 12,400 sensor nodes. Biodiversity index 9.4/10. Zero deforestation alerts this week.',stats:[{v:'12.4k',l:'Sensors'},{v:'9.4',l:'Bio Index'},{v:'0',l:'Alerts'}],cta:'Open Biome Map →'},
      {e:'🧬',n:'Neural Net A7',sub:'Adaptive Model',val:'Training',bg:'linear-gradient(135deg,#0e0a1a,#1a1430)',tags:['LSTM','99.1% Acc','Live Feed'],st:'Active',desc:'Adaptive LSTM network processing 840k data points per second from global ecosystem sensors. Accuracy 99.1% on pattern classification tasks.',stats:[{v:'840k',l:'Pts/sec'},{v:'99.1%',l:'Accuracy'},{v:'3 yr',l:'Trained'}],cta:'Inspect Model →'},
      {e:'📉',n:'CO₂ Monitor',sub:'Global Trend',val:'398 ppm',bg:'linear-gradient(135deg,#1a0a0a,#301414)',tags:['Atmospheric','Live','Alert Ready'],st:'Watch',desc:'Real-time atmospheric CO₂ monitoring across 220 ground stations. Current reading 398ppm. 3-year trend model predicts inflection point within 18 months.',stats:[{v:'398',l:'ppm CO₂'},{v:'220',l:'Stations'},{v:'18mo',l:'Forecast'}],cta:'View Global Map →'},
    ]),
    gallery: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
      'https://images.unsplash.com/photo-1546587348-d12660c30c50?w=1200&q=80',
    ],
  },
]

const MENU_INDEX = { HOME: 0, PROJECTS: 1 }
const menuLabels = ['HOME', 'PROJECTS']
const DECORATIVE_COUNT = 28000
const HOME_PARTICLE_COUNT = 3800
const STAR_COUNT = 550
const GALAXY_TILT = -0.26
const ORBIT_SQUASH = 0.52
const VOID_FRACTION = 0.045

const homeScreen = document.getElementById('home-screen')
const homeCanvas = document.getElementById('homeCanvas')
const canvas = document.getElementById('particleCanvas')
const overviewScreen = document.getElementById('project-overview-screen')
const overviewImage = document.getElementById('overviewImage')
const overviewTitle = document.getElementById('overviewTitle')
const overviewDesc = document.getElementById('overviewDesc')
const closeOverview = document.getElementById('closeOverview')
const mainLogo = document.getElementById('mainLogo')
const splashScreen = document.getElementById('splash-screen')
const splashCanvas = document.getElementById('splashCanvas')

let homeExited = false
let homeParticles = []
let homeAnimId = null
let particles = []
let projectNodes = []
let ripples = []
let hoveredParticle = null
let exploreBtn = null
let menuItems = []
let currentActiveMenuIndex = 0
let currentAppState = 'TUNNEL'
let currentProjectIndex = 0
let isScrollThrottled = false
let tunnelSpeed = 1.8
let screenFillProgress = 0
let scrollProgress = 0
let scrollTarget = 0
let cardsRevealed = false
let cardElements = []
let cardOrbitAngle = 0
let pulseTime = 0
let isCardHovered = false
let activeCard = null
let splashParticles = []
let splashAnimId = null
let splashActive = false
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
let mediaPanelOpen = false
let currentMediaType = null
let mediaTabTransitioning = false
let lightboxImages = []
let lightboxIndex = 0
let overviewAmbientParticles = []
let overviewAmbientAnimId = null

const homeRenderer = new THREE.WebGLRenderer({ canvas: homeCanvas, alpha: true, antialias: true })
homeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const homeScene = new THREE.Scene()
const homeCamera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10, 10)
const homeGeometry = new THREE.BufferGeometry()
const homePositions = new Float32Array(HOME_PARTICLE_COUNT * 3)
const homeColors = new Float32Array(HOME_PARTICLE_COUNT * 4)
const homeSizes = new Float32Array(HOME_PARTICLE_COUNT)

const galaxyRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
galaxyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const galaxyScene = new THREE.Scene()
const galaxyCamera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10, 10)
const galaxyGeometry = new THREE.BufferGeometry()
const galaxyPositions = new Float32Array(DECORATIVE_COUNT * 3)
const galaxyColors = new Float32Array(DECORATIVE_COUNT * 4)
const galaxySizes = new Float32Array(DECORATIVE_COUNT)
const rippleGroup = new THREE.Group()
const nucleusGroup = new THREE.Group()
galaxyScene.add(rippleGroup, nucleusGroup)
const nucleusTextureCanvas = document.createElement('canvas')
nucleusTextureCanvas.width = 256
nucleusTextureCanvas.height = 256
const nucleusTextureCtx = nucleusTextureCanvas.getContext('2d')
const nucleusGradient = nucleusTextureCtx.createRadialGradient(128, 128, 0, 128, 128, 128)
nucleusGradient.addColorStop(0.08, 'rgba(3,12,12,1)')
nucleusGradient.addColorStop(0.24, 'rgba(4,18,18,0.96)')
nucleusGradient.addColorStop(0.43, 'rgba(10,38,38,0.72)')
nucleusGradient.addColorStop(0.68, 'rgba(18,70,70,0.2)')
nucleusGradient.addColorStop(1, 'rgba(18,70,70,0)')
nucleusTextureCtx.fillStyle = nucleusGradient
nucleusTextureCtx.fillRect(0, 0, 256, 256)
const nucleusTexture = new THREE.CanvasTexture(nucleusTextureCanvas)
const nucleusSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nucleusTexture, transparent: true, depthTest: false }))
nucleusGroup.add(nucleusSprite)

function makeParticleMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
    vertexShader: `
      attribute float aSize;
      attribute vec4 aColor;
      varying vec4 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio;
      }
    `,
    fragmentShader: `
      varying vec4 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float dist = length(uv);
        float core = smoothstep(0.5, 0.0, dist);
        float glow = smoothstep(0.5, 0.12, dist);
        float alpha = vColor.a * (core * 0.85 + glow * 0.35);
        gl_FragColor = vec4(vColor.rgb, alpha);
      }
    `,
  })
}

const homeMaterial = makeParticleMaterial()
const galaxyMaterial = makeParticleMaterial()
homeGeometry.setAttribute('position', new THREE.BufferAttribute(homePositions, 3))
homeGeometry.setAttribute('aColor', new THREE.BufferAttribute(homeColors, 4))
homeGeometry.setAttribute('aSize', new THREE.BufferAttribute(homeSizes, 1))
homeScene.add(new THREE.Points(homeGeometry, homeMaterial))
galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3))
galaxyGeometry.setAttribute('aColor', new THREE.BufferAttribute(galaxyColors, 4))
galaxyGeometry.setAttribute('aSize', new THREE.BufferAttribute(galaxySizes, 1))
galaxyScene.add(new THREE.Points(galaxyGeometry, galaxyMaterial))

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function syncRenderer(renderer, camera) {
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  camera.left = 0
  camera.right = window.innerWidth
  camera.top = window.innerHeight
  camera.bottom = 0
  camera.updateProjectionMatrix()
}

function resizeSplashCanvas() {
  if (!splashCanvas) return
  const dpr = Math.min(window.devicePixelRatio, 2)
  splashCanvas.width = Math.floor(window.innerWidth * dpr)
  splashCanvas.height = Math.floor(window.innerHeight * dpr)
  const ctx = splashCanvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function createSplashParticles() {
  const count = 140
  const width = window.innerWidth
  const height = window.innerHeight
  const cx = width * 0.5
  const cy = height * 0.5
  return Array.from({ length: count }, () => ({
    x: cx + (Math.random() - 0.5) * 40,
    y: cy + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    size: 0.8 + Math.random() * 1.8,
    alpha: 0.3 + Math.random() * 0.55,
    life: 0.2 + Math.random() * 0.8,
  }))
}

function animateSplash() {
  if (!splashActive || !splashCanvas) return
  const ctx = splashCanvas.getContext('2d')
  const width = window.innerWidth
  const height = window.innerHeight
  const cx = width * 0.5
  const cy = height * 0.5
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  splashParticles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.0023
    const drift = Math.sin((performance.now() * 0.001) + p.size) * 0.25
    p.vx += drift * 0.0015
    p.vy += (Math.random() - 0.5) * 0.003
    const pulse = 0.55 + 0.45 * Math.sin((performance.now() * 0.001) * 1.8 + p.size * 2.2)
    const alpha = Math.max(0, p.alpha * pulse * Math.min(1, p.life))
    const glow = 8 + p.size * 5
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(186, 244, 255, ${alpha})`
    ctx.shadowBlur = glow
    ctx.shadowColor = 'rgba(140, 240, 255, 0.45)'
    ctx.fill()
    if (p.life <= 0 || p.x < -60 || p.x > width + 60 || p.y < -60 || p.y > height + 60) {
      p.x = cx + (Math.random() - 0.5) * 90
      p.y = cy + (Math.random() - 0.5) * 90
      p.vx = (Math.random() - 0.5) * 1.2
      p.vy = (Math.random() - 0.5) * 1.2
      p.life = 0.8 + Math.random() * 0.6
    }
  })
  ctx.restore()
  splashAnimId = requestAnimationFrame(animateSplash)
}

function runSplashLogoAnim() {
  const container = document.getElementById('splash-logo-anim')
  if (!container) return
  container.innerHTML = ''

  const cvs = document.createElement('canvas')
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
  container.appendChild(cvs)

  const W = cvs.width  = window.innerWidth
  const H = cvs.height = window.innerHeight
  const ctx = cvs.getContext('2d')
  const cx = W / 2, cy = H / 2
  const vm = Math.min(W, H)

  // bigSz sized so 4 squares at final positions have a thin visible gap (frame 2)
  const hSp   = vm * 0.24, vSp = vm * 0.21
  const bigSz  = hSp * 2 - vm * 0.04
  const midSz  = vm * 0.13
  const sqFin  = vm * 0.07
  const dotSz  = Math.max(2, vm * 0.004)
  const fontSz = Math.round(vm * 0.23)

  // Final centres
  const P = {
    U:  [cx - hSp, cy - vSp],
    sq: [cx + hSp, cy - vSp],
    S:  [cx - hSp, cy + vSp],
    T:  [cx + hSp, cy + vSp],
  }

  const DURATION = 3500
  const t0 = performance.now()

  const ss  = t => t * t * (3 - 2 * t)
  const ro  = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)))
  const mix = (a, b, t) => a + (b - a) * t

  function drawSq(x, y, size, alpha) {
    if (alpha <= 0 || size < 0.5) return
    ctx.globalAlpha = Math.min(1, alpha)
    ctx.fillStyle = '#fff'
    ctx.fillRect(x - size / 2, y - size / 2, size, size)
  }

  function drawLtr(ch, x, y, fs, alpha, blur) {
    if (alpha <= 0 || fs < 1) return
    ctx.globalAlpha = Math.min(1, alpha)
    ctx.fillStyle = '#fff'
    if (blur > 0.5) ctx.filter = `blur(${blur.toFixed(1)}px)`
    ctx.font = `800 ${fs}px 'Lexend Giga', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, x, y)
    if (blur > 0.5) ctx.filter = 'none'
  }

  let rafId

  function frame(now) {
    const t = Math.min(1, (now - t0) / DURATION)
    ctx.clearRect(0, 0, W, H)

    // Frame 1: origin square fades in then out
    {
      const a    = ss(ro(t, 0, 0.12)) * (1 - ss(ro(t, 0.20, 0.32)))
      const size = mix(bigSz * 0.80, bigSz, ss(ro(t, 0, 0.12)))
      drawSq(cx, cy, size, a)
    }

    // Frames 2-7: four squares
    // They spring from center to final positions quickly (t 0.20->0.30)
    // so at t=0.30 each square is bigSz with thin gaps — matching frame 2.
    if (t >= 0.20) {
      const spread = ss(ro(t, 0.20, 0.30))
      const fadeIn = ss(ro(t, 0.20, 0.30))

      // Frames 3-4: all 4 shrink uniformly bigSz -> midSz
      const unifSz = mix(bigSz, midSz, ss(ro(t, 0.30, 0.62)))

      // Frame 5: diverge — sq stays large, U/S/T shrink to dots
      const divT   = ss(ro(t, 0.62, 0.76))
      const sqSize = mix(unifSz, sqFin,  divT)
      const dotS   = mix(unifSz, dotSz,  divT)

      // Frames 6-7: letters bloom in from tiny with blur -> sharp
      const lFade = ss(ro(t, 0.74, 0.95))
      const lSize = mix(fontSz * 0.04, fontSz, ss(ro(t, 0.74, 0.97)))
      const lBlur = mix(vm * 0.018, 0, ss(ro(t, 0.74, 0.97)))

      const cells = [
        { k: 'U',  ch: 'U'  },
        { k: 'sq', ch: null },
        { k: 'S',  ch: 'S'  },
        { k: 'T',  ch: 'T'  },
      ]

      for (const { k, ch } of cells) {
        const [px, py] = P[k]
        const x = mix(cx, px, spread)
        const y = mix(cy, py, spread)

        if (ch === null) {
          drawSq(x, y, sqSize, fadeIn)
        } else {
          drawSq(x, y, dotS, fadeIn * (1 - lFade))
          drawLtr(ch, x, y, lSize, lFade, lBlur)
        }
      }
    }

    if (t < 1) {
      rafId = requestAnimationFrame(frame)
    }
  }

  document.fonts.load(`800 40px 'Lexend Giga'`).then(() => {
    rafId = requestAnimationFrame(frame)
  }).catch(() => { rafId = requestAnimationFrame(frame) })

  // Fly-out: logo drifts toward top-left while fading out fast (0.28s).
  // It disappears before the scaled proportions mismatch is visible;
  // the CSS corner mainLogo then fades in cleanly on its own.
  setTimeout(() => {
    if (rafId) cancelAnimationFrame(rafId)
    cvs.style.transformOrigin = `${cx}px ${cy}px`
    cvs.style.transition = 'transform 0.7s cubic-bezier(0.4,0,1,1), opacity 0.28s ease'
    cvs.style.transform  = `translate(${40 - cx}px, ${30 - cy}px) scale(0.13)`
    cvs.style.opacity    = '0'
  }, 3600)
}

function startSplashSequence() {
  if (splashActive) return
  splashActive = true
  if (splashScreen) {
    splashScreen.style.display = 'block'
    splashScreen.classList.remove('hidden')
  }
  if (homeScreen) homeScreen.classList.remove('active')
  // Keep mainLogo hidden at its corner position during the splash
  if (mainLogo) {
    mainLogo.classList.remove('splash-active', 'settled')
    mainLogo.style.opacity = '0'
  }
  runSplashLogoAnim()
  // Canvas fades out at 3600ms (0.28s) so it's gone by ~3880ms.
  // Fade corner logo in at 3900ms so it appears right after canvas disappears.
  window.setTimeout(() => {
    if (mainLogo) {
      mainLogo.style.transition = 'opacity 0.5s ease'
      mainLogo.style.opacity = '1'
      setTimeout(() => { if (mainLogo) mainLogo.style.transition = '' }, 600)
    }
  }, 3900)
  // Home screen and menu slide in 200ms later
  window.setTimeout(() => {
    if (homeScreen) homeScreen.classList.add('active')
    const menu = document.querySelector('.galaxy-side-menu')
    if (menu) menu.classList.add('visible')
    if (splashScreen) splashScreen.classList.add('hidden')
    window.setTimeout(() => {
      if (splashScreen) splashScreen.style.display = 'none'
      splashActive = false
    }, 850)
  }, 4100)
}

function spawnHomeParticle(immediate = false, type = 'ground') {
  const h = window.innerHeight
  if (type === 'star') {
    const isGray = Math.random() < 0.12
    const isGlow = !isGray && Math.random() < 0.012
    const sizeRand = Math.random()
    const r = isGlow
      ? 0.4 + Math.random() * 0.8
      : (sizeRand < 0.78 ? Math.random() * 0.55 + 0.25
        : sizeRand < 0.96 ? Math.random() * 0.9 + 0.55
        : Math.random() * 1.4 + 1.0)
    return {
      type: 'star',
      x: Math.random() * window.innerWidth,
      y: immediate ? h * (0.36 + Math.random() * 0.59) : h * 0.36 + Math.random() * 25,
      vy: 0.18 + Math.random() * 0.28,
      r,
      glow: isGlow,
      color: isGray ? [0.282, 0.282, 0.282] : isGlow ? [0.45, 1.0, 1.0] : [0.933, 0.965, 1.0],
      opacity: isGlow ? 0.85 + Math.random() * 0.15 : 0.45 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      topH: h,
    }
  }
  const isGray = Math.random() < 0.12
  const isGlow = !isGray && Math.random() < 0.012
  const sizeRand = Math.random()
  const r = isGlow
    ? 0.4 + Math.random() * 0.8
    : (sizeRand < 0.78 ? Math.random() * 0.55 + 0.25
      : sizeRand < 0.96 ? Math.random() * 0.9 + 0.55
      : Math.random() * 1.4 + 1.0)
  return {
    type: 'ground',
    x: Math.random() * window.innerWidth,
    y: immediate ? Math.random() * h * 0.28 : -Math.random() * 80,
    vy: 0.18 + Math.random() * 0.28,
    r,
    glow: isGlow,
    color: isGray ? [0.282, 0.282, 0.282] : isGlow ? [0.45, 1.0, 1.0] : [0.933, 0.965, 1.0],
    opacity: isGlow ? 0.85 + Math.random() * 0.15 : 0.45 + Math.random() * 0.45,
    phase: Math.random() * Math.PI * 2,
    topH: h,
  }
}

function initHomeParticles() {
  const groundCount = HOME_PARTICLE_COUNT - STAR_COUNT
  homeParticles = [
    ...Array.from({ length: STAR_COUNT }, () => spawnHomeParticle(true, 'star')),
    ...Array.from({ length: groundCount }, () => spawnHomeParticle(true, 'ground')),
  ]
}

function animateHome() {
  const h = window.innerHeight
  const now = performance.now()
  homeParticles.forEach((p, i) => {
    const ix = i * 3
    const cx = i * 4

    if (p.type === 'star') {
      p.y += p.vy
      const shimmer = 0.85 + 0.15 * Math.sin(p.phase + now * 0.002)
      const glowPulse = p.glow ? (0.55 + 0.45 * Math.abs(Math.sin(p.phase * 1.6 + now * 0.0012))) : 1.0
      const finalOpacity = p.opacity * shimmer * glowPulse
      homePositions[ix] = p.x
      homePositions[ix + 1] = p.y
      homePositions[ix + 2] = 0
      homeColors[cx] = p.color[0]
      homeColors[cx + 1] = p.color[1]
      homeColors[cx + 2] = p.color[2]
      homeColors[cx + 3] = finalOpacity
      homeSizes[i] = p.r * 2.8
      if (p.y > h) homeParticles[i] = spawnHomeParticle(false, 'star')
      return
    }

    p.y += p.vy
    const progress = p.y / h
    let fadeFactor
    if (progress <= 0.05) {
      fadeFactor = progress / 0.05
    } else if (progress <= 0.26) {
      fadeFactor = 1.0
    } else {
      const t = Math.max(0, Math.min(1, (progress - 0.26) / 0.12))
      fadeFactor = 1 - t * t * (3 - 2 * t)
    }
    const shimmer = 0.85 + 0.15 * Math.sin(p.phase + now * 0.002)
    const glowPulse = p.glow ? (0.55 + 0.45 * Math.abs(Math.sin(p.phase * 1.6 + now * 0.0012))) : 1.0
    const finalOpacity = p.opacity * fadeFactor * shimmer * glowPulse
    homePositions[ix] = p.x
    homePositions[ix + 1] = p.y
    homePositions[ix + 2] = 0
    homeColors[cx] = p.color[0]
    homeColors[cx + 1] = p.color[1]
    homeColors[cx + 2] = p.color[2]
    homeColors[cx + 3] = finalOpacity
    homeSizes[i] = p.r * 2.8
    if (p.y > h * 0.40) homeParticles[i] = spawnHomeParticle(false, 'ground')
  })
  homeGeometry.attributes.position.needsUpdate = true
  homeGeometry.attributes.aColor.needsUpdate = true
  homeGeometry.attributes.aSize.needsUpdate = true
  homeRenderer.render(homeScene, homeCamera)
  homeAnimId = requestAnimationFrame(animateHome)
}

function exitHomeScreen() {
  if (homeExited) return
  homeExited = true
  homeScreen.classList.add('exit')
  setTimeout(() => {
    if (homeAnimId) cancelAnimationFrame(homeAnimId)
    homeAnimId = null
    homeScreen.style.display = 'none'
    doNavigate(MENU_INDEX.PROJECTS)
  }, 1100)
}

function reEnterHomeScreen() {
  if (!homeExited) return
  homeExited = false
  homeScreen.style.display = 'block'
  homeScreen.offsetHeight
  homeScreen.classList.remove('exit')
  syncRenderer(homeRenderer, homeCamera)
  initHomeParticles()
  animateHome()
}

function randGauss() {
  let u = 0
  let v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

class OrbitalParticle {
  constructor(index = 0) {
    this.index = index
    const sizeRand = Math.random()
    if (sizeRand < 0.78) this.radius = Math.random() * 0.55 + 0.25
    else if (sizeRand < 0.96) this.radius = Math.random() * 0.9 + 0.55
    else this.radius = Math.random() * 1.4 + 1.0
    this.color = Math.random() < 0.82 ? [238, 246, 255] : [72, 72, 72]
    this.opacity = Math.random() * 0.45 + 0.45
    this.initOrbit()
    this.initDrift()
  }

  initOrbit() {
    const widthRef = window.innerWidth
    const voidMin = widthRef * VOID_FRACTION
    const sigma = widthRef * 0.18
    let r = Math.abs(randGauss()) * sigma + voidMin * 1.05
    if (r < voidMin) r = voidMin * (1 + Math.random() * 0.08)
    this.orbitRadius = r
    this.angle = Math.random() * Math.PI * 2
    const baseSpeed = 0.00055 * Math.sqrt(widthRef * 0.26)
    this.speed = (baseSpeed / Math.sqrt(this.orbitRadius)) * (0.7 + Math.random() * 0.6)
    this.tiltOffset = (Math.random() - 0.5) * 0.18
  }

  initDrift() {
    const widthRef = window.innerWidth
    const heightRef = window.innerHeight
    this.driftX = Math.random() * widthRef
    if (Math.random() < 0.65) this.driftX = widthRef * (0.6 + Math.random() * 0.4)
    this.driftY = Math.random() * heightRef
    this.isSwiping = false
    this.stampOpacity = 0
    const cellX = Math.floor((this.driftX / widthRef) * 24)
    const cellY = Math.floor((this.driftY / heightRef) * 14)
    this.stampDelayThreshold = (cellX / 24) * 0.5 + (cellY / 14) * 0.3 + Math.random() * 0.2
  }

  resetCoordinates() {
    this.initOrbit()
    this.initDrift()
  }

  update() {
    const widthRef = window.innerWidth
    const heightRef = window.innerHeight
    if (currentAppState === 'OVERVIEW') {
      this.renderX = this.driftX
      this.renderY = this.driftY
      this.renderSize = this.radius
      if (this.isSwiping) {
        if (screenFillProgress >= this.stampDelayThreshold) {
          this.stampOpacity += (Math.min(0.9, this.opacity * 1.6) - this.stampOpacity) * 0.12
        }
        this.currentOpacity = this.stampOpacity
      } else {
        const screenProgress = this.driftX / widthRef
        this.currentOpacity = Math.min(0.45, this.opacity * Math.pow(screenProgress, 1.4) * 1.2)
      }
      return
    }

    const nx = widthRef * 0.5
    const ny = heightRef * 0.5
    this.angle += this.speed
    const squash = ORBIT_SQUASH + this.tiltOffset * 0.15
    const lx = this.orbitRadius * Math.cos(this.angle + this.tiltOffset)
    const ly = this.orbitRadius * Math.sin(this.angle + this.tiltOffset) * squash
    const cosTilt = Math.cos(GALAXY_TILT)
    const sinTilt = Math.sin(GALAXY_TILT)
    this.renderX = nx + lx * cosTilt - ly * sinTilt
    this.renderY = ny + lx * sinTilt + ly * cosTilt
    this.renderSize = this.radius
    const warpMult = currentAppState === 'TRANSITION' ? 1 + ((tunnelSpeed - 1.8) / 36) * 18 : 1
    this.angle += this.speed * (warpMult - 1)
    this.renderX += (mouse.x - widthRef / 2) * 0.04 * (1 - this.orbitRadius / (widthRef * 0.6))
    this.renderY += (mouse.y - heightRef / 2) * 0.04 * (1 - this.orbitRadius / (heightRef * 0.6))
    const voidMin = widthRef * VOID_FRACTION
    const fadeIn = Math.min(1, (this.orbitRadius - voidMin) / (voidMin * 0.5))
    this.currentOpacity = this.opacity * Math.max(0, fadeIn)
  }
}

class ProjectNode {
  constructor(index, particle) {
    this.projectInfo = projectData[index % projectData.length]
    this.index = index
    this.particle = particle
    this.scaleAlpha = 1
    this.hover = 0
    this.rippleCooldown = 0
    this.x = 0
    this.y = 0
  }

  updatePosition() {
    if (!this.particle) return
    this.x = this.particle.renderX
    this.y = this.particle.renderY
    const hoverTarget = currentAppState === 'TUNNEL' && hoveredParticle === this ? 1 : 0
    this.hover += (hoverTarget - this.hover) * 0.2
    if (hoverTarget) {
      this.rippleCooldown -= 1
      if (this.rippleCooldown <= 0) {
        spawnRipple(this.x, this.y, this.projectInfo.rgb)
        this.rippleCooldown = 18
      }
    } else {
      this.rippleCooldown = 0
    }
  }
}

function assignProjectAnchors() {
  const widthRef = window.innerWidth
  let candidates = particles
    .filter((p) => p.radius >= 1 && p.orbitRadius > widthRef * 0.13 && p.orbitRadius < widthRef * 0.36)
    .sort((a, b) => a.angle - b.angle || b.radius - a.radius)
  if (candidates.length < projectData.length) candidates = [...particles].sort((a, b) => b.radius - a.radius)
  const used = new Set()
  projectNodes = []
  for (let i = 0; i < projectData.length; i++) {
    const targetAngle = (i / projectData.length) * Math.PI * 2
    const targetRadius = widthRef * (0.16 + i * 0.04)
    let bestParticle = null
    let bestIndex = -1
    let bestScore = Infinity
    for (let j = 0; j < candidates.length; j++) {
      if (used.has(j)) continue
      const p = candidates[j]
      const angleDiff = Math.abs(Math.atan2(Math.sin(p.angle - targetAngle), Math.cos(p.angle - targetAngle)))
      const radiusDiff = Math.abs(p.orbitRadius - targetRadius) / widthRef
      const score = angleDiff * 0.85 + radiusDiff * 4 - p.radius * 0.04
      if (score < bestScore) {
        bestScore = score
        bestParticle = p
        bestIndex = j
      }
    }
    if (!bestParticle) {
      bestIndex = i % candidates.length
      bestParticle = candidates[bestIndex]
    }
    used.add(bestIndex)
    projectNodes.push(new ProjectNode(i, bestParticle))
  }
}

function initParticles() {
  particles = []
  projectNodes = []
  ripples = []
  hoveredParticle = null
  removeProjectCard(true)
  for (let i = 0; i < DECORATIVE_COUNT; i++) particles.push(new OrbitalParticle(i))
  assignProjectAnchors()
  particles.forEach((p) => p.update())
  projectNodes.forEach((n) => n.updatePosition())
}

function createSideMenu() {
  const menu = document.createElement('nav')
  menu.className = 'galaxy-side-menu'
  menu.setAttribute('aria-label', 'Galaxy menu')
  menu.innerHTML = `
    <div class="galaxy-side-menu-inner">
      <button class="galaxy-side-menu-toggle" id="menuToggle" aria-label="Toggle menu">&#8963;</button>
      <div class="menu-indicator" id="menuIndicator"></div>
      ${menuLabels.map((label, index) => `<div class="galaxy-side-menu-item${index === 0 ? ' is-active' : ''}" data-menu-index="${index}">${label}</div>`).join('')}
    </div>`
  menuItems = Array.from(menu.querySelectorAll('.galaxy-side-menu-item'))
  menuItems.forEach((item) => item.addEventListener('click', () => navigateToSection(parseInt(item.dataset.menuIndex, 10))))
  const toggle = menu.querySelector('#menuToggle')
  toggle.addEventListener('click', () => menu.classList.toggle('collapsed'))
  document.body.appendChild(menu)
}


function setActiveMenuItem(index = 0) {
  currentActiveMenuIndex = Math.max(0, Math.min(menuItems.length - 1, index))
  menuItems.forEach((item, i) => item.classList.toggle('is-active', i === currentActiveMenuIndex))
  requestAnimationFrame(() => {
    const indicator = document.getElementById('menuIndicator')
    const activeItem = menuItems[currentActiveMenuIndex]
    const inner = document.querySelector('.galaxy-side-menu-inner')
    if (!indicator || !activeItem || !inner) return
    const iRect = inner.getBoundingClientRect()
    const aRect = activeItem.getBoundingClientRect()
    indicator.style.top = (aRect.top - iRect.top + aRect.height / 2) + 'px'
  })
}

function createExploreButton() {
  exploreBtn = document.createElement('button')
  exploreBtn.id = 'explore-btn'
  exploreBtn.innerText = 'Explore Projects'
  exploreBtn.className = 'hidden'
  exploreBtn.addEventListener('click', startCardReveal)
  document.body.appendChild(exploreBtn)
}

function navigateToSection(targetIndex) {
  if (currentAppState === 'TRANSITION') return
  if (currentAppState === 'OVERVIEW' && targetIndex === MENU_INDEX.HOME) {
    stopOverviewParticles()
    overviewScreen.classList.remove('active-view')
    currentAppState = 'TRANSITION'
    setTimeout(() => {
      canvas.style.visibility = 'hidden'
      restoreDefaultMenu()
      reEnterHomeScreen()
      setActiveMenuItem(MENU_INDEX.HOME)
    }, 520)
    return
  }
  if (targetIndex === MENU_INDEX.HOME) {
    canvas.style.visibility = 'hidden'
    reEnterHomeScreen()
    setActiveMenuItem(0)
    return
  }
  if (!homeExited) {
    homeExited = true
    homeScreen.classList.add('exit')
    setTimeout(() => {
      if (homeAnimId) cancelAnimationFrame(homeAnimId)
      homeAnimId = null
      homeScreen.style.display = 'none'
      doNavigate(targetIndex)
    }, 1100)
    return
  }
  if (cardsRevealed && targetIndex !== MENU_INDEX.PROJECTS) {
    retractCards(() => doNavigate(targetIndex))
    return
  }
  doNavigate(targetIndex)
}

function doNavigate(targetIndex) {
  removeProjectCard(true)
  overviewScreen.classList.remove('active-view')
  setActiveMenuItem(targetIndex)

  if (targetIndex === MENU_INDEX.PROJECTS) {
    currentAppState = 'TUNNEL'
    mainLogo.style.opacity = '1'
    if (!cardsRevealed && exploreBtn) exploreBtn.classList.remove('hidden')
    canvas.style.opacity = '1'
    canvas.style.visibility = 'visible'
  }
}

function clearCards() {
  if (currentAppState !== 'CARDS') return
  cardElements.forEach((c) => {
    c.arrow?.remove()
    c.remove()
  })
  cardElements = []
  cardsRevealed = false
  scrollProgress = 0
  scrollTarget = 0
  cardOrbitAngle = 0
}

function createCardElements() {
  cardElements.forEach((c) => {
    c.arrow?.remove()
    c.remove()
  })
  cardElements = []
  projectData.forEach((p, i) => {
    const card = document.createElement('div')
    card.className = 'pco-card'
    card.innerHTML = `
      <div class="pco-image" style="background-image:url('${p.img}')"></div>
      <div class="pco-body">
        <div class="pco-title">${p.title}</div>
        <div class="pco-desc">${p.desc}</div>
        <div class="pco-tags">${p.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      </div>
    `
    const arrow = document.createElement('div')
    arrow.className = 'pco-arrow'
    document.body.appendChild(arrow)
    card.arrow = arrow
    card.addEventListener('click', () => {
      if (scrollProgress > 0.85) executeWarpTransition(p)
    })
    card.addEventListener('mouseenter', () => {
      if (scrollProgress > 0.85) card.style.boxShadow = `0 18px 56px rgba(${p.color},0.26)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '0 8px 38px rgba(0,0,0,0.45)'
    })
    document.body.appendChild(card)
    cardElements.push(card)
  })
}

function startCardReveal() {
  if (cardsRevealed || currentAppState !== 'TUNNEL') return
  cardsRevealed = true
  currentAppState = 'CARDS'
  exploreBtn.classList.add('hidden')
  createCardElements()
  scrollTarget = 1
}

function retractCards(onComplete) {
  if (!cardsRevealed) {
    if (onComplete) onComplete()
    return
  }
  scrollTarget = 0
  const check = setInterval(() => {
    if (scrollProgress < 0.02) {
      clearInterval(check)
      cardElements.forEach((c) => {
        c.arrow?.remove()
        c.remove()
      })
      cardElements = []
      cardsRevealed = false
      scrollProgress = 0
      scrollTarget = 0
      cardOrbitAngle = 0
      if (onComplete) onComplete()
    }
  }, 50)
}

function getCardTransform(cardIndex, sp) {
  const n = projectData.length
  const centerX = window.innerWidth * 0.5
  const centerY = window.innerHeight * 0.5
  const finalRadius = Math.min(window.innerWidth * 0.22, window.innerHeight * 0.26)
  const baseAngle = (cardIndex / n) * Math.PI * 2 - Math.PI * 0.25
  const angle = baseAngle + cardOrbitAngle
  const launchAt = 0.06 + (cardIndex / n) * 0.12
  const settleAt = 0.88
  const localT = Math.max(0, Math.min(1, (sp - launchAt) / (settleAt - launchAt)))
  if (localT <= 0) return null
  const eased = easeInOutCubic(localT)
  const radius = 24 + (finalRadius - 24) * eased
  const x = centerX + Math.cos(angle) * radius
  const y = centerY + Math.sin(angle) * radius
  const opacity = Math.min(1, Math.max(0, (sp - launchAt) / 0.12))
  return {
    x,
    y,
    centerX,
    centerY,
    scale: Math.min(1, 0.42 + eased * 0.58),
    opacity,
    fullySettled: localT >= 1,
    angle,
  }
}

function updateCardPositions() {
  if (!cardsRevealed || currentAppState === 'OVERVIEW') return
  cardElements.forEach((card, i) => {
    const t = getCardTransform(i, scrollProgress)
    if (!t) {
      card.style.opacity = '0'
      card.style.pointerEvents = 'none'
      card.classList.remove('clickable')
      if (card.arrow) card.arrow.style.opacity = '0'
      return
    }
    card.style.opacity = t.opacity.toFixed(3)
    card.style.left = `${t.x}px`
    card.style.top = `${t.y}px`
    card.style.transform = `translate(-50%,-50%) scale(${t.scale.toFixed(3)})`
    const interactive = t.fullySettled && scrollProgress > 0.85
    card.style.pointerEvents = interactive ? 'all' : 'none'
    card.classList.toggle('clickable', interactive)

    if (card.arrow) {
      const nucleusEdge = 42
      const fromX = t.centerX + Math.cos(t.angle) * nucleusEdge
      const fromY = t.centerY + Math.sin(t.angle) * nucleusEdge
      const toX = t.x
      const toY = t.y
      const dx = toX - fromX
      const dy = toY - fromY
      const len = Math.max(16, Math.hypot(dx, dy) - 10)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      card.arrow.style.width = `${len}px`
      card.arrow.style.transform = `translate(${fromX}px, ${fromY}px) rotate(${angle}deg)`
      card.arrow.style.opacity = t.opacity.toFixed(3)
    }
  })
}

function executeWarpTransition(projectInfo) {
  currentAppState = 'TRANSITION'
  removeProjectCard(true)
  cardElements.forEach((c) => {
    c.style.opacity = '0'
    c.style.pointerEvents = 'none'
  })
  currentProjectIndex = projectData.findIndex((p) => p.title === projectInfo.title)
  setActiveMenuItem(MENU_INDEX.PROJECTS)
  const warpTween = setInterval(() => {
    tunnelSpeed += 1.4
    projectNodes.forEach((n) => { n.scaleAlpha -= 0.09 })
    if (tunnelSpeed >= 38) {
      clearInterval(warpTween)
      setTimeout(() => {
        currentAppState = 'OVERVIEW'
        tunnelSpeed = 0.8
        particles.forEach((p) => p.resetCoordinates())
        updateOverviewUI(projectData[currentProjectIndex])
        overviewScreen.classList.add('active-view')
        buildTracker()
        startOverviewParticles()
      }, 250)
    }
  }, 16)
}

function setOverviewMenuMode(activeProjectIdx) {
  const inner = document.querySelector('.galaxy-side-menu-inner')
  if (!inner) return
  const items = ['HOME', ...projectData.map(p => p.title)]
  inner.innerHTML = items.map((label, i) =>
    `<div class="galaxy-side-menu-item${i === activeProjectIdx + 1 ? ' is-active' : ''}" data-ov-idx="${i}">${label}</div>`
  ).join('')
  menuItems = Array.from(inner.querySelectorAll('.galaxy-side-menu-item'))
  menuItems.forEach((item) => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.ovIdx, 10)
      if (idx === 0) {
        navigateToSection(MENU_INDEX.HOME)
      } else {
        const projIdx = idx - 1
        if (projIdx === currentProjectIndex) return
        currentProjectIndex = projIdx
        overviewScreen.style.transition = 'opacity 0.28s ease'
        overviewScreen.style.opacity = '0'
        setTimeout(() => {
          updateOverviewUI(projectData[currentProjectIndex])
          setOverviewMenuMode(currentProjectIndex)
          overviewScreen.style.opacity = '1'
          setTimeout(() => { overviewScreen.style.transition = '' }, 320)
        }, 280)
      }
    })
  })
}

function restoreDefaultMenu() {
  const inner = document.querySelector('.galaxy-side-menu-inner')
  if (!inner) return
  inner.innerHTML = menuLabels.map((label, index) =>
    `<div class="galaxy-side-menu-item" data-menu-index="${index}">${label}</div>`
  ).join('')
  menuItems = Array.from(inner.querySelectorAll('.galaxy-side-menu-item'))
  menuItems.forEach((item) => item.addEventListener('click', () => navigateToSection(parseInt(item.dataset.menuIndex, 10))))
}

function runHorizontalParticleTransition(dir, zIndex, onMid, onDone) {
  const W = window.innerWidth, H = window.innerHeight
  const tc = document.createElement('canvas')
  tc.style.cssText = `position:fixed;inset:0;z-index:${zIndex};pointer-events:none;`
  tc.width = W; tc.height = H
  document.body.appendChild(tc)
  const ctx = tc.getContext('2d')

  const count = 320
  const pts = Array.from({ length: count }, () => ({
    x0: dir > 0 ? -(20 + Math.random() * W * 0.28) : W + 20 + Math.random() * W * 0.28,
    y: Math.random() * H,
    vy: (Math.random() - 0.5) * 0.24,
    speed: 0.5 + Math.random() * 0.85,
    r: 0.5 + Math.random() * 2.0,
    delay: Math.random() * 0.28,
    teal: Math.random() < 0.22,
  }))

  const duration = 2600
  const t0 = performance.now()
  let midFired = false
  const ovScreen = document.getElementById('project-overview-screen')

  function frame(now) {
    const t = Math.min(1, (now - t0) / duration)
    ctx.clearRect(0, 0, W, H)

    // Solid blue fill — no partial transparency after the first 20% to avoid flickering
    let bgAlpha
    if (t < 0.2) bgAlpha = t / 0.2
    else if (t < 0.65) bgAlpha = 1
    else bgAlpha = 1 - (t - 0.65) / 0.35
    ctx.fillStyle = `rgba(5, 16, 30, ${bgAlpha})`
    ctx.fillRect(0, 0, W, H)

    ctx.globalCompositeOperation = 'screen'
    ctx.shadowBlur = 8
    ctx.shadowColor = 'rgba(90, 205, 255, 0.5)'

    // Collect visible particles — update positions in one pass, no per-particle API calls
    const whites = [], teals = []
    pts.forEach(p => {
      const pFrac = Math.max(0, (t - p.delay) / (1 - p.delay + 0.001))
      if (pFrac <= 0) return
      const x = p.x0 + dir * p.speed * pFrac * (W + 60)
      p.y += p.vy
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
      if (x < -20 || x > W + 20) return
      ;(p.teal ? teals : whites).push({ x, y: p.y, r: p.r, trailLen: p.r * 10 })
    })

    // Two strokes (trails) + two fills (dots) — four canvas calls total regardless of count
    ctx.lineWidth = 1.5
    ctx.beginPath()
    whites.forEach(p => { ctx.moveTo(p.x - dir * p.trailLen, p.y); ctx.lineTo(p.x, p.y) })
    ctx.strokeStyle = 'rgba(185, 228, 255, 0.42)'
    ctx.stroke()

    ctx.beginPath()
    teals.forEach(p => { ctx.moveTo(p.x - dir * p.trailLen, p.y); ctx.lineTo(p.x, p.y) })
    ctx.strokeStyle = 'rgba(60, 205, 255, 0.48)'
    ctx.stroke()

    ctx.beginPath()
    whites.forEach(p => { ctx.moveTo(p.x + p.r, p.y); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2) })
    ctx.fillStyle = 'rgba(215, 245, 255, 0.82)'
    ctx.fill()

    ctx.beginPath()
    teals.forEach(p => { ctx.moveTo(p.x + p.r, p.y); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2) })
    ctx.fillStyle = 'rgba(70, 220, 255, 0.88)'
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.globalCompositeOperation = 'source-over'

    if (!midFired && t >= 0.46) {
      midFired = true
      // Suppress overview CSS animations during the swap so they don't replay on fade-out
      if (ovScreen) ovScreen.classList.add('transition-freeze')
      onMid && onMid()
    }
    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      if (ovScreen) ovScreen.classList.remove('transition-freeze')
      onDone && onDone()
      tc.remove()
    }
  }
  requestAnimationFrame(frame)
}

function switchToProject(idx) {
  if (isScrollThrottled || idx === currentProjectIndex || idx < 0 || idx >= projectData.length) return
  isScrollThrottled = true
  const dir = idx > currentProjectIndex ? 1 : -1
  runHorizontalParticleTransition(dir, 65,
    () => { currentProjectIndex = idx; updateOverviewUI(projectData[idx]); buildTracker() },
    () => { isScrollThrottled = false }
  )
}

function switchMediaTab(newType) {
  if (newType === currentMediaType || !mediaPanelOpen || mediaTabTransitioning) return
  mediaTabTransitioning = true
  const tabOrder = ['video', 'prototype', 'gallery']
  const dir = tabOrder.indexOf(newType) > tabOrder.indexOf(currentMediaType) ? 1 : -1
  runHorizontalParticleTransition(dir, 78,
    () => { openMediaPanel(newType) },
    () => { mediaTabTransitioning = false }
  )
}

function buildTracker() {
  const tracker = document.getElementById('overviewTracker')
  if (!tracker) return
  tracker.innerHTML = projectData.map((p, i) => `
    <div class="tracker-item${i === currentProjectIndex ? ' active' : ''}" data-proj-idx="${i}">
      <div class="tracker-line"></div>
      <div class="tracker-label">${p.title}</div>
    </div>
  `).join('')
  tracker.querySelectorAll('.tracker-item').forEach((item) => {
    item.addEventListener('click', () => switchToProject(parseInt(item.dataset.projIdx, 10)))
  })
}

function splitTag(text) {
  return text
}

function updateOverviewUI(projectInfo) {
  overviewTitle.innerHTML = `<span>${projectInfo.title.charAt(0)}</span>${projectInfo.title.slice(1)}`
  overviewDesc.textContent = projectInfo.desc
  overviewImage.style.backgroundImage = `url('${projectInfo.img}')`
  const metaList = document.getElementById('metaList')
  if (metaList && projectInfo.tags) {
    metaList.innerHTML = projectInfo.tags.map((tag, i) =>
      `<div class="meta-item"><span style="--meta-i:${i}">${splitTag(tag)}</span></div>`
    ).join('')
  }
  const videoThumb = document.getElementById('iconVideoThumb')
  if (videoThumb) videoThumb.style.backgroundImage = `url('${projectInfo.img}')`
  const g1 = document.getElementById('iconGallery1')
  const g2 = document.getElementById('iconGallery2')
  const gal = projectInfo.gallery || []
  if (g1) g1.style.backgroundImage = gal[0] ? `url('${gal[0]}')` : ''
  if (g2) g2.style.backgroundImage = gal[1] ? `url('${gal[1]}')` : ''
}

function executeExitTransition() {
  stopOverviewParticles()
  overviewScreen.style.transition = ''
  overviewScreen.style.opacity = ''
  overviewScreen.style.filter = ''
  overviewScreen.classList.remove('active-view')
  particles.forEach((p) => p.resetCoordinates())
  const returnState = cardsRevealed ? 'CARDS' : 'TUNNEL'
  currentAppState = 'TRANSITION'
  const brakeTween = setInterval(() => {
    tunnelSpeed -= 1.6
    projectNodes.forEach((n) => { n.scaleAlpha += 0.09 })
    if (tunnelSpeed <= 1.8) {
      tunnelSpeed = 1.8
      currentAppState = returnState
      mainLogo.style.opacity = '1'
      projectNodes.forEach((n) => { n.scaleAlpha = 1 })
      setActiveMenuItem(MENU_INDEX.PROJECTS)
      clearInterval(brakeTween)
      if (cardsRevealed) cardElements.forEach((c, i) => {
        const t = getCardTransform(i, scrollProgress)
        if (t) c.style.opacity = t.opacity.toFixed(3)
      })
      else exploreBtn.classList.remove('hidden')
    }
  }, 16)
}

function globalUnifiedScrollManager(e) {
  if (mediaPanelOpen) return
  if (Math.abs(e.deltaY) < 2 || isScrollThrottled) return
  if (currentAppState === 'TRANSITION') return
  if (!homeExited) {
    if (e.deltaY > 0) exitHomeScreen()
    return
  }
  if (currentAppState === 'OVERVIEW') {
    if (Math.abs(e.deltaY) <= 15) return
    const dir = e.deltaY > 0 ? 1 : -1
    switchToProject(currentProjectIndex + dir)
    return
  }
  if (currentAppState === 'CARDS') {
    scrollTarget = Math.max(0, Math.min(1, scrollTarget + (e.deltaY > 0 ? 1 : -1) * 0.06))
    if (scrollTarget <= 0 && scrollProgress < 0.06) {
      cardElements.forEach((c) => c.remove())
      cardElements = []
      cardsRevealed = false
      scrollProgress = 0
      scrollTarget = 0
      currentAppState = 'TUNNEL'
      exploreBtn.classList.remove('hidden')
    }
    return
  }
  if (currentAppState === 'TUNNEL' || currentAppState === 'SECTION') {
    isScrollThrottled = true
    setTimeout(() => { isScrollThrottled = false }, 500)
    const nextIndex = e.deltaY > 0 ? currentActiveMenuIndex + 1 : currentActiveMenuIndex - 1
    if (nextIndex >= 0 && nextIndex < menuLabels.length) {
      currentAppState = 'TRANSITION'
      setTimeout(() => doNavigate(nextIndex), 180)
    } else if (nextIndex < 0) {
      currentAppState = 'TRANSITION'
      setTimeout(() => {
        reEnterHomeScreen()
        setActiveMenuItem(0)
      }, 180)
    }
  }
}

function removeProjectCard(clearHover = false) {
  isCardHovered = false
  if (activeCard) {
    const c = activeCard
    c.classList.remove('active')
    setTimeout(() => c.remove(), 250)
    activeCard = null
  }
  if (clearHover) hoveredParticle = null
}

function spawnRipple() {
  // ripple effect disabled for cleaner project page animation
}

function updateRipples() {
  ripples = []
}

function syncHoveredProject() {
  if (currentAppState !== 'TUNNEL') {
    if (!isCardHovered) removeProjectCard(true)
    return
  }
  let closestNode = null
  let closestDist = Infinity
  for (const node of projectNodes) {
    const dist = Math.hypot(node.x - mouse.targetX, node.y - mouse.targetY)
    const threshold = 22 + (node.particle ? node.particle.radius * 8 : 0)
    if (dist < threshold && dist < closestDist) {
      closestDist = dist
      closestNode = node
    }
  }
  if (closestNode !== hoveredParticle) {
    hoveredParticle = closestNode
    if (!hoveredParticle && !isCardHovered) removeProjectCard(true)
  }
}

function drawNucleus() {
  nucleusSprite.visible = currentAppState !== 'OVERVIEW'
  if (!nucleusSprite.visible) return
  const widthRef = window.innerWidth
  const heightRef = window.innerHeight
  const nx = widthRef * 0.5 + (mouse.x - widthRef / 2) * 0.04
  const ny = heightRef * 0.5 + (mouse.y - heightRef / 2) * 0.04
  const r = widthRef * 0.048
  nucleusSprite.position.set(nx, ny, 1)
  nucleusSprite.scale.set(r * 6.8, r * 6.8 * ORBIT_SQUASH * 0.95, 1)
  nucleusSprite.rotation.z = GALAXY_TILT
}

function drawRipples() {
  rippleGroup.clear()
}

function animate() {
  pulseTime += 1
  mouse.x += (mouse.targetX - mouse.x) * 0.05
  mouse.y += (mouse.targetY - mouse.y) * 0.05
  if (currentAppState === 'CARDS' || scrollProgress > 0.001) {
    scrollProgress += (scrollTarget - scrollProgress) * 0.01
    if (Math.abs(scrollTarget - scrollProgress) < 0.0002) scrollProgress = scrollTarget
  }
  if (currentAppState === 'CARDS') {
    cardOrbitAngle += 0.0018 * Math.min(1, scrollProgress * 1.5)
  }

  if (currentAppState !== 'SECTION') {
    particles.forEach((p, i) => {
      p.update()
      const ix = i * 3
      const cx = i * 4
      galaxyPositions[ix] = p.renderX
      galaxyPositions[ix + 1] = p.renderY
      galaxyPositions[ix + 2] = 0
      galaxyColors[cx] = p.color[0] / 255
      galaxyColors[cx + 1] = p.color[1] / 255
      galaxyColors[cx + 2] = p.color[2] / 255
      galaxyColors[cx + 3] = p.currentOpacity
      galaxySizes[i] = Math.max(1.2, p.renderSize * 2.8)
    })
    galaxyGeometry.attributes.position.needsUpdate = true
    galaxyGeometry.attributes.aColor.needsUpdate = true
    galaxyGeometry.attributes.aSize.needsUpdate = true
    if (currentAppState === 'TUNNEL' || currentAppState === 'TRANSITION' || currentAppState === 'CARDS') {
      projectNodes.forEach((n) => n.updatePosition())
      syncHoveredProject()
    }
    updateRipples()
    drawRipples()
    drawNucleus()
    canvas.style.cursor = hoveredParticle && currentAppState === 'TUNNEL' ? 'pointer' : 'default'
    galaxyRenderer.render(galaxyScene, galaxyCamera)
  }
  updateCardPositions()
  requestAnimationFrame(animate)
}

function handleCanvasClick() {
  if (currentAppState === 'TUNNEL' && hoveredParticle) executeWarpTransition(hoveredParticle.projectInfo)
}

function handleResize() {
  syncRenderer(homeRenderer, homeCamera)
  syncRenderer(galaxyRenderer, galaxyCamera)
  const ac = document.getElementById('overviewAmbientCanvas')
  if (ac) { ac.width = window.innerWidth; ac.height = window.innerHeight }
  initParticles()
}

function startOverviewParticles() {
  if (overviewAmbientAnimId) { cancelAnimationFrame(overviewAmbientAnimId); overviewAmbientAnimId = null }
  const canvas = document.getElementById('overviewAmbientCanvas')
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const count = 240
  overviewAmbientParticles = Array.from({ length: count }, () => {
    const isGlow = Math.random() < 0.018
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: 0.06 + Math.random() * 0.16,
      r: isGlow ? 0.9 + Math.random() * 1.3 : 0.25 + Math.random() * 0.75,
      opacity: isGlow ? 0.55 + Math.random() * 0.45 : 0.1 + Math.random() * 0.2,
      glow: isGlow,
      phase: Math.random() * Math.PI * 2,
    }
  })
  animateOverviewParticles()
}

function animateOverviewParticles() {
  const canvas = document.getElementById('overviewAmbientCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const now = performance.now()
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'screen'
  overviewAmbientParticles.forEach(p => {
    p.x += p.vx + Math.sin(now * 0.00018 + p.phase) * 0.11
    p.y += p.vy
    if (p.y > H + 8) { p.y = -4; p.x = Math.random() * W }
    if (p.x < -8) p.x = W + 4
    if (p.x > W + 8) p.x = -4
    const shimmer = p.glow
      ? 0.45 + 0.55 * Math.abs(Math.sin(p.phase * 1.3 + now * 0.0007))
      : 0.75 + 0.25 * Math.sin(p.phase + now * 0.0013)
    const alpha = p.opacity * shimmer
    if (p.glow) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5)
      g.addColorStop(0, `rgba(175, 248, 255, ${alpha})`)
      g.addColorStop(1, 'rgba(0, 195, 220, 0)')
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(195, 240, 255, ${alpha})`
      ctx.fill()
    }
  })
  ctx.globalCompositeOperation = 'source-over'
  overviewAmbientAnimId = requestAnimationFrame(animateOverviewParticles)
}

function stopOverviewParticles() {
  if (overviewAmbientAnimId) { cancelAnimationFrame(overviewAmbientAnimId); overviewAmbientAnimId = null }
  const canvas = document.getElementById('overviewAmbientCanvas')
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  overviewAmbientParticles = []
}

function openMediaPanelWithExpand(type, iconEl) {
  if (mediaPanelOpen) return

  const rect = iconEl.getBoundingClientRect()
  const W = window.innerWidth, H = window.innerHeight
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const startR = Math.max(rect.width, rect.height) / 2
  const endR = Math.ceil(Math.max(
    Math.hypot(cx, cy),
    Math.hypot(W - cx, cy),
    Math.hypot(cx, H - cy),
    Math.hypot(W - cx, H - cy)
  )) + 20

  const overlay = document.createElement('div')
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'background:#05101e', 'z-index:76',
    'pointer-events:none',
    `clip-path:circle(${startR}px at ${cx}px ${cy}px)`,
    'transition:clip-path 0.75s cubic-bezier(0.22,1,0.36,1)',
  ].join(';')
  document.body.appendChild(overlay)
  overlay.offsetHeight

  overlay.style.clipPath = `circle(${endR}px at ${cx}px ${cy}px)`

  overlay.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'clip-path') return
    openMediaPanel(type)
    overlay.style.transition = 'opacity 0.38s ease'
    overlay.style.opacity = '0'
    setTimeout(() => overlay.remove(), 400)
  }, { once: true })
}

function openMediaPanel(type) {
  const project = projectData[currentProjectIndex]
  const panel = document.getElementById('media-panel')
  const body = document.getElementById('mediaPanelBody')
  const label = document.getElementById('mediaPanelLabel')

  label.textContent = project.title
  body.innerHTML = ''

  if (type === 'video') {
    if (project.videoSrc) {
      const vw = document.createElement('div')
      vw.className = 'media-video-wrap'
      const vid = document.createElement('video')
      vid.controls = true
      vid.autoplay = true
      vid.playsInline = true
      const src = document.createElement('source')
      src.src = project.videoSrc
      src.type = 'video/mp4'
      vid.appendChild(src)
      vw.appendChild(vid)
      body.appendChild(vw)
    } else {
      body.innerHTML = `<div class="media-empty"><p>No video available for this project yet.</p></div>`
    }
  } else if (type === 'prototype') {
    const wrap = document.createElement('div')
    wrap.className = 'media-proto-wrap'
    const phone = document.createElement('div')
    phone.className = 'proto-phone'
    const notch = document.createElement('div')
    notch.className = 'proto-phone-notch'
    const iframe = document.createElement('iframe')
    iframe.frameBorder = '0'
    iframe.allowFullscreen = true
    if (project.prototypeSrcdoc) {
      iframe.srcdoc = project.prototypeSrcdoc
    } else if (project.prototypeUrl) {
      iframe.src = project.prototypeUrl
    } else {
      body.innerHTML = `<div class="media-empty"><p>Prototype not yet available.</p></div>`
    }
    if (project.prototypeSrcdoc || project.prototypeUrl) {
      phone.appendChild(notch)
      phone.appendChild(iframe)
      wrap.appendChild(phone)
      body.appendChild(wrap)
    }
  } else if (type === 'gallery') {
    const imgs = project.gallery || []
    if (imgs.length) {
      body.innerHTML = `<div class="media-gallery">${imgs.map((src, i) => `<div class="gallery-item" data-index="${i}" style="background-image:url('${src}')"></div>`).join('')}</div>`
      body.querySelectorAll('.gallery-item').forEach((item) => {
        item.addEventListener('click', () => openLightbox(imgs, parseInt(item.dataset.index)))
      })
    } else {
      body.innerHTML = `<div class="media-empty"><p>No gallery available.</p></div>`
    }
  }

  currentMediaType = type
  document.querySelectorAll('.media-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.type === type))

  mediaPanelOpen = true
  panel.classList.add('active')
}

function closeMediaPanel() {
  const panel = document.getElementById('media-panel')
  mediaPanelOpen = false
  currentMediaType = null
  panel.classList.remove('active')
  closeLightbox()
  const vid = panel.querySelector('video')
  if (vid) vid.pause()
  setTimeout(() => {
    const body = document.getElementById('mediaPanelBody')
    if (body) body.innerHTML = ''
  }, 600)
}

function openLightbox(imgs, index) {
  lightboxImages = imgs
  lightboxIndex = index
  updateLightbox()
  document.getElementById('media-lightbox').classList.add('active')
}

function closeLightbox() {
  const lb = document.getElementById('media-lightbox')
  if (lb) lb.classList.remove('active')
}

function updateLightbox() {
  document.getElementById('lbImage').src = lightboxImages[lightboxIndex]
  document.getElementById('lbCounter').textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`
}

function setupMediaPanel() {
  const panel = document.createElement('div')
  panel.id = 'media-panel'
  panel.innerHTML = `
    <div class="media-panel-bar">
      <button class="media-panel-back" id="mediaPanelBack">
        <span class="mpb-arrow">&#8592;</span>
        <span>BACK</span>
      </button>
      <span class="media-panel-label" id="mediaPanelLabel"></span>
    </div>
    <div class="media-tab-bar" id="mediaTabBar">
      <button class="media-tab" data-type="video">VIDEO</button>
      <button class="media-tab" data-type="prototype">PROTOTYPE</button>
      <button class="media-tab" data-type="gallery">GALLERY</button>
    </div>
    <div class="media-panel-body" id="mediaPanelBody"></div>
    <div id="media-lightbox" class="media-lightbox">
      <button class="lb-close" id="lbClose">&#10005;</button>
      <button class="lb-nav lb-prev" id="lbPrev">&#8592;</button>
      <div class="lb-img-wrap"><img id="lbImage" src="" alt="" /></div>
      <button class="lb-nav lb-next" id="lbNext">&#8594;</button>
      <div class="lb-counter" id="lbCounter"></div>
    </div>
  `
  document.body.appendChild(panel)

  document.getElementById('mediaPanelBack').addEventListener('click', closeMediaPanel)
  document.getElementById('mediaTabBar').querySelectorAll('.media-tab').forEach(tab => {
    tab.addEventListener('click', () => switchMediaTab(tab.dataset.type))
  })
  document.getElementById('lbClose').addEventListener('click', closeLightbox)
  document.getElementById('lbPrev').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length
    updateLightbox()
  })
  document.getElementById('lbNext').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length
    updateLightbox()
  })
  document.getElementById('media-lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox()
  })

  document.querySelectorAll('.icon-btn').forEach((btn) => {
    btn.addEventListener('click', () => openMediaPanelWithExpand(btn.dataset.type, btn))
  })
}

window.addEventListener('mousemove', (e) => {
  mouse.targetX = e.clientX
  mouse.targetY = e.clientY
})
window.addEventListener('wheel', globalUnifiedScrollManager, { passive: true })
window.addEventListener('resize', handleResize)
canvas.addEventListener('click', handleCanvasClick)
if (closeOverview) closeOverview.addEventListener('click', executeExitTransition)
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('media-lightbox')
  if (lb && lb.classList.contains('active')) {
    if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; updateLightbox() }
    else if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % lightboxImages.length; updateLightbox() }
    else if (e.key === 'Escape') closeLightbox()
    return
  }
  if (e.key === 'Escape' && mediaPanelOpen) closeMediaPanel()
})

createSideMenu()
setActiveMenuItem(0)
createExploreButton()
setupMediaPanel()
if (mainLogo) {
  mainLogo.style.cursor = 'pointer'
  mainLogo.addEventListener('click', () => navigateToSection(MENU_INDEX.HOME))
}
syncRenderer(homeRenderer, homeCamera)
syncRenderer(galaxyRenderer, galaxyCamera)
initParticles()
animate()
initHomeParticles()
animateHome()
startSplashSequence()
