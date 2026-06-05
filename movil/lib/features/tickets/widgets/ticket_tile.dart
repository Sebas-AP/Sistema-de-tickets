import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/time_ago.dart';
import '../../../data/models/ticket_model.dart';

class TicketTile extends StatelessWidget {
  final TicketModel ticket;
  final VoidCallback onTap;

  const TicketTile({super.key, required this.ticket, required this.onTap});

  Color get _statusColor {
    switch (ticket.statusEnum) {
      case TicketStatus.pending:   return AppColors.statusPending;
      case TicketStatus.inProcess: return AppColors.statusProcess;
      case TicketStatus.blocked:   return AppColors.statusBlocked;
      case TicketStatus.finished:  return AppColors.textSecondary;
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
              height: 50,
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
                  Text('Ticket #${ticket.id.toString().padLeft(4, '0')}',
                      style: AppTextStyles.subheading),
                  const SizedBox(height: 2),
                  Text('Estado: ${ticket.statusLabel}',
                      style: AppTextStyles.label.copyWith(
                        color: _statusColor,
                        fontWeight: FontWeight.w600,
                      )),
                  if (ticket.tiempo != null && ticket.tiempo!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text('Tiempo estimado: ${ticket.tiempo}',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textPrimary,
                        )),
                  ],
                  const SizedBox(height: 2),
                  Text(timeAgo(ticket.date),
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textSecondary,
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
