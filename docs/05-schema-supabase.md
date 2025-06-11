# 🗄️ **Supabase Schema & Row-Level Security**

## **Entity Relationship Diagram**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   venues    │    │   events    │    │  event_roles │
│─────────────│    │─────────────│    │─────────────│
│ id (uuid)   │    │ id (uuid)   │    │ id (uuid)   │
│ name        │◄──┐│ title       │◄──┐│ event_id    │
│ address     │   ││ date        │   ││ user_id     │
│ capacity    │   ││ venue_id    │───┘│ role        │
│ created_at  │   ││ stages[]    │    │ created_at  │
└─────────────┘   ││ hours       │    └─────────────┘
                  ││ status      │           │
┌─────────────┐   ││ locked      │           │
│   artists   │   ││ created_by  │───────────┘
│─────────────│   ││ created_at  │
│ id (uuid)   │   │└─────────────┘
│ name        │   │       │
│ genre       │   │       │
│ email       │   │       ▼
│ avatar_color│   │┌─────────────┐
│ bio         │   ││lineup_slots │
│ created_at  │   ││─────────────│
└─────────────┘   ││ id (uuid)   │
       │          ││ event_id    │───┘
       │          ││ artist_id   │────┘
       │          ││ stage       │
       │          ││ start_time  │
       │          ││ end_time    │
       │          ││ status      │
       │          ││ tech_notes  │
       │          ││ created_at  │
       │          ││ updated_at  │
       │          │└─────────────┘
       │          │
       ▼          ▼
┌─────────────────────┐
│   artist_profiles   │
│─────────────────────│
│ user_id (uuid)      │
│ artist_id (uuid)    │
│ created_at          │
└─────────────────────┘
```

---

## **Table Schemas**

### **venues**
```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER,
  contact_email TEXT,
  website TEXT,
  google_maps_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_venues_name ON venues(name);
```

### **artists**  
```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  email TEXT,
  bio TEXT,
  avatar_color TEXT DEFAULT 'bg-avatar-blue',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_artists_name ON artists(name);
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_artists_email ON artists(email);
```

### **events**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  stages TEXT[] NOT NULL DEFAULT ARRAY['Main'],
  hours JSONB NOT NULL, -- { "start": "18:00", "end": "06:00" }
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  locked BOOLEAN NOT NULL DEFAULT false,
  flyer_url TEXT,
  ticket_url TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_status ON events(status);
```

### **event_roles**
```sql
CREATE TABLE event_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('promoter', 'booker')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique user per event
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_event_roles_event ON event_roles(event_id);
CREATE INDEX idx_event_roles_user ON event_roles(user_id);
```

### **lineup_slots**
```sql
CREATE TABLE lineup_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  tech_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent time conflicts on same stage
  EXCLUDE USING gist (
    event_id WITH =,
    stage WITH =,
    tsrange(start_time::text, end_time::text) WITH &&
  )
);

-- Indexes
CREATE INDEX idx_lineup_slots_event ON lineup_slots(event_id);
CREATE INDEX idx_lineup_slots_artist ON lineup_slots(artist_id);
CREATE INDEX idx_lineup_slots_status ON lineup_slots(status);
CREATE INDEX idx_lineup_slots_stage ON lineup_slots(stage);
```

### **artist_profiles**
```sql
CREATE TABLE artist_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  PRIMARY KEY (user_id, artist_id)
);

-- Indexes  
CREATE INDEX idx_artist_profiles_user ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_artist ON artist_profiles(artist_id);
```

---

## **Row-Level Security (RLS) Policies**

### **Enable RLS on all tables**
```sql
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
```

### **venues policies**
```sql
-- Read: Everyone can view venues
CREATE POLICY "venues_select" ON venues FOR SELECT TO authenticated USING (true);

-- Insert/Update/Delete: Only authenticated users (for now)
CREATE POLICY "venues_insert" ON venues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "venues_update" ON venues FOR UPDATE TO authenticated USING (true);
CREATE POLICY "venues_delete" ON venues FOR DELETE TO authenticated USING (true);
```

### **artists policies**
```sql
-- Read: Everyone can view artists  
CREATE POLICY "artists_select" ON artists FOR SELECT TO authenticated USING (true);

-- Insert: Anyone can create artist profiles
CREATE POLICY "artists_insert" ON artists FOR INSERT TO authenticated WITH CHECK (true);

-- Update: Only linked user profiles or event organizers
CREATE POLICY "artists_update" ON artists FOR UPDATE TO authenticated USING (
  id IN (SELECT artist_id FROM artist_profiles WHERE user_id = auth.uid())
  OR auth.uid() IN (
    SELECT er.user_id FROM event_roles er 
    JOIN lineup_slots ls ON ls.event_id = er.event_id 
    WHERE ls.artist_id = artists.id
  )
);
```

### **events policies**
```sql
-- Read: Event team members + public for published events
CREATE POLICY "events_select" ON events FOR SELECT TO authenticated USING (
  -- Event team members
  id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid())
  -- Or published events (for public view)
  OR status = 'published'
  -- Or event creator
  OR created_by = auth.uid()
);

-- Insert: Authenticated users
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Update: Event promoters and bookers
CREATE POLICY "events_update" ON events FOR UPDATE TO authenticated USING (
  id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid())
  OR created_by = auth.uid()
);

-- Delete: Event creators only
CREATE POLICY "events_delete" ON events FOR DELETE TO authenticated USING (
  created_by = auth.uid()
);
```

### **event_roles policies**
```sql
-- Read: Event team members
CREATE POLICY "event_roles_select" ON event_roles FOR SELECT TO authenticated USING (
  event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);

-- Insert: Event creators and promoters
CREATE POLICY "event_roles_insert" ON event_roles FOR INSERT TO authenticated WITH CHECK (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
    UNION
    SELECT event_id FROM event_roles WHERE user_id = auth.uid() AND role = 'promoter'
  )
);

-- Update/Delete: Event creators and promoters
CREATE POLICY "event_roles_update" ON event_roles FOR UPDATE TO authenticated USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
    UNION  
    SELECT event_id FROM event_roles WHERE user_id = auth.uid() AND role = 'promoter'
  )
);
```

### **lineup_slots policies**
```sql
-- Read: Event team + linked artists + public for published events
CREATE POLICY "lineup_slots_select" ON lineup_slots FOR SELECT TO authenticated USING (
  -- Event team members
  event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid())
  -- Or linked artist
  OR artist_id IN (SELECT artist_id FROM artist_profiles WHERE user_id = auth.uid())
  -- Or public for published events
  OR event_id IN (SELECT id FROM events WHERE status = 'published')
);

-- Insert/Update: Event team members only  
CREATE POLICY "lineup_slots_insert" ON lineup_slots FOR INSERT TO authenticated WITH CHECK (
  event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid())
);

CREATE POLICY "lineup_slots_update" ON lineup_slots FOR UPDATE TO authenticated USING (
  -- Event team can update everything
  event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid())
  -- Artists can only update their own status and tech_notes
  OR (
    artist_id IN (SELECT artist_id FROM artist_profiles WHERE user_id = auth.uid())
    AND event_id IN (SELECT id FROM events WHERE NOT locked)
  )
);

-- Delete: Event team only
CREATE POLICY "lineup_slots_delete" ON lineup_slots FOR DELETE TO authenticated USING (
  event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid())
);
```

### **artist_profiles policies**
```sql
-- Read: Own profiles + event organizers viewing their artists
CREATE POLICY "artist_profiles_select" ON artist_profiles FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR artist_id IN (
    SELECT ls.artist_id FROM lineup_slots ls
    JOIN event_roles er ON er.event_id = ls.event_id
    WHERE er.user_id = auth.uid()
  )
);

-- Insert: Own profiles only
CREATE POLICY "artist_profiles_insert" ON artist_profiles FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Delete: Own profiles only  
CREATE POLICY "artist_profiles_delete" ON artist_profiles FOR DELETE TO authenticated 
USING (user_id = auth.uid());
```

---

## **Triggers & Functions**

### **Update timestamps**
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lineup_slots_updated_at BEFORE UPDATE ON lineup_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### **Auto-create event role for creator**
```sql
CREATE OR REPLACE FUNCTION create_event_creator_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO event_roles (event_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'promoter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_event_creator_role_trigger
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION create_event_creator_role();
```

---

## **Sample Data Migration**

```sql
-- Insert sample venues
INSERT INTO venues (name, address, capacity) VALUES
('Gratitude Lounge', '1901 Pacheco St, Concord, CA', 120),
('The Warehouse', '123 Industrial Blvd, Oakland, CA', 500);

-- Insert sample artists  
INSERT INTO artists (name, genre, email, avatar_color) VALUES
('Neihouse', 'House', 'neihouse@primordialgroove.com', 'bg-avatar-blue'),
('Gobi', 'Tech-House', 'gobi@primordialgroove.com', 'bg-avatar-orange'),
('Quiet Pack', 'Minimal', 'quietpack@primordialgroove.com', 'bg-avatar-purple');

-- Sample event (created_by will need real user UUID)
INSERT INTO events (title, date, venue_id, hours, created_by) VALUES
('BPM @ Gratitude', '2025-06-21', 
 (SELECT id FROM venues WHERE name = 'Gratitude Lounge'),
 '{"start": "17:00", "end": "22:00"}',
 'real-user-uuid-here');
``` 