import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { Card } from "@/components/ui/card";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdateProfileInformation from "./Partials/UpdateProfileInformationForm";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { t } = useLanguage();

    return (
        <>
            <Head title={t("profile", "Profile")} />

            <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                <Card className="p-4 sm:p-8">
                    <UpdateProfileInformation
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </Card>

                <Card className="p-4 sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </Card>

                <Card className="p-4 sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </Card>
            </div>
        </>
    );
}
