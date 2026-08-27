import {
  Camera,
  Edit3,
  Lock,
  LogOut,
  Check,
  X,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";


const API_URL =
  "http://localhost:8080";


export default function TeacherProfilePage() {

  const navigate =
    useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const [
    profile,
    setProfile,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    specialization: "",
    role: "Teacher",
  });


  const [
    editProfile,
    setEditProfile,
  ] = useState(profile);


  const [
    passwords,
    setPasswords,
  ] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });


  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");


  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");


  const [
    stats,
    setStats,
  ] = useState({
    students: null,
    subjects: 0,
    notes: 0,
  });


  const [
    statsLoading,
    setStatsLoading,
  ] = useState(true);


  const [
    profileImage,
    setProfileImage,
  ] = useState(null);


  // =====================================================
  // GET LOGGED-IN TEACHER ID
  // =====================================================

  const getTeacherId = () => {

    const storedId =
      localStorage.getItem(
        "userId"
      );

    if (storedId) {
      return Number(storedId);
    }


    try {

      const storedUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      return storedUser?.id
        ? Number(storedUser.id)
        : null;

    } catch {

      return null;
    }
  };


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile =
    async () => {

      const teacherId =
        getTeacherId();


      if (!teacherId) {

        setError(
          "Teacher session not found. Please log in again."
        );

        setLoading(false);

        return;
      }


      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            `${API_URL}/api/users/${teacherId}`
          );


        if (!response.ok) {

          throw new Error(
            `Unable to load profile (${response.status})`
          );
        }


        const data =
          await response.json();


        const nextProfile = {
          name:
            data.name || "",

          email:
            data.email || "",

          phone: "",
          employeeId: "",
          department: "",
          specialization: "",

          role:
            data.role?.toLowerCase() ===
            "teacher"
              ? "Teacher"
              : data.role || "Teacher",
        };


        setProfile(
          nextProfile
        );

        setEditProfile(
          nextProfile
        );


        // Keep browser session in sync.
        localStorage.setItem(
          "userName",
          data.name || ""
        );

        localStorage.setItem(
          "userEmail",
          data.email || ""
        );

        localStorage.setItem(
          "userRole",
          data.role?.toLowerCase() ||
          "teacher"
        );

      } catch (loadError) {

        console.error(
          "Teacher profile loading error:",
          loadError
        );

        setError(
          loadError.message ||
          "Unable to load teacher profile."
        );

      } finally {

        setLoading(false);
      }
    };


  // =====================================================
  // LOAD TEACHER-RELATED COUNTS
  // =====================================================

  const loadStats =
    async () => {

      try {

        setStatsLoading(true);


        const [
          subjectsResponse,
          notesResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/subjects`
          ),
          fetch(
            `${API_URL}/api/notes`
          ),
        ]);


        const subjectsData =
          subjectsResponse.ok
            ? await subjectsResponse.json()
            : [];

        const notesData =
          notesResponse.ok
            ? await notesResponse.json()
            : [];


        setStats({
          // No teacher-specific student-count
          // endpoint exists yet, so do not show
          // a fabricated number.
          students: null,

          subjects:
            Array.isArray(
              subjectsData
            )
              ? subjectsData.length
              : 0,

          notes:
            Array.isArray(
              notesData
            )
              ? notesData.length
              : 0,
        });

      } catch (statsError) {

        console.error(
          "Teacher profile statistics error:",
          statsError
        );

      } finally {

        setStatsLoading(false);
      }
    };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadProfile();

    loadStats();

  }, []);


  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleEditProfile = () => {

    setEditProfile(
      profile
    );

    setProfileMessage("");

    setIsEditing(
      true
    );
  };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {

    setEditProfile(
      profile
    );

    setIsEditing(
      false
    );

    setProfileMessage("");
  };


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSaveProfile =
    async () => {

      const teacherId =
        getTeacherId();


      if (!teacherId) {

        setProfileMessage(
          "Teacher session not found. Please log in again."
        );

        return;
      }


      const name =
        editProfile.name?.trim();

      const email =
        editProfile.email?.trim();


      if (!name) {

        setProfileMessage(
          "Full name cannot be empty."
        );

        return;
      }


      if (!email) {

        setProfileMessage(
          "Email address cannot be empty."
        );

        return;
      }


      try {

        const response =
          await fetch(
            `${API_URL}/api/users/${teacherId}/profile`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  name,
                  email,
                }),
            }
          );


        const responseText =
          await response.text();


        if (!response.ok) {

          let message =
            responseText;


          try {

            const errorData =
              JSON.parse(
                responseText
              );

            message =
              errorData?.message ||
              message;

          } catch {
            // Plain-text response.
          }


          throw new Error(
            message ||
            "Unable to update profile."
          );
        }


        let data = null;

        try {

          data =
            responseText
              ? JSON.parse(
                responseText
              )
              : null;

        } catch {
          // Keep submitted values if
          // the response is empty/non-JSON.
        }


        const updatedProfile = {
          ...profile,

          name:
            data?.name ||
            name,

          email:
            data?.email ||
            email,
        };


        setProfile(
          updatedProfile
        );

        setEditProfile(
          updatedProfile
        );


        localStorage.setItem(
          "userName",
          updatedProfile.name
        );

        localStorage.setItem(
          "userEmail",
          updatedProfile.email
        );


        setIsEditing(
          false
        );

        setProfileMessage(
          "Profile updated successfully."
        );


        setTimeout(() => {
          setProfileMessage("");
        }, 3000);

      } catch (saveError) {

        console.error(
          "Teacher profile update error:",
          saveError
        );

        setProfileMessage(
          saveError.message ||
          "Unable to update profile."
        );
      }
    };


  // =====================================================
  // PROFILE INPUT
  // =====================================================

  const handleProfileChange =
    (
      field,
      value
    ) => {

      setEditProfile(
        (current) => ({
          ...current,
          [field]: value,
        })
      );
    };


  // =====================================================
  // PASSWORD INPUT
  // =====================================================

  const handlePasswordChange =
    (event) => {

      const {
        name,
        value,
      } =
        event.target;


      setPasswords(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleUpdatePassword =
    async () => {

      setPasswordMessage("");


      const teacherId =
        getTeacherId();


      if (!teacherId) {

        setPasswordMessage(
          "Teacher session not found. Please log in again."
        );

        return;
      }


      if (
        !passwords.current ||
        !passwords.newPassword ||
        !passwords.confirm
      ) {

        setPasswordMessage(
          "Please fill all password fields."
        );

        return;
      }


      if (
        passwords.newPassword.length <
        6
      ) {

        setPasswordMessage(
          "New password must contain at least 6 characters."
        );

        return;
      }


      if (
        passwords.newPassword !==
        passwords.confirm
      ) {

        setPasswordMessage(
          "New passwords do not match."
        );

        return;
      }


      try {

        const response =
          await fetch(
            `${API_URL}/api/users/${teacherId}/password`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  currentPassword:
                    passwords.current,

                  newPassword:
                    passwords.newPassword,
                }),
            }
          );


        const responseText =
          await response.text();


        if (!response.ok) {

          let message =
            responseText;


          try {

            const errorData =
              JSON.parse(
                responseText
              );

            message =
              errorData?.message ||
              message;

          } catch {
            // Plain-text response.
          }


          throw new Error(
            message ||
            "Unable to update password."
          );
        }


        setPasswordMessage(
          "Password updated successfully."
        );


        setPasswords({
          current: "",
          newPassword: "",
          confirm: "",
        });


        setTimeout(() => {
          setPasswordMessage("");
        }, 3000);

      } catch (passwordError) {

        console.error(
          "Teacher password update error:",
          passwordError
        );

        setPasswordMessage(
          passwordError.message ||
          "Unable to update password."
        );
      }
    };


  // =====================================================
  // PROFILE PHOTO PREVIEW
  // =====================================================

  const handleProfilePhotoChange =
    (event) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        setProfileMessage(
          "Please select a valid image file."
        );

        return;
      }


      const imageUrl =
        URL.createObjectURL(
          file
        );


      setProfileImage(
        imageUrl
      );


      setProfileMessage(
        "Profile photo updated for this session."
      );


      setTimeout(() => {
        setProfileMessage("");
      }, 3000);
    };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "userId"
      );

      localStorage.removeItem(
        "userName"
      );

      localStorage.removeItem(
        "userEmail"
      );

      localStorage.removeItem(
        "userRole"
      );

      navigate("/login");
    };


  // =====================================================
  // INITIALS
  // =====================================================

  const displayName =
    profile.name ||
    "Teacher";


  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map(
        (name) =>
          name.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();


  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {

    return (

      <main className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-6 py-7">

        <div className="mx-auto flex w-full max-w-[770px] items-center justify-center rounded-[16px] border border-[#e2e8f0] bg-white px-6 py-16">

          <div className="flex items-center gap-3 text-sm text-[#64748b]">

            <Loader2
              className="h-5 w-5 animate-spin text-blue-600"
            />

            Loading profile...

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <main className="min-h-[calc(100vh-65px)] bg-[#f8fafc] px-6 py-7">

      <div className="mx-auto w-full max-w-[770px]">


        {/* HEADER */}

        <div className="mb-7">

          <h1 className="text-[25px] font-bold leading-[30px] tracking-tight text-[#17233c]">
            My Profile
          </h1>


          <p className="mt-[4px] text-[14px] leading-5 text-[#64748b]">
            Manage your personal information and account settings.
          </p>


          {error && (

            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>

          )}

        </div>


        {/* PROFILE CARD */}

        <section className="rounded-[16px] border border-[#e2e8f0] bg-white px-6 py-6">


          {/* PROFILE HEADER */}

          <div className="flex items-start justify-between gap-5">

            <div className="flex items-center gap-4">


              {/* AVATAR */}

              <div className="relative">

                {profileImage ? (

                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-[80px] w-[80px] rounded-[16px] object-cover"
                  />

                ) : (

                  <div className="flex h-[80px] w-[80px] items-center justify-center rounded-[16px] bg-gradient-to-br from-blue-500 to-indigo-600 text-[25px] font-bold text-white">
                    {initials}
                  </div>

                )}


                <label
                  htmlFor="teacher-profile-photo"
                  className="absolute bottom-[-3px] right-[-4px] flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                  title="Change profile photo"
                >

                  <Camera
                    className="h-[13px] w-[13px]"
                    strokeWidth={2}
                  />

                </label>


                <input
                  id="teacher-profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleProfilePhotoChange
                  }
                  className="hidden"
                />

              </div>


              {/* NAME */}

              <div>

                <h2 className="text-[20px] font-bold leading-6 text-[#17233c]">
                  {displayName}
                </h2>


                <p className="mt-[3px] text-[13px] text-[#64748b]">
                  {profile.email || "No email available"}
                </p>


                <div className="mt-2 flex items-center gap-2">

                  <span className="rounded-full bg-[#dbeafe] px-2.5 py-1 text-[11px] font-medium text-[#2563eb]">
                    {profile.role}
                  </span>

                  {profile.department && (

                    <span className="rounded-full bg-[#d1fae5] px-2.5 py-1 text-[11px] font-medium text-[#059669]">
                      {profile.department}
                    </span>

                  )}

                </div>

              </div>

            </div>


            {/* EDIT */}

            {!isEditing && (

              <button
                type="button"
                onClick={
                  handleEditProfile
                }
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


          {/* PROFILE MESSAGE */}

          {profileMessage && (

            <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {profileMessage}
            </div>

          )}


          {/* STATISTICS */}

          <div className="mt-6 flex min-h-[82px] items-center rounded-[14px] bg-[#f8fafc]">

            <div className="flex flex-1 flex-col items-center">

              <span className="text-[21px] font-bold text-[#17233c]">

                {statsLoading
                  ? "..."
                  : stats.students === null
                    ? "—"
                    : stats.students}

              </span>

              <span className="mt-[3px] text-[12px] text-[#94a3b8]">
                Students
              </span>

            </div>


            <div className="h-[50px] w-px bg-[#e2e8f0]" />


            <div className="flex flex-1 flex-col items-center">

              <span className="text-[21px] font-bold text-[#17233c]">
                {statsLoading
                  ? "..."
                  : stats.subjects}
              </span>

              <span className="mt-[3px] text-[12px] text-[#94a3b8]">
                Subjects
              </span>

            </div>


            <div className="h-[50px] w-px bg-[#e2e8f0]" />


            <div className="flex flex-1 flex-col items-center">

              <span className="text-[21px] font-bold text-[#17233c]">
                {statsLoading
                  ? "..."
                  : stats.notes}
              </span>

              <span className="mt-[3px] text-[12px] text-[#94a3b8]">
                Notes Uploaded
              </span>

            </div>

          </div>


          {/* PERSONAL INFORMATION */}

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">


            <ProfileField
              label="FULL NAME"
              value={
                editProfile.name
              }
              editing={
                isEditing
              }
              onChange={(value) =>
                handleProfileChange(
                  "name",
                  value
                )
              }
            />


            <ProfileField
              label="EMAIL ADDRESS"
              value={
                editProfile.email
              }
              editing={
                isEditing
              }
              onChange={(value) =>
                handleProfileChange(
                  "email",
                  value
                )
              }
            />


            <ProfileField
              label="PHONE NUMBER"
              value={
                editProfile.phone
              }
              editing={
                false
              }
              disabled
            />


            <ProfileField
              label="EMPLOYEE ID"
              value={
                editProfile.employeeId
              }
              editing={
                false
              }
              disabled
            />


            <ProfileField
              label="DEPARTMENT"
              value={
                editProfile.department
              }
              editing={
                false
              }
              disabled
            />


            <ProfileField
              label="SPECIALIZATION"
              value={
                editProfile.specialization
              }
              editing={
                false
              }
              disabled
            />

          </div>


          {/* EDIT ACTIONS */}

          {isEditing && (

            <div className="mt-6 flex justify-end gap-2 border-t border-[#f1f5f9] pt-5">

              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                className="flex h-[38px] items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 text-[13px] font-medium text-[#475569] transition hover:bg-[#f8fafc]"
              >

                <X className="h-4 w-4" />

                Cancel

              </button>


              <button
                type="button"
                onClick={
                  handleSaveProfile
                }
                className="flex h-[38px] items-center gap-2 rounded-xl bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >

                <Check className="h-4 w-4" />

                Save Changes

              </button>

            </div>

          )}

        </section>


        {/* CHANGE PASSWORD */}

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

            <PasswordField
              label="CURRENT PASSWORD"
              name="current"
              value={
                passwords.current
              }
              onChange={
                handlePasswordChange
              }
            />


            <PasswordField
              label="NEW PASSWORD"
              name="newPassword"
              value={
                passwords.newPassword
              }
              onChange={
                handlePasswordChange
              }
            />


            <PasswordField
              label="CONFIRM NEW PASSWORD"
              name="confirm"
              value={
                passwords.confirm
              }
              onChange={
                handlePasswordChange
              }
            />

          </div>


          {passwordMessage && (

            <p
              className={`mt-3 text-[12px] ${
                passwordMessage.includes(
                  "successfully"
                )
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {passwordMessage}
            </p>

          )}


          <button
            type="button"
            onClick={
              handleUpdatePassword
            }
            className="mt-5 h-[40px] rounded-xl bg-[#17233c] px-5 text-[13px] font-semibold text-white transition hover:bg-[#0f172a]"
          >
            Update Password
          </button>

        </section>


        {/* SIGN OUT */}

        <section className="mt-6 rounded-[16px] border border-[#fecaca] bg-white px-6 py-5">

          <h2 className="text-[16px] font-bold text-[#17233c]">
            Sign Out
          </h2>


          <p className="mt-1 text-[13px] text-[#64748b]">
            You will be signed out from all active sessions on this device.
          </p>


          <button
            type="button"
            onClick={
              handleLogout
            }
            className="mt-4 flex h-[40px] items-center gap-2 rounded-xl bg-[#ff3b3b] px-5 text-[13px] font-semibold text-white transition hover:bg-[#ef3030]"
          >

            <LogOut
              className="h-[15px] w-[15px]"
              strokeWidth={1.8}
            />

            Sign Out

          </button>

        </section>


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
  disabled = false,
}) {

  const displayValue =
    value ||
    "Not available yet";


  return (

    <div>

      <label className="mb-2 block text-[11px] font-medium tracking-[0.02em] text-[#94a3b8]">
        {label}
      </label>


      {editing && !disabled ? (

        <input
          value={
            value || ""
          }
          onChange={(event) =>
            onChange?.(
              event.target.value
            )
          }
          className="h-[42px] w-full rounded-xl border border-[#dbe3ed] bg-white px-4 text-[13px] text-[#334155] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
        />

      ) : (

        <div className="flex h-[42px] items-center rounded-xl bg-[#f8fafc] px-4 text-[13px] text-[#64748b]">
          {displayValue}
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
