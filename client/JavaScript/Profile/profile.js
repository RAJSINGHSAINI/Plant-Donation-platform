let isLoggedIn = false;
let user = null;
async function loadProfile() {

    const res = await fetch("http://192.168.0.120:8080/api/user/data", {
        method: "GET",
        credentials: "include"
    })

    const data = await res.json()

    console.log(data);

    if (!data.success) {
        showMessage(data.message, "error");
        isLoggedIn = false;
        return;
    }

    isLoggedIn = true;
    user = data.userData;
    document.getElementById("name").value = user.name
    document.getElementById("street").value = user.address.street
    document.getElementById("city").value = user.address.city
    document.getElementById("state").value = user.address.state
    document.getElementById("pincode").value = user.address.pincode

    document.getElementById("email").innerText = user.email

    if (user.isAccountVerified) {
        document.getElementById("verifyStatus").innerText = "Verified"
        document.querySelector('.btns').innerHTML = `<button id="changeEmailBtn">Change Email</button>`
    } else {
        document.getElementById("verifyStatus").innerText = "Not Verified"
        document.querySelector('.btns').innerHTML = `    
        <button id="changeEmailBtn">Change Email</button>
        <button id="verifyEmailBtn">Verify Email</button>
        
        `
        document.getElementById('verifyEmailBtn').addEventListener('click', sendOtp)
    }

    document.getElementById('changeEmailBtn').addEventListener('click', () => {
        window.location.href = "/client/HTML/changeEmail/change.html";
    })
}
document.getElementById('logoutBtn').addEventListener('click', logoutUser)
async function logoutUser() {

    const res = await fetch("http://192.168.0.120:8080/api/auth/logout", {

        method: "POST",

        credentials: "include"

    });

    const data = await res.json();

    if (data.success) {

        showMessage("Logged out successfully", "success");

        isLoggedIn = false;
        setTimeout(() => {

            window.location.href = "../index.html";
        }, 3000);

    }

}


async function sendOtp() {

    const otpResponse = await fetch('http://192.168.0.120:8080/api/auth/send-verify-otp', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            otpType: "verify-email"
        }),
        credentials: 'include'
    })

    const otpData = await otpResponse.json();

    if (otpData.success) {
        window.location.href = '../Register/verify-email.html'
    } else {
        showMessage("something went wrong", "error");
        console.log(otpData.message);

    }
}

loadProfile()



// update profile

document.getElementById("profileForm").addEventListener("submit", async (e) => {

    e.preventDefault()

    const name = document.getElementById("name").value

    const street = document.getElementById("street").value
    const city = document.getElementById("city").value
    const state = document.getElementById("state").value
    const pincode = document.getElementById("pincode").value
    if (!name || !street || !city || !state || !pincode) {
        showMessage("Please fill all the fields", "error")
        return;
    }
    if (user && name === user.name && street === user.address.street && city === user.address.city && state === user.address.state && pincode === user.address.pincode) {
        showMessage("No changes made", "error")
        return;
    }
    const response = await fetch("http://192.168.0.120:8080/api/user/update-data", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify({

            name,

            address: {
                street,
                city,
                state,
                pincode
            }

        })

    })

    const data = await response.json();

    if (data.success) {
        showMessage("Profile updated", "success")
        loadProfile()
    } else {
        showMessage("Something went wrong", "error")
        console.log(data.message);

    }


})



const protectedLinks = document.querySelectorAll(".protected");

protectedLinks.forEach(link => {

    link.addEventListener("click", function (e) {

        if (!isLoggedIn) {

            e.preventDefault();

            showMessage("Please login first");
            setTimeout(() => {

                window.location.href = "/client/HTML/Login/login.html";
            }, 3000);

        }

    });

});
