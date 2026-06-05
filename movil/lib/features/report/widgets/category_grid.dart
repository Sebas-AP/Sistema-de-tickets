import 'package:flutter/material.dart';
import '../../../core/constants/app_strings.dart';
import 'category_card.dart';

class CategoryGrid extends StatelessWidget {
  final int? selected;
  final ValueChanged<int> onSelect;

  const CategoryGrid({
    super.key,
    required this.selected,
    required this.onSelect,
  });

  static const _categories = [
    (AppStrings.catScreen,   Icons.monitor_outlined),
    (AppStrings.catKeyboard, Icons.keyboard_outlined),
    (AppStrings.catNetwork,  Icons.wifi_outlined),
    (AppStrings.catPower,    Icons.power_settings_new_outlined),
    (AppStrings.catCat,      Icons.pets_outlined),
    (AppStrings.catOther,    Icons.build_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1,
      ),
      itemBuilder: (_, i) => CategoryCard(
        label: _categories[i].$1,
        icon: _categories[i].$2,
        isSelected: selected == i,
        onTap: () => onSelect(i),
      ),
    );
  }
}
