/**
 * TRINETRA - Command Center & Central Control Room UI Controller
 * Enterprise Dashboard: Unified KPIs, explainable AI operational recommendations,
 * SLA monitoring, and cross-subsystem telemetry.
 */

import { db } from '../services/db.js';
import { campusOps } from '../services/campusops-engine.js';

export class DashboardController {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    db.subscribe('*', () => this.updateDashboard());
    campusOps.subscribe(() => this.updateCampusOpsKpi());
  }

  render() {
    this.container.innerHTML = `
      <!-- AI OPERATIONAL INTELLIGENCE RECOMMENDATION BOX -->
      <div id="ai-insight-container"></div>

      <!-- ENTERPRISE KPI GRID -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-title">Campus Health Index</span>
          <div class="kpi-value" id="kpi-campus-health">88%</div>
          <div class="kpi-subtext"><span class="status-pill green">Normal</span> 9 Monitored Facilities</div>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Active Incidents</span>
          <div class="kpi-value" id="kpi-active-incidents" style="color: #DC2626;">2</div>
          <div class="kpi-subtext" id="kpi-incidents-subtext">1 Critical (Exam Risk) • 1 Medium</div>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Technician Readiness</span>
          <div class="kpi-value" id="kpi-tech-readiness">5 / 6</div>
          <div class="kpi-subtext">Avg Workload: 1.6 tickets/tech</div>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Classroom Availability</span>
          <div class="kpi-value" id="kpi-classroom-avail">92%</div>
          <div class="kpi-subtext">1 Blocked (E-204) • 12 Active</div>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Equipment Uptime</span>
          <div class="kpi-value" id="kpi-equipment-uptime">97.4%</div>
          <div class="kpi-subtext">38 / 40 Critical Assets Online</div>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Inventory Shortages</span>
          <div class="kpi-value" id="kpi-inventory-shortage" style="color: #D97706;">2 Items</div>
          <div class="kpi-subtext">1 Stockout (Pump Seal) • 1 Low</div>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Pending Purchase Approvals</span>
          <div class="kpi-value" id="kpi-pending-pr">2 PRs</div>
          <div class="kpi-subtext">Total Value: ₹44,500 INR</div>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">CampusOps Active Signals</span>
          <div class="kpi-value" id="kpi-campusops-signals" style="color: #0EA5E9;">0</div>
          <div class="kpi-subtext">60s Window • 45 Gateways</div>
        </div>
      </div>

      <!-- ACTIVE INCIDENTS & WORK ORDER DISPATCH TABLE -->
      <div class="table-container">
        <div class="table-header-bar">
          <h3>⚡ Active Operational Incidents & Dispatch Pipeline</h3>
          <div>
            <span class="status-pill red">Live Incident Feed</span>
          </div>
        </div>
        <table class="enterprise-table">
          <thead>
            <tr>
              <th>Incident Code</th>
              <th>Category</th>
              <th>Location</th>
              <th>Target Asset</th>
              <th>Urgency / SLA</th>
              <th>Status</th>
              <th>Assigned Tech</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="dashboard-incidents-tbody">
            <!-- Rendered dynamically -->
          </tbody>
        </table>
      </div>

      <!-- INVENTORY ALERT & BLOCKED WORK ORDERS -->
      <div class="table-container">
        <div class="table-header-bar">
          <h3>📦 Critical Spares Shortage & Blocked Maintenance</h3>
          <span class="status-pill amber">Requires Procurement Authority</span>
        </div>
        <table class="enterprise-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Item Name</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Min Stock</th>
              <th>Cost (INR)</th>
              <th>Status</th>
              <th>Blocked Ticket</th>
            </tr>
          </thead>
          <tbody id="dashboard-inventory-tbody">
            <!-- Rendered dynamically -->
          </tbody>
        </table>
      </div>
    `;

    this.updateDashboard();
  }

  updateDashboard() {
    // 1. Calculate Persistent Metrics
    const incidents = db.getIncidents();
    const openIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed');
    const criticalCount = openIncidents.filter(i => i.urgency === 'Critical').length;

    const techs = db.getAll('TECHNICIANS');
    const availTechs = techs.filter(t => t.availability === 'Available' || t.availability === 'On-Call').length;

    const rooms = db.getRooms();
    const healthyRooms = rooms.filter(r => r.status === 'green').length;
    const roomAvailPct = Math.round((healthyRooms / rooms.length) * 100);

    const assets = db.getAssets();
    const healthyAssets = assets.filter(a => a.status === 'healthy').length;
    const uptimePct = ((healthyAssets / assets.length) * 100).toFixed(1);

    const inventory = db.getInventory();
    const shortageItems = inventory.filter(i => i.quantityOnHand <= i.minimumThreshold);

    const prs = db.getPurchaseRequests().filter(pr => pr.status === 'Pending Approval');
    const prTotalCost = prs.reduce((sum, pr) => sum + pr.totalAmountINR, 0);

    // Update KPI Elements
    const kpiIncidents = document.getElementById('kpi-active-incidents');
    const kpiIncidentsSub = document.getElementById('kpi-incidents-subtext');
    if (kpiIncidents) kpiIncidents.textContent = openIncidents.length;
    if (kpiIncidentsSub) kpiIncidentsSub.textContent = `${criticalCount} Critical • ${openIncidents.length - criticalCount} Moderate`;

    const kpiTech = document.getElementById('kpi-tech-readiness');
    if (kpiTech) kpiTech.textContent = `${availTechs} / ${techs.length}`;

    const kpiRoom = document.getElementById('kpi-classroom-avail');
    if (kpiRoom) kpiRoom.textContent = `${roomAvailPct}%`;

    const kpiUptime = document.getElementById('kpi-equipment-uptime');
    if (kpiUptime) kpiUptime.textContent = `${uptimePct}%`;

    const kpiInv = document.getElementById('kpi-inventory-shortage');
    if (kpiInv) kpiInv.textContent = `${shortageItems.length} Items`;

    const kpiPr = document.getElementById('kpi-pending-pr');
    if (kpiPr) kpiPr.textContent = `${prs.length} PRs`;

    // 2. Generate Explainable AI Operational Intelligence Recommendation
    const aiInsightContainer = document.getElementById('ai-insight-container');
    if (aiInsightContainer) {
      if (criticalCount > 0) {
        aiInsightContainer.innerHTML = `
          <div class="ai-insight-banner">
            <div class="ai-insight-icon">🧠</div>
            <div class="ai-insight-content">
              <h4>Explainable AI Operational Recommendation: High-Priority Incident in Progress</h4>
              <p>
                <strong>Critical Issue Detected:</strong> Projector lamp burnout in Classroom E-204 (Main Academic Block) threatens the Anna University Examination scheduled tomorrow at 09:00 AM (70 candidates).
                Work order WO-2026-081 is active with 1x Epson ELPLP88 lamp reserved from Bin AV-04.
                Alternative Classroom E-208 has been pre-validated (75 seats, AV verified, no schedule conflict).
              </p>
              <div style="display: flex; gap: 10px; margin-top: 8px;">
                <button class="ai-action-btn" onclick="window.trinetraApp.openAlternativeRoomModal('E-204')">
                  👉 Inspect Alternative Room E-208
                </button>
                <button class="ai-action-btn" style="background: var(--secondary-teal);" onclick="window.trinetraApp.switchTab('tab-3d-campus', 'b-main')">
                  🏛️ View Room E-204 in 3D Twin
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        aiInsightContainer.innerHTML = `
          <div class="ai-insight-banner">
            <div class="ai-insight-icon">✨</div>
            <div class="ai-insight-content">
              <h4>Explainable AI Intelligence: Campus Infrastructure Steady</h4>
              <p>All core electrical, HVAC, and network distribution grids across SRM Easwari Engineering College are operating within standard parameters. Routine preventive maintenance cycles are on schedule.</p>
            </div>
          </div>
        `;
      }
    }

    // 3. Render Incidents Table
    const tbody = document.getElementById('dashboard-incidents-tbody');
    if (tbody) {
      if (openIncidents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No active incidents. Campus operations normal.</td></tr>`;
      } else {
        tbody.innerHTML = openIncidents.map(inc => {
          const tech = techs.find(t => t.id === inc.assignedTechnicianId);
          return `
            <tr>
              <td><strong>${inc.code}</strong></td>
              <td>${inc.category}</td>
              <td>${inc.roomId || inc.buildingId}</td>
              <td><span style="font-family: var(--font-mono); font-size: 11px;">${inc.assetId || 'Facility Space'}</span></td>
              <td>
                <span class="status-pill ${inc.urgency === 'Critical' ? 'red' : inc.urgency === 'High' ? 'amber' : 'green'}">
                  ${inc.urgency}
                </span>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${inc.slaStatus}</div>
              </td>
              <td>
                <span class="status-pill ${inc.status.includes('Progress') ? 'amber' : inc.status.includes('Blocked') ? 'red' : 'grey'}">
                  ${inc.status}
                </span>
              </td>
              <td>${tech ? tech.name : '<span style="color: #94A3B8;">Auto-Dispatching...</span>'}</td>
              <td>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="window.trinetraApp.openIncidentDetailsModal('${inc.id}')">
                  Inspect & Resolve
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 4. Render Inventory Table
    const invTbody = document.getElementById('dashboard-inventory-tbody');
    if (invTbody) {
      invTbody.innerHTML = shortageItems.map(item => `
        <tr>
          <td><span style="font-family: var(--font-mono);">${item.id}</span></td>
          <td><strong>${item.name}</strong></td>
          <td style="color: ${item.quantityOnHand === 0 ? '#DC2626' : 'inherit'}; font-weight: 700;">${item.quantityOnHand}</td>
          <td>${item.reservedQuantity}</td>
          <td>${item.minimumThreshold}</td>
          <td>₹${item.unitCostINR.toLocaleString('en-IN')}</td>
          <td>
            <span class="status-pill ${item.quantityOnHand === 0 ? 'red' : 'amber'}">
              ${item.quantityOnHand === 0 ? 'Out of Stock' : 'Low Stock'}
            </span>
          </td>
          <td>
            ${item.id === 'INV-PMP-SEAL' ? '<span style="color: #DC2626; font-weight: 600;">WO-2026-082 (Pump Seal)</span>' : '<span style="color: #64748B;">None</span>'}
          </td>
        </tr>
      `).join('');
    }
  }

  updateCampusOpsKpi() {
    const snap = campusOps.getSnapshot();
    const el = document.getElementById('kpi-campusops-signals');
    if (el) {
      el.textContent = snap.totalActiveSignals;
    }
  }
}
