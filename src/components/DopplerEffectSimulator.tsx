'use client';

import { useState, useEffect, useRef } from 'react';

interface Wavefront {
  x: number;
  y: number;
  radius: number;
  timestamp: number;
}

export default function DopplerEffectSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 历史记录
  const [history, setHistory] = useState<{ frequency: number; sourceSpeed: number; waveSpeed: number; observerX: number }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 默认值
  const defaultValues = {
    frequency: 1.0,
    sourceSpeed: 2.0,
    waveSpeed: 4.0,
    observerX: 4.0
  };

  // 物理参数
  const [frequency, setFrequency] = useState(defaultValues.frequency); // 发射频率 Hz
  const [sourceSpeed, setSourceSpeed] = useState(defaultValues.sourceSpeed); // 波源速度 m/s
  const [waveSpeed, setWaveSpeed] = useState(defaultValues.waveSpeed); // 波速 m/s
  const [observerX, setObserverX] = useState(defaultValues.observerX); // 观察者X坐标 m
  const [isRunning, setIsRunning] = useState(false);

  // 实时数据（用于显示的state）
  const [receivedFrequency, setReceivedFrequency] = useState(0);
  const [dopplerFactor, setDopplerFactor] = useState(0);
  const [sourcePosition, setSourcePosition] = useState(0);
  const [frequencyHistory, setFrequencyHistory] = useState<{ time: number; frequency: number }[]>([]);
  const [positionHistory, setPositionHistory] = useState<{ time: number; position: number }[]>([]);

  // 动画数据（使用ref避免无限循环）
  const wavefrontsRef = useRef<Wavefront[]>([]);
  const lastWaveTimeRef = useRef(0);
  const sourcePositionRef = useRef(0);
  const frequencyHistoryRef = useRef<{ time: number; frequency: number }[]>([]);
  const positionHistoryRef = useRef<{ time: number; position: number }[]>([]);
  const frameCounterRef = useRef(0);

  const canvasWidth = 600;
  const canvasHeight = 400;
  const scale = 30; // 像素/米
  const centerY = canvasHeight / 2;

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
  }, [isRunning, frequency, sourceSpeed, waveSpeed, observerX]);

  const saveToHistory = () => {
    const newState = { frequency, sourceSpeed, waveSpeed, observerX };
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
      setSourceSpeed(prevState.sourceSpeed);
      setWaveSpeed(prevState.waveSpeed);
      setObserverX(prevState.observerX);
      setHistoryIndex(prev => prev - 1);
      setIsRunning(false);
      resetSimulation();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setFrequency(nextState.frequency);
      setSourceSpeed(nextState.sourceSpeed);
      setWaveSpeed(nextState.waveSpeed);
      setObserverX(nextState.observerX);
      setHistoryIndex(prev => prev + 1);
      setIsRunning(false);
      resetSimulation();
    }
  };

  const updateFrequency = (value: number) => {
    setFrequency(value);
    setTimeout(saveToHistory, 0);
  };

  const updateSourceSpeed = (value: number) => {
    setSourceSpeed(value);
    setTimeout(saveToHistory, 0);
  };

  const updateWaveSpeed = (value: number) => {
    setWaveSpeed(value);
    setTimeout(saveToHistory, 0);
  };

  const updateObserverX = (value: number) => {
    setObserverX(value);
    setTimeout(saveToHistory, 0);
  };

  const resetSimulation = () => {
    wavefrontsRef.current = [];
    lastWaveTimeRef.current = 0;
    sourcePositionRef.current = -6;
    frequencyHistoryRef.current = [];
    positionHistoryRef.current = [];
    setFrequencyHistory([]);
    setPositionHistory([]);
    setReceivedFrequency(0);
    setDopplerFactor(0);
    setSourcePosition(-6);
  };

  const handleReset = () => {
    setFrequency(defaultValues.frequency);
    setSourceSpeed(defaultValues.sourceSpeed);
    setWaveSpeed(defaultValues.waveSpeed);
    setObserverX(defaultValues.observerX);
    setIsRunning(false);
    resetSimulation();
    saveToHistory();
  };

  const animate = (timestamp = 0) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = 0.016; // 假设 60fps
    const time = timestamp / 1000;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新波源位置（使用ref）
    const newSourcePosition = sourcePositionRef.current + sourceSpeed * dt;
    sourcePositionRef.current = newSourcePosition;

    // 生成新波前（使用ref）
    if (time - lastWaveTimeRef.current >= 1 / frequency) {
      wavefrontsRef.current = [
        ...wavefrontsRef.current,
        {
          x: sourcePositionRef.current * scale,
          y: centerY,
          radius: 0,
          timestamp: time
        }
      ];
      lastWaveTimeRef.current = time;
    }

    // 更新波前半径（使用ref）
    const updatedWavefronts = wavefrontsRef.current.map(wavefront => ({
      ...wavefront,
      radius: wavefront.radius + waveSpeed * dt * scale
    }));
    wavefrontsRef.current = updatedWavefronts;

    // 计算接收到的频率
    const dx = observerX - newSourcePosition;
    const v0 = 0; // 观察者静止
    const vs = sourceSpeed;
    const v = waveSpeed;

    const observedFreq = frequency * (v + v0) / (v - vs);
    const factor = observedFreq / frequency;

    // 记录历史数据（使用ref）
    frequencyHistoryRef.current.push({ time, frequency: observedFreq });
    if (frequencyHistoryRef.current.length > 200) {
      frequencyHistoryRef.current.shift();
    }

    positionHistoryRef.current.push({ time, position: newSourcePosition });
    if (positionHistoryRef.current.length > 200) {
      positionHistoryRef.current.shift();
    }

    // 每10帧更新一次UI（避免频繁重渲染）
    frameCounterRef.current++;
    if (frameCounterRef.current % 10 === 0) {
      setReceivedFrequency(observedFreq);
      setDopplerFactor(factor);
      setSourcePosition(newSourcePosition);
      setFrequencyHistory([...frequencyHistoryRef.current]);
      setPositionHistory([...positionHistoryRef.current]);
    }

    // 绘制
    draw(ctx, newSourcePosition, updatedWavefronts, time);

    animationRef.current = requestAnimationFrame(animate);
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    currentSourcePos: number,
    currentWavefronts: Wavefront[],
    time: number
  ) => {
    // 绘制坐标轴
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();

    // 绘制波前
    currentWavefronts.forEach(wavefront => {
      ctx.beginPath();
      ctx.arc(wavefront.x, wavefront.y, wavefront.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 150, 255, ${Math.max(0.1, 0.8 - wavefront.radius / 400)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 绘制观察者
    const observerPixelX = observerX * scale;
    ctx.beginPath();
    ctx.arc(observerPixelX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#00CED1';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('观察者', observerPixelX, centerY - 20);

    // 绘制波源
    const sourcePixelX = currentSourcePos * scale;
    ctx.beginPath();
    ctx.arc(sourcePixelX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4444';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('波源', sourcePixelX, centerY - 20);

    // 绘制速度方向
    if (sourceSpeed > 0) {
      ctx.beginPath();
      ctx.moveTo(sourcePixelX, centerY + 25);
      ctx.lineTo(sourcePixelX + 20, centerY + 25);
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sourcePixelX + 20, centerY + 25);
      ctx.lineTo(sourcePixelX + 15, centerY + 20);
      ctx.lineTo(sourcePixelX + 15, centerY + 30);
      ctx.fillStyle = '#FF4444';
      ctx.fill();
    }
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">📡</div>
        <div>
          <h2 className="text-2xl font-bold">多普勒效应实验</h2>
          <p className="text-sm text-blue-300/80">波源运动与频率变化</p>
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
              <div className="text-3xl font-bold text-yellow-400">{receivedFrequency.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">接收频率 (Hz)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400">{dopplerFactor.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">多普勒因子</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-blue-400">{sourcePosition.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">波源位置 (m)</div>
            </div>
          </div>

          {/* 接收频率图表 */}
          <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">接收频率随时间变化</h3>
            <div className="h-32 bg-black/30 rounded flex items-center">
              <svg width="100%" height="100%" viewBox="0 0 560 128">
                <polyline
                  points={frequencyHistory.map((point, i) => {
                    const x = (i / 200) * 560;
                    const y = 64 - (point.frequency / frequency) * 30 + 32;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* 波源位置图表 */}
          <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">波源位置随时间变化</h3>
            <div className="h-32 bg-black/30 rounded flex items-center">
              <svg width="100%" height="100%" viewBox="0 0 560 128">
                <polyline
                  points={positionHistory.map((point, i) => {
                    const x = (i / 200) * 560;
                    const y = 64 - (point.position / 10) * 30 + 32;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold mb-4 text-blue-300">控制面板</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  发射频率: {frequency} Hz
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={frequency}
                  onChange={(e) => updateFrequency(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  波源速度: {sourceSpeed} m/s
                </label>
                <input
                  type="range"
                  min="0"
                  max="3.5"
                  step="0.1"
                  value={sourceSpeed}
                  onChange={(e) => updateSourceSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  波速: {waveSpeed} m/s
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={waveSpeed}
                  onChange={(e) => updateWaveSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  观察者X坐标: {observerX} m
                </label>
                <input
                  type="range"
                  min="-5"
                  max="10"
                  step="0.5"
                  value={observerX}
                  onChange={(e) => updateObserverX(Number(e.target.value))}
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
                onClick={() => {
                  setIsRunning(false);
                  resetSimulation();
                }}
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
              <p><strong>多普勒效应公式：</strong></p>
              <p className="font-mono text-blue-300">f' = f × (v + v₀)/(v - vₛ)</p>
              <p className="mt-2 text-blue-200/80">
                • f: 发射频率<br/>
                • f': 接收频率<br/>
                • v: 波速<br/>
                • v₀: 观察者速度<br/>
                • vₛ: 波源速度
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 图例说明</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-blue-200/80">波源 - 红色，向右运动</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-teal-400"></div>
                <span className="text-blue-200/80">观察者 - 青色，固定位置</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-400"></div>
                <span className="text-blue-200/80">波前 - 同心圆，随时间扩散</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
