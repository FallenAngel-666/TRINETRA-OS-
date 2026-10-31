/**
 * TRINETRA - Persistent Operational Database Service
 * Provides transactional state management, relational integrity, audit logging,
 * and real-time reactive event subscriptions across all campus subsystems.
 */

import {
  CAMPUS_METADATA,
  BUILDINGS,
  ROOMS,
  ASSETS,
  TECHNICIANS,
  INVENTORY,
  INCIDENTS,
  WORK_ORDERS,
  PURCHASE_REQUESTS,
  BOOKINGS,
  ROLES,
  USERS,
  SIMULATION_SCENARIOS,
  INITIAL_EMAIL_INBOX,
  AUDIT_LOG_SEED
} from '../data/campus-seed.js';

const STORAGE_PREFIX = 'TRINETRA_DB_';

class DatabaseService {
  constructor() {
    this.listeners = new Map();
    this.currentUser = null;
    this.initDatabase();
  }

  initDatabase() {
    // If not initialized in localStorage, seed with comprehensive campus data
    if (!localStorage.getItem(`${STORAGE_PREFIX}INITIALIZED`)) {
      this.resetToSeedData();
    } else {
      // Load current user or default to Facilities Administrator
      const savedUser = localStorage.getItem(`${STORAGE_PREFIX}CURRENT_USER`);
      this.currentUser = savedUser ? JSON.parse(savedUser) : USERS[3]; // USR-ADMIN-01
    }
  }

  resetToSeedData() {
    localStorage.setItem(`${STORAGE_PREFIX}CAMPUS`, JSON.stringify(CAMPUS_METADATA));
    localStorage.setItem(`${STORAGE_PREFIX}BUILDINGS`, JSON.stringify(BUILDINGS));
    localStorage.setItem(`${STORAGE_PREFIX}ROOMS`, JSON.stringify(ROOMS));
    localStorage.setItem(`${STORAGE_PREFIX}ASSETS`, JSON.stringify(ASSETS));
    localStorage.setItem(`${STORAGE_PREFIX}TECHNICIANS`, JSON.stringify(TECHNICIANS));
    localStorage.setItem(`${STORAGE_PREFIX}INVENTORY`, JSON.stringify(INVENTORY));
    localStorage.setItem(`${STORAGE_PREFIX}INCIDENTS`, JSON.stringify(INCIDENTS));
    localStorage.setItem(`${STORAGE_PREFIX}WORK_ORDERS`, JSON.stringify(WORK_ORDERS));
    localStorage.setItem(`${STORAGE_PREFIX}PURCHASE_REQUESTS`, JSON.stringify(PURCHASE_REQUESTS));
    localStorage.setItem(`${STORAGE_PREFIX}BOOKINGS`, JSON.stringify(BOOKINGS));
    localStorage.setItem(`${STORAGE_PREFIX}ROLES`, JSON.stringify(ROLES));
    localStorage.setItem(`${STORAGE_PREFIX}USERS`, JSON.stringify(USERS));
    localStorage.setItem(`${STORAGE_PREFIX}SCENARIOS`, JSON.stringify(SIMULATION_SCENARIOS));
    localStorage.setItem(`${STORAGE_PREFIX}EMAILS`, JSON.stringify(INITIAL_EMAIL_INBOX));
    localStorage.setItem(`${STORAGE_PREFIX}AUDIT_LOGS`, JSON.stringify(AUDIT_LOG_SEED));
    localStorage.setItem(`${STORAGE_PREFIX}NOTIFICATIONS`, JSON.stringify([
      {
        id: 'NOTIF-01',
        title: 'TRINETRA Online',
        message: 'Digital Twin and Infrastructure Brain synchronized with SRM Easwari Engineering College.',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'NOTIF-02',
        title: 'Critical Incident INC-2026-101',
        message: 'Exam Projector in E-204 offline. Work order assigned to M. Suresh.',
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      }
    ]));
    localStorage.setItem(`${STORAGE_PREFIX}CAMPUSOPS_DETECTIONS`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_PREFIX}INITIALIZED`, 'true');
    this.currentUser = USERS[3]; // Facilities Administrator
    localStorage.setItem(`${STORAGE_PREFIX}CURRENT_USER`, JSON.stringify(this.currentUser));
    this.emitChange('*');
  }

  // --- PUB / SUB SYSTEM FOR REAL-TIME REACTIVITY ---
  subscribe(entity, callback) {
    if (!this.listeners.has(entity)) {
      this.listeners.set(entity, new Set());
    }
    this.listeners.get(entity).add(callback);
    return () => {
      this.listeners.get(entity).delete(callback);
    };
  }

  emitChange(entity) {
    if (this.listeners.has(entity)) {
      this.listeners.get(entity).forEach(cb => cb(this.getAll(entity)));
    }
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => cb({ entity }));
    }
  }

  // --- GENERIC STORAGE HELPERS ---
  getAll(entity) {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${entity.toUpperCase()}`);
    return raw ? JSON.parse(raw) : [];
  }

  saveAll(entity, items) {
    localStorage.setItem(`${STORAGE_PREFIX}${entity.toUpperCase()}`, JSON.stringify(items));
    this.emitChange(entity);
  }

  getById(entity, id) {
    const items = this.getAll(entity);
    return items.find(item => item.id === id) || null;
  }

  updateById(entity, id, patch) {
    const items = this.getAll(entity);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...patch, updatedAt: new Date().toISOString() };
      this.saveAll(entity, items);
      return items[index];
    }
    return null;
  }

  add(entity, item) {
    const items = this.getAll(entity);
    const newItem = {
      ...item,
      id: item.id || `${entity.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      createdAt: item.createdAt || new Date().toISOString()
    };
    items.unshift(newItem);
    this.saveAll(entity, items);
    return newItem;
  }

  deleteById(entity, id) {
    const items = this.getAll(entity);
    const filtered = items.filter(item => item.id !== id);
    this.saveAll(entity, filtered);
    return filtered;
  }

  // --- USER & AUTHENTICATION SESSION ---
  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(userId) {
    const users = this.getAll('USERS');
    const user = users.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      localStorage.setItem(`${STORAGE_PREFIX}CURRENT_USER`, JSON.stringify(user));
      this.addAuditLog('ROLE_SWITCH', `User: ${user.name} (${user.role})`, 'Switched active security session profile.');
      this.emitChange('USER');
      return user;
    }
    return null;
  }

  hasPermission(permissionCode) {
    if (!this.currentUser) return false;
    const roles = this.getAll('ROLES');
    const userRole = roles.find(r => r.code === this.currentUser.roleCode || r.name === this.currentUser.role);
    if (!userRole) return false;
    if (userRole.permissions.includes('ALL_PERMISSIONS')) return true;
    return userRole.permissions.includes(permissionCode);
  }

  // --- AUDIT LOGGING ---
  addAuditLog(action, targetEntity, details) {
    const user = this.currentUser || { id: 'SYSTEM', name: 'TRINETRA Kernel', role: 'System' };
    const log = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      targetEntity,
      details
    };
    const logs = this.getAll('AUDIT_LOGS');
    logs.unshift(log);
    // keep recent 300 logs
    if (logs.length > 300) logs.pop();
    this.saveAll('AUDIT_LOGS', logs);
    return log;
  }

  // --- NOTIFICATIONS ---
  addNotification(title, message, type = 'info') {
    const notif = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    const notifs = this.getAll('NOTIFICATIONS');
    notifs.unshift(notif);
    this.saveAll('NOTIFICATIONS', notifs);
    return notif;
  }

  markNotificationRead(id) {
    return this.updateById('NOTIFICATIONS', id, { read: true });
  }

  // --- BUILDINGS & ROOMS ---
  getBuildings() {
    return this.getAll('BUILDINGS');
  }

  getBuilding(id) {
    return this.getById('BUILDINGS', id);
  }

  updateBuildingStatus(buildingId) {
    // Dynamically calculate building status based on room and incident health
    const building = this.getBuilding(buildingId);
    if (!building) return null;

    const rooms = this.getRoomsByBuilding(buildingId);
    const hasRedRoom = rooms.some(r => r.status === 'red');
    const hasAmberRoom = rooms.some(r => r.status === 'amber');

    let newStatus = 'green';
    let healthScore = 95;

    if (hasRedRoom) {
      newStatus = 'red';
      healthScore = Math.max(50, 75 - rooms.filter(r => r.status === 'red').length * 15);
    } else if (hasAmberRoom) {
      newStatus = 'amber';
      healthScore = 82;
    }

    return this.updateById('BUILDINGS', buildingId, { status: newStatus, healthScore });
  }

  getRooms() {
    return this.getAll('ROOMS');
  }

  getRoomsByBuilding(buildingId) {
    return this.getRooms().filter(r => r.buildingId === buildingId);
  }

  getRoomsByFloor(buildingId, floorNumber) {
    return this.getRooms().filter(r => r.buildingId === buildingId && Number(r.floorNumber) === Number(floorNumber));
  }

  getRoom(id) {
    return this.getById('ROOMS', id);
  }

  // --- ASSETS ---
  getAssets() {
    return this.getAll('ASSETS');
  }

  getAsset(id) {
    return this.getById('ASSETS', id);
  }

  getAssetsByRoom(roomId) {
    return this.getAssets().filter(a => a.roomId === roomId);
  }

  // --- INCIDENTS & WORKFLOW ---
  getIncidents() {
    return this.getAll('INCIDENTS');
  }

  getIncident(id) {
    return this.getById('INCIDENTS', id);
  }

  createIncident(incidentData) {
    const id = `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident = {
      id,
      code: id,
      title: incidentData.title || 'Untitled Operational Incident',
      category: incidentData.category || 'General Maintenance',
      urgency: incidentData.urgency || 'Medium',
      priority: incidentData.priority || 'P2 - Moderate',
      status: 'Reported',
      buildingId: incidentData.buildingId,
      floorId: incidentData.floorId,
      roomId: incidentData.roomId,
      assetId: incidentData.assetId || null,
      affectedActivity: incidentData.affectedActivity || 'Standard Campus Operations',
      reportedBy: incidentData.reportedBy || (this.currentUser ? this.currentUser.name : 'Web User'),
      reportChannel: incidentData.reportChannel || 'Web Portal',
      reportedAt: new Date().toISOString(),
      slaTargetHours: incidentData.urgency === 'Critical' ? 4 : incidentData.urgency === 'High' ? 12 : 24,
      slaStatus: 'Within SLA',
      assignedTechnicianId: null,
      requiredPartId: incidentData.requiredPartId || null,
      partReserved: false,
      partQuantity: incidentData.partQuantity || 0,
      summary: incidentData.summary || '',
      impactAnalysis: incidentData.impactAnalysis || '',
      aiRecommendations: incidentData.aiRecommendations || [],
      stateHistory: [
        {
          state: 'Reported',
          timestamp: new Date().toISOString(),
          updatedBy: this.currentUser ? this.currentUser.name : 'Web User'
        }
      ]
    };

    this.add('INCIDENTS', newIncident);

    // Update Room Status
    if (incidentData.roomId) {
      const roomStatus = incidentData.urgency === 'Critical' ? 'red' : 'amber';
      const room = this.getRoom(incidentData.roomId);
      if (room) {
        const activeIncidents = Array.from(new Set([...(room.activeIncidents || []), id]));
        this.updateById('ROOMS', incidentData.roomId, {
          status: roomStatus,
          availability: `Alert (${incidentData.urgency} Incident Active)`,
          activeIncidents
        });
      }
    }

    // Update Building Status
    if (incidentData.buildingId) {
      this.updateBuildingStatus(incidentData.buildingId);
    }

    // Update Asset Status if targeted
    if (incidentData.assetId) {
      this.updateById('ASSETS', incidentData.assetId, {
        status: incidentData.urgency === 'Critical' ? 'critical' : 'warning',
        healthScore: incidentData.urgency === 'Critical' ? 20 : 60
      });
    }

    this.addAuditLog('INCIDENT_CREATED', id, `Created incident: ${newIncident.title} (${newIncident.urgency})`);
    this.addNotification(`New Incident: ${id}`, `${newIncident.title} reported in Room ${newIncident.roomId || 'Campus'}.`, 'warning');

    return newIncident;
  }

  transitionIncidentState(incidentId, newState, notes = '') {
    const validTransitions = {
      'Reported': ['Analysed', 'Assigned', 'Cancelled'],
      'Analysed': ['Assigned', 'In Progress', 'Cancelled'],
      'Assigned': ['In Progress', 'Assigned (Blocked on Part)', 'Cancelled'],
      'Assigned (Blocked on Part)': ['Assigned', 'In Progress', 'Cancelled'],
      'In Progress': ['Resolved', 'Assigned (Blocked on Part)', 'Cancelled'],
      'Resolved': ['Closed', 'In Progress']
    };

    const incident = this.getIncident(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found.`);

    const allowed = validTransitions[incident.status];
    if (!allowed || !allowed.includes(newState)) {
      throw new Error(`Invalid state transition from "${incident.status}" to "${newState}".`);
    }

    const updatedHistory = [
      ...(incident.stateHistory || []),
      {
        state: newState,
        timestamp: new Date().toISOString(),
        updatedBy: this.currentUser ? this.currentUser.name : 'TRINETRA Kernel',
        notes
      }
    ];

    const patch = { status: newState, stateHistory: updatedHistory };

    // If resolved, restore room status and asset status
    if (newState === 'Resolved') {
      patch.resolvedAt = new Date().toISOString();
      if (incident.roomId) {
        const room = this.getRoom(incident.roomId);
        if (room) {
          const remaining = (room.activeIncidents || []).filter(incId => incId !== incidentId);
          this.updateById('ROOMS', incident.roomId, {
            status: remaining.length === 0 ? 'green' : 'amber',
            availability: remaining.length === 0 ? 'Available' : 'Attention Required',
            activeIncidents: remaining
          });
        }
      }
      if (incident.buildingId) {
        this.updateBuildingStatus(incident.buildingId);
      }
      if (incident.assetId) {
        this.updateById('ASSETS', incident.assetId, {
          status: 'healthy',
          healthScore: 98,
          lastServiceDate: new Date().toISOString().split('T')[0]
        });
      }
      // If inventory was reserved, consume it
      if (incident.requiredPartId && incident.partReserved) {
        this.consumeInventory(incident.requiredPartId, incident.partQuantity || 1);
      }
    }

    const updated = this.updateById('INCIDENTS', incidentId, patch);
    this.addAuditLog('INCIDENT_STATUS_CHANGE', incidentId, `Transitioned status to ${newState}. Notes: ${notes}`);
    return updated;
  }

  // --- WORK ORDERS ---
  getWorkOrders() {
    return this.getAll('WORK_ORDERS');
  }

  getWorkOrder(id) {
    return this.getById('WORK_ORDERS', id);
  }

  createWorkOrder(woData) {
    const id = `WO-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;
    const newWo = {
      id,
      code: id,
      incidentId: woData.incidentId,
      title: woData.title,
      assignedTechnicianId: woData.assignedTechnicianId,
      technicianName: woData.technicianName,
      status: woData.status || 'Assigned',
      priority: woData.priority || 'Medium',
      scheduledStart: woData.scheduledStart || new Date().toISOString(),
      estimatedDurationMinutes: woData.estimatedDurationMinutes || 60,
      buildingId: woData.buildingId,
      floorId: woData.floorId,
      roomId: woData.roomId,
      partsRequired: woData.partsRequired || [],
      checkList: woData.checkList || [
        { task: 'Isolate electrical/physical equipment safety barriers', completed: false },
        { task: 'Diagnose component failure and verify replacement part', completed: false },
        { task: 'Perform component replacement/repair', completed: false },
        { task: 'Conduct functional load testing and clean work area', completed: false },
        { task: 'Obtain end-user verification signature', completed: false }
      ],
      notes: woData.notes || ''
    };

    this.add('WORK_ORDERS', newWo);

    // Update technician workload
    if (woData.assignedTechnicianId) {
      const tech = this.getById('TECHNICIANS', woData.assignedTechnicianId);
      if (tech) {
        this.updateById('TECHNICIANS', woData.assignedTechnicianId, {
          currentWorkload: (tech.currentWorkload || 0) + 1,
          availability: (tech.currentWorkload + 1) >= 4 ? 'Busy' : 'Available'
        });
      }
    }

    this.addAuditLog('WORK_ORDER_CREATED', id, `Dispatched work order to ${woData.technicianName}`);
    return newWo;
  }

  updateWorkOrderChecklist(workOrderId, taskIndex, isCompleted) {
    const wo = this.getWorkOrder(workOrderId);
    if (!wo) return null;
    const checkList = [...wo.checkList];
    if (checkList[taskIndex]) {
      checkList[taskIndex].completed = isCompleted;
    }
    const allDone = checkList.every(t => t.completed);
    const patch = { checkList };
    if (allDone && wo.status !== 'Completed') {
      patch.status = 'Completed';
      patch.completedAt = new Date().toISOString();
      // Also resolve parent incident if present
      if (wo.incidentId) {
        this.transitionIncidentState(wo.incidentId, 'Resolved', 'All work order tasks verified complete.');
      }
    }
    const updated = this.updateById('WORK_ORDERS', workOrderId, patch);
    this.addAuditLog('WORK_ORDER_PROGRESS', workOrderId, `Task ${taskIndex + 1} marked ${isCompleted ? 'Complete' : 'Pending'}`);
    return updated;
  }

  // --- INVENTORY MANAGEMENT & RESERVATION SAFETY ---
  getInventory() {
    return this.getAll('INVENTORY');
  }

  getInventoryItem(id) {
    return this.getById('INVENTORY', id);
  }

  reserveInventory(itemId, quantity = 1) {
    const item = this.getInventoryItem(itemId);
    if (!item) throw new Error(`Inventory item ${itemId} not found.`);

    if (item.availableQuantity < quantity) {
      throw new Error(`Insufficient stock for ${item.name}. Available: ${item.availableQuantity}, Requested: ${quantity}`);
    }

    const newReserved = item.reservedQuantity + quantity;
    const newAvailable = item.quantityOnHand - newReserved;
    const newStatus = newAvailable === 0 ? 'low_stock' : item.status;

    const updated = this.updateById('INVENTORY', itemId, {
      reservedQuantity: newReserved,
      availableQuantity: newAvailable,
      status: newStatus
    });

    this.addAuditLog('INVENTORY_RESERVED', itemId, `Reserved ${quantity} units of ${item.name}. Remaining available: ${newAvailable}`);
    return updated;
  }

  releaseInventory(itemId, quantity = 1) {
    const item = this.getInventoryItem(itemId);
    if (!item) return null;

    const newReserved = Math.max(0, item.reservedQuantity - quantity);
    const newAvailable = item.quantityOnHand - newReserved;

    const updated = this.updateById('INVENTORY', itemId, {
      reservedQuantity: newReserved,
      availableQuantity: newAvailable
    });

    this.addAuditLog('INVENTORY_RELEASED', itemId, `Released ${quantity} reserved units of ${item.name}.`);
    return updated;
  }

  consumeInventory(itemId, quantity = 1) {
    const item = this.getInventoryItem(itemId);
    if (!item) return null;

    const newOnHand = Math.max(0, item.quantityOnHand - quantity);
    const newReserved = Math.max(0, item.reservedQuantity - quantity);
    const newAvailable = newOnHand - newReserved;
    const newStatus = newOnHand === 0 ? 'out_of_stock' : newAvailable <= item.minimumThreshold ? 'low_stock' : 'adequate';

    const updated = this.updateById('INVENTORY', itemId, {
      quantityOnHand: newOnHand,
      reservedQuantity: newReserved,
      availableQuantity: newAvailable,
      status: newStatus
    });

    this.addAuditLog('INVENTORY_CONSUMED', itemId, `Consumed ${quantity} units of ${item.name} for completed maintenance.`);
    return updated;
  }

  // --- PURCHASE REQUESTS & SEPARATION OF DUTIES ---
  getPurchaseRequests() {
    return this.getAll('PURCHASE_REQUESTS');
  }

  createPurchaseRequest(prData) {
    const id = `PR-${new Date().getFullYear()}-${Math.floor(400 + Math.random() * 500)}`;
    const user = this.currentUser || { id: 'USR-ADMIN-01', name: 'Facilities Admin', role: 'Facilities Administrator' };

    const newPr = {
      id,
      code: id,
      title: prData.title,
      requestedBy: user.id,
      requesterName: user.name,
      requesterRole: user.role,
      items: prData.items || [],
      totalAmountINR: prData.totalAmountINR || 0,
      status: 'Pending Approval',
      urgency: prData.urgency || 'High',
      justification: prData.justification || '',
      raisedAt: new Date().toISOString(),
      approverRoleRequired: 'Procurement Approver',
      approvedBy: null,
      approvalTimestamp: null,
      approvalNotes: ''
    };

    this.add('PURCHASE_REQUESTS', newPr);
    this.addAuditLog('PURCHASE_REQUEST_RAISED', id, `Raised PR for ₹${newPr.totalAmountINR.toLocaleString('en-IN')}: ${newPr.title}`);
    this.addNotification(`Purchase Request: ${id}`, `${newPr.title} raised by ${newPr.requesterName} awaiting approval.`, 'info');
    return newPr;
  }

  approvePurchaseRequest(prId, notes = '') {
    const pr = this.getById('PURCHASE_REQUESTS', prId);
    if (!pr) throw new Error(`Purchase Request ${prId} not found.`);

    if (pr.status !== 'Pending Approval') {
      throw new Error(`Cannot approve PR in state "${pr.status}".`);
    }

    const user = this.currentUser;
    if (!user) throw new Error('Authentication required.');

    // STRICT SEPARATION OF DUTIES ENFORCEMENT
    if (user.id === pr.requestedBy) {
      throw new Error(`Separation of Duties Violation: Requester (${user.name}) cannot approve their own purchase requisition.`);
    }

    if (!this.hasPermission('APPROVE_PURCHASE_REQUESTS')) {
      throw new Error(`Unauthorized: User role "${user.role}" does not have procurement approval authority.`);
    }

    const updated = this.updateById('PURCHASE_REQUESTS', prId, {
      status: 'Approved',
      approvedBy: user.name,
      approvalTimestamp: new Date().toISOString(),
      approvalNotes: notes
    });

    // Auto-restock items
    pr.items.forEach(item => {
      const invItem = this.getInventoryItem(item.partId);
      if (invItem) {
        const newOnHand = invItem.quantityOnHand + item.quantity;
        const newAvailable = newOnHand - invItem.reservedQuantity;
        this.updateById('INVENTORY', item.partId, {
          quantityOnHand: newOnHand,
          availableQuantity: newAvailable,
          status: 'adequate'
        });
      }
    });

    this.addAuditLog('PURCHASE_APPROVED', prId, `Approved by ${user.name}. Cost: ₹${pr.totalAmountINR.toLocaleString('en-IN')}. Items added to inventory.`);
    this.addNotification(`PR ${prId} Approved`, `PO generated and inventory restocked for ${pr.title}.`, 'success');
    return updated;
  }

  rejectPurchaseRequest(prId, reason = '') {
    const pr = this.getById('PURCHASE_REQUESTS', prId);
    if (!pr) throw new Error(`Purchase Request ${prId} not found.`);

    const user = this.currentUser;
    if (!this.hasPermission('REJECT_PURCHASE_REQUESTS')) {
      throw new Error(`Unauthorized: User role "${user.role}" cannot reject purchase requisitions.`);
    }

    const updated = this.updateById('PURCHASE_REQUESTS', prId, {
      status: 'Rejected',
      approvedBy: user.name,
      approvalTimestamp: new Date().toISOString(),
      approvalNotes: reason
    });

    this.addAuditLog('PURCHASE_REJECTED', prId, `Rejected by ${user.name}. Reason: ${reason}`);
    return updated;
  }

  // --- BOOKINGS & SPACE SCHEDULING ---
  getBookings() {
    return this.getAll('BOOKINGS');
  }

  createBooking(bookingData) {
    // BACKEND CONFLICT AND DOUBLE-BOOKING CHECK
    const existing = this.getBookings().filter(b =>
      b.roomId === bookingData.roomId &&
      b.date === bookingData.date &&
      b.status !== 'Cancelled'
    );

    const hasOverlap = existing.some(b => {
      return (bookingData.startTime < b.endTime && bookingData.endTime > b.startTime);
    });

    if (hasOverlap) {
      throw new Error(`Double Booking Prevention: Room ${bookingData.roomId} is already booked on ${bookingData.date} between overlapping hours.`);
    }

    // Room maintenance check
    const room = this.getRoom(bookingData.roomId);
    let conflictFlag = false;
    let status = 'Confirmed';

    if (room && room.status === 'red') {
      conflictFlag = true;
      status = 'At Risk (Classroom In Maintenance)';
    }

    const id = `BKG-${new Date().getFullYear()}-${Math.floor(500 + Math.random() * 500)}`;
    const newBooking = {
      id,
      ...bookingData,
      status,
      conflictFlag,
      createdAt: new Date().toISOString()
    };

    this.add('BOOKINGS', newBooking);
    this.addAuditLog('BOOKING_CREATED', id, `Booked Room ${bookingData.roomId} for ${bookingData.title} on ${bookingData.date}`);
    return newBooking;
  }

  cancelBooking(bookingId) {
    const updated = this.updateById('BOOKINGS', bookingId, { status: 'Cancelled' });
    this.addAuditLog('BOOKING_CANCELLED', bookingId, 'Cancelled room booking reservation.');
    return updated;
  }

  // --- SIMULATION & DISRUPTIONS ---
  executeDisruption(scenarioId) {
    if (scenarioId === 'SCENARIO-1') {
      // Classroom Unavailable Before University Exam
      const incident = this.createIncident({
        title: 'Projector Lamp Failure in Examination Classroom E-204',
        category: 'Audiovisual / Presentation',
        urgency: 'Critical',
        priority: 'P1 - High Urgency',
        buildingId: 'b-main',
        floorId: 'fl-main-2',
        roomId: 'E-204',
        assetId: 'AST-PRJ-204',
        affectedActivity: 'Anna University End-Semester Examination Scheduled Tomorrow at 09:00 AM (70 Candidates)',
        requiredPartId: 'INV-PRJ-LMP88',
        partQuantity: 1,
        summary: 'Emergency projection failure in examination hall E-204.',
        impactAnalysis: '70 students cannot sit for exam without question projection. Recommending immediate relocation to E-208.'
      });

      // Reserve the part safely
      try {
        this.reserveInventory('INV-PRJ-LMP88', 1);
      } catch (e) {
        console.warn(e);
      }

      // Dispatch Work Order
      this.createWorkOrder({
        incidentId: incident.id,
        title: 'Replace Lamp Module in E-204',
        assignedTechnicianId: 'TECH-AV-01',
        technicianName: 'M. Suresh',
        priority: 'Critical',
        buildingId: 'b-main',
        floorId: 'fl-main-2',
        roomId: 'E-204',
        partsRequired: [{ partId: 'INV-PRJ-LMP88', quantity: 1, reserved: true }]
      });

      this.addAuditLog('SIMULATION_EXECUTED', 'SCENARIO-1', 'Simulated exam classroom projector outage and automated fallback relocation to E-208.');
      return { success: true, scenarioId, message: 'Classroom crisis simulation executed. Room E-204 isolated, technician dispatched, part reserved.' };
    }

    if (scenarioId === 'SCENARIO-4') {
      // Pump seal blowout with 0 inventory
      const incident = this.createIncident({
        title: 'Secondary Impeller Mechanical Seal Blowout AST-PMP-01',
        category: 'Plumbing & Hydraulic',
        urgency: 'Critical',
        priority: 'P1 - High Urgency',
        buildingId: 'b-util',
        floorId: 'fl-util-0',
        roomId: 'SUB-001',
        assetId: 'AST-PMP-01',
        affectedActivity: 'Campus Overhead Tank Refilling System',
        requiredPartId: 'INV-PMP-SEAL',
        partQuantity: 1,
        summary: 'Water pump seal rupture. Zero units in stock. Work order blocked.',
        impactAnalysis: 'Campus water pressure drop in 18 hours if not resolved.'
      });

      // Work order blocked
      this.createWorkOrder({
        incidentId: incident.id,
        title: 'Emergency Seal Overhaul on Pump AST-PMP-01',
        assignedTechnicianId: 'TECH-PL-01',
        technicianName: 'K. Raman',
        status: 'Blocked (Awaiting Procurement)',
        priority: 'Critical',
        buildingId: 'b-util',
        floorId: 'fl-util-0',
        roomId: 'SUB-001',
        partsRequired: [{ partId: 'INV-PMP-SEAL', quantity: 1, reserved: false }],
        notes: 'BLOCKED: Stock is 0. Emergency PR raised.'
      });

      // Auto-raise PR
      this.createPurchaseRequest({
        title: 'Emergency Purchase: 3x Kirloskar 65mm Pump Seals',
        items: [{ partId: 'INV-PMP-SEAL', name: '65mm Silicon Carbide Seal', quantity: 3, unitCost: 3500, totalCost: 10500 }],
        totalAmountINR: 10500,
        urgency: 'Critical',
        justification: 'Campus main water pump seal blown. WO blocked awaiting stock.'
      });

      this.addAuditLog('SIMULATION_EXECUTED', 'SCENARIO-4', 'Simulated out-of-stock emergency pump breakdown. Work order blocked and PR generated.');
      return { success: true, scenarioId, message: 'Critical stockout simulation executed. Work order blocked, purchase approval workflow activated.' };
    }

    return { success: false, message: 'Scenario triggered.' };
  }

  // --- DATA EXPORT / IMPORT FOR AUDITING ---
  exportDatabaseJSON() {
    const exportData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        exportData[key] = JSON.parse(localStorage.getItem(key));
      }
    }
    return JSON.stringify(exportData, null, 2);
  }

  importDatabaseJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      Object.keys(data).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      });
      this.initDatabase();
      this.emitChange('*');
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  }
}

export const db = new DatabaseService();
