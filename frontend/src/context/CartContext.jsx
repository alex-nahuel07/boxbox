import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'boxbox_cart';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (prod, cantidad = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id_producto === prod.id_producto);
      if (found)
        return prev.map((i) =>
          i.id_producto === prod.id_producto ? { ...i, cantidad: Math.min(i.cantidad + cantidad, prod.stock) } : i
        );
      const { id_producto, nombre, precio, imagen, escuderia, stock } = prod;
      return [...prev, { id_producto, nombre, precio, imagen, escuderia, stock, cantidad: Math.min(cantidad, stock) }];
    });

  const setQty = (id, cantidad) =>
    setItems((prev) =>
      prev.map((i) => (i.id_producto === id ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) } : i))
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id_producto !== id));

  const value = {
    items,
    add,
    setQty,
    remove,
    clear: () => setItems([]),
    count: items.reduce((s, i) => s + i.cantidad, 0),
    total: items.reduce((s, i) => s + i.cantidad * i.precio, 0),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
