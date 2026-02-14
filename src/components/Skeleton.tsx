'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

// 基础骨架元素
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseClasses = 'animate-shimmer bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    card: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : '100px'),
  };

  const elements = [];
  for (let i = 0; i < count; i++) {
    elements.push(
      <div
        key={i}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={style}
      />
    );
  }

  return count === 1 ? elements[0] : <div className="space-y-2">{elements}</div>;
};

// 卡片骨架屏
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push(
      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
        <Skeleton variant="text" width="60%" height="20px" />
        <Skeleton variant="text" count={2} height="14px" />
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rectangular" width="80px" height="32px" />
          <Skeleton variant="rectangular" width="80px" height="32px" />
        </div>
      </div>
    );
  }
  return <div className="space-y-4">{cards}</div>;
};

// 概念导航骨架屏
export const NavigatorSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    {/* 分支选择骨架 */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton variant="circular" width="32px" height="32px" />
            <Skeleton variant="text" width="60px" height="18px" />
          </div>
          <Skeleton variant="text" count={2} height="12px" />
        </div>
      ))}
    </div>
    
    {/* 概念列表骨架 */}
    <div className="grid lg:grid-cols-3 gap-4 mt-6">
      <div className="space-y-3">
        <Skeleton variant="text" width="40%" height="20px" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <Skeleton variant="text" width="70%" height="16px" />
            <Skeleton variant="text" width="100%" height="12px" className="mt-1" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" width="40%" height="20px" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <Skeleton variant="text" width="70%" height="16px" />
            <Skeleton variant="text" width="100%" height="12px" className="mt-1" />
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
        <Skeleton variant="text" width="50%" height="20px" />
        <Skeleton variant="rectangular" height="60px" />
        <Skeleton variant="text" count={3} height="14px" />
      </div>
    </div>
  </div>
);

// 模拟器骨架屏
export const SimulatorSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    {/* 控制面板骨架 */}
    <div className="grid lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <Skeleton variant="text" width="50%" height="14px" />
            <Skeleton variant="rectangular" height="40px" className="mt-2" />
          </div>
        ))}
      </div>
      {/* 画布骨架 */}
      <div className="lg:col-span-3">
        <div className="bg-white/5 rounded-xl border border-white/10 h-[400px] flex items-center justify-center">
          <div className="text-blue-300/50 flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span>加载模拟器...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 通用页面骨架屏
export const PageSkeleton: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-blue-300/70 animate-pulse">加载中...</p>
    </div>
  </div>
);

export default Skeleton;
