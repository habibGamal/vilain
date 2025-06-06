<?php

namespace App\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    public function __construct(int $requestedQuantity, int $availableQuantity, string $itemName = 'Product')
    {
        parent::__construct(
            "Insufficient stock for {$itemName}. Requested: {$requestedQuantity}, Available: {$availableQuantity}"
        );
    }
}
