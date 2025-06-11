# 🔐 **Authentication & Role Management**

## **Overview**

The platform uses Clerk for user authentication and Supabase for data access control. User roles are dynamically determined based on event participation and artist profile linking.

---

## **Clerk → Supabase Integration**

### **JWT Token Flow**
```typescript
// 1. User authenticates via Clerk
const { getToken } = useAuth();

// 2. Get Supabase-compatible JWT
const supabaseToken = await getToken({ template: 'supabase' });

// 3. Initialize Supabase client with token
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: { 
      headers: { Authorization: `Bearer ${supabaseToken}` } 
    }
  }
);
```

### **Required Clerk JWT Template**
```json
{
  "aud": "authenticated",
  "exp": {{ user.primary_email_address.verification.expire_at | date: "%s" }},
  "iat": {{ date.now | date: "%s" }},
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{ user.id }}",
  "email": "{{ user.primary_email_address.email_address }}",
  "phone": "{{ user.primary_phone_number.phone_number }}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "full_name": "{{ user.first_name }} {{ user.last_name }}",
    "avatar_url": "{{ user.image_url }}"
  }
}
```

---

## **User Role Determination**

### **Dynamic Role Resolution**
```typescript
interface UserRoleContext {
  userId: string;
  eventId?: string;
  globalRole?: 'admin' | 'user';
  eventRole?: 'promoter' | 'booker';
  artistProfiles?: string[];  // Array of artist IDs user can manage
}

// Role resolution function (frontend utility)
async function getUserRole(userId: string, eventId?: string): Promise<UserRoleContext> {
  // 1. Check event-specific roles
  const eventRole = eventId ? await getEventRole(userId, eventId) : null;
  
  // 2. Check artist profile links
  const artistProfiles = await getLinkedArtistProfiles(userId);
  
  // 3. Check global admin status (future)
  const globalRole = await getGlobalRole(userId);
  
  return {
    userId,
    eventId,
    globalRole,
    eventRole,
    artistProfiles
  };
}
```

### **Role Hierarchy**
```
Admin (Global)
  ├── Can access all events and artists
  └── Super-user permissions
  
Promoter (Event-Specific)
  ├── Create and manage events
  ├── Assign bookers
  ├── Lock/unlock lineups
  └── Final approval authority
  
Booker (Event-Specific)
  ├── Build lineups for assigned events
  ├── Manage artist slots
  ├── Lock/unlock lineups
  └── Cannot delete events
  
Artist (Profile-Linked)
  ├── Manage linked artist profiles
  ├── Accept/decline slot invitations
  ├── Update tech rider information
  └── View own performance schedules

Public (Unauthenticated)
  ├── View published event timetables
  ├── Add events to calendar
  └── Access ticket purchasing links
```

---

## **Authentication Flows**

### **1. Sign Up / Sign In**
```typescript
// Clerk handles authentication UI
import { SignIn, SignUp } from '@clerk/nextjs';

// Redirect after auth
const afterSignIn = '/dashboard';
const afterSignUp = '/onboarding';

// Custom onboarding flow
async function handleUserOnboarding(user: User) {
  // 1. Create user record in Supabase (via webhook)
  // 2. Check for artist profile claiming
  // 3. Redirect to appropriate dashboard
}
```

### **2. Artist Profile Claiming**
```typescript
// Flow: Artist receives event invitation via email
// → Clicks signup link with artist_id parameter
// → Creates account and auto-links to artist profile

const searchParams = useSearchParams();
const artistId = searchParams.get('artist_id');

if (artistId && user) {
  await linkArtistProfile(user.id, artistId);
}
```

### **3. Event Team Invitations**
```typescript
// Promoter invites booker via email
async function inviteEventTeamMember(
  eventId: string, 
  email: string, 
  role: 'promoter' | 'booker'
) {
  // 1. Check if user exists in Clerk
  const existingUser = await clerk.users.getUserList({ emailAddress: [email] });
  
  if (existingUser.length > 0) {
    // 2a. Add role directly
    await addEventRole(eventId, existingUser[0].id, role);
  } else {
    // 2b. Send invitation email with signup link
    await sendTeamInvitation(email, { eventId, role });
  }
}
```

---

## **Email Templates & Magic Links**

### **Artist Slot Invitation**
```html
<!-- Template: artist-slot-invitation.html -->
<h2>You're invited to perform at {{ eventTitle }}</h2>

<div class="slot-details">
  <p><strong>Date:</strong> {{ eventDate }}</p>
  <p><strong>Stage:</strong> {{ stage }}</p>
  <p><strong>Time:</strong> {{ startTime }} - {{ endTime }}</p>
  <p><strong>Venue:</strong> {{ venueName }}</p>
</div>

<div class="actions">
  <a href="{{ acceptUrl }}" class="btn-accept">Accept Slot</a>
  <a href="{{ declineUrl }}" class="btn-decline">Decline</a>
  <a href="{{ dashboardUrl }}" class="btn-secondary">View Dashboard</a>
</div>

<!-- Magic link includes: ?slot_id={{ slotId }}&action=accept -->
```

### **Team Member Invitation**
```html
<!-- Template: team-invitation.html -->
<h2>You're invited to help organize {{ eventTitle }}</h2>

<p>{{ inviterName }} has invited you to join the {{ role }} team for this event.</p>

<div class="event-details">
  <p><strong>Event:</strong> {{ eventTitle }}</p>
  <p><strong>Date:</strong> {{ eventDate }}</p>
  <p><strong>Your Role:</strong> {{ role | capitalize }}</p>
</div>

<a href="{{ signupUrl }}" class="btn-primary">Join Event Team</a>

<!-- Signup URL includes: ?event_id={{ eventId }}&role={{ role }} -->
```

### **Lineup Lock Notification**
```html
<!-- Template: lineup-locked.html -->
<h2>{{ eventTitle }} lineup has been finalized</h2>

<p>The event lineup is now locked and ready for promotion.</p>

<div class="next-steps">
  <h3>Artists:</h3>
  <ul>
    <li>Download your performance calendar</li>
    <li>Submit final tech rider requirements</li>
    <li>Prepare for show day</li>
  </ul>
  
  <h3>Team:</h3>
  <ul>
    <li>Begin marketing campaigns</li>
    <li>Coordinate with venue technical team</li>
    <li>Prepare day-of-show schedules</li>
  </ul>
</div>

<a href="{{ publicTimetableUrl }}" class="btn-primary">View Public Timetable</a>
```

---

## **Security Middleware**

### **Route Protection**
```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/public/(.*)',           // Public timetables
    '/api/events/(.*)/public' // Public API endpoints
  ],
  
  // Protect admin routes
  beforeAuth: (req) => {
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Check admin role via API
    }
  },
  
  // Redirect after auth
  afterAuth: (auth, req) => {
    if (!auth.userId && !isPublicRoute(req.nextUrl.pathname)) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});
```

### **API Route Protection**
```typescript
// Example: /api/events/[eventId]/slots/route.ts
import { auth } from '@clerk/nextjs';

export async function POST(request: Request, { params }: { params: { eventId: string } }) {
  const { userId } = auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Check user has event role
  const hasEventAccess = await checkEventRole(userId, params.eventId, ['promoter', 'booker']);
  
  if (!hasEventAccess) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Process request...
}
```

---

## **Role-Based UI Components**

### **Permission Wrapper**
```typescript
interface PermissionWrapperProps {
  eventId?: string;
  requiredRole?: 'promoter' | 'booker' | 'artist';
  requiredArtistId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

function PermissionWrapper({ 
  eventId, 
  requiredRole, 
  requiredArtistId, 
  fallback, 
  children 
}: PermissionWrapperProps) {
  const { user } = useUser();
  const { userRole } = useUserRole(user?.id, eventId);
  
  const hasPermission = useMemo(() => {
    if (requiredRole && userRole?.eventRole !== requiredRole) return false;
    if (requiredArtistId && !userRole?.artistProfiles?.includes(requiredArtistId)) return false;
    return true;
  }, [userRole, requiredRole, requiredArtistId]);
  
  if (!hasPermission) {
    return fallback || null;
  }
  
  return <>{children}</>;
}

// Usage
<PermissionWrapper eventId={eventId} requiredRole="promoter">
  <button onClick={lockLineup}>Lock Lineup</button>
</PermissionWrapper>
```

---

## **Environment Variables**

### **Clerk Configuration**
```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### **Supabase Integration**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Email Service**
```bash
# For notifications (Resend, SendGrid, etc.)
EMAIL_SERVICE_API_KEY=...
EMAIL_FROM_ADDRESS=notifications@primordialgroove.com
EMAIL_REPLY_TO=support@primordialgroove.com
```

---

## **Webhooks & User Sync**

### **Clerk Webhook Handler**
```typescript
// /api/webhooks/clerk/route.ts
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const event = await request.json() as WebhookEvent;
  
  switch (event.type) {
    case 'user.created':
      await createUserInSupabase(event.data);
      break;
      
    case 'user.updated':
      await updateUserInSupabase(event.data);
      break;
      
    case 'user.deleted':
      await deleteUserFromSupabase(event.data.id);
      break;
  }
  
  return new Response('OK', { status: 200 });
}

async function createUserInSupabase(userData: any) {
  // Insert into auth.users via Supabase admin client
  // Handle artist profile linking if signup included artist_id
}
```

This authentication system provides secure, role-based access control while maintaining a smooth user experience across all personas. 