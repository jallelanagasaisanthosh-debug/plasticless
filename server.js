const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   DATABASE
========================================================= */

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "plasticless_db",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl:
        process.env.DB_HOST &&
        process.env.DB_HOST !== "localhost"
            ? {
                rejectUnauthorized: false
            }
            : undefined,

    connectTimeout: 30000
});

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "plasticless_secret_2026",

        resave: false,
        saveUninitialized: false,
        rolling: true,

        cookie: {
            httpOnly: true,

            /*
             * Render uses HTTPS.
             * This allows the session cookie to work
             * correctly on the deployed website.
             */
            secure:
                process.env.NODE_ENV === "production",

            sameSite: "lax",

            maxAge:
                24 * 60 * 60 * 1000
        }
    })
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/* =========================================================
   PAGE ROUTES
========================================================= */

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

app.get("/index.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

app.get("/login.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "login.html"
        )
    );
});

app.get("/register.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "register.html"
        )
    );
});

app.get("/about.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "about.html"
        )
    );
});

app.get("/campaigns.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "campaigns.html"
        )
    );
});

app.get("/resources.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "resources.html"
        )
    );
});

app.get("/tasks.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "tasks.html"
        )
    );
});

app.get("/collection.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "collection.html"
        )
    );
});

app.get("/reports.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "reports.html"
        )
    );
});

app.get("/contact.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "contact.html"
        )
    );
});

app.get("/dashboard.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "dashboard.html"
        )
    );
});

app.get("/profile.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "profile.html"
        )
    );
});

/* =========================================================
   TEST API
========================================================= */

app.get("/api/test", async (req, res) => {
    try {
        await pool.query(
            "SELECT 1 AS test"
        );

        res.json({
            success: true,
            message:
                "PlasticLess backend is working!",
            database: true
        });

    } catch (error) {

        console.error(
            "❌ API database test failed:"
        );

        console.error(
            "Error code:",
            error.code
        );

        console.error(
            "Error message:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Database connection failed."
        });
    }
});

/* =========================================================
   AUTHENTICATION HELPERS
========================================================= */

function requireLogin(
    req,
    res,
    next
) {
    if (!req.session.userId) {

        return res.status(401).json({
            success: false,
            message:
                "Login required"
        });
    }

    next();
}

/* =========================================================
   CURRENT USER
========================================================= */

app.get(
    "/api/current-user",
    async (req, res) => {

        try {

            if (!req.session.userId) {

                return res.json({
                    success: true,
                    loggedIn: false,
                    user: null
                });
            }

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [
                        req.session.userId
                    ]
                );

            if (rows.length === 0) {

                req.session.destroy(
                    () => {}
                );

                return res.json({
                    success: true,
                    loggedIn: false,
                    user: null
                });
            }

            res.json({
                success: true,
                loggedIn: true,
                user: rows[0]
            });

        } catch (error) {

            console.error(
                "Current user error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to get current user"
            });
        }
    }
);

/* =========================================================
   ME API
========================================================= */

app.get(
    "/api/me",
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [
                        req.session.userId
                    ]
                );

            if (rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found"
                });
            }

            res.json({
                success: true,
                user: rows[0]
            });

        } catch (error) {

            console.error(
                "ME API error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to get profile"
            });
        }
    }
);

/* =========================================================
   REGISTER
========================================================= */

app.post(
    "/api/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
                role
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, email and password are required"
                });
            }

            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters"
                });
            }

            const cleanName =
                String(name).trim();

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const allowedRoles = [
                "citizen",
                "volunteer",
                "admin"
            ];

            const selectedRole =
                allowedRoles.includes(
                    String(role).toLowerCase()
                )
                    ? String(role).toLowerCase()
                    : "citizen";

            const [existingUsers] =
                await pool.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [
                        cleanEmail
                    ]
                );

            if (
                existingUsers.length > 0
            ) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Email already registered"
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            await pool.query(
                `
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    role
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    cleanName,
                    cleanEmail,
                    hashedPassword,
                    selectedRole
                ]
            );

            res.status(201).json({
                success: true,
                message:
                    "Registration successful"
            });

        } catch (error) {

            console.error(
                "Register error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Registration failed"
            });
        }
    }
);

/* =========================================================
   LOGIN
========================================================= */

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;

            if (
                !email ||
                !password
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email and password are required"
                });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        password,
                        role,
                        created_at
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [
                        cleanEmail
                    ]
                );

            if (rows.length === 0) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password"
                });
            }

            const user = rows[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password"
                });
            }

            req.session.regenerate(
                (sessionError) => {

                    if (sessionError) {

                        console.error(
                            "Session regenerate error:",
                            sessionError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Login session error"
                        });
                    }

                    req.session.userId =
                        user.id;

                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };

                    req.session.save(
                        (saveError) => {

                            if (saveError) {

                                console.error(
                                    "Session save error:",
                                    saveError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Unable to save login session"
                                });
                            }

                            res.json({
                                success: true,
                                message:
                                    "Login successful",
                                user:
                                    req.session.user
                            });
                        }
                    );
                }
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Login failed"
            });
        }
    }
);

/* =========================================================
   LOGOUT
========================================================= */

app.post(
    "/api/logout",
    (req, res) => {

        req.session.destroy(
            (error) => {

                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Logout failed"
                    });
                }

                res.clearCookie(
                    "connect.sid"
                );

                res.json({
                    success: true,
                    message:
                        "Logged out successfully"
                });
            }
        );
    }
);

/* =========================================================
   CHANGE PASSWORD
========================================================= */

app.post(
    "/api/change-password",
    requireLogin,
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword,
                confirmPassword
            } = req.body;

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "All password fields are required"
                });
            }

            if (
                newPassword !==
                confirmPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New passwords do not match"
                });
            }

            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password must contain at least 6 characters"
                });
            }

            if (
                currentPassword ===
                newPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password must be different from current password"
                });
            }

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        password
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [
                        req.session.userId
                    ]
                );

            if (rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found"
                });
            }

            const user = rows[0];

            const currentPasswordMatch =
                await bcrypt.compare(
                    currentPassword,
                    user.password
                );

            if (
                !currentPasswordMatch
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Current password is incorrect"
                });
            }

            const newHashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            await pool.query(
                `
                UPDATE users
                SET password = ?
                WHERE id = ?
                `,
                [
                    newHashedPassword,
                    req.session.userId
                ]
            );

            res.json({
                success: true,
                message:
                    "Password changed successfully"
            });

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to change password"
            });
        }
    }
);

/* =========================================================
   PASSWORD RESET
========================================================= */

app.post(
    "/api/reset-password",
    async (req, res) => {

        try {

            const {
                email,
                newPassword,
                confirmPassword
            } = req.body;

            if (
                !email ||
                !newPassword ||
                !confirmPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email and all password fields are required"
                });
            }

            if (
                newPassword !==
                confirmPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Passwords do not match"
                });
            }

            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters"
                });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const [rows] =
                await pool.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [
                        cleanEmail
                    ]
                );

            if (rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "No account found with this email"
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            await pool.query(
                `
                UPDATE users
                SET password = ?
                WHERE id = ?
                `,
                [
                    hashedPassword,
                    rows[0].id
                ]
            );

            res.json({
                success: true,
                message:
                    "Password reset successfully"
            });

        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to reset password"
            });
        }
    }
);

/* =========================================================
   TASKS
========================================================= */

app.get(
    "/api/tasks",
    async (req, res) => {

        try {

            const userId =
                req.session.userId || 0;

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        t.id,
                        t.title,
                        t.description,
                        t.points,
                        t.icon,
                        CASE
                            WHEN ut.id IS NOT NULL
                            THEN 1
                            ELSE 0
                        END AS completed
                    FROM tasks t
                    LEFT JOIN user_tasks ut
                        ON ut.task_id = t.id
                        AND ut.user_id = ?
                    ORDER BY t.id ASC
                    `,
                    [
                        userId
                    ]
                );

            res.json({
                success: true,
                tasks: rows
            });

        } catch (error) {

            console.error(
                "Tasks error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load tasks"
            });
        }
    }
);

/* =========================================================
   TASK PROGRESS
========================================================= */

app.get(
    "/api/tasks/progress",
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*) AS completed,
                        COALESCE(
                            SUM(t.points),
                            0
                        ) AS points
                    FROM user_tasks ut
                    INNER JOIN tasks t
                        ON t.id = ut.task_id
                    WHERE ut.user_id = ?
                    `,
                    [
                        req.session.userId
                    ]
                );

            const completed =
                Number(
                    rows[0].completed || 0
                );

            const points =
                Number(
                    rows[0].points || 0
                );

            res.json({
                success: true,
                completed,
                total: 6,
                points
            });

        } catch (error) {

            console.error(
                "Task progress error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load task progress"
            });
        }
    }
);

/* =========================================================
   COMPLETE TASK
========================================================= */

app.post(
    "/api/tasks/:id/complete",
    requireLogin,
    async (req, res) => {

        try {

            const taskId =
                Number(req.params.id);

            if (
                !Number.isInteger(taskId) ||
                taskId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid task ID"
                });
            }

            const [taskRows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        title,
                        points
                    FROM tasks
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [
                        taskId
                    ]
                );

            if (
                taskRows.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Task not found"
                });
            }

            const [existingRows] =
                await pool.query(
                    `
                    SELECT id
                    FROM user_tasks
                    WHERE user_id = ?
                      AND task_id = ?
                    LIMIT 1
                    `,
                    [
                        req.session.userId,
                        taskId
                    ]
                );

            if (
                existingRows.length > 0
            ) {

                return res.json({
                    success: true,
                    alreadyCompleted: true,
                    message:
                        "Task already completed"
                });
            }

            await pool.query(
                `
                INSERT INTO user_tasks
                (
                    user_id,
                    task_id
                )
                VALUES (?, ?)
                `,
                [
                    req.session.userId,
                    taskId
                ]
            );

            res.json({
                success: true,
                message:
                    "Task completed successfully",
                points:
                    taskRows[0].points
            });

        } catch (error) {

            console.error(
                "Complete task error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to complete task"
            });
        }
    }
);

/* =========================================================
   CAMPAIGNS
========================================================= */

app.get(
    "/api/campaigns",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        c.id,
                        c.title,
                        c.description,
                        c.location,
                        c.campaign_date,
                        c.image,
                        c.max_participants,
                        COUNT(cp.id)
                            AS participant_count
                    FROM campaigns c
                    LEFT JOIN campaign_participants cp
                        ON cp.campaign_id = c.id
                    GROUP BY
                        c.id,
                        c.title,
                        c.description,
                        c.location,
                        c.campaign_date,
                        c.image,
                        c.max_participants
                    ORDER BY
                        c.campaign_date ASC
                    `
                );

            res.json({
                success: true,
                campaigns: rows
            });

        } catch (error) {

            console.error(
                "Campaigns error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load campaigns"
            });
        }
    }
);

/* =========================================================
   JOIN CAMPAIGN
========================================================= */

app.post(
    "/api/campaigns/:id/join",
    requireLogin,
    async (req, res) => {

        try {

            const campaignId =
                Number(req.params.id);

            if (
                !Number.isInteger(
                    campaignId
                ) ||
                campaignId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid campaign ID"
                });
            }

            const [campaignRows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        title,
                        max_participants
                    FROM campaigns
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [
                        campaignId
                    ]
                );

            if (
                campaignRows.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Campaign not found"
                });
            }

            const campaign =
                campaignRows[0];

            const [existingRows] =
                await pool.query(
                    `
                    SELECT id
                    FROM campaign_participants
                    WHERE campaign_id = ?
                      AND user_id = ?
                    LIMIT 1
                    `,
                    [
                        campaignId,
                        req.session.userId
                    ]
                );

            if (
                existingRows.length > 0
            ) {

                return res.json({
                    success: true,
                    alreadyJoined: true,
                    message:
                        "You already joined this campaign"
                });
            }

            const [countRows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*) AS total
                    FROM campaign_participants
                    WHERE campaign_id = ?
                    `,
                    [
                        campaignId
                    ]
                );

            const currentCount =
                Number(
                    countRows[0].total || 0
                );

            const maxParticipants =
                Number(
                    campaign.max_participants ||
                    100
                );

            if (
                currentCount >=
                maxParticipants
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Campaign is full"
                });
            }

            await pool.query(
                `
                INSERT INTO campaign_participants
                (
                    campaign_id,
                    user_id
                )
                VALUES (?, ?)
                `,
                [
                    campaignId,
                    req.session.userId
                ]
            );

            res.json({
                success: true,
                message:
                    "Campaign joined successfully"
            });

        } catch (error) {

            console.error(
                "Join campaign error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to join campaign"
            });
        }
    }
);

/* =========================================================
   CAMPAIGN STATUS
========================================================= */

app.get(
    "/api/campaigns/:id/status",
    requireLogin,
    async (req, res) => {

        try {

            const campaignId =
                Number(req.params.id);

            const [rows] =
                await pool.query(
                    `
                    SELECT id
                    FROM campaign_participants
                    WHERE campaign_id = ?
                      AND user_id = ?
                    LIMIT 1
                    `,
                    [
                        campaignId,
                        req.session.userId
                    ]
                );

            res.json({
                success: true,
                joined:
                    rows.length > 0
            });

        } catch (error) {

            console.error(
                "Campaign status error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to check campaign status"
            });
        }
    }
);

/* =========================================================
   RESOURCES
========================================================= */

app.get(
    "/api/resources",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT *
                    FROM resources
                    ORDER BY id DESC
                    `
                );

            res.json({
                success: true,
                resources: rows
            });

        } catch (error) {

            console.error(
                "Resources error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load resources"
            });
        }
    }
);

/* =========================================================
   CONTACT
========================================================= */

app.post(
    "/api/contact",
    async (req, res) => {

        try {

            const {
                name,
                email,
                phone,
                subject,
                message
            } = req.body;

            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please fill all required fields"
                });
            }

            await pool.query(
                `
                INSERT INTO contact_messages
                (
                    name,
                    email,
                    phone,
                    subject,
                    message
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    name,
                    email,
                    phone || null,
                    subject,
                    message
                ]
            );

            res.json({
                success: true,
                message:
                    "Message sent successfully"
            });

        } catch (error) {

            console.error(
                "Contact error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to send message"
            });
        }
    }
);

/* =========================================================
   PLASTIC COLLECTIONS
========================================================= */

app.post(
    "/api/plastic-collections",
    requireLogin,
    async (req, res) => {

        try {

            const {
                location,
                kilograms,
                plastic_type,
                collected_at
            } = req.body;

            if (
                !location ||
                kilograms === undefined ||
                !plastic_type ||
                !collected_at
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "All collection fields are required"
                });
            }

            const kg =
                Number(kilograms);

            if (
                !Number.isFinite(kg) ||
                kg <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Kilograms must be greater than 0"
                });
            }

            await pool.query(
                `
                INSERT INTO plastic_collections
                (
                    user_id,
                    location,
                    kilograms,
                    plastic_type,
                    collected_at
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    req.session.userId,
                    location,
                    kg,
                    plastic_type,
                    collected_at
                ]
            );

            res.json({
                success: true,
                message:
                    "Plastic collection saved successfully"
            });

        } catch (error) {

            console.error(
                "Plastic collection save error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to save plastic collection"
            });
        }
    }
);

/* =========================================================
   COLLECTIONS COMPATIBILITY API
========================================================= */

app.post(
    "/api/collections",
    requireLogin,
    async (req, res) => {

        try {

            const {
                location,
                kilograms,
                plastic_type,
                collected_at
            } = req.body;

            if (
                !location ||
                kilograms === undefined ||
                !plastic_type ||
                !collected_at
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "All collection fields are required"
                });
            }

            const kg =
                Number(kilograms);

            if (
                !Number.isFinite(kg) ||
                kg <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid kilograms"
                });
            }

            await pool.query(
                `
                INSERT INTO plastic_collections
                (
                    user_id,
                    location,
                    kilograms,
                    plastic_type,
                    collected_at
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    req.session.userId,
                    location,
                    kg,
                    plastic_type,
                    collected_at
                ]
            );

            res.json({
                success: true,
                message:
                    "Collection saved successfully"
            });

        } catch (error) {

            console.error(
                "Collections compatibility error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to save collection"
            });
        }
    }
);

/* =========================================================
   GET PLASTIC COLLECTIONS
========================================================= */

app.get(
    "/api/plastic-collections",
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        location,
                        kilograms,
                        plastic_type,
                        collected_at,
                        created_at
                    FROM plastic_collections
                    WHERE user_id = ?
                    ORDER BY
                        collected_at DESC,
                        id DESC
                    `,
                    [
                        req.session.userId
                    ]
                );

            res.json({
                success: true,
                collections: rows
            });

        } catch (error) {

            console.error(
                "Get collections error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load collections"
            });
        }
    }
);

/* =========================================================
   DELETE PLASTIC COLLECTION
========================================================= */

app.delete(
    "/api/plastic-collections/:id",
    requireLogin,
    async (req, res) => {

        try {

            const collectionId =
                Number(req.params.id);

            const [result] =
                await pool.query(
                    `
                    DELETE FROM plastic_collections
                    WHERE id = ?
                      AND user_id = ?
                    `,
                    [
                        collectionId,
                        req.session.userId
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Collection not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Collection deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete collection error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete collection"
            });
        }
    }
);

/* =========================================================
   REPORT SUMMARY
========================================================= */

app.get(
    "/api/reports/summary",
    async (req, res) => {

        try {

            const [plasticRows] =
                await pool.query(
                    `
                    SELECT
                        COALESCE(
                            SUM(kilograms),
                            0
                        ) AS totalPlastic
                    FROM plastic_collections
                    `
                );

            const [volunteerRows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*) AS volunteers
                    FROM users
                    WHERE role = 'volunteer'
                    `
                );

            const [participantRows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)
                            AS campaignParticipants
                    FROM campaign_participants
                    `
                );

            const [taskRows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)
                            AS tasksCompleted
                    FROM user_tasks
                    `
                );

            const [pointsRows] =
                await pool.query(
                    `
                    SELECT
                        COALESCE(
                            SUM(t.points),
                            0
                        ) AS taskPoints
                    FROM user_tasks ut
                    INNER JOIN tasks t
                        ON t.id = ut.task_id
                    `
                );

            res.json({
                success: true,

                totalPlastic:
                    Number(
                        plasticRows[0]
                            .totalPlastic || 0
                    ),

                volunteers:
                    Number(
                        volunteerRows[0]
                            .volunteers || 0
                    ),

                campaignParticipants:
                    Number(
                        participantRows[0]
                            .campaignParticipants || 0
                    ),

                tasksCompleted:
                    Number(
                        taskRows[0]
                            .tasksCompleted || 0
                    ),

                taskPoints:
                    Number(
                        pointsRows[0]
                            .taskPoints || 0
                    )
            });

        } catch (error) {

            console.error(
                "Reports summary error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load report summary"
            });
        }
    }
);

/* =========================================================
   MONTHLY REPORT
========================================================= */

app.get(
    "/api/reports/monthly",
    async (req, res) => {

        try {

            const month =
                req.query.month;

            if (
                !month ||
                !/^\d{4}-\d{2}$/.test(month)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Month must be in YYYY-MM format"
                });
            }

            const startDate =
                `${month}-01`;

            const [plasticRows] =
                await pool.query(
                    `
                    SELECT
                        COALESCE(
                            SUM(kilograms),
                            0
                        ) AS totalKg,
                        COUNT(*) AS collections
                    FROM plastic_collections
                    WHERE collected_at >= ?
                      AND collected_at <
                          DATE_ADD(
                              ?,
                              INTERVAL 1 MONTH
                          )
                    `,
                    [
                        startDate,
                        startDate
                    ]
                );

            const [participantRows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)
                            AS campaignParticipants
                    FROM campaign_participants cp
                    INNER JOIN campaigns c
                        ON c.id = cp.campaign_id
                    WHERE c.campaign_date >= ?
                      AND c.campaign_date <
                          DATE_ADD(
                              ?,
                              INTERVAL 1 MONTH
                          )
                    `,
                    [
                        startDate,
                        startDate
                    ]
                );

            const [taskRows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)
                            AS tasksCompleted,
                        COALESCE(
                            SUM(t.points),
                            0
                        ) AS taskPoints
                    FROM user_tasks ut
                    INNER JOIN tasks t
                        ON t.id = ut.task_id
                    WHERE ut.completed_at >= ?
                      AND ut.completed_at <
                          DATE_ADD(
                              ?,
                              INTERVAL 1 MONTH
                          )
                    `,
                    [
                        startDate,
                        startDate
                    ]
                );

            const [typeRows] =
                await pool.query(
                    `
                    SELECT
                        plastic_type,
                        COALESCE(
                            SUM(kilograms),
                            0
                        ) AS kilograms
                    FROM plastic_collections
                    WHERE collected_at >= ?
                      AND collected_at <
                          DATE_ADD(
                              ?,
                              INTERVAL 1 MONTH
                          )
                    GROUP BY plastic_type
                    ORDER BY kilograms DESC
                    `,
                    [
                        startDate,
                        startDate
                    ]
                );

            const [volunteerRows] =
                await pool.query(
                    `
                    SELECT
                        COUNT(*) AS volunteers
                    FROM users
                    WHERE role = 'volunteer'
                    `
                );

            res.json({
                success: true,

                month,

                totalKg:
                    Number(
                        plasticRows[0]
                            .totalKg || 0
                    ),

                collections:
                    Number(
                        plasticRows[0]
                            .collections || 0
                    ),

                volunteers:
                    Number(
                        volunteerRows[0]
                            .volunteers || 0
                    ),

                campaignParticipants:
                    Number(
                        participantRows[0]
                            .campaignParticipants || 0
                    ),

                tasksCompleted:
                    Number(
                        taskRows[0]
                            .tasksCompleted || 0
                    ),

                taskPoints:
                    Number(
                        taskRows[0]
                            .taskPoints || 0
                    ),

                plasticTypes:
                    typeRows.map(
                        row => ({
                            plastic_type:
                                row.plastic_type,

                            kilograms:
                                Number(
                                    row.kilograms || 0
                                )
                        })
                    )
            });

        } catch (error) {

            console.error(
                "Monthly report error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load monthly report"
            });
        }
    }
);

/* =========================================================
   API 404
========================================================= */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            success: false,
            message:
                "API endpoint not found"
        });
    }
);

/* =========================================================
   GENERAL 404
========================================================= */

app.use(
    (req, res) => {

        res.status(404).send(
            "Page not found"
        );
    }
);

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

    try {

        const connection =
            await pool.getConnection();

        console.log(
            "✅ MySQL database connected"
        );

        connection.release();

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `🚀 PlasticLess server running on port ${PORT}`
                );
            }
        );

    } catch (error) {

        console.error(
            "❌ MySQL connection failed:"
        );

        console.error(
            "Host:",
            process.env.DB_HOST ||
                "NOT SET"
        );

        console.error(
            "Port:",
            process.env.DB_PORT ||
                "NOT SET"
        );

        console.error(
            "User:",
            process.env.DB_USER ||
                "NOT SET"
        );

        console.error(
            "Database:",
            process.env.DB_NAME ||
                "NOT SET"
        );

        console.error(
            "Error code:",
            error.code ||
                "NO_CODE"
        );

        console.error(
            "Error message:",
            error.message ||
                "NO_MESSAGE"
        );

        console.error(
            "Error name:",
            error.name ||
                "NO_NAME"
        );

        console.log(
            "⚠️ Server will not start until MySQL is available."
        );
    }
}

startServer();