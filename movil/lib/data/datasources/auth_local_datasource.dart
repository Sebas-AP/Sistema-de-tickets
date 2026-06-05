import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthLocalDatasource {
  static const _keyUsername = 'session_username';
  static const _keyLogged   = 'session_logged';

  Map<String, String> get _users => {
    'usuario': dotenv.env['AUTH_PASS_USUARIO'] ?? '1234',
    'admin':   dotenv.env['AUTH_PASS_ADMIN'] ?? 'admin',
    'tecnico': dotenv.env['AUTH_PASS_TECNICO'] ?? 'tecnico',
  };

  Future<bool> login(String username, String password) async {
    final stored = _users[username.toLowerCase().trim()];
    if (stored == null || stored != password) return false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyLogged, true);
    await prefs.setString(_keyUsername, username.trim());
    return true;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyLogged);
    await prefs.remove(_keyUsername);
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyLogged) ?? false;
  }

  Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUsername);
  }
}
