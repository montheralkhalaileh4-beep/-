
import React from 'react';
import { Verb, AnswerRecord } from '../types';

interface ResultsProps {
  studentName: string;
  correctAnswers: Verb[];
  incorrectAnswers: AnswerRecord[];
  totalQuestions: number;
  onRestart: () => void;
  testDuration: number | null;
}

const Results: React.FC<ResultsProps> = ({ studentName, correctAnswers, incorrectAnswers, totalQuestions, onRestart, testDuration }) => {
  const score = correctAnswers.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return 'غير محددة';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  return (
    <>
      <div id="results-view" className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-zoom-in">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-sky-800 dark:text-sky-300 mb-2">نتائج الاختبار</h2>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">الطالب: {studentName}</p>
             <p className="text-xl font-bold">
                 مدة الاختبار: <span className="text-gray-700 dark:text-gray-300">{formatDuration(testDuration)}</span>
             </p>
             <p className="text-2xl font-bold mt-2">
               النتيجة: <span className={percentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{score} / {totalQuestions} ({percentage}%)</span>
             </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 p-3 rounded-t-lg flex items-center gap-2">
              ✅ الأفعال الصحيحة <span className="bg-green-200 text-green-800 px-2 rounded-full text-sm dark:bg-green-800 dark:text-green-200">{correctAnswers.length}</span>
            </h3>
            <ul className="border border-green-200 dark:border-green-800 rounded-b-lg p-4 max-h-80 overflow-y-auto">
              {correctAnswers.length > 0 ? (
                correctAnswers.map((verb, index) => (
                  <li key={index} className="p-2 border-b dark:border-gray-700 last:border-b-0">
                    <span className="font-bold text-lg">{verb.infinitive}</span> &rarr; {verb.pastSimple}, {verb.pastParticiple}
                  </li>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 p-2">لا توجد إجابات صحيحة.</p>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 p-3 rounded-t-lg flex items-center gap-2">
              ❌ الأفعال الخاطئة <span className="bg-red-200 text-red-800 px-2 rounded-full text-sm dark:bg-red-800 dark:text-red-200">{incorrectAnswers.length}</span>
            </h3>
            <ul className="border border-red-200 dark:border-red-800 rounded-b-lg p-4 max-h-80 overflow-y-auto">
              {incorrectAnswers.length > 0 ? (
                incorrectAnswers.map((record, index) => (
                  <li key={index} className="p-2 border-b dark:border-gray-700 last:border-b-0">
                    <p className="font-bold text-lg">{record.verb.infinitive}</p>
                    <p className="text-sm">إجابتك: <span className="text-red-600 dark:text-red-400 line-through">{record.userPastSimple || 'فارغ'}, {record.userPastParticiple || 'فارغ'}</span></p>
                    <p className="text-sm">الصحيح: <span className="text-green-600 dark:text-green-400">{record.verb.pastSimple}, {record.verb.pastParticiple}</span></p>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 p-2">لا توجد أخطاء! عمل رائع!</p>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-colors duration-300 text-lg"
          >
            إعادة الاختبار
          </button>
        </div>
      </div>
      
      {/* Hidden Certificate for PDF Export - Redesigned for better spacing */}
      <div id="pdf-certificate" className="absolute top-0 left-0 opacity-0 -z-10 w-[800px] bg-white p-6 text-gray-800" style={{ fontFamily: 'Cairo, sans-serif' }}>
        <div className="border-4 border-sky-700 p-8 relative flex flex-col" style={{ minHeight: '1100px' }}>
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <span className="text-[300px] font-bold text-sky-100/50 select-none -mt-4">م</span>
            </div>
            
            <div className="relative z-10 flex-grow flex flex-col">
                {/* Header */}
                <div className="text-center mb-8">
                    <p className="text-xl font-bold text-gray-600">منصة مسك التعليمية</p>
                    <h1 className="text-5xl font-bold text-sky-800 mt-2">شهادة إنجاز</h1>
                    <p className="text-xl text-gray-500 mt-1">Certificate of Achievement</p>
                </div>

                {/* Recipient */}
                <div className="text-center my-8">
                    <p className="text-xl text-gray-700 mb-2">تُقدم هذه الشهادة بكل فخر إلى</p>
                    <p className="text-4xl font-bold text-amber-600 tracking-wider py-2">{studentName || 'طالب مجتهد'}</p>
                    <div className="w-1/3 h-px bg-amber-300 mx-auto my-3"></div>
                    <p className="text-xl text-gray-700 mt-2">لإتمامه بنجاح اختبار تصريف الأفعال الإنجليزية الشاذة</p>
                </div>
                
                {/* Details Section */}
                <div className="text-center my-8 border-y-2 border-sky-200 py-6">
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="font-bold text-sky-800 text-lg">النتيجة النهائية</p>
                            <p className={`font-bold text-2xl mt-1 ${percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>{score} / {totalQuestions} ({percentage}%)</p>
                        </div>
                        <div>
                            <p className="font-bold text-sky-800 text-lg">مدة الاختبار</p>
                            <p className="font-semibold text-xl mt-1">{formatDuration(testDuration)}</p>
                        </div>
                        <div>
                            <p className="font-bold text-sky-800 text-lg">تاريخ الإتمام</p>
                            <p className="font-semibold text-xl mt-1">{new Date().toLocaleDateString('ar-EG-u-nu-latn')}</p>
                        </div>
                     </div>
                </div>

                {/* Results Breakdown */}
                <div className="flex-grow text-sm mt-4">
                    {incorrectAnswers.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-red-800 mb-3 text-center">مراجعة الأخطاء ({incorrectAnswers.length})</h3>
                            <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                                <ul className="space-y-3">
                                    {incorrectAnswers.map((r, i) => (
                                        <li key={`i-${i}`} className="border-b border-red-100 last:border-b-0 pb-3">
                                            <p className="font-bold text-base text-red-900">{r.verb.infinitive}</p>
                                            <div className="flex justify-between items-center mt-1 text-xs">
                                                <p>إجابتك: <span className="font-mono text-red-700 line-through">{r.userPastSimple || '-'}, {r.userPastParticiple || '-'}</span></p>
                                                <p>الصحيح: <span className="font-mono text-green-700 font-bold">{r.verb.pastSimple}, {r.verb.pastParticiple}</span></p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {correctAnswers.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-green-800 mb-3 text-center">الإجابات الصحيحة ({correctAnswers.length})</h3>
                            <div className="border border-green-200 rounded-lg p-4 bg-green-50/50 max-h-48 overflow-y-auto">
                               <ul className="grid grid-cols-4 gap-x-6 gap-y-2 text-xs">
                                    {correctAnswers.map((v, i) => (
                                        <li key={`c-${i}`} className="truncate font-mono"><span className="font-sans font-bold text-gray-700">{v.infinitive}:</span> {v.pastSimple}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer & Seal */}
                <div className="mt-auto pt-6 flex justify-between items-end">
                    <div className="text-center">
                        <svg className="w-28 h-28" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" fill="#0369a1" stroke="#a3a3a3" strokeWidth="1"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f9ff" strokeWidth="2"/>
                            <text x="50" y="52" dominantBaseline="central" textAnchor="middle" fontFamily="Cairo, sans-serif" fontSize="40" fontWeight="bold" fill="white">م</text>
                            <path id="circlePath" d="M 10, 50 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none"/>
                            <text fill="#f0f9ff" fontSize="9" fontWeight="bold">
                                <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                                    منصة مسك التعليمية ★ إنجاز معتمد ★
                                </textPath>
                            </text>
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-semibold text-sky-900 border-b-2 border-gray-400 pb-1 px-8">الأستاذ منذر الخلايلة</p>
                        <p className="text-sm text-gray-500 mt-1">Monther Al-Khalayleh</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Results;
