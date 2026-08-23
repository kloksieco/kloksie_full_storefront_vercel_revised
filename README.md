# Kloksie - E-Commerce Storefront

A modern e-commerce storefront built with Next.js, featuring a beautiful product showcase and a powerful admin dashboard for product management.

## Features

### 🛍️ Customer Features
- **Home Page** - Beautiful hero section showcasing your brand
- **Product Listing** - Browse all available products with images and prices
- **Product Details** - Detailed view of individual products
- **Responsive Design** - Works perfectly on all devices

### 🎛️ Admin Dashboard
- **Product Management** - Add, edit, and delete products
- **Stock Management** - Keep track of inventory
- **Product Status** - Mark products as active, inactive, or draft
- **Admin Authentication** - Secure access with password protection
- **Product Analytics** - View product count, active products, and total stock

## Tech Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kloksieco/kloksie_full_storefront_vercel_revised.git
cd kloksie_full_storefront_vercel_revised
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your settings:
```env
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── products/          # Product pages
│   └── page.tsx           # Home page
├── components/            # Reusable components
├── store/                 # Zustand store (state management)
├── types/                 # TypeScript type definitions
├── lib/                   # Utility functions and mock data
└── styles/               # Global styles
```

## Admin Access

### Login
- Navigate to `/admin`
- Default password: `admin123` (change this in production!)

### Admin Features
1. **Dashboard** (`/admin`) - Overview of all products
2. **Products List** (`/admin/products`) - View all products
3. **Add Product** (`/admin/products/new`) - Create a new product
4. **Edit Product** (`/admin/products/[id]`) - Modify existing products

## Product Management

### Adding a Product
1. Go to Admin → Add Product
2. Fill in product details:
   - Name
   - Price
   - Description
   - Category
   - Image URL
   - Stock quantity
   - SKU
   - Status (Active/Inactive/Draft)
3. Click "Create Product"

### Editing a Product
1. Go to Admin → Products
2. Click "Edit" on the product
3. Modify details
4. Click "Save Changes"

### Deleting a Product
1. Go to Admin → Products
2. Click "Delete" and confirm

## Customization

### Update Colors & Branding
- Edit `tailwind.config.ts` for color scheme
- Update store name in navigation bars
- Change logo/brand text

### Add More Categories
Edit `src/app/admin/products/new/page.tsx` and modify the category select options.

### Connect to a Database
Currently uses in-memory storage (Zustand). To persist data:
1. Set up a backend database (Firebase, MongoDB, PostgreSQL, etc.)
2. Create API routes in `src/app/api/`
3. Update store functions to call API endpoints

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect Next.js and deploy
4. Update environment variables in Vercel dashboard

## Future Enhancements

- [ ] Database integration (MongoDB, Firebase, etc.)
- [ ] Image upload functionality
- [ ] Shopping cart & checkout
- [ ] Order management
- [ ] Customer accounts
- [ ] Payment processing
- [ ] Email notifications
- [ ] Product reviews & ratings
- [ ] Analytics dashboard

## Support

For issues or questions, please create an issue on GitHub or contact support.

## License

MIT License - feel free to use this project for your own purposes.

---

Made with ❤️ by Kloksie
