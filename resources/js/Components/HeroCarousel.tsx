import { Button } from "@/Components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/Components/ui/carousel";
import { Image } from "@/Components/ui/Image";
import { useLanguage } from "@/Contexts/LanguageContext";
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
    const { getLocalizedField, direction } = useLanguage();
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="md:rtl:order-2 md:ltr:order-1 ">
                                <div className="aspect-[16/9] md:aspect-auto rounded-xl overflow-hidden bg-muted">
                                    <Image
                                        src={slide.image}
                                        alt={getLocalizedField(slide, "title")}
                                        className="w-full h-full object-cover"
                                        fallback={
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                {getLocalizedField(
                                                    {
                                                        no_image_en: "No Image",
                                                        no_image_ar:
                                                            "لا توجد صورة",
                                                    },
                                                    "no_image"
                                                )}
                                            </div>
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 md:rtl:order-1 md:ltr:order-2 ltr:force-ltr rtl:force-rtl">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                                    {getLocalizedField(slide, "title")}
                                </h1>
                                <p className="text-muted-foreground md:text-lg">
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
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden md:block">
                <CarouselPrevious className="rtl:-right-4 rtl:left-auto ltr:-left-4 ltr:right-auto" />
                <CarouselNext className="rtl:-left-4 rtl:right-auto ltr:-right-4 ltr:left-auto" />
            </div>
        </Carousel>
    );
}
