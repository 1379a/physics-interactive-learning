'use client';

import { useState, useEffect, useRef } from 'react';

type MotionType = 'horizontal' | 'oblique';

interface ProjectileData {
  x: number;
  y: number;
  t: number;
  vx: number;
  vy: number;
}

export default function ProjectileSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 运动类型
  const [motionType, setMotionType] = useState<MotionType>('oblique');

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
    const theta = motionType === 'horizontal' ? 0 : (angle * Math.PI) / 180;
    const g = gravity;

    // 理论计算
    let tTotal: number;
    let hMax: number;
    let dMax: number;

    if (motionType === 'horizontal') {
      // 平抛运动：仅由高度决定飞行时间
      // 假设抛出高度为0，则立即落地
      // 这里我们假设抛出高度为100米，使平抛运动有意义
      const h = 100; // 抛出高度
      tTotal = Math.sqrt(2 * h / g);
      hMax = h;
      dMax = v0 * tTotal;
    } else {
      // 斜抛运动
      tTotal = (2 * v0 * Math.sin(theta)) / g;
      hMax = (Math.pow(v0 * Math.sin(theta), 2)) / (2 * g);
      dMax = (Math.pow(v0, 2) * Math.sin(2 * theta)) / g;
    }

    setMaxHeight(hMax);
    setMaxDistance(dMax);
    setFlightTime(tTotal);

    // 生成轨迹点
    const points: ProjectileData[] = [];
    const dt = 0.05;
    let t = 0;

    while (t <= tTotal) {
      let x: number, y: number;
      
      if (motionType === 'horizontal') {
        // 平抛运动
        const h = 100; // 抛出高度
        x = v0 * t;
        y = h - 0.5 * g * Math.pow(t, 2);
      } else {
        // 斜抛运动
        x = v0 * Math.cos(theta) * t;
        y = v0 * Math.sin(theta) * t - 0.5 * g * Math.pow(t, 2);
      }
      
      const vx = motionType === 'horizontal' ? v0 : v0 * Math.cos(theta);
      const vy = motionType === 'horizontal' ? -g * t : v0 * Math.sin(theta) - g * t;

      points.push({ x, y, t, vx, vy });
      t += dt;
    }

    setTrajectory(points);
  };

  useEffect(() => {
    calculateTrajectory();
  }, [velocity, angle, gravity, motionType]);

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
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.lineWidth = 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x + currentPosition.vx * vScale, y - currentPosition.vy * vScale);
      ctx.stroke();

      // 绘制速度矢量箭头
      const arrowAngle = Math.atan2(-currentPosition.vy, currentPosition.vx);
      const arrowSize = 8;
      ctx.beginPath();
      ctx.moveTo(x + currentPosition.vx * vScale, y - currentPosition.vy * vScale);
      ctx.lineTo(
        x + currentPosition.vx * vScale - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
        y - currentPosition.vy * vScale + arrowSize * Math.sin(arrowAngle - Math.PI / 6)
      );
      ctx.lineTo(
        x + currentPosition.vx * vScale - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
        y - currentPosition.vy * vScale + arrowSize * Math.sin(arrowAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.fill();

      // 显示实时数据
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`时间: ${currentPosition.t.toFixed(2)} s`, x + 15, y - 20);
      ctx.fillText(`位置: (${currentPosition.x.toFixed(1)}, ${currentPosition.y.toFixed(1)}) m`, x + 15, y - 5);
      ctx.fillText(`速度: (${currentPosition.vx.toFixed(1)}, ${currentPosition.vy.toFixed(1)}) m/s`, x + 15, y + 10);
    }

    // 绘制发射器
    const launchX = padding;
    const launchY = motionType === 'horizontal' 
      ? canvas.height - padding - (100 * scale) // 平抛运动：在100米高度
      : canvas.height - padding; // 斜抛运动：在地面上
    const launchAngle = motionType === 'horizontal' ? 0 : (angle * Math.PI) / 180;
    const launcherLength = 40;

    ctx.save();
    ctx.translate(launchX, launchY);
    ctx.rotate(-launchAngle);

    // 发射管
    ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.fillRect(0, -5, launcherLength, 10);

    // 发射点
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();

    ctx.restore();
  }, [trajectory, currentPosition, maxHeight, maxDistance, angle, motionType, isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl animate-float">🎯</div>
        <div>
          <h2 className="text-2xl font-bold">
            {motionType === 'horizontal' ? '平抛运动模拟' : '斜抛运动模拟'}
          </h2>
          <p className="text-sm text-blue-300/80">
            {motionType === 'horizontal' 
              ? '模拟平抛运动轨迹和实时数据（固定水平抛出）' 
              : '模拟斜抛运动轨迹和实时数据'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 参数控制 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">⚙️ 参数设置</h3>

            {/* 运动类型选择 */}
            <div className="mb-4">
              <label className="text-sm text-blue-200 block mb-2">运动类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMotionType('horizontal')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    motionType === 'horizontal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-blue-200 hover:bg-white/20'
                  }`}
                >
                  水平抛体
                </button>
                <button
                  onClick={() => setMotionType('oblique')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    motionType === 'oblique'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-blue-200 hover:bg-white/20'
                  }`}
                >
                  斜向抛体
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-blue-200">初速度 (v₀)</label>
                  <span className="text-sm font-mono bg-blue-600/30 px-2 py-1 rounded">
                    {velocity.toFixed(1)} m/s
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={velocity}
                  onChange={(e) => setVelocity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-blue-200">发射角度 (θ)</label>
                  <span className={`text-sm font-mono px-2 py-1 rounded ${
                    motionType === 'horizontal' 
                      ? 'bg-gray-600/30 text-gray-400'
                      : 'bg-blue-600/30 text-blue-400'
                  }`}>
                    {motionType === 'horizontal' ? '0° (固定)' : `${angle.toFixed(1)}°`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={angle}
                  onChange={(e) => setAngle(parseFloat(e.target.value))}
                  disabled={motionType === 'horizontal'}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    motionType === 'horizontal'
                      ? 'bg-gray-600/30 cursor-not-allowed'
                      : 'bg-white/10 accent-blue-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-blue-200">重力加速度 (g)</label>
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

            <div className="mt-6 flex gap-2">
              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  isAnimating
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                ▶️ 开始
              </button>
              <button
                onClick={stopAnimation}
                disabled={!isAnimating}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  !isAnimating
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                ⏸️ 暂停
              </button>
            </div>

            <button
              onClick={resetAnimation}
              className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all"
            >
              🔄 重置
            </button>
          </div>

          {/* 理论值 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">📊 理论值</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-200">最大高度</span>
                <span className="font-mono text-blue-400">
                  {maxHeight.toFixed(2)} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">最远距离</span>
                <span className="font-mono text-blue-400">
                  {maxDistance.toFixed(2)} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">飞行时间</span>
                <span className="font-mono text-blue-400">
                  {flightTime.toFixed(2)} s
                </span>
              </div>
            </div>
          </div>

          {/* 公式说明 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">📝 运动方程</h3>
            <div className="space-y-2 text-sm text-blue-200">
              {motionType === 'horizontal' ? (
                <>
                  <div className="text-blue-400/80 font-medium mb-2">水平抛体（平抛）</div>
                  <div>x(t) = v₀·t</div>
                  <div>y(t) = h - ½gt²</div>
                  <div>vₓ(t) = v₀</div>
                  <div>v_y(t) = -gt</div>
                </>
              ) : (
                <>
                  <div className="text-blue-400/80 font-medium mb-2">斜向抛体</div>
                  <div>x(t) = v₀·cos(θ)·t</div>
                  <div>y(t) = v₀·sin(θ)·t - ½gt²</div>
                  <div>vₓ(t) = v₀·cos(θ)</div>
                  <div>v_y(t) = v₀·sin(θ) - gt</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 模拟画布 */}
        <div className="lg:col-span-2">
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
