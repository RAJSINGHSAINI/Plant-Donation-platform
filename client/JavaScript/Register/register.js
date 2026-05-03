const form = document.getElementById("registerForm");
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const pincode = document.getElementById("pincode").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://192.168.0.120:8080/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                name,
                email,
                password,
                address: {
                    street,
                    city,
                    state,
                    pincode
                }
            })
        });

        const data = await response.json();
        console.log(data)
        if (!data.success) {
          return showMessage(data.message, "error");
        }

        // Send OTP after successful registration

        const otpResponse = await fetch("http://192.168.0.120:8080/api/auth/send-verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }, body: JSON.stringify({
                otpType: "verify-email"
            }),
            credentials: "include"
        });

        const otpData = await otpResponse.json();
        console.log(otpData)

        if (otpData.success) {

            showMessage("OTP sent to your email","success");
            setTimeout(() => {
                
                window.location.href = "verify-email.html";
            }, 3000);

        } else {

            showMessage(otpData.message,"error");

        }

    } catch (error) {

        console.error("Error:", error);

        showMessage("Something went wrong. Please try again.","error");

    }

});