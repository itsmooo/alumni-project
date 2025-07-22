class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String role;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final String? profilePicture;
  final String? photo; // <-- Add this
  final UserProfile? profile;
  final UserPreferences? preferences;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.role,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    this.profilePicture,
    this.photo,
    this.profile,
    this.preferences,
  });

  String get fullName => '$firstName $lastName';

  String? get displayProfilePicture {
    if (photo != null && photo!.isNotEmpty) return photo;
    return profilePicture;
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'alumni',
      isEmailVerified: json['isEmailVerified'] ?? false,
      isPhoneVerified: json['isPhoneVerified'] ?? false,
      profilePicture: json['profilePicture'],
      photo: json['photo'],
      profile: json['profile'] != null
          ? UserProfile.fromJson(json['profile'])
          : null,
      preferences: json['preferences'] != null
          ? UserPreferences.fromJson(json['preferences'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'role': role,
      'isEmailVerified': isEmailVerified,
      'isPhoneVerified': isPhoneVerified,
      'profilePicture': profilePicture,
      'photo': photo,
      'profile': profile?.toJson(),
      'preferences': preferences?.toJson(),
    };
  }
}

class UserProfile {
  final int? graduationYear;
  final String? degree;
  final String? major;
  final String? profession;
  final String? company;
  final UserLocation? location;
  final String? bio;
  final String? profilePicture;
  final Map<String, String>? socialLinks;
  final List<String>? skills;
  final List<String>? interests;

  UserProfile({
    this.graduationYear,
    this.degree,
    this.major,
    this.profession,
    this.company,
    this.location,
    this.bio,
    this.profilePicture,
    this.socialLinks,
    this.skills,
    this.interests,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      graduationYear: json['graduationYear'],
      degree: json['degree'],
      major: json['major'],
      profession: json['profession'],
      company: json['company'],
      location: json['location'] != null
          ? UserLocation.fromJson(json['location'])
          : null,
      bio: json['bio'],
      profilePicture: json['profilePicture'],
      socialLinks: json['socialLinks'] != null
          ? Map<String, String>.from(json['socialLinks'])
          : null,
      skills: json['skills'] != null ? List<String>.from(json['skills']) : null,
      interests: json['interests'] != null
          ? List<String>.from(json['interests'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'graduationYear': graduationYear,
      'degree': degree,
      'major': major,
      'profession': profession,
      'company': company,
      'location': location?.toJson(),
      'bio': bio,
      'profilePicture': profilePicture,
      'socialLinks': socialLinks,
      'skills': skills,
      'interests': interests,
    };
  }
}

class UserLocation {
  final String? city;
  final String? country;
  final UserCoordinates? coordinates;

  UserLocation({
    this.city,
    this.country,
    this.coordinates,
  });

  factory UserLocation.fromJson(Map<String, dynamic> json) {
    return UserLocation(
      city: json['city'],
      country: json['country'],
      coordinates: json['coordinates'] != null
          ? UserCoordinates.fromJson(json['coordinates'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'city': city,
      'country': country,
      'coordinates': coordinates?.toJson(),
    };
  }
}

class UserCoordinates {
  final double? lat;
  final double? lng;

  UserCoordinates({
    this.lat,
    this.lng,
  });

  factory UserCoordinates.fromJson(Map<String, dynamic> json) {
    return UserCoordinates(
      lat: json['lat']?.toDouble(),
      lng: json['lng']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lng': lng,
    };
  }
}

class UserPreferences {
  final UserPrivacySettings privacy;
  final bool emailNotifications;
  final bool smsNotifications;
  final bool pushNotifications;

  UserPreferences({
    required this.privacy,
    required this.emailNotifications,
    required this.smsNotifications,
    required this.pushNotifications,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      privacy: json['privacy'] != null
          ? UserPrivacySettings.fromJson(json['privacy'])
          : UserPrivacySettings(),
      emailNotifications: json['emailNotifications'] ?? true,
      smsNotifications: json['smsNotifications'] ?? true,
      pushNotifications: json['pushNotifications'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'privacy': privacy.toJson(),
      'emailNotifications': emailNotifications,
      'smsNotifications': smsNotifications,
      'pushNotifications': pushNotifications,
    };
  }
}

class UserPrivacySettings {
  final bool showEmail;
  final bool showPhone;
  final bool showLocation;

  UserPrivacySettings({
    this.showEmail = true,
    this.showPhone = true,
    this.showLocation = true,
  });

  factory UserPrivacySettings.fromJson(Map<String, dynamic> json) {
    return UserPrivacySettings(
      showEmail: json['showEmail'] ?? true,
      showPhone: json['showPhone'] ?? true,
      showLocation: json['showLocation'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'showEmail': showEmail,
      'showPhone': showPhone,
      'showLocation': showLocation,
    };
  }
}
