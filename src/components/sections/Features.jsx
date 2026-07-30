import {Brain, BookOpen, MessageCircle, BarChart3,} from "lucide-react";

function Features() {
  return (
    <section className="bg-[#F8FAFC] py-24">
      <div className="max-w-[1360px] mx-auto px-10">

        {/* Heading */}
        <div className="text-center">

          <h2 className="text-[48px] font-bold text-slate-900">
            Everything You Need to Excel
          </h2>

          <p className="mt-4 text-[20px] leading-8 text-gray-500 max-w-2xl mx-auto">
            Comprehensive tools designed for IT and CS students to learn
            more effectively.
          </p>

        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-4 gap-8 mt-20">

          {/* Card 1 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm hover:shadow-lg transition">

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold text-slate-900">
              AI-Powered Answers
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              Get instant, accurate answers to your CS and IT questions
              powered by advanced AI.
            </p>

          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm hover:shadow-lg transition">

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold text-slate-900">
              Structured Learning
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              Access teacher-uploaded notes organized by subject,
              unit and topic.
            </p>

          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm hover:shadow-lg transition">

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold text-slate-900">
              Interactive Chat
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              Conversational AI tutor that understands context and explains
              concepts clearly.
            </p>

          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm hover:shadow-lg transition">

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold text-slate-900">
              Progress Tracking
            </h3>

            <p className="mt-4 text-gray-500 leading-8">
              Monitor your learning progress with detailed analytics
              and weak topic identification.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Features;