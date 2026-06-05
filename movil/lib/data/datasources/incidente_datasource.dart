import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class IncidenteItem {
  final int id;
  final String incidente;
  final String tiempo;
  final int? agenteId;
  final String? prioridad;
  IncidenteItem({
    required this.id,
    required this.incidente,
    required this.tiempo,
    this.agenteId,
    this.prioridad,
  });
}

class IncidenteDatasource {
  final _client = Supabase.instance.client;
  static const _table = 'Incidentes';

  Future<List<String>> getCategorias() async {
    final res = await _client.from(_table).select('Categoria');
    final categorias = res.map((r) => r['Categoria'] as String).toSet().toList();
    categorias.sort();
    return categorias;
  }

  Future<List<IncidenteItem>> getIncidentesPorCategoria(String categoria) async {
    final attempts = <String>[
      'id, Incidente, Tiempo, Agente, Prioridad',
      'id, Incidente, Tiempo, Prioridad',
      'id, Incidente, Tiempo, Agente',
      'id, Incidente, Tiempo',
    ];

    for (final cols in attempts) {
      try {
        final res = await _client
            .from(_table)
            .select(cols)
            .eq('Categoria', categoria);
        debugPrint('[IncidenteDatasource] cols=$cols -> ${res.length} rows');
        return res.map((r) {
          final agente = r['Agente'];
          return IncidenteItem(
            id:        r['id'] as int,
            incidente: r['Incidente'] as String,
            tiempo:    r['Tiempo'] as String,
            agenteId:  agente is num ? agente.toInt() : null,
            prioridad: r['Prioridad'] as String?,
          );
        }).toList();
      } catch (e) {
        debugPrint('[IncidenteDatasource] cols=$cols FAILED: $e');
      }
    }
    return [];
  }
}
