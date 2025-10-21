import React, { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import useEmblaCarousel from 'embla-carousel-react';
import './styles.css';

interface Operation {
  id: string;
  name: string;
  symbol: string;
  description: string;
  gradient: string;
  icon: string;
}

const operations: Operation[] = [
  {
    id: 'add',
    name: 'Addition',
    symbol: '+',
    description: 'Add two numbers together',
    gradient: 'from-green-400 to-emerald-600',
    icon: '➕'
  },
  {
    id: 'subtract',
    name: 'Subtraction',
    symbol: '-',
    description: 'Subtract one number from another',
    gradient: 'from-blue-400 to-blue-600',
    icon: '➖'
  },
  {
    id: 'multiply',
    name: 'Multiplication',
    symbol: '×',
    description: 'Multiply two numbers',
    gradient: 'from-purple-400 to-purple-600',
    icon: '✖️'
  },
  {
    id: 'divide',
    name: 'Division',
    symbol: '÷',
    description: 'Divide one number by another',
    gradient: 'from-orange-400 to-orange-600',
    icon: '➗'
  }
];

function OperationCard({ operation, onSelect }: { operation: Operation; onSelect: () => void }) {
  return (
    <div className="embla__slide flex-[0_0_85%] min-w-0 px-2">
      <div className={`bg-gradient-to-br ${operation.gradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full`}>
        <div className="flex flex-col items-center justify-center h-full text-white">
          <div className="text-6xl mb-4">{operation.icon}</div>
          <h3 className="text-2xl font-bold mb-2">{operation.name}</h3>
          <div className="text-5xl font-bold mb-3 opacity-90">{operation.symbol}</div>
          <p className="text-sm text-white/90 mb-6 text-center">{operation.description}</p>
          <button
            onClick={onSelect}
            className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-md"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

function OperationSelector() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false
  });

  const handleSelect = useCallback((operationId: string) => {
    // Notify ChatGPT that an operation was selected
    if (window.openai?.widget) {
      window.openai.widget.setState({ selectedOperation: operationId });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calcufy Calculator</h1>
        <p className="text-gray-600">Choose your calculation operation</p>
      </div>

      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex gap-4">
          {operations.map((operation) => (
            <OperationCard
              key={operation.id}
              operation={operation}
              onSelect={() => handleSelect(operation.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {operations.map((op, index) => (
          <button
            key={op.id}
            onClick={() => emblaApi?.scrollTo(index)}
            className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-500 transition-colors"
            aria-label={`Go to ${op.name}`}
          />
        ))}
      </div>
    </div>
  );
}

// Mount the component
const root = document.getElementById('widget-root');
if (root) {
  createRoot(root).render(<OperationSelector />);
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    openai?: {
      widget?: {
        setState: (state: any) => void;
      };
    };
  }
}
