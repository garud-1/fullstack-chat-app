import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const SignupForm = ({ formData, setFormData, showPassword, setShowPassword, isSigningUp, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-8">
    <div className="form-control">
      <label className="label">
        <span className="label-text text-base font-semibold">Full Name</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <User className="w-5 h-5 text-base-content/40" />
        </div>
        <input
          type="text"
          className="input input-bordered w-full pl-12 py-3 bg-base-200/50 focus:bg-base-100"
          placeholder="Name"
          value={formData.fullName}
          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>
    </div>
    <div className="form-control">
      <label className="label">
        <span className="label-text text-base font-semibold">Email</span>
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
          onChange={e => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
    </div>
    <div className="form-control">
      <label className="label">
        <span className="label-text text-base font-semibold">Password</span>
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
          onChange={e => setFormData({ ...formData, password: e.target.value })}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-primary transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="w-5 h-5 text-base-content/40" /> : <Eye className="w-5 h-5 text-base-content/40" />}
        </button>
      </div>
    </div>
    <button
      type="submit"
      className="btn btn-primary w-full py-3 text-lg font-semibold shadow-lg hover:shadow-primary/30 transition-all duration-300"
      disabled={isSigningUp}
    >
      {isSigningUp ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : "Create Account"}
    </button>
  </form>
);

export default SignupForm;
