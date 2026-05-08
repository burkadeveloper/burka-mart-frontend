import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        dispatch(
          setCredentials({ user: res.data.user, token: res.data.token }),
        );
        toast.success("Email verified! You are now logged in.");
        navigate("/");
      } catch (err) {
        toast.error(err.response?.data?.message || "Verification failed");
        navigate("/login");
      }
    };
    verify();
  }, [token, dispatch, navigate]);

  return <LoadingSpinner />;
}
