# Daily Routine Task App

## Overview
A daily routine task management application that helps users create, manage, and track their daily tasks with habit streaks and progress analytics. The application displays content in English and includes comprehensive notification scheduling and weekly progress visualization. The app is built as a Progressive Web App (PWA) with full offline capability and Play Store publishing support through Trusted Web Activity (TWA) configuration.

## Core Features

### Task Management
- Create new daily tasks with title and optional description
- Edit existing tasks (title, description, reminder time)
- Delete tasks from the daily list
- Mark tasks as completed using checkboxes
- Mark tasks as procrastinated with dedicated procrastination button
- View all tasks in a clean, organized list with visual distinction for procrastinated tasks

### Procrastination Feature
- Procrastination button placed beside the "Add Task" button or near each task card
- Visual distinction for procrastinated tasks (grayed out title, ⏳ icon display)
- Optional "Procrastinated" section to group procrastinated tasks
- Playful yet professional button design with rounded corners and subtle animations
- Tooltip text "Procrastinate this task 😅" on hover
- Procrastination status stored and managed in the backend

### Reminders and Notifications
- Set reminder times for individual tasks
- Browser-based local notifications at specified times with scheduled alerts
- Notification permission management
- Settings to enable/disable reminders and notification permissions
- No email notifications required

### Progress Tracking
- Simple analytics showing tasks completed per day
- Visual progress indicators with charts
- Calendar view showing completion history
- Daily completion percentage
- Weekly progress chart displaying tasks completed each day of the week
- Chart-based visualization of weekly performance trends using completion data

### Habit Streaks
- Track consecutive days of task completion
- Display current streak count for each task
- Visual streak indicators and motivational elements
- Streak history and best streak records

### Daily Reset
- Automatic reset of task completion status at midnight
- Option to enable/disable automatic daily reset
- Manual reset option available

### Settings
- Enable/disable reminder notifications
- Manage notification permissions
- Configure automatic daily reset preferences

### Progressive Web App Features
- Full PWA support with manifest.json containing app metadata
- Service worker for offline functionality and asset caching
- Installable on mobile devices with "Add to Home Screen" capability
- Standalone display mode for native app-like experience
- Proper PWA icons in multiple sizes (64x64, 128x128, 256x256, 512x512)
- Offline capability for core task management features
- PWA-optimized build configuration

### Trusted Web Activity (TWA) Configuration
- Bubblewrap setup for Play Store publishing
- twa-manifest.json configuration file with PWA URL, app name, short name, theme color, background color, and icon references
- Integration of existing PWA assets (app-icon files) into Bubblewrap configuration
- Build scripts for generating Android App Bundle (.aab) files
- Documentation for Play Store upload process
- TWA-specific configuration for Android platform compatibility

### User Interface
- Clean and motivating design
- Calendar view for tracking progress
- Streak visualization
- Weekly progress charts and trend visualization
- Settings panel for notification and reminder preferences
- Responsive layout for desktop and mobile
- PWA-optimized interface with proper meta tags and manifest integration
- Modern sign-in button with gradient design (blue to purple), hover animations, shadow effects, scale transitions, and login icon integration
- Accessible sign-in button with proper ARIA labels and contrast compliance

## Data Storage (Backend)
- User tasks with titles, descriptions, reminder times, and procrastination status
- Task completion history with timestamps
- Weekly completion data for chart generation
- Streak data and records
- User preferences (auto-reset settings, notification preferences)
- Daily and weekly analytics data

## Backend Operations
- CRUD operations for tasks including procrastination status updates
- Store and retrieve completion history
- Generate weekly completion data for charts
- Calculate and update streak data
- Manage user preferences including notification settings
- Generate analytics data for progress tracking and weekly trends
- Update and retrieve procrastination status for tasks
