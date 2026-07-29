import heroImage from "../../assets/images/hero.png";
function Hero() {
  return (
    <section className="max-w-7xl mx-auto grid grid-cols-2 items-center gap-12 min-h-screen px-8 py-16">
<div>
<span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
  AI-Powered Learning Platform
</span>

  <h1 className="text-6xl font-bold leading-tight mt-6">
 Learn Smarter
<br />
<span className="text-blue-600">
  with AI
</span>
  </h1>

  <p className="mt-6 text-gray-600 text-lg leading-8 max-w-xl">
    Your intelligent study companion for IT and Computer Science.
    Get instant AI answers, access structured notes,
    practice quizzes, and track your progress—all in one place.
  </p>

  <div className="flex gap-4 mt-8">
    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
        Get Started Free →
        </button>
    <button className="border border-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
        Sign In
        </button>
  </div>
</div>

    <div className="flex justify-center items-center">
  <img
  src={heroImage}
  alt="AI Tutor Preview"
  className="w-full max-w-md mx-auto"
/>
</div>
    </section>
  );
}

export default Hero;