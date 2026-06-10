import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app.dart';
import 'core/services/notification_service.dart';

import 'data/datasources/ticket_list_datasource.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    publishableKey: dotenv.env['SUPABASE_PUBLISHABLE_KEY']!,
  );

  final notificationService = NotificationService();
  await notificationService.init(onPayload: (String? payload) async {
    if (payload != null) {
      final tId = int.tryParse(payload);
      if (tId != null) {
        final ticket = await TicketListDatasource().getTicketById(tId);
        if (ticket != null) {
          navigatorKey.currentState?.pushNamed(
            '/ticket-detail',
            arguments: ticket,
          );
        }
      }
    }
  });
  await notificationService.requestPermissions();

  final prefs = await SharedPreferences.getInstance();
  int lastSeenId = prefs.getInt('last_seen_comment_id') ?? 0;

  if (lastSeenId == 0) {
    try {
      final res = await Supabase.instance.client
          .from('Conversaciones')
          .select('id')
          .order('id', ascending: false)
          .limit(1)
          .maybeSingle();
      if (res != null) {
        lastSeenId = res['id'] as int;
        await prefs.setInt('last_seen_comment_id', lastSeenId);
      }
    } catch (e) {
      debugPrint('Error init lastSeenId: $e');
    }
  }

  Timer.periodic(const Duration(seconds: 15), (timer) async {
    try {
      final int? currentUserId = prefs.getInt('session_user_id');
      if (currentUserId == null) return; // No hay sesión iniciada

      final res = await Supabase.instance.client
          .from('Conversaciones')
          .select()
          .gt('id', lastSeenId)
          .order('id', ascending: true);

      if ((res as List).isEmpty) return;

      final myTickets = await TicketListDatasource().getActiveTickets(currentUserId);
      final myTicketIds = myTickets.map((t) => t.id).toSet();

      for (var row in res) {
        final int id = row['id'] as int;
        if (id > lastSeenId) {
          lastSeenId = id;
          await prefs.setInt('last_seen_comment_id', lastSeenId);
        }

        final int senderId = row['Usuario_ID'] as int;
        final int tId = row['incidente_id'] as int;
        final String msg = row['mensaje']?.toString() ?? 'Nuevo mensaje';

        if (senderId != currentUserId && myTicketIds.contains(tId)) {
          notificationService.showNotification(
            id: id,
            title: 'Nuevo comentario en Ticket #$tId',
            body: msg,
            payload: tId.toString(),
          );
        }
      }
    } catch (e) {
      debugPrint('Error polling comentarios: $e');
    }
  });

  runApp(App(navigatorKey: navigatorKey));
}
