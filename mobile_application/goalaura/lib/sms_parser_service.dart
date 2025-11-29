import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SMSParserService {
  static const String baseUrl = "https://m0p08fdx-5000.inc1.devtunnels.ms/api";

  // Merchant to category mapping
  static final Map<String, String> merchantCategoryMap = {
    // Food & Dining
    'SWIGGY': 'Food & Dining',
    'ZOMATO': 'Food & Dining',
    'DOMINOS': 'Food & Dining',
    'MCDONALD': 'Food & Dining',
    'KFC': 'Food & Dining',
    'PIZZAHUT': 'Food & Dining',
    'STARBUCKS': 'Food & Dining',
    'BLINKIT': 'Food & Dining',
    'ZEPTO': 'Food & Dining',
    
    // Entertainment
    'PVR': 'Entertainment',
    'BOOKMYSHOW': 'Entertainment',
    'INOX': 'Entertainment',
    'NETFLIX': 'Entertainment',
    'PRIMEVIDEO': 'Entertainment',
    'HOTSTAR': 'Entertainment',
    'SPOTIFY': 'Entertainment',
    'YOUTUBE': 'Entertainment',
    
    // Shopping
    'AMAZON': 'Shopping',
    'FLIPKART': 'Shopping',
    'MYNTRA': 'Shopping',
    'AJIO': 'Shopping',
    'NYKAA': 'Shopping',
    'MEESHO': 'Shopping',
    
    // Travel
    'UBER': 'Travel',
    'OLA': 'Travel',
    'RAPIDO': 'Travel',
    'MAKEMYTRIP': 'Travel',
    'GOIBIBO': 'Travel',
    'IRCTC': 'Travel',
    'REDBUS': 'Travel',
    
    // Bills & Utilities
    'ELECTRICITY': 'Bills & Utilities',
    'WATER': 'Bills & Utilities',
    'GAS': 'Bills & Utilities',
    'PAYTM': 'Bills & Utilities',
    'PHONEPE': 'Bills & Utilities',
    'GPAY': 'Bills & Utilities',
    'AIRTEL': 'Bills & Utilities',
    'JIO': 'Bills & Utilities',
    'VI': 'Bills & Utilities',
    
    // Healthcare
    'APOLLO': 'Healthcare',
    'MEDLIFE': 'Healthcare',
    'PHARMEASY': 'Healthcare',
    '1MG': 'Healthcare',
    
    // Education
    'UDEMY': 'Education',
    'COURSERA': 'Education',
    'BYJU': 'Education',
    'UNACADEMY': 'Education',
  };

  // Keywords for transaction type detection
  static final List<String> creditKeywords = [
    'credited',
    'credit',
    'deposited',
    'received',
    'salary',
    'refund',
    'cashback',
    'bonus',
  ];

  static final List<String> debitKeywords = [
    'debited',
    'debit',
    'spent',
    'paid',
    'withdrawn',
    'purchase',
    'payment',
  ];

  /// Parse SMS message and extract transaction details
  static Map<String, dynamic>? parseSMS(String message) {
    try {
      // Convert to uppercase for easier matching
      final upperMessage = message.toUpperCase();

      // Extract amount
      final amount = _extractAmount(message);
      if (amount == null || amount <= 0) return null;

      // Determine transaction type (deposit/withdrawal)
      final type = _determineTransactionType(upperMessage);
      if (type == null) return null;

      // Extract merchant/description
      final description = _extractDescription(message);

      // Determine category based on merchant
      final category = _determineCategory(upperMessage);

      // Extract timestamp (if available)
      final timestamp = DateTime.now(); // Use current time as fallback

      return {
        'amount': amount,
        'type': type,
        'description': description,
        'category': category,
        'timestamp': timestamp.toIso8601String(),
        'currency': 'INR',
      };
    } catch (e) {
      print('Error parsing SMS: $e');
      return null;
    }
  }

  /// Extract amount from SMS
  static double? _extractAmount(String message) {
    // Common patterns for amount in Indian SMS
    // Rs 1,234.56 or INR 1234.56 or ₹1,234.56 or Rs.1234.56
    final patterns = [
      RegExp(r'(?:Rs\.?|INR|₹)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', caseSensitive: false),
      RegExp(r'(?:debited|credited|paid|received|amount)[:\s]+(?:Rs\.?|INR|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', caseSensitive: false),
      RegExp(r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:Rs\.?|INR|₹)', caseSensitive: false),
    ];

    for (final pattern in patterns) {
      final match = pattern.firstMatch(message);
      if (match != null) {
        final amountStr = match.group(1)!.replaceAll(',', '');
        return double.tryParse(amountStr);
      }
    }

    return null;
  }

  /// Determine transaction type (deposit or withdrawal)
  static String? _determineTransactionType(String upperMessage) {
    // Check for credit keywords
    for (final keyword in creditKeywords) {
      if (upperMessage.contains(keyword.toUpperCase())) {
        return 'deposit';
      }
    }

    // Check for debit keywords
    for (final keyword in debitKeywords) {
      if (upperMessage.contains(keyword.toUpperCase())) {
        return 'withdrawal';
      }
    }

    return null;
  }

  /// Extract description/merchant name
  static String _extractDescription(String message) {
    // Try to extract merchant name
    final words = message.split(' ');
    
    // Look for merchant names
    for (final word in words) {
      final upperWord = word.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
      if (merchantCategoryMap.containsKey(upperWord)) {
        return word;
      }
    }

    // Fallback: use first 50 characters
    return message.length > 50 
        ? '${message.substring(0, 47)}...' 
        : message;
  }

  /// Determine category based on merchant
  static String _determineCategory(String upperMessage) {
    for (final entry in merchantCategoryMap.entries) {
      if (upperMessage.contains(entry.key)) {
        return entry.value;
      }
    }
    return 'Other';
  }

  /// Send transaction to backend
  static Future<Map<String, dynamic>> sendTransaction(Map<String, dynamic> transactionData) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("token");

      if (token == null) {
        return {"ok": false, "error": "Not authenticated"};
      }

      // Use your existing route endpoint
      final url = Uri.parse("$baseUrl/transactions");
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode(transactionData),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return {"ok": true, "transaction": data["transaction"]};
      } else {
        return {"ok": false, "error": data["message"] ?? "Failed to create transaction"};
      }
    } catch (e) {
      return {"ok": false, "error": "Something went wrong: $e"};
    }
  }

  /// Fetch all transactions
  static Future<Map<String, dynamic>> fetchTransactions({
    int page = 1,
    int limit = 10,
    String? type,
    String? startDate,
    String? endDate,
    String? category,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("token");

      if (token == null) {
        return {"ok": false, "error": "Not authenticated"};
      }

      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (type != null) 'type': type,
        if (startDate != null) 'startDate': startDate,
        if (endDate != null) 'endDate': endDate,
        if (category != null) 'category': category,
      };

      // Use your existing route endpoint
      final url = Uri.parse("$baseUrl/transactions").replace(queryParameters: queryParams);
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {"ok": true, "data": data};
      } else {
        return {"ok": false, "error": data["message"] ?? "Failed to fetch transactions"};
      }
    } catch (e) {
      return {"ok": false, "error": "Something went wrong: $e"};
    }
  }

  /// Delete a transaction
  static Future<Map<String, dynamic>> deleteTransaction(String transactionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("token");

      if (token == null) {
        return {"ok": false, "error": "Not authenticated"};
      }

      final url = Uri.parse("$baseUrl/transactions/$transactionId");
      final response = await http.delete(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {"ok": true, "message": data["message"]};
      } else {
        return {"ok": false, "error": data["message"] ?? "Failed to delete transaction"};
      }
    } catch (e) {
      return {"ok": false, "error": "Something went wrong: $e"};
    }
  }

  /// Fetch transaction statistics
  static Future<Map<String, dynamic>> fetchStatistics({String period = 'month'}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("token");

      if (token == null) {
        return {"ok": false, "error": "Not authenticated"};
      }

      final url = Uri.parse("$baseUrl/transactions/stats/summary?period=$period");
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {"ok": true, "data": data};
      } else {
        return {"ok": false, "error": data["message"] ?? "Failed to fetch statistics"};
      }
    } catch (e) {
      return {"ok": false, "error": "Something went wrong: $e"};
    }
  }
}