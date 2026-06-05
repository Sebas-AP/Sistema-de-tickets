import 'dart:io';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';

class DescriptionField extends StatelessWidget {
  final TextEditingController controller;
  final String? imagePath;
  final VoidCallback onPickImage;

  const DescriptionField({
    super.key,
    required this.controller,
    required this.imagePath,
    required this.onPickImage,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: controller,
          maxLines: 5,
          style: AppTextStyles.body,
          decoration: const InputDecoration(
            hintText: AppStrings.descHint,
          ),
        ),
        const SizedBox(height: 8),
        if (imagePath != null) ...[
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(File(imagePath!), height: 120, fit: BoxFit.cover),
          ),
          const SizedBox(height: 8),
        ],
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton.icon(
            onPressed: onPickImage,
            icon: const Icon(Icons.camera_alt_outlined, size: 18,
                color: AppColors.textSecondary),
            label: Text('Adjuntar foto', style: AppTextStyles.label),
          ),
        ),
      ],
    );
  }
}
