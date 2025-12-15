// ============================================
// VERONIC FORMULA FRONT - Game Data
// ============================================

const GAME_DATA = {
  // === FRAMES (Base Robots) ===
  frames: {
    'HL-AF01': {
      id: 'HL-AF01',
      name: 'HELION STRIKER',
      manufacturer: 'Helion Dynamics',
      rarity: 'rare',
      description: 'Precision aerospace assault frame. High mobility, optimized for ranged engagements.',
      baseStats: {
        hp: 1200, energyOutput: 800, cpuCap: 600, weightCap: 1200, heatCap: 400, tap: 8, mobility: 85,
        armor: { head: 30, shoulder: 40, body: 60, leg: 45 }
      },
      bonuses: { rangedAtk: 0.10, mobility: 0.10 }
    },
    'KF-SF01': {
      id: 'KF-SF01',
      name: 'KRONFORGE TITAN',
      manufacturer: 'Kronforge Industrial',
      rarity: 'epic',
      description: 'Heavy siege platform. Maximum armor and stability at cost of speed.',
      baseStats: {
        hp: 2000, energyOutput: 600, cpuCap: 500, weightCap: 2000, heatCap: 600, tap: 6, mobility: 50,
        armor: { head: 60, shoulder: 80, body: 120, leg: 90 }
      },
      bonuses: { bodyArmor: 0.25, stability: 0.20 }
    },
    'SC-RF01': {
      id: 'SC-RF01',
      name: 'SERAPHIS PHANTOM',
      manufacturer: 'Seraphis Cybernetica',
      rarity: 'epic',
      description: 'Neural-linked recon unit. Advanced cooling and sensor arrays.',
      baseStats: {
        hp: 900, energyOutput: 900, cpuCap: 800, weightCap: 900, heatCap: 300, tap: 12, mobility: 95,
        armor: { head: 25, shoulder: 30, body: 45, leg: 35 }
      },
      bonuses: { cooling: 0.20, accuracy: 0.10, evasion: 0.08 }
    },
    'VK-MF01': {
      id: 'VK-MF01',
      name: 'VALKAR GUARDIAN',
      manufacturer: 'Valkar Frontier Guard',
      rarity: 'common',
      description: 'Reliable militia workhorse. Balanced performance, easy maintenance.',
      baseStats: {
        hp: 1400, energyOutput: 700, cpuCap: 550, weightCap: 1400, heatCap: 450, tap: 7, mobility: 70,
        armor: { head: 40, shoulder: 50, body: 75, leg: 55 }
      },
      bonuses: { rangedAtk: 0.05, bodyArmor: 0.05 }
    }
  },

  // === PARTS ===
  parts: {
    // HEADS
    'HD-12': {
      id: 'HD-12', slot: 'head', name: 'RECON VISOR', manufacturer: 'Seraphis', rarity: 'rare',
      stats: { accuracy: 15, headArmor: 5 }, costs: { energy: 10, heat: 2, cpu: 5, weight: 20 }
    },
    'HV-33': {
      id: 'HV-33', slot: 'head', name: 'ASSAULT HELM', manufacturer: 'Helion', rarity: 'epic',
      stats: { rangedAtk: 12, mobility: 5, headArmor: 15 }, costs: { energy: 15, heat: 3, cpu: 8, weight: 30 }
    },
    'KG-9': {
      id: 'KG-9', slot: 'head', name: 'BUNKER HEAD', manufacturer: 'Kronforge', rarity: 'legendary',
      stats: { bodyArmor: 20, stability: 15, headArmor: 35 }, costs: { energy: 20, heat: 5, cpu: 10, weight: 60 }
    },
    'VK-H1': {
      id: 'VK-H1', slot: 'head', name: 'FRONTIER SENSOR', manufacturer: 'Valkar', rarity: 'common',
      stats: { accuracy: 8, headArmor: 10 }, costs: { energy: 8, heat: 1, cpu: 4, weight: 15 }
    },

    // TORSOS
    'KR-MT': {
      id: 'KR-MT', slot: 'torso', name: 'TITAN CHEST', manufacturer: 'Kronforge', rarity: 'legendary',
      stats: { hp: 400, bodyArmor: 50 }, costs: { energy: 40, heat: 8, cpu: 15, weight: 200 }
    },
    'HL-AC': {
      id: 'HL-AC', slot: 'torso', name: 'AERO CORE', manufacturer: 'Helion', rarity: 'rare',
      stats: { mobility: 20, bodyArmor: 15 }, costs: { energy: 25, heat: 4, cpu: 10, weight: 80 }
    },
    'SC-NC': {
      id: 'SC-NC', slot: 'torso', name: 'NEURAL CORE', manufacturer: 'Seraphis', rarity: 'epic',
      stats: { cpu: 100, cooling: 15, bodyArmor: 20 }, costs: { energy: 30, heat: 2, cpu: 0, weight: 90 }
    },
    'VK-TC': {
      id: 'VK-TC', slot: 'torso', name: 'MILITIA PLATE', manufacturer: 'Valkar', rarity: 'common',
      stats: { hp: 150, bodyArmor: 25 }, costs: { energy: 15, heat: 3, cpu: 5, weight: 100 }
    },

    // LEGS
    'LQ-4': {
      id: 'LQ-4', slot: 'legs', name: 'QUADWALKER', manufacturer: 'Kronforge', rarity: 'epic',
      stats: { stability: 30, legArmor: 40 }, costs: { energy: 35, heat: 6, cpu: 12, weight: 180 }
    },
    'HL-S2': {
      id: 'HL-S2', slot: 'legs', name: 'SPRINT LEGS', manufacturer: 'Helion', rarity: 'rare',
      stats: { mobility: 25, evasion: 10, legArmor: 15 }, costs: { energy: 20, heat: 3, cpu: 8, weight: 60 }
    },
    'VK-VT': {
      id: 'VK-VT', slot: 'legs', name: 'V-TREAD', manufacturer: 'Valkar', rarity: 'rare',
      stats: { stability: 20, accuracy: 8, legArmor: 25 }, costs: { energy: 25, heat: 4, cpu: 6, weight: 120 }
    },

    // LEFT ARM WEAPONS
    'AR-19': {
      id: 'AR-19', slot: 'leftArm', name: 'PRECISION RIFLE', manufacturer: 'Helion', rarity: 'rare',
      stats: { rangedAtk: 45, accuracy: 20 }, costs: { energy: 30, heat: 8, cpu: 10, weight: 50 }, isWeapon: true
    },
    'KR-SL': {
      id: 'KR-SL', slot: 'leftArm', name: 'SLUGGER AR-5', manufacturer: 'Kronforge', rarity: 'epic',
      stats: { rangedAtk: 75, accuracy: -5 }, costs: { energy: 45, heat: 15, cpu: 12, weight: 90 }, isWeapon: true
    },
    'SB-VEC': {
      id: 'SB-VEC', slot: 'leftArm', name: 'ENERGY BLADE', manufacturer: 'Seraphis', rarity: 'legendary',
      stats: { meleeAtk: 120 }, costs: { energy: 60, heat: 25, cpu: 15, weight: 40 }, isWeapon: true
    },

    // RIGHT ARM WEAPONS
    'VK-AR': {
      id: 'VK-AR', slot: 'rightArm', name: 'MILITIA RIFLE', manufacturer: 'Valkar', rarity: 'common',
      stats: { rangedAtk: 35, accuracy: 10 }, costs: { energy: 20, heat: 6, cpu: 5, weight: 40 }, isWeapon: true
    },
    'HL-PL': {
      id: 'HL-PL', slot: 'rightArm', name: 'PULSE LASER', manufacturer: 'Helion', rarity: 'epic',
      stats: { rangedAtk: 55, accuracy: 25 }, costs: { energy: 50, heat: 20, cpu: 15, weight: 45 }, isWeapon: true
    },

    // SHOULDER WEAPONS
    'KR-HW': {
      id: 'KR-HW', slot: 'leftShoulder', name: 'HOWITZER 220MM', manufacturer: 'Kronforge', rarity: 'legendary',
      stats: { rangedAtk: 150 }, costs: { energy: 80, heat: 40, cpu: 20, weight: 200 }, isWeapon: true
    },
    'HL-ML': {
      id: 'HL-ML', slot: 'rightShoulder', name: 'MULTILOCK POD', manufacturer: 'Helion', rarity: 'epic',
      stats: { rangedAtk: 80, accuracy: 30 }, costs: { energy: 55, heat: 18, cpu: 18, weight: 80 }, isWeapon: true
    },

    // ENGINE
    'ENG-A1': {
      id: 'ENG-A1', slot: 'engine', name: 'FUSION CORE A1', manufacturer: 'Helion', rarity: 'rare',
      stats: { energyOutput: 150 }, costs: { energy: 0, heat: 10, cpu: 5, weight: 100 }
    },
    'ENG-B2': {
      id: 'ENG-B2', slot: 'engine', name: 'HEAVY REACTOR', manufacturer: 'Kronforge', rarity: 'epic',
      stats: { energyOutput: 250 }, costs: { energy: 0, heat: 20, cpu: 8, weight: 180 }
    },

    // COOLING
    'COOL-S1': {
      id: 'COOL-S1', slot: 'cooling', name: 'CRYO UNIT', manufacturer: 'Seraphis', rarity: 'rare',
      stats: { cooling: 50 }, costs: { energy: 30, heat: -30, cpu: 8, weight: 60 }
    },
    'COOL-K1': {
      id: 'COOL-K1', slot: 'cooling', name: 'HEAT SINK ARRAY', manufacturer: 'Kronforge', rarity: 'epic',
      stats: { cooling: 80 }, costs: { energy: 40, heat: -60, cpu: 10, weight: 100 }
    },

    // CHIPSET
    'CHIP-T1': {
      id: 'CHIP-T1', slot: 'chip', name: 'TACTICS CPU', manufacturer: 'Seraphis', rarity: 'epic',
      stats: { tap: 3, cpu: 50 }, costs: { energy: 20, heat: 5, cpu: 0, weight: 10 }
    },
    'CHIP-B1': {
      id: 'CHIP-B1', slot: 'chip', name: 'BATTLE PROCESSOR', manufacturer: 'Valkar', rarity: 'rare',
      stats: { tap: 2, accuracy: 5 }, costs: { energy: 15, heat: 3, cpu: 0, weight: 8 }
    },
  },

  // === MISSIONS ===
  missions: [
    {
      id: 'M01', chapter: 1, name: 'FRONTIER PATROL', difficulty: 1,
      description: 'Clear rogue drones from supply route.',
      enemyFrame: 'VK-MF01', enemyParts: ['VK-H1', 'VK-TC', 'VK-AR'],
      rewards: { dollars: 500, exp: 100 }
    },
    {
      id: 'M02', chapter: 1, name: 'MINING OUTPOST', difficulty: 2,
      description: 'Secure abandoned mining facility.',
      enemyFrame: 'VK-MF01', enemyParts: ['VK-H1', 'VK-TC', 'VK-VT', 'VK-AR'],
      rewards: { dollars: 800, exp: 150 }
    },
    {
      id: 'M03', chapter: 1, name: 'ROGUE SENTINEL', difficulty: 3,
      description: 'Eliminate malfunctioning security unit.',
      enemyFrame: 'HL-AF01', enemyParts: ['HD-12', 'HL-AC', 'HL-S2', 'AR-19'],
      rewards: { dollars: 1200, exp: 200 }
    },
    {
      id: 'M04', chapter: 2, name: 'CONVOY AMBUSH', difficulty: 4,
      description: 'Defend supply convoy from raiders.',
      enemyFrame: 'HL-AF01', enemyParts: ['HV-33', 'HL-AC', 'HL-S2', 'AR-19', 'HL-PL'],
      rewards: { dollars: 1800, exp: 300 }
    },
    {
      id: 'M05', chapter: 2, name: 'FACTORY SIEGE', difficulty: 5,
      description: 'Storm Kronforge production facility.',
      enemyFrame: 'KF-SF01', enemyParts: ['KG-9', 'KR-MT', 'LQ-4', 'KR-SL'],
      rewards: { dollars: 2500, exp: 400 }
    },
    {
      id: 'M06', chapter: 2, name: 'PHANTOM STRIKE', difficulty: 6,
      description: 'Hunt down Seraphis infiltrators.',
      enemyFrame: 'SC-RF01', enemyParts: ['HD-12', 'SC-NC', 'HL-S2', 'SB-VEC'],
      rewards: { dollars: 3500, exp: 500 }
    },
    {
      id: 'M07', chapter: 3, name: 'TITAN SHOWDOWN', difficulty: 8,
      description: 'Face the Kronforge champion.',
      enemyFrame: 'KF-SF01', enemyParts: ['KG-9', 'KR-MT', 'LQ-4', 'KR-SL', 'KR-HW', 'ENG-B2', 'COOL-K1'],
      rewards: { dollars: 5000, exp: 800 }
    },
    {
      id: 'M08', chapter: 3, name: 'NEURAL OVERRIDE', difficulty: 9,
      description: 'Breach Seraphis command center.',
      enemyFrame: 'SC-RF01', enemyParts: ['HV-33', 'SC-NC', 'HL-S2', 'SB-VEC', 'HL-ML', 'COOL-S1', 'CHIP-T1'],
      rewards: { dollars: 7000, exp: 1000 }
    },
  ],

  // === GACHA BANNERS ===
  banners: {
    standard: {
      id: 'standard', name: 'STANDARD PARTS', description: 'Common to Epic parts', cost: 500,
      rates: { common: 0.60, rare: 0.30, epic: 0.09, legendary: 0.01 },
      pool: ['VK-H1', 'VK-TC', 'VK-AR', 'HD-12', 'HL-AC', 'HL-S2', 'AR-19', 'VK-VT', 'ENG-A1', 'COOL-S1', 'CHIP-B1']
    },
    rare: {
      id: 'rare', name: 'PREMIUM ARSENAL', description: 'Rare to Legendary parts', cost: 1500,
      rates: { common: 0, rare: 0.50, epic: 0.40, legendary: 0.10 },
      pool: ['HV-33', 'KR-MT', 'SC-NC', 'LQ-4', 'KR-SL', 'HL-PL', 'KR-HW', 'HL-ML', 'ENG-B2', 'COOL-K1', 'CHIP-T1', 'SB-VEC', 'KG-9']
    },
    frame: {
      id: 'frame', name: 'FRAME REQUISITION', description: 'Acquire new mech frames', cost: 3000,
      rates: { common: 0.40, rare: 0.35, epic: 0.20, legendary: 0.05 },
      pool: ['VK-MF01', 'HL-AF01', 'KF-SF01', 'SC-RF01'],
      isFrameBanner: true
    }
  },

  slotNames: {
    head: 'HEAD', torso: 'TORSO', legs: 'LEGS', leftArm: 'L.ARM', rightArm: 'R.ARM',
    leftShoulder: 'L.SHLD', rightShoulder: 'R.SHLD', engine: 'ENGINE', cooling: 'COOLING', chip: 'CHIP'
  },

  rarityLabels: {
    common: { name: 'COMMON', class: 'rarity-common' },
    rare: { name: 'RARE', class: 'rarity-rare' },
    epic: { name: 'EPIC', class: 'rarity-epic' },
    legendary: { name: 'LEGENDARY', class: 'rarity-legendary' }
  }
};

if (typeof window !== 'undefined') {
  window.GAME_DATA = GAME_DATA;
}
