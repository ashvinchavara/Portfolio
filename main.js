import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/* ==========================================================================
   DEVELOPER PORTFOLIO JAVASCRIPT (ASHVIN JOHNSON)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     THEME SWITCHER SYSTEM (DEFAULTS TO LIGHT MODE)
     ========================================================================== */
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');

  // Read theme from localStorage, or fallback to system preference
  let currentTheme = localStorage.getItem('theme');
  if (!currentTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDark ? 'dark' : 'light';
  }

  function updateThemeUI(theme) {
    themeToggles.forEach(toggle => {
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
  }

  // Apply current theme classes
  if (currentTheme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    updateThemeUI('dark');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    updateThemeUI('light');
  }

  // Bind toggle action to all theme buttons (including welcome gateway page)
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeUI('dark');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        updateThemeUI('light');
      }
    });
  });


  /* ==========================================================================
     PARTICLE NETWORK BACKGROUND
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 15;
        this.vx = (Math.random() * 0.8) - 0.4;
        this.vy = (Math.random() * 0.8) - 0.4;
      }

      update() {
        // Normal drift
        this.x += this.vx;
        this.y += this.vy;

        // Boundaries
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse repulsion interaction
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density * 0.6;
            let directionY = forceDirectionY * force * this.density * 0.6;
            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }

      draw() {
        ctx.fillStyle = document.body.classList.contains('light-theme')
          ? 'rgba(14, 165, 233, 0.35)'
          : 'rgba(0, 242, 254, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / 11000), 120);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();
    window.addEventListener('resize', initParticles);

    function connectParticles() {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            opacityValue = 1 - (distance / 110);
            const pColor = document.body.classList.contains('light-theme') ? '14, 165, 233' : '0, 242, 254';
            ctx.strokeStyle = `rgba(${pColor}, ${opacityValue * 0.08})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connectParticles();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }


  /* ==========================================================================
     SCROLL-LINKED WELCOME GATEWAY
     ========================================================================== */
  const gateway = document.getElementById('welcome-gateway');
  const dashboard = document.getElementById('dashboard');

  // Check if already scrolled down on load (e.g., page refresh)
  if (window.scrollY > 40) {
    // Bypass gateway immediately
    document.body.classList.remove('gateway-active');
    if (gateway) gateway.style.display = 'none';
  } else {
    // Put dashboard in initial locked state
    document.body.classList.add('gateway-active');

    let isEntering = false;
    let character3DCleanup = null;

    function triggerGatewayEntry() {
      if (isEntering) return;
      isEntering = true;

      // Detach all listeners immediately
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (character3DCleanup) {
        character3DCleanup();
      }

      // Trigger CSS transition
      document.body.classList.add('gateway-entering');

      // After transition completes, clean up DOM and positions
      setTimeout(() => {
        document.body.classList.remove('gateway-active', 'gateway-entering');
        if (gateway) gateway.style.display = 'none';

        // Reset scroll position to top of dashboard since spacer is gone
        window.scrollTo(0, 0);

        if (dashboard) {
          dashboard.removeAttribute('style'); // Clear inline transition overrides
        }
      }, 1000); // Matches transition duration in CSS
    }

    // 1. Mouse wheel trigger (User scrolls down)
    function handleWheel(e) {
      if (e.deltaY > 0) {
        triggerGatewayEntry();
      }
    }

    // 2. Keyboard trigger (PageDown, Down Arrow, Spacebar)
    function handleKeydown(e) {
      const keys = ['ArrowDown', 'PageDown', ' ', 'Enter'];
      if (keys.includes(e.key)) {
        triggerGatewayEntry();
      }
    }

    // 3. Touch swipe trigger (Mobile swipe up = scroll down)
    let touchStartY = 0;
    function handleTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
      const touchEndY = e.touches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (diffY > 20) { // Swiped up by more than 20px
        triggerGatewayEntry();
      }
    }

    // Attach interaction listeners
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Make the scroll prompt clickable as a fallback/shortcut
    const scrollPrompt = document.querySelector('.scroll-prompt');
    if (scrollPrompt) {
      scrollPrompt.addEventListener('click', triggerGatewayEntry);
      scrollPrompt.style.cursor = 'pointer';
    }

    // --- 3D Character: Mixamo Waving + Meshy Gun ---
    function init3DCharacter() {
      const container = document.getElementById('gru-container');
      if (!container) return null;

      container.innerHTML = `Loading...`;

      let scene, camera, renderer, clock;
      let charModel = null, mixer = null;
      let idleAction = null;
      let animFrameId = null;

      // BONES
      let bHead, bNeck;
      let bLArm, bLForeArm, bLHand;

      // AIM STATE
      let ndx = 0, ndy = 0;
      let isAiming = false;
      let aimTimer = null;

      let headYaw = 0, headPitch = 0;
      let armYaw = 0, armPitch = 0;
      let armW = 0;

      const W = container.clientWidth || 340;
      const H = container.clientHeight || 400;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(100, W / H, 0.01, 100);

      camera.position.set(0, 0.8, 1.0);
      camera.lookAt(0, 0.65, 0);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.9));

      const light = new THREE.DirectionalLight(0xffffff, 1.4);
      light.position.set(2, 5, 4);
      scene.add(light);

      clock = new THREE.Clock();

      const TL = new THREE.TextureLoader();
      const loadTex = (p) => {
        const t = TL.load(p);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };

      const charMat = new THREE.MeshStandardMaterial({
        map: loadTex('./character_albedo.png'),
        normalMap: loadTex('./character_normal.png'),
        roughness: 0.75,
        metalness: 0.2
      });

      const gunMat = new THREE.MeshStandardMaterial({
        map: loadTex('./noodas.png'),
        roughness: 0.4,
        metalness: 0.8
      });

      // -----------------------------
      // SIMPLE GUN (NO LIGHT)
      // -----------------------------
      function buildFallbackGun() {
        const g = new THREE.Group();

        const mat = new THREE.MeshStandardMaterial({
          color: 0x1f1f1f,
          roughness: 0.4,
          metalness: 1
        });

        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.18, 0.06),
          mat
        );

        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.28, 10),
          mat
        );
        barrel.position.y = 0.22;

        g.add(body);
        g.add(barrel);

        return g;
      }

      function attachGun(handSocket) {
        if (!handSocket) return;

        const fallback = buildFallbackGun();
        fallback.scale.setScalar(25);
        fallback.name = '__gun';
        handSocket.add(fallback);

        const gltf = new FBXLoader();
        gltf.load('./m4a1_s.fbx',
          (fbx) => {
            const old = handSocket.getObjectByName('__gun');
            if (old) handSocket.remove(old);

            fbx.traverse(n => {
              if (n.isMesh) {
                n.material = gunMat;
                n.castShadow = true;
                n.frustumCulled = false;
              }
            });

            // Create a pivot group so we can rotate the gun around its center / grip
            const gunPivot = new THREE.Group();
            gunPivot.name = '__gun';

            const localBox = new THREE.Box3().setFromObject(fbx);
            const localSize = new THREE.Vector3();
            localBox.getSize(localSize);
            const localCenter = new THREE.Vector3();
            localBox.getCenter(localCenter);

            // Scale the gun to match the half-size character (restoring to 75 to maintain correct proportion)
            const scale = 75.0 / Math.max(localSize.x, localSize.y, localSize.z);
            fbx.scale.setScalar(scale);

            // Offset the fbx model inside the pivot group so that its center is at the pivot's origin
            fbx.position.copy(localCenter).multiplyScalar(-scale);

            // Add fbx to pivot group
            gunPivot.add(fbx);

            // Set correct rotation: barrel pointing forward along hand (-Math.PI/2, 0, 0)
            gunPivot.rotation.set(-Math.PI / 2, 0, 0);

            handSocket.add(gunPivot);
          }
        );
      }

      // -----------------------------
      // LOAD CHARACTER
      // -----------------------------
      const loader = new FBXLoader();
      loader.load('./character.fbx', (fbx) => {

        charModel = fbx;
        charModel.scale.setScalar(0.0075); // 150% of half-size
        charModel.position.set(-0.28, -0.55, 0); // Position character at bottom-left (adjusted for 150%)
        scene.add(charModel);

        charModel.traverse(n => {
          if (n.isMesh) {
            n.frustumCulled = false; // Disable frustum culling to prevent character mesh disappearing
          }
        });

        // bones
        bHead = charModel.getObjectByName('mixamorigHead');
        bNeck = charModel.getObjectByName('mixamorigNeck');

        bLArm = charModel.getObjectByName('mixamorigLeftArm');
        bLForeArm = charModel.getObjectByName('mixamorigLeftForeArm');
        bLHand = charModel.getObjectByName('mixamorigLeftHand');
        const handSocket = new THREE.Object3D();
        bLHand.add(handSocket);
        handSocket.position.set(0, 20, 0.06);

        console.log('[Bones]', { bHead, bNeck, bLArm, bLForeArm, bLHand });

        attachGun(handSocket);

        // Capture initial bind pose in baseQuatMap
        if (bHead) baseQuatMap.set(bHead, bHead.quaternion.clone());
        if (bNeck) baseQuatMap.set(bNeck, bNeck.quaternion.clone());
        if (bLArm) baseQuatMap.set(bLArm, bLArm.quaternion.clone());
        if (bLForeArm) baseQuatMap.set(bLForeArm, bLForeArm.quaternion.clone());
        if (bLHand) baseQuatMap.set(bLHand, bLHand.quaternion.clone());

        // animation
        if (fbx.animations?.length) {
          mixer = new THREE.AnimationMixer(charModel);

          idleAction = mixer.clipAction(fbx.animations[0]);

          idleAction.setLoop(THREE.LoopRepeat);
          idleAction.play();
        }
      });

      // -----------------------------
      // CURSOR AIM (FIXED OFFSET)
      // -----------------------------
      function resumeIdle() {
        if (idleAction) {
          idleAction.paused = false;
          idleAction.play();
        }
      }



      function onMouseMove(e) {
        const rect = container.getBoundingClientRect();

        // FIX: character is NOT centered, it's left-biased
        const targetX = rect.left + rect.width * 0.38;
        const targetY = rect.top + rect.height * 0.55;

        ndx = (e.clientX - targetX) / rect.width;
        ndy = (e.clientY - targetY) / rect.height;

        ndx = THREE.MathUtils.clamp(ndx, -1, 1);
        ndy = THREE.MathUtils.clamp(ndy, -1, 1);

        isAiming = true;
        if (idleAction) {
          idleAction.paused = true;
        }
        clearTimeout(aimTimer);
        aimTimer = setTimeout(() => {
          isAiming = false;
          resumeIdle();
        }, 1800);
      }

      window.addEventListener('mousemove', onMouseMove);

      // -----------------------------
      // BONE ROTATION HELPER
      // -----------------------------
      const baseQuatMap = new WeakMap();

      function addBoneRot(bone, y, x, weight, isArm = false) {
        if (!bone) return;

        if (!baseQuatMap.has(bone)) {
          baseQuatMap.set(bone, bone.quaternion.clone());
        }

        const base = baseQuatMap.get(bone);

        const order = isArm ? 'XYZ' : 'YXZ';

        const offsetQuat = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(x, y, 0, order));

        const targetQuat = base.clone().multiply(offsetQuat);

        // Smoothly slerp from current (animated) quaternion to target (aim) quaternion
        bone.quaternion.slerp(targetQuat, weight);
      }

      // -----------------------------
      // LOOP
      // -----------------------------
      function animate() {
        animFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // Always update the mixer to let animations run
        if (mixer) mixer.update(delta);

        if (!charModel) return;

        const aimT = isAiming ? 1 : 0;

        armW = THREE.MathUtils.lerp(armW, aimT, 0.08);

        const tHeadYaw = ndx * 0.45;
        const tHeadPitch = ndy * 0.35;

        // Custom mapping for arm using bilinear interpolation
        const x_aim = -(1 - ndx) * (1 - ndy) / 4;
        const y_aim = (1 + ndx + 5 * ndy - 3 * ndx * ndy) / 8;

        const tArmYaw = x_aim * 0.9;
        const tArmPitch = -y_aim * 1.8; // Much larger pitch so arm can reach overhead

        headYaw = THREE.MathUtils.lerp(headYaw, tHeadYaw, 0.06);
        headPitch = THREE.MathUtils.lerp(headPitch, tHeadPitch, 0.06);

        // Arm tracks the cursor, and the weight blends it
        armYaw = THREE.MathUtils.lerp(armYaw, tArmYaw, 0.07);
        armPitch = THREE.MathUtils.lerp(armPitch, tArmPitch, 0.07);

        // HEAD
        addBoneRot(bHead, headYaw, headPitch, armW);
        addBoneRot(bNeck, headYaw * 0.4, headPitch * 0.3, armW);

        // ARM AIM — larger multipliers so arm reaches fully overhead
        const ARM_YAW_FIX = 1;
        const ARM_PITCH_FIX = -1;
        addBoneRot(bLArm,
          armYaw * ARM_YAW_FIX * 0.7,
          armPitch * ARM_PITCH_FIX * 1.0,
          armW,
          true
        );

        addBoneRot(bLForeArm,
          armYaw * ARM_YAW_FIX * 0.5,
          armPitch * ARM_PITCH_FIX * 0.8,
          armW,
          true
        );

        addBoneRot(bLHand,
          armYaw * ARM_YAW_FIX * 0.3,
          armPitch * ARM_PITCH_FIX * 0.5,
          armW,
          true
        );

        // FIX: reduce body rotation (was too much)
        charModel.rotation.y = THREE.MathUtils.lerp(
          charModel.rotation.y,
          ndx * 0.06 * armW,
          0.03
        );

        renderer.render(scene, camera);
      }

      animate();

      // -----------------------------
      // RESIZE
      // -----------------------------
      window.addEventListener('resize', () => {
        const w = container.clientWidth || 280;
        const h = container.clientHeight || 340;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

      return function cleanup() {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animFrameId);
      };
    }

    // Initialize 3D character and save the cleanup reference
    character3DCleanup = init3DCharacter();
  }


  /* ==========================================================================
     MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('active');

      // Transform hamburger into an 'X'
      const bars = mobileToggle.querySelectorAll('.hamburger-bar');
      if (mobileDrawer.classList.contains('open')) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    // Close drawer when clicking a link
    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        const bars = mobileToggle.querySelectorAll('.hamburger-bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      });
    });
  }


  /* ==========================================================================
     PROJECT TABS INTERACTION
     ========================================================================== */
  function setupProjectTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabPanes = container.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Deactivate all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        // Activate selected
        btn.classList.add('active');
        const activePane = container.querySelector(`.tab-pane[id*="-${targetTab}"]`) ||
          container.querySelector(`.tab-pane[id*="${targetTab}"]`);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  setupProjectTabs('project-tabs-mrivan');
  setupProjectTabs('project-tabs-presence');
  setupProjectTabs('project-tabs-adtendo');


  /* ==========================================================================
     BLE MESH ATTENDANCE SIMULATOR
     ========================================================================== */
  const btnStartMesh = document.getElementById('btn-start-mesh-sim');
  const btnResetMesh = document.getElementById('btn-reset-mesh-sim');
  const meshConsole = document.getElementById('mesh-sim-console');
  const radar = document.querySelector('.mesh-radar');

  const nodes = {
    leaf1: document.getElementById('sim-leaf-1'),
    leaf2: document.getElementById('sim-leaf-2'),
    leaf3: document.getElementById('sim-leaf-3')
  };

  const lines = {
    leaf1: document.getElementById('line-leaf-1'),
    leaf2: document.getElementById('line-leaf-2'),
    leaf3: document.getElementById('line-leaf-3')
  };

  let simTimeouts = [];

  function addConsoleLine(text, styleClass = '') {
    const line = document.createElement('span');
    line.className = `console-line ${styleClass}`;

    // Get timestamp
    const now = new Date();
    const timeStr = `[${now.toTimeString().split(' ')[0]}]`;

    line.innerText = `${timeStr} ${text}`;
    meshConsole.appendChild(line);
    meshConsole.scrollTop = meshConsole.scrollHeight;
  }

  function updateMeshLines() {
    const container = document.querySelector('.mesh-canvas-container');
    const rootNode = document.getElementById('sim-root-node');
    if (!container || !rootNode) return;

    const containerRect = container.getBoundingClientRect();
    const rootRect = rootNode.getBoundingClientRect();
    const rootX = rootRect.left - containerRect.left + rootRect.width / 2;
    const rootY = rootRect.top - containerRect.top + rootRect.height / 2;

    for (let key in nodes) {
      const leafNode = nodes[key];
      const line = lines[key];
      if (leafNode && line) {
        const leafRect = leafNode.getBoundingClientRect();
        const leafX = leafRect.left - containerRect.left + leafRect.width / 2;
        const leafY = leafRect.top - containerRect.top + leafRect.height / 2;

        line.setAttribute('x1', rootX);
        line.setAttribute('y1', rootY);
        line.setAttribute('x2', leafX);
        line.setAttribute('y2', leafY);
      }
    }
  }

  // Draw lines initially and on resize
  setTimeout(updateMeshLines, 500);
  window.addEventListener('resize', updateMeshLines);

  // Re-calculate lines when simulators section transitions into view
  const simObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateMeshLines();
      }
    });
  }, { threshold: 0.1 });

  const simSection = document.getElementById('simulations');
  if (simSection) simObserver.observe(simSection);

  if (btnStartMesh) {
    btnStartMesh.addEventListener('click', () => {
      btnStartMesh.disabled = true;
      btnResetMesh.disabled = false;

      // Start radar sweep
      radar.classList.add('pulsing');

      addConsoleLine('Mesh initialization: Broadcasting session key 0xAE8F...', 'text-purple');

      // Node 1 scanned
      let t1 = setTimeout(() => {
        nodes.leaf1.classList.add('scanned');
        addConsoleLine('Scan: Student A discovered. Signal Strength: -62dBm.', 'text-muted');
      }, 1000);

      // Node 1 connected
      let t2 = setTimeout(() => {
        nodes.leaf1.classList.remove('scanned');
        nodes.leaf1.classList.add('connected');
        lines.leaf1.classList.add('active');
        addConsoleLine('Verify Handshake: Student A signed challenge token successfully.', 'text-success');
      }, 2000);

      // Node 2 scanned
      let t3 = setTimeout(() => {
        nodes.leaf2.classList.add('scanned');
        addConsoleLine('Scan: Student B discovered. Signal Strength: -75dBm.', 'text-muted');
      }, 2800);

      // Node 2 connected
      let t4 = setTimeout(() => {
        nodes.leaf2.classList.remove('scanned');
        nodes.leaf2.classList.add('connected');
        lines.leaf2.classList.add('active');
        addConsoleLine('Verify Handshake: Student B signed challenge token successfully.', 'text-success');
      }, 3800);

      // Node 3 scanned
      let t5 = setTimeout(() => {
        nodes.leaf3.classList.add('scanned');
        addConsoleLine('Scan: Student C discovered. Signal Strength: -55dBm.', 'text-muted');
      }, 4500);

      // Node 3 connected
      let t6 = setTimeout(() => {
        nodes.leaf3.classList.remove('scanned');
        nodes.leaf3.classList.add('connected');
        lines.leaf3.classList.add('active');
        addConsoleLine('Verify Handshake: Student C signed challenge token successfully.', 'text-success');
      }, 5500);

      // Completion log
      let t7 = setTimeout(() => {
        radar.classList.remove('pulsing');
        addConsoleLine('Attendance Cycle Complete: 3 Nodes verified. Syncing local MySQL (3NF)...', 'text-purple');
      }, 6500);

      let t8 = setTimeout(() => {
        addConsoleLine('Database Synced. HTTP Post request successfully sent to Node.js backend!', 'text-success');
      }, 8000);

      simTimeouts.push(t1, t2, t3, t4, t5, t6, t7, t8);
    });
  }

  if (btnResetMesh) {
    btnResetMesh.addEventListener('click', () => {
      // Clear all active timeouts
      simTimeouts.forEach(clearTimeout);
      simTimeouts = [];

      // Reset DOM state
      btnStartMesh.disabled = false;
      btnResetMesh.disabled = true;
      radar.classList.remove('pulsing');

      for (let key in nodes) {
        nodes[key].classList.remove('scanned', 'connected');
      }

      for (let key in lines) {
        lines[key].classList.remove('active');
      }

      meshConsole.innerHTML = '';
      addConsoleLine('[System] Mesh Simulation reset. Ready to scan...', 'text-muted');
      setTimeout(updateMeshLines, 50);
    });
  }


  /* ==========================================================================
     MR. IVAN AI TUTOR CHAT SIMULATOR
     ========================================================================== */
  const chatMessages = document.getElementById('tutor-chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');
  const promptChips = document.querySelectorAll('.chip-btn');

  // Pre-compiled answers database
  const responses = {
    'Explain 3NF Normalization simply.': `Database Normalization in **3rd Normal Form (3NF)** ensures that your tables are organized efficiently. Let's break it down into 3 rules:

1. **First Normal Form (1NF)**: Eliminate duplicate columns and ensure atomic values (no lists in a single cell).
2. **Second Normal Form (2NF)**: Must be in 1NF, and all non-key columns must depend on the *entire* primary key (no partial dependencies).
3. **Third Normal Form (3NF)**: Must be in 2NF, and all non-key columns must depend *only* on the primary key (no transitive dependencies, i.e., column A depends on B, which depends on C).

Do you want to walk through a concrete database example, like a Student enrollment table?`,

    'How does a BLE Mesh network transmit data?': `**Bluetooth Low Energy (BLE) Mesh** is designed for many-to-many communication. Here is how it works:

1. **Flooding Architecture**: Instead of routing tables, BLE Mesh uses managed flooding. When a node transmits a packet, all nearby nodes listen and relay it.
2. **Teacher (Root) & Student (Leaf)**: In PresenceTracker, the teacher initiates a session advertisement. Nearby students receive this, sign it, and advertise their confirmation, which is relayed node-to-node until it reaches the teacher.
3. **Security**: BLE Mesh encrypts data at two levels: Network Security (secures communications on the mesh) and Application Security (secures application data from unauthorized relays).

Shall we discuss how we prevent replay attacks with dynamic challenge keys?`,

    'What is Biometric Cryptography?': `**Biometric Cryptography** combines biometric verification with mathematical encryption. Here is the process in a nutshell:

1. **Key Generation**: A high-entropy cryptographic key is created on the device's secure element (like Android's Keystore).
2. **Authentication Bind**: This key is locked under a biometric prompt (fingerprint or face authentication).
3. **Decryption on Presence**: When the user scans their biometric, the Android system releases the key, which is used to decrypt an attendance session token sent by the server.

This ensures the private key never leaves the device's secure hardware. Would you like to know how Android Keystore manages this under the hood?`
  };

  function appendChatBubble(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'ai-bubble'}`;

    const senderSpan = document.createElement('div');
    senderSpan.className = 'bubble-sender';
    senderSpan.innerText = sender === 'user' ? 'You' : 'Mr. Ivan AI';

    const textSpan = document.createElement('div');
    textSpan.className = 'bubble-text';

    // Small markup translator for bold/lists
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>');

    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>').replace(/<\/ul><ul>/g, '');
    }

    textSpan.innerHTML = formattedText;

    bubble.appendChild(senderSpan);
    bubble.appendChild(textSpan);
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function simulateAiReply(userText) {
    // Generate typing bubble
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai-bubble typing-bubble';
    typingBubble.innerHTML = '<div class="bubble-sender">Mr. Ivan AI</div><div class="bubble-text">...</div>';
    chatMessages.appendChild(typingBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      // Remove typing indicator
      typingBubble.remove();

      // Determine reply text
      let reply = '';
      if (responses[userText]) {
        reply = responses[userText];
      } else {
        reply = `That is a great question about "**${userText}**"! Let's explore this. First, what is your current understanding of the basic concepts behind it? Tell me, and we'll build on top of that step-by-step!`;
      }

      appendChatBubble(reply, 'ai');
    }, 1500);
  }

  function handleUserMessageSubmit() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    appendChatBubble(text, 'user');
    simulateAiReply(text);
  }

  if (btnSendChat && chatInput) {
    btnSendChat.addEventListener('click', handleUserMessageSubmit);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserMessageSubmit();
    });
  }

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      appendChatBubble(chip.innerText, 'user');
      simulateAiReply(promptText);
    });
  });


  /* ==========================================================================
     SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

});
