// constants/api_config.dart
class ApiConfig {
  // API Base URLs for different environments
  static const String localDevelopmentUrl =
      'http://localhost:5000/api'; // Local development
  static const String androidEmulatorUrl =
      'https://alumni-backend-server.vercel.app/api';
  static const String webDevelopmentUrl =
      'https://alumni-backend-server.vercel.app/api';
  static const String iosSimulatorUrl =
      'https://alumni-backend-server.vercel.app/api';
  static const String physicalDeviceUrl =
      'https://alumni-backend-server.vercel.app/api';
  static const String vercelProductionUrl =
      'https://alumni-backend-server.vercel.app/api';

  // Updated with your actual IP

  // Current active base URL
  // Change this based on your development environment:
  // - localDevelopmentUrl: For local development (localhost:5000)
  // - vercelProductionUrl: For production (deployed on Vercel)
  // - physicalDeviceUrl: For local development with physical device
  // - androidEmulatorUrl: For Android emulator
  // - iosSimulatorUrl: For iOS simulator
  // - webDevelopmentUrl: For web development
  static const String baseUrl =
      localDevelopmentUrl; // Using local backend for development

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
  static bool get isLocalDevelopment => baseUrl == localDevelopmentUrl;
  static bool get isAndroidEmulator => baseUrl == androidEmulatorUrl;
  static bool get isWebDevelopment => baseUrl == webDevelopmentUrl;
  static bool get isIosSimulator => baseUrl == iosSimulatorUrl;
  static bool get isPhysicalDevice => baseUrl == physicalDeviceUrl;
  static bool get isVercelProduction => baseUrl == vercelProductionUrl;
}
