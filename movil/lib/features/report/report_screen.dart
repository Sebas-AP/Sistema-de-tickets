import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/constants/app_strings.dart';
import '../../data/repositories/ticket_repository.dart';
import '../../routes/app_router.dart';
import 'widgets/category_grid.dart';
import 'widgets/description_field.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  int? _selectedCategory;
  final _descController = TextEditingController();
  String? _imagePath;
  final _repo = TicketRepository();

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.camera);
    if (file != null) setState(() => _imagePath = file.path);
  }

  void _submit() {
    if (_descController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor describe el problema')),
      );
      return;
    }
    _repo.create(
      description: _descController.text.trim(),
      imagePath: _imagePath,
    );
    Navigator.pushNamedAndRemoveUntil(
      context, AppRouter.confirmation, (r) => r.settings.name == '/',
    );
  }

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.helloUser),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(AppStrings.whatsWrong, style: AppTextStyles.heading),
              const SizedBox(height: 20),
              CategoryGrid(
                selected: _selectedCategory,
                onSelect: (i) => setState(() => _selectedCategory = i),
              ),
              const SizedBox(height: 24),
              Text(AppStrings.description, style: AppTextStyles.subheading),
              const SizedBox(height: 8),
              DescriptionField(
                controller: _descController,
                imagePath: _imagePath,
                onPickImage: _pickImage,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _submit,
                child: const Text(AppStrings.sendReport),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
