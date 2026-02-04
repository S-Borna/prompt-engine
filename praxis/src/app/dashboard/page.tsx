import { redirect } from 'next/navigation';

// Redirect /dashboard to /dashboard/spark (main tool)
export default function DashboardPage() {
    redirect('/dashboard/spark');
}
