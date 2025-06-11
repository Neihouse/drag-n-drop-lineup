# 🔗 **API Contract - Frontend Integration Points**

## **Overview**

The frontend currently uses localStorage for all data operations. This contract defines the exact API endpoints and Supabase RPC calls needed to replace localStorage with production database operations.

---

## **Authentication Context**

All API calls require user authentication via Clerk → Supabase JWT integration.

### **User Context Required**
```typescript
interface UserContext {
  userId: string;           // Clerk user ID mapped to Supabase auth.users
  userEmail: string;        // For notifications
  userRole?: 'promoter' | 'booker' | 'artist';  // Determined by event_roles or artist_profiles
}
```

---

## **Core Data Operations**

### **1. Event Management**

#### **GET /events/:eventId**
```typescript
// Frontend: useLineup() → state.events.find(e => e.id === eventId)
// Supabase: SELECT * FROM events WHERE id = $1

Response: Event | null
```

#### **POST /events**
```typescript
// Frontend: dispatch({ type: 'CREATE_EVENT', payload })
// Supabase: INSERT INTO events

Request: {
  title: string;
  date: string;
  venueId?: string;
  stages: string[];
  hours: { start: string; end: string };
}

Response: Event
```

#### **PATCH /events/:eventId**
```typescript
// Frontend: dispatch({ type: 'UPDATE_EVENT', payload })
// Supabase: UPDATE events SET ... WHERE id = $1

Request: Partial<Event>
Response: Event
```

#### **POST /events/:eventId/lock**
```typescript
// Frontend: dispatch({ type: 'TOGGLE_LOCK', payload: eventId })
// Supabase: UPDATE events SET locked = NOT locked WHERE id = $1

Response: { locked: boolean }
```

### **2. Lineup Slot Operations**

#### **GET /events/:eventId/slots**
```typescript
// Frontend: state.slots.filter(s => s.eventId === eventId)
// Supabase: SELECT * FROM lineup_slots WHERE event_id = $1

Response: LineupSlot[]
```

#### **POST /events/:eventId/slots**
```typescript
// Frontend: dispatch({ type: 'ADD_SLOT', payload })
// Supabase: INSERT INTO lineup_slots (with conflict resolution)

Request: {
  artistId: string;
  stage: string;
  startTime: string;
  endTime: string;
}

Response: LineupSlot
```

#### **PATCH /slots/:slotId**
```typescript
// Frontend: dispatch({ type: 'UPDATE_SLOT', payload })
// Supabase: UPDATE lineup_slots SET ... WHERE id = $1

Request: {
  startTime?: string;
  endTime?: string;
  artistId?: string;
  status?: 'pending' | 'accepted' | 'declined';
  techNotes?: string;
}

Response: LineupSlot
```

#### **DELETE /slots/:slotId**
```typescript
// Frontend: dispatch({ type: 'REMOVE_SLOT', payload: slotId })
// Supabase: DELETE FROM lineup_slots WHERE id = $1

Response: { success: boolean }
```

### **3. Artist Operations**

#### **GET /artists**
```typescript
// Frontend: state.artists
// Supabase: SELECT * FROM artists ORDER BY name

Response: Artist[]
```

#### **GET /artists/me**
```typescript
// Frontend: CURRENT_ARTIST_ID logic
// Supabase: SELECT * FROM artists JOIN artist_profiles ON ... WHERE user_id = auth.uid()

Response: Artist[]  // Artists linked to current user
```

#### **POST /artists/:artistId/link**
```typescript
// Frontend: Not implemented (for artist profile claiming)
// Supabase: INSERT INTO artist_profiles (user_id, artist_id)

Response: { success: boolean }
```

---

## **Supabase RPC Functions**

### **1. Conflict Detection RPC**
```sql
CREATE OR REPLACE FUNCTION check_slot_conflicts(
  p_event_id UUID,
  p_stage TEXT,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_slot_id UUID DEFAULT NULL
)
RETURNS SETOF lineup_slots AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM lineup_slots
  WHERE event_id = p_event_id
    AND stage = p_stage
    AND id != COALESCE(p_exclude_slot_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND tsrange(start_time::text, end_time::text) && tsrange(p_start_time::text, p_end_time::text);
END;
$$ LANGUAGE plpgsql;
```

### **2. Artist Notification RPC**
```sql
CREATE OR REPLACE FUNCTION notify_artist_slot_change(
  p_slot_id UUID,
  p_change_type TEXT -- 'created', 'updated', 'deleted'
)
RETURNS JSON AS $$
DECLARE
  slot_data RECORD;
  event_data RECORD;
  artist_data RECORD;
BEGIN
  -- Get slot, event, and artist data
  SELECT ls.*, e.title as event_title, e.date as event_date, a.name as artist_name, a.email as artist_email
  INTO slot_data
  FROM lineup_slots ls
  JOIN events e ON e.id = ls.event_id
  JOIN artists a ON a.id = ls.artist_id
  WHERE ls.id = p_slot_id;
  
  -- Return notification payload for email service
  RETURN json_build_object(
    'to', slot_data.artist_email,
    'subject', 'Lineup Update: ' || slot_data.event_title,
    'template', 'slot_' || p_change_type,
    'data', row_to_json(slot_data)
  );
END;
$$ LANGUAGE plpgsql;
```

### **3. Event Statistics RPC**
```sql
CREATE OR REPLACE FUNCTION get_event_statistics(p_event_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_slots', COUNT(*),
      'accepted_slots', COUNT(*) FILTER (WHERE status = 'accepted'),
      'pending_slots', COUNT(*) FILTER (WHERE status = 'pending'),
      'declined_slots', COUNT(*) FILTER (WHERE status = 'declined'),
      'stages', array_agg(DISTINCT stage),
      'duration_minutes', EXTRACT(EPOCH FROM (MAX(end_time) - MIN(start_time)))/60
    )
    FROM lineup_slots
    WHERE event_id = p_event_id
  );
END;
$$ LANGUAGE plpgsql;
```

---

## **Real-Time Subscriptions**

### **1. Lineup Changes**
```typescript
// Frontend: Replace localStorage auto-save with real-time sync
const supabase = createClient();

supabase
  .channel('lineup-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'lineup_slots',
    filter: `event_id=eq.${eventId}`
  }, (payload) => {
    // Update local state with remote changes
    handleRemoteSlotChange(payload);
  })
  .subscribe();
```

### **2. Event Lock Status**
```typescript
supabase
  .channel('event-lock')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public', 
    table: 'events',
    filter: `id=eq.${eventId}`
  }, (payload) => {
    // Update lock status in real-time
    if (payload.new.locked !== payload.old.locked) {
      dispatch({ type: 'UPDATE_EVENT', payload: { id: eventId, updates: payload.new }});
    }
  })
  .subscribe();
```

---

## **File Upload Endpoints**

### **Event Flyers**
```typescript
// POST /upload/flyer
// Updates: events.flyer_url

Request: FormData with image file
Response: { url: string }
```

### **Artist Avatars**  
```typescript
// POST /upload/avatar/:artistId
// Updates: artists.avatar_url (new field)

Request: FormData with image file
Response: { url: string }
```

---

## **Email Notification Integration**

### **Artist Slot Notifications**
```typescript
// Triggered by: slot creation, updates, event lock
// Template: slot-notification.html
// Data: {
//   artistName: string;
//   eventTitle: string;
//   eventDate: string;
//   stage: string;
//   startTime: string;
//   endTime: string;
//   status: string;
//   acceptUrl: string;  // Deep link to artist dashboard
//   declineUrl: string;
// }
```

### **Event Team Updates**
```typescript
// Triggered by: artist responses, lineup changes
// Template: team-notification.html
// Data: {
//   eventTitle: string;
//   changeType: string;
//   artistName: string;
//   newStatus: string;
//   dashboardUrl: string;
// }
```

---

## **Export API Endpoints**

### **CSV Export**
```typescript
// GET /events/:eventId/export/csv
// Headers: Content-Disposition: attachment; filename="event-lineup.csv"

Response: text/csv
```

### **ICS Export**
```typescript
// GET /events/:eventId/export/ics
// Headers: Content-Type: text/calendar

Response: text/calendar
```

### **Public Timetable Data**
```typescript
// GET /events/:eventId/public
// No auth required for published events

Response: {
  event: Event;
  slots: LineupSlot[];  // Only accepted slots
  artists: Artist[];
}
```

---

## **Error Handling Standards**

### **Conflict Errors**
```typescript
// 409 Conflict - Time slot overlaps
{
  error: "SLOT_CONFLICT",
  message: "Time slot conflicts with existing booking",
  conflicts: LineupSlot[]
}
```

### **Permission Errors**
```typescript
// 403 Forbidden - Insufficient role permissions
{
  error: "INSUFFICIENT_PERMISSIONS", 
  message: "User role does not allow this operation",
  required_role: "promoter" | "booker"
}
```

### **Validation Errors**
```typescript
// 400 Bad Request - Invalid data
{
  error: "VALIDATION_ERROR",
  message: "Invalid time format",
  field: "startTime"
}
```

---

## **Migration Strategy**

### **Phase 1: Dual Write**
1. Keep localStorage operations
2. Add parallel Supabase writes
3. Compare results for validation

### **Phase 2: Read Migration**
1. Read from Supabase first
2. Fallback to localStorage if needed
3. Migrate localStorage data to Supabase

### **Phase 3: Full Migration**
1. Remove localStorage dependencies
2. Full Supabase operation
3. Real-time collaboration enabled

This contract ensures a smooth transition from the current localStorage implementation to a production-ready multi-tenant database system. 