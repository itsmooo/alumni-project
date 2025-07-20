import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/payment.dart';
import '../../providers/payments_provider.dart';
import '../../services/api_service.dart';
import 'payment_success_screen.dart';

class HormuudPaymentScreen extends StatefulWidget {
  final String paymentId;
  final double amount;
  final String currency;
  final String purpose;

  const HormuudPaymentScreen({
    Key? key,
    required this.paymentId,
    required this.amount,
    required this.currency,
    required this.purpose,
  }) : super(key: key);

  @override
  State<HormuudPaymentScreen> createState() => _HormuudPaymentScreenState();
}

class _HormuudPaymentScreenState extends State<HormuudPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  bool _isProcessing = false;
  String? _errorMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hormuud Payment'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Payment summary
              _buildPaymentSummary(),

              const SizedBox(height: 16),

              // Hormuud payment form
              _buildHormuudPaymentForm(),

              if (_errorMessage != null) ...[
                const SizedBox(height: 12),
                _buildErrorMessage(),
              ],

              const SizedBox(height: 16),

              // Pay button
              _buildPayButton(),

              const SizedBox(height: 16),

              // Instructions
              _buildInstructions(),

              const SizedBox(height: 16),

              // Test button (for development)
              _buildTestButton(),

              const SizedBox(height: 16),

              // Security info
              _buildSecurityInfo(),

              // Add bottom padding to ensure content doesn't get cut off
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentSummary() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.phone_android,
                    color: Colors.orange,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Hormuud Mobile Money',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Amount:',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(
                  '${widget.currency} ${widget.amount.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Purpose:',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                Text(
                  widget.purpose,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Payment ID:',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                Text(
                  widget.paymentId.substring(0, 8) + '...',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                        fontFamily: 'monospace',
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHormuudPaymentForm() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter Your Phone Number',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Enter the phone number registered with your Hormuud account',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 16),

            // Phone number input
            TextFormField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: 'Phone Number',
                hintText: '252 61 123 4567',
                prefixIcon: const Icon(Icons.phone),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey[50],
              ),
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
              ],
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your phone number';
                }
                if (value.length < 9) {
                  return 'Please enter a valid phone number';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // Hormuud info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: Colors.orange,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Make sure your Hormuud account has sufficient balance to complete this payment.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.orange[800],
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorMessage() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline,
            color: Colors.red,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.red[800],
                  ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPayButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _isProcessing ? null : _processHormuudPayment,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.orange,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _isProcessing
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.payment, color: Colors.white),
                  const SizedBox(width: 8),
                  Text(
                    'Pay ${widget.currency} ${widget.amount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildInstructions() {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How it works:',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            _buildInstructionStep(
              '1',
              'Enter your Hormuud phone number',
              Icons.phone,
            ),
            _buildInstructionStep(
              '2',
              'Tap "Pay" to initiate the payment',
              Icons.payment,
            ),
            _buildInstructionStep(
              '3',
              'You will receive an SMS to confirm the payment',
              Icons.sms,
            ),
            _buildInstructionStep(
              '4',
              'Reply to the SMS to complete the payment',
              Icons.check_circle,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionStep(String number, String text, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Icon(icon, size: 14, color: Colors.grey[600]),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecurityInfo() {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.security,
                  color: Colors.green,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  'Secure Payment',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: Colors.green,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Your payment is processed securely through Hormuud\'s official payment gateway. We never store your payment details.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                    fontSize: 11,
                  ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.verified,
                  color: Colors.orange,
                  size: 14,
                ),
                const SizedBox(width: 4),
                Text(
                  'Powered by Hormuud',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.orange,
                        fontWeight: FontWeight.w500,
                        fontSize: 11,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestButton() {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Development Testing',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 40,
              child: OutlinedButton.icon(
                onPressed: _testHormuudPayment,
                icon: const Icon(Icons.bug_report, size: 16),
                label: const Text('Test Hormuud API Connection',
                    style: TextStyle(fontSize: 12)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.orange,
                  side: const BorderSide(color: Colors.orange),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _testHormuudPayment() async {
    try {
      await ApiService.testHormuudPayment();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Hormuud API test completed. Check console for details.'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Test failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _processHormuudPayment() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      print('=== PROCESSING HORMUUD PAYMENT ===');
      print('Phone: ${_phoneController.text}');
      print('Amount: ${widget.amount}');

      // Process Hormuud payment
      final result = await ApiService.processHormuudPayment(
        phone: _phoneController.text,
        amount: widget.amount,
      );

      print('Hormuud payment result: $result');

      if (!mounted) return;

      // Navigate to success screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentSuccessScreen(
            paymentId: result['paymentId'] ?? widget.paymentId,
            transactionId: result['requestId'] ?? result['transactionId'],
            amount: widget.amount,
            currency: widget.currency,
            paymentMethod: PaymentMethods.hormuud,
            isMobileMoney: true,
          ),
        ),
      );
    } catch (e) {
      print('Hormuud payment error: $e');
      if (!mounted) return;

      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }
}
