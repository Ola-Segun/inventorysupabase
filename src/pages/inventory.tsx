import React, { useState } from 'react';
import ProductsTable from '../components/ProductsTable';
import CategoriesPage from '../components/CategoriesPage';

const TABS = [
  { name: 'Products', component: ProductsTab },
  { name: 'Categories', component: CategoriesTab },
  { name: 'Stock', component: StockTab },
  // ...add more tabs as needed...
];

// Example tab components
function ProductsTab() {
  return (
    <div>
      {/* ...existing code... */}
      <ProductsTable />
    </div>
  );
}

function CategoriesTab() {
  return (
    <div>
      {/* ...existing code... */}
      <CategoriesPage />
    </div>
  );
}

function StockTab() {
  // Example: show stock levels, allow stock adjustment, etc.
  // ...implement stock features...
  return (
    <div>
      <h3>Stock Management</h3>
      {/* Implement stock listing, adjustment, and history features here */}
      {/* ...existing code... */}
    </div>
  );
}

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].name);

  const ActiveComponent = TABS.find((tab) => tab.name === activeTab)?.component || (() => null);

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        {TABS.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={{
              fontWeight: activeTab === tab.name ? 'bold' : 'normal'
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default InventoryPage;