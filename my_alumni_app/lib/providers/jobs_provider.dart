import 'package:flutter/material.dart';
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

  // Check if user has applied for a specific job
  bool hasAppliedForJob(String jobId) {
    return _applicationStatus[jobId] ?? false;
  }

  // Set application status for a job
  void setApplicationStatus(String jobId, bool hasApplied) {
    _applicationStatus[jobId] = hasApplied;
    notifyListeners();
  }

  // Check application status for all jobs
  Future<void> checkApplicationStatusForAllJobs() async {
    for (final job in _jobs) {
      try {
        final hasApplied = await ApiService.hasAppliedForJob(job.id);
        _applicationStatus[job.id] = hasApplied;
      } catch (e) {
        print('Error checking application status for job ${job.id}: $e');
        _applicationStatus[job.id] = false;
      }
    }
    notifyListeners();
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
