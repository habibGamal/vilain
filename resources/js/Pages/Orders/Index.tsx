import { useLanguage } from "@/Contexts/LanguageContext";
import { Head, Link } from "@inertiajs/react";
import { ShoppingBag } from "lucide-react";
import EmptyState from "@/Components/ui/empty-state";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { formatDate } from "@/lib/utils";
import MainLayout from "@/Layouts/MainLayout";
import { App } from "@/types";
import ItemGrid from "@/Components/ItemGrid";
import { PageTitle } from "@/Components/ui/page-title";

interface OrdersIndexProps extends App.Interfaces.AppPageProps {
    orders: {
        data: App.Models.Order[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
}

export default function Index() {
    const { t, getLocalizedField } = useLanguage();

    // Helper function to get appropriate status badge color
    const getStatusBadgeColor = (status: App.Models.OrderStatus) => {
        switch (status) {
            case "processing":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
            case "shipped":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
            case "delivered":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
            case "cancelled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500";
        }
    };

    return (
        <>
            <Head title={t("my_orders", "My Orders")} />

            <div className="space-y-6">
                <PageTitle
                    title={t("my_orders", "My Orders")}
                    icon={<ShoppingBag className="h-6 w-6 text-primary" />}
                />
                <ItemGrid<App.Models.Order>
                    className="py-0"
                    sectionId="orders"
                    dataKey="orders_data"
                    paginationKey="orders_pagination"
                    viewType="scroll"
                    scrollDirection="vertical"
                    renderItem={(order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <CardTitle className="text-base font-medium">
                                        {t("order_number", "Order")} #{order.id}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>
                                            {formatDate(order.created_at)}
                                        </span>
                                        <span className="hidden sm:inline">
                                            •
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={getStatusBadgeColor(
                                                order.order_status
                                            )}
                                        >
                                            {t(
                                                `order_status_${order.order_status}`,
                                                order.order_status
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {t("items", "Items")}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.items?.length || 0}{" "}
                                            {t("items", "items")}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {t("total", "Total")}
                                        </p>
                                        <p className="text-sm">
                                            ${Number(order.total).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {t(
                                                "payment_method",
                                                "Payment Method"
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                `payment_method_${order.payment_method}`,
                                                order.payment_method ===
                                                    "cash_on_delivery"
                                                    ? "Cash on Delivery"
                                                    : order.payment_method
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <Button asChild variant="outline">
                                            <Link
                                                href={route(
                                                    "orders.show",
                                                    order.id
                                                )}
                                            >
                                                {t(
                                                    "view_details",
                                                    "View Details"
                                                )}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                />
            </div>
        </>
    );
}
