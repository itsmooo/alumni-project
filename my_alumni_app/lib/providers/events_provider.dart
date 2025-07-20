import 'package:flutter/foundation.dart';
import '../models/event.dart';
import '../services/api_service.dart';

class EventsProvider with ChangeNotifier {
  List<Event> _events = [];
  bool _isLoading = false;
  bool _hasError = false;
  String _errorMessage = '';
  PaginationInfo? _pagination;
  bool _hasMoreData = true;

  // Filters
  String? _selectedType;
  String? _selectedStatus;
  bool? _upcomingOnly;
  String _searchQuery = '';

  // Getters
  List<Event> get events => _events;
  bool get isLoading => _isLoading;
  bool get hasError => _hasError;
  String get errorMessage => _errorMessage;
  PaginationInfo? get pagination => _pagination;
  bool get hasMoreData => _hasMoreData;
  String? get selectedType => _selectedType;
  String? get selectedStatus => _selectedStatus;
  bool? get upcomingOnly => _upcomingOnly;
  String get searchQuery => _searchQuery;

  // Event types for filter
  static const List<String> eventTypes = [
    'reunion',
    'webinar',
    'fundraiser',
    'networking',
    'workshop',
    'social',
    'other',
  ];

  // Event statuses for filter
  static const List<String> eventStatuses = [
    'draft',
    'published',
    'cancelled',
    'completed',
  ];

  // Load events (first page)
  Future<void> loadEvents({bool refresh = false}) async {
    if (_isLoading) return;

    if (refresh) {
      _events = [];
      _pagination = null;
      _hasMoreData = true;
    }

    _isLoading = true;
    _hasError = false;
    _errorMessage = '';
    notifyListeners();

    try {
      print('=== EVENTS PROVIDER DEBUG ===');
      print('Loading events with filters:');
      print('Type: $_selectedType');
      print('Status: $_selectedStatus');
      print('Upcoming only: $_upcomingOnly');
      print('Search: $_searchQuery');

      final response = await ApiService.getEvents(
        page: 1,
        limit: 20,
        type: _selectedType,
        status: _selectedStatus,
        upcoming: _upcomingOnly,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
      );

      _events = response.events;
      _pagination = response.pagination;
      _hasMoreData = response.pagination.page < response.pagination.pages;

      print('Loaded ${_events.length} events');
      print('Pagination: ${_pagination?.toJson()}');
      print('Has more data: $_hasMoreData');
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      print('Error loading events: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load more events (pagination)
  Future<void> loadMoreEvents() async {
    if (_isLoading || !_hasMoreData || _pagination == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      final nextPage = _pagination!.page + 1;

      final response = await ApiService.getEvents(
        page: nextPage,
        limit: 20,
        type: _selectedType,
        status: _selectedStatus,
        upcoming: _upcomingOnly,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
      );

      _events.addAll(response.events);
      _pagination = response.pagination;
      _hasMoreData = response.pagination.page < response.pagination.pages;

      print('Loaded ${response.events.length} more events');
      print('Total events: ${_events.length}');
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      print('Error loading more events: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Set filters and reload
  Future<void> setFilters({
    String? type,
    String? status,
    bool? upcoming,
    String? search,
  }) async {
    bool shouldReload = false;

    if (type != _selectedType) {
      _selectedType = type;
      shouldReload = true;
    }

    if (status != _selectedStatus) {
      _selectedStatus = status;
      shouldReload = true;
    }

    if (upcoming != _upcomingOnly) {
      _upcomingOnly = upcoming;
      shouldReload = true;
    }

    if (search != _searchQuery) {
      _searchQuery = search ?? '';
      shouldReload = true;
    }

    if (shouldReload) {
      await loadEvents(refresh: true);
    }
  }

  // Clear all filters
  Future<void> clearFilters() async {
    _selectedType = null;
    _selectedStatus = null;
    _upcomingOnly = null;
    _searchQuery = '';
    await loadEvents(refresh: true);
  }

  // Get event by ID
  Event? getEventById(String id) {
    try {
      return _events.firstWhere((event) => event.id == id);
    } catch (e) {
      return null;
    }
  }

  // Register for an event
  Future<bool> registerForEvent(String eventId) async {
    try {
      await ApiService.registerForEvent(eventId);

      // Update the event in the list to reflect registration
      final eventIndex = _events.indexWhere((event) => event.id == eventId);
      if (eventIndex != -1) {
        // Refresh the event data
        final updatedEvent = await ApiService.getEvent(eventId);
        _events[eventIndex] = updatedEvent;
        notifyListeners();
      }

      return true;
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Cancel event registration
  Future<bool> cancelEventRegistration(String eventId) async {
    try {
      await ApiService.cancelEventRegistration(eventId);

      // Update the event in the list to reflect cancellation
      final eventIndex = _events.indexWhere((event) => event.id == eventId);
      if (eventIndex != -1) {
        // Refresh the event data
        final updatedEvent = await ApiService.getEvent(eventId);
        _events[eventIndex] = updatedEvent;
        notifyListeners();
      }

      return true;
    } catch (e) {
      _hasError = true;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Check if user is registered for an event
  bool isUserRegisteredForEvent(String eventId) {
    final event = getEventById(eventId);
    if (event == null) return false;

    // This would need to be updated when we have user ID from auth
    // For now, we'll return false
    return false;
  }

  // Get filtered events based on current filters
  List<Event> get filteredEvents {
    List<Event> filtered = List.from(_events);

    // Apply client-side filtering if needed
    if (_upcomingOnly == true) {
      filtered = filtered.where((event) => event.isUpcoming).toList();
    }

    return filtered;
  }

  // Get upcoming events
  List<Event> get upcomingEvents {
    return _events.where((event) => event.isUpcoming).toList();
  }

  // Get past events
  List<Event> get pastEvents {
    return _events.where((event) => event.isPast).toList();
  }

  // Get ongoing events
  List<Event> get ongoingEvents {
    return _events.where((event) => event.isOngoing).toList();
  }

  // Clear error state
  void clearError() {
    _hasError = false;
    _errorMessage = '';
    notifyListeners();
  }

  // Refresh events
  Future<void> refresh() async {
    await loadEvents(refresh: true);
  }
}
