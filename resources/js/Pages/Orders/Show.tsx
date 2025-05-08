import { useLanguage } from "@/Contexts/LanguageContext";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { App } from "@/types";
import { PageTitle } from "@/Components/ui/page-title";
import {
    OrderProgress,
    OrderCancelledAlert,
    OrderDetailsCard,
    ShippingAddressCard,
    OrderItemsCard,
    CancellationPolicy,
    OrderThankYou
} from "@/Components/Orders";

interface OrderShowProps extends App.Interfaces.AppPageProps {
    order: App.Models.Order;
}

export default function Show({ order }: OrderShowProps) {
    const { t } = useLanguage();

    // Handle order cancellation
    const handleCancelOrder = () => {
        if (
            confirm(
                t(
                    "confirm_cancel_order",
                    "Are you sure you want to cancel this order?"
                )
            )
        ) {
            router.post(
                route("orders.cancel", order.id),
                {},
                {
                    onSuccess: () => {
                        // No need to do anything here, this will be handled by Inertia
                    },
                }
            );
        }
    };

    return (
        <>
            <Head title={t("order_details", "Order Details")} />

            <div className="space-y-8">
                {/* Order Header with Back Button and Order Number */}
                <PageTitle
                    title={`${t("order_number", "Order")} #${order.id}`}
                    backUrl={route("orders.index")}
                    backText={t("back_to_orders", "Back to Orders")}
                    className="pb-4 border-b"
                />

                {/* Order Status Timeline */}
                {order.order_status !== "cancelled" && (
                    <OrderProgress order={order} />
                )}

                {/* Order Cancelled Alert */}
                {order.order_status === "cancelled" && (
                    <OrderCancelledAlert />
                )}

                {/* Order Information Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    <OrderDetailsCard order={order} />
                    <ShippingAddressCard address={order.shipping_address} />
                </div>

                {/* Order Items with Order Summary */}
                <OrderItemsCard order={order} />

                {/* Cancellation policy and action for processing orders */}
                {order.order_status === "processing" && (
                    <>
                        <CancellationPolicy />
                        <div className="flex justify-center">
                            <Button
                                variant="destructive"
                                onClick={handleCancelOrder}
                                className="mt-2"
                            >
                                {t("cancel_order", "Cancel Order")}
                            </Button>
                        </div>
                    </>
                )}

                {/* "Thank you" message at the bottom */}
                <OrderThankYou />
            </div>
        </>
    );
}
