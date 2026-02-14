'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false,
  loading: () => <span className="text-blue-400">加载公式...</span>
});

interface Theme {
  name: string;
  id: string;
  gradient: string;
  accentColor: string;
  textColor: string;
}

interface SpringOscillatorProps {
  currentTheme: Theme;
  customColor: string;
}

interface State {
  position: number;
  velocity: number;
  acceleration: number;
  time: number;
  energy: {
    kinetic: number;
    potential: number;
    total: number;
  };
}

export default function SpringOscillator({ currentTheme, customColor }: SpringOscillatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mass, setMass] = useState(5);
  const [stiffness, setStiffness] = useState(20);
  const [damping, setDamping] = useState(0);
  const [amplitude, setAmplitude] = useState(100);
  const [showForces, setShowForces] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  
  const [state, setState] = useState<State>({
    position: 0,
    velocity: 0,
    acceleration: 0,
    time: 0,
    energy: {
      kinetic: 0,
      potential: 0,
      total: 0
    }
  });

  const [history, setHistory] = useState<{ time: number; position: number }[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 物理模拟
  useEffect(() => {
    if (!isPlaying || !isClient) return;

    let animationId: number;
    const dt = 0.016; // 时间步长约 60fps

    const simulate = () => {
      setState(prevState => {
        const newPosition = prevState.position + prevState.velocity * dt;
        const newAcceleration = (-stiffness * newPosition - damping * prevState.velocity) / mass;
        const newVelocity = prevState.velocity + newAcceleration * dt;
        const newTime = prevState.time + dt;

        const kineticEnergy = 0.5 * mass * Math.pow(newVelocity, 2);
        const potentialEnergy = 0.5 * stiffness * Math.pow(newPosition, 2);

        const newState: State = {
          position: newPosition,
          velocity: newVelocity,
          acceleration: newAcceleration,
          time: newTime,
          energy: {
            kinetic: kineticEnergy,
            potential: potentialEnergy,
            total: kineticEnergy + potentialEnergy
          }
        };

        // 更新历史数据用于绘图
        setHistory(prev => {
          const newHistory = [...prev, { time: newTime, position: newPosition }];
          if (newHistory.length > 500) {
            return newHistory.slice(-500);
          }
          return newHistory;
        });

        return newState;
      });

      animationId = requestAnimationFrame(simulate);
    };

    animationId = requestAnimationFrame(simulate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, mass, stiffness, damping, isClient]);

  // 重置模拟
  const resetSimulation = () => {
    setState({
      position: amplitude,
      velocity: 0,
      acceleration: 0,
      time: 0,
      energy: {
        kinetic: 0,
        potential: 0.5 * stiffness * Math.pow(amplitude, 2),
        total: 0.5 * stiffness * Math.pow(amplitude, 2)
      }
    });
    setHistory([]);
  };

  // 绘制 Canvas
  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 400;
    }

    // 背景清除
    ctx.fillStyle = 'rgba(0, 0, 20, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const x = (i * canvas.width) / 20;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const y = (i * canvas.height) / 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const equilibriumX = centerX;
    const blockX = equilibriumX + state.position;
    const blockY = centerY;
    const blockSize = 60;

    // 绘制弹簧
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const springStartX = 50;
    const springEndX = blockX - blockSize / 2;
    const springSegments = 20;
    const segmentLength = (springEndX - springStartX) / springSegments;

    ctx.moveTo(springStartX, blockY);
    for (let i = 1; i <= springSegments; i++) {
      const x = springStartX + i * segmentLength;
      const yOffset = i % 2 === 0 ? 0 : (i % 4 === 1 ? -15 : 15);
      ctx.lineTo(x, blockY + yOffset);
    }
    ctx.stroke();

    // 绘制物块
    const gradient = ctx.createLinearGradient(
      blockX - blockSize / 2, blockY - blockSize / 2,
      blockX + blockSize / 2, blockY + blockSize / 2
    );
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(1, '#3b82f6');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(blockX - blockSize / 2, blockY - blockSize / 2, blockSize, blockSize);
    
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX - blockSize / 2, blockY - blockSize / 2, blockSize, blockSize);

    // 绘制平衡位置标记
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(equilibriumX, blockY - blockSize / 2 - 20);
    ctx.lineTo(equilibriumX, blockY + blockSize / 2 + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制力和速度矢量
    if (showVectors) {
      const vectorScale = 0.5;
      
      // 速度矢量（绿色）
      if (Math.abs(state.velocity) > 0.1) {
        const velocityEndX = blockX + state.velocity * vectorScale;
        drawArrow(ctx, blockX, blockY, velocityEndX, blockY, '#4ade80', 'v');
      }

      // 加速度矢量（红色）
      if (Math.abs(state.acceleration) > 0.1) {
        const accelEndX = blockX + state.acceleration * vectorScale * 10;
        drawArrow(ctx, blockX, blockY - 40, accelEndX, blockY - 40, '#ef4444', 'a');
      }

      // 弹簧力矢量（橙色）
      if (showForces) {
        const force = -stiffness * state.position;
        if (Math.abs(force) > 0.1) {
          const forceEndX = blockX + force * vectorScale * 0.1;
          drawArrow(ctx, blockX, blockY + 40, forceEndX, blockY + 40, '#f97316', 'F');
        }
      }
    }

    // 绘制能量曲线（在底部）
    if (showEnergy && history.length > 1) {
      const energyHeight = 60;
      const energyY = canvas.height - energyHeight - 20;
      const energyWidth = canvas.width - 40;
      const energyX = 20;

      // 动能曲线（绿色）
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      history.forEach((point, index) => {
        const ke = 0.5 * mass * Math.pow(point.position * 10, 2); // 缩放以适应显示
        const x = energyX + (index / history.length) * energyWidth;
        const y = energyY + energyHeight - (ke / 5000) * energyHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // 势能曲线（蓝色）
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.beginPath();
      history.forEach((point, index) => {
        const pe = 0.5 * stiffness * Math.pow(point.position, 2);
        const x = energyX + (index / history.length) * energyWidth;
        const y = energyY + energyHeight - (pe / 5000) * energyHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // 图例
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(74, 222, 128, 0.9)';
      ctx.fillText('动能', energyX + 10, energyY - 10);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.fillText('势能', energyX + 50, energyY - 10);
    }

    // 计算周期
    const period = 2 * Math.PI * Math.sqrt(mass / stiffness);
    const angularFrequency = Math.sqrt(stiffness / mass);

  }, [state, history, showForces, showEnergy, showVectors, mass, stiffness, damping, isClient]);

  // 绘制箭头的辅助函数
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label: string
  ) => {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 5) return;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(toX, toY);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 12px Arial';
    ctx.fillText(label, toX + 5, toY - 5);
  };

  if (!isClient) {
    return <div className="p-6">加载中...</div>;
  }

  const period = 2 * Math.PI * Math.sqrt(mass / stiffness);
  const angularFrequency = Math.sqrt(stiffness / mass);

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="text-4xl animate-float">🔄</div>
        <div>
          <h2 className="text-2xl font-bold">弹簧振子模拟</h2>
          <p className="text-sm text-blue-300/80">观察简谐运动的规律和能量转化</p>
        </div>
      </div>

      {/* Canvas 显示区域 */}
      <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
          style={{ height: '400px' }}
        />
      </div>

      {/* 控制面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 质量 */}
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <label className="block text-sm font-medium mb-2 text-blue-300">
            质量 (m): {mass} kg
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={mass}
            onChange={(e) => {
              setMass(Number(e.target.value));
              resetSimulation();
            }}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 劲度系数 */}
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <label className="block text-sm font-medium mb-2 text-blue-300">
            劲度系数 (k): {stiffness} N/m
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={stiffness}
            onChange={(e) => {
              setStiffness(Number(e.target.value));
              resetSimulation();
            }}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 阻尼系数 */}
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <label className="block text-sm font-medium mb-2 text-blue-300">
            阻尼系数: {damping}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 初始振幅 */}
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <label className="block text-sm font-medium mb-2 text-blue-300">
            初始振幅: {amplitude} px
          </label>
          <input
            type="range"
            min="20"
            max="150"
            value={amplitude}
            onChange={(e) => {
              setAmplitude(Number(e.target.value));
              resetSimulation();
            }}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
        </button>
        <button
          onClick={resetSimulation}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          🔄 重置
        </button>
        <button
          onClick={() => setShowForces(!showForces)}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            showForces ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          力矢量
        </button>
        <button
          onClick={() => setShowVectors(!showVectors)}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            showVectors ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          速度/加速度
        </button>
        <button
          onClick={() => setShowEnergy(!showEnergy)}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            showEnergy ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          能量曲线
        </button>
      </div>

      {/* 实时数据显示 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="text-xs text-blue-300/80 mb-1">位置 (x)</div>
          <div className="text-2xl font-bold">{state.position.toFixed(2)} m</div>
        </div>
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="text-xs text-blue-300/80 mb-1">速度 (v)</div>
          <div className="text-2xl font-bold">{state.velocity.toFixed(2)} m/s</div>
        </div>
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="text-xs text-blue-300/80 mb-1">加速度 (a)</div>
          <div className="text-2xl font-bold">{state.acceleration.toFixed(2)} m/s²</div>
        </div>
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="text-xs text-blue-300/80 mb-1">时间 (t)</div>
          <div className="text-2xl font-bold">{state.time.toFixed(2)} s</div>
        </div>
      </div>

      {/* 能量显示 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="text-xs text-green-300/80 mb-1">动能 (Eₖ)</div>
          <div className="text-xl font-bold text-green-400">{state.energy.kinetic.toFixed(2)} J</div>
        </div>
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="text-xs text-blue-300/80 mb-1">势能 (Eₚ)</div>
          <div className="text-xl font-bold text-blue-400">{state.energy.potential.toFixed(2)} J</div>
        </div>
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="text-xs text-purple-300/80 mb-1">总能量 (E)</div>
          <div className="text-xl font-bold text-purple-400">{state.energy.total.toFixed(2)} J</div>
        </div>
      </div>

      {/* 理论公式 */}
      <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-blue-300">理论公式</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-blue-300/80 mb-2">回复力公式：</div>
            <div className="bg-black/30 rounded-lg p-3">
              <BlockMath math="F = -kx" />
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-300/80 mb-2">周期公式：</div>
            <div className="bg-black/30 rounded-lg p-3">
              <BlockMath math={`T = 2\\pi\\sqrt{\\frac{m}{k}} = ${period.toFixed(2)}\\text{s}`} />
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-300/80 mb-2">角频率：</div>
            <div className="bg-black/30 rounded-lg p-3">
              <BlockMath math={`\\omega = \\sqrt{\\frac{k}{m}} = ${angularFrequency.toFixed(2)}\\text{rad/s}`} />
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-300/80 mb-2">运动方程：</div>
            <div className="bg-black/30 rounded-lg p-3">
              <BlockMath math="x = A\\cos(\\omega t + \\phi)" />
            </div>
          </div>
        </div>
      </div>

      {/* 高考考点提示 */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-semibold mb-3 text-blue-300">📚 高考考点提示</h3>
        <ul className="space-y-2 text-sm text-blue-200/80">
          <li>• 简谐运动的受力特征：F = -kx（回复力与位移成正比且方向相反）</li>
          <li>• 周期公式：T = 2π√(m/k)，与振幅无关（等时性）</li>
          <li>• 能量守恒：只有弹簧弹力做功，机械能守恒，Eₖ + Eₚ = 常量</li>
          <li>• 阻尼振动：有阻尼时振幅逐渐减小，总能量逐渐减小</li>
          <li>• 常见题型：周期计算、能量转化、阻尼对振动的影响等</li>
        </ul>
      </div>
    </div>
  );
}
