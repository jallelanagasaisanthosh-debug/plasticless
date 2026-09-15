const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const registerBtn = document.getElementById("registerBtn");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");


// Prevent old browser autofill values
window.addEventListener("load", () => {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
    document.getElementById("role").value = "";
});


// Show / hide password
togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "👁";

    }

});


// Show / hide confirm password
toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPasswordInput.type === "password") {

        confirmPasswordInput.type = "text";
        toggleConfirmPassword.textContent = "🙈";

    } else {

        confirmPasswordInput.type = "password";
        toggleConfirmPassword.textContent = "👁";

    }

});


// Display message
function showMessage(message, type) {

    registerMessage.textContent = message;
    registerMessage.className = "form-message " + type;

}


// Register
registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    const role =
        document.getElementById("role").value;


    // Clear previous message
    registerMessage.textContent = "";
    registerMessage.className = "form-message";


    // Name validation
    if (!name) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        return;
    }


    if (name.length < 3) {

        showMessage(
            "Name must contain at least 3 characters.",
            "error"
        );

        return;
    }


    // Email validation
    if (!email) {

        showMessage(
            "Please enter your email address.",
            "error"
        );

        return;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    // Password validation
    if (!password) {

        showMessage(
            "Please create a password.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }


    // Confirm password
    if (!confirmPassword) {

        showMessage(
            "Please confirm your password.",
            "error"
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    // Role validation
    if (!role) {

        showMessage(
            "Please select an account type.",
            "error"
        );

        return;
    }


    // Disable button
    registerBtn.disabled = true;
    registerBtn.innerHTML = "Creating Account...";


    try {

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                name: name,
                email: email,
                password: password,
                role: role

            })

        });


        const data = await response.json();


        // Registration failed
        if (!data.success) {

            showMessage(
                data.message ||
                "Registration failed. Please try again.",
                "error"
            );

            registerBtn.disabled = false;
            registerBtn.innerHTML =
                'Create Account <span>→</span>';

            return;
        }


        // Registration successful
        showMessage(
            "✓ Account created successfully! Redirecting to login...",
            "success"
        );


        registerBtn.innerHTML =
            "Account Created ✓";


        // Clear form
        registerForm.reset();

        passwordInput.value = "";
        confirmPasswordInput.value = "";


        // Redirect to login
        setTimeout(() => {

            window.location.href = "login.html";

        }, 1500);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            "Unable to connect to server. Please make sure the server is running.",
            "error"
        );


        registerBtn.disabled = false;

        registerBtn.innerHTML =
            'Create Account <span>→</span>';

    }

});