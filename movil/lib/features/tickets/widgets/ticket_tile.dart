import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/models/ticket_model.dart';

class TicketTile extends StatelessWidget {
  final TicketModel ticket;
  final VoidCallback onTap;

  const TicketTile({super.key, required this.ticket, required this.onTap});

  Color get _statusColor {
    switch (ticket.status) {
      case TicketStatus.pending:   return AppColors.statusPending;
      case TicketStatus.inProcess: return AppColors.statusProcess;
      case TicketStatus.blocked:   return AppColors.statusBlocked;
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        color: _statusColor.withValues(alpha: 0.12),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 36,
              decoration: BoxDecoration(
                color: _statusColor,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Ticket ${ticket.id}',
                      style: AppTextStyles.subheading),
                  const SizedBox(height: 2),
                  Text('Estado: ${ticket.statusLabel}',
                      style: AppTextStyles.label.copyWith(
                        color: _statusColor,
                        fontWeight: FontWeight.w600,
                      )),
                ],
              ),
            ),
            Icon(Icons.info_outline_rounded,
                color: AppColors.textSecondary, size: 20),
          ],
        ),
      ),
    );
  }
}
