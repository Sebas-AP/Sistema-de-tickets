import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/ticket_model.dart';
import 'conversacion_datasource.dart';

class TicketListDatasource {
  final _client = Supabase.instance.client;
  final _conversacion = ConversacionDatasource();

  Future<List<TicketModel>> getActiveTickets(int userId) async {
    final results = await Future.wait([
      _getFromTickets(userId),
      _getFromOtrosIncidentes(userId),
    ]);
    final all = [...results[0], ...results[1]];
    all.sort((a, b) => b.date.compareTo(a.date));
    return all;
  }

  Future<List<TicketModel>> _getFromTickets(int userId) async {
    final attempts = [
      'id, Usuario, Departamento, Status, Incidente_ID, Fecha, Descripcion, Incidentes(Tiempo)',
      'id, Usuario, Departamento, Status, Incidente_ID, Fecha, Descripcion',
    ];

    for (final cols in attempts) {
      try {
        final res = await _client
            .from('Tickets')
            .select(cols)
            .eq('Usuario', userId)
            .order('Fecha', ascending: false);
        final tickets = res.map<TicketModel>((r) {
          final inc = r['Incidentes'];
          return TicketModel(
            id:          r['id'] as int,
            userId:      r['Usuario'] as int,
            departamento: r['Departamento'] as String? ?? '',
            description: r['Descripcion'] as String? ?? '',
            status:      r['Status'] as String? ?? 'pending',
            date:        DateTime.parse(r['Fecha'] as String).toLocal(),
            incidenteId: r['Incidente_ID'] as int?,
            tiempo:      (inc is Map) ? inc['Tiempo'] as String? : null,
            source:      TicketSource.tickets,
          );
        }).toList();

        final ids = tickets.map((t) => t.id).toList();
        final comments = await _conversacion.getLastComments(ids);
        return tickets.map((t) => TicketModel(
          id:             t.id,
          userId:         t.userId,
          departamento:   t.departamento,
          description:    t.description,
          status:         t.status,
          date:           t.date,
          incidenteId:    t.incidenteId,
          tiempo:         t.tiempo,
          lastComment:    comments[t.id]?.mensaje,
          lastCommentDate: comments[t.id]?.fechaPublicacion,
          source:         TicketSource.tickets,
        )).toList();
      } catch (e) {
        debugPrint('=== Tickets query cols=$cols FAILED: $e');
      }
    }
    return [];
  }

  Future<List<TicketModel>> _getFromOtrosIncidentes(int userId) async {
    try {
      final res = await _client
          .from('Otros_incidentes')
          .select('id, Usuario_ID, Departamento, Status, Categoria, Fecha, Descripcion, Prioridad, Agente')
          .eq('Usuario_ID', userId)
          .neq('Status', 'Terminado')
          .order('Fecha', ascending: false);
      return res.map((r) => TicketModel(
        id:          r['id'] as int,
        userId:      r['Usuario_ID'] as int,
        departamento: r['Departamento'] as String? ?? '',
        description: r['Descripcion'] as String? ?? '',
        status:      r['Status'] as String? ?? 'pending',
        date:        DateTime.parse(r['Fecha'] as String).toLocal(),
        categoria:   r['Categoria'] as String?,
        prioridad:   r['Prioridad'] as String?,
        agente:      (r['Agente'] as num?)?.toInt(),
        source:      TicketSource.otrosIncidentes,
      )).toList();
    } catch (e) {
      debugPrint('=== error fetching Otros_incidentes: $e');
      return [];
    }
  }

  Future<TicketModel?> getTicketById(int id) async {
    try {
      final res = await _client
          .from('Tickets')
          .select('id, Usuario, Departamento, Status, Incidente_ID, Fecha, Descripcion')
          .eq('id', id)
          .maybeSingle();
      if (res == null) return null;
      return TicketModel(
        id:          res['id'] as int,
        userId:      res['Usuario'] as int,
        departamento: res['Departamento'] as String? ?? '',
        description: res['Descripcion'] as String? ?? '',
        status:      res['Status'] as String? ?? 'pending',
        date:        DateTime.parse(res['Fecha'] as String).toLocal(),
        incidenteId: res['Incidente_ID'] as int?,
        source:      TicketSource.tickets,
      );
    } catch (e) {
      debugPrint('=== getTicketById error: $e');
      return null;
    }
  }
}
