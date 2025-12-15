// ============================================
// VERONIC FORMULA FRONT - Three.js Robot Renderer
// Realistic Armored Core-style graphics
// ============================================

const RobotRenderer = {
    scene: null,
    camera: null,
    renderer: null,
    robot: null,
    container: null,
    animationId: null,
    isDragging: false,
    previousMouseX: 0,
    rotationY: 0,
    targetRotationY: 0,

    palettes: {
        helion: { armor: 0x1e40af, armorDark: 0x1e3a5f, frame: 0x0f172a, accent: 0x3b82f6, glow: 0x60a5fa },
        kronforge: { armor: 0x44403c, armorDark: 0x292524, frame: 0x1c1917, accent: 0xdc2626, glow: 0xef4444 },
        seraphis: { armor: 0x581c87, armorDark: 0x3b0764, frame: 0x1e1b2e, accent: 0xa855f7, glow: 0xc084fc },
        valkar: { armor: 0x374151, armorDark: 0x1f2937, frame: 0x111827, accent: 0x22c55e, glow: 0x4ade80 },
        default: { armor: 0x3f3f46, armorDark: 0x27272a, frame: 0x18181b, accent: 0xef4444, glow: 0xf87171 }
    },

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return false;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight || 300;

        // Scene with dark background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x080810);

        // Camera
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 2.8, 7);
        this.camera.lookAt(0, 1.6, 0);

        // High quality renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.setupLighting();
        this.setupEnvironment();

        // Events
        this.renderer.domElement.addEventListener('mousedown', (e) => { this.isDragging = true; this.previousMouseX = e.clientX; });
        this.renderer.domElement.addEventListener('mousemove', (e) => { if (this.isDragging) { this.targetRotationY += (e.clientX - this.previousMouseX) * 0.008; this.previousMouseX = e.clientX; } });
        this.renderer.domElement.addEventListener('mouseup', () => this.isDragging = false);
        this.renderer.domElement.addEventListener('mouseleave', () => this.isDragging = false);
        this.renderer.domElement.addEventListener('touchstart', (e) => { if (e.touches.length === 1) { this.isDragging = true; this.previousMouseX = e.touches[0].clientX; } });
        this.renderer.domElement.addEventListener('touchmove', (e) => { if (this.isDragging && e.touches.length === 1) { this.targetRotationY += (e.touches[0].clientX - this.previousMouseX) * 0.008; this.previousMouseX = e.touches[0].clientX; } });
        this.renderer.domElement.addEventListener('touchend', () => this.isDragging = false);
        window.addEventListener('resize', () => this.onResize());

        this.animate();
        return true;
    },

    setupLighting() {
        // Ambient fill
        const ambient = new THREE.HemisphereLight(0x404060, 0x101020, 0.4);
        this.scene.add(ambient);

        // Key light (main)
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 30;
        keyLight.shadow.camera.left = -5;
        keyLight.shadow.camera.right = 5;
        keyLight.shadow.camera.top = 5;
        keyLight.shadow.camera.bottom = -5;
        keyLight.shadow.bias = -0.001;
        this.scene.add(keyLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4080ff, 0.4);
        fillLight.position.set(-5, 3, -3);
        this.scene.add(fillLight);

        // Rim light (back)
        const rimLight = new THREE.DirectionalLight(0xff8040, 0.3);
        rimLight.position.set(0, 5, -8);
        this.scene.add(rimLight);

        // Ground bounce
        const bounceLight = new THREE.PointLight(0x00ff41, 0.15, 8);
        bounceLight.position.set(0, 0.2, 2);
        this.scene.add(bounceLight);
    },

    setupEnvironment() {
        // Hangar floor
        const floorGeo = new THREE.PlaneGeometry(20, 20);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a12,
            metalness: 0.8,
            roughness: 0.4,
            envMapIntensity: 0.5
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Tech grid
        const gridHelper = new THREE.GridHelper(12, 24, 0x00ff41, 0x003311);
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Background gradient
        const bgGeo = new THREE.PlaneGeometry(30, 15);
        const bgMat = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(0x0a0a14) },
                color2: { value: new THREE.Color(0x1a1a2e) }
            },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `uniform vec3 color1; uniform vec3 color2; varying vec2 vUv; void main() { gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0); }`,
            side: THREE.DoubleSide
        });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        bg.position.set(0, 5, -8);
        this.scene.add(bg);
    },

    // PBR Materials
    armorMat(color, roughness = 0.35) {
        return new THREE.MeshStandardMaterial({
            color,
            metalness: 0.9,
            roughness,
            envMapIntensity: 1.0
        });
    },

    frameMat(color) {
        return new THREE.MeshStandardMaterial({
            color,
            metalness: 0.95,
            roughness: 0.2
        });
    },

    glowMat(color) {
        return new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 2.0,
            metalness: 0.1,
            roughness: 0.3
        });
    },

    jointMat() {
        return new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.5
        });
    },

    buildRobot(frameId, equippedParts, frameData) {
        if (this.robot) { this.scene.remove(this.robot); this.robot = null; }
        this.robot = new THREE.Group();

        const mfr = (frameData?.manufacturer?.toLowerCase() || 'default');
        let pal = this.palettes.default;
        if (mfr.includes('helion')) pal = this.palettes.helion;
        else if (mfr.includes('kronforge')) pal = this.palettes.kronforge;
        else if (mfr.includes('seraphis')) pal = this.palettes.seraphis;
        else if (mfr.includes('valkar')) pal = this.palettes.valkar;

        const armor = this.armorMat(pal.armor);
        const armorDark = this.armorMat(pal.armorDark, 0.5);
        const frame = this.frameMat(pal.frame);
        const accent = this.armorMat(pal.accent, 0.25);
        const glow = this.glowMat(pal.glow);
        const joint = this.jointMat();

        // === CORE BODY ===
        this.buildCore(armor, armorDark, frame, glow, joint);

        // === HEAD ===
        this.buildHead(armor, armorDark, frame, glow, joint);

        // === SHOULDERS ===
        this.buildShoulders(armor, armorDark, accent, glow, joint);

        // === ARMS ===
        this.buildArms(armor, armorDark, frame, glow, joint, equippedParts);

        // === LEGS ===
        this.buildLegs(armor, armorDark, frame, glow, joint);

        this.robot.position.y = 0;
        this.scene.add(this.robot);
        return this.robot;
    },

    buildCore(armor, armorDark, frame, glow, joint) {
        const core = new THREE.Group();

        // Main torso chassis
        const chassis = this.box(1.0, 0.65, 0.55, armor);
        chassis.position.y = 1.65;
        chassis.castShadow = true;
        core.add(chassis);

        // Front chest armor (multi-layer)
        const chestPlate1 = this.box(0.85, 0.5, 0.12, armorDark);
        chestPlate1.position.set(0, 1.7, 0.32);
        core.add(chestPlate1);

        const chestPlate2 = this.box(0.65, 0.35, 0.1, armor);
        chestPlate2.position.set(0, 1.72, 0.38);
        core.add(chestPlate2);

        const chestPlate3 = this.box(0.4, 0.2, 0.08, armorDark);
        chestPlate3.position.set(0, 1.75, 0.44);
        core.add(chestPlate3);

        // Central reactor
        const reactor = this.cylinder(0.08, 0.08, 0.1, 8, glow);
        reactor.position.set(0, 1.65, 0.48);
        reactor.rotation.x = Math.PI / 2;
        core.add(reactor);

        // Panel lines (dark strips)
        for (let x of [-0.35, 0.35]) {
            const line = this.box(0.03, 0.4, 0.02, frame);
            line.position.set(x, 1.7, 0.4);
            core.add(line);
        }

        // Upper chest intakes
        for (let x of [-0.28, 0.28]) {
            const intake = this.box(0.12, 0.08, 0.15, frame);
            intake.position.set(x, 1.88, 0.35);
            core.add(intake);
            const intakeGlow = this.box(0.08, 0.04, 0.02, glow);
            intakeGlow.position.set(x, 1.88, 0.42);
            core.add(intakeGlow);
        }

        // Side armor
        for (let s of [-1, 1]) {
            const sidePlate = this.box(0.1, 0.45, 0.4, armor);
            sidePlate.position.set(s * 0.5, 1.65, 0);
            core.add(sidePlate);

            // Vent slats
            for (let i = 0; i < 4; i++) {
                const slat = this.box(0.11, 0.015, 0.25, frame);
                slat.position.set(s * 0.5, 1.5 + i * 0.08, 0.05);
                core.add(slat);
            }
        }

        // Collar
        const collar = this.box(0.5, 0.12, 0.35, armorDark);
        collar.position.set(0, 1.95, 0);
        core.add(collar);

        // Hip section
        const hips = this.box(0.65, 0.18, 0.45, frame);
        hips.position.y = 1.28;
        core.add(hips);

        // Front hip armor
        const hipPlate = this.box(0.5, 0.15, 0.12, armorDark);
        hipPlate.position.set(0, 1.22, 0.25);
        core.add(hipPlate);

        // Side skirt armor
        for (let s of [-1, 1]) {
            const skirt = this.box(0.18, 0.22, 0.3, armor);
            skirt.position.set(s * 0.38, 1.18, 0);
            core.add(skirt);
        }

        // Backpack unit
        const backMain = this.box(0.55, 0.45, 0.3, armorDark);
        backMain.position.set(0, 1.72, -0.35);
        core.add(backMain);

        // Back thrusters
        for (let s of [-1, 1]) {
            const thrusterHousing = this.box(0.15, 0.3, 0.18, armor);
            thrusterHousing.position.set(s * 0.2, 1.6, -0.48);
            core.add(thrusterHousing);

            const thrusterNozzle = this.cylinder(0.05, 0.08, 0.12, 6, frame);
            thrusterNozzle.position.set(s * 0.2, 1.5, -0.52);
            core.add(thrusterNozzle);

            const thrusterGlow = this.cylinder(0.035, 0.035, 0.03, 6, glow);
            thrusterGlow.position.set(s * 0.2, 1.44, -0.52);
            core.add(thrusterGlow);
        }

        this.robot.add(core);
    },

    buildHead(armor, armorDark, frame, glow, joint) {
        const head = new THREE.Group();

        // Neck mechanism
        const neck = this.cylinder(0.1, 0.12, 0.12, 8, joint);
        neck.position.y = 2.0;
        head.add(neck);

        // Main helmet
        const helmet = this.box(0.42, 0.32, 0.38, armor);
        helmet.position.y = 2.22;
        helmet.castShadow = true;
        head.add(helmet);

        // Face plate
        const facePlate = this.box(0.32, 0.18, 0.1, armorDark);
        facePlate.position.set(0, 2.18, 0.2);
        head.add(facePlate);

        // Main visor
        const visor = this.box(0.28, 0.06, 0.03, glow);
        visor.position.set(0, 2.2, 0.25);
        head.add(visor);

        // Secondary sensors
        for (let s of [-1, 1]) {
            const sensor = this.box(0.04, 0.04, 0.02, glow);
            sensor.position.set(s * 0.12, 2.12, 0.22);
            head.add(sensor);
        }

        // Forehead crest
        const crest = this.box(0.22, 0.08, 0.12, armorDark);
        crest.position.set(0, 2.35, 0.12);
        head.add(crest);

        // Antenna
        const antenna = this.box(0.025, 0.18, 0.025, armorDark);
        antenna.position.set(0.16, 2.42, 0.05);
        head.add(antenna);

        const antennaTip = this.box(0.015, 0.04, 0.015, glow);
        antennaTip.position.set(0.16, 2.52, 0.05);
        head.add(antennaTip);

        // Cheek guards
        for (let s of [-1, 1]) {
            const cheek = this.box(0.1, 0.14, 0.18, armor);
            cheek.position.set(s * 0.22, 2.16, 0.06);
            head.add(cheek);
        }

        // Chin
        const chin = this.box(0.18, 0.08, 0.15, armorDark);
        chin.position.set(0, 2.06, 0.15);
        head.add(chin);

        this.robot.add(head);
    },

    buildShoulders(armor, armorDark, accent, glow, joint) {
        for (let s of [-1, 1]) {
            const shoulder = new THREE.Group();

            // Shoulder joint
            const jointSphere = this.sphere(0.1, 8, 6, joint);
            shoulder.add(jointSphere);

            // Main shoulder block
            const mainBlock = this.box(0.32, 0.28, 0.38, armor);
            mainBlock.position.set(s * 0.1, 0.08, 0);
            mainBlock.castShadow = true;
            shoulder.add(mainBlock);

            // Top armor plate
            const topPlate = this.box(0.38, 0.1, 0.42, armorDark);
            topPlate.position.set(s * 0.12, 0.2, 0);
            shoulder.add(topPlate);

            // Outer armor extension
            const outerPlate = this.box(0.12, 0.24, 0.36, accent);
            outerPlate.position.set(s * 0.28, 0.05, 0);
            shoulder.add(outerPlate);

            // Panel lines
            for (let i = 0; i < 2; i++) {
                const panel = this.box(0.25, 0.02, 0.35, frame);
                panel.position.set(s * 0.08, 0.12 - i * 0.12, 0.02);
                shoulder.add(panel);
            }

            // Accent light strip
            const lightStrip = this.box(0.03, 0.15, 0.03, glow);
            lightStrip.position.set(s * 0.28, 0.05, 0.18);
            shoulder.add(lightStrip);

            shoulder.position.set(s * 0.62, 1.82, 0);
            this.robot.add(shoulder);
        }
    },

    buildArms(armor, armorDark, frame, glow, joint, equipped) {
        for (let s of [-1, 1]) {
            const arm = new THREE.Group();

            // Upper arm
            const upperArm = this.box(0.16, 0.38, 0.14, armor);
            upperArm.position.y = -0.2;
            upperArm.castShadow = true;
            arm.add(upperArm);

            // Upper arm detail
            const upperDetail = this.box(0.12, 0.25, 0.08, armorDark);
            upperDetail.position.set(0, -0.18, 0.08);
            arm.add(upperDetail);

            // Elbow joint
            const elbow = this.sphere(0.09, 8, 6, joint);
            elbow.position.y = -0.42;
            arm.add(elbow);

            // Elbow guard
            const elbowGuard = this.box(0.14, 0.12, 0.16, armorDark);
            elbowGuard.position.set(0, -0.42, -0.06);
            arm.add(elbowGuard);

            // Forearm
            const forearm = this.box(0.14, 0.32, 0.12, armor);
            forearm.position.y = -0.65;
            forearm.castShadow = true;
            arm.add(forearm);

            // Forearm armor plate
            const forearmPlate = this.box(0.16, 0.2, 0.08, armorDark);
            forearmPlate.position.set(0, -0.58, 0.08);
            arm.add(forearmPlate);

            // Wrist
            const wrist = this.cylinder(0.05, 0.06, 0.08, 6, joint);
            wrist.position.y = -0.84;
            arm.add(wrist);

            // Hand
            const hand = this.box(0.1, 0.1, 0.07, frame);
            hand.position.y = -0.92;
            arm.add(hand);

            // Weapon (all arms have weapons for now)
            const weaponBody = this.box(0.09, 0.14, 0.45, armorDark);
            weaponBody.position.set(0, -0.92, 0.24);
            arm.add(weaponBody);

            const weaponUpper = this.box(0.07, 0.08, 0.35, armor);
            weaponUpper.position.set(0, -0.86, 0.28);
            arm.add(weaponUpper);

            const barrel1 = this.cylinder(0.028, 0.032, 0.35, 8, frame);
            barrel1.rotation.x = Math.PI / 2;
            barrel1.position.set(0.02, -0.92, 0.5);
            arm.add(barrel1);

            const barrel2 = this.cylinder(0.028, 0.032, 0.35, 8, frame);
            barrel2.rotation.x = Math.PI / 2;
            barrel2.position.set(-0.02, -0.92, 0.5);
            arm.add(barrel2);

            const muzzle = this.cylinder(0.02, 0.02, 0.04, 6, glow);
            muzzle.rotation.x = Math.PI / 2;
            muzzle.position.set(0, -0.92, 0.68);
            arm.add(muzzle);

            arm.position.set(s * 0.58, 1.72, 0);
            this.robot.add(arm);
        }
    },

    buildLegs(armor, armorDark, frame, glow, joint) {
        for (let s of [-1, 1]) {
            const leg = new THREE.Group();

            // Hip joint
            const hipJoint = this.sphere(0.1, 8, 6, joint);
            hipJoint.position.y = 1.2;
            leg.add(hipJoint);

            // Thigh
            const thigh = this.box(0.22, 0.42, 0.22, armor);
            thigh.position.y = 0.9;
            thigh.castShadow = true;
            leg.add(thigh);

            // Thigh front armor
            const thighFront = this.box(0.18, 0.3, 0.1, armorDark);
            thighFront.position.set(0, 0.92, 0.14);
            leg.add(thighFront);

            // Thigh side plates
            const thighSide = this.box(0.1, 0.35, 0.18, armorDark);
            thighSide.position.set(s * 0.12, 0.9, 0);
            leg.add(thighSide);

            // Knee joint (prominent)
            const kneeJoint = this.sphere(0.12, 8, 6, joint);
            kneeJoint.position.y = 0.62;
            leg.add(kneeJoint);

            // Knee armor
            const kneeArmor = this.box(0.2, 0.16, 0.22, armor);
            kneeArmor.position.set(0, 0.62, 0.1);
            leg.add(kneeArmor);

            // Knee cap detail
            const kneeCap = this.box(0.12, 0.1, 0.08, armorDark);
            kneeCap.position.set(0, 0.64, 0.18);
            leg.add(kneeCap);

            // Lower leg (digitigrade style - angled back)
            const shin = this.box(0.18, 0.45, 0.18, armor);
            shin.position.set(0, 0.32, -0.06);
            shin.rotation.x = 0.12;
            shin.castShadow = true;
            leg.add(shin);

            // Shin front armor
            const shinFront = this.box(0.16, 0.35, 0.1, armorDark);
            shinFront.position.set(0, 0.35, 0.06);
            leg.add(shinFront);

            // Calf armor
            const calfArmor = this.box(0.14, 0.25, 0.12, armor);
            calfArmor.position.set(0, 0.32, -0.18);
            leg.add(calfArmor);

            // Ankle assembly
            const ankle = this.cylinder(0.06, 0.08, 0.1, 8, joint);
            ankle.position.set(0, 0.08, -0.04);
            leg.add(ankle);

            // Foot frame
            const footFrame = this.box(0.2, 0.08, 0.35, frame);
            footFrame.position.set(0, 0.03, 0.08);
            leg.add(footFrame);

            // Toe armor
            const toeArmor = this.box(0.22, 0.1, 0.18, armor);
            toeArmor.position.set(0, 0.04, 0.22);
            leg.add(toeArmor);

            // Toe tip
            const toeTip = this.box(0.18, 0.06, 0.08, armorDark);
            toeTip.position.set(0, 0.02, 0.32);
            leg.add(toeTip);

            // Heel armor
            const heel = this.box(0.16, 0.14, 0.12, armor);
            heel.position.set(0, 0.06, -0.12);
            leg.add(heel);

            // Heel spur
            const spur = this.box(0.08, 0.08, 0.1, frame);
            spur.position.set(0, 0.04, -0.2);
            leg.add(spur);

            // Thruster on calf
            const legThruster = this.cylinder(0.04, 0.055, 0.1, 6, frame);
            legThruster.position.set(0, 0.28, -0.28);
            leg.add(legThruster);

            const legThrusterGlow = this.cylinder(0.03, 0.03, 0.02, 6, glow);
            legThrusterGlow.position.set(0, 0.23, -0.28);
            leg.add(legThrusterGlow);

            leg.position.set(s * 0.22, 0, 0);
            this.robot.add(leg);
        }
    },

    // Geometry helpers
    box(w, h, d, mat) {
        const geo = new THREE.BoxGeometry(w, h, d);
        return new THREE.Mesh(geo, mat);
    },

    cylinder(rTop, rBot, h, seg, mat) {
        const geo = new THREE.CylinderGeometry(rTop, rBot, h, seg);
        return new THREE.Mesh(geo, mat);
    },

    sphere(r, wSeg, hSeg, mat) {
        const geo = new THREE.SphereGeometry(r, wSeg, hSeg);
        return new THREE.Mesh(geo, mat);
    },

    onResize() {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight || 300;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.rotationY += (this.targetRotationY - this.rotationY) * 0.08;
        if (this.robot) {
            this.robot.rotation.y = this.rotationY;
            const time = Date.now() * 0.001;
            this.robot.position.y = Math.sin(time * 1.5) * 0.01;
        }
        this.renderer.render(this.scene, this.camera);
    },

    dispose() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container && this.renderer.domElement) {
                this.container.removeChild(this.renderer.domElement);
            }
        }
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.robot = null;
    }
};

if (typeof window !== 'undefined') window.RobotRenderer = RobotRenderer;
