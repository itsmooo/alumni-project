import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/user.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;

  AuthProvider() {
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    _setLoading(true);
    try {
      final token = await ApiService.getToken();
      if (token != null) {
        final userData = await ApiService.getUser();
        if (userData != null) {
          _user = User.fromJson(userData);
          _isAuthenticated = true;
        }
      }
    } catch (e) {
      // Token might be invalid, clear auth data
      await ApiService.clearAuthData();
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  Future<bool> login(String identifier, String password) async {
    _setLoading(true);
    try {
      final response = await ApiService.login(identifier, password);
      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
      notifyListeners();
      return true;
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
    required int graduationYear,
    String? degree,
    String? major,
  }) async {
    _setLoading(true);
    try {
      final response = await ApiService.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password,
        graduationYear: graduationYear,
        degree: degree,
        major: major,
      );
      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
      notifyListeners();
      return true;
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    try {
      await ApiService.logout();
      _user = null;
      _isAuthenticated = false;
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshUser() async {
    try {
      final userData = await ApiService.getCurrentUser();
      _user = User.fromJson(userData);
      notifyListeners();
    } catch (e) {
      // If refresh fails, user might be logged out
      await logout();
    }
  }
}
