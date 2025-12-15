// ============================================
// VERONIC FORMULA FRONT - Main Application
// ============================================

const App = {
  state: null,
  currentTab: 'hangar',
  battleResult: null,
  gachaResults: null,
  selectedPart: null,
  selectedMission: null,
  rendererInitialized: false,
  battleAnimating: false,

  init() {
    this.state = Storage.load();
    this.bindEvents();
    this.updateCurrencyDisplay();
    this.render();
  },

  bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
    });
    document.getElementById('modal-backdrop')?.addEventListener('click', () => this.closeModal());
  },

  switchTab(tab) {
    if (this.currentTab === 'hangar' && tab !== 'hangar' && this.rendererInitialized) {
      RobotRenderer.dispose();
      this.rendererInitialized = false;
    }
    this.currentTab = tab;
    this.battleResult = null;
    this.gachaResults = null;
    this.selectedPart = null;
    this.selectedMission = null;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('tab-active', isActive);
      btn.classList.toggle('opacity-70', !isActive);
    });
    this.render();
  },

  save() { Storage.save(this.state); this.updateCurrencyDisplay(); },

  updateCurrencyDisplay() {
    document.getElementById('currency-dollars').textContent = this.state.currencies.dollars.toLocaleString();
    document.getElementById('currency-materia').textContent = this.state.currencies.materia.toLocaleString();
  },

  showModal(content) {
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-container').classList.remove('hidden');
  },

  closeModal() { document.getElementById('modal-container').classList.add('hidden'); },

  render() {
    const main = document.getElementById('main-content');
    switch (this.currentTab) {
      case 'hangar': main.innerHTML = this.renderHangar(); break;
      case 'missions': main.innerHTML = this.renderMissions(); break;
      case 'gacha': main.innerHTML = this.renderGacha(); break;
      case 'inventory': main.innerHTML = this.renderInventory(); break;
      case 'menu': main.innerHTML = this.renderMenu(); break;
    }
    this.bindContentEvents();
    if (this.currentTab === 'hangar' && !this.rendererInitialized) {
      setTimeout(() => this.init3DViewer(), 50);
    }
  },

  init3DViewer() {
    const container = document.getElementById('robot-viewer');
    if (!container || this.rendererInitialized) return;
    if (RobotRenderer.init('robot-viewer')) {
      this.rendererInitialized = true;
      this.updateRobotModel();
    }
  },

  updateRobotModel() {
    if (!this.rendererInitialized) return;
    const frameId = this.state.activeFrameId;
    const frame = GAME_DATA.frames[frameId];
    const equipped = this.state.ownedFrames[frameId]?.equippedParts || {};
    RobotRenderer.buildRobot(frameId, equipped, frame);
  },

  bindContentEvents() {
    document.querySelectorAll('[data-slot]').forEach(el => el.addEventListener('click', (e) => this.showPartSelector(e.currentTarget.dataset.slot)));
    document.querySelectorAll('[data-mission]').forEach(el => el.addEventListener('click', (e) => this.selectMission(e.currentTarget.dataset.mission)));
    document.getElementById('btn-deploy')?.addEventListener('click', () => this.startBattle());
    document.querySelectorAll('[data-pull]').forEach(btn => btn.addEventListener('click', (e) => {
      const [banner, count] = e.currentTarget.dataset.pull.split(':');
      this.pullGacha(banner, parseInt(count));
    }));
    document.querySelectorAll('[data-part-id]').forEach(el => el.addEventListener('click', (e) => this.showPartDetail(e.currentTarget.dataset.partId)));
    document.getElementById('btn-sell')?.addEventListener('click', () => { if (this.selectedPart) { Game.sellPart(this.state, this.selectedPart); this.save(); this.closeModal(); this.render(); } });
    document.getElementById('btn-dismantle')?.addEventListener('click', () => { if (this.selectedPart) { Game.dismantlePart(this.state, this.selectedPart); this.save(); this.closeModal(); this.render(); } });
    document.querySelectorAll('[data-frame-select]').forEach(el => el.addEventListener('click', (e) => { Storage.setActiveFrame(this.state, e.currentTarget.dataset.frameSelect); this.save(); this.updateRobotModel(); this.render(); }));
    document.getElementById('btn-reset')?.addEventListener('click', () => { if (confirm('Reset all data?')) { this.state = Storage.reset(); this.save(); this.render(); } });
  },

  // === HANGAR ===
  renderHangar() {
    const frameId = this.state.activeFrameId;
    const frame = GAME_DATA.frames[frameId];
    const stats = Game.calculateFrameStats(this.state, frameId);
    const equipped = this.state.ownedFrames[frameId].equippedParts;
    const rarity = GAME_DATA.rarityLabels[frame.rarity];
    const slots = ['head', 'torso', 'legs', 'leftArm', 'rightArm', 'leftShoulder', 'rightShoulder', 'engine', 'cooling', 'chip'];

    return `
      <div class="space-y-3">
        <div class="pixel-border overflow-hidden">
          <div id="robot-viewer"></div>
          <div class="bg-panel-light px-3 py-2 text-center border-t border-terminal-dim/30">
            <h2 class="text-lg ${rarity.class}">${frame.name}</h2>
            <p class="text-[10px] text-terminal-dim">${frame.manufacturer} • ${rarity.name} • Drag to rotate</p>
          </div>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1">
          ${Object.keys(this.state.ownedFrames).map(fId => {
      const f = GAME_DATA.frames[fId];
      return `<button data-frame-select="${fId}" class="flex-shrink-0 px-3 py-1 pixel-border btn-press ${fId === frameId ? 'bg-terminal/20' : 'bg-panel'} text-xs">${f.name.split(' ')[1] || f.name}</button>`;
    }).join('')}
        </div>
        <div class="bg-panel-light pixel-border p-2">
          <h3 class="text-xs mb-2 border-b border-terminal-dim pb-1">◆ STATS</h3>
          <div class="grid grid-cols-2 gap-1 text-[11px]">
            <div>HP: <span class="text-mech-blue">${stats.hp}</span></div>
            <div>MOB: <span class="text-mech-blue">${Math.floor(stats.mobility)}</span></div>
            <div>RNG: <span class="text-mech-orange">${Math.floor(stats.rangedAtk)}</span></div>
            <div>MEL: <span class="text-mech-orange">${Math.floor(stats.meleeAtk)}</span></div>
          </div>
          <div class="mt-2 space-y-1 text-[10px]">
            <div class="flex items-center gap-2">
              <span class="w-10">WT:</span>
              <div class="flex-1 bg-panel h-1.5 rounded"><div class="h-full ${stats.isOverweight ? 'bg-mech-red' : 'stat-bar'} rounded" style="width: ${Math.min(100, stats.totalWeight / stats.weightCap * 100)}%"></div></div>
              <span class="${stats.isOverweight ? 'text-mech-red' : ''}">${stats.totalWeight}/${stats.weightCap}</span>
            </div>
          </div>
        </div>
        <div class="bg-panel-light pixel-border p-2">
          <h3 class="text-xs mb-2 border-b border-terminal-dim pb-1">◆ PARTS</h3>
          <div class="grid grid-cols-2 gap-1">
            ${slots.map(slot => {
      const partId = equipped[slot];
      const part = partId ? GAME_DATA.parts[partId] : null;
      const rClass = part ? GAME_DATA.rarityLabels[part.rarity].class : '';
      return `<button data-slot="${slot}" class="bg-panel p-1.5 text-left btn-press hover:bg-panel-light border border-terminal-dim/20">
                <div class="text-[9px] text-terminal-dim">${GAME_DATA.slotNames[slot]}</div>
                <div class="text-[10px] ${rClass} truncate">${part ? part.name : '[ EMPTY ]'}</div>
              </button>`;
    }).join('')}
          </div>
        </div>
      </div>`;
  },

  showPartSelector(slot) {
    const availableParts = Object.entries(this.state.inventory).filter(([id, qty]) => GAME_DATA.parts[id]?.slot === slot && qty > 0).map(([id, qty]) => ({ ...GAME_DATA.parts[id], qty }));
    const content = `
      <div class="bg-panel pixel-border p-4 w-full max-w-sm max-h-[70vh] overflow-y-auto">
        <h3 class="text-lg mb-3 border-b border-terminal-dim pb-2">SELECT ${GAME_DATA.slotNames[slot]}</h3>
        <button onclick="App.equipPart('${slot}', null)" class="w-full bg-panel-light p-3 mb-2 text-left btn-press border border-terminal-dim/50"><span class="text-terminal-dim">[ UNEQUIP ]</span></button>
        ${availableParts.length === 0 ? '<p class="text-terminal-dim text-center py-4">No parts</p>' : availableParts.map(p => `
          <button onclick="App.equipPart('${slot}', '${p.id}')" class="w-full bg-panel-light p-3 mb-2 text-left btn-press border border-terminal-dim/50 hover:border-terminal">
            <div class="flex justify-between"><span class="${GAME_DATA.rarityLabels[p.rarity].class}">${p.name}</span><span class="text-xs text-terminal-dim">x${p.qty}</span></div>
          </button>`).join('')}
        <button onclick="App.closeModal()" class="w-full mt-3 py-2 pixel-border btn-press">CLOSE</button>
      </div>`;
    this.showModal(content);
  },

  equipPart(slot, partId) {
    Storage.equipPart(this.state, this.state.activeFrameId, slot, partId);
    this.save(); this.closeModal(); this.updateRobotModel(); this.render();
  },

  // === MISSIONS ===
  renderMissions() {
    if (this.battleResult) return this.renderBattleResult();
    const missions = GAME_DATA.missions;
    const done = new Set(this.state.missions.completed);

    if (this.selectedMission) {
      const m = missions.find(x => x.id === this.selectedMission);
      const enemy = GAME_DATA.frames[m.enemyFrame];
      return `
        <div class="space-y-3">
          <button onclick="App.selectedMission = null; App.render();" class="text-terminal-dim hover:text-terminal text-sm">← BACK</button>
          <div class="bg-panel-light pixel-border p-3">
            <h2 class="text-lg mb-1">${m.name}</h2>
            <p class="text-xs text-terminal-dim mb-2">${m.description}</p>
            <div class="text-xs mb-3">DIFF: ${'★'.repeat(m.difficulty)}${'☆'.repeat(10 - m.difficulty)}</div>
            <div class="bg-panel p-2 mb-3 text-center"><p class="text-mech-red text-sm">HOSTILE: ${enemy.name}</p></div>
            <div class="text-xs mb-3"><span class="text-terminal-dim">REWARDS:</span><span class="text-warning ml-2">$${m.rewards.dollars}</span></div>
            <button id="btn-deploy" class="w-full py-3 pixel-border btn-press bg-terminal/20 text-lg tracking-widest hover:bg-terminal/30">▶ DEPLOY</button>
          </div>
        </div>`;
    }

    const chapters = {};
    missions.forEach(m => { chapters[m.chapter] = chapters[m.chapter] || []; chapters[m.chapter].push(m); });
    return `
      <div class="space-y-3">
        <h2 class="text-lg tracking-widest">◆ MISSIONS</h2>
        ${Object.entries(chapters).map(([ch, ms]) => `
          <div class="bg-panel-light pixel-border p-2">
            <h3 class="text-xs mb-2 text-terminal-dim">CHAPTER ${ch}</h3>
            <div class="space-y-1">${ms.map(m => {
      const unlocked = Storage.isMissionUnlocked(this.state, m, missions);
      return `<button data-mission="${m.id}" class="w-full bg-panel p-2 text-left btn-press flex items-center gap-2 ${!unlocked ? 'opacity-50' : 'hover:bg-panel-light'} ${done.has(m.id) ? 'border-l-2 border-terminal' : ''}" ${!unlocked ? 'disabled' : ''}>
                <div class="flex-1"><div class="text-xs">${m.name} ${done.has(m.id) ? '✓' : ''}</div><div class="text-[10px] text-terminal-dim">${'★'.repeat(m.difficulty)}</div></div>
                <span class="text-warning text-[10px]">$${m.rewards.dollars}</span>
              </button>`;
    }).join('')}</div>
          </div>`).join('')}
      </div>`;
  },

  selectMission(missionId) {
    const m = GAME_DATA.missions.find(x => x.id === missionId);
    if (Storage.isMissionUnlocked(this.state, m, GAME_DATA.missions)) { this.selectedMission = missionId; this.render(); }
  },

  startBattle() {
    const m = GAME_DATA.missions.find(x => x.id === this.selectedMission);
    this.battleResult = Game.simulateBattle(this.state, m);
    this.battleAnimating = true;
    this.render();

    setTimeout(() => {
      const playerFrameId = this.state.activeFrameId;
      const playerFrame = GAME_DATA.frames[playerFrameId];
      const playerParts = this.state.ownedFrames[playerFrameId]?.equippedParts || {};
      const enemyFrame = GAME_DATA.frames[m.enemyFrame];

      if (BattleRenderer.init('battle-arena')) {
        BattleRenderer.startBattle(playerFrame, playerParts, enemyFrame, m.enemyParts, this.battleResult.log, () => {
          if (this.battleResult.victory) {
            Storage.completeMission(this.state, m.id);
            Storage.addCurrency(this.state, 'dollars', this.battleResult.rewards.dollars);
            Storage.addCurrency(this.state, 'materia', this.battleResult.rewards.materia);
            this.battleResult.rewards.parts.forEach(id => Storage.addPart(this.state, id));
            this.save();
          }
          this.battleAnimating = false;
          this.render();
        });
      }
    }, 100);
  },

  renderBattleResult() {
    const anim = this.battleAnimating;
    const v = this.battleResult.victory;
    return `
      <div class="space-y-2">
        <h2 class="text-lg tracking-widest text-center ${anim ? 'text-warning animate-flicker' : (v ? 'text-terminal animate-glow' : 'text-mech-red')}">${anim ? '◆ COMBAT' : (v ? '◆ VICTORY' : '✖ DEFEATED')}</h2>
        <div id="battle-arena" class="pixel-border"></div>
        <div id="battle-text-log" class="bg-panel-light pixel-border p-2 h-20 overflow-y-auto font-mono text-[10px] space-y-0.5"></div>
        ${!anim ? '<button onclick="BattleRenderer.dispose(); App.battleResult = null; App.selectedMission = null; App.render();" class="w-full py-2 pixel-border btn-press">CONTINUE</button>' : ''}
      </div>`;
  },

  // === GACHA ===
  renderGacha() {
    if (this.gachaResults) return this.renderGachaResults();
    return `
      <div class="space-y-3">
        <h2 class="text-lg tracking-widest">◆ REQUISITION</h2>
        ${Object.values(GAME_DATA.banners).map(b => {
      const p = this.state.gacha[b.id];
      return `
            <div class="bg-panel-light pixel-border p-3">
              <h3 class="text-base ${b.id === 'rare' ? 'text-mech-orange' : b.id === 'frame' ? 'rarity-epic' : ''}">${b.name}</h3>
              <p class="text-[10px] text-terminal-dim mb-2">${b.description}</p>
              <div class="text-[10px] mb-2">PITY: <span class="text-terminal">${p.pulls}/${p.pity}</span></div>
              <div class="flex gap-2">
                <button data-pull="${b.id}:1" class="flex-1 py-2 pixel-border btn-press bg-panel hover:bg-terminal/20"><div class="text-xs">x1</div><div class="text-[10px] text-warning">$${b.cost}</div></button>
                <button data-pull="${b.id}:10" class="flex-1 py-2 pixel-border btn-press bg-panel hover:bg-terminal/20"><div class="text-xs">x10</div><div class="text-[10px] text-warning">$${b.cost * 10}</div></button>
              </div>
            </div>`;
    }).join('')}
      </div>`;
  },

  pullGacha(bannerId, count) {
    const r = Game.pullGacha(this.state, bannerId, count);
    if (r.success) { this.gachaResults = r.results; this.save(); this.render(); }
    else alert(r.error);
  },

  renderGachaResults() {
    return `
      <div class="space-y-3">
        <h2 class="text-lg tracking-widest animate-glow">◆ RESULTS</h2>
        <div class="space-y-2 max-h-[60vh] overflow-y-auto">
          ${this.gachaResults.map(i => `
            <div class="bg-panel-light pixel-border p-2 flex items-center gap-3 ${i.isPity ? 'border-warning' : ''}">
              <div class="text-xl">${i.isFrame ? '🤖' : '⚙'}</div>
              <div class="flex-1">
                <div class="flex items-center gap-2"><span class="${GAME_DATA.rarityLabels[i.rarity].class} text-sm">${i.name}</span>${i.isNew ? '<span class="text-[9px] bg-terminal/30 px-1">NEW</span>' : ''}</div>
                <div class="text-[10px] text-terminal-dim">${GAME_DATA.rarityLabels[i.rarity].name}</div>
              </div>
            </div>`).join('')}
        </div>
        <button onclick="App.gachaResults = null; App.render();" class="w-full py-2 pixel-border btn-press">CONTINUE</button>
      </div>`;
  },

  // === INVENTORY ===
  renderInventory() {
    const parts = Object.entries(this.state.inventory).filter(([, q]) => q > 0).map(([id, q]) => ({ ...GAME_DATA.parts[id], qty: q })).filter(p => p.name).sort((a, b) => ({ legendary: 0, epic: 1, rare: 2, common: 3 }[a.rarity]) - ({ legendary: 0, epic: 1, rare: 2, common: 3 }[b.rarity]));
    return `
      <div class="space-y-3">
        <h2 class="text-lg tracking-widest">◆ INVENTORY</h2>
        <p class="text-[10px] text-terminal-dim">${parts.length} parts</p>
        <div class="space-y-1">
          ${parts.length === 0 ? '<p class="text-center text-terminal-dim py-8 text-sm">No parts. Pull from Gacha!</p>' : parts.map(p => `
            <button data-part-id="${p.id}" class="w-full bg-panel-light p-2 text-left btn-press flex items-center gap-2 border border-transparent hover:border-terminal-dim">
              <div class="text-lg">⚙</div>
              <div class="flex-1">
                <div class="flex justify-between"><span class="${GAME_DATA.rarityLabels[p.rarity].class} text-xs">${p.name}</span><span class="text-[10px] text-terminal-dim">x${p.qty}</span></div>
                <div class="text-[10px] text-terminal-dim">${GAME_DATA.slotNames[p.slot]}</div>
              </div>
            </button>`).join('')}
        </div>
      </div>`;
  },

  showPartDetail(partId) {
    this.selectedPart = partId;
    const p = GAME_DATA.parts[partId];
    const q = this.state.inventory[partId] || 0;
    const sv = { common: 50, rare: 150, epic: 400, legendary: 1000 }[p.rarity];
    const mv = { common: 10, rare: 30, epic: 80, legendary: 200 }[p.rarity];
    const content = `
      <div class="bg-panel pixel-border p-4 w-full max-w-sm">
        <h3 class="text-lg ${GAME_DATA.rarityLabels[p.rarity].class} mb-1">${p.name}</h3>
        <p class="text-[10px] text-terminal-dim mb-3">${GAME_DATA.slotNames[p.slot]} | ${p.manufacturer}</p>
        <div class="bg-panel-light p-2 mb-2 text-xs">${Object.entries(p.stats || {}).map(([k, v]) => `<p>${k}: <span class="${v > 0 ? 'text-terminal' : 'text-mech-red'}">${v > 0 ? '+' : ''}${v}</span></p>`).join('')}</div>
        <p class="text-[10px] text-terminal-dim mb-3">Owned: x${q}</p>
        <div class="flex gap-2">
          <button id="btn-sell" class="flex-1 py-2 pixel-border btn-press bg-warning/20"><div class="text-[10px]">SELL</div><div class="text-warning text-xs">$${sv}</div></button>
          <button id="btn-dismantle" class="flex-1 py-2 pixel-border btn-press bg-mech-blue/20"><div class="text-[10px]">DISMANTLE</div><div class="text-mech-blue text-xs">◆${mv}</div></button>
        </div>
        <button onclick="App.closeModal()" class="w-full mt-3 py-2 pixel-border btn-press">CLOSE</button>
      </div>`;
    this.showModal(content);
    this.bindContentEvents();
  },

  // === MENU ===
  renderMenu() {
    const s = this.state.stats;
    return `
      <div class="space-y-3">
        <h2 class="text-lg tracking-widest">◆ MENU</h2>
        <div class="bg-panel-light pixel-border p-3"><h3 class="text-xs mb-2 text-terminal-dim">PILOT</h3><p class="text-base">${this.state.player.name}</p></div>
        <div class="bg-panel-light pixel-border p-3"><h3 class="text-xs mb-2 text-terminal-dim">RECORD</h3><div class="grid grid-cols-2 gap-2 text-xs"><div>Battles: <span class="text-terminal">${s.totalBattles}</span></div><div>Wins: <span class="text-terminal">${s.battlesWon}</span></div><div>Pulls: <span class="text-warning">${s.totalPulls}</span></div><div>Parts: <span class="text-mech-blue">${s.partsCollected}</span></div></div></div>
        <div class="bg-panel-light pixel-border p-3"><h3 class="text-xs mb-2 text-terminal-dim">FRAMES</h3>${Object.keys(this.state.ownedFrames).map(id => `<p class="${GAME_DATA.rarityLabels[GAME_DATA.frames[id].rarity].class} text-xs">• ${GAME_DATA.frames[id].name}</p>`).join('')}</div>
        <button id="btn-reset" class="w-full py-2 pixel-border btn-press bg-mech-red/20 text-mech-red text-xs">RESET DATA</button>
        <p class="text-center text-[10px] text-terminal-dim">VERONIC FORMULA FRONT v1.0</p>
      </div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
if (typeof window !== 'undefined') window.App = App;
