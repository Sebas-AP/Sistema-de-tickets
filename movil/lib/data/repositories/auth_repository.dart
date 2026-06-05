import '../datasources/auth_local_datasource.dart';

class AuthRepository {
  final AuthLocalDatasource _datasource;

  AuthRepository({AuthLocalDatasource? datasource})
      : _datasource = datasource ?? AuthLocalDatasource();

  Future<bool> login(String username, String password) =>
      _datasource.login(username, password);

  Future<void> logout() => _datasource.logout();

  Future<bool> isLoggedIn() => _datasource.isLoggedIn();

  Future<String?> getUsername() => _datasource.getUsername();
}
