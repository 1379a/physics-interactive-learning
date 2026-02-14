'use client';

import { useEffect, useState } from 'react';
import { quizQuestions } from '@/components/QuizSection';

export default function PrintPage() {
  const [printDate, setPrintDate] = useState<string>('');

  useEffect(() => {
    setPrintDate(new Date().toLocaleDateString('zh-CN'));
    // 自动打印
    window.print();
  }, []);

  // 获取难度标签和颜色
  const getDifficultyInfo = (difficulty: string) => {
    const info = {
      easy: { label: '简单', color: 'bg-green-100 text-green-800 border-green-300' },
      medium: { label: '中等', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      hard: { label: '困难', color: 'bg-red-100 text-red-800 border-red-300' }
    };
    return info[difficulty as keyof typeof info] || { label: difficulty, color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">高中物理真题题库</h1>
          <p className="text-gray-600">
            共 {quizQuestions.length} 道题目 · 打印时间：{printDate || '加载中...'}
          </p>
        </div>

        {/* 题目列表 */}
        <div className="space-y-6">
          {quizQuestions.map((question, index) => {
            const difficultyInfo = getDifficultyInfo(question.difficulty);
            
            return (
              <div 
                key={question.id} 
                className="break-inside-avoid border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                {/* 题目头部 */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 text-lg font-bold text-gray-900">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 leading-relaxed">
                      {question.question}
                    </h3>
                  </div>
                </div>

                {/* 题目信息标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${difficultyInfo.color}`}>
                    {difficultyInfo.label}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded border bg-blue-100 text-blue-800 border-blue-300">
                    {question.category}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded border bg-purple-100 text-purple-800 border-purple-300">
                    {question.source}
                  </span>
                </div>

                {/* 选项 */}
                <div className="ml-8 mb-4 space-y-2">
                  {question.options.map((option, optIndex) => {
                    const optionLetter = ['A', 'B', 'C', 'D', 'E', 'F'][optIndex];
                    const isCorrect = optIndex === question.correctAnswer;
                    
                    return (
                      <div 
                        key={optIndex} 
                        className={`flex items-start gap-2 p-2 rounded border ${isCorrect ? 'bg-green-50 border-green-300' : 'border-gray-200'}`}
                      >
                        <span className={`flex-shrink-0 text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                          {optionLetter}.
                        </span>
                        <span className="text-sm text-gray-800 flex-1">
                          {option}
                        </span>
                        {isCorrect && (
                          <span className="text-green-600 font-bold text-sm">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 答案与解析 */}
                <div className="mt-4 p-4 bg-gray-50 border-l-4 border-blue-500 rounded-r">
                  <div className="mb-3">
                    <span className="text-sm font-bold text-gray-900">
                      正确答案：
                    </span>
                    <span className="ml-2 text-sm font-semibold text-green-700">
                      {['A', 'B', 'C', 'D', 'E', 'F'][question.correctAnswer]}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      解析：
                    </h4>
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {question.explanation}
                    </div>
                  </div>
                  
                  {question.relatedConcepts && question.relatedConcepts.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">
                        相关知识点：
                      </span>
                      <div className="mt-1 inline-flex flex-wrap gap-1">
                        {question.relatedConcepts.map((concept, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 页脚 */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
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
