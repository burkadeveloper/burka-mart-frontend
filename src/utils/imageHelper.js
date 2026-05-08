// export const getImageUrl = (path) => {
//   if (!path) return "/placeholder.jpg";
//   if (path.startsWith("http")) return path;
//   const baseUrl =
//     import.meta.env.VITE_API_URL?.replace("/api", "") ||
//     "http://localhost:5000";
//   return `${baseUrl}${path}`;
// };
export const getImageUrl = (path) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;

  // 1. Get the base URL and strip '/api' AND any trailing slash
  const baseUrl = (
    import.meta.env.VITE_API_URL || "https://burka-mart-api.onrender.com"
  )
    .replace("/api", "")
    .replace(/\/$/, ""); // Removes trailing slash if it exists

  // 2. Ensure the path starts with exactly ONE slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};
