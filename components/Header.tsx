import React from 'react';
import { BookIcon, DownloadIcon, LoaderIcon, LightbulbIcon, HeartIcon, MoonIcon, SunIcon } from './IconComponents';
import { QuizState } from '../types';

interface HeaderProps {
  score: number;
  hints: number;
  lives: number;
  quizState: QuizState;
  onExport: () => void;
  isExporting: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ score, hints, lives, quizState, onExport, isExporting, theme, toggleTheme }) => {
  const isButtonDisabled = (quizState !== QuizState.RESULTS && quizState !== QuizState.GAME_OVER) || isExporting;

  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between border-b-2 border-sky-200 dark:border-sky-800 pb-4">
      <div className="flex items-center gap-4">
        <BookIcon className="w-10 h-10 text-sky-600 dark:text-sky-400" />
        <h1 className="text-xl sm:text-3xl font-bold text-sky-800 dark:text-sky-200">
          منصة مسك التعليمية
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
        {quizState === QuizState.QUIZ && (
          <>
             <div className="text-lg sm:text-xl font-bold text-red-800 bg-red-100 border border-red-200 px-3 py-2 rounded-lg flex items-center gap-2 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">
              <HeartIcon className="w-6 h-6 text-red-500" />
              <span className="font-mono">{lives}</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-2 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">
              <LightbulbIcon className="w-5 h-5 text-amber-500" />
              <span className="font-mono">{hints}</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-sky-800 bg-sky-100 border border-sky-200 px-3 py-2 rounded-lg dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800">
              <span>النقاط:</span>
              <span className="inline-block mr-2 font-mono">{score}</span>
            </div>
          </>
        )}
        {(quizState === QuizState.RESULTS || quizState === QuizState.GAME_OVER) &&
            <button
            onClick={onExport}
            disabled={isButtonDisabled}
            className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-300 flex items-center justify-center gap-2 text-base sm:text-lg disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            title={isButtonDisabled ? 'لا يمكن التصدير الآن' : 'تصدير النتيجة كملف PDF'}
            >
            {isExporting ? (
                <LoaderIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
                <DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
            <span className="hidden sm:inline">
                {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </span>
            </button>
        }
      </div>
    </header>
  );
};

export default Header;