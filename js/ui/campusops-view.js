/**
 * TRINETRA - CampusOps Mobile Signals Workspace UI Controller
 * Preserves full CampusOps specifications:
 * - Live BLE Scanner (Web Bluetooth)
 * - Hackathon Demo Mode
 * - Laptop BLE Adapter Status
 * - 60-Second Sliding Detection Window
 * - RSSI Distribution (Strong / Moderate / Weak)
 * - Building & Zone Density Intelligence
 * - Strict Privacy Guarantees
 */

import { campusOps } from '../services/campusops-engine.js';
import { db } from '../services/db.js';

export class CampusOpsViewController {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    campusOps.subscribe(() => this.updateView());
  }

  render() {
    this.container.innerHTML = `
      <div class="campusops-workspace">
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: var(--primary-blue-dark);">📡 CampusOps: Mobile Signals & BLE Density Intelligence</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Anonymous radio beacon telemetry across 45 campus sensor gateways in SRM Easwari Engineering College.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primary" id="btn-toggle-scan" onclick="window.trinetraApp.toggleCampusOpsScan()">
              ▶ Start Live BLE Telemetry
            </button>
            <button class="btn-secondary" onclick="window.trinetraApp.triggerLiveBluetoothHardware()">
              📶 Connect Laptop BLE Radio
            </button>
          </div>
        </div>

        <!-- PRIVACY COMPLIANCE NOTICE -->
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 11px; color: #166534; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 16px;">🛡️</span>
          <div>
            <strong>Strict Privacy Guarantees:</strong> Anonymous radio beacon counts only. No MAC addresses exposed. No individual tracking or personal mobility histories. BLE signals represent radio frequency beacon density and do NOT represent exact human headcounts or cellular network coverage.
          </div>
        </div>

        <!-- CONTROLS & ADAPTER STATUS BAR -->
        <div class="signals-control-bar">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Radio Mode:</span>
              <span class="status-pill green" id="signals-mode-badge">Hackathon Demo Mode</span>
            </div>
            <div>
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Host BLE Adapter:</span>
              <strong id="signals-adapter-status" style="font-size: 12px; color: var(--text-main);">Checking...</strong>
            </div>
            <div>
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Sliding Window:</span>
              <strong style="font-size: 12px; color: var(--text-main);">60 Seconds (Rolling Buffer)</strong>
            </div>
          </div>
          <div>
            <span class="status-pill blue" id="signals-active-badge">Scanner Idle</span>
          </div>
        </div>

        <!-- TELEMETRY STATS ROW -->
        <div class="signals-stats-row">
          <div class="kpi-card">
            <span class="kpi-title">Active Proximate Signals</span>
            <div class="kpi-value" id="stat-total-signals" style="color: #0EA5E9;">0</div>
            <div class="kpi-subtext">Within 60s Detection Horizon</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Strong Signals (-30 to -60 dBm)</span>
            <div class="kpi-value" id="stat-strong-signals" style="color: var(--status-green);">0</div>
            <div class="kpi-subtext" id="stat-strong-pct">0% of total signals</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Moderate Signals (-61 to -80 dBm)</span>
            <div class="kpi-value" id="stat-moderate-signals" style="color: var(--status-amber);">0</div>
            <div class="kpi-subtext" id="stat-moderate-pct">0% of total signals</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Weak Signals (-81 to -100 dBm)</span>
            <div class="kpi-value" id="stat-weak-signals" style="color: var(--status-red);">0</div>
            <div class="kpi-subtext" id="stat-weak-pct">0% of total signals</div>
          </div>
        </div>

        <!-- RSSI DISTRIBUTION & BUILDING DENSITY SPLIT -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <!-- RSSI DISTRIBUTION BARS -->
          <div class="rssi-distribution-container">
            <h3 style="font-size: 14px; font-weight: 700; color: var(--primary-blue);">Signal Strength Distribution (RSSI dBm)</h3>
            <div class="rssi-bar-row">
              <span class="rssi-bar-label">Strong (Near)</span>
              <div class="rssi-progress-track">
                <div class="rssi-progress-fill rssi-fill-strong" id="bar-strong" style="width: 0%;"></div>
              </div>
              <span id="label-strong-count" style="width: 45px; text-align: right; font-weight: 700;">0</span>
            </div>
            <div class="rssi-bar-row">
              <span class="rssi-bar-label">Moderate</span>
              <div class="rssi-progress-track">
                <div class="rssi-progress-fill rssi-fill-moderate" id="bar-moderate" style="width: 0%;"></div>
              </div>
              <span id="label-moderate-count" style="width: 45px; text-align: right; font-weight: 700;">0</span>
            </div>
            <div class="rssi-bar-row">
              <span class="rssi-bar-label">Weak (Far)</span>
              <div class="rssi-progress-track">
                <div class="rssi-progress-fill rssi-fill-weak" id="bar-weak" style="width: 0%;"></div>
              </div>
              <span id="label-weak-count" style="width: 45px; text-align: right; font-weight: 700;">0</span>
            </div>

            <!-- DETAILED HISTOGRAM TABLE -->
            <div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px; font-size: 11px;">
              <div style="font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">10-dBm Signal Bins:</div>
              <div id="histogram-bins" style="display: flex; justify-content: space-between; font-family: var(--font-mono);">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>

          <!-- BUILDING-WISE DENSITY BREAKDOWN -->
          <div class="rssi-distribution-container">
            <h3 style="font-size: 14px; font-weight: 700; color: var(--primary-blue);">Facility Density Index (Verified Buildings)</h3>
            <div id="building-density-list" style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; overflow-y: auto; max-height: 200px;">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- RECENT DETECTIONS LOG (ANONYMOUS TELEMETRY STREAM) -->
        <div class="table-container" style="margin: 0; flex: 1;">
          <div class="table-header-bar">
            <h3>📡 Live Anonymous BLE Signal Packets (Sliding Window Log)</h3>
            <span class="status-pill green">MACs Hashed via SHA-256</span>
          </div>
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Packet ID</th>
                <th>Anonymous Pseudo-ID</th>
                <th>Receiving Gateway</th>
                <th>Facility & Zone</th>
                <th>RSSI (dBm)</th>
                <th>Proximity Class</th>
                <th>Telemetry Source</th>
              </tr>
            </thead>
            <tbody id="signals-detections-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.updateView();
  }

  updateView() {
    const snap = campusOps.getSnapshot();

    // Scan Button
    const btnScan = document.getElementById('btn-toggle-scan');
    if (btnScan) {
      btnScan.textContent = snap.isScanning ? '⏹ Stop BLE Scanner' : '▶ Start Live BLE Telemetry';
      btnScan.style.background = snap.isScanning ? '#DC2626' : 'var(--primary-blue)';
    }

    const activeBadge = document.getElementById('signals-active-badge');
    if (activeBadge) {
      activeBadge.textContent = snap.isScanning ? '● Telemetry Stream Active' : 'Scanner Idle';
      activeBadge.className = `status-pill ${snap.isScanning ? 'green' : 'grey'}`;
    }

    const adapterStatus = document.getElementById('signals-adapter-status');
    if (adapterStatus) adapterStatus.textContent = snap.adapterStatus;

    // Stats
    const elTotal = document.getElementById('stat-total-signals');
    if (elTotal) elTotal.textContent = snap.totalActiveSignals;

    const elStrong = document.getElementById('stat-strong-signals');
    const elStrongPct = document.getElementById('stat-strong-pct');
    if (elStrong) elStrong.textContent = snap.classificationCounts.strong;
    if (elStrongPct) elStrongPct.textContent = `${snap.classificationPercentages.strong}% of total`;

    const elMod = document.getElementById('stat-moderate-signals');
    const elModPct = document.getElementById('stat-moderate-pct');
    if (elMod) elMod.textContent = snap.classificationCounts.moderate;
    if (elModPct) elModPct.textContent = `${snap.classificationPercentages.moderate}% of total`;

    const elWeak = document.getElementById('stat-weak-signals');
    const elWeakPct = document.getElementById('stat-weak-pct');
    if (elWeak) elWeak.textContent = snap.classificationCounts.weak;
    if (elWeakPct) elWeakPct.textContent = `${snap.classificationPercentages.weak}% of total`;

    // Progress Bars
    const barStrong = document.getElementById('bar-strong');
    const lblStrong = document.getElementById('label-strong-count');
    if (barStrong) barStrong.style.width = `${snap.classificationPercentages.strong}%`;
    if (lblStrong) lblStrong.textContent = snap.classificationCounts.strong;

    const barMod = document.getElementById('bar-moderate');
    const lblMod = document.getElementById('label-moderate-count');
    if (barMod) barMod.style.width = `${snap.classificationPercentages.moderate}%`;
    if (lblMod) lblMod.textContent = snap.classificationCounts.moderate;

    const barWeak = document.getElementById('bar-weak');
    const lblWeak = document.getElementById('label-weak-count');
    if (barWeak) barWeak.style.width = `${snap.classificationPercentages.weak}%`;
    if (lblWeak) lblWeak.textContent = snap.classificationCounts.weak;

    // Histogram Bins
    const histBins = document.getElementById('histogram-bins');
    if (histBins) {
      histBins.innerHTML = Object.entries(snap.histogram).map(([k, v]) => `
        <div style="text-align: center;">
          <div style="color: var(--text-muted); font-size: 10px;">${k}</div>
          <div style="font-weight: 700; color: var(--primary-blue);">${v}</div>
        </div>
      `).join('');
    }

    // Building Density List
    const bldList = document.getElementById('building-density-list');
    if (bldList) {
      const buildings = db.getBuildings();
      bldList.innerHTML = buildings.map(b => {
        const count = snap.buildingDensity[b.id] || 0;
        const isSurge = count > 35;
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
            <div>
              <strong>${b.code}</strong> - ${b.name.split(' ')[0]}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span><strong>${count}</strong> signals</span>
              <span class="status-pill ${isSurge ? 'amber' : 'green'}" style="font-size: 9px;">
                ${isSurge ? 'Surge Warning' : 'Normal'}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Recent Detections Table
    const tbody = document.getElementById('signals-detections-tbody');
    if (tbody) {
      if (snap.recentDetections.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">Click "Start Live BLE Telemetry" to receive signals stream.</td></tr>`;
      } else {
        tbody.innerHTML = snap.recentDetections.map(d => `
          <tr>
            <td><code>${d.id.slice(-10)}</code></td>
            <td><strong style="color: var(--primary-blue); font-family: var(--font-mono);">${d.anonymousId}</strong></td>
            <td><code>${d.gatewayId}</code></td>
            <td>${d.zone}</td>
            <td><strong>${d.rssi} dBm</strong></td>
            <td>
              <span class="status-pill ${d.classification === 'Strong' ? 'green' : d.classification === 'Moderate' ? 'amber' : 'red'}">
                ${d.classification}
              </span>
            </td>
            <td><span style="font-size: 11px; color: var(--text-muted);">${d.source}</span></td>
          </tr>
        `).join('');
      }
    }
  }
}
