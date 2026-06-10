import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/conversacion_message.dart';

class ConversacionDatasource {
  final _client = Supabase.instance.client;

  Future<ConversacionMessage?> getLastComment(int ticketId) async {
    try {
      final res = await _client
          .from('Conversaciones')
          .select()
          .eq('incidente_id', ticketId)
          .order('fecha_publicacion', ascending: false)
          .limit(1)
          .maybeSingle();
      if (res == null) return null;
      return ConversacionMessage.fromMap(res);
    } catch (e) {
      debugPrint('=== getLastComment error: $e');
      return null;
    }
  }

  Future<Map<int, ConversacionMessage?>> getLastComments(
      List<int> ticketIds) async {
    if (ticketIds.isEmpty) return {};
    try {
      final res = await _client
          .from('Conversaciones')
          .select()
          .inFilter('incidente_id', ticketIds)
          .order('fecha_publicacion', ascending: false);
      final map = <int, ConversacionMessage?>{};
      for (final r in res) {
        final msg = ConversacionMessage.fromMap(r);
        map.putIfAbsent(msg.incidenteId, () => msg);
      }
      for (final id in ticketIds) {
        map.putIfAbsent(id, () => null);
      }
      return map;
    } catch (e) {
      debugPrint('=== getLastComments error: $e');
      return {};
    }
  }

  Future<List<ConversacionMessage>> getConversacion(int ticketId) async {
    try {
      final res = await _client
          .from('Conversaciones')
          .select()
          .eq('incidente_id', ticketId)
          .order('fecha_publicacion', ascending: true);
      return res.map((r) => ConversacionMessage.fromMap(r)).toList();
    } catch (e, stack) {
      debugPrint('=== getConversacion error: $e\n$stack');
      // Return a fake message with the error so it shows on screen
      return [
        ConversacionMessage(
          id: -1,
          incidenteId: ticketId,
          mensaje: 'ERROR DE CARGA: $e',
          fechaPublicacion: DateTime.now(),
          usuarioId: 0,
        )
      ];
    }
  }
}
