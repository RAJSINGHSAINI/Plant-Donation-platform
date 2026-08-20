const form = document.getElementById('plantForm');

// ADD PLANT
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // append normal fields
    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
        if (input.type !== "file") {
            formData.append(input.name, input.value);
        }
    });

    // cover image
    const coverFile = document.getElementById("coverImage").files[0];
    if (coverFile) {
        formData.append("coverImage", coverFile);
    }

    // multiple images (limit to 5)
    const imageFiles = document.getElementById("images").files;
    const limitedFiles = Array.from(imageFiles).slice(0, 5);

    limitedFiles.forEach(file => {
        formData.append("images", file);
    });


    if (!formData.get("coverImage")) {
        return showMessage("Please select a cover image", "error");
    }


    if (!formData.get("name") || !formData.get("category") || !formData.get("quantity") || !formData.get("description") || !formData.get("street") || !formData.get("city") || !formData.get("state") || !formData.get("pincode")) {
        return showMessage("Please fill all required fields", "error");
    }


    if (formData.get("quantity") <= 0) {
        return showMessage("Quantity must be greater than 0", "error");
    }


    if (formData.get("pincode").length !== 6) {
        return showMessage("Pincode must be 6 digits", "error");
    }

    const res = await fetch("http://192.168.0.113:8080/api/plant/add-plant", {
        method: "POST",
        body: formData,
        credentials: "include"
    });

    const data = await res.json();

    console.log(data);
    showMessage(data.message, data.success ? "success" : "error");

    if (data.success) {
        form.reset();
        loadMyPlants();
    }
});


// LOAD MY PLANTS (DONOR)
async function loadMyPlants() {
    const res = await fetch("http://192.168.0.113:8080/api/plant/my-plants", {
        credentials: "include"
    });

    const data = await res.json();

    const container = document.getElementById("home-container");
    container.innerHTML = "";

    if (!data.plants || data.plants.length === 0) {
        container.innerHTML = "<p>No plants added yet</p>";
        return;
    }
    console.log(data.plants);
    
    data.plants.forEach(plant => {
        container.innerHTML += `
<div class="home-card">

    <!-- 🌱 Image -->
    <div class="home-image">
        <img src="http://192.168.0.113:8080/uploads/${plant.coverImage}">
        <span class="price">${plant.category}</span>
    </div>

    <!-- 🌱 Content -->
    <div class="home-content">

        <h3 class="title">${plant.name}</h3>

        <p class="location">
            📍 ${plant.address?.city || "Unknown"}
        </p>

        <p class="description">
            ${plant.description.substring(0, 80)}...
        </p>

        <!-- 🌱 Info -->
        <div class="home-info">
            <span class="info-item">🌿 Qty: ${plant.quantity}</span>
            <span class="info-item status ${plant.status}">
                ${plant.status.toUpperCase()}
            </span>
        </div>

        <!-- 🌱 Actions -->
        <div class="card-actions">
            <button class="edit-btn"onclick ="window.location.href = 'edit-plant.html?id=${plant._id}'">✏️ Edit</button>
            <button class="delete-btn" onclick="deletePlant('${plant._id}')">🗑 Delete</button>
        </div>

    </div>

</div>
`;
    });
}

async function deletePlant(plantID) {

    const confirmDelete = confirm("Are you sure you want to delete this plant?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`http://192.168.0.113:8080/api/plant/delete-plant/${plantID}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();

        showMessage(data.message, data.success ? "success" : "error");

        if (data.success) {
            loadMyPlants();
        }

    } catch (error) {
        console.log(error);
        showMessage("Something went wrong", "error");
    }
}



async function logoutUser() {

    const res = await fetch("http://192.168.0.113:8080/api/auth/logout", {

        method: "POST",

        credentials: "include"

    });

    const data = await res.json();

    if (data.success) {

        showMessage("Logged out successfully", "success");
        isLoggedIn = false;
        setTimeout(() => {

            window.location.href = `${window.location.origin}/client/HTML/index.html`;
        }, 3000);
    }

}

document.getElementById("logout").addEventListener("click", logoutUser);


// Cover preview
document.getElementById("coverImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("coverPreview");

    preview.innerHTML = "";
    if (file) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    }
});

// Multiple images preview
document.getElementById("images").addEventListener("change", (e) => {
    const files = e.target.files;
    const preview = document.getElementById("imagesPreview");

    preview.innerHTML = "";


    //Take only 5 images
    const limitedFiles = Array.from(files).slice(0, 5);

    limitedFiles.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    });
});

async function getAllDonations() {
    const res = await fetch('http://192.168.0.113:8080/api/donation/my-donations', {
        method: 'GET',
        credentials: 'include'
    });

    const data = await res.json();

    if (!data.success) {
        return showMessage(data.message, "error");
    }

    donationsData = data.donations;
    console.log(donationsData);

    renderDonations(donationsData);
}

const currentContainer = document.getElementById("currentContainer");

async function renderDonations(donations) {
    console.log(donations);
    currentContainer.innerHTML = '';
    donations.forEach(d => {
        currentContainer.innerHTML += `
                    <div class=" home-card rented-room">
                    <div class="wrap-up">

                        <div class="cover-image">
                            <img src="http://192.168.0.113:8080/uploads/${d.plant.coverImage}" alt="">
                        </div>
                        <div class="rent-info home-info">
                            <h4 id="title">${d.plant.name}</h4>
                            <h4>Total Quantity: ${d.plant.quantity}</h4>
                            <h4>Category: ${d.plant.category}</h4>
                            <h4>Location: ${d.plant.address.city}</h4>
                            <h4>Status: <span class="${d.status}">${d.status.toUpperCase()}</span></h4>
                            </div>
                            <div class="rent-info home-info">
                                <p><strong>Volunteer:</strong> ${d.volunteer ? d.volunteer.name : "Not assigned"}</p>
                                <p><strong>Contact:</strong> ${d.volunteer ? d.volunteer.email : "N/A"}</p>
                                <p><strong>Address:</strong> ${d.plant ? `${d.plant.address.street}, ${d.plant.address.city}, ${d.plant.address.state} - ${d.plant.address.pincode}` : "N/A"}</p>
                                <p><strong>Assigned Date:</strong> ${d.volunteer ? new Date(d.createdAt).toDateString() : "N/A"}</p>
                                <p><strong>Picked Date:</strong> ${d.volunteer ? new Date(d.pickedAt).toDateString() : "N/A"}</p>
                               ${d.plantedAt ? `<p><strong>Planted Date:</strong> ${new Date(d.plantedAt).toDateString()}</p>` : ""}
                            </div>
                    </div>
                   <div class="flex-align-center see-more" style="margin: 0 1rem;">

    ${d.status === "assigned" ? `
        <button class="confirm-btn" data-id="${d._id}">Confirm Pickup</button>
        <button class="cancel-btn" data-id="${d._id}">Cancel</button>
    ` : ''}
    ${d.status === "picked" ? `
        <button class="cancel-btn" data-id="${d._id}">Cancel</button>
    ` : ''}

    ${d.status === "cancelled" ? `
        <span class="status cancelled">Cancelled</span>
    ` : ''}

</div>
                </div>
    `
    })

    // confirm pickup button event
    document.querySelectorAll('.confirm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const donationID = e.target.getAttribute("data-id");
            confirmPickup(donationID);
        });
    });

    // cancel pickup button event
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const donationID = e.target.getAttribute("data-id");
            cancelPickup(donationID);
        });
    });

}
async function confirmPickup(id) {

    const res = await fetch('http://192.168.0.113:8080/api/donation/confirm-pickup', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ donationID: id })
    });

    const data = await res.json();
    showMessage(data.message, "success");

    getAllDonations();
}
async function cancelPickup(id) {

    const res = await fetch('http://192.168.0.113:8080/api/donation/cancel', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ donationID: id })
    });

    const data = await res.json();
    showMessage(data.message, "success");

    getAllDonations();
}
// INIT
loadMyPlants();
getAllDonations();