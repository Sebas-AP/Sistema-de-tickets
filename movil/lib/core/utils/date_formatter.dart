import 'package:intl/intl.dart';

class DateFormatter {
  DateFormatter._();

  static String format(DateTime date) {
    return DateFormat('dd/MM/yy').format(date);
  }

  static String formatFull(DateTime date) {
    return DateFormat('dd MMMM yyyy', 'es').format(date);
  }
}
