let gameData = {
    gold: 450,
    diamonds: 42,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", power: 100, energy: 95, speed: 12 },
        { name: "Shadow", gender: "Stallion", breed: "Thoroughbred", power: 102, energy: 100, speed: 13 }
    ]
};

// Direct raw animation frame files
const frameFiles = ["3903_2.png", "3905_2.png", "3906_2.png", "3907_2.png", "3909_2.png"];[span_0](start_span)[span_0](end_span)

function updateUI() {
    document.getElementById('gold-display').innerText = `🪙 ${gameData.gold}`;
    document.getElementById('diamond-display').innerText = `💎 ${gameData.diamonds}`;

    let active = gameData.horses[gameData.activeHorseIndex];

    document.getElementById('horse-name-display').innerText = active.name;
    document.getElementById('horse-meta-display').innerHTML = `${active.gender} | ${active.breed}`;
    document.getElementById('power-display').innerText = active.power;
    document.getElementById('energy-display').innerText = active.energy;

    let activeImg = document.getElementById('horse-image-display');
    if (activeImg) activeImg.src = frameFiles[0];

    let inventoryHtml = "";
    gameData.horses.forEach((h, index) => {
        inventoryHtml += `
            <div onclick="selectActiveHorse(${index})" style="background: #27272a; padding: 10px; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between;">
                <span><strong>${h.name}</strong> (${h.breed})</span>
                <span style="color: #fbbf24;">${index === gameData.activeHorseIndex ? '✓ Active' : 'Select'}</span>
            </div>`;
    });
    document.getElementById('stable-inventory').innerHTML = inventoryHtml;

    let stallionSelect = document.getElementById('stallion-select');
    let mareSelect = document.getElementById('mare-select');
    if (stallionSelect && mareSelect) {
        stallionSelect.innerHTML = "";
        mareSelect.innerHTML = "";

        let stallions = gameData.horses.filter(h => h.gender === "Stallion");
        let mares = gameData.horses.filter(h => h.gender === "Mare");

        if (stallions.length === 0) stallionSelect.innerHTML = `<option value="">-- None Available --</option>`;
        else stallions.forEach((s) => stallionSelect.innerHTML += `<option value="${gameData.horses.indexOf(s)}">${s.name}</option>`);

        if (mares.length === 0) mareSelect.innerHTML = `<option value="">-- None Available --</option>`;
        else mares.forEach((m) => mareSelect.innerHTML += `<option value="${gameData.horses.indexOf(m)}">${m.name}</option>`);
    }
}

function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    if (btnElement) btnElement.classList.add('active');
}

function selectActiveHorse(index) {
    gameData.activeHorseIndex = index;
    updateUI();
}

function careForHorse(actionType) {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (actionType === 'feed') {
        if (gameData.gold < 50) { alert("Need 🪙 50 Gold to feed!"); return; }
        gameData.gold -= 50;
        active.energy = Math.min(100, active.energy + 25);
        alert(`${active.name} was fed!`);
    } else if (actionType === 'rest') {
        if (gameData.gold < 100) { alert("Need 🪙 100 Gold for stable rest!"); return; }
        gameData.gold -= 100;
        active.energy = 100;
        alert(`${active.name} is fully rested!`);
    }
    updateUI();
}

function buyRandomHorse() {
    if (gameData.gold < 500) { alert("Need 🪙 500 Gold to buy a horse!"); return; }
    gameData.gold -= 500;
    let names = ["Thunder", "Blaze", "Storm", "Ghost", "Apollo", "Titan"];
    let newHorse = {
        name: names[Math.floor(Math.random() * names.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: "Thoroughbred",
        power: 100,
        energy: 100,
        speed: 12
    };
    gameData.horses.push(newHorse);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(`New horse ${newHorse.name} acquired!`);
}

function breedHorses() {
    if (gameData.diamonds < 5) { alert("Breeding requires 💎 5 Diamonds!"); return; }
    let sIndex = document.getElementById('stallion-select').value;
    let mIndex = document.getElementById('mare-select').value;
    if (sIndex === "" || mIndex === "") { alert("Select one Stallion and one Mare!"); return; }

    gameData.diamonds -= 5;
    let newFoal = {
        name: "Foal " + Math.floor(Math.random() * 100),
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: "Thoroughbred",
        power: 110,
        energy: 100,
        speed: 14
    };
    gameData.horses.push(newFoal);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(`New foal ${newFoal.name} born!`);
}

let raceInterval = null;

function startLiveRace() {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (active.energy < 25) { alert("Your horse is too tired! Feed or rest first."); return; }
    active.energy -= 25;

    let playerElem = document.getElementById('player-racer');
    let ai1Elem = document.getElementById('ai1-racer');
    let ai2Elem = document.getElementById('ai2-racer');
    let lapIndicator = document.getElementById('lap-indicator');
    
    let trackContainer = document.getElementById('race-track');
    if (!trackContainer) return;
    let trackWidth = trackContainer.offsetWidth - 80;
    
    let playerPos = 0, ai1Pos = 0, ai2Pos = 0;
    let currentLap = 1;
    const totalLaps = 3;

    const playerImg = document.getElementById('player-img');
    const ai1Img = document.getElementById('ai1-img');
    const ai2Img = document.getElementById('ai2-img');

    if (raceInterval) clearInterval(raceInterval);
    let frameStep = 0;

    raceInterval = setInterval(() => {
        frameStep++;
        
        let playerSpeed = 1.8 + (Math.random() * 0.6);
        let ai1Speed = 1.7 + (Math.random() * 0.7);
        let ai2Speed = 1.6 + (Math.random() * 0.7);

        playerPos += playerSpeed;
        ai1Pos += ai1Speed;
        ai2Pos += ai2Speed;

        if (playerElem) playerElem.style.left = playerPos + 'px';
        if (ai1Elem) ai1Elem.style.left = ai1Pos + 'px';
        if (ai2Elem) ai2Elem.style.left = ai2Pos + 'px';

        // Smooth sequential frame loop cycling through the 5 images
        let frameIndex = Math.floor(frameStep / 5) % frameFiles.length;

        if (playerImg) playerImg.src = frameFiles[frameIndex];
        if (ai1Img) ai1Img.src = frameFiles[frameIndex];
        if (ai2Img) ai2Img.src = frameFiles[frameIndex];

        if (playerPos >= trackWidth || ai1Pos >= trackWidth || ai2Pos >= trackWidth) {
            if (currentLap < totalLaps) {
                currentLap++;
                if (lapIndicator) lapIndicator.innerText = `Lap ${currentLap} / ${totalLaps}`;
                playerPos = 0; ai1Pos = 0; ai2Pos = 0;
                frameStep = 0;
            } else {
                clearInterval(raceInterval);
                gameData.gold += 300;
                gameData.diamonds += 2;
                alert(`🏆 Race Finished! You won 🪙 300 Gold and 💎 2 Gems!`);
                
                if (playerElem) playerElem.style.left = '0px';
                if (ai1Elem) ai1Elem.style.left = '0px';
                if (ai2Elem) ai2Elem.style.left = '0px';
                if (lapIndicator) lapIndicator.innerText = `Lap 1 / 3`;
                updateUI();
            }
        }
    }, 30);
}

updateUI();
