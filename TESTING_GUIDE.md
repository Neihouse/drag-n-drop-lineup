# 🧪 **Internal Testing Guide**

## **Quick Role Switch Testing**

The app uses hard-coded constants for internal testing. Edit these in `seed/internalSeed.ts`:

```typescript
// Change these to test different views:
export const CURRENT_ROLE: UserRole = 'booker';     // promoter | booker | artist
export const CURRENT_ARTIST_ID = 'neihouse';        // neihouse | gobi | quietpack
```

### **🎛️ Role Behaviors**

| Role | Access | Features |
|------|--------|----------|
| **Promoter** | Full control | Lock/unlock lineups, all DnD, full management |
| **Booker** | Build lineups | Lock/unlock lineups, all DnD, lineup building |
| **Artist** | View dashboard | Accept/decline slots, tech rider, calendar downloads |

---

## **⚡ Testing Scenarios**

### **1. Lock Toggle Testing**
1. Set `CURRENT_ROLE: 'promoter'` or `'booker'`
2. Build a lineup with conflicts
3. Click **Lock** button → All controls disabled
4. Try drag/drop → Blocked with opacity + cursor feedback
5. Switch to `CURRENT_ROLE: 'artist'` → No lock button visible

### **2. Artist Dashboard Testing**
1. Set `CURRENT_ARTIST_ID: 'neihouse'`
2. Visit `/artist` → See Neihouse's slots
3. Test Accept/Decline → 150ms tick animation
4. Switch to `CURRENT_ARTIST_ID: 'gobi'`
5. Refresh → See Gobi's slots

### **3. Multi-DJ Flow**
1. **Promoter**: Create lineup with Neihouse + Gobi slots
2. **Neihouse**: Accept first slot, decline second
3. **Gobi**: Accept all slots
4. **Public**: Check `/public/bpm-010` → See accepted artists only

---

## **🔄 Quick Reset**

**Dev Reset Button**: Available in dev mode at bottom of planner
- Clears all localStorage
- Reloads fresh seed data
- Useful for clean testing runs

**Manual Reset**:
```bash
localStorage.clear()
location.reload()
```

---

## **📋 Testing Checklist**

### **Lineup Builder**
- [ ] Drag artists to timeline
- [ ] Conflict detection works
- [ ] Undo/redo functional
- [ ] Export downloads proper filenames
- [ ] Lock prevents all editing

### **Artist Dashboard**  
- [ ] Role switching shows correct artist
- [ ] Accept/decline animations
- [ ] Calendar downloads with proper slugs
- [ ] Tech rider drawer opens
- [ ] Locked lineups show "Final" status

### **Public Embed**
- [ ] Loads event data correctly
- [ ] Timeline shows only accepted artists
- [ ] Mobile responsive design
- [ ] Google Maps links work

---

## **🎯 Real Team Data**

The seed uses actual PG crew:
- **Venue**: Gratitude Lounge, Concord CA
- **Event**: BPM @ Gratitude (June 21, 2025)
- **Artists**: Neihouse, Gobi, Quiet Pack + TBA slots
- **Pre-set**: Neihouse 5:00-6:30 PM (accepted)

Perfect for internal dog-fooding! 🐕 