<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ App\Services\SettingsService::get('site_title', config('app.name', 'Laravel')) }}</title>

        <!-- Site Icon/Favicon -->
        @if(App\Services\SettingsService::get('site_icon'))
            @php
                $siteIcon = App\Services\SettingsService::get('site_icon');
                $iconUrl = str_starts_with($siteIcon, 'http') ? $siteIcon : asset('storage/' . $siteIcon);
            @endphp
            <link rel="icon" type="image/x-icon" href="{{ $iconUrl }}">
            <link rel="shortcut icon" type="image/x-icon" href="{{ $iconUrl }}">
        @endif

        <link rel="manifest" href="/manifest.json">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <!-- Facebook Pixel Code -->
        @if(App\Services\SettingsService::get('facebook_pixel_url'))
            <script>
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                '{{ App\Services\SettingsService::get('facebook_pixel_url') }}');

                @php
                    $pixelId = App\Services\SettingsService::get('facebook_pixel_id');
                @endphp

                @if($pixelId)
                    fbq('init', '{{ $pixelId }}');
                @endif
                fbq('track', 'PageView');
            </script>
            <noscript>
                @if($pixelId ?? false)
                    <img height="1" width="1" style="display:none"
                         src="https://www.facebook.com/tr?id={{ $pixelId }}&ev=PageView&noscript=1"/>
                @endif
            </noscript>
        @endif
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
