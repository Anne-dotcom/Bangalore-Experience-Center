import './style.css'
import * as THREE from 'three'
import { GLTFLoader }      from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass }      from 'three/addons/postprocessing/OutputPass.js'
import { initMultiscreen, onMessage, send, ROLE } from './multiscreen.js'

document.querySelector('#app').innerHTML = `
  <div id="splash-screen">
    <canvas id="splashCanvas"></canvas>
    <div class="splash-glow"></div>
    <div id="splash-logo-anim"></div>
  </div>

  <div id="home-screen">
    <canvas id="homeCanvas"></canvas>
    <div class="home-horizon"></div>
    <h1 class="home-heading"><span>turning visions in</span><span id="homeTextPortal" class="home-text-portal"></span><span>to digital reality</span></h1>
  </div>

  <div class="container">
    <div class="brand-logo" id="mainLogo">
      <span>U <span class="logo-sq"></span></span>
      <span>S T</span>
    </div>
  </div>
`

const MENU_INDEX = { HOME: 0, PROJECTS: 1 }
const menuLabels = ['HOME', 'PROJECTS']
const DESIGN_W = 1920
const DESIGN_H = 1080
const HOME_PARTICLE_COUNT = 24000
const STAR_COUNT = HOME_PARTICLE_COUNT
const TERRAIN_COUNT = 320000
const HOME_EXIT_SCROLL = 2.45
const HOME_TEXT_PASS_SCROLL = 0.46
const HOME_VORTEX_START_SCROLL = 0.85
const GALAXY_TILT = -0.26
const ORBIT_SQUASH = 0.52
const VOID_FRACTION = 0.045
const HOME_PARTICLE_PALETTE = [
  [0.000, 0.431, 0.455], // #006E74 base
  [0.000, 0.380, 0.400], // slightly darker
  [0.000, 0.320, 0.340], // mid
  [0.000, 0.500, 0.525], // slightly lighter
  [0.000, 0.431, 0.455], // #006E74 base repeat for weight
]
const HOME_VISIBLE_PALETTE = [
  [0.000, 0.431, 0.455], // #006E74
  [0.000, 0.460, 0.485], // lighter teal
  [0.000, 0.390, 0.415], // slightly muted
  [0.000, 0.431, 0.455], // #006E74
]
const TERRAIN_CLUSTER_LANES = [-0.18, -0.09, 0.00, 0.09, 0.18, 0.28]
const TERRAIN_CAM_FOV       = 55
const TERRAIN_CAM_HEIGHT    = 1.0   // eye height — lower = more ground fills screen
const TERRAIN_WORLD_WIDTH   = 48    // total particle field X spread (world units)
const TERRAIN_FIELD_DEPTH   = 95    // deep field — horizon is far, no hard edge visible
const TERRAIN_CAM_Z_START   = 22    // initial camera Z
const TERRAIN_CAM_Z_END     = 8     // final camera Z — 14 units travel, less scroll-back drama

// img: path relative to /public (served at root). Leave as '' to show gradient fallback.
// To add an image: drop the file in public/images/ and set img: '/images/filename.jpg'
const PROJECT_CARD_DATA = [
  {
    title: 'OLAM',       tags: ['MARKET', 'BRAND IDENTITY'],          bg: '#0d1f2d', img: '/images/olam.png',
    video: '', proto: '',
    gallery: ['/images/olam.png','/images/olam.png','/images/olam.png','/images/olam.png','/images/olam.png','/images/olam.png'],
    description: 'A landmark brand experience connecting global agriculture with a modern identity rooted in purpose and place.',
  },
  {
    title: 'INFOSYS',    tags: ['DIGITAL EXPERIENCE', 'UX DESIGN'],   bg: '#0d1a28', img: '/images/infosys.jpg',
    video: '', proto: '',
    gallery: ['/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg'],
    description: 'An immersive digital experience center that translates enterprise technology into human-centered narratives.',
  },
  {
    title: 'TATA',       tags: ['BRAND STRATEGY', 'IDENTITY'],        bg: '#1a0d1e', img: '/images/tata.jpg',
    video: '', proto: '',
    gallery: ['/images/tata.jpg','/images/tata.jpg','/images/tata.jpg','/images/tata.jpg','/images/tata.jpg','/images/tata.jpg'],
    description: 'A brand strategy that honours over a century of legacy while positioning Tata for a dynamic future.',
  },
  {
    title: 'WIPRO',      tags: ['INNOVATION', 'DIGITAL'],             bg: '#0d1f1a', img: '/images/wipro.jpg',
    video: '', proto: '',
    gallery: ['/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg'],
    description: 'Reimagining the workplace as a platform for innovation — where digital and physical converge seamlessly.',
  },
  {
    title: 'BIOCON',     tags: ['RESEARCH', 'COMMUNICATION'],         bg: '#1a1a0d', img: '/images/biocon.jpg',
    video: '', proto: '',
    gallery: ['/images/biocon.jpg','/images/biocon.jpg','/images/biocon.jpg','/images/biocon.jpg','/images/biocon.jpg','/images/biocon.jpg'],
    description: 'Science communication reimagined — translating complex biopharmaceutical research into vivid, accessible stories.',
  },
  {
    title: 'MINDTREE',   tags: ['CONSULTING', 'EXPERIENCE'],          bg: '#0d1828', img: '/images/mindtree.jpg',
    video: '', proto: '',
    gallery: ['/images/mindtree.jpg','/images/mindtree.jpg','/images/mindtree.jpg','/images/mindtree.jpg','/images/mindtree.jpg','/images/mindtree.jpg'],
    description: 'An experience center that brings consulting expertise to life through spatial storytelling and interactive discovery.',
  },
  {
    title: 'HERO',       tags: ['MOBILITY', 'BRAND EXPERIENCE'],      bg: '#1a100d', img: '/images/tata.jpg',
    video: '', proto: '',
    gallery: ['/images/tata.jpg','/images/tata.jpg','/images/tata.jpg','/images/tata.jpg','/images/tata.jpg','/images/tata.jpg'],
    description: 'A bold mobility brand experience that captures the spirit of two-wheeled freedom and aspiration across India.',
  },
  {
    title: 'ACCENTURE',  tags: ['STRATEGY', 'INNOVATION HUB'],        bg: '#0d1530', img: '/images/infosys.jpg',
    video: '', proto: '',
    gallery: ['/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg','/images/infosys.jpg'],
    description: 'A future-of-work innovation hub where strategy meets design — built for the next generation of enterprise thinking.',
  },
  {
    title: 'SIEMENS',    tags: ['INDUSTRIAL', 'SMART INFRASTRUCTURE'], bg: '#0f1a10', img: '/images/wipro.jpg',
    video: '', proto: '',
    gallery: ['/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg','/images/wipro.jpg'],
    description: 'Smart infrastructure brought to life — an experience that makes industrial intelligence tangible and inspiring.',
  },
  {
    title: 'RELIANCE',   tags: ['RETAIL', 'DIGITAL TRANSFORMATION'],  bg: '#1a0f0d', img: '/images/olam.png',
    video: '', proto: '',
    gallery: ['/images/olam.png','/images/olam.png','/images/olam.png','/images/olam.png','/images/olam.png','/images/olam.png'],
    description: 'Transforming retail at scale — a phygital experience that reimagines how millions of Indians discover and buy.',
  },
]
const ORBIT_RADIUS    = 520   // legacy CSS value; kept for reference only
const GALAXY_AUTO_ROTATE_SPEED = 0        // legacy; unused in new plane system
const GALAXY_ORBIT_TILT = 0               // legacy; unused in new plane system

// THREE.js project-cube parameters (camera-local world units)
const CUBE_S       = 2.2   // cube face size (square) — same model used for particle + transition
const PLANE_Z      = 5.2   // depth of active plane in front of camera
const ACTIVE_Y     = 0.3   // active cube Y offset (shift up to clear bottom bar)
const ACTIVE_ROT_Y = 0.28  // Y tilt on active cube — shows right face clearly
const ACTIVE_ROT_X = -0.12 // X tilt — tilts top face toward camera

// Each project's unique entry direction (camera-local X/Y offset)
const PROJ_ENTRY_DIRS = [
  { x:  14, y:  0 },
  { x:   0, y: -11 },
  { x: -14, y:  0 },
  { x:  10, y:  9 },
  { x: -10, y:  9 },
  { x:   0, y:  11 },
  { x:  12, y: -8 },
  { x: -12, y: -8 },
  { x:   7, y:  12 },
  { x:  -7, y:  12 },
]

// Fragment positions for the 9 non-active planes (decorative shards scattered in background)
const FRAG_POS = [
  { x: -20, y:  8.0, z: -15, rx:  0.50, ry:  1.10, rz:  0.20, s: 0.17 },
  { x:  24, y:  9.5, z: -18, rx: -0.40, ry: -0.90, rz:  0.10, s: 0.19 },
  { x: -22, y: -8.0, z: -16, rx:  0.65, ry:  0.80, rz: -0.30, s: 0.15 },
  { x:  18, y: -9.5, z: -14, rx: -0.50, ry: -1.20, rz:  0.40, s: 0.21 },
  { x:  -9, y: 10.5, z: -20, rx:  0.20, ry:  0.60, rz: -0.20, s: 0.13 },
  { x:  15, y:-10.5, z: -17, rx: -0.30, ry:  0.75, rz:  0.25, s: 0.16 },
  { x: -25, y: 11.0, z: -22, rx:  0.45, ry: -0.85, rz: -0.15, s: 0.14 },
  { x:  12, y:  9.5, z: -13, rx: -0.55, ry:  1.00, rz:  0.30, s: 0.18 },
  { x: -11, y:-10.5, z: -19, rx:  0.35, ry: -0.65, rz: -0.25, s: 0.15 },
]

const homeScreen = document.getElementById('home-screen')
const homeCanvas = document.getElementById('homeCanvas')
const homeHeading = document.querySelector('.home-heading')
const homeTextPortal = document.getElementById('homeTextPortal')
const mainLogo = document.getElementById('mainLogo')
const splashScreen = document.getElementById('splash-screen')
const splashCanvas = document.getElementById('splashCanvas')

let homeExited = false
let homePreExited = false   // set when projects canvas shown before full exit
let homeScrollProgress = 0
let homeScrollTarget = 0
let homeScrollVelocity = 0
let homeParticles = []
let homeAnimId = null
let menuItems = []
let currentActiveMenuIndex = 0
let currentAppState = 'TUNNEL'
let isScrollThrottled = false
let splashParticles = []
let splashAnimId = null
let splashActive = false
let homeVoidEl = null
let homeEdgeFadeEl = null
let enterFlyZ = 0
let enterFlyY = 0
let enterFlyTarget = 0
let enterActive = false
let headingRevealT = 0         // 0 → 1 over ~3s after splash; drives heading fade-in
let headingRevealActive = false
let galaxyActive = false
let galaxyScrollProgress = 0
let galaxyScrollTarget = 0
let galaxyAutoRot       = 0     // continuously incremented; drives passive orbit rotation
let galaxyExitTime      = 0     // timestamp of last exitGalaxyToDisc — scroll cooldown
let revertAfterFlyOut   = false // set by exitGalaxyToDisc; triggers scroll-back once fly-out lands
let galaxyViewEl = null   // legacy; unused in new plane system
let galaxyOrbitEl = null  // legacy; unused in new plane system
let galaxyCardEls = []    // legacy; unused in new plane system
let galleryOverlayEl = null   // legacy — no longer used
let galaxyViewAll    = false  // true while 3D grid-of-all is shown
let vaBackEl         = null   // "← BACK" DOM button in view-all mode
let vaLabelEl        = null   // hover info label in view-all mode
let vaHoverMeshIdx   = -1     // mesh index currently hovered in view-all mode
let vaZoomIdx        = -1     // mesh index frozen during zoom-into-card transition

const projTextureLoader = new THREE.TextureLoader()
let projectMeshes  = []    // THREE.Mesh array — one per project, added as camera children
let projInfoEl     = null  // bottom info overlay (fixed HTML)
let lastActiveIdx  = -1    // tracks which project is currently shown in overlay
let activeProjIdx  = 0     // integer index of currently displayed project
let isTransitioning = false
let lastScrollTime  = 0
let scrollAccum           = 0
let scrollAccumResetTimer = null
let shadowReceiverMesh  = null   // ShadowMaterial plane behind project planes
let projOverviewEl    = null   // #project-overview-screen DOM element
let projOverviewIdx   = -1     // project index currently shown in overview
let _hiddenProjMesh   = null   // particle mesh hidden while overview is open
let _projCubeSpinning = false  // true while the open/close overview spin is in progress
let _pendingMediaAction = null // 'video'|'proto'|'gallery' — queued while cube still spinning
let _pendingGalaxyExit = false  // true when podiumBack arrives while the overview cube-spin (open or close) is running — consumed by whichever of openProjectOverview/closeProjectOverview finishes next
let _subCubeSpinning = false   // true while a video/proto/gallery sub-screen cube-flip (openWithCube/closeWithCube) is in progress
let _pendingSubAction = null   // fn queued to run once the current sub-screen cube-flip finishes (e.g. a "back" pressed mid-open)
let bandOverlayEl   = null   // #band-overlay — the 4-band wipe transition element
let textOverlayCanvas = null
let textOverlayCtx    = null
let textParticles     = []
let textAnimId        = null
let ctaTextEl = null

// GLB cube model — loaded once, cloned for particles + transitions
let _cubeGLBScene     = null
let _cubeGLBCallbacks = []   // fns waiting for the GLB (particles created before it loads)
new GLTFLoader().load('/cube.glb', gltf => {
  _cubeGLBScene = gltf.scene
  _cubeGLBCallbacks.forEach(fn => fn(gltf.scene))
  _cubeGLBCallbacks = []
})

const homeRenderer = new THREE.WebGLRenderer({ canvas: homeCanvas, alpha: true, antialias: true })
homeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
homeRenderer.shadowMap.enabled = true
homeRenderer.shadowMap.type    = THREE.PCFSoftShadowMap
const homeScene = new THREE.Scene()
const homeCamera = new THREE.OrthographicCamera(0, DESIGN_W, DESIGN_H, 0, -10, 10)
// Separate 3D scene + PerspectiveCamera for terrain — renders behind homeScene
const terrainScene = new THREE.Scene()
const terrainPerspCamera = new THREE.PerspectiveCamera(TERRAIN_CAM_FOV, DESIGN_W / DESIGN_H, 0.1, 400)
terrainPerspCamera.position.set(0, TERRAIN_CAM_HEIGHT + 0.2, TERRAIN_CAM_Z_START)
terrainScene.add(terrainPerspCamera)  // needed so camera children (project planes) render in world space

// ── Post-processing: bloom for home-scroll glow and galaxy fly-in ────────────
const homeComposer = new EffectComposer(homeRenderer)

const _terrainRenderPass = new RenderPass(terrainScene, terrainPerspCamera)
const _homeRenderPass    = new RenderPass(homeScene, homeCamera)
_homeRenderPass.clear      = false   // composite on top of terrain
_homeRenderPass.clearDepth = false

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(DESIGN_W, DESIGN_H),
  0.0,   // strength — driven by scroll at runtime
  0.4,   // radius
  0.55   // threshold — only the very brightest highlights bloom
)

homeComposer.addPass(_terrainRenderPass)
homeComposer.addPass(_homeRenderPass)
homeComposer.addPass(bloomPass)
homeComposer.addPass(new OutputPass())

homeComposer.setSize(DESIGN_W, DESIGN_H)

// Current bloom target — lerped toward so transitions are smooth
let _bloomTarget = 0

// Lights for the 3-D project-plane meshes. Added as camera children so the
// illumination angle stays constant regardless of where the camera is looking.
const _projKeyLight = new THREE.DirectionalLight(0xffffff, 1.4)
_projKeyLight.position.set(5, 8, 4)
_projKeyLight.castShadow = true
_projKeyLight.shadow.mapSize.width  = 1024
_projKeyLight.shadow.mapSize.height = 1024
_projKeyLight.shadow.camera.left   = -9
_projKeyLight.shadow.camera.right  =  9
_projKeyLight.shadow.camera.top    =  9
_projKeyLight.shadow.camera.bottom = -9
_projKeyLight.shadow.camera.near   = 0.5
_projKeyLight.shadow.camera.far    = 32
_projKeyLight.shadow.bias          = -0.003
_projKeyLight.shadow.radius        = 3
const _projKeyTarget = new THREE.Object3D()
_projKeyTarget.position.set(0, 0, -6)
terrainPerspCamera.add(_projKeyLight, _projKeyTarget)
_projKeyLight.target = _projKeyTarget

const _projFillLight = new THREE.DirectionalLight(0x8899cc, 0.65)
_projFillLight.position.set(-5, -3, 3)        // lower-left fill
const _projFillTarget = new THREE.Object3D()
_projFillTarget.position.set(0, 0, -6)
terrainPerspCamera.add(_projFillLight, _projFillTarget)
_projFillLight.target = _projFillTarget

const _projAmbient = new THREE.AmbientLight(0xffffff, 0.30)
terrainScene.add(_projAmbient)
let terrainCamZ = TERRAIN_CAM_Z_START   // lerped camera z (persists across frames)
let terrainCamY = TERRAIN_CAM_HEIGHT + 0.2
const homeGeometry = new THREE.BufferGeometry()
const homePositions = new Float32Array(HOME_PARTICLE_COUNT * 3)
const homeColors = new Float32Array(HOME_PARTICLE_COUNT * 4)
const homeSizes = new Float32Array(HOME_PARTICLE_COUNT)
let terrainParticles = []
const terrainPositions = new Float32Array(TERRAIN_COUNT * 3)
const terrainColors = new Float32Array(TERRAIN_COUNT * 4)
const terrainSizes = new Float32Array(TERRAIN_COUNT)
const terrainGeometry = new THREE.BufferGeometry()
let homePillarGeo = null
let homePillarLines = null
let pillarBaseColors = null

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
        vec2 uv = abs(gl_PointCoord - 0.5);
        float sq = max(uv.x, uv.y);
        float alpha = vColor.a * smoothstep(0.5, 0.44, sq);
        gl_FragColor = vec4(vColor.rgb, alpha);
      }
    `,
  })
}

function makeTerrainMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uPixelRatio:  { value: Math.min(window.devicePixelRatio, 2) },
      uFocalLength: { value: DESIGN_H * 0.5 / Math.tan(TERRAIN_CAM_FOV * 0.5 * Math.PI / 180) },
    },
    vertexShader: `
      attribute float aSize;
      attribute vec4 aColor;
      varying vec4 vColor;
      uniform float uPixelRatio;
      uniform float uFocalLength;
      void main() {
        vColor = aColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = aSize * uPixelRatio * uFocalLength / max(-mvPosition.z, 0.1);
      }
    `,
    fragmentShader: `
      varying vec4 vColor;
      void main() {
        vec2 uv = abs(gl_PointCoord - 0.5);
        float sq = max(uv.x, uv.y);
        float alpha = vColor.a * smoothstep(0.5, 0.44, sq);
        gl_FragColor = vec4(vColor.rgb, alpha);
      }
    `,
  })
}
const homeMaterial = makeParticleMaterial()
const terrainMaterial = makeTerrainMaterial()
homeGeometry.setAttribute('position', new THREE.BufferAttribute(homePositions, 3))
homeGeometry.setAttribute('aColor', new THREE.BufferAttribute(homeColors, 4))
homeGeometry.setAttribute('aSize', new THREE.BufferAttribute(homeSizes, 1))
homeScene.add(new THREE.Points(homeGeometry, homeMaterial))
terrainGeometry.setAttribute('position', new THREE.BufferAttribute(terrainPositions, 3))
terrainGeometry.setAttribute('aColor', new THREE.BufferAttribute(terrainColors, 4))
terrainGeometry.setAttribute('aSize', new THREE.BufferAttribute(terrainSizes, 1))
terrainScene.add(new THREE.Points(terrainGeometry, terrainMaterial))

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function syncRenderer(renderer, camera) {
  renderer.setSize(DESIGN_W, DESIGN_H, false)
  if (renderer === homeRenderer) homeComposer.setSize(DESIGN_W, DESIGN_H)
  camera.left = 0
  camera.right = DESIGN_W
  camera.top = DESIGN_H
  camera.bottom = 0
  camera.updateProjectionMatrix()
}

function resizeSplashCanvas() {
  if (!splashCanvas) return
  const dpr = Math.min(window.devicePixelRatio, 2)
  splashCanvas.width = Math.floor(DESIGN_W * dpr)
  splashCanvas.height = Math.floor(DESIGN_H * dpr)
  const ctx = splashCanvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function createSplashParticles() {
  const count = 140
  const width = DESIGN_W
  const height = DESIGN_H
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
  const width = DESIGN_W
  const height = DESIGN_H
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

  const W = cvs.width  = DESIGN_W
  const H = cvs.height = DESIGN_H
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
    headingRevealActive = true   // JS will now fade the heading in via animateHome
    const menu = document.querySelector('.galaxy-side-menu')
    if (menu) menu.classList.add('visible')
    if (splashScreen) splashScreen.classList.add('hidden')
    window.setTimeout(() => {
      if (splashScreen) splashScreen.style.display = 'none'
      splashActive = false
    }, 850)
  }, 4100)
}

function sampleHomePalette() {
  const r = Math.random()
  if (r < 0.42) return HOME_VISIBLE_PALETTE[0]
  if (r < 0.70) return HOME_VISIBLE_PALETTE[1]
  if (r < 0.92) return HOME_VISIBLE_PALETTE[2]
  if (r < 0.985) return HOME_PARTICLE_PALETTE[3]
  return HOME_PARTICLE_PALETTE[3]
}

function randGauss() {
  let u = 0
  let v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function spawnHomeParticle(immediate = false, type = 'ground') {
  const h = DESIGN_H
  const w = DESIGN_W
  const color = sampleHomePalette()
  if (type === 'star') {
    const sizeRand = Math.random()
    const r = sizeRand < 0.78 ? Math.random() * 0.55 + 0.25
        : sizeRand < 0.96 ? Math.random() * 0.9 + 0.55
        : Math.random() * 1.4 + 1.0
    return {
      type: 'star',
      originX: (Math.random() - 0.5) * w * 1.95,
      originY: (Math.random() - 0.62) * h * 1.34,
      arm: Math.floor(Math.random() * 3),
      spiralRadius: Math.pow(Math.random(), 0.55),
      spiralJitter: randGauss() * 0.045,
      drift: (Math.random() - 0.5) * 0.055,
      depth: immediate ? Math.random() : Math.random() * 0.04,
      speed: 0.00022 + Math.random() * 0.00058,
      r,
      glow: false,
      color,
      opacity: 0.020 + Math.random() * 0.044,
      phase: Math.random() * Math.PI * 2,
      topH: h,
      vortexR: (() => { const q = Math.random(); return q < 0.14 ? 0.05 + Math.random() * 0.42 : q < 0.74 ? 0.52 + Math.pow(Math.random(), 1.3) * 0.68 : 0.92 + Math.random() * 0.88 })(),
      vortexAngle: Math.random() * Math.PI * 2,
      vortexAngSpeed: 0.00010 + Math.random() * 0.00018,
      isPlume: Math.random() < 0.065,
      parallaxLayer: Math.floor(Math.random() * 3),
    }
  }
  if (type === 'float') {
    const fh = DESIGN_H, fw = DESIGN_W
    return {
      type: 'float',
      x: Math.random() * fw,
      y: immediate ? Math.random() * fh * 0.80 : -Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.10,
      vy: (Math.random() - 0.5) * 0.06,
      r: 0.3 + Math.random() * 1.1,
      color: sampleHomePalette(),
      opacity: 0.05 + Math.random() * 0.10,
      phase: Math.random() * Math.PI * 2,
      driftAmp: 0.15 + Math.random() * 0.55,
      parallaxLayer: Math.floor(Math.random() * 3),
    }
  }
  const sizeRand = Math.random()
  const r = sizeRand < 0.78 ? Math.random() * 0.55 + 0.25
      : sizeRand < 0.96 ? Math.random() * 0.9 + 0.55
      : Math.random() * 1.4 + 1.0
  return {
    type: 'ground',
    x: Math.random() * DESIGN_W,
    y: immediate ? Math.random() * h * 0.28 : -Math.random() * 80,
    vy: 0.045 + Math.random() * 0.09,
    r,
    glow: false,
    color,
    opacity: 0.012 + Math.random() * 0.038,
    phase: Math.random() * Math.PI * 2,
    topH: h,
  }
}

function initHomeParticles() {
  const FLOAT_COUNT = 620
  const starCount = STAR_COUNT - FLOAT_COUNT
  homeParticles = [
    ...Array.from({ length: starCount }, () => spawnHomeParticle(true, 'star')),
    ...Array.from({ length: FLOAT_COUNT }, () => spawnHomeParticle(true, 'float')),
  ]
}

function initTerrainParticles() {
  terrainParticles = Array.from({ length: TERRAIN_COUNT }, () => spawnTerrainParticle(true))
}

function createHomePillars() {
  if (homePillarLines) { homeScene.remove(homePillarLines); homePillarGeo.dispose() }
  const w = DESIGN_W, h = DESIGN_H
  const horizonY = h * 0.35   // world y at CSS horizon (y-up camera)
  const cx = w * 0.5
  const COUNT = 420
  const pos = new Float32Array(COUNT * 6)
  const col = new Float32Array(COUNT * 6)
  // #006E74 → [0, 0.431, 0.455]
  const CR = 0.00, CG = 0.431, CB = 0.455
  for (let i = 0; i < COUNT; i++) {
    // Dense Gaussian cluster — spread across most of the screen width
    const g = Math.sqrt(-2 * Math.log(Math.random() + 1e-5)) * Math.cos(2 * Math.PI * Math.random())
    const x = cx + g * w * 0.28
    const normDist = Math.abs(x - cx) / (w * 0.5)
    // Pillars: tall enough to fill screen when zoomed in, shorter at edges
    const ht = h * (0.24 - normDist * 0.08) * (0.18 + Math.random() * 0.62)
    const y0 = horizonY
    const y1 = horizonY + Math.max(4, ht)
    const brightness = 0.16 + Math.random() * 0.42
    const j = i * 6
    pos[j]=x;   pos[j+1]=y0; pos[j+2]=0
    col[j]=CR*0.04; col[j+1]=CG*0.04; col[j+2]=CB*0.04
    pos[j+3]=x; pos[j+4]=y1; pos[j+5]=0
    col[j+3]=CR*brightness; col[j+4]=CG*brightness; col[j+5]=CB*brightness
  }
  pillarBaseColors = col.slice()
  homePillarGeo = new THREE.BufferGeometry()
  homePillarGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  homePillarGeo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  homePillarLines = new THREE.LineSegments(homePillarGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
  }))
}

function createVoidEl() {
  if (homeVoidEl) homeVoidEl.remove()
  homeVoidEl = document.createElement('div')
  homeVoidEl.style.cssText = [
    'position:absolute',
    'border-radius:50%',
    'pointer-events:none',
    'z-index:5',
    'transform:translate(-50%,-50%)',
    'opacity:0',
    // Gradient centre offset toward bottom-left so top-right edge fades naturally into background
    'background:radial-gradient(circle at 44% 56%, rgba(5,16,30,0.98) 22%, rgba(5,16,30,0.84) 46%, rgba(5,16,30,0.28) 68%, transparent 88%)',
  ].join(';')
  if (homeScreen) homeScreen.appendChild(homeVoidEl)
}

function createEdgeFadeEl() {
  if (homeEdgeFadeEl) homeEdgeFadeEl.remove()
  homeEdgeFadeEl = document.createElement('div')
  homeEdgeFadeEl.style.cssText = [
    'position:absolute', 'inset:0', 'pointer-events:none', 'z-index:4', 'opacity:0',
    // Left-side fade + corner wedges so the particle arc dissolves naturally off-screen
    'background:' + [
      'linear-gradient(to right, rgba(5,16,30,0.95) 0%, rgba(5,16,30,0.55) 12%, transparent 26%)',
      'linear-gradient(135deg, rgba(5,16,30,0.88) 0%, transparent 28%)',
      'linear-gradient(225deg, rgba(5,16,30,0.88) 0%, transparent 28%)',
    ].join(', '),
  ].join(';')
  if (homeScreen) homeScreen.appendChild(homeEdgeFadeEl)
}

function spawnTerrainParticle(stagger = false) {
  const isAir = Math.random() < 0.38  // 38% air — fills upper-left during tilt
  const lane = TERRAIN_CLUSTER_LANES[Math.floor(Math.random() * TERRAIN_CLUSTER_LANES.length)]
  const rLane = Math.random()
  // 18% left-wing bias so the arc extends into bottom-left + top-left during vortex tilt
  const sideBias = rLane < 0.46
    ? lane + randGauss() * 0.055           // 46%: clustered central lanes
    : rLane < 0.62
      ? (Math.random() - 0.5) * 0.55      // 16%: medium centre spread
      : rLane < 0.80
        ? -(0.12 + Math.random() * 0.70)  // 18%: left wing  (worldX -5 to -40)
        : (Math.random() - 0.5) * 1.60    // 20%: full-width spread (both sides)
  const worldX = sideBias * TERRAIN_WORLD_WIDTH
  const worldY = isAir
    ? 0.25 + Math.pow(Math.random(), 1.5) * 3.5   // up to 3.75 — fills upper screen
    : Math.pow(Math.random(), 1.18) * 1.0
  const FULL_RANGE = TERRAIN_CAM_Z_START - (TERRAIN_CAM_Z_END - TERRAIN_FIELD_DEPTH)
  // 88% of particles in the nearest 35% of depth — very dense foreground layer
  const worldZ = stagger
    ? (Math.random() < 0.88
        ? TERRAIN_CAM_Z_START - Math.random() * (FULL_RANGE * 0.35)
        : TERRAIN_CAM_Z_START - Math.random() * FULL_RANGE)
    : TERRAIN_CAM_Z_END - TERRAIN_FIELD_DEPTH - Math.random() * 10
  const color = sampleHomePalette()
  // 70% micro-dust tier — fills all gaps between larger particles
  const isMicro = !isAir && Math.random() < 0.70
  const r = isAir
    ? 0.004  + Math.pow(Math.random(), 1.5) * 0.016
    : isMicro
      ? 0.003  + Math.pow(Math.random(), 1.5) * 0.012
      : 0.008  + Math.pow(Math.random(), 1.5) * 0.038
  const vRnd = Math.random()
  const vortexR = vRnd < 0.55
    ? 0.12 + Math.pow(Math.random(), 1.8) * 0.32
    : vRnd < 0.85
      ? 0.44 + Math.random() * 0.58
      : 0.80 + Math.random() * 1.10
  return {
    worldX, worldY, worldZ, isAir,
    r, color,
    opacity: isAir   ? 0.22 + Math.random() * 0.28
           : isMicro ? 0.74 + Math.random() * 0.26
           : 0.62 + Math.random() * 0.38,
    phase: Math.random() * Math.PI * 2,
    wobble: Math.random() * 0.08 + 0.02,
    vortexR,
    vortexAngle: Math.random() * Math.PI * 2,
    vortexAngSpeed: 0.00008 + Math.random() * 0.00016,
    isPlume: Math.random() < 0.06,
  }
}

function animateHome() {
  const h = DESIGN_H
  const w = DESIGN_W
  const now = performance.now()
  const portalOffset = homeHeading && homeTextPortal
    ? homeTextPortal.offsetLeft + homeTextPortal.offsetWidth * 0.5 - homeHeading.offsetWidth * 0.5
    : 0
  const portalWorldX = w * 0.5 + portalOffset
  const portalWorldY = h * 0.35
  homeScrollVelocity *= 0.90
  const velocityBoost = 1 + homeScrollVelocity * 2.8
  const vortexT = easeInOutCubic(Math.max(0, Math.min(1, (homeScrollProgress - HOME_VORTEX_START_SCROLL) / (HOME_EXIT_SCROLL - HOME_VORTEX_START_SCROLL))))
  // Star orbital stays centred so stars fill the full frame (including left side)
  const vortexX = w * 0.5
  const vortexY = h * 0.50
  const vortexRadius = Math.min(w, h) * 0.46   // larger radius — ring arc spans most of the screen

  // Smooth scroll-to-enter tunnel. Keep the camera fixed so the terrain does not lift.
  homeScrollProgress += (homeScrollTarget - homeScrollProgress) * 0.055

  // Background and menu colour both transition across the full scroll range.
  // t=0 → solid #05101E + white menu text; t=1 → white background + black menu text.
  {
    const t  = Math.min(1, homeScrollProgress / HOME_EXIT_SCROLL)
    if (homeScreen) {
      const r = Math.round(5  + t * 250), g = Math.round(16 + t * 239), b = Math.round(30 + t * 225)
      homeScreen.style.background = `rgb(${r},${g},${b})`
    }
    // Menu: white (255) → black (0) as background lightens
    const menuV = Math.round(255 * (1 - t))
    document.documentElement.style.setProperty('--menu-rgb', `${menuV}, ${menuV}, ${menuV}`)
  }

  // When camera flies into the disc, keep the current homeScreen background
  // instead of fading it fully to black.
  if (enterActive && homeScreen) {
    // no-op: preserve existing background gradient and avoid a black screen.
  }

  if (homeScrollProgress >= HOME_EXIT_SCROLL - 0.02) {
    homeScrollProgress = HOME_EXIT_SCROLL
    homeScrollTarget   = HOME_EXIT_SCROLL
    if (!homeExited) exitHomeScreen()
  }
  // Star layer gently zooms toward screen center as you scroll in
  const camT = easeInOutCubic(Math.min(1, homeScrollProgress / 0.5))
  const camZoom = 1 + camT * 2.5
  homeCamera.left   = w * 0.5 - w / (2 * camZoom)
  homeCamera.right  = w * 0.5 + w / (2 * camZoom)
  homeCamera.top    = h * 0.5 + h / (2 * camZoom)
  homeCamera.bottom = h * 0.5 - h / (2 * camZoom)
  homeCamera.updateProjectionMatrix()

  // Fade out scroll cue / floating text
  const scrollCueEl = document.querySelector('.home-scroll-cue')
  const floatTextEl = document.querySelector('.home-floating-text')
  const fadeOut = Math.max(0, 1 - homeScrollProgress * 3)
  if (scrollCueEl) scrollCueEl.style.opacity = fadeOut
  if (floatTextEl) floatTextEl.style.opacity = fadeOut

  // Heading: fully JS-driven 3D billboard — no CSS animation, no interference.
  // Projects a fixed world-space point onto screen every frame so the text
  // sits inside the terrain field and the camera scrolls through it.
  if (headingRevealActive) headingRevealT = Math.min(1, headingRevealT + 0.006) // ~2.8s
  if (homeHeading) {
    const TEXT_WORLD_Z  = 15   // world Z — camera starts at Z=22, passes this midway
    const TEXT_WORLD_Y  = 1.0  // lower in world space so the heading sits among the particles
    const TEXT_REF_DIST = 8    // dist at which CSS base size looks natural
    const textV3 = new THREE.Vector3(0, TEXT_WORLD_Y, TEXT_WORLD_Z)
    textV3.project(terrainPerspCamera)
    const screenX    = ( textV3.x * 0.5 + 0.5) * w
    const screenY    = (-textV3.y * 0.5 + 0.5) * h
    const dist       = terrainCamZ - TEXT_WORLD_Z          // positive = text ahead of cam
    const revealFade = easeInOutCubic(headingRevealT)       // slow initial appearance
    if (dist > 0.3 && revealFade > 0) {
      const perspScale  = TEXT_REF_DIST / dist
      const distFade    = Math.min(1, Math.max(0, (dist - 0.8) / 2.5))
      homeHeading.style.visibility = 'visible'
      homeHeading.style.left       = `${screenX}px`
      homeHeading.style.top        = `${screenY}px`
      homeHeading.style.transform  = `translate(-50%, -50%) scale(${perspScale})`
      homeHeading.style.opacity    = `${(distFade * revealFade).toFixed(3)}`
    } else {
      homeHeading.style.visibility = 'hidden'
      homeHeading.style.opacity    = '0'
    }
  }

  const tunnelFold = easeInOutCubic(Math.max(0, Math.min(1, (homeScrollProgress - 0.55) / 0.75)))

  homeParticles.forEach((p, i) => {
    const ix = i * 3
    const cx = i * 4

    if (p.type === 'star') {
      const layerMult = 0.72 + (p.parallaxLayer ?? 1) * 0.28
      const vortexSlow = Math.max(0.04, 1 - vortexT * 0.96)
      p.depth += p.speed * (0.25 + p.depth * 0.85) * (1 + homeScrollProgress * 12 * vortexSlow) * velocityBoost * layerMult * vortexSlow
      if (p.depth >= 1) {
        homeParticles[i] = spawnHomeParticle(false, 'star')
        homeColors[cx + 3] = 0
        return
      }
      const d = p.depth * p.depth * (3 - 2 * p.depth)
      const perspective = 0.16 + d * 3.15
      const wave = Math.sin(now * 0.00030 + p.phase + p.depth * 5.5)
      let px = portalWorldX + (p.originX + wave * w * 0.006) * perspective + p.drift * w * p.depth
      let py = portalWorldY + (p.originY + wave * h * 0.006) * perspective
      let vOpacBoost = 1.0
      if (vortexT > 0) {
        let vtx, vty
        if (p.isPlume) {
          // Tight plume upper-right, matching reference image
          const pDir = -Math.PI * 0.32 + (p.phase - Math.PI) * 0.08
          const pLen = vortexRadius * (1.05 + p.vortexR * 0.55)
          vtx = vortexX + Math.cos(pDir) * pLen
          vty = vortexY + Math.sin(pDir) * pLen
          vOpacBoost = 1 + vortexT * 1.2
        } else {
          const orbitR = Math.min(1.8, p.vortexR) * vortexRadius
          const angSpeed = p.vortexAngSpeed / Math.max(0.06, p.vortexR)
          const angle = p.vortexAngle + angSpeed * now
          vtx = vortexX + Math.cos(angle) * orbitR
          vty = vortexY + Math.sin(angle) * orbitR * 0.82   // more circular — arc extends up and down more
          // Ring-band brightness: peak at vortexR≈0.80, dim center + far outer
          const ringDist = Math.abs(p.vortexR - 0.80) / 0.55
          const ringBoost = Math.max(0, 1 - ringDist * ringDist) * 3.2
          const centerDim = Math.max(0, 1 - p.vortexR / 0.40) * 0.90
          vOpacBoost = 1 + vortexT * (ringBoost - centerDim)
        }
        // All layers reach full orbital position by vortexT=1
        const blend = easeInOutCubic(Math.min(1, vortexT * 1.05))
        px += (vtx - px) * blend
        py += (vty - py) * blend
      }
      const fadeIn = Math.min(1, p.depth / 0.12)
      const fadeNear = Math.max(0, 1 - Math.max(0, p.depth - 0.94) / 0.06)
      const shimmer = 0.82 + 0.18 * Math.sin(p.phase + now * 0.0011)
      const scrollLift = 1 + homeScrollProgress * 1.2
      // Star/tunnel particles vanish as vortex builds — terrain ring takes over as sole visual
      const starFade = Math.max(0, 1 - vortexT * 4.0)
      const finalOpacity = p.opacity * fadeIn * fadeNear * shimmer * scrollLift * Math.max(0.1, vOpacBoost) * starFade
      homePositions[ix] = px
      homePositions[ix + 1] = py
      homePositions[ix + 2] = 0
      homeColors[cx]     = p.color[0]
      homeColors[cx + 1] = p.color[1]
      homeColors[cx + 2] = p.color[2]
      homeColors[cx + 3] = finalOpacity
      homeSizes[i] = p.r * (0.85 + perspective * 1.65) * (1 + vortexT * 1.2)
      return
    }

    if (p.type === 'float') {
      const fw = DESIGN_W, fh = DESIGN_H
      p.x += p.vx + Math.sin(now * 0.00055 + p.phase) * p.driftAmp * 0.28
      p.y += p.vy + Math.cos(now * 0.00065 + p.phase * 1.3) * p.driftAmp * 0.18
      if (p.x < -8) p.x = fw + 8
      if (p.x > fw + 8) p.x = -8
      if (p.y < -8) p.y = fh * 0.82 + 8
      if (p.y > fh * 0.82 + 8) p.y = -8
      const shimmer = 0.70 + 0.30 * Math.sin(p.phase + now * 0.00085)
      // Float particles disappear as terrain becomes dominant
      const floatFade = Math.max(0, 1 - homeScrollProgress * 5.0)
      homePositions[ix] = p.x
      homePositions[ix + 1] = p.y
      homePositions[ix + 2] = 0
      homeColors[cx]     = p.color[0]
      homeColors[cx + 1] = p.color[1]
      homeColors[cx + 2] = p.color[2]
      homeColors[cx + 3] = p.opacity * shimmer * floatFade
      homeSizes[i] = p.r * 2.6
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

  // Terrain — 3D PerspectiveCamera scrolls forward through the particle field
  // Camera keyframes: terrainScroll 0→1 maps to homeScrollProgress 0→HOME_VORTEX_START_SCROLL
  const terrainScroll = Math.min(homeScrollProgress / HOME_VORTEX_START_SCROLL, 1.0)
  const TC = [
    { p: 0.00, z: TERRAIN_CAM_Z_START,     y: TERRAIN_CAM_HEIGHT + 0.2, lookY: TERRAIN_CAM_HEIGHT + 0.1 },
    { p: 0.25, z: TERRAIN_CAM_Z_START - 4, y: TERRAIN_CAM_HEIGHT + 0.1, lookY: TERRAIN_CAM_HEIGHT       },
    { p: 0.55, z: TERRAIN_CAM_Z_START - 9, y: TERRAIN_CAM_HEIGHT,       lookY: TERRAIN_CAM_HEIGHT - 0.05 },
    { p: 1.00, z: TERRAIN_CAM_Z_END,       y: TERRAIN_CAM_HEIGHT - 0.1, lookY: TERRAIN_CAM_HEIGHT - 0.1 },
  ]
  let tgtZ = TERRAIN_CAM_Z_END, tgtY = TERRAIN_CAM_HEIGHT - 0.1, tgtLookY = TERRAIN_CAM_HEIGHT - 0.1
  for (let k = 0; k < TC.length - 1; k++) {
    const lo = TC[k], hi = TC[k + 1]
    if (terrainScroll >= lo.p && terrainScroll <= hi.p) {
      const t = easeInOutCubic((terrainScroll - lo.p) / (hi.p - lo.p))
      tgtZ     = lo.z     + (hi.z     - lo.z)     * t
      tgtY     = lo.y     + (hi.y     - lo.y)     * t
      tgtLookY = lo.lookY + (hi.lookY - lo.lookY) * t
      break
    }
  }
  terrainCamZ += (tgtZ - terrainCamZ) * 0.06   // slightly snappier — less lag on scroll-back
  terrainCamY += (tgtY - terrainCamY) * 0.06

  // Disc centre in world space (precomputed here so fly-in can target it)
  const discCenterY = tgtLookY + (-8.6 * vortexT)   // matches gCy in particle loop
  const discCenterZ = terrainCamZ - 14               // gCz — fixed while homeExited

  // Enter fly-in / fly-out: camera lerps toward enterFlyTarget (17 = in, 0 = out).
  // Flying in:  Y tracks disc-centre; cards spawn only when fully arrived (>16.3).
  // Flying out: Y lerps back to 0; enterActive clears when camera reaches start.
  if (enterActive) {
    enterFlyZ += (enterFlyTarget - enterFlyZ) * 0.038
    if (enterFlyTarget > 0) {
      enterFlyY += (discCenterY - (terrainCamY + enterFlyY)) * 0.038
      // Only spawn cards when >96% of the way in so they appear at full zoom
      if (!galaxyActive && enterFlyZ > 16.3) createGalaxyView()
    } else {
      // Reverse: lerp Y back to neutral
      enterFlyY += (0 - enterFlyY) * 0.038
      if (enterFlyZ < 0.15) {
        enterFlyZ = 0; enterFlyY = 0; enterActive = false
        if (revertAfterFlyOut) {
          revertAfterFlyOut = false
          // Stay on disc view (homeExited stays true) and re-show the CTA so
          // the user can re-enter by scrolling forward or clicking ENTER.
          launchTextParticles()
        }
      }
    }
  }
  if (galaxyActive) {
    updateGalaxyCards()
  }
  const activeCamZ = terrainCamZ - enterFlyZ
  const activeCamY = terrainCamY + enterFlyY

  // Vortex phase: camera tilts down and rolls to match the projects orbital disc exactly.
  // vortexDropY gives sin(31.3°)=0.52 squash → matches projects ORBIT_SQUASH=0.52
  // vortexRoll = 0.26 rad CCW → matches |projects GALAXY_TILT|=0.26 (right side rises)
  // Camera centred over disc (panX=camX=0) → disc appears at same screen centre as projects orbit
  const vortexPanX  = 0                        // disc centred — matches projects system centre
  const vortexCamX  = 0                        // no lateral drift — symmetric view
  const vortexDropY = -8.6 * vortexT          // 31.3° down → squash 0.52 = ORBIT_SQUASH
  const vortexRoll  =  0.26 * vortexT         // 14.9° CCW = |GALAXY_TILT| — same tilt as projects ring

  // flyT: 0 = disc view (pre-enter), 1 = camera fully settled above the disc
  const flyT = (enterFlyTarget > 0) ? Math.min(1, enterFlyZ / enterFlyTarget) : 0

  // Approach: look at disc centre Y. Inside: tilt the camera downward so the
  // particle field settles in the bottom half of the screen.
  const lookAtY = discCenterY + flyT * 0.6 - 1.8

  // LookAt Z extends well past disc centre to keep view direction stable when the
  // camera has already punched through the disc's Z midpoint.
  const lookAtZ = discCenterZ - flyT * 14

  // Camera roll: unwind the CCW vortex tilt as the camera settles above the disc
  const flyRoll = vortexRoll * (1 - flyT)

  terrainPerspCamera.up.set(-Math.sin(flyRoll), Math.cos(flyRoll), 0)
  terrainPerspCamera.position.set(vortexCamX, activeCamY, activeCamZ)
  terrainPerspCamera.lookAt(vortexPanX, lookAtY, lookAtZ)

  // Widen FOV as camera enters the disc — wider angle spreads the orbital ring
  // across the full screen so particles surround the card orbit from all sides.
  const vortexFOV = TERRAIN_CAM_FOV + vortexT * 20 + flyT * 14  // 55°→75°→89°
  terrainPerspCamera.fov = vortexFOV
  terrainPerspCamera.updateProjectionMatrix()
  terrainMaterial.uniforms.uFocalLength.value = DESIGN_H * 0.5 / Math.tan(vortexFOV * 0.5 * Math.PI / 180)

  // Fade edge overlay OUT during vortex — galaxy fills the screen, no need to hide edges
  if (homeEdgeFadeEl) homeEdgeFadeEl.style.opacity = Math.max(0, 0.5 - vortexT * 0.8).toFixed(3)

  // Update camera matrix now so text projection and galaxy basis vectors below are accurate
  terrainPerspCamera.updateMatrixWorld()

  // ── Spiral Galaxy Disc ──────────────────────────────────────────────────────
  // Particles warp from flat terrain field into a galaxy-disc in the XZ plane.
  // Camera looks down ~25° so the disc projects as a tilted ellipse; CCW roll
  // rotates the major axis to match the reference image orientation.
  // Each particle's vortexR (pre-set, 0-1.9) = orbital radius tier.
  // Each particle's vortexAngle (pre-set, 0-2π) = arm angle.
  // A log-spiral twist offsets the arm angle per ring → visible spiral arms.
  // ────────────────────────────────────────────────────────────────────────────
  const galaxyWarp = easeInOutCubic(Math.max(0, (vortexT - 0.25) / 0.75))

  // Disc large enough to cover the full screen (depth=14, focal≈1252px → 89px/unit):
  // corners at ~1100px from centre → R_outer=14 → 14*89=1246px > 1100px covers everything
  const GALAXY_R_INNER = 0.9
  const GALAXY_R_OUTER = 14
  const SPIRAL_TWIST   = 5.5   // more sweep on the larger disc so arms stay distinct
  const NUM_ARMS       = 2

  const gCx = 0
  const gCy = tgtLookY + (-8.6 * vortexT)
  const gCz = terrainCamZ - 14

  terrainParticles.forEach((p, i) => {
    const ix = i * 3, cx = i * 4
    p.worldZ += 0.00010

    const distFromCam = activeCamZ - p.worldZ
    // When galaxyWarp > 0 the particle warps to a completely different renderZ.
    // Pre-warp distFromCam is no longer meaningful — skip the behind-camera cull
    // and let the post-warp renderZ check below handle culling.
    if (galaxyWarp < 0.01) {
      if (distFromCam < 0 || distFromCam > TERRAIN_FIELD_DEPTH) {
        terrainColors[cx + 3] = 0
        terrainSizes[i] = 0
        return
      }
    } else if (distFromCam > TERRAIN_FIELD_DEPTH + 40) {
      terrainColors[cx + 3] = 0
      terrainSizes[i] = 0
      return
    }

    const wave = Math.sin(now * 0.00035 + p.phase)
    let posX   = p.worldX + wave * p.wobble * 0.5
    let posY   = p.worldY + Math.sin(p.phase + now * 0.0008) * 0.03
    let renderZ = p.worldZ

    let armBright = 1, voidFade = 1

    if (galaxyWarp > 0) {
      // Normalised orbital radius 0=centre 1=outer edge
      const normR = Math.min(1, p.vortexR / 1.55)
      // Add arm scatter via worldX so the arms have natural thickness
      const scatter = (p.worldX / TERRAIN_WORLD_WIDTH) * 1.8
      const discR   = GALAXY_R_INNER + (normR + scatter * 0.06) * (GALAXY_R_OUTER - GALAXY_R_INNER)

      // Logarithmic spiral: outer rings rotate further → creates curved arms
      const spiralAngle = p.vortexAngle + normR * SPIRAL_TWIST
      const tgtX = gCx + Math.cos(spiralAngle) * discR
      // Vertical thickness: each particle gets a phase-driven Y offset so the disc
      // becomes a volumetric cloud slab (~±1.4 units) rather than a flat plane.
      // Inner ring is slightly more compressed than outer, matching a real galaxy bulge.
      const thickAmp = 1.4 * (0.55 + 0.45 * normR)
      const tgtY = gCy + Math.sin(p.phase * 2.1 + normR * 3.7) * thickAmp
      const tgtZ = gCz + Math.sin(spiralAngle) * discR

      posX    = posX    + (tgtX  - posX)    * galaxyWarp
      posY    = posY    + (tgtY  - posY)    * galaxyWarp
      renderZ = renderZ + (tgtZ  - renderZ) * galaxyWarp

      // Update orbit BEFORE the cull check so that particles which have drifted
      // behind the camera keep orbiting and smoothly sweep back into view.
      const omega = 0.00022 / Math.pow(normR + 0.10, 0.75)
      p.vortexAngle += omega * galaxyWarp

      // Particles behind the camera plane are invisible; they continue orbiting
      // above and will re-enter the visible front half on the next arc.
      if (activeCamZ - renderZ <= 0) {
        terrainColors[cx + 3] = 0
        terrainSizes[i] = 0
        return
      }

      // Hollow void: fade out innermost particles to reveal the dark core
      voidFade = Math.min(1, Math.max(0, (normR - 0.04) / 0.12))

      // Arm brightness: two arms, brighter on-arm, still visible between arms
      const cosArm = 0.5 + 0.5 * Math.cos(NUM_ARMS * p.vortexAngle)
      armBright = 0.28 + 0.72 * cosArm
      armBright = 1 - galaxyWarp + galaxyWarp * armBright
      voidFade  = 1 - galaxyWarp + galaxyWarp * voidFade
    }

    const renderDist = activeCamZ - renderZ
    const fadeIn   = Math.min(1, Math.max(0, (TERRAIN_FIELD_DEPTH - distFromCam) / (TERRAIN_FIELD_DEPTH * 0.22)))
    // Extended soft fade near camera plane so particles ease out rather than pop
    const fadeNear = Math.min(1, Math.max(0, (renderDist - 0.2) / 3.5))
    const shimmer  = 0.80 + 0.20 * Math.sin(p.phase + now * 0.0014)
    terrainPositions[ix]     = posX
    terrainPositions[ix + 1] = posY
    terrainPositions[ix + 2] = renderZ
    terrainColors[cx]     = p.color[0]
    terrainColors[cx + 1] = p.color[1]
    terrainColors[cx + 2] = p.color[2]
    terrainColors[cx + 3] = p.opacity * fadeIn * fadeNear * shimmer * armBright * voidFade * 1.60
    terrainSizes[i] = p.r * (1 + galaxyWarp * 2.0)
  })
  terrainGeometry.attributes.position.needsUpdate = true
  terrainGeometry.attributes.aColor.needsUpdate   = true
  terrainGeometry.attributes.aSize.needsUpdate    = true

  // Void removed — let the star ring arc be visible without a blocking disc
  if (homeVoidEl) homeVoidEl.style.opacity = '0'

  // Pillars — shimmer and fade out as fold begins
  if (homePillarLines && pillarBaseColors) {
    const pillarFade = Math.max(0, 1 - vortexT * 2.2)
    homePillarLines.material.opacity = pillarFade
    if (pillarFade > 0) {
      const colAttr = homePillarGeo.attributes.color
      const lineCount = colAttr.count / 2
      for (let k = 0; k < lineCount; k++) {
        const shimmer = 0.50 + 0.50 * Math.abs(Math.sin(now * 0.00060 + k * 0.19))
        const j = (k * 2 + 1) * 3
        colAttr.array[j]     = pillarBaseColors[j]     * shimmer
        colAttr.array[j + 1] = pillarBaseColors[j + 1] * shimmer
        colAttr.array[j + 2] = pillarBaseColors[j + 2] * shimmer
      }
      colAttr.needsUpdate = true
    }
  }

  // ── Bloom: home scroll only — bypass composer entirely once homeExited ────────
  if (homeExited) {
    // Direct render: identical to pre-composer output, no OutputPass, no glow
    bloomPass.strength = 0
    homeRenderer.autoClear = true
    homeRenderer.render(terrainScene, terrainPerspCamera)
    homeRenderer.autoClear = false
    homeRenderer.render(homeScene, homeCamera)
    homeRenderer.autoClear = true
  } else {
    const _scrollBloom = easeInOutCubic(Math.min(1, homeScrollProgress / HOME_EXIT_SCROLL))
    _bloomTarget = _scrollBloom * 0.45
    bloomPass.strength += (_bloomTarget - bloomPass.strength) * 0.07
    homeComposer.render()
  }
  homeComposer.render()
  homeAnimId = requestAnimationFrame(animateHome)
}

// ── Particle-text animation: "CLICK TO ENTER THE PROJECT GALAXY" ─────────────
// ── Disc-page CTA block ───────────────────────────────────────────────────────

// Set opacity on a mesh whose material may be a single object or an array.
function setMeshOp(obj, op) {
  if (obj._mats) { obj._mats.forEach(m => { m.opacity = op }); return }
  if (Array.isArray(obj.material)) obj.material.forEach(m => { m.opacity = op })
  else if (obj.material) obj.material.opacity = op
}
function getMeshOp(obj) {
  if (obj._mats?.length) return obj._mats[0].opacity
  if (Array.isArray(obj.material)) return obj.material[0]?.opacity ?? 0
  return obj.material?.opacity ?? 0
}

function makePlaceholderTexture(d) {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const ctx = c.getContext('2d')
  const bg = new THREE.Color(d.bg)

  // Gradient: project bg → near-black
  const grad = ctx.createLinearGradient(0, 0, 512, 512)
  grad.addColorStop(0, `#${bg.getHexString()}`)
  grad.addColorStop(1, '#030508')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // Subtle radial highlight
  const shine = ctx.createRadialGradient(180, 130, 0, 180, 130, 320)
  shine.addColorStop(0, 'rgba(255,255,255,0.12)')
  shine.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shine
  ctx.fillRect(0, 0, 512, 512)

  // Title
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = 'bold 68px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(d.title, 256, 230)

  // Tags
  ctx.fillStyle = 'rgba(255,255,255,0.42)'
  ctx.font = '22px sans-serif'
  ctx.fillText(d.tags.join('  ·  '), 256, 316)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function createProjMesh(d) {
  const group   = new THREE.Group()
  group._mats   = []
  group._cardImg = null

  // ── GLB cube body (provides the 3-D shape and Blender materials) ──────────
  const _applyGLB = (glbScene) => {
    const glbClone = glbScene.clone(true)
    const bbox = new THREE.Box3().setFromObject(glbClone)
    const dim  = bbox.getSize(new THREE.Vector3())
    const sc   = CUBE_S / Math.max(dim.x, dim.y, dim.z)
    glbClone.scale.setScalar(sc)
    const ctr  = bbox.getCenter(new THREE.Vector3())
    glbClone.position.set(-ctr.x * sc, -ctr.y * sc, -ctr.z * sc)
    glbClone.traverse(child => {
      if (!child.isMesh) return
      child.castShadow    = true
      child.receiveShadow = true
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach(m => {
        if (m.color) m.color.set('#006E74')   // uniform brand colour for all particles
        m.transparent = true
        m.opacity     = getMeshOp(group)       // match current fade-in progress
        group._mats.push(m)
      })
    })
    group.add(glbClone)
  }

  if (_cubeGLBScene) {
    _applyGLB(_cubeGLBScene)
  } else {
    _cubeGLBCallbacks.push(_applyGLB)
  }

  // ── Front-face plane (+Z): card image on a CanvasTexture ─────────────────
  const texCvs  = document.createElement('canvas')
  texCvs.width  = texCvs.height = 512
  const texCtx  = texCvs.getContext('2d')
  texCtx.fillStyle = '#006E74'
  texCtx.fillRect(0, 0, 512, 512)
  const frontTex = new THREE.CanvasTexture(texCvs)
  frontTex.colorSpace = THREE.SRGBColorSpace
  const frontMat = new THREE.MeshBasicMaterial({ map: frontTex, transparent: true, opacity: 0 })
  group._mats.push(frontMat)

  const frontPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(CUBE_S * 0.995, CUBE_S * 0.995),
    frontMat
  )
  frontPlane.position.set(0, 0, CUBE_S / 2 + 0.002)
  group.add(frontPlane)

  if (d.img) {
    projTextureLoader.load(d.img, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      const img = tex.image
      const s   = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height)
      texCtx.clearRect(0, 0, 512, 512)
      texCtx.fillStyle = '#006E74'
      texCtx.fillRect(0, 0, 512, 512)
      texCtx.drawImage(img,
        (img.naturalWidth  - s) / 2, (img.naturalHeight - s) / 2, s, s,
        0, 0, 512, 512)
      frontTex.needsUpdate = true
      group._cardImg = img
      tex.dispose()   // we baked into the canvas; free the Three.js texture
    }, undefined, () => {
      const ph = makePlaceholderTexture(d)
      texCtx.clearRect(0, 0, 512, 512)
      texCtx.drawImage(ph.image, 0, 0, 512, 512)
      frontTex.needsUpdate = true
      ph.dispose()
    })
  }

  return group
}

// ── Project Overview Screen ──────────────────────────────────────────────────

// Project a mesh's center to viewport coordinates using the known design-space transform.
// Returns { sx, sy, cardSW, cardSH } all in viewport (CSS) pixels.
function _meshScreenBounds(mesh) {
  const vw  = document.documentElement.clientWidth
  const vh  = document.documentElement.clientHeight
  const scl = Math.max(vw / DESIGN_W, vh / DESIGN_H)
  const dox = (vw - DESIGN_W * scl) / 2
  const doy = (vh - DESIGN_H * scl) / 2

  terrainPerspCamera.updateMatrixWorld(true)

  const p3 = new THREE.Vector3()
  mesh.getWorldPosition(p3)
  p3.project(terrainPerspCamera)

  const sx = (p3.x  *  0.5 + 0.5) * DESIGN_W * scl + dox
  const sy = (-p3.y *  0.5 + 0.5) * DESIGN_H * scl + doy

  // Card screen size from perspective geometry
  const camLocal = new THREE.Vector3()
  mesh.getWorldPosition(camLocal)
  terrainPerspCamera.worldToLocal(camLocal)
  const dist = Math.abs(camLocal.z) || 1
  const tanHFOV = Math.tan(THREE.MathUtils.degToRad(TERRAIN_CAM_FOV / 2))
  const frustrumH = dist * tanHFOV * 2   // world-unit height of frustum at this depth
  const cardSH = (CUBE_S * mesh.scale.y / frustrumH) * vh
  const cardSW = cardSH   // square cube

  return { sx, sy, cardSW, cardSH }
}

// ── Cube-spin overlay helpers ────────────────────────────────────────────────

// Card image (or teal bg) as a 512² CanvasTexture.
function _makeCardTex(cardImg) {
  const sz  = 512
  const cvs = document.createElement('canvas')
  cvs.width = cvs.height = sz
  const ctx = cvs.getContext('2d')
  ctx.fillStyle = '#006E74'
  ctx.fillRect(0, 0, sz, sz)
  if (cardImg) {
    const cw = cardImg.naturalWidth  || cardImg.width
    const ch = cardImg.naturalHeight || cardImg.height
    const s  = Math.min(cw, ch)
    ctx.drawImage(cardImg, (cw - s) / 2, (ch - s) / 2, s, s, 0, 0, sz, sz)
  }
  const tex = new THREE.CanvasTexture(cvs)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Project title + description + tags as a 512² CanvasTexture.
function _makeOverviewTex(idx) {
  const d   = PROJECT_CARD_DATA[idx] || PROJECT_CARD_DATA[0]
  const sz  = 1024
  const cvs = document.createElement('canvas')
  cvs.width = cvs.height = sz
  const ctx = cvs.getContext('2d')
  ctx.fillStyle = '#006E74'
  ctx.fillRect(0, 0, sz, sz)
  const grad = ctx.createLinearGradient(0, 0, 0, sz)
  grad.addColorStop(0, 'rgba(0,0,0,0.08)')
  grad.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, sz, sz)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 120px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  _wrapText(ctx, d.title, sz / 2, 120, sz - 120, 136)
  ctx.strokeStyle = 'rgba(255,255,255,0.30)'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(100, 392); ctx.lineTo(sz - 100, 392); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = '40px sans-serif'
  _wrapText(ctx, d.description || '', sz / 2, 432, sz - 160, 56)
  if (d.tags?.length) {
    ctx.fillStyle = 'rgba(255,255,255,0.50)'
    ctx.font = '32px sans-serif'
    ctx.textBaseline = 'bottom'
    ctx.fillText(d.tags.join('  ·  '), sz / 2, sz - 72)
  }
  const tex = new THREE.CanvasTexture(cvs)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function _wrapText(ctx, text, x, y, maxW, lineH) {
  if (!text) return
  const words = text.split(' ')
  let line = '', cy = y
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy); line = word; cy += lineH
    } else { line = test }
  }
  if (line) ctx.fillText(line, x, cy)
}

// Soft radial blob for drop shadows — reused by both transition engines.
function _makeShadowTex() {
  const sz  = 256
  const cvs = document.createElement('canvas')
  cvs.width = cvs.height = sz
  const ctx = cvs.getContext('2d')
  const g   = ctx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2)
  g.addColorStop(0,   'rgba(0,0,0,0.65)')
  g.addColorStop(0.45,'rgba(0,0,0,0.30)')
  g.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, sz, sz)
  return new THREE.CanvasTexture(cvs)
}

// Helpers to draw canvas-texture previews for the video / proto / gallery screens.
function _makeVideoTex(idx) {
  const d   = PROJECT_CARD_DATA[idx] || PROJECT_CARD_DATA[0]
  const sz  = 1024
  const cvs = document.createElement('canvas')
  cvs.width = cvs.height = sz
  const ctx = cvs.getContext('2d')
  ctx.fillStyle = d.bg || '#05101e'
  ctx.fillRect(0, 0, sz, sz)
  const grad = ctx.createLinearGradient(0, 0, 0, sz)
  grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, sz, sz)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '36px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText(d.title + '  ·  VIDEO', sz/2, 60)
  // Progress bar
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(80, sz - 110, sz - 160, 4)
  ctx.fillStyle = '#006E74';                ctx.fillRect(80, sz - 110, (sz - 160) * 0.35, 4)
  // Play button circle
  const cx = sz/2, cy = sz/2, r = 96
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2)
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4; ctx.stroke()
  // Play triangle
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.moveTo(cx + r*0.38, cy)
  ctx.lineTo(cx - r*0.22, cy - r*0.40)
  ctx.lineTo(cx - r*0.22, cy + r*0.40)
  ctx.closePath(); ctx.fill()
  const tex = new THREE.CanvasTexture(cvs); tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function _makeProtoTex(idx) {
  const d   = PROJECT_CARD_DATA[idx] || PROJECT_CARD_DATA[0]
  const sz  = 1024
  const cvs = document.createElement('canvas')
  cvs.width = cvs.height = sz
  const ctx = cvs.getContext('2d')
  ctx.fillStyle = d.bg || '#05101e'; ctx.fillRect(0, 0, sz, sz)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '36px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText(d.title + '  ·  PROTOTYPE', sz/2, 60)
  // Phone outline
  const pw = 240, ph = 460, px = (sz-pw)/2, py = (sz-ph)/2 + 20, rr = 24
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(px+rr, py); ctx.arcTo(px+pw, py, px+pw, py+ph, rr)
  ctx.arcTo(px+pw, py+ph, px, py+ph, rr); ctx.arcTo(px, py+ph, px, py, rr)
  ctx.arcTo(px, py, px+pw, py, rr); ctx.closePath(); ctx.stroke()
  // Screen area
  ctx.fillStyle = d.bg || '#0d1f2d'; ctx.fillRect(px+14, py+52, pw-28, ph-88)
  ctx.fillStyle = '#006E74';          ctx.fillRect(px+14, py+52, pw-28, 48)
  // Content rows
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(px+26, py+116+i*64, pw-52, 18)
    ctx.fillRect(px+26, py+140+i*64, (pw-52)*0.65, 12)
  }
  // Home button
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(sz/2, py+ph-30, 14, 0, Math.PI*2); ctx.stroke()
  const tex = new THREE.CanvasTexture(cvs); tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function _makeGalleryTex(idx) {
  const d    = PROJECT_CARD_DATA[idx] || PROJECT_CARD_DATA[0]
  const sz   = 1024
  const cvs  = document.createElement('canvas')
  cvs.width  = cvs.height = sz
  const ctx  = cvs.getContext('2d')
  ctx.fillStyle = '#05101e'; ctx.fillRect(0, 0, sz, sz)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '36px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText(d.title + '  ·  GALLERY', sz/2, 56)
  // 2×2 image grid
  const cardImg = (idx >= 0 && idx < projectMeshes.length) ? projectMeshes[idx]?._cardImg : null
  const pad = 10, top = 100, cellSz = (sz - pad*3) / 2
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const gx = pad + c*(cellSz+pad), gy = top + r*(cellSz+pad)
      if (cardImg) {
        const iw = cardImg.naturalWidth||cardImg.width, ih = cardImg.naturalHeight||cardImg.height
        const s = Math.min(iw,ih)
        ctx.drawImage(cardImg, (iw-s)/2, (ih-s)/2, s, s, gx, gy, cellSz, cellSz)
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(gx, gy, cellSz, cellSz)
      } else {
        ctx.fillStyle = d.bg || '#006E74'; ctx.fillRect(gx, gy, cellSz, cellSz)
      }
    }
  }
  const tex = new THREE.CanvasTexture(cvs); tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Dispatches to the appropriate screen texture builder.
function _makeScreenTex(screenEl, idx) {
  const id = screenEl?.id
  if (id === 'video-screen')   return _makeVideoTex(idx)
  if (id === 'proto-screen')   return _makeProtoTex(idx)
  if (id === 'gallery-screen') return _makeGalleryTex(idx)
  return null
}

// Two-phase cube transition using a dedicated WebGL overlay canvas.
// mode 'open' : Phase 1 — spin 0 → -π/2 at particle pos (2000ms)
//               Phase 2 — cube rushes toward camera until adj face fills screen (750ms)
// mode 'close': Phase 1 — cube recedes from camera back to particle pos (600ms)
//               Phase 2 — spin -π/2 → 0 at particle pos (1600ms)
function _runCubeTransition({ screenX, screenY, frontTex, adjTex, mode, startScreenH, onDone }) {
  const VW = window.innerWidth
  const VH = window.innerHeight
  const FS = Math.round(Math.min(VH * 0.58, VW * 0.36))

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    `position:fixed;inset:0;width:${VW}px;height:${VH}px;z-index:${mode === 'open' ? 915 : 916};pointer-events:none;`
  document.body.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(VW, VH)

  const scene3 = new THREE.Scene()
  scene3.add(new THREE.AmbientLight(0xffffff, 0.9))
  const dl = new THREE.DirectionalLight(0xffffff, 0.6)
  dl.position.set(2, 3, 4)
  scene3.add(dl)

  const FOV = 50
  const cam = new THREE.PerspectiveCamera(FOV, VW / VH, 0.01, 100)
  cam.position.set(0, 0, 2.5)
  cam.lookAt(0, 0, 0)

  const visH     = 2 * cam.position.z * Math.tan(FOV * Math.PI / 360)
  const visW     = visH * (VW / VH)
  const cubeSize = (FS / VH) * visH
  const hs       = cubeSize / 2

  // zStart: Z position where overlay cube matches the particle cube's apparent screen size.
  // Derived from startScreenH (pixels) so there is no size jump when the particle mesh hides.
  let zStart = 0
  if (startScreenH && startScreenH > 0) {
    const depth = cubeSize * cam.position.z * VH / (visH * startScreenH)
    zStart = cam.position.z - depth   // typically negative (cube starts far back)
  }

  // zoomZ: target Z where adj face fills ~55% of viewport — a noticeable but gentle push
  const zoomZ = cam.position.z * (1 - cubeSize / (0.55 * visH))

  const cubeGroup = new THREE.Group()

  if (_cubeGLBScene) {
    const glbClone = _cubeGLBScene.clone(true)
    const bbox = new THREE.Box3().setFromObject(glbClone)
    const dim  = bbox.getSize(new THREE.Vector3())
    const sc   = cubeSize / Math.max(dim.x, dim.y, dim.z)
    glbClone.scale.setScalar(sc)
    const ctr = bbox.getCenter(new THREE.Vector3())
    glbClone.position.set(-ctr.x * sc, -ctr.y * sc, -ctr.z * sc)
    glbClone.traverse(child => {
      if (!child.isMesh) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach(m => { if (m.color) m.color.set('#006E74') })
    })
    cubeGroup.add(glbClone)
  }

  const frontPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(cubeSize, cubeSize),
    new THREE.MeshBasicMaterial({ map: frontTex })
  )
  frontPlane.position.set(0, 0, hs + 0.002)
  cubeGroup.add(frontPlane)

  const adjPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(cubeSize, cubeSize),
    new THREE.MeshBasicMaterial({ map: adjTex })
  )
  adjPlane.position.set(hs + 0.002, 0, 0)
  adjPlane.rotation.y = Math.PI / 2
  cubeGroup.add(adjPlane)

  const cgX = ((screenX / VW) - 0.5) * visW
  const cgY = -((screenY / VH) - 0.5) * visH

  cubeGroup.position.set(mode === 'open' ? cgX : 0, mode === 'open' ? cgY : 0, mode === 'open' ? zStart : zoomZ)
  // Open: start at the particle cube's tilt so the transition begins seamlessly
  cubeGroup.rotation.y = mode === 'open' ? ACTIVE_ROT_Y : -Math.PI / 2
  cubeGroup.rotation.x = mode === 'open' ? ACTIVE_ROT_X : 0
  scene3.add(cubeGroup)

  // Single unified timeline — phases overlap so there's no hard stop between drift and spin.
  // Open:  drift  [0.00 → 0.60]  untilt [0.00 → 0.45]  spin [0.50 → 1.00]
  //        overlap at [0.50–0.60]: cube drifts AND spins simultaneously → fluid handoff
  // Close: unspin [0.00 → 0.50]  recede [0.38 → 1.00]
  //        overlap at [0.38–0.50]: cube recedes while still spinning back → no dead pause
  const TOTAL_MS = mode === 'open' ? 4200 : 2400

  const t0 = performance.now()
  function frame(now) {
    const el = Math.min(now - t0, TOTAL_MS)
    const t  = el / TOTAL_MS   // 0 → 1

    if (mode === 'open') {
      // Drift forward: t [0 → 0.60]
      const driftT = Math.min(1, t / 0.60)
      const driftE = 0.5 - Math.cos(Math.PI * driftT) / 2

      // Untilt (face-forward): t [0 → 0.45] — completes before drift ends
      const tiltT  = Math.min(1, t / 0.45)
      const tiltE  = 0.5 - Math.cos(Math.PI * tiltT) / 2

      // Spin to show overview face: t [0.50 → 1.0] — starts while still drifting
      const spinT  = Math.max(0, Math.min(1, (t - 0.50) / 0.50))
      const spinE  = 0.5 - Math.cos(Math.PI * spinT) / 2

      cubeGroup.position.set(
        cgX * (1 - driftE),
        cgY * (1 - driftE),
        zStart + (zoomZ - zStart) * driftE
      )
      cubeGroup.rotation.y = ACTIVE_ROT_Y * (1 - tiltE) + (-Math.PI / 2) * spinE
      cubeGroup.rotation.x = ACTIVE_ROT_X * (1 - tiltE)

      if (el < TOTAL_MS) {
        renderer.render(scene3, cam); requestAnimationFrame(frame)
      } else {
        renderer.dispose(); canvas.remove(); onDone()
      }
    } else {
      // Unspin back to face-forward: t [0 → 0.50]
      const unspinT = Math.min(1, t / 0.50)
      const unspinE = 0.5 - Math.cos(Math.PI * unspinT) / 2

      // Recede to galaxy: t [0.38 → 1.0] — starts before unspin finishes
      const recedeT = Math.max(0, Math.min(1, (t - 0.38) / 0.62))
      const recedeE = recedeT * recedeT * recedeT

      cubeGroup.rotation.y = -Math.PI / 2 * (1 - unspinE)
      cubeGroup.rotation.x = 0
      cubeGroup.position.set(
        cgX * recedeE,
        cgY * recedeE,
        zoomZ + (zStart - zoomZ) * recedeE
      )

      if (el < TOTAL_MS) {
        renderer.render(scene3, cam); requestAnimationFrame(frame)
      } else {
        renderer.dispose(); canvas.remove(); onDone()
      }
    }
  }
  requestAnimationFrame(frame)
}

// ── Project overview open / close ────────────────────────────────────────────

function openProjectOverview(idx) {
  if (projOverviewEl || _projCubeSpinning) return
  if (projInfoEl) projInfoEl.classList.remove('pi-show')
  projOverviewIdx = idx

  const mesh = (idx >= 0 && idx < projectMeshes.length) ? projectMeshes[idx] : null
  if (!mesh) return

  mesh.visible    = false
  _hiddenProjMesh = mesh
  _projCubeSpinning = true

  const { sx, sy, cardSH } = _meshScreenBounds(mesh)
  const frontTex   = _makeCardTex(mesh._cardImg)
  const adjTex     = _makeOverviewTex(idx)

  _runCubeTransition({
    screenX: sx, screenY: sy,
    frontTex, adjTex,
    mode: 'open',
    startScreenH: cardSH,
    onDone() {
      frontTex.dispose()
      adjTex.dispose()
      _projCubeSpinning = false
      createAndShowProjectOverview(idx)
      const ovEl = projOverviewEl
      if (ovEl) setTimeout(() => { if (ovEl) ovEl.classList.add('ov-split') }, 180)
      // "Back to Galaxy" arrived while the open spin was still running — it
      // was queued instead of racing this animation; honor it now that the
      // overview has actually finished opening, so the close plays its own
      // proper reverse cube animation instead of being silently dropped.
      if (_pendingGalaxyExit) { _pendingGalaxyExit = false; closeProjectOverview() }
    }
  })
}

// Returns the inner HTML for .overview-grid for a given project index
function _ovGridHTML(idx) {
  const d = PROJECT_CARD_DATA[idx]
  const imgStyle  = `background-image:url('${d.img}');background-color:${d.bg};`
  const metaItems = d.tags.map(t => `<div class="meta-item"><span>${t}</span></div>`).join('')
  return `
    <div class="overview-visual-wrapper">
      <div class="overview-visual" style="${imgStyle}"></div>
      <div class="visual-content">
        <h1>${d.title}</h1>
        <p>${d.description}</p>
      </div>
    </div>
    <div class="overview-meta">
      <h2>PROJECT<br>OVERVIEW</h2>
      <div class="meta-list">${metaItems}</div>
      <div class="meta-icons" id="ov-video-btn" style="display:none"></div>
      <div id="ov-proto-btn"   style="display:none"></div>
      <div id="ov-gallery-btn" style="display:none"></div>
    </div>
  `
}

function createAndShowProjectOverview(idx) {
  if (projOverviewEl) return

  const trackerItems = PROJECT_CARD_DATA.map((pd, i) =>
    `<div class="tracker-item ${i === idx ? 'active' : ''}" data-ov-idx="${i}">
       <div class="tracker-line"></div>
       <span class="tracker-label">${pd.title}</span>
     </div>`
  ).join('')

  projOverviewEl = document.createElement('div')
  projOverviewEl.id = 'project-overview-screen'
  projOverviewEl.innerHTML = `
    <button class="back-btn" id="ov-back-btn">&#8592; BACK</button>
    <div class="overview-grid">${_ovGridHTML(idx)}</div>
    <div class="overview-tracker">${trackerItems}</div>
  `
  document.body.appendChild(projOverviewEl)
  document.getElementById('ov-back-btn').addEventListener('click', closeProjectOverview)
  bindVideoBtn(idx)

  // Bind tracker item clicks — dissolve to that project
  projOverviewEl.querySelectorAll('.tracker-item').forEach(item => {
    item.addEventListener('click', () => {
      const newIdx = parseInt(item.dataset.ovIdx)
      if (newIdx !== projOverviewIdx) switchProjectOverview(newIdx)
    })
  })

  projOverviewEl.classList.add('active-view')

  // Execute any media action that arrived while the cube was still spinning
  if (_pendingMediaAction) {
    const action = _pendingMediaAction
    _pendingMediaAction = null
    setTimeout(() => {
      const btnId = action === 'video' ? 'ov-video-btn'
                  : action === 'proto' ? 'ov-proto-btn'
                  :                     'ov-gallery-btn'
      const btn = document.getElementById(btnId)
      if (!btn) return
      if (action === 'video')   openVideoScreen  (projOverviewIdx, btn)
      else if (action === 'proto')   openProtoScreen  (projOverviewIdx, btn)
      else if (action === 'gallery') openGalleryScreen(projOverviewIdx, btn)
    }, 200)
  }
}

// Cube-flip transition between project description pages.
// Direction: higher index → cube rotates left (forward), lower → right (backward).
function switchProjectOverview(newIdx) {
  if (!projOverviewEl) return

  const isForward = newIdx > projOverviewIdx

  const trackerItems = PROJECT_CARD_DATA.map((pd, i) =>
    `<div class="tracker-item ${i === newIdx ? 'active' : ''}" data-ov-idx="${i}">
       <div class="tracker-line"></div>
       <span class="tracker-label">${pd.title}</span>
     </div>`
  ).join('')

  const newEl = document.createElement('div')
  newEl.id = 'project-overview-screen'
  newEl.innerHTML = `
    <button class="back-btn" id="ov-back-btn">&#8592; BACK</button>
    <div class="overview-grid">${_ovGridHTML(newIdx)}</div>
    <div class="overview-tracker">${trackerItems}</div>
  `
  newEl.classList.add('active-view')

  const outEl = projOverviewEl
  outEl.style.transition = 'none'

  _cubeFlip({
    outEl, inEl: newEl,
    outTex: _makeOverviewTex(projOverviewIdx),
    inTex:  _makeOverviewTex(newIdx),
    direction: isForward ? 1 : -1, duration: 900, zIndex: 916,
    onDone() {
      _cubeRestoreEl(newEl)
      document.body.appendChild(newEl)

      projOverviewEl  = newEl
      projOverviewIdx = newIdx
      activeProjIdx   = newIdx
      lastActiveIdx   = newIdx

      newEl.querySelector('#ov-back-btn')?.addEventListener('click', closeProjectOverview)
      bindIconBtns(newIdx)
      newEl.querySelectorAll('.tracker-item').forEach(item => {
        item.addEventListener('click', () => {
          const nIdx = parseInt(item.dataset.ovIdx)
          if (nIdx !== projOverviewIdx) switchProjectOverview(nIdx)
        })
      })

      if (outEl.parentNode) outEl.remove()
    }
  })
}

function bindIconBtns(idx) {
  ;['ov-video-btn','ov-proto-btn','ov-gallery-btn'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.replaceWith(el.cloneNode(true))
  })
  document.getElementById('ov-video-btn')  ?.addEventListener('click', e => openVideoScreen(idx, e.currentTarget))
  document.getElementById('ov-proto-btn')  ?.addEventListener('click', e => openProtoScreen(idx, e.currentTarget))
  document.getElementById('ov-gallery-btn')?.addEventListener('click', e => openGalleryScreen(idx, e.currentTarget))
}

function bindVideoBtn(idx) { bindIconBtns(idx) }

// ── Immersive zoom helpers ────────────────────────────────────────────────────
// Uses GPU-composited transform:scale() anchored at the icon centre.
// The cover appears tiny (matching the icon) then rushes toward the camera to
// fill the viewport — no left/top/width/height animation (avoids layout thrash).

// ── Particle transition — matches HOME_PARTICLE_PALETTE exactly ───────────────
// Colors are the teal #006E74 family used by all home/disc/terrain particles.
// Individual alpha is low; additive blending makes clusters glow — identical to
// THREE.AdditiveBlending used by the Three.js particle system.
const PTX_PALETTE = [
  [0, 110, 116],  // #006E74 base — most common (42%)
  [0,  97, 102],  // slightly darker (28%)
  [0, 128, 134],  // slightly lighter (18%)
  [0,  82,  87],  // muted deep teal (9%)
  [0, 145, 152],  // bright accent (rare 3%)
]
function _ptxColor() {
  const r = Math.random()
  if (r < 0.42) return PTX_PALETTE[0]
  if (r < 0.70) return PTX_PALETTE[1]
  if (r < 0.88) return PTX_PALETTE[2]
  if (r < 0.97) return PTX_PALETTE[3]
  return PTX_PALETTE[4]
}

function _ptxCanvas() {
  const cvs = document.createElement('canvas')
  cvs.width  = window.innerWidth
  cvs.height = window.innerHeight
  cvs.style.cssText = 'position:fixed;inset:0;z-index:920;pointer-events:none;'
  document.body.appendChild(cvs)
  return cvs
}

// Build a particle array. icon origin (ox,oy), rect size (iw,ih), N count.
// Targets are distributed evenly across the FULL viewport so every pixel
// of the screen gets blanketed before the destination page appears.
function _ptxBuildParticles(ox, oy, iw, ih, N, W, H) {
  const ps = []
  for (let i = 0; i < N; i++) {
    // Start within the icon bounds
    const px = ox + (Math.random() - 0.5) * iw
    const py = oy + (Math.random() - 0.5) * ih

    const dx = px - ox, dy = py - oy
    const d  = Math.sqrt(dx * dx + dy * dy) || 1
    const fast  = Math.random() < 0.65
    const speed = fast ? 8 + Math.random() * 28 : 2 + Math.random() * 7

    // Targets spread uniformly across the ENTIRE viewport (including edges/corners)
    const tx = Math.random() * W
    const ty = Math.random() * H

    ps.push({
      x: px, y: py,
      vx: (dx / d) * speed + (Math.random() - 0.5) * 3,
      vy: (dy / d) * speed + (Math.random() - 0.5) * 3,
      tx, ty,
      size: Math.random() < 0.72 ? 0.4 + Math.random() * 1.2
                                 : 1.4 + Math.random() * 2.6,
      col:   _ptxColor(),
      delay: Math.random() * 0.22,
    })
  }
  return ps
}

// Draw all particles with additive blending — matching THREE.AdditiveBlending.
// Individual particles are faint; where many overlap they build up brightness,
// exactly as the terrain/home Three.js point clouds do.
function _ptxDraw(ctx, particles, t, W, H) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (const p of particles) {
    const pt = Math.max(0, (t - p.delay) / (1 - p.delay))
    if (pt <= 0) continue

    // Phase 1: burst outward fast (0 → 40% of pt)
    const burstDecay = Math.max(0, 1 - pt * 2.5)
    p.x  += p.vx * burstDecay
    p.y  += p.vy * burstDecay
    p.vx *= 0.90
    p.vy *= 0.90

    // Phase 2: drift toward random screen target
    const drift = Math.min(1, pt * 1.8)
    p.x += (p.tx - p.x) * 0.018 * drift
    p.y += (p.ty - p.y) * 0.018 * drift

    // Alpha: snap in quickly, hold until screen is full, then fade out
    const fadeIn  = Math.min(1, pt * 8)
    const fadeOut = Math.max(0, 1 - Math.max(0, t - 0.80) / 0.20)
    // Low individual alpha — clusters glow via additive stacking
    const alpha = fadeIn * fadeOut * (0.16 + p.size * 0.06)
    if (alpha < 0.008) continue

    const r = p.size * Math.min(1, pt * 6)
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgb(${p.col[0]},${p.col[1]},${p.col[2]})`
    ctx.fill()
  }

  ctx.restore()
}

// Open: icon disintegrates → particles fill screen → destination fades in
function openWithZoom(screenEl, triggerEl) {
  const iconEl   = triggerEl.querySelector('.icon-video-thumb, .icon-phone-new, .icon-gallery-grid') || triggerEl
  const iconRect = iconEl.getBoundingClientRect()

  screenEl.dataset.czLeft = iconRect.left
  screenEl.dataset.czTop  = iconRect.top
  screenEl.dataset.czW    = iconRect.width
  screenEl.dataset.czH    = iconRect.height

  // Instantly blank the 3D scene — no particle page peeking through
  if (projOverviewEl) {
    projOverviewEl.style.transition    = 'none'
    projOverviewEl.style.opacity       = '0'
    projOverviewEl.style.pointerEvents = 'none'
  }

  const W  = window.innerWidth
  const H  = window.innerHeight
  const ox = iconRect.left + iconRect.width  / 2
  const oy = iconRect.top  + iconRect.height / 2

  const cvs = _ptxCanvas()
  const ctx = cvs.getContext('2d')

  // Block the 3D scene IMMEDIATELY — paint solid before the first RAF fires
  ctx.fillStyle = '#05101e'
  ctx.fillRect(0, 0, W, H)

  // 1200 particles to blanket the full screen before the destination appears
  const particles  = _ptxBuildParticles(ox, oy, iconRect.width, iconRect.height, 1200, W, H)
  const OPEN_MS    = 1300
  let   t0         = null
  let   screenAdded = false

  ;(function frame(ts) {
    if (!t0) t0 = ts
    const t = Math.min(1, (ts - t0) / OPEN_MS)

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.fillStyle   = '#05101e'
    ctx.fillRect(0, 0, W, H)

    _ptxDraw(ctx, particles, t, W, H)

    // Destination only appears once particles have covered the full screen (78%)
    if (t >= 0.78 && !screenAdded) {
      screenAdded = true
      screenEl.style.opacity = '0'
      document.body.appendChild(screenEl)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        screenEl.style.transition = 'opacity 0.40s ease'
        screenEl.style.opacity    = '1'
      }))
    }

    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      cvs.style.transition = 'opacity 0.20s ease'
      cvs.style.opacity    = '0'
      setTimeout(() => cvs.remove(), 220)
    }
  })(performance.now())
}

// ── Shared 3D cube-face flip ─────────────────────────────────────────────────
// Both elements share a preserve-3d context so they form a real cube corner.
// The cube zooms out at the midpoint (~78% scale) so the 3D box becomes
// visible — matching the project particle (BoxGeometry) aesthetic.
// direction: +1 = rotate left (forward), -1 = rotate right (backward)
// onDone() is called while elements are still inside the cube faces; move them
// to body inside onDone before scene.remove() runs.
// Reset inline styles added by _cubeFlip so the element's CSS class takes over.
function _cubeRestoreEl(el) {
  el.style.position        = ''
  el.style.top             = ''
  el.style.left            = ''
  el.style.zIndex          = ''
  el.style.transformOrigin = ''
  el.style.transform       = ''
  el.style.opacity         = ''
}

function _cubeFlip({ outEl, inEl, outTex, inTex, direction = 1, duration = 2400, zIndex = 916, onDone }) {
  const VW = window.innerWidth
  const VH = window.innerHeight
  const FS = Math.round(Math.min(VH * 0.58, VW * 0.36))

  // Fallback solid colours if no textures provided
  const outBg = (outEl && getComputedStyle(outEl).backgroundColor !== 'rgba(0, 0, 0, 0)')
    ? getComputedStyle(outEl).backgroundColor : '#04121f'
  const inBg  = (inEl  && getComputedStyle(inEl).backgroundColor  !== 'rgba(0, 0, 0, 0)')
    ? getComputedStyle(inEl).backgroundColor  : '#04121f'

  // Hide source elements — the cube faces replace them visually during the spin.
  const prevOutVis = outEl ? outEl.style.visibility : ''
  const prevInVis  = inEl  ? inEl.style.visibility  : ''
  if (outEl) outEl.style.visibility = 'hidden'
  if (inEl)  inEl.style.visibility  = 'hidden'

  // Dark backdrop so the scene feels opaque during the spin
  const backdrop = document.createElement('div')
  backdrop.style.cssText =
    `position:fixed;inset:0;z-index:${zIndex - 1};background:#04121f;pointer-events:none;`
  document.body.appendChild(backdrop)

  // WebGL overlay canvas
  const cubeCanvas = document.createElement('canvas')
  cubeCanvas.style.cssText =
    `position:fixed;inset:0;width:${VW}px;height:${VH}px;z-index:${zIndex};pointer-events:none;`
  document.body.appendChild(cubeCanvas)

  const cubeRenderer = new THREE.WebGLRenderer({ canvas: cubeCanvas, alpha: true, antialias: true })
  cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  cubeRenderer.setSize(VW, VH)

  const cubeScene3 = new THREE.Scene()
  cubeScene3.add(new THREE.AmbientLight(0xffffff, 0.9))
  const dirL = new THREE.DirectionalLight(0xffffff, 0.6)
  dirL.position.set(2, 3, 4)
  cubeScene3.add(dirL)

  const FOV = 50
  const cubeCam = new THREE.PerspectiveCamera(FOV, VW / VH, 0.01, 100)
  cubeCam.position.set(0, 0, 2.5)
  cubeCam.lookAt(0, 0, 0)

  const visH     = 2 * cubeCam.position.z * Math.tan(FOV * Math.PI / 360)
  const cubeSize = (FS / VH) * visH
  const hs       = cubeSize / 2

  const cubeGroup = new THREE.Group()

  if (_cubeGLBScene) {
    const glbClone = _cubeGLBScene.clone(true)
    const bbox = new THREE.Box3().setFromObject(glbClone)
    const dim  = bbox.getSize(new THREE.Vector3())
    const sc   = cubeSize / Math.max(dim.x, dim.y, dim.z)
    glbClone.scale.setScalar(sc)
    const ctr = bbox.getCenter(new THREE.Vector3()).multiplyScalar(sc)
    glbClone.position.sub(ctr)
    cubeGroup.add(glbClone)
  }

  // direction > 0: spin left (front → out, adj/right → in)
  // direction < 0: spin right (front → out, adj/left → in)
  const endRot   = direction > 0 ? -Math.PI / 2 : Math.PI / 2
  const adjInitY = direction > 0 ?  Math.PI / 2 : -Math.PI / 2

  const frontPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(cubeSize, cubeSize),
    outTex
      ? new THREE.MeshBasicMaterial({ map: outTex })
      : new THREE.MeshBasicMaterial({ color: new THREE.Color(outBg) })
  )
  frontPlane.position.set(0, 0, hs + 0.002)
  cubeGroup.add(frontPlane)

  const adjPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(cubeSize, cubeSize),
    inTex
      ? new THREE.MeshBasicMaterial({ map: inTex })
      : new THREE.MeshBasicMaterial({ color: new THREE.Color(inBg) })
  )
  adjPlane.position.set((hs + 0.002) * Math.sign(direction), 0, 0)
  adjPlane.rotation.y = adjInitY
  cubeGroup.add(adjPlane)

  cubeScene3.add(cubeGroup)

  const t0 = performance.now()
  function frame(now) {
    const raw   = Math.min(1, (now - t0) / duration)
    const eased = -(Math.cos(Math.PI * raw) - 1) / 2
    cubeGroup.rotation.y = endRot * eased
    cubeRenderer.render(cubeScene3, cubeCam)
    if (raw < 1) {
      requestAnimationFrame(frame)
    } else {
      if (outTex) outTex.dispose()
      if (inTex)  inTex.dispose()
      cubeRenderer.dispose()
      cubeCanvas.remove()
      backdrop.remove()
      if (outEl) outEl.style.visibility = prevOutVis
      if (inEl)  inEl.style.visibility  = prevInVis
      if (onDone) onDone()
    }
  }
  requestAnimationFrame(frame)
}

// Open: overview page is the front face of the cube; screen rotates in as the right face.
function openWithCube(screenEl, triggerEl) {
  const iconEl   = triggerEl.querySelector('.icon-video-thumb, .icon-phone-new, .icon-gallery-grid') || triggerEl
  const iconRect = iconEl.getBoundingClientRect()
  screenEl.dataset.czLeft = iconRect.left
  screenEl.dataset.czTop  = iconRect.top
  screenEl.dataset.czW    = iconRect.width
  screenEl.dataset.czH    = iconRect.height

  const ovEl = projOverviewEl
  if (ovEl) { ovEl.style.transition = 'none'; ovEl.style.pointerEvents = 'none' }

  const outEl = ovEl || (() => {
    const d = document.createElement('div')
    d.style.cssText = 'position:absolute;inset:0;background:#004F58'
    return d
  })()

  _subCubeSpinning = true
  _cubeFlip({
    outEl, inEl: screenEl,
    outTex: _makeOverviewTex(projOverviewIdx >= 0 ? projOverviewIdx : 0),
    inTex:  _makeScreenTex(screenEl, projOverviewIdx >= 0 ? projOverviewIdx : 0),
    direction: 1, duration: 900, zIndex: 916,
    onDone() {
      _cubeRestoreEl(screenEl)
      document.body.appendChild(screenEl)
      if (ovEl) {
        _cubeRestoreEl(ovEl)
        ovEl.style.opacity       = '0'
        ovEl.style.pointerEvents = 'none'
        ovEl.style.transition    = ''
        document.body.appendChild(ovEl)
      }
      _subCubeSpinning = false
      // A "back" request that arrived mid-open was queued instead of racing
      // this animation — run it now that the screen has actually finished opening.
      if (_pendingSubAction) { const fn = _pendingSubAction; _pendingSubAction = null; fn() }
    }
  })
}

// Close: screen dissolves → particles stream back and reform at icon → overview returns
function closeWithZoom(screenEl, onDone) {
  const left = parseFloat(screenEl.dataset.czLeft ?? window.innerWidth  / 2)
  const top  = parseFloat(screenEl.dataset.czTop  ?? window.innerHeight / 2)
  const iw   = parseFloat(screenEl.dataset.czW    ?? 72)
  const ih   = parseFloat(screenEl.dataset.czH    ?? 50)

  const W  = window.innerWidth
  const H  = window.innerHeight
  const cx = left + iw / 2
  const cy = top  + ih / 2

  // ── Create the canvas FIRST so the 3D scene is always covered ──
  // The screen fades out behind this solid canvas — invisible to the user.
  const cvs = _ptxCanvas()
  const ctx = cvs.getContext('2d')
  ctx.fillStyle = '#05101e'
  ctx.fillRect(0, 0, W, H)

  // Fade and remove the destination screen behind the solid canvas
  screenEl.style.transition = 'opacity 0.18s ease'
  screenEl.style.opacity    = '0'
  setTimeout(() => { if (screenEl.parentNode) screenEl.parentNode.removeChild(screenEl) }, 200)

  // Particles start spread across the screen and converge to icon
  {
    const N        = 700
    const CLOSE_MS = 880

    const particles = []
    for (let i = 0; i < N; i++) {
      particles.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        size:  Math.random() < 0.72 ? 0.4 + Math.random() * 1.1
                                    : 1.2 + Math.random() * 2.2,
        col:   _ptxColor(),
        delay: Math.random() * 0.20,
      })
    }

    let t0 = null
    ;(function frame(ts) {
      if (!t0) t0 = ts
      const t = Math.min(1, (ts - t0) / CLOSE_MS)

      // Keep background solid the whole time — 3D scene never shows through
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle   = '#05101e'
      ctx.fillRect(0, 0, W, H)

      // Converging particles with additive blending
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      for (const p of particles) {
        const pt = Math.max(0, (t - p.delay) / (1 - p.delay))
        if (pt <= 0) continue

        const ease = pt * pt
        p.x += (cx - p.x) * 0.045 * (1 + ease * 3.0)
        p.y += (cy - p.y) * 0.045 * (1 + ease * 3.0)

        // Particles fade out as they converge (t approaches 1)
        const alpha = Math.max(0, 1 - t * 1.1) * Math.min(1, pt * 7) * (0.14 + p.size * 0.055)
        if (alpha < 0.008) continue

        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 - ease * 0.4), 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${p.col[0]},${p.col[1]},${p.col[2]})`
        ctx.fill()
      }

      ctx.restore()

      if (t < 1) {
        requestAnimationFrame(frame)
      } else {
        // Canvas is still solid here. Restore overview instantly behind it,
        // then fade canvas away — 3D scene is never exposed.
        if (projOverviewEl) {
          projOverviewEl.style.transition    = 'none'
          projOverviewEl.style.opacity       = '1'
          projOverviewEl.style.pointerEvents = ''
        }
        cvs.style.transition = 'opacity 0.28s ease'
        cvs.style.opacity    = '0'
        setTimeout(() => {
          cvs.remove()
          if (projOverviewEl) projOverviewEl.style.transition = ''
          if (onDone) onDone()
        }, 300)
      }
    })(performance.now())
  }
}

// Cube-flip transition when exiting video / prototype / gallery screens.
// The screen rotates RIGHT (+90°) while the overview comes in from the LEFT.
// This reverses the openWithCube direction, giving a "go back" feel.
function closeWithCube(screenEl, onDone) {
  const ovEl = projOverviewEl
  if (ovEl) { ovEl.style.opacity = '1'; ovEl.style.transition = 'none'; ovEl.style.pointerEvents = 'none' }

  const inEl = ovEl || (() => {
    const d = document.createElement('div')
    d.style.cssText = 'position:absolute;inset:0;background:#004F58'
    return d
  })()

  _subCubeSpinning = true
  _cubeFlip({
    outEl: screenEl, inEl,
    outTex: _makeScreenTex(screenEl, projOverviewIdx >= 0 ? projOverviewIdx : 0),
    inTex:  _makeOverviewTex(projOverviewIdx >= 0 ? projOverviewIdx : 0),
    direction: -1, duration: 900, zIndex: 916,
    onDone() {
      if (ovEl) {
        _cubeRestoreEl(ovEl)
        ovEl.style.pointerEvents = ''
        document.body.appendChild(ovEl)
      }
      screenEl.remove()
      _subCubeSpinning = false
      if (onDone) onDone()
      if (_pendingSubAction) { const fn = _pendingSubAction; _pendingSubAction = null; fn() }
    }
  })
}

function closeProjectOverview() {
  if (!projOverviewEl || _projCubeSpinning) return

  send('podium', 'caseStudyClosed')
  localStorage.setItem('bec_caseStudyClosed', String(Date.now()))

  const el      = projOverviewEl
  const closeIdx = projOverviewIdx
  projOverviewEl  = null

  // Dismiss HTML immediately — cube spin provides the visual transition
  el.classList.remove('ov-split', 'active-view')
  if (el.parentNode) el.parentNode.removeChild(el)

  if (projInfoEl) projInfoEl.classList.add('pi-show')

  if (!_hiddenProjMesh) {
    projOverviewIdx = -1
    if (_pendingGalaxyExit) { _pendingGalaxyExit = false; if (galaxyActive) exitGalaxyToDisc() }
    return
  }

  _projCubeSpinning = true
  const mesh     = _hiddenProjMesh
  const { sx, sy, cardSH } = _meshScreenBounds(mesh)
  const openIdx  = projectMeshes.indexOf(mesh)
  const frontTex = _makeCardTex(mesh._cardImg)
  const adjTex   = _makeOverviewTex(closeIdx >= 0 ? closeIdx : openIdx >= 0 ? openIdx : 0)

  _runCubeTransition({
    screenX: sx, screenY: sy,
    frontTex, adjTex,
    mode: 'close',
    startScreenH: cardSH,
    onDone() {
      frontTex.dispose()
      adjTex.dispose()
      _projCubeSpinning = false
      mesh.visible    = true
      _hiddenProjMesh = null
      projOverviewIdx = -1
      // If Back to Galaxy was pressed while we were closing, exit now that the cube is restored
      if (_pendingGalaxyExit) { _pendingGalaxyExit = false; if (galaxyActive) exitGalaxyToDisc() }
    }
  })
}

// ── Video Screen ─────────────────────────────────────────────────────────────

let videoScreenEl = null

function openVideoScreen(idx, triggerEl) {
  if (videoScreenEl || _subCubeSpinning) return
  const d = PROJECT_CARD_DATA[idx]

  const videoSrc = d.video || ''
  let playerHTML
  if (videoSrc) {
    const embedUrl = videoSrc
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'www.youtube.com/embed/')
    const isYoutube = embedUrl.includes('youtube.com/embed') || embedUrl.includes('youtu.be')
    playerHTML = isYoutube
      ? `<iframe src="${embedUrl}?autoplay=1&rel=0" frameborder="0"
           allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
      : `<video src="${videoSrc}" controls autoplay></video>`
  } else {
    playerHTML = `<div class="video-placeholder">
      <div class="video-placeholder-icon"></div>
      <p>No video available for this project yet.</p>
    </div>`
  }

  videoScreenEl = document.createElement('div')
  videoScreenEl.id = 'video-screen'
  videoScreenEl.innerHTML = `
    <div class="vs-title">${d.title}</div>
    <button class="scr-close-btn" id="video-close-btn">&#10005;</button>
    <div class="vs-player">${playerHTML}</div>
  `
  videoScreenEl.classList.add('vs-open')
  openWithCube(videoScreenEl, triggerEl)
  videoScreenEl.querySelector('#video-close-btn').addEventListener('click', closeVideoScreen)
}

function closeVideoScreen() {
  if (!videoScreenEl) return
  // The open cube-flip is still spinning — queue the close instead of
  // racing a second _cubeFlip on top of it (that corrupted the DOM: the
  // open's delayed onDone would re-insert this screen and re-hide the
  // overview after the close had already restored it).
  if (_subCubeSpinning) { _pendingSubAction = closeVideoScreen; return }
  const el = videoScreenEl
  videoScreenEl = null
  el.querySelectorAll('video, iframe').forEach(m => {
    if (m.tagName === 'VIDEO') m.pause()
    if (m.tagName === 'IFRAME') m.src = ''
  })
  closeWithCube(el)
}

// ── Prototype Screen ──────────────────────────────────────────────────────────

let protoScreenEl = null

const PROTO_HIGHLIGHTS = {
  OLAM: [
    { num: '01', label: 'Agri Monitor', desc: 'Real-time crop and harvest tracking across regions.' },
    { num: '02', label: 'Supply Chain', desc: 'End-to-end visibility from farm to global market.' },
    { num: '03', label: 'Brand Hub', desc: 'Unified metrics for brand presence and positioning.' },
  ],
  INFOSYS: [
    { num: '01', label: 'Experience Hub', desc: 'Central portal for all enterprise digital touchpoints.' },
    { num: '02', label: 'UX Analytics', desc: 'Live user-engagement data and journey heatmaps.' },
    { num: '03', label: 'Design System', desc: 'Shared component library ensuring consistent UX.' },
  ],
  TATA: [
    { num: '01', label: 'Brand Identity', desc: 'Century-old heritage reimagined for the digital era.' },
    { num: '02', label: 'Consumer App', desc: 'Unified shopping and services across Tata brands.' },
    { num: '03', label: 'Loyalty Layer', desc: 'Cross-brand rewards powering customer retention.' },
  ],
  WIPRO: [
    { num: '01', label: 'Innovation Lab', desc: 'Collaborative workspace for ideation and rapid testing.' },
    { num: '02', label: 'Digital Canvas', desc: 'Seamless blending of physical and virtual workspaces.' },
    { num: '03', label: 'Insight Engine', desc: 'AI-driven data synthesis for strategic decisions.' },
  ],
  BIOCON: [
    { num: '01', label: 'Research Portal', desc: 'Track clinical studies and biopharmaceutical outputs.' },
    { num: '02', label: 'Lab Dashboard', desc: 'Centralised view of lab results and trial stages.' },
    { num: '03', label: 'Science Comm', desc: 'Translating complex data into accessible narratives.' },
  ],
  MINDTREE: [
    { num: '01', label: 'Project Tracker', desc: 'Holistic view of consulting engagements and milestones.' },
    { num: '02', label: 'Space Navigator', desc: 'Interactive wayfinding within the experience center.' },
    { num: '03', label: 'Discovery Mode', desc: 'Story-driven interface for exploring Mindtree services.' },
  ],
}

function generateFakeApp(d) {
  const appData = {
    OLAM:     { hdr: 'Agri Monitor',   icon: '🌾', stats: [['94%','On Track'],['12','Routes']], items: [['🌱','Crop Status','Harvesting soon'],['🚚','Logistics','3 shipments active'],['📈','Market Price','₹ 4,200/qt']] },
    INFOSYS:  { hdr: 'Experience Hub', icon: '💡', stats: [['86%','UX Score'],['24','Journeys']], items: [['🖥️','Demo Floor','3 visitors now'],['📊','Analytics','Updated 2m ago'],['🔗','Integrations','All systems live']] },
    TATA:     { hdr: 'Tata Connect',   icon: '⭐', stats: [['4.8','Rating'],['₹2.1k','Saved']], items: [['🛒','New Arrivals','28 products'],['🏆','Rewards','1,240 pts'],['📦','My Orders','2 on the way']] },
    WIPRO:    { hdr: 'InnoHub',        icon: '🚀', stats: [['7','Ideas','Active'],['92%','Score']], items: [['💡','Hackathon','Closes in 3d'],['🤝','Collab','4 open slots'],['📐','Prototypes','6 live builds']] },
    BIOCON:   { hdr: 'BioTrack',       icon: '🧬', stats: [['18','Trials'],['97%','Accuracy']], items: [['🔬','Lab Results','4 new reports'],['💊','Pipeline','Phase III ready'],['📋','Compliance','All checks pass']] },
    MINDTREE: { hdr: 'MT Navigator',   icon: '🗺️', stats: [['14','Projects'],['96%','CSAT']], items: [['📍','Explore','Zone B — Level 2'],['🗓️','Events','Workshop at 3pm'],['📁','Resources','12 case studies']] },
  }
  const a = appData[d.title] || appData.INFOSYS
  return `
    <div class="fake-app" style="background:${d.bg};">
      <div class="fake-app-header">
        <span class="fah-eyebrow">${a.icon} ${d.tags[0]}</span>
        <span class="fah-name">${a.hdr}</span>
      </div>
      <div class="fake-app-body">
        <div class="fak-stat-row">
          ${a.stats.map(s => `<div class="fak-stat"><div class="fak-stat-val">${s[0]}</div><div class="fak-stat-lbl">${s[1]}</div></div>`).join('')}
        </div>
        ${a.items.map((item, i) => `
          <div class="fak-list-item">
            <div class="fak-icon">${item[0]}</div>
            <div style="flex:1">
              <div class="fak-item-name">${item[1]}</div>
              <div class="fak-item-sub">${item[2]}</div>
              <div class="fak-progress-bar"><div class="fak-progress-fill" style="width:${[80,60,45][i]}%"></div></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="fake-app-nav">
        ${[['⊞','Home'],['◎','Search'],['♡','Saved'],['☰','Menu']].map((n,i) => `
          <div class="fan-item${i===0?' active':''}">
            <span class="fan-icon">${n[0]}</span>
            <span class="fan-lbl">${n[1]}</span>
          </div>`).join('')}
      </div>
    </div>
  `
}

function openProtoScreen(idx, triggerEl) {
  if (protoScreenEl || _subCubeSpinning) return
  const d = PROJECT_CARD_DATA[idx]
  const highlights = PROTO_HIGHLIGHTS[d.title] || PROTO_HIGHLIGHTS.OLAM

  const phoneContent = d.proto
    ? `<iframe src="${d.proto}" allow="fullscreen" frameborder="0"></iframe>`
    : generateFakeApp(d)

  protoScreenEl = document.createElement('div')
  protoScreenEl.id = 'prototype-screen'
  protoScreenEl.innerHTML = `
    <button class="scr-close-btn" id="proto-close-btn">&#10005;</button>
    <div class="ps-three-col">
      <div class="ps-col ps-col-left">
        <div class="ps-eyebrow">PROTOTYPE</div>
        <h2 class="ps-title">${d.title}</h2>
        <p class="ps-desc">${d.description}</p>
        <div class="ps-tags">${d.tags.map(t => `<span class="ps-tag">${t}</span>`).join('')}</div>
      </div>
      <div class="ps-col ps-col-center">
        <div class="ps-phone">
          <div class="ps-phone-notch"></div>
          <div class="ps-phone-content">${phoneContent}</div>
          <div class="ps-phone-home"></div>
        </div>
      </div>
      <div class="ps-col ps-col-right">
        <div class="ps-eyebrow">HIGHLIGHTS</div>
        <div class="ps-highlights">
          ${highlights.map(h => `
            <div class="ps-highlight-item">
              <div class="ps-hl-num">${h.num}</div>
              <div>
                <div class="ps-hl-label">${h.label}</div>
                <div class="ps-hl-desc">${h.desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `
  protoScreenEl.classList.add('ps-open')
  openWithCube(protoScreenEl, triggerEl)
  protoScreenEl.querySelector('#proto-close-btn').addEventListener('click', closeProtoScreen)
}

function closeProtoScreen() {
  if (!protoScreenEl) return
  if (_subCubeSpinning) { _pendingSubAction = closeProtoScreen; return }
  const el = protoScreenEl
  protoScreenEl = null
  el.querySelectorAll('iframe').forEach(f => { f.src = '' })
  closeWithCube(el)
}

// ── Gallery Screen — 3D Image Sphere ─────────────────────────────────────────

let galleryScreenEl = null
let gsAnimId        = null   // rAF handle for sphere rotation
let gsRotY          = 0      // current Y rotation (degrees)
let gsIsGrid        = false  // sphere vs grid mode
let gsHoldTimer     = null   // press-and-hold timeout

const GS_RADIUS  = 320   // sphere radius px
const GS_HOLD_MS = 900   // hold duration to reveal grid

function openGalleryScreen(idx, triggerEl) {
  if (galleryScreenEl || _subCubeSpinning) return
  const d = PROJECT_CARD_DATA[idx]

  // 20 cards: cycle through project gallery images
  const raw  = d.gallery && d.gallery.length ? d.gallery : [d.img]
  const imgs = Array.from({ length: 20 }, (_, i) => raw[i % raw.length])

  const cardHTML = imgs.map((src, i) => `
    <div class="gs-sph-card" data-i="${i}"
         style="background-image:url('${src}');background-color:${d.bg};">
    </div>
  `).join('')

  galleryScreenEl = document.createElement('div')
  galleryScreenEl.id = 'gallery-screen'
  galleryScreenEl.classList.add('gs-open')
  galleryScreenEl.innerHTML = `
    <div class="gs-bg-bloom"></div>
    <div class="gs-center-glow" aria-hidden="true"></div>
    <svg class="gs-noise-svg" aria-hidden="true">
      <filter id="gsNF">
        <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#gsNF)" opacity="0.07"/>
    </svg>
    <div class="gs-hdr">
      <span class="gs-hdr-title">${d.title} — Gallery</span>
      <button class="scr-close-btn" id="gs-close-btn">&#10005;</button>
    </div>
    <div class="gs-scene">
      <div class="gs-sphere" id="gs-sphere">${cardHTML}</div>
    </div>
    <div class="gs-hold-wrap" id="gs-hold-wrap"></div>
  `

  openWithCube(galleryScreenEl, triggerEl)
  galleryScreenEl.querySelector('#gs-close-btn').addEventListener('click', closeGalleryScreen)

  setTimeout(() => initGallerySphere(imgs, d), 1200)
}

function _gsSphTransform(thetaDeg, phiDeg) {
  return `rotateY(${thetaDeg}deg) rotateX(${-phiDeg}deg) translateZ(${GS_RADIUS}px) translate(-50%,-50%)`
}

function _gsBindHold(holdWrap, cards, sphere) {
  function onHoldStart() {
    if (gsIsGrid || !galleryScreenEl) return
    holdWrap.classList.add('gs-holding')
    gsHoldTimer = setTimeout(() => gsRevealGrid(cards, sphere, holdWrap), GS_HOLD_MS)
  }
  function onHoldEnd() {
    if (gsHoldTimer) { clearTimeout(gsHoldTimer); gsHoldTimer = null }
    holdWrap.classList.remove('gs-holding')
  }
  holdWrap.addEventListener('mousedown',  onHoldStart)
  holdWrap.addEventListener('touchstart', onHoldStart, { passive: true })
  holdWrap.addEventListener('mouseup',    onHoldEnd)
  holdWrap.addEventListener('mouseleave', onHoldEnd)
  holdWrap.addEventListener('touchend',   onHoldEnd)
}

function initGallerySphere(imgs, d) {
  if (!galleryScreenEl) return
  const sphere = galleryScreenEl.querySelector('#gs-sphere')
  const cards  = Array.from(galleryScreenEl.querySelectorAll('.gs-sph-card'))
  if (!sphere || !cards.length) return

  // Fibonacci lattice — each card faces outward using spherical rotation
  const golden = Math.PI * (3 - Math.sqrt(5))
  cards.forEach((card, i) => {
    const yN       = 1 - (i / (cards.length - 1)) * 2
    const th       = golden * i
    const thetaDeg = th * 180 / Math.PI
    const phiDeg   = Math.asin(Math.max(-1, Math.min(1, yN))) * 180 / Math.PI
    card.dataset.thetaDeg = thetaDeg
    card.dataset.phiDeg   = phiDeg
    card.style.transform  = _gsSphTransform(thetaDeg, phiDeg)
  })

  // Staggered fade-in
  cards.forEach((card, i) => {
    card.style.opacity    = '0'
    card.style.transition = `opacity 0.5s ease ${i * 45}ms`
    requestAnimationFrame(() => requestAnimationFrame(() => { card.style.opacity = '1' }))
  })

  // Auto-rotate
  gsRotY = 0; gsIsGrid = false
  const tick = () => {
    if (!galleryScreenEl || gsIsGrid) return
    gsRotY += 0.14
    sphere.style.transform = `rotateX(-12deg) rotateY(${gsRotY}deg)`
    gsAnimId = requestAnimationFrame(tick)
  }
  tick()

  const holdWrap = galleryScreenEl.querySelector('#gs-hold-wrap')
  gsHoldTimer = setTimeout(() => gsRevealGrid(cards, sphere, holdWrap), 2000)
}

function gsRevealGrid(cards, sphere, holdWrap) {
  if (!galleryScreenEl) return
  gsIsGrid = true
  cancelAnimationFrame(gsAnimId)

  // Face sphere front-on first
  sphere.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)'
  sphere.style.transform  = 'rotateX(0deg) rotateY(0deg)'

  if (holdWrap) holdWrap.classList.remove('gs-holding')

  setTimeout(() => {
    if (!galleryScreenEl) return
    const cols   = 4
    const cW = 200, cH = 132, gX = 18, gY = 18
    const rows   = Math.ceil(cards.length / cols)
    const totalW = cols * cW + (cols - 1) * gX
    const totalH = rows   * cH + (rows - 1) * gY

    sphere.style.transition = ''

    cards.forEach((card, i) => {
      const col = i % cols, row = Math.floor(i / cols)
      const tx  = -totalW / 2 + col * (cW + gX) + cW / 2
      const ty  = -totalH / 2 + row * (cH + gY) + cH / 2
      card.style.transition = `transform 0.78s cubic-bezier(0.16,1,0.3,1) ${i * 38}ms, width 0.5s ease ${i * 20}ms, height 0.5s ease ${i * 20}ms`
      card.style.width  = `${cW}px`
      card.style.height = `${cH}px`
      card.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`
    })

    if (holdWrap) {
      holdWrap.style.transition = 'opacity 0.25s'
      holdWrap.style.opacity    = '0'
      setTimeout(() => {
        if (!holdWrap || !galleryScreenEl) return
        holdWrap.innerHTML = `<button class="gs-sphere-btn" id="gs-sphere-btn">↺ &nbsp;SPHERE</button>`
        holdWrap.style.opacity = '1'
        holdWrap.querySelector('#gs-sphere-btn')?.addEventListener('click', () => gsReturnToSphere(cards, sphere, holdWrap))
      }, 280)
    }
  }, 460)
}

function gsReturnToSphere(cards, sphere, holdWrap) {
  if (!galleryScreenEl) return
  gsIsGrid = false

  // Return each card to its original spherical position using stored angles
  cards.forEach((card, i) => {
    card.style.transition = `transform 0.78s cubic-bezier(0.16,1,0.3,1) ${i * 32}ms`
    card.style.transform  = _gsSphTransform(
      parseFloat(card.dataset.thetaDeg),
      parseFloat(card.dataset.phiDeg)
    )
  })

  // Resume rotation after cards reassemble
  setTimeout(() => {
    if (!galleryScreenEl || gsIsGrid) return
    const tick = () => {
      if (!galleryScreenEl || gsIsGrid) return
      gsRotY += 0.14
      sphere.style.transform = `rotateX(-12deg) rotateY(${gsRotY}deg)`
      gsAnimId = requestAnimationFrame(tick)
    }
    tick()
  }, 900)

  if (holdWrap) {
    holdWrap.style.transition = 'opacity 0.25s'
    holdWrap.style.opacity    = '0'
    setTimeout(() => { if (holdWrap) holdWrap.style.opacity = '1' }, 280)
  }
  gsHoldTimer = setTimeout(() => {
    if (!galleryScreenEl || gsIsGrid) return
    gsRevealGrid(cards, sphere, holdWrap)
  }, 2000)
}

function closeGalleryScreen() {
  if (!galleryScreenEl) return
  if (_subCubeSpinning) { _pendingSubAction = closeGalleryScreen; return }
  cancelAnimationFrame(gsAnimId)
  if (gsHoldTimer) { clearTimeout(gsHoldTimer); gsHoldTimer = null }
  const el = galleryScreenEl
  galleryScreenEl = null
  gsIsGrid = false
  closeWithCube(el)
}

// ────────────────────────────────────────────────────────────────────────────

function createGalaxyView() {
  if (galaxyActive) return

  activeProjIdx   = 0
  isTransitioning = true
  lastActiveIdx   = 0

  PROJECT_CARD_DATA.forEach((d, i) => {
    const mesh = createProjMesh(d)

    if (i === 0) {
      const e = PROJ_ENTRY_DIRS[0]
      mesh.position.set(e.x, e.y, -PLANE_Z)
      mesh.scale.setScalar(0.6)
    } else {
      const f = FRAG_POS[(i - 1) % FRAG_POS.length]
      mesh.position.set(f.x, f.y, -(PLANE_Z + 2) + f.z)
      mesh.rotation.set(f.rx, f.ry, f.rz)
      mesh.scale.setScalar(f.s)
    }
    mesh.visible = true
    terrainPerspCamera.add(mesh)
    projectMeshes.push(mesh)
  })

  // Shadow receiver — transparent plane that only shows where the project box
  // casts a shadow (ShadowMaterial is invisible everywhere else)
  const shadowGeo = new THREE.PlaneGeometry(18, 14)
  const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28, transparent: true })
  shadowReceiverMesh = new THREE.Mesh(shadowGeo, shadowMat)
  shadowReceiverMesh.receiveShadow = true
  // Position: just behind the project box back-face, slightly down and right
  // (plane normal faces +Z in camera-local = faces the camera)
  shadowReceiverMesh.position.set(0.5, -0.3, -(PLANE_Z + CUBE_S / 2 + 0.5))
  terrainPerspCamera.add(shadowReceiverMesh)

  // Info bar is owned by the podium in multiscreen mode — send it the first project
  const _d0  = PROJECT_CARD_DATA[0]
  const _pd0 = { idx: 0, total: PROJECT_CARD_DATA.length, title: _d0.title, description: _d0.description, tags: _d0.tags, img: _d0.img, gallery: (_d0.gallery || []).slice(0, 4), video: _d0.video || '', ts: Date.now() }
  send('podium', 'galaxyEntered', [_pd0])
  localStorage.setItem('bec_galaxyEntered', JSON.stringify(_pd0))

  // exitHomeScreen() disables pointer-events on homeScreen so the disc page can
  // scroll freely. Now that the galaxy is live and needs canvas interaction,
  // restore them so homeCanvas receives mouse/click events.
  homeScreen.style.pointerEvents = ''

  terrainScene.fog = new THREE.Fog(0x000000, 8, 35)

  // Kill studio lighting in the galaxy — cubes are lit by a minimal ambient only
  _projKeyLight.intensity  = 0
  _projFillLight.intensity = 0
  _projAmbient.intensity   = 0

  // Vignette overlay — radial gradient darkening the edges
  const _vig = document.createElement('div')
  _vig.id = 'galaxy-vignette'
  Object.assign(_vig.style, {
    position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '10',
    background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.88) 100%)',
    opacity: '0', transition: 'opacity 1.4s ease',
  })
  document.body.appendChild(_vig)
  requestAnimationFrame(() => { _vig.style.opacity = '1' })

  galaxyActive = true
}

function renderProjInfo(idx) {
  if (!projInfoEl) return
  const d   = PROJECT_CARD_DATA[idx]
  const num = String(idx + 1).padStart(2, '0')
  const tot = String(PROJECT_CARD_DATA.length).padStart(2, '0')
  projInfoEl.innerHTML = `
    <div class="pi-left">
      <div class="pi-kicker">Project</div>
      <h2 class="pi-title">${d.title}</h2>
      <button class="pi-view-cta" id="pi-view-cta-btn">VIEW CASE STUDY</button>
    </div>
    <div class="pi-right">
      <div class="pi-kicker">Info</div>
      <p class="pi-desc">${d.description}</p>
      <div class="pi-tags">${d.tags.map(t => `<span class="pi-tag">${t}</span>`).join('')}</div>
    </div>
    <div class="pi-nav">
      <span class="pi-counter">${num} / ${tot}</span>
      <button class="pi-back" id="pi-back-btn">&#8592; BACK</button>
      <button class="pi-gallery-btn" id="pi-gallery-btn">VIEW ALL</button>
    </div>
  `
  document.getElementById('pi-back-btn').addEventListener('click', exitGalaxyToDisc)
  document.getElementById('pi-gallery-btn').addEventListener('click', showProjectGallery)
  const viewCta = document.getElementById('pi-view-cta-btn')
  if (viewCta) viewCta.addEventListener('click', () => openProjectOverview(activeProjIdx))
}

function updateGalaxyCards() {
  if (!projectMeshes.length) return

  // ── VIEW ALL: gather all meshes into a 5 × 2 grid in camera-local space ──
  if (galaxyViewAll) {
    const GRID_S = 0.75           // compensated for smaller CUBE_S so 5 cubes fill the frustum
    const cW = CUBE_S * GRID_S    // ~1.65 units per cell
    const cH = cW                 // square cells for square cubes
    const GAP = 0.18
    const COLS = 5
    const ROWS = Math.ceil(projectMeshes.length / COLS)
    const totalW = COLS * cW + (COLS - 1) * GAP
    const totalH = ROWS * cH + (ROWS - 1) * GAP
    const CY = 0.15               // shift grid slightly up

    projectMeshes.forEach((mesh, i) => {
      if (i === vaZoomIdx) return
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const tx = -totalW / 2 + col * (cW + GAP) + cW / 2
      const ty = CY + totalH / 2 - row * (cH + GAP) - cH / 2
      const tz = (i === vaHoverMeshIdx) ? -(PLANE_Z + 0.7) : -PLANE_Z

      const lr = 0.07
      mesh.position.x += (tx - mesh.position.x) * lr
      mesh.position.y += (ty - mesh.position.y) * lr
      mesh.position.z += (tz - mesh.position.z) * lr
      mesh.rotation.x += (0 - mesh.rotation.x) * lr
      mesh.rotation.y += (0 - mesh.rotation.y) * lr
      mesh.rotation.z += (0 - mesh.rotation.z) * lr
      mesh.scale.x    += (GRID_S - mesh.scale.x) * lr
      mesh.scale.y    += (GRID_S - mesh.scale.y) * lr
      mesh.scale.z    += (GRID_S - mesh.scale.z) * lr
      setMeshOp(mesh, getMeshOp(mesh) + (1 - getMeshOp(mesh)) * lr)
    })
    return
  }

  // ── Normal galaxy: one card active, rest scattered ───────────────────────
  let arrived = true
  const t = performance.now() * 0.00018   // hoisted — same value for all meshes this frame

  for (let i = 0; i < projectMeshes.length; i++) {
    if (i === vaZoomIdx) continue
    const mesh = projectMeshes[i]

    if (i === activeProjIdx) {
      const lx = 0.11
      mesh.position.x += (0           - mesh.position.x) * lx
      mesh.position.y += (ACTIVE_Y    - mesh.position.y) * lx
      mesh.position.z += (-PLANE_Z    - mesh.position.z) * lx
      mesh.rotation.x += (ACTIVE_ROT_X - mesh.rotation.x) * lx
      mesh.rotation.y += (ACTIVE_ROT_Y - mesh.rotation.y) * lx
      mesh.rotation.z += (0            - mesh.rotation.z) * lx
      mesh.scale.x    += (1 - mesh.scale.x) * lx
      mesh.scale.y    += (1 - mesh.scale.y) * lx
      mesh.scale.z    += (1 - mesh.scale.z) * lx
      const op = getMeshOp(mesh)
      setMeshOp(mesh, op + (1 - op) * lx)
      if (Math.abs(mesh.position.x) > 0.3 || Math.abs(getMeshOp(mesh) - 1) > 0.04) arrived = false
    } else {
      const fi = i < activeProjIdx ? i : i - 1
      const f  = FRAG_POS[fi % FRAG_POS.length]
      const lf = 0.035
      const fz = -(PLANE_Z + 2) + f.z
      const dX = Math.sin(t * 0.9 + fi * 1.31) * 4.5 + Math.sin(t * 0.37 + fi * 2.7) * 2.2
      const dY = Math.cos(t * 0.6 + fi * 0.87) * 3.0 + Math.cos(t * 0.21 + fi * 3.1) * 1.4
      const dZ = Math.sin(t * 0.4 + fi * 1.73) * 2.2 + Math.cos(t * 0.55 + fi * 1.1) * 1.0
      mesh.position.x += (f.x + dX - mesh.position.x) * lf
      mesh.position.y += (f.y + dY - mesh.position.y) * lf
      mesh.position.z += (fz  + dZ - mesh.position.z) * lf
      const trx = f.rx + Math.sin(t * 0.30 + fi * 2.1) * 0.90
      const try_ = f.ry + Math.cos(t * 0.25 + fi * 1.7) * 1.10
      const trz = f.rz + Math.sin(t * 0.20 + fi * 2.5) * 0.55
      mesh.rotation.x += (trx  - mesh.rotation.x) * lf
      mesh.rotation.y += (try_ - mesh.rotation.y) * lf
      mesh.rotation.z += (trz  - mesh.rotation.z) * lf
      mesh.scale.x    += (f.s  - mesh.scale.x)    * lf
      mesh.scale.y    += (f.s  - mesh.scale.y)    * lf
      mesh.scale.z    += (f.s  - mesh.scale.z)    * lf
      const op = getMeshOp(mesh)
      setMeshOp(mesh, op + (0.60 - op) * lf)
    }
  }

  if (isTransitioning && arrived) isTransitioning = false
}

function transitionToProject(newIdx, direction) {
  if (!projectMeshes.length) return
  const N = PROJECT_CARD_DATA.length

  // Snap the outgoing active plane to an exit position (opposite of incoming direction)
  const entryDir = PROJ_ENTRY_DIRS[newIdx % PROJ_ENTRY_DIRS.length]
  const exitX = direction > 0 ? -entryDir.x : entryDir.x
  const exitY = direction > 0 ? -entryDir.y : entryDir.y
  const outgoing = projectMeshes[activeProjIdx]
  outgoing.position.set(exitX, exitY, -PLANE_Z)
  setMeshOp(outgoing, 0)
  outgoing.scale.setScalar(0.5)

  // Place the incoming plane at its entry position so it can lerp to center
  const incoming = projectMeshes[newIdx]
  const startX = direction > 0 ? entryDir.x : -entryDir.x
  const startY = direction > 0 ? entryDir.y : -entryDir.y
  incoming.position.set(startX, startY, -PLANE_Z)
  incoming.rotation.set(0, 0, 0)
  incoming.scale.setScalar(0.5)
  setMeshOp(incoming, 0)

  activeProjIdx   = newIdx
  isTransitioning = true
  lastActiveIdx   = newIdx

  // Notify podium of new project
  const _dpn = PROJECT_CARD_DATA[newIdx]
  const _pdN = { idx: newIdx, total: PROJECT_CARD_DATA.length, title: _dpn.title, description: _dpn.description, tags: _dpn.tags, img: _dpn.img, gallery: (_dpn.gallery || []).slice(0, 4), video: _dpn.video || '' }
  send('podium', 'projectChanged', [_pdN])
  localStorage.setItem('bec_projectChanged', JSON.stringify(_pdN))
}

// Exit from project-cards view back to the disc overview without going all the
// way to the home screen.  homeExited stays true so the disc stays visible.
function exitGalaxyToDisc() {
  galaxyExitTime = Date.now()

  // Fade out info overlay then remove
  if (projInfoEl) {
    projInfoEl.classList.remove('pi-show')
    const el = projInfoEl
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el) }, 600)
    projInfoEl = null
  }

  // Remove shadow receiver
  if (shadowReceiverMesh) {
    terrainPerspCamera.remove(shadowReceiverMesh)
    shadowReceiverMesh.geometry.dispose()
    shadowReceiverMesh.material.dispose()
    shadowReceiverMesh = null
  }

  // Remove THREE.js plane meshes from camera
  projectMeshes.forEach(m => {
    terrainPerspCamera.remove(m)
    m.geometry.dispose()
    if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose())
    else m.material.dispose()
  })
  projectMeshes    = []
  lastActiveIdx    = -1
  activeProjIdx    = 0
  isTransitioning  = false

  hideProjectGallery()
  galaxyViewAll = false
  if (vaBackEl)   { vaBackEl.remove();   vaBackEl   = null }
  if (vaLabelEl)  { vaLabelEl.remove();  vaLabelEl  = null }
  if (projOverviewEl) { projOverviewEl.remove(); projOverviewEl = null }
  if (bandOverlayEl)  { bandOverlayEl.remove();  bandOverlayEl  = null }
  galaxyActive         = false
  galaxyScrollProgress = 0
  galaxyScrollTarget   = 0
  galaxyAutoRot        = 0

  // Restore heading now — it won't be visible while camera is deep in the vortex,
  // but as the camera retreats the 3D position check will fade it back in naturally.
  if (homeHeading) {
    homeHeading.style.display    = ''
    homeHeading.style.opacity    = ''
    homeHeading.style.visibility = ''
    homeHeading.style.transform  = ''
  }
  if (homeEdgeFadeEl) homeEdgeFadeEl.style.display = ''

  // Reverse the fly-in: keep enterActive so the lerp runs in reverse.
  // revertAfterFlyOut tells animateHome to continue reversing homeScroll
  // once enterFlyZ reaches 0 so the camera retreats far enough for text to appear.
  enterFlyTarget     = 0
  enterActive        = true
  revertAfterFlyOut  = true

  send('podium', 'galaxyExited')
  localStorage.setItem('bec_galaxyExited', String(Date.now()))
}

function destroyGalaxyView() {
  if (shadowReceiverMesh) {
    terrainPerspCamera.remove(shadowReceiverMesh)
    shadowReceiverMesh.geometry.dispose()
    shadowReceiverMesh.material.dispose()
    shadowReceiverMesh = null
  }
  hideProjectGallery()
  if (projOverviewEl) { projOverviewEl.remove(); projOverviewEl = null }
  if (bandOverlayEl)  { bandOverlayEl.remove();  bandOverlayEl  = null }
  projectMeshes.forEach(m => {
    terrainPerspCamera.remove(m)
    m.geometry.dispose()
    if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose())
    else m.material.dispose()
  })
  projectMeshes    = []
  if (projInfoEl) { projInfoEl.remove(); projInfoEl = null }
  lastActiveIdx    = -1
  activeProjIdx    = 0
  const _vig = document.getElementById('galaxy-vignette')
  if (_vig) { _vig.style.opacity = '0'; setTimeout(() => _vig.remove(), 1400) }

  terrainScene.fog = null

  // Restore lights for non-galaxy scenes
  _projKeyLight.intensity  = 1.4
  _projFillLight.intensity = 0.65
  _projAmbient.intensity   = 0.30

  isTransitioning  = false
  galaxyActive     = false
  galaxyScrollProgress = 0
  galaxyScrollTarget   = 0
  galaxyAutoRot        = 0
  revertAfterFlyOut    = false
}

function showProjectGallery() {
  if (galaxyViewAll || !projectMeshes.length) return
  galaxyViewAll = true
  isTransitioning = false

  // Hide the project info panel — doesn't make sense in grid mode
  if (projInfoEl) {
    projInfoEl.style.transition = 'opacity 0.3s'
    projInfoEl.style.opacity = '0'
    projInfoEl.style.pointerEvents = 'none'
  }

  // Floating "← BACK" button at bottom of canvas
  vaBackEl = document.createElement('div')
  vaBackEl.id = 'va-back'
  vaBackEl.innerHTML = `<button id="va-back-btn">← BACK TO GALAXY</button>`
  document.body.appendChild(vaBackEl)
  requestAnimationFrame(() => requestAnimationFrame(() => vaBackEl.classList.add('va-show')))
  document.getElementById('va-back-btn').addEventListener('click', hideProjectGallery)
}

function hideProjectGallery() {
  if (!galaxyViewAll) return
  galaxyViewAll = false

  // Kill hover label and hover state
  if (vaLabelEl) { vaLabelEl.remove(); vaLabelEl = null }
  vaHoverMeshIdx = -1
  homeCanvas.style.cursor = ''

  // Restore project info panel
  if (projInfoEl) {
    projInfoEl.style.transition = 'opacity 0.35s'
    projInfoEl.style.opacity    = ''
    projInfoEl.style.pointerEvents = ''
    setTimeout(() => { if (projInfoEl) projInfoEl.style.transition = '' }, 380)
  }

  // Remove back button
  if (vaBackEl) {
    vaBackEl.classList.remove('va-show')
    const el = vaBackEl; vaBackEl = null
    setTimeout(() => el.remove(), 320)
  }
}

function launchTextParticles() {
  destroyTextParticles()

  ctaTextEl = document.createElement('div')
  ctaTextEl.id = 'disc-cta'
  ctaTextEl.innerHTML = `
    <p class="disc-cta-heading">Enter the<br>Project Galaxy</p>
    <button class="disc-cta-btn" id="discEnterBtn">ENTER</button>
  `
  document.body.appendChild(ctaTextEl)

  const btn = document.getElementById('discEnterBtn')
  if (btn) btn.addEventListener('click', () => {
    enterActive = true
    enterFlyTarget = 17   // full fly-in to vortex centre
    destroyTextParticles()
  })

  requestAnimationFrame(() => requestAnimationFrame(() => {
    ctaTextEl.classList.add('disc-cta--visible')
  }))
}

function drawTextParticles() {}   // no-op — no canvas particles

function destroyTextParticles() {
  if (textAnimId) { cancelAnimationFrame(textAnimId); textAnimId = null }
  if (textOverlayCanvas) { textOverlayCanvas.remove(); textOverlayCanvas = null; textOverlayCtx = null }
  if (ctaTextEl) { ctaTextEl.remove(); ctaTextEl = null }
  textParticles = []
}
// ─────────────────────────────────────────────────────────────────────────────

function exitHomeScreen() {
  if (homeExited) return
  homeExited = true
  // homeScreen background is already white (animation drove it there) — keep it visible as
  // the disc page background. Only disable pointer events and hide heading-layer elements.
  homeScreen.style.pointerEvents = 'none'
  if (homeHeading)    homeHeading.style.display    = 'none'
  if (homeEdgeFadeEl) homeEdgeFadeEl.style.display = 'none'
  homeScrollProgress = HOME_EXIT_SCROLL
  homeScrollTarget   = HOME_EXIT_SCROLL
  removeProjectCard()
  setActiveMenuItem(MENU_INDEX.PROJECTS)
  currentAppState = 'TUNNEL'
  mainLogo.style.opacity = '1'
  mainLogo.style.color   = '#000000'
  launchTextParticles()
}

function reEnterHomeScreen() {
  if (!homeExited) return
  // Stop the disc-as-background animation before restarting fresh
  if (homeAnimId) { cancelAnimationFrame(homeAnimId); homeAnimId = null }
  homeExited = false
  homeScrollProgress = 0
  homeScrollTarget = 0
  homeScrollVelocity = 0
  if (homeHeading) {
    homeHeading.style.display    = ''
    homeHeading.style.transform  = ''
    homeHeading.style.opacity    = ''
    homeHeading.style.visibility = ''
  }
  headingRevealT = 0
  headingRevealActive = true   // restart reveal on re-enter
  if (homeEdgeFadeEl) homeEdgeFadeEl.style.display = ''
  homePreExited = false
  mainLogo.style.color = ''    // restore white text for dark home background
  document.documentElement.style.setProperty('--menu-rgb', '255, 255, 255')
  destroyTextParticles()
  destroyGalaxyView()
  enterActive = false
  enterFlyZ = 0
  enterFlyY = 0
  enterFlyTarget = 0
  // Restore homeScreen (animation will repaint from dark on first frame)
  homeScreen.style.background    = ''
  homeScreen.style.opacity       = ''
  homeScreen.style.pointerEvents = ''
  homeScreen.style.transform     = ''
  currentAppState = 'TUNNEL'
  homeScreen.style.display = 'block'
  homeScreen.offsetHeight
  homeScreen.classList.remove('exit')
  syncRenderer(homeRenderer, homeCamera)
  homeCamera.left = 0; homeCamera.right = DESIGN_W
  homeCamera.top  = DESIGN_H; homeCamera.bottom = 0
  homeCamera.updateProjectionMatrix()
  terrainCamZ = TERRAIN_CAM_Z_START
  terrainCamY = TERRAIN_CAM_HEIGHT + 0.2
  terrainPerspCamera.aspect = DESIGN_W / DESIGN_H
  terrainPerspCamera.updateProjectionMatrix()
  terrainMaterial.uniforms.uFocalLength.value = DESIGN_H * 0.5 / Math.tan(TERRAIN_CAM_FOV * 0.5 * Math.PI / 180)
  initHomeParticles()
  initTerrainParticles()
  createHomePillars()
  createVoidEl()
  createEdgeFadeEl()
  // Reset FOV to default (cleared from any previous vortex)
  terrainPerspCamera.fov = TERRAIN_CAM_FOV
  terrainPerspCamera.updateProjectionMatrix()
  terrainMaterial.uniforms.uFocalLength.value = DESIGN_H * 0.5 / Math.tan(TERRAIN_CAM_FOV * 0.5 * Math.PI / 180)
  animateHome()
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

function navigateToSection(targetIndex) {
  if (currentAppState === 'TRANSITION') return

  if (targetIndex === MENU_INDEX.HOME) {
    reEnterHomeScreen()
    setActiveMenuItem(0)
    return
  }

  if (targetIndex === MENU_INDEX.PROJECTS) {
    if (!homeExited) {
      // On home screen → jump straight to disc with CTA
      exitHomeScreen()
    } else if (galaxyActive) {
      // Inside galaxy → fly back out to disc
      exitGalaxyToDisc()
    } else if (!ctaTextEl) {
      // Already on disc but CTA was dismissed — reshow it
      launchTextParticles()
    }
    setActiveMenuItem(targetIndex)
    return
  }

  setActiveMenuItem(targetIndex)
}

function removeProjectCard() {}

function softRevertToHome() {
  if (!homeExited) return
  homeExited = false
  destroyTextParticles()
  destroyGalaxyView()
  enterActive = false
  enterFlyZ = 0
  enterFlyY = 0
  enterFlyTarget = 0
  homeScreen.style.pointerEvents = ''
  if (homeHeading) {
    homeHeading.style.display     = ''
    homeHeading.style.opacity     = ''
    homeHeading.style.visibility  = ''
  }
  if (homeEdgeFadeEl) homeEdgeFadeEl.style.display = ''
  setActiveMenuItem(MENU_INDEX.HOME)
  mainLogo.style.color = ''
  document.documentElement.style.setProperty('--menu-rgb', '255, 255, 255')
  // Set target low enough that terrainScroll drops below 1, moving the camera
  // back to ~Z 16-17 where the heading text becomes visible again.
  homeScrollTarget   = 0.30
  homeScrollProgress = Math.min(homeScrollProgress, HOME_VORTEX_START_SCROLL)
}

function navigateProjectOverview(dir) {
  if (!projOverviewEl || _projCubeSpinning) return

  const N = PROJECT_CARD_DATA.length

  // Scrolling backward past the first project → close overview and return to galaxy
  if (dir < 0 && projOverviewIdx === 0) {
    closeProjectOverview()
    return
  }
  // Don't go forward past the last project
  if (dir > 0 && projOverviewIdx === N - 1) return

  const newIdx = projOverviewIdx + dir  // always ±1 within bounds

  // Build the incoming overview element
  const trackerItems = PROJECT_CARD_DATA.map((pd, i) =>
    `<div class="tracker-item ${i === newIdx ? 'active' : ''}" data-ov-idx="${i}">
       <div class="tracker-line"></div>
       <span class="tracker-label">${pd.title}</span>
     </div>`
  ).join('')
  const newEl = document.createElement('div')
  newEl.id = 'project-overview-screen'
  newEl.innerHTML = `
    <button class="back-btn" id="ov-back-btn">&#8592; BACK</button>
    <div class="overview-grid">${_ovGridHTML(newIdx)}</div>
    <div class="overview-tracker">${trackerItems}</div>
  `
  newEl.classList.add('active-view', 'ov-split')

  const outEl    = projOverviewEl
  const SWEEP_MS = 380
  // dir > 0 (scroll down): new page enters from right, old exits left
  // dir < 0 (scroll up):   new page enters from left,  old exits right
  const enterX = dir > 0 ? 100 : -100
  const exitX  = dir > 0 ? -100 : 100

  // Start new page off-screen with no transition
  newEl.style.transform  = `translateX(${enterX}%)`
  newEl.style.transition = 'none'
  document.body.appendChild(newEl)

  // Force reflow so the initial transform is committed before we add transitions
  newEl.offsetHeight  // eslint-disable-line no-unused-expressions

  const ease = `transform ${SWEEP_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
  outEl.style.transition = ease
  newEl.style.transition  = ease
  outEl.style.transform   = `translateX(${exitX}%)`
  newEl.style.transform   = 'translateX(0%)'

  // Update shared state immediately so any re-entrant calls see correct idx
  projOverviewEl  = newEl
  projOverviewIdx = newIdx
  activeProjIdx   = newIdx
  lastActiveIdx   = newIdx

  // Keep the podium's case-study panel (title, video/proto/gallery thumbnails)
  // in sync when navigation is driven by its prev/next buttons.
  const _dNav = PROJECT_CARD_DATA[newIdx]
  const _pdNav = { idx: newIdx, total: N, title: _dNav.title, description: _dNav.description, tags: _dNav.tags, img: _dNav.img, gallery: (_dNav.gallery || []).slice(0, 4), video: _dNav.video || '' }
  send('podium', 'projectChanged', [_pdNav])
  localStorage.setItem('bec_projectChanged', JSON.stringify(_pdNav))

  newEl.querySelector('#ov-back-btn')?.addEventListener('click', closeProjectOverview)
  bindIconBtns(newIdx)
  newEl.querySelectorAll('.tracker-item').forEach(item => {
    item.addEventListener('click', () => {
      const nIdx = parseInt(item.dataset.ovIdx)
      if (nIdx !== projOverviewIdx) switchProjectOverview(nIdx)
    })
  })
  renderProjInfo(newIdx)

  setTimeout(() => {
    if (outEl.parentNode) outEl.remove()
    newEl.style.transition = ''
    newEl.style.transform  = ''
  }, SWEEP_MS + 30)
}

function globalUnifiedScrollManager(e) {
  if (Math.abs(e.deltaY) < 2) return
  if (currentAppState === 'TRANSITION') return

  // Project overview open (or cube close-spin in progress) — handle scroll here so
  // events never reach the galaxy handler below while the overview is on screen.
  if (projOverviewEl || _projCubeSpinning) {
    if (_projCubeSpinning) return   // cube transition owns the screen; swallow event
    const now = Date.now()
    if (now - lastScrollTime < 700) {
      clearTimeout(scrollAccumResetTimer)
      scrollAccumResetTimer = setTimeout(() => { scrollAccum = 0 }, 180)
      return
    }
    scrollAccum += e.deltaY
    clearTimeout(scrollAccumResetTimer)
    scrollAccumResetTimer = setTimeout(() => { scrollAccum = 0 }, 180)
    if (Math.abs(scrollAccum) < 40) return
    const dir = scrollAccum > 0 ? 1 : -1
    scrollAccum    = 0
    lastScrollTime = now
    navigateProjectOverview(dir)
    return
  }

  // Galaxy interior — deltaY accumulation scroll.
  // Accumulate deltaY across events; trigger one transition when the total crosses
  // a threshold (handles both large mouse-wheel steps and small trackpad ticks).
  // A 550 ms cooldown after each trigger prevents momentum-scroll multi-fire.
  if (galaxyActive) {
    const now = Date.now()
    if (now - lastScrollTime < 550) {
      // In cooldown — drain the accumulator so old momentum doesn't carry over
      clearTimeout(scrollAccumResetTimer)
      scrollAccumResetTimer = setTimeout(() => { scrollAccum = 0 }, 180)
      return
    }

    scrollAccum += e.deltaY
    clearTimeout(scrollAccumResetTimer)
    scrollAccumResetTimer = setTimeout(() => { scrollAccum = 0 }, 180)

    if (Math.abs(scrollAccum) < 40) return   // not enough scroll yet

    const dir = scrollAccum > 0 ? 1 : -1
    scrollAccum   = 0
    lastScrollTime = now

    const N = PROJECT_CARD_DATA.length
    if (dir > 0) {
      transitionToProject((activeProjIdx + 1) % N, 1)
    } else {
      if (activeProjIdx === 0) {
        exitGalaxyToDisc()
        return
      }
      transitionToProject((activeProjIdx - 1 + N) % N, -1)
    }
    return
  }

  // Disc view — scroll back smoothly reverses to the home screen.
  // Ignore for 1.2 s after returning from galaxy so the same scroll gesture
  // that exited the cards does not immediately jump to the home screen.
  if (homeExited && e.deltaY < 0) {
    if (Date.now() - galaxyExitTime < 1200) return
    softRevertToHome()
    return
  }

  if (!homeExited) {
    const scrollStep = Math.min(0.032, Math.max(0.010, Math.abs(e.deltaY) / 4200))
    if (e.deltaY > 0) {
      homeScrollTarget = Math.min(HOME_EXIT_SCROLL, homeScrollTarget + scrollStep)
      // Nudge progress when target hits the ceiling so the lerp gap never hangs
      if (homeScrollTarget >= HOME_EXIT_SCROLL) homeScrollProgress = Math.max(homeScrollProgress, HOME_EXIT_SCROLL - 0.015)
    } else {
      homeScrollTarget = Math.max(0, homeScrollTarget - scrollStep)
    }
    homeScrollVelocity = Math.min(1, homeScrollVelocity + scrollStep * 8)
  }
}

function applyViewportScale() {
  // Scale the fixed 1920×1080 design canvas to fill the browser viewport.
  // This lets the scene cover the full screen without leaving letterboxed bars.
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  const scale = Math.max(vw / DESIGN_W, vh / DESIGN_H)
  const ox = (vw - DESIGN_W * scale) / 2
  const oy = (vh - DESIGN_H * scale) / 2
  const app = document.getElementById('app')
  if (app) {
    app.style.transform = `translate(${ox}px, ${oy}px) scale(${scale})`
    app.style.transformOrigin = '0 0'

    // Logo is inside #app which has a CSS transform — position: fixed is anchored to
    // #app's local space, not the true viewport. To hit viewport pixel (vx, vy) the
    // local CSS value must be (vx - offset) / scale.
    if (mainLogo) {
      mainLogo.style.top  = `${Math.round((32  - oy) / scale)}px`
      mainLogo.style.left = `${Math.round((40  - ox) / scale)}px`
    }

    // Menu is appended to document.body (outside the transform) so its top/left
    // are true viewport pixels — no scale/offset adjustment needed.
    const menuInner = document.querySelector('.galaxy-side-menu-inner')
    if (menuInner) {
      menuInner.style.top = '200px'
      menuInner.style.transform = 'none'
    }
  }
}

function initCelestialNoise() {
  const nc = document.createElement('canvas')
  nc.id = 'celestial-noise'
  document.body.insertBefore(nc, document.body.firstChild)
  const nctx = nc.getContext('2d')
  let nw = 0, nh = 0
  function resizeNoise() {
    nw = nc.width  = window.innerWidth
    nh = nc.height = window.innerHeight
  }
  resizeNoise()
  window.addEventListener('resize', resizeNoise)

  let nf = 0
  function drawNoise() {
    nf++
    if (nf % 4 === 0) {
      nctx.clearRect(0, 0, nw, nh)
      for (let k = 0; k < 3200; k++) {
        const x = Math.random() * nw
        const y = Math.random() * nh
        const size = Math.random() < 0.10 ? 1.5 : 1
        const alpha = (Math.random() * 0.06).toFixed(3)
        const g = 140 + (Math.random() * 80 | 0)
        const b = Math.min(255, g + (Math.random() * 55 | 0))
        nctx.fillStyle = `rgba(${g},${g},${b},${alpha})`
        nctx.fillRect(x, y, size, size)
      }
    }
    requestAnimationFrame(drawNoise)
  }
  drawNoise()
}

function handleResize() {
  applyViewportScale()
  syncRenderer(homeRenderer, homeCamera)
  terrainPerspCamera.aspect = DESIGN_W / DESIGN_H
  terrainPerspCamera.updateProjectionMatrix()
  terrainMaterial.uniforms.uFocalLength.value = DESIGN_H * 0.5 / Math.tan(TERRAIN_CAM_FOV * 0.5 * Math.PI / 180)
  if (!homeExited) {
    initHomeParticles()
    initTerrainParticles()
    createHomePillars()
    createVoidEl()
    createEdgeFadeEl()
  }
}

window.addEventListener('wheel', globalUnifiedScrollManager, { passive: true })
window.addEventListener('resize', handleResize)
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (galaxyViewAll) { hideProjectGallery(); return }
    if (galaxyActive)  reEnterHomeScreen()
  }
})

// ── View-All: raycast helpers ─────────────────────────────────────────────────
// 2-D screen-space hit test — project each mesh center to viewport pixels
// and check if the cursor falls within the card's projected bounds.
// Much more reliable than 3-D raycasting inside a CSS-transformed container.
function _vaRaycast(e) {
  if (!projectMeshes.length) return -1
  terrainPerspCamera.updateMatrixWorld(true)

  const cx = e.clientX
  const cy = e.clientY
  let bestDist = Infinity
  let bestIdx  = -1

  for (let i = 0; i < projectMeshes.length; i++) {
    const mesh = projectMeshes[i]
    const { sx, sy, cardSW, cardSH } = _meshScreenBounds(mesh)

    // Half-extents with generous padding so a click near the edge still registers
    const hw = cardSW * 0.5 + 12
    const hh = cardSH * 0.5 + 12

    if (cx >= sx - hw && cx <= sx + hw && cy >= sy - hh && cy <= sy + hh) {
      const d2 = (cx - sx) ** 2 + (cy - sy) ** 2
      if (d2 < bestDist) { bestDist = d2; bestIdx = i }
    }
  }
  return bestIdx
}

// Ensure hover label element exists
function _vaEnsureLabel() {
  if (!vaLabelEl) {
    vaLabelEl = document.createElement('div')
    vaLabelEl.id = 'va-label'
    document.body.appendChild(vaLabelEl)
  }
  return vaLabelEl
}

// Position the label near the cursor, clamped to viewport
function _vaPositionLabel(cx, cy) {
  if (!vaLabelEl) return
  const LW = vaLabelEl.offsetWidth  || 220
  const LH = vaLabelEl.offsetHeight || 100
  const PAD = 18

  // Default: above-right of cursor
  let lx = cx + 20
  let ly = cy - LH - 14

  // Near top → flip below cursor
  if (ly < PAD) ly = cy + 20

  // Near right edge → flip left of cursor
  if (lx + LW > window.innerWidth - PAD) lx = cx - LW - 20

  // Clamp to viewport
  lx = Math.max(PAD, Math.min(lx, window.innerWidth  - LW  - PAD))
  ly = Math.max(PAD, Math.min(ly, window.innerHeight - LH  - PAD))

  vaLabelEl.style.left = `${lx}px`
  vaLabelEl.style.top  = `${ly}px`
}

// Hover: show project info label near cursor
homeCanvas.addEventListener('mousemove', e => {
  if (!galaxyViewAll || !galaxyActive || !projectMeshes.length) {
    if (vaLabelEl) vaLabelEl.style.opacity = '0'
    homeCanvas.style.cursor = ''
    return
  }

  const hitIdx = _vaRaycast(e)
  vaHoverMeshIdx = hitIdx

  if (hitIdx >= 0) {
    const d  = PROJECT_CARD_DATA[hitIdx]
    const el = _vaEnsureLabel()

    el.innerHTML = `
      <div class="val-title">${d.title}</div>
      <div class="val-tags">${d.tags.map(t => `<span>${t}</span>`).join('')}</div>
      <div class="val-hint">Click to explore &rarr;</div>
    `
    _vaPositionLabel(e.clientX, e.clientY)
    el.style.opacity = '1'
    homeCanvas.style.cursor = 'pointer'
  } else {
    if (vaLabelEl) vaLabelEl.style.opacity = '0'
    homeCanvas.style.cursor = ''
  }
})

// Click: exit view-all and open the project description overview
homeCanvas.addEventListener('click', e => {
  if (!galaxyViewAll || !galaxyActive || !projectMeshes.length) return
  const hitIdx = _vaRaycast(e)
  if (hitIdx < 0) return

  activeProjIdx = hitIdx
  lastActiveIdx = hitIdx

  // Dismiss label immediately
  if (vaLabelEl) { vaLabelEl.style.opacity = '0' }
  homeCanvas.style.cursor = ''

  // Exit view-all grid
  hideProjectGallery()

  // Clean up any stale overview before opening the new one
  if (projOverviewEl) { projOverviewEl.remove(); projOverviewEl = null; projOverviewIdx = -1 }

  // Small delay so the grid mesh animation starts before the band-wipe fires
  setTimeout(() => openProjectOverview(hitIdx), 100)
})
if (mainLogo) {
  mainLogo.style.cursor = 'pointer'
  mainLogo.addEventListener('click', () => navigateToSection(MENU_INDEX.HOME))
}

createSideMenu()
setActiveMenuItem(0)
initCelestialNoise()
syncRenderer(homeRenderer, homeCamera)
initHomeParticles()
initTerrainParticles()
createHomePillars()
createVoidEl()
createEdgeFadeEl()
applyViewportScale()
animateHome()
startSplashSequence()

// ── Multi-screen wiring ───────────────────────────────────────────────────────
initMultiscreen()

// Projector (and plain no-role page): jump into galaxy on command
// ROLE is null for plain localhost:5173 — multiscreen.js registers it as 'projector' anyway
if (ROLE === 'projector' || !ROLE) {
  // In multiscreen mode the podium owns the "Enter" CTA — suppress it on the projector entirely
  launchTextParticles = () => {}

  // ── Blank overlay: projector starts black, revealed when person is detected ──
  const _blanket = document.createElement('div')
  Object.assign(_blanket.style, {
    position: 'fixed', inset: '0', background: '#000',
    zIndex: '99999', pointerEvents: 'none',
    transition: 'opacity 1.4s ease',
  })
  document.body.appendChild(_blanket)

  const _revealHome = () => {
    _blanket.style.opacity = '0'
    setTimeout(() => _blanket.remove(), 1500)
  }

  onMessage('personDetected', _revealHome)
  window.addEventListener('storage', e => {
    if (e.key === 'bec_personDetected') _revealHome()
  })

  // ── Galaxy fly-in ──────────────────────────────────────────────────────────
  // Auto-scrolls through the home particle environment at natural pace,
  // then flies into the galaxy — same visual journey as manual scrolling.
  const _doShowGalaxy = () => {
    if (galaxyActive || homeExited) return

    const SCROLL_DUR  = 4000   // ms to travel through home particle env
    const DISC_HOLD   = 700    // ms to show the disc before flying in
    let   scrollStart = null

    function _scrollStep(now) {
      if (!scrollStart) scrollStart = now
      const raw    = Math.min(1, (now - scrollStart) / SCROLL_DUR)
      // ease-in-out cubic — slow start, fast middle, slow end
      const eased  = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2

      homeScrollTarget = eased * HOME_EXIT_SCROLL

      if (raw < 1) {
        requestAnimationFrame(_scrollStep)
      } else {
        // Scroll journey complete — disc view is visible.
        // Strip the projector CTA text, then hand off to the podium Enter button.
        homeScrollTarget = HOME_EXIT_SCROLL
        setTimeout(() => {
          destroyTextParticles()
          send('podium', 'galaxyReady')
          localStorage.setItem('bec_galaxyReady', String(Date.now()))
        }, DISC_HOLD)
      }
    }

    requestAnimationFrame(_scrollStep)
  }

  // Podium "Enter" button fires the galaxy fly-in on the projector
  const _doEnterGalaxy = () => {
    if (galaxyActive) return
    enterFlyTarget = 17
    enterActive    = true
  }

  onMessage('showGalaxy', _doShowGalaxy)
  onMessage('enterGalaxy', _doEnterGalaxy)

  window.addEventListener('storage', e => {
    if (e.key === 'bec_showGalaxy')   _doShowGalaxy()
    if (e.key === 'bec_enterGalaxy')  _doEnterGalaxy()
  })

  onMessage('transitionToProject', ([idx]) => {
    if (typeof idx === 'number') transitionToProject(idx, idx > activeProjIdx ? 1 : -1)
  })

  // Podium navigation controls — dir is +1 (next) or -1 (prev). Routes to
  // whichever level is actually open: the project overview/description page
  // (if one is showing) or the galaxy card carousel otherwise. Previously
  // this always drove the galaxy's transitionToProject even while the
  // overview was open, which silently desynced projOverviewIdx from
  // activeProjIdx and had no visible effect on the overview page.
  function _podiumNav(dir) {
    if (projOverviewEl) { navigateProjectOverview(dir); return }
    if (!galaxyActive) return
    const N = PROJECT_CARD_DATA.length
    transitionToProject((activeProjIdx + dir + N) % N, dir)
  }

  onMessage('podiumNext', () => _podiumNav(1))
  onMessage('podiumPrev', () => _podiumNav(-1))
  onMessage('podiumBack', () => {
    // "Back to Galaxy" on the podium closes the project overview and returns to the
    // galaxy view (cube spins back, all cubes stay visible).  It does NOT exit the
    // galaxy — exitGalaxyToDisc() is only called when there is no overview open.
    if (projOverviewEl) {
      closeProjectOverview()
    } else if (_projCubeSpinning) {
      // Overview cube is still mid-spin (opening or closing) — queue it so the
      // reverse animation actually plays instead of being dropped by
      // closeProjectOverview's own re-entrancy guard.
      _pendingGalaxyExit = true
    } else if (galaxyActive) {
      exitGalaxyToDisc()
    }
  })
  onMessage('viewCaseStudy', () => {
    if (galaxyActive) openProjectOverview(activeProjIdx)
  })
  onMessage('openVideo', () => {
    const btn = document.getElementById('ov-video-btn')
    if (btn && projOverviewEl) openVideoScreen(projOverviewIdx >= 0 ? projOverviewIdx : activeProjIdx, btn)
    else if (_projCubeSpinning) _pendingMediaAction = 'video'
  })
  onMessage('openProto', () => {
    const btn = document.getElementById('ov-proto-btn')
    if (btn && projOverviewEl) openProtoScreen(projOverviewIdx >= 0 ? projOverviewIdx : activeProjIdx, btn)
    else if (_projCubeSpinning) _pendingMediaAction = 'proto'
  })
  onMessage('openGallery', () => {
    const btn = document.getElementById('ov-gallery-btn')
    if (btn && projOverviewEl) openGalleryScreen(projOverviewIdx >= 0 ? projOverviewIdx : activeProjIdx, btn)
    else if (_projCubeSpinning) _pendingMediaAction = 'gallery'
  })
  onMessage('closeCaseStudy', () => {
    if (projOverviewEl) closeProjectOverview()
  })
  onMessage('backToOverview', () => {
    _pendingMediaAction = null   // cancel queued action if user backed out early
    if (videoScreenEl)        closeVideoScreen()
    else if (protoScreenEl)   closeProtoScreen()
    else if (galleryScreenEl) closeGalleryScreen()
    // overview is already visible underneath if none of the above were open
  })
  window.addEventListener('storage', e => {
    if (e.key === 'bec_podiumNext') _podiumNav(1)
    if (e.key === 'bec_podiumPrev') _podiumNav(-1)
    if (e.key === 'bec_podiumBack') {
      if (projOverviewEl) {
        closeProjectOverview()
      } else if (_projCubeSpinning) {
        _pendingGalaxyExit = true
      } else if (galaxyActive) {
        exitGalaxyToDisc()
      }
    }
    if (e.key === 'bec_viewCaseStudy' && galaxyActive) openProjectOverview(activeProjIdx)
    if (e.key === 'bec_openVideo') {
      const btn = document.getElementById('ov-video-btn')
      if (btn && projOverviewEl) openVideoScreen(projOverviewIdx >= 0 ? projOverviewIdx : activeProjIdx, btn)
      else if (_projCubeSpinning) _pendingMediaAction = 'video'
    }
    if (e.key === 'bec_openProto') {
      const btn = document.getElementById('ov-proto-btn')
      if (btn && projOverviewEl) openProtoScreen(projOverviewIdx >= 0 ? projOverviewIdx : activeProjIdx, btn)
      else if (_projCubeSpinning) _pendingMediaAction = 'proto'
    }
    if (e.key === 'bec_openGallery') {
      const btn = document.getElementById('ov-gallery-btn')
      if (btn && projOverviewEl) openGalleryScreen(projOverviewIdx >= 0 ? projOverviewIdx : activeProjIdx, btn)
      else if (_projCubeSpinning) _pendingMediaAction = 'gallery'
    }
    if (e.key === 'bec_closeCaseStudy' && projOverviewEl) closeProjectOverview()
    if (e.key === 'bec_backToOverview') {
      _pendingMediaAction = null
      if (videoScreenEl)        closeVideoScreen()
      else if (protoScreenEl)   closeProtoScreen()
      else if (galleryScreenEl) closeGalleryScreen()
    }
  })
}

// Podium: show the start screen immediately on load
if (ROLE === 'podium') _initPodiumScreen()

function _initPodiumScreen() {
  const W = window.innerWidth
  const H = window.innerHeight

  // ── Styles ────────────────────────────────────────────────────────────────
  const sEl = document.createElement('style')
  sEl.textContent = `
    #ps-wrap {
      position: fixed; inset: 0; z-index: 9998;
      background: #020e0f;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      opacity: 0; transition: opacity 1.1s ease;
    }
    #ps-wrap.ps-in  { opacity: 1; }
    #ps-wrap.ps-out { opacity: 0; transition: opacity 0.7s ease; pointer-events: none; }

    #ps-canvas { position: absolute; inset: 0; }

    #ps-content {
      position: relative; z-index: 2;
      display: flex; flex-direction: column;
      align-items: center; gap: clamp(24px, 4vh, 48px);
      text-align: center;
    }
    .ps-eyebrow {
      font-family: var(--body-font, 'Lexend Giga', sans-serif);
      font-size: clamp(9px, 1.1vw, 12px);
      font-weight: 300;
      letter-spacing: 0.45em;
      text-transform: uppercase;
      color: rgba(0,179,188,0.5);
    }
    #ps-btn {
      font-family: var(--heading-font, 'Lexend Zetta', sans-serif);
      font-size: clamp(16px, 2.4vw, 28px);
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #ffffff;
      background: transparent;
      border: 1.5px solid rgba(0,110,116,0.8);
      padding: clamp(18px, 2.8vh, 32px) clamp(44px, 7vw, 88px);
      cursor: pointer;
      outline: none;
      position: relative;
      transition: border-color 0.4s, box-shadow 0.4s, color 0.4s;
    }
    #ps-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: rgba(0,110,116,0);
      transition: background 0.4s;
    }
    #ps-btn:hover { border-color: #00B3BC; color: #00E5EE; box-shadow: 0 0 48px rgba(0,179,188,0.2); }
    #ps-btn:hover::before { background: rgba(0,110,116,0.12); }
    #ps-btn.ps-pulse {
      animation: ps-glow 2s ease-in-out infinite;
    }
    @keyframes ps-glow {
      0%,100% { border-color: rgba(0,110,116,0.8); box-shadow: 0 0 20px rgba(0,179,188,0.15); }
      50%      { border-color: #00B3BC;             box-shadow: 0 0 70px rgba(0,179,188,0.45); }
    }
    .ps-hint {
      font-family: var(--body-font, 'Lexend Giga', sans-serif);
      font-size: clamp(8px, 0.9vw, 10px);
      letter-spacing: 0.38em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.14);
      transition: color 0.6s;
    }
    #ps-wrap.ps-pulse .ps-hint { color: rgba(0,179,188,0.45); }
  `
  document.head.appendChild(sEl)

  // ── Markup ────────────────────────────────────────────────────────────────
  const wrap = document.createElement('div')
  wrap.id = 'ps-wrap'
  wrap.innerHTML = `
    <canvas id="ps-canvas"></canvas>
    <div id="ps-content">
      <p class="ps-eyebrow">Bangalore Experience Center</p>
      <button id="ps-btn">Start Experience</button>
      <p class="ps-hint">Touch to begin</p>
    </div>
  `
  document.body.appendChild(wrap)
  // stays invisible until personDetected fires

  // ── Square particle field (matches terrain particle aesthetic) ────────────
  const canvas = wrap.querySelector('#ps-canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const TEAL_SHADES = [
    '#006E74', '#005B60', '#007A80', '#004D52',
    '#00B3BC', '#009099', '#003D42', '#00C8D5',
  ]

  const N = 220
  const pts = Array.from({ length: N }, (_, i) => {
    const nearCenter = i < 60   // first 60 start closer to center for "surrounding" effect
    const r = nearCenter ? Math.random() * 0.35 + 0.05 : Math.random()
    const angle = Math.random() * Math.PI * 2
    const spread = nearCenter ? Math.min(W, H) * 0.42 : Math.max(W, H) * 0.7
    return {
      x:     W / 2 + Math.cos(angle) * spread * r,
      y:     H / 2 + Math.sin(angle) * spread * r,
      sz:    2 + Math.random() * 14,
      rot:   Math.random() * Math.PI * 2,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      vr:    (Math.random() - 0.5) * 0.007,
      op:    0.12 + Math.random() * 0.52,
      phase: Math.random() * Math.PI * 2,
      color: TEAL_SHADES[Math.floor(Math.random() * TEAL_SHADES.length)],
    }
  })

  let rafId = null
  function drawFrame(ts) {
    ctx.clearRect(0, 0, W, H)

    pts.forEach(p => {
      // Drift + gentle center pull so particles cluster near the button
      const dx = W / 2 - p.x, dy = H / 2 - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 180) {
        p.vx += (dx / dist) * 0.003
        p.vy += (dy / dist) * 0.003
      }
      p.vx *= 0.995; p.vy *= 0.995   // damping keeps speed bounded

      p.x  += p.vx
      p.y  += p.vy
      p.rot += p.vr

      // Soft wrap at edges
      if (p.x < -p.sz) p.x = W + p.sz
      if (p.x > W + p.sz) p.x = -p.sz
      if (p.y < -p.sz) p.y = H + p.sz
      if (p.y > H + p.sz) p.y = -p.sz

      const breath = 0.72 + 0.28 * Math.sin(ts * 0.00065 + p.phase)

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.op * breath
      ctx.fillStyle   = p.color
      ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz)
      ctx.restore()
    })

    rafId = requestAnimationFrame(drawFrame)
  }
  rafId = requestAnimationFrame(drawFrame)

  // ── TV trigger → pulse the button to invite interaction ───────────────────
  const _onPersonDetected = () => {
    wrap.classList.add('ps-in')          // fade in the whole overlay
    wrap.classList.add('ps-pulse')       // start the glow animation
    document.getElementById('ps-btn')?.classList.add('ps-pulse')
  }
  onMessage('personDetected', _onPersonDetected)
  // localStorage fallback: fires when tv.html is on the same machine / same browser
  window.addEventListener('storage', e => {
    if (e.key === 'bec_personDetected') _onPersonDetected()
  })

  // ── Button click: signal the projector, then just fade out this overlay ────
  document.getElementById('ps-btn').addEventListener('click', () => {
    send('all', 'showGalaxy')
    // localStorage event fires in all OTHER same-origin tabs immediately —
    // reliable cross-tab trigger even when Socket.io hasn't connected yet
    localStorage.setItem('bec_showGalaxy', Date.now())
    cancelAnimationFrame(rafId)
    wrap.classList.remove('ps-in', 'ps-pulse')
    wrap.classList.add('ps-out')
    setTimeout(() => wrap.remove(), 800)
  })
}
