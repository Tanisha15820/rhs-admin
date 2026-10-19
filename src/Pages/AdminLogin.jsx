import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import logo from "../assets/images/compressed_rhs_logo.png";
import { login, DEFAULT_CREDENTIALS, isAuthenticated } from "../utils/auth";
import SEO from "../Components/SEO";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to the dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const destination =
        location.state?.from?.pathname || "/dashboard/homepage-banner";

      navigate(destination, { replace: true });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);

      if (result.success) {
        const destination =
          location.state?.from?.pathname || "/dashboard/homepage-banner";

        navigate(destination, { replace: true });
      } else {
        setError(result.message || "Invalid username or password.");
        setIsLoading(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername(DEFAULT_CREDENTIALS.username);
    setPassword(DEFAULT_CREDENTIALS.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Admin Login | Reinforce Healthcare Services"
        description="Secure administrator portal for managing website content."
      />

      <div className="flex min-h-screen w-full">
        {/* LEFT SIDE  */}
        <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#eaf7ff] via-[#d8f0ff] to-[#c5e8ff] lg:block">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/60 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[450px] w-[450px] rounded-full bg-[#62b9ef]/20 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col px-8 py-7 xl:px-12">
            {/* CENTER MEDICAL ILLUSTRATION  */}
            <div className="relative flex flex-1 items-center justify-center">
              {/* Soft circular background */}
              <div className="absolute h-64 w-64 rounded-full border border-white/50 bg-white/10" />

              <div className="absolute h-48 w-48 rounded-full border border-white/50" />

              {/* Floating security card */}
              <div className="absolute left-[8%] top-[30%] flex h-12 w-12 rotate-[-8deg] items-center justify-center rounded-xl border border-white/70 bg-white/55 text-[#318bc9] shadow-lg backdrop-blur-sm">
                <VerifiedUserOutlinedIcon style={{ fontSize: 25 }} />
              </div>

              {/* Floating analytics card */}
              <div className="absolute right-[10%] top-[22%] flex h-12 w-12 rotate-[8deg] items-center justify-center rounded-xl border border-white/70 bg-white/55 text-[#318bc9] shadow-lg backdrop-blur-sm">
                <SecurityOutlinedIcon style={{ fontSize: 24 }} />
              </div>

              {/* Main medical platform */}
              <div className="relative mt-8">
                {/* Platform shadow */}
                <div className="absolute left-1/2 top-24 h-12 w-48 -translate-x-1/2 rounded-full bg-[#66b8e9]/25 blur-xl" />

                {/* Platform */}
                <div className="relative flex h-20 w-56 items-center justify-center rounded-[40%] border border-white/70 bg-gradient-to-br from-white/80 to-[#cbeaff]/70 shadow-[0_20px_35px_rgba(51,137,190,0.18)]">
                  <div className="h-14 w-40 rounded-[40%] border border-white/80 bg-white/50" />

                  {/* Medical shield */}
                  <div className="absolute -top-16 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/80 bg-white/65 shadow-xl backdrop-blur-md">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-[#d8f1ff] shadow-inner">
                      <ShieldOutlinedIcon
                        className="text-[#3d9bd5]"
                        style={{ fontSize: 46 }}
                      />

                      <div className="absolute flex items-center justify-center">
                        <span className="text-xl font-bold text-[#2787c5]">
                          +
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom floating card */}
                <div className="absolute -right-12 top-5 flex h-11 w-11 rotate-[8deg] items-center justify-center rounded-xl border border-white/70 bg-white/60 text-[#318bc9] shadow-lg backdrop-blur-sm">
                  <CheckCircleOutlinedIcon style={{ fontSize: 23 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE  */}
        <div className="flex w-full items-center justify-center bg-white px-6 py-8 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-[430px]">
            {/* Logo */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3faff] shadow-sm">
                <img
                  src={logo}
                  alt="RHS Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>

              {/* Portal badge */}
              <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#eef8ff] px-3 py-1 text-[12px] font-bold text-[#1878bd]">
                <ShieldOutlinedIcon style={{ fontSize: 13 }} />
                Admin Portal
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#122642] sm:text-[32px]">
                Welcome Back
              </h1>
              <p className="mt-1 text-[13px] text-slate-400">
                Sign in to manage your website banner and healthcare content
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[14px] font-medium text-red-600">
                <ErrorOutlinedIcon
                  style={{ fontSize: 17 }}
                  className="shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {/* Username */}
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.15em] text-[#52647a]">
                  Username
                </label>

                <div className="relative">
                  <PersonOutlineOutlinedIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    style={{ fontSize: 17 }}
                  />

                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-[#f8fafc] pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#36a8ed] focus:bg-white focus:ring-2 focus:ring-[#36a8ed]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.15em] text-[#52647a]">
                  Password
                </label>

                <div className="relative">
                  <LockOutlinedIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    style={{ fontSize: 17 }}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-[#f8fafc] pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#36a8ed] focus:bg-white focus:ring-2 focus:ring-[#36a8ed]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon style={{ fontSize: 17 }} />
                    ) : (
                      <VisibilityOutlinedIcon style={{ fontSize: 17 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3 w-3 accent-[#258ee0]"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => alert("Please contact the administrator.")}
                  className="text-[12px] font-medium text-[#318ed0] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#27a9ed] to-[#263bd4] text-[14px] font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>

                    <ArrowForwardIcon style={{ fontSize: 16 }} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
