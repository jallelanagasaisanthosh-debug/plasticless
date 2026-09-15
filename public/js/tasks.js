/* ==========================================
   PLASTICLESS TASKS JAVASCRIPT
========================================== */

let currentUser = null;

const TOTAL_TASKS = 6;


/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTasks();

    }
);


/* ==========================================
   INITIALIZE
========================================== */

async function initializeTasks() {

    try {

        const response = await fetch(
            "/api/me",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );


        const data =
            await response.json();


        console.log(
            "Task page user:",
            data
        );


        if (
            response.ok &&
            data.loggedIn === true &&
            data.user
        ) {

            currentUser = data.user;

            hideLoginWarning();

            await loadTaskProgress();

        }

        else {

            showLoginWarning();

            updateProgress(0, 0);

        }

    }

    catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        showLoginWarning();

        updateProgress(0, 0);

    }

}


/* ==========================================
   LOGIN WARNING
========================================== */

function showLoginWarning() {

    const warning =
        document.getElementById(
            "loginWarning"
        );


    if (warning) {

        warning.classList.add("show");

    }

}


function hideLoginWarning() {

    const warning =
        document.getElementById(
            "loginWarning"
        );


    if (warning) {

        warning.classList.remove("show");

    }

}


/* ==========================================
   LOAD TASK PROGRESS
========================================== */

async function loadTaskProgress() {

    try {

        const response =
            await fetch(
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


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Progress error:",
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
                data.total || TOTAL_TASKS
            );


        const points =
            Number(
                data.points || 0
            );


        updateProgress(
            completed,
            points,
            total
        );


        /*
         * Load completed tasks.
         */

        await loadCompletedTasks();

    }

    catch (error) {

        console.error(
            "Progress loading error:",
            error
        );

    }

}


/* ==========================================
   LOAD COMPLETED TASKS
========================================== */

async function loadCompletedTasks() {

    try {

        /*
         * The progress endpoint from the server
         * gives us the user's total progress.
         *
         * We also request the task list to determine
         * which individual cards are completed.
         */

        const response =
            await fetch(
                "/api/tasks",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "Tasks:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            return;

        }


        const tasks =
            Array.isArray(data.tasks)
                ? data.tasks
                : [];


        tasks.forEach(task => {

            const taskId =
                Number(
                    task.id ||
                    task.task_id
                );


            const completed =
                Number(
                    task.completed
                ) === 1 ||
                task.completed === true;


            if (completed) {

                markTaskCompleted(
                    taskId
                );

            }

        });

    }

    catch (error) {

        console.error(
            "Completed tasks loading error:",
            error
        );

    }

}


/* ==========================================
   COMPLETE TASK
========================================== */

async function completeTask(
    taskId,
    button
) {

    /*
     * Check login using current session.
     */

    if (!currentUser) {

        alert(
            "Please login first to complete this task."
        );

        window.location.href =
            "login.html";

        return;

    }


    if (!button) return;


    /*
     * Prevent double click.
     */

    if (button.disabled) {

        return;

    }


    button.disabled = true;

    button.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                `/api/tasks/${taskId}/complete`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({})
                }
            );


        const data =
            await response.json();


        console.log(
            "Complete task response:",
            data
        );


        /* ================================
           SUCCESS
        ================================= */

        if (
            response.ok &&
            data.success
        ) {

            markTaskCompleted(
                taskId
            );


            /*
             * Get updated values.
             */

            const completed =
                Number(
                    data.completed || 0
                );


            /*
             * Some server versions return
             * points. If not, reload them.
             */

            let points =
                Number(
                    data.points || 0
                );


            if (!data.points) {

                points =
                    await getCurrentPoints();

            }


            updateProgress(
                completed,
                points,
                TOTAL_TASKS
            );


            if (
                completed >= TOTAL_TASKS
            ) {

                showSuccess();

            }


            return;

        }


        /* ================================
           ALREADY COMPLETED
        ================================= */

        if (
            response.status === 409
        ) {

            markTaskCompleted(
                taskId
            );


            await loadTaskProgress();

            return;

        }


        /* ================================
           NOT LOGGED IN
        ================================= */

        if (
            response.status === 401
        ) {

            alert(
                "Your login session has expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        /*
         * Other error
         */

        alert(
            data.message ||
            "Unable to complete task."
        );


        button.disabled = false;

        button.textContent =
            "Mark as Completed";

    }

    catch (error) {

        console.error(
            "Complete task error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );


        button.disabled = false;

        button.textContent =
            "Mark as Completed";

    }

}


/* ==========================================
   MARK TASK COMPLETED
========================================== */

function markTaskCompleted(
    taskId
) {

    const card =
        document.querySelector(
            `.task-card[data-task-id="${taskId}"]`
        );


    if (!card) {

        console.warn(
            "Task card not found:",
            taskId
        );

        return;

    }


    card.classList.add(
        "completed"
    );


    const button =
        card.querySelector(
            ".task-btn"
        );


    if (button) {

        button.textContent =
            "✓ COMPLETED";

        button.disabled =
            true;

    }

}


/* ==========================================
   UPDATE PROGRESS
========================================== */

function updateProgress(
    completed,
    points = 0,
    total = TOTAL_TASKS
) {

    completed =
        Math.max(
            0,
            Math.min(
                Number(completed) || 0,
                total
            )
        );


    points =
        Number(points) || 0;


    const percentage =
        total > 0
            ? Math.round(
                (completed / total) * 100
            )
            : 0;


    /* ================================
       NUMBER
    ================================= */

    const progressCount =
        document.getElementById(
            "progressCount"
        );


    if (progressCount) {

        progressCount.textContent =
            completed;

    }


    /* ================================
       BAR
    ================================= */

    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressFill) {

        progressFill.style.width =
            `${percentage}%`;

    }


    /* ================================
       TEXT
    ================================= */

    const progressText =
        document.getElementById(
            "progressText"
        );


    if (progressText) {

        if (completed === 0) {

            progressText.textContent =
                "0 / 6 Completed";

        }

        else if (
            completed < total
        ) {

            progressText.textContent =
                `${completed} / ${total} Completed`;

        }

        else {

            progressText.textContent =
                "🎉 6 / 6 Completed";

        }

    }


    /* ================================
       POINTS
    ================================= */

    const pointsElement =
        document.getElementById(
            "points"
        );


    if (pointsElement) {

        pointsElement.textContent =
            points;

    }


    /* ================================
       SUCCESS
    ================================= */

    if (
        completed >= total
    ) {

        showSuccess();

    }

}


/* ==========================================
   GET CURRENT POINTS
========================================== */

async function getCurrentPoints() {

    try {

        const response =
            await fetch(
                "/api/tasks/progress",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success
        ) {

            return Number(
                data.points || 0
            );

        }

    }

    catch (error) {

        console.error(
            "Points loading error:",
            error
        );

    }


    return 0;

}


/* ==========================================
   SUCCESS MESSAGE
========================================== */

function showSuccess() {

    const successBox =
        document.getElementById(
            "successBox"
        );


    if (successBox) {

        successBox.classList.add(
            "show"
        );

    }

}


/* ==========================================
   GLOBAL FUNCTION
========================================== */

window.completeTask =
    completeTask;