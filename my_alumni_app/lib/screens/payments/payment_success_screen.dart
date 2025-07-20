import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/payment.dart';
import '../../providers/payments_provider.dart';
import '../../utils/string_extensions.dart';

class PaymentSuccessScreen extends StatefulWidget {
  final String paymentId;
  final String? transactionId;
  final double amount;
  final String currency;
  final String paymentMethod;
  final bool isMobileMoney;

  const PaymentSuccessScreen({
    Key? key,
    required this.paymentId,
    this.transactionId,
    required this.amount,
    required this.currency,
    required this.paymentMethod,
    required this.isMobileMoney,
  }) : super(key: key);

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen> {
  bool _isLoading = false;
  Payment? _payment;

  @override
  void initState() {
    super.initState();
    _loadPaymentDetails();
  }

  Future<void> _loadPaymentDetails() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final paymentsProvider = context.read<PaymentsProvider>();
      _payment = await paymentsProvider.checkPaymentStatus(widget.paymentId);
    } catch (e) {
      print('Error loading payment details: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Status'),
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Success icon and message
            _buildSuccessHeader(),

            const SizedBox(height: 24),

            // Payment details
            _buildPaymentDetails(),

            const SizedBox(height: 24),

            // Action buttons
            _buildActionButtons(),

            const SizedBox(height: 24),

            // Status information
            if (widget.isMobileMoney) _buildMobileMoneyInfo(),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessHeader() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 48,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Payment Initiated!',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.isMobileMoney
                  ? 'Your mobile money payment is being processed'
                  : 'Your card payment has been processed successfully',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentDetails() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Payment Details',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _buildDetailRow(
                'Payment ID', widget.paymentId.substring(0, 8) + '...'),
            _buildDetailRow('Amount',
                '${widget.currency} ${widget.amount.toStringAsFixed(2)}'),
            _buildDetailRow(
                'Payment Method', _getPaymentMethodTitle(widget.paymentMethod)),
            if (widget.transactionId != null)
              _buildDetailRow('Transaction ID', widget.transactionId!),
            _buildDetailRow('Date',
                DateFormat('MMM dd, yyyy HH:mm').format(DateTime.now())),
            if (_payment != null) ...[
              const SizedBox(height: 12),
              _buildDetailRow('Status', _payment!.statusDisplay),
              if (_payment!.receipt.receiptNumber.isNotEmpty)
                _buildDetailRow(
                    'Receipt Number', _payment!.receipt.receiptNumber),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
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
          Flexible(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        // Download receipt button
        if (_payment?.isCompleted == true)
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _downloadReceipt,
              icon: const Icon(Icons.download),
              label: const Text('Download Receipt'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),

        if (_payment?.isCompleted == true) const SizedBox(height: 12),

        // Check status button (for mobile money)
        if (widget.isMobileMoney)
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: _checkStatus,
              icon: const Icon(Icons.refresh),
              label: const Text('Check Status'),
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),

        if (widget.isMobileMoney) const SizedBox(height: 12),

        // Done button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: _goHome,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.grey[800],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Done',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMobileMoneyInfo() {
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
                  Icons.info_outline,
                  color: Colors.blue,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Mobile Money Payment',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: Colors.blue,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Your payment is being processed. You will receive a confirmation SMS once the payment is completed. This usually takes 5-10 minutes.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.schedule,
                  color: Colors.orange,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Text(
                  'Processing time: 5-10 minutes',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.orange,
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

  Future<void> _downloadReceipt() async {
    if (_payment == null) return;

    try {
      final paymentsProvider = context.read<PaymentsProvider>();
      final receiptHtml = await paymentsProvider.downloadReceipt(_payment!.id);

      if (!mounted) return;

      if (receiptHtml != null) {
        // In a real app, you would open the receipt in a web view or convert to PDF
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Receipt downloaded successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to download receipt'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error downloading receipt: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _checkStatus() async {
    try {
      final paymentsProvider = context.read<PaymentsProvider>();
      final payment =
          await paymentsProvider.checkPaymentStatus(widget.paymentId);

      if (!mounted) return;

      if (payment != null) {
        setState(() {
          _payment = payment;
        });

        if (payment.isCompleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment completed successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        } else if (payment.isFailed) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  'Payment failed: ${payment.failureReason ?? 'Unknown error'}'),
              backgroundColor: Colors.red,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment is still being processed'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error checking status: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _goHome() {
    Navigator.of(context).popUntil((route) => route.isFirst);
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
