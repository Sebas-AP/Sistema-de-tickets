import 'package:supabase_flutter/supabase_flutter.dart';

class AuthSupabaseDatasource {
  final _client = Supabase.instance.client;

  static const _table = 'Usuarios';

  static bool isValidCompanyEmail(String email) {
    return email.trim().toLowerCase().endsWith('@empresa.com');
  }

  Future<bool> userExists(String usuario) async {
    final res = await _client
        .from(_table)
        .select('id')
        .eq('Usuario', usuario.trim())
        .maybeSingle();
    return res != null;
  }

  Future<String?> getUsernameById(int userId) async {
    final res = await _client
        .from(_table)
        .select('Usuario')
        .eq('id', userId)
        .maybeSingle();
    if (res == null) return null;
    return res['Usuario'] as String?;
  }

  Future<RegisterResult> register({
    required String usuario,
    required String contrasena,
    required String correo,
    required String departamento,
  }) async {
    try {
      if (usuario.trim().isEmpty ||
          contrasena.trim().isEmpty ||
          correo.trim().isEmpty ||
          departamento.trim().isEmpty) {
        return RegisterResult.emptyFields;
      }
      if (usuario.trim().length < 3) return RegisterResult.usernameTooShort;
      if (contrasena.length < 4)     return RegisterResult.passwordTooShort;
      if (!isValidCompanyEmail(correo)) return RegisterResult.invalidEmail;

      final exists = await userExists(usuario.trim());
      if (exists) return RegisterResult.usernameTaken;

      await _client.from(_table).insert({
        'Usuario':      usuario.trim(),
        'Contraseña':   contrasena,
        'Correo':       correo.trim().toLowerCase(),
        'Rol':          'usuario',
        'Departmento':  departamento.trim(),
      });

      return RegisterResult.success;
    } on PostgrestException catch (e) {
      print('=== PostgrestException: code=${e.code} message=${e.message} details=${e.details}');
      if (e.code == '23505') return RegisterResult.usernameTaken;
      return RegisterResult.serverError;
    } catch (e, s) {
      print('=== register catch: $e');
      print('=== stack: $s');
      return RegisterResult.serverError;
    }
  }

  Future<LoginResult> login({
    required String usuario,
    required String contrasena,
  }) async {
    try {
      final res = await _client
          .from(_table)
          .select('id, Usuario, Rol, Departmento')
          .eq('Usuario',    usuario.trim())
          .eq('Contraseña', contrasena)
          .maybeSingle();

      if (res == null) return LoginResult.invalid;

      return LoginResult(
        success:      true,
        userId:       res['id'] as int,
        username:     res['Usuario'] as String,
        rol:          res['Rol'] as String? ?? 'usuario',
        departamento: res['Departmento'] as String? ?? '',
      );
    } catch (e) {
      print('=== login error: $e');
      return LoginResult.serverError;
    }
  }
}

enum RegisterResult {
  success,
  usernameTaken,
  emptyFields,
  usernameTooShort,
  passwordTooShort,
  invalidEmail,
  serverError,
}

extension RegisterResultMessage on RegisterResult {
  String get message {
    switch (this) {
      case RegisterResult.success:
        return 'Registro exitoso';
      case RegisterResult.usernameTaken:
        return 'Ese usuario ya está en uso';
      case RegisterResult.emptyFields:
        return 'Completa todos los campos';
      case RegisterResult.usernameTooShort:
        return 'El usuario debe tener al menos 3 caracteres';
      case RegisterResult.passwordTooShort:
        return 'La contraseña debe tener al menos 4 caracteres';
      case RegisterResult.invalidEmail:
        return 'El correo debe ser @empresa.com';
      case RegisterResult.serverError:
        return 'Error de servidor, intenta de nuevo';
    }
  }
}

class LoginResult {
  final bool success;
  final int? userId;
  final String? username;
  final String? rol;
  final String? departamento;

  const LoginResult({
    required this.success,
    this.userId,
    this.username,
    this.rol,
    this.departamento,
  });

  static const invalid = LoginResult(success: false);
  static const serverError = LoginResult(success: false);
}
