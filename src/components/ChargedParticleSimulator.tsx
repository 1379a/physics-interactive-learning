'use client';

import { useState, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
}

export default function ChargedParticleSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 使用 ref 存储粒子状态，避免无限循环
  const particleRef = useRef<Particle | null>(null);

  // 历史记录（用于撤销/重做）
  const [history, setHistory] = useState<{ charge: number; magneticField: number; velocity: number; angle: number; mass: number }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 默认值
  const defaultValues = {
    charge: 1,
    magneticField: 2,
    velocity: 5,
    angle: 90,
    mass: 1
  };

  // 物理参数
  const [charge, setCharge] = useState(defaultValues.charge); // 电荷 +1/-1
  const [magneticField, setMagneticField] = useState(defaultValues.magneticField); // 磁感应强度 T
  const [velocity, setVelocity] = useState(defaultValues.velocity); // 初速度
  const [angle, setAngle] = useState(defaultValues.angle); // 入射角度
  const [mass, setMass] = useState(defaultValues.mass); // 粒子质量
  const [isRunning, setIsRunning] = useState(false);

  const [radius, setRadius] = useState(0);
  const [period, setPeriod] = useState(0);

  const canvasWidth = 600;
  const canvasHeight = 400;

  useEffect(() => {
    setIsClient(true);
    saveToHistory();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, charge, magneticField, velocity, angle, mass]);

  const initParticle = () => {
    const theta = (angle * Math.PI) / 180;
    const speed = velocity;

    particleRef.current = {
      x: 100,
      y: canvasHeight / 2,
      vx: speed * Math.cos(theta),
      vy: -speed * Math.sin(theta),
      color: charge > 0 ? '#EF4444' : '#3B82F6',
      trail: []
    };

    // 计算理论半径和周期
    // R = mv / (qB)
    // T = 2πm / (qB)
    const q = charge;
    const m = mass;
    const B = magneticField;
    const v = speed;

    const calculatedRadius = (m * v) / (Math.abs(q) * B);
    const calculatedPeriod = (2 * Math.PI * m) / (Math.abs(q) * B);

    setRadius(calculatedRadius);
    setPeriod(calculatedPeriod);
  };

  const animate = () => {
    if (!canvasRef.current || !particleRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制磁场方向
    ctx.fillStyle = '#3B82F6';
    ctx.font = '16px Arial';
    ctx.fillText('磁场 B', 10, 25);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#60A5FA';
    ctx.fillText('⊗ 表示垂直纸面向里', 10, 45);

    // 绘制磁场符号（×表示垂直纸面向里）
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    const gridSize = 30;
    for (let x = gridSize; x < canvasWidth; x += gridSize) {
      for (let y = gridSize; y < canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x + 5, y - 5);
        ctx.lineTo(x - 5, y + 5);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 更新粒子位置
    const dt = 0.1;
    const q = charge;
    const m = mass;
    const B = magneticField;
    const particle = particleRef.current;

    // 洛伦兹力 F = q(v × B)
    // 在2D平面中，F_x = qvyB, F_y = -qvxB
    const Fx = q * particle.vy * B;
    const Fy = -q * particle.vx * B;

    const ax = Fx / m;
    const ay = Fy / m;

    const newVx = particle.vx + ax * dt;
    const newVy = particle.vy + ay * dt;

    const newX = particle.x + newVx * dt;
    const newY = particle.y + newVy * dt;

    // 记录轨迹
    const newTrail = [...particle.trail, { x: newX, y: newY }];
    if (newTrail.length > 200) {
      newTrail.shift();
    }

    // 绘制轨迹
    if (newTrail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(newTrail[0].x, newTrail[0].y);
      for (let i = 1; i < newTrail.length; i++) {
        ctx.lineTo(newTrail[i].x, newTrail[i].y);
      }
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 绘制粒子
    ctx.beginPath();
    ctx.arc(newX, newY, 8, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制电荷符号
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(charge > 0 ? '+' : '-', newX, newY);

    // 绘制速度矢量
    ctx.beginPath();
    ctx.moveTo(newX, newY);
    ctx.lineTo(newX + newVx * 5, newY - newVy * 5);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制洛伦兹力矢量
    const forceMagnitude = 0.5;
    const forceAngle = Math.atan2(ay, ax);
    ctx.beginPath();
    ctx.moveTo(newX, newY);
    ctx.lineTo(newX + Math.cos(forceAngle) * 40, newY - Math.sin(forceAngle) * 40);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 更新 ref 中的粒子状态
    particleRef.current = {
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      color: particle.color,
      trail: newTrail
    };

    // 检查是否超出边界
    if (newX < 0 || newX > canvasWidth || newY < 0 || newY > canvasHeight) {
      setIsRunning(false);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleStart = () => {
    initParticle();
    setIsRunning(true);
  };

  // 历史记录管理
  const saveToHistory = () => {
    const newState = { charge, magneticField, velocity, angle, mass };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCharge(prevState.charge);
      setMagneticField(prevState.magneticField);
      setVelocity(prevState.velocity);
      setAngle(prevState.angle);
      setMass(prevState.mass);
      setHistoryIndex(prev => prev - 1);
      setIsRunning(false);
      setParticle(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCharge(nextState.charge);
      setMagneticField(nextState.magneticField);
      setVelocity(nextState.velocity);
      setAngle(nextState.angle);
      setMass(nextState.mass);
      setHistoryIndex(prev => prev + 1);
      setIsRunning(false);
      setParticle(null);
    }
  };

  // 更新参数并保存到历史记录
  const updateCharge = (value: number) => {
    setCharge(value);
    setIsRunning(false);
    setParticle(null);
    setTimeout(saveToHistory, 0);
  };

  const updateMagneticField = (value: number) => {
    setMagneticField(value);
    setIsRunning(false);
    setParticle(null);
    setTimeout(saveToHistory, 0);
  };

  const updateVelocity = (value: number) => {
    setVelocity(value);
    setIsRunning(false);
    setParticle(null);
    setTimeout(saveToHistory, 0);
  };

  const updateAngle = (value: number) => {
    setAngle(value);
    setIsRunning(false);
    setParticle(null);
    setTimeout(saveToHistory, 0);
  };

  const updateMass = (value: number) => {
    setMass(value);
    setIsRunning(false);
    setParticle(null);
    setTimeout(saveToHistory, 0);
  };

  const handleReset = () => {
    setCharge(defaultValues.charge);
    setMagneticField(defaultValues.magneticField);
    setVelocity(defaultValues.velocity);
    setAngle(defaultValues.angle);
    setMass(defaultValues.mass);
    setIsRunning(false);
    setParticle(null);
    setRadius(0);
    setPeriod(0);
    saveToHistory();
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">⚡</div>
        <div>
          <h2 className="text-2xl font-bold">带电粒子在磁场中的运动</h2>
          <p className="text-sm text-blue-300/80">洛伦兹力与圆周运动</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <canvas 
              ref={canvasRef} 
              width={canvasWidth} 
              height={canvasHeight}
              className="w-full rounded-lg bg-black/30"
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-purple-400">{radius.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">轨道半径 (m)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-orange-400">{period.toFixed(3)}</div>
              <div className="text-sm text-blue-300/80">周期 (s)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400">{velocity.toFixed(1)}</div>
              <div className="text-sm text-blue-300/80">速度 (m/s)</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold mb-4 text-blue-300">控制面板</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  电荷: {charge > 0 ? '+1e' : '-1e'} (C)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCharge(1)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      charge > 0 ? 'bg-red-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    + 正电荷
                  </button>
                  <button
                    onClick={() => updateCharge(-1)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      charge < 0 ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    - 负电荷
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  磁感应强度: {magneticField} T
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={magneticField}
                  onChange={(e) => updateMagneticField(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>0.5T</span>
                  <span>5T</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  初速度: {velocity} m/s
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={velocity}
                  onChange={(e) => updateVelocity(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>1 m/s</span>
                  <span>10 m/s</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  入射角度: {angle}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={angle}
                  onChange={(e) => updateAngle(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>0°</span>
                  <span>180°</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  粒子质量: {mass} kg
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={mass}
                  onChange={(e) => updateMass(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>0.5kg</span>
                  <span>3kg</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleStart}
                disabled={isRunning}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                🚀 发射粒子
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                🔄 重置为默认
              </button>
            </div>

            {/* 撤销/重做 */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                ↩️ 撤回
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                ↪️ 回撤
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">💡 知识要点</h4>
            <div className="space-y-2 text-sm text-blue-100/80">
              <p><strong>洛伦兹力公式：</strong></p>
              <p className="font-mono text-blue-300">F = qvB (v ⟂ B)</p>
              <p><strong>圆周运动半径：</strong></p>
              <p className="font-mono text-blue-300">R = mv / (qB)</p>
              <p><strong>周期：</strong></p>
              <p className="font-mono text-blue-300">T = 2πm / (qB)</p>
              <p className="mt-2 text-yellow-300/80">
                ⚠️ 粒子做匀速圆周运动，速度大小不变，方向不断改变
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 图例说明</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500"></div>
                <span className="text-blue-200/80">速度矢量</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500"></div>
                <span className="text-blue-200/80">洛伦兹力</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500"></div>
                <span className="text-blue-200/80">正电荷轨迹</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span className="text-blue-200/80">负电荷轨迹</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
