import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants/api_config.dart';

class TestApiConnection {
  static Future<void> testAnnouncementsEndpoint() async {
    try {
      print('🧪 Testing API Connection...');
      print('Base URL: ${ApiConfig.baseUrl}');

      final url = '${ApiConfig.baseUrl}/announcements';
      print('Full URL: $url');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      print('Response Status: ${response.statusCode}');
      print('Response Headers: ${response.headers}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('✅ Success! Response data:');
        print('Announcements count: ${data['announcements']?.length ?? 0}');
        print('Pagination: ${data['pagination']}');

        if (data['announcements'] != null && data['announcements'].isNotEmpty) {
          print('First announcement: ${data['announcements'][0]['title']}');
          print(
              'First announcement status: ${data['announcements'][0]['status']}');
        }
      } else {
        print('❌ Error: ${response.statusCode}');
        print('Response body: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception: $e');
      if (e.toString().contains('Connection refused')) {
        print('💡 Make sure your backend server is running on localhost:5000');
      }
    }
  }

  static Future<void> testHealthEndpoint() async {
    try {
      final url = '${ApiConfig.baseUrl.replaceAll('/api', '')}/api/health';
      print('Testing health endpoint: $url');

      final response = await http.get(Uri.parse(url));
      print('Health Status: ${response.statusCode}');
      print('Health Response: ${response.body}');
    } catch (e) {
      print('Health check failed: $e');
    }
  }
}
