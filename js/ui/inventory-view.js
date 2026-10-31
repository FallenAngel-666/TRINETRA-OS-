/**
 * TRINETRA - Inventory & Procurement Management UI View
 * Tracks spare parts, stock reservations, prevents overselling,
 * and enforces role-based purchase approval with separation of duties.
 */

import { db } from '../services/db.js';

export class InventoryViewController {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    db.subscribe('INVENTORY', () => this.refreshView());
    db.subscribe('PURCHASE_REQUESTS', () => this.refreshView());
  }

  render() {
    this.container.innerHTML = `
      <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;">
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: var(--primary-blue-dark);">📦 Inventory & Procurement Management</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Manage spare parts, stock reservations, overselling locks, and multi-tier purchase approvals.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn-primary" onclick="window.trinetraApp.openCreatePrModal()">
              + Raise Purchase Requisition
            </button>
          </div>
        </div>

        <!-- PURCHASE APPROVALS QUEUE -->
        <div class="table-container" style="margin: 0;">
          <div class="table-header-bar">
            <h3>📑 Purchase Requests & Separation of Duties Workflow</h3>
            <span class="status-pill amber">Only Procurement Approver Role Authorized</span>
          </div>
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>PR Code</th>
                <th>Requisition Title</th>
                <th>Requested By</th>
                <th>Total Value (INR)</th>
                <th>Urgency</th>
                <th>Workflow Status</th>
                <th>Approval Action</th>
              </tr>
            </thead>
            <tbody id="purchase-requests-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>

        <!-- PHYSICAL INVENTORY STOCK TABLE -->
        <div class="table-container" style="margin: 0;">
          <div class="table-header-bar">
            <h3>🔩 Campus Spares Inventory & Storage Bins</h3>
            <span class="status-pill green">Stock Reservation Engine Active</span>
          </div>
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Part ID</th>
                <th>Item Description</th>
                <th>Category</th>
                <th>On Hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Min Threshold</th>
                <th>Unit Cost</th>
                <th>Storage Bin</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody id="inventory-stock-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.refreshView();
  }

  refreshView() {
    const inventory = db.getInventory();
    const prs = db.getPurchaseRequests();
    const currentUser = db.getCurrentUser();

    // Render PRs
    const prTbody = document.getElementById('purchase-requests-tbody');
    if (prTbody) {
      prTbody.innerHTML = prs.map(pr => {
        const isPending = pr.status === 'Pending Approval';
        const isOwnRequest = currentUser && currentUser.id === pr.requestedBy;
        const isApproverRole = db.hasPermission('APPROVE_PURCHASE_REQUESTS');

        return `
          <tr>
            <td><strong>${pr.code}</strong></td>
            <td>
              <div style="font-weight: 700;">${pr.title}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${pr.justification}</div>
            </td>
            <td>
              <div><strong>${pr.requesterName}</strong></div>
              <div style="font-size: 10px; color: var(--text-muted);">${pr.requesterRole}</div>
            </td>
            <td><strong>₹${pr.totalAmountINR.toLocaleString('en-IN')}</strong></td>
            <td>
              <span class="status-pill ${pr.urgency === 'Critical' ? 'red' : 'amber'}">
                ${pr.urgency}
              </span>
            </td>
            <td>
              <span class="status-pill ${pr.status === 'Approved' ? 'green' : pr.status === 'Rejected' ? 'red' : 'amber'}">
                ${pr.status}
              </span>
              ${pr.approvedBy ? `<div style="font-size: 10px; color: var(--text-muted);">Approved by ${pr.approvedBy}</div>` : ''}
            </td>
            <td>
              ${isPending ? `
                <div style="display: flex; gap: 6px;">
                  <button class="btn-primary" style="font-size: 11px; padding: 4px 8px; background-color: var(--status-green);"
                    onclick="window.trinetraApp.approvePr('${pr.id}')"
                    ${isOwnRequest || !isApproverRole ? 'title="Requires Procurement Approver role and cannot approve own request."' : ''}>
                    ✓ Approve PR
                  </button>
                  <button class="btn-secondary" style="font-size: 11px; padding: 4px 8px; color: #DC2626;"
                    onclick="window.trinetraApp.rejectPr('${pr.id}')"
                    ${!isApproverRole ? 'disabled' : ''}>
                    ✕ Reject
                  </button>
                </div>
                ${isOwnRequest ? `<div style="font-size: 9px; color: #DC2626; margin-top: 2px;">Separation of Duties: Cannot approve own request</div>` : ''}
                ${!isApproverRole ? `<div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">Switch to Procurement Approver role</div>` : ''}
              ` : `
                <span style="font-size: 11px; color: var(--text-muted);">Order Processed</span>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }

    // Render Inventory
    const invTbody = document.getElementById('inventory-stock-tbody');
    if (invTbody) {
      invTbody.innerHTML = inventory.map(item => `
        <tr>
          <td><code>${item.id}</code></td>
          <td><strong>${item.name}</strong></td>
          <td><span style="font-size: 11px; color: var(--text-muted);">${item.category}</span></td>
          <td style="font-weight: 700;">${item.quantityOnHand}</td>
          <td style="color: var(--status-amber); font-weight: 700;">${item.reservedQuantity}</td>
          <td style="color: ${item.availableQuantity === 0 ? '#DC2626' : 'var(--status-green)'}; font-weight: 700;">
            ${item.availableQuantity}
          </td>
          <td>${item.minimumThreshold}</td>
          <td>₹${item.unitCostINR.toLocaleString('en-IN')}</td>
          <td><span style="font-size: 11px;">${item.storageLocation}</span></td>
          <td>
            <span class="status-pill ${item.availableQuantity === 0 ? 'red' : item.availableQuantity <= item.minimumThreshold ? 'amber' : 'green'}">
              ${item.availableQuantity === 0 ? 'Out of Stock' : item.availableQuantity <= item.minimumThreshold ? 'Low Stock' : 'Adequate'}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }
}
