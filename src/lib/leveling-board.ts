// Leveling Board System
// Manages truck schedules, time slots, and card placement

export interface TruckSchedule {
  id: string;
  truckNumber: string;
  departureDay: number; // 1-7 for Monday-Sunday
  departureTime: string; // 24-hour format "HH:mm"
  preparationStartDay: number;
  preparationStartTime: string;
  preparationEndDay: number;
  preparationEndTime: string;
  safetyWindow: number; // Minutes
  parts: TruckPart[];
}

export interface TruckPart {
  partNumber: string;
  realProduction: number; // Actual production quantity
  customerDemand: number; // Required quantity
  toPool: number; // Quantity to move to pool stock
}

export interface TimeSlot {
  id: string;
  time: string; // 24-hour format "HH:mm"
  day: number; // 1-7 for Monday-Sunday
  isOccupied: boolean;
  cardId?: string; // ID of the WK card in this slot
}

export interface WKCard {
  id: string;
  partNumber: string;
  type: 'end_to_tpa' | 'end_to_pool' | 'pool_to_tpa';
  quantity: number;
  timeSlotId?: string;
}

// Mock data for development
export const mockTruckSchedules: TruckSchedule[] = [
  {
    id: 'truck-4',
    truckNumber: '4',
    departureDay: 1, // Monday
    departureTime: '21:30',
    preparationStartDay: 1,
    preparationStartTime: '11:00',
    preparationEndDay: 1,
    preparationEndTime: '17:00',
    safetyWindow: 270, // 4.5 hours in minutes
    parts: [
      {
        partNumber: '240064',
        realProduction: 14,
        customerDemand: 16,
        toPool: -2, // Negative means we need to pull from pool
      },
      {
        partNumber: '240396',
        realProduction: 2,
        customerDemand: 2,
        toPool: 0,
      }
    ]
  },
  // Add more truck schedules as needed
];

// Create time slots for the board (24 slots per day)
export const createTimeSlots = (startHour: number = 6): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hoursPerDay = 24;
  const daysOfWeek = 7;

  for (let day = 1; day <= daysOfWeek; day++) {
    for (let hour = 0; hour < hoursPerDay; hour++) {
      const actualHour = (startHour + hour) % 24;
      slots.push({
        id: `slot_${day}_${actualHour}`,
        time: `${actualHour.toString().padStart(2, '0')}:00`,
        day,
        isOccupied: false
      });
    }
  }

  return slots;
};

// Helper function to find available slots for a truck's preparation window
export const findAvailableSlots = (
  slots: TimeSlot[],
  startDay: number,
  startTime: string,
  endDay: number,
  endTime: string
): TimeSlot[] => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);

  return slots.filter(slot => {
    const slotHour = parseInt(slot.time.split(':')[0]);
    
    // If start and end are on the same day
    if (startDay === endDay) {
      return slot.day === startDay && slotHour >= startHour && slotHour <= endHour;
    }
    
    // If preparation window spans multiple days
    if (slot.day === startDay) {
      return slotHour >= startHour;
    } else if (slot.day === endDay) {
      return slotHour <= endHour;
    } else if (slot.day > startDay && slot.day < endDay) {
      return true;
    }
    
    return false;
  });
};

// Calculate optimal card placement based on truck schedules
export const calculateCardPlacements = (
  trucks: TruckSchedule[],
  slots: TimeSlot[]
): Map<string, string> => {
  const placements = new Map<string, string>(); // cardId -> slotId

  for (const truck of trucks) {
    const availableSlots = findAvailableSlots(
      slots,
      truck.preparationStartDay,
      truck.preparationStartTime,
      truck.preparationEndDay,
      truck.preparationEndTime
    );

    // Place cards for each part in the truck's schedule
    for (const part of truck.parts) {
      if (part.toPool < 0) {
        // Need to pull from pool stock - create pool_to_tpa card
        const cardId = `wk_${truck.id}_${part.partNumber}_pool`;
        const slot = availableSlots.find(s => !s.isOccupied);
        if (slot) {
          placements.set(cardId, slot.id);
        }
      }
      
      // Create end_to_tpa or end_to_pool cards based on production vs demand
      const cardId = `wk_${truck.id}_${part.partNumber}_${part.toPool > 0 ? 'pool' : 'tpa'}`;
      const slot = availableSlots.find(s => !s.isOccupied && !placements.has(s.id));
      if (slot) {
        placements.set(cardId, slot.id);
      }
    }
  }

  return placements;
};

// Export default time slots
export const defaultTimeSlots = createTimeSlots();
