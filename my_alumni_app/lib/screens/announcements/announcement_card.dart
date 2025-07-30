import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/announcement.dart';
import '../../constants/app_colors.dart';

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
    return Container(
      margin: const EdgeInsets.only(bottom: 16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
        border: announcement.isPinned
            ? Border.all(color: AppColors.primary, width: 2)
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with pin indicator and priority
                Row(
                  children: [
                    if (announcement.isPinned)
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.push_pin,
                          color: AppColors.primary,
                          size: 16,
                        ),
                      ),
                    if (announcement.isPinned) const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        announcement.title,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 12),
                    _buildPriorityChip(context),
                  ],
                ),

                const SizedBox(height: 16),

                // Category and author
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getCategoryColor(
                          announcement.category,
                        ).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        announcement.categoryDisplayName,
                        style: TextStyle(
                          fontSize: 12,
                          color: _getCategoryColor(announcement.category),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 12,
                            backgroundColor: AppColors.primary.withOpacity(0.1),
                            child: Text(
                              announcement.author.firstName[0].toUpperCase(),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              announcement.author.fullName,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Content preview
                Text(
                  announcement.content,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: 20),

                // Footer with engagement and date
                Row(
                  children: [
                    // Engagement stats
                    Row(
                      children: [
                        _buildEngagementItem(
                          Icons.visibility_outlined,
                          '${announcement.engagement.views}',
                          AppColors.textSecondary,
                        ),
                        const SizedBox(width: 20),
                        _buildEngagementItem(
                          Icons.favorite_outline,
                          '${announcement.engagement.likeCount}',
                          AppColors.textSecondary,
                        ),
                        const SizedBox(width: 20),
                        _buildEngagementItem(
                          Icons.comment_outlined,
                          '${announcement.engagement.commentCount}',
                          AppColors.textSecondary,
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Date
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _formatDate(
                          announcement.publishDate ?? announcement.createdAt,
                        ),
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),

                // Like button
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: TextButton.icon(
                        onPressed: onLike,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                        icon: Icon(
                          Icons.favorite_outline,
                          size: 16,
                          color: AppColors.primary,
                        ),
                        label: Text(
                          'Like',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
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

  Widget _buildEngagementItem(IconData icon, String count, Color color) {
    return Row(
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          count,
          style: TextStyle(
            fontSize: 12,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildPriorityChip(BuildContext context) {
    Color priorityColor;
    switch (announcement.priority) {
      case 'urgent':
        priorityColor = AppColors.error;
        break;
      case 'high':
        priorityColor = AppColors.warning;
        break;
      case 'medium':
        priorityColor = AppColors.primary;
        break;
      case 'low':
        priorityColor = AppColors.textSecondary;
        break;
      default:
        priorityColor = AppColors.primary;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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
        return AppColors.primary;
      case 'jobs':
        return AppColors.success;
      case 'news':
        return AppColors.secondary;
      case 'scholarships':
        return AppColors.warning;
      case 'events':
        return AppColors.error;
      case 'achievements':
        return Colors.teal;
      case 'obituary':
        return AppColors.textSecondary;
      default:
        return AppColors.primary;
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
