const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin-dashboard/src/pages/Products.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const startIndex = 521; // line 522
const endIndex = 1026;  // line 1027

const replacement = `            {/* Add/Edit Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                editingProduct={editingProduct}
                handleSubmit={handleSubmit}
                productVendors={productVendors}
                onOpenVendorModal={handleOpenVendorModal}
                onRemoveVendor={handleRemoveVendor}
            />`;

lines.splice(startIndex, endIndex - startIndex + 1, replacement);

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Replaced modal effectively.');
