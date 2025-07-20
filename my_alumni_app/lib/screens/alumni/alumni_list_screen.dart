// screens/alumni/alumni_list_screen.dart
import 'package:flutter/material.dart';

class AlumniListScreen extends StatefulWidget {
  const AlumniListScreen({super.key});

  @override
  State<AlumniListScreen> createState() => _AlumniListScreenState();
}

class _AlumniListScreenState extends State<AlumniListScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alumni Directory')),
      body: const Center(child: Text('Alumni directory coming soon...')),
    );
  }
}
