import { Alert, AlertDescription } from "@/Components/ui/alert";
import AddressModal from "@/Components/AddressModal";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Separator } from "@/Components/ui/separator";
import { Textarea } from "@/Components/ui/textarea";
import { PageTitle } from "@/Components/ui/page-title";
import { useLanguage } from "@/Contexts/LanguageContext";
import { App } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    CreditCard,
    Home,
    MapPin,
    Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/Components/ui/form";
import { Label } from "@/Components/ui/label";
// Order summary type definition
interface OrderSummary {
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
}
interface CheckoutProps extends App.Interfaces.AppPageProps {
    orderSummary?: OrderSummary;
    cartSummary: {
        totalItems: number;
        totalPrice: number;
    };
    addresses: App.Models.Address[];
    paymentMethods: string[];
}

// Define form schema with zod
const checkoutFormSchema = z.object({
    address_id: z.string({
        required_error: "Please select a shipping address",
    }),
    payment_method: z.string({
        required_error: "Please select a payment method",
    }),
    notes: z.string().optional(),
    coupon_code: z.string().optional(),
});

export default function Index({
    orderSummary,
    cartSummary,
    addresses,
    paymentMethods,
}: CheckoutProps) {
    const { t, direction, getLocalizedField } = useLanguage();
    const ArrowIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with react-hook-form and zod validation
    const form = useForm<z.infer<typeof checkoutFormSchema>>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            address_id:
                addresses && addresses.length > 0
                    ? addresses[0].id.toString()
                    : "",
            payment_method:
                paymentMethods.length > 0
                    ? paymentMethods[0]
                    : "cash_on_delivery",
            notes: "",
            coupon_code: "",
        },
    });

    // Calculate shipping cost based on the selected address
    const getShippingCost = (): number => {
        const addressId = form.watch("address_id");
        if (!addressId) return 0;
        router.reload({
            only: ["orderSummary"],
            data: { address_id: addressId },
        });

        // In a real application, you might calculate this dynamically based on the address
        return 5.0; // Placeholder shipping cost
    };

    useEffect(() => {
        router.reload({
            only: ["orderSummary"],
            data: { address_id: form.watch("address_id") },
        });
    }, [form.watch("address_id")]);
    console.log(form.watch("address_id"))
    // Calculate order totals
    const subtotal = orderSummary
        ? orderSummary.subtotal
        : cartSummary.totalPrice;
    const shippingCost = orderSummary ? orderSummary.shippingCost : 0;
    const discount = orderSummary ? orderSummary.discount : 0; // Would be calculated based on coupon in a real app
    const total = subtotal + shippingCost - discount;

    // Handle order submission
    const onSubmit = (values: z.infer<typeof checkoutFormSchema>) => {
        setIsSubmitting(true);

        // Submit the order
        router.post(
            route("orders.store"),
            {
                address_id: parseInt(values.address_id),
                payment_method: values.payment_method,
                notes: values.notes || null,
                coupon_code: values.coupon_code || null,
            },
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <>
            <Head title={t("checkout", "Checkout")} />

            <div className="space-y-6">
                <PageTitle
                    title={t("checkout", "Checkout")}
                    backUrl={route("cart.index")}
                    backText={t("back_to_cart", "Back to Cart")}
                />

                <AddressModal
                    trigger={
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            {t("add_new_address", "Add New Address")}
                        </Button>
                    }
                    onAddressCreated={(newAddress) => {
                        // Update the local state with the new address
                        const updatedAddresses = [...addresses, newAddress];
                        // This forces a component re-render with the new address
                        router.reload({
                            only: ["addresses"],
                            onSuccess: () => {
                                form.setValue(
                                    "address_id",
                                    newAddress.id.toString()
                                );
                            },
                        });
                    }}
                />
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-6 md:grid-cols-3"
                    >
                        {/* Shipping Address Selection */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        {t(
                                            "shipping_address",
                                            "Shipping Address"
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {addresses.length === 0 ? (
                                        <Alert>
                                            <AlertDescription>
                                                {t(
                                                    "no_addresses",
                                                    "You have no saved addresses. Please add an address to continue."
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <FormField
                                            control={form.control}
                                            name="address_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroup
                                                            dir={direction}
                                                            className="space-y-4"
                                                        >
                                                            {addresses.map(
                                                                (address) => (
                                                                    <div
                                                                        key={
                                                                            address.id
                                                                        }
                                                                        className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer`}
                                                                    >
                                                                        <RadioGroupItem
                                                                            value={address.id.toString()}
                                                                            id={`address-${address.id}`}
                                                                            className="mt-1"
                                                                        />
                                                                        <Label
                                                                            htmlFor={`address-${address.id}`}
                                                                            className="font-medium cursor-pointer flex-1 py-2"
                                                                        >
                                                                            <div className="grid gap-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    {getLocalizedField(
                                                                                        address
                                                                                            .area
                                                                                            ?.gov,
                                                                                        "name"
                                                                                    )}

                                                                                    ,{" "}
                                                                                    {getLocalizedField(
                                                                                        address.area,
                                                                                        "name"
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-sm text-muted-foreground">
                                                                                    {
                                                                                        address.content
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                )
                                                            )}
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        {t("payment_method", "Payment Method")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="payment_method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroup
                                                        dir={direction}
                                                        className="space-y-4"
                                                    >
                                                        {paymentMethods.map(
                                                            (method) => (
                                                                <div
                                                                    key={method}
                                                                    className={`flex items-center gap-3 rounded-md border p-2 cursor-pointer`}
                                                                >
                                                                    <RadioGroupItem
                                                                        value={
                                                                            method
                                                                        }
                                                                        id={`payment-${method}`}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`payment-${method}`}
                                                                        className="font-medium cursor-pointer flex py-2 items-center gap-2"
                                                                    >
                                                                        {method ===
                                                                            "cash_on_delivery" && (
                                                                            <Home className="w-4 h-4" />
                                                                        )}
                                                                        {method ===
                                                                            "kashier" && (
                                                                            <CreditCard className="w-4 h-4" />
                                                                        )}
                                                                        {t(
                                                                            `payment_method_${method}`,
                                                                            method ===
                                                                                "cash_on_delivery"
                                                                                ? "Cash on Delivery"
                                                                                : method ===
                                                                                  "kashier"
                                                                                ? "Credit Card (Kashier)"
                                                                                : method
                                                                        )}
                                                                    </Label>
                                                                </div>
                                                            )
                                                        )}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Order Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t("order_notes", "Order Notes")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={t(
                                                            "order_notes_placeholder",
                                                            "Add any special instructions for your order or delivery"
                                                        )}
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        {/* Order Summary */}
                        <div className="space-y-6">
                            <Card className="sticky top-20">
                                <CardHeader>
                                    <CardTitle>
                                        {t("order_summary", "Order Summary")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <dt>{t("subtotal", "Subtotal")}</dt>
                                            <dd className="font-medium">
                                                ${subtotal.toFixed(2)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt>{t("shipping", "Shipping")}</dt>
                                            <dd className="font-medium">
                                                $
                                                {Number(shippingCost).toFixed(
                                                    2
                                                )}
                                            </dd>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <dt>
                                                    {t("discount", "Discount")}
                                                </dt>
                                                <dd className="font-medium">
                                                    -$
                                                    {discount.toFixed(2)}
                                                </dd>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-medium text-lg">
                                            <dt>{t("total", "Total")}</dt>
                                            <dd>${total.toFixed(2)}</dd>
                                        </div>
                                    </dl>
                                </CardContent>
                                <CardFooter className="flex-col gap-3">
                                    <Button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            !form.watch("address_id") ||
                                            orderSummary.totalItems === 0
                                        }
                                        className="w-full"
                                    >
                                        {isSubmitting
                                            ? t(
                                                  "placing_order",
                                                  "Placing Order..."
                                              )
                                            : t("place_order", "Place Order")}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        {t(
                                            "order_terms",
                                            "By placing this order, you agree to our Terms and Conditions"
                                        )}
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}
