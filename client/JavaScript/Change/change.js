document.getElementById("changeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showMessage("Invalid email format","error");
    }


    const newEmail = document.getElementById("email").value;

    const res = await fetch("http://192.168.0.120:8080/api/auth/send-verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ newEmail, otpType: 'change-email' })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.setItem("resetEmail", newEmail);
        window.location.href = "reset.html";
    } else {
        document.getElementById("message").innerText = data.message;
    }
});