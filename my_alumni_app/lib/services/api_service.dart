import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_config.dart';
import '../models/announcement.dart';
import '../models/job.dart';
import '../models/event.dart';
import '../models/payment.dart';
import '../models/user.dart'; // Added import for User model

class ApiService {
  // Use the centralized API configuration
  static String get baseUrl => ApiConfig.baseUrl;

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user));
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    if (userString != null) {
      return jsonDecode(userString);
    }
    return null;
  }

  static Future<void> clearAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  // Login endpoint
  static Future<Map<String, dynamic>> login(
      String identifier, String password) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.getUrl(ApiConfig.authLogin)),
        headers: await _getHeaders(),
        body: jsonEncode({
          'identifier': identifier,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Save token and user data
        await saveToken(data['token']);
        await saveUser(data['user']);
        return data;
      } else {
        throw Exception(data['message'] ?? 'Login failed');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Register endpoint
  static Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
    required int graduationYear,
    String? degree,
    String? major,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.getUrl(ApiConfig.authRegister)),
        headers: await _getHeaders(),
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phone': phone,
          'password': password,
          'graduationYear': graduationYear,
          if (degree != null) 'degree': degree,
          if (major != null) 'major': major,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // Save token and user data
        await saveToken(data['token']);
        await saveUser(data['user']);
        return data;
      } else {
        throw Exception(data['message'] ?? 'Registration failed');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get current user profile
  static Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.getUrl(ApiConfig.authMe)),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Update stored user data
        await saveUser(data);
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to get user profile');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Logout
  static Future<void> logout() async {
    await clearAuthData();
  }

  // =============================================================================
  // ANNOUNCEMENTS API
  // =============================================================================

  // Get all announcements
  static Future<AnnouncementsResponse> getAnnouncements({
    int page = 1,
    int limit = 20,
    String? category,
    String? priority,
    String? search,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (category != null) queryParams['category'] = category;
      if (priority != null) queryParams['priority'] = priority;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final uri = Uri.parse(ApiConfig.getUrl(ApiConfig.announcements))
          .replace(queryParameters: queryParams);

      final headers = await _getHeaders();

      final response = await http
          .get(
        uri,
        headers: headers,
      )
          .timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Request timeout - check if backend is running');
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Successfully parsed response');

        return AnnouncementsResponse.fromJson(data);
      } else if (response.statusCode == 404) {
        throw Exception('Announcements endpoint not found - check API routes');
      } else if (response.statusCode == 401) {
        throw Exception('Authentication required - please login');
      } else if (response.statusCode == 403) {
        throw Exception('Access forbidden - insufficient permissions');
      } else {
        final data = jsonDecode(response.body);
        print('API error: ${data['message']}');
        throw Exception(data['message'] ??
            'Failed to fetch announcements (Status: ${response.statusCode})');
      }
    } catch (e) {
      print('API service error: $e');
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get announcement by ID
  static Future<Announcement> getAnnouncement(String id) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.getUrl(ApiConfig.announcements)}/$id'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Announcement.fromJson(data);
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch announcement');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Like/unlike announcement
  static Future<Map<String, dynamic>> toggleAnnouncementLike(String id) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.getUrl(ApiConfig.announcements)}/$id/like'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to toggle like');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Add comment to announcement
  static Future<Map<String, dynamic>> addAnnouncementComment(
      String id, String content) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.getUrl(ApiConfig.announcements)}/$id/comments'),
        headers: await _getHeaders(),
        body: jsonEncode({'content': content}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to add comment');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get announcements summary (for alumni)
  static Future<Map<String, dynamic>> getAnnouncementsSummary() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.getUrl(ApiConfig.announcementsSummary)),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch summary');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Test backend connectivity
  static Future<bool> testBackendConnection() async {
    try {
      print('=== TESTING BACKEND CONNECTION ===');
      print('Base URL: $baseUrl');

      final response = await http
          .get(
        Uri.parse(ApiConfig.getUrl(ApiConfig.announcements)),
        headers: await _getHeaders(),
      )
          .timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('Connection test status: ${response.statusCode}');
      return response.statusCode == 200 || response.statusCode == 401;
    } catch (e) {
      print('Connection test failed: $e');
      return false;
    }
  }

  // =============================================================================
  // JOBS API
  // =============================================================================

  // Get all jobs
  static Future<JobsResponse> getJobs({
    int page = 1,
    int limit = 20,
    String? type,
    String? category,
    String? experienceLevel,
    String? location,
    bool? remote,
    String? search,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (type != null) queryParams['type'] = type;
      if (category != null) queryParams['category'] = category;
      if (experienceLevel != null)
        queryParams['experienceLevel'] = experienceLevel;
      if (location != null) queryParams['location'] = location;
      if (remote != null) queryParams['remote'] = remote.toString();
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final uri =
          Uri.parse('$baseUrl/jobs').replace(queryParameters: queryParams);

      print('=== JOBS API DEBUG ===');
      print('Requesting URL: $uri');
      print('Query parameters: $queryParams');

      final headers = await _getHeaders();
      print('Headers: $headers');

      final response = await http.get(
        uri,
        headers: headers,
      );

      print('Response status code: ${response.statusCode}');
      print('Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        print('Successfully parsed jobs response');
        return JobsResponse.fromJson(data);
      } else {
        print('Jobs API error: ${data['message']}');
        throw Exception(data['message'] ?? 'Failed to fetch jobs');
      }
    } catch (e) {
      print('Jobs API service error: $e');
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get job by ID
  static Future<Job> getJob(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/$id'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Job.fromJson(data);
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch job');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get jobs summary (for alumni)
  static Future<Map<String, dynamic>> getJobsSummary() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/summary'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch jobs summary');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // =============================================================================
  // EVENTS API
  // =============================================================================

  // Get all events
  static Future<EventsResponse> getEvents({
    int page = 1,
    int limit = 20,
    String? type,
    String? status,
    bool? upcoming,
    String? search,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (type != null) queryParams['type'] = type;
      if (status != null) queryParams['status'] = status;
      if (upcoming != null) queryParams['upcoming'] = upcoming.toString();
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final uri =
          Uri.parse('$baseUrl/events').replace(queryParameters: queryParams);

      print('=== EVENTS API DEBUG ===');
      print('Requesting URL: $uri');
      print('Query parameters: $queryParams');

      final headers = await _getHeaders();
      print('Headers: $headers');

      final response = await http.get(
        uri,
        headers: headers,
      );

      print('Response status code: ${response.statusCode}');
      print('Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        print('Successfully parsed events response');
        return EventsResponse.fromJson(data);
      } else {
        print('Events API error: ${data['message']}');
        throw Exception(data['message'] ?? 'Failed to fetch events');
      }
    } catch (e) {
      print('Events API service error: $e');
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get event by ID
  static Future<Event> getEvent(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/events/$id'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Event.fromJson(data);
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch event');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Register for an event
  static Future<Map<String, dynamic>> registerForEvent(String eventId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/events/$eventId/register'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to register for event');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Cancel event registration
  static Future<Map<String, dynamic>> cancelEventRegistration(
      String eventId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/events/$eventId/register'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to cancel registration');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get events summary (for alumni)
  static Future<Map<String, dynamic>> getEventsSummary() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/events/summary'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch events summary');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Register authenticated alumni as attendee for an event
  static Future<void> registerEventAttendee(String eventId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/events/$eventId/attendees'),
        headers: await _getHeaders(),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return;
      } else {
        throw Exception(data['message'] ?? 'Failed to register for event');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // =============================================================================
  // PAYMENTS API
  // =============================================================================

  // Create payment intent
  static Future<PaymentIntentResponse> createPaymentIntent(
      PaymentRequest request) async {
    try {
      print('=== PAYMENT API DEBUG ===');
      print('Creating payment intent: ${request.toJson()}');

      final response = await http.post(
        Uri.parse('$baseUrl/payments/create-intent'),
        headers: await _getHeaders(),
        body: jsonEncode(request.toJson()),
      );

      print('Response status code: ${response.statusCode}');
      print('Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        print('Successfully created payment intent');
        return PaymentIntentResponse.fromJson(data);
      } else {
        print('Payment intent creation error: ${data['message']}');
        throw Exception(data['message'] ?? 'Failed to create payment intent');
      }
    } catch (e) {
      print('Payment API service error: $e');
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get user payments
  static Future<PaymentsResponse> getUserPayments({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      final uri = Uri.parse('$baseUrl/payments/my-payments')
          .replace(queryParameters: queryParams);

      print('=== GET USER PAYMENTS DEBUG ===');
      print('Requesting URL: $uri');

      final response = await http.get(
        uri,
        headers: await _getHeaders(),
      );

      print('Response status code: ${response.statusCode}');
      print('Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        print('Successfully fetched user payments');
        return PaymentsResponse.fromJson(data);
      } else {
        print('Get user payments error: ${data['message']}');
        throw Exception(data['message'] ?? 'Failed to fetch payments');
      }
    } catch (e) {
      print('Get user payments service error: $e');
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Get payment by ID
  static Future<Payment> getPayment(String paymentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/$paymentId'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Payment.fromJson(data);
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch payment');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Download payment receipt
  static Future<String> downloadReceipt(String paymentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/$paymentId/receipt'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        return response.body;
      } else {
        final data = jsonDecode(response.body);
        throw Exception(data['message'] ?? 'Failed to download receipt');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Check payment status
  static Future<Payment> checkPaymentStatus(String paymentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/$paymentId'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Payment.fromJson(data);
      } else {
        throw Exception(data['message'] ?? 'Failed to check payment status');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Hormuud mobile money payment
  static Future<Map<String, dynamic>> processHormuudPayment({
    required String phone,
    required double amount,
  }) async {
    try {
      print('=== HORMUUD PAYMENT API DEBUG ===');
      print('Processing Hormuud payment: phone=$phone, amount=$amount');

      final response = await http.post(
        Uri.parse('$baseUrl/payments/hormuud'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'phone': phone,
          'amount': amount,
        }),
      );

      print('Response status code: ${response.statusCode}');
      print('Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        print('Successfully processed Hormuud payment');
        return data;
      } else {
        print('Hormuud payment error: ${data['error']}');
        throw Exception(data['error'] ??
            data['message'] ??
            'Failed to process Hormuud payment');
      }
    } catch (e) {
      print('Hormuud payment API service error: $e');
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // =============================================================================
  // TESTING METHODS
  // =============================================================================

  // Test Hormuud payment
  static Future<void> testHormuudPayment() async {
    try {
      print('=== TESTING HORMUUD PAYMENT ===');

      // Test with a sample phone number and amount
      const testPhone = '252611234567';
      const testAmount = 10.0;

      print('Testing Hormuud payment with:');
      print('Phone: $testPhone');
      print('Amount: \$$testAmount');

      final result = await processHormuudPayment(
        phone: testPhone,
        amount: testAmount,
      );

      print('✅ Hormuud payment test successful!');
      print('Result: $result');
    } catch (e) {
      print('❌ Hormuud payment test failed: $e');
    }
  }

  // Update user profile (partial update)
  static Future<User> updateUserProfile(
      Map<String, dynamic> fieldsToUpdate) async {
    // If profilePicture is present, also set 'photo' for backend compatibility
    if (fieldsToUpdate.containsKey('profilePicture')) {
      fieldsToUpdate['photo'] = fieldsToUpdate['profilePicture'];
    }
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/users/profile'),
        headers: await _getHeaders(),
        body: jsonEncode(fieldsToUpdate),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return User.fromJson(data);
      } else {
        throw Exception(data['message'] ?? 'Failed to update profile');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Check if user has applied for a job
  static Future<bool> hasAppliedForJob(String jobId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/$jobId/application-status'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return data['hasApplied'] ?? false;
      } else if (response.statusCode == 404) {
        // User hasn't applied yet
        return false;
      } else {
        throw Exception(
            data['message'] ?? 'Failed to check application status');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Network error: $e');
    }
  }

  // Test connection to the API
  static Future<bool> testConnection() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: await _getHeaders(),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
