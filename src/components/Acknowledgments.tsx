'use client';

import { useState, useEffect } from 'react';

// 可爱的贴纸组件
const FloatingSticker = ({ emoji, style, delay = 0 }: { emoji: string; style?: React.CSSProperties; delay?: number }) => (
  <div
    className="absolute text-2xl animate-float pointer-events-none select-none"
    style={{
      ...style,
      animationDelay: `${delay}s`,
      opacity: 0.8,
    }}
  >
    {emoji}
  </div>
);

// 闪烁星星效果
const TwinklingStar = ({ style, delay = 0 }: { style?: React.CSSProperties; delay?: number }) => (
  <div
    className="absolute animate-twinkle pointer-events-none"
    style={{
      ...style,
      animationDelay: `${delay}s`,
    }}
  >
    ✨
  </div>
);

// 心跳动画装饰
const HeartBeat = ({ style, delay = 0 }: { style?: React.CSSProperties; delay?: number }) => (
  <div
    className="absolute animate-heartbeat pointer-events-none"
    style={{
      ...style,
      animationDelay: `${delay}s`,
    }}
  >
    💖
  </div>
);

export default function Acknowledgments() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const contributors = [
    {
      name: 'x λ 7、秋阳',
      role: '早期设计理念与初版模型',
      icon: '🎨',
      description: '在网站早期的设计理念以及初版模型出品上做出了卓越贡献'
    },
    {
      name: '曙光',
      role: '志愿帮助与美化',
      icon: '🌟',
      description: '提供了大量网页内容建议、美化素材，以及帮助捉虫优化'
    },
    {
      name: '屿',
      role: '指导老师',
      icon: '🎓',
      description: '提供了网页制作平台以及手把手的悉心教导'
    },
    {
      name: '无言、纸鸢',
      role: '首批试用员',
      icon: '🚀',
      description: '作为第一批网页试用员提供了宝贵的优化建议'
    }
  ];

  return (
    <div className="p-6 relative overflow-hidden min-h-[600px]">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />
        
        {/* 漂浮贴纸 */}
        <FloatingSticker emoji="🌟" style={{ top: '5%', left: '5%' }} delay={0} />
        <FloatingSticker emoji="💫" style={{ top: '15%', right: '8%' }} delay={0.5} />
        <FloatingSticker emoji="🌈" style={{ top: '40%', left: '3%' }} delay={1} />
        <FloatingSticker emoji="⭐" style={{ top: '60%', right: '5%' }} delay={1.5} />
        <FloatingSticker emoji="🦋" style={{ top: '75%', left: '8%' }} delay={2} />
        <FloatingSticker emoji="🌸" style={{ top: '85%', right: '10%' }} delay={0.8} />
        <FloatingSticker emoji="🍀" style={{ top: '25%', left: '90%' }} delay={1.2} />
        <FloatingSticker emoji="🌺" style={{ top: '90%', left: '50%' }} delay={1.8} />
        
        {/* 闪烁星星 */}
        <TwinklingStar style={{ top: '10%', left: '20%' }} delay={0} />
        <TwinklingStar style={{ top: '30%', right: '15%' }} delay={0.7} />
        <TwinklingStar style={{ top: '50%', left: '10%' }} delay={1.4} />
        <TwinklingStar style={{ top: '70%', right: '20%' }} delay={2.1} />
        <TwinklingStar style={{ top: '20%', right: '30%' }} delay={0.3} />
        <TwinklingStar style={{ top: '80%', left: '25%' }} delay={1.8} />
        
        {/* 心跳装饰 */}
        <HeartBeat style={{ top: '8%', right: '25%' }} delay={0} />
        <HeartBeat style={{ top: '45%', left: '15%' }} delay={1} />
        <HeartBeat style={{ top: '65%', right: '12%' }} delay={2} />
      </div>

      {/* 主标题 */}
      <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="text-5xl mb-4 animate-bounce-slow">💝</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          特别鸣谢
        </h2>
        <p className="text-sm text-blue-300/60 mt-2">感谢每一位支持与帮助过我们的人</p>
      </div>

      {/* 作者介绍 */}
      <div className={`max-w-2xl mx-auto mb-8 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">👋</span>
          <div>
            <h3 className="text-xl font-semibold text-blue-200">来自作者的一封信</h3>
            <p className="text-sm text-blue-300/60">我是.天. | 网站主要负责人</p>
          </div>
        </div>
        <p className="text-blue-100/90 leading-relaxed">
          亲爱的朋友们，欢迎来到这个页面。在这里，我想代表整个团队，向所有在网站制作过程中给予帮助与支持的人们表达最真挚的感谢。正是因为有你们的付出与陪伴，这个物理学习平台才能从构想变为现实。
        </p>
      </div>

      {/* 贡献者卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
        {contributors.map((contributor, index) => (
          <div
            key={index}
            className={`bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${300 + index * 150}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl animate-wiggle">{contributor.icon}</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-200">{contributor.name}</h4>
                <p className="text-sm text-purple-300/80 mb-2">{contributor.role}</p>
                <p className="text-sm text-blue-100/70">{contributor.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 额外感谢 */}
      <div className={`max-w-2xl mx-auto bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm mb-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl animate-pulse">💕</span>
          <h3 className="text-lg font-semibold text-blue-200">特别感谢</h3>
        </div>
        <p className="text-blue-100/90 leading-relaxed">
          同时也要感谢一路以来陪伴了我们整个假期制作的朋友们。大家的辛苦劳累以及真挚的陪伴我们都看在眼里，记在心里。是你们的支持让我们有了坚持下去的动力。
        </p>
      </div>

      {/* 结尾寄语 */}
      <div className={`text-center max-w-2xl mx-auto transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <div className="flex justify-center gap-2 mb-4 text-2xl">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🌱</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🌿</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🌳</span>
          </div>
          <p className="text-blue-100/90 leading-relaxed mb-4">
            最后，我们希望这个网页能够为大家的物理学习之旅提供帮助。如果您在使用过程中有任何反馈或建议，欢迎通过网页上方的QQ邮箱联系我们。您的每一条建议都是我们不断成长、持续优化的动力源泉。
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-300/80">
            <span>💪</span>
            <span className="text-sm">让我们一起，探索物理的奥秘</span>
            <span>✨</span>
          </div>
        </div>
        
        {/* 底部签名 */}
        <div className="mt-6 text-blue-300/60 text-sm">
          <p>.天. 代表全体制作团队</p>
          <p className="mt-1 text-xs">感谢有你，一路同行 💝</p>
        </div>
      </div>

      {/* CSS 动画定义 */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
          75% { transform: scale(1.3); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
