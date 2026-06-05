import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/ticket_model.dart';

class TicketListDatasource {
  final _client = Supabase.instance.client;

  Future<List<TicketModel>> getActiveTickets() async {
    final results = await Future.wait([
      _getFromTickets(),
      _getFromOtrosIncidentes(),
    ]);
    final all = [...results[0], ...results[1]];
    all.sort((a, b) => b.date.compareTo(a.date));
    return all;
  }

  Future<List<TicketModel>> _getFromTickets() async {
    try {
      final res = await _client
          .from('Tickets')
          .select('id, Usuario, Departamento, Status, Incidente_ID, Fecha, Descripcion, Incidentes(Tiempo)')
          .neq('Status', 'Terminado')
          .order('Fecha', ascending: false);
      return res.map<TicketModel>((r) {
        final inc = r['Incidentes'];
        return TicketModel(
          id:          r['id'] as int,
          userId:      r['Usuario'] as int,
          departamento: r['Departamento'] as String? ?? '',
          description: r['Descripcion'] as String? ?? '',
          status:      r['Status'] as String? ?? 'Pendiente',
          date:        DateTime.parse(r['Fecha'] as String).toLocal(),
          incidenteId: r['Incidente_ID'] as int?,
          tiempo:      (inc is Map) ? inc['Tiempo'] as String? : null,
          source:      TicketSource.tickets,
        );
      }).toList();
    } catch (e) {
      print('=== error fetching Tickets: $e');
      return [];
    }
  }

  Future<List<TicketModel>> _getFromOtrosIncidentes() async {
    try {
      final res = await _client
          .from('Otros_incidentes')
          .select('id, Usuario_ID, Departamento, Status, Categoria, Fecha, Descripcion, Prioridad, Agente')
          .neq('Status', 'Terminado')
          .order('Fecha', ascending: false);
      return res.map((r) => TicketModel(
        id:          r['id'] as int,
        userId:      r['Usuario_ID'] as int,
        departamento: r['Departamento'] as String? ?? '',
        description: r['Descripcion'] as String? ?? '',
        status:      r['Status'] as String? ?? 'Pendiente',
        date:        DateTime.parse(r['Fecha'] as String).toLocal(),
        categoria:   r['Categoria'] as String?,
        prioridad:   r['Prioridad'] as String?,
        agente:      (r['Agente'] as num?)?.toInt(),
        source:      TicketSource.otrosIncidentes,
      )).toList();
    } catch (e) {
      print('=== error fetching Otros_incidentes: $e');
      return [];
    }
  }
}
