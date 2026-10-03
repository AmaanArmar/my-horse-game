// Game State & Inventory
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

// Image Assets Mapping (Using your exact number format or custom filenames)
const horseAssets = {
    white: {
        standstill: "assets/3903_2.png",
        runningFrames: [
            "assets/3905_2.png",
            "assets/3906_2.png",
            "assets/3907_2.png",
            "assets/3909_2.png"
        ]
    },
    brown: {
        standstill: "assets/4017.png",
        runningFrames: [
            "assets/4018.png",
            "assets/4019.png",
            "assets/4020.png"
        ]
    }
};

let currentFrameIndex = 0;
let animationInterval = null;
let raceInterval = null;

// Update UI Elements
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

    // Set stable image to standstill pose
    setStandstill(active.coat, 'horse-image-display');

    // Render Stable Inventory List
    let inventoryHtml = "";
    gameData.horses.forEach((h, index) => {
        inventoryHtml += `
            <div class="stable-horse-item" onclick="selectActiveHorse(${index})" style="cursor:pointer;">
                <div>
                    <strong>${h.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${h.gender}, ${h.coat})</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--accent-orange);">
                    ${index === gameData.activeHorseIndex ? '✓ Active' : 'Select'}
                </div>
            </div>`;
    });
    document.getElementById('stable-inventory').innerHTML = inventoryHtml;

    // Update Breeding Dropdowns
    let stallionSelect = document.getElementById('stallion-select');
    let mareSelect = document.getElementById('mare-select');
    
    stallionSelect.innerHTML = "";
    mareSelect.innerHTML = "";

    let stallions = gameData.horses.filter(h => h.gender === "Stallion");
    let mares = gameData.horses.filter(h => h.gender === "Mare");

    if(stallions.length === 0) {
        stallionSelect.innerHTML = `<option value="">-- No Stallions Available --</option>`;
    } else {
        stallions.forEach((s) => {
            stallionSelect.innerHTML += `<option value="${gameData.horses.indexOf(s)}">${s.name} (${s.coat}, ${s.stars}★)</option>`;
        });
    }

    if(mares.length === 0) {
        mareSelect.innerHTML = `<option value="">-- No Mares Available --</option>`;
    } else {
        mares.forEach((m) => {
            mareSelect.innerHTML += `<option value="${gameData.horses.indexOf(m)}">${m.name} (${m.coat}, ${m.stars}★)</option>`;
        });
    }
}

// Standstill image helper
function setStandstill(horseColor, elementId) {
    const el = document.getElementById(elementId);
    if (el && horseAssets[horseColor]) {
        el.src = horseAssets[horseColor].standstill;
    }
}

// Running animation loop controller
function startRaceAnimation(horseColor, elementId, speedStat) {
    const el = document.getElementById(elementId);
    if (!el || !horseAssets[horseColor]) return;
    
    const frames = horseAssets[horseColor].runningFrames;
    let frameRate = Math.max(70, 180 - (speedStat * 3)); 

    if (animationInterval) clearInterval(animationInterval);

    animationInterval = setInterval(() => {
        el.src = frames[currentFrameIndex];
        currentFrameIndex = (currentFrameIndex + 1) % frames.length;
    }, frameRate);
}

// Tab Switching Logic
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

// Caring System (Feed / Rest)
function careForHorse(actionType) {
    let active = gameData.horses[gameData.activeHorseIndex];

    if (actionType === 'feed') {
        if (gameData.gold < 50) { alert("Need 🪙 50 Gold to feed!"); return; }
        gameData.gold -= 50;
        active.energy = Math.min(100, active.energy + 25);
        alert(`${active.name} was fed and gained energy!`);
    } else if (actionType === 'rest') {
        if (gameData.gold < 100) { alert("Need 🪙 100 Gold for stable rest!"); return; }
        gameData.gold -= 100;
        active.energy = 100;
        alert(`${active.name} is fully rested!`);
    }
    updateUI();
}

// Training System
function trainHorseStat(statName) {
    let active = gameData.horses[gameData.activeHorseIndex];
    let cost = 150;

    if (gameData.gold < cost) {
        alert(`Training requires 🪙 ${cost} Gold!`);
        return;
    }

    gameData.gold -= cost;
    active.stats[statName] += 2;
    active.power += 5;
    
    updateUI();
    alert(`Success! ${active.name}'s ${statName.toUpperCase()} increased!`);
}

// Buy Random Horse
function buyRandomHorse() {
    if (gameData.gold < 500) {
        alert("Need 🪙 500 Gold to buy a random horse!");
        return;
    }
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
    alert(`Successfully acquired a new ${newHorse.gender} named ${newHorse.name}!`);
}

// Breeding Logic (60/40 Split & Coat Inheritance)
function breedHorses() {
    if (gameData.diamonds < 5) {
        alert("Breeding requires 💎 5 Diamonds!");
        return;
    }

    let sIndex = document.getElementById('stallion-select').value;
    let mIndex = document.getElementById('mare-select').value;

    if (sIndex === "" || mIndex === "") {
        alert("You must select one valid Stallion and one Mare to breed!");
        return;
    }

    let sire = gameData.horses[sIndex];
    let dam = gameData.horses[mIndex];

    gameData.diamonds -= 5;

    let inheritedCoat = Math.random() < 0.5 ? sire.coat : dam.coat;
    let baseStars = Math.max(sire.stars, dam.stars);
    let roll = Math.random();
    let newStars = baseStars;
    let upgraded = false;

    if (roll < 0.40 && baseStars < 5) { 
        newStars += 1;
        upgraded = true;
    }

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

    if (upgraded) {
        alert(`🎉 Amazing! Your foal ${newFoal.name} ranked up to ${newStars} Stars!`);
    } else {
        alert(`Breed successful! Foal ${newFoal.name} born with ${newStars} Stars.`);
    }
}

// Live Race Animation Simulation
function startLiveRace() {
    let active = gameData.horses[gameData.activeHorseIndex];

    if (active.energy < 25) {
        alert("Your horse is too tired! Feed or rest them in the Care tab before racing.");
        return;
    }

    active.energy -= 25;

    let racerElement = document.getElementById('racer-container');
    let trackWidth = document.getElementById('race-track').offsetWidth - 120;
    let currentPosition = 0;

    // Start running frame sequence using horse coat type and speed stat
    startRaceAnimation(active.coat, 'racer-horse-img', active.stats.speed);

    if (raceInterval) clearInterval(raceInterval);

    raceInterval = setInterval(() => {
        let moveSpeed = 2 + (active.stats.speed * 0.25);
        currentPosition += moveSpeed;

        racerElement.style.left = currentPosition + 'px';

        if (currentPosition >= trackWidth) {
            clearInterval(raceInterval);
            if (animationInterval) clearInterval(animationInterval);

            let prizeGold = 250 + (active.stars * 75);
            gameData.gold += prizeGold;
            
            alert(`🏁 Race Finished! ${active.name} crossed the line and won 🪙 ${prizeGold} Gold!`);
            
            racerElement.style.left = '0px';
            updateUI();
        }
    }, 30);
}

// Initial Run
updateUI();
