class Job {
  final String id;
  final String title;
  final String description;
  final String type;
  final String category;
  final String experienceLevel;
  final JobCompany company;
  final JobLocation location;
  final JobSalary salary;
  final List<String> requirements;
  final List<String> benefits;
  final String status;
  final bool featured;
  final bool isRemote;
  final DateTime? expiresAt;
  final JobAuthor postedBy;
  final int views;
  final int applicationCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> questionnaire;

  Job({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.category,
    required this.experienceLevel,
    required this.company,
    required this.location,
    required this.salary,
    required this.requirements,
    required this.benefits,
    required this.status,
    required this.featured,
    required this.isRemote,
    this.expiresAt,
    required this.postedBy,
    required this.views,
    required this.applicationCount,
    required this.createdAt,
    required this.updatedAt,
    required this.questionnaire,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      type: json['type'] ?? '',
      category: json['category'] ?? '',
      experienceLevel: json['experienceLevel'] ?? '',
      company: JobCompany.fromJson(json['company'] ?? {}),
      location: JobLocation.fromJson(json['location'] ?? {}),
      salary: JobSalary.fromJson(json['salary'] ?? {}),
      requirements: List<String>.from(json['requirements'] ?? []),
      benefits: List<String>.from(json['benefits'] ?? []),
      status: json['status'] ?? 'active',
      featured: json['featured'] ?? false,
      isRemote: json['isRemote'] ?? false,
      expiresAt:
          json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      postedBy: JobAuthor.fromJson(json['postedBy'] ?? {}),
      views: json['views'] ?? 0,
      applicationCount: json['applicationCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      questionnaire: (json['questionnaire'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'category': category,
      'experienceLevel': experienceLevel,
      'company': company.toJson(),
      'location': location.toJson(),
      'salary': salary.toJson(),
      'requirements': requirements,
      'benefits': benefits,
      'status': status,
      'featured': featured,
      'isRemote': isRemote,
      'expiresAt': expiresAt?.toIso8601String(),
      'postedBy': postedBy.toJson(),
      'views': views,
      'applicationCount': applicationCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'questionnaire': questionnaire,
    };
  }

  String get typeDisplayName {
    switch (type) {
      case 'full-time':
        return 'Full Time';
      case 'part-time':
        return 'Part Time';
      case 'contract':
        return 'Contract';
      case 'internship':
        return 'Internship';
      case 'volunteer':
        return 'Volunteer';
      default:
        return type;
    }
  }

  String get categoryDisplayName {
    switch (category) {
      case 'technology':
        return 'Technology';
      case 'healthcare':
        return 'Healthcare';
      case 'finance':
        return 'Finance';
      case 'education':
        return 'Education';
      case 'marketing':
        return 'Marketing';
      case 'sales':
        return 'Sales';
      case 'operations':
        return 'Operations';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  }

  String get experienceLevelDisplayName {
    switch (experienceLevel) {
      case 'entry':
        return 'Entry Level';
      case 'mid':
        return 'Mid Level';
      case 'senior':
        return 'Senior Level';
      case 'executive':
        return 'Executive';
      default:
        return experienceLevel;
    }
  }

  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  bool get isActive {
    return status == 'active' && !isExpired;
  }

  String get locationDisplay {
    if (isRemote) {
      return 'Remote';
    }
    if (location.city.isNotEmpty && location.country.isNotEmpty) {
      return '${location.city}, ${location.country}';
    } else if (location.city.isNotEmpty) {
      return location.city;
    } else if (location.country.isNotEmpty) {
      return location.country;
    }
    return 'Location not specified';
  }

  String get salaryDisplay {
    if (salary.min == null && salary.max == null) {
      return 'Salary not specified';
    }

    if (salary.min != null && salary.max != null) {
      return '\$${salary.min!.toStringAsFixed(0)} - \$${salary.max!.toStringAsFixed(0)} ${salary.currency}';
    } else if (salary.min != null) {
      return 'From \$${salary.min!.toStringAsFixed(0)} ${salary.currency}';
    } else {
      return 'Up to \$${salary.max!.toStringAsFixed(0)} ${salary.currency}';
    }
  }
}

class JobCompany {
  final String name;
  final String? logo;
  final String? website;
  final String? description;
  final JobLocation location;

  JobCompany({
    required this.name,
    this.logo,
    this.website,
    this.description,
    required this.location,
  });

  factory JobCompany.fromJson(Map<String, dynamic> json) {
    return JobCompany(
      name: json['name'] ?? '',
      logo: json['logo'],
      website: json['website'],
      description: json['description'],
      location: JobLocation.fromJson(json['location'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'logo': logo,
      'website': website,
      'description': description,
      'location': location.toJson(),
    };
  }
}

class JobLocation {
  final String city;
  final String country;
  final bool isRemote;
  final double? latitude;
  final double? longitude;

  JobLocation({
    required this.city,
    required this.country,
    required this.isRemote,
    this.latitude,
    this.longitude,
  });

  factory JobLocation.fromJson(Map<String, dynamic> json) {
    return JobLocation(
      city: json['city'] ?? '',
      country: json['country'] ?? '',
      isRemote: json['isRemote'] ?? false,
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'city': city,
      'country': country,
      'isRemote': isRemote,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

class JobSalary {
  final double? min;
  final double? max;
  final String currency;
  final String period;

  JobSalary({
    this.min,
    this.max,
    required this.currency,
    required this.period,
  });

  factory JobSalary.fromJson(Map<String, dynamic> json) {
    return JobSalary(
      min: json['min']?.toDouble(),
      max: json['max']?.toDouble(),
      currency: json['currency'] ?? 'USD',
      period: json['period'] ?? 'year',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'min': min,
      'max': max,
      'currency': currency,
      'period': period,
    };
  }
}

class JobAuthor {
  final String id;
  final String firstName;
  final String lastName;
  final String? email;

  JobAuthor({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.email,
  });

  factory JobAuthor.fromJson(Map<String, dynamic> json) {
    return JobAuthor(
      id: json['_id'] ?? json['id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
    };
  }

  String get fullName => '$firstName $lastName';
}

class JobsResponse {
  final List<Job> jobs;
  final JobsPagination pagination;

  JobsResponse({
    required this.jobs,
    required this.pagination,
  });

  factory JobsResponse.fromJson(Map<String, dynamic> json) {
    return JobsResponse(
      jobs: (json['jobs'] as List<dynamic>? ?? [])
          .map((job) => Job.fromJson(job))
          .toList(),
      pagination: JobsPagination.fromJson(json['pagination'] ?? {}),
    );
  }
}

class JobsPagination {
  final int page;
  final int limit;
  final int total;
  final int pages;

  JobsPagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  factory JobsPagination.fromJson(Map<String, dynamic> json) {
    return JobsPagination(
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      total: json['total'] ?? 0,
      pages: json['pages'] ?? 0,
    );
  }
}
