import React, { useState, useEffect } from 'react';
import { useWallet, WalletReadyState } from '@aptos-labs/wallet-adapter-react';
import { IoWallet, IoClose, IoChevronDown } from 'react-icons/io5';

const WalletButton = ({ name, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full p-4 mb-3 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
  >
    <div className="flex items-center">
      <img src={icon} alt={name} className="w-8 h-8 mr-3" />
      <span className="text-sm font-medium dark:text-white">{name}</span>
    </div>
    <span className="text-sm text-gray-500 dark:text-gray-400">Connect</span>
  </button>
);

const WalletSelector = () => {
  const { connect, disconnect, account, network, wallets } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    setAvailableWallets(
      wallets.filter((wallet) => wallet.readyState === WalletReadyState.Installed)
    );
  }, [wallets]);

  const handleConnect = (wallet) => {
    connect(wallet.name);
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-brand-500 dark:bg-brand-400 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-brand-500 transition-colors"
      >
        <IoWallet className="mr-2" />
        {account ? truncateAddress(account.address) : 'Connect Wallet'}
        <IoChevronDown className="ml-2" />
      </button>

      {isOpen && (
        <div className="fixed inset-10 flex items-baseline justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Wallet</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <IoClose size={24} />
              </button>
            </div>

            {account ? (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-navy-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connected account</p>
                  <p className="font-medium dark:text-white">{truncateAddress(account.address)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-navy-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Network</p>
                  <p className="font-medium dark:text-white">{network?.name || 'Unknown'}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2 bg-red-500 dark:bg-red-400 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-500 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-gray-600 dark:text-gray-300">Connect a wallet to get started</p>
                {availableWallets.map((wallet) => (
                  <WalletButton
                    key={wallet.name}
                    name={wallet.name}
                    icon={wallet.icon}
                    onClick={() => handleConnect(wallet)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;