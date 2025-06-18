import { App } from "@/types";
import { Head } from "@inertiajs/react";
import { Card } from "@/Components/ui/card";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdateProfileInformation from "./Partials/UpdateProfileInformationForm";
import { useI18n } from "@/hooks/use-i18n";
import { PageTitle } from "@/Components/ui/page-title";
import { UserCog } from "lucide-react";

export default function Edit({
    mustVerifyEmail,
    status,
}: { mustVerifyEmail: boolean; status?: string }) {
    const { t } = useI18n();

    return (
        <>
            <Head title={t("profile", "Profile")} />

            <PageTitle
                title={t("profile", "Profile")}
                icon={<UserCog className="h-6 w-6 text-primary" />}
            />

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
