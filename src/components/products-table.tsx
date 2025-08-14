import React, { useState } from 'react';

const PRODUCTS_DATA = [
  { id: 1, name: 'Product A', category: 'Electronics', price: 100, stock: 50 },
  { id: 2, name: 'Product B', category: 'Clothing', price: 40, stock: 100 },
  { id: 3, name: 'Product C', category: 'Books', price: 20, stock: 200 },
  { id: 4, name: 'Product D', category: 'Electronics', price: 150, stock: 30 },
  { id: 5, name: 'Product E', category: 'Clothing', price: 60, stock: 80 },
  { id: 6, name: 'Product F', category: 'Books', price: 15, stock: 120 },
  { id: 7, name: 'Product G', category: 'Electronics', price: 200, stock: 25 },
  { id: 8, name: 'Product H', category: 'Clothing', price: 55, stock: 60 },
  { id: 9, name: 'Product I', category: 'Books', price: 10, stock: 300 },
  { id: 10, name: 'Product J', category: 'Electronics', price: 250, stock: 10 },
  { id: 11, name: 'Product K', category: 'Clothing', price: 70, stock: 90 },
  { id: 12, name: 'Product L', category: 'Books', price: 25, stock: 180 },
  // ...add more as needed...
];

const PAGE_SIZE = 5;

const ProductsTable = () => {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  // Filtered products
  const filteredProducts = PRODUCTS_DATA.filter(
    (product) =>
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.category.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page on filter
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Filter by name or category"
        value={filter}
        onChange={handleFilterChange}
        style={{ marginBottom: 10 }}
      />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div style={{ marginTop: 10 }}>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx + 1}
            onClick={() => handlePageChange(idx + 1)}
            style={{
              fontWeight: page === idx + 1 ? 'bold' : 'normal',
              margin: '0 2px'
            }}
          >
            {idx + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductsTable;