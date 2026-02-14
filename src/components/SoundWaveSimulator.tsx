'use client';

import { useState, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  baseX: number;
  y: number;
  amplitude: number;
  phase: number;
}

export default function SoundWaveSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 历史记录
  const [history, setHistory] = useState<{ frequency: number; amplitude: number; speed: number; particleCount: number }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 默认值
  const defaultValues = {
    frequency: 2.0,
    amplitude: 30,
    speed: 3.0,
    particleCount: 50
  };

  // 物理参数
  const [frequency, setFrequency] = useState(defaultValues.frequency); // 频率 Hz
  const [amplitude, setAmplitude] = useState(defaultValues.amplitude); // 振幅
  const [speed, setSpeed] = useState(defaultValues.speed); // 波速
  const [particleCount, setParticleCount] = useState(defaultValues.particleCount); // 粒子数量
  const [isRunning, setIsRunning] = useState(false);

  // 粒子数组
  const [particles, setParticles] = useState<Particle[]>([]);

  const canvasWidth = 600;
  const canvasHeight = 400;
  const centerY = canvasHeight / 2;
  const spacing = canvasWidth / (particleCount + 1);

  useEffect(() => {
    setIsClient(true);
    initializeParticles();
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
  }, [isRunning, frequency, amplitude, speed, particles]);

  const initializeParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: (i + 1) * spacing,
        baseX: (i + 1) * spacing,
        y: centerY,
        amplitude: amplitude * Math.exp(-Math.pow((i - particleCount / 2) / (particleCount / 3), 2)),
        phase: 0
      });
    }
    setParticles(newParticles);
  };

  const saveToHistory = () => {
    const newState = { frequency, amplitude, speed, particleCount };
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
      setFrequency(prevState.frequency);
      setAmplitude(prevState.amplitude);
      setSpeed(prevState.speed);
      setParticleCount(prevState.particleCount);
      setHistoryIndex(prev => prev - 1);
      setIsRunning(false);
      setTimeout(() => initializeParticles(), 0);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setFrequency(nextState.frequency);
      setAmplitude(nextState.amplitude);
      setSpeed(nextState.speed);
      setParticleCount(nextState.particleCount);
      setHistoryIndex(prev => prev + 1);
      setIsRunning(false);
      setTimeout(() => initializeParticles(), 0);
    }
  };

  const updateFrequency = (value: number) => {
    setFrequency(value);
    setTimeout(saveToHistory, 0);
  };

  const updateAmplitude = (value: number) => {
    setAmplitude(value);
    setTimeout(saveToHistory, 0);
  };

  const updateSpeed = (value: number) => {
    setSpeed(value);
    setTimeout(saveToHistory, 0);
  };

  const updateParticleCount = (value: number) => {
    setParticleCount(value);
    setTimeout(() => {
      initializeParticles();
      saveToHistory();
    }, 0);
  };

  const handleReset = () => {
    setFrequency(defaultValues.frequency);
    setAmplitude(defaultValues.amplitude);
    setSpeed(defaultValues.speed);
    setParticleCount(defaultValues.particleCount);
    setIsRunning(false);
    setTimeout(() => {
      initializeParticles();
      saveToHistory();
    }, 0);
  };

  const animate = (timestamp = 0) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = timestamp / 1000;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制平衡位置线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();

    // 更新粒子位置
    const updatedParticles = particles.map((particle, i) => {
      const displacement = particle.amplitude * Math.sin(2 * Math.PI * frequency * time - 2 * Math.PI * i / particleCount);
      return {
        ...particle,
        y: centerY + displacement
      };
    });

    // 绘制粒子（代表介质粒子）
    updatedParticles.forEach((particle, i) => {
      const displacement = particle.y - centerY;
      const density = Math.abs(displacement) / amplitude;
      const blue = Math.floor(100 + 155 * density);
      const red = Math.floor(255 * (1 - density));

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${red}, 100, ${blue})`;
      ctx.fill();

      // 绘制与平衡位置的连线
      ctx.beginPath();
      ctx.moveTo(particle.baseX, centerY);
      ctx.lineTo(particle.x, particle.y);
      ctx.strokeStyle = `rgba(100, 150, 255, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 绘制纵波示意图（疏密波）
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    for (let i = 0; i < particleCount; i++) {
      const x = (i / particleCount) * canvasWidth;
      const displacement = updatedParticles[i].y - centerY;
      const density = displacement > 0 ? 1 + displacement / amplitude : 1 + displacement / amplitude;
      gradient.addColorStop(i / particleCount, `rgba(100, 150, 255, ${Math.max(0.1, Math.min(0.5, density * 0.2))})`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制波形图
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.8)';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvasWidth; x++) {
      const waveY = centerY - amplitude * Math.sin(2 * Math.PI * frequency * (time - x / (canvasWidth * speed / 100)));
      if (x === 0) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();

    // 计算波长
    const wavelength = speed / frequency;

    animationRef.current = requestAnimationFrame(animate);
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🔊</div>
        <div>
          <h2 className="text-2xl font-bold">声波传播模拟</h2>
          <p className="text-sm text-blue-300/80">纵波（疏密波）传播特性</p>
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
              <div className="text-3xl font-bold text-blue-400">{frequency.toFixed(1)}</div>
              <div className="text-sm text-blue-300/80">频率 (Hz)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400">{(speed / frequency).toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">波长 (m)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-yellow-400">{speed.toFixed(1)}</div>
              <div className="text-sm text-blue-300/80">波速 (m/s)</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold mb-4 text-blue-300">控制面板</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  频率: {frequency} Hz
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={frequency}
                  onChange={(e) => updateFrequency(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  振幅: {amplitude}
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={amplitude}
                  onChange={(e) => updateAmplitude(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  波速: {speed} m/s
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={speed}
                  onChange={(e) => updateSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  粒子数量: {particleCount}
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="5"
                  value={particleCount}
                  onChange={(e) => updateParticleCount(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                {isRunning ? '⏸️ 暂停' : '▶️ 播放'}
              </button>
              <button
                onClick={() => setIsRunning(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                ↺ 重置
              </button>
            </div>

            {/* 撤销/重做/重置为默认 */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors text-sm"
              >
                🔄 重置为默认
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-sm"
              >
                ↩️ 撤回
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-sm"
              >
                ↪️ 回撤
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">💡 知识要点</h4>
            <div className="space-y-2 text-sm text-blue-100/80">
              <p><strong>纵波特点：</strong></p>
              <p>• 振动方向与传播方向平行</p>
              <p>• 形成疏密相间的波</p>
              <p>• 声波是典型的纵波</p>
              <p className="mt-2"><strong>波形关系：</strong></p>
              <p className="font-mono text-blue-300">v = λf</p>
              <p>• v: 波速, λ: 波长, f: 频率</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 图例说明</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-red-500"></div>
                <span className="text-blue-200/80">粒子 - 颜色表示位移方向</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-yellow-400"></div>
                <span className="text-blue-200/80">黄色曲线 - 波形图</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500/30"></div>
                <span className="text-blue-200/80">蓝色渐变 - 疏密程度</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
