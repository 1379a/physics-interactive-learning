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

const SpringOscillator = dynamic(() => import('@/components/SpringOscillator'), {
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

// 新增物理模拟组件
const IdealGasSimulator = dynamic(() => import('@/components/IdealGasSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const ChargedParticleSimulator = dynamic(() => import('@/components/ChargedParticleSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const OpticsRefractionSimulator = dynamic(() => import('@/components/OpticsRefractionSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const WaveSimulator = dynamic(() => import('@/components/WaveSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const WaveInterferenceSimulator = dynamic(() => import('@/components/WaveInterferenceSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const DopplerEffectSimulator = dynamic(() => import('@/components/DopplerEffectSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const SoundWaveSimulator = dynamic(() => import('@/components/SoundWaveSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const ResonanceSimulator = dynamic(() => import('@/components/ResonanceSimulator'), {
  ssr: false,
  loading: () => <div className="p-8">加载中...</div>
});

const WaveInterference2DSimulator = dynamic(() => import('@/components/WaveInterference2DSimulator'), {
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
    gradient: 'from-gray-950 via-white/10 to-gray-950',
    accentColor: 'zinc',
    textColor: 'zinc'
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
  const [simulationSubTab, setSimulationSubTab] = useState<
    'projectile' | 'nbody' | 'spring' | 'gas' | 'charged' | 'optics' | 'wave' | 'interference' | 'doppler' | 'soundwave' | 'resonance' | 'interference2d'
  >('projectile');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [useGradient, setUseGradient] = useState(true);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [customColor, setCustomColor] = useState('#3B82F6');

  // 获取主题渐变色
  const getThemeGradient = () => {
    if (currentTheme.id === 'custom') {
      return `linear-gradient(to right, ${customColor}, ${customColor}CC)`;
    }
    const gradientColors: Record<string, string> = {
      'blue': 'linear-gradient(to right, #3b82f6, #1d4ed8)',
      'green': 'linear-gradient(to right, #10b981, #059669)',
      'emerald': 'linear-gradient(to right, #10b981, #059669)',
      'pink': 'linear-gradient(to right, #ec4899, #db2777)',
      'monochrome': 'linear-gradient(to right, #a1a1aa, #71717a)',
      'zinc': 'linear-gradient(to right, #a1a1aa, #71717a)',
      'purple': 'linear-gradient(to right, #a855f7, #9333ea)',
      'orange': 'linear-gradient(to right, #f97316, #ea580c)'
    };
    return gradientColors[currentTheme.accentColor] || gradientColors['blue'];
  };

  // 获取主题主色调（用于按钮等）
  const getThemeColor = () => {
    if (currentTheme.id === 'custom') {
      return customColor;
    }
    const colors: Record<string, string> = {
      'blue': '#3b82f6',
      'green': '#10b981',
      'pink': '#ec4899',
      'monochrome': '#a1a1aa',
      'zinc': '#a1a1aa',
      'purple': '#a855f7',
      'orange': '#f97316',
      'emerald': '#10b981'
    };
    return colors[currentTheme.accentColor] || colors['blue'];
  };

  // 将十六进制颜色转换为 RGB 格式
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // 获取主题颜色的 RGB 值
  const getThemeRgb = () => {
    const color = getThemeColor();
    const rgb = hexToRgb(color);
    return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '59, 130, 246';
  };

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
        '--theme-rgb': getThemeRgb(),
        '--theme-color': getThemeColor(),
        background: useGradient ? '' : customColor ? `linear-gradient(135deg, #1a1a2e 0%, ${customColor}33 50%, #1a1a2e 100%)` : ''
      } as React.CSSProperties}
    >
      {/* 头部导航 */}
      <header className={`bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-float">⚛️</div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    backgroundImage: getThemeGradient(),
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  物理学交互式学习平台
                </h1>
                <p className="text-xs text-white/60">Physics Interactive Learning Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 反馈渠道 */}
              <div className="text-sm text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <span className="text-lg">📧</span>
                <span className="font-mono">反馈渠道: 3482948306@qq.com</span>
              </div>

              {/* 目标用户标签 */}
              <div className="text-sm text-white/80">高中 · 大学低年级</div>

              {/* 换肤按钮 */}
              <button
                onClick={() => setShowThemePanel(!showThemePanel)}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 relative overflow-hidden group"
              >
                <span>🎨</span>
                <span className="text-sm">换肤</span>
                {/* 毛玻璃静态效果 */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
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
                        className={`px-3 py-2 rounded-lg text-sm transition-all relative overflow-hidden group ${
                          currentTheme.id === theme.id
                            ? 'text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/80'
                        }`}
                        style={currentTheme.id === theme.id ? { background: getThemeColor() } : {}}
                      >
                        {theme.name}
                        {/* 毛玻璃静态效果 */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
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
                      useGradient ? 'text-white' : 'bg-white/20'
                    }`}
                    style={useGradient ? { background: getThemeColor() } : {}}
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
      <nav className="bg-black/20 border-b border-white/10 glow-border-bottom">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap relative overflow-hidden ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                style={
                  activeTab === tab.id
                    ? { background: getThemeColor(), transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }
                    : { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }
                }
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>

                {/* 毛玻璃静态效果 */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-20 pointer-events-none" />

                {/* 光效静态效果 */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        <div className={`main-content-card bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl min-h-[calc(100vh-220px)] hover:border-white/20 relative overflow-hidden`}>
          {/* 毛玻璃静态效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />

          <div className="relative z-10">
            {activeTab === 'navigator' && <PhysicsConceptNavigator />}
            {activeTab === 'formula' && <FormulaSimulator currentTheme={currentTheme} customColor={customColor} />}
            {activeTab === 'simulation' && (
              <div>
                {/* 物理模拟子标签 */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <button
                    onClick={() => setSimulationSubTab('projectile')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'projectile'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'projectile' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🎯 抛体运动</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('nbody')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'nbody'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'nbody' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🌌 天体运动</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('spring')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'spring'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'spring' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🔄 弹簧振子</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('gas')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'gas'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'gas' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🌡️ 理想气体</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('charged')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'charged'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'charged' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">⚡ 电磁运动</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('optics')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'optics'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'optics' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">💡 光学折射</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('wave')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'wave'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'wave' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🌊 机械波</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('interference')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'interference'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'interference' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🔮 波的干涉</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('doppler')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'doppler'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'doppler' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">📡 多普勒效应</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('soundwave')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'soundwave'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'soundwave' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🔊 声波传播</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('resonance')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'resonance'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'resonance' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🎸 共振现象</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                  <button
                    onClick={() => setSimulationSubTab('interference2d')}
                    className={`card-tech sim-nav-card px-4 py-2 rounded-xl transition-all relative overflow-hidden group ${
                      simulationSubTab === 'interference2d'
                        ? 'text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={simulationSubTab === 'interference2d' ? { background: getThemeColor() } : {}}
                  >
                    <span className="relative z-10">🌊 波的二维干涉</span>
                    {/* 毛玻璃静态效果 */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-30 pointer-events-none" />
                    {/* 光效静态效果 */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                </div>
                {simulationSubTab === 'projectile' && <ProjectileSimulator />}
                {simulationSubTab === 'nbody' && <NBodySimulator />}
                {simulationSubTab === 'spring' && <SpringOscillator currentTheme={currentTheme} customColor={customColor} />}
                {simulationSubTab === 'gas' && <IdealGasSimulator />}
                {simulationSubTab === 'charged' && <ChargedParticleSimulator />}
                {simulationSubTab === 'optics' && <OpticsRefractionSimulator />}
                {simulationSubTab === 'wave' && <WaveSimulator />}
                {simulationSubTab === 'interference' && <WaveInterferenceSimulator />}
                {simulationSubTab === 'doppler' && <DopplerEffectSimulator />}
                {simulationSubTab === 'soundwave' && <SoundWaveSimulator />}
                {simulationSubTab === 'resonance' && <ResonanceSimulator />}
                {simulationSubTab === 'interference2d' && <WaveInterference2DSimulator />}
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
          <p className="mt-2">反馈渠道: 3482948306@qq.com</p>
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0));
          }
          50% {
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
          }
        }

        @keyframes light-flow {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        @keyframes glow-border {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes card-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(var(--theme-rgb), 0.1), 
                        0 0 40px rgba(var(--theme-rgb), 0.05),
                        inset 0 0 20px rgba(var(--theme-rgb), 0.02);
            border-color: rgba(var(--theme-rgb), 0.15);
          }
          33% {
            box-shadow: 0 0 25px rgba(147, 51, 234, 0.15), 
                        0 0 50px rgba(147, 51, 234, 0.08),
                        inset 0 0 25px rgba(147, 51, 234, 0.03);
            border-color: rgba(147, 51, 234, 0.2);
          }
          66% {
            box-shadow: 0 0 25px rgba(var(--theme-rgb), 0.15), 
                        0 0 50px rgba(var(--theme-rgb), 0.08),
                        inset 0 0 25px rgba(var(--theme-rgb), 0.03);
            border-color: rgba(var(--theme-rgb), 0.25);
          }
        }

        @keyframes card-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes card-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-light-flow {
          animation: light-flow 1.5s ease-in-out infinite;
        }

        .glow-border-bottom {
          position: relative;
        }

        .glow-border-bottom::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation: glow-border 2s ease-in-out infinite;
        }

        .card-tech {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: rgba(var(--theme-rgb), 0.08);
          border: 1px solid rgba(var(--theme-rgb), 0.2);
          box-shadow: 0 4px 12px rgba(var(--theme-rgb), 0.1),
                      0 0 20px rgba(var(--theme-rgb), 0.05);
        }

        .card-tech:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 24px rgba(var(--theme-rgb), 0.3),
                      0 0 40px rgba(var(--theme-rgb), 0.15),
                      inset 0 0 20px rgba(var(--theme-rgb), 0.05);
          border-color: rgba(var(--theme-rgb), 0.4);
          background: rgba(var(--theme-rgb), 0.1);
        }

        .card-tech::before {
          display: none;
        }

        .card-tech:hover::before {
          display: none;
        }

        .card-tech > * {
          position: relative;
          z-index: 1;
        }

        .card-tech.sim-nav-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 18px rgba(var(--theme-rgb), 0.25),
                      0 0 30px rgba(var(--theme-rgb), 0.12),
                      inset 0 0 15px rgba(var(--theme-rgb), 0.04);
          border-color: rgba(var(--theme-rgb), 0.35);
          background: rgba(var(--theme-rgb), 0.08);
        }

        .main-content-card {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      border-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-content-card:hover {
          transform: translateY(-2px) scale(1.002);
          box-shadow: 0 10px 30px rgba(var(--theme-rgb), 0.2),
                      0 0 50px rgba(var(--theme-rgb), 0.1),
                      0 0 20px rgba(var(--theme-rgb), 0.07),
                      inset 0 0 30px rgba(var(--theme-rgb), 0.03);
          border-color: rgba(var(--theme-rgb), 0.3);
          border-width: 2px;
        }
      `}</style>
    </div>
  );
}
