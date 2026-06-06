import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function EmailNotificationToggle() {
    const user = usePage().props.auth.user;
    const { post, processing } = useForm();

    const handleToggle = (e) => {
        e.preventDefault();
        post(route('profile.toggle-email-notifications'));
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Pengaturan Notifikasi</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Aktifkan notifikasi email untuk mendapatkan update penting via email (approval, revisi, perubahan status, dll).
                </p>
            </header>
            <div className="mt-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-700">Notifikasi Email</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Status saat ini:{' '}
                        <span className={`font-bold ${user.email_notifications ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {user.email_notifications ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </p>
                </div>
                <form onSubmit={handleToggle}>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`px-5 py-2 rounded text-sm font-bold transition-colors border-0 cursor-pointer disabled:opacity-50 ${
                            user.email_notifications
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                    >
                        {user.email_notifications ? 'Nonaktifkan Email' : 'Aktifkan Email'}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <EmailNotificationToggle />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
