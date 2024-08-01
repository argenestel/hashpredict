import React, { useState } from 'react';
import { IoAdd, IoRemove } from 'react-icons/io5';

const PredictionCard = ({ prediction, onPredict, userPredictions }) => {
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

  const isActive = prediction.state.value === 0;
  const totalApt = prediction.total_bet / 100000000;

  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">{prediction.description}</h2>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">ID: {prediction.id}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">End Time: {formatTime(prediction.end_time)}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total APT: {totalApt.toFixed(2)}</p>
        
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
        
        {userPredictions && userPredictions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-2">Your Predictions</h3>
            {userPredictions.map((prediction, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {prediction.verdict ? 'Yes' : 'No'} with {prediction.share} shares
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;