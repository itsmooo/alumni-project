import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/job.dart';

class JobDetailScreen extends StatelessWidget {
  final Job job;

  const JobDetailScreen({
    super.key,
    required this.job,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: _shareJob,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(context),
            const SizedBox(height: 24),

            // Company section
            _buildCompanySection(context),
            const SizedBox(height: 24),

            // Job details
            _buildJobDetails(context),
            const SizedBox(height: 24),

            // Description
            _buildDescription(context),
            const SizedBox(height: 24),

            // Requirements
            if (job.requirements.isNotEmpty) ...[
              _buildRequirements(context),
              const SizedBox(height: 24),
            ],

            // Benefits
            if (job.benefits.isNotEmpty) ...[
              _buildBenefits(context),
              const SizedBox(height: 24),
            ],

            // Stats
            _buildStats(context),
            const SizedBox(height: 24),

            // Apply button
            _buildApplyButton(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title and featured indicator
            Row(
              children: [
                if (job.featured)
                  Icon(
                    Icons.star,
                    color: Colors.amber,
                    size: 24,
                  ),
                if (job.featured) const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    job.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Company name
            Text(
              job.company.name,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 12),

            // Job type and experience level
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getTypeColor(job.type).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    job.typeDisplayName,
                    style: TextStyle(
                      fontSize: 14,
                      color: _getTypeColor(job.type),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getExperienceColor(job.experienceLevel)
                        .withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    job.experienceLevelDisplayName,
                    style: TextStyle(
                      fontSize: 14,
                      color: _getExperienceColor(job.experienceLevel),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompanySection(BuildContext context) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Company',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              job.company.name,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (job.company.description != null) ...[
              const SizedBox(height: 8),
              Text(
                job.company.description!,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
            if (job.company.website != null) ...[
              const SizedBox(height: 8),
              InkWell(
                onTap: () {
                  // TODO: Open website
                },
                child: Text(
                  job.company.website!,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.blue,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildJobDetails(BuildContext context) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Job Details',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildDetailRow(Icons.location_on, 'Location', job.locationDisplay),
            const SizedBox(height: 12),
            _buildDetailRow(Icons.attach_money, 'Salary', job.salaryDisplay),
            const SizedBox(height: 12),
            _buildDetailRow(
                Icons.category, 'Category', job.categoryDisplayName),
            if (job.expiresAt != null) ...[
              const SizedBox(height: 12),
              _buildDetailRow(
                Icons.schedule,
                'Expires',
                DateFormat('MMM dd, yyyy').format(job.expiresAt!),
              ),
            ],
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.person,
              'Posted by',
              job.postedBy.fullName,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDescription(BuildContext context) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Description',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              job.description,
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

  Widget _buildRequirements(BuildContext context) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Requirements',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...job.requirements.map((requirement) => Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.check_circle,
                        size: 16,
                        color: Colors.green,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          requirement,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildBenefits(BuildContext context) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Benefits',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...job.benefits.map((benefit) => Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.favorite,
                        size: 16,
                        color: Colors.red,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          benefit,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildStats(BuildContext context) {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem(
              Icons.visibility,
              '${job.views}',
              'Views',
            ),
            _buildStatItem(
              Icons.people,
              '${job.applicationCount}',
              'Applications',
            ),
            _buildStatItem(
              Icons.schedule,
              _formatDate(job.createdAt),
              'Posted',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildApplyButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _applyForJob,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          'Apply for this Job',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.grey[600],
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, size: 24, color: Colors.grey[600]),
        const SizedBox(height: 4),
        Text(
          value,
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

  Color _getTypeColor(String type) {
    switch (type) {
      case 'full-time':
        return Colors.green;
      case 'part-time':
        return Colors.blue;
      case 'contract':
        return Colors.orange;
      case 'internship':
        return Colors.purple;
      case 'volunteer':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  Color _getExperienceColor(String level) {
    switch (level) {
      case 'entry':
        return Colors.green;
      case 'mid':
        return Colors.blue;
      case 'senior':
        return Colors.orange;
      case 'executive':
        return Colors.red;
      default:
        return Colors.grey;
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

  void _shareJob() {
    // TODO: Implement share functionality
    // ScaffoldMessenger.of(context).showSnackBar(
    //   const SnackBar(content: Text('Share functionality coming soon...')),
    // );
  }

  void _applyForJob() {
    // TODO: Implement apply functionality
    // ScaffoldMessenger.of(context).showSnackBar(
    //   const SnackBar(content: Text('Apply functionality coming soon...')),
    // );
  }
}
