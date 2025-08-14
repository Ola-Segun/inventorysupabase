import { useState, useEffect } from "react";
import { Products } from "@/types";
import { productService } from "@/services/productService";

export const useProducts = () => {
  const [realProducts, setRealProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setRealProducts(data);
        console.log("Data: ", await productService.getProducts());
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { realProducts, loading, error };
};

