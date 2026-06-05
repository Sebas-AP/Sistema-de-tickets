import 'package:supabase_flutter/supabase_flutter.dart';

class TicketSupabaseDatasource {
  final _client = Supabase.instance.client;
  static const _table = 'Tickets';

  Future<void> insert({
    required int userId,
    required int incidenteId,
    required String departamento,
    required String descripcion,
    required int agente,
    required String prioridad,
  }) async {
    await _client.from(_table).insert({
      'Usuario':       userId,
      'Incidente_ID':  incidenteId,
      'Fecha':         DateTime.now().toUtc().toIso8601String(),
      'Departamento':  departamento,
      'Status':        'En proceso',
      'Descripcion':   descripcion,
      'Agente':        agente,
      'Prioridad':     prioridad,
    });
  }
}
