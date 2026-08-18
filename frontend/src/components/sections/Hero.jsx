import { SendHorizontal } from "lucide-react";
import aiTutorIcon from "../../assets/icons/ai-tutor-icon.png";

function Hero() {
  return (
  <section className="max-w-[1360px] mx-auto grid grid-cols-[520px_560px] justify-between items-center px-16 pt-12 pb-12">
    {/* Left Side */}
      <div className="w-[500px]">
        <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
          AI-Powered Learning Platform
        </span>

        <h1 className="text-[58px] leading-[64px] font-bold mt-6 tracking-tight">
          Learn Smarter
          <br />
          <span className="text-blue-600">with AI</span>
        </h1>

        <p className="mt-6 text-[18px] text-gray-600 leading-9 max-w-[430px]">
          Your intelligent study companion for IT and Computer Science.
          Get instant AI answers, access structured notes, practice quizzes,
          and track your progress—all in one place.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-7">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
            Get Started Free →
          </button>

          <button className="border border-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
            Sign In
          </button>
        </div>

        {/* Bottom Features */}
        <div className="flex gap-8 mt-9 text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>No credit card required</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Free for students</span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex justify-center">

        <div className="w-[540px] bg-white rounded-[28px] border border-gray-200 shadow-xl px-6 py-5">

          {/* Header */}
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
              <img
                src={aiTutorIcon}
                alt="AI Tutor"
                className="w-5 h-5"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                AI Tutor
              </h3>

              <p className="text-green-500 text-sm">
                ● Online
              </p>
            </div>

          </div>

          <hr className="my-4 border-gray-200" />

          {/* User Message */}
          <div className="flex justify-end">

            <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 max-w-[300px] text-[15px] leading-6 shadow">
              Explain the difference between process and thread in OS.
            </div>

          </div>

          {/* AI Message */}
          <div className="flex justify-start mt-3">

            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 max-w-[295px] shadow-sm">

              <p className="text-gray-700 text-[15px] leading-6">
                A <strong>process</strong> is an independent program in
                execution with its own memory space, while a
                <strong> thread</strong> is a lightweight unit within a
                process, sharing its memory...
              </p>

            </div>

          </div>

          {/* Typing Indicator */}
          <div className="flex items-center gap-2 mt-4">

            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce"></span>

              <span
                className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></span>

              <span
                className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></span>
            </div>

            <span className="text-gray-400 text-sm">
              AI is generating...
            </span>

          </div>

          {/* Input */}
          <div className="flex items-center border border-gray-200 rounded-2xl px-5 py-2 mt-4 shadow-sm">

            <input
              type="text"
              placeholder="Ask a question about DBMS, OS, Networks..."
              className="flex-1 outline-none text-[15px] text-gray-400 placeholder-gray-300"
            />

            <button className="bg-blue-600 text-white w-9 h-9 rounded-lg flex items-center justify-center hover:bg-blue-700 transition">
              <SendHorizontal className="w-5 h-5" />
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;