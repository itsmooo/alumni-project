# Alumni Network App MVP - Development Prompt

## 🎯 Project Overview

Create a fully functional MVP (Minimum Viable Product) for an Alumni Network application that connects university graduates. The app should be a modern, responsive web application with mobile-first design that allows alumni to network, attend events, donate to causes, find jobs, and stay connected with their alma mater.

## 🏗️ Technical Stack Requirements

### Frontend
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS or Material-UI
- **State Management**: Redux Toolkit or Zustand
- **HTTP Client**: Axios or React Query
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Yup validation
- **File Upload**: React Dropzone
- **Notifications**: React-Toastify
- **Charts**: Recharts (for admin dashboard)

### Backend (Already Implemented)
- **API Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT tokens
- **File Storage**: Cloudinary
- **Payment**: Hormuud/Zaad mobile money integration

### Development Tools
- **Package Manager**: npm or yarn
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library
- **Version Control**: Git

## 📱 Core Features to Implement

### 1. Authentication System
- **Registration Form**: Email, password, personal details
- **Login Form**: Email/password authentication
- **Password Reset**: Forgot password flow
- **Email Verification**: Verify email after registration
- **JWT Token Management**: Automatic token refresh, secure storage
- **Protected Routes**: Route guards for authenticated users

### 2. User Profile Management
- **Profile View**: Display user information, graduation details, profession
- **Profile Edit**: Update personal information, bio, location
- **Profile Photo Upload**: Drag & drop image upload with preview
- **Privacy Settings**: Control what information is visible to other alumni
- **Account Settings**: Change password, delete account

### 3. Alumni Directory
- **Alumni List**: Paginated list of all alumni with search and filters
- **Search Functionality**: Search by name, profession, company, location
- **Advanced Filters**: Graduation year, location, profession, company
- **Alumni Profile View**: View detailed profiles of other alumni
- **Contact Information**: Display contact details based on privacy settings

### 4. Events Management
- **Events List**: Display upcoming and past events with filtering
- **Event Details**: Full event information, location, description
- **RSVP System**: RSVP with status (Yes/No/Maybe) and optional message
- **My RSVPs**: Personal RSVP history and management
- **Event Categories**: Filter events by category
- **Event Search**: Search events by title, location, or description

### 5. Donation System
- **Donation Campaigns**: Browse active donation campaigns
- **Campaign Details**: View campaign progress, target amount, description
- **Payment Integration**: Mobile money payment (Hormuud/Zaad)
- **Donation History**: Personal donation records
- **Payment Confirmation**: Receipt and confirmation emails

### 6. Job Board
- **Job Listings**: Browse available job opportunities
- **Job Details**: Full job description, requirements, company info
- **Job Application**: Apply to jobs with optional message and resume
- **Job Search**: Filter by type, location, category
- **Application Tracking**: Track job applications

### 7. Notifications System
- **Notification Center**: List all system notifications
- **Real-time Updates**: Mark notifications as read
- **Notification Types**: Event reminders, donation confirmations, job updates
- **Unread Count**: Display unread notification count
- **Bulk Actions**: Mark all notifications as read

### 8. Transaction History
- **Transaction List**: Complete history of all payments and donations
- **Transaction Details**: Detailed view of each transaction
- **Filtering**: Filter by type, status, date range
- **Summary Statistics**: Total amounts, transaction counts
- **Export Functionality**: Download transaction history

### 9. Announcements & News
- **News Feed**: Display announcements and news posts
- **Post Details**: Full article view with rich content
- **Categories**: Filter by news, announcements, updates
- **Search**: Search through announcements

## 🎨 UI/UX Requirements

### Design System
- **Color Scheme**: Professional, university-branded colors
- **Typography**: Clean, readable fonts (Inter or Roboto)
- **Icons**: Consistent icon set (Heroicons or Material Icons)
- **Spacing**: Consistent spacing system
- **Components**: Reusable component library

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive design for tablets
- **Desktop Enhancement**: Enhanced features for desktop
- **Touch Friendly**: Large touch targets for mobile

### User Experience
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Toast notifications for actions
- **Empty States**: Helpful empty state illustrations
- **Onboarding**: Welcome tour for new users

## 📊 Key Pages & Components

### Authentication Pages
```
/auth/register
/auth/login
/auth/forgot-password
/auth/reset-password
/auth/verify-email
```

### Main App Pages
```
/dashboard
/profile
/profile/edit
/profile/photo
/alumni
/alumni/:id
/events
/events/:id
/events/my-rsvps
/donations
/donations/:id
/jobs
/jobs/:id
/notifications
/transactions
/announcements
/announcements/:id
```

### Components Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Toast.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ForgotPasswordForm.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileEditForm.tsx
│   │   └── PhotoUpload.tsx
│   ├── alumni/
│   │   ├── AlumniList.tsx
│   │   ├── AlumniCard.tsx
│   │   ├── AlumniSearch.tsx
│   │   └── AlumniFilters.tsx
│   ├── events/
│   │   ├── EventList.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventDetails.tsx
│   │   └── RSVPForm.tsx
│   ├── donations/
│   │   ├── CampaignList.tsx
│   │   ├── CampaignCard.tsx
│   │   ├── DonationForm.tsx
│   │   └── PaymentModal.tsx
│   ├── jobs/
│   │   ├── JobList.tsx
│   │   ├── JobCard.tsx
│   │   ├── JobDetails.tsx
│   │   └── ApplicationForm.tsx
│   └── notifications/
│       ├── NotificationList.tsx
│       ├── NotificationItem.tsx
│       └── NotificationBadge.tsx
├── pages/
├── hooks/
├── services/
├── store/
├── types/
└── utils/
```

## 🔧 Technical Implementation Details

### API Integration
```typescript
// API service structure
src/services/
├── api.ts              // Base API configuration
├── auth.ts             // Authentication endpoints
├── users.ts            // User profile endpoints
├── alumni.ts           // Alumni directory endpoints
├── events.ts           // Events endpoints
├── donations.ts        // Donations endpoints
├── jobs.ts             // Jobs endpoints
├── notifications.ts    // Notifications endpoints
├── transactions.ts     // Transactions endpoints
└── upload.ts           // File upload endpoints
```

### State Management
```typescript
// Redux store structure
src/store/
├── slices/
│   ├── authSlice.ts
│   ├── userSlice.ts
│   ├── alumniSlice.ts
│   ├── eventsSlice.ts
│   ├── donationsSlice.ts
│   ├── jobsSlice.ts
│   ├── notificationsSlice.ts
│   └── transactionsSlice.ts
├── store.ts
└── hooks.ts
```

### Authentication Flow
1. User registers/logs in
2. JWT token stored in secure storage
3. Token included in all API requests
4. Automatic token refresh before expiration
5. Protected routes check authentication status

### File Upload Implementation
1. Drag & drop interface for profile photos
2. File validation (type, size)
3. Upload progress indicator
4. Image preview before upload
5. Automatic cropping and optimization

### Payment Integration
1. Mobile money payment form
2. Phone number validation
3. Payment confirmation modal
4. Transaction status tracking
5. Receipt generation

## 🧪 Testing Requirements

### Unit Tests
- Component rendering tests
- API service tests
- Utility function tests
- Redux slice tests

### Integration Tests
- Authentication flow
- Form submissions
- API integration
- Navigation flows

### E2E Tests
- User registration and login
- Profile management
- Event RSVP process
- Donation payment flow

## 📱 Mobile Considerations

### Progressive Web App (PWA)
- Service worker for offline functionality
- App manifest for installability
- Push notifications
- Offline data caching

### Mobile Optimizations
- Touch-friendly interfaces
- Swipe gestures
- Pull-to-refresh
- Infinite scrolling
- Mobile-specific navigation

## 🚀 Deployment Requirements

### Environment Configuration
- Development, staging, and production environments
- Environment-specific API endpoints
- Feature flags for gradual rollout

### Performance Optimization
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

### Security Measures
- HTTPS enforcement
- Content Security Policy
- XSS protection
- CSRF protection

## 📋 Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup and configuration
- Authentication system
- Basic routing and navigation
- User profile management

### Phase 2: Core Features (Week 3-4)
- Alumni directory
- Events management
- Basic notifications
- Profile photo upload

### Phase 3: Advanced Features (Week 5-6)
- Donation system
- Job board
- Transaction history
- Advanced search and filters

### Phase 4: Polish & Testing (Week 7-8)
- UI/UX improvements
- Testing implementation
- Performance optimization
- Bug fixes and refinements

## 🎯 Success Criteria

### Functional Requirements
- ✅ All API endpoints integrated and working
- ✅ User authentication and authorization
- ✅ Complete CRUD operations for user profiles
- ✅ Event RSVP system functional
- ✅ Donation payment system working
- ✅ Job application system operational
- ✅ Notification system active
- ✅ Search and filtering working

### Performance Requirements
- ✅ Page load times under 3 seconds
- ✅ Mobile responsiveness across devices
- ✅ Smooth animations and transitions
- ✅ Offline functionality for basic features

### User Experience Requirements
- ✅ Intuitive navigation and user flow
- ✅ Clear error messages and feedback
- ✅ Loading states and progress indicators
- ✅ Accessibility compliance (WCAG 2.1)

## 🔗 API Endpoints Reference

The app should integrate with all the following endpoints:

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `GET /api/auth/me`

### Profile Management
- `GET /api/users/me`
- `PUT /api/users/profile`
- `POST /api/users/me/photo`

### Alumni Directory
- `GET /api/alumni`
- `GET /api/alumni/:id`

### Events
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events/:id/rsvp`
- `GET /api/events/my-rsvps`

### Donations
- `GET /api/donations`
- `GET /api/donations/:id`
- `POST /api/donations/:id/pay`
- `GET /api/donations/my`

### Jobs
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs/:id/apply`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id`
- `PATCH /api/notifications/mark-all-read`

### Transactions
- `GET /api/transactions/my`
- `GET /api/transactions/my/:id`

### Announcements
- `GET /api/announcements`
- `GET /api/announcements/:id`

### File Upload
- `POST /api/upload/single`

## 📞 Support & Documentation

### Required Documentation
- API integration guide
- Component library documentation
- State management patterns
- Testing guidelines
- Deployment procedures

### Development Resources
- Design system documentation
- API endpoint documentation
- Error handling guidelines
- Performance optimization tips

This prompt provides a comprehensive roadmap for building a fully functional MVP alumni network application that leverages all the backend API endpoints and provides a modern, user-friendly experience for alumni to connect, network, and engage with their community. 