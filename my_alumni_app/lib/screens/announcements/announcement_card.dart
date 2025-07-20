import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/announcement.dart';

class AnnouncementCard extends StatelessWidget {
  final Announcement announcement;
  final VoidCallback onTap;
  final VoidCallback onLike;

  const AnnouncementCard({
    super.key,
    required this.announcement,
    required this.onTap,
    required this.onLike,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: announcement.isPinned ? 4 : 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: announcement.isPinned
                ? Border.all(
                    color: Theme.of(context).primaryColor,
                    width: 2,
                  )
                : null,
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with pin indicator and priority
                Row(
                  children: [
                    if (announcement.isPinned)
                      Icon(
                        Icons.push_pin,
                        color: Theme.of(context).primaryColor,
                        size: 20,
                      ),
                    if (announcement.isPinned) const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        announcement.title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    _buildPriorityChip(context),
                  ],
                ),

                const SizedBox(height: 8),

                // Category and author
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: _getCategoryColor(announcement.category)
                            .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        announcement.categoryDisplayName,
                        style: TextStyle(
                          fontSize: 12,
                          color: _getCategoryColor(announcement.category),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'by ${announcement.author.fullName}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Content preview
                Text(
                  announcement.content,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: 12),

                // Footer with engagement and date
                Row(
                  children: [
                    // Engagement stats
                    Row(
                      children: [
                        Icon(
                          Icons.visibility,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${announcement.engagement.views}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Icon(
                          Icons.favorite,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${announcement.engagement.likeCount}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Icon(
                          Icons.comment,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${announcement.engagement.commentCount}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Date
                    Text(
                      _formatDate(
                          announcement.publishDate ?? announcement.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),

                // Like button
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: onLike,
                      icon: Icon(
                        Icons.favorite_border,
                        size: 18,
                        color: Colors.grey[600],
                      ),
                      label: Text(
                        'Like',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPriorityChip(BuildContext context) {
    Color priorityColor;
    switch (announcement.priority) {
      case 'urgent':
        priorityColor = Colors.red;
        break;
      case 'high':
        priorityColor = Colors.orange;
        break;
      case 'medium':
        priorityColor = Colors.blue;
        break;
      case 'low':
        priorityColor = Colors.grey;
        break;
      default:
        priorityColor = Colors.blue;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: priorityColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        announcement.priorityDisplayName,
        style: TextStyle(
          fontSize: 10,
          color: priorityColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'general':
        return Colors.blue;
      case 'jobs':
        return Colors.green;
      case 'news':
        return Colors.purple;
      case 'scholarships':
        return Colors.orange;
      case 'events':
        return Colors.red;
      case 'achievements':
        return Colors.teal;
      case 'obituary':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return '${difference.inMinutes}m ago';
      }
      return '${difference.inHours}h ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM dd, yyyy').format(date);
    }
  }
}
