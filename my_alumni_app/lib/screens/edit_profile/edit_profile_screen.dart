import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/user.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class EditProfileScreen extends StatefulWidget {
  final User user;
  const EditProfileScreen({Key? key, required this.user}) : super(key: key);

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _controllers = {};
  final List<String> _skills = [];
  final List<String> _interests = [];
  final Map<String, TextEditingController> _socialLinks = {};
  bool _isLoading = false;

  // Preferences
  bool _emailNotifications = true;
  bool _smsNotifications = true;
  bool _pushNotifications = true;
  bool _showEmail = true;
  bool _showPhone = true;
  bool _showLocation = true;

  @override
  void initState() {
    super.initState();
    final u = widget.user;
    final p = u.profile;
    final prefs = u.preferences;
    // Basic
    _controllers['firstName'] = TextEditingController(text: u.firstName);
    _controllers['lastName'] = TextEditingController(text: u.lastName);
    _controllers['email'] = TextEditingController(text: u.email);
    _controllers['phone'] = TextEditingController(text: u.phone);
    // Academic/Professional
    _controllers['graduationYear'] =
        TextEditingController(text: p?.graduationYear?.toString() ?? '');
    _controllers['degree'] = TextEditingController(text: p?.degree ?? '');
    _controllers['major'] = TextEditingController(text: p?.major ?? '');
    _controllers['profession'] =
        TextEditingController(text: p?.profession ?? '');
    _controllers['company'] = TextEditingController(text: p?.company ?? '');
    _controllers['bio'] = TextEditingController(text: p?.bio ?? '');
    // Location
    _controllers['city'] = TextEditingController(text: p?.location?.city ?? '');
    _controllers['country'] =
        TextEditingController(text: p?.location?.country ?? '');
    _controllers['lat'] = TextEditingController(
        text: p?.location?.coordinates?.lat?.toString() ?? '');
    _controllers['lng'] = TextEditingController(
        text: p?.location?.coordinates?.lng?.toString() ?? '');
    // Skills/Interests
    _skills.addAll(p?.skills ?? []);
    _interests.addAll(p?.interests ?? []);
    // Social Links
    final links = p?.socialLinks ?? {};
    for (final platform in [
      'LinkedIn',
      'Twitter',
      'Facebook',
      'GitHub',
      'Website'
    ]) {
      _socialLinks[platform] =
          TextEditingController(text: links[platform] ?? '');
    }
    // Preferences
    if (prefs != null) {
      _emailNotifications = prefs.emailNotifications;
      _smsNotifications = prefs.smsNotifications;
      _pushNotifications = prefs.pushNotifications;
      _showEmail = prefs.privacy.showEmail;
      _showPhone = prefs.privacy.showPhone;
      _showLocation = prefs.privacy.showLocation;
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    for (final c in _socialLinks.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _addChip(List<String> list, TextEditingController controller) {
    final value = controller.text.trim();
    if (value.isNotEmpty && !list.contains(value)) {
      setState(() {
        list.add(value);
        controller.clear();
      });
    }
  }

  void _removeChip(List<String> list, String value) {
    setState(() {
      list.remove(value);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final Map<String, dynamic> update = {};
    void addIfNotEmpty(String key, String value) {
      if (value.trim().isNotEmpty) update[key] = value.trim();
    }

    addIfNotEmpty('firstName', _controllers['firstName']!.text);
    addIfNotEmpty('lastName', _controllers['lastName']!.text);
    addIfNotEmpty('email', _controllers['email']!.text);
    addIfNotEmpty('phone', _controllers['phone']!.text);

    // Profile sub-map
    final Map<String, dynamic> profile = {};
    if (_controllers['graduationYear']!.text.trim().isNotEmpty) {
      profile['graduationYear'] =
          int.tryParse(_controllers['graduationYear']!.text.trim());
    }
    addIfNotEmpty('degree', _controllers['degree']!.text);
    addIfNotEmpty('major', _controllers['major']!.text);
    addIfNotEmpty('profession', _controllers['profession']!.text);
    addIfNotEmpty('company', _controllers['company']!.text);
    addIfNotEmpty('bio', _controllers['bio']!.text);
    if (_skills.isNotEmpty) profile['skills'] = _skills;
    if (_interests.isNotEmpty) profile['interests'] = _interests;
    // Social links
    final Map<String, String> socialLinks = {};
    _socialLinks.forEach((platform, controller) {
      if (controller.text.trim().isNotEmpty) {
        socialLinks[platform] = controller.text.trim();
      }
    });
    if (socialLinks.isNotEmpty) profile['socialLinks'] = socialLinks;
    // Location
    final Map<String, dynamic> location = {};
    addIfNotEmpty('city', _controllers['city']!.text);
    addIfNotEmpty('country', _controllers['country']!.text);
    if (_controllers['lat']!.text.trim().isNotEmpty) {
      location['lat'] = double.tryParse(_controllers['lat']!.text.trim());
    }
    if (_controllers['lng']!.text.trim().isNotEmpty) {
      location['lng'] = double.tryParse(_controllers['lng']!.text.trim());
    }
    if (location.isNotEmpty)
      profile['location'] = {
        'city': _controllers['city']!.text.trim(),
        'country': _controllers['country']!.text.trim(),
        'coordinates': {
          'lat': double.tryParse(_controllers['lat']!.text.trim()),
          'lng': double.tryParse(_controllers['lng']!.text.trim()),
        }
      };
    if (profile.isNotEmpty) update['profile'] = profile;

    // Preferences
    update['preferences'] = {
      'emailNotifications': _emailNotifications,
      'smsNotifications': _smsNotifications,
      'pushNotifications': _pushNotifications,
      'privacy': {
        'showEmail': _showEmail,
        'showPhone': _showPhone,
        'showLocation': _showLocation,
      }
    };

    try {
      final updatedUser = await ApiService.updateUserProfile(update);
      if (!mounted) return;
      context.read<AuthProvider>().refreshUser();
      Navigator.pop(context, updatedUser);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Profile updated!'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Update failed: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final skillController = TextEditingController();
    final interestController = TextEditingController();
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Basic Info
              ExpansionTile(
                initiallyExpanded: true,
                title: const Text('Basic Info'),
                children: [
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['firstName'],
                    decoration: const InputDecoration(labelText: 'First Name'),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['lastName'],
                    decoration: const InputDecoration(labelText: 'Last Name'),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['email'],
                    decoration: const InputDecoration(labelText: 'Email'),
                    validator: (v) =>
                        v != null && v.contains('@') ? null : 'Invalid email',
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['phone'],
                    decoration: const InputDecoration(labelText: 'Phone'),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
              // Academic/Professional
              ExpansionTile(
                title: const Text('Academic & Professional'),
                children: [
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['graduationYear'],
                    decoration:
                        const InputDecoration(labelText: 'Graduation Year'),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['degree'],
                    decoration: const InputDecoration(labelText: 'Degree'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['major'],
                    decoration: const InputDecoration(labelText: 'Major'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['profession'],
                    decoration: const InputDecoration(labelText: 'Profession'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['company'],
                    decoration: const InputDecoration(labelText: 'Company'),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
              // Bio, Skills, Interests
              ExpansionTile(
                title: const Text('Bio, Skills & Interests'),
                children: [
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['bio'],
                    decoration: const InputDecoration(labelText: 'Bio'),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  // Skills
                  Wrap(
                    spacing: 8,
                    children: _skills
                        .map((skill) => Chip(
                              label: Text(skill),
                              onDeleted: () => _removeChip(_skills, skill),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: skillController,
                          decoration:
                              const InputDecoration(labelText: 'Add Skill'),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: () => _addChip(_skills, skillController),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Interests
                  Wrap(
                    spacing: 8,
                    children: _interests
                        .map((interest) => Chip(
                              label: Text(interest),
                              onDeleted: () =>
                                  _removeChip(_interests, interest),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: interestController,
                          decoration:
                              const InputDecoration(labelText: 'Add Interest'),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: () =>
                            _addChip(_interests, interestController),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
              // Social Links
              ExpansionTile(
                title: const Text('Social Links'),
                children: [
                  for (final entry in _socialLinks.entries) ...[
                    TextFormField(
                      controller: entry.value,
                      decoration: InputDecoration(labelText: entry.key),
                    ),
                    const SizedBox(height: 16),
                  ],
                ],
              ),
              // Location
              ExpansionTile(
                title: const Text('Location'),
                children: [
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['city'],
                    decoration: const InputDecoration(labelText: 'City'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['country'],
                    decoration: const InputDecoration(labelText: 'Country'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['lat'],
                    decoration: const InputDecoration(labelText: 'Latitude'),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _controllers['lng'],
                    decoration: const InputDecoration(labelText: 'Longitude'),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),
                ],
              ),
              // Preferences
              ExpansionTile(
                title: const Text('Preferences & Privacy'),
                children: [
                  const SizedBox(height: 16),
                  // Only privacy switches below
                  SwitchListTile(
                    title: const Text('Show Email'),
                    value: _showEmail,
                    onChanged: (v) => setState(() => _showEmail = v),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: const Text('Show Phone'),
                    value: _showPhone,
                    onChanged: (v) => setState(() => _showPhone = v),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: const Text('Show Location'),
                    value: _showLocation,
                    onChanged: (v) => setState(() => _showLocation = v),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Save Changes'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
