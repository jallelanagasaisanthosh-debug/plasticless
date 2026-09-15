const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

function databaseNameFromUri(uri) {
    if (process.env.MONGODB_DB) {
        return process.env.MONGODB_DB;
    }

    // The MongoDB driver uses "test" when an URI has no database. Keep the
    // application's historical database name instead.
    const match = uri.match(
        /^[^:]+:\/\/(?:[^@/]+@)?[^/]+\/([^?/#]+)/
    );

    return match && match[1]
        ? decodeURIComponent(match[1])
        : "plasticless";
}

const mongoClient = new MongoClient(MONGODB_URI);
let database;

function collection(name) {
    if (!database) {
        throw new Error("MongoDB is not connected");
    }

    return database.collection(name);
}

function publicDocument(document) {
    if (!document) {
        return document;
    }

    const { _id, ...result } = document;
    return result;
}

function publicDocuments(documents) {
    return documents.map(publicDocument);
}

async function nextNumericId(name) {
    const latest = await collection(name).findOne(
        {},
        {
            sort: { id: -1 },
            projection: { id: 1 }
        }
    );

    return latest && Number.isInteger(latest.id)
        ? latest.id + 1
        : 1;
}

function monthBounds(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    const nextMonth =
        monthNumber === 12
            ? `${year + 1}-01`
            : `${year}-${String(monthNumber + 1).padStart(2, "0")}`;

    return {
        start: `${month}-01`,
        end: `${nextMonth}-01`,
        startDate: new Date(`${month}-01T00:00:00.000Z`),
        endDate: new Date(`${nextMonth}-01T00:00:00.000Z`)
    };
}

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
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "plasticless_secret_2026",
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   PAGE ROUTES
========================================================= */

const pages = [
    "index",
    "login",
    "register",
    "about",
    "campaigns",
    "resources",
    "tasks",
    "collection",
    "reports",
    "contact",
    "dashboard",
    "profile"
];

pages.forEach(page => {
    app.get(`/${page === "index" ? "" : `${page}.html`}`, (req, res) => {
        res.sendFile(path.join(__dirname, "public", `${page}.html`));
    });
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================================================
   AUTHENTICATION HELPERS
========================================================= */

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Login required"
        });
    }

    next();
}

async function findUserById(id) {
    return collection("users").findOne(
        { id },
        {
            projection: {
                _id: 0,
                id: 1,
                name: 1,
                email: 1,
                role: 1,
                created_at: 1,
                profile_picture: 1
            }
        }
    );
}

/* =========================================================
   TEST API
========================================================= */

app.get("/api/test", async (req, res) => {
    try {
        await database.command({ ping: 1 });
        res.json({
            success: true,
            message: "PlasticLess backend is working!",
            database: true
        });
    } catch (error) {
        console.error("API database test failed:", error);
        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

/* =========================================================
   CURRENT USER
========================================================= */

app.get("/api/current-user", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.json({
                success: true,
                loggedIn: false,
                user: null
            });
        }

        const user = await findUserById(req.session.userId);
        if (!user) {
            req.session.destroy(() => {});
            return res.json({
                success: true,
                loggedIn: false,
                user: null
            });
        }

        res.json({
            success: true,
            loggedIn: true,
            user
        });
    } catch (error) {
        console.error("Current user error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to get current user"
        });
    }
});

/* =========================================================
   ME API
========================================================= */

app.get("/api/me", requireLogin, async (req, res) => {
    try {
        const user = await findUserById(req.session.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            loggedIn: true,
            user
        });
    } catch (error) {
        console.error("ME API error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to get profile"
        });
    }
});

/* =========================================================
   REGISTER
========================================================= */

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const allowedRoles = ["citizen", "volunteer", "admin"];
        const normalizedRole = String(role || "").toLowerCase();
        const selectedRole = allowedRoles.includes(normalizedRole)
            ? normalizedRole
            : "citizen";

        const existingUser = await collection("users").findOne(
            { email: cleanEmail },
            { projection: { id: 1 } }
        );
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await collection("users").insertOne({
            id: await nextNumericId("users"),
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            role: selectedRole,
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Registration successful"
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});

/* =========================================================
   LOGIN
========================================================= */

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const user = await collection("users").findOne({
            email: cleanEmail
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        req.session.regenerate(sessionError => {
            if (sessionError) {
                console.error("Session regenerate error:", sessionError);
                return res.status(500).json({
                    success: false,
                    message: "Login session error"
                });
            }

            req.session.userId = user.id;
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            req.session.save(saveError => {
                if (saveError) {
                    console.error("Session save error:", saveError);
                    return res.status(500).json({
                        success: false,
                        message: "Unable to save login session"
                    });
                }

                res.json({
                    success: true,
                    message: "Login successful",
                    user: req.session.user
                });
            });
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

/* =========================================================
   LOGOUT
========================================================= */

app.post("/api/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.error("Logout error:", error);
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
});

/* =========================================================
   PASSWORD MANAGEMENT
========================================================= */

app.post("/api/change-password", requireLogin, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required"
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match"
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 6 characters"
            });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password"
            });
        }

        const user = await collection("users").findOne({
            id: req.session.userId
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        await collection("users").updateOne(
            { id: req.session.userId },
            { $set: { password: await bcrypt.hash(newPassword, 10) } }
        );
        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to change password"
        });
    }
});

app.post("/api/reset-password", async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and all password fields are required"
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const user = await collection("users").findOne({
            email: cleanEmail
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }

        await collection("users").updateOne(
            { id: user.id },
            { $set: { password: await bcrypt.hash(newPassword, 10) } }
        );
        res.json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to reset password"
        });
    }
});

/* =========================================================
   TASKS
========================================================= */

app.get("/api/tasks", async (req, res) => {
    try {
        const userId = req.session.userId;
        const completedTaskIds = userId
            ? new Set(
                (
                    await collection("user_tasks")
                        .find({ user_id: userId }, { projection: { task_id: 1 } })
                        .toArray()
                ).map(item => item.task_id)
            )
            : new Set();

        const tasks = await collection("tasks")
            .find({})
            .sort({ id: 1 })
            .toArray();
        res.json({
            success: true,
            tasks: tasks.map(task => ({
                ...publicDocument(task),
                completed: completedTaskIds.has(task.id) ? 1 : 0
            }))
        });
    } catch (error) {
        console.error("Tasks error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load tasks"
        });
    }
});

app.get("/api/tasks/progress", requireLogin, async (req, res) => {
    try {
        const completedTasks = await collection("user_tasks")
            .find({ user_id: req.session.userId })
            .toArray();
        const taskIds = completedTasks.map(item => item.task_id);
        const tasks = await collection("tasks")
            .find({ id: { $in: taskIds } }, { projection: { id: 1, points: 1 } })
            .toArray();
        const pointsById = new Map(tasks.map(task => [task.id, Number(task.points) || 0]));

        res.json({
            success: true,
            completed: completedTasks.length,
            total: 6,
            points: completedTasks.reduce(
                (total, item) => total + (pointsById.get(item.task_id) || 0),
                0
            )
        });
    } catch (error) {
        console.error("Task progress error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load task progress"
        });
    }
});

app.post("/api/tasks/:id/complete", requireLogin, async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }

        const task = await collection("tasks").findOne({ id: taskId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const existing = await collection("user_tasks").findOne({
            user_id: req.session.userId,
            task_id: taskId
        });
        if (existing) {
            return res.json({
                success: true,
                alreadyCompleted: true,
                message: "Task already completed"
            });
        }

        await collection("user_tasks").insertOne({
            id: await nextNumericId("user_tasks"),
            user_id: req.session.userId,
            task_id: taskId,
            completed_at: new Date()
        });
        res.json({
            success: true,
            message: "Task completed successfully",
            points: task.points
        });
    } catch (error) {
        console.error("Complete task error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to complete task"
        });
    }
});

/* =========================================================
   CAMPAIGNS
========================================================= */

app.get("/api/campaigns", async (req, res) => {
    try {
        const campaigns = await collection("campaigns")
            .find({})
            .sort({ campaign_date: 1 })
            .toArray();
        const campaignIds = campaigns.map(campaign => campaign.id);
        const participants = await collection("campaign_participants")
            .find({ campaign_id: { $in: campaignIds } })
            .toArray();
        const counts = participants.reduce((result, participant) => {
            result.set(
                participant.campaign_id,
                (result.get(participant.campaign_id) || 0) + 1
            );
            return result;
        }, new Map());

        res.json({
            success: true,
            campaigns: campaigns.map(campaign => ({
                ...publicDocument(campaign),
                participant_count: counts.get(campaign.id) || 0
            }))
        });
    } catch (error) {
        console.error("Campaigns error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load campaigns"
        });
    }
});

app.post("/api/campaigns/:id/join", requireLogin, async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        if (!Number.isInteger(campaignId) || campaignId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid campaign ID"
            });
        }

        const campaign = await collection("campaigns").findOne({
            id: campaignId
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found"
            });
        }

        const participants = collection("campaign_participants");
        const existing = await participants.findOne({
            campaign_id: campaignId,
            user_id: req.session.userId
        });
        if (existing) {
            return res.json({
                success: true,
                alreadyJoined: true,
                message: "You already joined this campaign"
            });
        }

        const currentCount = await participants.countDocuments({
            campaign_id: campaignId
        });
        const maxParticipants = Number(campaign.max_participants || 100);
        if (currentCount >= maxParticipants) {
            return res.status(400).json({
                success: false,
                message: "Campaign is full"
            });
        }

        await participants.insertOne({
            id: await nextNumericId("campaign_participants"),
            campaign_id: campaignId,
            user_id: req.session.userId,
            joined_at: new Date()
        });
        res.json({
            success: true,
            message: "Campaign joined successfully"
        });
    } catch (error) {
        console.error("Join campaign error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to join campaign"
        });
    }
});

app.get("/api/campaigns/:id/status", requireLogin, async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const participant = await collection("campaign_participants").findOne({
            campaign_id: campaignId,
            user_id: req.session.userId
        });
        res.json({
            success: true,
            joined: Boolean(participant)
        });
    } catch (error) {
        console.error("Campaign status error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to check campaign status"
        });
    }
});

/* =========================================================
   RESOURCES AND CONTACT
========================================================= */

app.get("/api/resources", async (req, res) => {
    try {
        const resources = await collection("resources")
            .find({})
            .sort({ id: -1 })
            .toArray();
        res.json({
            success: true,
            resources: publicDocuments(resources)
        });
    } catch (error) {
        console.error("Resources error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load resources"
        });
    }
});

app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        await collection("contact_messages").insertOne({
            id: await nextNumericId("contact_messages"),
            name,
            email,
            phone: phone || null,
            subject,
            message,
            created_at: new Date()
        });
        res.json({
            success: true,
            message: "Message sent successfully"
        });
    } catch (error) {
        console.error("Contact error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to send message"
        });
    }
});

/* =========================================================
   PLASTIC COLLECTIONS
========================================================= */

async function saveCollection(req, res, successMessage, invalidMessage) {
    const { location, kilograms, plastic_type, collected_at } = req.body;
    if (!location || kilograms === undefined || !plastic_type || !collected_at) {
        return res.status(400).json({
            success: false,
            message: "All collection fields are required"
        });
    }

    const kg = Number(kilograms);
    if (!Number.isFinite(kg) || kg <= 0) {
        return res.status(400).json({
            success: false,
            message: invalidMessage
        });
    }

    await collection("plastic_collections").insertOne({
        id: await nextNumericId("plastic_collections"),
        user_id: req.session.userId,
        location,
        kilograms: kg,
        plastic_type,
        collected_at: String(collected_at),
        created_at: new Date()
    });
    return res.json({
        success: true,
        message: successMessage
    });
}

app.post("/api/plastic-collections", requireLogin, async (req, res) => {
    try {
        await saveCollection(
            req,
            res,
            "Plastic collection saved successfully",
            "Kilograms must be greater than 0"
        );
    } catch (error) {
        console.error("Plastic collection save error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to save plastic collection"
        });
    }
});

app.post("/api/collections", requireLogin, async (req, res) => {
    try {
        await saveCollection(
            req,
            res,
            "Collection saved successfully",
            "Invalid kilograms"
        );
    } catch (error) {
        console.error("Collections compatibility error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to save collection"
        });
    }
});

app.get("/api/plastic-collections", requireLogin, async (req, res) => {
    try {
        const collections = await collection("plastic_collections")
            .find(
                { user_id: req.session.userId },
                {
                    projection: {
                        _id: 0,
                        id: 1,
                        location: 1,
                        kilograms: 1,
                        plastic_type: 1,
                        collected_at: 1,
                        created_at: 1
                    }
                }
            )
            .sort({ collected_at: -1, id: -1 })
            .toArray();
        res.json({
            success: true,
            collections
        });
    } catch (error) {
        console.error("Get collections error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load collections"
        });
    }
});

app.delete("/api/plastic-collections/:id", requireLogin, async (req, res) => {
    try {
        const collectionId = Number(req.params.id);
        const result = await collection("plastic_collections").deleteOne({
            id: collectionId,
            user_id: req.session.userId
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        res.json({
            success: true,
            message: "Collection deleted successfully"
        });
    } catch (error) {
        console.error("Delete collection error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete collection"
        });
    }
});

/* =========================================================
   REPORTS
========================================================= */

app.get("/api/reports/summary", async (req, res) => {
    try {
        const [collections, volunteers, participants, completedTasks] =
            await Promise.all([
                collection("plastic_collections").find({}).toArray(),
                collection("users").countDocuments({ role: "volunteer" }),
                collection("campaign_participants").countDocuments({}),
                collection("user_tasks").find({}).toArray()
            ]);
        const taskIds = completedTasks.map(task => task.task_id);
        const tasks = await collection("tasks")
            .find({ id: { $in: taskIds } }, { projection: { id: 1, points: 1 } })
            .toArray();
        const pointsById = new Map(tasks.map(task => [task.id, Number(task.points) || 0]));

        res.json({
            success: true,
            totalPlastic: collections.reduce(
                (total, item) => total + (Number(item.kilograms) || 0),
                0
            ),
            volunteers,
            campaignParticipants: participants,
            tasksCompleted: completedTasks.length,
            taskPoints: completedTasks.reduce(
                (total, item) => total + (pointsById.get(item.task_id) || 0),
                0
            )
        });
    } catch (error) {
        console.error("Reports summary error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load report summary"
        });
    }
});

app.get("/api/reports/monthly", async (req, res) => {
    try {
        const month = req.query.month;
        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                success: false,
                message: "Month must be in YYYY-MM format"
            });
        }

        const bounds = monthBounds(month);
        const monthlyCollections = await collection("plastic_collections")
            .find({
                collected_at: {
                    $gte: bounds.start,
                    $lt: bounds.end
                }
            })
            .toArray();
        const campaigns = await collection("campaigns")
            .find({
                campaign_date: {
                    $gte: bounds.start,
                    $lt: bounds.end
                }
            })
            .toArray();
        const campaignIds = campaigns.map(campaign => campaign.id);
        const monthlyParticipants = await collection("campaign_participants")
            .countDocuments({ campaign_id: { $in: campaignIds } });
        const monthlyTasks = await collection("user_tasks")
            .find({
                completed_at: {
                    $gte: bounds.startDate,
                    $lt: bounds.endDate
                }
            })
            .toArray();
        const taskIds = monthlyTasks.map(task => task.task_id);
        const tasks = await collection("tasks")
            .find({ id: { $in: taskIds } }, { projection: { id: 1, points: 1 } })
            .toArray();
        const pointsById = new Map(tasks.map(task => [task.id, Number(task.points) || 0]));
        const typeTotals = monthlyCollections.reduce((result, item) => {
            result[item.plastic_type] =
                (result[item.plastic_type] || 0) + (Number(item.kilograms) || 0);
            return result;
        }, {});

        res.json({
            success: true,
            month,
            totalKg: monthlyCollections.reduce(
                (total, item) => total + (Number(item.kilograms) || 0),
                0
            ),
            collections: monthlyCollections.length,
            volunteers: await collection("users").countDocuments({
                role: "volunteer"
            }),
            campaignParticipants: monthlyParticipants,
            tasksCompleted: monthlyTasks.length,
            taskPoints: monthlyTasks.reduce(
                (total, item) => total + (pointsById.get(item.task_id) || 0),
                0
            ),
            plasticTypes: Object.entries(typeTotals)
                .map(([plastic_type, kilograms]) => ({
                    plastic_type,
                    kilograms
                }))
                .sort((a, b) => b.kilograms - a.kilograms)
        });
    } catch (error) {
        console.error("Monthly report error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load monthly report"
        });
    }
});

/* =========================================================
   API 404 AND GENERAL 404
========================================================= */

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

app.use((req, res) => {
    res.status(404).send("Page not found");
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
    try {
        await mongoClient.connect();
        database = mongoClient.db(databaseNameFromUri(MONGODB_URI));

        await Promise.all([
            database.collection("users").createIndex({ email: 1 }, { unique: true }),
            database.collection("user_tasks").createIndex(
                { user_id: 1, task_id: 1 },
                { unique: true }
            ),
            database.collection("campaign_participants").createIndex(
                { campaign_id: 1, user_id: 1 },
                { unique: true }
            )
        ]);

        console.log(
            `✅ MongoDB database connected (${database.databaseName})`
        );
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 PlasticLess server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ MongoDB connection failed:");
        console.error("URI:", MONGODB_URI ? "[configured]" : "NOT SET");
        console.error("Database:", databaseNameFromUri(MONGODB_URI));
        console.error("Error message:", error.message || "NO_MESSAGE");
        console.error(
            "⚠️ Server will not start until MongoDB is available."
        );
    }
}

startServer();
