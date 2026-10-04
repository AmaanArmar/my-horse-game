let gameData = {
    gold: 450,
    diamonds: 42,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", hex: "#d1af97", coatName: "Light Palomino", stars: 1, energy: 100, speed: 12 },
        { name: "Shadow", gender: "Stallion", breed: "Thoroughbred", hex: "#8b4513", coatName: "Classic Brown", stars: 1, energy: 100, speed: 13 }
    ]
};

// Animation frames from your project directory[span_1](start_span)[span_1](end_span)
const frameFiles = ["3903_2.png", "3905_2.png", "3906_2.png", "3907_2.png", "3909_2.png"];
let tintedFramesCache = {};

// Clean canvas color-tinting function for horse coats based on hex code
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
                tintedArray[index] = filename; // Fallback if local sandbox restrictions apply
            }
            
            loadedCount++;
            if (loadedCount === frameFiles.length) {
                tintedFramesCache[hexColor] = tintedArray;
                callback(tintedArray);
            }
        };

        img.onerror = () => {
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
    document.getElementById('slot-count').innerText = gameData.horses.length;

    let active = gameData.horses[gameData.activeHorseIndex];

    document.getElementById('horse-name-display').innerText = active.name;
    document.getElementById('horse-meta-display').innerHTML = `${active.gender} | ${active.breed} | <span style="color:var(--accent-gold);">${active.coatName}</span>`;
    document.getElementById('active-stars').innerHTML = `<span class="grade-badge">Grade ${active.stars}★</span>`;
    document.getElementById('speed-display').innerText = active.speed;
    document.getElementById('energy-display').innerText = active.energy;

    const activeImg = document.getElementById('horse-image-display');
    if (activeImg) {
        loadTintedFrames(active.hex, (frames) => {
            if (frames && frames[0]) activeImg.src = frames[0];
        });
    }

    // Stable Inventory Slots Listing
    let inventoryHtml = "";
    gameData.horses.forEach((h, index) => {
        inventoryHtml += `
            <div class="stable-horse-item" onclick="selectActiveHorse(${index})" style="cursor:pointer; border-left-color: ${h.hex};">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 18px; height: 18px; background-color: ${h.hex}; border-radius: 50%; border: 1px solid #fff;"></div>
                    <div>
                        <strong>${h.name}</strong> <span style="font-size:0.8rem; color:var(--text-muted);">(${h.gender}, ${h.breed})</span><br>
                        <span style="font-size:0.75rem; color:var(--accent-gold);">Stars: ${h.stars}★ | Energy: ${h.energy}</span>
                    </div>
                </div>
                <div style="font-size: 0.85rem; font-weight: bold; color: ${index === gameData.activeHorseIndex ? 'var(--accent-gold)' : 'var(--text-muted)'};">
                    ${index === gameData.activeHorseIndex ? '✓ Active Slot' : 'Select'}
                </div>
            </div>`;
    });
    document.getElementById('stable-inventory').innerHTML = inventoryHtml;

    // Breeding Dropdowns
    let stallionSelect = document.getElementById('stallion-select');
    let mareSelect = document.getElementById('mare-select');
    if (stallionSelect && mareSelect) {
        stallionSelect.innerHTML = "";
        mareSelect.innerHTML = "";

        let stallions = gameData.horses.filter(h => h.gender === "Stallion");
        let mares = gameData.horses.filter(h => h.gender === "Mare");

        if (stallions.length === 0) stallionSelect.innerHTML = `<option value="">-- No Stallions Available --</option>`;
        else stallions.forEach((s) => stallionSelect.innerHTML += `<option value="${gameData.horses.indexOf(s)}">${s.name} (${s.stars}★)</option>`);

        if (mares.length === 0) mareSelect.innerHTML = `<option value="">-- No Mares Available --</option>`;
        else mares.forEach((m) => mareSelect.innerHTML += `<option value="${gameData.horses.indexOf(m)}">${m.name} (${m.stars}★)</option>`);
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
        alert(`${active.name} was fed and gained energy!`);
    } else if (actionType === 'rest') {
        if (gameData.gold < 100) { alert("Need 🪙 100 Gold for stable rest!"); return; }
        gameData.gold -= 100;
        active.energy = 100;
        alert(`${active.name} is fully rested!`);
    }
    updateUI();
}

function buyRandomHorse() {
    if (gameData.gold < 500) { alert("Need 🪙 500 Gold to buy a new horse slot!"); return; }
    gameData.gold -= 500;
    
    let names = ["Thunder", "Blaze", "Storm", "Ghost", "Apollo", "Titan", "Amber Flash", "Golden Sun"];
    let starterCoats = [
        { hex: "#8b4513", name: "Classic Brown" },
        { hex: "#ad754c", name: "Chestnut" },
        { hex: "#d1af97", name: "Light Palomino" },
        { hex: "#d97706", name: "Amber Gold" },
        { hex: "#c2410c", name: "Sunset Orange" },
        { hex: "#5e5854", name: "Smoky Bay" }
    ];
    let selectedCoat = starterCoats[Math.floor(Math.random() * starterCoats.length)];
    
    let newHorse = {
        name: names[Math.floor(Math.random() * names.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: "Thoroughbred",
        hex: selectedCoat.hex,
        coatName: selectedCoat.name,
        stars: 1,
        energy: 100,
        speed: 12 + Math.floor(Math.random() * 4)
    };
    
    gameData.horses.push(newHorse);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(`New stable slot unlocked! ${newHorse.name} (${newHorse.coatName}) has joined your stable!`);
}

function breedHorses() {
    if (gameData.diamonds < 5) { alert("Breeding studio requires 💎 5 Diamonds!"); return; }
    let sIndex = document.getElementById('stallion-select').value;
    let mIndex = document.getElementById('mare-select').value;
    if (sIndex === "" || mIndex === "") { alert("Please select one Stallion and one Mare!"); return; }

    let sire = gameData.horses[sIndex];
    let dam = gameData.horses[mIndex];
    gameData.diamonds -= 5;

    let baseStars = Math.max(sire.stars, dam.stars);
    let upgraded = Math.random() < 0.35;
    let newStars = upgraded ? baseStars + 1 : baseStars;

    let foalNames = ["Nova", "Eclipse", "Comet", "Spirit", "Miracle", "Legacy", "Golden Heir"];
    let newFoal = {
        name: foalNames[Math.floor(Math.random() * foalNames.length)],
        gender: Math.random() < 0.5 ? "Stallion" : "Mare",
        breed: sire.breed,
        hex: sire.hex,
        coatName: "Hybrid Blend",
        stars: newStars,
        energy: 100,
        speed: Math.round((sire.speed + dam.speed) / 2) + 2
    };

    gameData.horses.push(newFoal);
    gameData.activeHorseIndex = gameData.horses.length - 1;
    updateUI();
    alert(upgraded ? `🎉 Success! Grade ${newStars}★ foal ${newFoal.name} was born!` : `Foal ${newFoal.name} born at Grade ${newStars}★!`);
}

let raceInterval = null;

function startLiveRace() {
    let active = gameData.horses[gameData.activeHorseIndex];
    if (active.energy < 20) { alert("Your horse is too tired! Feed or rest them first."); return; }
    active.energy -= 20;

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

    // Load tinted frames for player and AI opponents
    loadTintedFrames(active.hex, (playerFrames) => {
        loadTintedFrames("#5e5854", (ai1Frames) => {
            loadTintedFrames("#ad754c", (ai2Frames) => {

                if (raceInterval) clearInterval(raceInterval);
                let frameStep = 0;

                raceInterval = setInterval(() => {
                    frameStep++;
                    
                    let playerSpeed = 1.5 + (active.speed * 0.08) + (Math.random() * 0.8);
                    let ai1Speed = 2.0 + (Math.random() * 0.7);
                    let ai2Speed = 1.9 + (Math.random() * 0.7);

                    playerPos += playerSpeed;
                    ai1Pos += ai1Speed;
                    ai2Pos += ai2Speed;

                    if (playerElem) playerElem.style.left = playerPos + 'px';
                    if (ai1Elem) ai1Elem.style.left = ai1Pos + 'px';
                    if (ai2Elem) ai2Elem.style.left = ai2Pos + 'px';

                    // Frame animation sequence
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
                            playerPos = 0; ai1Pos = 0; ai2Pos = 0;
                            frameStep = 0;
                        } else {
                            clearInterval(raceInterval);

                            let prizeGold = 350 + (active.stars * 100);
                            let prizeGems = 2 + Math.floor(active.stars / 2);
                            gameData.gold += prizeGold;
                            gameData.diamonds += prizeGems;

                            alert(`🏆 Race Finished! You won 🪙 ${prizeGold} Gold and 💎 ${prizeGems} Diamonds!`);
                            
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
