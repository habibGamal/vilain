<?php

namespace App\Providers;

use App\Jobs\ImportCsv;
use BezhanSalleh\FilamentLanguageSwitch\LanguageSwitch;
use Filament\Actions\Imports\Jobs\ImportCsv as BaseImportCsv;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(BaseImportCsv::class, ImportCsv::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Model::unguard();

        LanguageSwitch::configureUsing(function (LanguageSwitch $switch) {
            $switch
                ->locales(['ar']);
        });
    }
}
