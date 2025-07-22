import 'dart:convert';

// Helper methods for parsing JSON fields
String _parseStringField(
    Map<String, dynamic> json, String primaryKey, String fallbackKey) {
  final value = json[primaryKey] ?? json[fallbackKey];
  return value?.toString() ?? '';
}

String _parseUserId(dynamic userField) {
  if (userField == null) return '';

  if (userField is String) {
    return userField;
  } else if (userField is Map<String, dynamic>) {
    return _parseStringField(userField, '_id', 'id');
  }

  return '';
}

Map<String, String> _parseUserInfo(dynamic userField) {
  String userId = '';
  String userName = '';

  if (userField != null) {
    if (userField is String) {
      // User is just an ID string
      userId = userField;
      userName = 'User'; // Default name when we only have ID
    } else if (userField is Map<String, dynamic>) {
      // User is an object with firstName and lastName
      userId = _parseStringField(userField, '_id', 'id');
      final firstName = userField['firstName']?.toString() ?? '';
      final lastName = userField['lastName']?.toString() ?? '';
      userName = '$firstName $lastName'.trim();
      if (userName.isEmpty) {
        userName = 'User'; // Fallback name
      }
    }
  }

  return {'userId': userId, 'userName': userName};
}

DateTime _parseDateTime(dynamic dateField, String fieldName) {
  if (dateField == null) {
    throw FormatException('$fieldName cannot be null');
  }

  try {
    return DateTime.parse(dateField.toString());
  } catch (e) {
    throw FormatException('Invalid $fieldName format: $dateField');
  }
}

int _parseInt(dynamic value, int defaultValue) {
  if (value == null) return defaultValue;

  if (value is int) return value;
  if (value is String) {
    return int.tryParse(value) ?? defaultValue;
  }

  return defaultValue;
}

List<String> _parseStringList(dynamic listField) {
  if (listField == null) return [];

  if (listField is List) {
    return listField
        .map((item) => item?.toString() ?? '')
        .where((item) => item.isNotEmpty)
        .toList();
  }

  return [];
}

class Announcement {
  final String id;
  final String title;
  final String content;
  final String category;
  final AnnouncementAuthor author;
  final String priority;
  final String status;
  final DateTime? publishDate;
  final DateTime? expiryDate;
  final bool isPinned;
  final AnnouncementEngagement engagement;
  final AnnouncementMedia? media;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.author,
    required this.priority,
    required this.status,
    this.publishDate,
    this.expiryDate,
    required this.isPinned,
    required this.engagement,
    this.media,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    try {
      // Parse and validate required fields
      final id = _parseStringField(json, '_id', 'id');
      if (id.isEmpty) {
        throw FormatException('Announcement ID cannot be empty');
      }

      final title = json['title']?.toString() ?? '';
      if (title.isEmpty) {
        throw FormatException('Announcement title cannot be empty');
      }

      final content = json['content']?.toString() ?? '';
      if (content.isEmpty) {
        throw FormatException('Announcement content cannot be empty');
      }

      final category = json['category']?.toString() ?? 'general';
      final author = AnnouncementAuthor.fromJson(json['author'] ?? {});
      final priority = json['priority']?.toString() ?? 'medium';
      final status = json['status']?.toString() ?? 'draft';
      
      // Parse optional date fields
      final publishDate = json['publishDate'] != null
          ? _parseDateTime(json['publishDate'], 'publishDate')
          : null;
      final expiryDate = json['expiryDate'] != null
          ? _parseDateTime(json['expiryDate'], 'expiryDate')
          : null;
      
      final isPinned = json['isPinned'] == true;
      final engagement = AnnouncementEngagement.fromJson(json['engagement'] ?? {});
      final media = json['media'] != null
          ? AnnouncementMedia.fromJson(json['media'])
          : null;
      
      final createdAt = _parseDateTime(json['createdAt'], 'createdAt');
      final updatedAt = _parseDateTime(json['updatedAt'], 'updatedAt');

      return Announcement(
        id: id,
        title: title,
        content: content,
        category: category,
        author: author,
        priority: priority,
        status: status,
        publishDate: publishDate,
        expiryDate: expiryDate,
        isPinned: isPinned,
        engagement: engagement,
        media: media,
        createdAt: createdAt,
        updatedAt: updatedAt,
    );
    } catch (e, stackTrace) {
      print('Error parsing Announcement: $e');
      print('Stack trace: $stackTrace');
      print('JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'category': category,
      'author': author.toJson(),
      'priority': priority,
      'status': status,
      'publishDate': publishDate?.toIso8601String(),
      'expiryDate': expiryDate?.toIso8601String(),
      'isPinned': isPinned,
      'engagement': engagement.toJson(),
      'media': media?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Computed properties
  String get categoryDisplayName {
    switch (category) {
      case 'general':
        return 'General';
      case 'jobs':
        return 'Jobs';
      case 'news':
        return 'News';
      case 'scholarships':
        return 'Scholarships';
      case 'events':
        return 'Events';
      case 'achievements':
        return 'Achievements';
      case 'obituary':
        return 'Obituary';
      default:
        return category;
    }
  }

  String get priorityDisplayName {
    switch (priority) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'urgent':
        return 'Urgent';
      default:
        return priority;
    }
  }

  bool get isExpired {
    if (expiryDate == null) return false;
    return DateTime.now().isAfter(expiryDate!);
  }

  bool get isPublished {
    return status == 'published';
  }

  bool get isDraft {
    return status == 'draft';
  }

  bool get isScheduled {
    return publishDate != null && DateTime.now().isBefore(publishDate!);
  }

  bool get isActive {
    return isPublished && !isExpired && !isScheduled;
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Announcement &&
        other.id == id &&
        other.title == title &&
        other.content == content &&
        other.category == category &&
        other.author == author &&
        other.priority == priority &&
        other.status == status &&
        other.publishDate == publishDate &&
        other.expiryDate == expiryDate &&
        other.isPinned == isPinned &&
        other.engagement == engagement &&
        other.media == media &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode => Object.hash(
    id, title, content, category, author, priority, status,
    publishDate, expiryDate, isPinned, engagement, media,
    createdAt, updatedAt,
  );

  @override
  String toString() {
    return 'Announcement(id: $id, title: $title, category: $category, author: ${author.fullName}, status: $status)';
  }
}

class AnnouncementAuthor {
  final String id;
  final String firstName;
  final String lastName;
  final String? role;

  const AnnouncementAuthor({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.role,
  });

  factory AnnouncementAuthor.fromJson(Map<String, dynamic> json) {
    try {
      final id = _parseStringField(json, '_id', 'id');
      if (id.isEmpty) {
        throw FormatException('Author ID cannot be empty');
      }

      final firstName = json['firstName']?.toString() ?? '';
      if (firstName.isEmpty) {
        throw FormatException('Author firstName cannot be empty');
      }

      final lastName = json['lastName']?.toString() ?? '';
      if (lastName.isEmpty) {
        throw FormatException('Author lastName cannot be empty');
      }

    return AnnouncementAuthor(
        id: id,
        firstName: firstName,
        lastName: lastName,
        role: json['role']?.toString(),
    );
    } catch (e, stackTrace) {
      print('Error parsing AnnouncementAuthor: $e');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
    };
  }

  String get fullName => '$firstName $lastName';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AnnouncementAuthor &&
        other.id == id &&
        other.firstName == firstName &&
        other.lastName == lastName &&
        other.role == role;
  }

  @override
  int get hashCode => Object.hash(id, firstName, lastName, role);

  @override
  String toString() {
    return 'AnnouncementAuthor(id: $id, name: $fullName, role: $role)';
  }
}

class AnnouncementEngagement {
  final int views;
  final List<AnnouncementLike> likes;
  final List<AnnouncementComment> comments;

  const AnnouncementEngagement({
    required this.views,
    required this.likes,
    required this.comments,
  });

  factory AnnouncementEngagement.fromJson(Map<String, dynamic> json) {
    try {
      final views = _parseInt(json['views'], 0);

      final likes = (json['likes'] as List<dynamic>? ?? [])
          .map((like) => AnnouncementLike.fromJson(like))
          .toList();

      final comments = (json['comments'] as List<dynamic>? ?? [])
          .map((comment) => AnnouncementComment.fromJson(comment))
          .toList();

      return AnnouncementEngagement(
        views: views,
        likes: likes,
        comments: comments,
    );
    } catch (e, stackTrace) {
      print('Error parsing AnnouncementEngagement: $e');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'views': views,
      'likes': likes.map((like) => like.toJson()).toList(),
      'comments': comments.map((comment) => comment.toJson()).toList(),
    };
  }

  int get likeCount => likes.length;
  int get commentCount => comments.length;

  // Helper method to check if a user has liked the announcement
  bool hasUserLiked(String userId) {
    return likes.any((like) => like.userId == userId);
  }

  // Helper method to get like by user ID
  AnnouncementLike? getLikeByUser(String userId) {
    try {
      return likes.firstWhere((like) => like.userId == userId);
    } catch (e) {
      return null;
    }
  }

  // Helper method to get total engagement count
  int get totalEngagement => views + likeCount + commentCount;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AnnouncementEngagement &&
        other.views == views &&
        other.likes == likes &&
        other.comments == comments;
  }

  @override
  int get hashCode => Object.hash(views, likes, comments);

  @override
  String toString() {
    return 'AnnouncementEngagement(views: $views, likes: $likeCount, comments: $commentCount)';
  }
}

class AnnouncementLike {
  final String id;
  final String userId;
  final DateTime createdAt;

  const AnnouncementLike({
    required this.id,
    required this.userId,
    required this.createdAt,
  });

  factory AnnouncementLike.fromJson(Map<String, dynamic> json) {
    try {
      // Ensure _id is always treated as a string with validation
      final id = _parseStringField(json, '_id', 'id');
      if (id.isEmpty) {
        throw FormatException('Like ID cannot be empty');
      }

      // Handle user field with better validation
      final userId = _parseUserId(json['user']);
      if (userId.isEmpty) {
        throw FormatException('User ID cannot be empty');
      }

      // Parse and validate createdAt
      final createdAt = _parseDateTime(json['createdAt'], 'createdAt');

    return AnnouncementLike(
        id: id,
        userId: userId,
        createdAt: createdAt,
    );
    } catch (e, stackTrace) {
      print('Error parsing AnnouncementLike: $e');
      print('Stack trace: $stackTrace');
      print('JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': userId,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AnnouncementLike &&
        other.id == id &&
        other.userId == userId &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode => Object.hash(id, userId, createdAt);

  @override
  String toString() {
    return 'AnnouncementLike(id: $id, userId: $userId, createdAt: $createdAt)';
  }
}

class AnnouncementComment {
  final String id;
  final String userId;
  final String userName;
  final String content;
  final DateTime createdAt;
  final List<AnnouncementCommentReply> replies;

  const AnnouncementComment({
    required this.id,
    required this.userId,
    required this.userName,
    required this.content,
    required this.createdAt,
    required this.replies,
  });

  factory AnnouncementComment.fromJson(Map<String, dynamic> json) {
    try {
      // Parse and validate ID
      final id = _parseStringField(json, '_id', 'id');
      if (id.isEmpty) {
        throw FormatException('Comment ID cannot be empty');
      }

      // Parse user information
      final userInfo = _parseUserInfo(json['user']);

      // Parse content
      final content = json['content']?.toString() ?? '';
      if (content.isEmpty) {
        throw FormatException('Comment content cannot be empty');
      }

      // Parse and validate createdAt
      final createdAt = _parseDateTime(json['createdAt'], 'createdAt');

      // Parse replies
      final replies = (json['replies'] as List<dynamic>? ?? [])
          .map((reply) => AnnouncementCommentReply.fromJson(reply))
          .toList();

      return AnnouncementComment(
        id: id,
        userId: userInfo['userId']!,
        userName: userInfo['userName']!,
        content: content,
        createdAt: createdAt,
        replies: replies,
    );
    } catch (e, stackTrace) {
      print('Error parsing AnnouncementComment: $e');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': userId,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'replies': replies.map((reply) => reply.toJson()).toList(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AnnouncementComment &&
        other.id == id &&
        other.userId == userId &&
        other.userName == userName &&
        other.content == content &&
        other.createdAt == createdAt &&
        other.replies == replies;
  }

  @override
  int get hashCode =>
      Object.hash(id, userId, userName, content, createdAt, replies);

  @override
  String toString() {
    return 'AnnouncementComment(id: $id, userId: $userId, userName: $userName, content: $content, createdAt: $createdAt, replies: ${replies.length})';
  }
}

class AnnouncementCommentReply {
  final String id;
  final String userId;
  final String userName;
  final String content;
  final DateTime createdAt;

  const AnnouncementCommentReply({
    required this.id,
    required this.userId,
    required this.userName,
    required this.content,
    required this.createdAt,
  });

  factory AnnouncementCommentReply.fromJson(Map<String, dynamic> json) {
    try {
      // Parse and validate ID
      final id = _parseStringField(json, '_id', 'id');
      if (id.isEmpty) {
        throw FormatException('Comment reply ID cannot be empty');
      }

      // Parse user information
      final userInfo = _parseUserInfo(json['user']);

      // Parse content
      final content = json['content']?.toString() ?? '';
      if (content.isEmpty) {
        throw FormatException('Comment reply content cannot be empty');
      }

      // Parse and validate createdAt
      final createdAt = _parseDateTime(json['createdAt'], 'createdAt');

    return AnnouncementCommentReply(
        id: id,
        userId: userInfo['userId']!,
        userName: userInfo['userName']!,
        content: content,
        createdAt: createdAt,
      );
    } catch (e, stackTrace) {
      print('Error parsing AnnouncementCommentReply: $e');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': userId,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AnnouncementCommentReply &&
        other.id == id &&
        other.userId == userId &&
        other.userName == userName &&
        other.content == content &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode => Object.hash(id, userId, userName, content, createdAt);

  @override
  String toString() {
    return 'AnnouncementCommentReply(id: $id, userId: $userId, userName: $userName, content: $content, createdAt: $createdAt)';
  }
}

class AnnouncementMedia {
  final List<String> images;
  final List<String> documents;
  final List<String> videos;

  const AnnouncementMedia({
    required this.images,
    required this.documents,
    required this.videos,
  });

  factory AnnouncementMedia.fromJson(Map<String, dynamic> json) {
    try {
      final images = _parseStringList(json['images']);
      final documents = _parseStringList(json['documents']);
      final videos = _parseStringList(json['videos']);

    return AnnouncementMedia(
        images: images,
        documents: documents,
        videos: videos,
    );
    } catch (e, stackTrace) {
      print('Error parsing AnnouncementMedia: $e');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'images': images,
      'documents': documents,
      'videos': videos,
    };
  }

  // Helper getters
  bool get hasImages => images.isNotEmpty;
  bool get hasDocuments => documents.isNotEmpty;
  bool get hasVideos => videos.isNotEmpty;
  bool get hasMedia => hasImages || hasDocuments || hasVideos;
  int get totalMediaCount => images.length + documents.length + videos.length;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AnnouncementMedia &&
        other.images == images &&
        other.documents == documents &&
        other.videos == videos;
  }

  @override
  int get hashCode => Object.hash(images, documents, videos);

  @override
  String toString() {
    return 'AnnouncementMedia(images: ${images.length}, documents: ${documents.length}, videos: ${videos.length})';
  }
}

class AnnouncementsResponse {
  final List<Announcement> announcements;
  final AnnouncementsPagination pagination;

  AnnouncementsResponse({
    required this.announcements,
    required this.pagination,
  });

  factory AnnouncementsResponse.fromJson(Map<String, dynamic> json) {
    final announcementsList = json['announcements'] as List<dynamic>? ?? [];

    final announcements = announcementsList.asMap().entries.map((entry) {
      final index = entry.key;
      final announcement = entry.value;
      try {
        final result = Announcement.fromJson(announcement);
        return result;
      } catch (e, stackTrace) {
        print('Error parsing announcement at index $index: $e');
        print('Stack trace: $stackTrace');
        print('Announcement data: $announcement');
        rethrow;
      }
    }).toList();

    final pagination =
        AnnouncementsPagination.fromJson(json['pagination'] ?? {});

    return AnnouncementsResponse(
      announcements: announcements,
      pagination: pagination,
    );
  }
}

class AnnouncementsPagination {
  final int page;
  final int limit;
  final int total;
  final int pages;

  AnnouncementsPagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  factory AnnouncementsPagination.fromJson(Map<String, dynamic> json) {
    return AnnouncementsPagination(
      page: _parseInt(json['page'], 1),
      limit: _parseInt(json['limit'], 20),
      total: _parseInt(json['total'], 0),
      pages: _parseInt(json['pages'], 0),
    );
  }
}
