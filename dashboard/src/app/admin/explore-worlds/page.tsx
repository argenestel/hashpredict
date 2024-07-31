"use client"
import React from 'react'
import WorldCard from 'components/card/WorldCard'

const worlds = [
    {
        image: 'https://lattice.xyz/_next/image?url=%2Fblog%2Fbro-spare-token%2Fsplash.jpg&w=3840&q=75',
        title: 'World 1',
        description: 'An Exciting Adventure Game',
        linkMainnet: 'https://play.skystrife.xyz',
        linkExplore: '/explore-worlds',
        linkMakeMod: '/make-your-mod'
    },
    {
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2p1SmNFrKI2Zq3-jELJJ1oc9EoQTisJ8DBQ&s',
        title: 'This Cursed Machine',
        description: 'An Exciting Adventure Game',
        linkMainnet: 'https://thiscursedmachine.fun/',
        linkExplore: '/explore-worlds',
        linkMakeMod: '/make-your-mod'
    },
]

const ExploreWorlds = () => {
    return (
        <div className="flex flex-col items-center pt-20">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold dark:text-white text-blueSecondary mb-4">Explore Worlds</h1>
            <p className="text-lg dark:text-gray-200 text-blueSecondary">Discover and Play in Custom Worlds</p>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Blurred overlay */}
            <div className="absolute inset-0 bg-white/70 dark:bg-navy-900/70 backdrop-blur-lg z-50 flex items-center justify-center">
              <p className="text-3xl font-bold text-navy-700 dark:text-white">Coming Soon!</p>
            </div>
            {worlds.map((world, index) => (
              <WorldCard
                key={index}
                image={world.image}
                title={world.title}
                description={world.description}
                onsingle={() => window.open(world.linkMainnet, '_blank')}
                onmulti={() => window.open(world.linkMainnet, '_blank')}
              />
            ))}
          </div>
        </div>
      )
}

export default ExploreWorlds