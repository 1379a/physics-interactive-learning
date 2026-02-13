'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 动态导入组件以避免SSR问题
const PhysicsConceptNavigator = dynamic(() => import('@/components/PhysicsConceptNavigator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const FormulaSimulator = dynamic(() => import('@/components/FormulaSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const ProjectileMotion = dynamic(() => import('@/components/ProjectileMotion'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const ProblemSolver = dynamic(() => import('@/components/ProblemSolver'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const QuizSection = dynamic(() => import('@/components/QuizSection'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('navigator');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'navigator', label: '概念导航', icon: '📚' },
    { id: 'formula', label: '公式演绎', icon: '🧮' },
    { id: 'simulation', label: '物理模拟', icon: '🎯' },
    { id: 'solver', label: '问题求解', icon: '💡' },
    { id: 'quiz', label: '自测挑战', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* 头部导航 */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚛️</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  物理学交互式学习平台
                </h1>
                <p className="text-xs text-blue-300/80">Physics Interactive Learning Platform</p>
              </div>
            </div>
            <div className="text-sm text-blue-300/80">
              高中 · 大学低年级
            </div>
          </div>
        </div>
      </header>

      {/* 导航标签 */}
      <nav className="bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-blue-300/70 hover:bg-white/5 hover:text-blue-200'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl min-h-[calc(100vh-220px)]">
          {activeTab === 'navigator' && <PhysicsConceptNavigator />}
          {activeTab === 'formula' && <FormulaSimulator />}
          {activeTab === 'simulation' && <ProjectileMotion />}
          {activeTab === 'solver' && <ProblemSolver />}
          {activeTab === 'quiz' && <QuizSection />}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-black/30 border-t border-white/10 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-blue-300/60">
          <p>物理学交互式学习平台 - 让物理概念直观易懂</p>
        </div>
      </footer>
    </div>
  );
}
