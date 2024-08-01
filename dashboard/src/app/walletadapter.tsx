'use client'
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";


// Default styles that can be overridden by your app
function Wallet({ children }: { children: React.ReactNode }) {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const wallets = [new PetraWallet()];
      
    return (
      <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      optInWallets={["Petra"]}
      >{children}
        </AptosWalletAdapterProvider>
    );
  }
  
  export default Wallet;