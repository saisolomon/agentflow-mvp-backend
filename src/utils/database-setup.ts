import { supabase } from '../services/database';
import fs from 'fs';
import path from 'path';

export const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up database schema...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../../database/schema.sql'),
      'utf8'
    );
    
    // Execute schema in chunks (Supabase has limitations on large queries)
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement.includes('CREATE') || statement.includes('INSERT')) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error && !error.message.includes('already exists')) {
          console.warn('Schema warning:', error.message);
        }
      }
    }
    
    console.log('✅ Database schema setup completed');
    
    // Setup seed data
    console.log('🌱 Setting up seed data...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../../database/seed-data.sql'),
      'utf8'
    );
    
    const seedStatements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of seedStatements) {
      if (statement.includes('INSERT')) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error && !error.message.includes('duplicate key')) {
          console.warn('Seed data warning:', error.message);
        }
      }
    }
    
    console.log('✅ Seed data setup completed');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
};

// Alternative manual setup for Supabase
export const manualDatabaseSetup = async () => {
  console.log('📋 Manual database setup instructions:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the contents of database/schema.sql');
  console.log('4. Run the schema');
  console.log('5. Copy and paste the contents of database/seed-data.sql');
  console.log('6. Run the seed data');
  console.log('');
  console.log('Schema file: backend/database/schema.sql');
  console.log('Seed file: backend/database/seed-data.sql');
};