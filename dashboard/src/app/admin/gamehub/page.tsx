'use client'
import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, InputViewFunctionData, Network, MoveValue } from '@aptos-labs/ts-sdk';
import { IoClose, IoAdd, IoRemove } from 'react-icons/io5';
import PredictionCard from 'components/card/PredictionCard';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-navy-900 dark:text-white rounded-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <IoClose size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

interface Prediction {
  id: string;
  description: string;
  state: { value: number };
  end_time: string;
  yes_votes: string;
  no_votes: string;
  yes_price: string;
  no_price: string;
  total_bet: string;
}

interface UserPrediction {
  id: string;
  share: number;
  verdict: boolean;
}

const GameHub = () => {
  const { connect, account, connected, disconnect, signAndSubmitTransaction } = useWallet();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [userPredictions, setUserPredictions] = useState<Record<string, UserPrediction[]>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPrediction, setNewPrediction] = useState({ description: '', duration: '' });
  const [filter, setFilter] = useState('active');

  const config = new AptosConfig({ network: Network.DEVNET });
  const aptos = new Aptos(config);

  const ADMIN_ADDRESS = '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd';

  useEffect(() => {
    if (connected) {
      fetchPredictions();
      fetchUserPredictions();
    }
  }, [connected]);

  const fetchPredictions = async () => {
    try {
      const payload: InputViewFunctionData = {
        function: '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd::hashpredictalpha2::get_all_predictions',
        typeArguments: [],
        functionArguments: []
      };
      
      const result = await aptos.view({ payload });
      const flattenedPredictions = result.flat() as Prediction[];
      setPredictions(flattenedPredictions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      setLoading(false);
    }
  };

  const fetchUserPredictions = async () => {
    if (!connected) return;

    try {
      const payload: InputViewFunctionData = {
        function: '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd::hashpredictalpha2::get_user_predictions',
        typeArguments: [],
        functionArguments: [account.address]
      };
      
      const result = await aptos.view({ payload });
      console.log(result);
      const userPredictionsMap: Record<string, UserPrediction[]> = {};
      (result as MoveValue[]).forEach((prediction: MoveValue) => {
        if (typeof prediction === 'object' && 'id' in prediction) {
          const id = (prediction as { id: string }).id;
          if (!userPredictionsMap[id]) {
            userPredictionsMap[id] = [];
          }
          userPredictionsMap[id].push(prediction as UserPrediction);
        }
      });
      setUserPredictions(userPredictionsMap);
    } catch (error) {
      console.error('Error fetching user predictions:', error);
    }
  };

  const handlePredict = async (predictionId: string, verdict: boolean, share: number) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd::hashpredictalpha2::predict',
          typeArguments: [],
          functionArguments: [predictionId, verdict, share],
        },
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert('Prediction submitted successfully!');
      fetchPredictions();
      fetchUserPredictions();
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
          function: '0xe5daef3712e9be57eee01a28e4b16997e89e0b446546d304d5ec71afc9d1bacd::hashpredictalpha2::create_prediction',
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

  const filteredPredictions = predictions.filter(prediction => {
    if (filter === 'active') {
      return prediction.state.value === 0;
    } else if (filter === 'inactive') {
      return prediction.state.value !== 0;
    }
    return true;
  });

  const isAdmin = connected && account?.address === ADMIN_ADDRESS;

  return (
    <div className="flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold dark:text-white text-blueSecondary mb-4">Prediction Marketplace</h1>
        <p className="text-lg dark:text-gray-200 text-blueSecondary">Create and Participate in Exciting Predictions</p>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-white dark:text-white dark:bg-navy-800 text-gray-700  rounded-lg border dark:border-navy-600"
        >
          <option value="active" className='dark:text-white'>Active</option>
          <option value="inactive" className='dark:text-white'>Inactive</option>
          <option value="all" className='dark:text-white'>All</option>
        </select>
        {isAdmin && (
          <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Create New Prediction
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading predictions...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl">
          {filteredPredictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              onPredict={handlePredict}
              userPredictions={userPredictions[prediction.id] || []}
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
          className="w-full dark:bg-navy-700 p-2 mb-4 border rounded"
        />
        <input
          type="number"
          placeholder="Duration in seconds"
          value={newPrediction.duration}
          onChange={(e) => setNewPrediction({ ...newPrediction, duration: e.target.value })}
          className="w-full dark:bg-navy-700 p-2 mb-4 border rounded"
        />
        <button onClick={handleCreatePrediction} className="w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors">
          Create Prediction
        </button>
      </Modal>
    </div>
  );
};

export default GameHub;