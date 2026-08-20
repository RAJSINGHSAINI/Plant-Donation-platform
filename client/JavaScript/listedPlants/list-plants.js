let allPlants = [];

async function getPlants() {

    const response = await fetch("http://192.168.0.113:8080/api/plant/get-all-plants", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        showMessage(data.message, "error");
        return;
    }

    allPlants = data.plants.map(plant => ({
        _id: plant._id,
        name: plant.name,
        category: plant.category,
        quantity: plant.quantity,
        coverImage: plant.coverImage,
        address: plant.address,
        status: plant.status
    }));

    renderPlants(allPlants);
}

function renderPlants(plants) {

    const container = document.getElementById("home-container");
    container.innerHTML = '';

    if (plants.length === 0) {
        container.innerHTML = '<h4 class="message">No Plants Found 🌱</h4>';
        return;
    }

    plants.forEach(plant => {

        //  Status based action button
        let actionButton = "";
        if (plant.status === "available") {
            actionButton = `<button class="pick-btn" data="${plant._id}">Pick Plant</button>`;
        } else if (plant.status === "assigned") {
            actionButton = `<button disabled>Assigned</button>`;
        } else if (plant.status === "picked") {
            actionButton = `<button disabled>Picked</button>`;
        } else {
            actionButton = `<button disabled>Planted 🌳</button>`;
        }

        const card = document.createElement("div");
        card.className = "home-card";

        card.innerHTML = `
        <div class="home-image">
            <img src="http://192.168.0.113:8080/uploads/${plant.coverImage}" alt="${plant.name}">
        </div>

        <div class="home-content">
            <div class="title">${plant.name}</div>
            <div class="location">📍 ${plant.address.city || 'Unknown'}</div>
            <div>🌿 ${plant.category}</div>
            <div>📦 Qty: ${plant.quantity}</div>
            <span class="status-badge ${plant.status}">${plant.status.toUpperCase()}</span>

            <div class="card-actions">
                <!--  Details btn navigates to plant detail page with ID in URL -->
                <a class="details-btn" href="/client/HTML/PlantDetail/plant-detail.html?id=${plant._id}">Details</a>
                ${actionButton}
            </div>
        </div>
        `;

        container.appendChild(card);
    });

    //  Pick button event
    document.querySelectorAll('.pick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const plantID = e.target.getAttribute("data");
            pickPlant(plantID);
        });
    });
}

getPlants();


async function pickPlant(plantID) {
    try {

        const res = await fetch("http://192.168.0.113:8080/api/donation/pick", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ plantID })
        });

        const data = await res.json();

        showMessage(data.message, data.success ? "success" : "error");

        if (data.success) {
            getPlants(); 
        }

    } catch (error) {
        showMessage("Something went wrong", "error");
    }
}


const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style = "display:none";
    renderPlants(allPlants);
});

searchBtn.addEventListener("click", () => {
    const query = searchInput.value.toLowerCase().trim();
    clearBtn.style = "display:inline";

    const filteredPlants = allPlants.filter(plant => {
        const name = plant.name.toLowerCase();

        const address = `
            ${plant.address?.street || ""}
            ${plant.address?.city || ""}
            ${plant.address?.state || ""}
            ${plant.address?.pincode || ""}
        `.toLowerCase();

        return name.includes(query) || address.includes(query);
    });

    renderPlants(filteredPlants);
});