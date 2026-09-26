import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./ShadowEscape.css";

/*
============================================================
 SHADOW ESCAPE
 2D ACTION / ESCAPE MINI GAME
============================================================

CONTROLS
A / D or ← / →  = Move
W / Space / ↑    = Jump
Shift / X        = Dash
S / ↓            = Shadow Mode
R                = Restart

10 LEVELS
- Forest
- Night Village
- Samurai Temple
- Storm Bridge
- Mountain Pass
- Volcano Shrine
- Haunted Village
- Frozen Temple
- Shadow Realm
- Ninja Fortress
============================================================
*/

const LEVELS = [
  {
    id: 1,
    name: "BAMBOO FOREST",
    theme: "forest",
    goal: "Reach the Shadow Gate",
    width: 2600,
    player: { x: 100, y: 420 },
    exit: { x: 2420, y: 420 },
    platforms: [
      { x: 0, y: 500, w: 520, h: 70 },
      { x: 620, y: 450, w: 330, h: 40 },
      { x: 1040, y: 500, w: 380, h: 70 },
      { x: 1510, y: 430, w: 300, h: 40 },
      { x: 1880, y: 500, w: 330, h: 70 },
      { x: 2260, y: 450, w: 340, h: 120 },
    ],
    coins: [
      [220, 450],
      [400, 450],
      [720, 400],
      [860, 400],
      [1160, 450],
      [1350, 450],
      [1610, 380],
      [1760, 380],
      [1990, 450],
      [2160, 450],
      [2350, 400],
    ],
    traps: [
      { x: 520, y: 535, w: 100, h: 35 },
      { x: 950, y: 470, w: 90, h: 30 },
      { x: 1420, y: 535, w: 90, h: 35 },
      { x: 1810, y: 465, w: 70, h: 35 },
      { x: 2210, y: 535, w: 50, h: 35 },
    ],
    enemies: [
      { x: 760, y: 400, w: 42, h: 50, min: 650, max: 910, speed: 1.2 },
      { x: 1990, y: 450, w: 42, h: 50, min: 1900, max: 2160, speed: 1.5 },
    ],
  },

  {
    id: 2,
    name: "NIGHT VILLAGE",
    theme: "village",
    goal: "Escape the guarded village",
    width: 2800,
    player: { x: 100, y: 420 },
    exit: { x: 2630, y: 420 },
    platforms: [
      { x: 0, y: 500, w: 430, h: 70 },
      { x: 520, y: 420, w: 260, h: 40 },
      { x: 870, y: 500, w: 430, h: 70 },
      { x: 1410, y: 440, w: 250, h: 40 },
      { x: 1760, y: 500, w: 360, h: 70 },
      { x: 2220, y: 400, w: 270, h: 40 },
      { x: 2550, y: 500, w: 250, h: 70 },
    ],
    coins: [
      [180, 450],
      [330, 450],
      [580, 370],
      [710, 370],
      [1000, 450],
      [1200, 450],
      [1470, 390],
      [1600, 390],
      [1850, 450],
      [2050, 450],
      [2290, 350],
      [2420, 350],
      [2630, 450],
    ],
    traps: [
      { x: 430, y: 535, w: 90, h: 35 },
      { x: 780, y: 535, w: 90, h: 35 },
      { x: 1300, y: 535, w: 110, h: 35 },
      { x: 1660, y: 535, w: 100, h: 35 },
      { x: 2120, y: 535, w: 100, h: 35 },
      { x: 2490, y: 535, w: 60, h: 35 },
    ],
    enemies: [
      { x: 620, y: 370, w: 42, h: 50, min: 540, max: 740, speed: 1.6 },
      { x: 1030, y: 450, w: 42, h: 50, min: 900, max: 1250, speed: 1.7 },
      { x: 1870, y: 450, w: 42, h: 50, min: 1780, max: 2070, speed: 1.9 },
    ],
  },

  {
    id: 3,
    name: "SAMURAI TEMPLE",
    theme: "temple",
    goal: "Cross the ancient temple",
    width: 3000,
    player: { x: 100, y: 420 },
    exit: { x: 2820, y: 420 },
    platforms: [
      { x: 0, y: 500, w: 400, h: 70 },
      { x: 480, y: 450, w: 250, h: 40 },
      { x: 820, y: 380, w: 260, h: 40 },
      { x: 1170, y: 500, w: 350, h: 70 },
      { x: 1610, y: 420, w: 250, h: 40 },
      { x: 1960, y: 340, w: 260, h: 40 },
      { x: 2310, y: 500, w: 330, h: 70 },
      { x: 2700, y: 430, w: 300, h: 40 },
    ],
    coins: [
      [170, 450],
      [320, 450],
      [530, 400],
      [680, 400],
      [870, 330],
      [1020, 330],
      [1280, 450],
      [1450, 450],
      [1680, 370],
      [1820, 370],
      [2030, 290],
      [2170, 290],
      [2420, 450],
      [2570, 450],
      [2780, 380],
      [2910, 380],
    ],
    traps: [
      { x: 400, y: 535, w: 80, h: 35 },
      { x: 730, y: 535, w: 90, h: 35 },
      { x: 1080, y: 535, w: 90, h: 35 },
      { x: 1520, y: 535, w: 90, h: 35 },
      { x: 1860, y: 535, w: 100, h: 35 },
      { x: 2220, y: 535, w: 90, h: 35 },
      { x: 2640, y: 535, w: 60, h: 35 },
    ],
    enemies: [
      { x: 540, y: 400, w: 42, h: 50, min: 500, max: 690, speed: 2 },
      { x: 1260, y: 450, w: 42, h: 50, min: 1190, max: 1490, speed: 2.1 },
      { x: 2020, y: 290, w: 42, h: 50, min: 1980, max: 2180, speed: 2.2 },
    ],
  },

  {
    id: 4,
    name: "STORM BRIDGE",
    theme: "storm",
    goal: "Cross the broken bridge",
    width: 3100,
    player: { x: 100, y: 400 },
    exit: { x: 2920, y: 400 },
    platforms: [
      { x: 0, y: 500, w: 350, h: 70 },
      { x: 450, y: 460, w: 180, h: 35 },
      { x: 720, y: 410, w: 170, h: 35 },
      { x: 980, y: 460, w: 180, h: 35 },
      { x: 1260, y: 390, w: 190, h: 35 },
      { x: 1530, y: 500, w: 330, h: 70 },
      { x: 1950, y: 430, w: 210, h: 35 },
      { x: 2250, y: 360, w: 190, h: 35 },
      { x: 2520, y: 500, w: 300, h: 70 },
      { x: 2880, y: 430, w: 220, h: 40 },
    ],
    coins: [
      [140, 450],
      [280, 450],
      [490, 410],
      [570, 410],
      [760, 360],
      [850, 360],
      [1010, 410],
      [1110, 410],
      [1300, 340],
      [1410, 340],
      [1650, 450],
      [1810, 450],
      [1990, 380],
      [2110, 380],
      [2290, 310],
      [2390, 310],
      [2600, 450],
      [2760, 450],
      [2930, 380],
    ],
    traps: [
      { x: 350, y: 535, w: 100, h: 35 },
      { x: 630, y: 535, w: 90, h: 35 },
      { x: 890, y: 535, w: 90, h: 35 },
      { x: 1160, y: 535, w: 100, h: 35 },
      { x: 1450, y: 535, w: 80, h: 35 },
      { x: 1860, y: 535, w: 90, h: 35 },
      { x: 2160, y: 535, w: 90, h: 35 },
      { x: 2440, y: 535, w: 80, h: 35 },
      { x: 2820, y: 535, w: 60, h: 35 },
    ],
    enemies: [
      { x: 540, y: 410, w: 42, h: 50, min: 470, max: 600, speed: 2.2 },
      { x: 1600, y: 450, w: 42, h: 50, min: 1550, max: 1830, speed: 2.3 },
      { x: 2600, y: 450, w: 42, h: 50, min: 2550, max: 2780, speed: 2.5 },
    ],
  },

  {
    id: 5,
    name: "MOUNTAIN PASS",
    theme: "mountain",
    goal: "Climb through the mountain",
    width: 3200,
    player: { x: 100, y: 420 },
    exit: { x: 3020, y: 330 },
    platforms: [
      { x: 0, y: 500, w: 420, h: 70 },
      { x: 500, y: 440, w: 220, h: 35 },
      { x: 800, y: 370, w: 220, h: 35 },
      { x: 1110, y: 300, w: 200, h: 35 },
      { x: 1400, y: 440, w: 250, h: 35 },
      { x: 1740, y: 350, w: 230, h: 35 },
      { x: 2050, y: 270, w: 230, h: 35 },
      { x: 2370, y: 430, w: 250, h: 35 },
      { x: 2700, y: 350, w: 250, h: 35 },
      { x: 2990, y: 390, w: 210, h: 40 },
    ],
    coins: [
      [180, 450],
      [330, 450],
      [550, 390],
      [670, 390],
      [850, 320],
      [970, 320],
      [1150, 250],
      [1260, 250],
      [1460, 390],
      [1590, 390],
      [1800, 300],
      [1920, 300],
      [2110, 220],
      [2240, 220],
      [2430, 380],
      [2570, 380],
      [2760, 300],
      [2880, 300],
      [3040, 340],
    ],
    traps: [
      { x: 420, y: 535, w: 80, h: 35 },
      { x: 720, y: 535, w: 80, h: 35 },
      { x: 1020, y: 535, w: 90, h: 35 },
      { x: 1310, y: 535, w: 90, h: 35 },
      { x: 1650, y: 535, w: 90, h: 35 },
      { x: 1970, y: 535, w: 80, h: 35 },
      { x: 2280, y: 535, w: 90, h: 35 },
      { x: 2620, y: 535, w: 80, h: 35 },
      { x: 2950, y: 535, w: 40, h: 35 },
    ],
    enemies: [
      { x: 570, y: 390, w: 42, h: 50, min: 520, max: 690, speed: 2 },
      { x: 1180, y: 250, w: 42, h: 50, min: 1130, max: 1270, speed: 2.3 },
      { x: 1810, y: 300, w: 42, h: 50, min: 1770, max: 1930, speed: 2.5 },
      { x: 2780, y: 300, w: 42, h: 50, min: 2730, max: 2910, speed: 2.7 },
    ],
  },

  {
    id: 6,
    name: "VOLCANO SHRINE",
    theme: "volcano",
    goal: "Escape the burning shrine",
    width: 3300,
    player: { x: 100, y: 420 },
    exit: { x: 3100, y: 400 },
    platforms: [
      { x: 0, y: 500, w: 400, h: 70 },
      { x: 480, y: 420, w: 230, h: 35 },
      { x: 800, y: 500, w: 300, h: 70 },
      { x: 1190, y: 390, w: 230, h: 35 },
      { x: 1510, y: 320, w: 220, h: 35 },
      { x: 1820, y: 500, w: 300, h: 70 },
      { x: 2210, y: 410, w: 220, h: 35 },
      { x: 2530, y: 330, w: 240, h: 35 },
      { x: 2860, y: 500, w: 300, h: 70 },
      { x: 3100, y: 430, w: 200, h: 40 },
    ],
    coins: [
      [170, 450],
      [320, 450],
      [520, 370],
      [650, 370],
      [880, 450],
      [1030, 450],
      [1230, 340],
      [1370, 340],
      [1550, 270],
      [1680, 270],
      [1910, 450],
      [2050, 450],
      [2250, 360],
      [2380, 360],
      [2580, 280],
      [2710, 280],
      [2940, 450],
      [3070, 450],
      [3170, 380],
    ],
    traps: [
      { x: 400, y: 535, w: 80, h: 35 },
      { x: 710, y: 535, w: 90, h: 35 },
      { x: 1100, y: 535, w: 90, h: 35 },
      { x: 1420, y: 535, w: 90, h: 35 },
      { x: 1730, y: 535, w: 90, h: 35 },
      { x: 2120, y: 535, w: 90, h: 35 },
      { x: 2430, y: 535, w: 100, h: 35 },
      { x: 2770, y: 535, w: 90, h: 35 },
      { x: 3160, y: 535, w: 30, h: 35 },
    ],
    enemies: [
      { x: 540, y: 370, w: 42, h: 50, min: 500, max: 670, speed: 2.3 },
      { x: 920, y: 450, w: 42, h: 50, min: 840, max: 1060, speed: 2.4 },
      { x: 1580, y: 270, w: 42, h: 50, min: 1530, max: 1690, speed: 2.6 },
      { x: 2280, y: 360, w: 42, h: 50, min: 2230, max: 2390, speed: 2.8 },
    ],
  },

  {
    id: 7,
    name: "HAUNTED VILLAGE",
    theme: "haunted",
    goal: "Find the hidden portal",
    width: 3400,
    player: { x: 100, y: 420 },
    exit: { x: 3210, y: 430 },
    platforms: [
      { x: 0, y: 500, w: 500, h: 70 },
      { x: 580, y: 430, w: 230, h: 35 },
      { x: 900, y: 350, w: 220, h: 35 },
      { x: 1210, y: 500, w: 300, h: 70 },
      { x: 1600, y: 400, w: 250, h: 35 },
      { x: 1940, y: 320, w: 240, h: 35 },
      { x: 2270, y: 500, w: 330, h: 70 },
      { x: 2690, y: 410, w: 230, h: 35 },
      { x: 3000, y: 500, w: 400, h: 70 },
    ],
    coins: [
      [180, 450],
      [370, 450],
      [630, 380],
      [750, 380],
      [940, 300],
      [1060, 300],
      [1290, 450],
      [1440, 450],
      [1650, 350],
      [1790, 350],
      [1980, 270],
      [2120, 270],
      [2360, 450],
      [2520, 450],
      [2740, 360],
      [2870, 360],
      [3090, 450],
      [3240, 450],
    ],
    traps: [
      { x: 500, y: 535, w: 80, h: 35 },
      { x: 810, y: 535, w: 90, h: 35 },
      { x: 1120, y: 535, w: 90, h: 35 },
      { x: 1510, y: 535, w: 90, h: 35 },
      { x: 1850, y: 535, w: 90, h: 35 },
      { x: 2180, y: 535, w: 90, h: 35 },
      { x: 2600, y: 535, w: 90, h: 35 },
      { x: 2920, y: 535, w: 80, h: 35 },
    ],
    enemies: [
      { x: 650, y: 380, w: 42, h: 50, min: 600, max: 770, speed: 2.1 },
      { x: 990, y: 300, w: 42, h: 50, min: 920, max: 1070, speed: 2.5 },
      { x: 1700, y: 350, w: 42, h: 50, min: 1630, max: 1810, speed: 2.7 },
      { x: 2440, y: 450, w: 42, h: 50, min: 2300, max: 2560, speed: 2.8 },
    ],
  },

  {
    id: 8,
    name: "FROZEN TEMPLE",
    theme: "ice",
    goal: "Reach the frozen gate",
    width: 3500,
    player: { x: 100, y: 420 },
    exit: { x: 3300, y: 400 },
    platforms: [
      { x: 0, y: 500, w: 420, h: 70 },
      { x: 500, y: 400, w: 220, h: 35 },
      { x: 800, y: 320, w: 220, h: 35 },
      { x: 1100, y: 500, w: 330, h: 70 },
      { x: 1510, y: 420, w: 240, h: 35 },
      { x: 1840, y: 340, w: 240, h: 35 },
      { x: 2170, y: 500, w: 300, h: 70 },
      { x: 2560, y: 400, w: 240, h: 35 },
      { x: 2890, y: 330, w: 230, h: 35 },
      { x: 3200, y: 480, w: 300, h: 90 },
    ],
    coins: [
      [160, 450],
      [320, 450],
      [540, 350],
      [670, 350],
      [850, 270],
      [980, 270],
      [1190, 450],
      [1360, 450],
      [1570, 370],
      [1700, 370],
      [1900, 290],
      [2030, 290],
      [2260, 450],
      [2410, 450],
      [2620, 350],
      [2750, 350],
      [2950, 280],
      [3070, 280],
      [3270, 430],
    ],
    traps: [
      { x: 420, y: 535, w: 80, h: 35 },
      { x: 720, y: 535, w: 80, h: 35 },
      { x: 1020, y: 535, w: 80, h: 35 },
      { x: 1430, y: 535, w: 80, h: 35 },
      { x: 1750, y: 535, w: 90, h: 35 },
      { x: 2080, y: 535, w: 90, h: 35 },
      { x: 2470, y: 535, w: 90, h: 35 },
      { x: 2800, y: 535, w: 90, h: 35 },
      { x: 3120, y: 535, w: 80, h: 35 },
    ],
    enemies: [
      { x: 580, y: 350, w: 42, h: 50, min: 530, max: 680, speed: 2.4 },
      { x: 1240, y: 450, w: 42, h: 50, min: 1150, max: 1370, speed: 2.5 },
      { x: 1930, y: 290, w: 42, h: 50, min: 1870, max: 2030, speed: 2.8 },
      { x: 2660, y: 350, w: 42, h: 50, min: 2600, max: 2760, speed: 3 },
    ],
  },

  {
    id: 9,
    name: "SHADOW REALM",
    theme: "shadow",
    goal: "Enter the forbidden portal",
    width: 3700,
    player: { x: 100, y: 420 },
    exit: { x: 3500, y: 400 },
    platforms: [
      { x: 0, y: 500, w: 420, h: 70 },
      { x: 500, y: 420, w: 200, h: 35 },
      { x: 780, y: 340, w: 200, h: 35 },
      { x: 1060, y: 440, w: 210, h: 35 },
      { x: 1350, y: 300, w: 230, h: 35 },
      { x: 1660, y: 500, w: 280, h: 70 },
      { x: 2020, y: 380, w: 230, h: 35 },
      { x: 2340, y: 290, w: 220, h: 35 },
      { x: 2650, y: 420, w: 240, h: 35 },
      { x: 2980, y: 330, w: 240, h: 35 },
      { x: 3310, y: 500, w: 390, h: 70 },
    ],
    coins: [
      [160, 450],
      [320, 450],
      [540, 370],
      [660, 370],
      [820, 290],
      [940, 290],
      [1100, 390],
      [1220, 390],
      [1390, 250],
      [1530, 250],
      [1750, 450],
      [1880, 450],
      [2070, 330],
      [2190, 330],
      [2390, 240],
      [2510, 240],
      [2700, 370],
      [2840, 370],
      [3030, 280],
      [3160, 280],
      [3400, 450],
      [3550, 450],
    ],
    traps: [
      { x: 420, y: 535, w: 80, h: 35 },
      { x: 700, y: 535, w: 80, h: 35 },
      { x: 980, y: 535, w: 80, h: 35 },
      { x: 1270, y: 535, w: 80, h: 35 },
      { x: 1580, y: 535, w: 80, h: 35 },
      { x: 1940, y: 535, w: 80, h: 35 },
      { x: 2250, y: 535, w: 90, h: 35 },
      { x: 2560, y: 535, w: 90, h: 35 },
      { x: 2890, y: 535, w: 90, h: 35 },
      { x: 3220, y: 535, w: 90, h: 35 },
    ],
    enemies: [
      { x: 550, y: 370, w: 42, h: 50, min: 520, max: 660, speed: 2.8 },
      { x: 850, y: 290, w: 42, h: 50, min: 800, max: 940, speed: 3 },
      { x: 1410, y: 250, w: 42, h: 50, min: 1370, max: 1540, speed: 3.1 },
      { x: 2100, y: 330, w: 42, h: 50, min: 2050, max: 2210, speed: 3.2 },
      { x: 2740, y: 370, w: 42, h: 50, min: 2690, max: 2830, speed: 3.3 },
    ],
  },

  {
    id: 10,
    name: "NINJA FORTRESS",
    theme: "fortress",
    goal: "Defeat the final shadow and escape",
    width: 3900,
    player: { x: 100, y: 420 },
    exit: { x: 3700, y: 390 },
    platforms: [
      { x: 0, y: 500, w: 450, h: 70 },
      { x: 530, y: 420, w: 220, h: 35 },
      { x: 830, y: 330, w: 230, h: 35 },
      { x: 1140, y: 460, w: 240, h: 35 },
      { x: 1460, y: 350, w: 240, h: 35 },
      { x: 1780, y: 500, w: 300, h: 70 },
      { x: 2180, y: 400, w: 250, h: 35 },
      { x: 2520, y: 300, w: 240, h: 35 },
      { x: 2860, y: 450, w: 250, h: 35 },
      { x: 3200, y: 340, w: 250, h: 35 },
      { x: 3540, y: 500, w: 360, h: 70 },
      { x: 3670, y: 420, w: 230, h: 40 },
    ],
    coins: [
      [170, 450],
      [330, 450],
      [570, 370],
      [700, 370],
      [880, 280],
      [1010, 280],
      [1190, 410],
      [1320, 410],
      [1510, 300],
      [1640, 300],
      [1870, 450],
      [2010, 450],
      [2230, 350],
      [2370, 350],
      [2570, 250],
      [2700, 250],
      [2920, 400],
      [3060, 400],
      [3260, 290],
      [3400, 290],
      [3600, 450],
      [3750, 370],
    ],
    traps: [
      { x: 450, y: 535, w: 80, h: 35 },
      { x: 750, y: 535, w: 80, h: 35 },
      { x: 1060, y: 535, w: 80, h: 35 },
      { x: 1380, y: 535, w: 80, h: 35 },
      { x: 1700, y: 535, w: 80, h: 35 },
      { x: 2080, y: 535, w: 100, h: 35 },
      { x: 2430, y: 535, w: 90, h: 35 },
      { x: 2760, y: 535, w: 100, h: 35 },
      { x: 3110, y: 535, w: 90, h: 35 },
      { x: 3450, y: 535, w: 90, h: 35 },
    ],
    enemies: [
      { x: 590, y: 370, w: 42, h: 50, min: 550, max: 710, speed: 3 },
      { x: 900, y: 280, w: 42, h: 50, min: 850, max: 1020, speed: 3.1 },
      { x: 1220, y: 410, w: 42, h: 50, min: 1170, max: 1340, speed: 3.2 },
      { x: 1540, y: 300, w: 42, h: 50, min: 1490, max: 1660, speed: 3.3 },
      { x: 2250, y: 350, w: 42, h: 50, min: 2200, max: 2370, speed: 3.4 },
      { x: 3290, y: 290, w: 42, h: 50, min: 3240, max: 3410, speed: 3.5 },
    ],
  },
];

const PLAYER_W = 42;
const PLAYER_H = 58;
const GRAVITY = 0.72;
const MOVE_SPEED = 5;
const JUMP_POWER = 13;
const DASH_SPEED = 16;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const intersects = (a, b) =>
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y;

function ShadowEscape() {
  const [level, setLevel] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState("");
  const [shadowMode, setShadowMode] = useState(false);
  const [dashReady, setDashReady] = useState(true);
  const [cameraX, setCameraX] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runId, setRunId] = useState(0);

  const keysRef = useRef({});
  const frameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gameRef = useRef(null);
  const containerRef = useRef(null);

  const currentLevel = useMemo(
    () => LEVELS.find((item) => item.id === level) || LEVELS[0],
    [level]
  );

  const createGame = useCallback((levelNumber) => {
    const data = LEVELS[levelNumber - 1];

    return {
      player: {
        x: data.player.x,
        y: data.player.y,
        vx: 0,
        vy: 0,
        grounded: false,
        direction: 1,
        dashTimer: 0,
        invincible: 0,
        jumpLock: false,
      },
      coins: data.coins.map(([x, y], index) => ({
        id: index,
        x,
        y,
        collected: false,
      })),
      enemies: data.enemies.map((enemy, index) => ({
        ...enemy,
        id: index,
        direction: 1,
      })),
      score: 0,
      coinsCollected: 0,
      startTime: performance.now(),
    };
  }, []);

  const startGame = useCallback(
    (levelNumber = level) => {
      cancelAnimationFrame(frameRef.current);

      gameRef.current = createGame(levelNumber);

      setLevel(levelNumber);
      setScore(0);
      setCoins(0);
      setLives(3);
      setCompleted(false);
      setGameOver(false);
      setMessage("");
      setShadowMode(false);
      setDashReady(true);
      setCameraX(0);
      setPlaying(true);
      setRunId((value) => value + 1);
    },
    [createGame, level]
  );

  const resetGame = useCallback(() => {
    startGame(level);
  }, [level, startGame]);

  const damagePlayer = useCallback(() => {
    const game = gameRef.current;

    if (!game || game.player.invincible > 0) return;

    const nextLives = lives - 1;

    if (nextLives <= 0) {
      setLives(0);
      setGameOver(true);
      setPlaying(false);
      setMessage("THE SHADOW CONSUMED YOU");
      return;
    }

    setLives(nextLives);
    setMessage("SHADOW HIT!");

    game.player.x = LEVELS[level - 1].player.x;
    game.player.y = LEVELS[level - 1].player.y;
    game.player.vx = 0;
    game.player.vy = 0;
    game.player.invincible = 120;
    setCameraX(0);
  }, [level, lives]);

  const completeLevel = useCallback(() => {
    if (completed || !gameRef.current) return;

    const game = gameRef.current;
    const levelBonus = level * 500;
    const coinBonus = game.coinsCollected * 100;
    const total = levelBonus + coinBonus;

    setScore((value) => value + total);
    setCompleted(true);
    setPlaying(false);
    setMessage(
      level === LEVELS.length
        ? "ALL SHADOWS DEFEATED"
        : "SHADOW GATE REACHED"
    );
  }, [completed, level]);

  const nextLevel = useCallback(() => {
    if (level >= LEVELS.length) {
      setCompleted(false);
      setGameOver(false);
      setPlaying(false);
      setMessage("NEURAL ARCADE COMPLETE");
      return;
    }

    startGame(level + 1);
  }, [level, startGame]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      keysRef.current[key] = true;

      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(
          key
        )
      ) {
        event.preventDefault();
      }

      if (!playing || !gameRef.current) return;

      const player = gameRef.current.player;

      if (
        (key === "arrowup" || key === "w" || key === " ") &&
        player.grounded &&
        !player.jumpLock
      ) {
        player.vy = -JUMP_POWER;
        player.grounded = false;
        player.jumpLock = true;
      }

      if (key === "shift" || key === "x") {
        if (dashReady && player.dashTimer <= 0) {
          player.vx = player.direction * DASH_SPEED;
          player.dashTimer = 18;
          setDashReady(false);

          window.setTimeout(() => {
            setDashReady(true);
          }, 900);
        }
      }

      if (key === "s" || key === "arrowdown") {
        setShadowMode(true);
      }

      if (key === "r") {
        resetGame();
      }

      if (key === "f") {
        toggleFullscreen();
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();

      keysRef.current[key] = false;

      if (
        key === "arrowup" ||
        key === "w" ||
        key === " "
      ) {
        if (gameRef.current) {
          gameRef.current.player.jumpLock = false;
        }
      }

      if (key === "s" || key === "arrowdown") {
        setShadowMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playing, dashReady, resetGame]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    if (!playing || !gameRef.current) return;

    cancelAnimationFrame(frameRef.current);

    const loop = (time) => {
      const game = gameRef.current;

      if (!game || !playing) return;

      const delta = Math.min(
        2,
        (time - lastTimeRef.current || 16) / 16
      );

      lastTimeRef.current = time;

      const player = game.player;
      const data = LEVELS[level - 1];
      const keys = keysRef.current;

      const left =
        keys["arrowleft"] || keys["a"];

      const right =
        keys["arrowright"] || keys["d"];

      if (left) {
        player.vx -= 0.8 * delta;
        player.direction = -1;
      }

      if (right) {
        player.vx += 0.8 * delta;
        player.direction = 1;
      }

      if (!left && !right) {
        player.vx *= Math.pow(0.78, delta);
      }

      player.vx = clamp(
        player.vx,
        -MOVE_SPEED * 1.8,
        MOVE_SPEED * 1.8
      );

      if (player.dashTimer > 0) {
        player.dashTimer -= delta;
      }

      if (player.invincible > 0) {
        player.invincible -= delta;
      }

      player.vy += GRAVITY * delta;

      const previousBottom =
        player.y + PLAYER_H;

      player.x += player.vx * delta;
      player.y += player.vy * delta;

      player.x = clamp(
        player.x,
        0,
        data.width - PLAYER_W
      );

      player.grounded = false;

      for (const platform of data.platforms) {
        const horizontalOverlap =
          player.x + PLAYER_W > platform.x &&
          player.x < platform.x + platform.w;

        const landing =
          horizontalOverlap &&
          previousBottom <= platform.y + 5 &&
          player.y + PLAYER_H >= platform.y &&
          player.vy >= 0;

        if (landing) {
          player.y = platform.y - PLAYER_H;
          player.vy = 0;
          player.grounded = true;
        }
      }

      if (player.y > 700) {
        damagePlayer();
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      for (const trap of data.traps) {
        const trapHit = intersects(
          {
            x: trap.x + 5,
            y: trap.y,
            w: Math.max(1, trap.w - 10),
            h: trap.h,
          },
          {
            x: player.x,
            y: player.y + 8,
            w: PLAYER_W,
            h: PLAYER_H - 10,
          }
        );

        if (trapHit) {
          damagePlayer();
          break;
        }
      }

      for (const enemy of game.enemies) {
        enemy.x += enemy.speed * enemy.direction * delta;

        if (enemy.x <= enemy.min) {
          enemy.x = enemy.min;
          enemy.direction = 1;
        }

        if (enemy.x >= enemy.max) {
          enemy.x = enemy.max;
          enemy.direction = -1;
        }

        const enemyHit = intersects(
          {
            x: enemy.x,
            y: enemy.y,
            w: enemy.w,
            h: enemy.h,
          },
          {
            x: player.x + 5,
            y: player.y + 5,
            w: PLAYER_W - 10,
            h: PLAYER_H - 10,
          }
        );

        if (
          enemyHit &&
          !shadowMode &&
          player.dashTimer <= 0
        ) {
          damagePlayer();
          break;
        }

        if (
          enemyHit &&
          player.dashTimer > 0
        ) {
          enemy.x += player.direction * 100;
          setScore((value) => value + 150);
        }
      }

      for (const coin of game.coins) {
        if (coin.collected) continue;

        const coinHit = intersects(
          {
            x: coin.x - 10,
            y: coin.y - 10,
            w: 20,
            h: 20,
          },
          {
            x: player.x,
            y: player.y,
            w: PLAYER_W,
            h: PLAYER_H,
          }
        );

        if (coinHit) {
          coin.collected = true;
          game.coinsCollected += 1;

          setCoins(game.coinsCollected);
          setScore((value) => value + 100);
        }
      }

      const exitHit = intersects(
        {
          x: data.exit.x,
          y: data.exit.y,
          w: 70,
          h: 110,
        },
        {
          x: player.x,
          y: player.y,
          w: PLAYER_W,
          h: PLAYER_H,
        }
      );

      if (exitHit) {
        completeLevel();
        return;
      }

      const targetCamera =
        player.x - window.innerWidth * 0.35;

      setCameraX(
        clamp(
          targetCamera,
          0,
          Math.max(
            0,
            data.width - window.innerWidth
          )
        )
      );

      frameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [
    playing,
    level,
    runId,
    shadowMode,
    damagePlayer,
    completeLevel,
  ]);

  const currentScore = gameRef.current?.score || 0;

  return (
    <div
      ref={containerRef}
      className={`shadow-escape ${currentLevel.theme}`}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="shadow-header">
        <div className="shadow-brand">
          <div className="shadow-brand-icon">🥷</div>

          <div>
            <span>NEURAL ARCADE // ACTION</span>
            <h1>SHADOW ESCAPE</h1>
          </div>
        </div>

        <div className="shadow-header-actions">
          <button
            onClick={toggleFullscreen}
            className="shadow-header-button"
          >
            {isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
          </button>

          <button
            onClick={resetGame}
            className="shadow-header-button danger"
          >
            RESET
          </button>
        </div>
      </header>

      {/* ======================================================
          HUD
      ====================================================== */}

      <section className="shadow-hud">
        <div className="hud-box">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")} / 10
          </strong>
        </div>

        <div className="hud-box">
          <span>COINS</span>
          <strong>🪙 {coins}</strong>
        </div>

        <div className="hud-box">
          <span>SCORE</span>
          <strong>{score + currentScore}</strong>
        </div>

        <div className="hud-box">
          <span>LIVES</span>
          <strong className="lives">
            {"❤".repeat(lives)}
            {"♡".repeat(3 - lives)}
          </strong>
        </div>

        <div className="hud-box dash-status">
          <span>DASH</span>
          <strong>
            {dashReady ? "READY" : "CHARGING"}
          </strong>
        </div>

        <div className="hud-box shadow-status">
          <span>SHADOW</span>
          <strong>
            {shadowMode ? "ACTIVE" : "HIDDEN"}
          </strong>
        </div>
      </section>

      {/* ======================================================
          LEVEL SELECT
      ====================================================== */}

      <section className="level-selector">
        <div className="level-selector-title">
          <span>SHADOW MISSIONS</span>
          <small>SELECT LEVEL</small>
        </div>

        <div className="level-list">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              className={`level-button ${
                level === item.id ? "active" : ""
              }`}
              onClick={() => startGame(item.id)}
            >
              <span>{String(item.id).padStart(2, "0")}</span>
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
      </section>

      {/* ======================================================
          GAME
      ====================================================== */}

      <main className="shadow-game-wrapper">
        <div className="shadow-game-info">
          <div>
            <span>
              MISSION {String(level).padStart(2, "0")}
            </span>
            <strong>{currentLevel.name}</strong>
          </div>

          <p>{currentLevel.goal}</p>
        </div>

        <div className="shadow-game-window">
          <div
            className="shadow-world"
            style={{
              width: currentLevel.width,
              transform: `translateX(-${cameraX}px)`,
            }}
          >
            {/* BACKGROUND DECOR */}

            <div className="moon">
              ◐
            </div>

            <div className="mountain-bg mountain-one" />
            <div className="mountain-bg mountain-two" />

            <div className="world-title">
              {currentLevel.name}
            </div>

            {/* PLATFORM */}

            {currentLevel.platforms.map(
              (platform, index) => (
                <div
                  key={`platform-${index}`}
                  className="shadow-platform"
                  style={{
                    left: platform.x,
                    top: platform.y,
                    width: platform.w,
                    height: platform.h,
                  }}
                >
                  <div className="platform-glow" />
                </div>
              )
            )}

            {/* TRAPS */}

            {currentLevel.traps.map(
              (trap, index) => (
                <div
                  key={`trap-${index}`}
                  className="shadow-trap"
                  style={{
                    left: trap.x,
                    top: trap.y,
                    width: trap.w,
                    height: trap.h,
                  }}
                >
                  <div className="spikes">
                    ▲ ▲ ▲ ▲
                  </div>
                </div>
              )
            )}

            {/* COINS */}

            {gameRef.current?.coins.map(
              (coin) =>
                !coin.collected && (
                  <div
                    key={`coin-${coin.id}`}
                    className="shadow-coin"
                    style={{
                      left: coin.x,
                      top: coin.y,
                    }}
                  >
                    ◈
                  </div>
                )
            )}

            {/* ENEMIES */}

            {gameRef.current?.enemies.map(
              (enemy) => (
                <div
                  key={`enemy-${enemy.id}`}
                  className="shadow-enemy"
                  style={{
                    left: enemy.x,
                    top: enemy.y,
                  }}
                >
                  <span className="enemy-eye left" />
                  <span className="enemy-eye right" />
                  <div className="enemy-mask" />
                </div>
              )
            )}

            {/* EXIT */}

            <div
              className="shadow-exit"
              style={{
                left: currentLevel.exit.x,
                top: currentLevel.exit.y,
              }}
            >
              <div className="exit-ring">
                <span>EXIT</span>
              </div>
            </div>

            {/* PLAYER */}

            {gameRef.current && (
              <div
                className={`shadow-player ${
                  shadowMode ? "shadow-active" : ""
                } ${
                  gameRef.current.player.invincible > 0
                    ? "player-hit"
                    : ""
                } ${
                  gameRef.current.player.dashTimer > 0
                    ? "player-dashing"
                    : ""
                }`}
                style={{
                  left: gameRef.current.player.x,
                  top: gameRef.current.player.y,
                  transform: `scaleX(${
                    gameRef.current.player.direction
                  })`,
                }}
              >
                <div className="player-shadow" />
                <div className="ninja-body">
                  <div className="ninja-head">
                    <span />
                  </div>

                  <div className="ninja-torso" />

                  <div className="ninja-arm arm-one" />
                  <div className="ninja-arm arm-two" />

                  <div className="ninja-leg leg-one" />
                  <div className="ninja-leg leg-two" />

                  <div className="ninja-sword" />
                </div>
              </div>
            )}

            {/* FINISH FLAG */}

            <div
              className="finish-flag"
              style={{
                left: currentLevel.exit.x + 60,
                top: currentLevel.exit.y - 20,
              }}
            >
              ◆
            </div>
          </div>

          {/* START OVERLAY */}

          {!playing &&
            !completed &&
            !gameOver && (
              <div className="shadow-overlay">
                <div className="overlay-card">
                  <div className="overlay-icon">
                    🥷
                  </div>

                  <span className="overlay-label">
                    SHADOW PROTOCOL
                  </span>

                  <h2>ESCAPE THE SHADOW</h2>

                  <p>
                    Dodge traps, avoid guards,
                    collect coins and reach the
                    Shadow Gate.
                  </p>

                  <div className="control-grid">
                    <div>
                      <b>A / D</b>
                      <span>MOVE</span>
                    </div>

                    <div>
                      <b>SPACE</b>
                      <span>JUMP</span>
                    </div>

                    <div>
                      <b>SHIFT</b>
                      <span>DASH</span>
                    </div>

                    <div>
                      <b>S</b>
                      <span>SHADOW</span>
                    </div>
                  </div>

                  <button
                    className="start-shadow-button"
                    onClick={() => startGame(level)}
                  >
                    START MISSION
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

          {/* COMPLETE */}

          {completed && (
            <div className="shadow-overlay complete-overlay">
              <div className="overlay-card">
                <div className="complete-icon">
                  {level === 10 ? "👑" : "⚔"}
                </div>

                <span className="overlay-label">
                  {level === 10
                    ? "FINAL MISSION"
                    : "MISSION COMPLETE"}
                </span>

                <h2>
                  {level === 10
                    ? "SHADOW MASTER"
                    : "GATE REACHED"}
                </h2>

                <p>{message}</p>

                <div className="result-stats">
                  <div>
                    <span>COINS</span>
                    <strong>{coins}</strong>
                  </div>

                  <div>
                    <span>SCORE</span>
                    <strong>
                      {score + level * 500}
                    </strong>
                  </div>

                  <div>
                    <span>LEVEL</span>
                    <strong>{level}/10</strong>
                  </div>
                </div>

                {level < 10 ? (
                  <button
                    className="start-shadow-button"
                    onClick={nextLevel}
                  >
                    NEXT MISSION
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    className="start-shadow-button"
                    onClick={() => startGame(1)}
                  >
                    PLAY AGAIN
                    <span>↻</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* GAME OVER */}

          {gameOver && (
            <div className="shadow-overlay game-over-overlay">
              <div className="overlay-card">
                <div className="game-over-icon">
                  ☠
                </div>

                <span className="overlay-label">
                  MISSION FAILED
                </span>

                <h2>THE SHADOW WON</h2>

                <p>{message}</p>

                <button
                  className="start-shadow-button"
                  onClick={resetGame}
                >
                  TRY AGAIN
                  <span>↻</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================
            BOTTOM CONTROLS
        ================================================== */}

        <div className="shadow-controls">
          <div className="control-item">
            <span>MOVE</span>
            <b>A / D</b>
          </div>

          <div className="control-item">
            <span>JUMP</span>
            <b>SPACE</b>
          </div>

          <div className="control-item">
            <span>DASH</span>
            <b>SHIFT / X</b>
          </div>

          <div className="control-item">
            <span>SHADOW</span>
            <b>S / ↓</b>
          </div>

          <div className="control-item">
            <span>RESTART</span>
            <b>R</b>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ShadowEscape;