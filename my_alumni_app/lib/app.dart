// app.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'routes/app_router.dart';
import 'constants/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/announcements_provider.dart';
import 'providers/jobs_provider.dart';
import 'providers/events_provider.dart';
import 'providers/payments_provider.dart';

class AlumniNetworkApp extends StatelessWidget {
  const AlumniNetworkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AnnouncementsProvider()),
        ChangeNotifierProvider(create: (_) => JobsProvider()),
        ChangeNotifierProvider(create: (_) => EventsProvider()),
        ChangeNotifierProvider(create: (_) => PaymentsProvider()),
      ],
      child: MaterialApp(
        title: 'Alumni Network',
        theme: appTheme,
        debugShowCheckedModeBanner: false,
        onGenerateRoute: AppRouter.generateRoute,
        initialRoute: '/',
      ),
    );
  }
}
