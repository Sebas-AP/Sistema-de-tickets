enum TicketStatus { pending, inProcess, blocked }

class TicketModel {
  final String id;
  final String sentBy;
  final DateTime date;
  final String attendedBy;
  final TicketStatus status;
  final String description;
  final String? response;
  final String? imagePath;

  const TicketModel({
    required this.id,
    required this.sentBy,
    required this.date,
    required this.attendedBy,
    required this.status,
    required this.description,
    this.response,
    this.imagePath,
  });

  String get statusLabel {
    switch (status) {
      case TicketStatus.pending:   return 'Pendiente';
      case TicketStatus.inProcess: return 'En proceso';
      case TicketStatus.blocked:   return 'Bloqueado';
    }
  }

  TicketModel copyWith({
    String? id,
    String? sentBy,
    DateTime? date,
    String? attendedBy,
    TicketStatus? status,
    String? description,
    String? response,
    String? imagePath,
  }) {
    return TicketModel(
      id:          id          ?? this.id,
      sentBy:      sentBy      ?? this.sentBy,
      date:        date        ?? this.date,
      attendedBy:  attendedBy  ?? this.attendedBy,
      status:      status      ?? this.status,
      description: description ?? this.description,
      response:    response    ?? this.response,
      imagePath:   imagePath   ?? this.imagePath,
    );
  }
}
