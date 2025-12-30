import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona automaticamente para o dashboard
  redirect('/dashboard');
}