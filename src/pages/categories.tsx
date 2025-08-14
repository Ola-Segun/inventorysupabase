import React, { useState } from 'react';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  // ...other categories...
];

const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtered items by category
  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  return (
    <div>
      <div>
        <label>Filter by Category:</label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
        >
          <option value="">All</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      {/* ...existing code... */}
      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>
            {/* ...existing code... */}
            {item.name} - {item.category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;