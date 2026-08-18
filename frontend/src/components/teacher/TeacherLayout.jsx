import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import TeacherHeader from "./TeacherHeader";

export default function TeacherLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <TeacherSidebar />

      <div className="ml-[240px] min-h-screen">
        <TeacherHeader />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}