# gascart.in Platform - Comprehensive Admin Operations Manual

## 1. Introduction to the Administrator Dashboard

Welcome to the **gascart.in** backend control center. This secure portal is designed exclusively for authorized personnel to manage the operations, inventory, user data, and content of the gascart.in E-Commerce and Service platform.

This comprehensive manual provides step-by-step instructions for completing everyday tasks, managing platform configurations, handling financial transactions, and ensuring data security. It is intended to ensure that anyone accessing the platform from the backend can operate seamlessly without confusion.

---

## 2. Admin Roles & Access Hierarchy

The platform uses a strict, role-based access control (RBAC) system to ensure data security and operational integrity.

### Role Classifications
- **Super Admin:** Has absolute, unrestricted access to the entire dashboard. Super Admins can manage core platform settings, create new admins, assign permissions, oversee financial configurations, and view the highly secure **Audit Logs**.
- **Module Admins (Mini Admin, Catalog Admin, Content Admin, etc.):** Have restricted, modular access. A Catalog Admin might only see "Products" and "Inventory," with completely hidden access to sensitive areas like "Users", "Financials", or "Global Settings".

### Administrator Management (Super Admin Only)
1. Navigate to **Admin Management** on the sidebar.
2. **To Create:** Click the **Add Administrator** button.
3. Fill in the required details: Full Name, Official Email, and a Temporary Password.
4. **Assign Permissions:** Choose a role preset (Super Admin, Catalog Admin, Order Manager, etc.) or manually toggle specific permission checkboxes for granular control.
5. Click **Create Administrator**. The new admin will be prompted to change their temporary password upon first login.
6. **To Modify/Revoke:** Click on any current administrator in the list. Edit their specific permission checkboxes, or click the **Revoke Access / Delete** button to immediately and permanently remove their access. 

---

## 3. Product & Inventory Management

Managing the extensive catalog is crucial for gascart.in's success. This section covers categories, products, and inventory control.

### Managing Taxonomies (Categories)
Proper categorization improves searchability and SEO on the storefront.
1. Go to **Category Management**.
2. **To Add:** Click "Add Category". Input the category name, SEO-friendly slug, description, and upload a category thumbnail. Select a parent category if you are creating a sub-category. Click Save. 
3. **To Edit/Delete:** Use the respective Action icons. Note: Deleting a category will prompt you to reassign its associated products to an "Uncategorized" tag or a new category.

### Product Catalog Management
1. Go to the **Products** page. 
2. **To Add a New Product:** Click **Add New Product**.
   - **General Info:** Enter the Product Name, SKU, manufacturer, and select its Category.
   - **Pricing:** Set the Base Price and applicable GST rate (standard 18%).
   - **Description:** Use the rich text editor to write detailed descriptions. You can switch to HTML view to embed technical tables or specific formatting.
   - **Media:** Upload high-quality primary product images and gallery images. Images should ideally be WebP or compressed JPEG formats for faster loading.
   - **Properties:** Add technical specifications, weight, dimensions, and warranty details.
   - Click **Publish** to push the item live, or save as a **Draft**.
3. **Bulk Importing:** Use the "Import CSV" tool in the top right to upload hundreds of products simultaneously. Ensure your CSV matches the provided template exactly.
4. **To Edit/Delete:** Find the product in the master table (use the search bar or filters). Modify fields and hit Save, or click "Trash" to remove it from the storefront.

### Advanced Inventory Control
1. Navigate to **Inventory**. Here is a global view of all active SKUs.
2. **Stock Adjustments:** When shipments arrive or manual adjustments are needed, update the stock values directly in the grid.
3. **Low Stock Alerts:** Items nearing depletion will be flagged with a yellow warning; zero-stock items go red. Configure global or per-SKU "Low Stock Thresholds" to receive automated dashboard notifications before items run out.

---

## 4. RFQ (Request For Quotation) Management

For high-volume, customized, or specialized B2B orders, users submit RFQs instead of direct purchases.

1. Go to **RFQ Management**.
2. **Viewing an RFQ:** Click on a "Pending" request. The panel will display the customer's requirements, required quantities, target timeline, and custom notes.
3. **Processing the RFQ:** 
   - Use the internal notes section to collaborate with the sales team.
   - Using the pricing tool, apply volume discounts, add shipping estimates, and attach formal quotation PDFs if standard platform formats are insufficient.
   - Change the status from "Pending" to **"Quoted"** and send it via the platform.
4. **Fulfillment:** If the client accepts the quote digitally, it automatically converts into an actionable **Order**. If rejected or expired, it transitions to "Closed/Lost".

---

## 5. Order Management & Fulfillment

1. Navigate to the **Orders** page. A real-time grid displays all incoming purchases.
2. **Payment Verification:** The system automatically flags orders where payment via the gateway (e.g., Razorpay) has cleared successfully. For manual POs or wire transfers, admins must manually mark the invoice as "Paid".
3. **Order Processing Flow:** 
   - Click an order ID to view comprehensive details (Customer Info, Final GST Breakdown, Items, Shipping Address).
   - Generate Picking Lists and Packing Slips directly from this view.
   - As physical fulfillment progresses, update the Order Status: *Pending ➔ Processing ➔ Shipped ➔ Delivered*. 
   - Updating to "Shipped" triggers a prompt to enter the courier name and Tracking AWBs, which are automatically emailed to the customer.
4. **Cancellations & Refunds:** If an order is canceled, click the "Initiate Refund" button. Follow the prompts to process either a partial or full refund through the payment gateway.

---

## 6. Careers, Talent Pool & Applications

Manage frontend job postings and incoming applications.

1. Navigate to **Careers Management**.
2. **Managing Job Listings:** Click "Post New Job" to add openings to the frontend. Specify the title, department, location, and job description. You can close postings at any time by toggling them inactive.
3. **Reviewing Applicants:** 
   - View the list of incoming candidates under "Applications".
   - Click a candidate to view their profile, read their cover letter, and securely download their Resume/CV (PDF).
   - Use the internal pipeline tools to mark candidates as "Screening", "Shortlisted", "Interviewing", or "Rejected". This maintains an organized talent pool for HR.

---

## 7. Ecosystem Management (Vendors, Consultants, Users)

gascart.in is a multi-sided ecosystem. Managing external partners securely is vital.

### Vendor (Seller) Management
- **Vendor Enquiries:** External manufacturers apply to sell on gascart.in here. Review their company profiles, GSTINs, and catalogs.
- **Approvals & Portals:** Once approved, vendors are provisioned with a dedicated dashboard.
- **Monitoring:** Super Admins can audit vendor products before they go live and review vendor payouts/commissions.

### Consultant Management
- **Consultant Enquiries:** Industry experts apply to provide consulting services. Review their credentials and certifications.
- **Profile Approval:** Approving an expert publishes their profile in the public Consultant Directory.
- **Oversight:** Admins can view active bookings, schedules, and resolution rates between consultants and customers to ensure platform quality.

### Customer Management
- View all registered B2C and B2B customers.
- **Support Actions:** Manually reset passwords, verify email addresses, or update billing information upon request.
- **Security:** Suspend or permanently ban malicious accounts to protect platform integrity.

---

## 8. Content, Media & Marketing

Keep the platform visually appealing and technically informative.

- **Media Library:** Central repository for all images, icons, and videos. Organize assets into folders (Banners, Logos, Product Photos). Always ensure media is optimized for web to maintain fast page load speeds.
- **Document Center:** A dedicated directory for PDFs and technical files (Safety Data Sheets, Compliance Certificates, User Manuals). These can be linked directly to product pages.
- **Knowledge Hub / Blog:** Manage industry articles, news, and tutorials. Click "Add Article", write the content with the WYSIWYG editor, set SEO meta-tags, upload a thumbnail, and Publish.

---

## 9. Security & Compliance: Audit Logs

*(Exclusive to Super Admins)*

1. Navigate to the **Audit Logs** page.
2. The Audit Log is an immutable, non-deletable record of every administrative action taken on the backend.
3. It captures exact timestamps, the admin's IP address, the admin's name, and the specific action token.
   - *Example:* `[09:30 AM] Admin Sarah (Mini Admin) changed 'Product XYZ' price from $10 to $12.`
   - *Example:* `[14:00 PM] Admin John (Super Admin) deleted 'Vendor ABC'.`
4. **Incident Response:** Utilize the search and filter functions to quickly investigate reporting errors, accidental deletions, or identify unauthorized behaviors.

---

## 10. Global Settings & System Configuration

*(Exclusive to Super Admins)*

1. Navigate to **Global Settings**.
2. **General Configurations:** Update platform contact emails, support phone numbers, and physical addresses displayed on the frontend.
3. **Financial Settings:** Configure global tax rates (e.g., default 18% GST), currency displays, and minimum order values.
4. **Third-Party Integrations:** Manage API keys and webhook secrets for Payment Gateways (Razorpay), SMS providers, and external ERP systems. Do not alter these credentials without developer supervision.

---
*End of Admin Operations Manual. Designed for precision, security, and operational excellence for the gascart.in administrative team.*
