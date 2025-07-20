import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/payment.dart';
import '../../providers/payments_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/string_extensions.dart';
import 'payment_method_screen.dart';
import 'payment_success_screen.dart';
import 'hormuud_payment_screen.dart';

class PaymentScreen extends StatefulWidget {
  final String type;
  final String purpose;
  final double amount;
  final String currency;
  final String? relatedEntityId;
  final String? relatedEntityType;

  const PaymentScreen({
    Key? key,
    required this.type,
    required this.purpose,
    required this.amount,
    this.currency = 'USD',
    this.relatedEntityId,
    this.relatedEntityType,
  }) : super(key: key);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedPaymentMethod = PaymentMethods.card;
  final TextEditingController _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Payment summary card
            _buildPaymentSummary(),

            const SizedBox(height: 24),

            // Payment method selection
            _buildPaymentMethodSelection(),

            const SizedBox(height: 24),

            // Phone number input for mobile money
            if (_selectedPaymentMethod == PaymentMethods.hormuud ||
                _selectedPaymentMethod == PaymentMethods.zaad)
              _buildPhoneNumberInput(),

            const SizedBox(height: 32),

            // Pay button
            _buildPayButton(),

            const SizedBox(height: 24),

            // Payment information
            _buildPaymentInfo(),
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
            Row(
              children: [
                Icon(
                  _getPaymentTypeIcon(widget.type),
                  color: Theme.of(context).primaryColor,
                  size: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _getPaymentTypeTitle(widget.type),
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
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
                ),
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Amount to Pay:',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
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
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSelection() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Payment Method',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),

            // Card payment option
            _buildPaymentMethodOption(
              icon: Icons.credit_card,
              title: 'Credit/Debit Card',
              subtitle: 'Pay with Visa, Mastercard, or other cards',
              value: PaymentMethods.card,
              isSelected: _selectedPaymentMethod == PaymentMethods.card,
            ),

            const SizedBox(height: 12),

            // Hormuud option
            _buildPaymentMethodOption(
              icon: Icons.phone_android,
              title: 'Hormuud Money',
              subtitle: 'Pay with your Hormuud mobile money account',
              value: PaymentMethods.hormuud,
              isSelected: _selectedPaymentMethod == PaymentMethods.hormuud,
            ),

            const SizedBox(height: 12),

            // Zaad option
            _buildPaymentMethodOption(
              icon: Icons.phone_android,
              title: 'Zaad Money',
              subtitle: 'Pay with your Zaad mobile money account',
              value: PaymentMethods.zaad,
              isSelected: _selectedPaymentMethod == PaymentMethods.zaad,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required String value,
    required bool isSelected,
  }) {
    return InkWell(
      onTap: () {
        setState(() {
          _selectedPaymentMethod = value;
        });
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color:
                isSelected ? Theme.of(context).primaryColor : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? Theme.of(context).primaryColor.withOpacity(0.05)
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? Theme.of(context).primaryColor
                  : Colors.grey[600],
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isSelected
                              ? Theme.of(context).primaryColor
                              : Colors.black87,
                        ),
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: Theme.of(context).primaryColor,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhoneNumberInput() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Phone Number',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Enter your ${_selectedPaymentMethod.capitalize()} phone number',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                hintText: 'Enter phone number',
                prefixIcon: const Icon(Icons.phone),
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
        onPressed: _isLoading ? null : _processPayment,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _isLoading
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

  Widget _buildPaymentInfo() {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Payment Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            _buildInfoRow('Payment Type', _getPaymentTypeTitle(widget.type)),
            _buildInfoRow('Purpose', widget.purpose),
            _buildInfoRow('Amount',
                '${widget.currency} ${widget.amount.toStringAsFixed(2)}'),
            _buildInfoRow('Payment Method',
                _getPaymentMethodTitle(_selectedPaymentMethod)),
            if (_selectedPaymentMethod == PaymentMethods.hormuud ||
                _selectedPaymentMethod == PaymentMethods.zaad)
              _buildInfoRow('Processing Time', '5-10 minutes'),
            if (_selectedPaymentMethod == PaymentMethods.card)
              _buildInfoRow('Processing Time', 'Instant'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
        ],
      ),
    );
  }

  Future<void> _processPayment() async {
    // Validate phone number for mobile money
    if ((_selectedPaymentMethod == PaymentMethods.hormuud ||
            _selectedPaymentMethod == PaymentMethods.zaad) &&
        _phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your phone number'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final paymentsProvider = context.read<PaymentsProvider>();

      final request = PaymentRequest(
        amount: widget.amount,
        currency: widget.currency,
        type: widget.type,
        purpose: widget.purpose,
        paymentMethod: _selectedPaymentMethod,
        phoneNumber: _phoneController.text.trim().isNotEmpty
            ? _phoneController.text.trim()
            : null,
        relatedEntityId: widget.relatedEntityId,
        relatedEntityType: widget.relatedEntityType,
      );

      final response = await paymentsProvider.createPaymentIntent(request);

      if (!mounted) return;

      if (response != null) {
        if (_selectedPaymentMethod == PaymentMethods.card) {
          // Navigate to card payment screen
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PaymentMethodScreen(
                clientSecret: response.clientSecret!,
                paymentId: response.paymentId,
                amount: widget.amount,
                currency: widget.currency,
              ),
            ),
          );
        } else if (_selectedPaymentMethod == PaymentMethods.hormuud) {
          // Navigate to Hormuud payment screen
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => HormuudPaymentScreen(
                paymentId: response.paymentId,
                amount: widget.amount,
                currency: widget.currency,
                purpose: widget.purpose,
              ),
            ),
          );
        } else {
          // Show mobile money payment status for other methods
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => PaymentSuccessScreen(
                paymentId: response.paymentId,
                transactionId: response.transactionId,
                amount: widget.amount,
                currency: widget.currency,
                paymentMethod: _selectedPaymentMethod,
                isMobileMoney: true,
              ),
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(paymentsProvider.errorMessage),
            backgroundColor: Colors.red,
          ),
        );
      }
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
          _isLoading = false;
        });
      }
    }
  }

  IconData _getPaymentTypeIcon(String type) {
    switch (type) {
      case PaymentTypes.membership:
        return Icons.card_membership;
      case PaymentTypes.donation:
        return Icons.favorite;
      case PaymentTypes.eventTicket:
        return Icons.event;
      case PaymentTypes.merchandise:
        return Icons.shopping_bag;
      default:
        return Icons.payment;
    }
  }

  String _getPaymentTypeTitle(String type) {
    switch (type) {
      case PaymentTypes.membership:
        return 'Membership Payment';
      case PaymentTypes.donation:
        return 'Donation';
      case PaymentTypes.eventTicket:
        return 'Event Ticket';
      case PaymentTypes.merchandise:
        return 'Merchandise Purchase';
      default:
        return 'Payment';
    }
  }

  String _getPaymentMethodTitle(String method) {
    switch (method) {
      case PaymentMethods.card:
        return 'Credit/Debit Card';
      case PaymentMethods.hormuud:
        return 'Hormuud Money';
      case PaymentMethods.zaad:
        return 'Zaad Money';
      case PaymentMethods.paypal:
        return 'PayPal';
      case PaymentMethods.bankTransfer:
        return 'Bank Transfer';
      default:
        return method.capitalize();
    }
  }
}
