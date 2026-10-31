/**
 * TRINETRA - Space & Resource Management UI View
 * Room bookings, schedule conflict prevention, double-booking backend check,
 * and automated alternative classroom relocation.
 */

import { db } from '../services/db.js';
import { bookingEngine } from '../services/booking-engine.js';

export class SpaceViewController {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    db.subscribe('BOOKINGS', () => this.refreshBookings());
  }

  render() {
    this.container.innerHTML = `
      <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;">
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: var(--primary-blue-dark);">📐 Space & Resource Management</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Manage room allocations, exam halls, prevent double-bookings, and relocate compromised classes.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" onclick="window.trinetraApp.openAlternativeRoomModal('E-204')">
              🔄 Relocate Compromised Exam in E-204
            </button>
            <button class="btn-primary" onclick="window.trinetraApp.openCreateBookingModal()">
              + New Room Booking
            </button>
          </div>
        </div>

        <!-- EXAM RELOCATION SPOTLIGHT BANNER -->
        <div class="ai-insight-banner" style="margin: 0;">
          <div class="ai-insight-icon">🚨</div>
          <div class="ai-insight-content">
            <h4>Active Space Conflict: Classroom E-204 Under Maintenance</h4>
            <p>
              The Anna University End-Semester Examination (70 Candidates) is currently booked in <strong>E-204</strong> tomorrow at 09:00 AM.
              The ceiling projector has failed. TRINETRA has analyzed 18 campus halls and identified <strong>Interactive Multimedia Hall E-208</strong> (75 seats, same floor, fully operational) as the optimal alternative.
            </p>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
              <button class="btn-primary" onclick="window.trinetraApp.executeExamRelocation('BKG-2026-501', 'E-208')">
                ⚡ 1-Click Relocate to Room E-208 & Notify Exam Cell
              </button>
            </div>
          </div>
        </div>

        <!-- ROOM BOOKINGS TABLE -->
        <div class="table-container" style="margin: 0;">
          <div class="table-header-bar">
            <h3>📅 Scheduled Room Bookings & Examinations</h3>
            <span class="status-pill green">Conflict Prevention Active</span>
          </div>
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Title / Academic Event</th>
                <th>Room ID</th>
                <th>Date & Time</th>
                <th>Attendees</th>
                <th>Organizer</th>
                <th>Status / Conflict</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="bookings-table-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.refreshBookings();
  }

  refreshBookings() {
    const bookings = db.getBookings();
    const tbody = document.getElementById('bookings-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = bookings.map(b => {
      const isRisk = b.status.includes('Risk');
      const isRelocated = b.status.includes('Relocated');

      return `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>
            <div style="font-weight: 700;">${b.title}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${b.notes || 'End-semester institutional booking.'}</div>
          </td>
          <td><span style="font-family: var(--font-mono); font-weight: 700;">${b.roomId}</span></td>
          <td>${b.date} <br><span style="font-size: 11px; color: var(--text-muted);">${b.startTime} - ${b.endTime}</span></td>
          <td><strong>${b.attendeesCount}</strong> students</td>
          <td>${b.organizer}</td>
          <td>
            <span class="status-pill ${isRisk ? 'red' : isRelocated ? 'green' : 'green'}">
              ${b.status}
            </span>
          </td>
          <td>
            ${isRisk ? `
              <button class="btn-primary" style="font-size: 11px; padding: 4px 8px;" onclick="window.trinetraApp.openAlternativeRoomModal('${b.roomId}')">
                Find Alternative Room →
              </button>
            ` : `
              <button class="btn-secondary" style="font-size: 11px; padding: 4px 8px;" onclick="window.trinetraApp.cancelBooking('${b.id}')">
                Cancel
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }
}
