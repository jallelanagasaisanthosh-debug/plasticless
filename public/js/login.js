const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

if (togglePassword) {
    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "👁";
        }

    });
}


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = passwordInput.value;

    loginMessage.textContent = "";
    loginMessage.className = "form-message";

    // Validation
    if (!email || !password) {

        loginMessage.textContent =
            "Please enter your email and password.";

        loginMessage.classList.add("error");

        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = "Logging in...";

    try {

        const response = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                email: email,
                password: password
            })
        });


        // Get response safely
        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {

            console.error("Server returned:", text);

            throw new Error(
                "Server returned an invalid response."
            );
        }


        console.log("Login response:", data);


        // Login failed
        if (!response.ok || !data.success) {

            loginMessage.textContent =
                data.message ||
                "Invalid email or password.";

            loginMessage.classList.add("error");

            loginBtn.disabled = false;
            loginBtn.innerHTML =
                'Login <span>→</span>';

            return;
        }


        // ======================================
        // LOGIN SUCCESS
        // ======================================

        loginMessage.textContent =
            "✓ Login successful!";

        loginMessage.classList.add("success");

        loginBtn.innerHTML =
            "Welcome! ✓";


        // Give browser time to save session cookie
        setTimeout(() => {

            window.location.href =
                "/dashboard.html";

        }, 700);


    } catch (error) {

        console.error("LOGIN ERROR:", error);

        loginMessage.textContent =
            error.message ||
            "Unable to connect to server.";

        loginMessage.classList.add("error");

        loginBtn.disabled = false;

        loginBtn.innerHTML =
            'Login <span>→</span>';
    }

});