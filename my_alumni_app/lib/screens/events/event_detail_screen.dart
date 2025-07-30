import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/event.dart';
import '../../providers/events_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/string_extensions.dart';
import '../../constants/app_colors.dart';
import '../payments/payment_screen.dart';
import '../../services/api_service.dart'; // Added import for ApiService

class EventDetailScreen extends StatefulWidget {
  final Event event;

  const EventDetailScreen({
    Key? key,
    required this.event,
  }) : super(key: key);

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  bool _isRegistering = false;

  // Helper to check if the current user is already registered for this event
  bool _isCurrentUserRegistered() {
    final user = context.read<AuthProvider>().user;
    if (user == null) return false;
    return widget.event.attendees.any((attendee) =>
        attendee.userId == user.id && attendee.status == 'registered');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Event Details',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: IconButton(
              icon: const Icon(Icons.bug_report_outlined),
              onPressed: () {
                _debugRegistrationStatus();
              },
            ),
          ),
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: IconButton(
              icon: const Icon(Icons.share_outlined),
              onPressed: () {
                // TODO: Implement share functionality
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.white, size: 20),
                        SizedBox(width: 12),
                        Text('Share functionality coming soon'),
                      ],
                    ),
                    backgroundColor: AppColors.primary,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Event header
            _buildEventHeader(),

            const SizedBox(height: 24),

            // Event details
            _buildEventDetails(),

            const SizedBox(height: 24),

            // Registration section
            _buildRegistrationSection(),

            const SizedBox(height: 24),

            // Location details
            _buildLocationSection(),

            const SizedBox(height: 24),

            // Organizer information
            if (widget.event.organizer != null) ...[
              _buildOrganizerSection(),
              const SizedBox(height: 24),
            ],

            // Tags
            if (widget.event.tags.isNotEmpty) ...[
              _buildTagsSection(),
              const SizedBox(height: 24),
            ],

            // Attendees
            _buildAttendeesSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildEventHeader() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Type and status badges
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: _getTypeColor(widget.event.type).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _getTypeColor(widget.event.type).withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    widget.event.type.capitalize(),
                    style: TextStyle(
                      color: _getTypeColor(widget.event.type),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color:
                        _getStatusColor(widget.event.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color:
                          _getStatusColor(widget.event.status).withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    widget.event.status.capitalize(),
                    style: TextStyle(
                      color: _getStatusColor(widget.event.status),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const Spacer(),
                if (widget.event.isFull)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.error.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      'FULL',
                      style: TextStyle(
                        color: AppColors.error,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 20),

            // Title
            Text(
              widget.event.title,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
            ),

            const SizedBox(height: 12),

            // Description
            Text(
              widget.event.description,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
                height: 1.6,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEventDetails() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
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
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.event_outlined,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Event Details',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Date and time
            _buildDetailRow(
              icon: Icons.calendar_today,
              title: 'Date & Time',
              content:
                  '${DateFormat('EEEE, MMMM dd, yyyy').format(widget.event.date.start)}\n'
                  '${DateFormat('HH:mm').format(widget.event.date.start)} - '
                  '${DateFormat('HH:mm').format(widget.event.date.end)}',
            ),

            const SizedBox(height: 16),

            // Duration
            _buildDetailRow(
              icon: Icons.schedule,
              title: 'Duration',
              content: _getDurationText(),
            ),

            if (widget.event.capacity != null) ...[
              const SizedBox(height: 16),
              // Capacity
              _buildDetailRow(
                icon: Icons.people,
                title: 'Capacity',
                content:
                    '${widget.event.attendeeCount}/${widget.event.capacity} attendees',
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRegistrationSection() {
    final alreadyRegistered = _isCurrentUserRegistered();
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
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
                    color: AppColors.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.how_to_reg_outlined,
                    color: AppColors.success,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Registration',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Fee
            _buildDetailRow(
              icon: Icons.payment,
              title: 'Fee',
              content: widget.event.registration.fee.isFree
                  ? 'Free'
                  : widget.event.registration.fee.formattedFee,
            ),

            if (widget.event.registration.deadline != null) ...[
              const SizedBox(height: 16),
              _buildDetailRow(
                icon: Icons.event_available,
                title: 'Registration Deadline',
                content: DateFormat('MMM dd, yyyy')
                    .format(widget.event.registration.deadline!),
              ),
            ],

            const SizedBox(height: 20),

            // Registration button
            SizedBox(
              width: double.infinity,
              child: Container(
                height: 56,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: LinearGradient(
                    colors: alreadyRegistered
                        ? [Colors.grey, Colors.grey.withOpacity(0.8)]
                        : _canRegister()
                            ? [
                                AppColors.primary,
                                AppColors.primary.withOpacity(0.8)
                              ]
                            : [Colors.grey, Colors.grey.withOpacity(0.8)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: (alreadyRegistered
                              ? Colors.grey
                              : _canRegister()
                                  ? AppColors.primary
                                  : Colors.grey)
                          .withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: (!alreadyRegistered && _canRegister())
                      ? _handleRegistration
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: alreadyRegistered
                      ? const Text(
                          'Already Registered',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        )
                      : _isRegistering
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            )
                          : Text(
                              _getRegistrationButtonText(),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
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
                    color: AppColors.secondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _getLocationIcon(widget.event.location.type),
                    color: AppColors.secondary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Location',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (widget.event.location.type == 'virtual') ...[
              if (widget.event.location.virtualPlatform != null)
                _buildDetailRow(
                  icon: Icons.video_call,
                  title: 'Platform',
                  content: widget.event.location.virtualPlatform!,
                ),
              if (widget.event.location.virtualLink != null) ...[
                const SizedBox(height: 16),
                _buildDetailRow(
                  icon: Icons.link,
                  title: 'Meeting Link',
                  content: 'Will be provided before the event',
                ),
              ],
            ] else if (widget.event.location.type == 'hybrid') ...[
              if (widget.event.location.venue != null)
                _buildDetailRow(
                  icon: Icons.location_on,
                  title: 'Venue',
                  content: widget.event.location.venue!,
                ),
              if (widget.event.location.address != null) ...[
                const SizedBox(height: 16),
                _buildDetailRow(
                  icon: Icons.map,
                  title: 'Address',
                  content: widget.event.location.address!,
                ),
              ],
              if (widget.event.location.virtualLink != null) ...[
                const SizedBox(height: 16),
                _buildDetailRow(
                  icon: Icons.video_call,
                  title: 'Virtual Option',
                  content: 'Virtual link will be provided',
                ),
              ],
            ] else ...[
              if (widget.event.location.venue != null)
                _buildDetailRow(
                  icon: Icons.location_on,
                  title: 'Venue',
                  content: widget.event.location.venue!,
                ),
              if (widget.event.location.address != null) ...[
                const SizedBox(height: 16),
                _buildDetailRow(
                  icon: Icons.map,
                  title: 'Address',
                  content: widget.event.location.address!,
                ),
              ],
            ],
            if (widget.event.location.city != null) ...[
              const SizedBox(height: 16),
              _buildDetailRow(
                icon: Icons.location_city,
                title: 'City',
                content:
                    '${widget.event.location.city}${widget.event.location.country != null ? ', ${widget.event.location.country}' : ''}',
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildOrganizerSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
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
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.person_outline,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Organizer',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  child: Text(
                    widget.event.organizer!.firstName[0].toUpperCase(),
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.event.organizer!.fullName,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Event Organizer',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTagsSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
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
                    color: AppColors.secondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.label_outline,
                    color: AppColors.secondary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Tags',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: widget.event.tags.map((tag) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.divider,
                      width: 1,
                    ),
                  ),
                  child: Text(
                    tag,
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendeesSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
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
                    color: AppColors.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.people_outline,
                    color: AppColors.success,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Attendees',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${widget.event.attendeeCount} registered',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (widget.event.attendees.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(
                          Icons.people_outline,
                          size: 48,
                          color: AppColors.textSecondary.withOpacity(0.5),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No attendees yet',
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Be the first to register!',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              Text(
                'Attendee list will be available after registration',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String title,
    required String content,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            size: 20,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                content,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _getDurationText() {
    final duration = widget.event.date.end.difference(widget.event.date.start);
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return '$hours hours $minutes minutes';
    } else if (hours > 0) {
      return '$hours hours';
    } else {
      return '$minutes minutes';
    }
  }

  bool _canRegister() {
    // Debug information
    print('=== REGISTRATION DEBUG ===');
    print('Event status: ${widget.event.status}');
    print('Event is full: ${widget.event.isFull}');
    print('Registration is open: ${widget.event.isRegistrationOpen}');
    print('Event is past: ${widget.event.isPast}');
    print('Registration required: ${widget.event.registration.isRequired}');
    print('Registration deadline: ${widget.event.registration.deadline}');
    print('Current time: ${DateTime.now()}');
    print('Event start: ${widget.event.date.start}');
    print('Event end: ${widget.event.date.end}');

    if (widget.event.status != 'published') {
      print('❌ Cannot register: Event not published');
      return false;
    }
    if (widget.event.isFull) {
      print('❌ Cannot register: Event is full');
      return false;
    }
    if (!widget.event.isRegistrationOpen) {
      print('❌ Cannot register: Registration is closed');
      return false;
    }
    if (widget.event.isPast) {
      print('❌ Cannot register: Event is past');
      return false;
    }

    print('✅ Can register: All conditions met');
    return true;
  }

  String _getRegistrationButtonText() {
    if (widget.event.status != 'published') {
      return 'Event Not Available';
    }
    if (widget.event.isFull) {
      return 'Event Full';
    }
    if (!widget.event.isRegistrationOpen) {
      return 'Registration Closed';
    }
    if (widget.event.isPast) {
      return 'Event Ended';
    }
    return 'Register for Event';
  }

  Color _getRegistrationButtonColor() {
    if (_canRegister()) {
      return AppColors.primary;
    }
    return Colors.grey;
  }

  Future<void> _handleRegistration() async {
    if (!_canRegister()) return;

    // If the event has a fee, navigate to payment screen
    if (!widget.event.registration.fee.isFree) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentScreen(
            type: 'event_ticket',
            purpose: 'Event Registration: ${widget.event.title}',
            amount: widget.event.registration.fee.amount,
            currency: widget.event.registration.fee.currency,
            relatedEntityId: widget.event.id,
            relatedEntityType: 'event',
          ),
        ),
      );
      return;
    }

    // Free event - show confirmation modal
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Attendance'),
        content: Text(
          'This event is on '
          '${DateFormat.yMMMMd().format(widget.event.date.start)} at '
          '${DateFormat.Hm().format(widget.event.date.start)}.'
          '\nWill you be able to attend?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes, Register Me'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isRegistering = true;
    });

    try {
      await ApiService.registerEventAttendee(widget.event.id);
      if (!mounted) return;
      setState(() {
        _isRegistering = false;
      });
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Thank You!'),
          content:
              const Text('You are registered. We look forward to seeing you!'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isRegistering = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.error_outline, color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(child: Text('Registration failed: $e')),
            ],
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'reunion':
        return AppColors.secondary;
      case 'webinar':
        return AppColors.primary;
      case 'fundraiser':
        return AppColors.error;
      case 'networking':
        return AppColors.success;
      case 'workshop':
        return AppColors.warning;
      case 'social':
        return Colors.pink;
      case 'other':
        return AppColors.textSecondary;
      default:
        return AppColors.primary;
    }
  }

  void _debugRegistrationStatus() {
    print('=== EVENT REGISTRATION DEBUG ===');
    print('Event: ${widget.event.title}');
    print('Status: ${widget.event.status}');
    print('Is Public: ${widget.event.isPublic}');
    print('Is Full: ${widget.event.isFull}');
    print('Is Past: ${widget.event.isPast}');
    print('Is Upcoming: ${widget.event.isUpcoming}');
    print('Is Ongoing: ${widget.event.isOngoing}');
    print('Registration Required: ${widget.event.registration.isRequired}');
    print('Registration Deadline: ${widget.event.registration.deadline}');
    print('Registration Fee: ${widget.event.registration.fee.formattedFee}');
    print('Is Registration Open: ${widget.event.isRegistrationOpen}');
    print('Can Register: ${_canRegister()}');
    print('Current Time: ${DateTime.now()}');
    print('Event Start: ${widget.event.date.start}');
    print('Event End: ${widget.event.date.end}');

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Registration Debug:\n'
            'Status: ${widget.event.status}\n'
            'Required: ${widget.event.registration.isRequired}\n'
            'Open: ${widget.event.isRegistrationOpen}\n'
            'Can Register: ${_canRegister()}'),
        duration: const Duration(seconds: 5),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'draft':
        return AppColors.textSecondary;
      case 'published':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      case 'completed':
        return AppColors.primary;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _getLocationIcon(String type) {
    switch (type) {
      case 'physical':
        return Icons.location_on;
      case 'virtual':
        return Icons.video_call;
      case 'hybrid':
        return Icons.location_on_outlined;
      default:
        return Icons.location_on;
    }
  }
}
