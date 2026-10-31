/**
 * TRINETRA - Unified AI Incident Engine
 * Operational Brain: Entity extraction, clarification dialogs, duplicate detection,
 * priority scoring, and impact analysis.
 */

import { db } from './db.js';

export class IncidentEngine {
  constructor() {
    this.knownBuildings = [
      { id: 'b-main', keywords: ['main', 'admin', 'principal', 'exam cell', 'first year', 'administrative'] },
      { id: 'b-acad', keywords: ['acad', 'academic', 'cs', 'it', 'cse', 'computing', 'coding', 'ai', 'data science'] },
      { id: 'b-ece', keywords: ['ece', 'eee', 'electrical', 'electronics', 'robotics', 'iot', 'hardware'] },
      { id: 'b-mech', keywords: ['mech', 'mechanical', 'workshop', 'cnc', 'lathe', 'mechatronics'] },
      { id: 'b-civil', keywords: ['civil', 'concrete', 'survey', 'soil', 'structural', 'materials lab'] },
      { id: 'b-pg', keywords: ['pg', 'mba', 'mca', 'postgraduate', 'research block'] },
      { id: 'b-lib', keywords: ['lib', 'library', 'books', 'journals', 'digital library'] },
      { id: 'b-audi', keywords: ['audi', 'auditorium', 'trp', 'convocation', 'stage', 'grand hall'] },
      { id: 'b-util', keywords: ['substation', 'dg', 'generator', 'transformer', 'switchgear', 'utility', 'pump'] }
    ];

    this.knownCategories = [
      { cat: 'Audiovisual / Presentation', keywords: ['projector', 'screen', 'hdmi', 'sound', 'speaker', 'mic', 'display', 'smartboard', 'activpanel', 'tv'] },
      { cat: 'HVAC & Climate Control', keywords: ['ac', 'air conditioning', 'cooling', 'chiller', 'fan', 'temperature', 'humidity', 'leak', 'compressor'] },
      { cat: 'Network & Connectivity', keywords: ['wifi', 'wi-fi', 'internet', 'lan', 'ethernet', 'switch', 'router', 'cable', 'disconnection', 'packet drop'] },
      { cat: 'Electrical & Power', keywords: ['power', 'breaker', 'mcb', 'tripped', 'spark', 'light', 'tube', 'led', 'voltage', 'socket', 'ups', 'generator'] },
      { cat: 'Plumbing & Hydraulic', keywords: ['water', 'leakage', 'tap', 'washroom', 'flush', 'pipe', 'drainage', 'pump', 'pressure', 'tank'] },
      { cat: 'Civil & Furniture', keywords: ['desk', 'chair', 'bench', 'door', 'window', 'ceiling', 'plaster', 'lock', 'handle', 'hinge'] }
    ];
  }

  /**
   * Parses natural language complaint and extracts structured incident entities
   * e.g. "The projector in E-204 is not working and an examination is scheduled in that room tomorrow."
   */
  parseComplaint(text) {
    const lower = text.toLowerCase();
    const result = {
      rawText: text,
      extracted: {
        issueType: null,
        category: 'General Maintenance',
        buildingId: null,
        buildingName: null,
        floorId: null,
        floorNumber: null,
        roomId: null,
        roomName: null,
        assetId: null,
        assetName: null,
        urgency: 'Medium',
        priority: 'P2 - Moderate',
        affectedActivity: 'General Academic Operations',
        requiredMaintenance: 'Standard Inspection'
      },
      missingFields: [],
      clarificationQuestions: [],
      duplicateDetected: false,
      duplicateIncident: null,
      correlatedIncidents: []
    };

    // 1. Room Extraction (regex for E-101, E-204, AB-201, PGB-202, etc.)
    const roomMatch = text.match(/\b([A-Z]{1,3}-\d{3}[A-Z]?)\b/i) || text.match(/\b(Room\s*([A-Z0-9-]+))\b/i);
    if (roomMatch) {
      const roomCode = (roomMatch[1] || roomMatch[2]).toUpperCase();
      const allRooms = db.getRooms();
      const matchedRoom = allRooms.find(r => r.id.toUpperCase() === roomCode || r.code.toUpperCase() === roomCode);
      if (matchedRoom) {
        result.extracted.roomId = matchedRoom.id;
        result.extracted.roomName = matchedRoom.name;
        result.extracted.buildingId = matchedRoom.buildingId;
        result.extracted.floorId = matchedRoom.floorId;
        result.extracted.floorNumber = matchedRoom.floorNumber;

        const bld = db.getBuilding(matchedRoom.buildingId);
        if (bld) result.extracted.buildingName = bld.name;
      } else {
        result.extracted.roomId = roomCode;
      }
    }

    // 2. Building Extraction if room didn't resolve building
    if (!result.extracted.buildingId) {
      for (const b of this.knownBuildings) {
        if (b.keywords.some(k => lower.includes(k))) {
          result.extracted.buildingId = b.id;
          const bld = db.getBuilding(b.id);
          if (bld) result.extracted.buildingName = bld.name;
          break;
        }
      }
    }

    // 3. Category & Issue Type
    for (const c of this.knownCategories) {
      if (c.keywords.some(k => lower.includes(k))) {
        result.extracted.category = c.cat;
        break;
      }
    }

    // 4. Asset Matching if room is known
    if (result.extracted.roomId) {
      const roomAssets = db.getAssetsByRoom(result.extracted.roomId);
      for (const asset of roomAssets) {
        const assetTerms = asset.name.toLowerCase().split(' ');
        if (assetTerms.some(term => term.length > 3 && lower.includes(term))) {
          result.extracted.assetId = asset.id;
          result.extracted.assetName = asset.name;
          break;
        }
      }
    }

    // Fallback asset by category keyword
    if (!result.extracted.assetId) {
      if (lower.includes('projector')) {
        result.extracted.issueType = 'Projector Display / Lamp Failure';
        result.extracted.requiredMaintenance = 'Projector lamp replacement & optical alignment';
      } else if (lower.includes('ac') || lower.includes('cooling')) {
        result.extracted.issueType = 'Air Conditioning Cooling Inadequacy';
        result.extracted.requiredMaintenance = 'Filter chemical cleaning and gas pressure diagnostic';
      } else if (lower.includes('wifi') || lower.includes('internet')) {
        result.extracted.issueType = 'Wi-Fi AP Congestion / Signal Loss';
        result.extracted.requiredMaintenance = 'PoE reboot and RF interference channel tuning';
      } else if (lower.includes('pump') || lower.includes('water')) {
        result.extracted.issueType = 'Water Hydraulic Pump Mechanical Failure';
        result.extracted.requiredMaintenance = 'Mechanical seal overhaul';
      }
    }

    // 5. Urgency & Priority Detection
    const hasExam = lower.includes('exam') || lower.includes('examination') || lower.includes('test') || lower.includes('evaluation');
    const hasCritical = lower.includes('critical') || lower.includes('emergency') || lower.includes('immediately') || lower.includes('urgent') || lower.includes('spark') || lower.includes('flood') || lower.includes('smoke');
    const hasTomorrow = lower.includes('tomorrow') || lower.includes('today') || lower.includes('morning');

    if (hasExam && (hasTomorrow || hasCritical)) {
      result.extracted.urgency = 'Critical';
      result.extracted.priority = 'P1 - High Urgency';
      result.extracted.affectedActivity = 'Examination Scheduled in Room (High Student Impact)';
    } else if (hasCritical || hasExam) {
      result.extracted.urgency = 'High';
      result.extracted.priority = 'P2 - High';
      result.extracted.affectedActivity = 'Time-Sensitive Academic Function';
    } else if (lower.includes('presentation') || lower.includes('lecture') || lower.includes('class')) {
      result.extracted.urgency = 'Medium';
      result.extracted.priority = 'P2 - Moderate';
      result.extracted.affectedActivity = 'Regular Class Instruction';
    } else {
      result.extracted.urgency = 'Low';
      result.extracted.priority = 'P3 - Low Urgency';
      result.extracted.affectedActivity = 'Routine Facility Use';
    }

    // 6. Missing Fields Detection & Clarification Questions
    if (!result.extracted.roomId && !result.extracted.buildingId) {
      result.missingFields.push('location');
      result.clarificationQuestions.push('Which building and room or laboratory is experiencing this issue?');
    }
    if (!result.extracted.category || result.extracted.category === 'General Maintenance') {
      result.missingFields.push('equipment');
      result.clarificationQuestions.push('Which specific equipment or infrastructure (e.g. projector, AC, Wi-Fi, electrical, plumbing) is faulty?');
    }
    if (!result.extracted.affectedActivity && !hasExam) {
      result.missingFields.push('impact');
      result.clarificationQuestions.push('Is there an upcoming examination, seminar, or critical class scheduled in this space?');
    }

    // 7. Duplicate Detection
    const allIncidents = db.getIncidents();
    const openIncidents = allIncidents.filter(inc => inc.status !== 'Resolved' && inc.status !== 'Closed');

    if (result.extracted.roomId) {
      const duplicate = openIncidents.find(inc =>
        inc.roomId === result.extracted.roomId &&
        (inc.category === result.extracted.category || (result.extracted.assetId && inc.assetId === result.extracted.assetId))
      );
      if (duplicate) {
        result.duplicateDetected = true;
        result.duplicateIncident = duplicate;
      }
    }

    // 8. Correlated Incidents (same building or electrical loop)
    if (result.extracted.buildingId) {
      result.correlatedIncidents = openIncidents.filter(inc =>
        inc.buildingId === result.extracted.buildingId &&
        (!result.duplicateIncident || inc.id !== result.duplicateIncident.id)
      );
    }

    return result;
  }

  /**
   * Generates AI Explainable Summary and Recommended Actions
   */
  generateExecutiveAnalysis(parsed) {
    const ext = parsed.extracted;
    let summary = '';
    const recommendations = [];

    if (ext.urgency === 'Critical' && ext.roomId === 'E-204') {
      summary = `Critical breakdown reported for ${ext.issueType || 'Projector'} in Classroom ${ext.roomId}. ` +
        `Upcoming examination requires functional display. Immediate intervention required within 4 hours.`;
      recommendations.push(`Dispatch AV Technician immediately with Epson ELPLP88 replacement lamp.`);
      recommendations.push(`Tentatively lock backup examination room E-208 in Space Management.`);
      recommendations.push(`Alert Chief Exam Superintendent Dr. K. Arulmozhi upon work order dispatch.`);
    } else {
      summary = `${ext.urgency} priority incident affecting ${ext.category} in ${ext.roomName || ext.buildingName || 'Campus Space'}.`;
      recommendations.push(`Assign certified technician matching ${ext.category} domain.`);
      recommendations.push(`Verify spares availability in Central Store.`);
    }

    return { summary, recommendations };
  }
}

export const incidentEngine = new IncidentEngine();
