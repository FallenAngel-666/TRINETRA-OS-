/**
 * TRINETRA - Space & Resource Management Engine
 * Booking conflict prevention, classroom scheduling,
 * and automated alternative classroom recommendation.
 */

import { db } from './db.js';

export class BookingEngine {
  /**
   * Verifies if a room is available at a target date and time slot
   */
  isRoomAvailable(roomId, date, startTime, endTime) {
    const bookings = db.getBookings();
    const active = bookings.filter(b =>
      b.roomId === roomId &&
      b.date === date &&
      b.status !== 'Cancelled'
    );

    // Overlap condition: start < other.end && end > other.start
    const hasOverlap = active.some(b => startTime < b.endTime && endTime > b.startTime);
    return !hasOverlap;
  }

  /**
   * Finds optimal alternative classrooms when a space becomes compromised or unavailable
   */
  recommendAlternativeRooms(currentRoomId, requiredCapacity = 60, options = {}) {
    const {
      date = '2026-10-31',
      startTime = '09:00',
      endTime = '12:00',
      requiresProjector = true,
      requiresAC = true
    } = options;

    const currentRoom = db.getRoom(currentRoomId) || { buildingId: 'b-main', capacity: requiredCapacity };
    const allRooms = db.getRooms();

    // Filter candidate rooms
    const candidates = allRooms.filter(room => {
      // Must not be the same room
      if (room.id === currentRoomId) return false;

      // Must be healthy (green status)
      if (room.status !== 'green') return false;

      // Must meet capacity
      if (room.capacity < requiredCapacity) return false;

      // Must not be double-booked
      if (!this.isRoomAvailable(room.id, date, startTime, endTime)) return false;

      // Equipment checks
      if (requiresProjector && room.equipmentStatus && room.equipmentStatus.projector && room.equipmentStatus.projector.includes('Faulty')) {
        return false;
      }

      return true;
    });

    // Score and rank candidates
    const scored = candidates.map(room => {
      let score = 0;
      const reasons = [];

      // 1. Proximity: same building = +40 points
      if (room.buildingId === currentRoom.buildingId) {
        score += 40;
        reasons.push('Located in same building (Seamless student relocation)');
      } else {
        score += 15;
        reasons.push('Located in adjacent building');
      }

      // 2. Same floor = +15 points
      if (room.floorNumber === currentRoom.floorNumber) {
        score += 15;
        reasons.push(`Located on same floor (Floor ${room.floorNumber})`);
      }

      // 3. Optimal capacity matching (don't waste a 2500 seat auditorium for 70 students)
      const excessCapacity = room.capacity - requiredCapacity;
      if (excessCapacity >= 0 && excessCapacity <= 15) {
        score += 25;
        reasons.push(`Optimal capacity match (${room.capacity} seats for ${requiredCapacity} candidates)`);
      } else if (excessCapacity <= 40) {
        score += 15;
        reasons.push(`Adequate capacity (${room.capacity} seats)`);
      } else {
        score += 5;
        reasons.push(`High capacity hall (${room.capacity} seats)`);
      }

      // 4. Smart features
      if (room.features && room.features.some(f => f.toLowerCase().includes('projector') || f.toLowerCase().includes('multimedia'))) {
        score += 10;
        reasons.push('Fully equipped AV projection & sound system');
      }

      return {
        room,
        score,
        reasons
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  /**
   * Executes emergency exam/class relocation with automated database state update
   */
  relocateBooking(bookingId, targetRoomId) {
    const booking = db.getById('BOOKINGS', bookingId);
    if (!booking) throw new Error('Booking not found');

    const targetRoom = db.getRoom(targetRoomId);
    if (!targetRoom) throw new Error('Target room not found');

    const prevRoomId = booking.roomId;

    const updated = db.updateById('BOOKINGS', bookingId, {
      roomId: targetRoom.id,
      buildingId: targetRoom.buildingId,
      floorId: targetRoom.floorId,
      status: 'Relocated (Confirmed)',
      conflictFlag: false,
      notes: `Relocated from Room ${prevRoomId} to Room ${targetRoom.id} due to facility incident.`
    });

    db.addAuditLog('BOOKING_RELOCATED', bookingId, `Relocated booking "${booking.title}" from ${prevRoomId} to ${targetRoom.id}.`);
    db.addNotification(`Classroom Relocated: ${booking.title}`, `Relocated to ${targetRoom.name}. Notification sent to exam cell and candidates.`, 'success');

    return updated;
  }
}

export const bookingEngine = new BookingEngine();
