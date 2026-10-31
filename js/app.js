/**
 * TRINETRA - Master Application Controller
 * Coordinates 3D Scene, Operational Subsystems, Event Bus, Modals, and Role Switching.
 */

import { db } from './services/db.js';
import { incidentEngine } from './services/incident-engine.js';
import { workforceEngine } from './services/workforce-engine.js';
import { bookingEngine } from './services/booking-engine.js';
import { campusOps } from './services/campusops-engine.js';
import { CampusScene } from './3d/campus-scene.js';

import { DashboardController } from './ui/dashboard.js';
import { IncidentsViewController } from './ui/incidents-view.js';
import { WorkforceViewController } from './ui/workforce-view.js';
import { SpaceViewController } from './ui/space-view.js';
import { InventoryViewController } from './ui/inventory-view.js';
import { SimulatorViewController } from './ui/simulator-view.js';
import { CampusOpsViewController } from './ui/campusops-view.js';
import { RbacViewController } from './ui/rbac-view.js';

class TrinetraApp {
  constructor() {
    this.scene = null;
    this.controllers = {};
    this.activeTab = 'tab-3d-campus';
    this.selectedEntity = null;

    this.initApp();
  }

  initApp() {
    this.initClock();
    this.initRoleSwitcher();
    this.initNavigation();
    this.init3dScene();
    this.initSubsystemViews();
    this.initInspectorDrawer();

    // Auto-start CampusOps Demo Stream
    campusOps.startScan('demo');

    // Subscribe to notifications
    db.subscribe('NOTIFICATIONS', (notifs) => {
      const unread = notifs.filter(n => !n.read);
      if (unread.length > 0) {
        const latest = unread[0];
        this.showToast(latest.title, latest.message, latest.type);
      }
    });

    console.log('TRINETRA: Operational Brain & 3D Digital Twin Initialized.');
  }

  initClock() {
    const updateTime = () => {
      const el = document.getElementById('system-clock');
      if (el) {
        const now = new Date();
        el.textContent = `${now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • ${now.toLocaleTimeString('en-IN')}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  initRoleSwitcher() {
    const select = document.getElementById('role-select');
    if (!select) return;

    const users = db.getAll('USERS');
    select.innerHTML = users.map(u => `
      <option value="${u.id}" ${u.id === db.getCurrentUser()?.id ? 'selected' : ''}>
        ${u.name} (${u.role})
      </option>
    `).join('');

    select.addEventListener('change', (e) => {
      const user = db.setCurrentUser(e.target.value);
      this.showToast('Security Role Switched', `Active Profile: ${user.name} (${user.role})`, 'info');
    });
  }

  initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = tab.dataset.target;
        this.switchTab(targetTabId);
      });
    });
  }

  switchTab(tabId, targetBuildingId = null) {
    this.activeTab = tabId;

    // Update Tab Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === tabId);
    });

    // Update Panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    // If switching to 3D, trigger resize and optional building focus
    if (tabId === 'tab-3d-campus') {
      setTimeout(() => {
        if (this.scene) {
          this.scene.onWindowResize();
          if (targetBuildingId) {
            this.scene.selectBuilding(targetBuildingId);
          }
        }
      }, 50);
    }
  }

  init3dScene() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    this.scene = new CampusScene(container, (event) => {
      this.handleSceneSelection(event);
    });
  }

  initSubsystemViews() {
    const cCommand = document.getElementById('tab-command-center');
    if (cCommand) this.controllers.dashboard = new DashboardController(cCommand);

    const cIncidents = document.getElementById('tab-incidents');
    if (cIncidents) this.controllers.incidents = new IncidentsViewController(cIncidents);

    const cWorkforce = document.getElementById('tab-workforce');
    if (cWorkforce) this.controllers.workforce = new WorkforceViewController(cWorkforce);

    const cSpace = document.getElementById('tab-space');
    if (cSpace) this.controllers.space = new SpaceViewController(cSpace);

    const cInventory = document.getElementById('tab-inventory');
    if (cInventory) this.controllers.inventory = new InventoryViewController(cInventory);

    const cSimulator = document.getElementById('tab-simulator');
    if (cSimulator) this.controllers.simulator = new SimulatorViewController(cSimulator);

    const cCampusOps = document.getElementById('tab-campusops');
    if (cCampusOps) this.controllers.campusops = new CampusOpsViewController(cCampusOps);

    const cRbac = document.getElementById('tab-rbac');
    if (cRbac) this.controllers.rbac = new RbacViewController(cRbac);
  }

  initInspectorDrawer() {
    const closeBtn = document.getElementById('drawer-close-btn');
    const drawer = document.getElementById('inspector-drawer');
    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.add('closed');
      });
    }
  }

  // --- 3D INTERACTION & INSPECTOR DRAWER ---
  handleSceneSelection(event) {
    const drawer = document.getElementById('inspector-drawer');
    const titleEl = document.getElementById('inspector-title');
    const bodyEl = document.getElementById('inspector-body');

    if (!drawer || !titleEl || !bodyEl) return;

    if (event.type === 'building') {
      const b = event.building;
      titleEl.textContent = `${b.code} • ${b.name}`;

      const density = campusOps.getBuildingDensity(b.id);
      const rooms = db.getRoomsByBuilding(b.id);
      const activeInc = db.getIncidents().filter(i => i.buildingId === b.id && i.status !== 'Resolved');

      bodyEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="status-pill ${b.status}">${b.status.toUpperCase()}</span>
          <span style="font-size: 12px; font-weight: 700; color: var(--primary-blue);">Health: ${b.healthScore}%</span>
        </div>

        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
          ${b.description}
        </p>

        <!-- VERIFICATION AUDIT STAMP -->
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 10px; font-size: 11px;">
          <div style="font-weight: 700; color: var(--status-green);">✓ ${b.verifiedStatus || 'Verified Institutional Structure'}</div>
          <div style="color: var(--text-muted); font-size: 10px;">${b.verificationNote}</div>
        </div>

        <!-- STATS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div class="kpi-card" style="padding: 10px;">
            <div style="font-size: 10px; color: var(--text-muted);">Storeys</div>
            <div style="font-size: 18px; font-weight: 800;">${b.floorsCount} Floors</div>
          </div>
          <div class="kpi-card" style="padding: 10px;">
            <div style="font-size: 10px; color: var(--text-muted);">BLE Density</div>
            <div style="font-size: 18px; font-weight: 800; color: #0EA5E9;">${density.count} Signals</div>
          </div>
        </div>

        <!-- ACTIVE INCIDENTS -->
        <div>
          <div style="font-weight: 700; font-size: 12px; margin-bottom: 6px;">Active Maintenance:</div>
          ${activeInc.length > 0 ? activeInc.map(i => `
            <div style="border-left: 3px solid #DC2626; background: #FEE2E2; padding: 6px 10px; border-radius: 4px; font-size: 11px; margin-bottom: 4px;">
              <strong>${i.code}:</strong> ${i.title} (${i.urgency})
            </div>
          `).join('') : '<div style="font-size: 11px; color: var(--text-muted);">No open incidents. Systems nominal.</div>'}
        </div>

        <!-- ACTIONS -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <button class="btn-primary" onclick="window.trinetraApp.scene.toggleExplodedView(true)">
            🏗️ Exploded Floor Mode
          </button>
          <button class="btn-secondary" onclick="window.trinetraApp.scene.isolateFloor(2)">
            🔍 Isolate 2nd Floor (Exam Wing)
          </button>
          <button class="btn-secondary" onclick="window.trinetraApp.scene.buildClassroomInterior('E-204')">
            🚪 Enter Classroom E-204 (3D Interior)
          </button>
        </div>
      `;

      drawer.classList.remove('closed');
    }

    if (event.type === 'room') {
      const room = event.room;
      titleEl.textContent = `Room ${room.code} • ${room.name}`;

      bodyEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="status-pill ${room.status}">${room.status.toUpperCase()}</span>
          <span style="font-size: 12px; font-weight: 700;">Cap: ${room.capacity} Seats</span>
        </div>

        <div style="font-size: 12px; color: var(--text-muted);">
          <div><strong>Building:</strong> ${room.buildingId} (Floor ${room.floorNumber})</div>
          <div><strong>Department:</strong> ${room.department}</div>
          <div><strong>Availability:</strong> ${room.availability}</div>
          <div><strong>Last Serviced:</strong> ${room.lastMaintenanceDate}</div>
        </div>

        <!-- EQUIPMENT HEALTH GRID -->
        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; font-size: 11px;">
          <div style="font-weight: 700; color: var(--primary-blue); margin-bottom: 6px;">Monitored Equipment Diagnostics:</div>
          ${Object.entries(room.equipmentStatus || {}).map(([eq, status]) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="text-transform: capitalize; color: var(--text-muted);">${eq}:</span>
              <strong style="color: ${status.includes('Faulty') ? '#DC2626' : 'var(--status-green)'};">${status}</strong>
            </div>
          `).join('')}
        </div>

        <!-- ACTIONS -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <button class="btn-primary" onclick="window.trinetraApp.scene.buildClassroomInterior('${room.id}')">
            🚪 Step Inside 3D Classroom Interior
          </button>
          ${room.status === 'red' ? `
            <button class="btn-primary" style="background: var(--status-amber);" onclick="window.trinetraApp.openAlternativeRoomModal('${room.id}')">
              🔄 Find Alternate Available Room
            </button>
          ` : ''}
          <button class="btn-secondary" onclick="window.trinetraApp.prefillIncidentForm('${room.id}', '${room.buildingId}')">
            📝 Report Maintenance Issue Here
          </button>
        </div>
      `;

      drawer.classList.remove('closed');
    }

    if (event.type === 'asset') {
      const asset = db.getAsset(event.assetId);
      if (!asset) return;

      titleEl.textContent = `Asset • ${asset.name.split(' ')[0]} ${asset.code}`;

      bodyEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="status-pill ${asset.status === 'critical' ? 'red' : 'green'}">${asset.status.toUpperCase()}</span>
          <span style="font-size: 12px; font-weight: 700;">Health: ${asset.healthScore}%</span>
        </div>

        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
          <div><strong>Model:</strong> ${asset.name}</div>
          <div><strong>Serial No:</strong> <code>${asset.serialNumber}</code></div>
          <div><strong>Location:</strong> Room ${asset.roomId}</div>
          <div><strong>Category:</strong> ${asset.category}</div>
          <div><strong>Purchase Cost:</strong> ₹${asset.purchaseCostINR.toLocaleString('en-IN')}</div>
          <div><strong>Warranty Expiry:</strong> ${asset.warrantyExpiry}</div>
        </div>

        ${asset.faultDescription ? `
          <div style="background: #FEE2E2; border: 1px solid #FCA5A5; border-radius: var(--radius-sm); padding: 8px 10px; font-size: 11px; color: #991B1B;">
            <strong>Fault Diagnostic:</strong> ${asset.faultDescription}
            <div style="margin-top: 4px;"><strong>Required Spare:</strong> <code>${asset.requiredPartId}</code></div>
          </div>
        ` : ''}

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <button class="btn-primary" onclick="window.trinetraApp.openIncidentDetailsModal('INC-2026-101')">
            📋 View Active Work Order WO-2026-081
          </button>
          <button class="btn-secondary" onclick="window.trinetraApp.scene.returnToCampus()">
            🏛️ Return to Campus Overview
          </button>
        </div>
      `;

      drawer.classList.remove('closed');
    }
  }

  // --- 3D HUD CONTROLS ---
  setExplodedView(active) {
    if (this.scene) this.scene.toggleExplodedView(active);
  }

  isolateFloor(floorNum) {
    if (this.scene) this.scene.isolateFloor(floorNum);
  }

  showAllFloors() {
    if (this.scene) this.scene.showAllFloors();
  }

  returnToCampus() {
    if (this.scene) this.scene.returnToCampus();
    const drawer = document.getElementById('inspector-drawer');
    if (drawer) drawer.classList.add('closed');
  }

  inspectRoom(roomId) {
    if (this.scene) this.scene.buildClassroomInterior(roomId);
  }

  set3dViewMode(mode) {
    if (this.scene) this.scene.setViewMode(mode);
    document.querySelectorAll('.hud-view-modes .hud-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  // --- AI INCIDENT CHAT & SUBMISSION ---
  submitAiChatComplaint() {
    const input = document.getElementById('ai-chat-input');
    const card = document.getElementById('ai-extraction-card');
    if (!input || !card || !input.value.trim()) return;

    const text = input.value.trim();
    const parsed = incidentEngine.parseComplaint(text);
    const analysis = incidentEngine.generateExecutiveAnalysis(parsed);

    let html = `
      <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="font-size: 13px; font-weight: 700; color: var(--primary-blue-dark);">AI Entity Extraction Results</h4>
          <span class="status-pill ${parsed.extracted.urgency === 'Critical' ? 'red' : 'amber'}">${parsed.extracted.urgency}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 10px;">
          <div><strong>Category:</strong> ${parsed.extracted.category}</div>
          <div><strong>Location:</strong> ${parsed.extracted.roomName || parsed.extracted.roomId || 'Unspecified'} (${parsed.extracted.buildingName || 'Campus'})</div>
          <div><strong>Identified Asset:</strong> ${parsed.extracted.assetName || parsed.extracted.issueType || 'General'}</div>
          <div><strong>Affected Activity:</strong> ${parsed.extracted.affectedActivity}</div>
        </div>

        <!-- DUPLICATE DETECTION NOTICE -->
        ${parsed.duplicateDetected ? `
          <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 4px; padding: 8px 10px; font-size: 11px; color: #92400E; margin-bottom: 10px;">
            ⚠️ <strong>Duplicate Complaint Detected:</strong> Active ticket <code>${parsed.duplicateIncident.code}</code> already open for Room ${parsed.extracted.roomId}. Adding your observation as a correlated subscriber to prevent redundant work orders.
          </div>
        ` : ''}

        <!-- CLARIFICATION QUESTIONS IF INCOMPLETE -->
        ${parsed.clarificationQuestions.length > 0 ? `
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 4px; padding: 8px 10px; font-size: 11px; color: #1E40AF; margin-bottom: 10px;">
            ❓ <strong>Clarification Required:</strong>
            <ul style="padding-left: 14px; margin-top: 4px;">
              ${parsed.clarificationQuestions.map(q => `<li>${q}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- RECOMMENDATIONS -->
        <div style="font-size: 11px; margin-bottom: 12px;">
          <div style="font-weight: 700; color: var(--primary-blue);">Recommended AI Interventions:</div>
          <ul style="padding-left: 14px; color: var(--text-main);">
            ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn-primary" onclick="window.trinetraApp.commitAiIncident(${JSON.stringify(parsed.extracted).replace(/"/g, '&quot;')})">
            ✓ Commit Incident & Dispatch Work Order
          </button>
        </div>
      </div>
    `;

    card.innerHTML = html;
    card.style.display = 'block';
  }

  commitAiIncident(extracted) {
    const newInc = db.createIncident({
      title: `${extracted.category}: Issue in ${extracted.roomId || 'Facility'}`,
      category: extracted.category,
      urgency: extracted.urgency,
      priority: extracted.priority,
      buildingId: extracted.buildingId || 'b-main',
      floorId: extracted.floorId || 'fl-main-2',
      roomId: extracted.roomId || 'E-204',
      assetId: extracted.assetId,
      affectedActivity: extracted.affectedActivity,
      requiredPartId: extracted.category.includes('Audiovisual') ? 'INV-PRJ-LMP88' : null,
      summary: `Automated incident created via AI Natural Language Engine.`,
      impactAnalysis: extracted.affectedActivity
    });

    // Auto find technician
    const candidates = workforceEngine.findBestTechnician(newInc);
    if (candidates.length > 0) {
      const best = candidates[0].tech;
      db.createWorkOrder({
        incidentId: newInc.id,
        title: `Service ${newInc.category} in ${newInc.roomId}`,
        assignedTechnicianId: best.id,
        technicianName: best.name,
        priority: newInc.urgency,
        buildingId: newInc.buildingId,
        roomId: newInc.roomId
      });
      db.transitionIncidentState(newInc.id, 'Assigned', `Auto-assigned to ${best.name} (Score: ${candidates[0].totalScore})`);
    }

    this.showToast('Incident Committed', `Ticket ${newInc.code} opened and dispatched.`, 'success');
    document.getElementById('ai-chat-input').value = '';
    document.getElementById('ai-extraction-card').style.display = 'none';
  }

  submitWebForm(e) {
    e.preventDefault();
    const title = document.getElementById('form-title').value;
    const category = document.getElementById('form-category').value;
    const buildingId = document.getElementById('form-building').value;
    const roomId = document.getElementById('form-room').value;
    const urgency = document.getElementById('form-urgency').value;
    const activity = document.getElementById('form-activity').value;
    const details = document.getElementById('form-details').value;

    const inc = db.createIncident({
      title,
      category,
      urgency,
      buildingId,
      roomId,
      affectedActivity: activity,
      summary: details
    });

    this.showToast('Report Submitted', `Incident ${inc.code} logged.`, 'success');
    e.target.reset();
  }

  setIncidentChannel(channel) {
    ['ai-chat', 'web-form', 'email-inbox'].forEach(c => {
      const pane = document.getElementById(`channel-pane-${c}`);
      const btn = document.getElementById(`tab-btn-${c}`);
      if (pane) pane.style.display = c === channel ? 'block' : 'none';
      if (btn) btn.classList.toggle('active', c === channel);
    });
  }

  ingestEmailAsIncident(emailId) {
    const email = db.getAll('EMAILS').find(e => e.id === emailId);
    if (!email) return;

    this.commitAiIncident({
      category: 'Audiovisual / Presentation',
      buildingId: 'b-main',
      roomId: 'E-204',
      urgency: 'Critical',
      priority: 'P1 - High Urgency',
      affectedActivity: email.extractedEntities.affectedActivity,
      issueType: email.extractedEntities.issueType
    });
  }

  // --- STATE TRANSITIONS ---
  advanceIncidentState(incidentId, targetState) {
    try {
      db.transitionIncidentState(incidentId, targetState, 'Manual state transition by user.');
      this.showToast('Workflow Updated', `Incident moved to ${targetState}.`, 'success');
    } catch (e) {
      alert(e.message);
    }
  }

  toggleWorkOrderTask(woId, taskIndex, isDone) {
    db.updateWorkOrderChecklist(woId, taskIndex, isDone);
  }

  // --- SPACE & ALTERNATIVE ROOM RECOMMENDATION ---
  openAlternativeRoomModal(roomId) {
    const alternatives = bookingEngine.recommendAlternativeRooms(roomId, 70);

    let content = `
      <div style="padding: 16px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-blue-dark); margin-bottom: 8px;">
          🔄 Alternative Classroom Recommendations for ${roomId}
        </h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
          Ranked by capacity matching, AV equipment readiness, proximity, and confirmed zero booking conflicts.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${alternatives.map((alt, idx) => `
            <div style="border: 2px solid ${idx === 0 ? 'var(--primary-blue)' : 'var(--border-color)'}; border-radius: var(--radius-sm); padding: 12px; background: ${idx === 0 ? 'var(--primary-blue-light)' : '#FFFFFF'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-weight: 700; font-size: 14px; color: var(--primary-blue-dark);">
                  ${idx === 0 ? '⭐ Top Recommended: ' : ''}Room ${alt.room.code} - ${alt.room.name}
                </div>
                <span class="status-pill green">Score: ${alt.score}/100</span>
              </div>

              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
                ${alt.reasons.map(r => `<div>• ${r}</div>`).join('')}
              </div>

              <button class="btn-primary" style="font-size: 11px; padding: 6px 12px;" onclick="window.trinetraApp.executeExamRelocation('BKG-2026-501', '${alt.room.id}')">
                ✓ Authorize Relocation to ${alt.room.code}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.showModal(content);
  }

  executeExamRelocation(bookingId, targetRoomId) {
    try {
      bookingEngine.relocateBooking(bookingId, targetRoomId);
      this.closeModal();
      this.showToast('Classroom Relocated', `Relocated exam to Room ${targetRoomId}.`, 'success');
      this.switchTab('tab-space');
    } catch (e) {
      alert(e.message);
    }
  }

  cancelBooking(bookingId) {
    if (confirm('Cancel this room reservation?')) {
      db.cancelBooking(bookingId);
      this.showToast('Booking Cancelled', 'Reservation removed.', 'info');
    }
  }

  // --- INVENTORY & PURCHASE REQUISITIONS ---
  approvePr(prId) {
    try {
      db.approvePurchaseRequest(prId, 'Authorized under emergency maintenance authority.');
      this.showToast('Purchase Approved', `PR ${prId} approved and stock replenished.`, 'success');
    } catch (e) {
      alert(e.message);
    }
  }

  rejectPr(prId) {
    const reason = prompt('Enter rejection justification:');
    if (reason) {
      db.rejectPurchaseRequest(prId, reason);
      this.showToast('Purchase Rejected', `PR ${prId} rejected.`, 'info');
    }
  }

  // --- CINEMATIC 3D SIMULATION DEMONSTRATION ENGINE ---
  executeSimulationScenario(scenarioId) {
    // 1. Execute transactional database disruption
    const res = db.executeDisruption(scenarioId);

    // 2. Switch directly to 3D Digital Twin View
    this.switchTab('tab-3d-campus');

    // 3. Launch live cinematic 3D demonstration
    setTimeout(() => {
      this.startCinematicDemonstration(scenarioId);
    }, 200);

    this.showToast('3D Crisis Demonstration Started', `Live demonstration running in 3D Digital Twin.`, 'warning');
  }

  startCinematicDemonstration(scenarioId) {
    if (!this.scene) return;

    // Clear any existing simulation effects & timers
    if (this.simTimer) clearTimeout(this.simTimer);
    this.scene.clearCrisisEffects();
    this.currentSimScenarioId = scenarioId;

    if (scenarioId === 'SCENARIO-1') {
      this.demonstrateScenario1();
    } else if (scenarioId === 'SCENARIO-2') {
      this.demonstrateScenario2();
    } else if (scenarioId === 'SCENARIO-3') {
      this.demonstrateScenario3();
    } else if (scenarioId === 'SCENARIO-4') {
      this.demonstrateScenario4();
    } else if (scenarioId === 'SCENARIO-5') {
      this.demonstrateScenario5();
    } else if (scenarioId === 'SCENARIO-6') {
      this.demonstrateScenario6();
    }
  }

  // SCENARIO 1: CLASSROOM E-204 EXAMINATION PROJECTOR CRISIS & RELOCATION
  demonstrateScenario1() {
    // PHASE 1: Alarm Detection & Focus on Main Block (0s - 3.5s)
    this.scene.returnToCampus();
    this.scene.addCrisisBeacon(0, 16, 0, 0xEF4444, 'ROOM E-204 EXAM CRISIS');

    this.renderSimHud({
      badge: '🚨 CRITICAL OPERATIONAL ALARM',
      title: 'Crisis 1: Examination Classroom E-204 Projector Failure',
      stepNum: 1,
      totalSteps: 4,
      narration: 'ALARM DETECTED: Projector lamp blown in Classroom E-204! 70 candidates scheduled for Anna University Examination tomorrow at 09:00 AM.',
      actions: [
        { label: '⏩ Explode & Isolate 2F', onclick: 'window.trinetraApp.demonstrateScenario1Phase2()' },
        { label: '🚪 Step Inside Room E-204', onclick: 'window.trinetraApp.demonstrateScenario1Phase3()' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });

    // Camera zooms smoothly to Main Academic Block
    this.scene.flyCameraTo(new THREE.Vector3(35, 45, 65), new THREE.Vector3(0, 10, 0), 2000);

    // Auto advance to Phase 2 after 3.5s
    this.simTimer = setTimeout(() => {
      this.demonstrateScenario1Phase2();
    }, 3800);
  }

  demonstrateScenario1Phase2() {
    if (this.simTimer) clearTimeout(this.simTimer);

    // PHASE 2: Explode Floor Layers & Isolate Floor 2
    this.scene.selectBuilding('b-main');
    this.scene.toggleExplodedView(true);

    this.renderSimHud({
      badge: '🏗️ 3D ARCHITECTURAL DECONSTRUCTION',
      title: 'Deconstructing Main Academic Block • Isolating Floor 2',
      stepNum: 2,
      totalSteps: 4,
      narration: 'Vertical floor separation activated. Isolating 2nd Floor (Examination Hall Wing). Room E-204 identified as compromised.',
      actions: [
        { label: '🔍 Isolate 2nd Floor Only', onclick: 'window.trinetraApp.scene.isolateFloor(2)' },
        { label: '🚪 Step Inside E-204 3D Interior', onclick: 'window.trinetraApp.demonstrateScenario1Phase3()' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });

    // Isolate Floor 2 after slight delay
    setTimeout(() => {
      this.scene.isolateFloor(2);
      this.scene.addCrisisBeacon(0, 12, 0, 0xEF4444, 'E-204 BLOCKED');
    }, 1200);

    // Auto advance to Phase 3 after 4.5s
    this.simTimer = setTimeout(() => {
      this.demonstrateScenario1Phase3();
    }, 4500);
  }

  demonstrateScenario1Phase3() {
    if (this.simTimer) clearTimeout(this.simTimer);

    // PHASE 3: Enter 3D Classroom E-204 Interior
    this.scene.buildClassroomInterior('E-204');

    this.renderSimHud({
      badge: '🚪 3D CLASSROOM INTERIOR INSPECTION',
      title: 'Inside Examination Hall E-204 • Projector Blinking Red',
      stepNum: 3,
      totalSteps: 4,
      narration: 'Inspecting Classroom E-204 interior: Ceiling Projector AST-PRJ-204 bulb blackened. Dual Daikin ACs online. 70 desks compromised!',
      actions: [
        { label: '🧠 Run AI Space Relocation', onclick: 'window.trinetraApp.demonstrateScenario1Phase4()' },
        { label: '🏛️ Return to Campus View', onclick: 'window.trinetraApp.scene.returnToCampus()' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });

    // Auto advance to Phase 4
    this.simTimer = setTimeout(() => {
      this.demonstrateScenario1Phase4();
    }, 5500);
  }

  demonstrateScenario1Phase4() {
    if (this.simTimer) clearTimeout(this.simTimer);

    // PHASE 4: AI Relocation to Room E-208 & Tech Dispatch
    this.renderSimHud({
      badge: '✨ AI AUTONOMOUS RESOLUTION',
      title: 'Alternative Classroom E-208 Validated • 1-Click Relocation',
      stepNum: 4,
      totalSteps: 4,
      narration: 'AI Space Engine evaluated 18 halls: Room E-208 (Interactive Multimedia Hall, 75 seats, same floor, AV verified) confirmed! Technician M. Suresh dispatched with lamp INV-PRJ-LMP88.',
      actions: [
        { label: '⚡ 1-Click Relocate Exam to Room E-208', onclick: 'window.trinetraApp.executeExamRelocation("BKG-2026-501", "E-208"); window.trinetraApp.scene.buildClassroomInterior("E-208");' },
        { label: '✓ Resolve Projector Ticket & Finish', onclick: 'window.trinetraApp.advanceIncidentState("INC-2026-101", "Resolved"); window.trinetraApp.stopCinematicDemonstration();' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });
  }

  // SCENARIO 2: TECHNICIAN SUDDENLY UNAVAILABLE
  demonstrateScenario2() {
    this.scene.returnToCampus();
    this.scene.flyCameraTo(new THREE.Vector3(25, 30, 110), new THREE.Vector3(0, 3, 75), 2000);
    this.scene.addCrisisBeacon(0, 6, 75, 0xF59E0B, 'SUBSTATION: TECH SICK');

    this.renderSimHud({
      badge: '👨‍🔧 WORKFORCE SHIFT DISRUPTION',
      title: 'Crisis 2: Senior Electrician R. Karthik Unavailable',
      stepNum: 1,
      totalSteps: 2,
      narration: 'Senior Electrician reported medical emergency midway through shift. 2 active high-voltage work orders in Central Substation at risk!',
      actions: [
        { label: '⚡ Execute AI Workload Rebalance', onclick: 'window.trinetraApp.simulateTechUnavailable(); window.trinetraApp.demonstrateScenario2Phase2();' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });

    this.simTimer = setTimeout(() => {
      this.simulateTechUnavailable();
      this.demonstrateScenario2Phase2();
    }, 4000);
  }

  demonstrateScenario2Phase2() {
    this.renderSimHud({
      badge: '✓ WORKFORCE BALANCED',
      title: 'Substation Work Orders Auto-Reassigned to M. Suresh',
      stepNum: 2,
      totalSteps: 2,
      narration: 'Workforce Engine analyzed multi-skill matrix: M. Suresh (UPS & Switchgear Certified) auto-assigned. Substation operations secured with zero delay.',
      actions: [
        { label: '📊 View Workforce Roster', onclick: 'window.trinetraApp.switchTab("tab-workforce")' },
        { label: '✓ Complete Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });
  }

  // SCENARIO 3: FIBER LINK TRUNK SEVERED
  demonstrateScenario3() {
    this.scene.returnToCampus();
    this.scene.flyCameraTo(new THREE.Vector3(-45, 75, 55), new THREE.Vector3(-30, 0, 0), 2000);

    // Add severed 3D network lines between Main Block and CS Block
    this.scene.addNetworkTrunk(new THREE.Vector3(0, 2, 0), new THREE.Vector3(-65, 2, -10), 0xDC2626, true);
    this.scene.addCrisisBeacon(-65, 16, -10, 0xEF4444, 'FIBER TRUNK CUT');

    this.renderSimHud({
      badge: '🌐 NETWORK INFRASTRUCTURE CRISIS',
      title: 'Crisis 3: Cisco Core Optical Trunk Severed (CS Block)',
      stepNum: 1,
      totalSteps: 2,
      narration: 'Underground conduit severed during landscaping! Primary 10G fiber to CS & IT Academic Block down. 38 labs and 1,450 users affected.',
      actions: [
        { label: '⚡ Activate OSPF Backup Ring', onclick: 'window.trinetraApp.demonstrateScenario3Phase2()' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });

    this.simTimer = setTimeout(() => {
      this.demonstrateScenario3Phase2();
    }, 4500);
  }

  demonstrateScenario3Phase2() {
    // Add backup link through Electronics Block
    this.scene.addNetworkTrunk(new THREE.Vector3(0, 2, 0), new THREE.Vector3(65, 2, -10), 0x0EA5E9, false);
    this.scene.addNetworkTrunk(new THREE.Vector3(65, 2, -10), new THREE.Vector3(-65, 2, -10), 0x0EA5E9, false);

    this.renderSimHud({
      badge: '✓ REDUNDANT RING RESTORED',
      title: 'Secondary 10G Microwave / OSPF Ring Active via ECE Block',
      stepNum: 2,
      totalSteps: 2,
      narration: 'Auto-failover completed in 12 seconds! Traffic re-routed through Electronics Block ring. Network engineer dispatched with optical splicer.',
      actions: [
        { label: '✓ Complete Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });
  }

  // SCENARIO 4: PUMP SEAL OUT OF STOCK & WORK ORDER BLOCKED
  demonstrateScenario4() {
    this.scene.returnToCampus();
    this.scene.flyCameraTo(new THREE.Vector3(30, 25, 95), new THREE.Vector3(0, 2, 75), 2000);
    this.scene.addCrisisBeacon(0, 6, 75, 0xEF4444, 'PUMP SEAL BLOWOUT (STOCK: 0)');

    this.renderSimHud({
      badge: '🔩 SUPPLY CHAIN STOCKOUT',
      title: 'Crisis 4: Water Pump AST-PMP-01 Seal Failed • 0 In Stock',
      stepNum: 1,
      totalSteps: 2,
      narration: 'Central Water Pump leaking 1.5L/hr. Available stock: 0 units. Work Order WO-2026-082 is LOCKED & MARKED BLOCKED (Oversell Protection). Emergency PR-2026-402 raised.',
      actions: [
        { label: '⚖️ Approve PR as Procurement Approver', onclick: 'window.trinetraApp.approvePr("PR-2026-402"); window.trinetraApp.demonstrateScenario4Phase2();' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });
  }

  demonstrateScenario4Phase2() {
    this.renderSimHud({
      badge: '✓ PROCUREMENT APPROVED & UNBLOCKED',
      title: 'Kirloskar Pump Seals Restocked • WO-2026-082 Unblocked',
      stepNum: 2,
      totalSteps: 2,
      narration: 'Procurement Approver V. Jayaraman approved PR-2026-402 (₹10,500). Inventory updated. Work order unblocked and assigned to K. Raman.',
      actions: [
        { label: '📦 View Inventory Store', onclick: 'window.trinetraApp.switchTab("tab-inventory")' },
        { label: '✓ Complete Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });
  }

  // SCENARIO 5: CAMPUSOPS CROWD SURGE IN MECHANICAL BLOCK
  demonstrateScenario5() {
    this.scene.returnToCampus();
    this.scene.flyCameraTo(new THREE.Vector3(-40, 35, 75), new THREE.Vector3(-65, 6, 50), 2000);
    this.scene.addCrisisBeacon(-65, 12, 50, 0xF59E0B, 'BLE SURGE: 284 SIGNALS');

    // Trigger CampusOps burst
    campusOps.startScan('demo');

    this.renderSimHud({
      badge: '📡 CAMPUSOPS BLE ANOMALY',
      title: 'Crisis 5: Unexpected Density Spike in Mechanical Block',
      stepNum: 1,
      totalSteps: 2,
      narration: 'CampusOps BLE Gateways detect 284 anonymous active beacons (4.7x baseline threshold) during unscheduled symposium spillover into Workshop Concourse!',
      actions: [
        { label: '💨 Activate Industrial Ventilation & Egress', onclick: 'window.trinetraApp.demonstrateScenario5Phase2()' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });

    this.simTimer = setTimeout(() => {
      this.demonstrateScenario5Phase2();
    }, 4500);
  }

  demonstrateScenario5Phase2() {
    this.renderSimHud({
      badge: '✓ SAFETY INTERVENTIONS ACTIVE',
      title: 'Auxiliary Ventilation at 100% • Egress Doors Opened',
      stepNum: 2,
      totalSteps: 2,
      narration: 'Auxiliary fresh air extraction online. Campus security dispatched to redirect pedestrian overflow to Central Lawn. Air quality stabilized.',
      actions: [
        { label: '📡 View CampusOps Telemetry', onclick: 'window.trinetraApp.switchTab("tab-campusops")' },
        { label: '✓ Complete Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });
  }

  // SCENARIO 6: POWER GRID BLACKOUT & DG AUTO FAILOVER
  demonstrateScenario6() {
    this.scene.returnToCampus();
    this.scene.setPowerGridBlackout(true);
    this.scene.flyCameraTo(new THREE.Vector3(45, 55, 110), new THREE.Vector3(0, 5, 75), 1800);
    this.scene.addCrisisBeacon(0, 8, 75, 0xEF4444, 'TANGEDCO GRID BLACKOUT');

    this.renderSimHud({
      badge: '⚡ ELECTRICAL GRID BLACKOUT',
      title: 'Crisis 6: TANGEDCO 11kV Feeder Blackout',
      stepNum: 1,
      totalSteps: 2,
      narration: 'External 11kV grid supply lost! Campus entering emergency battery mode. Automatic Mains Failure (AMF) panel initiating twin 500kVA Cummins DG synchronization...',
      actions: [
        { label: '🔋 Verify DG Synchronization (8.4s)', onclick: 'window.trinetraApp.demonstrateScenario6Phase2()' },
        { label: '✕ Stop Demo', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });

    this.simTimer = setTimeout(() => {
      this.demonstrateScenario6Phase2();
    }, 3800);
  }

  demonstrateScenario6Phase2() {
    // Generators online, restore campus power with green conduits
    this.scene.setPowerGridBlackout(false);
    this.scene.addCrisisBeacon(0, 8, 75, 0x22C55E, '500kVA DG SETS ONLINE (8.4s)');

    // Add power distribution laser lines from substation to main block and CS block
    this.scene.addNetworkTrunk(new THREE.Vector3(0, 1, 75), new THREE.Vector3(0, 1, 0), 0x22C55E, false);
    this.scene.addNetworkTrunk(new THREE.Vector3(0, 1, 75), new THREE.Vector3(-65, 1, -10), 0x22C55E, false);
    this.scene.addNetworkTrunk(new THREE.Vector3(0, 1, 75), new THREE.Vector3(65, 1, -10), 0x22C55E, false);

    this.renderSimHud({
      badge: '✓ 100% POWER RESTORED',
      title: 'Cummins Twin 500kVA Generators Online in 8.4 Seconds',
      stepNum: 2,
      totalSteps: 2,
      narration: 'Seamless AMF transfer completed in 8.4s! UPS banks carried Server Room E-008 and Exam Halls with zero data loss. 36 hours of fuel reserves active.',
      actions: [
        { label: '✓ Finish Simulation & Restore', onclick: 'window.trinetraApp.stopCinematicDemonstration()' }
      ]
    });
  }

  // RENDER FLOATING 3D SIMULATION HUD
  renderSimHud(data) {
    let overlay = document.getElementById('sim-hud-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sim-hud-overlay';
      overlay.className = 'sim-hud-overlay';
      const container3d = document.getElementById('tab-3d-campus');
      if (container3d) container3d.appendChild(overlay);
    }

    const pct = Math.round((data.stepNum / data.totalSteps) * 100);

    overlay.innerHTML = `
      <div class="sim-hud-header">
        <span class="sim-hud-badge">${data.badge}</span>
        <div style="font-size: 11px; font-weight: 700; color: #38BDF8;">
          Phase ${data.stepNum} of ${data.totalSteps}
        </div>
      </div>

      <div class="sim-hud-title">${data.title}</div>

      <div class="sim-hud-narration">
        <span class="sim-hud-narration-icon">🎙️</span>
        <div>${data.narration}</div>
      </div>

      <div class="sim-step-bar-container">
        <span>Demonstration Progress</span>
        <div class="sim-step-progress-track">
          <div class="sim-step-progress-fill" style="width: ${pct}%;"></div>
        </div>
        <span>${pct}%</span>
      </div>

      <div class="sim-hud-actions">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${data.actions.map(act => `
            <button class="sim-btn-primary" onclick="${act.onclick}">
              ${act.label}
            </button>
          `).join('')}
        </div>
        <button class="sim-btn-secondary" onclick="window.trinetraApp.stopCinematicDemonstration()">
          ✕ Close HUD
        </button>
      </div>
    `;

    overlay.style.display = 'flex';
  }

  stopCinematicDemonstration() {
    if (this.simTimer) clearTimeout(this.simTimer);
    const overlay = document.getElementById('sim-hud-overlay');
    if (overlay) overlay.style.display = 'none';
    if (this.scene) {
      this.scene.clearCrisisEffects();
      this.scene.returnToCampus();
    }
    this.showToast('Demonstration Stopped', 'Restored 3D campus to standard overview.', 'info');
  }

  // --- INVENTORY & PURCHASE REQUISITIONS ---
    if (confirm('Reset TRINETRA database to initial baseline seed data?')) {
      db.resetToSeedData();
      this.showToast('Database Reset', 'Campus baseline data restored.', 'info');
      location.reload();
    }
  }

  simulateTechUnavailable() {
    const res = workforceEngine.reassignWorkload('TECH-EL-01', 'Medical Emergency');
    this.showToast('Workforce Rebalanced', `Reassigned ${res.reassignedCount} work orders from ${res.previousTechnician}.`, 'warning');
  }

  // --- CAMPUSOPS MOBILE SIGNALS ---
  toggleCampusOpsScan() {
    if (campusOps.isScanning) {
      campusOps.stopScan();
      this.showToast('BLE Scanner Stopped', 'Radio telemetry stream paused.', 'info');
    } else {
      campusOps.startScan('demo');
      this.showToast('BLE Scanner Started', 'Listening for anonymous radio beacon packets.', 'success');
    }
  }

  triggerLiveBluetoothHardware() {
    campusOps.startScan('live');
  }

  openIncidentDetailsModal(incidentId) {
    const inc = db.getIncident(incidentId);
    if (!inc) return;

    const wos = db.getWorkOrders().filter(w => w.incidentId === incidentId);
    const tech = db.getAll('TECHNICIANS').find(t => t.id === inc.assignedTechnicianId);

    const html = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span class="status-pill ${inc.urgency === 'Critical' ? 'red' : 'amber'}">${inc.urgency} Urgency</span>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-blue-dark); margin-top: 6px;">
              ${inc.code}: ${inc.title}
            </h3>
          </div>
          <span class="status-pill ${inc.status === 'Resolved' ? 'green' : 'amber'}">${inc.status}</span>
        </div>

        <div style="font-size: 12px; color: var(--text-main); margin-bottom: 14px; background: var(--bg-main); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div><strong>Location:</strong> Room ${inc.roomId || 'N/A'} (${inc.buildingId || 'Campus'})</div>
          <div><strong>Target Asset:</strong> <code>${inc.assetId || 'General Infrastructure'}</code></div>
          <div><strong>Reported By:</strong> ${inc.reportedBy} via ${inc.reportChannel}</div>
          <div><strong>Affected Function:</strong> ${inc.affectedActivity}</div>
          <div><strong>SLA Target:</strong> ${inc.slaTargetHours} hours (${inc.slaStatus})</div>
        </div>

        ${inc.aiRecommendations && inc.aiRecommendations.length > 0 ? `
          <div style="font-size: 11px; margin-bottom: 14px;">
            <div style="font-weight: 700; color: var(--primary-blue); margin-bottom: 4px;">🧠 AI Impact Diagnostic:</div>
            <ul style="padding-left: 14px; color: var(--text-main);">
              ${inc.aiRecommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- WORK ORDERS -->
        <div style="margin-bottom: 14px;">
          <div style="font-weight: 700; font-size: 12px; margin-bottom: 6px;">Associated Work Orders:</div>
          ${wos.length > 0 ? wos.map(w => `
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 12px;">
                <span>${w.code}: ${w.title}</span>
                <span class="status-pill ${w.status === 'Completed' ? 'green' : 'amber'}">${w.status}</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                Assigned: ${w.technicianName} | Scheduled: ${w.scheduledStart}
              </div>
            </div>
          `).join('') : '<div style="font-size: 11px; color: var(--text-muted);">No work order generated yet.</div>'}
        </div>

        <!-- ACTIONS -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <button class="btn-secondary" onclick="window.trinetraApp.closeModal()">Close</button>
          <div style="display: flex; gap: 8px;">
            ${inc.status !== 'Resolved' ? `
              <button class="btn-primary" style="background-color: var(--status-green);" onclick="window.trinetraApp.advanceIncidentState('${inc.id}', 'Resolved'); window.trinetraApp.closeModal();">
                ✓ Mark Incident Resolved & Close Ticket
              </button>
            ` : '<span style="color: var(--status-green); font-weight: 700;">Ticket Closed</span>'}
          </div>
        </div>
      </div>
    `;

    this.showModal(html);
  }

  openCreateWorkOrderModal() {
    const techs = db.getAll('TECHNICIANS');
    const rooms = db.getRooms();

    const html = `
      <div style="padding: 20px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-blue-dark); margin-bottom: 14px;">
          + Dispatch New Maintenance Work Order
        </h3>
        <form onsubmit="event.preventDefault(); window.trinetraApp.submitWorkOrderForm(this);">
          <div class="form-group">
            <label>Work Order Title</label>
            <input type="text" name="title" class="form-control" required placeholder="e.g. Inspect Substation Capacitor Bank">
          </div>
          <div class="form-group">
            <label>Target Facility / Room</label>
            <select name="roomId" class="form-control">
              ${rooms.map(r => `<option value="${r.id}">${r.code} - ${r.name} (${r.buildingId})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Assigned Specialist</label>
            <select name="technicianId" class="form-control" required>
              ${techs.map(t => `<option value="${t.id}">${t.name} (${t.department} - ${t.primarySkill})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select name="priority" class="form-control">
              <option value="Critical">Critical (Immediate Dispatch)</option>
              <option value="High" selected>High (Within Shift)</option>
              <option value="Medium">Medium (Routine)</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button type="button" class="btn-secondary" onclick="window.trinetraApp.closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Dispatch Work Order</button>
          </div>
        </form>
      </div>
    `;
    this.showModal(html);
  }

  submitWorkOrderForm(form) {
    const title = form.title.value;
    const roomId = form.roomId.value;
    const techId = form.technicianId.value;
    const priority = form.priority.value;
    const tech = db.getAll('TECHNICIANS').find(t => t.id === techId);
    const room = db.getRoom(roomId);

    db.createWorkOrder({
      title,
      roomId,
      buildingId: room ? room.buildingId : 'b-main',
      assignedTechnicianId: techId,
      technicianName: tech ? tech.name : 'Staff Specialist',
      priority
    });

    this.closeModal();
    this.showToast('Work Order Dispatched', `Dispatched to ${tech ? tech.name : 'Technician'}.`, 'success');
  }

  openCreateBookingModal() {
    const rooms = db.getRooms();

    const html = `
      <div style="padding: 20px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-blue-dark); margin-bottom: 14px;">
          + Reserve Classroom or Examination Space
        </h3>
        <form onsubmit="event.preventDefault(); window.trinetraApp.submitBookingForm(this);">
          <div class="form-group">
            <label>Event / Course Title</label>
            <input type="text" name="title" class="form-control" required placeholder="e.g. Data Structures Midterm Examination">
          </div>
          <div class="form-group">
            <label>Target Classroom</label>
            <select name="roomId" class="form-control" required>
              ${rooms.map(r => `<option value="${r.id}">${r.code} - ${r.name} (Cap: ${r.capacity}) [Status: ${r.status.toUpperCase()}]</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label>Date</label>
              <input type="date" name="date" class="form-control" required value="2026-10-31">
            </div>
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" name="startTime" class="form-control" required value="09:00">
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="time" name="endTime" class="form-control" required value="12:00">
            </div>
          </div>
          <div class="form-group">
            <label>Expected Candidates / Students</label>
            <input type="number" name="attendees" class="form-control" required value="60">
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button type="button" class="btn-secondary" onclick="window.trinetraApp.closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Reserve Space</button>
          </div>
        </form>
      </div>
    `;
    this.showModal(html);
  }

  submitBookingForm(form) {
    const title = form.title.value;
    const roomId = form.roomId.value;
    const date = form.date.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    const attendeesCount = parseInt(form.attendees.value, 10);
    const room = db.getRoom(roomId);

    try {
      db.createBooking({
        title,
        roomId,
        buildingId: room ? room.buildingId : 'b-main',
        floorId: room ? room.floorId : 'fl-main-2',
        date,
        startTime,
        endTime,
        attendeesCount,
        organizer: db.getCurrentUser() ? db.getCurrentUser().name : 'Academic Department'
      });

      this.closeModal();
      this.showToast('Room Reserved', `Booked Room ${roomId} for ${title}.`, 'success');
    } catch (e) {
      alert(`Booking Blocked by TRINETRA Conflict Engine:\n\n${e.message}`);
    }
  }

  openCreatePrModal() {
    const inv = db.getInventory();

    const html = `
      <div style="padding: 20px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-blue-dark); margin-bottom: 14px;">
          + Raise Emergency Spares Purchase Requisition
        </h3>
        <form onsubmit="event.preventDefault(); window.trinetraApp.submitPrForm(this);">
          <div class="form-group">
            <label>Requisition Title</label>
            <input type="text" name="title" class="form-control" required placeholder="e.g. Urgent Restock of Silicon Carbide Pump Seals">
          </div>
          <div class="form-group">
            <label>Target Inventory Part</label>
            <select name="partId" class="form-control" required onchange="window.trinetraApp.updatePrCostPreview(this)">
              ${inv.map(i => `<option value="${i.id}" data-cost="${i.unitCostINR}">${i.name} (Unit Cost: ₹${i.unitCostINR.toLocaleString('en-IN')})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Quantity Required</label>
            <input type="number" name="quantity" id="pr-modal-qty" class="form-control" required value="2" min="1" max="50">
          </div>
          <div class="form-group">
            <label>Justification / Operational Risk</label>
            <textarea name="justification" class="form-control" rows="2" required placeholder="Explain why stockout threatens academic or infrastructure continuity..."></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button type="button" class="btn-secondary" onclick="window.trinetraApp.closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Submit for Procurement Approval</button>
          </div>
        </form>
      </div>
    `;
    this.showModal(html);
  }

  submitPrForm(form) {
    const title = form.title.value;
    const partId = form.partId.value;
    const quantity = parseInt(form.quantity.value, 10);
    const justification = form.justification.value;

    const item = db.getInventoryItem(partId);
    const unitCost = item ? item.unitCostINR : 1000;
    const totalAmountINR = unitCost * quantity;

    db.createPurchaseRequest({
      title,
      items: [{ partId, name: item ? item.name : partId, quantity, unitCost, totalCost: totalAmountINR }],
      totalAmountINR,
      urgency: 'High',
      justification
    });

    this.closeModal();
    this.showToast('Requisition Raised', `Submitted PR for ₹${totalAmountINR.toLocaleString('en-IN')}. Awaiting Procurement Approver.`, 'info');
  }

  populateRoomsForBuilding(buildingId) {
    const roomSelect = document.getElementById('form-room');
    if (!roomSelect) return;
    const rooms = db.getRoomsByBuilding(buildingId);
    roomSelect.innerHTML = rooms.map(r => `<option value="${r.id}">${r.code} - ${r.name}</option>`).join('');
  }

  prefillIncidentForm(roomId, buildingId) {
    this.switchTab('tab-incidents');
    this.setIncidentChannel('web-form');
    setTimeout(() => {
      const bSel = document.getElementById('form-building');
      if (bSel) {
        bSel.value = buildingId;
        this.populateRoomsForBuilding(buildingId);
      }
      const rSel = document.getElementById('form-room');
      if (rSel) rSel.value = roomId;
    }, 50);
  }

  refreshEmailInbox() {
    this.showToast('Email Inbound Checked', '3 simulated messages synchronized with AI parser.', 'info');
  }

  // --- MODALS & TOAST NOTIFICATIONS ---
  showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 2px;">${title}</div>
      <div style="color: var(--text-muted); font-size: 12px;">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  showModal(htmlContent) {
    let overlay = document.getElementById('app-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'app-modal-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(15, 23, 42, 0.6)';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.zIndex = '9990';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div style="background: #FFFFFF; border-radius: var(--radius-lg); width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-hud); position: relative;">
        <button onclick="window.trinetraApp.closeModal()" style="position: absolute; top: 12px; right: 16px; border: none; background: transparent; font-size: 20px; cursor: pointer; color: var(--text-muted);">✕</button>
        ${htmlContent}
      </div>
    `;
    overlay.style.display = 'flex';
  }

  closeModal() {
    const overlay = document.getElementById('app-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  exportDatabase() {
    const json = db.exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trinetra-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    this.showToast('Audit Database Exported', 'Downloaded complete operational state.', 'success');
  }

  triggerImportDatabase() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          if (db.importDatabaseJSON(re.target.result)) {
            alert('Database successfully imported! Reloading...');
            location.reload();
          } else {
            alert('Invalid database JSON format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

// Instantiate Global App
window.addEventListener('DOMContentLoaded', () => {
  window.trinetraApp = new TrinetraApp();
});
