let gameData = {
    gold: 550,
    diamonds: 58,
    activeHorseIndex: 0,
    horses: [
        { name: "Misty", gender: "Mare", breed: "Arabian", coat: "Black", stars: 1, power: 100, energy: 95 },
        { name: "Shadow", gender: "Mare", breed: "Arabian", coat: "Black", stars: 1, power: 98, energy: 90 }
    ]
};

function updateUI() {
    document.getElementById('gold-display').innerText = gameData.gold;
    document.getElementById('diamond-display').innerText = gameData.diamonds;

    let active = gameData.horses[gameData.activeHorseIndex];
    document.getElementById('horse-name-display').innerText = active.name;
    document.getElementById('horse-meta-display').innerText = `${active.gender} | ${active.breed} | ${active.coat}`;
    document.getElementById('active-stars').innerText = "★".repeat(active.stars) + ` (${active.stars} Star)`;
    document.getElementById('power-display').innerText = active.power;
    document.getElementById('energy-display').innerText = active.energy;

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

function buyRandomHorse() {
    if (gameData.gold < 500) {
        alert("Need 🪙 500 Gold to buy a random horse!");
        return;
    }
    gameData.gold -= 500;

    let names = ["Thunder", "Blaze", "Storm", "Ghost", "Apollo", "Titan"];
    let coats = ["Black", "Chestnut", "White", "Bay", "Grey"];
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
    alert(`Successfully acquired a new ${newHorse.gender} named ${newHorse.name} (${newHorse.coat})!`);
}

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

    // Coat Color Inheritance: 50% chance from Sire or Dam
    let inheritedCoat = Math.random() < 0.5 ? sire.coat : dam.coat;

    // Tier / Star Logic: 60% chance to stay same tier, 40% chance to upgrade +1 star
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
        alert(`🎉 Amazing! Breeding successful! Your foal ${newFoal.name} ranked up to ${newStars} Stars! Coat: ${newFoal.coat}`);
    } else {
        alert(`Breed successful! Foal ${newFoal.name} born with ${newStars} Stars. Coat: ${newFoal.coat}`);
    }
}

// Initial Call
updateUI();
      
