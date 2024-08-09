'use client'
import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, InputViewFunctionData, Network, MoveValue } from '@aptos-labs/ts-sdk';
import { IoClose, IoAdd, IoRemove, IoCreate, IoFilter } from 'react-icons/io5';
import PredictionCard from 'components/card/PredictionCard';
import { motion } from 'framer-motion';

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

  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  const ADMIN_ADDRESS = '0x5e4a0b20b0d20f701526a21288ae092f7876bb43698aa794c61110099b48bc5b';

  useEffect(() => {
    if (connected) {
      fetchPredictions();
      fetchUserPredictions();
    } 
    else {
      fetchPredictions();

    }
  }, [connected]);

  const fetchPredictions = async () => {
    try {
      const payload: InputViewFunctionData = {
        function: `${ADMIN_ADDRESS}::hashpredictalpha::get_all_predictions`,
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
        function:  `${ADMIN_ADDRESS}::hashpredictalpha::get_user_predictions`,
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
          function:  `${ADMIN_ADDRESS}::hashpredictalpha::predict`,
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
          function:  `${ADMIN_ADDRESS}::hashpredictalpha::create_prediction`,
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
    <div className="flex flex-col items-center pt-10 px-4 min-h-screen bg-gray-100 dark:bg-navy-900">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <IoFilter size={24} className="text-gray-600 dark:text-gray-300" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-navy-800 text-gray-700 dark:text-white rounded-lg border dark:border-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option className='dark:text-white' value="active">Active</option>
            <option className='dark:text-white' value="inactive">Inactive</option>
            <option className='dark:text-white'  value="all">All</option>
          </select>
        </div>
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)} 
            className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center space-x-2"
          >
            <IoCreate size={20} />
            <span>Create</span>
          </motion.button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full mb-16"
        >
          {filteredPredictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              onPredict={handlePredict}
              userPredictions={userPredictions[prediction.id] || []}
            />
          ))}
        </motion.div>
      )}
    </motion.div>

    <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
      <h3 className="text-2xl font-bold mb-6 text-center">Create New Prediction</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prediction Description
          </label>
          <input
            id="description"
            type="text"
            placeholder="Enter prediction description"
            value={newPrediction.description}
            onChange={(e) => setNewPrediction({ ...newPrediction, description: e.target.value })}
            className="w-full dark:bg-navy-800 p-3 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (in seconds)
          </label>
          <input
            id="duration"
            type="number"
            placeholder="Enter duration"
            value={newPrediction.duration}
            onChange={(e) => setNewPrediction({ ...newPrediction, duration: e.target.value })}
            className="w-full dark:bg-navy-800 p-3 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreatePrediction} 
        className="w-full mt-6 bg-brand-500 text-white rounded-lg px-4 py-3 hover:bg-brand-600 transition-colors font-semibold"
      >
        Create Prediction
      </motion.button>
    </Modal>
  </div>
  );
};

export default GameHub;