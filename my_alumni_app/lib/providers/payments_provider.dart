import 'package:flutter/foundation.dart';
import 'dart:async';
import '../models/payment.dart';
import '../models/event.dart';
import '../services/api_service.dart';

class PaymentsProvider with ChangeNotifier {
  List<Payment> _payments = [];
  bool _isLoading = false;
  bool _hasError = false;
  String _errorMessage = '';
  PaginationInfo? _pagination;
  bool _hasMoreData = true;

  // Payment processing state
  bool _isProcessingPayment = false;
  String? _currentPaymentId;
  Timer? _statusCheckTimer;

  // Getters
  List<Payment> get payments => _payments;
  bool get isLoading => _isLoading;
  bool get hasError => _hasError;
  String get errorMessage => _errorMessage;
  PaginationInfo? get pagination => _pagination;
  bool get hasMoreData => _hasMoreData;
  bool get isProcessingPayment => _isProcessingPayment;
  String? get currentPaymentId => _currentPaymentId;

  // Load user payments (first page)
  Future<void> loadPayments({bool refresh = false}) async {
    if (_isLoading) return;

    if (refresh) {
      _payments = [];
      _pagination = null;
      _hasMoreData = true;
    }

    _isLoading = true;
    _hasError = false;
    _errorMessage = '';
    notifyListeners();

    try {
      print('=== PAYMENTS PROVIDER DEBUG ===');
      print('Loading user payments...');

      final response = await ApiService.getUserPayments(
        page: 1,
        limit: 20,
      );

      _payments = response.payments;
      _pagination = response.pagination;
      _hasMoreData = response.pagination.page < response.pagination.pages;

      print('Loaded ${_payments.length} payments');
      print('Pagination: ${_pagination?.toJson()}');
      print('Has more data: $_hasMoreData');
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      print('Error loading payments: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load more payments (pagination)
  Future<void> loadMorePayments() async {
    if (_isLoading || !_hasMoreData || _pagination == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      final nextPage = _pagination!.page + 1;

      final response = await ApiService.getUserPayments(
        page: nextPage,
        limit: 20,
      );

      _payments.addAll(response.payments);
      _pagination = response.pagination;
      _hasMoreData = response.pagination.page < response.pagination.pages;

      print('Loaded ${response.payments.length} more payments');
      print('Total payments: ${_payments.length}');
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      print('Error loading more payments: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create payment intent
  Future<PaymentIntentResponse?> createPaymentIntent(
      PaymentRequest request) async {
    try {
      _isProcessingPayment = true;
      notifyListeners();

      print('=== CREATING PAYMENT INTENT ===');
      print('Payment request: ${request.toJson()}');

      final response = await ApiService.createPaymentIntent(request);

      _currentPaymentId = response.paymentId;

      print('Payment intent created successfully');
      print('Payment ID: ${response.paymentId}');
      print('Status: ${response.status}');

      // If it's a mobile money payment, start status checking
      if (request.paymentMethod == PaymentMethods.hormuud ||
          request.paymentMethod == PaymentMethods.zaad) {
        _startStatusChecking(response.paymentId);
      }

      return response;
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      print('Error creating payment intent: $e');
      return null;
    } finally {
      _isProcessingPayment = false;
      notifyListeners();
    }
  }

  // Start status checking for mobile money payments
  void _startStatusChecking(String paymentId) {
    _stopStatusChecking(); // Stop any existing timer

    _statusCheckTimer =
        Timer.periodic(const Duration(seconds: 5), (timer) async {
      try {
        final payment = await ApiService.checkPaymentStatus(paymentId);

        // Update payment in the list
        final index = _payments.indexWhere((p) => p.id == paymentId);
        if (index != -1) {
          _payments[index] = payment;
        } else {
          _payments.insert(0, payment);
        }

        notifyListeners();

        // Stop checking if payment is completed or failed
        if (payment.isCompleted || payment.isFailed || payment.isCancelled) {
          _stopStatusChecking();
          _currentPaymentId = null;
        }
      } catch (e) {
        print('Error checking payment status: $e');
        // Stop checking after 5 minutes (60 checks)
        if (timer.tick >= 60) {
          _stopStatusChecking();
        }
      }
    });
  }

  // Stop status checking
  void _stopStatusChecking() {
    _statusCheckTimer?.cancel();
    _statusCheckTimer = null;
  }

  // Check payment status manually
  Future<Payment?> checkPaymentStatus(String paymentId) async {
    try {
      final payment = await ApiService.checkPaymentStatus(paymentId);

      // Update payment in the list
      final index = _payments.indexWhere((p) => p.id == paymentId);
      if (index != -1) {
        _payments[index] = payment;
        notifyListeners();
      }

      return payment;
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      print('Error checking payment status: $e');
      return null;
    }
  }

  // Download receipt
  Future<String?> downloadReceipt(String paymentId) async {
    try {
      return await ApiService.downloadReceipt(paymentId);
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      print('Error downloading receipt: $e');
      return null;
    }
  }

  // Get payment by ID
  Payment? getPaymentById(String id) {
    try {
      return _payments.firstWhere((payment) => payment.id == id);
    } catch (e) {
      return null;
    }
  }

  // Get filtered payments
  List<Payment> getFilteredPayments({
    String? type,
    String? status,
    String? paymentMethod,
  }) {
    List<Payment> filtered = List.from(_payments);

    if (type != null) {
      filtered = filtered.where((payment) => payment.type == type).toList();
    }

    if (status != null) {
      filtered = filtered.where((payment) => payment.status == status).toList();
    }

    if (paymentMethod != null) {
      filtered = filtered
          .where((payment) => payment.paymentMethod == paymentMethod)
          .toList();
    }

    return filtered;
  }

  // Get payments by type
  List<Payment> getPaymentsByType(String type) {
    return _payments.where((payment) => payment.type == type).toList();
  }

  // Get completed payments
  List<Payment> get completedPayments {
    return _payments.where((payment) => payment.isCompleted).toList();
  }

  // Get pending payments
  List<Payment> get pendingPayments {
    return _payments
        .where((payment) => payment.isPending || payment.isProcessing)
        .toList();
  }

  // Get failed payments
  List<Payment> get failedPayments {
    return _payments.where((payment) => payment.isFailed).toList();
  }

  // Get total amount spent
  double get totalAmountSpent {
    return completedPayments.fold(0.0, (sum, payment) => sum + payment.amount);
  }

  // Get payment statistics
  Map<String, dynamic> get paymentStatistics {
    final completed = completedPayments.length;
    final pending = pendingPayments.length;
    final failed = failedPayments.length;
    final total = _payments.length;

    return {
      'total': total,
      'completed': completed,
      'pending': pending,
      'failed': failed,
      'successRate':
          total > 0 ? (completed / total * 100).toStringAsFixed(1) : '0.0',
      'totalAmount': totalAmountSpent,
    };
  }

  // Clear error state
  void clearError() {
    _hasError = false;
    _errorMessage = '';
    notifyListeners();
  }

  // Refresh payments
  Future<void> refresh() async {
    await loadPayments(refresh: true);
  }

  // Dispose
  @override
  void dispose() {
    _stopStatusChecking();
    super.dispose();
  }
}
