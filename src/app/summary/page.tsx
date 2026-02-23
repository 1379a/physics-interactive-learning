'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SummaryPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sections = [
    { id: 'overview', title: '项目概览', icon: '📋' },
    { id: 'effects', title: '网页效果优化', icon: '✨' },
    { id: 'beauty', title: '美观度优化', icon: '🎨' },
    { id: 'utility', title: '实用性优化', icon: '🔧' },
    { id: 'accuracy', title: '知识准确性', icon: '📐' },
    { id: 'problems', title: '问题与改进', icon: '💡' },
    { id: 'methodology', title: '方法论总结', icon: '📊' },
    { id: 'future', title: '后续规划', icon: '🚀' },
  ];

  const modules = [
    { icon: '📚', name: '概念导航', desc: '物理学分支知识体系浏览' },
    { icon: '🧮', name: '公式演绎', desc: '公式推导与参数演示' },
    { icon: '🎯', name: '物理模拟', desc: '10+个交互式物理模拟器' },
    { icon: '💡', name: '问题求解', desc: '解题步骤向导与工具' },
    { icon: '📝', name: '自测挑战', desc: '高考真题练习与测试' },
    { icon: '💝', name: '特别鸣谢', desc: '致谢页面' },
  ];

  const simulations = [
    '抛体运动', '多体运动', '弹簧振子', '理想气体', 
    '带电粒子', '光学折射', '波动干涉', '多普勒效应', 
    '声波传播', '共振现象', '二维波干涉'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* 返回首页按钮 */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 transition-all"
        >
          <span>←</span>
          <span>返回首页</span>
        </Link>
      </div>

      {/* 头部 */}
      <header className={`pt-16 pb-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="text-6xl mb-4 animate-bounce">📝</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          优化总结与反思
        </h1>
        <p className="text-blue-300/70">物理学交互式学习平台 · 开发历程记录</p>
        <p className="text-sm text-blue-300/50 mt-2">作者：.天. | 最后更新：2025年2月</p>
      </header>

      {/* 导航标签 */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(index);
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeSection === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-blue-200'
              }`}
            >
              <span className="mr-1">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 pb-16 space-y-8">

        {/* 一、项目概览 */}
        <section id="overview" className={`bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            一、项目概览
          </h2>
          <p className="text-blue-100/80 mb-6">
            本项目是一个面向高中生及大学低年级学生的物理学交互式学习平台，旨在通过可视化、交互式的方式帮助学生直观理解物理概念、掌握核心定律并解决典型问题。
          </p>
          
          <h3 className="text-lg font-semibold text-blue-300 mb-3">核心模块</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.map((mod, i) => (
              <div key={i} className="bg-black/30 rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
                <span className="text-2xl">{mod.icon}</span>
                <div>
                  <div className="font-semibold text-blue-200">{mod.name}</div>
                  <div className="text-sm text-blue-300/60">{mod.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 二、网页效果优化 */}
        <section id="effects" className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">✨</span>
            二、网页效果优化
          </h2>

          <div className="space-y-4">
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-green-300 mb-2">✅ 统一动画系统</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 bg-blue-600/30 rounded">animate-float 浮动动画</span>
                <span className="px-2 py-1 bg-purple-600/30 rounded">animate-pulse-glow 脉冲发光</span>
                <span className="px-2 py-1 bg-pink-600/30 rounded">animate-light-flow 光效流动</span>
                <span className="px-2 py-1 bg-yellow-600/30 rounded">animate-wiggle 摇摆动画</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-green-300 mb-2">✅ 卡片交互效果</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 统一的 card-tech 样式类</li>
                <li>• 悬停时渐变背景、发光阴影、上浮效果</li>
                <li>• 使用 CSS 变量实现主题色适配</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-green-300 mb-2">✅ 响应式设计</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 使用 grid 和 flex 实现自适应布局</li>
                <li>• GPU 加速减少重绘，CSS contain 属性隔离</li>
                <li>• scrollRestoration 解决移动端滚动问题</li>
              </ul>
            </div>

            <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
              <h3 className="font-semibold text-blue-300 mb-2">🔄 改进思路</h3>
              <div className="text-sm text-blue-100/80">
                <p>问题：动画过多可能导致性能问题</p>
                <p className="text-blue-400">↓</p>
                <p>方案：GPU加速 + CSS contain + requestAnimationFrame</p>
                <p className="text-green-400 mt-2">效果：保留动画效果的同时优化性能</p>
              </div>
            </div>
          </div>
        </section>

        {/* 三、美观度优化 */}
        <section id="beauty" className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            三、美观度优化
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-purple-300 mb-2">🌈 主题系统</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 深邃星空、海洋蓝、森林绿、日落橙等主题</li>
                <li>• 支持自定义主题色</li>
                <li>• CSS 变量实现全局切换</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-purple-300 mb-2">🎨 配色方案</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 主色调：蓝色系（科技感）</li>
                <li>• 辅助色：紫色渐变（现代感）</li>
                <li>• 强调色：绿/红/黄（状态提示）</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-purple-300 mb-2">✍️ 字体排版</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 标题：加粗、渐变色</li>
                <li>• 正文：适中行高、良好对比度</li>
                <li>• 公式：KaTeX 渲染，清晰美观</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-purple-300 mb-2">🎭 图标系统</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• Emoji 作为功能图标</li>
                <li>• 统一尺寸和样式</li>
                <li>• 动画图标增强趣味性</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 四、实用性优化 */}
        <section id="utility" className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">🔧</span>
            四、实用性优化
          </h2>

          <h3 className="text-lg font-semibold text-blue-300 mb-3">物理模拟器（10+）</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {simulations.map((sim, i) => (
              <span key={i} className="px-3 py-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full text-sm">
                {sim}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-blue-300 mb-3">自测挑战功能</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">100+</div>
              <div className="text-xs text-blue-300/60">高考真题</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">3</div>
              <div className="text-xs text-blue-300/60">难度等级</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">6</div>
              <div className="text-xs text-blue-300/60">学科分类</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-pink-400">✓</div>
              <div className="text-xs text-blue-300/60">多选题支持</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-blue-300 mb-3">辅助工具</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm">📊 解题步骤向导</span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm">🔄 单位转换器</span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm">📖 常数查询</span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm">🖨️ 打印题库</span>
          </div>
        </section>

        {/* 五、知识准确性 */}
        <section id="accuracy" className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">📐</span>
            五、知识准确性优化
          </h2>

          <div className="space-y-4">
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-cyan-300 mb-2">📐 公式准确性</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 使用 KaTeX 精确渲染公式</li>
                <li>• 标准物理符号和单位</li>
                <li>• 公式推导逻辑正确</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-cyan-300 mb-2">🌍 物理常量</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 bg-cyan-600/30 rounded">G 引力常数</span>
                <span className="px-2 py-1 bg-cyan-600/30 rounded">c 光速</span>
                <span className="px-2 py-1 bg-cyan-600/30 rounded">h 普朗克常量</span>
                <span className="px-2 py-1 bg-cyan-600/30 rounded">e 电子电荷</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-cyan-300 mb-2">🪐 模拟参数</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 太阳系参数基于真实天文数据</li>
                <li>• 开普勒定律计算初始速度</li>
                <li>• 确保轨道稳定性</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-semibold text-cyan-300 mb-2">📚 题库质量</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 2015-2024年高考真题</li>
                <li>• 标注题目来源和年份</li>
                <li>• 详细解析 + 知识点关联</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 六、问题与改进 */}
        <section id="problems" className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">💡</span>
            六、存在问题与改进思路
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-blue-300">问题</th>
                  <th className="text-left p-3 text-blue-300">原因</th>
                  <th className="text-left p-3 text-blue-300">改进方案</th>
                </tr>
              </thead>
              <tbody className="text-blue-100/80">
                <tr className="border-b border-white/5">
                  <td className="p-3">Hydration 不匹配</td>
                  <td className="p-3">服务端/客户端渲染差异</td>
                  <td className="p-3 text-green-300">客户端状态检测</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3">动画性能</td>
                  <td className="p-3">Canvas 重绘开销</td>
                  <td className="p-3 text-green-300">GPU加速 + contain</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3">题库数量有限</td>
                  <td className="p-3">手动录入耗时</td>
                  <td className="p-3 text-green-300">持续扩充</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3">移动端适配</td>
                  <td className="p-3">复杂交互难触控</td>
                  <td className="p-3 text-green-300">简化操作 + 辅助按钮</td>
                </tr>
                <tr>
                  <td className="p-3">用户数据持久化</td>
                  <td className="p-3">无后端</td>
                  <td className="p-3 text-green-300">本地存储或轻量后端</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 七、方法论总结 */}
        <section id="methodology" className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            七、优化方法论总结
          </h2>

          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-xl p-6 mb-6 text-center">
            <div className="text-lg font-semibold mb-2">优化流程</div>
            <div className="flex items-center justify-center flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 bg-blue-600/40 rounded">发现问题</span>
              <span>→</span>
              <span className="px-3 py-1 bg-blue-600/40 rounded">分析原因</span>
              <span>→</span>
              <span className="px-3 py-1 bg-purple-600/40 rounded">制定方案</span>
              <span>→</span>
              <span className="px-3 py-1 bg-purple-600/40 rounded">实施改进</span>
              <span>→</span>
              <span className="px-3 py-1 bg-pink-600/40 rounded">验证效果</span>
              <span>→</span>
              <span className="px-3 py-1 bg-pink-600/40 rounded">迭代优化</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-blue-300 mb-3">优化原则</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-black/30 rounded-lg p-3 flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <span className="text-sm">用户体验优先</span>
            </div>
            <div className="bg-black/30 rounded-lg p-3 flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <span className="text-sm">渐进式改进</span>
            </div>
            <div className="bg-black/30 rounded-lg p-3 flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <span className="text-sm">性能与美观平衡</span>
            </div>
            <div className="bg-black/30 rounded-lg p-3 flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span className="text-sm">知识准确性</span>
            </div>
          </div>
        </section>

        {/* 八、后续规划 */}
        <section id="future" className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            八、后续优化方向
          </h2>

          <div className="space-y-4">
            <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30">
              <h3 className="font-semibold text-green-300 mb-2">🎯 短期目标</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>✓ 扩充题库至更多高考真题</li>
                <li>✓ 优化移动端交互体验</li>
                <li>• 增加更多物理模拟器</li>
                <li>• 完善知识点关联网络</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/30">
              <h3 className="font-semibold text-yellow-300 mb-2">📌 中期目标</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• 用户学习进度追踪</li>
                <li>• 错题本功能</li>
                <li>• 学习报告生成</li>
                <li>• 多端同步</li>
              </ul>
            </div>

            <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
              <h3 className="font-semibold text-purple-300 mb-2">🌟 长期目标</h3>
              <ul className="text-sm text-blue-100/80 space-y-1">
                <li>• AI 辅助答疑</li>
                <li>• 个性化学习路径</li>
                <li>• 社区互动功能</li>
                <li>• 教师管理后台</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <div className="text-center text-blue-300/50 text-sm pt-8">
          <p>感谢一路陪伴的所有朋友们 💕</p>
          <p className="mt-2">
            <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← 返回主页
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
