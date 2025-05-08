import { useLanguage } from "@/Contexts/LanguageContext";
import { Head, router, usePage } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { PageTitle } from "@/Components/ui/page-title";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/Components/ui/radio-group";
import { Label } from "@/Components/ui/label";
import AddressModal from "@/Components/AddressModal";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Home,
    MapPin,
    CreditCard,
    ArrowRight,
    ArrowLeft,
    Plus,
    ShoppingBag,
    Truck,
    Banknote,
    Receipt,
    CircleCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();

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

    // Reload order summary whenever address is changed
    useEffect(() => {
        const addressId = form.watch("address_id");
        if (addressId) {
            router.reload({
                only: ["orderSummary"],
                data: { address_id: addressId },
            });
        }
    }, [form.watch("address_id")]);

    // Calculate order totals
    const subtotal = orderSummary
        ? orderSummary.subtotal
        : cartSummary.totalPrice;
    const shippingCost = Number(orderSummary ? orderSummary.shippingCost : 0);
    const discount = orderSummary ? orderSummary.discount : 0;
    const total = subtotal + shippingCost - discount;

    // Handle order submission
    const onSubmit = (values: z.infer<typeof checkoutFormSchema>) => {
        if (!values.address_id) {
            toast({
                title: t("address_required", "Address is required"),
                description: t("select_address_first", "Please select or add a shipping address to continue."),
                variant: "destructive",
            });
            return;
        }

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
                        <Button variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("add_new_address", "Add New Address")}
                        </Button>
                    }
                    onAddressCreated={(newAddress) => {
                        // Update the form with the new address
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
                        {/* Left Column - Shipping Address and Payment Method */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Shipping Address Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        {t("shipping_address", "Shipping Address")}
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
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            {addresses.map(
                                                                (address) => (
                                                                    <div
                                                                        key={address.id}
                                                                        className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer ${
                                                                            field.value === address.id.toString()
                                                                            ? "border-primary bg-primary/5"
                                                                            : "border-border"
                                                                        }`}
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
                                                                                        address.area?.gov,
                                                                                        "name"
                                                                                    )}
                                                                                    ,{" "}
                                                                                    {getLocalizedField(
                                                                                        address.area,
                                                                                        "name"
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-sm text-muted-foreground">
                                                                                    {address.content}
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

                            {/* Payment Method Card */}
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
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        {paymentMethods.map(
                                                            (method) => (
                                                                <div
                                                                    key={method}
                                                                    className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer ${
                                                                        field.value === method
                                                                        ? "border-primary bg-primary/5"
                                                                        : "border-border"
                                                                    }`}
                                                                >
                                                                    <RadioGroupItem
                                                                        value={method}
                                                                        id={`payment-${method}`}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`payment-${method}`}
                                                                        className="font-medium cursor-pointer flex py-2 items-center gap-2"
                                                                    >
                                                                        {method === "cash_on_delivery" && (
                                                                            <Banknote className="w-4 h-4" />
                                                                        )}
                                                                        {method === "kashier" && (
                                                                            <CreditCard className="w-4 h-4" />
                                                                        )}
                                                                        {t(
                                                                            `payment_method_${method}`,
                                                                            method === "cash_on_delivery"
                                                                                ? "Cash on Delivery"
                                                                                : method === "kashier"
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

                            {/* Order Notes Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Receipt className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
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
                                                            "notes_placeholder",
                                                            "Add any special instructions or notes for your order..."
                                                        )}
                                                        {...field}
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div>
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ShoppingBag className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        {t("order_summary", "Order Summary")}
                                    </CardTitle>
                                    <CardDescription>
                                        {t("items_in_cart", "Items in your cart")}: {cartSummary.totalItems}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Order Summary Calculations */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                {t("subtotal", "Subtotal")}
                                            </span>
                                            <span>{subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Truck className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {t("shipping", "Shipping")}
                                                </span>
                                            </div>
                                            <span>
                                                {form.watch("address_id")
                                                    ? shippingCost.toFixed(2)
                                                    : t("select_address", "Select address")}
                                            </span>
                                        </div>

                                        {discount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    {t("discount", "Discount")}
                                                </span>
                                                <span className="text-green-500">
                                                    -{discount.toFixed(2)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="border-t pt-3 mt-3">
                                            <div className="flex items-center justify-between font-medium">
                                                <span>{t("total", "Total")}</span>
                                                <span className="text-lg">
                                                    {form.watch("address_id")
                                                        ? total.toFixed(2)
                                                        : subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional Coupon Code Input */}
                                    <div className="pt-4">
                                        <FormField
                                            control={form.control}
                                            name="coupon_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t("coupon_code", "Coupon Code")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t(
                                                                "coupon_placeholder",
                                                                "Enter coupon code"
                                                            )}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isSubmitting || addresses.length === 0 || !form.watch("address_id")}
                                    >
                                        {isSubmitting ? (
                                            t("processing_order", "Processing...")
                                        ) : (
                                            <>
                                                <CircleCheck className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                                {t("place_order", "Place Order")}
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}
