import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

interface ResultData {
  operation?: string;
  operationSymbol?: string;
  number1?: number;
  number2?: number;
  result?: number;
}

function ResultDisplay() {
  const [data, setData] = useState<ResultData>({});
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Listen for tool response data
    const handleToolResponse = (event: any) => {
      const resultData = event.detail?.structuredContent as ResultData;
      if (resultData) {
        setData(resultData);
        // Trigger animation
        setTimeout(() => setShowAnimation(true), 100);
      }
    };

    window.addEventListener('openai:tool_response', handleToolResponse);
    return () => window.removeEventListener('openai:tool_response', handleToolResponse);
  }, []);

  const getGradient = () => {
    const gradients: Record<string, string> = {
      add: 'from-green-400 to-emerald-600',
      subtract: 'from-blue-400 to-blue-600',
      multiply: 'from-purple-400 to-purple-600',
      divide: 'from-orange-400 to-orange-600'
    };
    return gradients[data.operation || ''] || 'from-gray-400 to-gray-600';
  };

  const getOperationName = () => {
    const names: Record<string, string> = {
      add: 'Addition',
      subtract: 'Subtraction',
      multiply: 'Multiplication',
      divide: 'Division'
    };
    return names[data.operation || ''] || 'Calculation';
  };

  const formatNumber = (num?: number): string => {
    if (num === undefined) return '0';
    // Round to 6 decimal places to avoid floating point issues
    const rounded = Math.round(num * 1000000) / 1000000;
    return rounded.toString();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className={`bg-gradient-to-br ${getGradient()} rounded-3xl p-8 shadow-2xl transform transition-all duration-500 ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="text-white text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 opacity-90">{getOperationName()} Result</h2>
          </div>

          {/* Calculation Display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-center gap-4 text-3xl md:text-4xl font-bold mb-6">
              <span className={`transform transition-all duration-300 ${showAnimation ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                {formatNumber(data.number1)}
              </span>
              <span className={`text-5xl transform transition-all duration-300 delay-100 ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                {data.operationSymbol}
              </span>
              <span className={`transform transition-all duration-300 delay-100 ${showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
                {formatNumber(data.number2)}
              </span>
            </div>

            <div className={`text-6xl font-bold transform transition-all duration-500 delay-200 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              =
            </div>

            <div className={`mt-6 text-5xl md:text-6xl font-bold transform transition-all duration-500 delay-300 ${showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              {formatNumber(data.result)}
            </div>
          </div>

          {/* Success Indicator */}
          <div className={`flex items-center justify-center gap-2 transform transition-all duration-500 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">Calculation Complete</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className={`mt-6 bg-white rounded-xl p-6 shadow-lg transform transition-all duration-500 delay-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Operation Type</p>
            <p className="text-lg font-semibold text-gray-900">{getOperationName()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Result</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.result)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mount the component
const root = document.getElementById('widget-root');
if (root) {
  createRoot(root).render(<ResultDisplay />);
}
