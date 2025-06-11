# 🌱 **Internal Seed Data System**

## **Overview**

The platform includes a lean internal seed data system designed for testing and development. This replaces the need for fake/dummy data with realistic team information.

---

## **Seed Data Structure**

### **File Location**
```
seed/
├── internalSeed.ts       # Main seed data definition
└── README.md            # This documentation
```

### **Data Contents**
```typescript
// Real venue for actual events
venue: {
  id: 'gratitude',
  name: 'Gratitude Lounge', 
  address: '1901 Pacheco St, Concord, CA',
  capacity: 120
}

// Actual PG crew members
artists: [
  { id: 'neihouse', name: 'Neihouse', genre: 'House' },
  { id: 'gobi', name: 'Gobi', genre: 'Tech-House' },
  { id: 'quietpack', name: 'Quiet Pack', genre: 'Minimal' },
  { id: 'openslot1', name: 'TBA #1', genre: '—' },  // For testing
  { id: 'openslot2', name: 'TBA #2', genre: '—' }
]

// Realistic upcoming event
event: {
  id: 'bpm-010',
  title: 'BPM @ Gratitude',
  date: '2025-06-21',
  stages: ['Main'],
  hours: { start: '17:00', end: '22:00' }
}

// Pre-set one slot for immediate interaction
slots: [
  {
    eventId: 'bpm-010',
    artistId: 'neihouse', 
    stage: 'Main',
    startTime: '17:00',
    endTime: '18:30',
    status: 'accepted'
  }
]
```

---

## **Role Testing System**

### **Hard-Coded Constants**
```typescript
// Toggle these for testing different user views
export const CURRENT_ROLE: UserRole = 'booker';      // promoter | booker | artist
export const CURRENT_ARTIST_ID = 'neihouse';         // neihouse | gobi | quietpack
```

### **Role Behaviors**
```
Promoter: Full access + lock controls
Booker:   Full access + lock controls  
Artist:   Dashboard view only (no lineup builder access)
```

### **Testing Workflow**
1. Edit `internalSeed.ts` role constants
2. Refresh browser or use "Reset Demo Data" button
3. Test specific user flows
4. Switch roles and repeat

---

## **Development Integration**

### **Auto-Loading**
```typescript
// Runs automatically on app startup
// Only loads if localStorage is empty (preserves user work)

function primeInternalStore() {
  if (localStorage.getItem('lineupState')) {
    console.log('🌱 Lineup data already exists, skipping seed load');
    return;
  }
  
  localStorage.setItem('lineupState', JSON.stringify(initialState));
  console.log('🌱 Internal seed data loaded');
}
```

### **Reset Mechanism**
```typescript
// Dev-only button in lineup planner footer
<button onClick={() => {
  localStorage.clear();
  window.location.reload();
}}>
  Reset Demo Data
</button>

// Manual reset in console
localStorage.clear();
location.reload();
```

---

## **Production Migration Path**

### **Phase 1: Demo Mode**
```typescript
// Current: Hard-coded seed data
const isDemoMode = process.env.NODE_ENV === 'development';

if (isDemoMode) {
  // Use internal seed data
  primeInternalStore();
} else {
  // Load from production database
  loadProductionData();
}
```

### **Phase 2: Environment Toggle**
```typescript
// Environment variable control
const useSeedData = process.env.USE_SEED_DATA === 'true';

// Allow production demos with seed data
if (useSeedData) {
  primeInternalStore();
}
```

### **Phase 3: Complete Removal**
```typescript
// Remove all seed-related code
// Full Supabase + Clerk integration
// Real user authentication and data
```

---

## **Testing Scenarios**

### **1. Complete Event Workflow**
```
Promoter → Create Event
Booker   → Build Lineup (drag Neihouse, Gobi)  
Promoter → Lock Lineup
Neihouse → Accept Slot
Gobi     → Decline Slot
Public   → View Timetable (only Neihouse visible)
```

### **2. Conflict Testing**
```
Booker → Drag Neihouse to 17:00-18:30
Booker → Drag Gobi to 17:30-19:00
System → Detect overlap, resolve conflict
```

### **3. Lock State Testing**
```
Booker → Build lineup
Promoter → Lock lineup
Booker → Try to edit (should be disabled)
Artist → Accept/decline (should show "Final" status)
```

### **4. Export Testing**
```
Booker → Create full lineup
Export → Check CSV filename: "2025-06-21_bpm-gratitude_lineup.csv"
Export → Check ICS calendar events
```

---

## **Data Validation**

### **Real Information**
- ✅ **Venue**: Actual location with real address
- ✅ **Artists**: Team members' actual stage names
- ✅ **Event**: Realistic date and timing for venue
- ✅ **Contact**: Real email domains (@primordialgroove.com)

### **Test Safety**
- 🔒 **No External Calls**: Everything runs locally
- 🔒 **No Real Emails**: No notifications sent in dev mode
- 🔒 **Isolated State**: localStorage only, no database writes

---

## **Customization Guide**

### **Adding Test Artists**
```typescript
// In internalSeed.ts
artists: [
  // ... existing artists
  { 
    id: 'new-artist-id', 
    name: 'New Artist Name', 
    genre: 'Genre',
    avatarColor: 'bg-avatar-green',
    email: 'artist@primordialgroove.com'
  }
]
```

### **Creating Different Events**
```typescript
// Multiple events for testing
events: [
  // ... existing event
  {
    id: 'warehouse-party',
    title: 'Warehouse Underground',
    date: '2025-07-15',
    stages: ['Main', 'Patio'],
    hours: { start: '20:00', end: '06:00' }
  }
]
```

### **Pre-Setting Complex Lineups**
```typescript
// Pre-populate with multi-stage, multi-artist lineup
slots: [
  { eventId: 'event-id', artistId: 'artist1', stage: 'Main', ... },
  { eventId: 'event-id', artistId: 'artist2', stage: 'Patio', ... },
  // ... more complex scenarios
]
```

---

## **Why This Approach**

### **Benefits Over Fake Data**
- ✅ **Team Recognition**: Everyone knows these names/venues
- ✅ **Realistic Testing**: Actual constraints and scenarios  
- ✅ **Focused Scope**: No overwhelming fake data to parse
- ✅ **Production Readiness**: Easy migration path to real data

### **Development Efficiency**
- 🚀 **Immediate Context**: No learning curve for test data
- 🚀 **Quick Validation**: Team can immediately validate workflows
- 🚀 **Real Constraints**: Test with actual venue capacity, timing
- 🚀 **Clean Handoff**: CTO gets realistic data model

This internal seed system bridges the gap between development convenience and production readiness, ensuring the platform works with real-world data from day one. 