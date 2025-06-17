# Tosslee - Decide. Declutter. Done.

Your digital decision buddy. A fast, swipe-style decluttering tool with smart categorization and momentum tracking.

## Features

- **Swipe Decisions**: Keep or toss with simple swipes, build momentum with combo streaks
- **Smart Location Tracking**: Tag items, create containers, always know where everything lives
- **Session Modes**: Quick Sort (5 min), Speed Toss (rapid fire), Deep Sort (focused)
- **Progress Insights**: Track decision speed, keep rates, and celebrate milestones
- **Social Sessions**: Declutter together with friends, share tough decisions
- **Mobile-First Design**: Optimized for fast, on-the-go decisions
- **Export Functionality**: Download your inventory and decision history

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components**: Custom components with Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tosslee
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schemas in `supabase/schema.sql` and `supabase/storage.sql`
   - Copy your project URL and anon key

4. Configure environment variables:
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. **Sign In**: Enter your email to receive a magic link
2. **Create Inventory**: Start a new inventory session
3. **Share with Partner**: Copy the share code for your partner
4. **Add Items**: Upload photos and add details (location, tags, notes)
5. **Vote**: Each partner votes Keep/Toss/Maybe
6. **Review**: Filter by agreement status and plan actions
7. **Export**: Generate lists for donation/disposal

## Project Structure

```
keeportoss/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # User dashboard
│   ├── inventory/[id]/    # Inventory detail page
│   └── join/[code]/       # Join inventory by share code
├── components/            # React components
├── lib/                   # Utilities and configurations
│   └── supabase/         # Supabase client setup
└── supabase/             # Database schemas
```

## Database Schema

- **inventories**: Main inventory sessions
- **items**: Individual items with photos
- **votes**: User decisions (keep/toss/maybe)
- **comments**: Discussion threads
- **tags**: Item categorization
- **locations**: Predefined room/area list

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access inventories they're members of
- Secure file uploads with user-scoped storage

## Deployment

The app is ready for deployment on Vercel:

```bash
npm run build
```

Set environment variables in your Vercel project settings.

## Future Enhancements

- Progress statistics dashboard
- Bulk export functionality
- Mobile app version
- AI-powered duplicate detection
- Integration with marketplace apps
- Barcode scanning for products

## License

MIT