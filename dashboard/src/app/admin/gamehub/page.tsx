'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import GameCard from 'components/card/GameCard';
import Link from 'next/link';

const GameHub = () => {
  const router = useRouter();

  const games = [
    {
      image: 'https://playspheregames.netlify.app/Logos/knifePHQ.png',
      title: 'Knife',
      description: 'An Exciting Adventure Game',
      linkMainnet: '/admin/games/knife-phq',
      linkExplore: '/admin/explore',
      linkMakeMod: '/admin/create-world',
      isInHouse: true,
      modLink: '/admin/games/knife-phq',
      isReleased: true
    },
    {
      image: 'https://lattice.xyz/_next/image?url=%2Fblog%2Fbro-spare-token%2Fsplash.jpg&w=3840&q=75',
      title: 'Sky Strife',
      description: 'An Exciting Adventure Game',
      linkMainnet: 'https://play.skystrife.xyz',
      linkExplore: '/explore-worlds',
      linkMakeMod: '/admin/create-world',
      isInHouse: false,
      modLink: '',
      isReleased: false

    },
    {
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2p1SmNFrKI2Zq3-jELJJ1oc9EoQTisJ8DBQ&s',
      title: 'This Cursed Machine',
      description: 'An Exciting Adventure Game',
      linkMainnet: 'https://thiscursedmachine.fun/',
      linkExplore: '/explore-worlds',
      linkMakeMod: '/admin/create-world',
      isInHouse: false,
      modLink: '',
      isReleased: false
    }
  ];

  const handlePlayGame = (game) => {
    if (game.isInHouse) {
      router.push(game.linkMainnet);
    } else {
      window.open(game.linkMainnet, '_blank');
    }
  };

  const handleExploreWorld = (link) => {
    router.push(link);
  };

  const handleMakeMod = (link) => {
    router.push(link);
  };

  return (
    <div className="flex flex-col items-center pt-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold dark:text-white text-blueSecondary mb-4">Game Dashboard</h1>
        <p className="text-lg dark:text-gray-200 text-blueSecondary">Explore and Play Exciting Games</p>
      </div>
{/* 
      <Link href="/admin/create-world" className="mb-8 px-6 py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600 transition-colors">
        Create New World
      </Link> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <GameCard
            key={index}
            image={game.image}
            title={game.title}
            description={game.description}
            onPlayMainnet={() => handlePlayGame(game)}
            onExploreWorld={() => handleExploreWorld(game.linkExplore)}
            onMakeMod={() => handleMakeMod(game.linkMakeMod)}
            modLink={game.modLink}
            isReleased={game.isReleased}
          />
        ))}
      </div>
    </div>
  );
};

export default GameHub;