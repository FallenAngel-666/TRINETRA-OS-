/**
 * TRINETRA - Role-Based Access Control (RBAC) & Audit Trail UI Controller
 * 6 Enterprise Roles, permission matrix, secure audit trail, and raw JSON export/import.
 */

import { db } from '../services/db.js';

export class RbacViewController {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    db.subscribe('AUDIT_LOGS', () => this.refreshAuditLogs());
    db.subscribe('USER', () => this.refreshUserStatus());
  }

  render() {
    const roles = db.getAll('ROLES');

    this.container.innerHTML = `
      <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;">
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: var(--primary-blue-dark);">🛡️ Role-Based Access Control & Immutable Audit Trail</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Strict enterprise permission enforcement, separation of duties, and regulatory audit logging.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" onclick="window.trinetraApp.exportDatabase()">
              ⬇️ Export Audit DB (JSON)
            </button>
            <button class="btn-secondary" onclick="window.trinetraApp.triggerImportDatabase()">
              ⬆️ Restore DB (JSON)
            </button>
          </div>
        </div>

        <!-- 6 ENTERPRISE ROLES MATRIX -->
        <div>
          <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--primary-blue);">Defined Security Roles & Separation of Duties</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            ${roles.map(r => `
              <div class="kpi-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 style="font-size: 14px; font-weight: 700; color: var(--primary-blue-dark);">${r.name}</h4>
                  <span class="status-pill blue">${r.code}</span>
                </div>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">
                  ${r.description}
                </p>
                <div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px;">
                  <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Permissions:</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                    ${r.permissions.map(p => `<span class="tagline-badge" style="font-size: 8px;">${p}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AUDIT TRAIL LOG -->
        <div class="table-container" style="margin: 0;">
          <div class="table-header-bar">
            <h3>📜 Enterprise Security Audit Log</h3>
            <span class="status-pill green">Persistent Transaction Log</span>
          </div>
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>User / Identity</th>
                <th>Role</th>
                <th>Action Code</th>
                <th>Target Entity</th>
                <th>Transaction Details</th>
              </tr>
            </thead>
            <tbody id="audit-log-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.refreshAuditLogs();
  }

  refreshAuditLogs() {
    const logs = db.getAll('AUDIT_LOGS');
    const tbody = document.getElementById('audit-log-tbody');
    if (!tbody) return;

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td><code>${l.id}</code></td>
        <td><span style="font-size: 11px; color: var(--text-muted);">${new Date(l.timestamp).toLocaleTimeString()} (${new Date(l.timestamp).toLocaleDateString()})</span></td>
        <td><strong>${l.userName}</strong></td>
        <td><span class="status-pill blue" style="font-size: 10px;">${l.role}</span></td>
        <td><code>${l.action}</code></td>
        <td><strong>${l.targetEntity}</strong></td>
        <td><span style="font-size: 12px; color: var(--text-main);">${l.details}</span></td>
      </tr>
    `).join('');
  }

  refreshUserStatus() {
    // re-render if needed
  }
}
