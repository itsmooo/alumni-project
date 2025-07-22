import 'lib/utils/create_test_announcements.dart';

void main() async {
  print('=== CREATING TEST ANNOUNCEMENTS ===');

  // First check existing announcements
  await TestAnnouncementsCreator.checkExistingAnnouncements();

  // Create test announcements
  await TestAnnouncementsCreator.createTestAnnouncements();

  // Check again after creation
  print('\n=== CHECKING AFTER CREATION ===');
  await TestAnnouncementsCreator.checkExistingAnnouncements();
}
 