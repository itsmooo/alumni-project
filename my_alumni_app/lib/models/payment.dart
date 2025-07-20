import '../utils/string_extensions.dart';
import 'event.dart';

class Payment {
  final String id;
  final String userId;
  final String type;
  final String purpose;
  final double amount;
  final String currency;
  final String paymentMethod;
  final PaymentDetails paymentDetails;
  final String status;
  final RelatedEntity? relatedEntity;
  final Receipt receipt;
  final Refund? refund;
  final PaymentMetadata metadata;
  final String? notes;
  final DateTime? processedAt;
  final String? failureReason;
  final DateTime createdAt;
  final DateTime updatedAt;

  Payment({
    required this.id,
    required this.userId,
    required this.type,
    required this.purpose,
    required this.amount,
    required this.currency,
    required this.paymentMethod,
    required this.paymentDetails,
    required this.status,
    this.relatedEntity,
    required this.receipt,
    this.refund,
    required this.metadata,
    this.notes,
    this.processedAt,
    this.failureReason,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['_id'] ?? json['id'],
      userId:
          json['user'] is String ? json['user'] : json['user']?['_id'] ?? '',
      type: json['type'] ?? '',
      purpose: json['purpose'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      paymentMethod: json['paymentMethod'] ?? '',
      paymentDetails: PaymentDetails.fromJson(json['paymentDetails'] ?? {}),
      status: json['status'] ?? 'pending',
      relatedEntity: json['relatedEntity'] != null
          ? RelatedEntity.fromJson(json['relatedEntity'])
          : null,
      receipt: Receipt.fromJson(json['receipt'] ?? {}),
      refund: json['refund'] != null ? Refund.fromJson(json['refund']) : null,
      metadata: PaymentMetadata.fromJson(json['metadata'] ?? {}),
      notes: json['notes'],
      processedAt: json['processedAt'] != null
          ? DateTime.parse(json['processedAt'])
          : null,
      failureReason: json['failureReason'],
      createdAt:
          DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt:
          DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type,
      'purpose': purpose,
      'amount': amount,
      'currency': currency,
      'paymentMethod': paymentMethod,
      'paymentDetails': paymentDetails.toJson(),
      'status': status,
      'relatedEntity': relatedEntity?.toJson(),
      'receipt': receipt.toJson(),
      'refund': refund?.toJson(),
      'metadata': metadata.toJson(),
      'notes': notes,
      'processedAt': processedAt?.toIso8601String(),
      'failureReason': failureReason,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Helper getters
  bool get isCompleted => status == 'completed';
  bool get isPending => status == 'pending';
  bool get isProcessing => status == 'processing';
  bool get isFailed => status == 'failed';
  bool get isCancelled => status == 'cancelled';
  bool get isRefunded => status == 'refunded';
  bool get isMobileMoney => ['hormuud', 'zaad'].contains(paymentMethod);
  bool get isCardPayment => paymentMethod == 'card';
  String get formattedAmount => '$currency ${amount.toStringAsFixed(2)}';
  String get statusDisplay => status.capitalize();
}

class PaymentDetails {
  final String? phoneNumber;
  final String? transactionId;
  final String? cardLast4;
  final String? cardBrand;
  final String? paypalTransactionId;
  final String? paypalPayerId;
  final String? bankReference;
  final String? stripePaymentIntentId;
  final String? paypalOrderId;

  PaymentDetails({
    this.phoneNumber,
    this.transactionId,
    this.cardLast4,
    this.cardBrand,
    this.paypalTransactionId,
    this.paypalPayerId,
    this.bankReference,
    this.stripePaymentIntentId,
    this.paypalOrderId,
  });

  factory PaymentDetails.fromJson(Map<String, dynamic> json) {
    return PaymentDetails(
      phoneNumber: json['phoneNumber'],
      transactionId: json['transactionId'],
      cardLast4: json['cardLast4'],
      cardBrand: json['cardBrand'],
      paypalTransactionId: json['paypalTransactionId'],
      paypalPayerId: json['paypalPayerId'],
      bankReference: json['bankReference'],
      stripePaymentIntentId: json['stripePaymentIntentId'],
      paypalOrderId: json['paypalOrderId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'phoneNumber': phoneNumber,
      'transactionId': transactionId,
      'cardLast4': cardLast4,
      'cardBrand': cardBrand,
      'paypalTransactionId': paypalTransactionId,
      'paypalPayerId': paypalPayerId,
      'bankReference': bankReference,
      'stripePaymentIntentId': stripePaymentIntentId,
      'paypalOrderId': paypalOrderId,
    };
  }
}

class RelatedEntity {
  final String entityType;
  final String entityId;

  RelatedEntity({
    required this.entityType,
    required this.entityId,
  });

  factory RelatedEntity.fromJson(Map<String, dynamic> json) {
    return RelatedEntity(
      entityType: json['entityType'] ?? '',
      entityId: json['entityId'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'entityType': entityType,
      'entityId': entityId,
    };
  }
}

class Receipt {
  final String receiptNumber;
  final DateTime? issuedAt;
  final String? downloadUrl;

  Receipt({
    required this.receiptNumber,
    this.issuedAt,
    this.downloadUrl,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    return Receipt(
      receiptNumber: json['receiptNumber'] ?? '',
      issuedAt:
          json['issuedAt'] != null ? DateTime.parse(json['issuedAt']) : null,
      downloadUrl: json['downloadUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'receiptNumber': receiptNumber,
      'issuedAt': issuedAt?.toIso8601String(),
      'downloadUrl': downloadUrl,
    };
  }
}

class Refund {
  final double amount;
  final String reason;
  final DateTime? processedAt;
  final String? refundId;

  Refund({
    required this.amount,
    required this.reason,
    this.processedAt,
    this.refundId,
  });

  factory Refund.fromJson(Map<String, dynamic> json) {
    return Refund(
      amount: (json['amount'] ?? 0).toDouble(),
      reason: json['reason'] ?? '',
      processedAt: json['processedAt'] != null
          ? DateTime.parse(json['processedAt'])
          : null,
      refundId: json['refundId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'reason': reason,
      'processedAt': processedAt?.toIso8601String(),
      'refundId': refundId,
    };
  }
}

class PaymentMetadata {
  final String? ipAddress;
  final String? userAgent;
  final String? source;

  PaymentMetadata({
    this.ipAddress,
    this.userAgent,
    this.source,
  });

  factory PaymentMetadata.fromJson(Map<String, dynamic> json) {
    return PaymentMetadata(
      ipAddress: json['ipAddress'],
      userAgent: json['userAgent'],
      source: json['source'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ipAddress': ipAddress,
      'userAgent': userAgent,
      'source': source,
    };
  }
}

// Payment Intent Response
class PaymentIntentResponse {
  final String? clientSecret;
  final String paymentId;
  final String? transactionId;
  final String status;

  PaymentIntentResponse({
    this.clientSecret,
    required this.paymentId,
    this.transactionId,
    required this.status,
  });

  factory PaymentIntentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentIntentResponse(
      clientSecret: json['clientSecret'],
      paymentId: json['paymentId'] ?? '',
      transactionId: json['transactionId'],
      status: json['status'] ?? '',
    );
  }
}

// Payments Response with pagination
class PaymentsResponse {
  final List<Payment> payments;
  final PaginationInfo pagination;

  PaymentsResponse({
    required this.payments,
    required this.pagination,
  });

  factory PaymentsResponse.fromJson(Map<String, dynamic> json) {
    return PaymentsResponse(
      payments: (json['payments'] as List<dynamic>?)
              ?.map((e) => Payment.fromJson(e))
              .toList() ??
          [],
      pagination: PaginationInfo.fromJson(json['pagination'] ?? {}),
    );
  }
}

// Payment Request
class PaymentRequest {
  final double amount;
  final String currency;
  final String type;
  final String purpose;
  final String paymentMethod;
  final String? phoneNumber;
  final String? relatedEntityId;
  final String? relatedEntityType;

  PaymentRequest({
    required this.amount,
    required this.currency,
    required this.type,
    required this.purpose,
    required this.paymentMethod,
    this.phoneNumber,
    this.relatedEntityId,
    this.relatedEntityType,
  });

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'currency': currency,
      'type': type,
      'purpose': purpose,
      'paymentMethod': paymentMethod,
      if (phoneNumber != null) 'phoneNumber': phoneNumber,
      if (relatedEntityId != null) 'relatedEntityId': relatedEntityId,
      if (relatedEntityType != null) 'relatedEntityType': relatedEntityType,
    };
  }
}

// Payment types
class PaymentTypes {
  static const String membership = 'membership';
  static const String donation = 'donation';
  static const String eventTicket = 'event_ticket';
  static const String merchandise = 'merchandise';

  static const List<String> all = [
    membership,
    donation,
    eventTicket,
    merchandise,
  ];
}

// Payment methods
class PaymentMethods {
  static const String card = 'card';
  static const String hormuud = 'hormuud';
  static const String zaad = 'zaad';
  static const String paypal = 'paypal';
  static const String bankTransfer = 'bank_transfer';

  static const List<String> all = [
    card,
    hormuud,
    zaad,
    paypal,
    bankTransfer,
  ];

  static const List<String> mobileMoney = [
    hormuud,
    zaad,
  ];

  static const List<String> online = [
    card,
    paypal,
  ];
}

// Payment statuses
class PaymentStatuses {
  static const String pending = 'pending';
  static const String processing = 'processing';
  static const String completed = 'completed';
  static const String failed = 'failed';
  static const String cancelled = 'cancelled';
  static const String refunded = 'refunded';

  static const List<String> all = [
    pending,
    processing,
    completed,
    failed,
    cancelled,
    refunded,
  ];
}
