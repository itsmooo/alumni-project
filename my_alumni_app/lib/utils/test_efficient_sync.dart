import '../services/api_service.dart';
import '../providers/jobs_provider.dart';

/// Test script to demonstrate the efficiency improvement
///
/// This script shows the difference between the old approach (checking each job individually)
/// and the new approach (getting all applied jobs at once)
class EfficientSyncTest {
  /// Test the old inefficient approach
  static Future<void> testOldApproach(List<String> jobIds) async {
    print('=== TESTING OLD APPROACH (Individual Job Checks) ===');
    final stopwatch = Stopwatch()..start();

    try {
      for (final jobId in jobIds) {
        final hasApplied = await ApiService.hasAppliedForJob(jobId);
        print('Job $jobId: $hasApplied');
      }

      stopwatch.stop();
      print(
          '⏱️  Old approach took: ${stopwatch.elapsedMilliseconds}ms for ${jobIds.length} jobs');
      print(
          '📊 Average: ${stopwatch.elapsedMilliseconds / jobIds.length}ms per job');
    } catch (e) {
      print('❌ Old approach failed: $e');
    }
  }

  /// Test the new efficient approach
  static Future<void> testNewApproach(List<String> jobIds) async {
    print('\n=== TESTING NEW APPROACH (Bulk Job Check) ===');
    final stopwatch = Stopwatch()..start();

    try {
      final appliedJobIds = await ApiService.getUserAppliedJobIds();
      print('User has applied for ${appliedJobIds.length} jobs total');

      // Check each job against the bulk result
      for (final jobId in jobIds) {
        final hasApplied = appliedJobIds.contains(jobId);
        print('Job $jobId: $hasApplied');
      }

      stopwatch.stop();
      print(
          '⏱️  New approach took: ${stopwatch.elapsedMilliseconds}ms for ${jobIds.length} jobs');
      print(
          '📊 Average: ${stopwatch.elapsedMilliseconds / jobIds.length}ms per job');
    } catch (e) {
      print('❌ New approach failed: $e');
    }
  }

  /// Test the JobsProvider efficient sync
  static Future<void> testProviderEfficientSync(List<String> jobIds) async {
    print('\n=== TESTING PROVIDER EFFICIENT SYNC ===');
    final stopwatch = Stopwatch()..start();

    try {
      final provider = JobsProvider();
      await provider.initialize();

      await provider.syncApplicationStatusesForJobs(jobIds);

      // Check results
      for (final jobId in jobIds) {
        final hasApplied = provider.getApplicationStatusSync(jobId);
        print('Job $jobId: $hasApplied');
      }

      stopwatch.stop();
      print(
          '⏱️  Provider sync took: ${stopwatch.elapsedMilliseconds}ms for ${jobIds.length} jobs');
      print(
          '📊 Average: ${stopwatch.elapsedMilliseconds / jobIds.length}ms per job');
    } catch (e) {
      print('❌ Provider sync failed: $e');
    }
  }

  /// Run all tests
  static Future<void> runAllTests() async {
    print('🚀 STARTING EFFICIENCY COMPARISON TESTS\n');

    // Test with different numbers of jobs
    final testCases = [
      ['job1', 'job2', 'job3'], // 3 jobs
      ['job1', 'job2', 'job3', 'job4', 'job5'], // 5 jobs
      List.generate(10, (i) => 'job$i'), // 10 jobs
    ];

    for (final jobIds in testCases) {
      print(
          '🔍 Testing with ${jobIds.length} jobs: ${jobIds.take(3).join(', ')}${jobIds.length > 3 ? '...' : ''}');

      await testOldApproach(jobIds);
      await testNewApproach(jobIds);
      await testProviderEfficientSync(jobIds);

      print('\n' + '=' * 60 + '\n');
    }

    print('✅ All efficiency tests completed!');
    print('\n📈 Expected Results:');
    print('- Old approach: Time increases linearly with job count');
    print('- New approach: Time remains relatively constant');
    print('- Provider sync: Fastest with caching benefits');
  }
}

/// Convenience function to run the tests
Future<void> testEfficiencyImprovement() async {
  await EfficientSyncTest.runAllTests();
}
