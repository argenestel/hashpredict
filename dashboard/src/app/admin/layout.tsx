'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import routes from 'routes';
import { getActiveRoute, isWindowAvailable } from 'utils/navigation';
import React from 'react';
import Navbar from 'components/navbar';

export default function Admin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';

  return (
    <div className="flex flex-col min-h-screen bg-background-100 dark:bg-background-900">
      <Navbar
      
        brandText={getActiveRoute(routes, pathname)}  onOpenSidenav={function (): void {
          throw new Error('Function not implemented.');
        } }      />
      <main className="flex-grow w-full dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}