# API Setup Guide

## Overview
This Flutter app connects to your alumni backend system to fetch announcements, events, jobs, and other data.

## Configuration

### 1. API Base URL Configuration
Edit `lib/constants/api_config.dart` to set the correct API base URL for your environment:

```dart
// Change this line based on your development environment
static const String baseUrl = androidEmulatorUrl;
```

### 2. Environment-Specific URLs

- **Android Emulator**: `http://10.0.2.2:5000/api`
- **Web Development**: `http://127.0.0.1:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5000/api`

### 3. For Physical Device Testing
If testing on a physical device, replace `YOUR_COMPUTER_IP` with your computer's actual IP address:

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in CMD
   - **Mac/Linux**: Run `ifconfig` in Terminal
2. Update the `physicalDeviceUrl` in `api_config.dart`
3. Change `baseUrl` to `physicalDeviceUrl`

## Backend Requirements

### 1. Server Must Be Running
Ensure your alumni backend system is running on port 5000.

### 2. Required Endpoints
The app expects these endpoints to be available:

- `GET /api/announcements` - Fetch announcements
- `POST /api/announcements/:id/like` - Like/unlike announcements
- `POST /api/announcements/:id/comments` - Add comments
- `GET /api/auth/login` - User authentication
- `GET /api/auth/register` - User registration

### 3. CORS Configuration
If testing on web, ensure your backend allows CORS requests from the Flutter app.

## Testing Connection

### 1. Use the WiFi Button
In the News/Announcements screen, tap the WiFi icon in the app bar to test the connection.

### 2. Check Console Output
Look for debug messages in the console:
- `=== API SERVICE DEBUG ===`
- `=== TESTING BACKEND CONNECTION ===`
- `=== LOADING ANNOUNCEMENTS ===`

### 3. Common Issues

**Connection Timeout**
- Backend server not running
- Wrong IP address/port
- Firewall blocking connection

**404 Not Found**
- API endpoints not implemented
- Wrong URL path

**401 Unauthorized**
- Authentication required
- Invalid/missing token

## Troubleshooting

### 1. No Announcements Loading
1. Check if backend is running
2. Test connection using WiFi button
3. Check console for error messages
4. Verify API endpoints are working

### 2. Connection Issues
1. Verify IP address is correct
2. Check if backend is accessible from device/emulator
3. Test with browser: `http://YOUR_IP:5000/api/announcements`

### 3. Authentication Issues
1. Ensure user is logged in
2. Check if token is valid
3. Verify auth endpoints are working

## Development Workflow

1. Start your backend server
2. Update `api_config.dart` with correct URL
3. Run Flutter app
4. Test connection using WiFi button
5. Check announcements are loading
6. Debug any issues using console output

## API Documentation
Refer to `ANNOUNCEMENTS_API_DOCS.txt` for detailed API endpoint documentation. 