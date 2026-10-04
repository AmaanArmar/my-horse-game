let gameData = {
    gold: 550,
    diamonds: 58,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", hex: "#d1af97", coatName: "Light Palomino", stars: 1, power: 100, energy: 95, stats: { speed: 12, stamina: 10, acceleration: 10, agility: 10, jump: 8 } },
        { name: "Shadow", gender: "Stallion", breed: "Thoroughbred", hex: "#8b4513", coatName: "Classic Brown", stars: 1, power: 102, energy: 100, stats: { speed: 13, stamina: 11, acceleration: 10, agility: 9, jump: 9 } }
    ]
};

// Helper to convert HEX to RGB for genetic color blending
function hexToRgb(hex) {
    let bigint = parseInt(hex.replace("#", ""), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
}

// Helper to convert RGB back to HEX
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        let hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

// Calculates CSS filter approximation to tint the base white horse image toward a target HEX color
function getCssFilterForHex(hex) {
    let rgb = hexToRgb(hex);
    // Base image is white (~255, 255, 255). We calculate a rough sepia/hue-rotate/brightness filter combo.
    let brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 255;
    let sepia = rgb.r > rgb.b ? 1 : 0.3;
    let hue = Math.round((rgb.r - rgb.b) * 0.5);
    return `brightness(${Math.max(0.2, brightness * 1.2)}) sepia(${sepia}) hue-rotate(${hue}deg)`;
}

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
    document.getElementById('horse-meta-display').innerHTML = `${active.gender} | ${active.breed} | <span class="hex-code-label">${active.coatName} (${active.hex})</span>`;
    
    // 10-Star Grade Display Format
    document.getElementById('active-stars').innerHTML = `<span class="grade-badge">Grade ${active.stars}★</span>`;
    document.getElementById('power-display').innerText = active.power;
    document.getElementById('energy-display').innerText = active.energy;

    const activeImg = document.getElementById('horse-image-display');
    if (activeImg) {
        activeImg.src = "3903_2.png"; // Base white horse template
        activeImg.style.filter = getCssFilterForHex(active.hex);
        activeImg.classList.add('tinted-horse');
    }

    let inventoryHtml = "";
    gameData.horses.forEach((h, index) => {
        inventoryHtml += `
            <div class="stable-horse-item" onclick="selectActiveHorse(${index})" style="cursor:pointer;">
                <div>
                    <strong>${h.name}</strong> <span style="font-size:0.70rem; color:var(--text-muted);">(${h.grade || h.stars}★ - ${h.hex})</span>
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
    else stallions.forEach((s) => stallionSelect.innerHTML += `<option value="${gameData.horses.indexOf(s)}">${s.name} (${s.hex}, ${s.stars}★)</option>`);

    if (mares.length === 0) mareSelect.innerHTML = `<option value="">-- No Mares Available --</option>`;
    else mares.forEach((m) => mareSelect.innerHTML += `<option value="${gameData.horses.indexOf(m)}">${m.name} (${m.hex}, ${m.stars}★)</option>`);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
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
    let statCap = active.stars * 100; // 1-star = 100 cap, 10-star = 1000 cap!
    
    if (active.stats[statName] >= statCap) {
        alert(`${active.name} has reached the max cap (${statCap}) for ${statName.toUpperCase()} at ${active.stars} Stars! Breed a higher star tier to continue training.`);
        return;
    }

    if (gameData.gold < 150) { alert("Training requires 🪙 150 Gold!"); return; }
    gameData.gold -= 150;
    
    active.stats[statName] = Math.min(statCap, active.stats[statName] + 5);
    active.power += 2;
    updateUI();
    alert(`Success! ${active.name}'s ${statName.toUpperCase()} increased to ${active.stats[statName]}/${statCap}!`);
}

function buyRandomHorse() {
    if (gameData.gold < 500) { alert("Need 🪙 500 Gold to buy a random horse!"); return; }
    gameData.gold -= 500;
    let names = ["Thunder", "Blaze", "Storm", "Ghost", "Apollo", "Titan"];
    let starterHexes = ["#8b4513", "#ad754c", "#d1af97", "#5e5854", "#000000", "#ffffff"];
    let coatNames = ["Classic Brown", "Chestnut", "Palomino", "Smoky Bay", "Jet Black", "Pure White"];
    let randIdx = Math.floor(Math.random() * starterHexes.length);
    
    let newHorse = {
        name: names[Math.floor(Math.random() * names.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: "Thoroughbred",
        hex: starterHexes[randIdx],
        coatName: coatNames[randIdx],
        stars: 1,
        power: 100,
        energy: 100,
        stats: { speed: 12, stamina: 10, acceleration: 10, agility: 10, jump: 8 }
    };
    gameData.horses.push(newHorse);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(`New horse named ${newHorse.name} acquired with coat ${newHorse.coatName} (${newHorse.hex})!`);
}

function breedHorses() {
    if (gameData.diamonds < 5) { alert("Breeding requires 💎 5 Diamonds!"); return; }
    let sIndex = document.getElementById('stallion-select').value;
    let mIndex = document.getElementById('mare-select').value;
    if (sIndex === "" || mIndex === "") { alert("Select one Stallion and one Mare!"); return; }

    let sire = gameData.horses[sIndex];
    let dam = gameData.horses[mIndex];
    gameData.diamonds -= 5;

    // Blend parent RGB colors to create a unique inherited foal hex code!
    let rgbSire = hexToRgb(sire.hex);
    let rgbDam = hexToRgb(dam.hex);
    let blendR = Math.round((rgbSire.r + rgbDam.r) / 2 + (Math.random() * 20 - 10));
    let blendG = Math.round((rgbSire.g + rgbDam.g) / 2 + (Math.random() * 20 - 10));
    let blendB = Math.round((rgbSire.b + rgbDam.b) / 2 + (Math.random() * 20 - 10));
    let inheritedHex = rgbToHex(blendR, blendG, blendB);

    let baseStars = Math.max(sire.stars, dam.stars);
    let upgraded = Math.random() < 0.40 && baseStars < 10; // Supports up to 10 Stars!
    let newStars = upgraded ? baseStars + 1 : baseStars;

    let foalNames = ["Nova", "Eclipse", "Comet", "Spirit", "Miracle", "Legacy", "Apollo"];
    let newFoal = {
        name: foalNames[Math.floor(Math.random() * foalNames.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: sire.breed,
        hex: inheritedHex,
        coatName: "Hybrid Blend",
        stars: newStars,
        power: Math.round(((sire.power + dam.power) / 2) + (newStars * 15)),
        energy: 100,
        stats: { 
            speed: Math.min(newStars * 100, Math.round((sire.stats.speed + dam.stats.speed) / 2) + 5), 
            stamina: Math.min(newStars * 100, Math.round((sire.stats.stamina + dam.stats.stamina) / 2) + 5), 
            acceleration: 15, 
            agility: 15, 
            jump: 12 
        }
    };
    gameData.horses.push(newFoal);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(upgraded ? `🎉 Foal ${newFoal.name} ranked up to Grade ${newStars}★! Color: ${inheritedHex}` : `Foal ${newFoal.name} born at Grade ${newStars}★ with color ${inheritedHex}!`);
}

function startLiveRace() {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (active.energy < 25) { alert("Your horse is too tired! Feed or rest them first."); return; }
    active.energy -= 25;

    let playerElem = document.getElementById('player-racer');
    let ai1Elem = document.getElementById('ai1-racer');
    let ai2Elem = document.getElementById('ai2-racer');
    let lapIndicator = document.getElementById('lap-indicator');
    
    let trackContainer = document.getElementById('race-track');
    if (!trackContainer) return;
    let trackWidth = trackContainer.offsetWidth - 80;
    
    let playerPos = 0;
    let ai1Pos = 0;
    let ai2Pos = 0;
    let currentLap = 1;
    const totalLaps = 3;

    const playerImg = document.getElementById('player-img');
    const ai1Img = document.getElementById('ai1-img');
    const ai2Img = document.getElementById('ai2-img');

    if (playerImg) {
        playerImg.src = "3903_2.png";
        playerImg.style.filter = getCssFilterForHex(active.hex);
    }
    if (ai1Img) {
        ai1Img.src = "4018.png";
    }
    if (ai2Img) {
        ai2Img.src = "3906_2.png";
    }

    if (raceInterval) clearInterval(raceInterval);

    raceInterval = setInterval(() => {
        let playerSpeed = 1.5 + (active.stats.speed * 0.1) + (Math.random() * 0.8);
        let ai1Speed = 2.2 + (Math.random() * 1.2);
        let ai2Speed = 2.0 + (Math.random() * 1.2);

        playerPos += playerSpeed;
        ai1Pos += ai1Speed;
        ai2Pos += ai2Speed;

        if (playerElem) playerElem.style.left = playerPos + 'px';
        if (ai1Elem) ai1Elem.style.left = ai1Pos + 'px';
        if (ai2Elem) ai2Elem.style.left = ai2Pos + 'px';

        if (playerPos >= trackWidth || ai1Pos >= trackWidth || ai2Pos >= trackWidth) {
            if (currentLap < totalLaps) {
                currentLap++;
                if (lapIndicator) lapIndicator.innerText = `Lap ${currentLap} / ${totalLaps}`;
                playerPos = 0;
                ai1Pos = 0;
                ai2Pos = 0;
            } else {
                clearInterval(raceInterval);

                // Payout including Gold and Gems for winning!
                let prizeGold = 300 + (active.stars * 150);
                let prizeGems = 2 + Math.floor(active.stars / 2);
                gameData.gold += prizeGold;
                gameData.diamonds += prizeGems;

                alert(`🏆 Victory! ${active.name} won 🪙 ${prizeGold} Gold and 💎 ${prizeGems} Gems!`);
                
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
