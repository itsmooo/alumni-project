import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/api_service.dart';

class TestAnnouncementsCreator {
  static const String baseUrl = 'http://127.0.0.1:5000/api';

  static Future<void> createTestAnnouncements() async {
    print('Creating test announcements...');

    try {
      // First, try to create an admin user if it doesn't exist
      await _createAdminUserIfNeeded();

      // Then login as admin
      final loginResponse = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'identifier': 'admin@example.com',
          'password': 'admin123',
        }),
      );

      if (loginResponse.statusCode != 200) {
        print('Failed to login as admin.');
        print('Response: ${loginResponse.body}');
        return;
      }

      final loginData = jsonDecode(loginResponse.body);
      final token = loginData['token'];

      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

      // Test announcements data
      final testAnnouncements = [
        {
          'title': 'Welcome to Alumni Network!',
          'content':
              'We are excited to welcome all alumni to our new digital platform. Connect with fellow graduates, stay updated with university news, and explore exciting opportunities.',
          'category': 'general',
          'priority': 'high',
          'status': 'published',
          'isPinned': true,
        },
        {
          'title': 'Job Opportunity: Software Engineer at TechCorp',
          'content':
              'TechCorp is hiring software engineers! This is a great opportunity for recent graduates and experienced professionals. Apply now through our alumni portal.',
          'category': 'jobs',
          'priority': 'medium',
          'status': 'published',
          'isPinned': false,
        },
        {
          'title': 'Annual Alumni Reunion 2024',
          'content':
              'Join us for our annual alumni reunion on December 15th, 2024. Network with fellow graduates, meet current students, and celebrate our university community.',
          'category': 'events',
          'priority': 'high',
          'status': 'published',
          'isPinned': true,
        },
        {
          'title': 'Scholarship Applications Open',
          'content':
              'Applications for the Alumni Excellence Scholarship are now open. This scholarship supports outstanding students with financial need. Deadline: March 31st, 2024.',
          'category': 'scholarships',
          'priority': 'urgent',
          'status': 'published',
          'isPinned': false,
        },
        {
          'title': 'Alumni Achievement: Dr. Sarah Johnson',
          'content':
              'Congratulations to Dr. Sarah Johnson (Class of 2010) for receiving the prestigious National Science Award for her groundbreaking research in renewable energy.',
          'category': 'achievements',
          'priority': 'medium',
          'status': 'published',
          'isPinned': false,
        },
      ];

      int createdCount = 0;
      for (final announcement in testAnnouncements) {
        try {
          final response = await http.post(
            Uri.parse('$baseUrl/announcements/admin'),
            headers: headers,
            body: jsonEncode(announcement),
          );

          if (response.statusCode == 201) {
            createdCount++;
            print('Created announcement: ${announcement['title']}');
          } else {
            print('Failed to create announcement: ${announcement['title']}');
            print('Response: ${response.body}');
          }
        } catch (e) {
          print('Error creating announcement: ${announcement['title']} - $e');
        }
      }

      print('Successfully created $createdCount test announcements!');
    } catch (e) {
      print('Error creating test announcements: $e');
    }
  }

  static Future<void> _createAdminUserIfNeeded() async {
    print('Creating admin user if needed...');

    try {
      final registerResponse = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': 'Admin',
          'lastName': 'User',
          'email': 'admin@example.com',
          'phone': '1234567890',
          'password': 'admin123',
          'graduationYear': 2020,
        }),
      );

      if (registerResponse.statusCode == 201) {
        print('Admin user created successfully');
        print(
            'Note: User created as alumni by default. You may need to manually update the role to admin in the database.');
      } else if (registerResponse.statusCode == 400) {
        final data = jsonDecode(registerResponse.body);
        if (data['message']?.toString().contains('already exists') == true) {
          print('Admin user already exists');
        } else {
          print('Failed to create admin user: ${data['message']}');
        }
      } else {
        print(
            'Unexpected response creating admin user: ${registerResponse.statusCode}');
        print('Response: ${registerResponse.body}');
      }
    } catch (e) {
      print('Error creating admin user: $e');
    }
  }

  static Future<void> checkExistingAnnouncements() async {
    print('Checking existing announcements...');

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/announcements'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final announcements = data['announcements'] as List;

        print('Found ${announcements.length} existing announcements:');
        for (int i = 0; i < announcements.length; i++) {
          final announcement = announcements[i];
          print(
              '${i + 1}. ${announcement['title']} (${announcement['category']})');
        }
      } else {
        print('Failed to fetch announcements: ${response.statusCode}');
        print('Response: ${response.body}');
      }
    } catch (e) {
      print('Error checking announcements: $e');
    }
  }
}
