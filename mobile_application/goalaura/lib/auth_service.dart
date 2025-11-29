import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = "https://m0p08fdx-5000.inc1.devtunnels.ms/api/auth"; // change if needed

  Future<Map<String, dynamic>> signup({
    required String fullName,
    required String email,
    required String password,
  }) async {
    final url = Uri.parse("$baseUrl/signup");

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "fullName": fullName,
          "email": email,
          "password": password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // save token + user locally
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("token", data["token"]);
        await prefs.setString("user", jsonEncode(data["user"]));

        return {"ok": true, "user": data["user"]};
      } else {
        // backend error message or validation errors
        final msg = data["message"] ?? "Signup failed";
        return {"ok": false, "error": msg};
      }
    } catch (e) {
      return {"ok": false, "error": "Something went wrong. Check your connection."};
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final url = Uri.parse("$baseUrl/login");

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "email": email,
          "password": password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // save token + user locally
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("token", data["token"]);
        await prefs.setString("user", jsonEncode(data["user"]));

        return {"ok": true, "user": data["user"]};
      } else {
        // backend error message
        final msg = data["message"] ?? "Login failed";
        return {"ok": false, "error": msg};
      }
    } catch (e) {
      return {"ok": false, "error": "Something went wrong. Check your connection."};
    }
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString("user");
    if (userJson == null) return null;
    return jsonDecode(userJson);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("token");
    await prefs.remove("user");
  }
}
