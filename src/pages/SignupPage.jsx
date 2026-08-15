import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/common/Logo";
import { User, Lock, Eye, EyeOff } from "lucide-react";

function SignupPage() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = () => {
    // Temporary frontend role system.
    // Later this will be handled by FastAPI/database authentication.
    localStorage.setItem("userRole", role);

    if (role === "teacher") {
      navigate("/teacher/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 pt-14">
      {/* Logo */}
      <button onClick={() => navigate("/")}>
        <Logo />
      </button>

      {/* Heading */}
      <h1 className="mt-8 text-[30px] font-bold text-slate-900">
        Create your account
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-[16px] text-slate-500">
        Join thousands of students learning smarter
      </p>

      {/* Signup Card */}
      <div className="mt-8 w-full max-w-[450px] rounded-[24px] border border-gray-200 bg-white p-7 shadow-sm">
        {/* Student / Teacher Toggle */}
        <div className="flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 rounded-xl py-3 text-[16px] font-medium transition ${
              role === "student"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Student
          </button>

          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`flex-1 rounded-xl py-3 text-[16px] font-medium transition ${
              role === "teacher"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Teacher
          </button>
        </div>

        {/* Full Name */}
        <div className="mt-7">
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Full Name
          </label>

          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Aryan Sharma"
              className="h-[50px] w-full rounded-xl border border-gray-200 pl-11 pr-4 text-[15px] text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Email Address
          </label>

          <input
            type="email"
            placeholder={
              role === "student"
                ? "student@college.edu"
                : "teacher@college.edu"
            }
            className="h-[50px] w-full rounded-xl border border-gray-200 px-4 text-[15px] text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className="h-[50px] w-full rounded-xl border border-gray-200 pl-11 pr-11 text-[15px] text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Confirm Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="h-[50px] w-full rounded-xl border border-gray-200 pl-11 pr-11 text-[15px] text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Create Account Button */}
        <button
          type="button"
          onClick={handleSignup}
          className="mt-7 h-[52px] w-full rounded-xl bg-blue-600 text-[17px] font-semibold text-white transition hover:bg-blue-700"
        >
          Create {role === "student" ? "Student" : "Teacher"} Account
        </button>

        {/* Terms & Privacy */}
        <p className="mt-5 text-center text-sm leading-6 text-slate-500">
          By creating an account, you agree to our{" "}
          <button
            type="button"
            className="font-medium text-blue-600 hover:underline"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="font-medium text-blue-600 hover:underline"
          >
            Privacy Policy
          </button>
          .
        </p>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Already have an account */}
        <div className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </main>
  );
}

export default SignupPage;