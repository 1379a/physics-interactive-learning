'use client';

import { useState, useEffect, useRef } from 'react';

export default function WaveInterference2DSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 历史记录
  const [history, setHistory] = useState<{ frequency: number; amplitude: number; waveSpeed: number; sourceDistance: number; displayMode: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 默认值
  const defaultValues = {
    frequency: 2.0,
    amplitude: 1.0,
    waveSpeed: 10.0,
    sourceDistance: 4.0,
    displayMode: 'dynamic'
  };

  // 物理参数
  const [frequency, setFrequency] = useState(defaultValues.frequency); // 频率 Hz
  const [amplitude, setAmplitude] = useState(defaultValues.amplitude); // 振幅 m
  const [waveSpeed, setWaveSpeed] = useState(defaultValues.waveSpeed); // 波速 m/s
  const [sourceDistance, setSourceDistance] = useState(defaultValues.sourceDistance); // 波源间距 m
  const [displayMode, setDisplayMode] = useState(defaultValues.displayMode); // 显示模式
  const [isRunning, setIsRunning] = useState(false);

  // 实时数据
  const [time, setTime] = useState(0);
  const [intensityData, setIntensityData] = useState<number[]>([]);

  const canvasWidth = 600;
  const canvasHeight = 400;
  const scale = 50; // 像素/米
  const centerY = canvasHeight / 2;
  const centerX = canvasWidth / 2;

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
  }, [isRunning, frequency, amplitude, waveSpeed, sourceDistance, displayMode]);

  const saveToHistory = () => {
    const newState = { frequency, amplitude, waveSpeed, sourceDistance, displayMode };
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
      setWaveSpeed(prevState.waveSpeed);
      setSourceDistance(prevState.sourceDistance);
      setDisplayMode(prevState.displayMode);
      setHistoryIndex(prev => prev - 1);
      setIsRunning(false);
      resetSimulation();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setFrequency(nextState.frequency);
      setAmplitude(nextState.amplitude);
      setWaveSpeed(nextState.waveSpeed);
      setSourceDistance(nextState.sourceDistance);
      setDisplayMode(nextState.displayMode);
      setHistoryIndex(prev => prev + 1);
      setIsRunning(false);
      resetSimulation();
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

  const updateWaveSpeed = (value: number) => {
    setWaveSpeed(value);
    setTimeout(saveToHistory, 0);
  };

  const updateSourceDistance = (value: number) => {
    setSourceDistance(value);
    setTimeout(saveToHistory, 0);
  };

  const updateDisplayMode = (mode: string) => {
    setDisplayMode(mode);
    setTimeout(saveToHistory, 0);
  };

  const resetSimulation = () => {
    setTime(0);
    setIntensityData([]);
  };

  const handleReset = () => {
    setFrequency(defaultValues.frequency);
    setAmplitude(defaultValues.amplitude);
    setWaveSpeed(defaultValues.waveSpeed);
    setSourceDistance(defaultValues.sourceDistance);
    setDisplayMode(defaultValues.displayMode);
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
    const currentTime = timestamp / 1000;
    setTime(currentTime);

    // 计算波长
    const wavelength = waveSpeed / frequency;
    const k = (2 * Math.PI) / wavelength; // 波数
    const omega = 2 * Math.PI * frequency; // 角频率

    // 波源位置
    const source1X = centerX - (sourceDistance / 2) * scale;
    const source2X = centerX + (sourceDistance / 2) * scale;
    const source1Y = centerY;
    const source2Y = centerY;

    // 计算中轴线强度分布
    const intensityArray: number[] = [];
    for (let x = 0; x < canvasWidth; x += 2) {
      const r1 = Math.sqrt(Math.pow(x - source1X, 2));
      const r2 = Math.sqrt(Math.pow(x - source2X, 2));
      const phase1 = k * r1 - omega * currentTime;
      const phase2 = k * r2 - omega * currentTime;
      const y1 = amplitude * Math.cos(phase1);
      const y2 = amplitude * Math.cos(phase2);
      const yTotal = y1 + y2;
      const intensity = Math.pow(yTotal, 2) / Math.pow(2 * amplitude, 2);
      intensityArray.push(intensity);
    }
    setIntensityData(intensityArray);

    // 绘制二维干涉图样
    draw(ctx, canvas, currentTime, k, omega, source1X, source1Y, source2X, source2Y);

    animationRef.current = requestAnimationFrame(animate);
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentTime: number,
    k: number,
    omega: number,
    source1X: number,
    source1Y: number,
    source2X: number,
    source2Y: number
  ) => {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 创建图像数据
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imageData.data;

    // 降采样以提高性能
    const step = 2;
    for (let y = 0; y < canvasHeight; y += step) {
      for (let x = 0; x < canvasWidth; x += step) {
        // 计算到两个波源的距离
        const r1 = Math.sqrt(Math.pow(x - source1X, 2) + Math.pow(y - source1Y, 2)) / scale;
        const r2 = Math.sqrt(Math.pow(x - source2X, 2) + Math.pow(y - source2Y, 2)) / scale;

        // 计算相位
        const phase1 = k * r1 - omega * currentTime;
        const phase2 = k * r2 - omega * currentTime;

        // 计算波函数
        const y1 = amplitude * Math.cos(phase1);
        const y2 = amplitude * Math.cos(phase2);
        const yTotal = y1 + y2;

        // 计算强度（归一化）
        const intensity = Math.pow(yTotal, 2) / Math.pow(2 * amplitude, 2);

        // 根据强度设置颜色
        let r = 0, g = 0, b = 0;
        if (displayMode === 'dynamic') {
          // 动态波纹模式：蓝色为波谷，红色为波峰
          const normalizedValue = (yTotal / (2 * amplitude) + 1) / 2; // 0-1
          r = Math.floor(normalizedValue * 255);
          b = Math.floor((1 - normalizedValue) * 255);
          g = Math.floor(50 + intensity * 100);
        } else if (displayMode === 'intensity') {
          // 强度模式：强度越大越亮
          const brightness = Math.floor(intensity * 255);
          r = brightness;
          g = brightness;
          b = brightness;
        }

        // 填充像素
        for (let dy = 0; dy < step && y + dy < canvasHeight; dy++) {
          for (let dx = 0; dx < step && x + dx < canvasWidth; dx++) {
            const index = ((y + dy) * canvasWidth + (x + dx)) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // 绘制波源
    ctx.beginPath();
    ctx.arc(source1X, source1Y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4444';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(source2X, source2Y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4444';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制波源标签
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('S₁', source1X, source1Y - 15);
    ctx.fillText('S₂', source2X, source2Y - 15);
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🌊</div>
        <div>
          <h2 className="text-2xl font-bold">波的二维干涉实验</h2>
          <p className="text-sm text-blue-300/80">观察两个点波源在二维平面上的干涉现象</p>
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
              <div className="text-3xl font-bold text-blue-400">{frequency.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">频率 (Hz)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400">{(waveSpeed / frequency).toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">波长 (m)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-yellow-400">{sourceDistance.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">波源间距 (m)</div>
            </div>
          </div>

          {/* 中轴线强度分布图 */}
          <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">中轴线强度分布</h3>
            <div className="h-32 bg-black/30 rounded flex items-center">
              <svg width="100%" height="100%" viewBox="0 0 560 128">
                <path
                  d={intensityData.map((intensity, i) => {
                    const x = (i / intensityData.length) * 560;
                    const y = 128 - intensity * 120;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#4A90E2"
                  strokeWidth="2"
                />
                <path
                  d={intensityData.map((intensity, i) => {
                    const x = (i / intensityData.length) * 560;
                    return `${i === 0 ? 'M' : 'L'} ${x} 128`;
                  }).join(' ') + ' ' + intensityData.map((intensity, i) => {
                    const x = (intensityData.length - 1 - i) / intensityData.length * 560;
                    const y = 128 - intensity * 120;
                    return `L ${x} ${y}`;
                  }).join(' ') + ' Z'}
                  fill="rgba(74, 144, 226, 0.3)"
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
                  波源频率: {frequency} Hz
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
                  振幅: {amplitude} m
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={amplitude}
                  onChange={(e) => updateAmplitude(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  波速: {waveSpeed} m/s
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={waveSpeed}
                  onChange={(e) => updateWaveSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  波源间距: {sourceDistance} m
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={sourceDistance}
                  onChange={(e) => updateSourceDistance(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  显示模式
                </label>
                <select
                  value={displayMode}
                  onChange={(e) => updateDisplayMode(e.target.value)}
                  className="w-full h-10 bg-blue-900 rounded-lg px-3 text-white"
                >
                  <option value="dynamic">动态波纹</option>
                  <option value="intensity">强度分布</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                {isRunning ? '⏸️ 暂停' : '▶️ 开始'}
              </button>
              <button
                onClick={() => setIsRunning(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                🔄 重置
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
              <p><strong>干涉条件：</strong></p>
              <p>• 频率相同</p>
              <p>• 相位差恒定</p>
              <p>• 振动方向相同</p>
              <p className="mt-2"><strong>加强条件：</strong></p>
              <p className="font-mono text-blue-300">Δr = nλ (n = 0, 1, 2, ...)</p>
              <p className="mt-2"><strong>减弱条件：</strong></p>
              <p className="font-mono text-blue-300">Δr = (n + ½)λ (n = 0, 1, 2, ...)</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 图例说明</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-blue-200/80">S₁、S₂ - 波源位置</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-red-500"></div>
                <span className="text-blue-200/80">红色区域 - 波峰（正最大值）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-900 to-blue-500"></div>
                <span className="text-blue-200/80">蓝色区域 - 波谷（负最大值）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/30"></div>
                <span className="text-blue-200/80">亮色区域 - 相长干涉（加强）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black"></div>
                <span className="text-blue-200/80">暗色区域 - 相消干涉（减弱）</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
