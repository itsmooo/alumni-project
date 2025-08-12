import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../models/job.dart';

class JobsProvider extends ChangeNotifier {
  List<Job> _jobs = [];
  Job? _selectedJob;
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String? _error;

  // Filter states
  String? _selectedType;
  String? _selectedCategory;
  String? _selectedExperienceLevel;
  String? _selectedLocation;
  bool? _isRemote;
  String? _searchQuery;

  // Getters
  List<Job> get jobs => _jobs;
  Job? get selectedJob => _selectedJob;
  bool get isLoading => _isLoading;
  bool get hasMore => _hasMore;
  String? get error => _error;
  String? get selectedType => _selectedType;
  String? get selectedCategory => _selectedCategory;
  String? get selectedExperienceLevel => _selectedExperienceLevel;
  String? get selectedLocation => _selectedLocation;
  bool? get isRemote => _isRemote;
  String? get searchQuery => _searchQuery;

  // Get featured jobs
  List<Job> get featuredJobs => _jobs.where((job) => job.featured).toList();

  // Get remote jobs
  List<Job> get remoteJobs => _jobs.where((job) => job.isRemote).toList();

  // Application status tracking
  final Map<String, bool> _applicationStatus = {};
  static const String _applicationStatusKey = 'job_application_status';
  bool _isInitialized = false;

  // Check if provider is initialized
  bool get isInitialized => _isInitialized;

  // Check if user has applied for a specific job
  bool hasAppliedForJob(String jobId) {
    return _applicationStatus[jobId] ?? false;
  }

  // Get all job IDs that the user has applied for
  List<String> get appliedJobIds {
    return _applicationStatus.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();
  }

  // Get count of applied jobs
  int get appliedJobsCount {
    return _applicationStatus.values.where((status) => status).length;
  }

  // Debug method to print current application status
  void debugPrintApplicationStatus() {
    print('=== APPLICATION STATUS DEBUG ===');
    print('Provider initialized: $_isInitialized');
    print('Total jobs tracked: ${_applicationStatus.length}');
    print('Applied jobs: ${appliedJobsCount}');
    print('Applied job IDs: ${appliedJobIds}');
    print('All statuses: $_applicationStatus');
    print('===============================');
  }

  // Debug method to check status for specific jobs
  void debugCheckSpecificJobs(List<String> jobIds) {
    print('=== CHECKING SPECIFIC JOBS ===');
    for (final jobId in jobIds) {
      final status = _applicationStatus[jobId];
      print('Job $jobId: ${status ?? 'NOT FOUND'}');
    }
    print('=============================');
  }

  // Check if there are any stored application statuses
  bool get hasStoredApplicationStatuses => _applicationStatus.isNotEmpty;

  // Get detailed storage information
  Map<String, dynamic> getStorageDebugInfo() {
    return {
      'isInitialized': _isInitialized,
      'totalStored': _applicationStatus.length,
      'appliedJobs': appliedJobsCount,
      'allStatuses': Map<String, bool>.from(_applicationStatus),
      'appliedJobIds': appliedJobIds,
    };
  }

  // Set application status for a job
  void setApplicationStatus(String jobId, bool hasApplied) {
    print('Setting application status for job $jobId: $hasApplied');
    _applicationStatus[jobId] = hasApplied;
    // Immediately notify listeners for instant UI update
    notifyListeners();
    // Then save to storage asynchronously
    _saveApplicationStatusToStorage();
    print(
        'Application status updated. Total tracked: ${_applicationStatus.length}');
  }

  // Clear application status for a job
  void clearApplicationStatus(String jobId) {
    _applicationStatus.remove(jobId);
    _saveApplicationStatusToStorage();
    notifyListeners();
  }

  // Clear all application statuses
  Future<void> clearAllApplicationStatuses() async {
    print('=== CLEARING ALL APPLICATION STATUSES ===');

    _applicationStatus.clear();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_applicationStatusKey);
      print('All application statuses cleared from storage');
    } catch (e) {
      print('Error clearing application statuses from storage: $e');
    }

    notifyListeners();
    print('=== CLEAR COMPLETED ===');
  }

  // Force refresh UI for a specific job (useful for immediate updates)
  void forceRefreshJobStatus(String jobId) {
    notifyListeners();
  }

  // Force refresh UI for all jobs (useful after application status changes)
  void forceRefreshAllJobs() {
    notifyListeners();
  }

  // Refresh application status for a specific job from API
  Future<void> refreshApplicationStatus(String jobId) async {
    try {
      print('Force refreshing application status for job $jobId...');
      final hasApplied = await ApiService.hasAppliedForJob(jobId);
      print('API returned: $hasApplied for job $jobId');
      _applicationStatus[jobId] = hasApplied;
      _saveApplicationStatusToStorage();
      notifyListeners();
      print('Successfully refreshed status for job $jobId: $hasApplied');
    } catch (e) {
      print('Error refreshing application status for job $jobId: $e');
      // If API fails, try to handle "Already applied" errors
      if (e.toString().contains('Already applied')) {
        print(
            'API indicates user has already applied for job $jobId, updating local state...');
        _applicationStatus[jobId] = true;
        _saveApplicationStatusToStorage();
        notifyListeners();
      }
    }
  }

  // Force load application status for a specific job and return the result
  Future<bool> forceLoadApplicationStatus(String jobId) async {
    try {
      print('Force loading application status for job $jobId...');
      final hasApplied = await ApiService.hasAppliedForJob(jobId);
      print('API returned: $hasApplied for job $jobId');
      _applicationStatus[jobId] = hasApplied;
      _saveApplicationStatusToStorage();
      notifyListeners();
      print('Successfully loaded status for job $jobId: $hasApplied');
      return hasApplied;
    } catch (e) {
      print('Error loading application status for job $jobId: $e');
      // If API fails, try to handle "Already applied" errors
      if (e.toString().contains('Already applied')) {
        print(
            'API indicates user has already applied for job $jobId, updating local state...');
        _applicationStatus[jobId] = true;
        _saveApplicationStatusToStorage();
        notifyListeners();
        return true;
      }
      return false;
    }
  }

  // Force sync all application statuses with API (useful for fixing mismatches)
  Future<void> forceSyncAllApplicationStatuses() async {
    print('Force syncing all application statuses with API...');
    await checkApplicationStatusForAllJobs();
    print('Force sync completed');
  }

  // Clear all stored data and force fresh sync (useful for debugging)
  Future<void> clearAllDataAndForceSync() async {
    print('Clearing all stored application statuses and forcing fresh sync...');
    _applicationStatus.clear();
    _isInitialized = false;

    // Clear from storage
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_applicationStatusKey);
      print('Cleared stored application statuses');
    } catch (e) {
      print('Error clearing stored data: $e');
    }

    // Re-initialize and sync
    await initialize();
    await forceSyncAllApplicationStatuses();
    print('Fresh sync completed');
  }

  // Force reload all application statuses from API (nuclear option)
  Future<void> nuclearReloadAllApplicationStatuses() async {
    print('=== NUCLEAR RELOAD - FORCING ALL STATUSES FROM API ===');

    // Clear current data
    _applicationStatus.clear();

    // Force reload from API for all jobs
    if (_jobs.isNotEmpty) {
      for (final job in _jobs) {
        try {
          final hasApplied = await ApiService.hasAppliedForJob(job.id);
          _applicationStatus[job.id] = hasApplied;
          print('Nuclear reload: Job ${job.id} = $hasApplied');
        } catch (e) {
          print('Nuclear reload error for job ${job.id}: $e');
          _applicationStatus[job.id] = false;
        }
      }
    }

    // Save to storage and notify
    await _saveApplicationStatusToStorage();
    notifyListeners();
    print('Nuclear reload completed');
  }

  // NUCLEAR OPTION: Complete reset and fresh start
  Future<void> nuclearResetAndFreshStart() async {
    print('=== NUCLEAR RESET AND FRESH START ===');

    // Clear everything
    _applicationStatus.clear();
    _isInitialized = false;

    // Clear from storage
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_applicationStatusKey);
      print('Storage cleared');
    } catch (e) {
      print('Error clearing storage: $e');
    }

    // Re-initialize
    await initialize();

    // Force sync all jobs from API
    if (_jobs.isNotEmpty) {
      final jobIds = _jobs.map((job) => job.id).toList();
      print('Force syncing ${jobIds.length} jobs from API...');

      for (final jobId in jobIds) {
        try {
          final apiStatus = await ApiService.hasAppliedForJob(jobId);
          _applicationStatus[jobId] = apiStatus;
          print('Nuclear reset: Job $jobId = $apiStatus');
        } catch (e) {
          print('Nuclear reset error for job $jobId: $e');
          _applicationStatus[jobId] = false;
        }
      }

      await _saveApplicationStatusToStorage();
      notifyListeners();
    }

    print('=== NUCLEAR RESET COMPLETED ===');
  }

  // Save application status to local storage
  Future<void> _saveApplicationStatusToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final statusMap = Map<String, dynamic>.from(_applicationStatus);
      await prefs.setString(_applicationStatusKey, jsonEncode(statusMap));
      print(
          'Successfully saved ${_applicationStatus.length} application statuses to storage');
    } catch (e) {
      print('Error saving application status to storage: $e');
      // Don't crash the app if storage fails
    }
  }

  // Load application status from local storage
  Future<void> _loadApplicationStatusFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final statusString = prefs.getString(_applicationStatusKey);
      if (statusString != null) {
        final statusMap = Map<String, dynamic>.from(
            jsonDecode(statusString) as Map<String, dynamic>);
        _applicationStatus.clear();
        statusMap.forEach((key, value) {
          _applicationStatus[key] = value as bool;
        });
        print(
            'Loaded ${_applicationStatus.length} application statuses from storage');
      } else {
        print('No stored application statuses found');
      }
    } catch (e) {
      print('Error loading application status from storage: $e');
      // Clear the map if there's a corruption issue
      _applicationStatus.clear();
    }
  }

  // Initialize the provider by loading stored data
  Future<void> initialize() async {
    try {
      print('Initializing JobsProvider...');
      await _loadApplicationStatusFromStorage();

      // NEW: Load all user's applied jobs in one API call
      await _loadUserAppliedJobs();

      _isInitialized = true;
      print(
          'JobsProvider initialized with ${_applicationStatus.length} application statuses');
      debugPrintApplicationStatus();
      notifyListeners();
    } catch (e) {
      print('Error initializing JobsProvider: $e');
      // Even if initialization fails, mark as initialized to prevent UI hanging
      _isInitialized = true;
      notifyListeners();
    }
  }

  // NEW: Load all jobs that the current user has applied for
  Future<void> _loadUserAppliedJobs() async {
    try {
      print('Loading all user applied jobs...');
      final appliedJobIds = await ApiService.getUserAppliedJobIds();
      print(
          'User has applied for ${appliedJobIds.length} jobs: $appliedJobIds');

      // Update the application status map with all applied jobs
      for (final jobId in appliedJobIds) {
        _applicationStatus[jobId] = true;
      }

      // Save to storage
      await _saveApplicationStatusToStorage();
      print(
          'Successfully loaded and cached ${appliedJobIds.length} applied jobs');
    } catch (e) {
      print('Error loading user applied jobs: $e');
      // If this fails, we still have the cached data from storage
    }
  }

  // NEW: Public method to refresh all user's applied jobs
  Future<void> refreshUserAppliedJobs() async {
    try {
      print('Refreshing all user applied jobs...');
      await _loadUserAppliedJobs();
      notifyListeners();
      print('User applied jobs refreshed successfully');
    } catch (e) {
      print('Error refreshing user applied jobs: $e');
    }
  }

  // NEW: Efficient method to sync application statuses for multiple jobs
  Future<void> syncApplicationStatusesForJobs(List<String> jobIds) async {
    try {
      print('=== EFFICIENT SYNC FOR ${jobIds.length} JOBS ===');

      // First, get all user's applied jobs in one call
      final appliedJobIds = await ApiService.getUserAppliedJobIds();
      print('User has applied for ${appliedJobIds.length} jobs total');

      // Create a set for O(1) lookup
      final appliedJobSet = appliedJobIds.toSet();

      // Update status for all requested jobs at once
      bool hasChanges = false;
      for (final jobId in jobIds) {
        final newStatus = appliedJobSet.contains(jobId);
        final currentStatus = _applicationStatus[jobId];

        if (currentStatus != newStatus) {
          print('Updating job $jobId: $currentStatus -> $newStatus');
          _applicationStatus[jobId] = newStatus;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await _saveApplicationStatusToStorage();
        print('Changes saved to storage');
      }

      notifyListeners();
      print('=== EFFICIENT SYNC COMPLETED ===');
    } catch (e) {
      print('Error in efficient sync: $e');
      // Fallback to individual checks if bulk sync fails
      await preloadApplicationStatus(jobIds);
    }
  }

  // Synchronously get application status (immediate response from cache)
  bool getApplicationStatusSync(String jobId) {
    return _applicationStatus[jobId] ?? false;
  }

  // Synchronously check if user has applied for any jobs
  bool get hasAnyAppliedJobs =>
      _applicationStatus.values.any((status) => status);

  // Synchronously get all applied job IDs (immediate response)
  List<String> getAppliedJobIdsSync() {
    return _applicationStatus.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();
  }

  // Synchronously get count of applied jobs
  int getAppliedJobsCountSync() {
    return _applicationStatus.values.where((status) => status).length;
  }

  // Synchronously get all application statuses as a map
  Map<String, bool> getAllApplicationStatusesSync() {
    return Map<String, bool>.from(_applicationStatus);
  }

  // Synchronously check if user has applied for multiple jobs
  Map<String, bool> getApplicationStatusesForJobs(List<String> jobIds) {
    final result = <String, bool>{};
    for (final jobId in jobIds) {
      result[jobId] = _applicationStatus[jobId] ?? false;
    }
    return result;
  }

  // Pre-load application status for specific jobs (useful for job lists)
  // This method now also acts as a sync mechanism for the provided job IDs
  Future<void> preloadApplicationStatus(List<String> jobIds) async {
    print('=== PRELOADING AND SYNCING APPLICATION STATUS ===');
    print('Job IDs to process: $jobIds');

    bool hasChanges = false;

    for (final jobId in jobIds) {
      try {
        print('Processing job $jobId...');

        // ALWAYS check with API, regardless of cache
        final apiStatus = await ApiService.hasAppliedForJob(jobId);
        print('API returned for job $jobId: $apiStatus');

        final currentCachedStatus = _applicationStatus[jobId];
        print('Current cached status for job $jobId: $currentCachedStatus');

        // Update if different or if not cached
        if (currentCachedStatus != apiStatus ||
            !_applicationStatus.containsKey(jobId)) {
          print('Updating job $jobId: $currentCachedStatus -> $apiStatus');
          _applicationStatus[jobId] = apiStatus;
          hasChanges = true;
        } else {
          print('Job $jobId status unchanged: $apiStatus');
        }
      } catch (e) {
        print('Error processing job $jobId: $e');
        // If API fails but we have cached data, keep it
        // If no cached data, assume not applied
        if (!_applicationStatus.containsKey(jobId)) {
          print('Setting default status for job $jobId: false');
          _applicationStatus[jobId] = false;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      print('Saving changes to storage...');
      await _saveApplicationStatusToStorage();
      print('Changes saved to storage');
    }

    // ALWAYS notify listeners to ensure UI updates
    print('Notifying listeners...');
    notifyListeners();
    print('Listeners notified');

    print('=== PRELOAD COMPLETED ===');
    print('Final statuses: $_applicationStatus');
  }

  // NEW: Force immediate sync for all visible jobs
  Future<void> forceImmediateSyncForVisibleJobs(List<String> jobIds) async {
    print('=== FORCE IMMEDIATE SYNC FOR VISIBLE JOBS ===');

    // Clear current cache for these jobs to force fresh load
    for (final jobId in jobIds) {
      _applicationStatus.remove(jobId);
    }

    // Now preload which will force API calls
    await preloadApplicationStatus(jobIds);

    print('=== FORCE SYNC COMPLETED ===');
  }

  // NEW: Get application status with fallback to API
  Future<bool> getApplicationStatusWithFallback(String jobId) async {
    // First try cache
    if (_applicationStatus.containsKey(jobId)) {
      final cachedStatus = _applicationStatus[jobId]!;
      print('Using cached status for job $jobId: $cachedStatus');
      return cachedStatus;
    }

    // If not in cache, force check API
    print('No cached status for job $jobId, checking API...');
    try {
      final apiStatus = await ApiService.hasAppliedForJob(jobId);
      print('API returned for job $jobId: $apiStatus');

      // Cache the result
      _applicationStatus[jobId] = apiStatus;
      await _saveApplicationStatusToStorage();
      notifyListeners();

      return apiStatus;
    } catch (e) {
      print('Error checking API for job $jobId: $e');
      // Default to false if API fails
      _applicationStatus[jobId] = false;
      await _saveApplicationStatusToStorage();
      notifyListeners();
      return false;
    }
  }

  // Bulk update application statuses (useful for efficient syncing)
  void bulkUpdateApplicationStatuses(Map<String, bool> statusUpdates) {
    print('Bulk updating ${statusUpdates.length} application statuses...');

    bool hasChanges = false;
    statusUpdates.forEach((jobId, hasApplied) {
      if (_applicationStatus[jobId] != hasApplied) {
        _applicationStatus[jobId] = hasApplied;
        hasChanges = true;
        print('Updated status for job $jobId: $hasApplied');
      }
    });

    if (hasChanges) {
      _saveApplicationStatusToStorage();
      notifyListeners();
      print('Bulk update completed with changes');
    } else {
      print('Bulk update completed - no changes needed');
    }
  }

  // Detect and fix mismatches between local storage and API
  Future<void> detectAndFixMismatches(List<String> jobIds) async {
    print('Detecting mismatches for ${jobIds.length} jobs...');

    final mismatches = <String, bool>{};

    for (final jobId in jobIds) {
      try {
        final apiStatus = await ApiService.hasAppliedForJob(jobId);
        final localStatus = _applicationStatus[jobId];

        if (localStatus != apiStatus) {
          print(
              'Mismatch detected for job $jobId: Local=$localStatus, API=$apiStatus');
          mismatches[jobId] = apiStatus;
        }
      } catch (e) {
        print('Error checking mismatch for job $jobId: $e');
      }
    }

    if (mismatches.isNotEmpty) {
      print('Fixing ${mismatches.length} mismatches...');
      bulkUpdateApplicationStatuses(mismatches);
    } else {
      print('No mismatches detected');
    }
  }

  // Check application status for all jobs
  Future<void> checkApplicationStatusForAllJobs() async {
    // First load from local storage
    await _loadApplicationStatusFromStorage();

    // Always check with API for all jobs to ensure sync between local storage and database
    // This is important when there might be a mismatch
    for (final job in _jobs) {
      try {
        print('Checking API status for job ${job.id} to ensure sync...');
        final hasApplied = await ApiService.hasAppliedForJob(job.id);
        print('API returned: $hasApplied for job ${job.id}');

        // Update the status regardless of whether it was in cache or not
        _applicationStatus[job.id] = hasApplied;
      } catch (e) {
        print('Error checking application status for job ${job.id}: $e');
        // If API fails, keep existing status if available, otherwise assume false
        if (!_applicationStatus.containsKey(job.id)) {
          _applicationStatus[job.id] = false;
        }
      }
    }

    // Save updated statuses to storage
    await _saveApplicationStatusToStorage();
    notifyListeners();
    print('Finished syncing application status for ${_jobs.length} jobs');
  }

  // Load jobs
  Future<void> loadJobs({bool refresh = false}) async {
    if (_isLoading) return;

    if (refresh) {
      _currentPage = 1;
      _jobs.clear();
      _hasMore = true;
    }

    if (!_hasMore) return;

    _setLoading(true);
    _error = null;

    try {
      print('=== LOADING JOBS ===');
      print('Page: $_currentPage');
      print('Type: $_selectedType');
      print('Category: $_selectedCategory');
      print('Experience Level: $_selectedExperienceLevel');
      print('Location: $_selectedLocation');
      print('Remote: $_isRemote');
      print('Search: $_searchQuery');
      print('Refresh: $refresh');

      final response = await ApiService.getJobs(
        page: _currentPage,
        limit: 20,
        type: _selectedType,
        category: _selectedCategory,
        experienceLevel: _selectedExperienceLevel,
        location: _selectedLocation,
        remote: _isRemote,
        search: _searchQuery,
      );

      print('=== JOBS RESPONSE ===');
      print('Jobs loaded: ${response.jobs.length}');
      print('Total pages: ${response.pagination.pages}');
      print('Current page: ${response.pagination.page}');
      print('Total jobs: ${response.pagination.total}');

      if (response.jobs.isNotEmpty) {
        print('First job: ${response.jobs.first.title}');
        print('First job status: ${response.jobs.first.status}');
        print('First job company: ${response.jobs.first.company.name}');
      }

      if (refresh) {
        _jobs = response.jobs;
      } else {
        _jobs.addAll(response.jobs);
      }

      _hasMore = _currentPage < response.pagination.pages;
      _currentPage++;

      print('Total jobs in list: ${_jobs.length}');
      print('Has more: $_hasMore');

      // Check application status for all jobs
      await checkApplicationStatusForAllJobs();

      notifyListeners();
    } catch (e) {
      print('=== ERROR LOADING JOBS ===');
      print('Error: $e');
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  // Load job details
  Future<void> loadJobDetails(String id) async {
    _setLoading(true);
    _error = null;

    try {
      final job = await ApiService.getJob(id);
      _selectedJob = job;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  // Set filters
  void setFilters({
    String? type,
    String? category,
    String? experienceLevel,
    String? location,
    bool? remote,
    String? search,
  }) {
    bool shouldRefresh = false;

    if (type != _selectedType) {
      _selectedType = type;
      shouldRefresh = true;
    }

    if (category != _selectedCategory) {
      _selectedCategory = category;
      shouldRefresh = true;
    }

    if (experienceLevel != _selectedExperienceLevel) {
      _selectedExperienceLevel = experienceLevel;
      shouldRefresh = true;
    }

    if (location != _selectedLocation) {
      _selectedLocation = location;
      shouldRefresh = true;
    }

    if (remote != _isRemote) {
      _isRemote = remote;
      shouldRefresh = true;
    }

    if (search != _searchQuery) {
      _searchQuery = search;
      shouldRefresh = true;
    }

    if (shouldRefresh) {
      loadJobs(refresh: true);
    }
  }

  // Clear filters
  void clearFilters() {
    _selectedType = null;
    _selectedCategory = null;
    _selectedExperienceLevel = null;
    _selectedLocation = null;
    _isRemote = null;
    _searchQuery = null;
    loadJobs(refresh: true);
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}
