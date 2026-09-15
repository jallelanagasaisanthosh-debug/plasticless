/* =========================================
   ABOUT PAGE JAVASCRIPT
========================================= */


/* =========================================
   CHECK LOGIN
========================================= */

async function checkLogin() {

    const authLinks =
        document.getElementById("authLinks");

    if (!authLinks) return;

    try {

        const response =
            await fetch("/api/me", {
                method: "GET",
                credentials: "include"
            });

        const data =
            await response.json();

        if (data.success && data.user) {

            authLinks.innerHTML = `

                <a href="dashboard.html">
                    Dashboard
                </a>

                <a href="profile.html">
                    Profile
                </a>

                <a
                    href="#"
                    onclick="logoutUser(); return false;"
                >
                    Logout
                </a>

            `;

        } else {

            authLinks.innerHTML = `

                <a href="login.html">
                    Login
                </a>

                <a
                    href="register.html"
                    class="register-btn"
                >
                    Register
                </a>

            `;

        }

    } catch (error) {

        console.error(
            "Login check error:",
            error
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

async function logoutUser() {

    try {

        await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
        });

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

    window.location.href =
        "index.html";
}


/* =========================================
   ACTIVE ABOUT MENU
========================================= */

function setupSectionNavigation() {

    const sections =
        document.querySelectorAll(
            ".about-target"
        );

    const links =
        document.querySelectorAll(
            ".about-menu-link"
        );


    window.addEventListener(
        "scroll",
        function() {

            let currentSection = "";

            sections.forEach(
                section => {

                    const sectionTop =
                        section.offsetTop - 180;

                    if (
                        window.scrollY >=
                        sectionTop
                    ) {

                        currentSection =
                            section.id;

                    }

                }
            );


            links.forEach(
                link => {

                    link.classList.remove(
                        "active"
                    );

                    const target =
                        link.getAttribute(
                            "href"
                        ).replace("#","");

                    if (
                        target === currentSection
                    ) {

                        link.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );


    /* Initial state */

    if (links.length > 0) {

        links[0].classList.add(
            "active"
        );

    }

}


/* =========================================
   SMOOTH SCROLL
========================================= */

function setupSmoothScroll() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                function(event) {

                    const targetId =
                        this.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (target) {

                        event.preventDefault();

                        const offset = 120;

                        const position =
                            target.getBoundingClientRect()
                            .top +
                            window.scrollY -
                            offset;


                        window.scrollTo({

                            top: position,

                            behavior: "smooth"

                        });

                    }

                }
            );

        }
    );

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        checkLogin();

        setupSmoothScroll();

        setupSectionNavigation();

    }
);