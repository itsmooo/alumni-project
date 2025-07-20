// constants/app_theme.dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

final appTheme = ThemeData(
  primaryColor: AppColors.primary,
  colorScheme: ColorScheme.light(
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    surface: AppColors.cardBackground,
    error: AppColors.error,
  ),
  scaffoldBackgroundColor: AppColors.background,
  appBarTheme: const AppBarTheme(
    backgroundColor: AppColors.primary,
    foregroundColor: Colors.white,
    elevation: 2,
    centerTitle: true,
    titleTextStyle: TextStyle(
      fontSize: 20,
      fontWeight: FontWeight.bold,
    ),
  ),
  cardTheme: CardThemeData(
    elevation: 1,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    color: AppColors.cardBackground,
    margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
  ),
  inputDecorationTheme: InputDecorationTheme(
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: AppColors.divider),
    ),
    filled: true,
    fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  ),
  buttonTheme: ButtonThemeData(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
  ),
  textTheme: const TextTheme(
    displayLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
    displayMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
    displaySmall: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    bodyLarge: TextStyle(fontSize: 16),
    bodyMedium: TextStyle(fontSize: 14),
    bodySmall: TextStyle(fontSize: 12),
  ).apply(
    bodyColor: AppColors.textPrimary,
    displayColor: AppColors.textPrimary,
  ),
);
