/* =================================
   PLASTICLESS DASHBOARD JAVASCRIPT
================================= */

let currentUser = null;


/* =================================
   LOAD USER
================================= */

async function loadUser() {

    try {

        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        const data = await response.json();

        console.log("Current user:", data);


        /*
         * IMPORTANT:
         * /api/me returns:
         *
         * {
         *   loggedIn: true,
         *   user: {...}
         * }
         *
         * So we must check data.loggedIn,
         * NOT data.success.
         */

        if (!response.ok || !data.loggedIn || !data.user) {

            console.log("User is not logged in.");

            window.location.replace("login.html");

            return;
        }


        // Store logged-in user
        currentUser = data.user;

        console.log(
            "Dashboard user:",
            currentUser
        );


        // Display user information
        displayUser();


        // Load dashboard information
        await loadProgress();

        await loadCampaignCount();

    }

    catch (error) {

        console.error(
            "User loading error:",
            error
        );

        /*
         * Only redirect if the request
         * actually failed.
         */

        window.location.replace("login.html");
    }
}


/* =================================
   DISPLAY USER
================================= */

function displayUser() {

    if (!currentUser) return;


    const name =
        currentUser.name ||
        currentUser.username ||
        "Friend";


    const navUserName =
        document.getElementById("navUserName");

    const heroUserName =
        document.getElementById("heroUserName");


    if (navUserName) {

        navUserName.textContent =
            name;
    }


    if (heroUserName) {

        heroUserName.textContent =
            name;
    }


    /*
     * Optional profile image
     */

    const profileImages =
        document.querySelectorAll(
            ".profile-image, #profileImage"
        );


    profileImages.forEach(image => {

        if (
            currentUser.profile_picture
        ) {

            image.src =
                currentUser.profile_picture;

            image.style.display =
                "block";
        }

    });

}


/* =================================
   LOAD TASK PROGRESS
================================= */

async function loadProgress() {

    try {

        const response = await fetch(
            "/api/tasks/progress",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );


        const data =
            await response.json();


        console.log(
            "Task progress:",
            data
        );


        if (!response.ok || !data.success) {

            console.error(
                "Unable to load task progress:",
                data
            );

            return;
        }


        const completed =
            Number(
                data.completed || 0
            );


        const total =
            Number(
                data.total || 6
            );


        const points =
            Number(
                data.points || 0
            );


        const percentage =
            total > 0
                ? Math.round(
                    (completed / total) * 100
                )
                : 0;


        /* =========================
           POINTS
        ========================= */

        const pointsElement =
            document.getElementById(
                "points"
            );


        if (pointsElement) {

            pointsElement.textContent =
                points;
        }


        /* =========================
           COMPLETED TASKS
        ========================= */

        const completedElement =
            document.getElementById(
                "completedTasks"
            );


        if (completedElement) {

            completedElement.textContent =
                completed;
        }


        /* =========================
           PROGRESS COUNT
        ========================= */

        const progressCount =
            document.getElementById(
                "progressCount"
            );


        if (progressCount) {

            progressCount.textContent =
                completed;
        }


        /* =========================
           PROGRESS BAR
        ========================= */

        const progressFill =
            document.getElementById(
                "progressFill"
            );


        if (progressFill) {

            progressFill.style.width =
                percentage + "%";
        }


        /* =========================
           PROGRESS TEXT
        ========================= */

        const progressText =
            document.getElementById(
                "progressText"
            );


        if (progressText) {

            if (completed === 0) {

                progressText.textContent =
                    "Complete your first task to start your journey!";

            }

            else if (completed < total) {

                progressText.textContent =
                    `Great start! You have completed ${completed} of ${total} tasks. Keep going!`;

            }

            else {

                progressText.textContent =
                    "🎉 Amazing! You completed all six plastic-free tasks!";
            }

        }

    }

    catch (error) {

        console.error(
            "Progress loading error:",
            error
        );
    }
}


/* =================================
   LOAD CAMPAIGN COUNT
================================= */

async function loadCampaignCount() {

    try {

        const response =
            await fetch(
                "/api/campaigns",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "Campaign data:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Unable to load campaigns:",
                data
            );

            return;
        }


        const campaigns =
            Array.isArray(data.campaigns)
                ? data.campaigns
                : [];


        let joinedCount = 0;


        campaigns.forEach(
            campaign => {

                if (
                    campaign.joined === true ||
                    campaign.is_joined === true ||
                    Number(campaign.joined) === 1 ||
                    Number(campaign.is_joined) === 1
                ) {

                    joinedCount++;
                }

            }
        );


        const joinedElement =
            document.getElementById(
                "joinedCampaigns"
            );


        if (joinedElement) {

            joinedElement.textContent =
                joinedCount;
        }

    }

    catch (error) {

        console.error(
            "Campaign count error:",
            error
        );
    }
}


/* =================================
   LOGOUT
================================= */

async function logoutUser() {

    try {

        const response =
            await fetch(
                "/api/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        console.log(
            "Logout:",
            data
        );


        // Always go to login after logout
        window.location.replace(
            "login.html"
        );

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

        window.location.replace(
            "login.html"
        );
    }
}


/* =================================
   START DASHBOARD
================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUser();

    }
);