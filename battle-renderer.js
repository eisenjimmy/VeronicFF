// ============================================
// VERONIC FORMULA FRONT - Battle Renderer
// Realistic Armored Core-style 3D Combat
// ============================================

const BattleRenderer = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    animationId: null,
    playerMech: null,
    enemyMech: null,
    effects: [],
    isPlaying: false,
    battleLog: [],
    currentLogIndex: 0,
    onBattleComplete: null,
    clock: null,

    palettes: {
        player: { armor: 0x1e40af, armorDark: 0x1e3a5f, frame: 0x0f172a, glow: 0x00ff41 },
        enemy: { armor: 0x44403c, armorDark: 0x292524, frame: 0x1c1917, glow: 0xef4444 }
    },

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return false;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight || 200;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x080810);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 3.5, 10);
        this.camera.lookAt(0, 1.5, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.setupLighting();
        this.setupArena();
        window.addEventListener('resize', () => this.onResize());
        return true;
    },

    setupLighting() {
        this.scene.add(new THREE.HemisphereLight(0x404060, 0x101020, 0.4));

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 25;
        keyLight.shadow.camera.left = -8;
        keyLight.shadow.camera.right = 8;
        keyLight.shadow.camera.top = 6;
        keyLight.shadow.camera.bottom = -2;
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x4080ff, 0.35);
        fillLight.position.set(-5, 3, 0);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xff6040, 0.25);
        rimLight.position.set(0, 4, -8);
        this.scene.add(rimLight);

        // Player side accent
        const pLight = new THREE.PointLight(0x00ff41, 0.4, 10);
        pLight.position.set(-4, 1.5, 3);
        this.scene.add(pLight);

        // Enemy side accent
        const eLight = new THREE.PointLight(0xef4444, 0.4, 10);
        eLight.position.set(4, 1.5, 3);
        this.scene.add(eLight);
    },

    setupArena() {
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 30),
            new THREE.MeshStandardMaterial({ color: 0x0a0a12, metalness: 0.7, roughness: 0.5 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const grid = new THREE.GridHelper(20, 40, 0x00ff41, 0x002211);
        grid.material.opacity = 0.12;
        grid.material.transparent = true;
        this.scene.add(grid);
    },

    mat(color, metalness = 0.9, roughness = 0.35) {
        return new THREE.MeshStandardMaterial({ color, metalness, roughness });
    },

    glowMat(color) {
        return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.5, metalness: 0.1, roughness: 0.3 });
    },

    buildMech(isPlayer) {
        const mech = new THREE.Group();
        const pal = isPlayer ? this.palettes.player : this.palettes.enemy;
        const armor = this.mat(pal.armor);
        const armorDark = this.mat(pal.armorDark, 0.9, 0.5);
        const frame = this.mat(pal.frame, 0.95, 0.2);
        const glow = this.glowMat(pal.glow);
        const joint = this.mat(0x1a1a1a, 0.8, 0.5);

        // TORSO
        const torso = new THREE.Group();
        torso.add(this.box(0.85, 0.55, 0.48, armor).translateY(1.6));
        torso.add(this.box(0.7, 0.4, 0.1, armorDark).translateY(1.65).translateZ(0.28));
        torso.add(this.box(0.5, 0.28, 0.08, armor).translateY(1.68).translateZ(0.34));
        torso.add(this.cyl(0.06, 0.06, 0.08, 8, glow).rotateX(Math.PI / 2).translateY(-1.6).translateZ(-0.38));
        torso.add(this.box(0.5, 0.15, 0.38, frame).translateY(1.25));
        torso.add(this.box(0.45, 0.38, 0.25, armorDark).translateY(1.68).translateZ(-0.32));
        for (let s of [-1, 1]) {
            torso.add(this.box(0.08, 0.4, 0.35, armor).translateX(s * 0.42).translateY(1.6));
            torso.add(this.cyl(0.04, 0.06, 0.1, 6, frame).translateX(s * 0.18).translateY(1.48).translateZ(-0.42));
            torso.add(this.cyl(0.025, 0.025, 0.03, 6, glow).translateX(s * 0.18).translateY(1.42).translateZ(-0.42));
        }
        mech.add(torso);

        // HEAD
        const head = new THREE.Group();
        head.add(this.cyl(0.08, 0.1, 0.1, 8, joint).translateY(1.95));
        head.add(this.box(0.36, 0.28, 0.32, armor).translateY(2.16));
        head.add(this.box(0.28, 0.16, 0.08, armorDark).translateY(2.12).translateZ(0.18));
        head.add(this.box(0.24, 0.05, 0.03, glow).translateY(2.14).translateZ(0.22));
        head.add(this.box(0.18, 0.06, 0.1, armorDark).translateY(2.28).translateZ(0.1));
        head.add(this.box(0.02, 0.14, 0.02, armorDark).translateX(0.14).translateY(2.35));
        mech.add(head);

        // SHOULDERS
        for (let s of [-1, 1]) {
            const sh = new THREE.Group();
            sh.add(this.sphere(0.08, 8, 6, joint));
            sh.add(this.box(0.28, 0.22, 0.32, armor).translateX(s * 0.08).translateY(0.06));
            sh.add(this.box(0.32, 0.08, 0.36, armorDark).translateX(s * 0.1).translateY(0.16));
            sh.add(this.box(0.03, 0.12, 0.02, glow).translateX(s * 0.24).translateY(0.04).translateZ(0.16));
            sh.position.set(s * 0.52, 1.72, 0);
            mech.add(sh);
        }

        // ARMS
        for (let s of [-1, 1]) {
            const arm = new THREE.Group();
            arm.add(this.box(0.13, 0.32, 0.11, armor).translateY(-0.18));
            arm.add(this.sphere(0.07, 8, 6, joint).translateY(-0.38));
            arm.add(this.box(0.11, 0.28, 0.1, armor).translateY(-0.58));
            arm.add(this.box(0.09, 0.08, 0.06, frame).translateY(-0.76));
            arm.add(this.box(0.08, 0.12, 0.4, armorDark).translateY(-0.76).translateZ(0.22));
            arm.add(this.cyl(0.022, 0.026, 0.3, 8, frame).rotateX(Math.PI / 2).translateY(0.76).translateZ(-0.42));
            arm.add(this.cyl(0.018, 0.018, 0.04, 6, glow).rotateX(Math.PI / 2).translateY(0.76).translateZ(-0.58));
            arm.position.set(s * 0.48, 1.65, 0);
            mech.add(arm);
        }

        // LEGS
        for (let s of [-1, 1]) {
            const leg = new THREE.Group();
            leg.add(this.sphere(0.08, 8, 6, joint).translateY(1.15));
            leg.add(this.box(0.18, 0.36, 0.18, armor).translateY(0.88));
            leg.add(this.box(0.14, 0.25, 0.08, armorDark).translateY(0.9).translateZ(0.12));
            leg.add(this.sphere(0.1, 8, 6, joint).translateY(0.62));
            leg.add(this.box(0.16, 0.14, 0.18, armor).translateY(0.62).translateZ(0.08));
            const shin = this.box(0.15, 0.4, 0.15, armor);
            shin.position.set(0, 0.35, -0.04);
            shin.rotation.x = 0.1;
            leg.add(shin);
            leg.add(this.box(0.13, 0.28, 0.08, armorDark).translateY(0.38).translateZ(0.05));
            leg.add(this.cyl(0.05, 0.06, 0.08, 8, joint).translateY(0.1).translateZ(-0.03));
            leg.add(this.box(0.17, 0.06, 0.3, frame).translateY(0.03).translateZ(0.08));
            leg.add(this.box(0.18, 0.08, 0.14, armor).translateY(0.04).translateZ(0.2));
            leg.add(this.box(0.12, 0.1, 0.1, armor).translateY(0.06).translateZ(-0.1));
            leg.add(this.cyl(0.03, 0.04, 0.08, 6, frame).translateY(0.28).translateZ(-0.22));
            leg.add(this.cyl(0.02, 0.02, 0.02, 6, glow).translateY(0.24).translateZ(-0.22));
            leg.position.set(s * 0.18, 0, 0);
            mech.add(leg);
        }

        mech.userData = { isPlayer };
        return mech;
    },

    box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); },
    cyl(rt, rb, h, s, mat) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat); },
    sphere(r, ws, hs, mat) { return new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); },

    startBattle(playerFrame, playerParts, enemyFrame, enemyParts, battleLog, onComplete) {
        this.battleLog = battleLog;
        this.currentLogIndex = 0;
        this.onBattleComplete = onComplete;
        this.isPlaying = true;

        if (this.playerMech) this.scene.remove(this.playerMech);
        if (this.enemyMech) this.scene.remove(this.enemyMech);
        this.effects.forEach(e => this.scene.remove(e));
        this.effects = [];

        this.playerMech = this.buildMech(true);
        this.playerMech.position.set(-2.8, 0, 0);
        this.playerMech.rotation.y = Math.PI / 7;
        this.scene.add(this.playerMech);

        this.enemyMech = this.buildMech(false);
        this.enemyMech.position.set(2.8, 0, 0);
        this.enemyMech.rotation.y = -Math.PI / 7;
        this.scene.add(this.enemyMech);

        this.animate();
        this.processNextAction();
    },

    processNextAction() {
        if (this.currentLogIndex >= this.battleLog.length) {
            setTimeout(() => { this.isPlaying = false; if (this.onBattleComplete) this.onBattleComplete(); }, 800);
            return;
        }

        const entry = this.battleLog[this.currentLogIndex++];
        let delay = 200;

        if (entry.type === 'player') { this.animateAttack(this.playerMech, this.enemyMech); delay = 450; }
        else if (entry.type === 'enemy') { this.animateAttack(this.enemyMech, this.playerMech); delay = 450; }
        else if (entry.type === 'victory' || entry.type === 'defeat') { this.animateVictory(entry.type === 'victory'); delay = 1000; }
        else if (entry.type === 'start') delay = 350;

        this.updateLog(entry);
        setTimeout(() => this.processNextAction(), delay);
    },

    animateAttack(attacker, target) {
        const start = attacker.position.clone();
        const dir = target.position.clone().sub(start).normalize();
        const lunge = start.clone().add(dir.multiplyScalar(0.35));

        this.tween(attacker, start, lunge, 100, () => {
            this.createFlash(attacker);
            setTimeout(() => { this.createHit(target); this.shake(target); }, 60);
            setTimeout(() => this.tween(attacker, lunge, start, 100), 120);
        });
    },

    createFlash(mech) {
        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 1 })
        );
        const pos = mech.position.clone();
        pos.y += 1.4;
        pos.z += mech.userData.isPlayer ? 0.5 : -0.5;
        flash.position.copy(pos);
        this.scene.add(flash);
        this.effects.push(flash);

        let op = 1;
        const fade = () => {
            op -= 0.1;
            flash.material.opacity = Math.max(0, op);
            flash.scale.multiplyScalar(1.12);
            if (op > 0) requestAnimationFrame(fade);
            else { this.scene.remove(flash); this.effects = this.effects.filter(e => e !== flash); }
        };
        fade();
    },

    createHit(mech) {
        const color = mech.userData.isPlayer ? 0x00ff41 : 0xef4444;
        for (let i = 0; i < 8; i++) {
            const spark = new THREE.Mesh(
                new THREE.BoxGeometry(0.035, 0.035, 0.035),
                new THREE.MeshBasicMaterial({ color })
            );
            spark.position.copy(mech.position);
            spark.position.y += 1.3 + Math.random() * 0.4;
            spark.position.x += (Math.random() - 0.5) * 0.35;
            spark.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.12, Math.random() * 0.1, (Math.random() - 0.5) * 0.12);
            this.scene.add(spark);
            this.effects.push(spark);

            let life = 1;
            const anim = () => {
                life -= 0.05;
                spark.position.add(spark.userData.vel);
                spark.userData.vel.y -= 0.007;
                spark.scale.multiplyScalar(0.92);
                if (life > 0) requestAnimationFrame(anim);
                else { this.scene.remove(spark); this.effects = this.effects.filter(e => e !== spark); }
            };
            anim();
        }
    },

    shake(obj) {
        const orig = obj.position.clone();
        let t = 0;
        const s = () => {
            t++;
            obj.position.x = orig.x + (Math.random() - 0.5) * 0.06;
            obj.position.z = orig.z + (Math.random() - 0.5) * 0.06;
            if (t < 6) requestAnimationFrame(s);
            else obj.position.copy(orig);
        };
        s();
    },

    animateVictory(playerWon) {
        const winner = playerWon ? this.playerMech : this.enemyMech;
        const loser = playerWon ? this.enemyMech : this.playerMech;

        if (winner) this.tween(winner, winner.position.clone(), winner.position.clone().add(new THREE.Vector3(0, 0.15, 0)), 200);
        if (loser) {
            let fall = 0;
            const f = () => {
                fall += 0.025;
                loser.rotation.x = fall * 1.1;
                loser.position.y = Math.max(-0.15, loser.position.y - 0.012);
                if (fall < 1) requestAnimationFrame(f);
            };
            f();
            setTimeout(() => this.createExplosion(loser.position), 350);
        }
    },

    createExplosion(pos) {
        for (let i = 0; i < 15; i++) {
            const debris = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.06, 0.06),
                new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff6600 : 0xffaa00 })
            );
            debris.position.copy(pos);
            debris.position.y += 0.7;
            debris.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.2, Math.random() * 0.18, (Math.random() - 0.5) * 0.2);
            this.scene.add(debris);
            this.effects.push(debris);

            let life = 1;
            const anim = () => {
                life -= 0.02;
                debris.position.add(debris.userData.vel);
                debris.userData.vel.y -= 0.01;
                debris.rotation.x += 0.08;
                debris.rotation.y += 0.08;
                if (life > 0 && debris.position.y > 0) requestAnimationFrame(anim);
                else { this.scene.remove(debris); this.effects = this.effects.filter(e => e !== debris); }
            };
            anim();
        }
    },

    tween(obj, from, to, dur, onDone) {
        const start = Date.now();
        const anim = () => {
            const t = Math.min(1, (Date.now() - start) / dur);
            obj.position.lerpVectors(from, to, t * (2 - t));
            if (t < 1) requestAnimationFrame(anim);
            else if (onDone) onDone();
        };
        anim();
    },

    updateLog(entry) {
        const el = document.getElementById('battle-text-log');
        if (!el) return;
        const colors = { player: 'text-terminal', enemy: 'text-mech-red', victory: 'text-terminal animate-glow', defeat: 'text-mech-red', reward: 'text-warning' };
        const p = document.createElement('p');
        p.className = colors[entry.type] || 'text-terminal-dim';
        p.textContent = entry.text;
        el.appendChild(p);
        el.scrollTop = el.scrollHeight;
    },

    animate() {
        if (!this.isPlaying) return;
        this.animationId = requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();
        if (this.playerMech) this.playerMech.position.y = Math.sin(time * 1.8) * 0.012;
        if (this.enemyMech) this.enemyMech.position.y = Math.sin(time * 1.8 + 1) * 0.012;
        this.renderer.render(this.scene, this.camera);
    },

    onResize() {
        if (!this.container) return;
        const w = this.container.clientWidth, h = this.container.clientHeight || 200;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    },

    dispose() {
        this.isPlaying = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container && this.renderer.domElement?.parentNode === this.container) {
                this.container.removeChild(this.renderer.domElement);
            }
        }
        this.scene = this.camera = this.renderer = this.playerMech = this.enemyMech = null;
        this.effects = [];
    }
};

if (typeof window !== 'undefined') window.BattleRenderer = BattleRenderer;
