// ============================================
// AERYNDOR - Game Logic
// ============================================

const Game = {
    // === SEEDED RANDOM ===
    seed: Date.now(),

    setSeed(s) {
        this.seed = s;
    },

    random() {
        // Simple LCG for deterministic random
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return (this.seed / 0x7fffffff);
    },

    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    },

    // === STAT CALCULATIONS ===
    calculateFrameStats(state, frameId) {
        const frameData = GAME_DATA.frames[frameId];
        if (!frameData) return null;

        const owned = state.ownedFrames[frameId];
        if (!owned) return null;

        const stats = {
            hp: frameData.baseStats.hp,
            energyOutput: frameData.baseStats.energyOutput,
            cpuCap: frameData.baseStats.cpuCap,
            weightCap: frameData.baseStats.weightCap,
            heatCap: frameData.baseStats.heatCap,
            tap: frameData.baseStats.tap,
            mobility: frameData.baseStats.mobility,
            headArmor: frameData.baseStats.armor.head,
            shoulderArmor: frameData.baseStats.armor.shoulder,
            bodyArmor: frameData.baseStats.armor.body,
            legArmor: frameData.baseStats.armor.leg,
            rangedAtk: 0,
            meleeAtk: 0,
            accuracy: 50,
            evasion: 10,
            cooling: 0,
            // Costs
            totalWeight: 0,
            totalEnergy: 0,
            totalHeat: 0,
            totalCpu: 0
        };

        // Add stats from equipped parts
        Object.values(owned.equippedParts).forEach(partId => {
            if (!partId) return;
            const part = GAME_DATA.parts[partId];
            if (!part) return;

            // Add part stats
            Object.entries(part.stats || {}).forEach(([key, val]) => {
                if (stats[key] !== undefined) {
                    stats[key] += val;
                }
            });

            // Add costs
            stats.totalWeight += part.costs.weight || 0;
            stats.totalEnergy += part.costs.energy || 0;
            stats.totalHeat += part.costs.heat || 0;
            stats.totalCpu += part.costs.cpu || 0;
        });

        // Apply frame bonuses
        if (frameData.bonuses.rangedAtk) stats.rangedAtk *= (1 + frameData.bonuses.rangedAtk);
        if (frameData.bonuses.meleeAtk) stats.meleeAtk *= (1 + frameData.bonuses.meleeAtk);
        if (frameData.bonuses.mobility) stats.mobility *= (1 + frameData.bonuses.mobility);
        if (frameData.bonuses.bodyArmor) stats.bodyArmor *= (1 + frameData.bonuses.bodyArmor);
        if (frameData.bonuses.cooling) stats.cooling *= (1 + frameData.bonuses.cooling);
        if (frameData.bonuses.accuracy) stats.accuracy *= (1 + frameData.bonuses.accuracy);
        if (frameData.bonuses.evasion) stats.evasion *= (1 + frameData.bonuses.evasion);

        // Calculate derived stats
        stats.totalArmor = stats.headArmor + stats.shoulderArmor * 0.5 + stats.bodyArmor * 1.2 + stats.legArmor;
        stats.damageMitigation = Math.min(0.75, stats.totalArmor / (stats.totalArmor + 200));
        stats.heatRejection = stats.cooling - stats.totalHeat;
        stats.dps = (stats.rangedAtk + stats.meleeAtk) * (1 + stats.accuracy / 100);

        // Validation flags
        stats.isOverweight = stats.totalWeight > stats.weightCap;
        stats.isOverpowered = stats.totalEnergy > stats.energyOutput;
        stats.isOverheating = stats.heatRejection < -50;
        stats.isOverloaded = stats.totalCpu > stats.cpuCap;
        stats.isValid = !stats.isOverweight && !stats.isOverpowered && !stats.isOverheating && !stats.isOverloaded;

        return stats;
    },

    // Build enemy stats from mission data
    calculateEnemyStats(mission) {
        const frameData = GAME_DATA.frames[mission.enemyFrame];

        const stats = {
            hp: frameData.baseStats.hp,
            mobility: frameData.baseStats.mobility,
            headArmor: frameData.baseStats.armor.head,
            bodyArmor: frameData.baseStats.armor.body,
            rangedAtk: 0,
            meleeAtk: 0,
            accuracy: 50,
            evasion: 10
        };

        mission.enemyParts.forEach(partId => {
            const part = GAME_DATA.parts[partId];
            if (!part) return;
            Object.entries(part.stats || {}).forEach(([key, val]) => {
                if (stats[key] !== undefined) stats[key] += val;
            });
        });

        stats.totalArmor = stats.headArmor + stats.bodyArmor;
        stats.damageMitigation = Math.min(0.75, stats.totalArmor / (stats.totalArmor + 200));

        // Scale by difficulty
        const scale = 1 + (mission.difficulty * 0.15);
        stats.hp = Math.floor(stats.hp * scale);
        stats.rangedAtk = Math.floor(stats.rangedAtk * scale);
        stats.meleeAtk = Math.floor(stats.meleeAtk * scale);

        return stats;
    },

    // === BATTLE SIMULATION ===
    simulateBattle(state, mission) {
        this.setSeed(Date.now());

        const playerStats = this.calculateFrameStats(state, state.activeFrameId);
        const enemyStats = this.calculateEnemyStats(mission);
        const frameData = GAME_DATA.frames[state.activeFrameId];
        const enemyFrameData = GAME_DATA.frames[mission.enemyFrame];

        let playerHp = playerStats.hp;
        let enemyHp = enemyStats.hp;
        const log = [];
        let turn = 0;
        const maxTurns = 30;

        log.push({
            type: 'start',
            text: `▶ BATTLE INITIATED`,
            detail: `${frameData.name} vs ${enemyFrameData.name}`
        });

        log.push({
            type: 'info',
            text: `[PLAYER] HP: ${playerHp} | ATK: ${Math.floor(playerStats.rangedAtk + playerStats.meleeAtk)}`,
        });

        log.push({
            type: 'info',
            text: `[ENEMY] HP: ${enemyHp} | ATK: ${Math.floor(enemyStats.rangedAtk + enemyStats.meleeAtk)}`,
        });

        while (playerHp > 0 && enemyHp > 0 && turn < maxTurns) {
            turn++;

            // Player attacks
            const playerAtk = playerStats.rangedAtk > playerStats.meleeAtk
                ? playerStats.rangedAtk
                : playerStats.meleeAtk;
            const playerHitChance = playerStats.accuracy * (1 - enemyStats.evasion / 100) / 100;

            if (this.random() < playerHitChance) {
                const baseDmg = playerAtk * (0.8 + this.random() * 0.4);
                const damage = Math.floor(baseDmg * (1 - enemyStats.damageMitigation));
                enemyHp -= damage;

                const weapons = ['rifle', 'cannon', 'laser', 'blade'];
                const weapon = weapons[this.randomInt(0, weapons.length - 1)];

                log.push({
                    type: 'player',
                    text: `[T${turn}] Your ${weapon} hits for ${damage} DMG!`,
                    damage: damage
                });
            } else {
                log.push({
                    type: 'miss',
                    text: `[T${turn}] Your attack missed!`
                });
            }

            if (enemyHp <= 0) break;

            // Enemy attacks
            const enemyAtk = enemyStats.rangedAtk > enemyStats.meleeAtk
                ? enemyStats.rangedAtk
                : enemyStats.meleeAtk;
            const enemyHitChance = enemyStats.accuracy * (1 - playerStats.evasion / 100) / 100;

            if (this.random() < enemyHitChance) {
                const baseDmg = enemyAtk * (0.8 + this.random() * 0.4);
                const damage = Math.floor(baseDmg * (1 - playerStats.damageMitigation));
                playerHp -= damage;

                log.push({
                    type: 'enemy',
                    text: `[T${turn}] Enemy strikes for ${damage} DMG!`,
                    damage: damage
                });
            } else {
                log.push({
                    type: 'miss',
                    text: `[T${turn}] Enemy attack evaded!`
                });
            }

            // Status update every 5 turns
            if (turn % 5 === 0) {
                log.push({
                    type: 'status',
                    text: `--- HP: You ${Math.max(0, playerHp)} | Enemy ${Math.max(0, enemyHp)} ---`
                });
            }
        }

        const victory = enemyHp <= 0;

        log.push({
            type: victory ? 'victory' : 'defeat',
            text: victory
                ? `◆ VICTORY! Enemy ${enemyFrameData.name} destroyed!`
                : `✖ DEFEAT... Your mech was destroyed.`
        });

        // Calculate rewards
        let rewards = { dollars: 0, materia: 0, parts: [] };
        if (victory) {
            rewards.dollars = mission.rewards.dollars;
            rewards.materia = this.randomInt(10, 50);

            // Chance for part drop
            if (this.random() < 0.3) {
                const dropPool = Object.keys(GAME_DATA.parts);
                const droppedPart = dropPool[this.randomInt(0, dropPool.length - 1)];
                rewards.parts.push(droppedPart);
            }

            log.push({
                type: 'reward',
                text: `REWARDS: $${rewards.dollars} | ◆${rewards.materia} Materia` +
                    (rewards.parts.length > 0 ? ` | Part: ${GAME_DATA.parts[rewards.parts[0]].name}` : '')
            });
        }

        return {
            victory,
            log,
            rewards,
            turns: turn,
            playerHpRemaining: Math.max(0, playerHp),
            enemyHpRemaining: Math.max(0, enemyHp)
        };
    },

    // === GACHA SYSTEM ===
    pullGacha(state, bannerId, count = 1) {
        const banner = GAME_DATA.banners[bannerId];
        if (!banner) return { success: false, error: 'Invalid banner' };

        const totalCost = banner.cost * count;
        if (!Storage.canAfford(state, 'dollars', totalCost)) {
            return { success: false, error: 'Not enough $!' };
        }

        Storage.spendCurrency(state, 'dollars', totalCost);
        const results = [];

        for (let i = 0; i < count; i++) {
            // Update pity counter
            state.gacha[bannerId].pulls++;
            const isPityPull = state.gacha[bannerId].pulls >= state.gacha[bannerId].pity;

            // Determine rarity
            let rarity;
            const roll = this.random();
            let cumulative = 0;

            if (isPityPull) {
                // Guaranteed rare or higher
                rarity = this.random() < 0.1 ? 'legendary' : (this.random() < 0.4 ? 'epic' : 'rare');
                state.gacha[bannerId].pulls = 0;
            } else {
                for (const [r, rate] of Object.entries(banner.rates)) {
                    cumulative += rate;
                    if (roll < cumulative) {
                        rarity = r;
                        break;
                    }
                }
            }

            // Pick item from pool
            const filteredPool = banner.pool.filter(id => {
                const item = banner.isFrameBanner ? GAME_DATA.frames[id] : GAME_DATA.parts[id];
                return item && item.rarity === rarity;
            });

            // Fallback if no items of that rarity
            const finalPool = filteredPool.length > 0 ? filteredPool : banner.pool;
            const itemId = finalPool[this.randomInt(0, finalPool.length - 1)];

            // Add to inventory
            if (banner.isFrameBanner) {
                const isNew = Storage.addFrame(state, itemId);
                const frame = GAME_DATA.frames[itemId];
                results.push({
                    id: itemId,
                    name: frame.name,
                    rarity: frame.rarity,
                    isNew,
                    isFrame: true,
                    isPity: isPityPull
                });
            } else {
                Storage.addPart(state, itemId);
                const part = GAME_DATA.parts[itemId];
                results.push({
                    id: itemId,
                    name: part.name,
                    rarity: part.rarity,
                    slot: part.slot,
                    isNew: state.inventory[itemId] === 1,
                    isFrame: false,
                    isPity: isPityPull
                });
            }

            state.stats.totalPulls++;
        }

        return { success: true, results };
    },

    // === SELL / DISMANTLE ===
    sellPart(state, partId) {
        const part = GAME_DATA.parts[partId];
        if (!part) return false;
        if (!Storage.removePart(state, partId)) return false;

        const values = { common: 50, rare: 150, epic: 400, legendary: 1000 };
        Storage.addCurrency(state, 'dollars', values[part.rarity] || 50);
        return true;
    },

    dismantlePart(state, partId) {
        const part = GAME_DATA.parts[partId];
        if (!part) return false;
        if (!Storage.removePart(state, partId)) return false;

        const values = { common: 10, rare: 30, epic: 80, legendary: 200 };
        const materia = values[part.rarity] + this.randomInt(0, 20);
        Storage.addCurrency(state, 'materia', materia);
        return true;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.Game = Game;
}
