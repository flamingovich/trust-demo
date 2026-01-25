
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Delete, X } from 'lucide-react';

interface Props {
  onUnlock: () => void;
  theme: 'light' | 'dark';
  language: 'ru' | 'en';
}

const LockScreen: React.FC<Props> = ({ onUnlock, theme, language }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const correctPin = "232323";

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, onUnlock]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  return (
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-between py-20 px-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0b] text-white' : 'bg-white text-black'}`}>
      <div className="flex flex-col items-center animate-fade-in">
        <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-600/30 mb-8">
          <ShieldCheck size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight mb-2">
          {language === 'ru' ? 'Введите пароль' : 'Enter Password'}
        </h2>
        <p className="text-zinc-500 text-sm font-bold opacity-60">
          {language === 'ru' ? 'Введите ваш секретный код' : 'Enter your secret code'}
        </p>
      </div>

      <div className={`flex space-x-4 my-10 ${error ? 'animate-bounce text-red-500' : ''}`}>
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
              i < pin.length 
              ? (error ? 'bg-red-500 border-red-500' : 'bg-blue-600 border-blue-600 scale-125 shadow-md shadow-blue-600/20') 
              : 'border-zinc-200 dark:border-zinc-800'
            }`} 
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-y-6 gap-x-12 w-full max-w-[320px] animate-ios-bottom-up">
        {keys.map((key, i) => (
          <div key={i} className="flex items-center justify-center">
            {key === 'delete' ? (
              <button 
                onClick={handleDelete}
                className="w-16 h-16 flex items-center justify-center text-zinc-400 active:text-blue-600 transition-colors"
              >
                <Delete size={28} />
              </button>
            ) : key === '' ? (
              <div className="w-16 h-16" />
            ) : (
              <button 
                onClick={() => handleKeyPress(key)}
                className="w-16 h-16 rounded-full text-2xl font-bold flex items-center justify-center active:bg-zinc-100 dark:active:bg-zinc-900 transition-all btn-press"
              >
                {key}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button className="text-blue-600 font-bold text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
          {language === 'ru' ? 'Забыли пароль?' : 'Forgot Password?'}
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
