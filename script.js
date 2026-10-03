let gameData = {
    gold: 550,
    diamonds: 58,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", coat: "white", stars: 1, power: 100, energy: 95, stats: { speed: 12, stamina: 10, acceleration: 10, agility: 10, jump: 8 } },
        { name: "Shadow", gender: "Mare", breed: "Arabian", coat: "brown", stars: 1, power: 98, energy: 90, stats: { speed: 11, stamina: 10, acceleration: 9, agility: 10, jump: 8 } },
        { name: "Blaze", gender: "Stallion", breed: "Thoroughbred", coat: "brown", stars: 1, power: 102, energy: 100, stats: { speed: 13, stamina: 11, acceleration: 10, agility: 9, jump: 9 } },
        { name: "Spirit", gender: "Stallion", breed: "Thoroughbred", coat: "white", stars: 1, power: 105, energy: 100, stats: { speed: 14, stamina: 12, acceleration: 11, agility: 10, jump: 10 } }
    ]
};

const horseAssets = {
    white: {
        standstill: "3903_2.png",
        runningFrames: ["3905_2.png", "3906_2.png", "3907_2.png", "3909_2.png"]
    },
    brown: {
        standstill: "4017.png",
        runningFrames: ["4018.png", "4019.png", "4020.png"]
    }
};

let currentFrameIndex = 0;
let ai1FrameIndex = 0;
let ai2FrameIndex = 0;

let animationInterval = null;
let raceInterval = null;

function updateUI() {
    document.getElementById('gold-display').innerText = gameData.gold;
    document.getElementById('diamond-display').innerText = gameData.diamonds;

    let active = gameData.horses[gameData.activeHorseIndex];
    if (!active.stats) {
        active.stats = { speed: 12, stamina: 10, acceleration: 10, agility: 10, jump: 8 };
    }

    document.getElementById('horse-name-display').innerText = active.name;
    document.getElementById('horse-meta-display').innerText = `${active.gender} | ${active.breed} | ${active.coat.toUpperCase()}`;
    document.getElementById('active-stars').innerText = "★".repeat(active.stars) + ` (${active.stars} Star)`;
    document.getElementById('power-display').innerText = active.power;
    document.getElementById('energy-display').innerText = active.energy;

    const activeImg = document.getElementById('horse-image-display');
    if (activeImg && horseAssets[active.coat]) {
        activeImg.src = horseAssets[active.coat].standstill;
    }

    let inventoryHtml = "";
    gameData.horses.forEach((h, index) => {
        inventoryHtml += `
            <div class="stable-horse-item" onclick="selectActiveHorse(${index})" style="cursor:pointer;">
                <div>
                    <strong>${h.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${h.gender}, ${h.coat})</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--accent-gold);">
                    ${index === gameData.activeHorseIndex ? '✓ Active' : 'Select'}
                </div>
            </div>`;
    });
    document.getElementById('stable-inventory').innerHTML = inventoryHtml;

    let stallionSelect = document.getElementById('stallion-select');
    let mareSelect = document.getElementById('mare-select');
    stallionSelect.innerHTML = "";
    mareSelect.innerHTML = "";

    let stallions = gameData.horses.filter(h => h.gender === "Stallion");
    let mares = gameData.horses.filter(h => h.gender === "Mare");

    if (stallions.length === 0) stallionSelect.innerHTML = `<option value="">-- No Stallions Available --</option>`;
    else stallions.forEach((s) => stallionSelect.innerHTML += `<option value="${gameData.horses.indexOf(s)}">${s.name} (${s.coat}, ${s.stars}★)</option>`);

    if (mares.length === 0) mareSelect.innerHTML = `<option value="">-- No Mares Available --</option>`;
    else mares.forEach((m) => mareSelect.innerHTML += `<option value="${gameData.horses.indexOf(m)}">${m.name} (${m.coat}, ${m.stars}★)</option>`);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');
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

function trainHorseStat(statName) {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (gameData.gold < 150) { alert("Training requires 🪙 150 Gold!"); return; }
    gameData.gold -= 150;
    active.stats[statName] += 2;
    active.power += 5;
    updateUI();
    alert(`Success! ${active.name}'s ${statName.toUpperCase()} increased!`);
}

function buyRandomHorse() {
    if (gameData.gold < 500) { alert("Need 🪙 500 Gold to buy a random horse!"); return; }
    gameData.gold -= 500;
    let names = ["Thunder", "Blaze", "Storm", "Ghost", "Apollo", "Titan"];
    let coats = ["white", "brown"];
    let genders = ["Stallion", "Mare"];
    
    let newHorse = {
        name: names[Math.floor(Math.random() * names.length)],
        gender: genders[Math.floor(Math.random() * genders.length)],
        breed: "Thoroughbred",
        coat: coats[Math.floor(Math.random() * coats.length)],
        stars: 1,
        power: 100 + Math.floor(Math.random() * 10),
        energy: 100,
        stats: { speed: 12, stamina: 10, acceleration: 10, agility: 10, jump: 8 }
    };
    gameData.horses.push(newHorse);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(`New ${newHorse.gender} named ${newHorse.name} acquired!`);
}

function breedHorses() {
    if (gameData.diamonds < 5) { alert("Breeding requires 💎 5 Diamonds!"); return; }
    let sIndex = document.getElementById('stallion-select').value;
    let mIndex = document.getElementById('mare-select').value;
    if (sIndex === "" || mIndex === "") { alert("Select one Stallion and one Mare!"); return; }

    let sire = gameData.horses[sIndex];
    let dam = gameData.horses[mIndex];
    gameData.diamonds -= 5;

    let inheritedCoat = Math.random() < 0.5 ? sire.coat : dam.coat;
    let baseStars = Math.max(sire.stars, dam.stars);
    let upgraded = Math.random() < 0.40 && baseStars < 5;
    let newStars = upgraded ? baseStars + 1 : baseStars;

    let foalNames = ["Nova", "Eclipse", "Comet", "Spirit", "Miracle", "Legacy"];
    let newFoal = {
        name: foalNames[Math.floor(Math.random() * foalNames.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: sire.breed,
        coat: inheritedCoat,
        stars: newStars,
        power: Math.round(((sire.power + dam.power) / 2) + (newStars * 10)),
        energy: 100,
        stats: { speed: sire.stats.speed + 2, stamina: dam.stats.stamina + 2, acceleration: 10, agility: 10, jump: 8 }
    };
    gameData.horses.push(newFoal);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(upgraded ? `🎉 Foal ${newFoal.name} ranked up to ${newStars} Stars!` : `Foal ${newFoal.name} born with ${newStars} Stars!`);
}

// 3-Lap Championship Race with Animated AI Opponents
function startLiveRace() {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (active.energy < 25) { alert("Your horse is too tired! Feed or rest them first."); return; }
    active.energy -= 25;

    let playerElem = document.getElementById('player-racer');
    let ai1Elem = document.getElementById('ai1-racer');
    let ai2Elem = document.getElementById('ai2-racer');
    let lapIndicator = document.getElementById('lap-indicator');
    
    let trackWidth = document.getElementById('race-track').offsetWidth - 80;
    
    let playerPos = 0;
    let ai1Pos = 0;
    let ai2Pos = 0;
    let currentLap = 1;
    const totalLaps = 3;

    // Grab image elements
    const playerImg = document.getElementById('player-img');
    const ai1Img = document.getElementById('ai1-img');
    const ai2Img = document.getElementById('ai2-img');

    // Frames sets
    const playerFrames = horseAssets[active.coat].runningFrames;
    const ai1Frames = horseAssets["brown"].runningFrames;
    const ai2Frames = horseAssets["white"].runningFrames;

    playerImg.src = playerFrames[0];
    ai1Img.src = ai1Frames[0];
    ai2Img.src = ai2Frames[0];

    // Animate all horses running frames continuously
    if (animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(() => {
        currentFrameIndex = (currentFrameIndex + 1) % playerFrames.length;
        ai1FrameIndex = (ai1FrameIndex + 1) % ai1Frames.length;
        ai2FrameIndex = (ai2FrameIndex + 1) % ai2Frames.length;

        playerImg.src = playerFrames[currentFrameIndex];
        ai1Img.src = ai1Frames[ai1FrameIndex];
        ai2Img.src = ai2Frames[ai2FrameIndex];
    }, 100);

    if (raceInterval) clearInterval(raceInterval);

    raceInterval = setInterval(() => {
        let playerSpeed = 1.5 + (active.stats.speed * 0.2) + (Math.random() * 0.8);
        let ai1Speed = 2.2 + (Math.random() * 1.5);
        let ai2Speed = 2.0 + (Math.random() * 1.5);

        playerPos += playerSpeed;
        ai1Pos += ai1Speed;
        ai2Pos += ai2Speed;

        playerElem.style.left = playerPos + 'px';
        ai1Elem.style.left = ai1Pos + 'px';
        ai2Elem.style.left = ai2Pos + 'px';

        if (playerPos >= trackWidth || ai1Pos >= trackWidth || ai2Pos >= trackWidth) {
            if (currentLap < totalLaps) {
                currentLap++;
                lapIndicator.innerText = `Lap ${currentLap} / ${totalLaps}`;
                playerPos = 0;
                ai1Pos = 0;
                ai2Pos = 0;
            } else {
                clearInterval(raceInterval);
                clearInterval(animationInterval);

                let prizeGold = 300 + (active.stars * 100);
                gameData.gold += prizeGold;

                alert(`🏆 Championship Finished! ${active.name} completed all 3 laps and won 🪙 ${prizeGold} Gold!`);
                
                playerElem.style.left = '0px';
                ai1Elem.style.left = '0px';
                ai2Elem.style.left = '0px';
                lapIndicator.innerText = `Lap 1 / 3`;
                updateUI();
            }
        }
    }, 30);
}

updateUI();
                    
