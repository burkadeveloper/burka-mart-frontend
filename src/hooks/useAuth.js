import { useSelector } from "react-redux";

export const useAuth = () => {
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  return {
    user,
    isAuthenticated,
    token,
    isAdmin: user?.role === "admin",
    isSeller: user?.isSeller,
  };
};
