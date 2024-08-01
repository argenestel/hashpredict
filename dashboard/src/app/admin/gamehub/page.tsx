'use client'
import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, InputViewFunctionData, Network } from '@aptos-labs/ts-sdk';
import { IoClose, IoAdd,  IoRemove} from 'react-icons/io5';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-navy-900 dark:text-white rounded-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500  hover:text-gray-700">
          <IoClose size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const PredictionCard = ({ prediction, onPredict }) => {
  const [shareAmount, setShareAmount] = useState(1);
  const [isYesSelected, setIsYesSelected] = useState(true);

  const handleIncrement = () => setShareAmount(prev => prev + 1);
  const handleDecrement = () => setShareAmount(prev => Math.max(1, prev - 1));

  const handlePredict = () => {
    onPredict(prediction.id, isYesSelected, shareAmount);
  };

  const formatTime = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const calculatePercentage = (votes, total) => {
    return total > 0 ? (votes / total) * 100 : 50;
  };

  const yesPercentage = calculatePercentage(prediction.yes_votes, prediction.total_votes);
  const noPercentage = calculatePercentage(prediction.no_votes, prediction.total_votes);

  const isActive = prediction.state.value === 0; // Assuming 0 represents the active state

  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">{prediction.description}</h2>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">ID: {prediction.id}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">End Time: {formatTime(prediction.end_time)}</p>
        
        <div className="flex justify-between mb-2">
          <span className="text-brand-500 dark:text-brand-400 font-semibold">Yes: {prediction.yes_votes}</span>
          <span className="text-red-500 dark:text-red-400 font-semibold">No: {prediction.no_votes}</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2.5 mb-4">
          <div 
            className="bg-brand-500 dark:bg-brand-400 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${yesPercentage}%` }}
          />
        </div>
        
        {isActive && (
          <>
            <div className="flex justify-between mb-4">
              <button 
                onClick={() => setIsYesSelected(true)}
                className={`flex-1 py-2 px-4 rounded-l-lg transition-colors duration-200 ${
                  isYesSelected 
                    ? 'bg-brand-500 dark:bg-brand-400 text-white' 
                    : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Yes
              </button>
              <button 
                onClick={() => setIsYesSelected(false)}
                className={`flex-1 py-2 px-4 rounded-r-lg transition-colors duration-200 ${
                  !isYesSelected 
                    ? 'bg-red-500 dark:bg-red-400 text-white' 
                    : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                No
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handleDecrement}
                className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-2 transition-colors duration-200"
              >
                <IoRemove size={20} />
              </button>
              <input 
                type="number" 
                value={shareAmount}
                onChange={(e) => setShareAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center border dark:border-navy-600 rounded-lg py-2 bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300"
              />
              <button 
                onClick={handleIncrement}
                className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-2 transition-colors duration-200"
              >
                <IoAdd size={20} />
              </button>
            </div>
            
            <button 
              onClick={handlePredict}
              className="w-full bg-brand-500 dark:bg-brand-400 text-white rounded-lg py-2 px-4 hover:bg-brand-600 dark:hover:bg-brand-500 transition-colors duration-200"
            >
              Place Prediction
            </button>
          </>
        )}
        
        {!isActive && (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-4">
            This prediction is no longer active.
          </div>
        )}
      </div>
    </div>
  );
};


const GameHub = () => {
  const { connect, account, connected, disconnect, signAndSubmitTransaction } = useWallet();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPrediction, setNewPrediction] = useState({ description: '', duration: '' });

  const config = new AptosConfig({ network: Network.DEVNET });
  const aptos = new Aptos(config);

  const ADMIN_ADDRESS = '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd'; // Replace with actual admin address

  useEffect(() => {
    if (connected) {
      fetchPredictions();
    }
  }, [connected]);

  const fetchPredictions = async () => {
    try {
      const payload: InputViewFunctionData = {
        function: '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd::hashpredictalpha1::get_all_predictions',
        typeArguments: [],
        functionArguments: []
      };
      
      const result = await aptos.view({ payload });
      console.log(result);
      // Assuming the result is an array of arrays, we'll flatten it and set the predictions
      const flattenedPredictions = result.flat();
      setPredictions(flattenedPredictions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      setLoading(false);
    }
  };

  const handlePredict = async (predictionId, verdict) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd::hashpredictalpha1::predict',
          typeArguments: [],
          functionArguments: [predictionId, verdict, 1000], // Assuming 1000 as the share amount
        },
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert('Prediction submitted successfully!');
      fetchPredictions();
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert('Error submitting prediction. Please try again.');
    }
  };

  const handleCreatePrediction = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd::hashpredictalpha1::create_prediction',
          typeArguments: [],
          functionArguments: [newPrediction.description, parseInt(newPrediction.duration)],
        },
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert('Prediction created successfully!');
      setIsCreateModalOpen(false);
      setNewPrediction({ description: '', duration: '' });
      fetchPredictions();
    } catch (error) {
      console.error('Error creating prediction:', error);
      alert('Error creating prediction. Please try again.');
    }
  };

  const isAdmin = connected && account?.address === ADMIN_ADDRESS;

  return (
    <div className="flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold dark:text-white text-blueSecondary mb-4">Prediction Marketplace</h1>
        <p className="text-lg dark:text-gray-200 text-blueSecondary">Create and Participate in Exciting Predictions</p>
      </div>

      {/* <div className="flex justify-center space-x-4 mb-8">
        {!connected ? (
          <button onClick={connect} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Connect Wallet
          </button>
        ) : (
          <>
            <button onClick={disconnect} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Disconnect Wallet
            </button>
            {isAdmin && (
              <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Create New Prediction
              </button>
            )}
          </>
        )}
      </div> */}

      {loading ? (
        <p className="text-center text-gray-600">Loading predictions...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl">
          {predictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              onPredict={handlePredict}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <h3 className="text-xl font-bold mb-4">Create New Prediction</h3>
        <input
          type="text"
          placeholder="Prediction description"
          value={newPrediction.description}
          onChange={(e) => setNewPrediction({ ...newPrediction, description: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="number"
          placeholder="Duration in seconds"
          value={newPrediction.duration}
          onChange={(e) => setNewPrediction({ ...newPrediction, duration: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <button onClick={handleCreatePrediction} className="w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors">
          Create Prediction
        </button>
      </Modal>
    </div>
  );
};

export default GameHub;