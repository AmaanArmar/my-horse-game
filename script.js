// Game State & Inventory
let gameData = {
    gold: 550,
    diamonds: 58,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", coat: "white", stars: 1, power: 100, energy: 95 },
        { name: "Shadow", gender: "Mare", breed: "Arabian", coat: "brown", stars: 1, power: 98, energy: 90 }
    ]
};

// Image Assets Mapping for Animations
const horseAssets = {
    white: {
        standstill: "assets/3903_2.png", //[span_2](start_span)[span_2](end_span) Initial standing pose
        runningFrames: [
            "assets/3905_2.png", //[span_3](start_span)[span_3](end_span)
            "assets/3906_2.png", //[span_4](start_span)[span_4](end_span)
            "assets/3907_2.png", //[span_5](start_span)[span_5](end_span)
            "assets/3909_2.png"  //[span_6](start_span)[span_6](end_span)
        ]
    },
    brown: {
        standstill: "assets/4017.png", //[span_7](start_span)[span_7](end_span) Initial standing pose
        runningFrames: [
            "assets/4018.png", //[span_8](start_span)[span_8](end_span)
            "assets/4019.png", //[span_9](start_span)[span_9](end_span)
            "assets/4020.png"  //[span_10](start_span)[span_10](end_span)
        ]
    }
};

let currentFrameIndex = 0;
let animationInterval = null;

// Update UI Elements
function updateUI() {
    document.getElementById('gold-display').innerText = gameData.gold;
    document.getElementById('diamond-display').innerText = gameData.diamonds;

    let active = gameData.horses[gameData.activeHorseIndex];
    document.getElementById('horse-name-display').innerText = active.name;
    document.getElementById('horse-meta-display').innerText = `${active.gender} | ${active.breed} | ${active.coat.toUpperCase()}`;
    document.getElementById('active-stars').innerText = "★".repeat(active.stars) + ` (${active.stars} Star)`;
    document.getElementById('power-display').innerText = active.power;
    document.getElementById('energy-display').innerText = active.energy;

    // Set horse image to standstill by default when viewing stable
    setStandstill(active.coat, 'horse-image-display');

    // Render Stable Inventory
    let inventoryHtml = "";
    gameData.horses.forEach((h, index) => {
        inventoryHtml += `
            <div class="stable-horse-item" style="cursor:pointer;" onclick="selectActiveHorse(${index})">
                <div>
                    <strong>${h.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${h.gender}, ${h.coat})</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--accent-gold);">
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
        stallionSelect.innerHTML = `<option value="">-- No Stallions Available (Buy one!) --</option>`;
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

// Set Standstill Image
function setStandstill(horseColor, imageElementId) {
    const imgElement = document.getElementById(imageElementId);
    if (imgElement && horseAssets[horseColor]) {
        imgElement.src = horseAssets[horseColor].standstill;
    }
}

// Start Running Animation Loop
function startRaceAnimation(horseColor, imageElementId, speedStat) {
    const imgElement = document.getElementById(imageElementId);
    if (!imgElement || !horseAssets[horseColor]) return;
    
    const frames = horseAssets[horseColor].runningFrames;
    let frameRate = Math.max(80, 200 - (speedStat * 2)); 

    if (animationInterval) clearInterval(animationInterval);

    animationInterval = setInterval(() => {
        imgElement.src = frames[currentFrameIndex];
        currentFrameIndex = (currentFrameIndex + 1) % frames.length;
    }, frameRate);
}

// Tab Switching
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

// Buy Random Horse Logic
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
        energy: 100
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
        energy: 100
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

// Initial Run
updateUI();
