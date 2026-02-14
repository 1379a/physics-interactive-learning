'use client';

import { useState, useEffect } from 'react';
import { quizQuestions, type Question } from './QuizSection';

interface QuizPrintViewProps {
  onClose?: () => void;
}

export default function QuizPrintView({ onClose }: QuizPrintViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('全部');
  const [selectedYear, setSelectedYear] = useState<string>('全部');
  const [showAnswers, setShowAnswers] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);
  const [printDate, setPrintDate] = useState<string>('');

  // 获取所有分类
  const categories = ['全部', ...Array.from(new Set(quizQuestions.map(q => q.category)))];
  
  // 获取所有难度
  const difficulties = ['全部', 'easy', 'medium', 'hard'];
  
  // 获取所有年份
  const years = ['全部', ...Array.from(new Set(quizQuestions.map(q => q.year.toString()))).sort().reverse()];

  // 筛选题目
  const filteredQuestions = quizQuestions.filter(q => {
    const categoryMatch = selectedCategory === '全部' || q.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === '全部' || q.difficulty === selectedDifficulty;
    const yearMatch = selectedYear === '全部' || q.year.toString() === selectedYear;
    return categoryMatch && difficultyMatch && yearMatch;
  });

  // 获取难度标签和颜色
  const getDifficultyInfo = (difficulty: string) => {
    const info = {
      easy: { label: '简单', color: 'bg-green-100 text-green-800 border-green-300' },
      medium: { label: '中等', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      hard: { label: '困难', color: 'bg-red-100 text-red-800 border-red-300' }
    };
    return info[difficulty as keyof typeof info] || { label: difficulty, color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  // 打印处理
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    setIsClient(true);
    setPrintDate(new Date().toLocaleDateString('zh-CN'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* 打印控制面板 - 不打印 */}
      <div className="print:hidden bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">题库打印</h1>
              
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff === '全部' ? '全部难度' : getDifficultyInfo(diff).label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year === '全部' ? '全部年份' : year + '年'}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  className="rounded border-gray-300"
                />
                显示答案与解析
              </label>
              
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                打印
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  关闭
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            共 {filteredQuestions.length} 道题目
          </div>
        </div>
      </div>

      {/* 打印内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:py-0 print:px-0 print:max-w-none">
        {/* 打印标题 */}
        <div className="print:mb-8 mb-6 text-center">
          <h1 className="print:text-3xl print:font-bold print:text-black print:mb-2 text-2xl font-bold text-gray-900 mb-2">
            高中物理真题题库
          </h1>
          <p className="print:text-base print:text-gray-700 text-gray-600">
            筛选条件：{selectedCategory} · {selectedDifficulty === '全部' ? '全部难度' : getDifficultyInfo(selectedDifficulty).label} · {selectedYear === '全部' ? '全部年份' : selectedYear + '年'}
          </p>
          <p className="print:text-sm print:text-gray-600 text-gray-500 mt-1">
            共 {filteredQuestions.length} 道题目 · 打印时间：{printDate || '加载中...'}
          </p>
        </div>

        {/* 题目列表 */}
        <div className="space-y-6">
          {filteredQuestions.map((question, index) => {
            const difficultyInfo = getDifficultyInfo(question.difficulty);
            
            return (
              <div 
                key={question.id} 
                className="print:break-inside-avoid print:mb-8 print:p-0 print:border-none bg-white rounded-lg border border-gray-200 p-6 shadow-sm print:shadow-none"
              >
                {/* 题目头部 */}
                <div className="print:flex print:justify-between print:items-baseline print:mb-3 mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="print:text-base print:font-bold print:text-gray-900 flex-shrink-0 text-lg font-bold text-gray-900">
                      {index + 1}.
                    </span>
                    <div>
                      <h3 className="print:text-base print:font-medium print:text-gray-900 text-lg font-medium text-gray-900 leading-relaxed">
                        {question.question}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* 题目信息标签 */}
                <div className="print:flex print:gap-2 print:mb-3 mb-3 flex flex-wrap gap-2">
                  <span className={`print:px-2 print:py-0.5 print:text-xs print:rounded px-2 py-1 text-xs font-medium rounded border ${difficultyInfo.color}`}>
                    {difficultyInfo.label}
                  </span>
                  <span className="print:px-2 print:py-0.5 print:text-xs print:rounded px-2 py-1 text-xs font-medium rounded border bg-blue-100 text-blue-800 border-blue-300">
                    {question.category}
                  </span>
                  <span className="print:px-2 print:py-0.5 print:text-xs print:rounded px-2 py-1 text-xs font-medium rounded border bg-purple-100 text-purple-800 border-purple-300">
                    {question.source}
                  </span>
                </div>

                {/* 选项 */}
                <div className="print:ml-6 print:mb-4 mb-4 ml-8 space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isCorrect = showAnswers && optIndex === question.correctAnswer;
                    const optionLetter = ['A', 'B', 'C', 'D', 'E', 'F'][optIndex];
                    
                    return (
                      <div 
                        key={optIndex} 
                        className={`print:p-0 print:border-none print:bg-transparent print:text-gray-900 flex items-start gap-2 p-2 rounded border ${isCorrect ? 'bg-green-50 border-green-300' : 'border-gray-200'}`}
                      >
                        <span className={`print:text-sm print:font-normal print:text-gray-900 flex-shrink-0 text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                          {optionLetter}.
                        </span>
                        <span className="print:text-sm print:text-gray-900 text-sm text-gray-800 flex-1">
                          {option}
                        </span>
                        {showAnswers && isCorrect && (
                          <span className="print:hidden text-green-600 font-bold">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 答案与解析 - 仅当显示答案时 */}
                {showAnswers && (
                  <div className="print:mt-4 print:p-4 print:bg-gray-50 print:border-l-4 print:border-blue-500 mt-4 p-4 bg-gray-50 border-l-4 border-blue-500 rounded-r">
                    <div className="mb-3">
                      <span className="print:text-sm print:font-bold print:text-gray-900 text-sm font-bold text-gray-900">
                        正确答案：
                      </span>
                      <span className="print:text-sm print:font-semibold print:text-green-700 ml-2 text-sm font-semibold text-green-700">
                        {['A', 'B', 'C', 'D', 'E', 'F'][question.correctAnswer]}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="print:text-sm print:font-semibold print:text-gray-900 text-sm font-semibold text-gray-900 mb-2">
                        解析：
                      </h4>
                      <div className="print:text-sm print:text-gray-800 print:leading-relaxed text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {question.explanation}
                      </div>
                    </div>
                    
                    {question.relatedConcepts && question.relatedConcepts.length > 0 && (
                      <div>
                        <span className="print:text-xs print:font-medium print:text-gray-700 text-xs font-medium text-gray-600">
                          相关知识点：
                        </span>
                        <div className="print:mt-1 print:inline-block mt-1 inline-flex flex-wrap gap-1">
                          {question.relatedConcepts.map((concept, idx) => (
                            <span 
                              key={idx} 
                              className="print:text-xs print:px-2 print:py-0.5 print:rounded print:bg-gray-200 print:text-gray-700 text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 打印页脚 */}
        <div className="print:mt-8 print:pt-4 print:border-t print:text-center mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500 print:page-break-before">
          <p>高中物理学习平台 · 题库打印版</p>
          <p className="mt-1">打印时间：{printDate || '加载中...'}</p>
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* 避免元素在页面中间断开 */
          tr, td, th, thead, tbody, li, h1, h2, h3, h4, h5, h6 {
            page-break-inside: avoid !important;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
