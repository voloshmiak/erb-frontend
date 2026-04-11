import type { ReactNode } from 'react';
import { Sidebar } from '@/3_widgets/sidebar/ui/Sidebar';
import { Header } from '@/3_widgets/header/ui/Header';
import { cn } from '@/6_shared/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

export const PageLayout = ({ children, mainClassName }: PageLayoutProps) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e5e9f0]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className={cn('relative flex-1 h-full overflow-hidden', mainClassName)}>{children}</main>
      </div>
    </div>
  );
};
