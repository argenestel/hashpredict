'use client'
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import OpenAI from "openai";
import Card from 'components/card';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import Image from 'next/image';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore, createCollection, create } from '@metaplex-foundation/mpl-core';
import { useWallet } from '@solana/wallet-adapter-react';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { generateSigner, publicKey } from '@metaplex-foundation/umi';
import toast from 'react-hot-toast';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OpenAIDalle = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });

const gameOptions = [
    { value: 'knife_game', label: 'Knife Game' },
];

const itemTypes = [
    { value: 'weapon_skin', label: 'Weapon Skin' },
    { value: 'player_skin', label: 'Player Skin' },
    { value: 'accessory', label: 'Accessory' },
];

const CreateGameItemNFT = () => {
    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isMintingNFT, setIsMintingNFT] = useState(false);
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [heart, setHeart] = useState(true);
    const [mintedNFTId, setMintedNFTId] = useState(null);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [isDemoMinting, setIsDemoMinting] = useState(false);
    const [demoNFTId, setDemoNFTId] = useState(null);
    const [demoCollectionId, setDemoCollectionId] = useState(null);

    const wallet = useWallet();
    const umi = createUmi(process.env.NEXT_PUBLIC_RPC_ENDPOINT)
        .use(walletAdapterIdentity(wallet))
        .use(mplCore());

    useEffect(() => {
        const storedCollections = localStorage.getItem('collections');
        if (storedCollections) {
            setCollections(JSON.parse(storedCollections));
        }
    }, []);

    const generateImage = async (prompt) => {
        setIsGeneratingImage(true);
        try {
            const response = await OpenAIDalle.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });

            if (response.data && response.data.length > 0) {
                setGeneratedImage(response.data[0].url);
                return response.data[0].url;
            }
            return null;
        } catch (error) {
            console.error("Error generating image:", error);
            return null;
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const prompt = `Generate a ${data.itemType} for ${data.game} with the following description: ${data.aiPrompt}`;
            await generateImage(prompt);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const createNewCollection = async (data) => {
        setIsCreatingCollection(true);
        try {
            const collectionAddress = generateSigner(umi);
            await createCollection(umi, {
                name: data.collectionName,
                uri: data.collectionUri,
                collection: collectionAddress,
            }).sendAndConfirm(umi);

            const newCollection = {
                address: collectionAddress.publicKey,
                name: data.collectionName
            };
            const updatedCollections = [...collections, newCollection];
            setCollections(updatedCollections);
            localStorage.setItem('collections', JSON.stringify(updatedCollections));

            setSelectedCollection(collectionAddress.publicKey);
            setValue('collectionAddress', collectionAddress.publicKey);

            toast.success('Collection created successfully!');
            return collectionAddress.publicKey;
        } catch (error) {
            console.error("Error creating collection:", error);
            toast.error('Failed to create collection');
            throw error;
        } finally {
            setIsCreatingCollection(false);
        }
    };

    const mintNFT = async (data) => {
        setIsMintingNFT(true);
        try {
            const assetAddress = generateSigner(umi);
            const collection = await umi.rpc.getAccount(publicKey(data.collectionAddress));
            await create(umi, {
                name: `${data.game} ${data.itemType} NFT`,
                uri: generatedImage,
                asset: assetAddress,
                collection: collection,
            }).sendAndConfirm(umi);

            setMintedNFTId(assetAddress.publicKey);
            toast.success('NFT minted successfully!');

            const explorerUrl = `https://explorer.solana.com/address/${assetAddress.publicKey}?cluster=devnet`;
            toast((t) => (
                <div>
                    NFT minted! <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View on Explorer</a>
                </div>
            ), { duration: 5000 });
        } catch (error) {
            console.error("Error minting NFT:", error);
            toast.error('Failed to mint NFT');
        } finally {
            setIsMintingNFT(false);
        }
    };

    // Keep the existing demo minting functions unchanged
    const createDemoCollection = async () => {
        // ... (keep the existing implementation)
    };

    const mintDemoNFT = async (collectionAddress) => {
        // ... (keep the existing implementation)
    };

    const handleDemoMint = async () => {
        // ... (keep the existing implementation)
    };

    return (
        <div className="flex flex-col items-center pt-20 px-4">
            <h1 className="text-4xl font-bold text-navy-700 dark:text-white mb-8">Create Game Item NFT</h1>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1200px]">
                <Card extra="flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white">
                    <div className="mb-3">
                        <p className="text-lg font-bold text-navy-700 dark:text-white">Item Configuration</p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-bold text-navy-700 dark:text-white">Select Game</label>
                            <Controller
                                name="game"
                                control={control}
                                rules={{ required: "Please select a game" }}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:!border-white/10 dark:bg-navy-800 dark:text-white"
                                    >
                                        <option value="">Select a game</option>
                                        {gameOptions.map((game) => (
                                            <option key={game.value} value={game.value}>
                                                {game.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.game && <span className="text-red-500 text-sm">{errors.game.message as string}</span>}
                        </div>

                        <div>
                            <label className="text-sm font-bold text-navy-700 dark:text-white">Item Type</label>
                            <Controller
                                name="itemType"
                                control={control}
                                rules={{ required: "Please select an item type" }}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:!border-white/10 dark:bg-navy-800 dark:text-white"
                                    >
                                        <option value="">Select an item type</option>
                                        {itemTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.itemType && <span className="text-red-500 text-sm">{errors.itemType.message as string}</span>}
                        </div>

                        <div>
                            <label className="text-sm font-bold text-navy-700 dark:text-white">AI Prompt</label>
                            <textarea
                                {...register('aiPrompt', { required: 'AI Prompt is required' })}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:!border-white/10 dark:bg-navy-800 dark:text-white"
                                rows={4}
                                placeholder="Describe the item you want to generate..."
                            />
                            {errors.aiPrompt && <span className="text-red-500 text-sm">{errors.aiPrompt.message as string}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isGeneratingImage}
                            className="linear mt-4 rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                        >
                            {isGeneratingImage ? 'Generating Image...' : 'Generate Game Item'}
                        </button>
                    </form>

     
                </Card>

                <Card extra="flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white">
                    <div className="relative w-full">
                        {generatedImage ? (
                            <Image
                                width={512}
                                height={512}
                                src={generatedImage}
                                alt="Generated item"
                                className="mb-3 h-full w-full rounded-xl object-cover"
                            />
                        ) : (
                            <div className="mb-3 h-64 w-full rounded-xl bg-gray-100 flex items-center justify-center">
                                <p className="text-gray-500">Your generated image will appear here</p>
                            </div>
                        )}
                        <button
                            onClick={() => setHeart(!heart)}
                            className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-white p-2 text-brand-500 hover:cursor-pointer"
                        >
                            <div className="flex h-full w-full items-center justify-center rounded-full text-xl hover:bg-gray-50 dark:text-navy-900">
                                {heart ? <IoHeartOutline /> : <IoHeart className="text-brand-500" />}
                            </div>
                        </button>
                    </div>
                    <div className="mt-4">
                        <p className="text-lg font-bold text-navy-700 dark:text-white">Generated Item</p>
                        <p className="mt-1 text-sm font-medium text-gray-600">Created by AI</p>
                    </div>
                    {generatedImage && (
                        <div className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-bold text-navy-700 dark:text-white">Collection Option</label>
                                <div className="flex mt-2 space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value="select"
                                            {...register('collectionOption')}
                                            className="form-radio text-brand-500"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-white">Select Existing Collection</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value="create"
                                            {...register('collectionOption')}
                                            className="form-radio text-brand-500"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-white">Create New Collection</span>
                                    </label>
                                </div>
                            </div>

                            {watch('collectionOption') === 'select' && (
                                <div>
                                    <label className="text-sm font-bold text-navy-700 dark:text-white">Select Collection</label>
                                    <Controller
                                        name="collectionAddress"
                                        control={control}
                                        rules={{ required: "Please select a collection" }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:!border-white/10 dark:bg-navy-800 dark:text-white"
                                            >
                                                <option value="">Select a collection</option>
                                                {collections.map((collection) => (
                                                    <option key={collection.address} value={collection.address}>
                                                        {collection.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.collectionAddress && <span className="text-red-500 text-sm">{errors.collectionAddress.message as string}</span>}
                                </div>
                            )}

                            {watch('collectionOption') === 'create' && (
                                <>
                                    <div>
                                        <label className="text-sm font-bold text-navy-700 dark:text-white">New Collection Name</label>
                                        <input
                                            {...register('collectionName', { required: "Collection name is required" })}
                                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:!border-white/10 dark:bg-navy-800 dark:text-white"
                                        />
                                        {errors.collectionName && <span className="text-red-500 text-sm">{errors.collectionName.message as string}</span>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-navy-700 dark:text-white">New Collection URI</label>
                                        <input
                                            {...register('collectionUri', { required: "Collection URI is required" })}
                                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:!border-white/10 dark:bg-navy-800 dark:text-white"
                                        />
                                        {errors.collectionUri && <span className="text-red-500 text-sm">{errors.collectionUri.message as string}</span>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSubmit(createNewCollection)}
                                        disabled={isCreatingCollection}
                                        className="linear mt-2 rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                                    >
                                        {isCreatingCollection ? 'Creating Collection...' : 'Create New Collection'}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleSubmit(mintNFT)}
                                disabled={isMintingNFT}
                                className="linear mt-4 rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                            >
                                {isMintingNFT ? 'Minting NFT...' : 'Mint as NFT'}
                            </button>
                        </div>
                    )}

                    {mintedNFTId && (
                        <div className="mt-4">
                            <p className="text-sm font-bold text-navy-700 dark:text-white">Minted NFT ID:</p>
                            <p className="text-sm text-gray-600 dark:text-white break-all">{mintedNFTId}</p>
                            <a
                                href={`https://explorer.solana.com/address/${mintedNFTId}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline"
                            >
                                View on Solana Explorer
                            </a>
                        </div>
                    )}
                </Card>
            </div>

            {/* Demo NFT Minting Section (unchanged) */}
            <Card extra="flex flex-col w-full h-full mt-8 !p-4 3xl:p-![18px] bg-white max-w-[1200px]">
                <div className="mb-3">
                    <p className="text-lg font-bold text-navy-700 dark:text-white">Demo NFT Minting</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Image
                        width={200}
                        height={200}
                        src="https://cdn.pixabay.com/photo/2020/07/14/11/22/graphic-5403808_1280.png"
                        alt="Demo NFT"
                        className="rounded-xl object-cover"
                    />
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600 dark:text-white">This demo will create a collection and mint an NFT using the image shown.</p>
                        <button
                            onClick={handleDemoMint}
                            disabled={isDemoMinting}
                            className="linear mt-2 rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                        >
                            {isDemoMinting ? 'Minting Demo NFT...' : 'Mint Demo NFT'}
                        </button>
                    </div>
                </div>
                {demoCollectionId && (
                    <div className="mt-4">
                        <p className="text-sm font-bold text-navy-700 dark:text-white">Demo Collection ID:</p>
                        <p className="text-sm text-gray-600 dark:text-white break-all">{demoCollectionId}</p>
                    </div>
                )}
                {demoNFTId && (
                    <div className="mt-2">
                        <p className="text-sm font-bold text-navy-700 dark:text-white">Demo NFT ID:</p>
                        <p className="text-sm text-gray-600 dark:text-white break-all">{demoNFTId}</p>
                    </div>
                )}
            </Card>

            {/* 3D World Generation Section (unchanged) */}
            <Card extra="flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white mt-8 max-w-[1200px] relative overflow-hidden">
                <div className="mb-3">
                    <p className="text-lg font-bold text-navy-700 dark:text-white">Generate 3D World</p>
                </div>
                <form className="flex flex-col gap-4 opacity-50 pointer-events-none">
                    <div>
                        <label className="text-sm font-bold text-navy-700 dark:text-white">3D Model Type</label>
                        <div className="flex mt-2 space-x-4">
                            <label className="flex items-center space-x-2">
                                <input type="radio" value="lowpoly" name="modelType" className="form-radio text-brand-500" />
                                <span className="text-sm text-gray-600 dark:text-white">Low Poly</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="radio" value="realistic" name="modelType" className="form-radio text-brand-500" />
                                <span className="text-sm text-gray-600 dark:text-white">Realistic</span>
                            </label>
                        </div>
                    </div>
                    <button className="linear mt-4 rounded-xl bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
                        Generate 3D Model
                    </button>
                </form>
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <p className="text-2xl font-bold text-navy-700">3D and World Coming Soon!</p>
                </div>
            </Card>
        </div>
    );
};

export default CreateGameItemNFT;