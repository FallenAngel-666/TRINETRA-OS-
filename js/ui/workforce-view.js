/**
 * TRINETRA - Workforce & Maintenance Management UI View
 * Manages technician rosters, intelligent skill-based dispatching,
 * active work orders with checklist tasks, and workload rebalancing.
 */

import { db } from '../services/db.js';
import { workforceEngine } from '../services/workforce-engine.js';

export class WorkforceViewController {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    db.subscribe('WORK_ORDERS', () => this.refreshView());
    db.subscribe('TECHNICIANS', () => this.refreshView());
  }

  render() {
    this.container.innerHTML = `
      <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;">
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: var(--primary-blue-dark);">🛠️ Workforce & Maintenance Management</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Manage technicians, shifts, skill matching, and work order checklists.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" onclick="window.trinetraApp.simulateTechUnavailable()">
              🚨 Simulate Senior Tech Suddenly Unavailable
            </button>
            <button class="btn-primary" onclick="window.trinetraApp.openCreateWorkOrderModal()">
              + New Work Order
            </button>
          </div>
        </div>

        <!-- TECHNICIANS ROSTER GRID -->
        <div>
          <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--primary-blue);">Campus Maintenance Technicians (6 Specialists)</h3>
          <div id="techs-roster-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- WORK ORDERS DISPATCH PIPELINE -->
        <div class="table-container" style="margin: 0;">
          <div class="table-header-bar">
            <h3>📑 Active Maintenance Work Orders & Task Verification</h3>
            <span class="status-pill blue">Checklist Tasks Sync to Database</span>
          </div>
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>WO Code</th>
                <th>Work Order Title</th>
                <th>Assigned Specialist</th>
                <th>Location</th>
                <th>Checklist Tasks</th>
                <th>Parts Required</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="work-orders-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.refreshView();
  }

  refreshView() {
    const techs = db.getAll('TECHNICIANS');
    const wos = db.getWorkOrders();

    // Render Techs
    const grid = document.getElementById('techs-roster-grid');
    if (grid) {
      grid.innerHTML = techs.map(t => {
        const isAvail = t.availability === 'Available';
        const isBusy = t.availability === 'Busy';
        const statusColor = isAvail ? 'green' : isBusy ? 'amber' : 'red';

        return `
          <div class="kpi-card" style="border-left: 4px solid var(--status-${statusColor});">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h4 style="font-size: 14px; font-weight: 700; color: var(--primary-blue-dark);">${t.name}</h4>
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${t.employeeId}</div>
              </div>
              <span class="status-pill ${statusColor}">${t.availability}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-main); margin-top: 6px;">
              <div><strong>Dept:</strong> ${t.department}</div>
              <div><strong>Skill:</strong> ${t.primarySkill}</div>
              <div><strong>Shift:</strong> ${t.shift}</div>
              <div><strong>Workload:</strong> ${t.currentWorkload || 0} active tickets</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px; border-top: 1px solid var(--border-color); padding-top: 6px;">
              <span>⭐ ${t.rating} rating</span>
              <span>${t.completedTicketsCount} resolved</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Work Orders
    const tbody = document.getElementById('work-orders-tbody');
    if (tbody) {
      tbody.innerHTML = wos.map(wo => {
        const parts = wo.partsRequired || [];
        return `
          <tr>
            <td><strong>${wo.code}</strong></td>
            <td>
              <div style="font-weight: 700;">${wo.title}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${wo.notes || 'Routine standard maintenance.'}</div>
            </td>
            <td><strong>${wo.technicianName}</strong></td>
            <td>${wo.roomId || wo.buildingId}</td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${wo.checkList.map((item, idx) => `
                  <label style="font-size: 11px; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="window.trinetraApp.toggleWorkOrderTask('${wo.id}', ${idx}, this.checked)">
                    <span style="${item.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${item.task}</span>
                  </label>
                `).join('')}
              </div>
            </td>
            <td>
              ${parts.length > 0 ? parts.map(p => `
                <div style="font-size: 11px;">
                  <code>${p.partId}</code> (${p.quantity}x)
                  <span class="status-pill ${p.reserved ? 'green' : 'red'}" style="font-size: 9px; padding: 1px 4px;">
                    ${p.reserved ? 'Reserved' : 'Out of Stock'}
                  </span>
                </div>
              `).join('') : '<span style="color: #94A3B8; font-size: 11px;">None Required</span>'}
            </td>
            <td>
              <span class="status-pill ${wo.status === 'Completed' ? 'green' : wo.status.includes('Blocked') ? 'red' : 'amber'}">
                ${wo.status}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}
