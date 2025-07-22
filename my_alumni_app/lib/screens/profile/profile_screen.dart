// screens/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/user.dart';
import '../../services/api_service.dart';
import '../../utils/api_test.dart';
import '../payments/payment_screen.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../edit_profile/edit_profile_screen.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:http_parser/http_parser.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = false;
  User? _user;
  final RefreshController _refreshController =
      RefreshController(initialRefresh: false);

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  @override
  void dispose() {
    _refreshController.dispose();
    super.dispose();
  }

  Future<void> _loadUserProfile() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      // Use the complete user data from login (now includes full profile)
      if (authProvider.user != null) {
        setState(() {
          _user = authProvider.user;
        });

        print('=== COMPLETE PROFILE FROM LOGIN ===');
        print('User: ${_user?.fullName}');
        print('Email: ${_user?.email}');
        print('Phone: ${_user?.phone}');
        print('Email verified: ${_user?.isEmailVerified}');
        print('Phone verified: ${_user?.isPhoneVerified}');
        print('Profile object: ${_user?.profile != null ? "EXISTS" : "NULL"}');
        if (_user?.profile != null) {
          print('Graduation Year: ${_user?.profile?.graduationYear}');
          print('Degree: ${_user?.profile?.degree}');
          print('Major: ${_user?.profile?.major}');
          print('Skills: ${_user?.profile?.skills}');
          print('Interests: ${_user?.profile?.interests}');
          print('Location: ${_user?.profile?.location}');
        }
        print('Preferences: ${_user?.preferences != null ? "EXISTS" : "NULL"}');
        if (_user?.preferences != null) {
          print('Show Email: ${_user?.preferences?.privacy.showEmail}');
          print('Show Phone: ${_user?.preferences?.privacy.showPhone}');
          print('Show Location: ${_user?.preferences?.privacy.showLocation}');
        }
        print('========================');
      } else {
        print('No user data available');
      }
    } catch (e) {
      print('Error loading profile: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load profile: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    return Scaffold(
      // appBar: AppBar(
      //   title: const Text('Alumni Network'),
      //   actions: [
      //     IconButton(
      //       icon: const Icon(Icons.edit_rounded),
      //       tooltip: 'Edit Profile',
      //       onPressed: user == null
      //           ? null
      //           : () {
      //               Navigator.push(
      //                 context,
      //                 MaterialPageRoute(
      //                   builder: (_) => EditProfileScreen(user: user),
      //                 ),
      //               );
      //             },
      //     ),
      //   ],
      // ),
      backgroundColor: Colors.grey[50],
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header with Gradient
            _buildProfileHeader(user!),

            // Information Cards Grid
            _buildInfoCards(user),

            // Logout Button
            _buildLogoutButton(),

            // Academic Information Section
            _buildAcademicInformation(user),

            // Personal Information Section
            _buildPersonalInformation(user),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(User user) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            Colors.green[700]!,
            Colors.blue[700]!,
          ],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Back Button (if needed)
              Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.edit_rounded, color: Colors.white),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => EditProfileScreen(user: user),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Profile Picture
              Stack(
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: (user.displayProfilePicture != null && user.displayProfilePicture!.isNotEmpty)
                        ? ClipOval(
                            child: Image.network(
                              user.displayProfilePicture!,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Icon(
                                  Icons.person,
                                  size: 60,
                                  color: Colors.white.withOpacity(0.8),
                                );
                              },
                            ),
                          )
                        : (user.profilePicture != null &&
                                user.profilePicture!.isNotEmpty)
                            ? ClipOval(
                                child: Image.network(
                                  user.profilePicture!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Icon(
                                      Icons.person,
                                      size: 60,
                                      color: Colors.white.withOpacity(0.8),
                                    );
                                  },
                                ),
                              )
                            : Icon(
                                Icons.person,
                                size: 60,
                                color: Colors.white.withOpacity(0.8),
                              ),
                  ),
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => _pickAndUploadProfilePicture(user),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        padding: const EdgeInsets.all(6),
                        child: const Icon(Icons.camera_alt,
                            color: Colors.white, size: 20),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Name
              Text(
                user.fullName,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 8),

              // Status Tag
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _getStatusText(user),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCards(User user) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // First Row
          Row(
            children: [
              Expanded(
                child: _buildInfoCard(
                  icon: Icons.person,
                  iconColor: Colors.green,
                  label: 'Student ID',
                  value: user.id.substring(0, 7).toUpperCase(),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildInfoCard(
                  icon: Icons.verified,
                  iconColor: Colors.blue,
                  label: 'Verification',
                  value: _getVerificationStatus(user),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Second Row
          Row(
            children: [
              Expanded(
                child: _buildInfoCard(
                  icon: Icons.school,
                  iconColor: Colors.orange,
                  label: 'Degree',
                  value: _getDegreeValue(user),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildInfoCard(
                  icon: Icons.calendar_today,
                  iconColor: Colors.purple,
                  label: 'Graduation',
                  value: _getGraduationValue(user),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 24),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // Debug button to test API

          // Logout button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _showLogoutDialog(),
              icon: const Icon(Icons.logout, color: Colors.white),
              label: const Text(
                'Logout',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAcademicInformation(User user) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.school, color: Colors.green[700], size: 24),
              const SizedBox(width: 8),
              const Text(
                'Academic Information',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                _buildInfoRow(
                  icon: Icons.business,
                  label: 'Major',
                  value: user.profile?.major ?? 'Not Set',
                ),
                const SizedBox(height: 16),
                _buildInfoRow(
                  icon: Icons.school,
                  label: 'Degree',
                  value: user.profile?.degree ?? 'Not Set',
                ),
                const SizedBox(height: 16),
                _buildInfoRow(
                  icon: Icons.calendar_today,
                  label: 'Graduation Year',
                  value: user.profile?.graduationYear?.toString() ?? 'Not Set',
                ),
                const SizedBox(height: 16),
                _buildInfoRow(
                  icon: Icons.work,
                  label: 'Profession',
                  value: user.profile?.profession ?? 'Not Set',
                ),
                const SizedBox(height: 16),
                _buildInfoRow(
                  icon: Icons.apartment,
                  label: 'Company',
                  value: user.profile?.company ?? 'Not Set',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalInformation(User user) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.person, color: Colors.green[700], size: 24),
              const SizedBox(width: 8),
              const Text(
                'Personal Information',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (user.preferences?.privacy.showEmail ?? true)
                  _buildInfoRow(
                    icon: Icons.email,
                    label: 'Email',
                    value: user.email,
                  ),
                if (user.preferences?.privacy.showEmail ?? true)
                  const SizedBox(height: 16),
                if (user.preferences?.privacy.showPhone ?? true)
                  _buildInfoRow(
                    icon: Icons.phone,
                    label: 'Phone',
                    value: user.phone,
                  ),
                if (user.preferences?.privacy.showPhone ?? true)
                  const SizedBox(height: 16),
                if (user.preferences?.privacy.showLocation ?? true)
                  _buildInfoRow(
                    icon: Icons.location_on,
                    label: 'Location',
                    value: _getLocationText(user),
                  ),
                if (user.preferences?.privacy.showLocation ?? true)
                  const SizedBox(height: 16),
                _buildInfoRow(
                  icon: Icons.verified_user,
                  label: 'Verification Status',
                  value: _getVerificationStatus(user),
                ),
                const SizedBox(height: 16),
                _buildInfoRow(
                  icon: Icons.info_outline,
                  label: 'Bio',
                  value: user.profile?.bio ?? 'Not Set',
                ),
                if (user.profile?.skills?.isNotEmpty == true) ...[
                  const SizedBox(height: 16),
                  _buildInfoRow(
                    icon: Icons.psychology,
                    label: 'Skills',
                    value: user.profile!.skills!.join(', '),
                  ),
                ],
                if (user.profile?.interests?.isNotEmpty == true) ...[
                  const SizedBox(height: 16),
                  _buildInfoRow(
                    icon: Icons.favorite,
                    label: 'Interests',
                    value: user.profile!.interests!.join(', '),
                  ),
                ],
                if (user.profile?.socialLinks != null &&
                    user.profile!.socialLinks!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  for (final entry in user.profile!.socialLinks!.entries)
                    if (entry.value.trim().isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: _buildInfoRow(
                          icon: Icons.link,
                          label: entry.key,
                          value: entry.value,
                        ),
                      ),
                ],
                const SizedBox(height: 16),
                _buildInfoRow(
                  icon: Icons.privacy_tip,
                  label: 'Show Email',
                  value: (user.preferences?.privacy.showEmail ?? true)
                      ? 'Yes'
                      : 'No',
                ),
                const SizedBox(height: 8),
                _buildInfoRow(
                  icon: Icons.privacy_tip,
                  label: 'Show Phone',
                  value: (user.preferences?.privacy.showPhone ?? true)
                      ? 'Yes'
                      : 'No',
                ),
                const SizedBox(height: 8),
                _buildInfoRow(
                  icon: Icons.privacy_tip,
                  label: 'Show Location',
                  value: (user.preferences?.privacy.showLocation ?? true)
                      ? 'Yes'
                      : 'No',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, color: Colors.grey[600], size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _getStatusText(User user) {
    switch (user.role.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      case 'alumni':
        return 'Alumni';
      default:
        return 'Member';
    }
  }

  String _getVerificationStatus(User user) {
    if (user.isEmailVerified && user.isPhoneVerified) {
      return 'Fully Verified';
    } else if (user.isEmailVerified || user.isPhoneVerified) {
      return 'Partially Verified';
    } else {
      return 'Not Verified';
    }
  }

  String _getLocationText(User user) {
    if (user.profile?.location?.city != null &&
        user.profile?.location?.country != null) {
      return '${user.profile!.location!.city}, ${user.profile!.location!.country}';
    } else if (user.profile?.location?.city != null) {
      return user.profile!.location!.city!;
    } else if (user.profile?.location?.country != null) {
      return user.profile!.location!.country!;
    } else {
      return 'Not Set';
    }
  }

  String _getDegreeValue(User user) {
    if (user.profile?.degree != null) {
      return user.profile!.degree!;
    }
    return 'Not Set';
  }

  String _getGraduationValue(User user) {
    if (user.profile?.graduationYear != null) {
      return user.profile!.graduationYear!.toString();
    }
    return 'Not Set';
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Logout'),
          content: const Text('Are you sure you want to logout?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _logout();
              },
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _logout() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();

      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Logout failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _pickAndUploadProfilePicture(User user) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked == null) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final uri = Uri.parse('http://localhost:5000/api/upload/single');
      final request = http.MultipartRequest('POST', uri);
      final token = await ApiService.getToken();
      request.headers['Authorization'] = 'Bearer $token';
      final bytes = await picked.readAsBytes();
      request.files.add(http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: picked.name,
        contentType:
            MediaType('image', picked.mimeType?.split('/').last ?? 'jpeg'),
      ));

      final response = await request.send();
      final respStr = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        final url = jsonDecode(respStr)['url'];
        await ApiService.updateUserProfile({'profilePicture': url});
        if (mounted) {
          context.read<AuthProvider>().refreshUser();
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Profile picture updated!'),
                backgroundColor: Colors.green),
          );
        }
      } else {
        throw Exception(jsonDecode(respStr)['message'] ?? 'Upload failed');
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Upload failed: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }
}
