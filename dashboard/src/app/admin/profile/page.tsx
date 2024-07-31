'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Banner from 'components/admin/profile/Banner';
import General from 'components/admin/profile/General';
import Notification from 'components/admin/profile/Notification';
import Project from 'components/admin/profile/Project';
import Storage from 'components/admin/profile/Storage';
import Upload from 'components/admin/profile/Upload';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore, fetchAssetsByOwner } from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import NftCard from 'components/card/NftCard';

const NFTShowcase = ({ nfts }) => {
  return (
    <div className="col-span-12 lg:col-span-12">
      <div className="card">
        <div className="card-header">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">My NFTs</h4>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft, index) => (
              <NftCard
                key={nft.publicKey}
                image={nft.uri}
                title={nft.name}
                author={nft.owner.slice(0, 6) + '...' + nft.owner.slice(-4)}
                bidders={['/img/avatars/avatar1.png', '/img/avatars/avatar2.png', '/img/avatars/avatar3.png']}
                price={0} // As price is not available in the provided data, we're setting it to 0
                extra=""
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
const BlurredSection = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/70 dark:bg-navy-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
        <p className="text-xl font-bold text-navy-700 dark:text-white">Coming Soon!</p>
      </div>
    </div>
  );
};

const ProfileOverview = () => {
  const [userData, setUserData] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const wallet = useWallet();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (wallet.publicKey) {
          const walletAddress = wallet.publicKey.toString();
          
          // Fetch additional user data (replace with actual API call)
          const additionalData = await fetchAdditionalUserData(walletAddress);
          
          setUserData({ 
            ...additionalData,
            walletAddress 
          });
          
          // Fetch user's NFTs
          await fetchUserNFTs(wallet.publicKey);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [wallet.publicKey]);

  const fetchUserNFTs = async (publicKey) => {
    try {
      const umi = createUmi(process.env.NEXT_PUBLIC_RPC_ENDPOINT)
        .use(mplCore())
        .use(walletAdapterIdentity(wallet));

      const nfts = await fetchAssetsByOwner(umi, publicKey);
      console.log(nfts);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  // Placeholder function to fetch additional user data
  const fetchAdditionalUserData = async (walletAddress) => {
    // This should be replaced with an actual API call to your backend
    return {
      posts: 17,
      followers: '9.7K',
      following: 434,
      position: 'Solana Developer',
      bannerUrl: '/img/profile/banner.png',
      avatarUrl: '/img/avatars/avatar11.png',
    };
  };

  if (!userData) {
    return <div>Please connect your wallet to view your profile.</div>;
  }

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-5">
      <div className="w-ful mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
        <div className="col-span-4 lg:!mb-0">
          <Banner user={userData} />
        </div>

        <div className="col-span-3 lg:!mb-0">
          <BlurredSection>
          <Storage />
          </BlurredSection>
        </div>

        <div className="z-0 col-span-5 lg:!mb-0">
                    <BlurredSection>

          <Upload />
          </BlurredSection>
        </div>
      </div>
      
      <NFTShowcase nfts={userNFTs} />

      {/* <div className="mb-4 grid h-full grid-cols-1 gap-5 lg:!grid-cols-12">
        <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-4">
          <Project />
        </div>
        <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-5">
          <General />
        </div>

        <div className="col-span-5 lg:col-span-12 lg:mb-0 3xl:!col-span-3">
          <Notification />
        </div>
      </div> */}
    </div>
  );
};

export default ProfileOverview;