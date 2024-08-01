// app/layout.tsx
'use client'
import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import Wallet from './walletadapter';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id={'root'}>
          <Wallet>
          <AppWrappers>
            {children}
          </AppWrappers>
          </Wallet>
      </body>
    </html>
  );
}