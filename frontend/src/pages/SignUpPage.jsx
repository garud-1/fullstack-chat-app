import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <>
     
      <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
        {/* Left side */}
        <div className="flex flex-col justify-center items-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-10">
            {/* Logo and Header */}
            <div className="text-center space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center 
                            hover:bg-primary/20 transition-all duration-300 shadow-lg"
                >
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-base-content">
                  Create Account
                </h1>
                <p className="text-base-content/60 text-lg">
                  Get started with your free account
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-semibold">
                    Full Name
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-12 py-3 bg-base-200/50 focus:bg-base-100"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-semibold">
                    Email
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-12 py-3 bg-base-200/50 focus:bg-base-100"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-semibold">
                    Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pl-12 py-3 bg-base-200/50 focus:bg-base-100"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-base-content/40" />
                    ) : (
                      <Eye className="w-5 h-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3 text-lg font-semibold shadow-lg hover:shadow-primary/30 transition-all duration-300"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-base-content/60 text-lg">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="link link-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        />
      </div>
    </>
  );
};

export default SignUpPage;
