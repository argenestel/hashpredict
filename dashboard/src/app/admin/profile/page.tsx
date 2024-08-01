'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import Banner from 'components/admin/profile/Banner';
import Storage from 'components/admin/profile/Storage';
import Upload from 'components/admin/profile/Upload';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import NftCard from 'components/card/NftCard';

const NFTShowcase = ({ nfts }) => {
  return (
    <div className="col-span-12 lg:col-span-12">
      <div className="card">
        <div className="card-header">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">My Predictions</h4>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft, index) => (
              <NftCard
                key={nft.id}
                image={nft.uri}
                title={nft.name}
                author={nft.owner.slice(0, 6) + '...' + nft.owner.slice(-4)}
                bidders={['/img/avatars/avatar1.png', '/img/avatars/avatar2.png', '/img/avatars/avatar3.png']}
                price={0}
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
  const { account, connected } = useWallet();

  const config = new AptosConfig({ network: Network.DEVNET });
  const aptos = new Aptos(config);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (connected && account) {
          const walletAddress = account.address;
          
          // Fetch additional user data (replace with actual API call)
          const additionalData = await fetchAdditionalUserData(walletAddress);
          
          setUserData({ 
            ...additionalData,
            walletAddress 
          });
          
          // Fetch user's NFTs
          await fetchUserNFTs(walletAddress);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [connected, account]);

  const fetchUserNFTs = async (address) => {
    try {
      // Replace this with actual Aptos NFT fetching logic
      // This is a placeholder and needs to be implemented based on Aptos NFT standards
      const nfts = await aptos.getAccountResources({ accountAddress: address });
      console.log(nfts);
      setUserNFTs(nfts.filter(resource => resource.type.includes('::nft::')));
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
      position: 'Aptos Developer',
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

        {/* <div className="col-span-3 lg:!mb-0">
          <BlurredSection>
          <Storage />
          </BlurredSection>
        </div>

        <div className="z-0 col-span-5 lg:!mb-0">
          <BlurredSection>
          <Upload />
          </BlurredSection>
        </div> */}
      </div>
      
      <NFTShowcase nfts={userNFTs} />
    </div>
  );
};

export default ProfileOverview;