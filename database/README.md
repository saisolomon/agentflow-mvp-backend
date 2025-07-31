# Database Setup Guide

## Quick Setup with Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy your project URL and anon key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and paste contents of `schema.sql`
   - Click "Run"

3. **Add Sample Data**
   - Copy and paste contents of `seed-data.sql`
   - Click "Run"

4. **Update Environment Variables**
   ```env
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

## Schema Overview

### Tables

- **users** - Agent accounts with authentication
- **contacts** - Client contacts from CRM systems
- **messages** - All message communications
- **integrations** - Connected CRM and email accounts
- **voice_sessions** - Voice interaction logs  
- **notification_preferences** - Agent notification settings

### Key Relationships

- Users (agents) have many contacts
- Contacts have many messages
- Users have integrations with external systems
- Voice sessions belong to users

## Sample Data

The seed data includes:
- 2 sample agents (jim.agent@realestate.com, sarah.realtor@homes.com)
- 3 sample contacts with different urgency levels
- Sample messages for testing the reply generation
- Default notification preferences

**Default Password**: `password123` (hashed in database)

## Security Features

- Row Level Security (RLS) enabled
- JWT token authentication
- Password hashing with bcrypt
- Automatic timestamps with triggers