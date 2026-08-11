import { useLocation } from "react-router-dom";


function PlaceholderPage() {

    const location = useLocation();

    const pageName = location.pathname
        .split("/")
        .pop()
        .replace("-", " ");


    const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);


    return (
        <div className="min-h-full bg-slate-50 px-6 pb-8 pt-20">

            <div className="rounded-2xl border border-slate-200 bg-white p-8">

                <h1 className="text-2xl font-bold capitalize text-slate-900">
                    {title}
                </h1>

                <p className="mt-2 text-slate-500">
                    This page is part of the Adaptive AI Tutor platform.
                    The full UI will be built in a later development step.
                </p>

                <div className="mt-6 rounded-xl bg-blue-50 p-5">

                    <p className="text-sm font-medium text-blue-700">
                        Frontend prototype
                    </p>

                    <p className="mt-1 text-sm text-blue-600">
                        Backend, database and real functionality will be connected later.
                    </p>

                </div>

            </div>

        </div>
    );
}


export default PlaceholderPage;