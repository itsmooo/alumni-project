import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/announcement.dart';
import '../../providers/announcements_provider.dart';

class AnnouncementDetailScreen extends StatefulWidget {
  final Announcement announcement;

  const AnnouncementDetailScreen({
    super.key,
    required this.announcement,
  });

  @override
  State<AnnouncementDetailScreen> createState() =>
      _AnnouncementDetailScreenState();
}

class _AnnouncementDetailScreenState extends State<AnnouncementDetailScreen> {
  final TextEditingController _commentController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Load fresh announcement data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context
          .read<AnnouncementsProvider>()
          .loadAnnouncementDetails(widget.announcement.id);
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Announcement'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: _shareAnnouncement,
          ),
        ],
      ),
      body: Consumer<AnnouncementsProvider>(
        builder: (context, provider, child) {
          final announcement =
              provider.selectedAnnouncement ?? widget.announcement;

          if (provider.isLoading && provider.selectedAnnouncement == null) {
            return const Center(child: CircularProgressIndicator());
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(announcement),
                const SizedBox(height: 16),

                // Content
                _buildContent(announcement),
                const SizedBox(height: 24),

                // Engagement stats
                _buildEngagementStats(announcement),
                const SizedBox(height: 24),

                // Comments section
                _buildCommentsSection(announcement, provider),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(Announcement announcement) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title and pin indicator
            Row(
              children: [
                if (announcement.isPinned)
                  Icon(
                    Icons.push_pin,
                    color: Theme.of(context).primaryColor,
                    size: 24,
                  ),
                if (announcement.isPinned) const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    announcement.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Category and priority
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getCategoryColor(announcement.category)
                        .withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    announcement.categoryDisplayName,
                    style: TextStyle(
                      fontSize: 14,
                      color: _getCategoryColor(announcement.category),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getPriorityColor(announcement.priority)
                        .withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    announcement.priorityDisplayName,
                    style: TextStyle(
                      fontSize: 14,
                      color: _getPriorityColor(announcement.priority),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Author and date
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Colors.grey[300],
                  child: Text(
                    announcement.author.firstName[0].toUpperCase(),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        announcement.author.fullName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        _formatDate(
                            announcement.publishDate ?? announcement.createdAt),
                        style: TextStyle(
                          fontSize: 12,
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

  Widget _buildContent(Announcement announcement) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Content',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              announcement.content,
              style: const TextStyle(
                fontSize: 16,
                height: 1.6,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEngagementStats(Announcement announcement) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem(
              Icons.visibility,
              '${announcement.engagement.views}',
              'Views',
            ),
            _buildStatItem(
              Icons.favorite,
              '${announcement.engagement.likeCount}',
              'Likes',
            ),
            _buildStatItem(
              Icons.comment,
              '${announcement.engagement.commentCount}',
              'Comments',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String count, String label) {
    return Column(
      children: [
        Icon(icon, size: 24, color: Colors.grey[600]),
        const SizedBox(height: 4),
        Text(
          count,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildCommentsSection(
      Announcement announcement, AnnouncementsProvider provider) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Comments',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '(${announcement.engagement.commentCount})',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Add comment
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: const InputDecoration(
                      hintText: 'Add a comment...',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 2,
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : _addComment,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Post'),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Comments list
            if (announcement.engagement.comments.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    children: [
                      Icon(
                        Icons.comment_outlined,
                        size: 48,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No comments yet',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Be the first to comment!',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: announcement.engagement.comments.length,
                itemBuilder: (context, index) {
                  final comment = announcement.engagement.comments[index];
                  return _buildCommentItem(comment);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCommentItem(AnnouncementComment comment) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: Colors.grey[300],
                child: Text(
                  comment.userName.isNotEmpty
                      ? comment.userName[0].toUpperCase()
                      : '?',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      comment.userName.isNotEmpty
                          ? comment.userName
                          : 'Anonymous',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      _formatDate(comment.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            comment.content,
            style: const TextStyle(fontSize: 14),
          ),
        ],
      ),
    );
  }

  Future<void> _addComment() async {
    if (_commentController.text.trim().isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final provider = context.read<AnnouncementsProvider>();
      await provider.addComment(
          widget.announcement.id, _commentController.text.trim());
      _commentController.clear();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comment added successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add comment: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _shareAnnouncement() {
    // TODO: Implement share functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Share functionality coming soon...')),
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

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'urgent':
        return Colors.red;
      case 'high':
        return Colors.orange;
      case 'medium':
        return Colors.blue;
      case 'low':
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
