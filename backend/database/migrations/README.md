# Database Migrations

This directory contains SQL migration files for the Gascart e-commerce platform.

## Migration Order

Run these files **in order** in Supabase SQL Editor:

| File | Description |
|------|-------------|
| `01_extensions.sql` | PostgreSQL extensions (UUID) |
| `02_profiles.sql` | User profiles with vendor fields |
| `03_categories.sql` | Hierarchical categories |
| `04_products.sql` | Products with industrial purchase models |
| `05_product_vendors.sql` | Product-Vendor associations |
| `06_rfqs.sql` | Request for Quote system |
| `07_vendor_enquiries.sql` | Vendor applications |
| `08_platform_documents.sql` | Legal/policy documents |
| `09_articles.sql` | Knowledge Hub content |
| `10_consultants.sql` | Expert directory |

## How to Run

### Option 1: Supabase Dashboard
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste each file's contents in order
3. Click **Run** for each file

### Option 2: Supabase CLI
```bash
cd backend/database/migrations
for file in *.sql; do
  supabase db execute --project-ref YOUR_PROJECT_REF < "$file"
done
```

## Key Tables

### Core
- `profiles` - User accounts (extends Supabase auth)
- `categories` - Product/article categories
- `products` - Product catalog

### Vendor Module
- `product_vendors` - Multi-vendor product associations
- `vendor_enquiries` - Vendor application submissions

### RFQ System
- `rfqs` - Technical enquiry submissions

### Content
- `articles` - Knowledge Hub educational content
- `platform_documents` - Legal documents (T&Cs, policies)
- `consultants` - Expert directory

## RLS Policies

Each table has Row Level Security (RLS) enabled with appropriate policies:
- **Public read** for products, categories, articles, consultants
- **Authenticated write** for RFQs, consultant applications
- **Admin full access** for all management operations
