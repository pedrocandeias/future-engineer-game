// Missão: Universidade do Porto
// Single-file side-scrolling platformer for Universidade do Porto recruitment.
// Architecture: update() mutates `state`, draw() renders it, loop() runs both via rAF.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;   // 960
const H = canvas.height;  // 540
const groundY = 480;      // Y coordinate of the ground plane (canvas-space, not world-space)
const levelLength = 4200; // total scrollable world width in pixels
const missionTimeLimit = 120; // seconds available to complete the mission
const assetBase = "assets/transparent_elements";
const GAME_VERSION = "0.5.6"; // manter sincronizado com CHANGELOG.md e com ?v= em index.html

const skillData = [
  { x: 540, name: "CURIOSIDADE", label: "CURIOSIDADE +1", icon: "atom", image: "assets/rewards/analytics.png", color: "#55a7ff" },
  { x: 980, name: "PENSAMENTO CRÍTICO", label: "PENSAMENTO CRÍTICO +1", icon: "math", image: "assets/rewards/problem-solving.png", color: "#a979ff" },
  { x: 1390, name: "COMUNICAÇÃO", label: "COMUNICAÇÃO +1", icon: "book", image: "assets/rewards/communication.png", color: "#5aaeff" },
  { x: 1810, name: "AUTONOMIA", label: "AUTONOMIA +1", icon: "gear", image: "assets/rewards/organization.png", color: "#ffc949" },
  { x: 2230, name: "CRIATIVIDADE", label: "CRIATIVIDADE +1", icon: "draft", image: "assets/rewards/creativity.png", color: "#56d7e8" },
  { x: 2670, name: "CULTURA", label: "CULTURA +1", icon: "flask", image: "assets/rewards/knowledge.png", color: "#ee5252" },
  { x: 3100, name: "COLABORAÇÃO", label: "COLABORAÇÃO +1", icon: "team", image: "assets/rewards/teamwork.png", color: "#ec6fb0" },
  { x: 3510, name: "RESPONSABILIDADE", label: "RESPONSABILIDADE +1", icon: "book", image: "assets/rewards/leadership.png", color: "#6ee381" },
];

// Enemy ("distraction") sprites from assets/enemies/, cycled across the level.
const enemyFiles = [
  "distraction.png", "procrastinator.png", "burnout.png", "stress.png",
  "deadline.png", "info-overload.png", "self-doubt.png", "comparison.png",
  "negative-comments.png", "uncertainty.png", "disconnection.png", "maintenance.png",
];

const avatarOptions = [
  { id: "student", label: "ESTUDANTE", type: "player" },
  { id: "scientist", label: "CIENTISTA", type: "prop", prop: "professor", frames: "scientist" },
  { id: "colleague", label: "COLEGA", type: "prop", prop: "studentBlack", frames: "colleague" },
  { id: "mentor", label: "MENTORA", type: "prop", prop: "studentBlonde", frames: "mentor" },
];
let selectedAvatarIndex = 0;

// Screen 2 (characterSelect): playable-character picker. One idle sprite per
// character folder under assets/personagens/ (normal versions only, not "super").
// Not yet wired into gameplay — only the selection is stored for now.
const characterOptions = [
  { id: "professor", label: "PROFESSOR", image: "assets/personagens/personagem_1/teacher-idle.png", frames: {
    idle: "assets/personagens/personagem_1/teacher-idle.png",
    walk: ["assets/personagens/personagem_1/teacher-step1.png", "assets/personagens/personagem_1/teacher-idle.png"],
    jump: "assets/personagens/personagem_1/teacher-jump.png",
    crouch: "assets/personagens/personagem_1/teacher-crawl.png",
  }, superFrames: {
    idle: "assets/personagens/personagem_1/super-teacher-idle.png",
    walk: ["assets/personagens/personagem_1/super-teacher-step1.png", "assets/personagens/personagem_1/super-teacher-step2.png"],
    jump: "assets/personagens/personagem_1/super-teacher-jump.png",
    crouch: "assets/personagens/personagem_1/teacher-super-crawl.png",
  } },
  { id: "estudante", label: "ESTUDANTE", image: "assets/personagens/personagem_2/student-woman-idle.png", frames: {
    idle: "assets/personagens/personagem_2/student-woman-idle.png",
    walk: ["assets/personagens/personagem_2/student-woman-step1.png", "assets/personagens/personagem_2/student-woman-step2.png"],
    jump: "assets/personagens/personagem_2/student-woman-jump.png",
    crouch: "assets/personagens/personagem_2/student-woman-crawl.png",
  }, superFrames: {
    idle: "assets/personagens/personagem_2/super-student-woman-idle.png",
    walk: ["assets/personagens/personagem_2/super-student-woman-step1.png", "assets/personagens/personagem_2/super-student-woman-step2.png"],
    jump: "assets/personagens/personagem_2/super-student-woman-jump.png",
    crouch: "assets/personagens/personagem_2/super-student-woman-crawl.png",
  } },
  { id: "programador", label: "PROGRAMADOR", image: "assets/personagens/personagem_3/student-man-it-idle.png", frames: {
    idle: "assets/personagens/personagem_3/student-man-it-idle.png",
    walk: ["assets/personagens/personagem_3/student-man-it-step1.png", "assets/personagens/personagem_3/student-man-it-step2.png"],
    jump: "assets/personagens/personagem_3/student-man-it-jump.png",
    crouch: "assets/personagens/personagem_3/student-man-it-crawl.png",
  }, superFrames: {
    idle: "assets/personagens/personagem_3/super-student-man-it-idle.png",
    walk: ["assets/personagens/personagem_3/super-student-man-it-step2.png"],
    jump: "assets/personagens/personagem_3/super-student-man-it-jump.png",
    crouch: "assets/personagens/personagem_3/super-student-man-it-crawl.png",
  } },
  { id: "colega", label: "ESTUDANTE", image: "assets/personagens/personagem_4/student-wheelchair-idle.png", frames: {
    idle: "assets/personagens/personagem_4/student-wheelchair-idle.png",
    walk: ["assets/personagens/personagem_4/student-wheelchair-step1.png", "assets/personagens/personagem_4/student-wheelchair-step2.png"],
    jump: "assets/personagens/personagem_4/student-wheelchair-jump.png",
    crouch: "assets/personagens/personagem_4/student-wheelchair-crawl.png",
  }, superFrames: {
    idle: "assets/personagens/personagem_4/super-student-wheelchair-idle.png",
    walk: ["assets/personagens/personagem_4/super-student-wheelchair-step1.png", "assets/personagens/personagem_4/super-student-wheelchair-step2.png"],
    jump: "assets/personagens/personagem_4/super-student-wheelchair-jump.png",
    crouch: "assets/personagens/personagem_4/super-student-wheelchair-crawl.png",
  } },
  { id: "caloiro", label: "CALOIRO", image: "assets/personagens/personagem_5/student-man-2-idle.png", frames: {
    idle: "assets/personagens/personagem_5/student-man-2-idle.png",
    walk: ["assets/personagens/personagem_5/student-man-2-step1.png", "assets/personagens/personagem_5/student-man-2-step2.png"],
    jump: "assets/personagens/personagem_5/student-man-2-jump.png",
    crouch: "assets/personagens/personagem_5/student-man-2-crawl.png",
  }, superFrames: {
    idle: "assets/personagens/personagem_5/super-student-man-2-idle.png",
    walk: ["assets/personagens/personagem_5/super-student-man-2-step1.png", "assets/personagens/personagem_5/super-student-man-2-step2.png"],
    jump: "assets/personagens/personagem_5/super-student-man-2-jump.png",
    crouch: "assets/personagens/personagem_5/super-student-man-2-crawl.png",
  } },
];
let selectedCharacterIndex = 0;

const facultyLevels = [
  { label: "ARQUITETURA", name: "Faculdade de Arquitetura", color: "#56d7e8" },
  { label: "BELAS ARTES", name: "Faculdade de Belas Artes", color: "#ec6fb0" },
  { label: "CIÊNCIAS", name: "Faculdade de Ciências", color: "#55a7ff" },
  { label: "NUTRIÇÃO", name: "Faculdade de Ciências da Nutrição e da Alimentação", color: "#6ee381" },
  { label: "DESPORTO", name: "Faculdade de Desporto", color: "#ffc949" },
  { label: "DIREITO", name: "Faculdade de Direito", color: "#a979ff" },
  { label: "ECONOMIA", name: "Faculdade de Economia", color: "#56d7e8" },
  { label: "ENGENHARIA", name: "Faculdade de Engenharia", color: "#ffc949" },
  { label: "FARMÁCIA", name: "Faculdade de Farmácia", color: "#6ee381" },
  { label: "LETRAS", name: "Faculdade de Letras", color: "#5aaeff" },
  { label: "MEDICINA", name: "Faculdade de Medicina", color: "#ee5252" },
  { label: "MED. DENTÁRIA", name: "Faculdade de Medicina Dentária", color: "#f2f7ff" },
  { label: "PSICOLOGIA", name: "Faculdade de Psicologia e de Ciências da Educação", color: "#ec6fb0" },
  { label: "ICBAS", name: "Instituto de Ciências Biomédicas Abel Salazar (ICBAS)", color: "#a979ff" },
  { label: "ENFERMAGEM", name: "Escola Superior de Enfermagem", color: "#6ee381" },
];
let selectedFacultyIndex = 0;

// Screen 3 (levelSelect): 7 levels, each represented purely by its scenario
// props (from assets/cenarios/<level>/), excluding structural pieces
// (parede/chão/tecto). No on-screen text names the level — the props identify it.
// A prop is either a "path" string or { src, front, scale } — `front` draws it
// on top of the others (foreground) and `scale` grows it relative to the card.
const levelData = [
  { id: "arquitetura", label: "ARQUITETURA", name: "Faculdade de Arquitetura", color: "#56d7e8", props: ["assets/cenarios/arquitectura/mesa-arquiectura.png", { src: "assets/cenarios/arquitectura/maqueta-arquitectura.png", scale: 1.4 }, "assets/cenarios/arquitectura/diagrama-arquitectura.png", "assets/cenarios/arquitectura/quadro-arquitectura.png"] },
  { id: "artes", label: "BELAS ARTES", name: "Faculdade de Belas Artes", color: "#ec6fb0", props: ["assets/cenarios/artes/cavalete-1-artes.png", "assets/cenarios/artes/busto-artes.png", "assets/cenarios/artes/quadro-artes.png"] },
  { id: "desporto", label: "DESPORTO", name: "Faculdade de Desporto", color: "#ffc949", props: ["assets/cenarios/desporto/trofeus-desporto.png", "assets/cenarios/desporto/bolas-desporto.png", "assets/cenarios/desporto/cafico-desporto.png"] },
  { id: "direito", label: "DIREITO", name: "Faculdade de Direito", color: "#a979ff", props: ["assets/cenarios/direito/estante-direito.png", "assets/cenarios/direito/sofa-direito.png", "assets/cenarios/direito/quadro-direito.png"] },
  { id: "engenharia", label: "ENGENHARIA", name: "Faculdade de Engenharia", color: "#ffc949", props: [{ src: "assets/cenarios/engenharia/braco-engenharia.png", front: true, scale: 1.12 }, "assets/cenarios/engenharia/ferramentas-engenharia.png", "assets/cenarios/engenharia/diagrama-engenharia.png"] },
  { id: "letras", label: "LETRAS", name: "Faculdade de Letras", color: "#5aaeff", props: ["assets/cenarios/letras/estante-sociais.png", "assets/cenarios/letras/busto-sociais.png", "assets/cenarios/letras/quadro-sociais.png"] },
  { id: "medicina", label: "MEDICINA", name: "Faculdade de Medicina", color: "#ee5252", props: [{ src: "assets/cenarios/medicina/maca-medicina.png", front: true, scale: 1.22 }, "assets/cenarios/medicina/quadro-2-medicina.png", "assets/cenarios/medicina/quadro-medicina.png"] },
];
let selectedLevelIndex = 0;

// In-game scenery per level: wide wall/floor/ceiling strips (tiled) plus prop
// lists scattered along the corridor. `folder` is under assets/cenarios/; npc
// files are under assets/npc/. Loaded lazily per level via getScene().
const sceneData = {
  arquitetura: { folder: "arquitectura", ceiling: "tecto-arquitectura.png", wall: "corredor-arquitectura.png", floor: "chao-arquitectura.png",
    doors: ["porta-arquitectura.png", "porta-2-arquitectura.png", "porta-3-arquitectura.png"], windows: ["janela-arquitectura.png"],
    wallArt: ["diagrama-arquitectura.png", "quadro-arquitectura.png"], floorProps: ["mesa-arquiectura.png", "maqueta-arquitectura.png", "planta-arquitectura.png"], npcs: ["architect-man.png", "architect-woman.png"] },
  artes: { folder: "artes", ceiling: "tecto-artes.png", wall: "parede-artes.png", floor: "chao-artes.png",
    doors: ["porta-artes.png", "porta-2-artes.png", "porta-3-artes.png"], windows: ["janela-2-artes.png"],
    wallArt: ["quadro-artes.png", "quadro-2-artes.png", "quadro-3-artes.png"], floorProps: ["cavalete-1-artes.png", "busto-artes.png", "busto-2-artes.png", "estante-artes.png", "planta-artes.png"], npcs: ["arts-man.png", "arts-woman.png"] },
  desporto: { folder: "desporto", ceiling: "tecto-desporto.png", wall: "parede-desporto.png", floor: "chao-desporto.png",
    doors: ["porta-desporto.png", "porta-2-desporto.png", "porta-3-desporto.png"], windows: ["janela-desporto.png"],
    wallArt: ["quadro-desporto.png"], floorProps: ["trofeus-desporto.png", "bolas-desporto.png", "cafico-desporto.png", "banco-desporto.png"], npcs: ["student-man.png", "student-woman.png"] },
  direito: { folder: "direito", ceiling: "tecto-direito.png", wall: "parede-direito.png", floor: "chao-direito.png",
    doors: ["porta-direito.png", "porta-1-direito.png", "portas-direito.png"], windows: ["janela-direito.png"],
    wallArt: ["quadro-direito.png", "quadro-2-direito.png"], floorProps: ["estante-direito.png", "sofa-direito.png", "planta-direito.png"], npcs: ["office-man.png", "office-woman.png"] },
  engenharia: { folder: "engenharia", ceiling: "tecto-engenharia.png", wall: "paredes-engenharia.png", floor: "chao-engenharia.png",
    doors: ["portas-engenharia.png", "portas-2-engenharia.png", "porta-2-engenharia.png"], windows: ["janela-engenharia.png"],
    wallArt: ["diagrama-engenharia.png", "sinal-engenharia.png"], floorProps: ["braco-engenharia.png", "ferramentas-engenharia.png", "ferramentas-2-engenharia.png", "cafico-engenharia.png"], npcs: ["eng-man.png", "eng-woman.png"] },
  letras: { folder: "letras", ceiling: "tecto-sociais.png", wall: "parede-sociais.png", floor: "chão-sociais.png",
    doors: ["porta-sociais.png", "porta-2-sociais.png", "portas-sociais.png"], windows: ["janela-sociais.png"],
    wallArt: ["quadro-sociais.png", "quadro-2-sociais.png"], floorProps: ["estante-sociais.png", "busto-sociais.png", "planta-sociais.png", "agua-sociais.png"], npcs: ["teacher-man.png", "teacher-woman.png"] },
  medicina: { folder: "medicina", ceiling: "tecto-medicina.png", wall: "paredes-medicina.png", floor: "chao-medicina.png",
    doors: ["porta-medicina.png", "porta-2-medicina.png", "portas-medicina.png"], windows: ["janela-medicina.png"],
    wallArt: ["quadro-medicina.png", "quadro-2-medicina.png", "luz-medicina.png"], floorProps: ["maca-medicina.png", "extintor-medicina.png"], npcs: ["doctor-man.png", "doctor-woman.png", "nurse-man.png", "nurse-woman.png"] },
};

// The whole cast of NPCs — used to decorate every level (not tied to a theme).
const allNpcFiles = [
  "accountant-man.png", "accountant-woman.png", "architect-man.png", "architect-woman.png",
  "arts-man.png", "arts-woman.png", "doctor-man.png", "doctor-woman.png", "eng-man.png",
  "eng-woman.png", "it-woman.png", "nurse-man.png", "nurse-woman.png", "office-man.png",
  "office-woman.png", "student-man.png", "student-woman.png", "teacher-man.png", "teacher-woman.png",
];

const avatarFrameFiles = {
  idle: ["idle.png"],
  walk: ["walk_01.png", "walk_02.png"],
  jump: ["jump.png"],
  crouch: ["crouch.png"],
};

const elementFiles = {
  character: {
    idle: [`${assetBase}/characters/main_idle_01.png`],
    walk: [
      `${assetBase}/characters/main_walk_01.png`,
      `${assetBase}/characters/main_walk_02.png`,
      `${assetBase}/characters/main_walk_01.png`,
    ],
    run: [
      `${assetBase}/characters/main_walk_01.png`,
      `${assetBase}/characters/main_walk_02.png`,
      `${assetBase}/characters/main_walk_01.png`,
    ],
    jump: [`${assetBase}/characters/main_jump_01.png`],
    crouch: [`${assetBase}/characters/main_crouch_01.png`],
  },
  props: {
    doorGlass: `${assetBase}/doors/door_double_glass.png`,
    doorBlue: `${assetBase}/windows/door_double_blue.png`,
    doorWoodGlass: `${assetBase}/doors/door_wood_01.png`,
    doorWood: `${assetBase}/doors/door_wood_02.png`,
    doorGreen: `${assetBase}/doors/door_green.png`,
    keypad: `${assetBase}/doors/wall_switch.png`,
    windowSingle: `${assetBase}/windows/window_single.png`,
    windowDouble: `${assetBase}/windows/window_double.png`,
    windowPlant: `${assetBase}/windows/window_with_plant.png`,
    plant1: `${assetBase}/plants/plant_potted_brown.png`,
    plant2: `${assetBase}/plants/plant_potted_gray.png`,
    plant3: `${assetBase}/plants/plant_potted_brown.png`,
    professor: `${assetBase}/npcs/character_scientist.png`,
    worker: `${assetBase}/npcs/character_worker.png`,
    studentBlonde: `${assetBase}/npcs/character_woman.png`,
    studentBlack: `${assetBase}/npcs/character_student_black.png`,
    universityMainSign: `${assetBase}/signs/universidade_porto_main_sign.png`,
    universitySign: `${assetBase}/signs/universidade_porto_sign.png`,
    certificate: `${assetBase}/decor/certificate_frame.png`,
    extinguisher: `${assetBase}/wall_objects/fire_extinguisher.png`,
    fireSign: `${assetBase}/wall_objects/fire_extinguisher_sign.png`,
    fireExtinguisherSign: `${assetBase}/signs/fire_extinguisher_sign.png`,
    electricPanel: `${assetBase}/wall_objects/electrical_panel.png`,
    computerDesk: `${assetBase}/lab_office/computer_cabinet.png`,
    computerTower: `${assetBase}/lab_office/computer_tower.png`,
    officeDesk: `${assetBase}/lab_office/office_desk_computer.png`,
    officeChair: `${assetBase}/lab_office/office_chair.png`,
    deskLamp: `${assetBase}/lab_office/desk_lamp.png`,
    flask1: `${assetBase}/lab_office/lab_flask_01.png`,
    flask2: `${assetBase}/lab_office/lab_flask_02.png`,
    flask3: `${assetBase}/lab_office/lab_flask_03.png`,
    testTubes: `${assetBase}/lab_office/test_tubes.png`,
    tube: `${assetBase}/lab_office/tube_01.png`,
    whiteboard: `${assetBase}/lab_office/whiteboard.png`,
    bookshelf: `${assetBase}/lab_office/bookshelf.png`,
    wallPanel: `${assetBase}/scene/wall_tile_panel.png`,
    floorStrip: `${assetBase}/scene/floor_tile_strip.png`,
    cabinet: `${assetBase}/lab_office/computer_tower.png`,
    trashBin: `${assetBase}/wall_objects/electrical_panel.png`,
  },
};

// Intro splash: a photographic background with a decorative row of NPC
// students/professionals from `assets/npc/` that fade in one by one.
const introBackgroundFile = "assets/intro/introbackground.png";
// `null` keeps a slot's space empty (the row stays evenly spaced, no reflow).
const introNpcFiles = [
  "assets/npc/student-woman_right.png",
  "assets/npc/architect-man_right.png",
  "assets/npc/doctor-woman_right.png",
  null,
  "assets/npc/arts-woman.png",
  "assets/npc/teacher-man.png",
  "assets/npc/nurse-woman.png",
];
const introWelcomeHeader = "BEM-VINDO!";
const introWelcomeBody = "Explora a Universidade do Porto, conhece pessoas, coleciona skills e começa a construir o teu futuro.";

const keys = new Set();
const touchActions = {
  left: false,
  right: false,
  jump: false,
  crouch: false,
};
const assets = loadAssets();
let state;

const KONAMI = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
const cheatBuffer = [];
let godMode = false;

function selectAvatar(direction) {
  selectedAvatarIndex = (selectedAvatarIndex + direction + avatarOptions.length) % avatarOptions.length;
}

function selectCharacter(direction) {
  selectedCharacterIndex = (selectedCharacterIndex + direction + characterOptions.length) % characterOptions.length;
}

function selectLevel(direction) {
  selectedLevelIndex = (selectedLevelIndex + direction + levelData.length) % levelData.length;
}

function selectFaculty(direction) {
  selectedFacultyIndex = (selectedFacultyIndex + direction + facultyLevels.length) % facultyLevels.length;
}

function loadAssets() {
  const loaded = {
    character: loadImage(`${assetBase}/characters/main_run_03.png`),
    characterFrames: {},
    avatarFrames: {},
    props: {},
    skills: {},
  };

  for (const skill of skillData) {
    loaded.skills[skill.image] = loadImage(skill.image); // full path (assets/rewards/…)
  }
  loaded.enemies = {};
  for (const file of enemyFiles) {
    loaded.enemies[file] = loadImage(`assets/enemies/${file}`);
  }
  for (const [name, frames] of Object.entries(elementFiles.character)) {
    loaded.characterFrames[name] = frames.map((src) => loadImage(src));
  }
  for (const avatar of avatarOptions) {
    if (!avatar.frames) continue;
    loaded.avatarFrames[avatar.frames] = {};
    for (const [stateName, files] of Object.entries(avatarFrameFiles)) {
      loaded.avatarFrames[avatar.frames][stateName] = files.map((file) => loadImage(`${assetBase}/avatar_frames/${avatar.frames}/${file}`));
    }
  }
  for (const [name, src] of Object.entries(elementFiles.props)) {
    loaded.props[name] = loadImage(src);
  }
  loaded.intro = {
    background: loadImage(introBackgroundFile),
    npcs: introNpcFiles.map((src) => (src ? loadImage(src) : null)),
  };
  const loadFrameSet = (frames) => ({
    idle: loadImage(frames.idle),
    walk: frames.walk.map(loadImage),
    jump: loadImage(frames.jump),
    crouch: loadImage(frames.crouch),
  });
  loaded.playCharacters = characterOptions.map((option) => ({
    ...loadFrameSet(option.frames),
    super: loadFrameSet(option.superFrames), // used while god mode (Konami) is active
  }));
  loaded.characterSelect = loaded.playCharacters.map((set) => set.idle); // reuse the idle frames
  loaded.npcPool = allNpcFiles.map((file) => loadImage(`assets/npc/${file}`));
  loaded.levelProps = levelData.map((level) => level.props.map((prop) => loadImage(typeof prop === "string" ? prop : prop.src)));

  return loaded;
}

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

// `complete` is true even for broken images (404), so naturalWidth guards against that.
function imageReady(image) {
  return image && image.complete && image.naturalWidth > 0;
}

/**
 * Draw a named prop asset, calling `fallback` if the image hasn't loaded yet.
 * @param {string} name - key in assets.props
 * @param {number} x - left edge in world-space (call within a camera-translated save/restore)
 * @param {number} y - top edge
 * @param {number} width - render width
 * @param {number} height - render height
 * @param {Function} [fallback] - canvas drawing fallback when image is unavailable
 */
function drawAsset(name, x, y, width, height, fallback) {
  const image = assets.props[name];
  if (imageReady(image)) {
    drawImageClean(image, x, y, width, height);
    return;
  }
  if (fallback) fallback();
}

/**
 * Like drawAsset but anchors to the bottom edge — useful for characters and doors that
 * sit on the ground so their base aligns with groundY regardless of sprite height.
 * @param {string} name
 * @param {number} x
 * @param {number} bottomY - Y of the bottom edge (typically groundY)
 * @param {number} width
 * @param {number} height
 * @param {Function} [fallback]
 */
function drawAssetBottom(name, x, bottomY, width, height, fallback) {
  drawAsset(name, x, bottomY - height, width, height, fallback);
}

/**
 * Draw an image cropping optional pixels from the right/bottom edges.
 * Crop parameters trim transparent edge padding baked into some sprite sheets.
 * @param {HTMLImageElement} image
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} [cropRight=0]
 * @param {number} [cropBottom=0]
 */
function drawImageClean(image, x, y, width, height, cropRight = 0, cropBottom = 0) {
  const sourceWidth = Math.max(1, image.naturalWidth - cropRight);
  const sourceHeight = Math.max(1, image.naturalHeight - cropBottom);
  ctx.drawImage(image, 0, 0, sourceWidth, sourceHeight, x, y, width, height);
}

function reset() {
  state = {
    mode: "intro",
    camera: 0,
    time: 0,
    toast: null,
    scorePulse: 0,
    lives: 3,
    invincible: 0,
    gameoverReason: null,
    player: {
      x: 80,
      y: groundY - 68,
      w: 42,
      h: 68,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: true,
      crouching: false,
      step: 0,
    },
    skills: skillData.map((skill) => ({ ...skill, y: groundY - 118, taken: false })),
    particles: [],
    winStartTime: 0,
    // low kinds (y = groundY-55): player must jump over
    // high kinds (y = groundY-105): player must crouch under
    distractions: [
      { startX: 700,  x: 700,  y: groundY -  55, w: 44, h: 44, vx: 1.4, dir:  1, range: 100, kind: "phone" },
      { startX: 860,  x: 860,  y: groundY - 105, w: 44, h: 44, vx: 1.2, dir: -1, range:  90, kind: "sleep" },
      { startX: 1080, x: 1080, y: groundY -  55, w: 44, h: 44, vx: 1.6, dir:  1, range: 100, kind: "heart" },
      { startX: 1260, x: 1260, y: groundY - 105, w: 44, h: 44, vx: 1.3, dir: -1, range:  90, kind: "chat"  },
      { startX: 1500, x: 1500, y: groundY -  55, w: 44, h: 44, vx: 1.8, dir:  1, range: 100, kind: "phone" },
      { startX: 1670, x: 1670, y: groundY - 105, w: 44, h: 44, vx: 1.4, dir: -1, range:  90, kind: "sleep" },
      { startX: 1930, x: 1930, y: groundY -  55, w: 44, h: 44, vx: 1.5, dir:  1, range: 100, kind: "heart" },
      { startX: 2090, x: 2090, y: groundY - 105, w: 44, h: 44, vx: 1.6, dir: -1, range:  90, kind: "chat"  },
      { startX: 2340, x: 2340, y: groundY -  55, w: 44, h: 44, vx: 2.0, dir:  1, range: 100, kind: "phone" },
      { startX: 2510, x: 2510, y: groundY - 105, w: 44, h: 44, vx: 1.7, dir: -1, range:  90, kind: "sleep" },
      { startX: 2800, x: 2800, y: groundY -  55, w: 44, h: 44, vx: 1.8, dir:  1, range: 100, kind: "heart" },
      { startX: 2970, x: 2970, y: groundY - 105, w: 44, h: 44, vx: 2.0, dir: -1, range:  90, kind: "chat"  },
    ],
  };
  // Assign an enemy sprite to each distraction, cycling through the set.
  state.distractions.forEach((d, i) => { d.enemy = enemyFiles[i % enemyFiles.length]; });
}

reset();

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
    event.preventDefault();
  }
  if (state.mode === "avatarSelect" && key === "arrowleft") {
    selectAvatar(-1);
    return;
  }
  if (state.mode === "avatarSelect" && key === "arrowright") {
    selectAvatar(1);
    return;
  }
  if (state.mode === "characterSelect" && key === "arrowleft") {
    selectCharacter(-1);
    return;
  }
  if (state.mode === "characterSelect" && key === "arrowright") {
    selectCharacter(1);
    return;
  }
  if (state.mode === "levelSelect" && key === "arrowleft") {
    selectLevel(-1);
    return;
  }
  if (state.mode === "levelSelect" && key === "arrowright") {
    selectLevel(1);
    return;
  }
  if (state.mode === "levelSelect" && key === "arrowup") {
    selectLevel(-4);
    return;
  }
  if (state.mode === "levelSelect" && key === "arrowdown") {
    selectLevel(4);
    return;
  }
  if (state.mode === "facultySelect" && key === "arrowleft") {
    selectFaculty(-1);
    return;
  }
  if (state.mode === "facultySelect" && key === "arrowright") {
    selectFaculty(1);
    return;
  }
  if (state.mode === "facultySelect" && key === "arrowup") {
    selectFaculty(-5);
    return;
  }
  if (state.mode === "facultySelect" && key === "arrowdown") {
    selectFaculty(5);
    return;
  }
  if (event.key === "Enter") {
    if (state.mode === "intro") goToCharacterSelect();
    else if (state.mode === "characterSelect") goToLevelSelect();
    else if (state.mode === "levelSelect" || state.mode === "won" || state.mode === "gameover") resetGameToPlaying();
  }

  cheatBuffer.push(key);
  if (cheatBuffer.length > KONAMI.length) cheatBuffer.shift();
  if (cheatBuffer.join(",") === KONAMI.join(",")) {
    godMode = !godMode;
    state.toast = { title: godMode ? "★ MODO INVENCÍVEL ATIVADO" : "MODO INVENCÍVEL DESATIVADO", body: godMode ? "Invencível!" : "De volta ao normal.", ttl: 150 };
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

canvas.addEventListener("pointerdown", (event) => {
  if (state.mode === "intro" || state.mode === "characterSelect" || state.mode === "levelSelect" || state.mode === "won" || state.mode === "gameover") {
    event.preventDefault();
    if (state.mode === "intro") {
      const point = getCanvasPoint(event);
      const rect = getIntroButtonRect();
      if (point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h) {
        goToCharacterSelect();
      }
      return;
    }
    if (state.mode === "characterSelect") {
      const point = getCanvasPoint(event);
      const pickedIndex = getCharacterPickerRects().findIndex((rect) => {
        return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
      });
      if (pickedIndex >= 0) {
        selectedCharacterIndex = pickedIndex;
        return;
      }
      const button = getCharacterButtonRect();
      if (point.x >= button.x && point.x <= button.x + button.w && point.y >= button.y && point.y <= button.y + button.h) {
        goToLevelSelect();
      }
      return;
    }
    if (state.mode === "levelSelect") {
      const point = getCanvasPoint(event);
      const pickedIndex = getLevelPickerRects().findIndex((rect) => {
        return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
      });
      if (pickedIndex >= 0) {
        selectedLevelIndex = pickedIndex;
        return;
      }
      const button = getLevelButtonRect();
      if (point.x >= button.x && point.x <= button.x + button.w && point.y >= button.y && point.y <= button.y + button.h) {
        resetGameToPlaying();
      }
      return;
    }
    resetGameToPlaying();
  }
});

for (const button of document.querySelectorAll("[data-action]")) {
  const action = button.dataset.action;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (action === "start") {
      if (state.mode === "intro") goToCharacterSelect();
      else if (state.mode === "characterSelect") goToLevelSelect();
      else if (state.mode === "levelSelect" || state.mode === "won" || state.mode === "gameover") resetGameToPlaying();
      return;
    }
    if (state.mode === "characterSelect" && (action === "left" || action === "right")) {
      selectCharacter(action === "left" ? -1 : 1);
      return;
    }
    if (state.mode === "levelSelect" && (action === "left" || action === "right")) {
      selectLevel(action === "left" ? -1 : 1);
      return;
    }
    if (state.mode === "facultySelect" && (action === "left" || action === "right")) {
      selectFaculty(action === "left" ? -1 : 1);
      return;
    }
    touchActions[action] = true;
    button.classList.add("is-pressed");
  });

  const release = (event) => {
    event.preventDefault();
    if (action !== "start") touchActions[action] = false;
    button.classList.remove("is-pressed");
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", () => {
    if (action !== "start") touchActions[action] = false;
    button.classList.remove("is-pressed");
  });
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}

function goToCharacterSelect() {
  state.mode = "characterSelect";
}

function goToLevelSelect() {
  state.mode = "levelSelect";
}

function goToAvatarSelect() {
  state.mode = "avatarSelect";
}

function goToFacultySelect() {
  state.mode = "facultySelect";
}

function resetGameToPlaying() {
  reset();
  state.mode = "playing";
  getScene(levelData[selectedLevelIndex].id); // warm the chosen level's scenery
  state.toast = { title: "MISSÃO INICIADA!", body: levelData[selectedLevelIndex].name, ttl: 200 };
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H,
  };
}

function actionActive(action) {
  if (touchActions[action]) return true;
  if (action === "left") return keys.has("arrowleft") || keys.has("a");
  if (action === "right") return keys.has("arrowright") || keys.has("d");
  if (action === "jump") return keys.has(" ") || keys.has("arrowup") || keys.has("w");
  if (action === "crouch") return keys.has("arrowdown") || keys.has("s");
  return false;
}

function update() {
  state.time += 1 / 60;

  if (state.mode === "won") {
    const elapsed = (state.time - state.winStartTime) * 60;
    if (Math.floor(elapsed) % 55 === 0) spawnBurst(80 + Math.random() * (W - 160), 60 + Math.random() * 200);
    if (Math.random() < 0.3) spawnConfetti();
    for (const p of state.particles) {
      p.x += p.vx; p.y += p.vy;
      if (!p.confetti) p.vy += 0.12;
      p.life--;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    return;
  }

  if (state.mode !== "playing") return;

  const p = state.player;
  const left = actionActive("left");
  const right = actionActive("right");
  const jump = actionActive("jump");
  const crouch = actionActive("crouch");

  if (p.grounded) {
    if (crouch && !p.crouching) { p.crouching = true; p.h = 35; }
    else if (!crouch && p.crouching) { p.crouching = false; p.h = 68; }
  }

  p.vx = 0;
  if (left) p.vx -= 4.2;
  if (right) p.vx += 4.2;
  if (p.vx !== 0) p.facing = Math.sign(p.vx);

  if (jump && p.grounded && !p.crouching) {
    p.vy = -12;
    p.grounded = false;
  }

  p.vy += 0.62; // gravity per frame
  p.x = Math.max(30, Math.min(levelLength - 110, p.x + p.vx));
  p.y += p.vy;

  if (p.y + p.h >= groundY) {
    p.y = groundY - p.h;
    p.vy = 0;
    p.grounded = true;
  }

  p.step += Math.abs(p.vx) * 0.18; // animation phase accumulator, not a frame index
  // Keep player at ~36% from left so there's room to see ahead while moving right.
  state.camera = Math.max(0, Math.min(levelLength - W, p.x - W * 0.36));

  for (const skill of state.skills) {
    if (!skill.taken && intersects(p, { x: skill.x - 28, y: skill.y - 28, w: 56, h: 56 })) {
      skill.taken = true;
      state.scorePulse = 18;
      state.toast = { title: "COMPETÊNCIA ADQUIRIDA!", body: skill.label, ttl: 125 };
    }
  }

  for (const d of state.distractions) {
    d.x += d.vx * d.dir;
    if (d.x >= d.startX + d.range) d.dir = -1;
    if (d.x <= d.startX) d.dir = 1;
  }

  if (state.invincible <= 0 && !godMode) {
    for (const d of state.distractions) {
      if (intersects(p, d)) {
        state.lives -= 1;
        state.invincible = 120; // 2 seconds of invincibility at 60 fps prevents multi-hit on the same distraction
        p.x = Math.max(80, d.startX - 200);
        p.y = groundY - 68;
        p.h = 68;
        p.crouching = false;
        p.vx = 0;
        p.vy = 0;
        if (state.lives <= 0) {
          state.mode = "gameover";
          state.gameoverReason = "distractions";
        } else {
          state.toast = { title: "DISTRAÇÃO!", body: "Mantém o foco na tua missão!", ttl: 140 };
        }
        break;
      }
    }
  }
  state.invincible = Math.max(0, state.invincible - 1);

  if (state.toast) {
    state.toast.ttl -= 1;
    if (state.toast.ttl <= 0) state.toast = null;
  }

  state.scorePulse = Math.max(0, state.scorePulse - 1);
  const allSkillsTaken = state.skills.every((skill) => skill.taken);
  if (!allSkillsTaken && state.time >= missionTimeLimit) {
    state.mode = "gameover";
    state.gameoverReason = "time";
    state.toast = null;
    return;
  }
  if (allSkillsTaken) {
    state.mode = "won";
    state.winStartTime = state.time;
    for (let i = 0; i < 6; i++) spawnBurst(W * (0.1 + i * 0.16), 80 + Math.random() * 200);
  }
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  if (state.mode === "intro") {
    drawIntro();
    drawFrameEffects();
    return;
  }

  if (state.mode === "characterSelect") {
    drawCharacterSelect();
    drawFrameEffects();
    return;
  }

  if (state.mode === "levelSelect") {
    drawLevelSelect();
    drawFrameEffects();
    return;
  }

  if (state.mode === "title") {
    drawTitle();
    drawFrameEffects();
    return;
  }

  if (state.mode === "avatarSelect") {
    drawAvatarSelect();
    drawFrameEffects();
    return;
  }

  if (state.mode === "facultySelect") {
    drawFacultySelect();
    drawFrameEffects();
    return;
  }

  drawLevel();
  drawDistractions();
  drawSkills();
  drawPlayer();
  drawHud();
  drawToast();
  if (state.mode === "won") { drawParticles(); drawWin(); }
  if (state.mode === "gameover") drawGameOver();
  drawFrameEffects();
}

/** Screen-space rect of the "Começar quest!" start button on the intro screen. */
function getIntroButtonRect() {
  const box = getWelcomeBoxRect();
  const w = 320;
  const h = 58;
  return { x: W / 2 - w / 2, y: box.y + box.h + 14, w, h };
}

/**
 * Intro splash: photographic background, "U.Porto Quest" title, a row of NPC
 * characters that fade in one after another, and the start button.
 */
function drawIntro() {
  const bg = assets.intro.background;
  if (imageReady(bg)) {
    drawImageClean(bg, 0, 0, W, H);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a1830");
    grad.addColorStop(1, "#04264a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }
  drawIntroNpcs();

  drawIntroTitle();
  drawWelcomeBox();

  drawIntroButton();

  // Etiqueta de versão discreta no canto.
  pixelText(`v${GAME_VERSION}`, W - 14, 22, 14, "rgba(223, 244, 255, 0.65)", "right");
}

/**
 * Blocky, two-tone "U.PORTO QUEST" title with a black outline and an extruded
 * 3D shadow — an approximation of a chunky arcade/pixel logo font.
 */
function drawIntroTitle() {
  drawBlockText(
    [
      { text: "U.PORTO", color: "#f0e4cc" },
      { text: "QUEST", color: "#f6a41e" },
    ],
    W / 2,
    76,
    54,
  );
}

/**
 * Draw a row of coloured word segments as one centred, chunky title.
 * @param {{text:string,color:string}[]} segments
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} size - font size in px (auto-shrunk to fit the canvas width)
 */
function drawBlockText(segments, centerX, centerY, size) {
  ctx.save();
  const setFont = (s) => { ctx.font = `800 ${s}px "Arial Black", Impact, "Helvetica Neue", Arial, sans-serif`; };
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  setFont(size);
  let gap = size * 0.3;
  let widths = segments.map((s) => ctx.measureText(s.text).width);
  let total = widths.reduce((a, b) => a + b, 0) + gap * (segments.length - 1);
  const maxWidth = W - 70;
  if (total > maxWidth) {
    size *= maxWidth / total;
    setFont(size);
    gap = size * 0.3;
    widths = segments.map((s) => ctx.measureText(s.text).width);
    total = widths.reduce((a, b) => a + b, 0) + gap * (segments.length - 1);
  }

  const left = centerX - total / 2;
  const depth = Math.max(3, Math.round(size * 0.11));
  ctx.lineJoin = "round";

  // Extruded 3D shadow: stack offset copies of the whole line.
  ctx.fillStyle = "#1b140e";
  for (let d = depth; d >= 1; d -= 1) {
    let x = left;
    for (let i = 0; i < segments.length; i += 1) {
      ctx.fillText(segments[i].text, x + d, centerY + d);
      x += widths[i] + gap;
    }
  }

  // Black outline + coloured fill per segment.
  let x = left;
  ctx.lineWidth = Math.max(3, Math.round(size * 0.1));
  ctx.strokeStyle = "#120c08";
  for (let i = 0; i < segments.length; i += 1) {
    ctx.strokeText(segments[i].text, x, centerY);
    ctx.fillStyle = segments[i].color;
    ctx.fillText(segments[i].text, x, centerY);
    x += widths[i] + gap;
  }
  ctx.restore();
}

/** Geometry of the welcome dialog box (shared by the drawer and the button layout). */
function getWelcomeBoxRect() {
  const w = 560;
  const padX = 26;
  const padTop = 22;
  const bodySize = 16;
  const lineH = 21;
  const lines = wrapText(introWelcomeBody, w - padX * 2, bodySize);
  const h = padTop + 22 + 2 + lines.length * lineH + 2 + 18 + 4;
  return { x: W / 2 - w / 2, y: 142, w, h, padX, padTop, bodySize, lineH, lines };
}

/** "BEM-VINDO!" dialog panel with wrapped body text and a small graduation cap. */
function drawWelcomeBox() {
  const box = getWelcomeBoxRect();
  drawPixelPanel(box.x, box.y, box.w, box.h, 12);

  pixelText(introWelcomeHeader, box.x + box.padX, box.y + box.padTop + 8, 18, "#ff7ab0", "left");

  let ty = box.y + box.padTop + 22 + 2 + box.lineH / 2;
  for (const line of box.lines) {
    pixelText(line, box.x + box.padX, ty, box.bodySize, "#e7eef7", "left");
    ty += box.lineH;
  }

  drawGraduationCap(W / 2, box.y + box.h - 12, 18);
}

/** Break `text` into lines that fit `maxWidth` at the pixel-text font of `size`. */
function wrapText(text, maxWidth, size) {
  ctx.font = `700 ${size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Small decorative graduation cap (mortarboard) centred at (cx, cy). */
function drawGraduationCap(cx, cy, size) {
  ctx.save();
  const half = size;
  const boardY = cy - size * 0.15;

  // Cap band under the board.
  ctx.fillStyle = "#1c1814";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.42, boardY + size * 0.1);
  ctx.lineTo(cx + size * 0.42, boardY + size * 0.1);
  ctx.lineTo(cx + size * 0.3, boardY + size * 0.5);
  ctx.lineTo(cx - size * 0.3, boardY + size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Mortarboard (flat diamond).
  ctx.fillStyle = "#12100e";
  ctx.strokeStyle = "#2a2620";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, boardY - size * 0.45);
  ctx.lineTo(cx + half, boardY);
  ctx.lineTo(cx, boardY + size * 0.45);
  ctx.lineTo(cx - half, boardY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tassel.
  ctx.strokeStyle = "#f6a41e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, boardY);
  ctx.lineTo(cx + half - 2, boardY + 2);
  ctx.lineTo(cx + half - 2, boardY + size * 0.55);
  ctx.stroke();
  ctx.fillStyle = "#f6a41e";
  ctx.beginPath();
  ctx.arc(cx + half - 2, boardY + size * 0.62, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Decorative NPC row along the bottom; each NPC fades and rises in sequentially. */
function drawIntroNpcs() {
  const npcs = assets.intro.npcs;
  const count = npcs.length;
  const rowHeight = 166;
  const bottomY = H - 6;
  const slotWidth = W / count;
  const stagger = 0.32; // seconds between each NPC appearing
  const fadeDur = 0.6;  // fade-in duration per NPC

  for (let i = 0; i < count; i += 1) {
    const image = npcs[i];
    if (!imageReady(image)) continue;
    const alpha = clamp01((state.time - 0.3 - i * stagger) / fadeDur);
    if (alpha <= 0) continue;

    const aspect = image.naturalWidth / image.naturalHeight;
    let drawH = rowHeight;
    let drawW = drawH * aspect;
    const maxW = slotWidth - 6;
    if (drawW > maxW) {
      drawW = maxW;
      drawH = drawW / aspect;
    }
    const cx = slotWidth * (i + 0.5);
    const x = cx - drawW / 2;
    const rise = (1 - alpha) * 18; // gentle upward slide as it fades in
    const y = bottomY - drawH + rise;

    ctx.save();
    ctx.globalAlpha = alpha;
    drawImageClean(image, x, y, drawW, drawH);
    ctx.restore();
  }
}

/** Gold "play" call-to-action button with a triangle icon; fades in after the title. */
function drawIntroButton() {
  const rect = getIntroButtonRect();
  const alpha = clamp01((state.time - 0.5) / 0.5);
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 4);
  const cy = rect.y + rect.h / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Looping zoom in/out around the button centre draws the eye. Oscillates from
  // 1.0 upward only, so the label never shrinks below its base size.
  const zoom = 1 + 0.06 * (0.5 - 0.5 * Math.cos(state.time * 2.4));
  ctx.translate(rect.x + rect.w / 2, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-(rect.x + rect.w / 2), -cy);

  // Pulsing outer glow signals the button is clickable.
  ctx.shadowColor = "rgba(246, 178, 27, 0.85)";
  ctx.shadowBlur = 8 + pulse * 12;

  // Gold body with a subtle top-to-bottom shade.
  const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  grad.addColorStop(0, "#ffcb3e");
  grad.addColorStop(1, "#f2a012");
  ctx.fillStyle = grad;
  roundedRectPath(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dark outline + light inner bevel for the pixel-UI look.
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#3a2708";
  roundedRectPath(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 240, 200, 0.55)";
  roundedRectPath(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, 9);
  ctx.stroke();

  // Forward arrow on the right.
  const tx = rect.x + rect.w - 40;
  const ts = 11;
  ctx.fillStyle = "#231a06";
  ctx.beginPath();
  ctx.moveTo(tx, cy - ts);
  ctx.lineTo(tx + ts * 1.4, cy);
  ctx.lineTo(tx, cy + ts);
  ctx.closePath();
  ctx.fill();

  // Dark label on the gold face (nudged down slightly, larger).
  pixelText("COMEÇAR QUEST!", rect.x + rect.w / 2 - 16, cy + 3, 25, "#231a06", "center");
  ctx.restore();
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

/** Screen-space rect of the "CONTINUAR" button on the character-select screen. */
function getCharacterButtonRect() {
  const w = 300;
  const h = 54;
  return { x: W / 2 - w / 2, y: 348, w, h };
}

/** Rects of the character cards, laid out in a centred row. */
function getCharacterPickerRects() {
  const width = 168;
  const height = 232;
  const gap = 12;
  const total = characterOptions.length * width + (characterOptions.length - 1) * gap;
  const startX = W / 2 - total / 2;
  return characterOptions.map((_, index) => ({
    x: startX + index * (width + gap),
    y: 92,
    w: width,
    h: height,
  }));
}

/**
 * Screen 2: pick the playable character. Shows one idle sprite per character
 * over the intro background, with a highlighted selection and a continue button.
 */
function drawCharacterSelect() {
  const bg = assets.intro.background;
  if (imageReady(bg)) {
    drawImageClean(bg, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#04264a";
    ctx.fillRect(0, 0, W, H);
  }

  // Header banner.
  const bw = 540;
  const bx = W / 2 - bw / 2;
  const by = 22;
  const bh = 44;
  drawPixelPanel(bx, by, bw, bh, 10);
  pixelText("ESCOLHE A TUA PERSONAGEM", W / 2, by + bh / 2, 21, "#ff7ab0", "center");

  drawCharacterPicker();

  const button = getCharacterButtonRect();
  drawGoldButton(button, "CONTINUAR");
  pixelText("◀ ▶ para escolher   •   ENTER para continuar", W / 2, button.y + button.h + 22, 14, "#dff4ff", "center");
}

/** Draw the row of character cards; the selected one bobs and is highlighted gold. */
function drawCharacterPicker() {
  const rects = getCharacterPickerRects();
  for (let i = 0; i < characterOptions.length; i += 1) {
    const rect = rects[i];
    const option = characterOptions[i];
    const selected = i === selectedCharacterIndex;

    drawPixelPanel(rect.x, rect.y, rect.w, rect.h, selected ? 8 : 6);
    if (selected) {
      ctx.strokeStyle = "#ffcb3e";
      ctx.lineWidth = 3;
      ctx.strokeRect(rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6);
    }

    const image = assets.characterSelect[i];
    const contentX = rect.x + 12;
    const contentY = rect.y + 14;
    const contentW = rect.w - 24;
    const contentH = rect.h - 54;
    ctx.save();
    ctx.beginPath();
    ctx.rect(contentX, contentY, contentW, contentH);
    ctx.clip();
    if (imageReady(image)) {
      const aspect = image.naturalWidth / image.naturalHeight;
      let drawH = contentH;
      let drawW = drawH * aspect;
      if (drawW > contentW) {
        drawW = contentW;
        drawH = drawW / aspect;
      }
      const bob = selected ? Math.sin(state.time * 4) * 4 : 0;
      const dx = contentX + (contentW - drawW) / 2;
      const dy = contentY + contentH - drawH + bob;
      drawImageClean(image, dx, dy, drawW, drawH);
    }
    ctx.restore();

    pixelText(option.label, rect.x + rect.w / 2, rect.y + rect.h - 18, 15, selected ? "#ffcb3e" : "#ffffff", "center");
  }
}

/** Screen-space rect of the "COMEÇAR" button on the level-select screen. */
function getLevelButtonRect() {
  const w = 300;
  const h = 50;
  return { x: W / 2 - w / 2, y: 424, w, h };
}

/** Rects of the 7 level cards, laid out as two rows (4 + 3), centred. */
function getLevelPickerRects() {
  const cardW = 190;
  const cardH = 150;
  const gapX = 16;
  const gapY = 14;
  const row1Count = 4;
  const y1 = 92;
  const rects = [];

  const row1Total = row1Count * cardW + (row1Count - 1) * gapX;
  const row1StartX = W / 2 - row1Total / 2;
  for (let i = 0; i < row1Count; i += 1) {
    rects.push({ x: row1StartX + i * (cardW + gapX), y: y1, w: cardW, h: cardH });
  }

  const row2Count = levelData.length - row1Count;
  const row2Total = row2Count * cardW + (row2Count - 1) * gapX;
  const row2StartX = W / 2 - row2Total / 2;
  const y2 = y1 + cardH + gapY;
  for (let i = 0; i < row2Count; i += 1) {
    rects.push({ x: row2StartX + i * (cardW + gapX), y: y2, w: cardW, h: cardH });
  }

  return rects;
}

/**
 * Screen 3: pick the level. Each of the 7 levels is shown only through its
 * scenario props (no naming text); the selected card is highlighted gold.
 */
function drawLevelSelect() {
  const bg = assets.intro.background;
  if (imageReady(bg)) {
    drawImageClean(bg, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#04264a";
    ctx.fillRect(0, 0, W, H);
  }

  const bw = 540;
  const bx = W / 2 - bw / 2;
  const by = 22;
  const bh = 44;
  drawPixelPanel(bx, by, bw, bh, 10);
  pixelText("ESCOLHE O NÍVEL", W / 2, by + bh / 2, 21, "#ff7ab0", "center");

  drawLevelPicker();

  const button = getLevelButtonRect();
  drawGoldButton(button, "COMEÇAR");
  pixelText("◀ ▶ para escolher   •   ENTER para começar", W / 2, button.y + button.h + 20, 14, "#dff4ff", "center");
}

/**
 * Card panel for a level: a soft top-lit gradient faintly tinted with the
 * level's own colour (a "display case" look), plus the pixel-UI borders.
 */
function drawLevelCardPanel(rect, color, selected) {
  const radius = selected ? 8 : 6;
  roundedRectPath(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = "#141b26";
  ctx.fill();
  const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  grad.addColorStop(0.5, `${color}59`); // level colour at ~35% alpha
  grad.addColorStop(1, "rgba(4, 8, 16, 0.42)");
  roundedRectPath(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  roundedRectPath(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.stroke();
  ctx.strokeStyle = "#555b65";
  ctx.lineWidth = 2;
  roundedRectPath(rect.x + 5, rect.y + 5, rect.w - 10, rect.h - 10, Math.max(2, radius - 2));
  ctx.stroke();
}

/** Draw the level cards, each a vignette of that level's props. */
function drawLevelPicker() {
  const rects = getLevelPickerRects();
  for (let i = 0; i < levelData.length; i += 1) {
    const rect = rects[i];
    const selected = i === selectedLevelIndex;

    drawLevelCardPanel(rect, levelData[i].color, selected);
    if (selected) {
      ctx.strokeStyle = "#ffcb3e";
      ctx.lineWidth = 3;
      ctx.strokeRect(rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x + 10, rect.y + 10, rect.w - 20, rect.h - 20);
    ctx.clip();
    drawPropsVignette(assets.levelProps[i], levelData[i].props, rect.x + 12, rect.y + 12, rect.w - 24, rect.h - 24);
    ctx.restore();
  }
}

/**
 * Lay out prop images in a bottom-aligned row within the given box. Each slot
 * keeps a fixed position (so the layout is stable while images load); props
 * flagged `front` are drawn last (on top) and `scale` grows them a little.
 */
function drawPropsVignette(images, specs, x, y, w, h) {
  const n = images.length;
  if (n === 0) return;
  const slotW = w / n;
  const isFront = (i) => typeof specs[i] === "object" && specs[i].front;
  const scaleOf = (i) => (typeof specs[i] === "object" && specs[i].scale) ? specs[i].scale : 1;

  const order = [];
  for (let i = 0; i < n; i += 1) if (!isFront(i)) order.push(i);
  for (let i = 0; i < n; i += 1) if (isFront(i)) order.push(i);

  for (const i of order) {
    const image = images[i];
    if (!imageReady(image)) continue;
    const scale = scaleOf(i);
    const aspect = image.naturalWidth / image.naturalHeight;
    let drawH = h * scale;
    let drawW = drawH * aspect;
    const maxW = slotW * 1.25 * scale; // allow slight overlap; scale widens the cap
    if (drawW > maxW) {
      drawW = maxW;
      drawH = drawW / aspect;
    }
    const cx = x + slotW * (i + 0.5);
    drawImageClean(image, cx - drawW / 2, y + h - drawH, drawW, drawH);
  }
}

/** Static gold call-to-action button with a right-pointing arrow. */
function drawGoldButton(rect, label) {
  const cy = rect.y + rect.h / 2;
  ctx.save();
  const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  grad.addColorStop(0, "#ffcb3e");
  grad.addColorStop(1, "#f2a012");
  ctx.fillStyle = grad;
  roundedRectPath(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#3a2708";
  roundedRectPath(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 240, 200, 0.55)";
  roundedRectPath(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, 9);
  ctx.stroke();

  const tx = rect.x + rect.w - 36;
  const ts = 10;
  ctx.fillStyle = "#231a06";
  ctx.beginPath();
  ctx.moveTo(tx, cy - ts);
  ctx.lineTo(tx + ts * 1.4, cy);
  ctx.lineTo(tx, cy + ts);
  ctx.closePath();
  ctx.fill();

  pixelText(label, rect.x + rect.w / 2 - 14, cy + 2, 22, "#231a06", "center");
  ctx.restore();
}

function drawTitle() {
  const flicker = Math.sin(state.time * 5) > -0.2;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  drawPixelStars();
  const titleCharX = 170;
  const titleCharY = groundY - 96;
  ctx.save();
  ctx.translate(titleCharX + 21, titleCharY + 68);
  ctx.scale(1.8, 1.8);
  ctx.translate(-(titleCharX + 21), -(titleCharY + 68));
  drawPlayerSprite(titleCharX, titleCharY, 1, 0, 1);
  ctx.restore(334);
  neonText("MISSÃO:", W / 2, 120, 22, "#78d7ff", "center");
  neonText("ESTUDANTE", W / 2, 178, 50, "#8fd1ff", "center");
  neonText("UNIVERSITÁRIO", W / 2, 232, 44, "#8fd1ff", "center");
  neonText("DO FUTURO", W / 2, 286, 42, "#8fd1ff", "center");
  if (flicker) pixelText("CARREGA EM ENTER PARA COMEÇAR", W / 2, 430, 21, "#ffffff", "center");
  drawVideoChrome(0, 20);
}

function drawAvatarSelect() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  drawPixelStars();
  neonText("ESCOLHE O AVATAR", W / 2, 96, 34, "#8fd1ff", "center");
  pixelText("USA ◀ ▶ OU TOCA NUM AVATAR", W / 2, 142, 16, "#ffffff", "center");
  drawAvatarPicker();
  pixelText("CARREGA EM ENTER DEPOIS DE ESCOLHER", W / 2, 392, 18, "#ffffff", "center");
  drawVideoChrome(0, 20);
}

function drawFacultySelect() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  drawPixelStars();
  neonText("ESCOLHE A FACULDADE", W / 2, 92, 34, "#8fd1ff", "center");
  pixelText("USA AS SETAS OU TOCA NUM NÍVEL", W / 2, 136, 16, "#ffffff", "center");
  drawFacultyPicker();
  const selected = facultyLevels[selectedFacultyIndex];
  const selectedNameSize = selected.name.length > 48 ? 13 : (selected.name.length > 36 ? 15 : 17);
  pixelText(selected.name, W / 2, 378, selectedNameSize, selected.color, "center");
  pixelText("CARREGA EM ENTER PARA COMEÇAR", W / 2, 418, 18, "#ffffff", "center");
  drawVideoChrome(0, 20);
}

function getAvatarPickerRects() {
  const width = 150;
  const height = 178;
  const gap = 18;
  const totalWidth = avatarOptions.length * width + (avatarOptions.length - 1) * gap;
  const startX = W / 2 - totalWidth / 2;
  return avatarOptions.map((_, index) => ({
    x: startX + index * (width + gap),
    y: 176,
    w: width,
    h: height,
  }));
}

function drawAvatarPicker() {
  const rects = getAvatarPickerRects();
  for (let i = 0; i < avatarOptions.length; i += 1) {
    const rect = rects[i];
    const selected = i === selectedAvatarIndex;
    drawPixelPanel(rect.x, rect.y, rect.w, rect.h, selected ? 6 : 4);
    if (selected) {
      ctx.strokeStyle = "#8fd1ff";
      ctx.lineWidth = 3;
      ctx.strokeRect(rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6);
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x + 10, rect.y + 18, rect.w - 20, rect.h - 50);
    ctx.clip();
    drawAvatarOptionImage(avatarOptions[i], rect.x + rect.w / 2, rect.y + 150, 146, 1, state.time * 2);
    ctx.restore();
    pixelText(avatarOptions[i].label, rect.x + rect.w / 2, rect.y + rect.h - 16, 15, selected ? "#8fd1ff" : "#ffffff", "center");
  }
}

function getFacultyPickerRects() {
  const columns = 5;
  const width = 158;
  const height = 54;
  const gapX = 14;
  const gapY = 14;
  const totalWidth = columns * width + (columns - 1) * gapX;
  const startX = W / 2 - totalWidth / 2;
  const startY = 172;

  return facultyLevels.map((_, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      x: startX + col * (width + gapX),
      y: startY + row * (height + gapY),
      w: width,
      h: height,
    };
  });
}

function drawFacultyPicker() {
  const rects = getFacultyPickerRects();
  for (let i = 0; i < facultyLevels.length; i += 1) {
    const level = facultyLevels[i];
    const rect = rects[i];
    const selected = i === selectedFacultyIndex;
    drawPixelPanel(rect.x, rect.y, rect.w, rect.h, selected ? 6 : 4);
    ctx.fillStyle = selected ? level.color : "rgba(255,255,255,0.16)";
    ctx.fillRect(rect.x + 10, rect.y + 10, 8, rect.h - 20);
    if (selected) {
      ctx.strokeStyle = level.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6);
    }
    pixelText(level.label, rect.x + rect.w / 2 + 5, rect.y + rect.h / 2, 13, selected ? "#ffffff" : "#d8e3ee", "center");
  }
}

function drawLevel() {
  drawScene(levelData[selectedLevelIndex].id);
}

/** Lazily load (and cache) the Image objects for a level's scenery. */
function getScene(levelId) {
  if (!assets.scenes) assets.scenes = {};
  if (assets.scenes[levelId]) return assets.scenes[levelId];
  const cfg = sceneData[levelId];
  const base = `assets/cenarios/${cfg.folder}`;
  const load = (file) => loadImage(`${base}/${file}`);
  const scene = {
    ceiling: load(cfg.ceiling),
    wall: load(cfg.wall),
    floor: load(cfg.floor),
    doors: cfg.doors.map(load),
    windows: cfg.windows.map(load),
    wallArt: cfg.wallArt.map(load),
    floorProps: cfg.floorProps.map(load),
    npcs: cfg.npcs.map((file) => loadImage(`assets/npc/${file}`)),
  };
  assets.scenes[levelId] = scene;
  return scene;
}

/**
 * Render the chosen level's corridor: tiled ceiling/wall/floor strips with the
 * level's own doors, windows, wall art, props and NPCs scattered along it.
 */
function drawScene(levelId) {
  const scene = getScene(levelId);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0b0f14");
  grad.addColorStop(1, "#05070a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(-state.camera, 0);

  // Proportions matched to exemplo_jogo.png: a prominent ceiling, a tall wall
  // that dominates the frame, and a thin floor strip the player stands on.
  // The floor is pulled up ~12px to tuck under the wall's baseboard so wall and
  // floor read as one continuous surface (no dark gap between them).
  // Wall runs all the way down to the ground line; the floor is then drawn on
  // top starting ~40px higher, covering the wall's dark baseboard so the player
  // stands on the light floor tiles (not on a dark seam) — as in exemplo_jogo.png.
  const ceilingH = 116;
  // Keep the floor's visual top at ~450 regardless of groundY, so lowering the
  // ground line just plants the cast a little deeper on the floor (as requested)
  // without changing the ceiling/wall/floor proportions.
  const floorTop = groundY - 30;
  if (!tileBand(scene.ceiling, 0, ceilingH)) { ctx.fillStyle = "#1a1f26"; ctx.fillRect(0, 0, levelLength, ceilingH); }
  // The wall art is a full corridor scene that bakes in its own floor and a dark
  // wall/floor junction shadow in its lower ~40%. Crop that off so only the wall
  // proper is tiled and our own floor tiles provide the ground.
  if (!tileBand(scene.wall, ceilingH, groundY - ceilingH, 0.4)) { ctx.fillStyle = "#2b3038"; ctx.fillRect(0, ceilingH, levelLength, groundY - ceilingH); }
  if (!tileBand(scene.floor, floorTop, H - floorTop)) { ctx.fillStyle = "#20242a"; ctx.fillRect(0, floorTop, levelLength, H - floorTop); }

  // Wall decorations (up high).
  scatterProps(scene.wallArt, [260, 980, 1700, 2420, 3140, 3860], (img, x) => drawWallImage(img, x, 150, 92));
  scatterProps(scene.windows, [560, 1280, 2000, 2720, 3440], (img, x) => drawWallImage(img, x, groundY - 236, 120));

  // Subtle seat shadow just below the feet line so the floor still reads as one
  // surface with the wall (kept faint — a heavy band makes the floor look detached).
  const junction = ctx.createLinearGradient(0, floorTop, 0, floorTop + 12);
  junction.addColorStop(0, "rgba(0,0,0,0.24)");
  junction.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = junction;
  ctx.fillRect(0, floorTop, levelLength, 12);

  // Floor-anchored items on one spaced schedule (doors / props / NPCs interleaved).
  // Doors and props sit against the back wall, so they rest nearer the wall/floor
  // line (a bit above the ground line); NPCs stand out on the floor with the player.
  const propBase = groundY - 20;
  scatterProps(scene.doors, [380, 1100, 1820, 2540, 3260, 3980], (img, x) => drawFloorImage(img, x, propBase, 178, 1));
  scatterProps(scene.floorProps, [620, 1340, 2060, 2780, 3500], (img, x) => drawFloorImage(img, x, propBase, 116, 1));
  scatterProps(assets.npcPool, [260, 900, 1600, 2300, 3020, 3740], (img, x) => drawFloorImage(img, x, groundY, 122, 1));

  ctx.restore();
}

/**
 * Tile an image horizontally across the level to fill a band `bandH` px tall.
 * `cropBottomFrac` skips that fraction of the source's bottom rows before
 * tiling — used to drop a baked-in dark baseboard so the wall meets the floor
 * cleanly instead of showing a dark seam at the player's feet.
 */
function tileBand(image, top, bandH, cropBottomFrac = 0) {
  if (!imageReady(image)) return false;
  const srcH = Math.max(1, Math.round(image.naturalHeight * (1 - cropBottomFrac)));
  const tileW = image.naturalWidth * (bandH / srcH);
  for (let x = 0; x < levelLength; x += tileW) {
    ctx.drawImage(image, 0, 0, image.naturalWidth, srcH, x, top, tileW, bandH);
  }
  return true;
}

/** Place each of `xs` with an image cycled from `images`, via callback `fn(image, x)`. */
function scatterProps(images, xs, fn) {
  const ready = images.filter(imageReady);
  if (ready.length === 0) return;
  xs.forEach((x, i) => fn(ready[i % ready.length], x));
}

/** Draw an image bottom-anchored (feet on `bottomY`), scaled to `height`, centred on `centerX`. */
function drawFloorImage(image, centerX, bottomY, height, alpha = 1) {
  const width = image.naturalWidth * (height / image.naturalHeight);
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  drawImageClean(image, centerX - width / 2, bottomY - height, width, height);
  ctx.restore();
}

/** Draw an image top-anchored on the wall, scaled to `height`, centred on `centerX`. */
function drawWallImage(image, centerX, topY, height) {
  const width = image.naturalWidth * (height / image.naturalHeight);
  drawImageClean(image, centerX - width / 2, topY, width, height);
}

function drawDoor(x, y) {
  ctx.fillStyle = "#2b1e17";
  ctx.fillRect(x - 7, y - 7, 86, 192);
  ctx.fillStyle = "#53321f";
  ctx.fillRect(x, y, 72, 178);
  ctx.fillStyle = "#7fb1bf";
  ctx.fillRect(x + 12, y + 20, 48, 58);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(x + 18, y + 28, 20, 5);
  ctx.fillStyle = "#d8c48a";
  ctx.fillRect(x + 55, y + 92, 6, 6);
  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, 72, 178);
}

function drawWindow(x, y) {
  ctx.fillStyle = "#1d2a32";
  ctx.fillRect(x, y, 82, 148);
  ctx.fillStyle = "#76a4b2";
  ctx.fillRect(x + 8, y + 12, 66, 112);
  ctx.strokeStyle = "#26343b";
  ctx.lineWidth = 6;
  ctx.strokeRect(x, y, 82, 148);
  ctx.strokeRect(x + 38, y + 4, 3, 132);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.moveTo(x + 25, y + 30);
  ctx.lineTo(x + 10, y + 58);
  ctx.moveTo(x + 58, y + 50);
  ctx.lineTo(x + 38, y + 88);
  ctx.stroke();
}

function drawCampusSign(x, y) {
  ctx.fillStyle = "#5e5b55";
  ctx.fillRect(x, y, 210, 104);
  ctx.strokeStyle = "#252525";
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, 210, 104);
  pixelText("UNIVERSIDADE", x + 105, y + 34, 24, "#f1f1ee", "center");
  pixelText("DO PORTO", x + 105, y + 65, 24, "#ffffff", "center");
  pixelText("1911", x + 105, y + 95, 20, "#ffffff", "center");
}

function drawPlant(x, y) {
  ctx.fillStyle = "#7b4c32";
  ctx.fillRect(x + 20, y + 62, 42, 38);
  ctx.fillStyle = "#27321d";
  ctx.fillRect(x + 16, y + 92, 50, 8);
  const leaves = [
    [35, 44, 10, 34],
    [18, 34, 12, 40],
    [52, 30, 12, 44],
    [29, 16, 10, 52],
    [45, 8, 10, 58],
  ];
  for (const leaf of leaves) {
    ctx.fillStyle = "#255a2e";
    ctx.fillRect(x + leaf[0], y + leaf[1], leaf[2], leaf[3]);
    ctx.fillStyle = "#3f8741";
    ctx.fillRect(x + leaf[0] + 2, y + leaf[1] + 4, 4, leaf[3] - 8);
  }
}

function drawNoticeBoard(x, y) {
  ctx.fillStyle = "#3e3b34";
  ctx.fillRect(x, y, 132, 96);
  ctx.strokeStyle = "#1c1b18";
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, 132, 96);
  const papers = ["#d7dfdf", "#d9c89b", "#b9d2e3", "#ddd"];
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = papers[i % papers.length];
    ctx.fillRect(x + 12 + (i % 3) * 36, y + 12 + Math.floor(i / 3) * 38, 24, 28);
    ctx.fillStyle = "#59636a";
    ctx.fillRect(x + 16 + (i % 3) * 36, y + 20 + Math.floor(i / 3) * 38, 14, 3);
  }
}

function drawLabBench(x, y) {
  ctx.fillStyle = "#383638";
  ctx.fillRect(x, y, 330, 22);
  ctx.fillStyle = "#222";
  ctx.fillRect(x + 20, y - 75, 40, 75);
  ctx.fillStyle = "#9fb2bd";
  ctx.fillRect(x + 95, y - 58, 22, 58);
  ctx.fillStyle = "#7dd7ff";
  ctx.fillRect(x + 165, y - 35, 45, 35);
  ctx.fillStyle = "#252525";
  ctx.fillRect(x, y + 22, 330, 28);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = ["#c7d2db", "#e0a13a", "#79c1dd"][i % 3];
    ctx.fillRect(x + 220 + i * 18, y - 24 - (i % 2) * 10, 10, 24 + (i % 2) * 10);
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 218 + i * 18, y - 26 - (i % 2) * 10, 14, 4);
  }
}

function drawLibrary(x, y) {
  for (let shelf = 0; shelf < 4; shelf += 1) {
    ctx.fillStyle = "#513923";
    ctx.fillRect(x, y + shelf * 58, 310, 12);
    for (let i = 0; i < 18; i += 1) {
      const colors = ["#a8483f", "#3f77a8", "#d0a63e", "#4c9b63"];
      ctx.fillStyle = colors[(i + shelf) % colors.length];
      ctx.fillRect(x + 10 + i * 16, y + 15 + shelf * 58, 10, 38);
    }
  }
}

function drawFuturePoster(x, y) {
  ctx.fillStyle = "#e8e5db";
  ctx.fillRect(x, y, 150, 100);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, 150, 100);
  pixelText("UNIVERSIDADE", x + 75, y + 30, 13, "#111", "center");
  pixelText("DO PORTO", x + 75, y + 58, 16, "#111", "center");
  pixelText("1911", x + 75, y + 84, 16, "#111", "center");
}

function drawProfessor(x, y, glasses) {
  drawNpcBase(x, y, "#f1f3ef", "#26272b", "#23170f", glasses);
  ctx.fillStyle = "#dfe7eb";
  ctx.fillRect(x + 13, y + 30, 34, 46);
  ctx.fillStyle = "#56a4d8";
  ctx.fillRect(x + 50, y + 48, 44, 38);
  ctx.fillStyle = "#1d2023";
  ctx.fillRect(x + 96, y + 14, 36, 72);
}

function drawWorker(x, y) {
  drawNpcBase(x, y, "#1e2328", "#171717", "#d0a13e", false);
  ctx.fillStyle = "#efc24b";
  ctx.fillRect(x + 12, y - 3, 34, 11);
  ctx.fillStyle = "#4b3320";
  ctx.fillRect(x + 60, y + 10, 78, 70);
  ctx.fillStyle = "#d9e0e2";
  ctx.fillRect(x + 98, y + 24, 58, 35);
}

function drawTeamMate(x, y, hairColor) {
  drawNpcBase(x, y, "#1d2836", "#111", hairColor, false);
}

function drawNpcBase(x, y, coat, pants, hair, glasses) {
  ctx.fillStyle = "#d99a68";
  ctx.fillRect(x + 18, y + 8, 28, 28);
  ctx.fillStyle = hair;
  ctx.fillRect(x + 14, y, 34, 14);
  ctx.fillRect(x + 10, y + 9, 12, 12);
  if (glasses) {
    ctx.strokeStyle = "#101010";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 19, y + 15, 9, 7);
    ctx.strokeRect(x + 33, y + 15, 9, 7);
  }
  ctx.fillStyle = coat;
  ctx.fillRect(x + 12, y + 36, 38, 44);
  ctx.fillStyle = pants;
  ctx.fillRect(x + 16, y + 78, 12, 24);
  ctx.fillRect(x + 36, y + 78, 12, 24);
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(x + 12, y + 101, 18, 6);
  ctx.fillRect(x + 34, y + 101, 18, 6);
}

function drawSkills() {
  ctx.save();
  ctx.translate(-state.camera, 0);
  for (const skill of state.skills) {
    if (skill.taken) continue;
    const bob = Math.sin(state.time * 4 + skill.x) * 7;
    drawSign(skill.name, skill.x - 105, 96, Math.max(150, skill.name.length * 13));
    drawSkillIcon(skill.x, skill.y + bob, skill.icon, skill.color);
  }
  ctx.restore();
}

function drawSign(text, x, y, width) {
  drawPixelPanel(x, y, width, 42, 6);
  pixelText(text, x + width / 2, y + 22, 18, "#fff", "center");
}

function drawSkillIcon(x, y, icon, color) {
  const skill = skillData.find((item) => item.icon === icon);
  const image = skill ? assets.skills[skill.image] : null;

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  if (imageReady(image)) {
    const size = 58;
    ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x - 30, y - 30, 60, 60);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(x - 21, y - 21, 42, 42);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#132333";
    ctx.fillRect(x - 24, y - 24, 48, 48);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 24, y - 24, 48, 48);
    drawSkillGlyph(x, y, icon);
  }
  ctx.restore();

  ctx.fillStyle = color;
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2 + state.time;
    ctx.fillRect(x + Math.cos(angle) * 38, y + Math.sin(angle) * 38, 4, 4);
  }
}

function drawSkillGlyph(x, y, icon) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";

  if (icon === "math") {
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-8, 12);
    ctx.lineTo(1, -14);
    ctx.lineTo(16, -14);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(18, 10);
    ctx.moveTo(18, -2);
    ctx.lineTo(8, 10);
    ctx.stroke();
  }

  if (icon === "code") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-8, 14);
    ctx.moveTo(8, -14);
    ctx.lineTo(20, 0);
    ctx.lineTo(8, 14);
    ctx.moveTo(2, -18);
    ctx.lineTo(-4, 18);
    ctx.stroke();
  }

  if (icon === "atom") {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 21, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, 21, 8, Math.PI / 3, 0, Math.PI * 2);
    ctx.ellipse(0, 0, 21, 8, -Math.PI / 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(-3, -3, 6, 6);
  }

  if (icon === "flask") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-7, -18);
    ctx.lineTo(7, -18);
    ctx.moveTo(-3, -18);
    ctx.lineTo(-3, -3);
    ctx.lineTo(-16, 17);
    ctx.lineTo(16, 17);
    ctx.lineTo(3, -3);
    ctx.lineTo(3, -18);
    ctx.stroke();
    ctx.fillRect(-9, 8, 18, 5);
  }

  if (icon === "draft") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-17, 17);
    ctx.lineTo(17, 17);
    ctx.lineTo(-17, -17);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(7, 10);
    ctx.lineTo(-8, -5);
    ctx.closePath();
    ctx.stroke();
  }

  if (icon === "gear") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillRect(14, -3, 8, 6);
      ctx.restore();
    }
    ctx.fillRect(-4, -4, 8, 8);
  }

  if (icon === "team") {
    ctx.fillRect(-5, -16, 10, 10);
    ctx.fillRect(-22, -7, 10, 10);
    ctx.fillRect(12, -7, 10, 10);
    ctx.fillRect(-12, -2, 24, 19);
    ctx.fillRect(-27, 5, 16, 13);
    ctx.fillRect(11, 5, 16, 13);
  }

  if (icon === "book") {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 18);
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(-14, -20, -22, -10);
    ctx.lineTo(-22, 14);
    ctx.quadraticCurveTo(-12, 7, 0, 18);
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(14, -20, 22, -10);
    ctx.lineTo(22, 14);
    ctx.quadraticCurveTo(12, 7, 0, 18);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPlayer() {
  // Flash every 6 frames while invincible — skips every other 6-frame block.
  if (!godMode && state.invincible > 0 && Math.floor(state.invincible / 6) % 2 === 0) return;
  const p = state.player;
  if (godMode) {
    ctx.save();
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 18 + Math.sin(state.time * 7) * 10;
    ctx.globalAlpha = 0.82 + Math.sin(state.time * 9) * 0.18;
  }
  drawPlayerSprite(p.x - state.camera, p.y, p.facing, p.step, p.grounded ? 1 : 0);
  if (godMode) ctx.restore();
}

/**
 * @param {number} x - screen-space x (already offset by camera)
 * @param {number} y - screen-space y
 * @param {number} facing - 1 = right, -1 = left (used to horizontally flip the sprite)
 * @param {number} step - animation phase accumulator
 * @param {number} grounded - 1 if on ground, 0 if airborne (affects pixel fallback animation)
 */
function drawPlayerSprite(x, y, facing, step, grounded) {
  if (hasCharacterFrames()) {
    drawCharacterImage(x, y, facing, step, grounded);
    return;
  }

  ctx.save();
  ctx.translate(x + 21, y);
  ctx.scale(facing, 1);
  ctx.translate(-21, 0);

  const stride = Math.sin(step) * (grounded ? 8 : 3);
  const rearLeg = 24 + stride * 0.32;
  const frontLeg = 24 - stride * 0.32;

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(5, 89, 46, 7);

  ctx.fillStyle = "#0b1723";
  ctx.fillRect(8, 28, 31, 38);
  ctx.fillRect(8, 62, 12, rearLeg);
  ctx.fillRect(30, 62, 12, frontLeg);
  ctx.fillRect(6, 84 + stride * 0.32, 20, 8);
  ctx.fillRect(28, 84 - stride * 0.32, 21, 8);

  ctx.fillStyle = "#183d68";
  ctx.fillRect(0, 35, 15, 31);
  ctx.fillRect(3, 28, 14, 12);
  ctx.fillStyle = "#2d6ea9";
  ctx.fillRect(4, 37, 5, 23);
  ctx.fillStyle = "#10171f";
  ctx.fillRect(2, 43, 4, 16);

  ctx.fillStyle = "#0d4d86";
  ctx.fillRect(10, 30, 31, 34);
  ctx.fillStyle = "#1267aa";
  ctx.fillRect(14, 33, 20, 12);
  ctx.fillStyle = "#f4c04f";
  ctx.fillRect(31, 35, 5, 7);
  ctx.fillStyle = "#081625";
  ctx.fillRect(15, 60, 10, 5);
  ctx.fillRect(29, 60, 10, 5);

  ctx.fillStyle = "#d99462";
  ctx.fillRect(16, 9, 23, 23);
  ctx.fillRect(37, 17, 6, 8);
  ctx.fillStyle = "#f0b176";
  ctx.fillRect(19, 12, 17, 13);

  ctx.fillStyle = "#2a160d";
  ctx.fillRect(12, 4, 27, 9);
  ctx.fillRect(10, 10, 14, 13);
  ctx.fillRect(23, 1, 10, 8);
  ctx.fillRect(33, 6, 8, 11);
  ctx.fillRect(14, 0, 8, 7);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(32, 16, 5, 4);
  ctx.fillStyle = "#111111";
  ctx.fillRect(35, 17, 2, 3);
  ctx.fillStyle = "#6b3520";
  ctx.fillRect(33, 27, 8, 3);

  ctx.fillStyle = "#d99462";
  ctx.fillRect(35, 40, 14, 8);
  ctx.fillStyle = "#f0b176";
  ctx.fillRect(46, 42, 6, 6);

  ctx.fillStyle = "#f2f7ff";
  ctx.fillRect(5, 86 + stride * 0.32, 20, 6);
  ctx.fillRect(28, 86 - stride * 0.32, 22, 6);
  ctx.fillStyle = "#2b2f35";
  ctx.fillRect(6, 91 + stride * 0.32, 16, 3);
  ctx.fillRect(31, 91 - stride * 0.32, 17, 3);
  ctx.restore();
}

function drawAvatarOptionImage(avatar, centerX, bottomY, height, facing, step) {
  const image = getAvatarFrame(avatar, step, true);
  if (imageReady(image)) {
    const width = (image.naturalWidth / image.naturalHeight) * height;
    ctx.save();
    ctx.translate(centerX, bottomY - height / 2);
    ctx.scale(facing, 1);
    const sourceWidth = avatar.type === "player" ? Math.max(1, image.naturalWidth - 8) : image.naturalWidth;
    ctx.drawImage(image, 0, 0, sourceWidth, image.naturalHeight, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
}

function drawPropAvatarImage(avatar, x, y, facing, step, grounded) {
  const image = getAvatarFrame(avatar, step, grounded);
  if (!imageReady(image)) {
    drawCharacterImage(x, y, facing, step, grounded);
    return;
  }

  const crouching = state.mode === "playing" && state.player.crouching;
  const playerH = crouching ? 35 : 68;
  const bob = grounded && !crouching ? Math.sin(step * 0.5) * 1.5 : 0;
  const lean = crouching ? 0 : Math.max(-3, Math.min(3, Math.sin(step) * 2));
  const height = crouching ? 82 : (grounded ? 124 : 116);
  const width = (image.naturalWidth / image.naturalHeight) * height;

  ctx.save();
  ctx.translate(x + 21, y + playerH - height / 2 + bob);
  ctx.scale(facing, 1);
  ctx.rotate((lean * Math.PI) / 180);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getAvatarFrame(avatar, step, grounded) {
  if (avatar.type === "player") return getCharacterFrame(step, grounded);

  const frames = assets.avatarFrames[avatar.frames];
  if (!frames) return assets.props[avatar.prop];

  const moving = Math.abs(state.player.vx) > 0.1;
  if (state.player.crouching && frames.crouch && imageReady(frames.crouch[0])) return frames.crouch[0];
  if (!grounded && frames.jump && imageReady(frames.jump[0])) return frames.jump[0];
  if (!moving && frames.idle && imageReady(frames.idle[0])) return frames.idle[0];

  const readyWalkFrames = frames.walk ? frames.walk.filter(imageReady) : [];
  if (readyWalkFrames.length) return readyWalkFrames[Math.floor(step * 0.45) % readyWalkFrames.length];

  return assets.props[avatar.prop];
}

function drawCharacterImage(x, y, facing, step, grounded) {
  const frame = getCharacterFrame(step, grounded);
  if (!imageReady(frame)) return;

  const crouching = state.mode === "playing" && state.player.crouching;
  const playerH = crouching ? 35 : 68; // hitbox height (must match state.player.h)
  const bob = grounded && !crouching ? Math.sin(step * 0.5) * 1.5 : 0;
  const lean = crouching ? 0 : Math.max(-3, Math.min(3, Math.sin(step) * 2)); // subtle body tilt while walking
  const height = crouching ? 72 : (grounded ? 124 : 116); // render height — slightly shorter in air to look dynamic
  const width = (frame.naturalWidth / frame.naturalHeight) * height; // preserve sprite aspect ratio

  ctx.save();
  ctx.translate(x + 21, y + playerH - height / 2 + bob);
  ctx.scale(facing, 1);
  ctx.rotate((lean * Math.PI) / 180);
  ctx.drawImage(frame, -width / 2, -height / 2, width, height);
  ctx.restore();
}

// True once the chosen character's idle frame is loaded — gates the image path.
function hasCharacterFrames() {
  return imageReady(assets.playCharacters[selectedCharacterIndex].idle);
}

function getCharacterFrame(step, grounded) {
  const character = assets.playCharacters[selectedCharacterIndex];
  // God mode (Konami) swaps to the "super" sprite set — fall back to normal if
  // a super frame hasn't loaded yet.
  const set = (godMode && character.super) ? character.super : character;
  const moving = Math.abs(state.player.vx) > 0.1;
  if (state.player.crouching && imageReady(set.crouch)) return set.crouch;
  if (!grounded && imageReady(set.jump)) return set.jump;
  if (!moving && imageReady(set.idle)) return set.idle;

  const readyWalk = set.walk.filter(imageReady);
  if (readyWalk.length) return readyWalk[Math.floor(step * 0.45) % readyWalk.length];

  return imageReady(set.idle) ? set.idle : character.idle;
}

function drawHud() {
  const collected = state.skills.filter((skill) => skill.taken).length;
  ctx.fillStyle = "rgba(0,0,0,0.86)";
  ctx.fillRect(0, 0, W, 48);
  const timeRemaining = getMissionTimeRemaining();
  pixelText(formatTime(timeRemaining), 24, 36, 24, timeRemaining <= 10 ? "#ff6969" : "#ffffff", "left");
  pixelText(levelData[selectedLevelIndex].label, W / 2, 30, 15, levelData[selectedLevelIndex].color, "center");
  drawScorePanel(W - 128, 16, collected);
  for (let i = 0; i < 3; i += 1) drawHeart(42 + i * 36, 68, i < state.lives);
  drawCollectedSkills(160, 68);
  if (godMode) neonText("★ INVENCÍVEL", W / 2, 30, 18, "#ffd700", "center");
}

function drawCollectedSkills(startX, centerY) {
  const size = 26;
  const gap = 4;
  for (let i = 0; i < state.skills.length; i++) {
    const skill = state.skills[i];
    const x = startX + i * (size + gap);
    const image = assets.skills[skill.image];
    ctx.save();
    if (skill.taken) {
      ctx.shadowColor = skill.color;
      ctx.shadowBlur = 10;
    } else {
      ctx.globalAlpha = 0.2;
    }
    if (imageReady(image)) {
      ctx.drawImage(image, x, centerY - size / 2, size, size);
    } else {
      ctx.fillStyle = skill.color;
      ctx.fillRect(x, centerY - size / 2, size, size);
    }
    ctx.restore();
  }
}

function drawScorePanel(x, y, collected) {
  drawPixelPanel(x, y, 104, 64, 7);
  pixelText("COMP.", x + 52, y + 21, 15, "#ffffff", "center");
  pixelText(String(collected * 100).padStart(4, "0"), x + 52, y + 47, state.scorePulse ? 24 : 20, "#ffffff", "center");
}

function drawHeart(x, y, active = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#070707";
  ctx.fillRect(2, 7, 10, 6);
  ctx.fillRect(18, 7, 10, 6);
  ctx.fillRect(0, 13, 30, 14);
  ctx.fillRect(5, 27, 20, 7);
  ctx.fillRect(11, 34, 8, 6);
  ctx.fillStyle = active ? "#e63232" : "#2a1515";
  ctx.fillRect(4, 4, 8, 8);
  ctx.fillRect(18, 4, 8, 8);
  ctx.fillRect(2, 10, 26, 13);
  ctx.fillRect(7, 23, 16, 7);
  ctx.fillRect(12, 30, 6, 5);
  ctx.fillStyle = active ? "#ff6969" : "#1a0d0d";
  ctx.fillRect(6, 7, 4, 4);
  ctx.fillRect(20, 7, 4, 4);
  ctx.fillStyle = active ? "#9d151c" : "#1a0808";
  ctx.fillRect(4, 21, 20, 4);
  ctx.restore();
}

function drawToast() {
  if (!state.toast || state.mode === "won") return;
  drawTextBox(44, H - 126, 540, 82);
  pixelText(state.toast.title, 314, H - 91, 20, "#b8b2ff", "center");
  pixelText(state.toast.body, 314, H - 60, 18, "#ffffff", "center");
}

function drawTextBox(x, y, width, height) {
  drawPixelPanel(x, y, width, height, 7);
}

function drawPixelPanel(x, y, width, height, radius = 6) {
  ctx.fillStyle = "#030303";
  roundedRectPath(x, y, width, height, radius);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  roundedRectPath(x, y, width, height, radius);
  ctx.stroke();
  ctx.strokeStyle = "#555b65";
  ctx.lineWidth = 2;
  // Inner inset border gives the panel a beveled "pixel UI" appearance.
  roundedRectPath(x + 5, y + 5, width - 10, height - 10, Math.max(2, radius - 2));
  ctx.stroke();
}

function roundedRectPath(x, y, width, height, radius) {
  // ctx.roundRect is not available in all browsers; fall back to manual quadratic curves.
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }

  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function spawnBurst(x, y) {
  const color = skillData[Math.floor(Math.random() * skillData.length)].color;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4;
    const life = 50 + Math.floor(Math.random() * 40);
    state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2, color, life, maxLife: life, confetti: false });
  }
}

function spawnConfetti() {
  const color = skillData[Math.floor(Math.random() * skillData.length)].color;
  const life = 220 + Math.floor(Math.random() * 120);
  state.particles.push({
    x: Math.random() * W, y: -8,
    vx: (Math.random() - 0.5) * 1.8, vy: 1.5 + Math.random() * 2,
    color, life, maxLife: life,
    confetti: true, w: 4 + Math.random() * 5, h: 7 + Math.random() * 5,
  });
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    if (p.confetti) {
      ctx.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
    } else {
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
  }
  ctx.globalAlpha = 1;
}

function drawWin() {
  const elapsed = (state.time - state.winStartTime) * 60;

  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(0, 0, W, H);

  // Title fades in over first 40 frames
  ctx.globalAlpha = Math.min(1, elapsed / 40);
  const pulse = Math.sin(state.time * 4) * 2;
  neonText("TODAS AS COMPETÊNCIAS ADQUIRIDAS!", W / 2, 90, 23 + pulse, "#7dff4b", "center");
  ctx.globalAlpha = 1;

  // NPCs slide up and fade in, staggered
  const npcDefs = [
    { key: "professor",     x: 180 },
    { key: "worker",        x: 370 },
    { key: "studentBlonde", x: 570 },
    { key: "studentBlack",  x: 760 },
  ];
  const npcH = 140;
  const npcFootY = 480;
  for (let i = 0; i < npcDefs.length; i++) {
    const t = Math.min(1, Math.max(0, (elapsed - (50 + i * 35)) / 35));
    if (t <= 0) continue;
    const img = assets.props[npcDefs[i].key];
    const slideY = npcFootY - npcH + (1 - t) * 40;
    ctx.globalAlpha = t;
    if (imageReady(img)) {
      const npcW = (img.naturalWidth / img.naturalHeight) * npcH;
      ctx.drawImage(img, npcDefs[i].x - npcW / 2, slideY, npcW, npcH);
    }
    ctx.globalAlpha = 1;
  }

  // Skills fade in one by one
  for (let i = 0; i < state.skills.length; i++) {
    const t = Math.min(1, Math.max(0, (elapsed - (185 + i * 18)) / 25));
    if (t <= 0) continue;
    const skill = state.skills[i];
    const image = assets.skills[skill.image];
    const size = 48;
    const x = 105 + i * 96;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.shadowColor = skill.color;
    ctx.shadowBlur = 14;
    if (imageReady(image)) {
      ctx.drawImage(image, x, 310 - size / 2, size, size);
    } else {
      ctx.fillStyle = skill.color;
      ctx.fillRect(x, 310 - size / 2, size, size);
    }
    ctx.restore();
  }

  // Body text and press-enter
  if (elapsed > 360) {
    ctx.globalAlpha = Math.min(1, (elapsed - 360) / 30);
    pixelText("ESTÁS PRONTO PARA O FUTURO UNIVERSITÁRIO.", W / 2, 175, 18, "#ffffff", "center");
    ctx.globalAlpha = 1;
  }
  if (elapsed > 420 && Math.sin(state.time * 5) > -0.2) {
    pixelText("COMEÇAR / ENTER PARA JOGAR OUTRA VEZ", W / 2, 212, 16, "#8fd1ff", "center");
  }
}

/**
 * Fake video-player chrome overlaid on the title screen (YouTube-style aesthetic).
 * @param {number} progress - current time value (0 = start)
 * @param {number} duration - total duration for the progress bar (0 disables bar)
 */
function drawVideoChrome(progress, duration) {
  ctx.fillStyle = "rgba(0,0,0,0.88)";
  ctx.fillRect(0, H - 58, W, 58);
  pixelText("UNIVERSIDADE DO PORTO 2026", W / 2, H - 29, 18, "#ffffff", "center");
}

function drawDistractions() {
  ctx.save();
  ctx.translate(-state.camera, 0);
  for (const d of state.distractions) {
    const bob = Math.sin(state.time * 3 + d.startX * 0.01) * 6;
    const image = d.enemy ? assets.enemies[d.enemy] : null;
    if (imageReady(image)) {
      const size = 60;
      ctx.save();
      ctx.shadowColor = "rgba(255, 70, 70, 0.65)";
      ctx.shadowBlur = 16;
      const aspect = image.naturalWidth / image.naturalHeight;
      const drawW = aspect >= 1 ? size : size * aspect;
      const drawH = aspect >= 1 ? size / aspect : size;
      drawImageClean(image, d.x + d.w / 2 - drawW / 2, d.y + d.h / 2 - drawH / 2 + bob, drawW, drawH);
      ctx.restore();
    } else {
      drawDistraction(d.x, d.y + bob, d.kind);
    }
  }
  ctx.restore();
}

function drawDistraction(x, y, kind) {
  ctx.save();
  ctx.shadowBlur = 20;

  if (kind === "phone") {
    ctx.shadowColor = "#a020ff";
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(x + 6, y + 2, 32, 40);
    ctx.fillStyle = "#7c3aed";
    ctx.fillRect(x + 10, y + 7, 24, 26);
    ctx.fillStyle = "#ff4da6";
    ctx.fillRect(x + 14, y + 15, 6, 5);
    ctx.fillRect(x + 24, y + 15, 6, 5);
    ctx.fillRect(x + 12, y + 18, 20, 8);
    ctx.fillRect(x + 15, y + 26, 14, 5);
    ctx.fillRect(x + 19, y + 31, 6, 3);
    ctx.shadowColor = "#ff2020";
    ctx.fillStyle = "#ff2020";
    ctx.fillRect(x + 30, y, 14, 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    pixelText("!", x + 36, y + 6, 10, "#ffffff", "center");
  }

  if (kind === "heart") {
    ctx.shadowColor = "#ff1a8c";
    ctx.fillStyle = "#ff1a8c";
    ctx.fillRect(x + 6,  y + 10, 12, 10);
    ctx.fillRect(x + 26, y + 10, 12, 10);
    ctx.fillRect(x + 2,  y + 17, 40, 14);
    ctx.fillRect(x + 6,  y + 31, 32,  8);
    ctx.fillRect(x + 12, y + 37, 20,  5);
    ctx.fillRect(x + 18, y + 40,  8,  4);
    ctx.fillStyle = "#ff80cc";
    ctx.fillRect(x + 10, y + 14, 6, 6);
    ctx.fillRect(x + 30, y + 14, 6, 6);
  }

  if (kind === "chat") {
    ctx.shadowColor = "#00dd88";
    ctx.fillStyle = "#009960";
    ctx.fillRect(x + 4, y + 4, 36, 28);
    ctx.fillRect(x + 4, y + 30, 14,  8);
    ctx.fillRect(x + 4, y + 36,  8,  5);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 11, y + 15, 6, 6);
    ctx.fillRect(x + 20, y + 15, 6, 6);
    ctx.fillRect(x + 29, y + 15, 6, 6);
  }

  if (kind === "sleep") {
    ctx.shadowColor = "#88aaff";
    pixelText("Z", x + 4,  y + 34, 22, "#88aaff", "left");
    pixelText("Z", x + 17, y + 22, 17, "#aabbff", "left");
    pixelText("Z", x + 27, y + 12, 13, "#ccd5ff", "left");
  }

  ctx.restore();
}

function drawGameOver() {
  const timeExpired = state.gameoverReason === "time";
  ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
  ctx.fillRect(0, 0, W, H);
  drawPixelPanel(180, 110, 600, 310, 8);
  neonText(timeExpired ? "O TEMPO" : "AS DISTRAÇÕES", W / 2, 185, 36, "#ff3030", "center");
  neonText(timeExpired ? "ACABOU!" : "VENCERAM!", W / 2, 228, 36, "#ff3030", "center");
  pixelText(timeExpired ? "Não concluíste a missão a tempo." : "Não conseguiste manter o foco.", W / 2, 296, 18, "#ffffff", "center");
  pixelText(timeExpired ? "Recolhe todas as competências antes do fim." : "↑ salta   ↓ agacha   evita tudo!", W / 2, 330, 16, "#aaaaaa", "center");
  const flicker = Math.sin(state.time * 5) > -0.2;
  if (flicker) pixelText("COMEÇAR / ENTER PARA TENTAR OUTRA VEZ", W / 2, 390, 17, "#8fd1ff", "center");
}

function drawFrameEffects() {
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  const vignette = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 620);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawPixelStars() {
  ctx.fillStyle = "#0f1720";
  for (let y = 0; y < H; y += 28) {
    for (let x = 0; x < W; x += 36) {
      if ((x * 7 + y * 3) % 5 === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
}

/**
 * Draw text with a neon glow: blurred colored pass + sharp white-tinted pass on top.
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} size - font size in px
 * @param {string} color - glow + base color
 * @param {string} align - canvas textAlign value
 */
function neonText(text, x, y, size, color, align) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  pixelText(text, x, y, size, color, align);
  ctx.shadowBlur = 0;
  pixelText(text, x, y, size, "#dff4ff", align); // near-white overlay sharpens the glow
  ctx.restore();
}

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} size - font size in px
 * @param {string} color
 * @param {string} [align="left"] - canvas textAlign value
 */
function pixelText(text, x, y, size, color, align = "left") {
  ctx.font = `700 ${size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function formatTime(time) {
  const total = Math.floor(time);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getMissionTimeRemaining() {
  return Math.max(0, missionTimeLimit - state.time);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
