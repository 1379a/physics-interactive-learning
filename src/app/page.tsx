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

const ProjectileSimulator = dynamic(() => import('@/components/ProjectileSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const NBodySimulator = dynamic(() => import('@/components/NBodySimulator'), {
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

interface Theme {
  name: string;
  id: string;
  gradient: string;
  accentColor: string;
  textColor: string;
}

const themes: Theme[] = [
  {
    name: '深蓝科技',
    id: 'blue',
    gradient: 'from-slate-900 via-blue-900 to-slate-900',
    accentColor: 'blue',
    textColor: 'blue'
  },
  {
    name: '翠绿自然',
    id: 'green',
    gradient: 'from-slate-900 via-emerald-900 to-slate-900',
    accentColor: 'emerald',
    textColor: 'emerald'
  },
  {
    name: '淡粉浪漫',
    id: 'pink',
    gradient: 'from-slate-900 via-pink-900 to-slate-900',
    accentColor: 'pink',
    textColor: 'pink'
  },
  {
    name: '黑白简约',
    id: 'monochrome',
    gradient: 'from-gray-900 via-gray-800 to-gray-900',
    accentColor: 'gray',
    textColor: 'gray'
  },
  {
    name: '紫罗兰梦幻',
    id: 'purple',
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
    accentColor: 'purple',
    textColor: 'purple'
  },
  {
    name: '日落橙红',
    id: 'orange',
    gradient: 'from-slate-900 via-orange-900 to-slate-900',
    accentColor: 'orange',
    textColor: 'orange'
  }
];

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('navigator');
  const [simulationSubTab, setSimulationSubTab] = useState<'projectile' | 'nbody'>('projectile');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [useGradient, setUseGradient] = useState(true);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [customColor, setCustomColor] = useState('#3B82F6');

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

  // 应用自定义颜色
  const applyCustomTheme = (color: string) => {
    setCustomColor(color);
    setCurrentTheme({
      name: '自定义',
      id: 'custom',
      gradient: `from-slate-900 to-slate-900`,
      accentColor: 'custom',
      textColor: 'custom'
    });
  };

  return (
    <div 
      className={`min-h-screen text-white ${useGradient ? `bg-gradient-to-br ${currentTheme.gradient}` : 'bg-slate-900'}`}
      style={{
        '--custom-color': customColor,
        background: useGradient ? '' : customColor ? `linear-gradient(135deg, #1a1a2e 0%, ${customColor}33 50%, #1a1a2e 100%)` : ''
      } as React.CSSProperties}
    >
      {/* 头部导航 */}
      <header className={`bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚛️</div>
              <div>
                <h1 
                  className="text-xl font-bold bg-clip-text text-transparent"
                  style={{
                    background: `linear-gradient(to right, ${currentTheme.accentColor === 'custom' ? customColor : `var(--tw-gradient-from-${currentTheme.accentColor})`}, ${currentTheme.accentColor === 'custom' ? customColor : `var(--tw-gradient-to-${currentTheme.accentColor})`})`
                  }}
                >
                  物理学交互式学习平台
                </h1>
                <p className="text-xs text-white/60">Physics Interactive Learning Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 联系方式 */}
              <div className="text-sm text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <span className="text-lg">📧</span>
                <span className="font-mono">3482948306.com</span>
              </div>

              {/* 目标用户标签 */}
              <div className="text-sm text-white/80">高中 · 大学低年级</div>

              {/* 换肤按钮 */}
              <button
                onClick={() => setShowThemePanel(!showThemePanel)}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <span>🎨</span>
                <span className="text-sm">换肤</span>
              </button>
            </div>
          </div>

          {/* 换肤面板 */}
          {showThemePanel && (
            <div className="mt-4 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">主题设置</h3>
                <button
                  onClick={() => setShowThemePanel(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* 预设主题 */}
                <div>
                  <div className="text-xs text-white/60 mb-2">预设主题</div>
                  <div className="flex gap-2 flex-wrap">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setCurrentTheme(theme)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          currentTheme.id === theme.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/80'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 渐变开关 */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">渐变背景</div>
                  <button
                    onClick={() => setUseGradient(!useGradient)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      useGradient ? 'bg-blue-600' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-all ${
                        useGradient ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 自定义颜色 */}
                <div>
                  <div className="text-xs text-white/60 mb-2">自定义颜色</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => applyCustomTheme(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs text-white/60">{customColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap relative overflow-hidden ${
                  activeTab === tab.id
                    ? `bg-${currentTheme.accentColor === 'custom' ? 'blue' : currentTheme.accentColor}-600 text-white shadow-lg`
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
                
                {/* 毛玻璃循环动画效果 */}
                <div className={`absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:animate-pulse ${
                  activeTab === tab.id ? 'animate-pulse opacity-20' : ''
                }`} style={{
                  animation: activeTab === tab.id ? 'pulse-glass 2s infinite' : ''
                }} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        <div className={`bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl min-h-[calc(100vh-220px)] hover:border-white/20 transition-all duration-500 relative overflow-hidden`}>
          {/* 毛玻璃循环动画效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none animate-pulse" />
          
          <div className="relative z-10">
            {activeTab === 'navigator' && <PhysicsConceptNavigator />}
            {activeTab === 'formula' && <FormulaSimulator />}
            {activeTab === 'simulation' && (
              <div>
                {/* 物理模拟子标签 */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSimulationSubTab('projectile')}
                    className={`px-4 py-2 rounded-lg transition-all ${simulationSubTab === 'projectile' ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    🎯 抛体运动
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('nbody')}
                    className={`px-4 py-2 rounded-lg transition-all ${simulationSubTab === 'nbody' ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    🌌 多体运动
                  </button>
                </div>
                {simulationSubTab === 'projectile' && <ProjectileSimulator />}
                {simulationSubTab === 'nbody' && <NBodySimulator />}
              </div>
            )}
            {activeTab === 'solver' && <ProblemSolver />}
            {activeTab === 'quiz' && <QuizSection />}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-black/30 border-t border-white/10 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-white/60">
          <p>物理学交互式学习平台 - 让物理概念直观易懂</p>
        </div>
      </footer>

      {/* 自定义样式 */}
      <style jsx global>{`
        @keyframes pulse-glass {
          0%, 100% {
            opacity: 0.1;
            backdrop-filter: blur(2px);
          }
          50% {
            opacity: 0.3;
            backdrop-filter: blur(4px);
          }
        }
      `}</style>
    </div>
  );
}
