import api from "../api/axiosClient";

export const validateCartItems = async (items) => {
  if (!items.length) return [];
  const validItems = [];
  for (const item of items) {
    try {
      const { data } = await api.get(`/products/${item.productId}`);
      const product = data.product;
      if (product && product.status === "active" && product.quantity > 0) {
        const validQuantity = Math.min(item.quantity, product.quantity);
        if (validQuantity > 0) {
          validItems.push({
            ...item,
            price: product.price, // update price in case it changed
            quantity: validQuantity,
            title: product.title,
            image: product.images?.[0] || item.image,
          });
        }
      }
    } catch (err) {
      console.error(`Product ${item.productId} not found or error`, err);
    }
  }
  return validItems;
};
