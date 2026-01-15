import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

// Only these emails can access the admin/status checker
// Set ADMIN_EMAIL in your .env.local file
const ALLOWED_ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(e => e.trim().toLowerCase()) || [];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }
  
  // Check if user's email is in the allowed admin list
  const userEmail = user.email?.toLowerCase();
  
  // Only allow specific email(s) to access admin area
  if (!userEmail || !ALLOWED_ADMIN_EMAILS.includes(userEmail)) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
