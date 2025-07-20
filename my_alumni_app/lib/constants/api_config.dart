// constants/api_config.dart
class ApiConfig {
  // API Base URLs for different environments
  static const String androidEmulatorUrl = 'http://10.0.2.2:5000/api';
  static const String webDevelopmentUrl = 'http://127.0.0.1:5000/api';
  static const String iosSimulatorUrl = 'http://localhost:5000/api';
  static const String physicalDeviceUrl =
      'http://192.168.1.100:5000/api'; // Replace with your IP

  // Current active base URL
  // Change this based on your development environment
  static const String baseUrl = webDevelopmentUrl;

  // API Endpoints
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  static const String authMe = '/auth/me';

  static const String announcements = '/announcements';
  static const String announcementsSummary = '/announcements/summary';

  static const String events = '/events';
  static const String jobs = '/jobs';
  static const String payments = '/payments';

  // Helper method to get full URL
  static String getUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }

  // Environment detection
  static bool get isAndroidEmulator => baseUrl == androidEmulatorUrl;
  static bool get isWebDevelopment => baseUrl == webDevelopmentUrl;
  static bool get isIosSimulator => baseUrl == iosSimulatorUrl;
  static bool get isPhysicalDevice => baseUrl == physicalDeviceUrl;
}
