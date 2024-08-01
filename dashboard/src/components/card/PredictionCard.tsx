
const PredictionCard = ({ prediction, onPredict, onWithdraw }) => {
    const { yes_votes, no_votes, total_votes } = prediction;
    const yesPercentage = total_votes > 0 ? (yes_votes / total_votes) * 100 : 50;
    const noPercentage = total_votes > 0 ? (no_votes / total_votes) * 100 : 50;
  
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{prediction.description}</h2>
          <p className="text-gray-600 mb-4">Total Votes: {total_votes}</p>
          <div className="flex justify-between mb-2">
            <span className="text-green-600 font-semibold">Yes: {yes_votes}</span>
            <span className="text-red-600 font-semibold">No: {no_votes}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${yesPercentage}%` }}></div>
          </div>
          <div className="flex justify-between space-x-2">
            <button onClick={() => onPredict(true)} className="flex-1 bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors">
              Predict Yes
            </button>
            <button onClick={() => onPredict(false)} className="flex-1 bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-colors">
              Predict No
            </button>
          </div>
          {prediction.state.value === 2 && (
            <button onClick={onWithdraw} className="w-full mt-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors">
              Withdraw
            </button>
          )}
        </div>
      </div>
    );
  };
  
  export default PredictionCard;