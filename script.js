let gameData = {
    gold: 450,
    diamonds: 42,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", hex: "#d1af97", coatName: "Light Palomino", stars: 1, power: 100, energy: 95, stats: { speed: 12, stamina: 10, acceleration: 10, agility: 10, jump: 8 } },
        { name: "Shadow", gender: "Stallion", breed: "Thoroughbred", hex: "#8b4513", coatName: "Classic Brown", stars: 1, power: 102, energy: 100, stats: { speed: 13, stamina: 11, acceleration: 10, agility: 9, jump: 9 } }
    ]
};

// Exact animation frame files from your project folder
const frameFiles = ["3903_2.png", "3905_2.png", "3906_2.png", "3907_2.png", "3909_2.png"];[span_0](start_span)[span_0](end_span)

let tintedFramesCache = {};

// Load frames with a safe fallback to raw filenames if canvas security blocks local file access
function loadTintedFrames(hexColor, callback) {
    if (tintedFramesCache[hexColor]) {
        callback(tintedFramesCache[hexColor]);
        return;
    }

    let loadedCount = 0;
    let tintedArray = new Array(frameFiles.length);

    frameFiles.forEach((filename, index) => {
        const img = new Image();
        img.src = filename;
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;
                
                // Simple color tinting pass
                let bigint = parseInt(hexColor.replace("#", ""), 16);
                let targetR = (bigint >> 16) & 255;
                let targetG = (bigint >> 8) & 255;
                let targetB = bigint & 255;

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 20) { 
                        let r = data[i], g = data[i + 1], b = data[i + 2];
                        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                        data[i] = Math.round(targetR * luminance * 0.9 + r * 0.1);
                        data[i + 1] = Math.round(targetG * luminance * 0.9 + g * 0.1);
                        data[i + 2] = Math.round(targetB * luminance * 0.9 + b * 0.1);
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                tintedArray[index] = canvas.toDataURL();
            } catch (e) {
                // Fallback to raw image path if canvas security blocks local file reading
                tintedArray[index] = filename;
            }
            
            loadedCount++;
            if (loadedCount === frameFiles.length) {
                tintedFramesCache[hexColor] = tintedArray;
                callback(tintedArray);
            }
        };

        img.onerror = () => {
            // Fallback if image fails to load entirely
            tintedArray[index] = filename;
            loadedCount++;
            if (loadedCount === frameFiles.length) {
                callback(tintedArray);
            }
        };
    });
}

function updateUI() {
    document.getElementById('gold-display').innerText = `🪙 ${gameData.gold}`;
    document.getElementById('diamond-display').innerText = `💎 ${gameData.diamonds}`;

    let active = gameData.horses[gameData.activeHorseIndex];
    if (!active.stats) {
        active.stats = { speed: 12, stamina: 10, acceleration: 10, agility: 10, jump: 8 };
    }

    document.getElementById('horse-name-display').innerText = active.name;
    document.getElementById('horse-meta-display').innerHTML = `${active.gender} | ${active.breed} | <span class="hex-code-label">${active.coatName} (${active.hex})</span>`;
    
    document.getElementById('active-stars').innerHTML = `<span class="grade-badge">Grade ${active.stars}★</span>`;
    document.getElementById('power-display').innerText = active.power;
    document.getElementById('energy-display').innerText = active.energy;

    const activeImg = document.getElementById('horse-image-display');
    if (activeImg) {
        loadTintedFrames(active.hex, (frames) => {
            if (frames && frames[0]) activeImg.src = frames[0];
        });
    }

    let inventoryHtml = "";
    gameData.horses.forEach((h, index) => {
        inventoryHtml += `
            <div class="stable-horse-item" onclick="selectActiveHorse(${index})" style="cursor:pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 14px; height: 14px; background-color: ${h.hex}; border-radius: 50%; border: 1px solid #fff;"></div>
                <div>
                    <strong>${h.name}</strong> <span style="font-size:0.7rem; color:var(--text-muted);">(${h.stars}★ - ${h.hex})</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--accent-gold); margin-left: auto;">
                    ${index === gameData.activeHorseIndex ? '✓ Active' : 'Select'}
                </div>
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

        if (stallions.length === 0) stallionSelect.innerHTML = `<option value="">-- No Stallions Available --</option>`;
        else stallions.forEach((s) => stallionSelect.innerHTML += `<option value="${gameData.horses.indexOf(s)}">${s.name} (${s.hex}, ${s.stars}★)</option>`);

        if (mares.length === 0) mareSelect.innerHTML = `<option value="">-- No Mares Available --</option>`;
        else mares.forEach((m) => mareSelect.innerHTML += `<option value="${gameData.horses.indexOf(m)}">${m.name} (${m.hex}, ${m.stars}★)</option>`);
    }
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
    let statCap = active.stars * 100;
    
    if (active.stats[statName] >= statCap) {
        alert(`${active.name} has reached the max cap (${statCap}) for ${statName.toUpperCase()} at ${active.stars} Stars!`);
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
    let names = ["Thunder", "Blaze", "Storm", "Ghost", "Apollo", "Titan", "Amber Flash", "Golden Sun"];
    let starterCoats = [
        { hex: "#8b4513", name: "Classic Brown" },
        { hex: "#ad754c", name: "Chestnut" },
        { hex: "#d1af97", name: "Light Palomino" },
        { hex: "#d97706", name: "Amber Gold" },
        { hex: "#c2410c", name: "Sunset Orange" },
        { hex: "#9a3412", name: "Burnt Amber" },
        { hex: "#5e5854", name: "Smoky Bay" },
        { hex: "#27272a", name: "Jet Black" }
    ];
    let selectedCoat = starterCoats[Math.floor(Math.random() * starterCoats.length)];
    
    let newHorse = {
        name: names[Math.floor(Math.random() * names.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: "Thoroughbred",
        hex: selectedCoat.hex,
        coatName: selectedCoat.name,
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

    let baseStars = Math.max(sire.stars, dam.stars);
    let upgraded = Math.random() < 0.40 && baseStars < 10;
    let newStars = upgraded ? baseStars + 1 : baseStars;

    let foalNames = ["Nova", "Eclipse", "Comet", "Spirit", "Miracle", "Legacy", "Amber King", "Golden Heir"];
    let newFoal = {
        name: foalNames[Math.floor(Math.random() * foalNames.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: sire.breed,
        hex: sire.hex,
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
    alert(upgraded ? `🎉 Foal ${newFoal.name} ranked up to Grade ${newStars}★!` : `Foal ${newFoal.name} born at Grade ${newStars}★!`);
}

let raceInterval = null;

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
    let trackWidth = trackContainer.offsetWidth - 60;
    
    let playerPos = 0;
    let ai1Pos = 0;
    let ai2Pos = 0;
    let currentLap = 1;
    const totalLaps = 3;

    const playerImg = document.getElementById('player-img');
    const ai1Img = document.getElementById('ai1-img');
    const ai2Img = document.getElementById('ai2-img');

    loadTintedFrames(active.hex, (playerFrames) => {
        loadTintedFrames("#5e5854", (ai1Frames) => {
            loadTintedFrames("#ad754c", (ai2Frames) => {

                if (raceInterval) clearInterval(raceInterval);
                let frameStep = 0;

                raceInterval = setInterval(() => {
                    frameStep++;
                    
                    let throttleFactor = Math.min(1.4, 0.4 + (frameStep * 0.012));

                    let playerSpeed = (1.2 + (active.stats.speed * 0.08) + (Math.random() * 0.5)) * throttleFactor;
                    let ai1Speed = (1.5 + (Math.random() * 0.7)) * throttleFactor;
                    let ai2Speed = (1.4 + (Math.random() * 0.7)) * throttleFactor;

                    playerPos += playerSpeed;
                    ai1Pos += ai1Speed;
                    ai2Pos += ai2Speed;

                    if (playerElem) playerElem.style.left = playerPos + 'px';
                    if (ai1Elem) ai1Elem.style.left = ai1Pos + 'px';
                    if (ai2Elem) ai2Elem.style.left = ai2Pos + 'px';

                    // Direct sequential frame loop using all 5 frames smoothly
                    let frameIndex = Math.floor(frameStep / 4) % frameFiles.length;

                    if (playerImg && playerFrames && playerFrames[frameIndex]) {
                        playerImg.src = playerFrames[frameIndex];
                    }
                    if (ai1Img && ai1Frames && ai1Frames[frameIndex]) {
                        ai1Img.src = ai1Frames[frameIndex];
                    }
                    if (ai2Img && ai2Frames && ai2Frames[frameIndex]) {
                        ai2Img.src = ai2Frames[frameIndex];
                    }

                    if (playerPos >= trackWidth || ai1Pos >= trackWidth || ai2Pos >= trackWidth) {
                        if (currentLap < totalLaps) {
                            currentLap++;
                            if (lapIndicator) lapIndicator.innerText = `Lap ${currentLap} / ${totalLaps}`;
                            playerPos = 0;
                            ai1Pos = 0;
                            ai2Pos = 0;
                            frameStep = 0;
                        } else {
                            clearInterval(raceInterval);

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

            });
        });
    });
}

updateUI();
                        
