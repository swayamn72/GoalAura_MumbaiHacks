// import 'package:flutter/material.dart';
// import 'package:intl/intl.dart';
// import 'sms_parser_service.dart';

// class TransactionHistoryPage extends StatefulWidget {
//   const TransactionHistoryPage({Key? key}) : super(key: key);

//   @override
//   State<TransactionHistoryPage> createState() => _TransactionHistoryPageState();
// }

// class _TransactionHistoryPageState extends State<TransactionHistoryPage> {
//   bool _isLoading = true;
//   List<dynamic> _transactions = [];
//   Map<String, dynamic> _summary = {};
//   int _currentPage = 1;
//   int _totalPages = 1;
//   String? _selectedType;
//   final _searchController = TextEditingController();

//   @override
//   void initState() {
//     super.initState();
//     _loadTransactions();
//   }

//   Future<void> _loadTransactions() async {
//     setState(() => _isLoading = true);

//     final result = await SMSParserService.fetchTransactions(
//       page: _currentPage,
//       type: _selectedType,
//     );

//     if (result['ok'] == true) {
//       final data = result['data'];
//       setState(() {
//         _transactions = data['transactions'] ?? [];
//         _summary = data['summary'] ?? {};
//         _totalPages = data['totalPages'] ?? 1;
//         _isLoading = false;
//       });
//     } else {
//       setState(() => _isLoading = false);
//       if (!mounted) return;
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text(result['error'] ?? 'Failed to load transactions')),
//       );
//     }
//   }

//   Future<void> _showAddTransactionDialog() async {
//     final amountController = TextEditingController();
//     final descriptionController = TextEditingController();
//     String selectedType = 'deposit';
//     String selectedCategory = 'Other';

//     await showDialog(
//       context: context,
//       builder: (context) => StatefulBuilder(
//         builder: (context, setState) => AlertDialog(
//           title: const Text('Add Transaction'),
//           content: SingleChildScrollView(
//             child: Column(
//               mainAxisSize: MainAxisSize.min,
//               children: [
//                 TextField(
//                   controller: amountController,
//                   keyboardType: TextInputType.number,
//                   decoration: const InputDecoration(
//                     labelText: 'Amount',
//                     prefixText: '₹',
//                   ),
//                 ),
//                 const SizedBox(height: 16),
//                 TextField(
//                   controller: descriptionController,
//                   decoration: const InputDecoration(
//                     labelText: 'Description',
//                   ),
//                 ),
//                 const SizedBox(height: 16),
//                 DropdownButtonFormField<String>(
//                   value: selectedType,
//                   decoration: const InputDecoration(labelText: 'Type'),
//                   items: const [
//                     DropdownMenuItem(value: 'deposit', child: Text('Deposit')),
//                     DropdownMenuItem(value: 'withdrawal', child: Text('Withdrawal')),
//                   ],
//                   onChanged: (value) {
//                     setState(() => selectedType = value!);
//                   },
//                 ),
//                 const SizedBox(height: 16),
//                 DropdownButtonFormField<String>(
//                   value: selectedCategory,
//                   decoration: const InputDecoration(labelText: 'Category'),
//                   items: const [
//                     DropdownMenuItem(value: 'Food & Dining', child: Text('Food & Dining')),
//                     DropdownMenuItem(value: 'Entertainment', child: Text('Entertainment')),
//                     DropdownMenuItem(value: 'Shopping', child: Text('Shopping')),
//                     DropdownMenuItem(value: 'Travel', child: Text('Travel')),
//                     DropdownMenuItem(value: 'Bills & Utilities', child: Text('Bills & Utilities')),
//                     DropdownMenuItem(value: 'Healthcare', child: Text('Healthcare')),
//                     DropdownMenuItem(value: 'Education', child: Text('Education')),
//                     DropdownMenuItem(value: 'Salary', child: Text('Salary')),
//                     DropdownMenuItem(value: 'Other', child: Text('Other')),
//                   ],
//                   onChanged: (value) {
//                     setState(() => selectedCategory = value!);
//                   },
//                 ),
//               ],
//             ),
//           ),
//           actions: [
//             TextButton(
//               onPressed: () => Navigator.pop(context),
//               child: const Text('Cancel'),
//             ),
//             ElevatedButton(
//               onPressed: () async {
//                 final amount = double.tryParse(amountController.text);
//                 if (amount == null || descriptionController.text.isEmpty) {
//                   ScaffoldMessenger.of(context).showSnackBar(
//                     const SnackBar(content: Text('Please fill all fields')),
//                   );
//                   return;
//                 }

//                 final result = await SMSParserService.sendTransaction({
//                   'amount': amount,
//                   'type': selectedType,
//                   'description': descriptionController.text,
//                   'category': selectedCategory,
//                   'timestamp': DateTime.now().toIso8601String(),
//                 });

//                 if (!mounted) return;
//                 Navigator.pop(context);

//                 if (result['ok'] == true) {
//                   ScaffoldMessenger.of(context).showSnackBar(
//                     const SnackBar(content: Text('Transaction added successfully')),
//                   );
//                   _loadTransactions();
//                 } else {
//                   ScaffoldMessenger.of(context).showSnackBar(
//                     SnackBar(content: Text(result['error'] ?? 'Failed to add transaction')),
//                   );
//                 }
//               },
//               child: const Text('Add'),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   String _formatCurrency(double amount) {
//     return '₹${amount.toStringAsFixed(0).replaceAllMapped(
//       RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
//       (Match m) => '${m[1]},',
//     )}';
//   }

//   IconData _getCategoryIcon(String category) {
//     switch (category) {
//       case 'Food & Dining': return Icons.restaurant;
//       case 'Entertainment': return Icons.movie;
//       case 'Shopping': return Icons.shopping_bag;
//       case 'Travel': return Icons.flight;
//       case 'Bills & Utilities': return Icons.receipt;
//       case 'Healthcare': return Icons.local_hospital;
//       case 'Education': return Icons.school;
//       case 'Salary': return Icons.account_balance_wallet;
//       case 'Freelance': return Icons.work;
//       case 'Investment': return Icons.trending_up;
//       default: return Icons.category;
//     }
//   }

//   Color _getCategoryColor(String category) {
//     switch (category) {
//       case 'Food & Dining': return Colors.orange;
//       case 'Entertainment': return Colors.purple;
//       case 'Shopping': return Colors.pink;
//       case 'Travel': return Colors.blue;
//       case 'Bills & Utilities': return Colors.teal;
//       case 'Healthcare': return Colors.red;
//       case 'Education': return Colors.indigo;
//       case 'Salary': return Colors.green;
//       default: return Colors.grey;
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: const Color(0xFFF3F4F6),
//       appBar: AppBar(
//         backgroundColor: const Color(0xFF7C3AED),
//         elevation: 0,
//         title: Row(
//           children: const [
//             Icon(Icons.flash_on, size: 28),
//             SizedBox(width: 8),
//             Text('GoalAura', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
//           ],
//         ),
//       ),
//       body: RefreshIndicator(
//         onRefresh: _loadTransactions,
//         child: SingleChildScrollView(
//           physics: const AlwaysScrollableScrollPhysics(),
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               // Header
//               Container(
//                 width: double.infinity,
//                 padding: const EdgeInsets.all(24),
//                 decoration: const BoxDecoration(
//                   gradient: LinearGradient(
//                     colors: [Color(0xFF7C3AED), Color(0xFF9333EA)],
//                     begin: Alignment.topLeft,
//                     end: Alignment.bottomRight,
//                   ),
//                 ),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: const [
//                     Text(
//                       'Transaction History',
//                       style: TextStyle(
//                         color: Colors.white,
//                         fontSize: 28,
//                         fontWeight: FontWeight.bold,
//                       ),
//                     ),
//                     SizedBox(height: 8),
//                     Text(
//                       'Track all your deposits and withdrawals in one place',
//                       style: TextStyle(color: Colors.white70, fontSize: 14),
//                     ),
//                   ],
//                 ),
//               ),

//               // Summary Cards
//               Padding(
//                 padding: const EdgeInsets.all(16),
//                 child: Column(
//                   children: [
//                     Row(
//                       children: [
//                         Expanded(
//                           child: _buildSummaryCard(
//                             Icons.trending_up,
//                             'Total Deposits',
//                             _formatCurrency(_summary['totalDeposits']?.toDouble() ?? 0),
//                             Colors.green,
//                           ),
//                         ),
//                         const SizedBox(width: 12),
//                         Expanded(
//                           child: _buildSummaryCard(
//                             Icons.trending_down,
//                             'Total Withdrawals',
//                             _formatCurrency(_summary['totalWithdrawals']?.toDouble() ?? 0),
//                             Colors.red,
//                           ),
//                         ),
//                       ],
//                     ),
//                     const SizedBox(height: 12),
//                     Row(
//                       children: [
//                         Expanded(
//                           child: _buildSummaryCard(
//                             Icons.wallet,
//                             'Net Balance',
//                             _formatCurrency(_summary['netBalance']?.toDouble() ?? 0),
//                             Colors.purple,
//                           ),
//                         ),
//                         const SizedBox(width: 12),
//                         Expanded(
//                           child: _buildSummaryCard(
//                             Icons.receipt_long,
//                             'Total Transactions',
//                             _transactions.length.toString(),
//                             Colors.blue,
//                           ),
//                         ),
//                       ],
//                     ),
//                   ],
//                 ),
//               ),

//               // Filters
//               Padding(
//                 padding: const EdgeInsets.symmetric(horizontal: 16),
//                 child: Row(
//                   children: [
//                     Expanded(
//                       child: TextField(
//                         controller: _searchController,
//                         decoration: InputDecoration(
//                           hintText: 'Search transactions...',
//                           prefixIcon: const Icon(Icons.search),
//                           filled: true,
//                           fillColor: Colors.white,
//                           border: OutlineInputBorder(
//                             borderRadius: BorderRadius.circular(12),
//                             borderSide: BorderSide.none,
//                           ),
//                         ),
//                       ),
//                     ),
//                     const SizedBox(width: 12),
//                     Container(
//                       padding: const EdgeInsets.symmetric(horizontal: 12),
//                       decoration: BoxDecoration(
//                         color: Colors.white,
//                         borderRadius: BorderRadius.circular(12),
//                       ),
//                       child: DropdownButton<String>(
//                         value: _selectedType,
//                         hint: const Text('All Transactions'),
//                         underline: const SizedBox(),
//                         items: const [
//                           DropdownMenuItem(value: null, child: Text('All')),
//                           DropdownMenuItem(value: 'deposit', child: Text('Deposits')),
//                           DropdownMenuItem(value: 'withdrawal', child: Text('Withdrawals')),
//                         ],
//                         onChanged: (value) {
//                           setState(() => _selectedType = value);
//                           _loadTransactions();
//                         },
//                       ),
//                     ),
//                   ],
//                 ),
//               ),

//               const SizedBox(height: 16),

//               // Transactions List
//               if (_isLoading)
//                 const Center(
//                   child: Padding(
//                     padding: EdgeInsets.all(32),
//                     child: CircularProgressIndicator(),
//                   ),
//                 )
//               else if (_transactions.isEmpty)
//                 Center(
//                   child: Padding(
//                     padding: const EdgeInsets.all(32),
//                     child: Column(
//                       children: const [
//                         Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey),
//                         SizedBox(height: 16),
//                         Text(
//                           'No transactions yet',
//                           style: TextStyle(fontSize: 18, color: Colors.grey),
//                         ),
//                       ],
//                     ),
//                   ),
//                 )
//               else
//                 Padding(
//                   padding: const EdgeInsets.symmetric(horizontal: 16),
//                   child: Container(
//                     decoration: BoxDecoration(
//                       color: Colors.white,
//                       borderRadius: BorderRadius.circular(16),
//                     ),
//                     child: Column(
//                       children: [
//                         ListView.separated(
//                           shrinkWrap: true,
//                           physics: const NeverScrollableScrollPhysics(),
//                           itemCount: _transactions.length,
//                           separatorBuilder: (context, index) => const Divider(height: 1),
//                           itemBuilder: (context, index) {
//                             final transaction = _transactions[index];
//                             return _buildTransactionItem(transaction);
//                           },
//                         ),
//                         if (_totalPages > 1)
//                           Padding(
//                             padding: const EdgeInsets.all(16),
//                             child: Row(
//                               mainAxisAlignment: MainAxisAlignment.center,
//                               children: [
//                                 IconButton(
//                                   onPressed: _currentPage > 1
//                                       ? () {
//                                           setState(() => _currentPage--);
//                                           _loadTransactions();
//                                         }
//                                       : null,
//                                   icon: const Icon(Icons.chevron_left),
//                                 ),
//                                 Text('Page $_currentPage of $_totalPages'),
//                                 IconButton(
//                                   onPressed: _currentPage < _totalPages
//                                       ? () {
//                                           setState(() => _currentPage++);
//                                           _loadTransactions();
//                                         }
//                                       : null,
//                                   icon: const Icon(Icons.chevron_right),
//                                 ),
//                               ],
//                             ),
//                           ),
//                       ],
//                     ),
//                   ),
//                 ),

//               const SizedBox(height: 24),

//               // Action Buttons
//               Padding(
//                 padding: const EdgeInsets.all(16),
//                 child: Row(
//                   children: [
//                     Expanded(
//                       child: ElevatedButton.icon(
//                         onPressed: _showAddTransactionDialog,
//                         icon: const Icon(Icons.add),
//                         label: const Text('Add Deposit'),
//                         style: ElevatedButton.styleFrom(
//                           backgroundColor: Colors.green,
//                           padding: const EdgeInsets.symmetric(vertical: 16),
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(12),
//                           ),
//                         ),
//                       ),
//                     ),
//                     const SizedBox(width: 12),
//                     Expanded(
//                       child: ElevatedButton.icon(
//                         onPressed: _showAddTransactionDialog,
//                         icon: const Icon(Icons.remove),
//                         label: const Text('Record Withdrawal'),
//                         style: ElevatedButton.styleFrom(
//                           backgroundColor: const Color(0xFF7C3AED),
//                           padding: const EdgeInsets.symmetric(vertical: 16),
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(12),
//                           ),
//                         ),
//                       ),
//                     ),
//                   ],
//                 ),
//               ),

//               const SizedBox(height: 24),
//             ],
//           ),
//         ),
//       ),
//     );
//   }

//   Widget _buildSummaryCard(IconData icon, String label, String value, Color color) {
//     return Container(
//       padding: const EdgeInsets.all(16),
//       decoration: BoxDecoration(
//         color: Colors.white,
//         borderRadius: BorderRadius.circular(12),
//         border: Border.all(color: color.withOpacity(0.2)),
//       ),
//       child: Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           Icon(icon, color: color, size: 24),
//           const SizedBox(height: 8),
//           Text(
//             value,
//             style: TextStyle(
//               fontSize: 20,
//               fontWeight: FontWeight.bold,
//               color: color,
//             ),
//           ),
//           const SizedBox(height: 4),
//           Text(
//             label,
//             style: const TextStyle(fontSize: 12, color: Colors.grey),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildTransactionItem(Map<String, dynamic> transaction) {
//     final isDeposit = transaction['type'] == 'deposit';
//     final amount = transaction['amount']?.toDouble() ?? 0;
//     final category = transaction['category'] ?? 'Other';
//     final description = transaction['description'] ?? 'No description';
//     final date = DateTime.parse(transaction['createdAt']);
//     final formattedDate = DateFormat('dd MMM yyyy, hh:mm a').format(date);

//     return ListTile(
//       contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
//       leading: Container(
//         padding: const EdgeInsets.all(10),
//         decoration: BoxDecoration(
//           color: _getCategoryColor(category).withOpacity(0.1),
//           borderRadius: BorderRadius.circular(12),
//         ),
//         child: Icon(
//           _getCategoryIcon(category),
//           color: _getCategoryColor(category),
//         ),
//       ),
//       title: Text(
//         description,
//         style: const TextStyle(fontWeight: FontWeight.w600),
//         maxLines: 1,
//         overflow: TextOverflow.ellipsis,
//       ),
//       subtitle: Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           Text(
//             formattedDate,
//             style: const TextStyle(fontSize: 12, color: Colors.grey),
//           ),
//           const SizedBox(height: 4),
//           Container(
//             padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
//             decoration: BoxDecoration(
//               color: isDeposit ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
//               borderRadius: BorderRadius.circular(4),
//             ),
//             child: Text(
//               category,
//               style: TextStyle(
//                 fontSize: 10,
//                 color: isDeposit ? Colors.green : Colors.red,
//                 fontWeight: FontWeight.w500,
//               ),
//             ),
//           ),
//         ],
//       ),
//       trailing: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         crossAxisAlignment: CrossAxisAlignment.end,
//         children: [
//           Text(
//             '${isDeposit ? '+' : '-'}${_formatCurrency(amount)}',
//             style: TextStyle(
//               fontSize: 16,
//               fontWeight: FontWeight.bold,
//               color: isDeposit ? Colors.green : Colors.red,
//             ),
//           ),
//           Container(
//             margin: const EdgeInsets.only(top: 4),
//             padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
//             decoration: BoxDecoration(
//               color: Colors.blue.withOpacity(0.1),
//               borderRadius: BorderRadius.circular(4),
//             ),
//             child: const Text(
//               'Completed',
//               style: TextStyle(fontSize: 10, color: Colors.blue),
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   @override
//   void dispose() {
//     _searchController.dispose();
//     super.dispose();
//   }
// }

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'sms_parser_service.dart';
import 'sms_listener_service.dart';

class TransactionHistoryPage extends StatefulWidget {
  const TransactionHistoryPage({Key? key}) : super(key: key);

  @override
  State<TransactionHistoryPage> createState() => _TransactionHistoryPageState();
}

class _TransactionHistoryPageState extends State<TransactionHistoryPage> {
  bool _isLoading = true;
  List<dynamic> _transactions = [];
  Map<String, dynamic> _summary = {};
  int _currentPage = 1;
  int _totalPages = 1;
  String? _selectedType;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() => _isLoading = true);

    final result = await SMSParserService.fetchTransactions(
      page: _currentPage,
      type: _selectedType,
    );

    if (result['ok'] == true) {
      final data = result['data'];
      setState(() {
        _transactions = data['transactions'] ?? [];
        _summary = data['summary'] ?? {};
        _totalPages = data['totalPages'] ?? 1;
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['error'] ?? 'Failed to load transactions')),
      );
    }
  }

  Future<void> _showAddTransactionDialog() async {
    final amountController = TextEditingController();
    final descriptionController = TextEditingController();
    String selectedType = 'deposit';
    String selectedCategory = 'Other';

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Transaction'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: amountController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Amount',
                    prefixText: '₹',
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: const [
                    DropdownMenuItem(value: 'deposit', child: Text('Deposit')),
                    DropdownMenuItem(value: 'withdrawal', child: Text('Withdrawal')),
                  ],
                  onChanged: (value) {
                    setState(() => selectedType = value!);
                  },
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: selectedCategory,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: const [
                    DropdownMenuItem(value: 'Food & Dining', child: Text('Food & Dining')),
                    DropdownMenuItem(value: 'Entertainment', child: Text('Entertainment')),
                    DropdownMenuItem(value: 'Shopping', child: Text('Shopping')),
                    DropdownMenuItem(value: 'Travel', child: Text('Travel')),
                    DropdownMenuItem(value: 'Bills & Utilities', child: Text('Bills & Utilities')),
                    DropdownMenuItem(value: 'Healthcare', child: Text('Healthcare')),
                    DropdownMenuItem(value: 'Education', child: Text('Education')),
                    DropdownMenuItem(value: 'Salary', child: Text('Salary')),
                    DropdownMenuItem(value: 'Other', child: Text('Other')),
                  ],
                  onChanged: (value) {
                    setState(() => selectedCategory = value!);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(amountController.text);
                if (amount == null || descriptionController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please fill all fields')),
                  );
                  return;
                }

                final result = await SMSParserService.sendTransaction({
                  'amount': amount,
                  'type': selectedType,
                  'description': descriptionController.text,
                  'category': selectedCategory,
                  'timestamp': DateTime.now().toIso8601String(),
                });

                if (!mounted) return;
                Navigator.pop(context);

                if (result['ok'] == true) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Transaction added successfully')),
                  );
                  _loadTransactions();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(result['error'] ?? 'Failed to add transaction')),
                  );
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatCurrency(double amount) {
    return '₹${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}';
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Food & Dining': return Icons.restaurant;
      case 'Entertainment': return Icons.movie;
      case 'Shopping': return Icons.shopping_bag;
      case 'Travel': return Icons.flight;
      case 'Bills & Utilities': return Icons.receipt;
      case 'Healthcare': return Icons.local_hospital;
      case 'Education': return Icons.school;
      case 'Salary': return Icons.account_balance_wallet;
      case 'Freelance': return Icons.work;
      case 'Investment': return Icons.trending_up;
      default: return Icons.category;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Food & Dining': return Colors.orange;
      case 'Entertainment': return Colors.purple;
      case 'Shopping': return Colors.pink;
      case 'Travel': return Colors.blue;
      case 'Bills & Utilities': return Colors.teal;
      case 'Healthcare': return Colors.red;
      case 'Education': return Colors.indigo;
      case 'Salary': return Colors.green;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7C3AED),
        elevation: 0,
        title: Row(
          children: const [
            Icon(Icons.flash_on, size: 28),
            SizedBox(width: 8),
            Text('GoalAura', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadTransactions,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF7C3AED), Color(0xFF9333EA)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Transaction History',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Track all your deposits and withdrawals in one place',
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                  ],
                ),
              ),

              // Summary Cards
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _buildSummaryCard(
                            Icons.trending_up,
                            'Total Deposits',
                            _formatCurrency(_summary['totalDeposits']?.toDouble() ?? 0),
                            Colors.green,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildSummaryCard(
                            Icons.trending_down,
                            'Total Withdrawals',
                            _formatCurrency(_summary['totalWithdrawals']?.toDouble() ?? 0),
                            Colors.red,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildSummaryCard(
                            Icons.wallet,
                            'Net Balance',
                            _formatCurrency(_summary['netBalance']?.toDouble() ?? 0),
                            Colors.purple,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildSummaryCard(
                            Icons.receipt_long,
                            'Total Transactions',
                            _transactions.length.toString(),
                            Colors.blue,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Filters
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          hintText: 'Search transactions...',
                          prefixIcon: const Icon(Icons.search),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButton<String>(
                        value: _selectedType,
                        hint: const Text('All Transactions'),
                        underline: const SizedBox(),
                        items: const [
                          DropdownMenuItem(value: null, child: Text('All')),
                          DropdownMenuItem(value: 'deposit', child: Text('Deposits')),
                          DropdownMenuItem(value: 'withdrawal', child: Text('Withdrawals')),
                        ],
                        onChanged: (value) {
                          setState(() => _selectedType = value);
                          _loadTransactions();
                        },
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Transactions List
              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (_transactions.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: const [
                        Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'No transactions yet',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _transactions.length,
                          separatorBuilder: (context, index) => const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final transaction = _transactions[index];
                            return _buildTransactionItem(transaction);
                          },
                        ),
                        if (_totalPages > 1)
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                IconButton(
                                  onPressed: _currentPage > 1
                                      ? () {
                                          setState(() => _currentPage--);
                                          _loadTransactions();
                                        }
                                      : null,
                                  icon: const Icon(Icons.chevron_left),
                                ),
                                Text('Page $_currentPage of $_totalPages'),
                                IconButton(
                                  onPressed: _currentPage < _totalPages
                                      ? () {
                                          setState(() => _currentPage++);
                                          _loadTransactions();
                                        }
                                      : null,
                                  icon: const Icon(Icons.chevron_right),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

              const SizedBox(height: 24),

              // Action Buttons
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _showAddTransactionDialog,
                            icon: const Icon(Icons.add),
                            label: const Text('Add Deposit'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _showAddTransactionDialog,
                            icon: const Icon(Icons.remove),
                            label: const Text('Record Withdrawal'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF7C3AED),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // 🧪 TEST BUTTON FOR SIMULATOR
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.orange),
                      ),
                      child: Column(
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                            child: Row(
                              children: const [
                                Icon(Icons.science, color: Colors.orange, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'Testing Tools (Simulator Only)',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.orange,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                            child: Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () async {
                                      // Test with a single sample SMS
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Testing SMS Parser...'),
                                          duration: Duration(seconds: 1),
                                        ),
                                      );
                                      
                                      await SMSSimulator.simulateSMS(
                                        'Rs 750.00 debited from your account XXXX1234 from SWIGGY on 21-DEC-24'
                                      );
                                      
                                      // Wait a bit then refresh
                                      await Future.delayed(const Duration(seconds: 1));
                                      _loadTransactions();
                                      
                                      if (!mounted) return;
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('✅ Test transaction added!'),
                                          backgroundColor: Colors.green,
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.message, size: 18),
                                    label: const Text('Test Single SMS'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.orange,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () async {
                                      // Run all tests
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Running all SMS tests...'),
                                          duration: Duration(seconds: 2),
                                        ),
                                      );
                                      
                                      await SMSSimulator.runTests();
                                      
                                      // Wait a bit then refresh
                                      await Future.delayed(const Duration(seconds: 2));
                                      _loadTransactions();
                                      
                                      if (!mounted) return;
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('✅ All test transactions added!'),
                                          backgroundColor: Colors.green,
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.playlist_add_check, size: 18),
                                    label: const Text('Run All Tests'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.deepOrange,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
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
      ),
    );
  }

  Widget _buildSummaryCard(IconData icon, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(Map<String, dynamic> transaction) {
    final isDeposit = transaction['type'] == 'deposit';
    final amount = transaction['amount']?.toDouble() ?? 0;
    final category = transaction['category'] ?? 'Other';
    final description = transaction['description'] ?? 'No description';
    final date = DateTime.parse(transaction['createdAt']);
    final formattedDate = DateFormat('dd MMM yyyy, hh:mm a').format(date);

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: _getCategoryColor(category).withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          _getCategoryIcon(category),
          color: _getCategoryColor(category),
        ),
      ),
      title: Text(
        description,
        style: const TextStyle(fontWeight: FontWeight.w600),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            formattedDate,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isDeposit ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              category,
              style: TextStyle(
                fontSize: 10,
                color: isDeposit ? Colors.green : Colors.red,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '${isDeposit ? '+' : '-'}${_formatCurrency(amount)}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDeposit ? Colors.green : Colors.red,
            ),
          ),
          Container(
            margin: const EdgeInsets.only(top: 4),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text(
              'Completed',
              style: TextStyle(fontSize: 10, color: Colors.blue),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}