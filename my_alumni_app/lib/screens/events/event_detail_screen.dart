import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/event.dart';
import '../../providers/events_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/string_extensions.dart';
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
      appBar: AppBar(
        title: const Text('Event Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bug_report),
            onPressed: () {
              _debugRegistrationStatus();
            },
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Share functionality coming soon')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Type and status badges
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: _getTypeColor(widget.event.type),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                widget.event.type.capitalize(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: _getStatusColor(widget.event.status),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                widget.event.status.capitalize(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const Spacer(),
            if (widget.event.isFull)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Text(
                  'FULL',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
          ],
        ),

        const SizedBox(height: 16),

        // Title
        Text(
          widget.event.title,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),

        const SizedBox(height: 8),

        // Description
        Text(
          widget.event.description,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.grey[600],
                height: 1.5,
              ),
        ),
      ],
    );
  }

  Widget _buildEventDetails() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Event Details',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),

            // Date and time
            _buildDetailRow(
              icon: Icons.calendar_today,
              title: 'Date & Time',
              content:
                  '${DateFormat('EEEE, MMMM dd, yyyy').format(widget.event.date.start)}\n'
                  '${DateFormat('HH:mm').format(widget.event.date.start)} - '
                  '${DateFormat('HH:mm').format(widget.event.date.end)}',
            ),

            const SizedBox(height: 12),

            // Duration
            _buildDetailRow(
              icon: Icons.schedule,
              title: 'Duration',
              content: _getDurationText(),
            ),

            const SizedBox(height: 12),

            // Capacity
            if (widget.event.capacity != null)
              _buildDetailRow(
                icon: Icons.people,
                title: 'Capacity',
                content:
                    '${widget.event.attendeeCount}/${widget.event.capacity} attendees',
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRegistrationSection() {
    final alreadyRegistered = _isCurrentUserRegistered();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Registration',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),

            // Fee
            _buildDetailRow(
              icon: Icons.payment,
              title: 'Fee',
              content: widget.event.registration.fee.isFree
                  ? 'Free'
                  : widget.event.registration.fee.formattedFee,
            ),

            if (widget.event.registration.deadline != null) ...[
              const SizedBox(height: 12),
              _buildDetailRow(
                icon: Icons.event_available,
                title: 'Registration Deadline',
                content: DateFormat('MMM dd, yyyy')
                    .format(widget.event.registration.deadline!),
              ),
            ],

            const SizedBox(height: 16),

            // Registration button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (!alreadyRegistered && _canRegister())
                    ? _handleRegistration
                    : null,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: alreadyRegistered
                      ? Colors.grey
                      : _getRegistrationButtonColor(),
                ),
                child: alreadyRegistered
                    ? const Text(
                        'Already Registered',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      )
                    : _isRegistering
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text(
                            _getRegistrationButtonText(),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
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
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _getLocationIcon(widget.event.location.type),
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(width: 8),
                Text(
                  'Location',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (widget.event.location.type == 'virtual') ...[
              if (widget.event.location.virtualPlatform != null)
                _buildDetailRow(
                  icon: Icons.video_call,
                  title: 'Platform',
                  content: widget.event.location.virtualPlatform!,
                ),
              if (widget.event.location.virtualLink != null) ...[
                const SizedBox(height: 12),
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
                const SizedBox(height: 12),
                _buildDetailRow(
                  icon: Icons.map,
                  title: 'Address',
                  content: widget.event.location.address!,
                ),
              ],
              if (widget.event.location.virtualLink != null) ...[
                const SizedBox(height: 12),
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
                const SizedBox(height: 12),
                _buildDetailRow(
                  icon: Icons.map,
                  title: 'Address',
                  content: widget.event.location.address!,
                ),
              ],
            ],
            if (widget.event.location.city != null) ...[
              const SizedBox(height: 12),
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
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Organizer',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: Theme.of(context).primaryColor,
                  child: Text(
                    widget.event.organizer!.firstName[0].toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.event.organizer!.fullName,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Event Organizer',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
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
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tags',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: widget.event.tags.map((tag) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    tag,
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontSize: 14,
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
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Attendees',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const Spacer(),
                Text(
                  '${widget.event.attendeeCount} registered',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (widget.event.attendees.isEmpty)
              Text(
                'No attendees yet',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              )
            else
              Text(
                'Attendee list will be available after registration',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
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
        Icon(
          icon,
          size: 20,
          color: Colors.grey[600],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
              ),
              const SizedBox(height: 2),
              Text(
                content,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
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
      return Theme.of(context).primaryColor;
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
        SnackBar(content: Text('Registration failed: $e')),
      );
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'reunion':
        return Colors.purple;
      case 'webinar':
        return Colors.blue;
      case 'fundraiser':
        return Colors.red;
      case 'networking':
        return Colors.green;
      case 'workshop':
        return Colors.orange;
      case 'social':
        return Colors.pink;
      case 'other':
        return Colors.grey;
      default:
        return Colors.grey;
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
        backgroundColor: Colors.blue,
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'draft':
        return Colors.grey;
      case 'published':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      case 'completed':
        return Colors.blue;
      default:
        return Colors.grey;
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
