# 🔄 **UX Flow Map - Lineup Management Platform**

## **Swim Lane User Journey**

```
PROMOTER           BOOKER             ARTIST            PUBLIC
   |                  |                  |                |
   |                  |                  |                |
┌──▼──┐               |                  |                |
│Event│               |                  |                |
│Setup│               |                  |                |
└──┬──┘               |                  |                |
   │                  |                  |                |
   ├─ Create Event    |                  |                |
   ├─ Set Venue       |                  |                |
   ├─ Define Stages   |                  |                |
   └─ Set Hours       |                  |                |
   │                  |                  |                |
   ▼                  |                  |                |
┌──────┐              |                  |                |
│Assign│              |                  |                |
│Booker│              |                  |                |
└──┬───┘              |                  |                |
   │                  |                  |                |
   │ ─── Grant Access ──► │                  |                |
   │                  ┌──▼──┐               |                |
   │                  │Build│               |                |
   │                  │Lineup│              |                |
   │                  └──┬──┘               |                |
   │                     │                  |                |
   │                     ├─ Drag Artists    |                |
   │                     ├─ Set Time Slots  |                |
   │                     ├─ Resolve Conflicts|               |
   │                     └─ Timeline Preview |               |
   │                     │                  |                |
   │                     ▼                  |                |
   │                  ┌──────┐              |                |
   │                  │Notify│              |                |
   │                  │Artists│             |                |
   │                  └──┬───┘              |                |
   │                     │                  |                |
   │                     │ ── Send Invites ──► │                |
   │                     │                  ┌──▼──┐           |
   │                     │                  │Slot │           |
   │                     │                  │Review│          |
   │                     │                  └──┬──┘           |
   │                     │                     │              |
   │                     │                     ├─ Accept      |
   │                     │                     ├─ Decline     |
   │                     │                     ├─ Tech Rider  |
   │                     │                     └─ Calendar DL |
   │                     │                     │              |
   │                     │ ◄── Response ───────┘              |
   │                     │                     │              |
   │                     ▼                     │              |
   │                  ┌──────┐                 │              |
   │                  │Track │                 │              |
   │                  │Status│                 │              |
   │                  └──┬───┘                 │              |
   │                     │                     │              |
   │                     ├─ Monitor Responses  │              |
   │                     ├─ Handle Changes     │              |
   │                     └─ Final Adjustments  │              |
   │                     │                     │              |
   │ ◄── Ready for Lock ──┘                     │              |
   │                     │                     │              |
   ▼                     │                     │              |
┌──────┐                 │                     │              |
│Final │                 │                     │              |
│Review│                 │                     │              |
└──┬───┘                 │                     │              |
   │                     │                     │              |
   ├─ Approve Lineup     │                     │              |
   ├─ Lock Timeline      │                     │              |
   └─ Publish Public     │                     │              |
   │                     │                     │              |
   │ ── Lock Lineup ─────► │                     │              |
   │                  ┌──▼──┐                  │              |
   │                  │No   │                  │              |
   │                  │Edit │                  │              |
   │                  └─────┘                  │              |
   │                     │                     │              |
   │                     │ ── Final Notice ────► │              |
   │                     │                  ┌──▼──┐           |
   │                     │                  │Final│           |
   │                     │                  │Conf │           |
   │                     │                  └─────┘           |
   │                     │                     │              |
   │ ──── Publish Event ──────────────────────────────────────► │
   │                     │                     │           ┌──▼──┐
   │                     │                     │           │View │
   │                     │                     │           │Timeline│
   │                     │                     │           └──┬──┘
   │                     │                     │              │
   │                     │                     │              ├─ See Artists
   │                     │                     │              ├─ Add Calendar
   │                     │                     │              ├─ Get Tickets
   │                     │                     │              └─ Share Event
   │                     │                     │              │
   │                     ▼                     ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        EVENT NIGHT                              │
│  Real-time updates • Mobile timetables • Artist coordination    │
└──────────────────────────────────────────────────────────────────┘
```

---

## **Critical Decision Points**

### **🎯 Booker Decision Points**
1. **Artist Selection**: Which DJs fit the event vibe and time slots?
2. **Conflict Resolution**: How to handle overlapping requests or double-bookings?
3. **Timeline Optimization**: Balance headliners, build energy progression

### **🎧 Artist Decision Points**  
1. **Slot Acceptance**: Does timing work with other commitments?
2. **Tech Requirements**: Special equipment or setup needs?
3. **Travel Logistics**: Can they make the venue on time?

### **🎪 Promoter Decision Points**
1. **Final Approval**: Is the lineup commercially viable?
2. **Lock Timing**: When to freeze changes for marketing?
3. **Public Release**: Marketing timing and announcement strategy

---

## **State Transitions**

### **Event States**
```
Draft → Building → Review → Locked → Published → Live → Complete
```

### **Slot States**  
```
Pending → Accepted/Declined → Confirmed → Final → Performed
```

### **User States**
```
Invited → Active → Confirmed → Locked → Notified
```

---

## **Error Flows & Edge Cases**

### **Conflict Resolution**
- **Time Overlap**: Auto-detect and highlight conflicts
- **Artist Unavailable**: Suggest alternatives or time shifts
- **Last-Minute Changes**: Emergency unlock and re-notification

### **Communication Failures**
- **No Response**: Escalation timeline and backup artists
- **Tech Issues**: Manual override and phone coordination
- **Artist Cancellation**: Rapid replacement workflow

---

## **Mobile Considerations**

### **Artist Mobile Flow** 
1. Email notification → Mobile web view
2. One-tap Accept/Decline
3. Tech rider quick form
4. Calendar auto-add

### **Public Mobile Flow**
1. Event discovery → Mobile timetable
2. Artist tap for details
3. Add to calendar CTA
4. Share to social media

---

## **Analytics & Tracking Points**

- **Response Times**: How quickly artists respond to requests
- **Conflict Frequency**: Common scheduling pain points  
- **User Engagement**: Time spent in app, feature usage
- **Conversion Rates**: Invite → Accept → Confirmed → Performed
- **Public Engagement**: Timetable views, calendar adds, ticket clicks

This flow ensures every user persona has a clear, efficient path through the system while maintaining data integrity and user experience quality. 