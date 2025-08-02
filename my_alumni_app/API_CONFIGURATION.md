# 📱 Flutter App API Configuration

Your Flutter app is now configured to use the **physical device URL** for local development:
```
http://10.1.1.33:5000/api
```

## 🔧 Configuration Details

### Updated API Config (`lib/constants/api_config.dart`)

```dart
class ApiConfig {
  // API Base URLs for different environments
  static const String androidEmulatorUrl = 'http://10.0.2.2:5000/api';
  static const String webDevelopmentUrl = 'http://127.0.0.1:5000/api';
  static const String iosSimulatorUrl = 'http://localhost:5000/api';
  static const String physicalDeviceUrl = 'http://10.1.1.33:5000/api';
  static const String vercelProductionUrl = 'https://alumni-backend-server.vercel.app/api';

  // Current active base URL
  static const String baseUrl = physicalDeviceUrl; // Using physical device URL for local development
}
```

## 🚀 How to Switch Environments

### For Development (Local Backend) - **CURRENT**:
```dart
static const String baseUrl = physicalDeviceUrl; // Using physical device URL
```

### For Production (Vercel Backend):
```dart
static const String baseUrl = vercelProductionUrl; // Vercel URL
```

## 📱 Testing Your App

### 1. Build and Run
```bash
cd my_alumni_app
flutter clean
flutter pub get
flutter run
```

### 2. Test API Connection
- Open the app
- Try to login or register
- Check if API calls work with the new backend

### 3. Debug Network Issues
If you encounter network issues:

1. **Check Local Backend**: Ensure your local backend is running on `http://10.1.1.33:5000`
2. **Verify Network**: Make sure your device can reach the local IP address
3. **Check Logs**: Look for network errors in Flutter console

## 🔍 Environment Detection

The app now includes environment detection:

```dart
// Check current environment
if (ApiConfig.isPhysicalDevice) {
  print('Using Physical Device Backend (Local)');
} else if (ApiConfig.isVercelProduction) {
  print('Using Vercel Production Backend');
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Network Error**: 
   - Check if backend is deployed and accessible
   - Verify URL is correct
   - Check device internet connection

2. **CORS Issues**:
   - Backend should handle CORS properly
   - Check Vercel environment variables

3. **Authentication Issues**:
   - Ensure JWT tokens are being sent correctly
   - Check backend authentication endpoints

### Debug Steps:

1. **Test Backend Health**:
   ```bash
   curl http://10.1.1.33:5000/api/health
   ```

2. **Check API Documentation**:
   ```
   http://10.1.1.33:5000/api-docs
   ```

3. **Monitor Network Requests**:
   - Use Flutter DevTools
   - Check console logs for API calls

## ✅ Success Indicators

Your app is working correctly when:
- ✅ App loads without network errors
- ✅ Login/Register functions work
- ✅ API calls return proper responses
- ✅ No CORS or authentication errors

## 🔄 Switching to Production (Vercel)

If you need to switch to production:

```dart
// In lib/constants/api_config.dart
static const String baseUrl = vercelProductionUrl; // Vercel URL
```

## 📞 Support

If you encounter issues:
1. Check the backend health endpoint
2. Verify environment variables in Vercel
3. Test API endpoints manually
4. Check Flutter network logs

---

**Your Flutter app is now connected to your local backend! 🎉** 