import 'package:supabase_flutter/supabase_flutter.dart';

class OtroIncidenteDatasource {
  final _client = Supabase.instance.client;
  static const _table = 'Otros_incidentes';

  Future<void> insert({
    required int userId,
    required String departamento,
    required String status,
    required String categoria,
    required String descripcion,
    required String prioridad,
    required int agente,
  }) async {
    await _client.from(_table).insert({
      'Usuario_ID':  userId,
      'Departamento': departamento,
      'Status':      status,
      'Categoria':   categoria,
      'Fecha':       DateTime.now().toUtc().toIso8601String(),
      'Descripcion': descripcion,
      'Prioridad':   prioridad,
      'Agente':      agente,
    });
  }
}
