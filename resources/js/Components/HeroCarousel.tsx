import { Button } from "@/Components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/Components/ui/carousel";
import { Image } from "@/Components/ui/Image";
import { useI18n } from "@/hooks/use-i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";

interface HeroSlide {
    id: number;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    image: string;
    cta_link: string;
}

interface HeroCarouselProps {
    heroSlides: HeroSlide[];
}

export default function HeroCarousel({ heroSlides }: HeroCarouselProps) {
    const { getLocalizedField, direction } = useI18n();
    const directionIcon =
        direction === "rtl" ? (
            <ChevronLeft className="h-4 w-4" />
        ) : (
            <ChevronRight className="h-4 w-4" />
        );
    const isRtl = direction === "rtl";

    if (!heroSlides || heroSlides.length === 0) {
        return null;
    }

    return (
        <Carousel className="w-full my-4 force-ltr" opts={{ loop: true }}>
            <CarouselContent>
                {heroSlides.map((slide) => (
                    <CarouselItem key={slide.id}>
                        <div className="relative">
                            {/* Mobile Layout */}
                            <div className="block md:hidden">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted">
                                        <Image
                                            src={slide.image}
                                            alt={getLocalizedField(slide, "title")}
                                            className="w-full h-full object-cover"
                                            fallback={
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    {getLocalizedField(
                                                        {
                                                            no_image_en: "No Image",
                                                            no_image_ar: "لا توجد صورة",
                                                        },
                                                        "no_image"
                                                    )}
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div className="space-y-4 ltr:force-ltr rtl:force-rtl">
                                        <h1 className="text-3xl font-bold">
                                            {getLocalizedField(slide, "title")}
                                        </h1>
                                        <p className="text-muted-foreground">
                                            {getLocalizedField(slide, "description")}
                                        </p>
                                        <div className="pt-4">
                                            <Button size="lg" className="font-medium" asChild>
                                                <Link href={slide.cta_link}>
                                                    {getLocalizedField(
                                                        {
                                                            shop_now_en: "Shop Now",
                                                            shop_now_ar: "تسوق الآن",
                                                        },
                                                        "shop_now"
                                                    )}{" "}
                                                    {directionIcon}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:block">
                                <div className="relative aspect-[21/9] overflow-hidden rounded-xl">
                                    <Image
                                        src={slide.image}
                                        alt={getLocalizedField(slide, "title")}
                                        className="w-full h-full object-cover"
                                        fallback={
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                {getLocalizedField(
                                                    {
                                                        no_image_en: "No Image",
                                                        no_image_ar: "لا توجد صورة",
                                                    },
                                                    "no_image"
                                                )}
                                            </div>
                                        }
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="grid place-items-center w-full mt-48 max-w-screen-xl mx-auto px-6 space-y-4 text-white ltr:force-ltr rtl:force-rtl">
                                            <h1 className="text-4xl lg:text-5xl font-bold">
                                                {getLocalizedField(slide, "title")}
                                            </h1>
                                            <p className="md:text-lg max-w-2xl">
                                                {getLocalizedField(slide, "description")}
                                            </p>
                                            <div className="pt-4">
                                                <Button
                                                    size="lg"
                                                    className="font-medium"
                                                    asChild
                                                >
                                                    <Link href={slide.cta_link}>
                                                        {getLocalizedField(
                                                            {
                                                                shop_now_en: "Shop Now",
                                                                shop_now_ar: "تسوق الآن",
                                                            },
                                                            "shop_now"
                                                        )}{" "}
                                                        {directionIcon}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden md:block">
                <CarouselPrevious className="left-6" />
                <CarouselNext className="right-6" />
            </div>
        </Carousel>
    );
}
