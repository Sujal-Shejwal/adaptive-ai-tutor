import {
    Camera,
    LockKeyhole,
    Pencil,
    LogOut,
} from "lucide-react";

import {
    useRef,
    useState,
} from "react";


function ProfilePage() {

    /* ===================================================== */
    /* DUMMY PROFILE DATA */
    /* ===================================================== */

    const [profile, setProfile] = useState({
        fullName: "Sujal Shejwal",
        email: "sujal@example.com",
        phone: "+91 98765 43210",
        rollNumber: "CE-2022-041",
        department: "Information Technology",
        year: "3rd Year",
        role: "Student",
        memberSince: "2026",
    });


    /* ===================================================== */
    /* PROFILE PHOTO */
    /* ===================================================== */

    const [profileImage, setProfileImage] =
        useState(null);

    const [showPhotoMenu, setShowPhotoMenu] =
        useState(false);

    const fileInputRef = useRef(null);


    /* ===================================================== */
    /* EDIT PROFILE STATE */
    /* ===================================================== */

    const [isEditing, setIsEditing] =
        useState(false);

    const [editForm, setEditForm] =
        useState(profile);


    /* ===================================================== */
    /* PASSWORD STATE */
    /* ===================================================== */

    const [passwordForm, setPasswordForm] =
        useState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

    const [passwordMessage, setPasswordMessage] =
        useState("");


    /* ===================================================== */
    /* PROFILE MESSAGE */
    /* ===================================================== */

    const [profileMessage, setProfileMessage] =
        useState("");


    /* ===================================================== */
    /* PROFILE PHOTO SELECT */
    /* ===================================================== */

    const handleProfileImageChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        /* Only allow image files */
        if (!file.type.startsWith("image/")) {

            setProfileMessage(
                "Please select a valid image file."
            );

            return;
        }


        /* Create temporary preview URL */
        const imageUrl =
            URL.createObjectURL(file);


        setProfileImage(imageUrl);

        setShowPhotoMenu(false);

        setProfileMessage(
            "Profile photo updated successfully."
        );


        setTimeout(() => {
            setProfileMessage("");
        }, 3000);
    };


    /* ===================================================== */
    /* CHANGE PHOTO */
    /* ===================================================== */

    const handleChooseProfilePhoto = () => {

        setShowPhotoMenu(false);

        fileInputRef.current?.click();
    };


    /* ===================================================== */
    /* REMOVE PHOTO */
    /* ===================================================== */

    const handleRemoveProfilePhoto = () => {

        setProfileImage(null);

        setShowPhotoMenu(false);

        /* Clear file input so the same file
           can be selected again later */
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }


        setProfileMessage(
            "Profile photo removed successfully."
        );


        setTimeout(() => {
            setProfileMessage("");
        }, 3000);
    };


    /* ===================================================== */
    /* EDIT PROFILE */
    /* ===================================================== */

    const handleEditProfile = () => {

        setEditForm(profile);

        setProfileMessage("");

        setIsEditing(true);
    };


    /* ===================================================== */
    /* SAVE PROFILE */
    /* ===================================================== */

    const handleSaveProfile = () => {

        setProfile(editForm);

        setIsEditing(false);

        setProfileMessage(
            "Profile updated successfully."
        );


        setTimeout(() => {
            setProfileMessage("");
        }, 3000);
    };


    /* ===================================================== */
    /* CANCEL PROFILE EDIT */
    /* ===================================================== */

    const handleCancelEdit = () => {

        setEditForm(profile);

        setIsEditing(false);

        setProfileMessage("");
    };


    /* ===================================================== */
    /* HANDLE PROFILE INPUT */
    /* ===================================================== */

    const handleProfileChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setEditForm(
            (previousForm) => ({
                ...previousForm,
                [name]: value,
            })
        );
    };


    /* ===================================================== */
    /* HANDLE PASSWORD INPUT */
    /* ===================================================== */

    const handlePasswordChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setPasswordForm(
            (previousForm) => ({
                ...previousForm,
                [name]: value,
            })
        );
    };


    /* ===================================================== */
    /* UPDATE PASSWORD */
    /* ===================================================== */

    const handleUpdatePassword = () => {

        setPasswordMessage("");


        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {

            setPasswordMessage(
                "Please fill in all password fields."
            );

            return;
        }


        if (
            passwordForm.newPassword.length < 6
        ) {

            setPasswordMessage(
                "New password must contain at least 6 characters."
            );

            return;
        }


        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {

            setPasswordMessage(
                "New password and confirmation do not match."
            );

            return;
        }


        setPasswordMessage(
            "Password updated successfully."
        );


        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });


        setTimeout(() => {
            setPasswordMessage("");
        }, 3000);
    };


    /* ===================================================== */
    /* SIGN OUT */
    /* ===================================================== */

    const handleSignOut = () => {

        /*
         * Temporary frontend behavior.
         * Real authentication/logout will be connected
         * with the backend later.
         */

        window.location.href = "/login";
    };


    /* ===================================================== */
    /* INITIALS */
    /* ===================================================== */

    const initials = profile.fullName
        .split(" ")
        .map(
            (name) => name.charAt(0)
        )
        .join("")
        .slice(0, 2)
        .toUpperCase();


    return (
        <div className="min-h-full bg-slate-50 px-6 pb-10 pt-20">

            <div className="mx-auto max-w-[770px]">


                {/* ================================================= */}
                {/* PAGE HEADER */}
                {/* ================================================= */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-slate-900">
                        My Profile
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage your personal information and account settings.
                    </p>

                </div>


                {/* ================================================= */}
                {/* PROFILE CARD */}
                {/* ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


                    {/* ================================================= */}
                    {/* PROFILE HEADER */}
                    {/* ================================================= */}

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


                        {/* Avatar + Name */}
                        <div className="flex items-center gap-4">


                            {/* ================================================= */}
                            {/* PROFILE PHOTO */}
                            {/* ================================================= */}

                            <div className="relative">


                                {/* Hidden file input */}
                                <input
                                    ref={
                                        fileInputRef
                                    }
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleProfileImageChange
                                    }
                                    className="hidden"
                                />


                                {/* Profile Image / Initials */}
                                {profileImage ? (

                                    <img
                                        src={
                                            profileImage
                                        }
                                        alt={
                                            profile.fullName
                                        }
                                        className="h-20 w-20 rounded-2xl object-cover"
                                    />

                                ) : (

                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-bold text-white">
                                        {initials}
                                    </div>

                                )}


                                {/* Camera Button */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPhotoMenu(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                                    title="Profile photo options"
                                >
                                    <Camera size={14} />
                                </button>


                                {/* ================================================= */}
                                {/* PHOTO OPTIONS MENU */}
                                {/* ================================================= */}

                                {showPhotoMenu && (

                                    <div className="absolute left-0 top-[88px] z-50 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">


                                        {/* Change Photo */}
                                        <button
                                            type="button"
                                            onClick={
                                                handleChooseProfilePhoto
                                            }
                                            className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Change Photo
                                        </button>


                                        {/* Remove Photo */}
                                        {profileImage && (

                                            <button
                                                type="button"
                                                onClick={
                                                    handleRemoveProfilePhoto
                                                }
                                                className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                            >
                                                Remove Photo
                                            </button>

                                        )}

                                    </div>

                                )}

                            </div>


                            {/* ================================================= */}
                            {/* NAME */}
                            {/* ================================================= */}

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {profile.fullName}
                                </h2>


                                <p className="mt-1 text-sm text-slate-500">
                                    {profile.email}
                                </p>


                                <div className="mt-2 flex flex-wrap items-center gap-2">

                                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-600">
                                        {profile.role}
                                    </span>


                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-600">
                                        {profile.year}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* EDIT PROFILE BUTTON */}
                        {/* ================================================= */}

                        {!isEditing && (

                            <button
                                type="button"
                                onClick={
                                    handleEditProfile
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >

                                <Pencil
                                    size={16}
                                />

                                Edit Profile

                            </button>

                        )}

                    </div>


                    {/* ================================================= */}
                    {/* STATISTICS */}
                    {/* ================================================= */}

                    <div className="mt-6 grid grid-cols-3 rounded-2xl bg-slate-50 px-4 py-5">


                        <div className="text-center">

                            <p className="text-2xl font-bold text-slate-900">
                                347
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Questions Asked
                            </p>

                        </div>


                        <div className="border-x border-slate-200 text-center">

                            <p className="text-2xl font-bold text-slate-900">
                                28
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Quizzes Done
                            </p>

                        </div>


                        <div className="text-center">

                            <p className="text-2xl font-bold text-slate-900">
                                76%
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Avg Score
                            </p>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* PROFILE MESSAGE */}
                    {/* ================================================= */}

                    {profileMessage && (

                        <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                            {profileMessage}
                        </div>

                    )}


                    {/* ================================================= */}
                    {/* PERSONAL INFORMATION */}
                    {/* ================================================= */}

                    <div className="mt-7">

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                            {/* Full Name */}
                            <div>

                                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Full Name
                                </label>


                                {isEditing ? (

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={
                                            editForm.fullName
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    />

                                ) : (

                                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        {profile.fullName}
                                    </div>

                                )}

                            </div>


                            {/* Email */}
                            <div>

                                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Email Address
                                </label>


                                {isEditing ? (

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            editForm.email
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    />

                                ) : (

                                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        {profile.email}
                                    </div>

                                )}

                            </div>


                            {/* Phone */}
                            <div>

                                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Phone Number
                                </label>


                                {isEditing ? (

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            editForm.phone
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    />

                                ) : (

                                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        {profile.phone}
                                    </div>

                                )}

                            </div>


                            {/* Roll Number */}
                            <div>

                                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Roll Number
                                </label>


                                {isEditing ? (

                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={
                                            editForm.rollNumber
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    />

                                ) : (

                                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        {profile.rollNumber}
                                    </div>

                                )}

                            </div>


                            {/* Department */}
                            <div>

                                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Department
                                </label>


                                {isEditing ? (

                                    <input
                                        type="text"
                                        name="department"
                                        value={
                                            editForm.department
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    />

                                ) : (

                                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        {profile.department}
                                    </div>

                                )}

                            </div>


                            {/* Year */}
                            <div>

                                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Year
                                </label>


                                {isEditing ? (

                                    <select
                                        name="year"
                                        value={
                                            editForm.year
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    >

                                        <option>
                                            1st Year
                                        </option>

                                        <option>
                                            2nd Year
                                        </option>

                                        <option>
                                            3rd Year
                                        </option>

                                        <option>
                                            4th Year
                                        </option>

                                    </select>

                                ) : (

                                    <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        {profile.year}
                                    </div>

                                )}

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* EDIT ACTIONS */}
                        {/* ================================================= */}

                        {isEditing && (

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleSaveProfile
                                    }
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>

                            </div>

                        )}

                    </div>

                </div>


                {/* ================================================= */}
                {/* CHANGE PASSWORD */}
                {/* ================================================= */}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <LockKeyhole
                            size={18}
                            className="text-slate-500"
                        />

                        <h2 className="text-lg font-bold text-slate-900">
                            Change Password
                        </h2>

                    </div>


                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">


                        {/* Current Password */}
                        <div>

                            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Current Password
                            </label>

                            <input
                                type="password"
                                name="currentPassword"
                                value={
                                    passwordForm.currentPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="••••••••"
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />

                        </div>


                        {/* New Password */}
                        <div>

                            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                New Password
                            </label>

                            <input
                                type="password"
                                name="newPassword"
                                value={
                                    passwordForm.newPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="••••••••"
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />

                        </div>


                        {/* Confirm Password */}
                        <div>

                            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={
                                    passwordForm.confirmPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="••••••••"
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />

                        </div>

                    </div>


                    {/* Password message */}
                    {passwordMessage && (

                        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                            {passwordMessage}
                        </div>

                    )}


                    <button
                        type="button"
                        onClick={
                            handleUpdatePassword
                        }
                        className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Update Password
                    </button>

                </div>


                {/* ================================================= */}
                {/* SIGN OUT */}
                {/* ================================================= */}

                <div className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold text-slate-900">
                        Sign Out
                    </h2>


                    <p className="mt-2 text-sm text-slate-500">
                        You will be signed out from all active sessions on this device.
                    </p>


                    <button
                        type="button"
                        onClick={
                            handleSignOut
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                    >

                        <LogOut
                            size={16}
                        />

                        Sign Out

                    </button>

                </div>

            </div>

        </div>
    );
}


export default ProfilePage;