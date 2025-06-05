"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTaskDeleted = exports.onTaskUpdated = exports.onTaskCreated = exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
// Initialize Firebase Admin
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
// ============================================================================
// API ENDPOINTS
// ============================================================================
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "retail-sales-pulse-backend",
    });
});
// Get all tasks (with optional user filtering)
app.get("/tasks", async (req, res) => {
    try {
        const { user_id } = req.query;
        let tasksSnapshot;
        if (user_id) {
            // Lọc tasks theo user_id - chỉ trả về tasks được giao cho user đó
            tasksSnapshot = await admin.firestore()
                .collection("tasks")
                .where("assignedTo", "==", user_id)
                .get();
        }
        else {
            // Trả về tất cả tasks (cho admin hoặc testing)
            tasksSnapshot = await admin.firestore().collection("tasks").get();
        }
        const tasks = tasksSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length,
        });
    }
    catch (error) {
        logger.error("Error getting tasks:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get tasks",
        });
    }
});
// Create new task
app.post("/tasks", async (req, res) => {
    try {
        const taskData = Object.assign(Object.assign({}, req.body), { created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
        const docRef = await admin.firestore().collection("tasks").add(taskData);
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, taskData),
        });
    }
    catch (error) {
        logger.error("Error creating task:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create task",
        });
    }
});
// Update task
app.put("/tasks/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        const updateData = Object.assign(Object.assign({}, req.body), { updated_at: admin.firestore.FieldValue.serverTimestamp() });
        await admin.firestore().collection("tasks").doc(taskId).update(updateData);
        res.status(200).json({
            success: true,
            data: Object.assign({ id: taskId }, updateData),
        });
    }
    catch (error) {
        logger.error("Error updating task:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update task",
        });
    }
});
// Delete task
app.delete("/tasks/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        await admin.firestore().collection("tasks").doc(taskId).delete();
        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    }
    catch (error) {
        logger.error("Error deleting task:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete task",
        });
    }
});
// ============================================================================
// USERS API
// ============================================================================
// Get all users
app.get("/users", async (req, res) => {
    try {
        const usersSnapshot = await admin.firestore().collection("users").get();
        const users = usersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: users,
            count: users.length,
        });
    }
    catch (error) {
        logger.error("Error getting users:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get users",
        });
    }
});
// Get user by ID
app.get("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: Object.assign({ id: userDoc.id }, userDoc.data()),
        });
    }
    catch (error) {
        logger.error("Error getting user:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get user",
        });
    }
});
// ============================================================================
// TEAMS API
// ============================================================================
// Get all teams
app.get("/teams", async (req, res) => {
    try {
        const teamsSnapshot = await admin.firestore().collection("teams").get();
        const teams = teamsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: teams,
            count: teams.length,
        });
    }
    catch (error) {
        logger.error("Error getting teams:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get teams",
        });
    }
});
// Get team by ID
app.get("/teams/:id", async (req, res) => {
    try {
        const teamId = req.params.id;
        const teamDoc = await admin.firestore().collection("teams").doc(teamId).get();
        if (!teamDoc.exists) {
            res.status(404).json({
                success: false,
                error: "Team not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: Object.assign({ id: teamDoc.id }, teamDoc.data()),
        });
    }
    catch (error) {
        logger.error("Error getting team:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get team",
        });
    }
});
// ============================================================================
// SETTINGS API
// ============================================================================
// Get all settings
app.get("/settings", async (req, res) => {
    try {
        const settingsSnapshot = await admin.firestore().collection("settings").get();
        const settings = settingsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: settings,
            count: settings.length,
        });
    }
    catch (error) {
        logger.error("Error getting settings:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get settings",
        });
    }
});
// Create user
app.post("/users", async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.name || !userData.email) {
            res.status(400).json({
                success: false,
                error: "Name and email are required",
            });
            return;
        }
        // Add timestamp
        userData.created_at = admin.firestore.FieldValue.serverTimestamp();
        userData.updated_at = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await admin.firestore().collection("users").add(userData);
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, userData),
        });
    }
    catch (error) {
        logger.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create user",
        });
    }
});
// Create team
app.post("/teams", async (req, res) => {
    try {
        const teamData = req.body;
        if (!teamData.name || !teamData.leader_id) {
            res.status(400).json({
                success: false,
                error: "Name and leader_id are required",
            });
            return;
        }
        // Add timestamp
        teamData.created_at = admin.firestore.FieldValue.serverTimestamp();
        teamData.updated_at = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await admin.firestore().collection("teams").add(teamData);
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, teamData),
        });
    }
    catch (error) {
        logger.error("Error creating team:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create team",
        });
    }
});
// ============================================================================
// AUTHENTICATION API
// ============================================================================
// Login endpoint
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: "Email and password are required",
            });
            return;
        }
        // Tìm user trong Firestore
        const usersSnapshot = await admin.firestore()
            .collection("users")
            .where("email", "==", email)
            .get();
        if (usersSnapshot.empty) {
            res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
            return;
        }
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        // Trong production, bạn nên hash password
        // Hiện tại chỉ so sánh trực tiếp cho demo
        if (userData.password !== password) {
            res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
            return;
        }
        // Tạo custom token
        const customToken = await admin.auth().createCustomToken(userDoc.id);
        res.status(200).json({
            success: true,
            data: {
                user: Object.assign({ id: userDoc.id }, userData),
                token: customToken,
            },
        });
    }
    catch (error) {
        logger.error("Error during login:", error);
        res.status(500).json({
            success: false,
            error: "Login failed",
        });
    }
});
// Verify token endpoint
app.post("/auth/verify", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                success: false,
                error: "Token is required",
            });
            return;
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;
        // Lấy thông tin user từ Firestore
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                user: Object.assign({ id: userDoc.id }, userDoc.data()),
            },
        });
    }
    catch (error) {
        logger.error("Error verifying token:", error);
        res.status(401).json({
            success: false,
            error: "Invalid token",
        });
    }
});
// ============================================================================
// GOOGLE SHEETS SYNC API
// ============================================================================
// Sync tasks to Google Sheets
app.post("/sync/sheets", async (req, res) => {
    try {
        // Lấy tất cả tasks từ Firestore
        const tasksSnapshot = await admin.firestore().collection("tasks").get();
        const tasks = tasksSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        // Chuẩn bị dữ liệu cho Google Sheets
        const sheetsData = tasks.map((task) => [
            task.id,
            task.title || '',
            task.description || '',
            task.type || '',
            task.status || '',
            task.date || '',
            task.time || '',
            task.progress || 0,
            task.user_name || '',
            task.location || '',
            task.created_at || '',
        ]);
        // Header row
        const headers = [
            "ID",
            "Tiêu đề",
            "Mô tả",
            "Loại",
            "Trạng thái",
            "Ngày",
            "Giờ",
            "Tiến độ (%)",
            "Người thực hiện",
            "Khu vực",
            "Ngày tạo",
        ];
        const allData = [headers, ...sheetsData];
        res.status(200).json({
            success: true,
            data: {
                totalTasks: tasks.length,
                sheetsData: allData,
                message: "Data prepared for Google Sheets sync",
            },
        });
    }
    catch (error) {
        logger.error("Error syncing to Google Sheets:", error);
        res.status(500).json({
            success: false,
            error: "Failed to sync to Google Sheets",
        });
    }
});
// Export tasks to CSV format
app.get("/export/csv", async (req, res) => {
    try {
        const tasksSnapshot = await admin.firestore().collection("tasks").get();
        const tasks = tasksSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        // Tạo CSV content
        const headers = [
            "ID",
            "Tiêu đề",
            "Mô tả",
            "Loại",
            "Trạng thái",
            "Ngày",
            "Giờ",
            "Tiến độ (%)",
            "Người thực hiện",
            "Khu vực",
            "Ngày tạo",
        ];
        const csvRows = [headers.join(",")];
        tasks.forEach((task) => {
            const row = [
                task.id,
                `"${task.title || ''}"`,
                `"${task.description || ''}"`,
                task.type || '',
                task.status || '',
                task.date || '',
                task.time || '',
                task.progress || 0,
                `"${task.user_name || ''}"`,
                task.location || '',
                task.created_at || '',
            ];
            csvRows.push(row.join(","));
        });
        const csvContent = csvRows.join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=tasks.csv");
        res.status(200).send(csvContent);
    }
    catch (error) {
        logger.error("Error exporting CSV:", error);
        res.status(500).json({
            success: false,
            error: "Failed to export CSV",
        });
    }
});
// Export the API
exports.api = (0, https_1.onRequest)(app);
// ============================================================================
// FIRESTORE TRIGGERS
// ============================================================================
// Trigger when a new task is created
exports.onTaskCreated = (0, firestore_1.onDocumentCreated)("tasks/{taskId}", (event) => {
    var _a;
    const taskData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    const taskId = event.params.taskId;
    logger.info(`New task created: ${taskId}`, taskData);
    // Add any logic here (e.g., send notifications, update statistics)
    return Promise.resolve();
});
// Trigger when a task is updated
exports.onTaskUpdated = (0, firestore_1.onDocumentUpdated)("tasks/{taskId}", (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    const taskId = event.params.taskId;
    logger.info(`Task updated: ${taskId}`, { before: beforeData, after: afterData });
    // Add any logic here (e.g., track changes, send notifications)
    return Promise.resolve();
});
// Trigger when a task is deleted
exports.onTaskDeleted = (0, firestore_1.onDocumentDeleted)("tasks/{taskId}", (event) => {
    var _a;
    const taskData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    const taskId = event.params.taskId;
    logger.info(`Task deleted: ${taskId}`, taskData);
    // Add any logic here (e.g., cleanup related data, send notifications)
    return Promise.resolve();
});
//# sourceMappingURL=index.js.map