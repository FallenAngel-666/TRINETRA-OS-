/**
 * TRINETRA - Workforce & Maintenance Management Engine
 * Intelligent multi-factor technician assignment, shift management,
 * and automated reassignment when personnel become unavailable.
 */

import { db } from './db.js';

export class WorkforceEngine {
  constructor() {
    this.skillMap = {
      'Audiovisual / Presentation': ['Audiovisual / Projectors', 'Interactive Whiteboards', 'HDMI Matrix Extenders', 'PA Systems'],
      'Electrical & Power': ['High Voltage & Power Distribution', 'UPS Banks', 'MCB & Switchgear', 'DG Set Automation'],
      'HVAC & Climate Control': ['Chillers & VRV/VRF Systems', 'Inverter Split ACs', 'Refrigerant Recovery', 'Air Handling Units'],
      'Network & Connectivity': ['Optical Fiber & Managed Switches', 'Aruba Wi-Fi 6', 'Cat6 Structured Cabling', 'Firewall VLANs'],
      'Plumbing & Hydraulic': ['Hydro-Pneumatic Pumps & Piping', 'Water Treatment Plants', 'Fire Sprinkler Mains', 'Drainage Flow'],
      'Civil & Furniture': ['Structural Repairs & Aluminum Glazing', 'Acoustic Ceiling Tiles', 'Modular Desks', 'Door Closers & Locks']
    };
  }

  /**
   * Evaluates all technicians and scores them for a specific incident
   */
  findBestTechnician(incident) {
    const allTechs = db.getAll('TECHNICIANS');
    const requiredSkills = this.skillMap[incident.category] || [];

    const scored = allTechs.map(tech => {
      let score = 0;
      const reasons = [];

      // 1. Skill Match (Weight: 40 points)
      const hasPrimary = requiredSkills.includes(tech.primarySkill);
      const hasSecondary = tech.secondarySkills.some(s => requiredSkills.includes(s));

      if (hasPrimary) {
        score += 40;
        reasons.push(`Primary skill match: ${tech.primarySkill}`);
      } else if (hasSecondary) {
        score += 25;
        reasons.push(`Secondary skill match`);
      } else {
        score += 5; // general maintenance
      }

      // 2. Availability (Weight: 25 points)
      if (tech.availability === 'Available') {
        score += 25;
        reasons.push('Currently Available on duty');
      } else if (tech.availability === 'On-Call') {
        score += 15;
        reasons.push('On-Call standby');
      } else {
        score -= 20;
        reasons.push('Currently Busy with active tickets');
      }

      // 3. Workload Balance (Weight: 20 points)
      // Lower workload gives higher score
      const workloadScore = Math.max(0, 20 - (tech.currentWorkload || 0) * 6);
      score += workloadScore;
      reasons.push(`Current active workload: ${tech.currentWorkload || 0} work orders`);

      // 4. Building Location Proximity (Weight: 15 points)
      if (incident.buildingId && tech.assignedBuilding === incident.buildingId) {
        score += 15;
        reasons.push(`Stationed in same building (${tech.assignedBuilding})`);
      }

      return {
        tech,
        totalScore: Math.max(0, score),
        reasons
      };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    return scored;
  }

  /**
   * Re-evaluates assignments when a technician becomes unavailable
   */
  reassignWorkload(unavailableTechId, reason = 'Reported Sick / Shift End') {
    const tech = db.getById('TECHNICIANS', unavailableTechId);
    if (!tech) return { success: false, message: 'Technician not found' };

    // Mark tech unavailable
    db.updateById('TECHNICIANS', unavailableTechId, {
      availability: 'Unavailable',
      unavailabilityReason: reason
    });

    // Find all active work orders for this tech
    const allWos = db.getWorkOrders();
    const openWos = allWos.filter(wo =>
      wo.assignedTechnicianId === unavailableTechId &&
      wo.status !== 'Completed' &&
      wo.status !== 'Cancelled'
    );

    const reassignments = [];

    openWos.forEach(wo => {
      const parentIncident = db.getIncident(wo.incidentId) || { category: 'General Maintenance', buildingId: wo.buildingId };
      const candidates = this.findBestTechnician(parentIncident).filter(c => c.tech.id !== unavailableTechId && c.tech.availability !== 'Unavailable');

      if (candidates.length > 0) {
        const replacement = candidates[0].tech;
        db.updateById('WORK_ORDERS', wo.id, {
          assignedTechnicianId: replacement.id,
          technicianName: replacement.name,
          notes: `${wo.notes || ''} [Auto-reassigned from ${tech.name} due to ${reason}]`
        });

        // Update workloads
        db.updateById('TECHNICIANS', replacement.id, {
          currentWorkload: (replacement.currentWorkload || 0) + 1
        });

        reassignments.push({
          workOrderId: wo.id,
          title: wo.title,
          previousTechnician: tech.name,
          newTechnician: replacement.name,
          reason: candidates[0].reasons.join(', ')
        });
      }
    });

    // Reset previous tech's workload count
    db.updateById('TECHNICIANS', unavailableTechId, { currentWorkload: 0 });

    db.addAuditLog('WORKLOAD_REASSIGNED', unavailableTechId, `Reassigned ${reassignments.length} open work orders from ${tech.name} due to ${reason}.`);
    db.addNotification(`Technician Unavailable: ${tech.name}`, `Reassigned ${reassignments.length} work orders to alternate available staff.`, 'warning');

    return {
      success: true,
      previousTechnician: tech.name,
      reassignedCount: reassignments.length,
      details: reassignments
    };
  }
}

export const workforceEngine = new WorkforceEngine();
