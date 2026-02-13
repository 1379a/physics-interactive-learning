'use client';

import { useState, useEffect, useRef } from 'react';

interface ProjectileData {
  x: number;
  y: number;
  t: number;
  vx: number;
  vy: number;
}

export default function ProjectileMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 物理参数
  const [velocity, setVelocity] = useState(50); // 初速度 m/s
  const [angle, setAngle] = useState(45); // 发射角度 度
  const [gravity, setGravity] = useState(9.8); // 重力加速度 m/s²
  const [isAnimating, setIsAnimating] = useState(false);
  const [trajectory, setTrajectory] = useState<ProjectileData[]>([]);
  const [currentPosition, setCurrentPosition] = useState<ProjectileData | null>(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const [maxDistance, setMaxDistance] = useState(0);
  const [flightTime, setFlightTime] = useState(0);

  const calculateTrajectory = () => {
    const v0 = velocity;
    const theta = (angle * Math.PI) / 180;
    const g = gravity;

    // 理论计算
    const tTotal = (2 * v0 * Math.sin(theta)) / g;
    const hMax = (Math.pow(v0 * Math.sin(theta), 2)) / (2 * g);
    const dMax = (Math.pow(v0, 2) * Math.sin(2 * theta)) / g;

    setMaxHeight(hMax);
    setMaxDistance(dMax);
    setFlightTime(tTotal);

    // 生成轨迹点
    const points: ProjectileData[] = [];
    const dt = 0.05;
    let t = 0;

    while (t <= tTotal) {
      const x = v0 * Math.cos(theta) * t;
      const y = v0 * Math.sin(theta) * t - 0.5 * g * Math.pow(t, 2);
      const vx = v0 * Math.cos(theta);
      const vy = v0 * Math.sin(theta) - g * t;

      points.push({ x, y, t, vx, vy });
      t += dt;
    }

    setTrajectory(points);
  };

  useEffect(() => {
    calculateTrajectory();
  }, [velocity, angle, gravity]);

  const startAnimation = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    let currentIndex = 0;

    const animate = () => {
      if (currentIndex < trajectory.length) {
        setCurrentPosition(trajectory[currentIndex]);
        currentIndex++;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetAnimation = () => {
    stopAnimation();
    setCurrentPosition(null);
    calculateTrajectory();
  };

  // 绘制Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isClient) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置Canvas尺寸
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 400;
    }

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 计算缩放因子
    const padding = 40;
    const scaleX = (canvas.width - 2 * padding) / (maxDistance * 1.2 || 100);
    const scaleY = (canvas.height - 2 * padding) / (maxHeight * 1.5 || 100);
    const scale = Math.min(scaleX, scaleY);

    // 绘制网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * (canvas.width - 2 * padding)) / 10;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i <= 10; i++) {
      const y = padding + (i * (canvas.height - 2 * padding)) / 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 绘制坐标轴
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // 绘制轨迹
    if (trajectory.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;

      trajectory.forEach((point, index) => {
        const x = padding + point.x * scale;
        const y = canvas.height - padding - point.y * scale;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制轨迹点
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      trajectory.forEach((point, index) => {
        if (index % 5 === 0) {
          const x = padding + point.x * scale;
          const y = canvas.height - padding - point.y * scale;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 绘制当前位置
    if (currentPosition) {
      const x = padding + currentPosition.x * scale;
      const y = canvas.height - padding - currentPosition.y * scale;

      // 绘制小球
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制速度矢量
      const vScale = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + currentPosition.vx * vScale, y - currentPosition.vy * vScale);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制箭头
      const angle = Math.atan2(-currentPosition.vy, currentPosition.vx);
      const arrowSize = 8;
      ctx.beginPath();
      ctx.moveTo(x + currentPosition.vx * vScale, y - currentPosition.vy * vScale);
      ctx.lineTo(
        x + currentPosition.vx * vScale - arrowSize * Math.cos(angle - Math.PI / 6),
        y - currentPosition.vy * vScale + arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(x + currentPosition.vx * vScale, y - currentPosition.vy * vScale);
      ctx.lineTo(
        x + currentPosition.vx * vScale - arrowSize * Math.cos(angle + Math.PI / 6),
        y - currentPosition.vy * vScale + arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }

    // 绘制标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px sans-serif';
    ctx.fillText(`水平距离: ${maxDistance.toFixed(2)} m`, padding, padding);
    ctx.fillText(`最大高度: ${maxHeight.toFixed(2)} m`, padding, padding + 20);
    ctx.fillText(`飞行时间: ${flightTime.toFixed(2)} s`, padding, padding + 40);

  }, [trajectory, currentPosition, maxHeight, maxDistance, flightTime, isClient]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🎯</div>
        <div>
          <h2 className="text-2xl font-bold">抛体运动模拟器</h2>
          <p className="text-sm text-blue-300/80">调整参数，观察抛体运动轨迹</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：参数控制 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold mb-4 text-blue-300">初始参数</div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-blue-300/80">初速度 (v₀)</label>
                  <span className="text-sm font-mono bg-blue-600/30 px-2 py-1 rounded">
                    {velocity.toFixed(1)} m/s
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={velocity}
                  onChange={(e) => setVelocity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-blue-300/80">发射角度 (θ)</label>
                  <span className="text-sm font-mono bg-blue-600/30 px-2 py-1 rounded">
                    {angle.toFixed(1)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={angle}
                  onChange={(e) => setAngle(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-blue-300/80">重力加速度 (g)</label>
                  <span className="text-sm font-mono bg-blue-600/30 px-2 py-1 rounded">
                    {gravity.toFixed(1)} m/s²
                  </span>
                </div>
                <input
                  type="range"
                  min="1.6"
                  max="20"
                  step="0.1"
                  value={gravity}
                  onChange={(e) => setGravity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6">
              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isAnimating
                    ? 'bg-blue-900/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-600/30'
                }`}
              >
                ▶ 开始
              </button>
              <button
                onClick={stopAnimation}
                disabled={!isAnimating}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  !isAnimating
                    ? 'bg-white/10 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                ⏸ 暂停
              </button>
              <button
                onClick={resetAnimation}
                className="py-2 px-3 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-all"
              >
                ↺ 重置
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setAngle(45)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
              >
                设置为 45°（最远射程）
              </button>
              <button
                onClick={() => setAngle(90)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
              >
                设置为 90°（垂直上抛）
              </button>
            </div>
          </div>
        </div>

        {/* 中间：Canvas 模拟 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black/30 rounded-xl p-4 border border-white/10">
            <div className="relative w-full">
              {isClient ? (
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg"
                  style={{ height: '400px' }}
                />
              ) : (
                <div className="w-full rounded-lg flex items-center justify-center" style={{ height: '400px' }}>
                  <div className="text-blue-300/80">加载模拟器...</div>
                </div>
              )}
            </div>
          </div>

          {/* 实时数据 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-xs text-blue-300/70 mb-1">最大高度</div>
              <div className="text-2xl font-bold">{maxHeight.toFixed(2)} m</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-xs text-blue-300/70 mb-1">水平距离</div>
              <div className="text-2xl font-bold">{maxDistance.toFixed(2)} m</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-xs text-blue-300/70 mb-1">飞行时间</div>
              <div className="text-2xl font-bold">{flightTime.toFixed(2)} s</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-xs text-blue-300/70 mb-1">理论射程</div>
              <div className="text-2xl font-bold">{(Math.pow(velocity, 2) * Math.sin((angle * Math.PI) / 180) * 2 / gravity).toFixed(2)} m</div>
            </div>
          </div>

          {/* 当前状态 */}
          {currentPosition && (
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
              <div className="text-sm font-semibold mb-3 text-blue-300">实时数据</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-300/70">时间:</span>
                  <span className="font-mono">{currentPosition?.t?.toFixed(2) || '0.00'} s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300/70">X 坐标:</span>
                  <span className="font-mono">{currentPosition?.x?.toFixed(2) || '0.00'} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300/70">Y 坐标:</span>
                  <span className="font-mono">{currentPosition?.y?.toFixed(2) || '0.00'} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300/70">速度:</span>
                  <span className="font-mono">
                    {currentPosition?.vx && currentPosition?.vy
                      ? Math.sqrt(Math.pow(currentPosition.vx, 2) + Math.pow(currentPosition.vy, 2)).toFixed(2)
                      : '0.00'} m/s
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 物理原理 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-sm font-semibold mb-3 text-blue-300">物理原理</div>
            <div className="space-y-2 text-sm text-blue-100/80">
              <p><strong className="text-blue-300">运动方程：</strong></p>
              <p className="ml-4">x = v₀ cos(θ) · t</p>
              <p className="ml-4">y = v₀ sin(θ) · t - ½gt²</p>
              <p className="mt-3"><strong className="text-blue-300">关键公式：</strong></p>
              <p className="ml-4">最大高度: H = v₀²sin²(θ)/(2g)</p>
              <p className="ml-4">水平距离: R = v₀²sin(2θ)/g</p>
              <p className="ml-4">飞行时间: T = 2v₀sin(θ)/g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
