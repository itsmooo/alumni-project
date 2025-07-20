class Event {
  final String id;
  final String title;
  final String description;
  final String type;
  final EventDate date;
  final EventLocation location;
  final String organizerId;
  final OrganizerInfo? organizer;
  final int? capacity;
  final EventRegistration registration;
  final List<EventAttendee> attendees;
  final List<String> images;
  final List<String> tags;
  final bool isPublic;
  final String status;
  final List<EventReminder> reminders;
  final DateTime createdAt;
  final DateTime updatedAt;

  Event({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.date,
    required this.location,
    required this.organizerId,
    this.organizer,
    this.capacity,
    required this.registration,
    required this.attendees,
    required this.images,
    required this.tags,
    required this.isPublic,
    required this.status,
    required this.reminders,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['_id'] ?? json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      type: json['type'] ?? '',
      date: EventDate.fromJson(json['date'] ?? {}),
      location: EventLocation.fromJson(json['location'] ?? {}),
      organizerId: json['organizer'] is String
          ? json['organizer']
          : json['organizer']?['_id'] ?? '',
      organizer: json['organizer'] is Map
          ? OrganizerInfo.fromJson(json['organizer'])
          : null,
      capacity: json['capacity'],
      registration: EventRegistration.fromJson(json['registration'] ?? {}),
      attendees: (json['attendees'] as List<dynamic>?)
              ?.map((e) => EventAttendee.fromJson(e))
              .toList() ??
          [],
      images: List<String>.from(json['images'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      isPublic: json['isPublic'] ?? true,
      status: json['status'] ?? 'draft',
      reminders: (json['reminders'] as List<dynamic>?)
              ?.map((e) => EventReminder.fromJson(e))
              .toList() ??
          [],
      createdAt:
          DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt:
          DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'date': date.toJson(),
      'location': location.toJson(),
      'organizerId': organizerId,
      'organizer': organizer?.toJson(),
      'capacity': capacity,
      'registration': registration.toJson(),
      'attendees': attendees.map((e) => e.toJson()).toList(),
      'images': images,
      'tags': tags,
      'isPublic': isPublic,
      'status': status,
      'reminders': reminders.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  int get attendeeCount =>
      attendees.where((a) => a.status == 'registered').length;
  bool get isUpcoming => date.start.isAfter(DateTime.now());
  bool get isPast => date.end.isBefore(DateTime.now());
  bool get isOngoing =>
      date.start.isBefore(DateTime.now()) && date.end.isAfter(DateTime.now());
  bool get isFull => capacity != null && attendeeCount >= capacity!;
  bool get isRegistrationOpen {
    // If registration is not required, it's always open (for free events)
    if (!registration.isRequired) return true;

    // If registration is required, check deadline
    if (registration.deadline == null) return true;

    // Check if deadline has passed
    return registration.deadline!.isAfter(DateTime.now());
  }
}

class EventDate {
  final DateTime start;
  final DateTime end;

  EventDate({
    required this.start,
    required this.end,
  });

  factory EventDate.fromJson(Map<String, dynamic> json) {
    return EventDate(
      start: DateTime.parse(json['start'] ?? DateTime.now().toIso8601String()),
      end: DateTime.parse(json['end'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'start': start.toIso8601String(),
      'end': end.toIso8601String(),
    };
  }
}

class EventLocation {
  final String type; // physical, virtual, hybrid
  final String? venue;
  final String? address;
  final String? city;
  final String? country;
  final LocationCoordinates? coordinates;
  final String? virtualLink;
  final String? virtualPlatform;

  EventLocation({
    required this.type,
    this.venue,
    this.address,
    this.city,
    this.country,
    this.coordinates,
    this.virtualLink,
    this.virtualPlatform,
  });

  factory EventLocation.fromJson(Map<String, dynamic> json) {
    return EventLocation(
      type: json['type'] ?? 'physical',
      venue: json['venue'],
      address: json['address'],
      city: json['city'],
      country: json['country'],
      coordinates: json['coordinates'] != null
          ? LocationCoordinates.fromJson(json['coordinates'])
          : null,
      virtualLink: json['virtualLink'],
      virtualPlatform: json['virtualPlatform'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'venue': venue,
      'address': address,
      'city': city,
      'country': country,
      'coordinates': coordinates?.toJson(),
      'virtualLink': virtualLink,
      'virtualPlatform': virtualPlatform,
    };
  }
}

class LocationCoordinates {
  final double lat;
  final double lng;

  LocationCoordinates({
    required this.lat,
    required this.lng,
  });

  factory LocationCoordinates.fromJson(Map<String, dynamic> json) {
    return LocationCoordinates(
      lat: (json['lat'] ?? 0).toDouble(),
      lng: (json['lng'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lng': lng,
    };
  }
}

class OrganizerInfo {
  final String id;
  final String firstName;
  final String lastName;

  OrganizerInfo({
    required this.id,
    required this.firstName,
    required this.lastName,
  });

  factory OrganizerInfo.fromJson(Map<String, dynamic> json) {
    return OrganizerInfo(
      id: json['_id'] ?? json['id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
    };
  }

  String get fullName => '$firstName $lastName';
}

class EventRegistration {
  final bool isRequired;
  final DateTime? deadline;
  final EventFee fee;

  EventRegistration({
    required this.isRequired,
    this.deadline,
    required this.fee,
  });

  factory EventRegistration.fromJson(Map<String, dynamic> json) {
    return EventRegistration(
      isRequired: json['isRequired'] ?? true,
      deadline:
          json['deadline'] != null ? DateTime.parse(json['deadline']) : null,
      fee: EventFee.fromJson(json['fee'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'isRequired': isRequired,
      'deadline': deadline?.toIso8601String(),
      'fee': fee.toJson(),
    };
  }
}

class EventFee {
  final double amount;
  final String currency;

  EventFee({
    required this.amount,
    required this.currency,
  });

  factory EventFee.fromJson(Map<String, dynamic> json) {
    return EventFee(
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'currency': currency,
    };
  }

  String get formattedFee => '$currency ${amount.toStringAsFixed(2)}';
  bool get isFree => amount == 0;
}

class EventAttendee {
  final String userId;
  final String status; // registered, attended, cancelled
  final DateTime registeredAt;
  final String paymentStatus; // pending, paid, refunded

  EventAttendee({
    required this.userId,
    required this.status,
    required this.registeredAt,
    required this.paymentStatus,
  });

  factory EventAttendee.fromJson(Map<String, dynamic> json) {
    return EventAttendee(
      userId: json['user'] ?? '',
      status: json['status'] ?? 'registered',
      registeredAt: DateTime.parse(
          json['registeredAt'] ?? DateTime.now().toIso8601String()),
      paymentStatus: json['paymentStatus'] ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': userId,
      'status': status,
      'registeredAt': registeredAt.toIso8601String(),
      'paymentStatus': paymentStatus,
    };
  }
}

class EventReminder {
  final String type; // email, sms, push
  final String timing; // 1hour, 1day, 1week
  final bool sent;

  EventReminder({
    required this.type,
    required this.timing,
    required this.sent,
  });

  factory EventReminder.fromJson(Map<String, dynamic> json) {
    return EventReminder(
      type: json['type'] ?? 'email',
      timing: json['timing'] ?? '1day',
      sent: json['sent'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'timing': timing,
      'sent': sent,
    };
  }
}

class EventsResponse {
  final List<Event> events;
  final PaginationInfo pagination;

  EventsResponse({
    required this.events,
    required this.pagination,
  });

  factory EventsResponse.fromJson(Map<String, dynamic> json) {
    return EventsResponse(
      events: (json['events'] as List<dynamic>?)
              ?.map((e) => Event.fromJson(e))
              .toList() ??
          [],
      pagination: PaginationInfo.fromJson(json['pagination'] ?? {}),
    );
  }
}

class PaginationInfo {
  final int page;
  final int limit;
  final int total;
  final int pages;

  PaginationInfo({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  factory PaginationInfo.fromJson(Map<String, dynamic> json) {
    return PaginationInfo(
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      total: json['total'] ?? 0,
      pages: json['pages'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': page,
      'limit': limit,
      'total': total,
      'pages': pages,
    };
  }
}
