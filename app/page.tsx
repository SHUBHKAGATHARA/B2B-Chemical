import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Home() {
    // Always redirect to login page when opening the app root
    // The user explicitly requested to "Always Ask For Login"
    redirect('/login');
}
