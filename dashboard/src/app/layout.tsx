// app/layout.tsx
'use client'
import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import { Web3AuthProvider } from 'contexts/Web3Provider';
import Wallet from './walletadapter';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id={'root'}>
        <Web3AuthProvider>
          <Wallet>
          <AppWrappers>
            {children}
          </AppWrappers>
          </Wallet>
        </Web3AuthProvider>
      </body>
    </html>
  );
}