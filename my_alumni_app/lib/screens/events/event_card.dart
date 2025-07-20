import 'package:flutter/material.dart';
import '../../models/event.dart';
import '../../utils/string_extensions.dart';
import 'package:intl/intl.dart';

class EventCard extends StatelessWidget {
  final Event event;
  final VoidCallback? onTap;

  const EventCard({
    Key? key,
    required this.event,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Event header with type and status
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getTypeColor(event.type),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      event.type.capitalize(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(event.status),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      event.status.capitalize(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const Spacer(),
                  if (event.isFull)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'FULL',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 12),

              // Event title
              Text(
                event.title,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 8),

              // Event description
              Text(
                event.description,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 12),

              // Date and time
              Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('MMM dd, yyyy').format(event.date.start),
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('HH:mm').format(event.date.start),
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // Location
              Row(
                children: [
                  Icon(
                    _getLocationIcon(event.location.type),
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      _getLocationText(event.location),
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Footer with organizer, attendees, and fee
              Row(
                children: [
                  // Organizer
                  if (event.organizer != null) ...[
                    Icon(
                      Icons.person,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      event.organizer!.fullName,
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                      ),
                    ),
                  ],

                  const Spacer(),

                  // Attendees count
                  Icon(
                    Icons.people,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${event.attendeeCount}',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                  if (event.capacity != null) ...[
                    Text(
                      '/${event.capacity}',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                      ),
                    ),
                  ],

                  const SizedBox(width: 16),

                  // Fee
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: event.registration.fee.isFree
                          ? Colors.green
                          : Colors.blue,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      event.registration.fee.isFree
                          ? 'FREE'
                          : event.registration.fee.formattedFee,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
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

  String _getLocationText(EventLocation location) {
    if (location.type == 'virtual') {
      return location.virtualPlatform ?? 'Virtual Event';
    } else if (location.type == 'hybrid') {
      return '${location.venue ?? 'Hybrid Event'} + Virtual';
    } else {
      return location.venue ?? location.city ?? 'Location TBD';
    }
  }
}
