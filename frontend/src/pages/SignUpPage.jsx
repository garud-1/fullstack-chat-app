import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import SignupForm from "../components/SignupForm";
import VerificationForm from "../components/VerificationForm";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";
const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimer = useRef(null);
  const navigate = useNavigate();
  const {
    signup,
    isSigningUp,
    verifyCode,
    isVerifying,
    pendingVerificationEmail,
  } = useAuthStore();

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

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6)
      return toast.error("Enter the 6-digit code");
    await verifyCode({ email: pendingVerificationEmail, code });
    navigate("/login");
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await fetch("/api/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingVerificationEmail }),
      });
      if (!res.ok) throw new Error("Failed to resend code");
      toast.success("Verification code resent!");
      setResendCooldown(60);
      resendTimer.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimer.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error("Failed to resend code. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
        {/* Left side */}
        <div className="flex flex-col justify-center items-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-10">
            <div className="text-center space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all duration-300 shadow-lg">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-base-content">
                  {pendingVerificationEmail ? "Verify Your Email" : "Create Account"}
                </h1>
                <p className="text-base-content/60 text-lg">
                  {pendingVerificationEmail
                    ? `Enter the 6-digit code sent to ${pendingVerificationEmail}`
                    : "Get started with your free account"}
                </p>
              </div>
            </div>
            {pendingVerificationEmail ? (
              <VerificationForm
                code={code}
                setCode={setCode}
                isVerifying={isVerifying}
                handleCodeSubmit={handleCodeSubmit}
                handleResendCode={handleResendCode}
                resendCooldown={resendCooldown}
              />
            ) : (
              <SignupForm
                formData={formData}
                setFormData={setFormData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isSigningUp={isSigningUp}
                onSubmit={handleSubmit}
              />
            )}
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
