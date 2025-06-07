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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTaskDeleted = exports.onTaskUpdated = exports.onTaskCreated = exports.api = void 0;
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const cors = require('cors');
const express = require('express');
// Initialize Firebase Admin
admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
// ============================================================================
// API ENDPOINTS
// ============================================================================
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'retail-sales-pulse-backend',
    });
});
// Get all tasks (with role-based filtering)
app.get('/tasks', async (req, res) => {
    try {
        const { user_id, role, team_id, department } = req.query;
        let tasksSnapshot;
        if (role === 'retail_director') {
            // Retail Director: Xem tất cả tasks của phòng bán lẻ
            // Lấy tất cả tasks và lọc theo department ở frontend
            tasksSnapshot = await admin.firestore().collection('tasks').get();
        }
        else if (role === 'team_leader' && team_id) {
            // Team Leader: Xem tasks được giao cho thành viên trong nhóm
            // Lấy tất cả users của team này từ collection users
            const usersSnapshot = await admin
                .firestore()
                .collection('users')
                .where('team_id', '==', team_id)
                .get();
            const teamMemberIds = usersSnapshot.docs.map((doc) => doc.id);
            if (teamMemberIds.length > 0) {
                // Lấy tasks được giao cho bất kỳ thành viên nào trong nhóm
                tasksSnapshot = await admin
                    .firestore()
                    .collection('tasks')
                    .where('assignedTo', 'in', teamMemberIds)
                    .get();
            }
            else {
                // Nếu không có thành viên nào, trả về empty
                tasksSnapshot = { docs: [] };
            }
        }
        else if (user_id) {
            // Employee: Chỉ xem tasks được giao cho mình
            tasksSnapshot = await admin
                .firestore()
                .collection('tasks')
                .where('assignedTo', '==', user_id)
                .get();
        }
        else {
            // Trả về tất cả tasks (cho admin hoặc testing)
            tasksSnapshot = await admin.firestore().collection('tasks').get();
        }
        const tasks = tasksSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length,
        });
    }
    catch (error) {
        logger.error('Error getting tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get tasks',
        });
    }
});
// Create new task
app.post('/tasks', async (req, res) => {
    try {
        const taskData = Object.assign(Object.assign({}, req.body), { created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
        const docRef = await admin.firestore().collection('tasks').add(taskData);
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, taskData),
        });
    }
    catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
        });
    }
});
// Update task
app.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const updateData = Object.assign(Object.assign({}, req.body), { updated_at: admin.firestore.FieldValue.serverTimestamp() });
        await admin.firestore().collection('tasks').doc(taskId).update(updateData);
        res.status(200).json({
            success: true,
            data: Object.assign({ id: taskId }, updateData),
        });
    }
    catch (error) {
        logger.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
        });
    }
});
// Delete task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        await admin.firestore().collection('tasks').doc(taskId).delete();
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        logger.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
        });
    }
});
// Delete all tasks for a user
app.delete('/tasks/deleteall', async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'user_id is required',
            });
        }
        logger.info(`Deleting tasks for user_id: ${user_id}`);
        // First, let's check all tasks to see what fields exist
        const allTasksSnapshot = await admin.firestore().collection('tasks').limit(5).get();
        logger.info('Sample tasks structure:');
        allTasksSnapshot.docs.forEach((doc, index) => {
            logger.info(`Task ${index}:`, doc.data());
        });
        // Try multiple field names that might contain user ID
        const possibleFields = ['assignedTo', 'user_id', 'userId', 'assigned_to'];
        let tasksToDelete = [];
        for (const field of possibleFields) {
            try {
                const snapshot = await admin
                    .firestore()
                    .collection('tasks')
                    .where(field, '==', user_id)
                    .get();
                if (!snapshot.empty) {
                    logger.info(`Found ${snapshot.size} tasks with field "${field}"`);
                    tasksToDelete = snapshot.docs;
                    break;
                }
            }
            catch (error) {
                // Field might not exist, continue to next
                logger.info(`Field "${field}" not found or error:`, error);
            }
        }
        // If no tasks found with exact match, try string conversion
        if (tasksToDelete.length === 0) {
            const userIdStr = String(user_id);
            for (const field of possibleFields) {
                try {
                    const snapshot = await admin
                        .firestore()
                        .collection('tasks')
                        .where(field, '==', userIdStr)
                        .get();
                    if (!snapshot.empty) {
                        logger.info(`Found ${snapshot.size} tasks with field "${field}" as string`);
                        tasksToDelete = snapshot.docs;
                        break;
                    }
                }
                catch (error) {
                    logger.info(`Field "${field}" string search error:`, error);
                }
            }
        }
        // Delete all found tasks in batch
        const batch = admin.firestore().batch();
        let deletedCount = 0;
        tasksToDelete.forEach((doc) => {
            batch.delete(doc.ref);
            deletedCount++;
        });
        if (deletedCount > 0) {
            await batch.commit();
        }
        logger.info(`Successfully deleted ${deletedCount} tasks for user ${user_id}`);
        return res.json({
            success: true,
            message: `Deleted ${deletedCount} tasks successfully`,
            deletedCount,
        });
    }
    catch (error) {
        logger.error('Error deleting all tasks:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete all tasks',
        });
    }
});
// Manager view endpoint - for directors and team leaders
app.get('/tasks/managerview', async (req, res) => {
    try {
        const { user_id, role, view_level, team_id, department } = req.query;
        if (!user_id || !role || !view_level) {
            return res.status(400).json({
                success: false,
                error: 'user_id, role, and view_level are required',
            });
        }
        logger.info(`Manager view request: user_id=${user_id}, role=${role}, view_level=${view_level}, team_id=${team_id}`);
        // Validation: Team leader chỉ có thể xem team của mình
        if (role === 'team_leader' && team_id) {
            // Kiểm tra xem user có phải team leader của team này không
            const userDoc = await admin.firestore().collection('users').doc(String(user_id)).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if ((userData === null || userData === void 0 ? void 0 : userData.team_id) !== String(team_id)) {
                    logger.warn(`Team leader ${user_id} tried to access team ${team_id} but belongs to team ${userData === null || userData === void 0 ? void 0 : userData.team_id}`);
                    return res.status(403).json({
                        success: false,
                        error: "Team leaders can only view their own team's tasks",
                    });
                }
            }
        }
        const tasksQuery = admin.firestore().collection('tasks');
        let tasksSnapshot;
        switch (view_level) {
            case 'personal':
                // Chỉ tasks được giao cho chính user này
                tasksSnapshot = await tasksQuery.where('assignedTo', '==', user_id).get();
                break;
            case 'shared':
                // Công việc chung của cả phòng - mọi người đều thấy
                // Tasks có type = 'shared' hoặc isShared = true
                tasksSnapshot = await tasksQuery.where('type', '==', 'shared').get();
                // Nếu không có tasks với type shared, thử với field isShared
                if (tasksSnapshot.empty) {
                    tasksSnapshot = await tasksQuery.where('isShared', '==', true).get();
                }
                break;
            case 'team':
                if (role === 'retail_director' || role === 'project_director') {
                    // Director: xem tất cả tasks trong department
                    if (department) {
                        // Lấy tất cả users trong department
                        const usersSnapshot = await admin
                            .firestore()
                            .collection('users')
                            .where('department_type', '==', department)
                            .get();
                        const userIds = usersSnapshot.docs.map((doc) => doc.id);
                        if (userIds.length > 0) {
                            tasksSnapshot = await tasksQuery
                                .where('assignedTo', 'in', userIds.slice(0, 10)) // Firestore limit 10 items in 'in' query
                                .get();
                        }
                        else {
                            tasksSnapshot = await tasksQuery.limit(0).get(); // Empty result
                        }
                    }
                    else {
                        tasksSnapshot = await tasksQuery.limit(0).get();
                    }
                }
                else if (role === 'team_leader' && team_id) {
                    // Team Leader: chỉ xem tasks của team members trong team của mình
                    logger.info(`Team leader ${user_id} requesting team ${team_id} tasks`);
                    // Lấy tất cả users thuộc team này (bao gồm cả team leader)
                    const teamMembersSnapshot = await admin
                        .firestore()
                        .collection('users')
                        .where('team_id', '==', String(team_id))
                        .get();
                    const memberIds = teamMembersSnapshot.docs.map((doc) => doc.id);
                    logger.info(`Found ${memberIds.length} members in team ${team_id}: ${memberIds.join(', ')}`);
                    if (memberIds.length > 0) {
                        // Chia nhỏ query vì Firestore giới hạn 10 items trong 'in' query
                        const allTasks = [];
                        for (let i = 0; i < memberIds.length; i += 10) {
                            const batch = memberIds.slice(i, i + 10);
                            const batchSnapshot = await tasksQuery.where('assignedTo', 'in', batch).get();
                            allTasks.push(...batchSnapshot.docs);
                        }
                        tasksSnapshot = { docs: allTasks };
                    }
                    else {
                        tasksSnapshot = await tasksQuery.limit(0).get();
                    }
                }
                else {
                    tasksSnapshot = await tasksQuery.limit(0).get();
                }
                break;
            case 'department':
                // Chỉ Director mới có quyền xem toàn phòng
                if (role === 'retail_director' || role === 'project_director') {
                    if (department) {
                        // Lấy tất cả users trong department
                        const usersSnapshot = await admin
                            .firestore()
                            .collection('users')
                            .where('department_type', '==', department)
                            .get();
                        const userIds = usersSnapshot.docs.map((doc) => doc.id);
                        // Chia nhỏ query vì Firestore giới hạn 10 items trong 'in' query
                        const allTasks = [];
                        for (let i = 0; i < userIds.length; i += 10) {
                            const batch = userIds.slice(i, i + 10);
                            const batchSnapshot = await tasksQuery.where('assignedTo', 'in', batch).get();
                            allTasks.push(...batchSnapshot.docs);
                        }
                        tasksSnapshot = { docs: allTasks };
                    }
                    else {
                        tasksSnapshot = await tasksQuery.limit(0).get();
                    }
                }
                else {
                    return res.status(403).json({
                        success: false,
                        error: 'Only directors can view department-level tasks',
                    });
                }
                break;
            case 'individual': {
                // Managers có thể xem tasks của individuals trong phạm vi quyền hạn
                const member_id = req.query.member_id;
                if (role === 'retail_director' || role === 'project_director') {
                    // Director: tất cả trong department hoặc member cụ thể
                    if (member_id) {
                        // Xem tasks của member cụ thể
                        tasksSnapshot = await tasksQuery.where('assignedTo', '==', member_id).get();
                    }
                    else if (department) {
                        // Xem tất cả trong department
                        const usersSnapshot = await admin
                            .firestore()
                            .collection('users')
                            .where('department_type', '==', department)
                            .get();
                        const userIds = usersSnapshot.docs.map((doc) => doc.id);
                        const allTasks = [];
                        for (let i = 0; i < userIds.length; i += 10) {
                            const batch = userIds.slice(i, i + 10);
                            const batchSnapshot = await tasksQuery.where('assignedTo', 'in', batch).get();
                            allTasks.push(...batchSnapshot.docs);
                        }
                        tasksSnapshot = { docs: allTasks };
                    }
                    else {
                        tasksSnapshot = await tasksQuery.limit(0).get();
                    }
                }
                else if (role === 'team_leader' && team_id) {
                    // Team Leader: chỉ xem tasks của team members trong team của mình
                    logger.info(`Team leader ${user_id} requesting individual view for team ${team_id}, member: ${member_id || 'all'}`);
                    // Lấy tất cả users thuộc team này trước
                    const teamMembersSnapshot = await admin
                        .firestore()
                        .collection('users')
                        .where('team_id', '==', String(team_id))
                        .get();
                    const memberIds = teamMembersSnapshot.docs.map((doc) => doc.id);
                    logger.info(`Found ${memberIds.length} members in team ${team_id}: ${memberIds.join(', ')}`);
                    if (member_id) {
                        // Kiểm tra member có thuộc team này không
                        if (memberIds.includes(member_id)) {
                            logger.info(`Getting tasks for specific member: ${member_id}`);
                            tasksSnapshot = await tasksQuery.where('assignedTo', '==', member_id).get();
                            logger.info(`Found ${tasksSnapshot.docs.length} tasks for member ${member_id}`);
                        }
                        else {
                            logger.warn(`Team leader ${user_id} tried to access member ${member_id} not in their team`);
                            tasksSnapshot = await tasksQuery.limit(0).get();
                        }
                    }
                    else {
                        // Lấy tất cả tasks của team members
                        logger.info(`Getting tasks for all team members: ${memberIds.join(', ')}`);
                        if (memberIds.length > 0) {
                            // Chia nhỏ query vì Firestore giới hạn 10 items trong 'in' query
                            const allTasks = [];
                            for (let i = 0; i < memberIds.length; i += 10) {
                                const batch = memberIds.slice(i, i + 10);
                                logger.info(`Querying batch: ${batch.join(', ')}`);
                                const batchSnapshot = await tasksQuery.where('assignedTo', 'in', batch).get();
                                logger.info(`Batch returned ${batchSnapshot.docs.length} tasks`);
                                allTasks.push(...batchSnapshot.docs);
                            }
                            tasksSnapshot = { docs: allTasks };
                            logger.info(`Total tasks found for team: ${allTasks.length}`);
                        }
                        else {
                            logger.warn(`No team members found for team ${team_id}`);
                            tasksSnapshot = await tasksQuery.limit(0).get();
                        }
                    }
                }
                else {
                    tasksSnapshot = await tasksQuery.limit(0).get();
                }
                break;
            }
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid view_level. Must be: personal, team, department, or individual',
                });
        }
        const tasks = tasksSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        logger.info(`Returning ${tasks.length} tasks for ${view_level} view`);
        return res.json({
            success: true,
            data: tasks,
            count: tasks.length,
            view_level,
            user_role: role,
        });
    }
    catch (error) {
        logger.error('Error in manager view:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get manager view tasks',
        });
    }
});
// ============================================================================
// USERS API
// ============================================================================
// Get all users
app.get('/users', async (req, res) => {
    try {
        const usersSnapshot = await admin.firestore().collection('users').get();
        const users = usersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: users,
            count: users.length,
        });
    }
    catch (error) {
        logger.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users',
        });
    }
});
// Get user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: Object.assign({ id: userDoc.id }, userDoc.data()),
        });
    }
    catch (error) {
        logger.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user',
        });
    }
});
// ============================================================================
// TEAMS API
// ============================================================================
// Get all teams
app.get('/teams', async (req, res) => {
    try {
        const teamsSnapshot = await admin.firestore().collection('teams').get();
        const teams = teamsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: teams,
            count: teams.length,
        });
    }
    catch (error) {
        logger.error('Error getting teams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get teams',
        });
    }
});
// Get team by ID
app.get('/teams/:id', async (req, res) => {
    try {
        const teamId = req.params.id;
        const teamDoc = await admin.firestore().collection('teams').doc(teamId).get();
        if (!teamDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Team not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: Object.assign({ id: teamDoc.id }, teamDoc.data()),
        });
    }
    catch (error) {
        logger.error('Error getting team:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get team',
        });
    }
});
// ============================================================================
// SETTINGS API
// ============================================================================
// Get all settings
app.get('/settings', async (req, res) => {
    try {
        const settingsSnapshot = await admin.firestore().collection('settings').get();
        const settings = settingsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: settings,
            count: settings.length,
        });
    }
    catch (error) {
        logger.error('Error getting settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get settings',
        });
    }
});
// Create user
app.post('/users', async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.name || !userData.email) {
            res.status(400).json({
                success: false,
                error: 'Name and email are required',
            });
            return;
        }
        // Add timestamp
        userData.created_at = admin.firestore.FieldValue.serverTimestamp();
        userData.updated_at = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await admin.firestore().collection('users').add(userData);
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, userData),
        });
    }
    catch (error) {
        logger.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user',
        });
    }
});
// Create team
app.post('/teams', async (req, res) => {
    try {
        const teamData = req.body;
        if (!teamData.name || !teamData.leader_id) {
            res.status(400).json({
                success: false,
                error: 'Name and leader_id are required',
            });
            return;
        }
        // Add timestamp
        teamData.created_at = admin.firestore.FieldValue.serverTimestamp();
        teamData.updated_at = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await admin.firestore().collection('teams').add(teamData);
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, teamData),
        });
    }
    catch (error) {
        logger.error('Error creating team:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create team',
        });
    }
});
// ============================================================================
// AUTHENTICATION API
// ============================================================================
// Login endpoint
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
            return;
        }
        // Tìm user trong Firestore
        const usersSnapshot = await admin
            .firestore()
            .collection('users')
            .where('email', '==', email)
            .get();
        if (usersSnapshot.empty) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        if (!userData) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }
        // Trong production, bạn nên hash password
        // Hiện tại chỉ so sánh trực tiếp cho demo
        if (userData.password !== password) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
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
        logger.error('Error during login:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
        });
    }
});
// Verify token endpoint
app.post('/auth/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                success: false,
                error: 'Token is required',
            });
            return;
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;
        // Lấy thông tin user từ Firestore
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'User not found',
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
        logger.error('Error verifying token:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token',
        });
    }
});
// ============================================================================
// GOOGLE SHEETS SYNC API
// ============================================================================
// Sync tasks to Google Sheets
app.post('/sync/sheets', async (req, res) => {
    try {
        // Lấy tất cả tasks từ Firestore
        const tasksSnapshot = await admin.firestore().collection('tasks').get();
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
            'ID',
            'Tiêu đề',
            'Mô tả',
            'Loại',
            'Trạng thái',
            'Ngày',
            'Giờ',
            'Tiến độ (%)',
            'Người thực hiện',
            'Khu vực',
            'Ngày tạo',
        ];
        const allData = [headers, ...sheetsData];
        res.status(200).json({
            success: true,
            data: {
                totalTasks: tasks.length,
                sheetsData: allData,
                message: 'Data prepared for Google Sheets sync',
            },
        });
    }
    catch (error) {
        logger.error('Error syncing to Google Sheets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync to Google Sheets',
        });
    }
});
// Export tasks to CSV format
app.get('/export/csv', async (req, res) => {
    try {
        const tasksSnapshot = await admin.firestore().collection('tasks').get();
        const tasks = tasksSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        // Tạo CSV content
        const headers = [
            'ID',
            'Tiêu đề',
            'Mô tả',
            'Loại',
            'Trạng thái',
            'Ngày',
            'Giờ',
            'Tiến độ (%)',
            'Người thực hiện',
            'Khu vực',
            'Ngày tạo',
        ];
        const csvRows = [headers.join(',')];
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
            csvRows.push(row.join(','));
        });
        const csvContent = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
        res.status(200).send(csvContent);
    }
    catch (error) {
        logger.error('Error exporting CSV:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export CSV',
        });
    }
});
// Export the API
exports.api = (0, https_1.onRequest)(app);
// ============================================================================
// FIRESTORE TRIGGERS
// ============================================================================
// Trigger when a new task is created
exports.onTaskCreated = (0, firestore_1.onDocumentCreated)('tasks/{taskId}', (event) => {
    var _a;
    const taskData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    const taskId = event.params.taskId;
    logger.info(`New task created: ${taskId}`, taskData);
    // Add any logic here (e.g., send notifications, update statistics)
    return Promise.resolve();
});
// Trigger when a task is updated
exports.onTaskUpdated = (0, firestore_1.onDocumentUpdated)('tasks/{taskId}', (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    const taskId = event.params.taskId;
    logger.info(`Task updated: ${taskId}`, { before: beforeData, after: afterData });
    // Add any logic here (e.g., track changes, send notifications)
    return Promise.resolve();
});
// Trigger when a task is deleted
exports.onTaskDeleted = (0, firestore_1.onDocumentDeleted)('tasks/{taskId}', (event) => {
    var _a;
    const taskData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    const taskId = event.params.taskId;
    logger.info(`Task deleted: ${taskId}`, taskData);
    // Add any logic here (e.g., cleanup related data, send notifications)
    return Promise.resolve();
});
//# sourceMappingURL=index.js.map