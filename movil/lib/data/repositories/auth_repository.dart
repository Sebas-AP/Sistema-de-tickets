import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_supabase_datasource.dart';

export '../datasources/auth_supabase_datasource.dart'
    show RegisterResult, LoginResult, RegisterResultMessage;

class AuthRepository {
  final AuthLocalDatasource    _local;
  final AuthSupabaseDatasource _remote;

  AuthRepository({
    AuthLocalDatasource?    local,
    AuthSupabaseDatasource? remote,
  })  : _local  = local  ?? AuthLocalDatasource(),
        _remote = remote ?? AuthSupabaseDatasource();

  Future<RegisterResult> register({
    required String usuario,
    required String contrasena,
    required String correo,
    required String departamento,
  }) =>
      _remote.register(
        usuario:      usuario,
        contrasena:   contrasena,
        correo:       correo,
        departamento: departamento,
      );

  Future<bool> login(String usuario, String contrasena) async {
    final result = await _remote.login(
      usuario:    usuario,
      contrasena: contrasena,
    );
    if (result.success && result.username != null && result.userId != null) {
      await _local.saveSession(
        userId:       result.userId!,
        username:     result.username!,
        rol:          result.rol ?? 'usuario',
        departamento: result.departamento ?? '',
      );
      return true;
    }
    return false;
  }

  Future<void> logout() => _local.clearSession();

  Future<bool> isLoggedIn() => _local.isLoggedIn();

  Future<int?> getUserId() => _local.getUserId();

  Future<String?> getUsername() => _local.getUsername();

  Future<String?> getRol() => _local.getRol();

  Future<String?> getDepartamento() => _local.getDepartamento();

  Future<String?> getUsernameById(int userId) => _remote.getUsernameById(userId);
}
