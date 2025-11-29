import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

// Match your backend base URL & mount path
// If you mounted as app.use('/profile', profileRoutes);
// then "$baseUrl/profile" is correct.
// If it's app.use('/api/profile', profileRoutes);
const String profileBaseUrl = "https://m0p08fdx-5000.inc1.devtunnels.ms/api/profile";

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _formKey = GlobalKey<FormState>();

  // Form controllers
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _locationController = TextEditingController();
  final _dobController = TextEditingController();
  final _occupationController = TextEditingController();
  final _incomeController = TextEditingController();

  // Password change controllers
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _authName;
  String? _authEmail;
  String? _token;

  bool _isLoadingProfile = true;
  bool _isSavingProfile = false;

  // Notification settings
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _goalReminders = true;
  bool _weeklyReports = false;

  // Preferences
  String _currency = '₹ INR';
  String _language = 'English';
  String _theme = 'Light Mode';
  String _dateFormat = 'DD/MM/YYYY';

  // Security
  bool _twoFactorEnabled = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString("token");
      final userJson = prefs.getString("user");

      if (userJson != null) {
        try {
          final userMap = jsonDecode(userJson);
          _authName = userMap["fullName"];
          _authEmail = userMap["email"];
        } catch (_) {}
      }

      // If no token → just show basic info and stop
      if (_token == null) {
        setState(() {
          _fullNameController.text = _authName ?? "";
          _emailController.text = _authEmail ?? "";
          _isLoadingProfile = false;
        });
        return;
      }

      final url = Uri.parse(profileBaseUrl);
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $_token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = data["user"] ?? {};

        final fullName = user["fullName"] ?? "";
        final email = user["email"] ?? "";
        final phone = user["phone"] ?? "";
        final location = user["location"] ?? "";
        final occupation = user["occupation"] ?? "";
        final monthlyIncome = user["monthlyIncome"]?.toString() ?? "";
        String dob = "";

        if (user["dateOfBirth"] != null) {
          // "2005-11-05T00:00:00.000Z" -> "2005-11-05"
          final raw = user["dateOfBirth"].toString();
          dob = raw.length >= 10 ? raw.substring(0, 10) : raw;
        }

        setState(() {
          _authName = fullName.isNotEmpty ? fullName : _authName;
          _authEmail = email.isNotEmpty ? email : _authEmail;

          _fullNameController.text = fullName;
          _emailController.text = email;
          _phoneController.text = phone;
          _locationController.text = location;
          _dobController.text = dob;
          _occupationController.text = occupation;
          _incomeController.text = monthlyIncome;
          _isLoadingProfile = false;
        });

        // Keep SharedPrefs user in sync with backend
        await prefs.setString(
          "user",
          jsonEncode({
            "id": user["_id"],
            "fullName": fullName,
            "email": email,
          }),
        );
      } else if (response.statusCode == 401) {
        await _logout(clearOnly: true);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Session expired. Please log in again.')),
        );
        Navigator.pushReplacementNamed(context, '/login');
      } else {
        setState(() => _isLoadingProfile = false);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load profile.')),
        );
      }
    } catch (e) {
      setState(() => _isLoadingProfile = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error loading profile.')),
      );
    }
  }

  String _getInitials(String? name) {
    if (name == null || name.trim().isEmpty) return "U";
    final parts = name.trim().split(" ");
    if (parts.length == 1) {
      return parts[0][0].toUpperCase();
    } else {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
  }

  Future<void> _logout({bool clearOnly = false}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("token");
    await prefs.remove("user");
    if (clearOnly) return;
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  void dispose() {
    _tabController.dispose();
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _dobController.dispose();
    _occupationController.dispose();
    _incomeController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    if (_token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to update your profile.')),
      );
      return;
    }

    setState(() => _isSavingProfile = true);

    try {
      final url = Uri.parse(profileBaseUrl);

      // Build body according to backend: only send non-empty fields
      final Map<String, dynamic> body = {};

      void addIfNotEmpty(String key, TextEditingController c) {
        final v = c.text.trim();
        if (v.isNotEmpty) body[key] = v;
      }

      addIfNotEmpty("fullName", _fullNameController);
      addIfNotEmpty("email", _emailController);
      addIfNotEmpty("phone", _phoneController);
      addIfNotEmpty("location", _locationController);
      addIfNotEmpty("occupation", _occupationController);
      addIfNotEmpty("monthlyIncome", _incomeController);

      final dobText = _dobController.text.trim();
      // backend expects ISO8601; if empty, don't send at all
      if (dobText.isNotEmpty) {
        // expecting yyyy-mm-dd from UI
        body["dateOfBirth"] = dobText;
      }

      // ⚠ IMPORTANT: If you later wire preferences, send them as:
      // body["preferences"] = { "currency": "...", "language": "...", ... };

      final response = await http.put(
        url,
        headers: {
          "Authorization": "Bearer $_token",
          "Content-Type": "application/json",
        },
        body: jsonEncode(body),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final user = data["user"] ?? {};
        final fullName = user["fullName"] ?? _fullNameController.text;
        final email = user["email"] ?? _emailController.text;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(
          "user",
          jsonEncode({
            "id": user["_id"] ?? "",
            "fullName": fullName,
            "email": email,
          }),
        );

        setState(() {
          _authName = fullName;
          _authEmail = email;
        });

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!')),
        );
      } else if (response.statusCode == 400) {
        // validation error from express-validator
        String message = "Failed to update profile";

        if (data is Map && data["message"] != null) {
          message = data["message"];
        } else if (data is Map && data["errors"] != null) {
          try {
            final errors = (data["errors"] as List)
                .map((e) => e["msg"] ?? e["message"] ?? "")
                .where((e) => e.toString().isNotEmpty)
                .join("\n");
            if (errors.isNotEmpty) message = errors;
          } catch (_) {}
        }

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update profile.')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error updating profile.')),
      );
    } finally {
      if (mounted) setState(() => _isSavingProfile = false);
    }
  }

  Future<void> _changePassword() async {
    if (_token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to change password.')),
      );
      return;
    }

    final currentPass = _currentPasswordController.text.trim();
    final newPass = _newPasswordController.text.trim();
    final confirmPass = _confirmPasswordController.text.trim();

    if (currentPass.isEmpty || newPass.isEmpty || confirmPass.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All fields are required.')),
      );
      return;
    }

    if (newPass.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New password must be at least 6 characters.')),
      );
      return;
    }

    if (newPass != confirmPass) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match.')),
      );
      return;
    }

    try {
      final url = Uri.parse("$profileBaseUrl/password");
      final response = await http.put(
        url,
        headers: {
          "Authorization": "Bearer $_token",
          "Content-Type": "application/json",
        },
        body: jsonEncode({
          "currentPassword": currentPass,
          "newPassword": newPass,
          "confirmPassword": confirmPass,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _currentPasswordController.clear();
        _newPasswordController.clear();
        _confirmPasswordController.clear();

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password changed successfully!')),
        );
        Navigator.pop(context);
      } else {
        String message = data["message"] ?? "Failed to change password";
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error changing password.')),
      );
    }
  }

  Future<void> _updateNotification(String key, bool value) async {
    if (_token == null) return;

    try {
      final url = Uri.parse("$profileBaseUrl/notifications");
      final response = await http.put(
        url,
        headers: {
          "Authorization": "Bearer $_token",
          "Content-Type": "application/json",
        },
        body: jsonEncode({key: value}),
      );

      if (response.statusCode == 200) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notification settings updated!')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error updating notifications.')),
      );
    }
  }

  Future<void> _toggle2FA(bool value) async {
    if (_token == null) return;

    try {
      final url = Uri.parse("$profileBaseUrl/security/2fa");
      final response = await http.put(
        url,
        headers: {
          "Authorization": "Bearer $_token",
          "Content-Type": "application/json",
        },
        body: jsonEncode({"enabled": value}),
      );

      if (response.statusCode == 200) {
        setState(() => _twoFactorEnabled = value);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Two-factor authentication ${value ? 'enabled' : 'disabled'}!')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error updating 2FA settings.')),
      );
    }
  }

  void _showChangePasswordDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Password'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _currentPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Current Password',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _newPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'New Password',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _confirmPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Confirm Password',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              _currentPasswordController.clear();
              _newPasswordController.clear();
              _confirmPasswordController.clear();
              Navigator.pop(context);
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: _changePassword,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C3AED),
            ),
            child: const Text('Change Password'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final displayName = _authName ?? 'Your Name';
    final displayEmail = _authEmail ?? 'your@email.com';
    final initials = _getInitials(_authName);

    if (_isLoadingProfile) {
      return const Scaffold(
        backgroundColor: Color(0xFFF3F4F6),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7C3AED),
        elevation: 0,
        title: Row(
          children: const [
            Icon(Icons.flash_on, size: 28),
            SizedBox(width: 8),
            Text(
              'GoalAura',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) async {
              if (value == 'logout') {
                await _logout();
              }
            },
            itemBuilder: (context) => const [
              PopupMenuItem(value: 'logout', child: Text('Logout')),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFF9333EA)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  // Profile Picture
                  Stack(
                    children: [
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [
                              Colors.purple.shade300,
                              Colors.purple.shade600
                            ],
                          ),
                        ),
                        child: Center(
                          child: Text(
                            initials,
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            size: 18,
                            color: Color(0xFF7C3AED),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Name and Email
                  Text(
                    displayName,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.email_outlined,
                          size: 16, color: Colors.white70),
                      const SizedBox(width: 6),
                      Text(
                        displayEmail,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (_locationController.text.isNotEmpty)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 16, color: Colors.white70),
                        const SizedBox(width: 6),
                        Text(
                          _locationController.text,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),
                  // Badges
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildBadge(Icons.verified, 'Verified', Colors.green),
                      const SizedBox(width: 12),
                      _buildBadge(Icons.star, 'Premium Member', Colors.amber),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Edit Profile Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: () {
                          // You can add scroll-to-form later
                        },
                        icon: const Icon(Icons.edit, size: 18),
                        label: const Text('Edit Profile'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF7C3AED),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pushNamed(context, '/transactions');
                        },
                        icon: const Icon(Icons.receipt_long, size: 18),
                        label: const Text('Transactions'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF7C3AED),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Stats Cards
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      Icons.track_changes,
                      '3',
                      'Active Goals',
                      Colors.purple,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      Icons.trending_up,
                      '₹2.8L',
                      'Total Saved',
                      Colors.green,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      Icons.emoji_events,
                      '5',
                      'Goals Achieved',
                      Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      Icons.wallet,
                      '₹18k/mo',
                      'Side Hustle',
                      Colors.blue,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Tabs Section
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    labelColor: const Color(0xFF7C3AED),
                    unselectedLabelColor: const Color(0xFF6B7280),
                    indicatorColor: const Color(0xFF7C3AED),
                    tabs: const [
                      Tab(
                        icon: Icon(Icons.person),
                        text: 'Personal Info',
                      ),
                      Tab(
                        icon: Icon(Icons.security),
                        text: 'Security',
                      ),
                      Tab(
                        icon: Icon(Icons.notifications),
                        text: 'Notifications',
                      ),
                      Tab(
                        icon: Icon(Icons.settings),
                        text: 'Preferences',
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 600,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildPersonalInfoTab(),
                        _buildSecurityTab(),
                        _buildNotificationsTab(),
                        _buildPreferencesTab(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      IconData icon, String value, String label, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF6B7280),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalInfoTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Personal Information',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _buildTextField(
                    controller: _fullNameController,
                    label: 'Full Name',
                    hint: 'Your full name',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextField(
                    controller: _emailController,
                    label: 'Email Address',
                    hint: 'you@example.com',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildTextField(
                    controller: _phoneController,
                    label: 'Phone Number',
                    hint: '+91 XXXXX XXXXX',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextField(
                    controller: _locationController,
                    label: 'Location',
                    hint: 'City, Country',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildDateField(
                    controller: _dobController,
                    label: 'Date of Birth',
                    hint: 'Select date',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextField(
                    controller: _occupationController,
                    label: 'Occupation',
                    hint: 'Your profession',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _incomeController,
              label: 'Monthly Income',
              hint: '₹ Enter amount',
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSavingProfile ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSavingProfile
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Save Changes',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Security Settings',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 24),
          _buildSecurityItem(
            Icons.lock_outline,
            'Change Password',
            'Update your password regularly',
            _showChangePasswordDialog,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7C3AED).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.phone_android, color: Color(0xFF7C3AED)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Two-Factor Authentication',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Add an extra layer of security',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _twoFactorEnabled,
                  onChanged: _toggle2FA,
                  activeColor: const Color(0xFF7C3AED),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildSecurityItem(
            Icons.devices,
            'Active Sessions',
            'Manage your logged-in devices',
            () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Feature coming soon!')),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsTab() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Notification Preferences',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 24),
          _buildNotificationItem('Email Notifications', _emailNotifications, 'emailNotifications'),
          _buildNotificationItem('Push Notifications', _pushNotifications, 'pushNotifications'),
          _buildNotificationItem('Goal Reminders', _goalReminders, 'goalMilestones'),
          _buildNotificationItem('Weekly Reports', _weeklyReports, 'weeklyReports'),
        ],
      ),
    );
  }

  Widget _buildPreferencesTab() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'App Preferences',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 24),
          _buildPreferenceItem('Currency', _currency),
          _buildPreferenceItem('Language', _language),
          _buildPreferenceItem('Theme', _theme),
          _buildPreferenceItem('Date Format', _dateFormat),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF374151),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFFD1D5DB)),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide:
                  const BorderSide(color: Color(0xFF7C3AED), width: 2),
            ),
            filled: true,
            fillColor: const Color(0xFFF9FAFB),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildDateField({
    required TextEditingController controller,
    required String label,
    required String hint,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF374151),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          readOnly: true,
          onTap: () async {
            final DateTime? picked = await showDatePicker(
              context: context,
              initialDate: controller.text.isNotEmpty
                  ? DateTime.tryParse(controller.text) ?? DateTime(2000)
                  : DateTime(2000),
              firstDate: DateTime(1900),
              lastDate: DateTime.now(),
              builder: (context, child) {
                return Theme(
                  data: Theme.of(context).copyWith(
                    colorScheme: const ColorScheme.light(
                      primary: Color(0xFF7C3AED),
                      onPrimary: Colors.white,
                      onSurface: Color(0xFF1F2937),
                    ),
                  ),
                  child: child!,
                );
              },
            );
            if (picked != null) {
              controller.text = picked.toIso8601String().substring(0, 10);
            }
          },
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFFD1D5DB)),
            suffixIcon: const Icon(Icons.calendar_today, size: 18),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide:
                  const BorderSide(color: Color(0xFF7C3AED), width: 2),
            ),
            filled: true,
            fillColor: const Color(0xFFF9FAFB),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildSecurityItem(
      IconData icon, String title, String subtitle, VoidCallback onTap) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFF7C3AED).withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: const Color(0xFF7C3AED)),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          color: Color(0xFF1F2937),
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          fontSize: 12,
          color: Color(0xFF6B7280),
        ),
      ),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }

  Widget _buildNotificationItem(String title, bool value, String key) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w500,
          color: Color(0xFF1F2937),
        ),
      ),
      value: value,
      onChanged: (newValue) async {
        setState(() {
          if (key == 'emailNotifications') _emailNotifications = newValue;
          if (key == 'pushNotifications') _pushNotifications = newValue;
          if (key == 'goalMilestones') _goalReminders = newValue;
          if (key == 'weeklyReports') _weeklyReports = newValue;
        });
        await _updateNotification(key, newValue);
      },
      activeColor: const Color(0xFF7C3AED),
    );
  }

  Widget _buildPreferenceItem(String title, String value) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w500,
          color: Color(0xFF1F2937),
        ),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFF6B7280),
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right),
        ],
      ),
      onTap: () {},
    );
  }
}
