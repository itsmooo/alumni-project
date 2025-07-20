// screens/events/events_list_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/events_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/string_extensions.dart';
import 'event_card.dart';
import 'event_detail_screen.dart';

class EventsListScreen extends StatefulWidget {
  const EventsListScreen({Key? key}) : super(key: key);

  @override
  State<EventsListScreen> createState() => _EventsListScreenState();
}

class _EventsListScreenState extends State<EventsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<EventsProvider>().loadEvents();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<EventsProvider>().loadMoreEvents();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Events'),
        actions: [
          IconButton(
            icon: Icon(
                _showFilters ? Icons.filter_list : Icons.filter_list_outlined),
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'test_connection':
                  _testApiConnection();
                  break;
                case 'check_events':
                  _checkExistingEvents();
                  break;
                case 'create_test_events':
                  _createTestEvents();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'test_connection',
                child: Text('Test API Connection'),
              ),
              const PopupMenuItem(
                value: 'check_events',
                child: Text('Check Existing Events'),
              ),
              const PopupMenuItem(
                value: 'create_test_events',
                child: Text('Create Test Events'),
              ),
            ],
            child: const Icon(Icons.more_vert),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search events...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          context.read<EventsProvider>().setFilters(search: '');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                context.read<EventsProvider>().setFilters(search: value);
              },
            ),
          ),

          // Filters section
          if (_showFilters) _buildFiltersSection(),

          // Events list
          Expanded(
            child: Consumer<EventsProvider>(
              builder: (context, eventsProvider, child) {
                if (eventsProvider.isLoading && eventsProvider.events.isEmpty) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }

                if (eventsProvider.hasError && eventsProvider.events.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Error loading events',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          eventsProvider.errorMessage,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            eventsProvider.clearError();
                            eventsProvider.loadEvents(refresh: true);
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                if (eventsProvider.events.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.event_busy,
                          size: 64,
                          color: Colors.grey,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No events found',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Try adjusting your filters or search terms',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            eventsProvider.clearFilters();
                          },
                          child: const Text('Clear Filters'),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    await eventsProvider.refresh();
                  },
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: eventsProvider.events.length + 1,
                    itemBuilder: (context, index) {
                      if (index == eventsProvider.events.length) {
                        if (eventsProvider.isLoading) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        if (eventsProvider.hasMoreData) {
                          return const SizedBox.shrink();
                        }
                        return const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Center(
                            child: Text(
                              'No more events to load',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                        );
                      }

                      final event = eventsProvider.events[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: EventCard(
                          event: event,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    EventDetailScreen(event: event),
                              ),
                            );
                          },
                        ),
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

  Widget _buildFiltersSection() {
    return Consumer<EventsProvider>(
      builder: (context, eventsProvider, child) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            border: Border(
              bottom: BorderSide(
                color: Theme.of(context).dividerColor,
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Filters',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  TextButton(
                    onPressed: () {
                      eventsProvider.clearFilters();
                    },
                    child: const Text('Clear All'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Event Type Filter
              Text(
                'Event Type',
                style: Theme.of(context).textTheme.labelMedium,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  FilterChip(
                    label: const Text('All'),
                    selected: eventsProvider.selectedType == null,
                    onSelected: (selected) {
                      eventsProvider.setFilters(type: null);
                    },
                  ),
                  ...EventsProvider.eventTypes.map((type) {
                    return FilterChip(
                      label: Text(type.capitalize()),
                      selected: eventsProvider.selectedType == type,
                      onSelected: (selected) {
                        eventsProvider.setFilters(type: selected ? type : null);
                      },
                    );
                  }).toList(),
                ],
              ),

              const SizedBox(height: 16),

              // Status Filter
              Text(
                'Status',
                style: Theme.of(context).textTheme.labelMedium,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  FilterChip(
                    label: const Text('All'),
                    selected: eventsProvider.selectedStatus == null,
                    onSelected: (selected) {
                      eventsProvider.setFilters(status: null);
                    },
                  ),
                  ...EventsProvider.eventStatuses.map((status) {
                    return FilterChip(
                      label: Text(status.capitalize()),
                      selected: eventsProvider.selectedStatus == status,
                      onSelected: (selected) {
                        eventsProvider.setFilters(
                            status: selected ? status : null);
                      },
                    );
                  }).toList(),
                ],
              ),

              const SizedBox(height: 16),

              // Upcoming Only Filter
              Row(
                children: [
                  Checkbox(
                    value: eventsProvider.upcomingOnly ?? false,
                    onChanged: (value) {
                      eventsProvider.setFilters(upcoming: value);
                    },
                  ),
                  const Text('Upcoming events only'),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _testApiConnection() async {
    try {
      print('=== TESTING EVENTS API CONNECTION ===');
      final eventsProvider = context.read<EventsProvider>();
      await eventsProvider.loadEvents(refresh: true);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'API connection test completed. Found ${eventsProvider.events.length} events.'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('API connection failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _checkExistingEvents() async {
    try {
      print('=== CHECKING EXISTING EVENTS ===');
      final eventsProvider = context.read<EventsProvider>();
      await eventsProvider.loadEvents(refresh: true);

      if (!mounted) return;

      final message = eventsProvider.events.isEmpty
          ? 'No events found in the system.'
          : 'Found ${eventsProvider.events.length} events in the system.';

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor:
              eventsProvider.events.isEmpty ? Colors.orange : Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error checking events: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _createTestEvents() async {
    try {
      print('=== CREATING TEST EVENTS ===');
      // This would need to be implemented in the backend
      // For now, we'll just show a message

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Test events creation not implemented yet. Please create events through the admin panel.'),
          backgroundColor: Colors.orange,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error creating test events: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
