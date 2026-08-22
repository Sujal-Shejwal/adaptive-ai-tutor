import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/common/Logo";
import { Lock, Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    // Check required fields before calling the backend
    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!password) {
      alert("Please enter your password");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      // Backend returns JSON on success
      // and plain text on failed login.
      const responseText = await response.text();

      // Handle failed login
      if (!response.ok) {
        alert(responseText || "Invalid email or password");
        return;
      }

      // Parse successful JSON response
      const data = JSON.parse(responseText);

      // Make sure the selected role matches the account role
      if (data.role?.toLowerCase() !== role) {
        alert(`This account is registered as ${data.role}`);
        return;
      }

      // Store logged-in user information
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);

      alert("Login successful!");

      // Navigate based on the selected role
      if (role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server");
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
        Welcome back
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-[16px] text-slate-500">
        Sign in to continue your learning journey
      </p>

      {/* Login Card */}
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

        {/* Email */}
        <div className="mt-7">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[50px] w-full rounded-xl border border-gray-200 px-4 text-[15px] text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-900">
              Password
            </label>

            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Sign In Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="mt-7 h-[52px] w-full rounded-xl bg-blue-600 text-[17px] font-semibold text-white transition hover:bg-blue-700"
        >
          Sign In as {role === "student" ? "Student" : "Teacher"}
        </button>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Bottom Text */}
        <div className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign up free
          </button>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;