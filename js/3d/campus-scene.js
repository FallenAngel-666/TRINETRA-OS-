/**
 * TRINETRA - High-Fidelity 3D Campus & Architectural Digital Twin
 * Three.js Procedural Architectural Engine
 * - Full 9 Verified Buildings with 4-sided elevations, realistic roofs & materials
 * - Enterable Buildings, Exploded Floor Separator, Floor Isolation
 * - Detailed Classroom 3D Interior (Desks, Podium, Projector, Smartboard, AC, WiFi, Safety)
 * - Dynamic Real-Time Health Coloring (Green/Amber/Red)
 * - Smooth Camera Interpolation (OrbitControls + Lerp)
 * - Operational Twin, Photorealistic, 2D Schematic, and Satellite Modes
 */

import { db } from '../services/db.js';
import { campusOps } from '../services/campusops-engine.js';

export class CampusScene {
  constructor(containerElement, onSelectCallback) {
    this.container = containerElement;
    this.onSelect = onSelectCallback || (() => {});

    // State
    this.currentViewMode = 'photorealistic'; // 'photorealistic', 'operational', 'schematic', 'satellite'
    this.currentLevel = 'campus'; // 'campus', 'building', 'floor', 'room'
    this.selectedBuildingId = null;
    this.selectedFloorNumber = null;
    this.selectedRoomId = null;
    this.isExploded = false;
    this.explosionFactor = 0; // 0 to 1
    this.isolatedFloorNumber = null;

    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Scene Graph Groups
    this.campusGroup = new THREE.Group();
    this.buildingGroups = new Map(); // buildingId -> Group
    this.buildingFloorGroups = new Map(); // buildingId -> [FloorGroup0, FloorGroup1, ...]
    this.roomGroups = new Map(); // roomId -> Group
    this.roomInteriorGroup = new THREE.Group();
    this.bleParticlesGroup = new THREE.Group();
    this.labelsGroup = new THREE.Group();

    // Lighting
    this.sunLight = null;
    this.ambientLight = null;
    this.hemiLight = null;

    // Camera animation target
    this.cameraTarget = {
      position: new THREE.Vector3(0, 85, 130),
      lookAt: new THREE.Vector3(0, 0, 0),
      fov: 45
    };
    this.isAnimatingCamera = false;

    // Material Library
    this.initMaterials();
    this.initEngine();
    if (typeof THREE !== 'undefined') {
      this.buildCampusEnvironment();
      this.buildAllBuildings();
      this.setupInteractivity();
      this.animate();
    }

    // Subscribe to DB and CampusOps for real-time reactivity
    db.subscribe('*', () => this.updateDynamicStatus());
    campusOps.subscribe(() => this.updateBleOverlay());
  }

  initMaterials() {
    if (typeof THREE === 'undefined') return;
    this.materials = {
      // Architectural Wall Finishes
      concreteIvory: new THREE.MeshStandardMaterial({ color: 0xF1EFEA, roughness: 0.65, metalness: 0.1 }),
      concreteGray: new THREE.MeshStandardMaterial({ color: 0xD4D8DE, roughness: 0.7, metalness: 0.15 }),
      brickTerracotta: new THREE.MeshStandardMaterial({ color: 0xB85D38, roughness: 0.8, metalness: 0.05 }),
      graniteDark: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.3 }),
      columnPlinth: new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.5, metalness: 0.2 }),

      // Architectural Glass (Double glazed facade with subtle blue reflection)
      facadeGlass: new THREE.MeshPhysicalMaterial({
        color: 0x88CCEE,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.65,
        transmission: 0.6,
        reflectivity: 0.9
      }),

      // Roofs & Slabs
      roofSlab: new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.85, metalness: 0.1 }),
      floorPlate: new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.6, metalness: 0.15 }),
      mepMetal: new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.4, metalness: 0.7 }),
      solarPanel: new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.2, metalness: 0.8 }),

      // Landscape
      grassLawns: new THREE.MeshStandardMaterial({ color: 0x4E8A42, roughness: 0.9, metalness: 0.02 }),
      asphaltRoad: new THREE.MeshStandardMaterial({ color: 0x2D3748, roughness: 0.85, metalness: 0.1 }),
      sidewalkPavers: new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.75, metalness: 0.05 }),
      roadMarking: new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),

      // Interior Materials
      interiorFloor: new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.3, metalness: 0.1 }),
      interiorWall: new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.8, metalness: 0.05 }),
      deskWood: new THREE.MeshStandardMaterial({ color: 0x9A6B43, roughness: 0.5, metalness: 0.1 }),
      deskFrame: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.6 }),
      smartboardBezel: new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.7 }),
      smartboardDisplay: new THREE.MeshBasicMaterial({ color: 0x38BDF8 }),
      projectorBody: new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.3, metalness: 0.4 }),
      projectorBeam: new THREE.MeshBasicMaterial({ color: 0x67E8F9, transparent: true, opacity: 0.25 }),

      // Holographic & Status Glow Materials
      statusGreen: new THREE.MeshStandardMaterial({ color: 0x22C55E, emissive: 0x15803D, emissiveIntensity: 0.6, roughness: 0.3 }),
      statusAmber: new THREE.MeshStandardMaterial({ color: 0xF59E0B, emissive: 0xB45309, emissiveIntensity: 0.7, roughness: 0.3 }),
      statusRed: new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xB91C1C, emissiveIntensity: 0.8, roughness: 0.3 }),
      hologramWireframe: new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe: true, transparent: true, opacity: 0.35 }),
      selectionHalo: new THREE.MeshBasicMaterial({ color: 0x38BDF8, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    };
  }

  initEngine() {
    if (typeof THREE === 'undefined') {
      console.error('Three.js library not detected. Loading fallback...');
      this.container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--primary-blue-dark); text-align: center; padding: 24px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🏛️</div>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">TRINETRA 3D Campus Digital Twin</h2>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 500px; margin-bottom: 16px;">
            Connecting to WebGL 3D Engine for SRM Easwari Engineering College (Bharathi Salai, Ramapuram)...
          </p>
          <div style="font-size: 11px; background: #FFFFFF; border: 1px solid var(--border-color); padding: 8px 14px; border-radius: 20px;">
            Please ensure an active network connection to load the Three.js 3D rendering engine, or serve locally.
          </div>
        </div>
      `;
      return;
    }

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF0F4F8); // Clean enterprise neutral background
    this.scene.fog = new THREE.FogExp2(0xF0F4F8, 0.0035);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    this.camera.position.set(0, 95, 150);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip under ground
      this.controls.minDistance = 3;
      this.controls.maxDistance = 450;
      this.controls.target.set(0, 0, 0);
    }

    // Lights
    this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.3);
    this.sunLight.position.set(80, 140, 70);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 350;
    this.sunLight.shadow.camera.left = -150;
    this.sunLight.shadow.camera.right = 150;
    this.sunLight.shadow.camera.top = 150;
    this.sunLight.shadow.camera.bottom = -150;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    this.hemiLight = new THREE.HemisphereLight(0xF8FAFC, 0x94A3B8, 0.65);
    this.hemiLight.position.set(0, 100, 0);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xE2E8F0, 0.35);
    this.scene.add(this.ambientLight);

    // Groups
    this.scene.add(this.campusGroup);
    this.scene.add(this.roomInteriorGroup);
    this.scene.add(this.bleParticlesGroup);
    this.scene.add(this.labelsGroup);

    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  buildCampusEnvironment() {
    // 1. Campus Ground Base (SRM Easwari Engineering College Boundary)
    const groundGeo = new THREE.PlaneGeometry(320, 240);
    const ground = new THREE.Mesh(groundGeo, this.materials.grassLawns);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.campusGroup.add(ground);

    // 2. Bharathi Salai Main Arterial Road (Front Road running parallel to campus front)
    const mainRoadGeo = new THREE.PlaneGeometry(320, 18);
    const mainRoad = new THREE.Mesh(mainRoadGeo, this.materials.asphaltRoad);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.05, 105);
    mainRoad.receiveShadow = true;
    this.campusGroup.add(mainRoad);

    // Road White Centerline Markings
    for (let x = -150; x <= 150; x += 15) {
      const lineGeo = new THREE.PlaneGeometry(8, 0.6);
      const line = new THREE.Mesh(lineGeo, this.materials.roadMarking);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.08, 105);
      this.campusGroup.add(line);
    }

    // 3. Campus Entrance Gateway & Arch
    const gateGeo = new THREE.BoxGeometry(28, 7, 2);
    const gateArch = new THREE.Mesh(gateGeo, this.materials.graniteDark);
    gateArch.position.set(0, 3.5, 96);
    gateArch.castShadow = true;
    this.campusGroup.add(gateArch);

    // Gate Signage Board ("SRM EASWARI ENGINEERING COLLEGE")
    const signGeo = new THREE.PlaneGeometry(24, 2.5);
    const signMat = new THREE.MeshBasicMaterial({ color: 0x3978C6 });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 4.5, 97.05);
    this.campusGroup.add(signMesh);

    // 4. Internal Circulation Road Network
    // Central Spine (from Main Gate towards Main Block and Library)
    const spineRoadGeo = new THREE.PlaneGeometry(14, 180);
    const spineRoad = new THREE.Mesh(spineRoadGeo, this.materials.asphaltRoad);
    spineRoad.rotation.x = -Math.PI / 2;
    spineRoad.position.set(0, 0.06, 6);
    spineRoad.receiveShadow = true;
    this.campusGroup.add(spineRoad);

    // Cross Arterial Connecting CS Block, Main Block, and ECE Block
    const crossRoadGeo = new THREE.PlaneGeometry(240, 12);
    const crossRoad = new THREE.Mesh(crossRoadGeo, this.materials.asphaltRoad);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.07, 24);
    crossRoad.receiveShadow = true;
    this.campusGroup.add(crossRoad);

    // 5. Pedestrian Sidewalks & Paver Plazas
    const plazaGeo = new THREE.PlaneGeometry(60, 40);
    const plaza = new THREE.Mesh(plazaGeo, this.materials.sidewalkPavers);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.08, 0);
    plaza.receiveShadow = true;
    this.campusGroup.add(plaza);

    // 6. Student & Faculty Parking Plaza
    const parkingGeo = new THREE.PlaneGeometry(55, 30);
    const parking = new THREE.Mesh(parkingGeo, this.materials.asphaltRoad);
    parking.rotation.x = -Math.PI / 2;
    parking.position.set(-95, 0.07, 75);
    parking.receiveShadow = true;
    this.campusGroup.add(parking);

    // Parking Bays & 3D Vehicles
    for (let px = -115; px <= -75; px += 9) {
      this.createVehicle(px, 75, Math.random() > 0.5 ? 0x3978C6 : 0x94A3B8);
    }

    // 7. Landscaping Trees & Gardens
    const treePositions = [
      { x: -25, z: 45 }, { x: 25, z: 45 }, { x: -40, z: 15 }, { x: 40, z: 15 },
      { x: -115, z: 25 }, { x: 115, z: 25 }, { x: -90, z: -35 }, { x: 90, z: -35 },
      { x: -20, z: -25 }, { x: 20, z: -25 }, { x: -75, z: 95 }, { x: 75, z: 95 }
    ];
    treePositions.forEach(pos => this.createCampusTree(pos.x, pos.z));
  }

  createCampusTree(x, z) {
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 1.5, z);
    trunk.castShadow = true;

    const foliageGeo = new THREE.DodecahedronGeometry(2.4, 1);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2E6930, roughness: 0.8 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(x, 4.2, z);
    foliage.castShadow = true;

    this.campusGroup.add(trunk);
    this.campusGroup.add(foliage);
  }

  createVehicle(x, z, colorHex) {
    const carGroup = new THREE.Group();
    // Body
    const bodyGeo = new THREE.BoxGeometry(4.2, 1.2, 2.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.5, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    carGroup.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2.4, 0.9, 1.9);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.2 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.2, 1.7, 0);
    cabin.castShadow = true;
    carGroup.add(cabin);

    carGroup.position.set(x, 0, z);
    this.campusGroup.add(carGroup);
  }

  buildAllBuildings() {
    const buildings = db.getBuildings();

    buildings.forEach(bData => {
      const bGroup = this.createBuilding3D(bData);
      this.buildingGroups.set(bData.id, bGroup);
      this.campusGroup.add(bGroup);
    });
  }

  /**
   * Generates a fully detailed, 4-elevation building with separated floor layers and roof infrastructure
   */
  createBuilding3D(data) {
    const bGroup = new THREE.Group();
    bGroup.name = `building-${data.id}`;
    bGroup.userData = { type: 'building', buildingId: data.id, data };
    bGroup.position.set(data.coordinates.x, 0, data.coordinates.z);

    const { width, depth, height } = data.dimensions;
    const floorHeight = height / data.floorsCount;
    const floorGroups = [];

    // 1. Plinth Foundation
    const plinthGeo = new THREE.BoxGeometry(width + 2, 0.8, depth + 2);
    const plinth = new THREE.Mesh(plinthGeo, this.materials.columnPlinth);
    plinth.position.y = 0.4;
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    bGroup.add(plinth);

    // 2. Multi-Storey Floor Layers
    for (let f = 0; f < data.floorsCount; f++) {
      const floorGroup = new THREE.Group();
      floorGroup.name = `floor-${data.id}-${f}`;
      floorGroup.userData = {
        type: 'floor',
        buildingId: data.id,
        floorNumber: f,
        baseY: f * floorHeight + 0.8
      };
      floorGroup.position.y = f * floorHeight + 0.8;

      // Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(width, 0.4, depth);
      const slab = new THREE.Mesh(slabGeo, this.materials.floorPlate);
      slab.position.y = 0.2;
      slab.castShadow = true;
      slab.receiveShadow = true;
      floorGroup.add(slab);

      // Floor Exterior Envelope & Elevations (Front, Back, Left, Right)
      this.buildFloorElevations(floorGroup, width, depth, floorHeight, f, data);

      // Interior Corridors & Structural Columns
      this.buildFloorInterior(floorGroup, width, depth, floorHeight, f, data);

      floorGroups.push(floorGroup);
      bGroup.add(floorGroup);
    }

    this.buildingFloorGroups.set(data.id, floorGroups);

    // 3. Roof Structure & MEP Equipment
    this.buildRoofStructure(bGroup, width, depth, height, data);

    // 4. Floating Holographic Health Indicator / Badge
    const badgeGroup = this.createBuildingHealthBadge(data, height + 4.5);
    bGroup.add(badgeGroup);
    bGroup.userData.badgeGroup = badgeGroup;

    return bGroup;
  }

  /**
   * Constructs complete 4-sided elevations with windows, mullions, louvres, and structural pilasters
   */
  buildFloorElevations(floorGroup, width, depth, floorHeight, floorNum, data) {
    const wallMat = data.id === 'b-main' ? this.materials.concreteIvory :
                    data.id === 'b-mech' ? this.materials.brickTerracotta :
                    data.id === 'b-lib' ? this.materials.concreteIvory : this.materials.concreteGray;

    const wallHeight = floorHeight - 0.4;

    // FRONT ELEVATION (Z = +depth/2)
    this.createElevationWall(floorGroup, width, wallHeight, depth / 2, 0, wallMat, floorNum, data, 'front');

    // BACK ELEVATION (Z = -depth/2)
    this.createElevationWall(floorGroup, width, wallHeight, -depth / 2, Math.PI, wallMat, floorNum, data, 'back');

    // LEFT ELEVATION (X = -width/2)
    this.createElevationWall(floorGroup, depth, wallHeight, -width / 2, -Math.PI / 2, wallMat, floorNum, data, 'left');

    // RIGHT ELEVATION (X = +width/2)
    this.createElevationWall(floorGroup, depth, wallHeight, width / 2, Math.PI / 2, wallMat, floorNum, data, 'right');

    // Grand Entrance Portico on Ground Floor of Main Block
    if (data.id === 'b-main' && floorNum === 0) {
      const porticoGeo = new THREE.BoxGeometry(16, 0.4, 8);
      const portico = new THREE.Mesh(porticoGeo, this.materials.floorPlate);
      portico.position.set(0, floorHeight, depth / 2 + 4);
      portico.castShadow = true;
      floorGroup.add(portico);

      // Colonnade Pillars
      [-6, -2, 2, 6].forEach(px => {
        const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, floorHeight, 8);
        const pillar = new THREE.Mesh(pillarGeo, this.materials.columnPlinth);
        pillar.position.set(px, floorHeight / 2, depth / 2 + 7.5);
        pillar.castShadow = true;
        floorGroup.add(pillar);
      });
    }
  }

  createElevationWall(parent, wallLength, wallHeight, offset, rotationY, wallMat, floorNum, data, side) {
    const wallSegment = new THREE.Group();
    wallSegment.rotation.y = rotationY;
    if (side === 'front' || side === 'back') {
      wallSegment.position.z = offset;
    } else {
      wallSegment.position.x = offset;
    }

    // Windows pattern: ribbon architectural openings
    const windowCols = Math.floor(wallLength / 4.5);
    const colWidth = wallLength / windowCols;

    for (let c = 0; c < windowCols; c++) {
      const cx = -wallLength / 2 + colWidth * (c + 0.5);

      // Concrete Spandrel / Column Pier
      const pierGeo = new THREE.BoxGeometry(0.8, wallHeight, 0.35);
      const pier = new THREE.Mesh(pierGeo, wallMat);
      pier.position.set(cx - colWidth / 2 + 0.4, wallHeight / 2 + 0.2, 0);
      pier.castShadow = true;
      pier.receiveShadow = true;
      wallSegment.add(pier);

      // Lower Sill Wall
      const sillGeo = new THREE.BoxGeometry(colWidth - 0.8, 0.9, 0.3);
      const sill = new THREE.Mesh(sillGeo, wallMat);
      sill.position.set(cx, 0.45 + 0.2, 0);
      sill.castShadow = true;
      wallSegment.add(sill);

      // Upper Lintel
      const lintelGeo = new THREE.BoxGeometry(colWidth - 0.8, 0.5, 0.3);
      const lintel = new THREE.Mesh(lintelGeo, wallMat);
      lintel.position.set(cx, wallHeight - 0.25 + 0.2, 0);
      lintel.castShadow = true;
      wallSegment.add(lintel);

      // Double-Glazed Glass Pane
      const glassGeo = new THREE.PlaneGeometry(colWidth - 0.9, wallHeight - 1.4);
      const glass = new THREE.Mesh(glassGeo, this.materials.facadeGlass);
      glass.position.set(cx, wallHeight / 2 + 0.1, 0.05);
      wallSegment.add(glass);
    }

    parent.add(wallSegment);
  }

  buildFloorInterior(floorGroup, width, depth, floorHeight, floorNum, data) {
    // Central Corridor Wall running length-wise
    const corridorGeo = new THREE.BoxGeometry(width - 2, floorHeight - 0.4, 0.25);
    const corridor = new THREE.Mesh(corridorGeo, this.materials.interiorWall);
    corridor.position.set(0, (floorHeight - 0.4) / 2 + 0.2, 0);
    floorGroup.add(corridor);

    // Cross Partitions (Dividing into Classroom and Laboratory Bays)
    const bays = 4;
    const bayWidth = (width - 4) / bays;
    for (let b = 1; b < bays; b++) {
      const partGeo = new THREE.BoxGeometry(0.25, floorHeight - 0.4, depth - 2);
      const part = new THREE.Mesh(partGeo, this.materials.interiorWall);
      part.position.set(-width / 2 + b * bayWidth, (floorHeight - 0.4) / 2 + 0.2, 0);
      floorGroup.add(part);
    }

    // Interactive Room Click Targets
    const rooms = db.getRoomsByFloor(data.id, floorNum);
    rooms.forEach((r, idx) => {
      const roomTarget = this.createRoomVolume(r, width, depth, floorHeight, idx, bays);
      floorGroup.add(roomTarget);
    });
  }

  createRoomVolume(roomData, bWidth, bDepth, floorHeight, idx, totalBays) {
    const bayWidth = (bWidth - 4) / totalBays;
    const roomGroup = new THREE.Group();
    roomGroup.name = `room-${roomData.id}`;
    roomGroup.userData = {
      type: 'room',
      roomId: roomData.id,
      data: roomData
    };

    // Bounding interactive box
    const rx = -bWidth / 2 + (idx % totalBays + 0.5) * bayWidth;
    const rz = idx < totalBays ? bDepth / 4 : -bDepth / 4;

    const boxGeo = new THREE.BoxGeometry(bayWidth - 0.8, floorHeight - 0.6, (bDepth / 2) - 1.5);
    const boxMat = new THREE.MeshBasicMaterial({
      color: roomData.status === 'red' ? 0xEF4444 : roomData.status === 'amber' ? 0xF59E0B : 0x22C55E,
      transparent: true,
      opacity: 0.12,
      wireframe: true
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(rx, (floorHeight - 0.4) / 2 + 0.2, rz);
    roomGroup.add(box);

    // Floating Room ID Label
    const labelMesh = this.createCanvasLabel(roomData.code, roomData.status);
    labelMesh.position.set(rx, floorHeight - 0.3, rz);
    roomGroup.add(labelMesh);

    this.roomGroups.set(roomData.id, roomGroup);
    return roomGroup;
  }

  createCanvasLabel(text, status) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    // Background pill
    ctx.fillStyle = status === 'red' ? '#EF4444' : status === 'amber' ? '#F59E0B' : '#0F172A';
    if (ctx.roundRect) {
      ctx.roundRect(4, 4, 120, 40, 8);
    } else {
      ctx.rect(4, 4, 120, 40);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 24);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.5, 1.3, 1);
    return sprite;
  }

  buildRoofStructure(bGroup, width, depth, height, data) {
    const roofY = height + 0.8;

    // Roof Parapet Wall
    const parapetGeo = new THREE.BoxGeometry(width + 0.4, 1.2, depth + 0.4);
    const parapet = new THREE.Mesh(parapetGeo, this.materials.roofSlab);
    parapet.position.y = roofY + 0.6;
    parapet.castShadow = true;
    bGroup.add(parapet);

    // Elevator & Staircase Headroom Machine Enclosure
    const headroomGeo = new THREE.BoxGeometry(width * 0.25, 3.2, depth * 0.25);
    const headroom = new THREE.Mesh(headroomGeo, this.materials.concreteIvory);
    headroom.position.set(0, roofY + 1.6, 0);
    headroom.castShadow = true;
    bGroup.add(headroom);

    // MEP Infrastructure on Roof
    // 1. Water Storage Tanks
    const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.4, 12);
    const tank1 = new THREE.Mesh(tankGeo, this.materials.mepMetal);
    tank1.position.set(width * 0.3, roofY + 1.2, depth * 0.25);
    tank1.castShadow = true;
    bGroup.add(tank1);

    const tank2 = new THREE.Mesh(tankGeo, this.materials.mepMetal);
    tank2.position.set(width * 0.3, roofY + 1.2, depth * 0.25 + 4);
    tank2.castShadow = true;
    bGroup.add(tank2);

    // 2. Solar PV Rooftop Arrays
    const solarCount = Math.floor(width / 7);
    for (let s = 0; s < solarCount; s++) {
      const solarGeo = new THREE.BoxGeometry(5.5, 0.15, 3.5);
      const solar = new THREE.Mesh(solarGeo, this.materials.solarPanel);
      solar.rotation.x = 0.2; // tilted south towards sun
      solar.position.set(-width * 0.35 + s * 6.5, roofY + 0.8, -depth * 0.25);
      solar.castShadow = true;
      bGroup.add(solar);
    }

    // 3. Central Library Glass Dome / Skylight
    if (data.id === 'b-lib') {
      const skylightGeo = new THREE.ConeGeometry(8, 3.5, 12, 1, true);
      const skylight = new THREE.Mesh(skylightGeo, this.materials.facadeGlass);
      skylight.position.set(0, roofY + 1.8, 0);
      bGroup.add(skylight);
    }

    // 4. ECE RF Antenna Mast
    if (data.id === 'b-ece') {
      const antennaGeo = new THREE.CylinderGeometry(0.1, 0.3, 14, 6);
      const antenna = new THREE.Mesh(antennaGeo, this.materials.mepMetal);
      antenna.position.set(width * 0.35, roofY + 7, -depth * 0.3);
      antenna.castShadow = true;
      bGroup.add(antenna);
    }
  }

  createBuildingHealthBadge(data, posY) {
    const badgeGroup = new THREE.Group();
    badgeGroup.name = `badge-${data.id}`;
    badgeGroup.position.set(0, posY, 0);

    // Glowing Halo Ring
    const ringGeo = new THREE.RingGeometry(2.5, 3.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: data.status === 'red' ? 0xEF4444 : data.status === 'amber' ? 0xF59E0B : 0x22C55E,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    badgeGroup.add(ring);

    // Vertical Holographic Light Beam
    const beamGeo = new THREE.CylinderGeometry(0.15, 1.8, 5, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: data.status === 'red' ? 0xEF4444 : data.status === 'amber' ? 0xF59E0B : 0x22C55E,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.5;
    badgeGroup.add(beam);

    // Canvas Label with Building Name & Verified Tag
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    // Card background
    ctx.fillStyle = '#0F172A';
    if (ctx.roundRect) {
      ctx.roundRect(4, 4, 248, 72, 10);
    } else {
      ctx.rect(4, 4, 248, 72);
    }
    ctx.fill();

    // Top indicator strip
    ctx.fillStyle = data.status === 'red' ? '#EF4444' : data.status === 'amber' ? '#F59E0B' : '#22C55E';
    ctx.fillRect(4, 4, 248, 6);

    // Building Code & Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.code} • ${data.name.split(' ')[0]}`, 128, 36);

    // Subtitle & Status
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Health: ${data.healthScore}% | Verified`, 128, 60);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, 6.5, 0);
    sprite.scale.set(10, 3.2, 1);
    badgeGroup.add(sprite);

    badgeGroup.userData = { ring, beam, sprite };
    return badgeGroup;
  }

  // --- CLASSROOM 3D INTERIOR ENGINE ---
  /**
   * Builds the detailed 3D interior of a selected room (e.g., E-204)
   * Desks, podium, projector, screen, AC units, LED troffers, Wi-Fi AP, fire extinguisher
   */
  buildClassroomInterior(roomId) {
    this.roomInteriorGroup.clear();
    const room = db.getRoom(roomId);
    if (!room) return;

    this.currentLevel = 'room';
    this.selectedRoomId = roomId;

    const width = 20;
    const depth = 16;
    const height = 4.2;

    const interior = new THREE.Group();
    interior.position.set(0, 5, 0);

    // 1. Vitrified Floor Tile Slab
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floorMesh = new THREE.Mesh(floorGeo, this.materials.interiorFloor);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    interior.add(floorMesh);

    // 2. Ceiling with Recessed LED Troffer Panels
    const ceilingGeo = new THREE.PlaneGeometry(width, depth);
    const ceilingMesh = new THREE.Mesh(ceilingGeo, this.materials.interiorWall);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.y = height;
    interior.add(ceilingMesh);

    // Recessed 36W LED Troffers (2x2 grid)
    for (let x = -6; x <= 6; x += 4) {
      for (let z = -4; z <= 4; z += 4) {
        const trofferGeo = new THREE.PlaneGeometry(1.6, 1.6);
        const trofferMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const troffer = new THREE.Mesh(trofferGeo, trofferMat);
        troffer.rotation.x = Math.PI / 2;
        troffer.position.set(x, height - 0.02, z);
        interior.add(troffer);

        // Soft interior point light
        const pl = new THREE.PointLight(0xFFFFFF, 0.4, 8);
        pl.position.set(x, height - 0.5, z);
        interior.add(pl);
      }
    }

    // 3. Front Wall (with Smart Interactive Whiteboard & Projection Screen)
    const frontWallGeo = new THREE.PlaneGeometry(width, height);
    const frontWall = new THREE.Mesh(frontWallGeo, this.materials.interiorWall);
    frontWall.position.set(0, height / 2, -depth / 2);
    interior.add(frontWall);

    // 86" Interactive Touch Panel / Smartboard
    const sbBezelGeo = new THREE.BoxGeometry(4.2, 2.4, 0.1);
    const sbBezel = new THREE.Mesh(sbBezelGeo, this.materials.smartboardBezel);
    sbBezel.position.set(-4, 2.2, -depth / 2 + 0.1);
    interior.add(sbBezel);

    const sbScreenGeo = new THREE.PlaneGeometry(4.0, 2.2);
    const sbScreen = new THREE.Mesh(sbScreenGeo, this.materials.smartboardDisplay);
    sbScreen.position.set(-4, 2.2, -depth / 2 + 0.16);
    interior.add(sbScreen);

    // Motorized Projection Screen
    const scrCaseGeo = new THREE.BoxGeometry(4.6, 0.25, 0.25);
    const scrCase = new THREE.Mesh(scrCaseGeo, this.materials.mepMetal);
    scrCase.position.set(3.5, height - 0.3, -depth / 2 + 0.2);
    interior.add(scrCase);

    const scrGeo = new THREE.PlaneGeometry(4.2, 2.6);
    const scrMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.9 });
    const scr = new THREE.Mesh(scrGeo, scrMat);
    scr.position.set(3.5, height - 1.6, -depth / 2 + 0.2);
    interior.add(scr);

    // 4. Ceiling-Mounted Projector (AST-PRJ-204)
    const projGroup = new THREE.Group();
    projGroup.position.set(3.5, height - 0.6, 0);

    // Mount Pole
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.mepMetal);
    pole.position.y = 0.3;
    projGroup.add(pole);

    // Projector Body
    const projGeo = new THREE.BoxGeometry(1.2, 0.4, 0.9);
    const isFaulty = room.equipmentStatus && room.equipmentStatus.projector && room.equipmentStatus.projector.includes('Faulty');
    const projMat = isFaulty ? this.materials.statusRed : this.materials.projectorBody;
    const proj = new THREE.Mesh(projGeo, projMat);
    proj.castShadow = true;
    projGroup.add(proj);

    // Projector Lens
    const lensGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.15, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshBasicMaterial({ color: isFaulty ? 0xEF4444 : 0x38BDF8 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0.3, 0, -0.48);
    projGroup.add(lens);

    // Light Beam (if healthy) or Red Fault Spark (if faulty)
    if (!isFaulty) {
      const beamGeo = new THREE.ConeGeometry(2.4, 5.5, 16, 1, true);
      beamGeo.rotateX(-Math.PI / 2);
      const beam = new THREE.Mesh(beamGeo, this.materials.projectorBeam);
      beam.position.set(0.3, 0, -3.2);
      projGroup.add(beam);
    } else {
      // Red Warning Hologram Ring around Faulty Projector
      const warnRingGeo = new THREE.RingGeometry(0.8, 1.1, 16);
      const warnRing = new THREE.Mesh(warnRingGeo, this.materials.statusRed);
      warnRing.rotation.x = -Math.PI / 2;
      warnRing.position.y = -0.5;
      projGroup.add(warnRing);
    }

    projGroup.userData = { type: 'asset', assetId: 'AST-PRJ-204', roomData: room };
    interior.add(projGroup);

    // 5. Teacher's Podium & Desk
    const podiumGeo = new THREE.BoxGeometry(1.4, 1.1, 0.9);
    const podium = new THREE.Mesh(podiumGeo, this.materials.deskWood);
    podium.position.set(-2, 0.55, -depth / 2 + 2.5);
    podium.castShadow = true;
    interior.add(podium);

    // 6. Student Dual Desks & Ergonomic Benches (Tiered Seating)
    for (let row = 0; row < 4; row++) {
      const zPos = -1.5 + row * 2.8;
      const tierHeight = row * 0.2; // stepped lecture tier

      for (let col = -2; col <= 2; col++) {
        if (col === 0) continue; // center aisle
        const xPos = col * 3.2;

        const desk = this.createStudentDesk();
        desk.position.set(xPos, tierHeight, zPos);
        interior.add(desk);
      }
    }

    // 7. Split Air Conditioners (AST-AC-204A & B on side walls)
    const ac1 = this.createSplitAC();
    ac1.position.set(-width / 2 + 0.2, height - 1.2, 0);
    ac1.rotation.y = Math.PI / 2;
    interior.add(ac1);

    const ac2 = this.createSplitAC();
    ac2.position.set(width / 2 - 0.2, height - 1.2, 0);
    ac2.rotation.y = -Math.PI / 2;
    interior.add(ac2);

    // 8. Aruba Wi-Fi 6 Access Point (Ceiling Mounted)
    const wifiGeo = new THREE.BoxGeometry(0.6, 0.12, 0.6);
    const wifiMesh = new THREE.Mesh(wifiGeo, this.materials.mepMetal);
    wifiMesh.position.set(0, height - 0.06, 0);
    interior.add(wifiMesh);

    // 9. Fire Safety Extinguisher on Wall (AST-FE-204)
    const feGroup = new THREE.Group();
    const feGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
    const feMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, metalness: 0.3, roughness: 0.4 });
    const fe = new THREE.Mesh(feGeo, feMat);
    feGroup.add(fe);
    feGroup.position.set(-width / 2 + 0.15, 1.4, -depth / 2 + 1.5);
    interior.add(feGroup);

    this.roomInteriorGroup.add(interior);

    // Smoothly fly camera inside room
    this.flyCameraTo(
      new THREE.Vector3(0, 11, 12),
      new THREE.Vector3(0, 7.5, -3)
    );

    // Hide campus exterior to focus on interior
    this.campusGroup.visible = false;
    this.roomInteriorGroup.visible = true;
  }

  createStudentDesk() {
    const group = new THREE.Group();
    // Desk Top
    const topGeo = new THREE.BoxGeometry(2.4, 0.08, 0.8);
    const top = new THREE.Mesh(topGeo, this.materials.deskWood);
    top.position.y = 0.74;
    top.castShadow = true;
    group.add(top);

    // Steel Legs
    [-1.0, 1.0].forEach(lx => {
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.74, 8);
      const leg = new THREE.Mesh(legGeo, this.materials.deskFrame);
      leg.position.set(lx, 0.37, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    // Bench Seat
    const seatGeo = new THREE.BoxGeometry(2.4, 0.06, 0.5);
    const seat = new THREE.Mesh(seatGeo, this.materials.deskWood);
    seat.position.set(0, 0.45, 0.6);
    seat.castShadow = true;
    group.add(seat);

    return group;
  }

  createSplitAC() {
    const group = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.5, 0.4);
    const body = new THREE.Mesh(bodyGeo, this.materials.mepMetal);
    group.add(body);

    const louverGeo = new THREE.PlaneGeometry(1.6, 0.15);
    const louver = new THREE.Mesh(louverGeo, new THREE.MeshBasicMaterial({ color: 0x334155 }));
    louver.position.set(0, -0.15, 0.21);
    group.add(louver);

    return group;
  }

  // --- EXPLODED VIEW & FLOOR ISOLATION CONTROLS ---
  toggleExplodedView(shouldExplode = null) {
    if (shouldExplode !== null) {
      this.isExploded = shouldExplode;
    } else {
      this.isExploded = !this.isExploded;
    }

    if (!this.selectedBuildingId) {
      // Default to Main Block if none selected
      this.selectBuilding('b-main');
    }

    this.animateExplosion(this.isExploded ? 1 : 0);
  }

  animateExplosion(targetFactor) {
    const bId = this.selectedBuildingId || 'b-main';
    const floorGroups = this.buildingFloorGroups.get(bId);
    if (!floorGroups) return;

    const separationDistance = 14; // meters of vertical gap in exploded view
    const startTime = performance.now();
    const duration = 800; // ms

    const startFactors = floorGroups.map(fg => fg.position.y);

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      floorGroups.forEach((fg, idx) => {
        const baseY = fg.userData.baseY;
        const targetY = baseY + (idx * separationDistance * targetFactor);
        fg.position.y = THREE.MathUtils.lerp(startFactors[idx], targetY, ease);
      });

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      } else {
        this.explosionFactor = targetFactor;
      }
    };

    requestAnimationFrame(animateStep);
  }

  isolateFloor(floorNumber) {
    this.isolatedFloorNumber = floorNumber;
    const bId = this.selectedBuildingId || 'b-main';
    const floorGroups = this.buildingFloorGroups.get(bId);
    if (!floorGroups) return;

    floorGroups.forEach((fg, idx) => {
      if (idx === floorNumber) {
        fg.visible = true;
      } else {
        fg.visible = false;
      }
    });

    this.currentLevel = 'floor';
    this.selectedFloorNumber = floorNumber;
  }

  showAllFloors() {
    this.isolatedFloorNumber = null;
    const bId = this.selectedBuildingId || 'b-main';
    const floorGroups = this.buildingFloorGroups.get(bId);
    if (!floorGroups) return;

    floorGroups.forEach(fg => {
      fg.visible = true;
    });

    this.animateExplosion(0);
    this.isExploded = false;
  }

  // --- SELECTION & CAMERA ZOOM CONTROLS ---
  selectBuilding(buildingId) {
    this.selectedBuildingId = buildingId;
    this.currentLevel = 'building';
    this.campusGroup.visible = true;
    this.roomInteriorGroup.visible = false;

    const b = db.getBuilding(buildingId);
    if (!b) return;

    const targetPos = new THREE.Vector3(b.coordinates.x, b.dimensions.height / 2, b.coordinates.z);
    const cameraPos = new THREE.Vector3(
      b.coordinates.x + b.dimensions.width * 1.1,
      b.dimensions.height * 2.2,
      b.coordinates.z + b.dimensions.depth * 1.8
    );

    this.flyCameraTo(cameraPos, targetPos);
    this.onSelect({ type: 'building', building: b });
  }

  enterBuilding(buildingId) {
    this.selectBuilding(buildingId);
    // Auto isolate Ground or First Floor
    this.isolateFloor(1);
  }

  returnToCampus() {
    this.currentLevel = 'campus';
    this.selectedBuildingId = null;
    this.selectedFloorNumber = null;
    this.selectedRoomId = null;
    this.isExploded = false;
    this.isolatedFloorNumber = null;

    this.campusGroup.visible = true;
    this.roomInteriorGroup.visible = false;

    // Restore all building floors visibility & positions
    this.buildingFloorGroups.forEach(floorGroups => {
      floorGroups.forEach(fg => {
        fg.visible = true;
        fg.position.y = fg.userData.baseY;
      });
    });

    this.flyCameraTo(new THREE.Vector3(0, 95, 150), new THREE.Vector3(0, 0, 0));
    this.onSelect({ type: 'campus' });
  }

  flyCameraTo(pos, lookAt, duration = 1000) {
    this.cameraTarget.position.copy(pos);
    this.cameraTarget.lookAt.copy(lookAt);
    this.isAnimatingCamera = true;

    const startPos = this.camera.position.clone();
    const startLookAt = this.controls ? this.controls.target.clone() : new THREE.Vector3(0, 0, 0);
    const startTime = performance.now();

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      this.camera.position.lerpVectors(startPos, pos, ease);
      if (this.controls) {
        this.controls.target.lerpVectors(startLookAt, lookAt, ease);
        this.controls.update();
      }

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      } else {
        this.isAnimatingCamera = false;
      }
    };

    requestAnimationFrame(animateStep);
  }

  // --- VIEW MODES ---
  setViewMode(mode) {
    this.currentViewMode = mode;

    if (mode === 'photorealistic') {
      this.scene.background = new THREE.Color(0xF0F4F8);
      this.scene.fog.density = 0.0035;
      this.sunLight.intensity = 1.3;
      this.hemiLight.intensity = 0.65;
      this.camera.fov = 45;
      this.camera.updateProjectionMatrix();
      this.toggleHologramMaterials(false);
    } else if (mode === 'operational') {
      // Holographic cyber twin
      this.scene.background = new THREE.Color(0x0A0F1D);
      this.scene.fog.density = 0.002;
      this.sunLight.intensity = 0.4;
      this.hemiLight.intensity = 0.3;
      this.camera.fov = 45;
      this.camera.updateProjectionMatrix();
      this.toggleHologramMaterials(true);
    } else if (mode === 'schematic') {
      // 2D CAD Top-Down Schematic
      this.scene.background = new THREE.Color(0xFAFAFA);
      this.flyCameraTo(new THREE.Vector3(0, 180, 0.01), new THREE.Vector3(0, 0, 0));
    } else if (mode === 'satellite') {
      // Satellite Aerial Alignment centered on Ramapuram Coordinates
      this.scene.background = new THREE.Color(0x1B263B);
      this.flyCameraTo(new THREE.Vector3(0, 210, 40), new THREE.Vector3(0, 0, 0));
    }
  }

  toggleHologramMaterials(isHologram) {
    this.buildingGroups.forEach(bg => {
      bg.traverse(child => {
        if (child.isMesh && child.userData.type !== 'room') {
          if (isHologram) {
            child.userData.origMaterial = child.material;
            child.material = this.materials.hologramWireframe;
          } else if (child.userData.origMaterial) {
            child.material = child.userData.origMaterial;
          }
        }
      });
    });
  }

  // --- REAL-TIME REACTIVITY & TELEMETRY UPDATES ---
  updateDynamicStatus() {
    const buildings = db.getBuildings();
    buildings.forEach(b => {
      const bGroup = this.buildingGroups.get(b.id);
      if (bGroup && bGroup.userData.badgeGroup) {
        const { ring, beam, sprite } = bGroup.userData.badgeGroup.userData;
        const color = b.status === 'red' ? 0xEF4444 : b.status === 'amber' ? 0xF59E0B : 0x22C55E;
        ring.material.color.setHex(color);
        beam.material.color.setHex(color);
      }
    });
  }

  updateBleOverlay() {
    // Generate subtle real-time particle pulses in 3D scene from CampusOps signal detections
    this.bleParticlesGroup.clear();
    const snap = campusOps.getSnapshot();

    if (!snap.isScanning) return;

    Object.keys(snap.buildingDensity).forEach(bId => {
      const b = db.getBuilding(bId);
      const count = snap.buildingDensity[bId];
      if (b && count > 0) {
        const particleGeo = new THREE.SphereGeometry(Math.min(3.5, 0.8 + count * 0.08), 16, 16);
        const particleMat = new THREE.MeshBasicMaterial({
          color: 0x38BDF8,
          transparent: true,
          opacity: Math.min(0.7, 0.2 + count * 0.03),
          wireframe: true
        });
        const pulseMesh = new THREE.Mesh(particleGeo, particleMat);
        pulseMesh.position.set(b.coordinates.x, b.dimensions.height + 2, b.coordinates.z);
        this.bleParticlesGroup.add(pulseMesh);
      }
    });
  }

  // --- INTERACTION & RAYCASTING ---
  setupInteractivity() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        // Find closest meaningful object (room, asset, building)
        for (const hit of intersects) {
          let curr = hit.object;
          while (curr && curr !== this.scene) {
            if (curr.userData && curr.userData.type === 'asset') {
              this.onSelect({ type: 'asset', assetId: curr.userData.assetId, room: curr.userData.roomData });
              return;
            }
            if (curr.userData && curr.userData.type === 'room') {
              this.onSelect({ type: 'room', roomId: curr.userData.roomId, room: curr.userData.data });
              return;
            }
            if (curr.userData && curr.userData.type === 'building') {
              this.selectBuilding(curr.userData.buildingId);
              return;
            }
            curr = curr.parent;
          }
        }
      }
    });
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    // Gentle pulse animation for health badges and BLE particles
    const time = performance.now() * 0.002;
    this.bleParticlesGroup.children.forEach((p, idx) => {
      const scale = 1 + Math.sin(time * 3 + idx) * 0.15;
      p.scale.set(scale, scale, scale);
    });

    this.renderer.render(this.scene, this.camera);
  }
}
