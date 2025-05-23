import { useState } from 'react';
import StockPriceChart from './components/StockPriceChart';
import StockDataTable from './components/StockDataTable';
import StockSummary from './components/StockSummary';
import TechnicalAnalysisGuide from './components/TechnicalAnalysisGuide';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Uber Stock Data Visualization</h1>
            <div className="text-sm text-gray-500">Data from May 2019 to Feb 2025</div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'data' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Data Table
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'guide' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Technical Analysis Guide
            </button>
          </nav>
        </div>
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <StockSummary />
              <StockPriceChart />
            </div>
          </div>
        )}
        
        {activeTab === 'data' && (
          <div className="space-y-6">
            <StockDataTable />
          </div>
        )}
        
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <TechnicalAnalysisGuide />
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Uber Stock Data Visualization • Created {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
