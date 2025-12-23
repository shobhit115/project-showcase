document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CUSTOM CURSOR ---
    const cursor = document.querySelector('.cursor-ball');
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
    });

    // --- 2. ADVANCED THREE.JS SCENE MANAGER ---
    const sceneContainer = document.getElementById('canvas-container');
    let scene, camera, renderer, animationId;
    let currentMesh = null; // Track current object to remove later
    let currentSceneType = 'nebula';

    // Interaction variables
    let targetX = 0, targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        targetX = (event.clientX - windowHalfX) * 0.001;
        targetY = (event.clientY - windowHalfY) * 0.001;
    });

    function initThreeEngine() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        sceneContainer.appendChild(renderer.domElement);

        // Load Default Scene
        loadNebula();
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    let nebulaPositions;
    let nebulaColors;
    let nebulaTime = 0;


    // --- SCENE 1: NEBULA (Particles) ---
    function loadNebula() {
        clearScene();

        const geometry = new THREE.BufferGeometry();
        const count = 1500;

        nebulaPositions = new Float32Array(count * 3);
        nebulaColors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            nebulaPositions[i * 3] = (Math.random() - 0.5) * 150;
            nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
            nebulaPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            // Initial color (HSL based)
            const color = new THREE.Color().setHSL(
                0.65 + Math.random() * 0.1, // blue–violet range
                0.7,
                0.6
            );

            nebulaColors[i * 3] = color.r;
            nebulaColors[i * 3 + 1] = color.g;
            nebulaColors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });

        currentMesh = new THREE.Points(geometry, material);
        scene.add(currentMesh);

        currentSceneType = 'nebula';
    }


    // --- SCENE 2: MATRIX (Cyber Grid) ---
    function loadMatrix() {
        clearScene();
        const geometry = new THREE.PlaneGeometry(200, 200, 40, 40);
        const material = new THREE.MeshBasicMaterial({
            color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.3
        });
        currentMesh = new THREE.Mesh(geometry, material);
        currentMesh.rotation.x = -Math.PI / 2;
        currentMesh.position.y = -20;
        scene.add(currentMesh);
        currentSceneType = 'matrix';
    }
    
    // --- SCENE 3: ORBS (Floating Shapes) ---
    function loadOrbs() {
        clearScene();
        const group = new THREE.Group();
        const geometry = new THREE.IcosahedronGeometry(2, 0);
        const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });

        for (let i = 0; i < 30; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = (Math.random() - 0.5) * 100;
            mesh.position.y = (Math.random() - 0.5) * 60;
            mesh.position.z = (Math.random() - 0.5) * 50;
            mesh.scale.setScalar(Math.random() * 2 + 0.5);
            group.add(mesh);
        }
        currentMesh = group;
        scene.add(currentMesh);
        currentSceneType = 'orbs';
    }

    function clearScene() {
        if (currentMesh) {
            scene.remove(currentMesh);
            if (currentMesh.geometry) currentMesh.geometry.dispose();
            if (currentMesh.material) currentMesh.material.dispose();
            currentMesh = null;
        }
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        if (currentSceneType === 'nebula' && currentMesh) {
            nebulaTime += 0.0015;

            const positions = currentMesh.geometry.attributes.position.array;
            const colors = currentMesh.geometry.attributes.color.array;

            for (let i = 0; i < positions.length; i += 3) {
                // Gentle particle drift
                positions[i + 1] += Math.sin(nebulaTime + i) * 0.002;
                positions[i] += Math.cos(nebulaTime + i) * 0.001;

                // Smooth color cycling
                const hue = (0.6 + nebulaTime * 1 + i * 0.00005) % 1;

                const color = new THREE.Color().setHSL(hue, 0.7, 0.6);

                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }

            currentMesh.geometry.attributes.position.needsUpdate = true;
            currentMesh.geometry.attributes.color.needsUpdate = true;

            // === AUTO COSMIC DRIFT ===
            currentMesh.rotation.y += 0.0010;

            // === MOUSE PARALLAX ROTATION (SMOOTH) ===
            currentMesh.rotation.x += 0.05 * (targetY - currentMesh.rotation.x);
            currentMesh.rotation.y += 0.05 * (targetX - currentMesh.rotation.y);
        } else if (currentSceneType === 'matrix' && currentMesh) {
            // Wave effect
            const positions = currentMesh.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                // Simple sine wave movement based on time
                positions[i + 2] = Math.sin(positions[i] / 10 + Date.now() / 1000) * 2;
            }
            currentMesh.geometry.attributes.position.needsUpdate = true;
            currentMesh.rotation.z += 0.001;
        } else if (currentSceneType === 'orbs' && currentMesh) {
            currentMesh.rotation.y += 0.002;
            currentMesh.children.forEach((child, i) => {
                child.rotation.x += 0.01;
                child.rotation.y += 0.01;
                child.position.y += Math.sin(Date.now() / 1000 + i) * 0.05;
            });
        }

        renderer.render(scene, camera);
    }

    initThreeEngine();

    // --- 3. SCENE SWITCHER EVENTS ---
    const sceneBtns = document.querySelectorAll('.scene-btn');
    sceneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            sceneBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Logic Switch
            const type = btn.dataset.scene;
            if (type === 'nebula') loadNebula();
            if (type === 'matrix') loadMatrix();
            if (type === 'orbs') loadOrbs();
        });
    });

    // --- 4. APP LOGIC (Data, Slider, Etc) ---
    // (Existing Logic preserved for brevity, ensuring functionality remains)
    const grid = document.getElementById('projectsGrid');
    const heroTitle = document.getElementById('heroTitle');
    const heroDesc = document.getElementById('heroDesc');
    const heroLink = document.getElementById('heroLink');
    const heroImageContainer = document.getElementById('heroImageContainer');
    const slideDots = document.getElementById('slideDots');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const yearFilter = document.getElementById('yearFilter');

    let allProjects = [], featuredProjects = [], currentSlide = 0, slideInterval;

    fetch('data/projects.json')
        .then(res => res.json())
        .then(data => {
            allProjects = data;
            featuredProjects = data.filter(p => p.isFeatured === true);
            if (featuredProjects.length === 0) featuredProjects = data.slice(0, 5);
            initHero();
            initFilters(data);
            renderGrid(data);
        });

    // ... (Keep existing initHero, renderGrid, manualSlide, changeSlide, updateHeroText, filters, modal logic here)
    // I am including the standard functions here to ensure copy-paste works

    function initHero() {
        if (!featuredProjects.length) return;
        heroImageContainer.innerHTML = featuredProjects.map((p, i) => `<img src="${p.image || 'assets/images/placeholder.jpg'}" class="hero-slide-img ${i === 0 ? 'active' : ''}">`).join('');
        slideDots.innerHTML = featuredProjects.map((_, i) => `<div class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('');
        updateHeroText(0);
        startAutoSlide();
        document.getElementById('prevSlide').onclick = () => manualSlide('prev');
        document.getElementById('nextSlide').onclick = () => manualSlide('next');
        document.querySelectorAll('.hero-dot').forEach(d => d.onclick = (e) => { stopAutoSlide(); changeSlide(parseInt(e.target.dataset.index)); startAutoSlide(); });
    }
    function manualSlide(dir) { stopAutoSlide(); let n = dir === 'next' ? (currentSlide + 1) % featuredProjects.length : (currentSlide - 1 + featuredProjects.length) % featuredProjects.length; changeSlide(n); startAutoSlide(); }
    function changeSlide(i) {
        document.querySelectorAll('.hero-slide-img').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.hero-slide-img')[i].classList.add('active');
        document.querySelectorAll('.hero-dot').forEach(d => d.classList.remove('active'));
        document.querySelectorAll('.hero-dot')[i].classList.add('active');
        updateHeroText(i);
        currentSlide = i;
    }
    function updateHeroText(i) {
        const p = featuredProjects[i]; heroTitle.textContent = p.title; heroDesc.textContent = p.description;
        heroLink.href = p.demo || p.github || '#'; heroLink.textContent = p.demo ? 'View Project' : 'View Code';
    }
    function startAutoSlide() { slideInterval = setInterval(() => manualSlide('next'), 6000); }
    function stopAutoSlide() { clearInterval(slideInterval); }

    function renderGrid(projects) {
        grid.innerHTML = '';
        projects.forEach(p => {
            const card = document.createElement('div'); card.className = 'card';
            card.innerHTML = `
                <div class="card-img-box" onclick="openModal('${p.title}')"><img src="${p.image || ''}" loading="lazy"></div>
                <div class="card-body"><div class="card-meta"><span>${p.category}</span><span>${p.year}</span></div>
                <h3 class="card-title" onclick="openModal('${p.title}')">${p.title}</h3>
                <p class="card-desc">${p.description}</p>
                <div class="card-actions"><a href="${p.github || '#'}" class="btn-outline">Code</a><a href="${p.demo || '#'}" class="btn-card-fill">Live</a></div></div>`;
            grid.appendChild(card);
        });
    }

    function initFilters(data) {
        const cats = [...new Set(data.map(p => p.category))], yrs = [...new Set(data.map(p => p.year))].sort((a, b) => b - a);
        cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; categoryFilter.appendChild(o) });
        yrs.forEach(y => { const o = document.createElement('option'); o.value = y; o.textContent = y; yearFilter.appendChild(o) });
        const filterFn = () => {
            const t = searchInput.value.toLowerCase(), c = categoryFilter.value, y = yearFilter.value;
            renderGrid(allProjects.filter(p => (p.title.toLowerCase().includes(t) || p.tech.some(x => x.toLowerCase().includes(t))) && (c === 'all' || p.category === c) && (y === 'all' || p.year == y)));
        };
        [searchInput, categoryFilter, yearFilter].forEach(el => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', filterFn));
    }

    // Modal
    const modal = document.getElementById('projectModal'), modalPanel = document.querySelector('.modal-panel');
    window.openModal = (t) => {
        const p = allProjects.find(x => x.title === t); if (!p) return;
        document.getElementById('modalTitle').textContent = p.title; document.getElementById('modalDescription').textContent = p.longDescription;
        document.getElementById('modalImage').src = p.image || ''; document.getElementById('modalCategory').textContent = p.category; document.getElementById('modalYear').textContent = p.year;
        document.getElementById('modalTech').innerHTML = p.tech.map(x => `<span>${x}</span>`).join('');
        document.getElementById('modalGithub').href = p.github || '#'; document.getElementById('modalDemo').href = p.demo || '#';
        modal.classList.add('open'); document.body.style.overflow = 'hidden';
    };
    const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = 'auto'; };
    document.querySelector('.close-modal-btn').onclick = closeModal; document.querySelector('.modal-backdrop').onclick = closeModal;
});