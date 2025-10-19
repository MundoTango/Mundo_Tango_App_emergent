# Profiles Feature Guide
**Owner:** Layer #21 (User Management)  
**Created:** October 19, 2025  
**Purpose:** Complete guide to Mundo Tango user profiles system

---

## 🎯 Overview

User profiles are the foundation of the Mundo Tango platform, showcasing tango dancers' experience, preferences, and connections. Features include:

- Tango-specific profile fields
- Privacy controls
- Profile verification
- Multiple tango roles (leader/follower/instructor)
- Experience levels
- Location and travel history

---

## 📊 Database Schema

```typescript
// shared/schema.ts
export const users = pgTable('users', {
  // Basic Info
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  
  // Personal Info
  name: varchar('name', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  nickname: varchar('nickname', { length: 100 }),
  bio: text('bio'),
  
  // Location
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  state: varchar('state', { length: 100 }),
  countryCode: varchar('country_code', { length: 2 }),
  stateCode: varchar('state_code', { length: 10 }),
  
  // Tango-Specific Fields
  tangoRoles: text('tango_roles').array(), // ['leader', 'follower', 'instructor']
  leaderLevel: integer('leader_level'), // 1-10 scale
  followerLevel: integer('follower_level'), // 1-10 scale
  yearsOfDancing: integer('years_of_dancing'),
  startedDancingYear: integer('started_dancing_year'),
  languages: text('languages').array(),
  
  // Media
  profileImage: varchar('profile_image', { length: 500 }),
  backgroundImage: varchar('background_image', { length: 500 }),
  
  // Social
  facebookUrl: varchar('facebook_url', { length: 255 }),
  
  // Status
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  suspended: boolean('suspended').default(false),
  
  // Onboarding
  isOnboardingComplete: boolean('is_onboarding_complete').default(false),
  formStatus: integer('form_status').default(0),
  codeOfConductAccepted: boolean('code_of_conduct_accepted').default(false),
  termsAccepted: boolean('terms_accepted').default(false),
  
  // Subscription
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  subscriptionStatus: varchar('subscription_status', { length: 50 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

---

## 🎨 Profile Fields

### Tango Roles

Users can select multiple roles:
- **Leader:** Leads in tango dancing
- **Follower:** Follows in tango dancing
- **Instructor:** Teaches tango
- **Performer:** Performs tango professionally
- **DJ:** DJs tango events
- **Organizer:** Organizes tango events

### Experience Levels

**Leader Level / Follower Level** (1-10 scale):
- 1-3: Beginner
- 4-6: Intermediate
- 7-8: Advanced
- 9-10: Professional

### Years of Dancing

- Total years dancing tango
- Started dancing year (optional)

---

## 🔌 API Endpoints

### Get User Profile
```typescript
GET /api/users/:id

Response: 200 OK
{
  "id": 1,
  "username": "elena_tango",
  "name": "Elena Rodriguez",
  "bio": "Professional tango instructor from Buenos Aires",
  "city": "Buenos Aires",
  "country": "Argentina",
  "tangoRoles": ["instructor", "performer"],
  "leaderLevel": 9,
  "followerLevel": 8,
  "yearsOfDancing": 20,
  "profileImage": "https://...",
  "isVerified": true,
  "followerCount": 350,
  "followingCount": 125
}
```

### Update Profile
```typescript
PATCH /api/users/me
Content-Type: application/json

{
  "bio": "Updated bio",
  "city": "New York",
  "tangoRoles": ["leader", "follower"],
  "leaderLevel": 7
}

Response: 200 OK
```

### Upload Profile Image
```typescript
POST /api/users/me/profile-image
Content-Type: multipart/form-data

file: <image file>

Response: 200 OK
{
  "profileImage": "https://cloudinary.com/..."
}
```

### Update Privacy Settings
```typescript
PATCH /api/users/me/privacy
Content-Type: application/json

{
  "showEmail": false,
  "showLocation": true,
  "profileVisibility": "public" // public, friends-only, private
}

Response: 200 OK
```

---

## 🎨 Frontend Components

### Profile Header

```typescript
// client/src/components/profile/ProfileHeader.tsx
export function ProfileHeader({ user }) {
  return (
    <div className="profile-header">
      <img 
        src={user.backgroundImage || '/default-bg.jpg'} 
        className="cover-image"
      />
      
      <div className="profile-info">
        <Avatar>
          <AvatarImage src={user.profileImage} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        
        <div>
          <h1>{user.name}</h1>
          <p>@{user.username}</p>
          {user.isVerified && <VerifiedBadge />}
        </div>
        
        <div className="location">
          <MapPin size={16} />
          <span>{user.city}, {user.country}</span>
        </div>
      </div>
    </div>
  );
}
```

### Tango Experience Card

```typescript
// client/src/components/profile/TangoExperience.tsx
export function TangoExperience({ user }) {
  return (
    <Card>
      <h3>Tango Experience</h3>
      
      <div className="roles">
        {user.tangoRoles?.map(role => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>
      
      <div className="levels">
        <div>
          <label>Leader Level</label>
          <Progress value={user.leaderLevel * 10} />
          <span>{user.leaderLevel}/10</span>
        </div>
        
        <div>
          <label>Follower Level</label>
          <Progress value={user.followerLevel * 10} />
          <span>{user.followerLevel}/10</span>
        </div>
      </div>
      
      <div>
        <Calendar size={16} />
        <span>{user.yearsOfDancing} years of dancing</span>
      </div>
    </Card>
  );
}
```

### Edit Profile Form

```typescript
// client/src/pages/EditProfile.tsx
export default function EditProfile() {
  const { user } = useUser();
  
  const form = useForm({
    defaultValues: {
      name: user.name,
      bio: user.bio,
      city: user.city,
      tangoRoles: user.tangoRoles || [],
      leaderLevel: user.leaderLevel,
      followerLevel: user.followerLevel
    }
  });
  
  const updateProfile = useMutation({
    mutationFn: (data) => apiRequest('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({ title: 'Profile updated!' });
    }
  });
  
  return (
    <Form {...form}>
      <FormField name="name" label="Name" />
      <FormField name="bio" label="Bio" type="textarea" />
      <FormField name="city" label="City" />
      
      <MultiSelect 
        name="tangoRoles" 
        label="Tango Roles"
        options={['leader', 'follower', 'instructor', 'performer', 'dj', 'organizer']}
      />
      
      <Slider 
        name="leaderLevel" 
        label="Leader Level" 
        min={1} 
        max={10} 
      />
      
      <Slider 
        name="followerLevel" 
        label="Follower Level" 
        min={1} 
        max={10} 
      />
      
      <Button onClick={form.handleSubmit(updateProfile.mutate)}>
        Save Changes
      </Button>
    </Form>
  );
}
```

---

## 🔒 Privacy Controls

### Profile Visibility

- **Public:** Visible to everyone
- **Friends Only:** Visible to connections
- **Private:** Only visible to user

### Field-Level Privacy

Users can control visibility of:
- Email address
- Location (city/country)
- Phone number
- Social media links
- Dancing experience

```typescript
// Privacy settings schema
{
  "profileVisibility": "public",
  "showEmail": false,
  "showLocation": true,
  "showPhone": false,
  "showExperience": true,
  "showEvents": true
}
```

---

## ✅ Profile Verification

### Verification Process

1. User requests verification
2. Submits proof (instructor certification, performance videos, etc.)
3. Admin reviews submission
4. Verification badge granted

### Verification Badge

```typescript
{user.isVerified && (
  <Badge variant="verified">
    <CheckCircle size={14} />
    Verified
  </Badge>
)}
```

---

## 🎯 Profile Completion

### Onboarding Checklist

```typescript
const profileCompletionSteps = [
  { id: 1, label: 'Add profile photo', field: 'profileImage' },
  { id: 2, label: 'Write bio', field: 'bio' },
  { id: 3, label: 'Set location', field: 'city' },
  { id: 4, label: 'Select tango roles', field: 'tangoRoles' },
  { id: 5, label: 'Set experience levels', field: 'leaderLevel' },
  { id: 6, label: 'Accept Code of Conduct', field: 'codeOfConductAccepted' }
];

const completionPercentage = (completedSteps / totalSteps) * 100;
```

### Profile Strength Indicator

```typescript
<Progress value={completionPercentage} />
<span>{completionPercentage}% Complete</span>
```

---

## 📊 Profile Analytics (Private)

Users can see their own:
- Profile views
- Post engagement
- Event attendance
- Connection growth

---

## 🚀 Future Enhancements

- [ ] Multiple profile photos (gallery)
- [ ] Video profile introduction
- [ ] Achievement badges
- [ ] Tango style preferences
- [ ] Music preferences
- [ ] Dance partnership preferences
- [ ] Travel calendar
- [ ] Teaching credentials
- [ ] Performance portfolio

---

## 📚 Related Documentation

- Layer #21 (User Management) - Agent documentation
- `API_REFERENCE.md` - Complete API specs
- `AUTHENTICATION_GUIDE.md` - Login/registration

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #21 (User Management)
