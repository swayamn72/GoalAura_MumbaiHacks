import 'dart:async';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'sms_parser_service.dart';

class SMSListenerService {
  static const MethodChannel _channel = MethodChannel('com.goalaura.app/sms');
  static StreamController<String>? _smsStreamController;

  /// Initialize SMS listener
  static Future<void> initialize() async {
    // Request SMS permission
    final status = await Permission.sms.request();
    
    if (status.isGranted) {
      _smsStreamController = StreamController<String>.broadcast();
      
      // Set up method call handler
      _channel.setMethodCallHandler(_handleMethodCall);
      
      // Start listening
      await _channel.invokeMethod('startListening');
      
      print('SMS Listener initialized successfully');
    } else {
      print('SMS permission denied');
    }
  }

  /// Handle incoming method calls from native code
  static Future<dynamic> _handleMethodCall(MethodCall call) async {
    switch (call.method) {
      case 'onSMSReceived':
        final String message = call.arguments['message'];
        final String sender = call.arguments['sender'];
        
        print('SMS received from $sender: $message');
        
        // Parse and process SMS
        await _processSMS(message, sender);
        
        // Add to stream
        _smsStreamController?.add(message);
        break;
      
      default:
        print('Unknown method: ${call.method}');
    }
  }

  /// Process incoming SMS
  static Future<void> _processSMS(String message, String sender) async {
    // Only process transactional SMS
    if (!_isTransactionalSMS(sender, message)) {
      print('Not a transactional SMS, skipping...');
      return;
    }

    // Parse SMS
    final transactionData = SMSParserService.parseSMS(message);
    
    if (transactionData != null) {
      print('Parsed transaction: $transactionData');
      
      // Send to backend
      final result = await SMSParserService.sendTransaction(transactionData);
      
      if (result['ok'] == true) {
        print('Transaction saved successfully');
      } else {
        print('Failed to save transaction: ${result['error']}');
      }
    } else {
      print('Could not parse SMS');
    }
  }

  /// Check if SMS is from a bank or payment service
  static bool _isTransactionalSMS(String sender, String message) {
    // Common sender IDs for banks and payment services
    final transactionalSenders = [
      'HDFCBK', 'SBIINB', 'ICICIB', 'KOTAKB', 'AXISBK', 'PNBSMS',
      'SCBANK', 'YESBAK', 'IDBIBN', 'BOIIND', 'BNKOFB', 'PNBSMS',
      'PAYTM', 'PHONEPE', 'GPAY', 'BHARPE', 'MOBIKW', 'AMAZPAY',
      'BHARTI', 'ATMSBI', 'ATMPNB', 'ATMHDFC'
    ];

    // Check sender
    final upperSender = sender.toUpperCase().replaceAll(RegExp(r'[^A-Z]'), '');
    for (final txnSender in transactionalSenders) {
      if (upperSender.contains(txnSender)) {
        return true;
      }
    }

    // Check message content
    final upperMessage = message.toUpperCase();
    final keywords = ['DEBITED', 'CREDITED', 'PAID', 'RECEIVED', 'WITHDRAWN', 'DEPOSITED'];
    
    for (final keyword in keywords) {
      if (upperMessage.contains(keyword)) {
        return true;
      }
    }

    return false;
  }

  /// Get SMS stream
  static Stream<String>? get smsStream => _smsStreamController?.stream;

  /// Stop listening
  static Future<void> stop() async {
    await _channel.invokeMethod('stopListening');
    await _smsStreamController?.close();
    _smsStreamController = null;
  }

  /// Request SMS permission
  static Future<bool> requestPermission() async {
    final status = await Permission.sms.request();
    return status.isGranted;
  }

  /// Check if permission is granted
  static Future<bool> hasPermission() async {
    final status = await Permission.sms.status;
    return status.isGranted;
  }
}

/// For testing in simulator - Manual SMS input
class SMSSimulator {
  /// Simulate receiving an SMS (for testing)
  static Future<void> simulateSMS(String message) async {
    print('Simulating SMS: $message');
    
    final transactionData = SMSParserService.parseSMS(message);
    
    if (transactionData != null) {
      print('Parsed transaction: $transactionData');
      
      final result = await SMSParserService.sendTransaction(transactionData);
      
      if (result['ok'] == true) {
        print('✅ Transaction saved successfully');
        return;
      } else {
        print('❌ Failed to save transaction: ${result['error']}');
      }
    } else {
      print('❌ Could not parse SMS');
    }
  }

  /// Test with sample SMS messages
  static Future<void> runTests() async {
    final testMessages = [
      'Rs 1,250.00 debited from your account XXXX1234 at SWIGGY on 28-NOV-24. Available balance: Rs 45,320.50',
      'Your A/c XXXX5678 credited with Rs 50,000.00 on 28-NOV-24. Salary credited. Available balance: Rs 95,320.50',
      'Rs 350 debited from your card XXXX9012 at PVR CINEMAS on 27-NOV-24. Available balance: Rs 44,970.50',
      'You have paid Rs 8,000.00 to MAKE MY TRIP on 22-NOV-24. Trip to Goa. Available balance: Rs 36,970.50',
      'Rs 12,000 credited to your account XXXX1234. Freelance project payment received on 25-NOV-24.',
    ];

    print('🧪 Running SMS Parser Tests...\n');
    
    for (int i = 0; i < testMessages.length; i++) {
      print('Test ${i + 1}:');
      print('SMS: ${testMessages[i]}');
      await simulateSMS(testMessages[i]);
      print('\n');
    }
  }
}