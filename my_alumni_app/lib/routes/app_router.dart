// routes/app_router.dart
import 'package:flutter/material.dart';
import '../screens/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/alumni/alumni_list_screen.dart';
import '../screens/events/events_list_screen.dart';
import '../screens/jobs/jobs_list_screen.dart';
import '../screens/announcements/announcements_list_screen.dart';
import '../screens/home_screen.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case '/register':
        return MaterialPageRoute(builder: (_) => const RegisterScreen());
      case '/home':
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfileScreen());
      case '/alumni':
        return MaterialPageRoute(builder: (_) => const AlumniListScreen());
      case '/events':
        return MaterialPageRoute(builder: (_) => const EventsListScreen());
      case '/jobs':
        return MaterialPageRoute(builder: (_) => const JobsListScreen());
      case '/announcements':
        return MaterialPageRoute(
            builder: (_) => const AnnouncementsListScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}
