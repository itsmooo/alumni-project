// screens/announcements/announcements_list_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../../providers/announcements_provider.dart';
import '../../models/announcement.dart';
import '../../services/api_service.dart';
import '../../utils/api_test.dart';
import '../../utils/create_test_announcements.dart';
import 'announcement_card.dart';
import 'announcement_detail_screen.dart';

class AnnouncementsListScreen extends StatefulWidget {
  const AnnouncementsListScreen({super.key});

  @override
  State<AnnouncementsListScreen> createState() =>
      _AnnouncementsListScreenState();
}

class _AnnouncementsListScreenState extends State<AnnouncementsListScreen> {
  final RefreshController _refreshController =
      RefreshController(initialRefresh: false);
  final TextEditingController _searchController = TextEditingController();
  String? _selectedCategory;
  String? _selectedPriority;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AnnouncementsProvider>().loadAnnouncements(refresh: true);
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
      //   title: const Text('News & Announcements'),
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
      //       tooltip: 'Test Backend Connection',
      //     ),
      //     PopupMenuButton<String>(
      //       onSelected: (value) {
      //         switch (value) {
      //           case 'check_announcements':
      //             _checkExistingAnnouncements();
      //             break;
      //           case 'create_test_data':
      //             _createTestAnnouncements();
      //             break;
      //         }
      //       },
      //       itemBuilder: (context) => [
      //         const PopupMenuItem(
      //           value: 'check_announcements',
      //           child: Row(
      //             children: [
      //               Icon(Icons.list),
      //               SizedBox(width: 8),
      //               Text('Check Existing Announcements'),
      //             ],
      //           ),
      //         ),
      //         const PopupMenuItem(
      //           value: 'create_test_data',
      //           child: Row(
      //             children: [
      //               Icon(Icons.add),
      //               SizedBox(width: 8),
      //               Text('Create Test Announcements'),
      //             ],
      //           ),
      //         ),
      //       ],
      //       child: const Padding(
      //         padding: EdgeInsets.all(8.0),
      //         child: Icon(Icons.more_vert),
      //       ),
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
                hintText: 'Search announcements...',
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
          Consumer<AnnouncementsProvider>(
            builder: (context, provider, child) {
              if (provider.selectedCategory == null &&
                  provider.selectedPriority == null &&
                  provider.searchQuery == null) {
                return const SizedBox.shrink();
              }

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Wrap(
                  spacing: 8.0,
                  children: [
                    if (provider.selectedCategory != null)
                      _buildFilterChip('Category: ${provider.selectedCategory}',
                          () {
                        provider.setFilters(category: null);
                      }),
                    if (provider.selectedPriority != null)
                      _buildFilterChip('Priority: ${provider.selectedPriority}',
                          () {
                        provider.setFilters(priority: null);
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

          // Announcements list
          Expanded(
            child: Consumer<AnnouncementsProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading && provider.announcements.isEmpty) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }

                if (provider.error != null && provider.announcements.isEmpty) {
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
                          'Failed to load announcements',
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
                            provider.loadAnnouncements(refresh: true);
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                if (provider.announcements.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.announcement_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No announcements found',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Check back later for updates',
                          style: TextStyle(
                            color: Colors.grey[500],
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            final provider =
                                context.read<AnnouncementsProvider>();
                            provider.loadAnnouncements(refresh: true);
                          },
                          icon: const Icon(Icons.refresh),
                          label: const Text('Refresh'),
                        ),
                        const SizedBox(height: 8),
                        TextButton.icon(
                          onPressed: _testConnection,
                          icon: const Icon(Icons.wifi),
                          label: const Text('Test Connection'),
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
                    itemCount: provider.announcements.length +
                        (provider.hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == provider.announcements.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }

                      final announcement = provider.announcements[index];
                      return AnnouncementCard(
                        announcement: announcement,
                        onTap: () => _navigateToDetail(announcement),
                        onLike: () => provider.toggleLike(announcement.id),
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
    final provider = context.read<AnnouncementsProvider>();
    provider.setFilters(search: _searchController.text.trim());
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Announcements'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
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
                    value: 'general', child: Text('General')),
                const DropdownMenuItem(value: 'jobs', child: Text('Jobs')),
                const DropdownMenuItem(value: 'news', child: Text('News')),
                const DropdownMenuItem(
                    value: 'scholarships', child: Text('Scholarships')),
                const DropdownMenuItem(value: 'events', child: Text('Events')),
                const DropdownMenuItem(
                    value: 'achievements', child: Text('Achievements')),
                const DropdownMenuItem(
                    value: 'obituary', child: Text('Obituary')),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedCategory = value;
                });
              },
            ),
            const SizedBox(height: 16),

            // Priority filter
            DropdownButtonFormField<String>(
              value: _selectedPriority,
              decoration: const InputDecoration(
                labelText: 'Priority',
                border: OutlineInputBorder(),
              ),
              items: [
                const DropdownMenuItem(
                    value: null, child: Text('All Priorities')),
                const DropdownMenuItem(value: 'low', child: Text('Low')),
                const DropdownMenuItem(value: 'medium', child: Text('Medium')),
                const DropdownMenuItem(value: 'high', child: Text('High')),
                const DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedPriority = value;
                });
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _selectedCategory = null;
                _selectedPriority = null;
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
              final provider = context.read<AnnouncementsProvider>();
              provider.setFilters(
                category: _selectedCategory,
                priority: _selectedPriority,
              );
              Navigator.pop(context);
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  void _navigateToDetail(Announcement announcement) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            AnnouncementDetailScreen(announcement: announcement),
      ),
    );
  }

  Future<void> _onRefresh() async {
    final provider = context.read<AnnouncementsProvider>();
    await provider.loadAnnouncements(refresh: true);
    _refreshController.refreshCompleted();
  }

  Future<void> _onLoading() async {
    final provider = context.read<AnnouncementsProvider>();
    await provider.loadAnnouncements();
    _refreshController.loadComplete();
  }

  Future<void> _testApiConnection() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Testing API connection...')),
    );

    try {
      await ApiTest.testAnnouncementsEndpoints();

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

  Future<void> _checkExistingAnnouncements() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Checking existing announcements...')),
    );

    try {
      await TestAnnouncementsCreator.checkExistingAnnouncements();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Check completed! Check console for details.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Check failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _createTestAnnouncements() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Creating test announcements...')),
    );

    try {
      await TestAnnouncementsCreator.createTestAnnouncements();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content:
                Text('Test announcements created! Check console for details.'),
            backgroundColor: Colors.green,
          ),
        );

        // Refresh the announcements list
        final provider = context.read<AnnouncementsProvider>();
        await provider.loadAnnouncements(refresh: true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text('Failed to create test announcements: ${e.toString()}'),
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
      final isConnected = await ApiService.testBackendConnection();

      if (mounted) {
        if (isConnected) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Backend connection successful!'),
              backgroundColor: Colors.green,
            ),
          );

          // Refresh announcements after successful connection test
          final provider = context.read<AnnouncementsProvider>();
          await provider.loadAnnouncements(refresh: true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  '❌ Backend connection failed! Check if server is running.'),
              backgroundColor: Colors.red,
            ),
          );
        }
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
