# Primordial Groove
### Professional DJ Lineup Management Platform

A comprehensive, multi-persona lineup planning platform designed for electronic music events. From initial event creation to artist confirmation and public timetable sharing, Primordial Groove streamlines the entire booking workflow with intelligent conflict detection, professional export capabilities, and a stunning dark-electric UI.

## 🎯 **Target Users**

### **Promoters**
- Create and configure events with multiple stages
- Set event hours and manage venue details
- Publish events for booking team collaboration
- Oversee lineup progress with real-time dashboards

### **Bookers & Talent Managers**
- Build lineups with advanced drag-and-drop interface
- Intelligent conflict detection and overlap prevention
- Export schedules (CSV, ICS calendar files)
- Email artist notifications with lineup details
- Precision editing with interactive slot details panel

### **DJs & Artists**
- Personal dashboard to view all upcoming gigs
- Accept or decline booking offers
- Add technical rider requirements
- Download individual performance calendar events
- Real-time status tracking (pending/accepted/declined)

### **Public Attendees**
- View read-only event timetables
- Mobile-responsive schedule layouts
- Add full event lineup to personal calendars
- Embed-friendly public timeline views

---

## 🚀 **Core Features**

### **Event Management**
- **Multi-Step Event Wizard**: Guided event creation with validation
- **Dynamic Stage Configuration**: Add/remove stages with custom names
- **Cross-Midnight Scheduling**: Handle events spanning multiple days
- **Event Status Tracking**: Draft and published states

### **Advanced Lineup Builder**
- **Drag & Drop Interface**: Intuitive artist-to-timeline placement
- **Interactive Slot Details**: Click any slot for precision editing
- **Smart Conflict Detection**: Prevents overlapping bookings and artist double-booking
- **Undo/Redo System**: Complete action history with localStorage persistence
- **Real-Time Auto-Save**: Changes saved instantly with visual confirmation

### **Professional Export Suite**
- **CSV Export**: Spreadsheet-compatible lineup data
- **ICS Calendar Export**: Full event schedules for Google Calendar/Outlook
- **Email Integration**: One-click artist notification with mailto links
- **Slugified Filenames**: Clean, professional file naming (e.g., `primordial-festival-2024-07-15-lineup.ics`)

### **Artist Experience**
- **Personal Gig Dashboard**: View all upcoming performances
- **Accept/Decline Workflow**: Simple booking confirmation with animations
- **Tech Rider Management**: Add technical requirements via modal drawer
- **Individual Calendar Downloads**: Per-slot .ics file generation
- **Status Visualization**: Color-coded booking states with accessibility compliance

### **Public Engagement**
- **Responsive Timeline Views**: Desktop grid and mobile list layouts
- **Embed-Ready Design**: iframe-safe with 100% width scaling
- **Public Calendar Export**: Full lineup download for attendees
- **Accessibility**: WCAG 4.5:1 contrast ratios, keyboard navigation, ARIA labels

---

## 🎨 **Design System**

### **Primordial Dark Theme**
- **Background**: Dark matte `#121212` for professional appearance
- **Accent**: Electric cyan `#00FFCC` for primary actions
- **Typography**: Space Grotesk + Orbitron heading fonts
- **Cards**: Off-white `#F5F5F5` for optimal readability
- **Status Colors**: Semantic green/red/gray for booking states

### **Design Tokens Architecture**
- **Centralized System**: `design-tokens.json` as single source of truth
- **CSS Variables**: Tailwind v4 `@theme` directive integration
- **Semantic Naming**: `bg-primordial-accent-primary` convention
- **Responsive Scaling**: Mobile-first breakpoint system

---

## 💻 **Tech Stack**

- **Frontend**: [Next.js 15](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with design tokens
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/) for touch-friendly interactions
- **State Management**: React Context + useReducer with localStorage persistence
- **Data Layer**: Swappable architecture ready for backend integration

---

## 🏃‍♂️ **Quick Start**

```bash
# Clone the repository
git clone https://github.com/Neihouse/drag-n-drop-lineup.git
cd drag-n-drop-lineup/lineup-poc

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

---

## 🌍 **User Journeys**

### **Promoter Flow**
1. **Create Event** → `/events/create` - Multi-step wizard with validation
2. **Configure Stages** → Set venue areas (Main, Patio, Basement, etc.)
3. **Publish Event** → Enable booking team access
4. **Monitor Progress** → Dashboard with real-time lineup statistics

### **Booker Flow**
1. **Access Lineup Builder** → `/lineup` - Professional timeline interface
2. **Drag Artists** → Intuitive sidebar-to-timeline placement
3. **Fine-Tune Details** → Click slots for precision editing (times, artists)
4. **Export & Share** → CSV/ICS downloads, email notifications

### **Artist Flow**
1. **View Dashboard** → `/artist` - Personal gig management
2. **Review Offers** → Accept/decline with one-click actions
3. **Add Tech Requirements** → Modal drawer for rider notes
4. **Sync Calendar** → Download individual .ics files

### **Public Flow**
1. **Visit Event Page** → `/public/[eventId]` - Read-only timeline
2. **Browse Schedule** → Responsive grid (desktop) / list (mobile)
3. **Add to Calendar** → Full lineup .ics export
4. **Share/Embed** → iframe-compatible for websites

---

## 🎯 **MVP Status**

**✅ Production Ready**
- Zero critical bugs
- Complete user workflows for all personas
- Professional export functionality
- Accessibility compliance
- Mobile-responsive design
- Comprehensive conflict detection

**🚀 Ready for Backend Integration**
- Clean data layer separation
- TypeScript interfaces defined
- localStorage fallback for offline functionality
- Swappable service architecture

---

## 🔮 **Future Enhancements**

- **Backend Integration**: Supabase/PostgreSQL database
- **User Authentication**: Multi-tenant with role-based access
- **Real-Time Collaboration**: Live lineup editing with WebSocket sync
- **Advanced Analytics**: Booking success rates, artist performance metrics
- **Mobile Apps**: React Native companion apps
- **AI Suggestions**: Smart artist recommendations based on genre/time
- **Payment Integration**: Booking deposits and artist payment tracking

---

## 🏗️ **Architecture**

### **State Management**
```typescript
LineupStore (React Context + useReducer)
├── Events: Multi-event support
├── Artists: DJ database with avatars/genres
├── Slots: Timeline assignments with status
├── History: Undo/redo with localStorage
└── Selection: Active slot for editing
```

### **Component Structure**
```
app/
├── page.tsx           # Homepage with persona navigation
├── events/create/     # Event wizard (Promoters)
├── lineup/           # Drag-drop builder (Bookers)
├── artist/           # Gig dashboard (Artists)
├── public/[eventId]/ # Timeline embed (Public)
└── providers/        # Global state management
```

---

## 📄 **License**

MIT License - feel free to use for commercial or personal projects.

---

## 🤝 **Contributing**

This project is ready for CTO handoff and backend integration. The frontend provides a complete, production-ready interface for lineup management with all user workflows implemented.

**Architecture decisions prioritize:**
- Clean separation of concerns
- TypeScript safety
- Accessibility compliance
- Mobile-first responsive design
- Professional UX patterns

Perfect foundation for scaling to a full-stack SaaS platform in the electronic music industry.
