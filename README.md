# TRINETRA-OS-

# TRINETRA: Intelligent Campus & Building Operations Management System

> **Tagline:** See Everything. Understand Everything. Manage Everything.  
> **Deployment Target:** SRM Easwari Engineering College, Bharathi Salai, Ramapuram, Chennai, Tamil Nadu, India (12.98667° N, 79.97194° E)

---

## Executive Overview

**TRINETRA** is an enterprise-grade intelligent infrastructure and facilities management platform inspired by **Honeywell Building Solutions**, **Siemens Smart Infrastructure**, and **Palantir Operational Intelligence**.

Unlike static 3D models or surface-level dashboards, TRINETRA connects a **high-fidelity Three.js 3D Architectural Digital Twin** directly to a **persistent operational database**, **AI incident reasoning engine**, **workforce dispatch scheduler**, **space management conflict-checker**, **stock reservation inventory system**, and the **CampusOps Mobile Signals BLE Intelligence Engine**.

---

## Key Modules & Capabilities

### 1. Architectural 3D Digital Twin & Exploded Floor Viewer
- **9 Verified Campus Structures:**
  - `b-main`: Main Academic & Administrative Block (4 storeys, columned portico, examination cell)
  - `b-acad`: CS & IT Academic Block (4 storeys, computing centres, AI & Data Science labs)
  - `b-ece`: Electronics & Electrical Block (4 storeys, Texas Instruments IoT Centre, RF mast)
  - `b-mech`: Mechanical Engineering Block (3 storeys, heavy machine workshops, CNC bays)
  - `b-civil`: Civil Engineering Block (3 storeys, structural materials testing laboratories)
  - `b-pg`: PG & Research Block (3 storeys, MBA executive seminar halls)
  - `b-lib`: Central Library & Information Centre (3 storeys, glass atrium, skylight)
  - `b-audi`: TRP Auditorium Complex (2500-seat multi-purpose hall, stage, balcony)
  - `b-util`: Central Substation & Utility Yard (11kV switchgear, 2x 500kVA Cummins DG sets, water pumps)
- **Complete 4-Sided Elevations:** Every building features full front, back, left, and right architectural elevations with concrete piers, window mullions, double-glazed glass, spandrels, and parapets.
- **Rooftop MEP Infrastructure:** Solar photovoltaic arrays, chilled water cooling tanks, elevator machine rooms, HVAC piping, and antennas.
- **Exploded Floor Visualisation:** Vertical separation mode with independent floor isolation (`Ground`, `1st`, `2nd`, `3rd`).
- **Interactive 3D Classroom Interior (e.g. Room E-204):**
  - Vitrified tile flooring, acoustic walls, recessed 36W LED troffers.
  - Tiered student dual desks and ergonomic benches.
  - Teacher's presentation podium.
  - Interactive Smartboard display + motorized projection screen.
  - Ceiling-mounted Epson projector (`AST-PRJ-204`) with projection beam or red fault alert.
  - Dual Daikin inverter split ACs, Aruba Wi-Fi 6 access point, and Ceasefire fire extinguisher.
- **Dynamic Real-Time Health Coloring:** Glowing holographic halos and markers indicating Green (Normal), Amber (Attention Required), or Red (Critical).
- **Multiple Rendering Modes:** Photorealistic 3D, Operational 3D Twin, 2D CAD Schematic, and Satellite View.

### 2. Unified AI Incident Engine
- **Multi-Channel Input:** Natural Language AI Chat, Structured Web Form, and Simulated Email Inbound Gateway.
- **Entity Extraction:** Issue Type, Building, Floor, Room, Asset, Urgency, Affected Activity, and Required Maintenance.
- **Clarification Dialog:** Automatically identifies missing parameters (e.g. unstated room or equipment) and prompts clarification questions.
- **Duplicate Complaint Detection:** Flags overlapping complaints for the same room or asset to prevent redundant work orders.
- **State Transition Machine:** Strictly validates `Reported -> Analysed -> Assigned -> In Progress -> Resolved`.

### 3. Workforce & Maintenance Management
- **Intelligent Multi-Factor Matching:** Matches technicians based on domain skills (AV, HVAC, Electrical, Network, Plumbing, Civil), availability, active workload count, priority, and building proximity.
- **Work Order Checklist Engine:** Interactive checklist tasks that automatically resolve parent incidents and update asset health upon completion.
- **Workload Rebalancing:** Automated reassignment simulation when a technician reports sick or unavailable.

### 4. Space & Resource Management
- **Classroom Scheduling & Calendar:** Tracks student counts, lectures, and university examinations.
- **Backend Double-Booking Prevention:** Blocks overlapping reservations.
- **Automated Alternative Classroom Recommendation:** When Classroom `E-204` experiences a projector failure before the exam, TRINETRA analyzes capacity, equipment, and schedule availability, ranking `E-208` as the optimal alternative with 1-click migration.

### 5. Inventory Management & Separation of Duties
- **Tracked Spares:** Projector lamps, AC compressors, 10G optical SFP+ modules, LED troffers, MCBs, HDMI extenders, and mechanical pump seals.
- **Stock Reservation Engine:** Locks required parts to active work orders and prevents overselling.
- **Blocked Maintenance Safety:** Automatically marks work orders as blocked if stock is 0 (e.g., Kirloskar pump seal) and raises emergency Purchase Requisitions.
- **Separation of Duties:** Requesters are strictly barred from approving their own purchase requisitions; only the `Procurement Approver` role has sign-off authority.

### 6. Digital Twin Simulator
- **6 Operational Scenarios:**
  1. Classroom unavailable before examination
  2. Technician suddenly unavailable
  3. Core switch optical trunk severed
  4. Critical spare part out of stock
  5. Unexpected building occupancy surge (CampusOps BLE)
  6. TANGEDCO grid power blackout & DG failover
- **Deterministic Live Alteration:** Executes state changes directly onto the active database.

### 7. CampusOps Mobile Signals Workspace
- **Live BLE Scanner:** Utilizes the Web Bluetooth API (`navigator.bluetooth.requestDevice`).
- **Hackathon Demo Mode:** High-fidelity real-time radio packet stream.
- **Laptop BLE Hardware Status:** Detects adapter availability.
- **60-Second Sliding Detection Window:** Rolling buffer purging stale detections.
- **RSSI Distribution:** Strong (-30 to -60 dBm), Moderate (-61 to -80 dBm), and Weak (-81 to -100 dBm).
- **Facility Density Intelligence:** Real-time signal density per building mapped to 3D twin.
- **Strict Privacy Guarantees:** One-way hashed pseudo-IDs, no MAC addresses, no individual tracking.

### 8. Role-Based Access Control (RBAC) & Audit Trail
- **6 Enterprise Roles:**
  1. Student / Faculty
  2. Technician
  3. Department Manager
  4. Facilities Administrator
  5. Procurement Approver
  6. System Administrator
- **Persistent Audit Log:** Records every status change, role switch, purchase authorization, and simulation trigger.
- **Data Export & Import:** Full JSON backup and restore capabilities.

---

## Project Structure

```
trinetra/
├── index.html                   # Master single-page enterprise dashboard
├── package.json                 # Project descriptor
├── README.md                    # System documentation and acceptance tests
├── css/
│   └── styles.css               # Honeywell/Siemens design system stylesheet
└── js/
    ├── app.js                   # Master coordinator and event router
    ├── 3d/
    │   └── campus-scene.js      # Three.js 3D Campus Digital Twin & Exploded View engine
    ├── data/
    │   └── campus-seed.js       # Relational seed dataset for SRM Easwari Engineering College
    ├── services/
    │   ├── db.js                # Persistent database service with Pub/Sub reactivity
    │   ├── incident-engine.js   # AI entity extraction and clarification engine
    │   ├── workforce-engine.js  # Technician dispatch & workload rebalancing
    │   ├── booking-engine.js    # Conflict prevention & alternative room matcher
    │   └── campusops-engine.js  # CampusOps BLE telemetry and privacy filtering
    └── ui/
        ├── dashboard.js         # Command Center executive KPI controller
        ├── incidents-view.js    # Unified AI Incident Engine controller
        ├── workforce-view.js    # Maintenance & work order checklist controller
        ├── space-view.js        # Space & alternative room controller
        ├── inventory-view.js    # Spares inventory & purchase approval controller
        ├── simulator-view.js    # Digital Twin crisis simulator controller
        ├── campusops-view.js    # Mobile Signals workspace controller
        └── rbac-view.js         # Role-based access control and audit trail controller
```

---

## How to Run

1. Open the project folder in any modern web browser (Google Chrome, Microsoft Edge, or Firefox).
2. Double-click `index.html` or serve via any static web server:
   ```bash
   # Optional: serve using Python, Node, or VS Code Live Server
   python -m http.server 8080
   # or
   npx serve .
   ```
3. Open `http://localhost:8080` in your browser.
4. Explore the 3D campus, enter buildings, isolate floors, step inside classroom E-204, run the AI incident engine, execute crisis simulations, and view live BLE signal streams!
"# TRINETRA-OS-" 
