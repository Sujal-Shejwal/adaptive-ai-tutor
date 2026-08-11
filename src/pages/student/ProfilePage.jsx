import {
    UserRound,
    Mail,
    BookOpen,
    CalendarDays,
    Edit3,
} from "lucide-react";


function ProfilePage() {

    return (
        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

            {/* Page Header */}
            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-900">
                    My Profile
                </h1>

                <p className="mt-2 text-slate-500">
                    View and manage your student profile.
                </p>

            </div>


            {/* Profile Card */}
            <div className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                {/* Profile Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-6">

                    <div className="flex items-center gap-5">

                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100">

                            <UserRound
                                size={38}
                                className="text-blue-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-2xl font-semibold text-slate-900">
                                Sujal Shejwal
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Student
                            </p>

                        </div>

                    </div>


                    <button className="flex items-center gap-2 rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">

                        <Edit3 size={16} />

                        Edit Profile

                    </button>

                </div>


                {/* Profile Information */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

                    <div className="rounded-xl bg-slate-50 p-5">

                        <div className="flex items-center gap-3">

                            <Mail className="text-blue-600" size={20} />

                            <div>

                                <p className="text-xs text-slate-400">
                                    Email
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    sujal@example.com
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="rounded-xl bg-slate-50 p-5">

                        <div className="flex items-center gap-3">

                            <BookOpen className="text-green-600" size={20} />

                            <div>

                                <p className="text-xs text-slate-400">
                                    Role
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    Student
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="rounded-xl bg-slate-50 p-5">

                        <div className="flex items-center gap-3">

                            <CalendarDays className="text-purple-600" size={20} />

                            <div>

                                <p className="text-xs text-slate-400">
                                    Member Since
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    2026
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="rounded-xl bg-slate-50 p-5">

                        <div className="flex items-center gap-3">

                            <UserRound className="text-orange-600" size={20} />

                            <div>

                                <p className="text-xs text-slate-400">
                                    Account Type
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    Student Account
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default ProfilePage;