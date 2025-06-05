import {onRequest} from "firebase-functions/v2/https";
import {onDocumentCreated, onDocumentUpdated, onDocumentDeleted} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import cors from "cors";
import express from "express";

// Initialize Firebase Admin
admin.initializeApp();

const app = express();
app.use(cors({origin: true}));

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

// Get all tasks (with role-based filtering)
app.get("/tasks", async (req, res) => {
  try {
    const { user_id, role, team_id, department } = req.query;

    let tasksSnapshot;

    if (role === 'retail_director') {
      // Retail Director: Xem tất cả tasks của phòng bán lẻ
      // Lấy tất cả tasks và lọc theo department ở frontend
      tasksSnapshot = await admin.firestore().collection("tasks").get();
    } else if (role === 'team_leader' && team_id) {
      // Team Leader: Xem tasks được giao cho thành viên trong nhóm
      // Lấy tất cả users của team này từ collection users
      const usersSnapshot = await admin.firestore()
        .collection("users")
        .where("team_id", "==", team_id)
        .get();

      const teamMemberIds = usersSnapshot.docs.map(doc => doc.id);

      if (teamMemberIds.length > 0) {
        // Lấy tasks được giao cho bất kỳ thành viên nào trong nhóm
        tasksSnapshot = await admin.firestore()
          .collection("tasks")
          .where("assignedTo", "in", teamMemberIds)
          .get();
      } else {
        // Nếu không có thành viên nào, trả về empty
        tasksSnapshot = { docs: [] };
      }
    } else if (user_id) {
      // Employee: Chỉ xem tasks được giao cho mình
      tasksSnapshot = await admin.firestore()
        .collection("tasks")
        .where("assignedTo", "==", user_id)
        .get();
    } else {
      // Trả về tất cả tasks (cho admin hoặc testing)
      tasksSnapshot = await admin.firestore().collection("tasks").get();
    }

    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
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
    const taskData = {
      ...req.body,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const docRef = await admin.firestore().collection("tasks").add(taskData);
    
    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...taskData,
      },
    });
  } catch (error) {
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
    const updateData = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await admin.firestore().collection("tasks").doc(taskId).update(updateData);
    
    res.status(200).json({
      success: true,
      data: {
        id: taskId,
        ...updateData,
      },
    });
  } catch (error) {
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
  } catch (error) {
    logger.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
    });
  }
});

// Delete all tasks for a user
app.delete("/tasks/delete-all", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "user_id is required",
      });
    }

    // Get all tasks assigned to this user
    const tasksSnapshot = await admin.firestore()
      .collection("tasks")
      .where("assignedTo", "==", user_id)
      .get();

    // Delete all tasks in batch
    const batch = admin.firestore().batch();
    let deletedCount = 0;

    tasksSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    await batch.commit();

    return res.json({
      success: true,
      message: `Deleted ${deletedCount} tasks successfully`,
      deletedCount,
    });
  } catch (error) {
    logger.error("Error deleting all tasks:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete all tasks",
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
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
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
      data: {
        id: userDoc.id,
        ...userDoc.data(),
      },
    });
  } catch (error) {
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
    const teams = teamsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: teams,
      count: teams.length,
    });
  } catch (error) {
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
      data: {
        id: teamDoc.id,
        ...teamDoc.data(),
      },
    });
  } catch (error) {
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
    const settings = settingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: settings,
      count: settings.length,
    });
  } catch (error) {
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
      data: {
        id: docRef.id,
        ...userData,
      },
    });
  } catch (error) {
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
      data: {
        id: docRef.id,
        ...teamData,
      },
    });
  } catch (error) {
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
        user: {
          id: userDoc.id,
          ...userData,
        },
        token: customToken,
      },
    });
  } catch (error) {
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
        user: {
          id: userDoc.id,
          ...userDoc.data(),
        },
      },
    });
  } catch (error) {
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
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Chuẩn bị dữ liệu cho Google Sheets
    const sheetsData = tasks.map((task: any) => [
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
  } catch (error) {
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
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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

    tasks.forEach((task: any) => {
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
  } catch (error) {
    logger.error("Error exporting CSV:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export CSV",
    });
  }
});

// Export the API
export const api = onRequest(app);

// ============================================================================
// FIRESTORE TRIGGERS
// ============================================================================

// Trigger when a new task is created
export const onTaskCreated = onDocumentCreated("tasks/{taskId}", (event) => {
  const taskData = event.data?.data();
  const taskId = event.params.taskId;
  
  logger.info(`New task created: ${taskId}`, taskData);
  
  // Add any logic here (e.g., send notifications, update statistics)
  return Promise.resolve();
});

// Trigger when a task is updated
export const onTaskUpdated = onDocumentUpdated("tasks/{taskId}", (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  const taskId = event.params.taskId;
  
  logger.info(`Task updated: ${taskId}`, {before: beforeData, after: afterData});
  
  // Add any logic here (e.g., track changes, send notifications)
  return Promise.resolve();
});

// Trigger when a task is deleted
export const onTaskDeleted = onDocumentDeleted("tasks/{taskId}", (event) => {
  const taskData = event.data?.data();
  const taskId = event.params.taskId;
  
  logger.info(`Task deleted: ${taskId}`, taskData);
  
  // Add any logic here (e.g., cleanup related data, send notifications)
  return Promise.resolve();
});
