const currentContainer = document.querySelector('#activeContainer'); //  Fixed: was #activityContainer
const historyContainer = document.querySelector('#historyContainer');

let donationsData = [];

// GET DONATIONS (VOLUNTEER)
async function getAllDonations() {
    const res = await fetch('http://192.168.0.120:8080/api/donation/my-picked', {
        method: 'GET',
        credentials: 'include'
    });

    const data = await res.json();

    if (!data.success) {
        return showMessage(data.message, "error");
    }

    donationsData = data.donations;
    renderDonations(donationsData);
}


// RENDER
function renderDonations(donations) {

    currentContainer.innerHTML = '';
    historyContainer.innerHTML = '';

    donations.forEach(d => {

        //  Show "Planted At" date only if status is planted and date exists
        const plantedAtHTML = (d.status === 'planted' && d.plantedAt)
            ? `<p><strong>Planted At:</strong> ${new Date(d.plantedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>`
            : '';

        const card = `
<div class="booking-card">

    <img src="http://192.168.0.120:8080/uploads/${d.plant.coverImage}" class="booking-img">

    <div class="booking-content">

        <div class="card-top">
            <h3 class="room-title">${d.plant.name}</h3>
            <span class="status ${d.status}">${d.status.toUpperCase()}</span>
        </div>

        <p class="location">📍 ${d.plant.address.city}</p>

        <div class="booking-info">
            <p><strong>Category:</strong> ${d.plant.category}</p>
            <p><strong>Quantity:</strong> ${d.plant.quantity}</p>
            ${plantedAtHTML}
        </div>

        <div class="btn-row">
            <button class="style-btn detail-btn" data-id="${d._id}">Details</button>
            ${getActionButtons(d)}
        </div>

    </div>
</div>
`;

        //  planted goes to history section
        if (d.status === 'planted' || d.status === 'cancelled') {
            historyContainer.innerHTML += card;
        } else {
            currentContainer.innerHTML += card;
        }
    });

    if (!currentContainer.innerHTML) {
        currentContainer.innerHTML = '<h4>No Active Plants</h4>';
    }

    if (!historyContainer.innerHTML) {
        historyContainer.innerHTML = '<h4>No History Found</h4>';
    }
}

//  Fixed: Removed duplicate forEach loop, merged ALL click logic into one listener per container
[currentContainer, historyContainer].forEach(parent => {
    parent.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;

        if (e.target.classList.contains('detail-btn')) {
            const donation = donationsData.find(d => d._id === id);
            openDetailsModal(donation);
        }

        if (e.target.classList.contains('pickup-btn')) {
            await confirmPickup(id);
        }

        if (e.target.classList.contains('plant-btn')) {
            await markPlanted(id);
        }

        if (e.target.classList.contains('cancel-btn')) {
            await cancelDonation(id);
        }
    });
});


function openDetailsModal(d) {
    document.getElementById("detailsModal").style.display = "flex";

    document.getElementById("m-name").innerText = d.plant?.name || "N/A";
    document.getElementById("m-category").innerText = d.plant?.category || "N/A";
    document.getElementById("m-status").innerText = d.status || "N/A";

    document.getElementById("m-donor").innerText =
        d.donor ? `${d.donor.name} (${d.donor.email})` : "N/A";

    document.getElementById("m-volunteer").innerText =
        d.volunteer ? `${d.volunteer.name} (${d.volunteer.email})` : "Not Assigned";
}

function closeDetailsModal() { document.getElementById("detailsModal").style.display = "none"; }

//  Fixed: Added missing closeCancelModal function (referenced in HTML but was undefined)
function closeCancelModal() { document.getElementById("cancelModal").style.display = "none"; }


// ACTION BUTTONS (CORE LOGIC)
function getActionButtons(d) {

    if (d.status === "requested") {
        return `<button class="waiting-btn" disabled>Waiting for Approval</button>`;
    }

    if (d.status === "assigned") {
        return `<button class="waiting-btn" disabled>Waiting for Pickup</button>`;
    }

    //  Fixed: Added pickup-btn for "assigned" flow so volunteer can confirm pickup
    if (d.status === "picked") {
        return `
            <button class="plant-btn" data-id="${d._id}">Mark Planted</button>
            <button class="cancel-btn" data-id="${d._id}">Cancel</button>
        `;
    }

    if (d.status === "planted") {
        return `<button class="done-btn" disabled>Planted </button>`;
    }

    if (d.status === "cancelled") {
        return `<button class="cancel-btn disabled" disabled>Cancelled ❌</button>`;
    }

    return '';
}


// CONFIRM PICKUP
async function confirmPickup(id) {
    const res = await fetch('http://192.168.0.120:8080/api/donation/confirm-pickup', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ donationID: id })
    });

    const data = await res.json();
    showMessage(data.message, "success");
    getAllDonations();
}


// MARK PLANTED
async function markPlanted(id) {
    const res = await fetch('http://192.168.0.120:8080/api/donation/mark-planted', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ donationID: id })
    });

    const data = await res.json();
    showMessage(data.message, "success");
    getAllDonations();
}


// CANCEL
async function cancelDonation(id) {
    const res = await fetch('http://192.168.0.120:8080/api/donation/cancel', {
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
getAllDonations();