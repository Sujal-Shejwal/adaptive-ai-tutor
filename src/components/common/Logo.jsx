import { GraduationCap } from "lucide-react";

function Logo({ textColor = "text-slate-900" }) {
  return (
    <div className="flex items-center gap-2.5">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">

        <GraduationCap
          className="h-5 w-5 text-white"
          strokeWidth={2}
        />

      </div>

      <h1 className={`text-[18px] font-semibold ${textColor}`}>
        Adaptive AI Tutor
      </h1>

    </div>
  );
}

export default Logo;