import {
  Camera,
  Edit3,
  Lock,
  LogOut,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherProfilePage() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Prof. Mehra",
    email: "prof.mehra@college.edu",
    phone: "+91 98765 43210",
    employeeId: "FAC-2024-017",
    department: "Computer Science & Engineering",
    specialization: "Database Management Systems",
  });

  const [editProfile, setEditProfile] = useState(profile);

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");

  const handleEditProfile = () => {
    setEditProfile(profile);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswords((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdatePassword = () => {
    setPasswordMessage("");

    if (
      !passwords.current ||
      !passwords.newPassword ||
      !passwords.confirm
    ) {
      setPasswordMessage("Please fill all password fields.");
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setPasswordMessage("Password updated successfully.");

    setPasswords({
      current: "",
      newPassword: "",
      confirm: "",
    });
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-6 py-7">
      {/* Main Content */}
      <div className="mx-auto w-full max-w-[770px]">

        {/* ========================= */}
        {/* PAGE HEADER */}
        {/* ========================= */}

        <div className="mb-7">
          <h1 className="text-[25px] font-bold leading-[30px] tracking-tight text-[#17233c]">
            My Profile
          </h1>

          <p className="mt-[4px] text-[14px] leading-5 text-[#64748b]">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* ========================= */}
        {/* PROFILE CARD */}
        {/* ========================= */}

        <section className="rounded-[16px] border border-[#e2e8f0] bg-white px-6 py-6">

          {/* Profile Header */}

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-4">

              {/* Avatar */}

              <div className="relative">

                <div className="flex h-[80px] w-[80px] items-center justify-center rounded-[16px] bg-gradient-to-br from-blue-500 to-indigo-600 text-[25px] font-bold text-white">
                  PM
                </div>

                <button
                  type="button"
                  title="Change profile photo"
                  className="absolute bottom-[-3px] right-[-4px] flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white transition hover:bg-blue-700"
                >
                  <Camera
                    className="h-[13px] w-[13px]"
                    strokeWidth={2}
                  />
                </button>

              </div>

              {/* Name */}

              <div>

                <h2 className="text-[20px] font-bold leading-6 text-[#17233c]">
                  {profile.name}
                </h2>

                <p className="mt-[3px] text-[13px] text-[#64748b]">
                  {profile.email}
                </p>

                <div className="mt-2 flex items-center gap-2">

                  <span className="rounded-full bg-[#dbeafe] px-2.5 py-1 text-[11px] font-medium text-[#2563eb]">
                    Teacher
                  </span>

                  <span className="rounded-full bg-[#d1fae5] px-2.5 py-1 text-[11px] font-medium text-[#059669]">
                    Computer Science
                  </span>

                </div>

              </div>

            </div>

            {/* Edit Button */}

            {!isEditing && (
              <button
                type="button"
                onClick={handleEditProfile}
                className="flex h-[38px] items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#334155] transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                <Edit3
                  className="h-[15px] w-[15px]"
                  strokeWidth={1.8}
                />

                Edit Profile
              </button>
            )}

          </div>

          {/* ========================= */}
          {/* STATISTICS */}
          {/* ========================= */}

          <div className="mt-6 flex h-[82px] items-center rounded-[14px] bg-[#f8fafc]">

            <div className="flex flex-1 flex-col items-center">
              <span className="text-[21px] font-bold text-[#17233c]">
                148
              </span>

              <span className="mt-[3px] text-[12px] text-[#94a3b8]">
                Students
              </span>
            </div>

            <div className="h-[50px] w-px bg-[#e2e8f0]" />

            <div className="flex flex-1 flex-col items-center">
              <span className="text-[21px] font-bold text-[#17233c]">
                4
              </span>

              <span className="mt-[3px] text-[12px] text-[#94a3b8]">
                Subjects
              </span>
            </div>

            <div className="h-[50px] w-px bg-[#e2e8f0]" />

            <div className="flex flex-1 flex-col items-center">
              <span className="text-[21px] font-bold text-[#17233c]">
                7
              </span>

              <span className="mt-[3px] text-[12px] text-[#94a3b8]">
                Notes Uploaded
              </span>
            </div>

          </div>

          {/* ========================= */}
          {/* PERSONAL INFORMATION */}
          {/* ========================= */}

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">

            {/* Full Name */}

            <ProfileField
              label="FULL NAME"
              value={editProfile.name}
              editing={isEditing}
              onChange={(value) =>
                setEditProfile((current) => ({
                  ...current,
                  name: value,
                }))
              }
            />

            {/* Email */}

            <ProfileField
              label="EMAIL ADDRESS"
              value={editProfile.email}
              editing={isEditing}
              onChange={(value) =>
                setEditProfile((current) => ({
                  ...current,
                  email: value,
                }))
              }
            />

            {/* Phone */}

            <ProfileField
              label="PHONE NUMBER"
              value={editProfile.phone}
              editing={isEditing}
              onChange={(value) =>
                setEditProfile((current) => ({
                  ...current,
                  phone: value,
                }))
              }
            />

            {/* Employee ID */}

            <ProfileField
              label="EMPLOYEE ID"
              value={editProfile.employeeId}
              editing={isEditing}
              onChange={(value) =>
                setEditProfile((current) => ({
                  ...current,
                  employeeId: value,
                }))
              }
            />

            {/* Department */}

            <ProfileField
              label="DEPARTMENT"
              value={editProfile.department}
              editing={isEditing}
              onChange={(value) =>
                setEditProfile((current) => ({
                  ...current,
                  department: value,
                }))
              }
            />

            {/* Specialization */}

            <ProfileField
              label="SPECIALIZATION"
              value={editProfile.specialization}
              editing={isEditing}
              onChange={(value) =>
                setEditProfile((current) => ({
                  ...current,
                  specialization: value,
                }))
              }
            />

          </div>

          {/* ========================= */}
          {/* EDIT ACTIONS */}
          {/* ========================= */}

          {isEditing && (
            <div className="mt-6 flex justify-end gap-2 border-t border-[#f1f5f9] pt-5">

              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex h-[38px] items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 text-[13px] font-medium text-[#475569] transition hover:bg-[#f8fafc]"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex h-[38px] items-center gap-2 rounded-xl bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </button>

            </div>
          )}

        </section>

        {/* ========================= */}
        {/* CHANGE PASSWORD */}
        {/* ========================= */}

        <section className="mt-6 rounded-[16px] border border-[#e2e8f0] bg-white px-6 py-6">

          <div className="flex items-center gap-2">

            <Lock
              className="h-[16px] w-[16px] text-[#64748b]"
              strokeWidth={1.8}
            />

            <h2 className="text-[16px] font-bold text-[#17233c]">
              Change Password
            </h2>

          </div>

          <div className="mt-5 grid grid-cols-3 gap-4">

            {/* Current Password */}

            <PasswordField
              label="CURRENT PASSWORD"
              name="current"
              value={passwords.current}
              onChange={handlePasswordChange}
            />

            {/* New Password */}

            <PasswordField
              label="NEW PASSWORD"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />

            {/* Confirm Password */}

            <PasswordField
              label="CONFIRM NEW PASSWORD"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordChange}
            />

          </div>

          {passwordMessage && (
            <p
              className={`mt-3 text-[12px] ${
                passwordMessage.includes("successfully")
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {passwordMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleUpdatePassword}
            className="mt-5 h-[40px] rounded-xl bg-[#17233c] px-5 text-[13px] font-semibold text-white transition hover:bg-[#0f172a]"
          >
            Update Password
          </button>

        </section>

        {/* ========================= */}
        {/* SIGN OUT */}
        {/* ========================= */}

        <section className="mt-6 rounded-[16px] border border-[#fecaca] bg-white px-6 py-5">

          <h2 className="text-[16px] font-bold text-[#17233c]">
            Sign Out
          </h2>

          <p className="mt-1 text-[13px] text-[#64748b]">
            You will be signed out from all active sessions on this device.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex h-[40px] items-center gap-2 rounded-xl bg-[#ff3b3b] px-5 text-[13px] font-semibold text-white transition hover:bg-[#ef3030]"
          >
            <LogOut
              className="h-[15px] w-[15px]"
              strokeWidth={1.8}
            />

            Sign Out
          </button>

        </section>

        {/* Bottom spacing */}

        <div className="h-8" />

      </div>
    </main>
  );
}


/* ================================= */
/* PROFILE FIELD */
/* ================================= */

function ProfileField({
  label,
  value,
  editing,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-[11px] font-medium tracking-[0.02em] text-[#94a3b8]">
        {label}
      </label>

      {editing ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[42px] w-full rounded-xl border border-[#dbe3ed] bg-white px-4 text-[13px] text-[#334155] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
        />
      ) : (
        <div className="flex h-[42px] items-center rounded-xl bg-[#f8fafc] px-4 text-[13px] text-[#334155]">
          {value}
        </div>
      )}

    </div>
  );
}


/* ================================= */
/* PASSWORD FIELD */
/* ================================= */

function PasswordField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-[11px] font-medium tracking-[0.02em] text-[#94a3b8]">
        {label}
      </label>

      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className="h-[42px] w-full rounded-xl border border-[#e2e8f0] bg-white px-4 text-[13px] text-[#334155] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
      />

    </div>
  );
}