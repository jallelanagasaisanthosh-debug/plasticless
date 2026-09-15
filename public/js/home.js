// ==========================================
// CHECK LOGIN
// ==========================================

async function checkHomeLogin() {

    try {

        const response =
            await fetch("/api/me");

        const data =
            await response.json();


        const loggedOutNav =
            document.getElementById(
                "loggedOutNav"
            );

        const loggedInNav =
            document.getElementById(
                "loggedInNav"
            );


        if (!loggedOutNav || !loggedInNav) {
            return;
        }


        if (data.loggedIn) {

            loggedOutNav.style.display =
                "none";

            loggedInNav.style.display =
                "inline-flex";

        }

        else {

            loggedOutNav.style.display =
                "inline-flex";

            loggedInNav.style.display =
                "none";

        }


    } catch (error) {

        console.error(
            "Login check error:",
            error
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    try {

        const response =
            await fetch(
                "/api/logout",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (data.success) {

            window.location.href =
                "index.html";

        }

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


// ==========================================
// START
// ==========================================

checkHomeLogin();