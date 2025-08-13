import 'dart:io';
import 'lib/services/api_service.dart';

void main() async {
  print('🧪 Testing Registration API...');

  try {
    final result = await ApiService.register(
      firstName: 'Test',
      lastName: 'User',
      email: 'test${DateTime.now().millisecondsSinceEpoch}@example.com',
      phone: '+252612345678',
      password: 'password123',
      graduationYear: 2024,
      degree: 'Bachelor',
      major: 'Computer Science',
    );

    print('✅ Registration successful!');
    print('Result: $result');
  } catch (e) {
    print('❌ Registration failed: $e');
  }

  exit(0);
}
