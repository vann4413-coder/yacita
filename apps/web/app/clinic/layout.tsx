import type { Metadata } from 'next';
import { Sidebar } from '../../components/clinic/Sidebar';

export const metadata: Metadata = { title: { default: 'Panel', template: '%s | Yacita Clínica' } };

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bgsoft">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
