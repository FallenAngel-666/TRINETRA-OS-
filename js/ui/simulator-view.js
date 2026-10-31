/**
 * TRINETRA - Digital Twin Simulator UI View
 * Simulates 6 major operational campus crises using deterministic calculations,
 * updating the live database and reflecting real state changes across the digital twin.
 */

import { db } from '../services/db.js';

export class SimulatorViewController {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
  }

  render() {
    const scenarios = db.getAll('SCENARIOS');

    this.container.innerHTML = `
      <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;">
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: var(--primary-blue-dark);">⚡ Digital Twin Operational Simulator</h2>
            <p style="font-size: 12px; color: var(--text-muted);">
              Execute deterministic operational crises, evaluate cascading campus impacts, and verify automated recovery interventions.
            </p>
          </div>
          <button class="btn-secondary" onclick="window.trinetraApp.resetDatabase()">
            ↺ Reset Database to Baseline
          </button>
        </div>

        <!-- SCENARIOS GRID -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
          ${scenarios.map(sc => `
            <div class="kpi-card" style="border-top: 4px solid ${sc.severity === 'Critical' ? '#DC2626' : sc.severity === 'High' ? '#D97706' : '#2563EB'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span class="status-pill ${sc.severity === 'Critical' ? 'red' : sc.severity === 'High' ? 'amber' : 'green'}">
                  ${sc.severity} Severity
                </span>
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${sc.id}</span>
              </div>

              <h3 style="font-size: 15px; font-weight: 700; color: var(--primary-blue-dark); margin-bottom: 6px;">
                ${sc.title}
              </h3>

              <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
                <strong>Trigger:</strong> ${sc.triggerEntity}
              </div>

              <p style="font-size: 12px; color: var(--text-main); line-height: 1.4; margin-bottom: 14px; background: var(--bg-main); padding: 10px; border-radius: var(--radius-sm);">
                ${sc.description}
              </p>

              <!-- DETERMINISTIC CALCULATIONS -->
              <div style="font-size: 11px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 14px; background: #FFFFFF;">
                <div style="font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">Deterministic Rule Outcomes:</div>
                ${Object.entries(sc.deterministicOutcomes).map(([k, v]) => `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">${this.formatKey(k)}:</span>
                    <strong style="color: var(--text-main); text-align: right; max-width: 60%;">${Array.isArray(v) ? v.join(', ') : v}</strong>
                  </div>
                `).join('')}
              </div>

              <!-- RECOMMENDED ACTIONS -->
              <div style="font-size: 11px; margin-bottom: 14px;">
                <div style="font-weight: 700; color: var(--primary-blue); margin-bottom: 4px;">Automated Interventions:</div>
                <ul style="padding-left: 16px; color: var(--text-main);">
                  ${sc.interventions.map(i => `<li>${i.action}</li>`).join('')}
                </ul>
              </div>

              <button class="btn-primary" style="width: 100%; padding: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 10px rgba(57, 120, 198, 0.3);" onclick="window.trinetraApp.executeSimulationScenario('${sc.id}')">
                <span>⚡ Execute & Demonstrate 3Dly on Campus</span>
                <span>🏛️</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  formatKey(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}
