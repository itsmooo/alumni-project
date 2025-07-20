import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiTest {
  static const String baseUrl =
      'http://10.0.2.2:5000/api'; // For Android emulator

  static Future<bool> testConnection() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('API Connection Test: SUCCESS');
        print('Server Status: ${data['status']}');
        print('Uptime: ${data['uptime']} seconds');
        return true;
      } else {
        print('API Connection Test: FAILED - Status ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('API Connection Test: ERROR - $e');
      return false;
    }
  }

  static Future<void> testAuthEndpoints() async {
    print('\n=== Testing Auth Endpoints ===');

    // Test registration endpoint (without actually registering)
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': 'Test',
          'lastName': 'User',
          'email': 'test@example.com',
          'phone': '+1234567890',
          'password': 'password123',
          'graduationYear': 2020,
        }),
      );

      print('Register endpoint: ${response.statusCode}');
      if (response.statusCode != 201) {
        final data = jsonDecode(response.body);
        print('Register response: ${data['message']}');
      }
    } catch (e) {
      print('Register endpoint error: $e');
    }

    // Test login endpoint (without actually logging in)
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'identifier': 'test@example.com',
          'password': 'password123',
        }),
      );

      print('Login endpoint: ${response.statusCode}');
      if (response.statusCode != 200) {
        final data = jsonDecode(response.body);
        print('Login response: ${data['message']}');
      }
    } catch (e) {
      print('Login endpoint error: $e');
    }
  }

  static Future<void> testAnnouncementsEndpoints() async {
    print('=== TESTING ANNOUNCEMENTS API ===');

    try {
      // Test 1: Basic announcements endpoint
      print('\n1. Testing GET /api/announcements...');
      final response = await http.get(
        Uri.parse('$baseUrl/announcements'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final announcements = data['announcements'] as List;
        print('Found ${announcements.length} announcements');

        if (announcements.isNotEmpty) {
          print('First announcement: ${announcements[0]['title']}');
        }
      }

      // Test 2: Test with different parameters
      print('\n2. Testing with page=1&limit=10...');
      final response2 = await http.get(
        Uri.parse('$baseUrl/announcements?page=1&limit=10'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response2.statusCode}');
      print('Response Body: ${response2.body}');

      // Test 3: Test connection to backend
      print('\n3. Testing basic backend connection...');
      final healthResponse = await http.get(
        Uri.parse('http://10.0.2.2:5000/'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Backend Health Status: ${healthResponse.statusCode}');
      print('Backend Response: ${healthResponse.body}');
    } catch (e) {
      print('Error testing announcements API: $e');
    }
  }

  static Future<void> testAnnouncementsConnection() async {
    print('=== TESTING ANNOUNCEMENTS CONNECTION ===');

    try {
      print('Testing connection to: $baseUrl/announcements');

      final response = await http.get(
        Uri.parse('$baseUrl/announcements'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      print('Connection successful!');
      print('Status Code: ${response.statusCode}');

      final data = jsonDecode(response.body);
      final announcements = data['announcements'] as List;
      final pagination = data['pagination'];

      print('Announcements found: ${announcements.length}');
      print('Pagination: $pagination');

      if (announcements.isNotEmpty) {
        print('Sample announcement:');
        print('- Title: ${announcements[0]['title']}');
        print('- Category: ${announcements[0]['category']}');
        print('- Status: ${announcements[0]['status']}');
        print('- Publish Date: ${announcements[0]['publishDate']}');
      } else {
        print('No announcements found. This could be because:');
        print('1. No announcements exist in the database');
        print('2. All announcements are not published (status != "published")');
        print('3. Announcements are expired or not yet published');
        print('4. Filter conditions are not met');
      }
    } catch (e) {
      print('Connection failed: $e');
      print('This could be because:');
      print('1. Backend server is not running');
      print('2. Wrong IP address (should be 10.0.2.2 for Android emulator)');
      print('3. Wrong port (should be 5000)');
      print('4. Network connectivity issues');
    }
  }

  static Future<void> testJobsConnection() async {
    print('=== TESTING JOBS CONNECTION ===');

    try {
      print('Testing connection to: $baseUrl/jobs');

      final response = await http.get(
        Uri.parse('$baseUrl/jobs'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      print('Connection successful!');
      print('Status Code: ${response.statusCode}');

      final data = jsonDecode(response.body);
      final jobs = data['jobs'] as List;
      final pagination = data['pagination'];

      print('Jobs found: ${jobs.length}');
      print('Pagination: $pagination');

      if (jobs.isNotEmpty) {
        print('Sample job:');
        print('- Title: ${jobs[0]['title']}');
        print('- Company: ${jobs[0]['company']['name']}');
        print('- Status: ${jobs[0]['status']}');
        print('- Type: ${jobs[0]['type']}');
      } else {
        print('No jobs found. This could be because:');
        print('1. No jobs exist in the database');
        print('2. All jobs are not active (status != "active")');
        print('3. Jobs are expired or not yet published');
        print('4. Filter conditions are not met');
      }
    } catch (e) {
      print('Connection failed: $e');
      print('This could be because:');
      print('1. Backend server is not running');
      print('2. Wrong IP address (should be 10.0.2.2 for Android emulator)');
      print('3. Wrong port (should be 5000)');
      print('4. Network connectivity issues');
    }
  }

  static Future<void> testJobsEndpoints() async {
    print('=== TESTING JOBS API ===');

    try {
      // Test 1: Basic jobs endpoint
      print('\n1. Testing GET /api/jobs...');
      final response = await http.get(
        Uri.parse('$baseUrl/jobs'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final jobs = data['jobs'] as List;
        print('Found ${jobs.length} jobs');

        if (jobs.isNotEmpty) {
          print('First job: ${jobs[0]['title']}');
        }
      }

      // Test 2: Test with different parameters
      print('\n2. Testing with page=1&limit=10...');
      final response2 = await http.get(
        Uri.parse('$baseUrl/jobs?page=1&limit=10'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response2.statusCode}');
      print('Response Body: ${response2.body}');

      // Test 3: Test with filters
      print('\n3. Testing with category filter...');
      final response3 = await http.get(
        Uri.parse('$baseUrl/jobs?category=technology'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response3.statusCode}');
      print('Response Body: ${response3.body}');
    } catch (e) {
      print('Error testing jobs API: $e');
    }
  }

  static Future<void> testEventsConnection() async {
    print('=== TESTING EVENTS CONNECTION ===');

    try {
      print('Testing connection to: $baseUrl/events');

      final response = await http.get(
        Uri.parse('$baseUrl/events'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      print('Connection successful!');
      print('Status Code: ${response.statusCode}');

      final data = jsonDecode(response.body);
      final events = data['events'] as List;
      final pagination = data['pagination'];

      print('Events found: ${events.length}');
      print('Pagination: $pagination');

      if (events.isNotEmpty) {
        print('Sample event:');
        print('- Title: ${events[0]['title']}');
        print('- Type: ${events[0]['type']}');
        print('- Status: ${events[0]['status']}');
        print('- Start Date: ${events[0]['date']['start']}');
        print('- Is Public: ${events[0]['isPublic']}');
      } else {
        print('No events found. This could be because:');
        print('1. No events exist in the database');
        print('2. All events are not published (status != "published")');
        print('3. Events are not public (isPublic != true)');
        print('4. Events are expired or not yet published');
        print('5. Filter conditions are not met');
      }
    } catch (e) {
      print('Connection failed: $e');
      print('This could be because:');
      print('1. Backend server is not running');
      print('2. Wrong IP address (should be 10.0.2.2 for Android emulator)');
      print('3. Wrong port (should be 5000)');
      print('4. Network connectivity issues');
    }
  }

  static Future<void> testEventsWithAuth() async {
    print('=== TESTING EVENTS WITH AUTHENTICATION ===');

    try {
      // First, try to login to get a token
      print('1. Attempting to login...');
      final loginResponse = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'identifier': 'admin@example.com',
          'password': 'password123',
        }),
      );

      print('Login status: ${loginResponse.statusCode}');

      if (loginResponse.statusCode == 200) {
        final loginData = jsonDecode(loginResponse.body);
        final token = loginData['token'];
        print('Login successful!');

        // Now test events with authentication
        print('\n2. Testing events with authentication...');
        final eventsResponse = await http.get(
          Uri.parse('$baseUrl/events'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );

        print('Events with auth status: ${eventsResponse.statusCode}');
        print('Events response: ${eventsResponse.body}');

        if (eventsResponse.statusCode == 200) {
          final data = jsonDecode(eventsResponse.body);
          final events = data['events'] as List;
          print('Events found with auth: ${events.length}');
        }
      } else {
        print('Login failed: ${loginResponse.body}');
      }
    } catch (e) {
      print('Test failed: $e');
    }
  }

  static Future<void> testEventsWithoutAuth() async {
    print('=== TESTING EVENTS WITHOUT AUTHENTICATION ===');

    try {
      print('Testing events endpoint without authentication...');
      final response = await http.get(
        Uri.parse('$baseUrl/events'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final events = data['events'] as List;
        print('Events found without auth: ${events.length}');

        if (events.isNotEmpty) {
          print('First event details:');
          print('- Title: ${events[0]['title']}');
          print('- Status: ${events[0]['status']}');
          print('- Is Public: ${events[0]['isPublic']}');
          print('- Type: ${events[0]['type']}');
        }
      }
    } catch (e) {
      print('Test failed: $e');
    }
  }

  static Future<void> testEventsEndpoints() async {
    print('=== TESTING EVENTS API ===');

    try {
      // Test 1: Basic events endpoint
      print('\n1. Testing GET /api/events...');
      final response = await http.get(
        Uri.parse('$baseUrl/events'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final events = data['events'] as List;
        print('Found ${events.length} events');

        if (events.isNotEmpty) {
          print('First event: ${events[0]['title']}');
        }
      }

      // Test 2: Test with different parameters
      print('\n2. Testing with page=1&limit=10...');
      final response2 = await http.get(
        Uri.parse('$baseUrl/events?page=1&limit=10'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response2.statusCode}');
      print('Response Body: ${response2.body}');

      // Test 3: Test with filters
      print('\n3. Testing with type filter...');
      final response3 = await http.get(
        Uri.parse('$baseUrl/events?type=webinar'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response3.statusCode}');
      print('Response Body: ${response3.body}');

      // Test 4: Test upcoming events
      print('\n4. Testing upcoming events...');
      final response4 = await http.get(
        Uri.parse('$baseUrl/events?upcoming=true'),
        headers: {'Content-Type': 'application/json'},
      );

      print('Status Code: ${response4.statusCode}');
      print('Response Body: ${response4.body}');
    } catch (e) {
      print('Error testing events API: $e');
    }
  }

  static Future<void> testAllEndpoints() async {
    print('=== API Connection Test ===');
    final isConnected = await testConnection();

    if (isConnected) {
      await testAuthEndpoints();
      await testAnnouncementsEndpoints();
      await testEventsEndpoints();
    } else {
      print('Cannot test endpoints - API connection failed');
    }
  }

  static Future<void> testHormuudPayment() async {
    print('=== TESTING HORMUUD PAYMENT ===');

    try {
      print('Testing Hormuud payment endpoint: $baseUrl/payments/hormuud');

      // First, we need to get a token by logging in
      print('\n1. Getting authentication token...');
      final loginResponse = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'identifier': 'admin@example.com', // Use a test account
          'password': 'password123',
        }),
      );

      if (loginResponse.statusCode != 200) {
        print('Login failed: ${loginResponse.body}');
        return;
      }

      final loginData = jsonDecode(loginResponse.body);
      final token = loginData['token'];

      print('Authentication successful!');

      // Test Hormuud payment
      print('\n2. Testing Hormuud payment...');
      final paymentResponse = await http.post(
        Uri.parse('$baseUrl/payments/hormuud'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'phone': '252611234567',
          'amount': 10.0,
        }),
      );

      print('Payment Status Code: ${paymentResponse.statusCode}');
      print('Payment Response: ${paymentResponse.body}');

      if (paymentResponse.statusCode == 200) {
        final paymentData = jsonDecode(paymentResponse.body);
        print('✅ Hormuud payment test successful!');
        print('Payment ID: ${paymentData['paymentId']}');
        print('Request ID: ${paymentData['requestId']}');
        print('Message: ${paymentData['message']}');
      } else {
        print('❌ Hormuud payment test failed');
        final errorData = jsonDecode(paymentResponse.body);
        print('Error: ${errorData['error']}');
        print('Details: ${errorData['details']}');
      }
    } catch (e) {
      print('❌ Hormuud payment test error: $e');
      print('This could be because:');
      print('1. Backend server is not running');
      print('2. Hormuud API credentials are not configured');
      print('3. Network connectivity issues');
      print('4. Authentication failed');
    }
  }
}
