# 💎 Inventory & Profit Prediction System

A modern, glassmorphism-styled ERP system tailored for Gem trading. This application allows users to track inventory, predict profits, manage sales, and maintain audit logs with a high-end visual experience.

![Dashboard Preview](https://i.imgur.com/example-dashboard-preview.png)

## ✨ Key Features

-   **🎨 Glassmorphism UI:** Vibrant, high-end design with blurred overlays, gradients, and **3D floating gem animations**.
-   **📦 Inventory Management:** comprehensive tracking of gem details (Weight, Shape, Processing Expenses, etc.).
-   **💰 Profit Prediction:** Real-time calculation of estimated profit based on buying price, processing costs, and market value.
-   **🔍 Smart Search:** Instant filtering by "Lot Number" (e.g., L001) or "Gem Type" (e.g., Sapphire).
-   **📱 Mobile-First:** Fully responsive "Card Grid" layout that replaces traditional tables on smaller screens.
-   **📝 Audit Logs:** Automatic tracking of every change made to inventory items for specialized accountability.
-   **🔒 Secure Auth:** Integrated with Supabase Authentication.

## 🛠️ Tech Stack

-   **Framework:** [Next.js 14+](https://nextjs.org/) (App Directory)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS + Custom CSS Variables
-   **Database & Auth:** [Supabase](https://supabase.com/)
-   **Icons:** Lucide React
-   **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   A Supabase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Blitz2001/Inventory-Profit-Prediction-System.git
    cd Inventory-Profit-Prediction-System
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Database Schema

The core `inventory` table requires the following key columns (see `types/index.ts` for full definition):
-   `gem_type` (text)
-   `lot_number` (int)
-   `weight_ct` (float)
-   `buying_price` (float)
-   `predict_total_cost_lkr` (float) - *Labeled as "Processing Expenses"*
-   `predict_val_per_ct_lkr` (float)
-   `status` (text) - ('In Stock', 'Sold', 'Memo', 'Cutting')

## 🌍 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
4.  Deploy!

## 📄 License

This project is private and proprietary.
