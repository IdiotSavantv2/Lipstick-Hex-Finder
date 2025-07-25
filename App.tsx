import React, { useState, useCallback, useRef, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ColorPickerCanvas from './components/ColorPickerCanvas';
import LipstickCard from './components/LipstickCard';
import Loader from './components/Loader';
import LipstickIcon from './components/icons/LipstickIcon';
import { findLipsticksByHex } from './services/geminiService';
import { LipstickProduct } from './types';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [lipstickResults, setLipstickResults] = useState<LipstickProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (src: string) => {
    resetState(true);
    setImageSrc(src);
  };

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
    setLipstickResults([]);
    setError(null);
  };

  const handleFindLipsticks = useCallback(async () => {
    if (!selectedColor || !apiKey) return;
    setIsLoading(true);
    setError(null);
    setLipstickResults([]);
    try {
      const response = await findLipsticksByHex(selectedColor, apiKey);
      setLipstickResults(response.lipsticks);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedColor, apiKey]);

  useEffect(() => {
    if (isLoading || lipstickResults.length > 0 || error) {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLoading, lipstickResults, error]);

  const resetState = (keepKey: boolean = false) => {
    setImageSrc(null);
    setSelectedColor(null);
    setLipstickResults([]);
    setIsLoading(false);
    setError(null);
    if (!keepKey) {
        setApiKey('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-fuchsia-500 to-pink-500 p-3 rounded-full mb-4">
                <LipstickIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-transparent bg-clip-text">Shade</span> Finder
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Find your perfect lipstick shade. Upload an image, pick a color, and let AI do the rest.
            </p>
        </header>

        <section className="mb-8 max-w-lg mx-auto">
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">
                Enter Your Google Gemini API Key
            </label>
            <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition placeholder-gray-500"
                aria-label="Google Gemini API Key"
            />
            <p className="text-xs text-gray-500 mt-1">
                Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-400">Google AI Studio</a>. Your key is not stored.
            </p>
        </section>

        <section className="mb-12">
          {!imageSrc ? (
            <ImageUploader onImageUpload={handleImageUpload} reset={() => resetState()} />
          ) : (
            <div className="flex flex-col items-center space-y-6">
                <ColorPickerCanvas imageSrc={imageSrc} onColorSelect={handleColorSelect} />
                 <button onClick={() => resetState(true)} className="px-6 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                    Upload New Image
                </button>
            </div>
          )}
        </section>

        {selectedColor && (
          <section className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Selected Color</h2>
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl shadow-lg">
                <div className="w-16 h-16 rounded-lg border-2 border-gray-600" style={{ backgroundColor: selectedColor }} />
                <div className="text-left">
                    <p className="font-mono text-lg tracking-wider bg-gray-900 px-3 py-1 rounded">{selectedColor.toUpperCase()}</p>
                </div>
            </div>
            <button
              onClick={handleFindLipsticks}
              disabled={isLoading || !apiKey}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!apiKey ? "Please enter your Gemini API key above" : "Find lipsticks matching this color"}
            >
              {isLoading ? 'Searching...' : 'Find Matching Lipsticks'}
            </button>
          </section>
        )}
        
        <div ref={resultsRef}>
            {isLoading && <Loader />}
            {error && <p className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}
            {lipstickResults.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8">Your Lipstick Matches</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lipstickResults.map((product, index) => (
                            <LipstickCard key={`${product.brand}-${product.shadeName}-${index}`} product={product} color={selectedColor!} />
                        ))}
                    </div>
                </section>
            )}
        </div>
      </main>
      <footer className="text-center py-6 border-t border-gray-800 mt-12">
        <p className="text-gray-500">Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;