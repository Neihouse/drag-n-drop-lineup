# 🎯 **SlotCard Component**

## **Purpose**
Artist-facing slot display component showing booking details, status, and interactive controls for accepting/declining performance requests.

---

## **Props Interface**

```typescript
interface SlotCardProps {
  slot: LineupSlot;           // Slot data with time, stage, status
  event: Event;              // Event context (title, date, venue)
  artist: Artist;            // Artist data for display
  onStatusChange: (          // Status update callback
    slotId: string, 
    status: 'accepted' | 'declined'
  ) => void;
  showAnimation: boolean;    // Trigger 150ms tick animation
}
```

---

## **Component States**

### **Status Display**
- **Pending**: Gray background, Accept/Decline buttons visible
- **Accepted**: Green background, "Change to Decline" button
- **Declined**: Red background, "Change to Accept" button
- **Locked**: Gray background, "Final - Lineup finalised" chip

### **Animation States**
- **Default**: Normal card appearance
- **Animating**: Green overlay with checkmark icon (150ms duration)
- **Tech Rider Open**: Modal overlay with textarea form

---

## **Visual Specifications**

### **Card Layout**
```
┌─────────────────────────────────────────────────┐
│ Event Title                                     │
│ Date                                            │
│                                                 │
│ [STAGE] Time Start – Time End                   │
│                                                 │
│ 📍 Venue Link (Mobile: icon only)               │
│                                                 │
│ [Status Chip]                                   │
│                                                 │
│ ┌─────────┐ ┌─────────┐  or  ┌─────────────────┐│
│ │ ACCEPT  │ │ DECLINE │      │  Change Status  ││
│ └─────────┘ └─────────┘      └─────────────────┘│
│                                                 │
│ ┌──────────────┐ ┌───┐                          │
│ │ Tech Rider   │ │📄│                          │
│ └──────────────┘ └───┘                          │
└─────────────────────────────────────────────────┘
```

### **Color Specifications**
- **Card Background**: `#F5F5F5` (primordial-card-background)
- **Accept Button**: `#16A34A` (green-600)
- **Decline Button**: `#DC2626` (red-600)
- **Stage Pill**: `#00FFCC` (primordial-accent-primary)
- **Animation Overlay**: `rgba(34, 197, 94, 0.2)` (green-500/20)

---

## **Accessibility Features**

### **ARIA Labels**
```html
<button aria-label="Accept performance slot for Event Name">
<div role="status" aria-label="Booking status: pending">
<button aria-label="Download calendar event">
```

### **Keyboard Navigation**
- Tab order: Accept → Decline → Tech Rider → Calendar Download
- Enter/Space: Activate buttons
- Escape: Close tech rider modal

### **Screen Reader Support**
- Status announcements on change
- Clear button labeling with context
- Modal focus management

---

## **Responsive Behavior**

### **Desktop (≥768px)**
- Full venue link with icon and text
- Side-by-side Accept/Decline buttons
- Horizontal action layout

### **Mobile (<768px)**  
- Venue icon only (below time slot)
- Stacked Accept/Decline buttons
- Compact action layout

---

## **Tech Rider Modal**

### **Modal Specifications**
- **Trigger**: "Add Tech Rider" button
- **Position**: Bottom sheet on mobile, centered on desktop
- **Background**: Semi-transparent overlay (`bg-black/50`)
- **Content**: Textarea with specific placeholder examples

### **Placeholder Text**
```
e.g. 2x XLR inputs, HD25 headphones, stage monitor positioning...
```

### **Actions**
- **Save**: Persist notes (not implemented in MVP)
- **Cancel**: Close without saving
- **Close (X)**: Same as cancel

---

## **Animation Specifications**

### **Success Animation (150ms)**
1. Green overlay appears with checkmark icon
2. Pulses for 150ms
3. Fades out automatically
4. Triggers autosave notification in parent

### **Calendar Download**
- Generates proper slugged filename: `YYYY-MM-DD_event-slug_artist-slug.ics`
- Example: `2025-06-21_bpm-gratitude_dj-nova.ics`

---

## **Error States**

### **Locked Event**
- All buttons disabled with `opacity-50`
- Status shows "Final - Lineup finalised"
- No interactive elements available

### **Network Errors**
- Button states reset if update fails
- User feedback via toast/notification
- Retry mechanism (not implemented in MVP)

---

## **Usage Examples**

### **Basic Implementation**
```jsx
<SlotCard
  slot={slot}
  event={event}  
  artist={currentArtist}
  onStatusChange={handleStatusUpdate}
  showAnimation={animatingSlot === slot.id}
/>
```

### **Integration Points**
- Parent component manages `animatingSlot` state
- Status changes trigger autosave notification
- Calendar downloads use `downloadICS()` utility
- Tech rider notes stored in component state (MVP) 