'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KnifePHQ from 'components/game/KnifePHQ';
import Card from 'components/card';
import { useWallet } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore, fetchAssetsByOwner } from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import NftSelectionModal from 'components/Modal/Modal';

const games = {
  'knife-phq': {
    title: 'Knife PHQ',
    component: KnifePHQ,
    description: 'An exciting knife-throwing adventure!',
  },
};

export default function GamePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const slug = params.slug;
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const wallet = useWallet();

  useEffect(() => {
    if (slug) {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchUserNFTs(wallet.publicKey);
    }
  }, [wallet.publicKey]);

  const fetchUserNFTs = async (publicKey) => {
    try {
      const umi = createUmi(process.env.NEXT_PUBLIC_RPC_ENDPOINT)
        .use(mplCore())
        .use(walletAdapterIdentity(wallet));

      const nfts = await fetchAssetsByOwner(umi, publicKey);
      console.log("Fetched NFTs:", nfts);
      setOwnedNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const handleSelectNFT = (imageUrl) => {
    console.log("Selected NFT URL in GamePage:", imageUrl);
    setGeneratedImageUrl(imageUrl);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-bold text-navy-700 dark:text-white">Loading game...</p>
      </div>
    );
  }

  const game = games[slug as string];

  if (!game) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-bold text-navy-700 dark:text-white">Game not found</p>
      </div>
    );
  }

  const GameComponent = game.component;

  return (
    <Card extra="flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 dark:text-white">{game.title}</h1>
          <p className="mt-2 text-base text-gray-600">{game.description}</p>
        </div>
        <button
          onClick={() => {
            console.log("Opening modal");
            setIsModalOpen(true);
          }}
          className="linear rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          Select NFT
        </button>
      </div>
      <div className="flex-grow" style={{ height: 'calc(100vh - 200px)' }}>
        <GameComponent generatedImageUrl={generatedImageUrl} />
      </div>


      <NftSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ownedNFTs={ownedNFTs}
        onSelectNFT={handleSelectNFT}
      />
    </Card>
  );
}