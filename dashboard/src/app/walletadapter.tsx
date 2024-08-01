'use client'
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import {Network} from "@aptos-labs/ts-sdk";

// Default styles that can be overridden by your app
function Wallet({ children }: { children: React.ReactNode }) {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const wallets = [new PetraWallet()];
      
    return (
      <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      optInWallets={["Petra"]}
      dappConfig={{ network: Network.DEVNET, aptosConnectDappId: "c9f9642d-cac0-4399-b2cc-2e79057da812" }}
      >{children}
        </AptosWalletAdapterProvider>
    );
  }
  
  export default Wallet;