#!/bin/bash

# =============================================
# run-migrations.sh
# Script to run all database migrations in order
# =============================================

echo "🚀 Running Gascart Database Migrations..."
echo ""

# Check if Supabase URL and Key are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "⚠️  Warning: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables not set"
    echo "This script will guide you through running migrations manually"
    echo ""
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS_DIR="$SCRIPT_DIR"

echo "📁 Migrations directory: $MIGRATIONS_DIR"
echo ""

# List all migration files in order
MIGRATIONS=$(ls -1 $MIGRATIONS_DIR/*.sql 2>/dev/null | grep -v "README" | sort)

if [ -z "$MIGRATIONS" ]; then
    echo "❌ No migration files found in $MIGRATIONS_DIR"
    exit 1
fi

echo "📋 Found migrations:"
echo "$MIGRATIONS" | sed 's/^/  - /'
echo ""

# Ask user how they want to run migrations
echo "How would you like to run these migrations?"
echo ""
echo "1. Supabase Dashboard (Manual - will show SQL for each file)"
echo "2. Supabase CLI (Automatic - requires Supabase CLI installed)"
echo "3. Exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📖 Manual Migration Instructions:"
        echo ""
        echo "1. Open your Supabase Dashboard"
        echo "2. Go to SQL Editor"
        echo "3. Run each file in order:"
        echo ""
        
        for file in $MIGRATIONS; do
            filename=$(basename "$file")
            echo "   📄 $filename"
        done
        
        echo ""
        echo "✨ Specifically for stock management RPC functions:"
        echo "   Make sure to run: 17_stock_management.sql"
        echo ""
        echo "Press any key to see the SQL for each file..."
        read -n 1 -s
        
        for file in $MIGRATIONS; do
            filename=$(basename "$file")
            echo ""
            echo "════════════════════════════════════════════════════"
            echo "📄 File: $filename"
            echo "════════════════════════════════════════════════════"
            cat "$file"
            echo ""
            echo "════════════════════════════════════════════════════"
            echo ""
            read -p "Press Enter to continue to next file..."
        done
        ;;
        
    2)
        # Check if Supabase CLI is installed
        if ! command -v supabase &> /dev/null; then
            echo "❌ Supabase CLI is not installed"
            echo ""
            echo "Install it with:"
            echo "  npm install -g supabase"
            echo "  or"
            echo "  brew install supabase/tap/supabase"
            exit 1
        fi
        
        # Check if project is linked
        if [ ! -f "$SCRIPT_DIR/../../.supabase/config.toml" ]; then
            echo "⚠️  Project not linked to Supabase"
            echo ""
            read -p "Enter your Supabase project ref: " project_ref
            
            if [ -z "$project_ref" ]; then
                echo "❌ Project ref is required"
                exit 1
            fi
        fi
        
        echo ""
        echo "🔄 Running migrations..."
        echo ""
        
        migration_count=0
        failed_count=0
        
        for file in $MIGRATIONS; do
            filename=$(basename "$file")
            echo -n "  Running $filename... "
            
            if supabase db execute -f "$file" 2>/dev/null; then
                echo "✅"
                ((migration_count++))
            else
                echo "❌"
                ((failed_count++))
            fi
        done
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✨ Migration Summary:"
        echo "   Successful: $migration_count"
        echo "   Failed: $failed_count"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        if [ $failed_count -eq 0 ]; then
            echo ""
            echo "🎉 All migrations completed successfully!"
        else
            echo ""
            echo "⚠️  Some migrations failed. Please check the errors above."
        fi
        ;;
        
    3)
        echo "👋 Exiting..."
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Migration process complete!"
echo ""
echo "🔍 To verify RPC functions are created, run this SQL in Supabase:"
echo ""
echo "SELECT routine_name, routine_type"
echo "FROM information_schema.routines"
echo "WHERE routine_schema = 'public'"
echo "  AND routine_name IN ("
echo "    'deduct_product_stock',"
echo "    'restore_product_stock',"
echo "    'deduct_variant_stock',"
echo "    'restore_variant_stock'"
echo "  );"
echo ""
