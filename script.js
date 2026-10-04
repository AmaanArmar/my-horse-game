const coatLibrary = [
    { name: "Classic Black", filter: "brightness(0.3) contrast(1.2)" },
    { name: "Rich Black", filter: "brightness(0.2) sepia(0.2)" },
    { name: "Classic White", filter: "brightness(1.8) grayscale(1)" },
    { name: "Classic Brown", filter: "sepia(0.8) brightness(0.9) hue-rotate(-10deg)" },
    { name: "Rich Brown", filter: "sepia(0.9) brightness(0.5) hue-rotate(-20deg)" },
    { name: "Copper Chestnut", filter: "sepia(1) saturate(3) hue-rotate(-35deg) brightness(0.8)" },
    { name: "Classic Chestnut", filter: "sepia(1) saturate(2) hue-rotate(-20deg)" },
    { name: "Amber Chestnut", filter: "sepia(1) saturate(2.5) hue-rotate(-10deg) brightness(1.1)" },
    { name: "Flaxen Chestnut", filter: "sepia(0.9) saturate(1.8) brightness(1.2)" },
    { name: "Copper Bay", filter: "sepia(1) saturate(1.5) hue-rotate(-40deg) brightness(0.7)" },
    { name: "Golden Bay", filter: "sepia(0.9) saturate(2) brightness(1.1)" },
    { name: "Classic Bay", filter: "sepia(1) saturate(2) hue-rotate(-50deg) brightness(0.6)" },
    { name: "Blood Bay", filter: "sepia(1) saturate(3) hue-rotate(-30deg) brightness(0.7)" }
];

let gameData = {
    gold: 450,
    diamonds: 65,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", stars: 1, energy: 100, stats: { speed: 20, stamina: 20, agility: 20, accel: 20, spirit: 20 }, coat: coatLibrary[6] },
        { name: "Shadow", gender: "Stallion", breed: "Thoroughbred", stars: 2, energy: 100, stats: { speed: 40, stamina: 35, agility: 40, accel: 38, spirit: 42 }, coat: coatLibrary[0] }
    ]
};

const frameFiles = ["3903_2.png", "3905_2.png", "3906_2.png", "3907_2.png", "3909_2.png"];

function getStatCap(stars) {
    return stars * 100;
}

function updateUI() {
    try {
        document.getElementById('gold-display').innerText = `🪙 ${gameData.gold}`;
        document.getElementById('diamond-display').innerText = `💎 ${gameData.diamonds}`;
        document.getElementById('slot-count').innerText = gameData.horses.length;

        // Safety check if active horse index went out of bounds after selling
        if (gameData.activeHorseIndex >= gameData.horses.length) {
            gameData.activeHorseIndex = 0;
        }

        let active = gameData.horses[gameData.activeHorseIndex] || gameData.horses[0];
        document.getElementById('horse-name-display').innerText = active.name;
        document.getElementById('horse-meta-display').innerText = `${active.gender} | ${active.breed}`;
        document.getElementById('active-stars').innerText = `Grade ${active.stars}★`;
        document.getElementById('active-coat-name').innerText = active.coat.name;
        document.getElementById('energy-display').innerText = active.energy;

        let maxCap = getStatCap(active.stars);
        document.getElementById('max-cap-label').innerText = maxCap;

        let avgStats = Math.floor((active.stats.speed + active.stats.stamina + active.stats.agility + active.stats.accel + active.stats.spirit) / 5);
        document.getElementById('avg-stat-display').innerText = avgStats;
        document.getElementById('speed-rating-display').innerText = active.stats.speed;

        document.getElementById('stat-speed-val').innerText = `${active.stats.speed} / ${maxCap}`;
        document.getElementById('stat-stamina-val').innerText = `${active.stats.stamina} / ${maxCap}`;
        document.getElementById('stat-agility-val').innerText = `${active.stats.agility} / ${maxCap}`;
        document.getElementById('stat-accel-val').innerText = `${active.stats.accel} / ${maxCap}`;
        document.getElementById('stat-spirit-val').innerText = `${active.stats.spirit} / ${maxCap}`;

        let activeImg = document.getElementById('active-horse-img');
        if (activeImg) {
            activeImg.src = frameFiles[0];
            activeImg.style.filter = active.coat.filter;
        }

        let playerImg = document.getElementById('player-racer-img');
        if (playerImg) {
            playerImg.src = frameFiles[0];
            playerImg.style.filter = active.coat.filter;
        }

        let ai1Img = document.getElementById('ai1-racer-img');
        if (ai1Img) {
            ai1Img.src = frameFiles[0];
            ai1Img.style.filter = coatLibrary[3].filter;
        }

        let ai2Img = document.getElementById('ai2-racer-img');
        if (ai2Img) {
            ai2Img.src = frameFiles[0];
            ai2Img.style.filter = coatLibrary[4].filter;
        }

        let inventoryHtml = "";
        gameData.horses.forEach((h, index) => {
            inventoryHtml += `
                <div class="stable-horse-item" onclick="selectActiveHorse(${index})">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; background: #1e1e24; border-radius: 6px; overflow: hidden;">
                            <img src="${frameFiles[0]}" style="width:100%; height:100%; object-fit:contain; filter: ${h.coat.filter};" alt="Mini">
                        </div>
                        <div>
                            <strong style="font-size: 0.85rem;">${h.name}</strong><br>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">${h.stars}★ | ${h.coat.name}</span>
                        </div>
                    </div>
                    <span style="font-size: 0.75rem; color: ${index === gameData.activeHorseIndex ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight: 700;">
                        ${index === gameData.activeHorseIndex ? 'Active' : 'Select'}
                    </span>
                </div>`;
        });
        document.getElementById('stable-inventory').innerHTML = inventoryHtml;

        let stallionSelect = document.getElementById('stallion-select');
        let mareSelect = document.getElementById('mare-select');
        if (stallionSelect && mareSelect) {
            let stallions = gameData.horses.filter(h => h.gender === "Stallion");
            let mares = gameData.horses.filter(h => h.gender === "Mare");

            stallionSelect.innerHTML = stallions.length === 0 ? `<option value="">-- None --</option>` : stallions.map(s => `<option value="${gameData.horses.indexOf(s)}">${s.name} (${s.stars}★)</option>`).join('');
            mareSelect.innerHTML = mares.length === 0 ? `<option value="">-- None --</option>` : mares.map(m => `<option value="${gameData.horses.indexOf(m)}">${m.name} (${m.stars}★)</option>`).join('');
        }
    } catch (e) {
        console.error("UI Error:", e);
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    document.getElementById('tab-btn-' + tabId).classList.add('active');
}

function selectActiveHorse(index) {
    gameData.activeHorseIndex = index;
    updateUI();
}

function careForHorse(type) {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (type === 'feed') {
        if (gameData.gold < 50) { alert("Need 🪙 50 Gold!"); return; }
        gameData.gold -= 50;
        active.energy = Math.min(100, active.energy + 25);
    } else if (type === 'rest') {
        if (gameData.gold < 100) { alert("Need 🪙 100 Gold!"); return; }
        gameData.gold -= 100;
        active.energy = 100;
    }
    updateUI();
}

function sellActiveHorse() {
    if (gameData.horses.length <= 1) {
        alert("You cannot sell or release your only horse!");
        return;
    }

    let active = gameData.horses[gameData.activeHorseIndex];
    // Calculate rewards based on star tier and training progress
    let goldReward = active.stars * 150 + (active.stats.speed * 3);
    let diamondReward = active.stars >= 3 ? active.stars : 1;

    if (confirm(`Do you want to sell ${active.name} (${active.stars}★) for 🪙 ${goldReward} Gold and 💎 ${diamondReward} Diamonds?`)) {
        gameData.gold += goldReward;
        gameData.diamonds += diamondReward;
        gameData.horses.splice(gameData.activeHorseIndex, 1);
        gameData.activeHorseIndex = 0;
        updateUI();
        alert(`Successfully sold ${active.name}! Received 🪙 ${goldReward} and 💎 ${diamondReward}.`);
    }
}

function trainAspect(aspect) {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (gameData.gold < 30) { alert("Need 🪙 30 Gold to train!"); return; }
    let maxCap = getStatCap(active.stars);
    if (active.stats[aspect] >= maxCap) { alert(`This aspect has reached its max potential (${maxCap}) for this star rating!`); return; }

    gameData.gold -= 30;
    active.stats[aspect] = Math.min(maxCap, active.stats[aspect] + 5);
    updateUI();
}

function buyRandomHorse() {
    if (gameData.gold < 500) { alert("Need 🪙 500 Gold!"); return; }
    gameData.gold -= 500;
    let names = ["Thunder", "Blaze", "Storm", "Ghost", "Apollo"];
    let breeds = ["Arabian", "Thoroughbred", "Akhal-Teke", "French Trotter"];
    let newHorse = {
        name: names[Math.floor(Math.random() * names.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        stars: 1,
        energy: 100,
        stats: { speed: 20, stamina: 20, agility: 20, accel: 20, spirit: 20 },
        coat: coatLibrary[Math.floor(Math.random() * coatLibrary.length)]
    };
    gameData.horses.push(newHorse);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(`New horse ${newHorse.name} joined your stable!`);
}

function breedHorses() {
    let sSelect = document.getElementById('stallion-select');
    let mSelect = document.getElementById('mare-select');
    if (!sSelect.value || !mSelect.value) { alert("Select both a Stallion and Mare!"); return; }
    
    if (gameData.diamonds < 5) { alert("Need 💎 5 Diamonds!"); return; }
    gameData.diamonds -= 5;

    let sire = gameData.horses[sSelect.value];
    let dam = gameData.horses[mSelect.value];
    let childStars = Math.min(10, Math.max(sire.stars, dam.stars) + (Math.random() < 0.2 ? 1 : 0));
    
    let newFoal = {
        name: "Foal",
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: sire.breed,
        stars: childStars,
        energy: 100,
        stats: { speed: 20, stamina: 20, agility: 20, accel: 20, spirit: 20 },
        coat: Math.random() < 0.5 ? sire.coat : dam.coat
    };
    gameData.horses.push(newFoal);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(`New ${childStars}★ foal successfully bred!`);
}

let raceInterval = null;
function startLiveRace() {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (active.energy < 20) { alert("Horse is too tired! Feed or rest first."); return; }
    active.energy -= 20;

    let playerElem = document.getElementById('player-racer');
    let playerImg = document.getElementById('player-racer-img');
    let ai1Elem = document.getElementById('ai1-racer');
    let ai1Img = document.getElementById('ai1-racer-img');
    let ai2Elem = document.getElementById('ai2-racer');
    let ai2Img = document.getElementById('ai2-racer-img');
    
    let trackWidth = document.getElementById('race-track').offsetWidth - 65;
    let playerPos = 0, ai1Pos = 0, ai2Pos = 0, currentLap = 1, frameStep = 0;

    let playerAvg = (active.stats.speed + active.stats.stamina + active.stats.agility + active.stats.accel + active.stats.spirit) / 5;
    let playerSpeedMultiplier = 1.0 + (playerAvg / 100) * 1.5;

    if (raceInterval) clearInterval(raceInterval);

    raceInterval = setInterval(() => {
        frameStep++;
        playerPos += 1.8 * playerSpeedMultiplier;
        ai1Pos += 2.2;
        ai2Pos += 2.0;

        playerElem.style.left = playerPos + 'px';
        if (ai1Elem) ai1Elem.style.left = ai1Pos + 'px';
        if (ai2Elem) ai2Elem.style.left = ai2Pos + 'px';

        // Animate ALL horses (Player + AIs) through the running frame sequence
        let frameIntervalDivider = Math.max(2, Math.floor(6 / playerSpeedMultiplier));
        let playerFIdx = Math.floor(frameStep / frameIntervalDivider) % frameFiles.length;
        let ai1FIdx = Math.floor((frameStep + 1) / 3) % frameFiles.length;
        let ai2FIdx = Math.floor((frameStep + 2) / 3) % frameFiles.length;
        
        if (playerImg) playerImg.src = frameFiles[playerFIdx];
        if (ai1Img) ai1Img.src = frameFiles[ai1FIdx];
        if (ai2Img) ai2Img.src = frameFiles[ai2FIdx];

        if (playerPos >= trackWidth || ai1Pos >= trackWidth || ai2Pos >= trackWidth) {
            if (currentLap < 3) {
                currentLap++;
                document.getElementById('lap-indicator').innerText = `Lap ${currentLap} / 3`;
                playerPos = 0; ai1Pos = 0; ai2Pos = 0;
            } else {
                clearInterval(raceInterval);
                gameData.gold += 400;
                gameData.diamonds += 3;
                alert("Race Completed! Rewards added.");
                playerPos = 0; ai1Pos = 0; ai2Pos = 0;
                playerElem.style.left = '0px';
                if (ai1Elem) ai1Elem.style.left = '0px';
                if (ai2Elem) ai2Elem.style.left = '0px';
                if (playerImg) playerImg.src = frameFiles[0];
                if (ai1Img) ai1Img.src = frameFiles[0];
                if (ai2Img) ai2Img.src = frameFiles[0];
                document.getElementById('lap-indicator').innerText = `Lap 1 / 3`;
                updateUI();
            }
        }
    }, 30);
}

window.onload = updateUI;
