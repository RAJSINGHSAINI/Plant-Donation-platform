// plant-detail.js
const params = new URLSearchParams(window.location.search);
const plantID = params.get('id'); // ← gets the id from URL

// then fetch the plant
async function getPlantDetail() {
    const res = await fetch(`http://192.168.0.120:8080/api/plant/get-plant/${plantID}`, {
        credentials: 'include'
    });
    const data = await res.json();
    console.log(data);

    if (data.success) {
        renderPlant(data.plant);
    } else {
        showMessage(data.message, "error");
    }

}

function renderPlant(plantData) {
    const container = document.getElementById('plant-container');
    
    container.innerHTML = `
                <div class="gallery-container">
                    <span class="badge">${plantData.status}</span>
                    <img src="http://192.168.0.120:8080/uploads/${plantData.coverImage}" alt="${plantData.name}" class="main-img" id="mainDisplay" alt="Plant">
                </div>

                <div class="content">
                    <div class="header">
                        <div>
                            <h1>${plantData.name}</h1>
                            <span class="category">${plantData.category}</span>
                        </div>
                        <div style="text-align: right">
                            <div class="label">Quantity</div>
                            <div style="font-size: 1.5rem; font-weight: bold">${plantData.quantity}</div>
                        </div>
                    </div>

                    <p style="color: #555; line-height: 1.6;">${plantData.description}</p>

                    <div class="grid-info">
                        <div class="info-box">
                            <span class="section-title">📍 Location</span>
                            <div class="info-item">${plantData.address.street}</div>
                            <div class="info-item">${plantData.address.city}, ${plantData.address.state}</div>
                            <div class="info-item"><span class="label">Pincode:</span> ${plantData.address.pincode}</div>
                        </div>

                        <div class="info-box">
                            <span class="section-title">👤 Donor Details</span>
                            <div class="info-item"><span class="label">Name:</span> ${plantData.owner.name}</div>
                            <div class="info-item"><span class="label">Email:</span> ${plantData.owner.email}</div>
                            <div class="info-item"><span class="label">City:</span> ${plantData.owner.address.city}</div>
                        </div>
                    </div>

                    <div class="thumbnail-bar">
                        ${plantData.images.map(img => `
                            <img src="http://192.168.0.120:8080/uploads/${img}" class="thumb">
                        `).join('')}
                    </div>
                </div>
            `;
}



getPlantDetail();