<?php

namespace App\Models;

use App\Enums\SectionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Section extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title_en',
        'title_ar',
        'active',
        'sort_order',
        'section_type',
    ];    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
        'sort_order' => 'integer',
        'section_type' => SectionType::class,
    ];    /**
     * Get the products for the section.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withTimestamps();
    }

    /**
     * Get the title based on the current locale.
     */
    public function getTitleAttribute()
    {
        $locale = app()->getLocale();
        $column = "title_{$locale}";
        
        return $this->{$column};
    }
}
