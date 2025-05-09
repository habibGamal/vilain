<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Section;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SectionService
{
    /**
     * Get all active sections.
     *
     * @return Collection
     */
    public function getAllActiveSections(): Collection
    {
        return Section::where('active', true)
            ->orderBy('sort_order', 'asc')
            ->with(['products' => function ($query) {
                $query->where('is_active', true)
                    ->with([
                        'brand' => function ($query) {
                            $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                        }
                    ]);
            }])
            ->get();
    }

    /**
     * Get a specific section by ID.
     *
     * @param int $id
     * @return Section|null
     */
    public function getSectionById(int $id): ?Section
    {
        return Section::where('id', $id)
            ->where('active', true)
            ->with(['products' => function ($query) {
                $query->where('is_active', true);
            }])
            ->first();
    }

    /**
     * Get featured products for a virtual section.
     *
     * @param int $limit
     * @param bool $paginate
     * @param int $perPage
     * @return Collection|LengthAwarePaginator
     */
    public function getFeaturedProducts(int $limit = 10, bool $paginate = false, int $perPage = 10): Collection|LengthAwarePaginator
    {
        $query = Product::where('is_active', true)
            ->where('is_featured', true)
            ->with([
                'brand' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                }
            ]);

        if ($paginate) {
            return $query->paginate($perPage);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get products on sale for a virtual section.
     *
     * @param int $limit
     * @param bool $paginate
     * @param int $perPage
     * @return Collection|LengthAwarePaginator
     */
    public function getProductsOnSale(int $limit = 10, bool $paginate = false, int $perPage = 10): Collection|LengthAwarePaginator
    {
        $query = Product::where('is_active', true)
            ->whereNotNull('sale_price')
            ->with([
                'brand' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                }
            ]);

        if ($paginate) {
            return $query->paginate($perPage);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get newly added products for a virtual section.
     *
     * @param int $limit
     * @param bool $paginate
     * @param int $perPage
     * @return Collection|LengthAwarePaginator
     */
    public function getNewProducts(int $limit = 10, bool $paginate = false, int $perPage = 10): Collection|LengthAwarePaginator
    {
        $query = Product::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->with([
                'brand' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                }
            ]);

        if ($paginate) {
            return $query->paginate($perPage);
        }

        return $query->limit($limit)->get();
    }
}
