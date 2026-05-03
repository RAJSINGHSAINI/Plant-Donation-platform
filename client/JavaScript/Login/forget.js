document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showMessage("Invalid email format");
    }


    const res = await fetch("http://192.168.0.120:8080/api/auth/send-reset-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.setItem("resetEmail", email);
        window.location.href = "reset.html";
    } else {
        document.getElementById("message").innerText = data.message;
    }
});