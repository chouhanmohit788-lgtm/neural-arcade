// =========================================================
// NEURAL DRIVE — ADVENTURE CAMPAIGN
// 10 NEW ADVENTURE LEVELS + MID-TRACK CHALLENGES
// =========================================================

export const GAME_LEVELS = [
  // =======================================================
  // LEVEL 1 — LOST JUNGLE RUN
  // =======================================================
  {
    id: 1,
    name: "LOST JUNGLE RUN",
    difficulty: "EASY",
    timeLimit: 80,
    fuel: 100,

    terrain: [
      [0, 420],
      [130, 420],
      [230, 360],
      [340, 400],
      [470, 330],
      [590, 410],
      [720, 350],
      [850, 390],
      [980, 300],
      [1110, 360],
      [1240, 420],
      [1380, 350],
      [1510, 420],
    ],

    gaps: [],

    obstacles: [
      {
        type: "rock",
        x: 350,
        size: 30,
      },
      {
        type: "ramp",
        x: 580,
        width: 90,
        height: 75,
      },
      {
        type: "rock",
        x: 900,
        size: 34,
      },
      {
        type: "ramp",
        x: 1170,
        width: 95,
        height: 80,
      },
    ],

    coins: [150, 280, 430, 600, 760, 920, 1080, 1250, 1400],

    challenges: [
      {
        x: 420,
        width: 150,
        type: "speed",
        title: "JUNGLE SPRINT",
        target: 5,
        reward: 200,
      },
      {
        x: 850,
        width: 160,
        type: "jump",
        title: "VINE JUMP",
        target: 1,
        reward: 250,
      },
    ],

    finishX: 1450,
  },

  // =======================================================
  // LEVEL 2 — CANYON OUTLAW
  // =======================================================
  {
    id: 2,
    name: "CANYON OUTLAW",
    difficulty: "EASY+",
    timeLimit: 85,
    fuel: 100,

    terrain: [
      [0, 420],
      [120, 390],
      [240, 350],
      [360, 430],
      [500, 300],
      [630, 360],
      [760, 460],
      [900, 330],
      [1040, 280],
      [1180, 400],
      [1320, 340],
      [1460, 430],
      [1600, 380],
    ],

    gaps: [
      {
        x: 760,
        width: 90,
      },
    ],

    obstacles: [
      {
        type: "rock",
        x: 300,
        size: 34,
      },
      {
        type: "ramp",
        x: 500,
        width: 100,
        height: 95,
      },
      {
        type: "rock",
        x: 970,
        size: 38,
      },
      {
        type: "ramp",
        x: 1280,
        width: 100,
        height: 85,
      },
    ],

    coins: [140, 270, 420, 550, 700, 900, 1060, 1230, 1390, 1530],

    challenges: [
      {
        x: 300,
        width: 170,
        type: "speed",
        title: "CANYON DASH",
        target: 6,
        reward: 250,
      },
      {
        x: 720,
        width: 180,
        type: "jump",
        title: "CANYON LEAP",
        target: 1,
        reward: 300,
      },
      {
        x: 1080,
        width: 170,
        type: "brake",
        title: "DUST BRAKE",
        target: 3,
        reward: 250,
      },
    ],

    finishX: 1540,
  },

  // =======================================================
  // LEVEL 3 — FROZEN RIDGE
  // =======================================================
  {
    id: 3,
    name: "FROZEN RIDGE",
    difficulty: "MEDIUM",
    timeLimit: 90,
    fuel: 95,

    terrain: [
      [0, 420],
      [130, 340],
      [260, 390],
      [390, 280],
      [520, 440],
      [650, 310],
      [780, 250],
      [910, 390],
      [1040, 300],
      [1170, 450],
      [1300, 280],
      [1430, 350],
      [1570, 420],
    ],

    gaps: [
      {
        x: 520,
        width: 100,
      },
      {
        x: 1170,
        width: 90,
      },
    ],

    obstacles: [
      {
        type: "rock",
        x: 250,
        size: 34,
      },
      {
        type: "moving",
        x: 700,
        minX: 620,
        maxX: 820,
        size: 36,
        speed: 1.6,
      },
      {
        type: "rock",
        x: 1000,
        size: 38,
      },
      {
        type: "ramp",
        x: 1300,
        width: 100,
        height: 105,
      },
    ],

    coins: [150, 300, 450, 650, 800, 970, 1100, 1300, 1450],

    challenges: [
      {
        x: 300,
        width: 170,
        type: "balance",
        title: "ICE BALANCE",
        target: 3,
        reward: 300,
      },
      {
        x: 600,
        width: 190,
        type: "jump",
        title: "GLACIER BOOST",
        target: 1,
        reward: 350,
      },
      {
        x: 1050,
        width: 180,
        type: "collect",
        title: "CRYSTAL HUNT",
        target: 2,
        reward: 400,
      },
    ],

    finishX: 1510,
  },

  // =======================================================
  // LEVEL 4 — DESERT STORM
  // =======================================================
  {
    id: 4,
    name: "DESERT STORM",
    difficulty: "MEDIUM",
    timeLimit: 95,
    fuel: 92,

    terrain: [
      [0, 420],
      [120, 360],
      [250, 470],
      [380, 320],
      [520, 430],
      [650, 280],
      [790, 500],
      [930, 340],
      [1070, 450],
      [1210, 300],
      [1350, 480],
      [1490, 330],
      [1640, 420],
    ],

    gaps: [
      {
        x: 790,
        width: 110,
      },
      {
        x: 1350,
        width: 100,
      },
    ],

    obstacles: [
      {
        type: "rock",
        x: 220,
        size: 38,
      },
      {
        type: "ramp",
        x: 500,
        width: 105,
        height: 115,
      },
      {
        type: "moving",
        x: 1020,
        minX: 940,
        maxX: 1160,
        size: 40,
        speed: 1.9,
      },
      {
        type: "rock",
        x: 1250,
        size: 40,
      },
    ],

    coins: [130, 300, 460, 620, 780, 960, 1110, 1280, 1430, 1570],

    challenges: [
      {
        x: 250,
        width: 180,
        type: "speed",
        title: "SAND BOOST",
        target: 7,
        reward: 300,
      },
      {
        x: 650,
        width: 180,
        type: "jump",
        title: "DUNE LAUNCH",
        target: 1,
        reward: 400,
      },
      {
        x: 1100,
        width: 190,
        type: "brake",
        title: "STORM BRAKE",
        target: 3,
        reward: 350,
      },
    ],

    finishX: 1580,
  },

  // =======================================================
  // LEVEL 5 — VOLCANO ESCAPE
  // =======================================================
  {
    id: 5,
    name: "VOLCANO ESCAPE",
    difficulty: "HARD",
    timeLimit: 100,
    fuel: 90,

    terrain: [
      [0, 420],
      [120, 300],
      [240, 500],
      [360, 270],
      [490, 450],
      [620, 250],
      [750, 520],
      [890, 290],
      [1030, 480],
      [1170, 260],
      [1300, 510],
      [1430, 300],
      [1570, 460],
      [1710, 420],
    ],

    gaps: [
      {
        x: 240,
        width: 110,
      },
      {
        x: 750,
        width: 120,
      },
      {
        x: 1300,
        width: 110,
      },
    ],

    obstacles: [
      {
        type: "rock",
        x: 170,
        size: 36,
      },
      {
        type: "moving",
        x: 450,
        minX: 380,
        maxX: 580,
        size: 40,
        speed: 2,
      },
      {
        type: "rock",
        x: 680,
        size: 42,
      },
      {
        type: "moving",
        x: 980,
        minX: 900,
        maxX: 1120,
        size: 42,
        speed: 2.2,
      },
      {
        type: "rock",
        x: 1210,
        size: 44,
      },
      {
        type: "ramp",
        x: 1460,
        width: 105,
        height: 125,
      },
    ],

    coins: [120, 290, 430, 600, 790, 930, 1080, 1250, 1450, 1610],

    challenges: [
      {
        x: 180,
        width: 180,
        type: "jump",
        title: "LAVA LEAP",
        target: 1,
        reward: 450,
      },
      {
        x: 500,
        width: 190,
        type: "speed",
        title: "MAGMA SPRINT",
        target: 7,
        reward: 450,
      },
      {
        x: 900,
        width: 190,
        type: "balance",
        title: "CRATER EDGE",
        target: 4,
        reward: 500,
      },
      {
        x: 1250,
        width: 190,
        type: "collect",
        title: "FIRE SHARDS",
        target: 2,
        reward: 500,
      },
    ],

    finishX: 1650,
  },

  // =======================================================
  // LEVEL 6 — SKY TEMPLE
  // =======================================================
  {
    id: 6,
    name: "SKY TEMPLE",
    difficulty: "HARD",
    timeLimit: 105,
    fuel: 88,

    terrain: [
      [0, 400],
      [120, 280],
      [240, 430],
      [370, 250],
      [500, 450],
      [630, 220],
      [760, 400],
      [900, 260],
      [1040, 470],
      [1180, 240],
      [1320, 430],
      [1460, 280],
      [1600, 450],
      [1740, 350],
    ],

    gaps: [
      {
        x: 500,
        width: 110,
      },
      {
        x: 1040,
        width: 120,
      },
    ],

    obstacles: [
      {
        type: "ramp",
        x: 300,
        width: 105,
        height: 130,
      },
      {
        type: "moving",
        x: 700,
        minX: 620,
        maxX: 820,
        size: 40,
        speed: 2.1,
      },
      {
        type: "rock",
        x: 930,
        size: 42,
      },
      {
        type: "moving",
        x: 1270,
        minX: 1190,
        maxX: 1390,
        size: 42,
        speed: 2.3,
      },
      {
        type: "ramp",
        x: 1480,
        width: 110,
        height: 135,
      },
    ],

    coins: [130, 270, 410, 590, 760, 910, 1080, 1230, 1410, 1570, 1690],

    challenges: [
      {
        x: 250,
        width: 180,
        type: "jump",
        title: "TEMPLE LEAP",
        target: 2,
        reward: 500,
      },
      {
        x: 600,
        width: 200,
        type: "balance",
        title: "ALTITUDE BRAKE",
        target: 4,
        reward: 550,
      },
      {
        x: 1000,
        width: 200,
        type: "collect",
        title: "SKY RELICS",
        target: 3,
        reward: 600,
      },
      {
        x: 1400,
        width: 180,
        type: "speed",
        title: "TEMPLE SPRINT",
        target: 8,
        reward: 600,
      },
    ],

    finishX: 1680,
  },

  // =======================================================
  // LEVEL 7 — CYBER CITY CHASE
  // =======================================================
  {
    id: 7,
    name: "CYBER CITY CHASE",
    difficulty: "VERY HARD",
    timeLimit: 110,
    fuel: 86,

    terrain: [
      [0, 420],
      [110, 320],
      [230, 470],
      [350, 280],
      [480, 430],
      [610, 250],
      [740, 490],
      [870, 300],
      [1000, 450],
      [1130, 240],
      [1260, 500],
      [1390, 270],
      [1520, 450],
      [1650, 300],
      [1780, 420],
    ],

    gaps: [
      {
        x: 230,
        width: 100,
      },
      {
        x: 740,
        width: 120,
      },
      {
        x: 1260,
        width: 110,
      },
    ],

    obstacles: [
      {
        type: "moving",
        x: 430,
        minX: 350,
        maxX: 550,
        size: 40,
        speed: 2.4,
      },
      {
        type: "rock",
        x: 650,
        size: 42,
      },
      {
        type: "moving",
        x: 950,
        minX: 850,
        maxX: 1100,
        size: 44,
        speed: 2.6,
      },
      {
        type: "rock",
        x: 1190,
        size: 45,
      },
      {
        type: "moving",
        x: 1480,
        minX: 1400,
        maxX: 1600,
        size: 45,
        speed: 2.8,
      },
      {
        type: "ramp",
        x: 1650,
        width: 110,
        height: 130,
      },
    ],

    coins: [120, 280, 430, 600, 770, 930, 1080, 1250, 1410, 1560, 1700],

    challenges: [
      {
        x: 150,
        width: 180,
        type: "speed",
        title: "NEON SPRINT",
        target: 8,
        reward: 600,
      },
      {
        x: 500,
        width: 200,
        type: "jump",
        title: "TURBO TUNNEL",
        target: 2,
        reward: 650,
      },
      {
        x: 850,
        width: 190,
        type: "balance",
        title: "ROOFTOP CONTROL",
        target: 5,
        reward: 700,
      },
      {
        x: 1250,
        width: 210,
        type: "collect",
        title: "NEON CORES",
        target: 3,
        reward: 700,
      },
    ],

    finishX: 1730,
  },

  // =======================================================
  // LEVEL 8 — MOON CRATER RUN
  // =======================================================
  {
    id: 8,
    name: "MOON CRATER RUN",
    difficulty: "VERY HARD",
    timeLimit: 115,
    fuel: 84,

    terrain: [
      [0, 420],
      [120, 350],
      [250, 470],
      [380, 250],
      [510, 500],
      [640, 220],
      [770, 460],
      [900, 260],
      [1030, 510],
      [1160, 230],
      [1290, 470],
      [1420, 250],
      [1550, 520],
      [1680, 300],
      [1820, 420],
    ],

    gaps: [
      {
        x: 250,
        width: 120,
      },
      {
        x: 770,
        width: 120,
      },
      {
        x: 1290,
        width: 120,
      },
      {
        x: 1550,
        width: 100,
      },
    ],

    obstacles: [
      {
        type: "rock",
        x: 170,
        size: 38,
      },
      {
        type: "moving",
        x: 470,
        minX: 390,
        maxX: 580,
        size: 42,
        speed: 2.2,
      },
      {
        type: "rock",
        x: 680,
        size: 44,
      },
      {
        type: "moving",
        x: 1010,
        minX: 920,
        maxX: 1130,
        size: 44,
        speed: 2.5,
      },
      {
        type: "rock",
        x: 1220,
        size: 46,
      },
      {
        type: "moving",
        x: 1460,
        minX: 1370,
        maxX: 1580,
        size: 46,
        speed: 2.7,
      },
      {
        type: "ramp",
        x: 1660,
        width: 115,
        height: 140,
      },
    ],

    coins: [130, 300, 450, 620, 800, 970, 1120, 1300, 1470, 1600, 1760],

    challenges: [
      {
        x: 180,
        width: 200,
        type: "jump",
        title: "LOW-G JUMP",
        target: 2,
        reward: 700,
      },
      {
        x: 520,
        width: 200,
        type: "balance",
        title: "ORBIT BRAKE",
        target: 5,
        reward: 750,
      },
      {
        x: 900,
        width: 210,
        type: "speed",
        title: "LUNAR SPRINT",
        target: 8,
        reward: 800,
      },
      {
        x: 1250,
        width: 220,
        type: "collect",
        title: "MOON RELICS",
        target: 3,
        reward: 800,
      },
    ],

    finishX: 1770,
  },

  // =======================================================
  // LEVEL 9 — HAUNTED FACTORY
  // =======================================================
  {
    id: 9,
    name: "HAUNTED FACTORY",
    difficulty: "EXTREME",
    timeLimit: 120,
    fuel: 82,

    terrain: [
      [0, 420],
      [110, 300],
      [220, 500],
      [340, 260],
      [470, 520],
      [600, 240],
      [730, 490],
      [860, 220],
      [990, 520],
      [1120, 260],
      [1250, 500],
      [1380, 230],
      [1510, 520],
      [1640, 270],
      [1770, 470],
      [1900, 420],
    ],

    gaps: [
      {
        x: 220,
        width: 120,
      },
      {
        x: 470,
        width: 130,
      },
      {
        x: 730,
        width: 120,
      },
      {
        x: 990,
        width: 130,
      },
      {
        x: 1250,
        width: 120,
      },
      {
        x: 1510,
        width: 130,
      },
    ],

    obstacles: [
      {
        type: "moving",
        x: 400,
        minX: 330,
        maxX: 540,
        size: 44,
        speed: 2.5,
      },
      {
        type: "rock",
        x: 650,
        size: 44,
      },
      {
        type: "moving",
        x: 900,
        minX: 820,
        maxX: 1080,
        size: 46,
        speed: 2.8,
      },
      {
        type: "rock",
        x: 1170,
        size: 46,
      },
      {
        type: "moving",
        x: 1420,
        minX: 1340,
        maxX: 1570,
        size: 48,
        speed: 3,
      },
      {
        type: "rock",
        x: 1700,
        size: 50,
      },
      {
        type: "ramp",
        x: 1810,
        width: 110,
        height: 145,
      },
    ],

    coins: [
      120,
      270,
      420,
      590,
      760,
      930,
      1090,
      1260,
      1430,
      1600,
      1760,
      1870,
    ],

    challenges: [
      {
        x: 150,
        width: 200,
        type: "speed",
        title: "GHOST TURBO",
        target: 9,
        reward: 800,
      },
      {
        x: 430,
        width: 210,
        type: "jump",
        title: "LASER WALK",
        target: 2,
        reward: 850,
      },
      {
        x: 780,
        width: 220,
        type: "balance",
        title: "PHANTOM CONTROL",
        target: 5,
        reward: 900,
      },
      {
        x: 1150,
        width: 220,
        type: "collect",
        title: "LOST SIGNALS",
        target: 4,
        reward: 900,
      },
      {
        x: 1450,
        width: 220,
        type: "brake",
        title: "EMERGENCY BRAKE",
        target: 2,
        reward: 950,
      },
    ],

    finishX: 1840,
  },

  // =======================================================
  // LEVEL 10 — CORE ABYSS
  // =======================================================
  {
    id: 10,
    name: "CORE ABYSS",
    difficulty: "FINAL",
    timeLimit: 135,
    fuel: 78,

    terrain: [
      [0, 420],
      [100, 280],
      [210, 520],
      [330, 220],
      [450, 540],
      [570, 200],
      [690, 520],
      [810, 180],
      [930, 540],
      [1050, 210],
      [1170, 530],
      [1290, 180],
      [1410, 540],
      [1530, 210],
      [1650, 520],
      [1770, 180],
      [1890, 500],
      [2020, 420],
    ],

    gaps: [
      {
        x: 210,
        width: 130,
      },
      {
        x: 450,
        width: 140,
      },
      {
        x: 690,
        width: 130,
      },
      {
        x: 930,
        width: 140,
      },
      {
        x: 1170,
        width: 130,
      },
      {
        x: 1410,
        width: 140,
      },
      {
        x: 1650,
        width: 130,
      },
      {
        x: 1890,
        width: 100,
      },
    ],

    obstacles: [
      {
        type: "rock",
        x: 150,
        size: 40,
      },
      {
        type: "moving",
        x: 380,
        minX: 300,
        maxX: 520,
        size: 46,
        speed: 2.7,
      },
      {
        type: "rock",
        x: 620,
        size: 46,
      },
      {
        type: "moving",
        x: 850,
        minX: 760,
        maxX: 1000,
        size: 48,
        speed: 3,
      },
      {
        type: "rock",
        x: 1090,
        size: 48,
      },
      {
        type: "moving",
        x: 1330,
        minX: 1240,
        maxX: 1460,
        size: 50,
        speed: 3.1,
      },
      {
        type: "rock",
        x: 1570,
        size: 50,
      },
      {
        type: "moving",
        x: 1810,
        minX: 1720,
        maxX: 1940,
        size: 52,
        speed: 3.2,
      },
      {
        type: "ramp",
        x: 1930,
        width: 120,
        height: 155,
      },
    ],

    coins: [
      110,
      260,
      400,
      560,
      720,
      880,
      1040,
      1200,
      1360,
      1520,
      1680,
      1840,
      1980,
    ],

    challenges: [
      {
        x: 130,
        width: 210,
        type: "speed",
        title: "CORE SPRINT",
        target: 9,
        reward: 1000,
      },
      {
        x: 380,
        width: 220,
        type: "jump",
        title: "ABYSS LEAP",
        target: 3,
        reward: 1100,
      },
      {
        x: 650,
        width: 220,
        type: "balance",
        title: "VOID CONTROL",
        target: 6,
        reward: 1200,
      },
      {
        x: 950,
        width: 230,
        type: "collect",
        title: "CORE SHARDS",
        target: 4,
        reward: 1200,
      },
      {
        x: 1250,
        width: 230,
        type: "speed",
        title: "FINAL TURBO",
        target: 10,
        reward: 1400,
      },
      {
        x: 1550,
        width: 230,
        type: "brake",
        title: "FINAL BRAKE",
        target: 2,
        reward: 1300,
      },
      {
        x: 1780,
        width: 220,
        type: "jump",
        title: "CORE GATE",
        target: 2,
        reward: 1500,
      },
    ],

    finishX: 1980,
  },
];

// =========================================================
// GET LEVEL
// =========================================================

export const getLevel = (levelNumber) => {
  return GAME_LEVELS[levelNumber - 1] ?? GAME_LEVELS[0];
};