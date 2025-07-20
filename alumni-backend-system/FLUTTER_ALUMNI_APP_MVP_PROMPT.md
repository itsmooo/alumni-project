# Flutter Alumni Network App MVP - Development Prompt

## 🎯 Project Overview

Create a fully functional MVP (Minimum Viable Product) for an Alumni Network Flutter application that connects university graduates. The app should be a modern, cross-platform mobile application that allows alumni to network, attend events, donate to causes, find jobs, and stay connected with their alma mater.

## 🏗️ Technical Stack Requirements

### Frontend Framework
- **Framework**: Flutter 3.x with Dart
- **State Management**: Provider pattern
- **HTTP Client**: Dio for API calls
- **Local Storage**: SharedPreferences for token storage
- **File Upload**: Image picker and file handling
- **Navigation**: GoRouter for navigation
- **UI Components**: Material Design 3 or Cupertino
- **Image Handling**: Cached Network Image
- **Notifications**: Flutter Local Notifications
- **Charts**: Fl Chart (for transaction history)

### Development Tools
- **IDE**: Android Studio or VS Code with Flutter extensions
- **Package Manager**: pub
- **Code Quality**: flutter_lints
- **Testing**: flutter_test, mockito
- **Version Control**: Git
- **Build**: Flutter build for Android/iOS

### Backend Integration
- **API Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT tokens
- **File Storage**: Cloudinary
- **Payment**: Hormuud/Zaad mobile money integration

## 📱 Core Features to Implement

### 1. Authentication System
- **Registration Screen**: Email, password, personal details form
- **Login Screen**: Email/password authentication
- **Password Reset**: Forgot password flow with email
- **Email Verification**: Verify email after registration
- **JWT Token Management**: Secure token storage and refresh
- **Route Guards**: Protected routes for authenticated users
- **Biometric Authentication**: Fingerprint/Face ID support

### 2. User Profile Management
- **Profile Screen**: Display user information, graduation details, profession
- **Profile Edit Screen**: Update personal information, bio, location
- **Profile Photo Upload**: Camera/gallery image selection with cropping
- **Privacy Settings**: Control information visibility to other alumni
- **Account Settings**: Change password, delete account, logout

### 3. Alumni Directory
- **Alumni List Screen**: Paginated list with search and filters
- **Search Functionality**: Search by name, profession, company, location
- **Advanced Filters**: Graduation year, location, profession, company
- **Alumni Profile Screen**: View detailed profiles of other alumni
- **Contact Information**: Display based on privacy settings
- **Pull to Refresh**: Refresh alumni list

### 4. Events Management
- **Events List Screen**: Upcoming and past events with filtering
- **Event Details Screen**: Full event information, location, description
- **RSVP System**: RSVP with status (Yes/No/Maybe) and message
- **My RSVPs Screen**: Personal RSVP history and management
- **Event Categories**: Filter events by category
- **Event Search**: Search events by title, location, description
- **Event Reminders**: Local notifications for upcoming events

### 5. Donation System
- **Donation Campaigns Screen**: Browse active campaigns
- **Campaign Details Screen**: Progress, target amount, description
- **Payment Integration**: Mobile money payment (Hormuud/Zaad)
- **Donation History Screen**: Personal donation records
- **Payment Confirmation**: Receipt and confirmation
- **Campaign Progress**: Visual progress indicators

### 6. Job Board
- **Job Listings Screen**: Browse available opportunities
- **Job Details Screen**: Full description, requirements, company info
- **Job Application**: Apply with message and resume upload
- **Job Search**: Filter by type, location, category
- **Application Tracking**: Track job applications
- **Job Alerts**: Notifications for new job postings

### 7. Notifications System
- **Notification Center**: List all system notifications
- **Real-time Updates**: Mark notifications as read
- **Notification Types**: Event reminders, donations, job updates
- **Unread Count Badge**: Display unread count
- **Bulk Actions**: Mark all as read
- **Push Notifications**: Background notifications

### 8. Transaction History
- **Transaction List Screen**: Complete payment and donation history
- **Transaction Details Screen**: Detailed view of each transaction
- **Filtering**: Filter by type, status, date range
- **Summary Statistics**: Total amounts, transaction counts
- **Export Functionality**: Share transaction history
- **Charts**: Visual representation of spending patterns

### 9. Announcements & News
- **News Feed Screen**: Display announcements and news
- **Post Details Screen**: Full article view with rich content
- **Categories**: Filter by news, announcements, updates
- **Search**: Search through announcements
- **Bookmarking**: Save important announcements

## 🎨 UI/UX Requirements

### Design System
- **Theme**: Material Design 3 with custom color scheme
- **Typography**: Google Fonts (Inter or Roboto)
- **Icons**: Material Icons or custom icon set
- **Spacing**: Consistent spacing system (8dp grid)
- **Components**: Reusable widget library

### Responsive Design
- **Mobile Optimized**: Designed for mobile screens
- **Tablet Support**: Responsive layouts for tablets
- **Orientation**: Portrait and landscape support
- **Accessibility**: Screen reader support, large text

### User Experience
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: User-friendly error dialogs
- **Success Feedback**: Toast messages and confirmations
- **Empty States**: Helpful empty state illustrations
- **Onboarding**: Welcome screens for new users
- **Smooth Animations**: Page transitions and micro-interactions

## 📊 App Structure & Architecture

### Project Structure
```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   │   ├── app_constants.dart
│   │   ├── api_constants.dart
│   │   └── theme_constants.dart
│   ├── utils/
│   │   ├── validators.dart
│   │   ├── helpers.dart
│   │   └── extensions.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   ├── storage_service.dart
│   │   ├── notification_service.dart
│   │   └── file_service.dart
│   └── models/
│       ├── user.dart
│       ├── event.dart
│       ├── donation.dart
│       ├── job.dart
│       ├── notification.dart
│       └── transaction.dart
├── providers/
│   ├── auth_provider.dart
│   ├── user_provider.dart
│   ├── alumni_provider.dart
│   ├── events_provider.dart
│   ├── donations_provider.dart
│   ├── jobs_provider.dart
│   ├── notifications_provider.dart
│   └── transactions_provider.dart
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── register_screen.dart
│   │   ├── forgot_password_screen.dart
│   │   └── verify_email_screen.dart
│   ├── profile/
│   │   ├── profile_screen.dart
│   │   ├── edit_profile_screen.dart
│   │   └── settings_screen.dart
│   ├── alumni/
│   │   ├── alumni_list_screen.dart
│   │   ├── alumni_detail_screen.dart
│   │   └── alumni_search_screen.dart
│   ├── events/
│   │   ├── events_list_screen.dart
│   │   ├── event_detail_screen.dart
│   │   └── my_rsvps_screen.dart
│   ├── donations/
│   │   ├── donations_list_screen.dart
│   │   ├── donation_detail_screen.dart
│   │   └── payment_screen.dart
│   ├── jobs/
│   │   ├── jobs_list_screen.dart
│   │   ├── job_detail_screen.dart
│   │   └── application_screen.dart
│   ├── notifications/
│   │   └── notifications_screen.dart
│   ├── transactions/
│   │   └── transactions_screen.dart
│   └── announcements/
│       ├── announcements_list_screen.dart
│       └── announcement_detail_screen.dart
├── widgets/
│   ├── common/
│   │   ├── app_bar_widget.dart
│   │   ├── loading_widget.dart
│   │   ├── error_widget.dart
│   │   ├── empty_state_widget.dart
│   │   └── custom_button.dart
│   ├── auth/
│   │   ├── login_form.dart
│   │   └── register_form.dart
│   ├── profile/
│   │   ├── profile_card.dart
│   │   └── photo_upload_widget.dart
│   ├── alumni/
│   │   ├── alumni_card.dart
│   │   └── search_filter_widget.dart
│   ├── events/
│   │   ├── event_card.dart
│   │   └── rsvp_widget.dart
│   ├── donations/
│   │   ├── campaign_card.dart
│   │   └── payment_form.dart
│   └── jobs/
│       ├── job_card.dart
│       └── application_form.dart
└── routes/
    └── app_router.dart
```

### Provider Architecture
```dart
// Provider structure example
class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;
  
  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  
  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await AuthService.login(email, password);
      _token = response.token;
      _user = response.user;
      await StorageService.saveToken(_token!);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<void> logout() async {
    _user = null;
    _token = null;
    await StorageService.clearToken();
    notifyListeners();
  }
}
```

### API Service Structure
```dart
// API service example
class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:5000/api',
    connectTimeout: Duration(seconds: 30),
    receiveTimeout: Duration(seconds: 30),
  ));
  
  static void setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = StorageService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Handle token refresh or logout
        }
        handler.next(error);
      },
    ));
  }
  
  static Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }
  
  static Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }
}
```

## 🔧 Technical Implementation Details

### State Management with Provider
```dart
// Main app with providers
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => AlumniProvider()),
        ChangeNotifierProvider(create: (_) => EventsProvider()),
        ChangeNotifierProvider(create: (_) => DonationsProvider()),
        ChangeNotifierProvider(create: (_) => JobsProvider()),
        ChangeNotifierProvider(create: (_) => NotificationsProvider()),
        ChangeNotifierProvider(create: (_) => TransactionsProvider()),
      ],
      child: MaterialApp(
        title: 'Alumni Network',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        home: Consumer<AuthProvider>(
          builder: (context, auth, child) {
            return auth.isAuthenticated ? HomeScreen() : LoginScreen();
          },
        ),
      ),
    );
  }
}
```

### Navigation with GoRouter
```dart
// App router configuration
final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomeScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => RegisterScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => ProfileScreen(),
    ),
    GoRoute(
      path: '/alumni',
      builder: (context, state) => AlumniListScreen(),
    ),
    GoRoute(
      path: '/alumni/:id',
      builder: (context, state) => AlumniDetailScreen(
        id: state.pathParameters['id']!,
      ),
    ),
    // Add more routes...
  ],
);
```

### Authentication Flow
1. User opens app → Check for stored token
2. If token exists → Validate with server
3. If valid → Navigate to home screen
4. If invalid → Navigate to login screen
5. After login → Store token and navigate to home
6. Automatic token refresh before expiration

### File Upload Implementation
```dart
// Image upload widget
class PhotoUploadWidget extends StatefulWidget {
  @override
  _PhotoUploadWidgetState createState() => _PhotoUploadWidgetState();
}

class _PhotoUploadWidgetState extends State<PhotoUploadWidget> {
  File? _imageFile;
  bool _isUploading = false;
  
  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 85,
    );
    
    if (image != null) {
      setState(() {
        _imageFile = File(image.path);
      });
    }
  }
  
  Future<void> _uploadImage() async {
    if (_imageFile == null) return;
    
    setState(() {
      _isUploading = true;
    });
    
    try {
      final response = await FileService.uploadProfilePhoto(_imageFile!);
      context.read<UserProvider>().updateProfilePhoto(response.profilePhoto);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Profile photo updated successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to upload photo')),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }
}
```

### Payment Integration
```dart
// Payment form widget
class PaymentForm extends StatefulWidget {
  final String campaignId;
  final double amount;
  
  @override
  _PaymentFormState createState() => _PaymentFormState();
}

class _PaymentFormState extends State<PaymentForm> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  String _selectedPaymentMethod = 'hormuud';
  bool _isProcessing = false;
  
  Future<void> _processPayment() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isProcessing = true;
    });
    
    try {
      final response = await DonationService.makePayment(
        campaignId: widget.campaignId,
        amount: widget.amount,
        paymentMethod: _selectedPaymentMethod,
        phoneNumber: _phoneController.text,
      );
      
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => PaymentSuccessScreen(
            transactionId: response.transactionId,
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment failed: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }
}
```

## 🧪 Testing Requirements

### Unit Tests
- Provider state management tests
- API service tests
- Utility function tests
- Model validation tests

### Widget Tests
- Screen rendering tests
- Form validation tests
- User interaction tests
- Navigation tests

### Integration Tests
- Authentication flow
- API integration
- File upload process
- Payment flow

## 📱 Mobile-Specific Features

### Platform Integration
- **Android**: Material Design, Android-specific features
- **iOS**: Cupertino design, iOS-specific features
- **Cross-platform**: Shared codebase with platform-specific UI

### Mobile Optimizations
- **Offline Support**: Cached data for offline viewing
- **Push Notifications**: Background notifications
- **Biometric Auth**: Fingerprint/Face ID login
- **Deep Linking**: Direct navigation to specific content
- **Share Functionality**: Share alumni profiles, events, jobs

### Performance
- **Image Caching**: Efficient image loading and caching
- **Lazy Loading**: Load data as needed
- **Memory Management**: Proper disposal of resources
- **Smooth Scrolling**: Optimized list performance

## 🚀 Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup and configuration
- Authentication system implementation
- Basic navigation and routing
- User profile management

### Phase 2: Core Features (Week 3-4)
- Alumni directory with search and filters
- Events management with RSVP system
- Basic notifications
- Profile photo upload

### Phase 3: Advanced Features (Week 5-6)
- Donation system with payment integration
- Job board with application system
- Transaction history with charts
- Advanced search and filtering

### Phase 4: Polish & Testing (Week 7-8)
- UI/UX improvements and animations
- Comprehensive testing
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
- ✅ App launch time under 3 seconds
- ✅ Smooth scrolling and animations
- ✅ Efficient memory usage
- ✅ Offline functionality for basic features

### User Experience Requirements
- ✅ Intuitive navigation and user flow
- ✅ Clear error messages and feedback
- ✅ Loading states and progress indicators
- ✅ Accessibility compliance

## 📋 Required Dependencies

### pubspec.yaml
```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.0.5
  dio: ^5.3.2
  shared_preferences: ^2.2.2
  go_router: ^10.1.2
  image_picker: ^1.0.4
  cached_network_image: ^3.3.0
  flutter_local_notifications: ^16.1.0
  fl_chart: ^0.65.0
  intl: ^0.18.1
  url_launcher: ^6.1.14
  permission_handler: ^11.0.1
  biometric_storage: ^4.1.3
  connectivity_plus: ^4.0.2
  flutter_secure_storage: ^9.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  mockito: ^5.4.2
  build_runner: ^2.4.7
```

## 🔗 API Endpoints Integration

The app should integrate with all these endpoints:

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

## 📞 Development Guidelines

### Code Quality
- Follow Flutter best practices and conventions
- Use meaningful variable and function names
- Implement proper error handling
- Write clean, readable, and maintainable code
- Use proper widget composition and separation of concerns

### State Management
- Use Provider for state management
- Keep providers focused and single-purpose
- Implement proper loading and error states
- Use ChangeNotifier for reactive UI updates

### Testing
- Write unit tests for all business logic
- Test provider state changes
- Test API service methods
- Test widget interactions and navigation

### Performance
- Optimize image loading and caching
- Implement proper list virtualization
- Minimize unnecessary rebuilds
- Use const constructors where possible

This prompt provides a comprehensive roadmap for building a fully functional Flutter MVP alumni network application using Provider for state management, with all the necessary technical details, architecture patterns, and implementation guidelines. 