/**
 * TRINETRA - Campus & Building Operations Management System
 * Campus Seed Data - SRM Easwari Engineering College
 * Location: Bharathi Salai, Ramapuram, Chennai, Tamil Nadu, India (12.98667° N, 79.97194° E)
 */

export const CAMPUS_METADATA = {
  id: 'campus-srm-eec',
  name: 'SRM Easwari Engineering College',
  tagline: 'See Everything. Understand Everything. Manage Everything.',
  location: {
    address: 'Bharathi Salai, Ramapuram, Chennai, Tamil Nadu 600089',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    coordinates: { lat: 12.98667, lng: 79.97194 },
    boundaryRadiusMeters: 450
  },
  established: 1996,
  affiliation: 'Anna University / Autonomous (SRM Group of Institutions)',
  campusAreaAcres: 12.5,
  totalBuiltUpSqFt: 620000,
  verifiedStatus: 'Verified Institutional Registry'
};

export const BUILDINGS = [
  {
    id: 'b-main',
    code: 'MB',
    name: 'Main Academic & Admin Block',
    type: 'Administrative & Academic',
    isVerified: true,
    verificationNote: 'Primary institutional block housing central administration, examination cell, and lecture halls.',
    floorsCount: 4,
    coordinates: { x: 0, z: 0 },
    dimensions: { width: 48, depth: 32, height: 16 }, // in meters (4 floors @ 4m)
    departments: ['Administration', 'Examination Cell', 'First Year Basic Sciences', 'Placement & Training'],
    healthScore: 78,
    status: 'amber', // attention required due to E-204 examination projector incident
    description: 'Central multi-storey block with columned portico, central double-height foyer, and administrative headquarters.',
    bleSensors: 8,
    floors: [
      {
        id: 'fl-main-0',
        floorNumber: 0,
        name: 'Ground Floor',
        elevationMeters: 0,
        roomsCount: 8,
        description: 'Principal Secretariat, Admissions, Central Examination Office, Server Room'
      },
      {
        id: 'fl-main-1',
        floorNumber: 1,
        name: 'First Floor',
        elevationMeters: 4,
        roomsCount: 10,
        description: 'First Year Engineering Classrooms (E-101 to E-110), Physics & Chemistry Labs'
      },
      {
        id: 'fl-main-2',
        floorNumber: 2,
        name: 'Second Floor',
        elevationMeters: 8,
        roomsCount: 10,
        description: 'Exam Halls (E-201 to E-210), Smart Classrooms, Faculty Conference Suite'
      },
      {
        id: 'fl-main-3',
        floorNumber: 3,
        name: 'Third Floor',
        elevationMeters: 12,
        roomsCount: 8,
        description: 'Dean Academic Affairs, Audio-Visual Lecture Halls (E-301 to E-308), Placement Cell'
      }
    ]
  },
  {
    id: 'b-acad',
    code: 'AB',
    name: 'CS & IT Academic Block',
    type: 'Academic & Laboratory',
    isVerified: true,
    verificationNote: 'Dedicated IT wing housing CSE, IT, AI & Data Science departments and cloud computing centres.',
    floorsCount: 4,
    coordinates: { x: -65, z: -10 },
    dimensions: { width: 44, depth: 28, height: 16 },
    departments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
    healthScore: 94,
    status: 'green',
    description: 'Modern high-tech computing wing with advanced server rooms and student coding labs.',
    bleSensors: 6,
    floors: [
      { id: 'fl-acad-0', floorNumber: 0, name: 'Ground Floor', elevationMeters: 0, roomsCount: 6 },
      { id: 'fl-acad-1', floorNumber: 1, name: 'First Floor', elevationMeters: 4, roomsCount: 8 },
      { id: 'fl-acad-2', floorNumber: 2, name: 'Second Floor', elevationMeters: 8, roomsCount: 8 },
      { id: 'fl-acad-3', floorNumber: 3, name: 'Third Floor', elevationMeters: 12, roomsCount: 8 }
    ]
  },
  {
    id: 'b-ece',
    code: 'EB',
    name: 'Electronics & Electrical Block',
    type: 'Academic & Laboratory',
    isVerified: true,
    verificationNote: 'Houses ECE, EEE, Robotics & Automation laboratories and Texas Instruments IoT Centre of Excellence.',
    floorsCount: 4,
    coordinates: { x: 65, z: -10 },
    dimensions: { width: 44, depth: 28, height: 16 },
    departments: ['Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Robotics & Automation'],
    healthScore: 91,
    status: 'green',
    description: 'Hardware, Embedded systems, and VLSI laboratories with rooftop RF antenna array.',
    bleSensors: 6,
    floors: [
      { id: 'fl-ece-0', floorNumber: 0, name: 'Ground Floor', elevationMeters: 0, roomsCount: 6 },
      { id: 'fl-ece-1', floorNumber: 1, name: 'First Floor', elevationMeters: 4, roomsCount: 8 },
      { id: 'fl-ece-2', floorNumber: 2, name: 'Second Floor', elevationMeters: 8, roomsCount: 8 },
      { id: 'fl-ece-3', floorNumber: 3, name: 'Third Floor', elevationMeters: 12, roomsCount: 8 }
    ]
  },
  {
    id: 'b-mech',
    code: 'MB-ENG',
    name: 'Mechanical Engineering Block',
    type: 'Laboratories & Workshops',
    isVerified: true,
    verificationNote: 'Heavy industrial workshops, CAD/CAM machining labs, thermal and fluid dynamics bays.',
    floorsCount: 3,
    coordinates: { x: -65, z: 50 },
    dimensions: { width: 50, depth: 30, height: 12 },
    departments: ['Mechanical Engineering', 'Mechatronics'],
    healthScore: 88,
    status: 'green',
    description: 'Double-height workshop bays with overhead crane gantry, CNC lathe suites, and metallurgy testing rigs.',
    bleSensors: 4,
    floors: [
      { id: 'fl-mech-0', floorNumber: 0, name: 'Ground Floor (Workshops)', elevationMeters: 0, roomsCount: 4 },
      { id: 'fl-mech-1', floorNumber: 1, name: 'First Floor (CAD/CAM)', elevationMeters: 4, roomsCount: 6 },
      { id: 'fl-mech-2', floorNumber: 2, name: 'Second Floor (Lecture Halls)', elevationMeters: 8, roomsCount: 6 }
    ]
  },
  {
    id: 'b-civil',
    code: 'CB',
    name: 'Civil Engineering Block',
    type: 'Laboratories & Academic',
    isVerified: true,
    verificationNote: 'Civil materials testing, structural engineering testing, environmental and geotechnical labs.',
    floorsCount: 3,
    coordinates: { x: 65, z: 50 },
    dimensions: { width: 42, depth: 26, height: 12 },
    departments: ['Civil Engineering', 'Environmental Engineering'],
    healthScore: 92,
    status: 'green',
    description: 'Specialized testing laboratories including compression testing machines and concrete curing tanks.',
    bleSensors: 4,
    floors: [
      { id: 'fl-civil-0', floorNumber: 0, name: 'Ground Floor (Heavy Testing)', elevationMeters: 0, roomsCount: 4 },
      { id: 'fl-civil-1', floorNumber: 1, name: 'First Floor (GIS & Survey)', elevationMeters: 4, roomsCount: 6 },
      { id: 'fl-civil-2', floorNumber: 2, name: 'Second Floor (Classrooms)', elevationMeters: 8, roomsCount: 6 }
    ]
  },
  {
    id: 'b-pg',
    code: 'PGB',
    name: 'PG & Research Block',
    type: 'Postgraduate & Research',
    isVerified: true,
    verificationNote: 'Management Studies (MBA), MCA, Research scholars wing, and air-conditioned executive seminar halls.',
    floorsCount: 3,
    coordinates: { x: 0, z: -60 },
    dimensions: { width: 38, depth: 26, height: 12 },
    departments: ['MBA', 'MCA', 'Research & Development Cell'],
    healthScore: 84,
    status: 'amber', // intermittent wifi issue
    description: 'Curved facade building with tiered case study classrooms and corporate seminar facilities.',
    bleSensors: 5,
    floors: [
      { id: 'fl-pg-0', floorNumber: 0, name: 'Ground Floor', elevationMeters: 0, roomsCount: 4 },
      { id: 'fl-pg-1', floorNumber: 1, name: 'First Floor', elevationMeters: 4, roomsCount: 6 },
      { id: 'fl-pg-2', floorNumber: 2, name: 'Second Floor', elevationMeters: 8, roomsCount: 6 }
    ]
  },
  {
    id: 'b-lib',
    code: 'LIB',
    name: 'Central Library & Info Centre',
    type: 'Library & Digital Repository',
    isVerified: true,
    verificationNote: 'Autonomous library facility housing over 80,000 volumes, IEEE digital access, and research cubicles.',
    floorsCount: 3,
    coordinates: { x: -35, z: -75 },
    dimensions: { width: 32, depth: 32, height: 12 },
    departments: ['Central Library', 'Digital Resource Center'],
    healthScore: 98,
    status: 'green',
    description: 'Architectural glass atrium building with central skylight, silent study bays, and automated RFID circulation.',
    bleSensors: 4,
    floors: [
      { id: 'fl-lib-0', floorNumber: 0, name: 'Ground Floor (Lending & Circulation)', elevationMeters: 0, roomsCount: 3 },
      { id: 'fl-lib-1', floorNumber: 1, name: 'First Floor (Reference & Journals)', elevationMeters: 4, roomsCount: 4 },
      { id: 'fl-lib-2', floorNumber: 2, name: 'Second Floor (Digital Library & Audio-Visual)', elevationMeters: 8, roomsCount: 4 }
    ]
  },
  {
    id: 'b-audi',
    code: 'TRP',
    name: 'TRP Auditorium Complex',
    type: 'Auditorium & Events',
    isVerified: true,
    verificationNote: '2500-seat multi-purpose auditorium named after Founder Chairman Dr. T.R. Paarivendhar.',
    floorsCount: 2,
    coordinates: { x: 40, z: -80 },
    dimensions: { width: 42, depth: 36, height: 14 },
    departments: ['Campus Events', 'Cultural Affairs', 'Convocations'],
    healthScore: 96,
    status: 'green',
    description: 'Acoustically engineered grand hall with motorized lighting trusses, green rooms, and VIP reception lounges.',
    bleSensors: 6,
    floors: [
      { id: 'fl-audi-0', floorNumber: 0, name: 'Main Hall & Stage', elevationMeters: 0, roomsCount: 3 },
      { id: 'fl-audi-1', floorNumber: 1, name: 'Balcony & Control Booth', elevationMeters: 6, roomsCount: 2 }
    ]
  },
  {
    id: 'b-util',
    code: 'SUB',
    name: 'Central Substation & Utility Yard',
    type: 'Power & Infrastructure',
    isVerified: true,
    verificationNote: '11kV HT Substation, 2x 500kVA Diesel Generator backup yard, RO water plant, and solar sync bank.',
    floorsCount: 1,
    coordinates: { x: 0, z: 75 },
    dimensions: { width: 30, depth: 20, height: 6 },
    departments: ['Electrical Infrastructure', 'Water Supply & Plumbing', 'Safety & Environmental Systems'],
    healthScore: 90,
    status: 'green',
    description: 'Enclosed heavy utility substation with perimeter security, transformer bays, and central chilled water pumps.',
    bleSensors: 2,
    floors: [
      { id: 'fl-util-0', floorNumber: 0, name: 'Ground Level & Switchgear Yard', elevationMeters: 0, roomsCount: 4 }
    ]
  }
];

export const ROOMS = [
  // MAIN BLOCK - SECOND FLOOR (Highlighting the critical examination rooms)
  {
    id: 'E-204',
    code: 'E-204',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    floorNumber: 2,
    name: 'Examination & Smart Lecture Hall E-204',
    type: 'Classroom / Examination Hall',
    capacity: 70,
    currentOccupancy: 0,
    availability: 'Blocked (Incident Active)',
    department: 'First Year / University Exam Cell',
    lastMaintenanceDate: '2026-09-14',
    status: 'red', // red due to critical projector breakdown before exam
    equipmentStatus: {
      projector: 'Faulty (Lamp Burnout)',
      airConditioning: 'Operational (24°C)',
      smartBoard: 'Operational',
      wifi: 'Connected (High Signal)',
      lighting: 'Operational (8x LED Troffers)',
      fireExtinguisher: 'Inspected (Valid)'
    },
    activeIncidents: ['INC-2026-101'],
    features: ['Epson 5000 Lumens Ceiling Projector', 'Motorized 120" Screen', 'Podium with HDMI Extender', 'Dual Split ACs', 'Tiered Benches (70 Seats)', 'CCTV Examination Surveillance']
  },
  {
    id: 'E-208',
    code: 'E-208',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    floorNumber: 2,
    name: 'Interactive Multimedia Hall E-208',
    type: 'Smart Classroom / Alt Exam Hall',
    capacity: 75,
    currentOccupancy: 0,
    availability: 'Available (Recommended Relocation Target)',
    department: 'First Year Academic Division',
    lastMaintenanceDate: '2026-10-18',
    status: 'green',
    equipmentStatus: {
      projector: 'Operational (Epson 5200 Lumens)',
      airConditioning: 'Operational (22°C)',
      smartBoard: 'Operational (ViewSonic 86")',
      wifi: 'Connected (Aruba AP-515)',
      lighting: 'Operational',
      fireExtinguisher: 'Inspected (Valid)'
    },
    activeIncidents: [],
    features: ['Epson EB-2250U Projector', 'Interactive Smart Board', '75 Ergonomic Student Desks', 'Audio PA System with Collar Mic', 'Dual 2-Ton Inverter ACs']
  },
  {
    id: 'E-201',
    code: 'E-201',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    floorNumber: 2,
    name: 'Lecture Hall E-201',
    type: 'Classroom',
    capacity: 65,
    currentOccupancy: 58,
    availability: 'Occupied (Lecture in progress)',
    department: 'Science & Humanities',
    lastMaintenanceDate: '2026-08-20',
    status: 'green',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational', smartBoard: 'N/A', wifi: 'Connected', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['Ceiling Projector', '65 Dual Desks', 'Green Chalkboard + Whiteboard', 'Wall Fans']
  },
  {
    id: 'E-202',
    code: 'E-202',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    floorNumber: 2,
    name: 'Lecture Hall E-202',
    type: 'Classroom',
    capacity: 65,
    currentOccupancy: 0,
    availability: 'Available',
    department: 'Science & Humanities',
    lastMaintenanceDate: '2026-09-02',
    status: 'green',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational', smartBoard: 'Operational', wifi: 'Connected', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['Ceiling Projector', '65 Desks', 'Motorized Screen', 'Ceiling Fans']
  },
  {
    id: 'E-101',
    code: 'E-101',
    buildingId: 'b-main',
    floorId: 'fl-main-1',
    floorNumber: 1,
    name: 'Foundation Lecture Theatre E-101',
    type: 'Classroom',
    capacity: 70,
    currentOccupancy: 62,
    availability: 'Occupied',
    department: 'First Year Studies',
    lastMaintenanceDate: '2026-09-10',
    status: 'green',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational', smartBoard: 'Operational', wifi: 'Connected', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['70 Stepped Desks', 'Short Throw Projector', 'Whiteboard', 'Ceiling Fans & AC']
  },
  {
    id: 'E-102',
    code: 'E-102',
    buildingId: 'b-main',
    floorId: 'fl-main-1',
    floorNumber: 1,
    name: 'Foundation Lecture Theatre E-102',
    type: 'Classroom',
    capacity: 70,
    currentOccupancy: 0,
    availability: 'Available',
    department: 'First Year Studies',
    lastMaintenanceDate: '2026-10-01',
    status: 'green',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational', smartBoard: 'Operational', wifi: 'Connected', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['70 Stepped Desks', 'Epson Projector', 'Whiteboard', 'Ceiling Fans & AC']
  },
  {
    id: 'E-008',
    code: 'E-008',
    buildingId: 'b-main',
    floorId: 'fl-main-0',
    floorNumber: 0,
    name: 'Campus Central Server Room E-008',
    type: 'Data Center & Network Hub',
    capacity: 6,
    currentOccupancy: 1,
    availability: 'Restricted Access',
    department: 'Central IT & Systems',
    lastMaintenanceDate: '2026-10-25',
    status: 'green',
    equipmentStatus: { projector: 'N/A', airConditioning: 'Precision InRow AC (19°C)', smartBoard: 'N/A', wifi: 'Core Fiber Distribution', lighting: 'LED Anti-Glare', fireExtinguisher: 'FM-200 Clean Agent System' },
    activeIncidents: [],
    features: ['Cisco Catalyst 9500 Core Switch', '42U Server Racks', 'APC 40kVA Online Modular UPS', 'Biometric Access Control']
  },

  // CS & IT ACADEMIC BLOCK
  {
    id: 'AB-201',
    code: 'AB-201',
    buildingId: 'b-acad',
    floorId: 'fl-acad-2',
    floorNumber: 2,
    name: 'AI & Deep Learning Laboratory AB-201',
    type: 'Advanced Computing Lab',
    capacity: 60,
    currentOccupancy: 45,
    availability: 'Lab Session Active',
    department: 'Artificial Intelligence & Data Science',
    lastMaintenanceDate: '2026-10-12',
    status: 'green',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational (21°C)', smartBoard: 'Operational', wifi: 'Gigabit Wi-Fi 6', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['60 NVIDIA RTX Workstations', 'Dual ViewSonic Interactive 86" Panels', 'Gigabit Switched Ethernet', 'Dedicated 20kVA UPS']
  },
  {
    id: 'AB-302',
    code: 'AB-302',
    buildingId: 'b-acad',
    floorId: 'fl-acad-3',
    floorNumber: 3,
    name: 'Cloud Computing Centre AB-302',
    type: 'Laboratory',
    capacity: 65,
    currentOccupancy: 0,
    availability: 'Available',
    department: 'Computer Science & Engineering',
    lastMaintenanceDate: '2026-10-05',
    status: 'green',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational', smartBoard: 'Operational', wifi: 'Connected', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['65 Dell OptiPlex All-in-Ones', 'Overhead Projector', 'Dual 2-Ton Cassette ACs']
  },

  // ELECTRONICS BLOCK
  {
    id: 'EB-104',
    code: 'EB-104',
    buildingId: 'b-ece',
    floorId: 'fl-ece-1',
    floorNumber: 1,
    name: 'Texas Instruments IoT Centre EB-104',
    type: 'Specialized Centre of Excellence',
    capacity: 40,
    currentOccupancy: 22,
    availability: 'Active Research',
    department: 'Electronics & Communication Engineering',
    lastMaintenanceDate: '2026-09-28',
    status: 'green',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational', smartBoard: 'Operational', wifi: 'Connected', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['20 Oscilloscope & Spectrum Analyser Benches', 'TI SimpleLink IoT Kits', 'PCB Prototyping Station']
  },

  // PG BLOCK
  {
    id: 'PGB-202',
    code: 'PGB-202',
    buildingId: 'b-pg',
    floorId: 'fl-pg-2',
    floorNumber: 2,
    name: 'Executive MBA Seminar Hall PGB-202',
    type: 'Tiered Seminar Hall',
    capacity: 80,
    currentOccupancy: 0,
    availability: 'Attention Required (Wi-Fi Drops)',
    department: 'Master of Business Administration',
    lastMaintenanceDate: '2026-09-18',
    status: 'amber',
    equipmentStatus: { projector: 'Operational', airConditioning: 'Operational', smartBoard: 'Operational', wifi: 'Unstable (Frequent Packet Drops)', lighting: 'Operational', fireExtinguisher: 'Valid' },
    activeIncidents: ['INC-2026-103'],
    features: ['Tiered Horseshoe Seating (80)', 'Wireless Microphone Array', 'Ceiling Dual Projection', 'Aruba AP-515 Access Point']
  },

  // MECHANICAL BLOCK
  {
    id: 'MB-001',
    code: 'MB-001',
    buildingId: 'b-mech',
    floorId: 'fl-mech-0',
    floorNumber: 0,
    name: 'Central Machine & CNC Workshop MB-001',
    type: 'Heavy Engineering Workshop',
    capacity: 50,
    currentOccupancy: 30,
    availability: 'Workshop Active',
    department: 'Mechanical Engineering',
    lastMaintenanceDate: '2026-10-15',
    status: 'green',
    equipmentStatus: { projector: 'N/A', airConditioning: 'Industrial Ventilation', smartBoard: 'N/A', wifi: 'Standard', lighting: 'High-Bay Industrial LED', fireExtinguisher: 'CO2 & Dry Powder Array' },
    activeIncidents: [],
    features: ['5-Axis CNC Milling Center', '12 All-Geared Lathes', 'Shaper & Slotting Machines', 'Overhead 3-Ton Gantry Crane']
  },

  // CIVIL BLOCK
  {
    id: 'CB-002',
    code: 'CB-002',
    buildingId: 'b-civil',
    floorId: 'fl-civil-0',
    floorNumber: 0,
    name: 'Concrete & Highway Materials Lab CB-002',
    type: 'Testing Laboratory',
    capacity: 40,
    currentOccupancy: 18,
    availability: 'Testing Session',
    department: 'Civil Engineering',
    lastMaintenanceDate: '2026-10-10',
    status: 'green',
    equipmentStatus: { projector: 'N/A', airConditioning: 'Ambient Testing', smartBoard: 'Wall Display', wifi: 'Connected', lighting: 'Dust-Proof Fixtures', fireExtinguisher: 'Valid' },
    activeIncidents: [],
    features: ['2000 kN Compression Testing Machine', 'Vee-Bee Consistometer', 'Ductility Testing Apparatus', 'Curing Tanks']
  },

  // CENTRAL LIBRARY
  {
    id: 'LIB-101',
    code: 'LIB-101',
    buildingId: 'b-lib',
    floorId: 'fl-lib-1',
    floorNumber: 1,
    name: 'National & International Journals Wing LIB-101',
    type: 'Quiet Reference Wing',
    capacity: 120,
    currentOccupancy: 42,
    availability: 'Open (Quiet Study)',
    department: 'Central Library',
    lastMaintenanceDate: '2026-10-22',
    status: 'green',
    equipmentStatus: { projector: 'N/A', airConditioning: 'Central Chilled Water System (23°C)', smartBoard: 'N/A', wifi: 'High-Density Wi-Fi', lighting: 'LED 4000K Ergonomic', fireExtinguisher: 'Inspected' },
    activeIncidents: [],
    features: ['120 Individual Acoustic Carrels', 'RFID Kiosk', 'High Speed Scanner', 'Barcoded Stacks']
  },

  // AUDITORIUM
  {
    id: 'TRP-001',
    code: 'TRP-001',
    buildingId: 'b-audi',
    floorId: 'fl-audi-0',
    floorNumber: 0,
    name: 'TRP Grand Auditorium Hall',
    type: 'Multi-Purpose Auditorium',
    capacity: 2500,
    currentOccupancy: 0,
    availability: 'Available (Booking Required)',
    department: 'Campus Administration',
    lastMaintenanceDate: '2026-10-20',
    status: 'green',
    equipmentStatus: { projector: 'Dual 20,000 Lumens Laser Projection', airConditioning: '300-Ton Central Chiller', smartBoard: '60ft Motorized LED Video Wall', wifi: 'High-Density Dual Band', lighting: 'DMX Controlled Moving Heads', fireExtinguisher: 'Automatic Sprinklers & Hose Reels' },
    activeIncidents: [],
    features: ['2500 Cushioned Seats', 'Line Array JBL Audio System', 'Hydraulic Stage Pitches', 'Green Rooms 1-4']
  },

  // SUBSTATION
  {
    id: 'SUB-001',
    code: 'SUB-001',
    buildingId: 'b-util',
    floorId: 'fl-util-0',
    floorNumber: 0,
    name: '11kV HT Substation & Generator Control Room',
    type: 'Electrical Substation',
    capacity: 4,
    currentOccupancy: 2,
    availability: 'Staffed 24x7',
    department: 'Electrical Engineering Maintenance',
    lastMaintenanceDate: '2026-10-28',
    status: 'green',
    equipmentStatus: { projector: 'N/A', airConditioning: 'Heavy Duty Exhaust & Fresh Air Fans', smartBoard: 'N/A', wifi: 'Industrial LoRa/SCADA', lighting: 'Emergency Battery Backup Lights', fireExtinguisher: 'CO2 Automatic Flooding System' },
    activeIncidents: [],
    features: ['11kV / 433V 1000kVA Transformers (x2)', '2x 500kVA Cummins Silent DG Sets', 'Automatic Main Failure (AMF) Panel', 'Central Power Factor Correction Banks']
  }
];

export const ASSETS = [
  {
    id: 'AST-PRJ-204',
    code: 'AST-PRJ-204',
    name: 'Epson PowerLite EB-2250U 5000 Lumens 3LCD Projector',
    type: 'Audiovisual / Presentation',
    category: 'AV',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    serialNumber: 'EPS-2023-9941A',
    installDate: '2023-04-12',
    purchaseCostINR: 115000,
    status: 'critical', // burnt lamp
    healthScore: 15,
    supplier: 'Epson India Certified ProAV',
    warrantyExpiry: '2026-04-12',
    lastServiceDate: '2026-05-10',
    requiredPartId: 'INV-PRJ-LMP88',
    faultDescription: 'Lamp burnout during pre-exam display test. Bulb blackened, ballast circuit safe.',
    specifications: '5,000 Lumens, WUXGA (1920x1200), Dual HDMI, 16W Speaker'
  },
  {
    id: 'AST-AC-204A',
    code: 'AST-AC-204A',
    name: 'Daikin 2.0 Ton Inverter Split Air Conditioner (Left)',
    type: 'HVAC',
    category: 'HVAC',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    serialNumber: 'DKN-2022-7712',
    installDate: '2022-08-15',
    purchaseCostINR: 62000,
    status: 'healthy',
    healthScore: 92,
    supplier: 'Daikin Airconditioning India',
    warrantyExpiry: '2027-08-15',
    lastServiceDate: '2026-09-14',
    specifications: 'R32 Refrigerant, 5-Star BEE, Copper Condenser'
  },
  {
    id: 'AST-AC-204B',
    code: 'AST-AC-204B',
    name: 'Daikin 2.0 Ton Inverter Split Air Conditioner (Right)',
    type: 'HVAC',
    category: 'HVAC',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    serialNumber: 'DKN-2022-7713',
    installDate: '2022-08-15',
    purchaseCostINR: 62000,
    status: 'healthy',
    healthScore: 89,
    supplier: 'Daikin Airconditioning India',
    warrantyExpiry: '2027-08-15',
    lastServiceDate: '2026-09-14',
    specifications: 'R32 Refrigerant, 5-Star BEE, Copper Condenser'
  },
  {
    id: 'AST-SB-204',
    code: 'AST-SB-204',
    name: 'Promethean ActivPanel 75" Interactive 4K Touch Display',
    type: 'Smart Classroom Display',
    category: 'AV',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    serialNumber: 'PRM-2024-1102',
    installDate: '2024-01-20',
    purchaseCostINR: 245000,
    status: 'healthy',
    healthScore: 97,
    supplier: 'Promethean Global Education',
    warrantyExpiry: '2029-01-20',
    lastServiceDate: '2026-08-12',
    specifications: '4K UHD, 20-Point Touch, Android 11 OPS Module, Anti-Glare Glass'
  },
  {
    id: 'AST-WIFI-204',
    code: 'AST-WIFI-204',
    name: 'Aruba AP-515 Wi-Fi 6 Campus Access Point',
    type: 'Networking',
    category: 'Network',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    serialNumber: 'ARU-2023-8821',
    installDate: '2023-06-10',
    purchaseCostINR: 48000,
    status: 'healthy',
    healthScore: 96,
    supplier: 'HPE Aruba Networks',
    warrantyExpiry: '2028-06-10',
    lastServiceDate: '2026-10-01',
    specifications: 'Wi-Fi 6 (802.11ax), OFDMA, BLE 5.0 Radio, 2.5Gbps Uplink'
  },
  {
    id: 'AST-FE-204',
    code: 'AST-FE-204',
    name: 'Ceasefire ABC Dry Powder Fire Extinguisher 4kg',
    type: 'Fire & Life Safety',
    category: 'Safety',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    serialNumber: 'CF-2024-5541',
    installDate: '2024-03-01',
    purchaseCostINR: 4500,
    status: 'healthy',
    healthScore: 100,
    supplier: 'Ceasefire Industries',
    warrantyExpiry: '2027-03-01',
    lastServiceDate: '2026-09-01',
    specifications: 'Class A, B, C & Electrical fires, Pressure Gauge in Green Zone'
  },
  {
    id: 'AST-SW-CORE',
    code: 'AST-SW-CORE',
    name: 'Cisco Catalyst 9500 48-Port 10G/40G Core Optical Switch',
    type: 'Core Network Infrastructure',
    category: 'Network',
    buildingId: 'b-main',
    floorId: 'fl-main-0',
    roomId: 'E-008',
    serialNumber: 'CSCO-CAT95-7721',
    installDate: '2023-02-15',
    purchaseCostINR: 880000,
    status: 'healthy',
    healthScore: 99,
    supplier: 'Cisco India Enterprise Systems',
    warrantyExpiry: '2028-02-15',
    lastServiceDate: '2026-10-15',
    specifications: 'StackWise-480, 160 Gbps Stacking, Redundant Platinum Power Supplies'
  },
  {
    id: 'AST-DG-01',
    code: 'AST-DG-01',
    name: 'Cummins 500kVA Silent Enclosure Diesel Generator Set',
    type: 'Backup Power Generation',
    category: 'Electrical',
    buildingId: 'b-util',
    floorId: 'fl-util-0',
    roomId: 'SUB-001',
    serialNumber: 'CUM-2021-9982D',
    installDate: '2021-11-20',
    purchaseCostINR: 2850000,
    status: 'healthy',
    healthScore: 94,
    supplier: 'Cummins India Power Generation',
    warrantyExpiry: '2026-11-20',
    lastServiceDate: '2026-10-28',
    specifications: 'QSX15-G8 Engine, Stamford Alternator, Auto-Mains-Failure (AMF) Sync'
  },
  {
    id: 'AST-PMP-01',
    code: 'AST-PMP-01',
    name: 'Kirloskar 15HP Multi-Stage Centrifugal Water Supply Pump',
    type: 'Hydro-Pneumatic Water System',
    category: 'Plumbing',
    buildingId: 'b-util',
    floorId: 'fl-util-0',
    roomId: 'SUB-001',
    serialNumber: 'KIR-2022-4412',
    installDate: '2022-05-18',
    purchaseCostINR: 145000,
    status: 'warning', // seal wear
    healthScore: 68,
    supplier: 'Kirloskar Brothers Ltd',
    warrantyExpiry: '2025-05-18',
    lastServiceDate: '2026-07-22',
    requiredPartId: 'INV-PMP-SEAL',
    faultDescription: 'Minor gland packing leakage detected on secondary impeller housing.',
    specifications: '15 HP 3-Phase Induction, 65m Head, 450 LPM Discharge'
  },
  {
    id: 'AST-WIFI-PGB2',
    code: 'AST-WIFI-PGB2',
    name: 'Aruba AP-515 Wi-Fi 6 Access Point (PG Block Wing)',
    type: 'Networking',
    category: 'Network',
    buildingId: 'b-pg',
    floorId: 'fl-pg-2',
    roomId: 'PGB-202',
    serialNumber: 'ARU-2023-8899',
    installDate: '2023-06-10',
    purchaseCostINR: 48000,
    status: 'warning', // intermittent drop
    healthScore: 62,
    supplier: 'HPE Aruba Networks',
    warrantyExpiry: '2028-06-10',
    lastServiceDate: '2026-08-11',
    faultDescription: 'Packet loss spikes during peak concurrent sessions (60+ devices). Needs firmware patch and PoE switch power audit.',
    specifications: 'Wi-Fi 6 Dual Radio, PoE+ Powered (802.3at)'
  }
];

export const TECHNICIANS = [
  {
    id: 'TECH-AV-01',
    name: 'M. Suresh',
    employeeId: 'EEC-EMP-4081',
    department: 'AV & Smart Campus Systems',
    primarySkill: 'Audiovisual / Projectors',
    secondarySkills: ['Interactive Whiteboards', 'HDMI Matrix Extenders', 'PA Systems'],
    phone: '+91 98401 22841',
    shift: 'General (08:30 - 17:30)',
    availability: 'Available',
    currentWorkload: 1, // 1 active work order
    assignedBuilding: 'b-main',
    rating: 4.9,
    completedTicketsCount: 142
  },
  {
    id: 'TECH-EL-01',
    name: 'R. Karthik',
    employeeId: 'EEC-EMP-3922',
    department: 'Electrical Infrastructure',
    primarySkill: 'High Voltage & Power Distribution',
    secondarySkills: ['UPS Banks', 'MCB & Switchgear', 'DG Set Automation'],
    phone: '+91 94440 91822',
    shift: 'Morning Shift (06:00 - 14:30)',
    availability: 'Available',
    currentWorkload: 2,
    assignedBuilding: 'b-util',
    rating: 4.8,
    completedTicketsCount: 218
  },
  {
    id: 'TECH-HV-01',
    name: 'P. Vignesh',
    employeeId: 'EEC-EMP-4115',
    department: 'HVAC & Climate Control',
    primarySkill: 'Chillers & VRV/VRF Systems',
    secondarySkills: ['Inverter Split ACs', 'Refrigerant Recovery', 'Air Handling Units'],
    phone: '+91 97910 33415',
    shift: 'General (08:30 - 17:30)',
    availability: 'On-Call',
    currentWorkload: 2,
    assignedBuilding: 'b-audi',
    rating: 4.7,
    completedTicketsCount: 189
  },
  {
    id: 'TECH-NW-01',
    name: 'S. Anand',
    employeeId: 'EEC-EMP-4203',
    department: 'Network & Telecommunications',
    primarySkill: 'Optical Fiber & Managed Switches',
    secondarySkills: ['Aruba Wi-Fi 6', 'Cat6 Structured Cabling', 'Firewall VLANs'],
    phone: '+91 98845 77103',
    shift: 'General (08:30 - 17:30)',
    availability: 'Available',
    currentWorkload: 1,
    assignedBuilding: 'b-acad',
    rating: 4.9,
    completedTicketsCount: 164
  },
  {
    id: 'TECH-PL-01',
    name: 'K. Raman',
    employeeId: 'EEC-EMP-3889',
    department: 'Plumbing & Hydraulic Services',
    primarySkill: 'Hydro-Pneumatic Pumps & Piping',
    secondarySkills: ['Water Treatment Plants', 'Fire Sprinkler Mains', 'Drainage Flow'],
    phone: '+91 93821 55889',
    shift: 'General (08:30 - 17:30)',
    availability: 'Busy',
    currentWorkload: 3,
    assignedBuilding: 'b-util',
    rating: 4.6,
    completedTicketsCount: 230
  },
  {
    id: 'TECH-CV-01',
    name: 'D. Murugan',
    employeeId: 'EEC-EMP-3740',
    department: 'Civil Maintenance & Carpentry',
    primarySkill: 'Structural Repairs & Aluminum Glazing',
    secondarySkills: ['Acoustic Ceiling Tiles', 'Modular Desks', 'Door Closers & Locks'],
    phone: '+91 94443 66740',
    shift: 'Morning Shift (06:00 - 14:30)',
    availability: 'Available',
    currentWorkload: 1,
    assignedBuilding: 'b-civil',
    rating: 4.7,
    completedTicketsCount: 175
  }
];

export const INVENTORY = [
  {
    id: 'INV-PRJ-LMP88',
    itemCode: 'EEL-LMP-88',
    name: 'Epson ELPLP88 Replacement Ultra-High Efficiency Projector Lamp',
    category: 'Audiovisual Consumables',
    quantityOnHand: 4,
    reservedQuantity: 2,
    availableQuantity: 2,
    minimumThreshold: 3,
    storageLocation: 'Bin AV-04 (Main Store Room B-002)',
    unitCostINR: 8500,
    supplier: 'Epson South India Authorized Spares, Guindy, Chennai',
    leadTimeDays: 1,
    compatibleAssets: ['AST-PRJ-204', 'AST-PRJ-208', 'AST-PRJ-101'],
    status: 'adequate'
  },
  {
    id: 'INV-AC-COMP',
    itemCode: 'DKN-CMP-2T',
    name: 'Daikin 2.0-Ton Inverter Rotary Compressor (JT160G-P8Y1)',
    category: 'HVAC Major Components',
    quantityOnHand: 1,
    reservedQuantity: 0,
    availableQuantity: 1,
    minimumThreshold: 2,
    storageLocation: 'Bin HVAC-01 (Utility Yard Warehouse)',
    unitCostINR: 24000,
    supplier: 'Daikin Chillers & Spares Depot, Ambattur, Chennai',
    leadTimeDays: 3,
    compatibleAssets: ['AST-AC-204A', 'AST-AC-204B'],
    status: 'low_stock'
  },
  {
    id: 'INV-CAT6-SFP',
    itemCode: 'NET-SFP-10G',
    name: '10GBASE-SR SFP+ 850nm Multi-Mode Optical Transceiver Module',
    category: 'Networking & Optics',
    quantityOnHand: 8,
    reservedQuantity: 0,
    availableQuantity: 8,
    minimumThreshold: 4,
    storageLocation: 'Bin NET-12 (Server Room E-008)',
    unitCostINR: 4200,
    supplier: 'Redington India Network Distribution',
    leadTimeDays: 2,
    compatibleAssets: ['AST-SW-CORE'],
    status: 'adequate'
  },
  {
    id: 'INV-LED-36W',
    itemCode: 'LGT-TRF-36W',
    name: 'Philips 36W 2x2 Cleanroom Recessed LED Troffer Luminaire',
    category: 'Electrical & Lighting',
    quantityOnHand: 25,
    reservedQuantity: 4,
    availableQuantity: 21,
    minimumThreshold: 10,
    storageLocation: 'Rack ELEC-03 (Central Store)',
    unitCostINR: 1650,
    supplier: 'Signify Lighting India',
    leadTimeDays: 1,
    compatibleAssets: ['E-204', 'E-208', 'E-101'],
    status: 'adequate'
  },
  {
    id: 'INV-MCB-32A',
    itemCode: 'ELEC-MCB-32T',
    name: 'Schneider Acti9 32A C-Curve Triple Pole MCB (10kA)',
    category: 'Electrical Switchgear',
    quantityOnHand: 12,
    reservedQuantity: 1,
    availableQuantity: 11,
    minimumThreshold: 5,
    storageLocation: 'Bin ELEC-08 (Substation Control Room)',
    unitCostINR: 1250,
    supplier: 'Schneider Electric India Authorized Distributor',
    leadTimeDays: 1,
    compatibleAssets: ['SUB-001', 'AST-DG-01'],
    status: 'adequate'
  },
  {
    id: 'INV-HDMI-EXT',
    itemCode: 'AV-EXT-4K70',
    name: 'ATEN 4K HDBaseT HDMI over Cat6/6a Extender Kit (70m)',
    category: 'Audiovisual Hardware',
    quantityOnHand: 3,
    reservedQuantity: 1,
    availableQuantity: 2,
    minimumThreshold: 2,
    storageLocation: 'Bin AV-07 (Main Store Room B-002)',
    unitCostINR: 5800,
    supplier: 'ATEN Systems India, Vadapalani, Chennai',
    leadTimeDays: 2,
    compatibleAssets: ['AST-PRJ-204', 'AST-PRJ-208'],
    status: 'adequate'
  },
  {
    id: 'INV-PMP-SEAL',
    itemCode: 'PLM-SEAL-65',
    name: 'Kirloskar High-Pressure Silicon Carbide Mechanical Pump Seal (65mm)',
    category: 'Plumbing & Hydraulic Spares',
    quantityOnHand: 0, // OUT OF STOCK TO DEMONSTRATE BLOCKED WORK ORDERS
    reservedQuantity: 0,
    availableQuantity: 0,
    minimumThreshold: 2,
    storageLocation: 'Bin PLM-02 (Utility Yard)',
    unitCostINR: 3500,
    supplier: 'Kirloskar Industrial Pumps & Spares, Chennai',
    leadTimeDays: 4,
    compatibleAssets: ['AST-PMP-01'],
    status: 'out_of_stock'
  }
];

export const INCIDENTS = [
  {
    id: 'INC-2026-101',
    code: 'INC-2026-101',
    title: 'Projector Lamp Failure in Examination Classroom E-204',
    category: 'Audiovisual / Presentation',
    urgency: 'Critical',
    priority: 'P1 - High Urgency',
    status: 'In Progress', // Reported -> Analysed -> Assigned -> In Progress -> Resolved
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    assetId: 'AST-PRJ-204',
    affectedActivity: 'Anna University End-Semester Examination Scheduled Tomorrow at 09:00 AM (70 Candidates)',
    reportedBy: 'Dr. K. Arulmozhi (Professor & Chief Exam Superintendent)',
    reportChannel: 'Web Form / AI Chat',
    reportedAt: '2026-10-30T16:45:00+05:30',
    slaTargetHours: 4,
    slaDeadline: '2026-10-30T20:45:00+05:30',
    slaStatus: 'Within SLA (1.5h Remaining)',
    assignedTechnicianId: 'TECH-AV-01',
    requiredPartId: 'INV-PRJ-LMP88',
    partReserved: true,
    partQuantity: 1,
    summary: 'Projector bulb burst during system pre-flight check for tomorrow morning exam session. Requires lamp module replacement and optical dust clearing.',
    impactAnalysis: 'Critical impact: 70 students scheduled for digital question paper projection at 09:00. Room E-204 cannot host examination until resolved. Alternative room E-208 identified as fallback.',
    aiRecommendations: [
      'Reserve 1x Epson ELPLP88 lamp from Bin AV-04 immediately.',
      'Assign AV Specialist M. Suresh (EEC-EMP-4081) on high-priority dispatch.',
      'Notify Exam Cell and place E-208 on tentative standby if replacement exceeds 2 hours.',
      'Verify lamp ballast voltage prior to seating new bulb.'
    ],
    stateHistory: [
      { state: 'Reported', timestamp: '2026-10-30T16:45:00+05:30', updatedBy: 'Dr. K. Arulmozhi' },
      { state: 'Analysed', timestamp: '2026-10-30T16:47:12+05:30', updatedBy: 'TRINETRA AI Engine (Auto-categorized P1)' },
      { state: 'Assigned', timestamp: '2026-10-30T16:50:30+05:30', updatedBy: 'System Auto-Assigner -> M. Suresh' },
      { state: 'In Progress', timestamp: '2026-10-30T17:05:00+05:30', updatedBy: 'M. Suresh (Parts collected from store)' }
    ]
  },
  {
    id: 'INC-2026-102',
    code: 'INC-2026-102',
    title: 'Secondary Impeller Gland Leakage on Main Campus Water Pump AST-PMP-01',
    category: 'Plumbing & Hydraulic',
    urgency: 'Medium',
    priority: 'P2 - Moderate',
    status: 'Assigned (Blocked on Part)',
    buildingId: 'b-util',
    floorId: 'fl-util-0',
    roomId: 'SUB-001',
    assetId: 'AST-PMP-01',
    affectedActivity: 'Overhead Tank Reservoir Refilling for Academic Blocks',
    reportedBy: 'A. Shanmugam (Facilities Administrator)',
    reportChannel: 'Simulated Email Inbox',
    reportedAt: '2026-10-30T14:15:00+05:30',
    slaTargetHours: 24,
    slaDeadline: '2026-10-31T14:15:00+05:30',
    slaStatus: 'Within SLA',
    assignedTechnicianId: 'TECH-PL-01',
    requiredPartId: 'INV-PMP-SEAL',
    partReserved: false,
    partQuantity: 1,
    summary: 'Pump seal leaking approx 1.5 litres per hour. Spares currently out of stock. Automatic purchase request PR-2026-402 raised for urgent procurement.',
    impactAnalysis: 'Backup pump is currently carrying load. If backup pump fails, water deficit will occur within 18 hours across Main and Academic blocks.',
    aiRecommendations: [
      'Authorize emergency purchase request PR-2026-402 (Cost: ₹3,500) to restock mechanical seals.',
      'Switch primary duty to Pump 2 and throttle flow to 350 LPM to reduce mechanical stress.',
      'Alert Facilities Manager to monitor reservoir levels hourly.'
    ],
    stateHistory: [
      { state: 'Reported', timestamp: '2026-10-30T14:15:00+05:30', updatedBy: 'A. Shanmugam' },
      { state: 'Analysed', timestamp: '2026-10-30T14:18:00+05:30', updatedBy: 'TRINETRA AI Engine' },
      { state: 'Assigned', timestamp: '2026-10-30T14:22:00+05:30', updatedBy: 'Auto-Assigner -> K. Raman (Marked Blocked: Part Stock = 0)' }
    ]
  },
  {
    id: 'INC-2026-103',
    code: 'INC-2026-103',
    title: 'Intermittent Wi-Fi Disconnections in PG Block Seminar Hall PGB-202',
    category: 'Network & Connectivity',
    urgency: 'Low',
    priority: 'P3 - Low Urgency',
    status: 'Analysed',
    buildingId: 'b-pg',
    floorId: 'fl-pg-2',
    roomId: 'PGB-202',
    assetId: 'AST-WIFI-PGB2',
    affectedActivity: 'MBA Student Hybrid Case Presentations',
    reportedBy: 'Dr. R. Lakshmi (Head of Department)',
    reportChannel: 'AI Chat',
    reportedAt: '2026-10-30T15:30:00+05:30',
    slaTargetHours: 48,
    slaDeadline: '2026-11-01T15:30:00+05:30',
    slaStatus: 'Within SLA',
    assignedTechnicianId: 'TECH-NW-01',
    requiredPartId: null,
    partReserved: false,
    partQuantity: 0,
    summary: 'Access point rebooting under high client density. Suspected PoE budget renegotiation or channel co-interference with adjoining lab APs.',
    impactAnalysis: 'Minor classroom disruption. Presenters able to use hardwired HDMI podium in the interim.',
    aiRecommendations: [
      'Assign Network Engineer S. Anand for PoE switch port diagnostic and RF spectrum scan.',
      'Tune 5GHz channel allocation from 80MHz to 40MHz channel width to mitigate co-channel contention.'
    ],
    stateHistory: [
      { state: 'Reported', timestamp: '2026-10-30T15:30:00+05:30', updatedBy: 'Dr. R. Lakshmi' },
      { state: 'Analysed', timestamp: '2026-10-30T15:32:45+05:30', updatedBy: 'TRINETRA AI Engine' }
    ]
  }
];

export const WORK_ORDERS = [
  {
    id: 'WO-2026-081',
    code: 'WO-2026-081',
    incidentId: 'INC-2026-101',
    title: 'Replace Lamp Module & Test Projection in E-204',
    assignedTechnicianId: 'TECH-AV-01',
    technicianName: 'M. Suresh',
    status: 'In Progress',
    priority: 'Critical',
    scheduledStart: '2026-10-30T17:00:00+05:30',
    estimatedDurationMinutes: 45,
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    partsRequired: [{ partId: 'INV-PRJ-LMP88', quantity: 1, reserved: true }],
    checkList: [
      { task: 'Isolate main breaker for Projector circuit in sub-panel E2', completed: true },
      { task: 'Unmount lamp door and extract burnt bulb module safely', completed: true },
      { task: 'Vacuum optical intake filter and inspect blower fan', completed: false },
      { task: 'Install new Epson ELPLP88 lamp and torque locking screws', completed: false },
      { task: 'Reset lamp usage timer in OSD menu to 0 hours', completed: false },
      { task: 'Execute 15-minute test pattern and verify 1080p color alignment', completed: false }
    ],
    notes: 'Examination superintendent requested signoff before 19:30 tonight.'
  },
  {
    id: 'WO-2026-082',
    code: 'WO-2026-082',
    incidentId: 'INC-2026-102',
    title: 'Overhaul Mechanical Seal on Water Pump AST-PMP-01',
    assignedTechnicianId: 'TECH-PL-01',
    technicianName: 'K. Raman',
    status: 'Blocked (Awaiting Procurement)',
    priority: 'Medium',
    scheduledStart: '2026-10-31T09:00:00+05:30',
    estimatedDurationMinutes: 120,
    buildingId: 'b-util',
    floorId: 'fl-util-0',
    roomId: 'SUB-001',
    partsRequired: [{ partId: 'INV-PMP-SEAL', quantity: 1, reserved: false }],
    checkList: [
      { task: 'Procure 65mm silicon carbide mechanical seal (PR-2026-402)', completed: false },
      { task: 'Lockout/Tagout pump circuit breaker SUB-CB-14', completed: false },
      { task: 'Drain pump casing and isolate suction/discharge gate valves', completed: false },
      { task: 'Disassemble coupling and replace damaged mechanical seal', completed: false }
    ],
    notes: 'Blocked awaiting procurement approval and supplier delivery.'
  }
];

export const PURCHASE_REQUESTS = [
  {
    id: 'PR-2026-401',
    code: 'PR-2026-401',
    title: 'Restock Epson ELPLP88 Projector Lamps (Buffer for Exam Season)',
    requestedBy: 'USR-ADMIN-01',
    requesterName: 'A. Shanmugam (Facilities Administrator)',
    requesterRole: 'Facilities Administrator',
    items: [
      { partId: 'INV-PRJ-LMP88', name: 'Epson ELPLP88 Projector Lamp', quantity: 4, unitCost: 8500, totalCost: 34000 }
    ],
    totalAmountINR: 34000,
    status: 'Pending Approval', // Pending Approval -> Approved / Rejected -> Ordered
    urgency: 'High',
    justification: 'Current available stock is 2 units with high upcoming exam hall utilisation across 18 auditoriums and lecture rooms.',
    raisedAt: '2026-10-30T17:15:00+05:30',
    approverRoleRequired: 'Procurement Approver',
    approvedBy: null,
    approvalTimestamp: null,
    approvalNotes: ''
  },
  {
    id: 'PR-2026-402',
    code: 'PR-2026-402',
    title: 'Emergency Procurement: Kirloskar Pump Mechanical Seals',
    requestedBy: 'USR-TECH-01',
    requesterName: 'K. Raman (Hydraulic Technician)',
    requesterRole: 'Technician',
    items: [
      { partId: 'INV-PMP-SEAL', name: 'Kirloskar 65mm Silicon Carbide Seal', quantity: 3, unitCost: 3500, totalCost: 10500 }
    ],
    totalAmountINR: 10500,
    status: 'Pending Approval',
    urgency: 'Critical',
    justification: 'Work order WO-2026-082 is blocked. Campus main water pump secondary seal has failed with zero inventory on hand.',
    raisedAt: '2026-10-30T14:30:00+05:30',
    approverRoleRequired: 'Procurement Approver',
    approvedBy: null,
    approvalTimestamp: null,
    approvalNotes: ''
  }
];

export const BOOKINGS = [
  {
    id: 'BKG-2026-501',
    title: 'Anna University End-Semester Examination: Embedded Systems & IoT (ECE)',
    buildingId: 'b-main',
    floorId: 'fl-main-2',
    roomId: 'E-204',
    date: '2026-10-31',
    startTime: '09:00',
    endTime: '12:00',
    attendeesCount: 70,
    organizer: 'Exam Cell (Chief Supt. Dr. K. Arulmozhi)',
    status: 'At Risk (Classroom In Maintenance)',
    requiresProjector: true,
    requiresAC: true,
    conflictFlag: true
  },
  {
    id: 'BKG-2026-502',
    title: 'AI & Data Science Faculty Research Colloquium',
    buildingId: 'b-acad',
    floorId: 'fl-acad-2',
    roomId: 'AB-201',
    date: '2026-10-31',
    startTime: '14:00',
    endTime: '17:00',
    attendeesCount: 55,
    organizer: 'Dr. R. Lakshmi (HOD CSE)',
    status: 'Confirmed',
    requiresProjector: true,
    requiresAC: true,
    conflictFlag: false
  },
  {
    id: 'BKG-2026-503',
    title: 'Special Placement Drive: Global Tier-1 Automotive Campus Recruitment',
    buildingId: 'b-audi',
    floorId: 'fl-audi-0',
    roomId: 'TRP-001',
    date: '2026-10-31',
    startTime: '08:30',
    endTime: '16:00',
    attendeesCount: 1200,
    organizer: 'Centre for Placement & Training',
    status: 'Confirmed',
    requiresProjector: true,
    requiresAC: true,
    conflictFlag: false
  }
];

export const ROLES = [
  {
    id: 'role-student-faculty',
    name: 'Student / Faculty',
    code: 'STUDENT_FACULTY',
    description: 'Can view campus map, check room availability, view public announcements, and report maintenance incidents.',
    permissions: ['VIEW_CAMPUS', 'VIEW_ROOMS', 'REPORT_INCIDENT', 'VIEW_MY_INCIDENTS']
  },
  {
    id: 'role-technician',
    name: 'Technician',
    code: 'TECHNICIAN',
    description: 'Can view assigned work orders, update task checklists, request parts, and log repair resolutions.',
    permissions: ['VIEW_CAMPUS', 'VIEW_WORK_ORDERS', 'UPDATE_WORK_ORDER', 'REQUEST_PARTS', 'VIEW_ROOM_ASSETS']
  },
  {
    id: 'role-dept-manager',
    name: 'Department Manager',
    code: 'DEPT_MANAGER',
    description: 'Can manage departmental classrooms, schedule lectures and examinations, resolve booking conflicts, and track department SLA.',
    permissions: ['VIEW_CAMPUS', 'MANAGE_ROOM_BOOKINGS', 'VIEW_INCIDENTS', 'REPORT_INCIDENT', 'REQUEST_ROOM_RELOCATION', 'VIEW_DEPT_METRICS']
  },
  {
    id: 'role-facilities-admin',
    name: 'Facilities Administrator',
    code: 'FACILITIES_ADMIN',
    description: 'Central operations manager: full incident dispatch, technician workload management, maintenance schedule control, Digital Twin simulator execution.',
    permissions: ['VIEW_CAMPUS', 'MANAGE_INCIDENTS', 'ASSIGN_TECHNICIANS', 'MANAGE_WORK_ORDERS', 'RESERVE_INVENTORY', 'RUN_SIMULATION', 'DISRUPT_SCENARIOS', 'VIEW_ALL_METRICS']
  },
  {
    id: 'role-procurement-approver',
    name: 'Procurement Approver',
    code: 'PROCUREMENT_APPROVER',
    description: 'Financial and inventory authority: authorizes purchase requests, approves emergency stock acquisitions, verifies cost budgets. Separation of duties strictly enforced.',
    permissions: ['VIEW_CAMPUS', 'VIEW_INVENTORY', 'APPROVE_PURCHASE_REQUESTS', 'REJECT_PURCHASE_REQUESTS', 'VIEW_EXPENDITURES']
  },
  {
    id: 'role-system-admin',
    name: 'System Administrator',
    code: 'SYSTEM_ADMIN',
    description: 'Full administrative access: user management, role assignment, system configurations, audit log inspection, raw database export/reset.',
    permissions: ['ALL_PERMISSIONS']
  }
];

export const USERS = [
  {
    id: 'USR-FAC-01',
    name: 'Dr. K. Arulmozhi',
    email: 'arulmozhi.k@eec.srmrmp.edu.in',
    role: 'Student / Faculty',
    roleCode: 'STUDENT_FACULTY',
    department: 'Electronics & Communication Engineering',
    avatar: '👩‍🏫',
    designation: 'Professor & Chief Exam Superintendent'
  },
  {
    id: 'USR-TECH-01',
    name: 'M. Suresh',
    email: 'suresh.m@eec.srmrmp.edu.in',
    role: 'Technician',
    roleCode: 'TECHNICIAN',
    department: 'AV & Smart Infrastructure Systems',
    avatar: '👨‍🔧',
    designation: 'Senior Audiovisual Specialist'
  },
  {
    id: 'USR-MGR-01',
    name: 'Dr. R. Lakshmi',
    email: 'lakshmi.r@eec.srmrmp.edu.in',
    role: 'Department Manager',
    roleCode: 'DEPT_MANAGER',
    department: 'Computer Science & Engineering',
    avatar: '👩‍💼',
    designation: 'Professor & Head of Department'
  },
  {
    id: 'USR-ADMIN-01',
    name: 'A. Shanmugam',
    email: 'shanmugam.a@eec.srmrmp.edu.in',
    role: 'Facilities Administrator',
    roleCode: 'FACILITIES_ADMIN',
    department: 'Estate Office & Campus Infrastructure',
    avatar: '👨‍💼',
    designation: 'Director of Campus Facilities & Operations'
  },
  {
    id: 'USR-PROC-01',
    name: 'V. Jayaraman',
    email: 'jayaraman.v@eec.srmrmp.edu.in',
    role: 'Procurement Approver',
    roleCode: 'PROCUREMENT_APPROVER',
    department: 'Central Finance & Procurement Directorate',
    avatar: '⚖️',
    designation: 'Chief Procurement & Financial Officer'
  },
  {
    id: 'USR-SYS-01',
    name: 'TRINETRA Superadmin',
    email: 'admin@trinetra.srmrmp.edu.in',
    role: 'System Administrator',
    roleCode: 'SYSTEM_ADMIN',
    department: 'Enterprise Systems & Digital Twin Operations',
    avatar: '🛡️',
    designation: 'Principal Operations Architect'
  }
];

export const SIMULATION_SCENARIOS = [
  {
    id: 'SCENARIO-1',
    title: 'Classroom Unavailable Before University Examination',
    category: 'Academic & Space Crisis',
    triggerEntity: 'Room E-204 (Main Academic Block)',
    severity: 'High',
    description: 'The ceiling projector in Examination Hall E-204 fails 14 hours before the Anna University End-Semester exam with 70 students scheduled.',
    deterministicOutcomes: {
      affectedBuilding: 'Main Academic & Admin Block (b-main)',
      affectedRooms: ['E-204'],
      affectedStudents: 70,
      resourceShortage: 'Epson ELPLP88 Projector Lamp (2 units available in stock)',
      recommendedRelocation: 'Room E-208 (Interactive Multimedia Hall, 75 Seats, Available)',
      estimatedRecoveryMinutes: 45,
      costImpactINR: 8500
    },
    interventions: [
      { action: 'Reserve Lamp & Dispatch Tech', automated: true },
      { action: 'Relocate Scheduled Exam to E-208', automated: true },
      { action: 'Send SMS & Portal Broadcast to 70 Candidates', automated: true }
    ]
  },
  {
    id: 'SCENARIO-2',
    title: 'Technician Suddenly Unavailable (Shift Disruption)',
    category: 'Workforce Disruption',
    triggerEntity: 'R. Karthik (Senior Electrician, TECH-EL-01)',
    severity: 'Medium',
    description: 'Senior Electrician reports medical emergency midway through morning shift while holding 2 open high-priority work orders.',
    deterministicOutcomes: {
      affectedBuilding: 'Central Substation & Utility Yard (b-util)',
      affectedWorkOrders: ['WO-2026-079 (Substation Breaker Inspection)', 'WO-2026-080 (DG Load Balance)'],
      reassignmentCandidate: 'M. Suresh (AV Specialist / Cross-trained in UPS & Switchgear) or On-Call Shift Lead',
      estimatedWorkloadShiftHours: 3.5,
      costImpactINR: 0
    },
    interventions: [
      { action: 'Detect technician unavailability via attendance beacon', automated: true },
      { action: 'Auto-reassign open work orders to best available technician', automated: true },
      { action: 'Re-balance shift schedule and notify Facilities Supervisor', automated: true }
    ]
  },
  {
    id: 'SCENARIO-3',
    title: 'Core Switch Fiber Link Failure (Multi-Building Outage)',
    category: 'Network Infrastructure Failure',
    triggerEntity: 'Cisco Catalyst 9500 Core Switch (AST-SW-CORE)',
    severity: 'Critical',
    description: 'Underground optical conduit severed during garden landscaping, taking down primary fiber trunks to CS & IT Block and PG Block.',
    deterministicOutcomes: {
      affectedBuilding: 'CS & IT Academic Block (b-acad) and PG & Research Block (b-pg)',
      affectedRoomsCount: 38,
      affectedLabsCount: 8,
      affectedUsersEstimated: 1450,
      backupPath: 'Redundant 10G Microwave / OSPF Secondary Ring via Electronics Block',
      estimatedRecoveryMinutes: 15,
      costImpactINR: 12000
    },
    interventions: [
      { action: 'Auto-failover to redundant ring topology via Electronics Block', automated: true },
      { action: 'Dispatch Network Team with Optical OTDR Splicer kit', automated: true },
      { action: 'Notify Computer Labs to suspend online cloud exams temporarily', automated: true }
    ]
  },
  {
    id: 'SCENARIO-4',
    title: 'Critical Spare Part Out of Stock During Active Breakdown',
    category: 'Supply Chain & Inventory Failure',
    triggerEntity: 'AST-PMP-01 (Kirloskar Water Supply Pump)',
    severity: 'High',
    description: 'Campus water pump mechanical seal blows out. Physical inventory count is 0 units. Overselling prevented by backend lock.',
    deterministicOutcomes: {
      affectedBuilding: 'Central Substation & Entire Campus Water Distribution',
      blockedWorkOrders: ['WO-2026-082'],
      waterReserveBufferHours: 18,
      stockStatus: 'Out of Stock (Zero Units in Bin PLM-02)',
      procurementAction: 'Emergency Purchase Request PR-2026-402 raised for ₹10,500',
      leadTimeDays: 1
    },
    interventions: [
      { action: 'Trigger Emergency Purchase Workflow with Expedited Tag', automated: true },
      { action: 'Route PR-2026-402 to Procurement Approver V. Jayaraman', automated: true },
      { action: 'Enforce Separation of Duties (Technician cannot approve own request)', automated: true },
      { action: 'Throttle auxiliary pump flow to conserve water pressure', automated: true }
    ]
  },
  {
    id: 'SCENARIO-5',
    title: 'Unexpected Building Occupancy Surge (CampusOps Ble Alert)',
    category: 'Crowd & Density Anomaly',
    triggerEntity: 'Mechanical Block Ground Floor Workshop Corridor',
    severity: 'Medium',
    description: 'CampusOps BLE signals detect an unexpected surge of 280+ anonymous active devices in Mechanical Block during a non-scheduled symposium spillover.',
    deterministicOutcomes: {
      affectedBuilding: 'Mechanical Engineering Block (b-mech)',
      detectedSignalCount: 284,
      normalBaselineThreshold: 60,
      crowdDensityIndex: '4.7x Above Baseline (Surge Warning)',
      safetyRisks: ['Fire exit obstruction near Workshop Bay 2', 'HVAC load ceiling breached'],
      recommendedIntervention: 'Open Secondary Egress Doors & Activate Auxiliary Ventilation'
    },
    interventions: [
      { action: 'Highlight Mechanical Block in Amber / Crowd Warning in 3D Twin', automated: true },
      { action: 'Deploy Security Patrol to guide pedestrian traffic to Central Lawn', automated: true },
      { action: 'Ramp up industrial ventilation fans to 100% capacity', automated: true }
    ]
  },
  {
    id: 'SCENARIO-6',
    title: 'TANGEDCO Grid Power Trip & Automatic DG Failover',
    category: 'Electrical Power Grid Emergency',
    triggerEntity: '11kV HT Substation (SUB-001)',
    severity: 'Critical',
    description: 'External Chennai 11kV grid feeder drops suddenly. TRINETRA monitors automatic AMF transition to twin 500kVA Cummins diesel generators.',
    deterministicOutcomes: {
      affectedBuilding: 'Entire Campus (9 Buildings)',
      gridStatus: 'Feeder Trip (TANGEDCO Ramapuram Substation 11kV Drop)',
      dgStatus: 'Twin 500kVA Cummins Generators Sync & Online in 8.4 Seconds',
      upsHoldTimeSeconds: 8.4,
      criticalLoadsPreserved: 'Server Room E-008, Exam Halls, Research Labs (100% Uptime)',
      dieselReserveHours: 36,
      estimatedDieselConsumptionLitersPerHour: 110
    },
    interventions: [
      { action: 'Log grid blackout and verify AMF breaker contactor closure', automated: true },
      { action: 'Shed non-essential ornamental and perimeter floodlights', automated: true },
      { action: 'Broadcast Campus Power Status to Central Command Room HUD', automated: true }
    ]
  }
];

export const INITIAL_EMAIL_INBOX = [
  {
    id: 'EML-001',
    from: 'Dr. K. Arulmozhi <arulmozhi.k@eec.srmrmp.edu.in>',
    subject: 'URGENT: Projector failure in E-204 before tomorrow exam',
    date: '2026-10-30 16:40',
    body: `Dear Facilities & Maintenance Team,

During our pre-flight check in Classroom E-204 this afternoon, the ceiling projector made a popping noise and stopped working. The power indicator is blinking red.

We have the Anna University End-Semester Examination for 70 candidates scheduled in E-204 tomorrow morning at 09:00 AM. The examination involves digital question paper projection and question walkthroughs.

Please arrange immediate technical inspection and replacement. If the projector cannot be fixed this evening, please allocate an alternative air-conditioned hall with at least 70 seats.

Regards,
Dr. K. Arulmozhi
Professor & Chief Superintendent of Examinations
SRM Easwari Engineering College`,
    status: 'Processed by AI',
    extractedEntities: {
      issueType: 'Projector Lamp Failure / Display Hardware',
      building: 'Main Academic & Admin Block (b-main)',
      floor: 'Second Floor',
      room: 'E-204',
      asset: 'Epson PowerLite Projector (AST-PRJ-204)',
      urgency: 'Critical',
      affectedActivity: 'Anna University Examination at 09:00 AM',
      requiredMaintenance: 'Lamp replacement & fallback room allocation'
    }
  },
  {
    id: 'EML-002',
    from: 'A. Shanmugam <shanmugam.a@eec.srmrmp.edu.in>',
    subject: 'Maintenance Notice: Secondary Water Pump Gland Leak',
    date: '2026-10-30 14:10',
    body: `Team,

During routine morning inspections at the Central Substation & Utility Yard, the pump technician observed persistent water leakage around the mechanical seal of 15HP Water Pump AST-PMP-01.

Leakage rate is currently around 1.5 litres per hour. Our storeroom records indicate we have 0 units of 65mm silicon carbide seals remaining. Please raise an emergency purchase requisition and keep backup pump #2 on primary duty.

Regards,
A. Shanmugam
Director of Campus Facilities`,
    status: 'Processed by AI',
    extractedEntities: {
      issueType: 'Mechanical Pump Seal Leakage',
      building: 'Central Substation & Utility Yard (b-util)',
      floor: 'Ground Floor',
      room: 'SUB-001',
      asset: 'Kirloskar 15HP Water Pump (AST-PMP-01)',
      urgency: 'Medium',
      affectedActivity: 'Campus Overhead Tank Refilling',
      requiredMaintenance: 'Emergency seal procurement and replacement'
    }
  },
  {
    id: 'EML-003',
    from: 'Dr. R. Lakshmi <lakshmi.r@eec.srmrmp.edu.in>',
    subject: 'Complaint: Wi-Fi packet drops during MBA presentations in PGB-202',
    date: '2026-10-30 15:25',
    body: `Hello TRINETRA Support,

Students in MBA Seminar Hall PGB-202 (2nd Floor, PG Block) are experiencing frequent disconnections and packet drops during hybrid project presentations. Approximately 50 laptops were connected simultaneously.

Please have the network team review the Aruba AP signal strength and PoE configuration in that hall.

Best regards,
Dr. R. Lakshmi
Head, Department of Computer Science & Engineering`,
    status: 'Processed by AI',
    extractedEntities: {
      issueType: 'Wi-Fi Network Congestion / Drop',
      building: 'PG & Research Block (b-pg)',
      floor: 'Second Floor',
      room: 'PGB-202',
      asset: 'Aruba AP-515 (AST-WIFI-PGB2)',
      urgency: 'Low',
      affectedActivity: 'MBA Student Hybrid Presentations',
      requiredMaintenance: 'RF spectrum tuning and PoE budget audit'
    }
  }
];

export const AUDIT_LOG_SEED = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-30T14:18:00+05:30',
    userId: 'USR-ADMIN-01',
    userName: 'A. Shanmugam',
    role: 'Facilities Administrator',
    action: 'INCIDENT_CREATED',
    targetEntity: 'INC-2026-102 (Water Pump Seal Leak)',
    details: 'Created incident from simulated email report. Auto-assigned to K. Raman.'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-30T14:30:15+05:30',
    userId: 'USR-TECH-01',
    userName: 'K. Raman',
    role: 'Technician',
    action: 'PURCHASE_REQUEST_RAISED',
    targetEntity: 'PR-2026-402 (Kirloskar Mechanical Seals)',
    details: 'Raised emergency PR for ₹10,500. Work order marked blocked due to stockout.'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-30T16:47:12+05:30',
    userId: 'USR-FAC-01',
    userName: 'Dr. K. Arulmozhi',
    role: 'Student / Faculty',
    action: 'INCIDENT_CREATED',
    targetEntity: 'INC-2026-101 (Projector Failure E-204)',
    details: 'Reported exam projector lamp failure. AI Engine classified as P1 Critical.'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-10-30T16:50:30+05:30',
    userId: 'USR-ADMIN-01',
    userName: 'A. Shanmugam',
    role: 'Facilities Administrator',
    action: 'WORK_ORDER_DISPATCHED',
    targetEntity: 'WO-2026-081 -> M. Suresh',
    details: 'Dispatched work order for lamp replacement. Reserved 1x INV-PRJ-LMP88.'
  },
  {
    id: 'AUD-005',
    timestamp: '2026-10-30T17:05:00+05:30',
    userId: 'USR-TECH-01',
    userName: 'M. Suresh',
    role: 'Technician',
    action: 'WORK_ORDER_IN_PROGRESS',
    targetEntity: 'WO-2026-081',
    details: 'Collected lamp from central store Bin AV-04. Initiated isolation procedure in E-204.'
  }
];
