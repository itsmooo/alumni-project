import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/payment.dart';
import '../../providers/payments_provider.dart';
import 'payment_success_screen.dart';

class PaymentMethodScreen extends StatefulWidget {
  final String clientSecret;
  final String paymentId;
  final double amount;
  final String currency;

  const PaymentMethodScreen({
    Key? key,
    required this.clientSecret,
    required this.paymentId,
    required this.amount,
    required this.currency,
  }) : super(key: key);

  @override
  State<PaymentMethodScreen> createState() => _PaymentMethodScreenState();
}

class _PaymentMethodScreenState extends State<PaymentMethodScreen> {
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Card Payment'),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Payment summary
            _buildPaymentSummary(),

            const SizedBox(height: 24),

            // Card payment form (placeholder for Stripe integration)
            _buildCardPaymentForm(),

            const SizedBox(height: 24),

            // Pay button
            _buildPayButton(),

            const SizedBox(height: 24),

            // Security info
            _buildSecurityInfo(),
          ],
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
            Text(
              'Payment Summary',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
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

  Widget _buildCardPaymentForm() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Card Details',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),

            // Card number
            TextField(
              decoration: InputDecoration(
                labelText: 'Card Number',
                hintText: '1234 5678 9012 3456',
                prefixIcon: const Icon(Icons.credit_card),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              keyboardType: TextInputType.number,
            ),

            const SizedBox(height: 16),

            Row(
              children: [
                // Expiry date
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      labelText: 'MM/YY',
                      hintText: '12/25',
                      prefixIcon: const Icon(Icons.calendar_today),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),

                const SizedBox(width: 16),

                // CVV
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      labelText: 'CVV',
                      hintText: '123',
                      prefixIcon: const Icon(Icons.security),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    keyboardType: TextInputType.number,
                    obscureText: true,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Cardholder name
            TextField(
              decoration: InputDecoration(
                labelText: 'Cardholder Name',
                hintText: 'John Doe',
                prefixIcon: const Icon(Icons.person),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPayButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _isProcessing ? null : _processCardPayment,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
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
            : Text(
                'Pay ${widget.currency} ${widget.amount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  Widget _buildSecurityInfo() {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.security,
                  color: Colors.green,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Secure Payment',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: Colors.green,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.verified,
                  color: Colors.blue,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Text(
                  'Powered by Stripe',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.blue,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _processCardPayment() async {
    setState(() {
      _isProcessing = true;
    });

    try {
      // Simulate payment processing
      await Future.delayed(const Duration(seconds: 2));

      // In a real implementation, you would integrate with Stripe here
      // For now, we'll simulate a successful payment

      if (!mounted) return;

      // Navigate to success screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentSuccessScreen(
            paymentId: widget.paymentId,
            transactionId: null,
            amount: widget.amount,
            currency: widget.currency,
            paymentMethod: PaymentMethods.card,
            isMobileMoney: false,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;

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
