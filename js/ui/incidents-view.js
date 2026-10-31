/**
 * TRINETRA - Unified AI Incident Engine UI View
 * Supports Web Form, Natural Language AI Chat, Simulated Email Inbox,
 * Entity extraction, clarification questions, and validated state transitions.
 */

import { db } from '../services/db.js';
import { incidentEngine } from '../services/incident-engine.js';
import { workforceEngine } from '../services/workforce-engine.js';

export class IncidentsViewController {
  constructor(containerElement) {
    this.container = containerElement;
    this.activeChannel = 'ai-chat'; // 'ai-chat', 'web-form', 'email-inbox'
    this.render();
    db.subscribe('INCIDENTS', () => this.refreshIncidentsList());
  }

  render() {
    this.container.innerHTML = `
      <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;">
        <!-- CHANNEL TABS -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: var(--primary-blue-dark);">🧠 Unified AI Incident Engine</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Report, extract entities, detect duplicates, and dispatch work orders.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary channel-tab active" id="tab-btn-ai-chat" onclick="window.trinetraApp.setIncidentChannel('ai-chat')">
              💬 Natural Language AI Chat
            </button>
            <button class="btn-secondary channel-tab" id="tab-btn-web-form" onclick="window.trinetraApp.setIncidentChannel('web-form')">
              📝 Structured Web Form
            </button>
            <button class="btn-secondary channel-tab" id="tab-btn-email-inbox" onclick="window.trinetraApp.setIncidentChannel('email-inbox')">
              📬 Simulated Email Inbox (3)
            </button>
          </div>
        </div>

        <!-- CHANNEL 1: AI CHAT / FAST REPORTER -->
        <div id="channel-pane-ai-chat" style="display: block;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--primary-blue);">Natural Language Issue Ingestion</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
              Describe the problem naturally. The AI engine will extract the issue type, building, floor, room, asset, urgency, and affected activities.
            </p>

            <div style="display: flex; gap: 10px; margin-bottom: 14px;">
              <textarea id="ai-chat-input" class="form-control" rows="3" style="flex: 1;" placeholder="Example: The projector in E-204 is not working and an examination is scheduled in that room tomorrow."></textarea>
              <button class="btn-primary" style="display: flex; align-items: center; gap: 6px; padding: 0 20px;" onclick="window.trinetraApp.submitAiChatComplaint()">
                Analyze & Report
              </button>
            </div>

            <!-- Pre-filled Quick Prompts -->
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">Quick Test Prompts:</span>
              <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="document.getElementById('ai-chat-input').value = 'The projector in E-204 is not working and an examination is scheduled in that room tomorrow.'; window.trinetraApp.submitAiChatComplaint();">
                🎯 Exam Projector Failure (E-204)
              </button>
              <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="document.getElementById('ai-chat-input').value = 'Water leaking heavily from pump AST-PMP-01 in the Central Substation.'; window.trinetraApp.submitAiChatComplaint();">
                💧 Water Pump Gland Leak (SUB-001)
              </button>
              <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="document.getElementById('ai-chat-input').value = 'Wi-Fi keeps dropping during presentations in PG Block PGB-202.'; window.trinetraApp.submitAiChatComplaint();">
                📶 Wi-Fi Drop in PG Block (PGB-202)
              </button>
              <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="document.getElementById('ai-chat-input').value = 'The AC is not cooling properly.'; window.trinetraApp.submitAiChatComplaint();">
                ❓ Incomplete Complaint (Trigger Clarification)
              </button>
            </div>

            <!-- AI EXTRACTION RESULTS CARD -->
            <div id="ai-extraction-card" style="display: none; margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;"></div>
          </div>
        </div>

        <!-- CHANNEL 2: STRUCTURED WEB FORM -->
        <div id="channel-pane-web-form" style="display: none;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm); max-width: 800px;">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--primary-blue);">Direct Facility Maintenance Report Form</h3>
            <form id="incident-web-form" onsubmit="window.trinetraApp.submitWebForm(event)">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                  <label>Title / Brief Summary</label>
                  <input type="text" id="form-title" class="form-control" required placeholder="e.g. Split AC refrigerant leak">
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <select id="form-category" class="form-control" required>
                    <option value="Audiovisual / Presentation">Audiovisual / Presentation</option>
                    <option value="HVAC & Climate Control">HVAC & Climate Control</option>
                    <option value="Electrical & Power">Electrical & Power</option>
                    <option value="Network & Connectivity">Network & Connectivity</option>
                    <option value="Plumbing & Hydraulic">Plumbing & Hydraulic</option>
                    <option value="Civil & Furniture">Civil & Furniture</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Building</label>
                  <select id="form-building" class="form-control" required onchange="window.trinetraApp.populateRoomsForBuilding(this.value)">
                    <option value="b-main">Main Academic & Admin Block</option>
                    <option value="b-acad">CS & IT Academic Block</option>
                    <option value="b-ece">Electronics & Electrical Block</option>
                    <option value="b-mech">Mechanical Engineering Block</option>
                    <option value="b-civil">Civil Engineering Block</option>
                    <option value="b-pg">PG & Research Block</option>
                    <option value="b-lib">Central Library</option>
                    <option value="b-audi">TRP Auditorium</option>
                    <option value="b-util">Central Substation</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Room / Space ID</label>
                  <select id="form-room" class="form-control" required>
                    <option value="E-204">E-204 (Exam & Smart Hall)</option>
                    <option value="E-208">E-208 (Interactive Multimedia)</option>
                    <option value="E-101">E-101 (Lecture Theatre)</option>
                    <option value="AB-201">AB-201 (AI Lab)</option>
                    <option value="PGB-202">PGB-202 (MBA Seminar)</option>
                    <option value="SUB-001">SUB-001 (Substation Yard)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Urgency Level</label>
                  <select id="form-urgency" class="form-control" required>
                    <option value="Low">Low (P3 - Routine Service)</option>
                    <option value="Medium">Medium (P2 - Standard Class)</option>
                    <option value="High">High (P2 - Scheduled Session)</option>
                    <option value="Critical">Critical (P1 - Imminent Examination)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Affected Activity</label>
                  <input type="text" id="form-activity" class="form-control" placeholder="e.g. End Semester Exam at 09:00 AM">
                </div>
              </div>
              <div class="form-group" style="margin-top: 10px;">
                <label>Detailed Observations</label>
                <textarea id="form-details" class="form-control" rows="3" placeholder="Provide equipment symptoms, error codes, or safety risks..."></textarea>
              </div>
              <button type="submit" class="btn-primary" style="margin-top: 10px;">
                Submit Incident Report
              </button>
            </form>
          </div>
        </div>

        <!-- CHANNEL 3: SIMULATED EMAIL INBOX -->
        <div id="channel-pane-email-inbox" style="display: none;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 style="font-size: 15px; font-weight: 700; color: var(--primary-blue);">Simulated Campus Email Inbound Gateway</h3>
                <p style="font-size: 12px; color: var(--text-muted);">Incoming reports sent to <code>facilities@eec.srmrmp.edu.in</code> parsed by AI.</p>
              </div>
              <button class="btn-secondary" style="font-size: 12px;" onclick="window.trinetraApp.refreshEmailInbox()">
                🔄 Check for New Inbound Mail
              </button>
            </div>
            <div id="email-inbox-list" style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- COMPREHENSIVE INCIDENTS DISPATCH BOARD -->
        <div class="table-container" style="margin: 0;">
          <div class="table-header-bar">
            <h3>📋 Incident Management & Workflow State Machine</h3>
            <div style="display: flex; gap: 8px;">
              <span class="status-pill grey" id="incidents-count-badge">Total Incidents: 3</span>
            </div>
          </div>
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Urgency</th>
                <th>Location</th>
                <th>Workflow Status</th>
                <th>History Trail</th>
                <th>State Actions</th>
              </tr>
            </thead>
            <tbody id="incidents-board-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.refreshIncidentsList();
    this.renderEmailInbox();
  }

  refreshIncidentsList() {
    const incidents = db.getIncidents();
    const tbody = document.getElementById('incidents-board-tbody');
    const badge = document.getElementById('incidents-count-badge');
    if (badge) badge.textContent = `Total Incidents: ${incidents.length}`;

    if (tbody) {
      tbody.innerHTML = incidents.map(inc => {
        const canAdvance = inc.status !== 'Resolved' && inc.status !== 'Closed';
        const nextState = inc.status === 'Reported' ? 'Analysed' :
                          inc.status === 'Analysed' ? 'Assigned' :
                          inc.status === 'Assigned' ? 'In Progress' :
                          inc.status === 'In Progress' ? 'Resolved' : null;

        return `
          <tr>
            <td><strong>${inc.code}</strong></td>
            <td>
              <div style="font-weight: 600;">${inc.title}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${inc.category} • ${inc.affectedActivity}</div>
            </td>
            <td>
              <span class="status-pill ${inc.urgency === 'Critical' ? 'red' : inc.urgency === 'High' ? 'amber' : 'green'}">
                ${inc.urgency}
              </span>
            </td>
            <td>${inc.roomId || inc.buildingId}</td>
            <td>
              <span class="status-pill ${inc.status === 'Resolved' ? 'green' : inc.status === 'In Progress' ? 'amber' : inc.status.includes('Blocked') ? 'red' : 'grey'}">
                ${inc.status}
              </span>
            </td>
            <td>
              <div style="font-size: 11px; color: var(--text-muted);">
                ${inc.stateHistory ? inc.stateHistory.map(h => `<div>• <strong>${h.state}</strong> (${h.updatedBy.split(' ')[0]})</div>`).join('') : ''}
              </div>
            </td>
            <td>
              ${nextState ? `
                <button class="btn-primary" style="font-size: 11px; padding: 4px 8px;" onclick="window.trinetraApp.advanceIncidentState('${inc.id}', '${nextState}')">
                  Advance to ${nextState} →
                </button>
              ` : `
                <span style="color: var(--status-green); font-weight: 700; font-size: 12px;">✓ Completed</span>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  renderEmailInbox() {
    const emails = db.getAll('EMAILS');
    const container = document.getElementById('email-inbox-list');
    if (!container) return;

    container.innerHTML = emails.map(email => `
      <div style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px; background: var(--bg-main);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-weight: 700; color: var(--primary-blue-dark); font-size: 13px;">${email.subject}</div>
          <span class="status-pill green">${email.status}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          From: ${email.from} | Received: ${email.date}
        </div>
        <div style="font-size: 12px; color: var(--text-main); white-space: pre-line; background: #FFFFFF; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); margin-bottom: 10px;">
          ${email.body}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-primary" style="font-size: 11px; padding: 4px 10px;" onclick="window.trinetraApp.ingestEmailAsIncident('${email.id}')">
            ⚡ Re-run AI Extraction & Auto-Dispatch
          </button>
        </div>
      </div>
    `).join('');
  }
}
