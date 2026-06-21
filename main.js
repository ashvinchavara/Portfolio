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

    // --- 3D Character (Midnight Enigma Rigged Model) ---
    function init3DCharacter() {
      const container = document.getElementById('gru-container');
      if (!container) return null;

      // Show loader message
      container.innerHTML = `
        <div class="character-loader" style="
          color: #0ea5e9;
          font-family: sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-transform: uppercase;
        ">Loading Character...</div>
      `;

      let scene, camera, renderer, clock, mixer;
      let model = null;
      let head = null;
      let rightArm = null;
      let rightForeArm = null;
      let rightHand = null;
      let leftArm = null;
      let headfront = null;

      let mouseX = 0;
      let mouseY = 0;
      let isTracking = false;
      let trackingWeight = 0;
      let mouseMoveTimeout = null;
      let animationFrameId = null;

      const defaultArmDir = new THREE.Vector3();
      const defaultHeadDir = new THREE.Vector3();
      let gunLight = null;

      try {
        const width = container.clientWidth || 280;
        const height = container.clientHeight || 340;

        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0.35, 1.6);
        camera.lookAt(0, 0.25, 0);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Force canvas to layout properly inside container
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(2, 4, 3);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x0ea5e9, 0.5);
        fillLight.position.set(-2, 1, 1);
        scene.add(fillLight);

        clock = new THREE.Clock();

        // Load textures first
        const textureLoader = new THREE.TextureLoader();
        const albedoTex = textureLoader.load('./character_albedo.png');
        const normalTex = textureLoader.load('./character_normal.png');
        const roughnessTex = textureLoader.load('./character_roughness.png');
        const metallicTex = textureLoader.load('./character_metallic.png');

        albedoTex.colorSpace = THREE.SRGBColorSpace;

        const loader = new FBXLoader();
        loader.load(
          './character.fbx',
          (fbx) => {
            // Remove loader element
            const loaderEl = container.querySelector('.character-loader');
            if (loaderEl) loaderEl.remove();

            model = fbx;
            scene.add(model);

            // FBX is in centimeters, scale down to match meters (approx 0.0065 world size)
            model.scale.set(0.0065, 0.0065, 0.0065);
            model.position.set(0, -0.65, 0);
            model.rotation.y = 0.4; 

            model.traverse((node) => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                // Apply the textures manually
                node.material = new THREE.MeshStandardMaterial({
                  map: albedoTex,
                  normalMap: normalTex,
                  roughnessMap: roughnessTex,
                  metalnessMap: metallicTex,
                  roughness: 0.8,
                  metalness: 0.2
                });
              }
            });

            head = model.getObjectByName('Head');
            rightArm = model.getObjectByName('RightArm');
            rightForeArm = model.getObjectByName('RightForeArm');
            rightHand = model.getObjectByName('RightHand');
            leftArm = model.getObjectByName('LeftArm');
            headfront = model.getObjectByName('headfront');

            if (rightHand) {
              const gunGroup = new THREE.Group();
              gunGroup.name = 'SciFiWeapon';

              const bodyGeo = new THREE.BoxGeometry(0.06, 0.08, 0.14);
              const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
              const body = new THREE.Mesh(bodyGeo, bodyMat);
              body.position.set(0, 0, 0);
              gunGroup.add(body);

              const barrelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12);
              barrelGeo.rotateX(Math.PI / 2);
              const barrelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.9 });
              const barrel = new THREE.Mesh(barrelGeo, barrelMat);
              barrel.position.set(0, 0.01, 0.15);
              gunGroup.add(barrel);

              const energyGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8);
              energyGeo.rotateX(Math.PI / 2);
              const energyMat = new THREE.MeshStandardMaterial({
                color: 0x00ff00,
                emissive: 0x10b981,
                emissiveIntensity: 4.0,
                roughness: 0.1
              });
              const energy = new THREE.Mesh(energyGeo, energyMat);
              energy.position.set(0, 0.03, 0.04);
              gunGroup.add(energy);

              const muzzleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.02, 12);
              muzzleGeo.rotateX(Math.PI / 2);
              const muzzleMat = new THREE.MeshStandardMaterial({
                color: 0x10b981,
                emissive: 0x059669,
                emissiveIntensity: 3.0
              });
              const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
              muzzle.position.set(0, 0.01, 0.26);
              gunGroup.add(muzzle);

              gunLight = new THREE.PointLight(0x10b981, 2.5, 1.2);
              gunLight.position.set(0, 0.01, 0.27);
              gunGroup.add(gunLight);

              // Scale the gun back up in the local coordinate space of the hand (which is in centimeters)
              const gunScale = 1.0 / 0.0065;
              gunGroup.scale.set(gunScale, gunScale, gunScale);
              
              // Shift the gun along the hand bone (centimeters)
              gunGroup.position.set(0, 8.0, 2.0);
              gunGroup.rotation.set(Math.PI / 2, 0, 0);

              rightHand.add(gunGroup);
            }

            // Bone orientation setup with NaN protection
            if (rightArm && rightForeArm) {
              defaultArmDir.copy(rightForeArm.position).normalize();
              if (isNaN(defaultArmDir.x) || isNaN(defaultArmDir.y) || isNaN(defaultArmDir.z) || defaultArmDir.lengthSq() === 0) {
                defaultArmDir.set(0, -1, 0);
              }
            } else {
              defaultArmDir.set(0, -1, 0);
            }

            if (head && headfront) {
              defaultHeadDir.copy(headfront.position).normalize();
              if (isNaN(defaultHeadDir.x) || isNaN(defaultHeadDir.y) || isNaN(defaultHeadDir.z) || defaultHeadDir.lengthSq() === 0) {
                defaultHeadDir.set(0, 0, 1);
              }
            } else {
              defaultHeadDir.set(0, 0, 1);
            }

            // Look for animations inside FBX
            if (fbx.animations && fbx.animations.length > 0) {
              mixer = new THREE.AnimationMixer(model);
              const action = mixer.clipAction(fbx.animations[0]);
              action.play();
            }
          },
          undefined,
          (error) => {
            console.error('Error loading FBX model:', error);
            container.innerHTML = '<div style="color: #ef4444; font-family: sans-serif; font-size: 11px; display: flex; align-items: center; justify-content: center; height: 100%;">Character Load Failed</div>';
          }
        );

        function onMouseMove(e) {
          if (isEntering) return;

          mouseX = (e.clientX / window.innerWidth) * 2 - 1;
          mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

          isTracking = true;

          clearTimeout(mouseMoveTimeout);
          mouseMoveTimeout = setTimeout(() => {
            isTracking = false;
          }, 1500);
        }

        window.addEventListener('mousemove', onMouseMove);

        function animate() {
          animationFrameId = requestAnimationFrame(animate);

          const delta = clock.getDelta();
          
          if (mixer) {
            mixer.update(delta);
          }

          // Procedural breathing animation when idle (no mixer running)
          if (model && !mixer) {
            const time = clock.getElapsedTime();
            const spine = model.getObjectByName('Spine01') || model.getObjectByName('Spine');
            if (spine && trackingWeight < 0.99) {
              spine.rotation.x = Math.sin(time * 1.8) * 0.015 * (1 - trackingWeight);
            }
            if (leftArm && trackingWeight < 0.99) {
              leftArm.rotation.z = (Math.sin(time * 1.8) * 0.02 - 0.2) * (1 - trackingWeight);
            }
            if (rightArm && trackingWeight < 0.05) {
              rightArm.rotation.z = (Math.sin(time * 1.8 + Math.PI) * 0.01 - 0.2) * (1 - trackingWeight);
            }
          }

          if (isTracking && model && head && rightArm) {
            trackingWeight = THREE.MathUtils.lerp(trackingWeight, 1.0, 0.08);
          } else {
            trackingWeight = THREE.MathUtils.lerp(trackingWeight, 0.0, 0.04);
          }

          if (model && head && rightArm && trackingWeight > 0.005) {
            const mouse3D = new THREE.Vector3(mouseX, mouseY, 0.5);
            mouse3D.unproject(camera);
            const dir = mouse3D.sub(camera.position).normalize();
            
            // Division-by-zero check
            if (Math.abs(dir.z) > 0.0001) {
              const dist = -camera.position.z / dir.z;
              const target3D = camera.position.clone().add(dir.multiplyScalar(dist));

              // 1. Head tracking
              const headWorldPos = new THREE.Vector3();
              head.getWorldPosition(headWorldPos);
              const headToTarget = target3D.clone().sub(headWorldPos).normalize();
              
              const parentHeadWorldQuat = new THREE.Quaternion();
              head.parent.getWorldQuaternion(parentHeadWorldQuat);
              const localHeadDir = headToTarget.clone().applyQuaternion(parentHeadWorldQuat.invert());

              const targetHeadQuat = new THREE.Quaternion().setFromUnitVectors(defaultHeadDir, localHeadDir);
              
              const eulerHead = new THREE.Euler().setFromQuaternion(targetHeadQuat, 'YXZ');
              eulerHead.x = THREE.MathUtils.clamp(eulerHead.x, -0.4, 0.4);
              eulerHead.y = THREE.MathUtils.clamp(eulerHead.y, -0.6, 0.6);
              eulerHead.z = 0;
              targetHeadQuat.setFromEuler(eulerHead);

              head.quaternion.slerp(targetHeadQuat, trackingWeight);

              // 2. Right Arm tracking (pointing gun)
              const armWorldPos = new THREE.Vector3();
              rightArm.getWorldPosition(armWorldPos);
              const armToTarget = target3D.clone().sub(armWorldPos).normalize();

              const parentArmWorldQuat = new THREE.Quaternion();
              rightArm.parent.getWorldQuaternion(parentArmWorldQuat);
              const localArmDir = armToTarget.clone().applyQuaternion(parentArmWorldQuat.invert());

              const targetArmQuat = new THREE.Quaternion().setFromUnitVectors(defaultArmDir, localArmDir);
              
              const eulerArm = new THREE.Euler().setFromQuaternion(targetArmQuat, 'YXZ');
              eulerArm.x = THREE.MathUtils.clamp(eulerArm.x, -1.2, 0.8);
              eulerArm.y = THREE.MathUtils.clamp(eulerArm.y, -1.0, 1.0);
              eulerArm.z = THREE.MathUtils.clamp(eulerArm.z, -0.8, 0.8);
              targetArmQuat.setFromEuler(eulerArm);

              rightArm.quaternion.slerp(targetArmQuat, trackingWeight);

              // Straighten elbow (RightForeArm) and wrist (RightHand) to make gun pointing direct
              if (rightForeArm) {
                rightForeArm.quaternion.slerp(new THREE.Quaternion(), trackingWeight);
              }
              if (rightHand) {
                rightHand.quaternion.slerp(new THREE.Quaternion(), trackingWeight);
              }

              // 3. Body rotation (turn back)
              const angleToTarget = Math.atan2(target3D.x - model.position.x, target3D.z - model.position.z);
              const targetModelY = THREE.MathUtils.clamp(angleToTarget, -0.2, 0.8);
              model.rotation.y = THREE.MathUtils.lerp(0.4, targetModelY, trackingWeight);

              if (gunLight) {
                gunLight.intensity = THREE.MathUtils.lerp(1.5, 4.0, trackingWeight);
              }
            }
          } else if (model && gunLight) {
            model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, 0.4, 0.05);
            gunLight.intensity = THREE.MathUtils.lerp(gunLight.intensity, 1.5, 0.05);
          }

          renderer.render(scene, camera);
        }

        animate();

        function onResize() {
          const w = container.clientWidth || 280;
          const h = container.clientHeight || 340;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
        window.addEventListener('resize', onResize);

        return function cleanup() {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('resize', onResize);
          clearTimeout(mouseMoveTimeout);
          cancelAnimationFrame(animationFrameId);
          if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
              renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
          }
        };
      } catch (err) {
        console.error("Three.js setup error:", err);
        container.innerHTML = '<div style="color: #ef4444; font-family: sans-serif; font-size: 11px; display: flex; align-items: center; justify-content: center; height: 100%;">3D Canvas Error</div>';
        return null;
      }
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
