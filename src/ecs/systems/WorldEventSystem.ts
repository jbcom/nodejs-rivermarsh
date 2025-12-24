import { world } from '../world';
import { useAchievementStore } from '../../stores/useAchievementStore';

const POSSIBLE_EVENTS = [
    'blood_moon',
    'golden_hour',
    'meteor_shower',
    'foggy_morning'
];

export function WorldEventSystem() {
    for (const entity of world.with('worldEvents', 'time')) {
        const { worldEvents, time } = entity;
        const now = Date.now();

        // Check if current events should end
        if (worldEvents.activeEvents.length > 0) {
            if (now - worldEvents.lastEventTime > worldEvents.eventDuration) {
                console.log('World Event(s) Ended:', worldEvents.activeEvents);
                worldEvents.activeEvents = [];
                worldEvents.nextEventTime = now + 120000 + Math.random() * 300000; // Next event in 2-7 mins
                worldEvents.lastEventTime = now;
            }
        }

        // Check if new event should start
        if (worldEvents.activeEvents.length === 0 && now > worldEvents.nextEventTime) {
            const newEvent = POSSIBLE_EVENTS[Math.floor(Math.random() * POSSIBLE_EVENTS.length)];
            
            // Check event conditions
            let canStart = true;
            if (newEvent === 'blood_moon' && time.phase !== 'night') canStart = false;
            if (newEvent === 'golden_hour' && time.phase !== 'dusk') canStart = false;
            if (newEvent === 'foggy_morning' && time.phase !== 'dawn') canStart = false;

            if (canStart) {
                worldEvents.activeEvents = [newEvent];
                worldEvents.lastEventTime = now;
                console.log('World Event Started:', newEvent);
                
                // Achievement for first world event
                useAchievementStore.getState().unlockAchievement('first-steps'); // Example
            } else {
                // Delay if conditions not met or try a different event
                // If it's time for an event but conditions aren't met, we might want to pick another one
                // but for now let's just wait.
                worldEvents.nextEventTime = now + 10000; // Check again in 10s
            }
        }

        // Apply event effects to global state
        if (worldEvents.activeEvents.includes('blood_moon')) {
            time.ambientLight = 0.1; // Darker red-ish moon
            // Other systems (like AI) should check for blood_moon to increase difficulty
        }
        
        if (worldEvents.activeEvents.includes('foggy_morning')) {
            time.fogDensity = 0.15; // Very thick fog
        }
    }
}
