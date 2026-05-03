
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


const params = new URLSearchParams(window.location.search);
const plantID = params.get("id");

console.log(plantID.toString());
fillPlantDetails(plantID);

async function fillPlantDetails(plantID) {
    try {
        const response = await fetch(`http://192.168.0.120:8080/api/plant/get-plant/${plantID}`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            showMessage(data.message, "error");
            return;
        }

        const plant = data.plant;

        // Basic Info
        document.getElementById("name").value = plant.name || "";
        document.getElementById("description").value = plant.description || "";
        document.querySelector("[name='category']").value = plant.category || "";
        document.querySelector("[name='quantity']").value = plant.quantity || "";

        // Address
        document.getElementById("street").value = plant.address?.street || "";
        document.getElementById("city").value = plant.address?.city || "";
        document.getElementById("state").value = plant.address?.state || "";
        document.getElementById("pincode").value = plant.address?.pincode || "";

        // Cover Image
        const coverPreview = document.getElementById("coverPreview");
        coverPreview.innerHTML = "";

        if (plant.coverImage) {
            const img = document.createElement("img");
            img.src = `http://192.168.0.120:8080/uploads/${plant.coverImage}`;
            coverPreview.appendChild(img);
        }

        // Other Images
        const imagesPreview = document.getElementById("imagesPreview");
        imagesPreview.innerHTML = "";

        if (plant.images?.length) {
            plant.images.forEach(imgName => {
                const img = document.createElement("img");
                img.src = `http://192.168.0.120:8080/uploads/${imgName}`;
                imagesPreview.appendChild(img);
            });
        }

    } catch (error) {
        console.error(error);
        showMessage("Failed to load plant", "error");
    }
}

const form = document.getElementById('editForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const imageFiles = document.getElementById("images").files;

    if (imageFiles.length > 5) {
        showMessage("Max 5 images allowed");
        return;
    }

    const formData = new FormData(form);
    formData.append("plantID", plantID);

    try {
       
        const res = await fetch("http://192.168.0.120:8080/api/plant/update-plant", {
            method: "PUT",
            body: formData,
            credentials: "include"
        });

        const data = await res.json();

        showMessage(data.message, data.success ? "success" : "error");

        if (data.success) {
            window.location.href = "donate-plant.html";
        }

    } catch (error) {
        console.log(error);
        showMessage("Update failed", "error");
    }
});