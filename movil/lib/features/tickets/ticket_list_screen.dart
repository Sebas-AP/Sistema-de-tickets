import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/constants/app_strings.dart';
import '../../data/repositories/ticket_repository.dart';
import '../../routes/app_router.dart';
import 'widgets/ticket_tile.dart';
import 'widgets/empty_tickets_widget.dart';

class TicketListScreen extends StatelessWidget {
  const TicketListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tickets = TicketRepository().getAll();

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.helloUser),
        leading: const BackButton(),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(44),
          child: Container(
            width: double.infinity,
            color: AppColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Text(
              AppStrings.myTickets,
              style: AppTextStyles.subheading.copyWith(color: AppColors.white),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
      body: tickets.isEmpty
          ? const EmptyTicketsWidget()
          : ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: tickets.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (_, i) => TicketTile(
                ticket: tickets[i],
                onTap: () => Navigator.pushNamed(
                  context,
                  AppRouter.ticketDetail,
                  arguments: tickets[i].id,
                ),
              ),
            ),
    );
  }
}
