// ============================================
// VERONIC FORMULA FRONT - Storage Layer
// ============================================

const STORAGE_KEY = 'vff_save';

const Storage = {
    // === DEFAULT PLAYER STATE ===
    getDefaultState() {
        return {
            version: 1,
            player: {
                name: 'PILOT',
                level: 1,
                exp: 0
            },
            currencies: {
                dollars: 10000,
                materia: 500
            },
            activeFrameId: 'VK-MF01',
            ownedFrames: {
                'VK-MF01': {
                    id: 'VK-MF01',
                    equippedParts: {
                        head: 'VK-H1',
                        torso: 'VK-TC',
                        legs: null,
                        leftArm: 'VK-AR',
                        rightArm: null,
                        leftShoulder: null,
                        rightShoulder: null,
                        engine: null,
                        cooling: null,
                        chip: null
                    }
                }
            },
            inventory: {
                'VK-H1': 1,
                'VK-TC': 1,
                'VK-AR': 1
            },
            missions: {
                completed: [],
                currentMission: 'M01'
            },
            gacha: {
                standard: { pulls: 0, pity: 10 },
                rare: { pulls: 0, pity: 10 },
                frame: { pulls: 0, pity: 10 }
            },
            stats: {
                totalBattles: 0,
                battlesWon: 0,
                totalPulls: 0,
                partsCollected: 3
            }
        };
    },

    save(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Failed to save:', e);
            return false;
        }
    },

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                return this.mergeWithDefaults(state);
            }
            return this.getDefaultState();
        } catch (e) {
            console.error('Failed to load:', e);
            return this.getDefaultState();
        }
    },

    mergeWithDefaults(saved) {
        const defaults = this.getDefaultState();
        return {
            ...defaults,
            ...saved,
            player: { ...defaults.player, ...saved.player },
            currencies: { ...defaults.currencies, ...saved.currencies },
            missions: { ...defaults.missions, ...saved.missions },
            gacha: { ...defaults.gacha, ...saved.gacha },
            stats: { ...defaults.stats, ...saved.stats }
        };
    },

    reset() {
        localStorage.removeItem(STORAGE_KEY);
        return this.getDefaultState();
    },

    canAfford(state, currency, amount) {
        return state.currencies[currency] >= amount;
    },

    spendCurrency(state, currency, amount) {
        if (this.canAfford(state, currency, amount)) {
            state.currencies[currency] -= amount;
            return true;
        }
        return false;
    },

    addCurrency(state, currency, amount) {
        state.currencies[currency] += amount;
    },

    addPart(state, partId) {
        if (state.inventory[partId]) {
            state.inventory[partId]++;
        } else {
            state.inventory[partId] = 1;
        }
        state.stats.partsCollected++;
    },

    removePart(state, partId) {
        if (state.inventory[partId] && state.inventory[partId] > 0) {
            state.inventory[partId]--;
            if (state.inventory[partId] === 0) {
                delete state.inventory[partId];
            }
            return true;
        }
        return false;
    },

    getPartCount(state, partId) {
        return state.inventory[partId] || 0;
    },

    addFrame(state, frameId) {
        if (!state.ownedFrames[frameId]) {
            state.ownedFrames[frameId] = {
                id: frameId,
                equippedParts: {
                    head: null, torso: null, legs: null,
                    leftArm: null, rightArm: null,
                    leftShoulder: null, rightShoulder: null,
                    engine: null, cooling: null, chip: null
                }
            };
            return true;
        }
        state.currencies.materia += 100;
        return false;
    },

    setActiveFrame(state, frameId) {
        if (state.ownedFrames[frameId]) {
            state.activeFrameId = frameId;
            return true;
        }
        return false;
    },

    equipPart(state, frameId, slot, partId) {
        if (!state.ownedFrames[frameId]) return false;

        const previousPart = state.ownedFrames[frameId].equippedParts[slot];
        if (previousPart) {
            this.addPart(state, previousPart);
        }

        if (partId && state.inventory[partId]) {
            this.removePart(state, partId);
            state.ownedFrames[frameId].equippedParts[slot] = partId;
        } else if (!partId) {
            state.ownedFrames[frameId].equippedParts[slot] = null;
        }

        return true;
    },

    completeMission(state, missionId) {
        if (!state.missions.completed.includes(missionId)) {
            state.missions.completed.push(missionId);
        }
        state.stats.totalBattles++;
        state.stats.battlesWon++;
    },

    isMissionCompleted(state, missionId) {
        return state.missions.completed.includes(missionId);
    },

    isMissionUnlocked(state, mission, allMissions) {
        const missionIndex = allMissions.findIndex(m => m.id === mission.id);
        if (missionIndex === 0) return true;
        const previousMission = allMissions[missionIndex - 1];
        return this.isMissionCompleted(state, previousMission.id);
    }
};

if (typeof window !== 'undefined') {
    window.Storage = Storage;
}
