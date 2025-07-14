# Larament - E-commerce Starter Template

Larament is a powerful e-commerce starter template built on the Laravel framework, designed to provide a solid foundation for building modern online stores. It comes packed with a comprehensive set of features, a beautiful and responsive user interface, and a flexible architecture that can be easily extended and customized.

## Features

-   **Responsive Design:** Fully responsive and mobile-friendly design that looks great on all devices.
-   **Product Catalog:** Manage products, categories, and brands with ease.
-   **Shopping Cart:** A feature-rich shopping cart with support for promotions and discounts.
-   **Wishlist:** Allow customers to save their favorite products for later.
-   **Checkout:** A streamlined and user-friendly checkout process.
-   **Order Management:** Track and manage orders, handle returns, and process refunds.
-   **Payment Gateway Integration:** Seamlessly integrate with the Kashier payment gateway.
-   **Customer Accounts:** Customers can create accounts, manage their profiles, and view their order history.
-   **Powerful Admin Panel:** A comprehensive admin panel built with FilamentPHP for managing all aspects of your store.
-   **Search:** Fast and accurate product search powered by TNTSearch.
-   **Promotion Engine:** Create flexible promotions with various conditions and rewards.
-   **Notifications:** Keep your customers informed with push notifications.
-   **Social Login:** Allow customers to sign in with their social media accounts.

## Technical Stack

-   **Backend:** Laravel 11
-   **Admin Panel:** FilamentPHP 3
-   **Frontend:** React with Inertia.js
-   **Database:** MySQL
-   **Search:** TNTSearch
-   **Payment Gateway:** Kashier

## Getting Started

### Prerequisites

-   PHP 8.2 or higher
-   Node.js 18 or higher
-   Composer
-   Docker

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/CodeWithDennis/larament.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd larament
    ```

3.  **Install PHP dependencies:**

    ```bash
    composer install
    ```

4.  **Install NPM dependencies:**

    ```bash
    npm install
    ```

5.  **Copy the environment file:**

    ```bash
    cp .env.example .env
    ```

6.  **Generate an application key:**

    ```bash
    php artisan key:generate
    ```

7.  **Start the development server:**

    ```bash
    ./vendor/bin/sail up -d
    ```

8.  **Run database migrations and seeders:**

    ```bash
    ./vendor/bin/sail artisan migrate --seed
    ```

9.  **Build frontend assets:**

    ```bash
    npm run dev
    ```

You can now access the application at [http://localhost](http://localhost). The admin panel is available at [http://localhost/admin](http://localhost/admin).

### Default Admin Credentials

-   **Email:** `admin@larament.com`
-   **Password:** `password`

## License

Larament is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
