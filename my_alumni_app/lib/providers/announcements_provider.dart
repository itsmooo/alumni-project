import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/announcement.dart';

class AnnouncementsProvider extends ChangeNotifier {
  List<Announcement> _announcements = [];
  Announcement? _selectedAnnouncement;
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String? _error;

  // Filter states
  String? _selectedCategory;
  String? _selectedPriority;
  String? _searchQuery;

  // Getters
  List<Announcement> get announcements => _announcements;
  Announcement? get selectedAnnouncement => _selectedAnnouncement;
  bool get isLoading => _isLoading;
  bool get hasMore => _hasMore;
  String? get error => _error;
  String? get selectedCategory => _selectedCategory;
  String? get selectedPriority => _selectedPriority;
  String? get searchQuery => _searchQuery;

  // Get pinned announcements
  List<Announcement> get pinnedAnnouncements =>
      _announcements.where((announcement) => announcement.isPinned).toList();

  // Get regular announcements
  List<Announcement> get regularAnnouncements =>
      _announcements.where((announcement) => !announcement.isPinned).toList();

  // Load announcements
  Future<void> loadAnnouncements({bool refresh = false}) async {
    if (_isLoading) return;

    if (refresh) {
      _currentPage = 1;
      _announcements.clear();
      _hasMore = true;
    }

    if (!_hasMore) return;

    _setLoading(true);
    _error = null;

    try {
      print('=== LOADING ANNOUNCEMENTS ===');
      print('Page: $_currentPage');
      print('Category: $_selectedCategory');
      print('Priority: $_selectedPriority');
      print('Search: $_searchQuery');
      print('Refresh: $refresh');
      print('API Base URL: ${ApiService.baseUrl}');

      final response = await ApiService.getAnnouncements(
        page: _currentPage,
        limit: 20,
        category: _selectedCategory,
        priority: _selectedPriority,
        search: _searchQuery,
      );

      print('=== ANNOUNCEMENTS RESPONSE ===');
      print('Announcements loaded: ${response.announcements.length}');
      print('Total pages: ${response.pagination.pages}');
      print('Current page: ${response.pagination.page}');
      print('Total announcements: ${response.pagination.total}');

      if (response.announcements.isNotEmpty) {
        print('First announcement: ${response.announcements.first.title}');
        print(
            'First announcement status: ${response.announcements.first.status}');
        print(
            'First announcement publish date: ${response.announcements.first.publishDate}');
        print(
            'First announcement is published: ${response.announcements.first.isPublished}');
      }

      if (refresh) {
        _announcements = response.announcements;
      } else {
        _announcements.addAll(response.announcements);
      }

      _hasMore = _currentPage < response.pagination.pages;
      _currentPage++;

      print('Total announcements in list: ${_announcements.length}');
      print('Has more: $_hasMore');

      notifyListeners();
    } catch (e) {
      print('=== ERROR LOADING ANNOUNCEMENTS ===');
      print('Error: $e');
      print('Error type: ${e.runtimeType}');
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  // Load announcement details
  Future<void> loadAnnouncementDetails(String id) async {
    _setLoading(true);
    _error = null;

    try {
      final announcement = await ApiService.getAnnouncement(id);
      _selectedAnnouncement = announcement;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  // Toggle like on announcement
  Future<void> toggleLike(String announcementId) async {
    try {
      final response = await ApiService.toggleAnnouncementLike(announcementId);

      // Update the announcement in the list
      final index = _announcements.indexWhere((a) => a.id == announcementId);
      if (index != -1) {
        final announcement = _announcements[index];
        final updatedLikes =
            List<AnnouncementLike>.from(announcement.engagement.likes);

        // Check if user already liked
        final currentUserId = await _getCurrentUserId();
        final existingLikeIndex =
            updatedLikes.indexWhere((like) => like.userId == currentUserId);

        if (existingLikeIndex != -1) {
          // Unlike
          updatedLikes.removeAt(existingLikeIndex);
        } else {
          // Like
          updatedLikes.add(AnnouncementLike(
            id: '', // Will be set by backend
            userId: currentUserId,
            createdAt: DateTime.now(),
          ));
        }

        final updatedEngagement = AnnouncementEngagement(
          views: announcement.engagement.views,
          likes: updatedLikes,
          comments: announcement.engagement.comments,
        );

        final updatedAnnouncement = Announcement(
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          category: announcement.category,
          author: announcement.author,
          priority: announcement.priority,
          status: announcement.status,
          publishDate: announcement.publishDate,
          expiryDate: announcement.expiryDate,
          isPinned: announcement.isPinned,
          engagement: updatedEngagement,
          media: announcement.media,
          createdAt: announcement.createdAt,
          updatedAt: announcement.updatedAt,
        );

        _announcements[index] = updatedAnnouncement;

        // Update selected announcement if it's the same
        if (_selectedAnnouncement?.id == announcementId) {
          _selectedAnnouncement = updatedAnnouncement;
        }

        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Add comment to announcement
  Future<void> addComment(String announcementId, String content) async {
    try {
      await ApiService.addAnnouncementComment(announcementId, content);

      // Refresh the announcement details to get the updated comments
      await loadAnnouncementDetails(announcementId);

      // Also update the announcement in the list
      await loadAnnouncements(refresh: true);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Set filters
  void setFilters({
    String? category,
    String? priority,
    String? search,
  }) {
    bool shouldRefresh = false;

    if (category != _selectedCategory) {
      _selectedCategory = category;
      shouldRefresh = true;
    }

    if (priority != _selectedPriority) {
      _selectedPriority = priority;
      shouldRefresh = true;
    }

    if (search != _searchQuery) {
      _searchQuery = search;
      shouldRefresh = true;
    }

    if (shouldRefresh) {
      loadAnnouncements(refresh: true);
    }
  }

  // Clear filters
  void clearFilters() {
    _selectedCategory = null;
    _selectedPriority = null;
    _searchQuery = null;
    loadAnnouncements(refresh: true);
  }

  // Clear individual filters
  void clearCategoryFilter() {
    _selectedCategory = null;
    loadAnnouncements(refresh: true);
  }

  void clearPriorityFilter() {
    _selectedPriority = null;
    loadAnnouncements(refresh: true);
  }

  void clearSearchQuery() {
    _searchQuery = null;
    loadAnnouncements(refresh: true);
  }

  // Set search query
  void setSearchQuery(String query) {
    _searchQuery = query;
    loadAnnouncements(refresh: true);
  }

  // Clear selected announcement
  void clearSelectedAnnouncement() {
    _selectedAnnouncement = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Helper method to get current user ID
  Future<String> _getCurrentUserId() async {
    final user = await ApiService.getUser();
    return user?['id'] ?? '';
  }
}
