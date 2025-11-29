import 'package:flutter/material.dart';
import 'login_page.dart';
import 'register_page.dart';
import 'dashboard_page.dart';
import 'profile_page.dart';
import 'transaction_history_page.dart';
import 'home_page.dart'; // Add this
import 'sms_listener_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize SMS listener (only works on real devices)
  await SMSListenerService.initialize();
  
  runApp(const GoalAuraApp());
}

class GoalAuraApp extends StatelessWidget {
  const GoalAuraApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GoalAura',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.purple,
        fontFamily: 'Sans-serif',
        scaffoldBackgroundColor: Colors.white,
      ),
      initialRoute: '/dashboard',
      routes: {
        '/dashboard': (context) => const DashboardPage(),
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/home': (context) => const HomePage(), // Add this - Main hub after login
        '/profile': (context) => const ProfilePage(),
        '/transactions': (context) => const TransactionHistoryPage(),
      },
    );
  }
}