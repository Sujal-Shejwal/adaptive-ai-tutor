import { GraduationCap } from "lucide-react";

function Logo({ textColor = "text-gray-800" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>

      <h1 className={`text-xl font-bold ${textColor}`}>
        Adaptive AI Tutor
      </h1>
    </div>
  );
}

export default Logo;