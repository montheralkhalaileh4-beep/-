

import React, { useState, useEffect, useRef } from 'react';
import { Verb, AnswerRecord } from '../types';
import { CheckIcon, XIcon, LightbulbIcon, SpeakerWaveIcon } from './IconComponents';

interface QuizCardProps {
  verb: Verb;
  onNext: (isCorrect: boolean, answerRecord: AnswerRecord) => void;
  progressValue: number;
  progressText: string;
  heatLevel: number;
  hints: number;
  onUseHint: () => boolean;
  playSound: (sound: 'click' | 'correct' | 'incorrect') => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ verb, onNext, progressValue, progressText, heatLevel, hints, onUseHint, playSound }) => {
  const [pastSimpleInput, setPastSimpleInput] = useState('');
  const [pastParticipleInput, setPastParticipleInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const pastSimpleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPastSimpleInput('');
    setPastParticipleInput('');
    setFeedback(null);
    setShowAnswer(false);
    pastSimpleInputRef.current?.focus();
  }, [verb]);
  
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(verb.infinitive);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('عذراً، متصفحك لا يدعم نطق النص.');
    }
  };

  const handleCheck = () => {
    const isPastSimpleCorrect = verb.pastSimple.toLowerCase().split('/').includes(pastSimpleInput.trim().toLowerCase());
    const isPastParticipleCorrect = verb.pastParticiple.toLowerCase().split('/').includes(pastParticipleInput.trim().toLowerCase());
    
    if (isPastSimpleCorrect && isPastParticipleCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        onNext(true, { verb, userPastSimple: pastSimpleInput, userPastParticiple: pastParticipleInput });
      }, 1000);
    } else {
      setFeedback('incorrect');
      // The incorrect attempt is now handled globally in App.tsx
      setTimeout(() => {
         onNext(false, { verb, userPastSimple: pastSimpleInput, userPastParticiple: pastParticipleInput });
      }, 1000);
    }
  };
  
  const handleCheckClick = () => {
    playSound('click');
    handleCheck();
  }
  
  const handleRevealAnswer = () => {
    if (onUseHint()) {
      setShowAnswer(true);
    }
  };
  
  const handleNextAfterReveal = () => {
     playSound('click');
     onNext(false, { verb, userPastSimple: pastSimpleInput, userPastParticiple: pastParticipleInput });
  }

  const getButtonClass = (level: number): string => {
    if (level > 0.7) return 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse';
    if (level > 0.3) return 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/40';
    return 'bg-sky-600 hover:bg-sky-700';
  };
  
  const hintButtonClass = hints > 0 
    ? "bg-amber-500 hover:bg-amber-600 transition-all duration-300 shadow-[0_0_15px_theme(colors.amber.400)]"
    : "bg-gray-400 dark:bg-gray-600 disabled:cursor-not-allowed";

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 transform hover:scale-[1.01] animate-zoom-in">
       <div className="mb-6">
        <div className="flex justify-between items-center mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <span>التقدم</span>
          <span>{progressText}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-sky-400 to-sky-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressValue * 100}%` }}>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg text-gray-500 dark:text-gray-400">صرف الفعل التالي:</p>
        <div className="flex items-center justify-center gap-4">
            <h2 className="text-5xl font-bold text-sky-800 dark:text-sky-300 my-2">{verb.infinitive}</h2>
            <button onClick={handleSpeak} title="نطق الفعل" className="text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 transition-colors">
                <SpeakerWaveIcon className="w-8 h-8"/>
            </button>
        </div>
        <p className="text-2xl text-amber-600 dark:text-amber-400">({verb.arabic})</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="past-simple">
            التصريف الثاني (Past Simple)
          </label>
          <input
            ref={pastSimpleInputRef}
            id="past-simple"
            type="text"
            value={pastSimpleInput}
            onChange={(e) => setPastSimpleInput(e.target.value)}
            disabled={showAnswer || feedback !== null}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 bg-white dark:bg-gray-700 text-black dark:text-white text-xl sm:text-2xl"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="past-participle">
            التصريف الثالث (Past Participle)
          </label>
          <input
            id="past-participle"
            type="text"
            value={pastParticipleInput}
            onChange={(e) => setPastParticipleInput(e.target.value)}
            disabled={showAnswer || feedback !== null}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 bg-white dark:bg-gray-700 text-black dark:text-white text-xl sm:text-2xl"
            dir="ltr"
          />
        </div>
      </div>
      
      {feedback && !showAnswer && (
        <div className={`mt-4 p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
          {feedback === 'correct' ? <CheckIcon className="w-6 h-6"/> : <XIcon className="w-6 h-6"/>}
          <span className="font-semibold">{feedback === 'correct' ? 'إجابة صحيحة! أحسنت!' : 'محاولة خاطئة.'}</span>
        </div>
      )}

      {showAnswer && (
        <div className="mt-4 p-4 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <h4 className="font-bold text-lg mb-2">الإجابة الصحيحة هي:</h4>
          <p className="text-lg"><span className="font-semibold">Past Simple:</span> {verb.pastSimple}</p>
          <p className="text-lg"><span className="font-semibold">Past Participle:</span> {verb.pastParticiple}</p>
        </div>
      )}

      <div className="mt-6">
        {showAnswer ? (
           <button
             onClick={handleNextAfterReveal}
             className="w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors duration-300 text-lg"
           >
             التالي
           </button>
        ) : (
          <div className="flex gap-2">
            <button
                onClick={handleRevealAnswer}
                disabled={hints <= 0 || feedback !== null}
                className={`text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${hintButtonClass}`}
            >
                <LightbulbIcon className="w-5 h-5" />
                <span className="font-mono text-lg">{hints}</span>
            </button>
            <button
                onClick={handleCheckClick}
                disabled={feedback !== null}
                className={`w-full text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:shadow-none disabled:animate-none text-lg ${getButtonClass(heatLevel)}`}
            >
                تحقق من الإجابة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;