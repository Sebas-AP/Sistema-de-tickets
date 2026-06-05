import 'package:flutter/material.dart';
import '../../../core/constants/app_strings.dart';
import 'category_card.dart';

const List<IconData> _categoryIcons = [
  Icons.monitor_outlined,
  Icons.keyboard_outlined,
  Icons.mouse_outlined,
  Icons.wifi_outlined,
  Icons.power_settings_new_outlined,
  Icons.print_outlined,
  Icons.code_outlined,
  Icons.volume_up_outlined,
  Icons.videocam_outlined,
  Icons.usb_outlined,
  Icons.cable_outlined,
  Icons.storage_outlined,
  Icons.memory_outlined,
  Icons.router_outlined,
  Icons.headphones_outlined,
  Icons.devices_other_outlined,
  Icons.security_outlined,
  Icons.cloud_outlined,
  Icons.phone_iphone_outlined,
  Icons.laptop_chromebook_outlined,
  Icons.scanner_outlined,
  Icons.sim_card_outlined,
  Icons.battery_charging_full_outlined,
  Icons.lightbulb_outline,
  Icons.ac_unit_outlined,
  Icons.settings_input_hdmi_outlined,
];

class CategoryGrid extends StatelessWidget {
  final int? selected;
  final ValueChanged<int> onSelect;
  final List<String> categories;

  const CategoryGrid({
    super.key,
    required this.selected,
    required this.onSelect,
    required this.categories,
  });

  List<String> get _items => [...categories, AppStrings.catOther];

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1,
      ),
      itemBuilder: (_, i) {
        final isOther = i == _items.length - 1;
        return CategoryCard(
          label: _items[i],
          icon: isOther
              ? Icons.build_outlined
              : _categoryIcons[i % _categoryIcons.length],
          isSelected: selected == i,
          onTap: () => onSelect(i),
        );
      },
    );
  }
}
