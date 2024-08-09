import React, { useState, useEffect } from 'react';
import { IoAdd, IoRemove, IoTimeOutline, IoWalletOutline, IoBarChartOutline, IoTrendingUpOutline, IoTrendingDownOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const PredictionCard = ({ prediction, onPredict, userPredictions }) => {
  const [shareAmount, setShareAmount] = useState(1);
  const [isYesSelected, setIsYesSelected] = useState(true);
  const [potentialPayout, setPotentialPayout] = useState(0);

  const handleIncrement = () => setShareAmount(prev => prev + 1);
  const handleDecrement = () => setShareAmount(prev => Math.max(1, prev - 1));

  const handlePredict = () => {
    onPredict(prediction.id, isYesSelected, shareAmount);
  };

  const formatTime = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const calculatePercentage = (votes, total) => {
    return total > 0 ? (votes / total) * 100 : 50;
  };

  const yesPercentage = calculatePercentage(prediction.yes_votes, prediction.total_votes);
  const noPercentage = calculatePercentage(prediction.no_votes, prediction.total_votes);

  const isActive = prediction.state.value === 0;
  const totalApt = prediction.total_bet / 100000000;

  useEffect(() => {
    const calculatePotentialPayout = () => {
      const totalShares = parseInt(prediction.yes_votes) + parseInt(prediction.no_votes);
      const opposingShares = isYesSelected ? parseInt(prediction.no_votes) : parseInt(prediction.yes_votes);
      const winningPool = totalApt * (opposingShares / totalShares);
      const payout = (winningPool / shareAmount) + shareAmount;
      
      setPotentialPayout(Number.parseFloat(payout.toFixed(2)));
    };

    calculatePotentialPayout();
  }, [isYesSelected, shareAmount, prediction, totalApt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white to-gray-100 dark:from-navy-800 dark:to-navy-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-navy-700"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">{prediction.description}</h2>
          {/* <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-200 text-xs font-semibold rounded-full">
            ID: {prediction.id}
          </span> */}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
            <IoTimeOutline className="mr-2 text-brand-500 dark:text-brand-400" />
            <span>Ends: {formatTime(prediction.end_time)}</span>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
            <IoWalletOutline className="mr-2 text-brand-500 dark:text-brand-400" />
            <span>Total: {totalApt.toFixed(2)} APT</span>
          </div>
        </div>
        
        <div className="relative mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-green-500 dark:text-green-400 font-semibold flex items-center">
              <IoTrendingUpOutline className="mr-1" />
              Yes: {yesPercentage.toFixed(1)}%
            </span>
            <span className="text-red-500 dark:text-red-400 font-semibold flex items-center">
              No: {noPercentage.toFixed(1)}%
              <IoTrendingDownOutline className="ml-1" />
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-4 mb-4 overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-brand-500 dark:from-green-500 dark:to-brand-400"
              initial={{ width: 0 }}
              animate={{ width: `${yesPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="absolute top-full left-0 w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{prediction.yes_votes} votes</span>
            <span>{prediction.no_votes} votes</span>
          </div>
        </div>
        
        {isActive && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-50 dark:bg-navy-800 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between mb-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsYesSelected(true)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
                    isYesSelected 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Yes
                </motion.button>
                <div className="w-4"></div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsYesSelected(false)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
                    !isYesSelected 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  No
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDecrement}
                  className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-2 transition-colors duration-200 shadow-md"
                >
                  <IoRemove size={20} />
                </motion.button>
                <input 
                  type="number" 
                  value={shareAmount}
                  onChange={(e) => setShareAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border dark:border-navy-600 rounded-lg py-2 bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 shadow-inner"
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleIncrement}
                  className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-2 transition-colors duration-200 shadow-md"
                >
                  <IoAdd size={20} />
                </motion.button>
              </div>
              
              <div className="mb-4 text-center bg-brand-50 dark:bg-brand-900/30 rounded-lg py-2 px-4">
                <span className="text-sm font-medium text-brand-600 dark:text-brand-300">
                  Potential Payout: {potentialPayout} APT
                </span>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePredict}
                className="w-full bg-gradient-to-r from-brand-400 to-brand-500 dark:from-brand-500 dark:to-brand-400 text-white rounded-lg py-3 px-4 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Place Prediction
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
        
        {userPredictions && userPredictions.length > 0 && (
          <div className="mt-6 bg-gray-100 dark:bg-navy-900 rounded-lg p-4 shadow-inner">
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3 flex items-center">
              <IoBarChartOutline className="mr-2 text-brand-500 dark:text-brand-400" />
              Your Predictions
            </h3>
            {userPredictions.map((prediction, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${prediction.verdict ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {prediction.verdict ? 'Yes' : 'No'} with {prediction.share} shares
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PredictionCard;