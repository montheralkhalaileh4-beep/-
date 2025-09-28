
declare const confetti: any;
declare global {
    var html2canvas: any;
    var jspdf: any;
}


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { QuizState, Verb, AnswerRecord } from './types';
import { VERBS } from './constants';
import QuizCard from './components/QuizCard';
import Results from './components/Results';
import Header from './components/Header';
import { DownloadIcon, LoaderIcon } from './components/IconComponents';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const QUESTIONS_PER_LEVEL = Math.ceil(VERBS.length / 10);
const TOTAL_LIVES = 6;

// Data structure for off-screen PDF rendering
interface PdfRenderData {
    studentName: string;
    correctAnswers: Verb[];
    incorrectAnswers: AnswerRecord[];
    totalQuestions: number;
    testDuration: number | null;
}

const App: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(QuizState.IDLE);
  const [studentName, setStudentName] = useState('');
  const [currentVerbIndex, setCurrentVerbIndex] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<Verb[]>([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState<AnswerRecord[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [testDuration, setTestDuration] = useState<number | null>(null);
  const [hints, setHints] = useState(3);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showLevelStart, setShowLevelStart] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [pdfRenderData, setPdfRenderData] = useState<PdfRenderData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.theme) {
        return localStorage.theme === 'dark' ? 'dark' : 'light';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const shuffledVerbs = useMemo(() => shuffleArray(VERBS), []);

  const sounds = useMemo(() => ({
    correct: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_2b28b5c926.mp3'),
    incorrect: new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c633a6475f.mp3'),
    click: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_5174090fa9.mp3'),
  }), []);

  const playSound = useCallback((sound: keyof typeof sounds) => {
    sounds[sound].currentTime = 0;
    sounds[sound].play().catch(e => console.error("Error playing sound:", e));
  }, [sounds]);

  const handleStartQuiz = (name: string) => {
    playSound('click');
    setStudentName(name);
    setCurrentVerbIndex(0);
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setTestDuration(null);
    setStartTime(Date.now());
    setHints(3);
    setConsecutiveCorrect(0);
    setCurrentLevel(1);
    setShowLevelStart(false);
    setLives(TOTAL_LIVES);
    setQuizState(QuizState.QUIZ);
  };
  
  const handleUseHint = useCallback(() => {
    if (hints > 0) {
      playSound('click');
      setHints(prev => prev - 1);
      return true;
    }
    return false;
  }, [hints, playSound]);

  const handleNextVerb = useCallback((isCorrect: boolean, answerRecord: AnswerRecord) => {
    if (isCorrect) {
      setCorrectAnswers(prev => [...prev, answerRecord.verb]);
      setConsecutiveCorrect(prev => prev + 1);
      playSound('correct');
    } else {
      setIncorrectAnswers(prev => [...prev, answerRecord]);
      setConsecutiveCorrect(0);
      playSound('incorrect');
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        if (startTime) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          setTestDuration(duration);
        }
        setQuizState(QuizState.GAME_OVER);
        return;
      }
    }

    const nextIndex = currentVerbIndex + 1;

    if (nextIndex < shuffledVerbs.length) {
      setCurrentVerbIndex(nextIndex);
      if (nextIndex > 0 && nextIndex % QUESTIONS_PER_LEVEL === 0 && nextIndex < shuffledVerbs.length) {
        setCurrentLevel(prev => prev + 1);
        setShowLevelStart(true);
      }
    } else {
       if (startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        setTestDuration(duration);
      }
      setQuizState(QuizState.RESULTS);
    }
  }, [currentVerbIndex, shuffledVerbs.length, startTime, playSound, lives]);
  
  const generatePdf = async (element: HTMLElement | null) => {
    if (!element) {
        console.error("PDF generation failed: Element not found.");
        alert("حدث خطأ أثناء تجهيز الشهادة. لم يتم العثور على العنصر المطلوب.");
        return;
    }

    setIsExporting(true);
    try {
      const { jsPDF } = window.jspdf;
      const canvas = await window.html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasHeight = canvas.height;
      const canvasWidth = canvas.width;
      const ratio = canvasWidth / canvasHeight;
      const pdfHeight = pdfWidth / ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`quiz-results-${studentName.replace(/\s+/g, '-') || 'student'}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("حدث خطأ أثناء تصدير ملف PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = () => {
    playSound('click');
    if (quizState === QuizState.RESULTS) {
      // If results are already visible, generate PDF directly
      generatePdf(document.getElementById('pdf-certificate'));
    } else if (quizState === QuizState.GAME_OVER) {
      // If game is over, we need to render the results component invisibly first
      setPdfRenderData({
        studentName,
        correctAnswers,
        incorrectAnswers,
        totalQuestions: shuffledVerbs.length,
        testDuration,
      });
    }
  };

  useEffect(() => {
    // This effect runs when pdfRenderData is set, meaning we need to generate a PDF
    if (pdfRenderData) {
      // The invisible component is now in the DOM, so we can generate the PDF
      const certificateElement = document.getElementById('pdf-certificate');
      generatePdf(certificateElement).finally(() => {
        // Clean up by removing the render data, which unmounts the invisible component
        setPdfRenderData(null);
      });
    }
  }, [pdfRenderData]);


  const score = correctAnswers.length;
  const totalQuestions = shuffledVerbs.length;
  const heatLevel = totalQuestions > 0 ? score / totalQuestions : 0;

  const getBackgroundColor = (level: number, currentTheme: 'light' | 'dark') => {
    const hue = 200 - (200 * level);
    const saturation = 70 + (20 * level);
    if (currentTheme === 'dark') {
      const lightness = 20 - (15 * level);
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    const lightness = 95 - (15 * level);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const backgroundStyle = {
    backgroundColor: getBackgroundColor(heatLevel, theme),
    transition: 'background-color 1s ease',
  };

  useEffect(() => {
    if (quizState === QuizState.RESULTS) {
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      if (percentage >= 80) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      }
    }
  }, [quizState, score, totalQuestions]);
  
  useEffect(() => {
      if(consecutiveCorrect > 0 && consecutiveCorrect % 5 === 0){
          setHints(prev => prev + 1);
      }
  }, [consecutiveCorrect]);

  const LevelStartScreen = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
        <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-zoom-in">
            <h2 className="text-5xl font-bold text-sky-600 dark:text-sky-400 mb-4">
                المستوى {currentLevel}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                أحسنت! لقد وصلت إلى مستوى جديد. استمر في التقدم!
            </p>
            <button
                onClick={() => {
                    playSound('click');
                    setShowLevelStart(false);
                }}
                className="bg-sky-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-sky-700 transition-colors duration-300 shadow-lg text-xl"
            >
                أكمل
            </button>
        </div>
    </div>
  );
  
  const GameOverScreen = () => (
    <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 animate-zoom-in">
        <h2 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
            انتهت المحاولات!
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            لا تستسلم! كل خطأ هو فرصة للتعلم. يمكنك المحاولة مجدداً أو تصدير نتيجتك الحالية.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={() => { playSound('click'); setQuizState(QuizState.IDLE); }}
                className="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-colors duration-300 text-lg shadow-md"
            >
                إعادة المحاولة
            </button>
            {/* The export button is now globally available in the header */}
        </div>
    </div>
  );

  const renderContent = () => {
    if (showLevelStart) return <LevelStartScreen />;

    switch (quizState) {
      case QuizState.QUIZ:
        return (
          <QuizCard
            verb={shuffledVerbs[currentVerbIndex]}
            onNext={handleNextVerb}
            progressValue={(currentVerbIndex + 1) / totalQuestions}
            progressText={`${currentVerbIndex + 1} / ${shuffledVerbs.length}`}
            heatLevel={heatLevel}
            hints={hints}
            onUseHint={handleUseHint}
            playSound={playSound}
          />
        );
      case QuizState.RESULTS:
        return (
          <Results
            studentName={studentName}
            correctAnswers={correctAnswers}
            incorrectAnswers={incorrectAnswers}
            totalQuestions={shuffledVerbs.length}
            onRestart={() => { playSound('click'); setQuizState(QuizState.IDLE); }}
            testDuration={testDuration}
          />
        );
      case QuizState.GAME_OVER:
        return <GameOverScreen />;
      case QuizState.IDLE:
      default:
        const StartScreen = () => {
            const [name, setName] = useState('');
            return (
                <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-zoom-in">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        منصة مسك التعليمية
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        مرحباً بك! أدخل اسمك لبدء رحلتك في إتقان تصريف الأفعال.
                        لديك {TOTAL_LIVES} محاولات خاطئة فقط. حظاً موفقاً!
                    </p>
                    <div className="max-w-sm mx-auto">
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="اكتب اسمك هنا"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 bg-white dark:bg-gray-700 text-black dark:text-white text-xl mb-6 text-center"
                        />
                        <button
                          onClick={() => handleStartQuiz(name || 'طالب')}
                          disabled={!name.trim()}
                          className="w-full bg-sky-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-colors duration-300 shadow-lg text-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          ابدأ الاختبار
                        </button>
                    </div>
                </div>
            )
        }
        return <StartScreen />;
    }
  };

  return (
    <div style={backgroundStyle} className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6">
      <Header 
        score={score}
        hints={hints}
        lives={lives}
        quizState={quizState}
        onExport={handleExportPdf}
        isExporting={isExporting}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="w-full max-w-4xl mx-auto mt-8 flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
      
      {/* Hidden renderer for PDF generation on game over screen */}
      {pdfRenderData && (
          <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
              <Results
                  studentName={pdfRenderData.studentName}
                  correctAnswers={pdfRenderData.correctAnswers}
                  incorrectAnswers={pdfRenderData.incorrectAnswers}
                  totalQuestions={pdfRenderData.totalQuestions}
                  onRestart={() => {}}
                  testDuration={pdfRenderData.testDuration}
              />
          </div>
      )}
    </div>
  );
};

export default App;