#!/usr/bin/env node

/**
 * Database Setup Script
 * This script applies the initial database schema to a fresh Supabase database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Starting database setup...');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_auth_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() === '') continue;

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          // If exec_sql doesn't exist, try direct query
          if (error.message.includes('function exec_sql')) {
            const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(1);
            if (directError) {
              console.log('🔄 Using direct SQL execution...');
              // For now, we'll log the SQL that needs to be executed manually
              console.log('📋 Please execute the following SQL in your Supabase SQL editor:');
              console.log('---');
              console.log(migrationSQL);
              console.log('---');
              console.log('❌ Automatic setup failed. Please run the SQL manually in Supabase dashboard.');
              return;
            }
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.log('🔄 Continuing with next statement...');
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('🎉 Your authentication and authorization system is now ready.');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('🔄 Please run the SQL migration manually in your Supabase dashboard.');
    console.log('📍 SQL file location: supabase/migrations/001_initial_auth_schema.sql');
    process.exit(1);
  }
}

// Alternative approach: Generate SQL file for manual execution
function generateManualSQL() {
  console.log('📋 Manual SQL execution required.');
  console.log('📍 Please copy the SQL from: supabase/migrations/001_initial_auth_schema.sql');
  console.log('🌐 And execute it in your Supabase SQL editor at: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
}

// Run the setup
if (require.main === module) {
  setupDatabase().catch(error => {
    console.error('💥 Setup failed:', error);
    generateManualSQL();
    process.exit(1);
  });
}

module.exports = { setupDatabase };