document.addEventListener("DOMContentLoaded", () => {
    createNavbar();
});

async function createNavbar() {

    const navbarContainer = document.querySelector(".navbar");

    if (!navbarContainer) return;

    navbarContainer.innerHTML = "";

    let currentUser = null;

    /* ===============================
       CHECK LOGIN
    =============================== */

    try {

        const response = await fetch("/api/current-user", {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        if (response.ok) {

            const data = await response.json();

            if (data && data.loggedIn) {
                currentUser = data.user || data;
            }
        }

    } catch (error) {

        console.log("Login check failed:", error);

    }


    /* ===============================
       CURRENT PAGE
    =============================== */

    let currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (!currentPage) {
        currentPage = "index.html";
    }


    /* ===============================
       NAVBAR
    =============================== */

    const nav = document.createElement("nav");

    nav.className = "plasticless-navbar";

    nav.innerHTML = `

        <div class="nav-container">

            <!-- LOGO -->

            <a href="index.html" class="nav-logo">

                <div class="logo-icon">
                    🌿
                </div>

                <div class="logo-text">

                    <div class="logo-main">
                        Plastic<span>Less</span>
                    </div>

                    <small>
                        Plastic-Free Future
                    </small>

                </div>

            </a>


            <!-- MOBILE BUTTON -->

            <button
                class="mobile-menu-btn"
                id="mobileMenuBtn"
                type="button">

                <span></span>
                <span></span>
                <span></span>

            </button>


            <!-- NAV LINKS -->

            <div
                class="nav-links"
                id="navLinks">


                <!-- HOME -->

                <a
                    href="index.html"
                    class="nav-link"
                    data-page="index.html">

                    <span class="nav-icon">🏠</span>
                    <span>Home</span>

                </a>


                <!-- ABOUT -->

                <a
                    href="about.html"
                    class="nav-link"
                    data-page="about.html">

                    <span class="nav-icon">🌱</span>
                    <span>About</span>

                </a>


                <!-- CAMPAIGNS -->

                <a
                    href="campaigns.html"
                    class="nav-link"
                    data-page="campaigns.html">

                    <span class="nav-icon">🌍</span>
                    <span>Campaigns</span>

                </a>


                <!-- RESOURCES -->

                <a
                    href="resources.html"
                    class="nav-link"
                    data-page="resources.html">

                    <span class="nav-icon">📚</span>
                    <span>Resources</span>

                </a>


                <!-- TASKS -->

                <a
                    href="tasks.html"
                    class="nav-link"
                    data-page="tasks.html">

                    <span class="nav-icon">✅</span>
                    <span>Tasks</span>

                </a>


                <!-- COLLECTION -->

                <a
                    href="collection.html"
                    class="nav-link"
                    data-page="collection.html">

                    <span class="nav-icon">♻️</span>
                    <span>Collection</span>

                </a>


                <!-- REPORTS -->

                <a
                    href="reports.html"
                    class="nav-link"
                    data-page="reports.html">

                    <span class="nav-icon">📊</span>
                    <span>Reports</span>

                </a>


                <!-- CONTACT -->

                <a
                    href="contact.html"
                    class="nav-link"
                    data-page="contact.html">

                    <span class="nav-icon">📩</span>
                    <span>Contact</span>

                </a>


                ${
                    currentUser

                    ?

                    `

                    <!-- DASHBOARD -->

                    <a
                        href="dashboard.html"
                        class="nav-link"
                        data-page="dashboard.html">

                        <span class="nav-icon">📈</span>
                        <span>Dashboard</span>

                    </a>


                    <!-- PROFILE -->

                    <a
                        href="profile.html"
                        class="nav-link"
                        data-page="profile.html">

                        <span class="nav-icon">👤</span>
                        <span>Profile</span>

                    </a>


                    <!-- LOGOUT -->

                    <button
                        type="button"
                        class="nav-logout"
                        id="logoutBtn">

                        <span>↪</span>
                        <span>Logout</span>

                    </button>

                    `

                    :

                    `

                    <!-- LOGIN -->

                    <a
                        href="login.html"
                        class="nav-link nav-login"
                        data-page="login.html">

                        <span class="nav-icon">🔐</span>
                        <span>Login</span>

                    </a>


                    <!-- REGISTER -->

                    <a
                        href="register.html"
                        class="nav-register"
                        data-page="register.html">

                        Register

                    </a>

                    `
                }

            </div>

        </div>

    `;


    navbarContainer.appendChild(nav);

    addNavbarStyles();

    setActivePage(currentPage);

    setupMobileMenu();

    setupLogout();

}



/* ==================================================
   ACTIVE PAGE
================================================== */

function setActivePage(currentPage) {

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            const page =
                link.getAttribute("data-page");

            if (page === currentPage) {

                link.classList.add("active");

            }

        });

}



/* ==================================================
   MOBILE MENU
================================================== */

function setupMobileMenu() {

    const button =
        document.getElementById("mobileMenuBtn");

    const links =
        document.getElementById("navLinks");

    if (!button || !links) return;


    button.addEventListener("click", () => {

        const open =
            links.classList.toggle("show");

        button.classList.toggle(
            "open",
            open
        );

    });


    document
        .querySelectorAll(
            ".nav-link, .nav-register"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    links.classList.remove("show");

                    button.classList.remove("open");

                }
            );

        });

}



/* ==================================================
   LOGOUT
================================================== */

function setupLogout() {

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (!logoutBtn) return;


    logoutBtn.addEventListener(
        "click",
        async () => {

            logoutBtn.disabled = true;

            logoutBtn.innerHTML =
                "⟳ Logging out...";


            try {

                const response =
                    await fetch(
                        "/api/logout",
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );


                if (response.ok) {

                    window.location.href =
                        "index.html";

                    return;
                }


                throw new Error(
                    "Logout failed"
                );


            } catch (error) {

                console.error(error);

                logoutBtn.disabled = false;

                logoutBtn.innerHTML =
                    "↪ Logout";

                alert(
                    "Unable to logout. Please try again."
                );

            }

        }
    );

}



/* ==================================================
   NAVBAR CSS
================================================== */

function addNavbarStyles() {

    if (
        document.getElementById(
            "plasticless-navbar-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");

    style.id =
        "plasticless-navbar-style";


    style.textContent = `

        * {
            --plastic-green: #16a34a;
            --plastic-dark: #14532d;
            --plastic-light: #f0fdf4;
        }


        /* =========================================
           NAVBAR
        ========================================= */

        .plasticless-navbar {

            position: fixed;

            top: 0;
            left: 0;
            right: 0;

            width: 100%;

            height: 76px;

            z-index: 99999;

            background:
                rgba(255,255,255,.96);

            backdrop-filter:
                blur(18px);

            -webkit-backdrop-filter:
                blur(18px);

            border-bottom:
                1px solid #dcfce7;

            box-shadow:
                0 5px 25px
                rgba(20,83,45,.10);

        }


        /* =========================================
           CONTAINER
        ========================================= */

        .plasticless-navbar
        .nav-container {

            width: 94%;

            max-width: 1400px;

            height: 76px;

            margin: auto;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 15px;

        }


        /* =========================================
           LOGO
        ========================================= */

        .plasticless-navbar
        .nav-logo {

            display: flex;

            align-items: center;

            gap: 10px;

            text-decoration: none;

            flex-shrink: 0;

        }


        .plasticless-navbar
        .logo-icon {

            width: 43px;

            height: 43px;

            border-radius: 13px;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 24px;

            background:
                linear-gradient(
                    135deg,
                    #dcfce7,
                    #bbf7d0
                );

            box-shadow:
                0 5px 15px
                rgba(22,163,74,.16);

        }


        .plasticless-navbar
        .logo-text {

            display: flex;

            flex-direction: column;

        }


        .plasticless-navbar
        .logo-main {

            font-size: 21px;

            font-weight: 900;

            color: #14532d;

            letter-spacing: -.5px;

        }


        .plasticless-navbar
        .logo-main span {

            color: #16a34a;

        }


        .plasticless-navbar
        .logo-text small {

            margin-top: 4px;

            font-size: 8px;

            color: #789083;

            text-transform: uppercase;

            letter-spacing: 1px;

            font-weight: 700;

        }


        /* =========================================
           LINKS
        ========================================= */

        .plasticless-navbar
        .nav-links {

            display: flex;

            align-items: center;

            justify-content: flex-end;

            gap: 3px;

        }


        .plasticless-navbar
        .nav-link {

            position: relative;

            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 4px;

            min-height: 42px;

            padding: 9px 10px;

            border-radius: 11px;

            text-decoration: none;

            color: #385445;

            font-size: 13px;

            font-weight: 700;

            white-space: nowrap;

            transition:
                all .25s ease;

        }


        .plasticless-navbar
        .nav-link:hover {

            color: #15803d;

            background:
                #f0fdf4;

            transform:
                translateY(-2px);

        }


        .plasticless-navbar
        .nav-link:hover
        .nav-icon {

            transform:
                scale(1.15);

        }


        .plasticless-navbar
        .nav-icon {

            font-size: 15px;

            transition:
                transform .25s ease;

        }


        /* =========================================
           ACTIVE
        ========================================= */

        .plasticless-navbar
        .nav-link.active {

            color: #15803d;

            background:
                #ecfdf5;

        }


        .plasticless-navbar
        .nav-link.active::after {

            content: "";

            position: absolute;

            bottom: 4px;

            left: 14px;

            right: 14px;

            height: 3px;

            border-radius: 10px;

            background:
                #16a34a;

        }


        /* =========================================
           REGISTER
        ========================================= */

        .plasticless-navbar
        .nav-register {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-height: 42px;

            padding: 10px 16px;

            border-radius: 12px;

            background:
                linear-gradient(
                    135deg,
                    #16a34a,
                    #15803d
                );

            color: white;

            text-decoration: none;

            font-size: 13px;

            font-weight: 800;

            box-shadow:
                0 6px 18px
                rgba(22,163,74,.20);

            transition:
                all .25s ease;

        }


        .plasticless-navbar
        .nav-register:hover {

            transform:
                translateY(-2px);

            box-shadow:
                0 9px 24px
                rgba(22,163,74,.30);

        }


        /* =========================================
           LOGOUT
        ========================================= */

        .plasticless-navbar
        .nav-logout {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 6px;

            min-height: 42px;

            padding: 9px 14px;

            border:
                1px solid #bbf7d0;

            border-radius: 12px;

            background:
                #f0fdf4;

            color:
                #166534;

            font-family:
                Arial,
                Helvetica,
                sans-serif;

            font-size:
                13px;

            font-weight:
                800;

            cursor:
                pointer;

            transition:
                all .25s ease;

        }


        .plasticless-navbar
        .nav-logout:hover {

            background:
                #dcfce7;

            transform:
                translateY(-2px);

            box-shadow:
                0 6px 18px
                rgba(22,163,74,.12);

        }


        .plasticless-navbar
        .nav-logout:disabled {

            opacity:
                .6;

            cursor:
                not-allowed;

        }


        /* =========================================
           MOBILE BUTTON
        ========================================= */

        .plasticless-navbar
        .mobile-menu-btn {

            display:
                none;

            width:
                45px;

            height:
                45px;

            border:
                none;

            border-radius:
                12px;

            background:
                #f0fdf4;

            cursor:
                pointer;

            align-items:
                center;

            justify-content:
                center;

            flex-direction:
                column;

            gap:
                5px;

        }


        .plasticless-navbar
        .mobile-menu-btn span {

            display:
                block;

            width:
                22px;

            height:
                2px;

            background:
                #166534;

            border-radius:
                5px;

            transition:
                all .25s ease;

        }


        /* =========================================
           MOBILE OPEN
        ========================================= */

        .plasticless-navbar
        .mobile-menu-btn.open
        span:nth-child(1) {

            transform:
                translateY(7px)
                rotate(45deg);

        }


        .plasticless-navbar
        .mobile-menu-btn.open
        span:nth-child(2) {

            opacity:
                0;

        }


        .plasticless-navbar
        .mobile-menu-btn.open
        span:nth-child(3) {

            transform:
                translateY(-7px)
                rotate(-45deg);

        }


        /* =========================================
           TABLET
        ========================================= */

        @media(max-width:1150px) {

            .plasticless-navbar
            .nav-link {

                padding:
                    8px 7px;

                font-size:
                    12px;

            }

            .plasticless-navbar
            .nav-icon {

                display:
                    none;

            }

        }


        /* =========================================
           MOBILE
        ========================================= */

        @media(max-width:820px) {

            .plasticless-navbar {

                height:
                    68px;

            }


            .plasticless-navbar
            .nav-container {

                height:
                    68px;

            }


            .plasticless-navbar
            .mobile-menu-btn {

                display:
                    flex;

            }


            .plasticless-navbar
            .nav-links {

                display:
                    none;

                position:
                    absolute;

                top:
                    68px;

                left:
                    4%;

                width:
                    92%;

                padding:
                    12px;

                flex-direction:
                    column;

                align-items:
                    stretch;

                gap:
                    5px;

                background:
                    rgba(255,255,255,.98);

                backdrop-filter:
                    blur(20px);

                border:
                    1px solid #dcfce7;

                border-radius:
                    0 0 18px 18px;

                box-shadow:
                    0 15px 35px
                    rgba(20,83,45,.16);

            }


            .plasticless-navbar
            .nav-links.show {

                display:
                    flex;

            }


            .plasticless-navbar
            .nav-link {

                width:
                    100%;

                justify-content:
                    flex-start;

                padding:
                    13px 15px;

                font-size:
                    14px;

            }


            .plasticless-navbar
            .nav-icon {

                display:
                    inline-block;

                width:
                    25px;

                font-size:
                    17px;

            }


            .plasticless-navbar
            .nav-link.active::after {

                display:
                    none;

            }


            .plasticless-navbar
            .nav-register,
            .plasticless-navbar
            .nav-logout {

                width:
                    100%;

                min-height:
                    45px;

            }

        }


        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media(max-width:420px) {

            .plasticless-navbar
            .logo-text small {

                display:
                    none;

            }


            .plasticless-navbar
            .logo-main {

                font-size:
                    18px;

            }


            .plasticless-navbar
            .logo-icon {

                width:
                    38px;

                height:
                    38px;

                font-size:
                    20px;

            }

        }

    `;


    document.head.appendChild(style);

}