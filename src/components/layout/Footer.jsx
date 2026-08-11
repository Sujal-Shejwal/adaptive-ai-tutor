import { useNavigate } from "react-router-dom";
import Logo from "../common/Logo";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer>
      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-[1360px] mx-auto px-10 flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold text-white">
            Ready to Learn Smarter?
          </h2>

          <p className="mt-5 text-lg text-blue-100 max-w-2xl">
            Join thousands of students already using Adaptive AI Tutor to ace
            their exams.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="mt-8 bg-white text-blue-600 font-semibold text-base px-8 py-3 rounded-xl hover:bg-gray-100 transition duration-300"
          >
            Start Learning for Free
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-slate-900 py-6">
        <div className="max-w-[1360px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between">

          {/* Logo */}
          <Logo textColor="text-white" />

          {/* Copyright */}
          <p className="text-gray-400 text-[15px]">
            © 2026 Adaptive AI Tutor. Final Year Engineering Project.
          </p>

          {/* Footer Links */}
          <div className="flex items-center gap-6">

            <a
              href="#"
              className="text-gray-400 hover:text-white transition"
            >
              Privacy
            </a>

            <a
              href="#"
              className="text-gray-400 hover:text-white transition"
            >
              Terms
            </a>

            <a
              href="#"
              className="text-gray-400 hover:text-white transition"
            >
              Contact
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;