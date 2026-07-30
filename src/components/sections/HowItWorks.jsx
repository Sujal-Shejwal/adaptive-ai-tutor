import {
  UserPlus,
  MessageSquareText,
  BookOpen,
  Trophy,
} from "lucide-react";

function HowItWorks() {
  return (
    <section className="bg-white py-24">

      <div className="max-w-[1360px] mx-auto px-10">

        {/* Heading */}
        <div className="text-center">

          <h2 className="text-[48px] font-bold text-slate-900">
            How It Works
          </h2>

          <p className="mt-4 text-[20px] leading-8 text-gray-500 max-w-2xl mx-auto">
            Start your AI-powered learning journey in four simple steps.
          </p>

        </div>

        {/* Steps */}
        <div className="grid grid-cols-4 gap-8 mt-20">

          {/* Step 1 */}
          <div className="text-center">

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold">
              Create Account
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              Sign up using your student account and create your profile.
            </p>

          </div>

          {/* Step 2 */}
          <div className="text-center">

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <MessageSquareText className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold">
              Ask Questions
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              Chat with the AI tutor and get instant explanations.
            </p>

          </div>

          {/* Step 3 */}
          <div className="text-center">

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold">
              Learn Daily
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              Read notes, practice quizzes and strengthen concepts.
            </p>

          </div>

          {/* Step 4 */}
          <div className="text-center">

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold">
              Track Progress
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              View your performance and improve weak topics.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;