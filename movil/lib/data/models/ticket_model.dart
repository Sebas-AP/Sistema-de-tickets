enum TicketStatus { pending, inProcess, blocked, finished }

enum TicketSource { tickets, otrosIncidentes }

class TicketModel {
  final int id;
  final int userId;
  final String departamento;
  final String description;
  final String status;
  final DateTime date;
  final int? incidenteId;
  final String? categoria;
  final String? prioridad;
  final int? agente;
  final String? tiempo;
  final TicketSource source;

  const TicketModel({
    required this.id,
    required this.userId,
    required this.departamento,
    required this.description,
    required this.status,
    required this.date,
    required this.source,
    this.incidenteId,
    this.categoria,
    this.prioridad,
    this.agente,
    this.tiempo,
  });

  TicketStatus get statusEnum {
    switch (status) {
      case 'Pendiente':   return TicketStatus.pending;
      case 'En proceso':  return TicketStatus.inProcess;
      case 'Bloqueado':   return TicketStatus.blocked;
      case 'Terminado':   return TicketStatus.finished;
      default:            return TicketStatus.pending;
    }
  }

  String get statusLabel {
    switch (statusEnum) {
      case TicketStatus.pending:   return 'Pendiente';
      case TicketStatus.inProcess: return 'En proceso';
      case TicketStatus.blocked:   return 'Bloqueado';
      case TicketStatus.finished:  return 'Terminado';
    }
  }
}
