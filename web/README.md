# Smart Dental Care - Responsive Web Application

This is the web-based counterpart to the Smart Dental Care Android application. It shares the same Supabase project, database, and authentication system, ensuring real-time synchronization between mobile and web.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)

## Core Features
- **Real-time Synchronization:** Uses Supabase PostgREST and Realtime channels.
- **Unified Auth:** Share credentials and sessions between Android and Web.
- **Clinical Dashboard:** Mirroring the Android Command Center.
- **Patient Management:** Full CRUD operations and detailed clinical records.
- **Digital Prescriptions:** Dynamic medication builder and patient search.
- **AI STL Analysis:** Visual reference for 3D scan comparisons.

## How to Run Locally
1. Navigate to the `web` directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Shared Logic
All validation rules (e.g., patient registration fields) and data structures exactly match the Kotlin models in the Android source code to prevent database conflicts.
