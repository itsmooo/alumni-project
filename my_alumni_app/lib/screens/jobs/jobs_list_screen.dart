// screens/jobs/jobs_list_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../../providers/jobs_provider.dart';
import '../../models/job.dart';
import '../../utils/api_test.dart';
import 'job_card.dart';
import 'job_detail_screen.dart';

class JobsListScreen extends StatefulWidget {
  const JobsListScreen({super.key});

  @override
  State<JobsListScreen> createState() => _JobsListScreenState();
}

class _JobsListScreenState extends State<JobsListScreen> {
  final RefreshController _refreshController =
      RefreshController(initialRefresh: false);
  final TextEditingController _searchController = TextEditingController();
  String? _selectedType;
  String? _selectedCategory;
  String? _selectedExperienceLevel;
  String? _selectedLocation;
  bool? _isRemote;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JobsProvider>().loadJobs(refresh: true);
    });
  }

  @override
  void dispose() {
    _refreshController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // appBar: AppBar(
      //   title: const Text('Job Opportunities'),
      //   actions: [
      //     IconButton(
      //       icon: const Icon(Icons.filter_list),
      //       onPressed: _showFilterDialog,
      //     ),
      //     IconButton(
      //       icon: const Icon(Icons.bug_report),
      //       onPressed: _testApiConnection,
      //     ),
      //     IconButton(
      //       icon: const Icon(Icons.wifi),
      //       onPressed: _testConnection,
      //     ),
      //   ],
      // ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search jobs...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _performSearch();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onSubmitted: (_) => _performSearch(),
            ),
          ),

          // Active filters display
          Consumer<JobsProvider>(
            builder: (context, provider, child) {
              if (provider.selectedType == null &&
                  provider.selectedCategory == null &&
                  provider.selectedExperienceLevel == null &&
                  provider.selectedLocation == null &&
                  provider.isRemote == null &&
                  provider.searchQuery == null) {
                return const SizedBox.shrink();
              }

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Wrap(
                  spacing: 8.0,
                  children: [
                    if (provider.selectedType != null)
                      _buildFilterChip('Type: ${provider.selectedType}', () {
                        provider.setFilters(type: null);
                      }),
                    if (provider.selectedCategory != null)
                      _buildFilterChip('Category: ${provider.selectedCategory}',
                          () {
                        provider.setFilters(category: null);
                      }),
                    if (provider.selectedExperienceLevel != null)
                      _buildFilterChip(
                          'Level: ${provider.selectedExperienceLevel}', () {
                        provider.setFilters(experienceLevel: null);
                      }),
                    if (provider.selectedLocation != null)
                      _buildFilterChip('Location: ${provider.selectedLocation}',
                          () {
                        provider.setFilters(location: null);
                      }),
                    if (provider.isRemote == true)
                      _buildFilterChip('Remote', () {
                        provider.setFilters(remote: null);
                      }),
                    if (provider.searchQuery != null)
                      _buildFilterChip('Search: ${provider.searchQuery}', () {
                        provider.setFilters(search: null);
                      }),
                    _buildFilterChip('Clear All', () {
                      provider.clearFilters();
                      _searchController.clear();
                    }),
                  ],
                ),
              );
            },
          ),

          // Jobs list
          Expanded(
            child: Consumer<JobsProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading && provider.jobs.isEmpty) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }

                if (provider.error != null && provider.jobs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Failed to load jobs',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          provider.error!,
                          style: TextStyle(
                            color: Colors.grey[500],
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            provider.clearError();
                            provider.loadJobs(refresh: true);
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                if (provider.jobs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.work_outline,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No jobs found',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Check back later for new opportunities',
                          style: TextStyle(
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return SmartRefresher(
                  controller: _refreshController,
                  onRefresh: _onRefresh,
                  onLoading: _onLoading,
                  enablePullUp: provider.hasMore,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount:
                        provider.jobs.length + (provider.hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == provider.jobs.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }

                      final job = provider.jobs[index];
                      return JobCard(
                        job: job,
                        onTap: () => _navigateToDetail(job),
                        hasApplied: provider.hasAppliedForJob(job.id),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, VoidCallback onDeleted) {
    return Chip(
      label: Text(label),
      deleteIcon: const Icon(Icons.close, size: 18),
      onDeleted: onDeleted,
      backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
    );
  }

  void _performSearch() {
    final provider = context.read<JobsProvider>();
    provider.setFilters(search: _searchController.text.trim());
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Jobs'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Job type filter
              DropdownButtonFormField<String>(
                value: _selectedType,
                decoration: const InputDecoration(
                  labelText: 'Job Type',
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem(value: null, child: Text('All Types')),
                  const DropdownMenuItem(
                      value: 'full-time', child: Text('Full Time')),
                  const DropdownMenuItem(
                      value: 'part-time', child: Text('Part Time')),
                  const DropdownMenuItem(
                      value: 'contract', child: Text('Contract')),
                  const DropdownMenuItem(
                      value: 'internship', child: Text('Internship')),
                  const DropdownMenuItem(
                      value: 'volunteer', child: Text('Volunteer')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedType = value;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Category filter
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem(
                      value: null, child: Text('All Categories')),
                  const DropdownMenuItem(
                      value: 'technology', child: Text('Technology')),
                  const DropdownMenuItem(
                      value: 'healthcare', child: Text('Healthcare')),
                  const DropdownMenuItem(
                      value: 'finance', child: Text('Finance')),
                  const DropdownMenuItem(
                      value: 'education', child: Text('Education')),
                  const DropdownMenuItem(
                      value: 'marketing', child: Text('Marketing')),
                  const DropdownMenuItem(value: 'sales', child: Text('Sales')),
                  const DropdownMenuItem(
                      value: 'operations', child: Text('Operations')),
                  const DropdownMenuItem(value: 'other', child: Text('Other')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedCategory = value;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Experience level filter
              DropdownButtonFormField<String>(
                value: _selectedExperienceLevel,
                decoration: const InputDecoration(
                  labelText: 'Experience Level',
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem(
                      value: null, child: Text('All Levels')),
                  const DropdownMenuItem(
                      value: 'entry', child: Text('Entry Level')),
                  const DropdownMenuItem(
                      value: 'mid', child: Text('Mid Level')),
                  const DropdownMenuItem(
                      value: 'senior', child: Text('Senior Level')),
                  const DropdownMenuItem(
                      value: 'executive', child: Text('Executive')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedExperienceLevel = value;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Location filter
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Location',
                  border: OutlineInputBorder(),
                  hintText: 'Enter city or country',
                ),
                onChanged: (value) {
                  setState(() {
                    _selectedLocation = value.isEmpty ? null : value;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Remote filter
              CheckboxListTile(
                title: const Text('Remote Only'),
                value: _isRemote,
                onChanged: (value) {
                  setState(() {
                    _isRemote = value;
                  });
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _selectedType = null;
                _selectedCategory = null;
                _selectedExperienceLevel = null;
                _selectedLocation = null;
                _isRemote = null;
              });
            },
            child: const Text('Clear'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final provider = context.read<JobsProvider>();
              provider.setFilters(
                type: _selectedType,
                category: _selectedCategory,
                experienceLevel: _selectedExperienceLevel,
                location: _selectedLocation,
                remote: _isRemote,
              );
              Navigator.pop(context);
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  void _navigateToDetail(Job job) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => JobDetailScreen(job: job),
      ),
    );
  }

  Future<void> _onRefresh() async {
    final provider = context.read<JobsProvider>();
    await provider.loadJobs(refresh: true);
    _refreshController.refreshCompleted();
  }

  Future<void> _onLoading() async {
    final provider = context.read<JobsProvider>();
    await provider.loadJobs();
    _refreshController.loadComplete();
  }

  Future<void> _testApiConnection() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Testing API connection...')),
    );

    try {
      await ApiTest.testJobsEndpoints();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('API test completed! Check console for details.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('API test failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _testConnection() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Testing connection to backend...')),
    );

    try {
      await ApiTest.testJobsConnection();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content:
                Text('Connection test completed! Check console for details.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Connection test failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
