'use client';

import { useState, useEffect, useRef } from 'react';

export default function ResonanceSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 历史记录
  const [history, setHistory] = useState<{ naturalFreq: number; drivingFreq: number; damping: number; mass: number }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 默认值
  const defaultValues = {
    naturalFreq: 2.0,
    drivingFreq: 2.0,
    damping: 0.1,
    mass: 1.0
  };

  // 物理参数
  const [naturalFreq, setNaturalFreq] = useState(defaultValues.naturalFreq); // 固有频率 Hz
  const [drivingFreq, setDrivingFreq] = useState(defaultValues.drivingFreq); // 驱动力频率 Hz
  const [damping, setDamping] = useState(defaultValues.damping); // 阻尼系数
  const [mass, setMass] = useState(defaultValues.mass); // 质量 kg
  const [isRunning, setIsRunning] = useState(false);

  // 图表类型
  type ChartType = 'line' | 'bar' | 'scatter';
  const [chartType, setChartType] = useState<ChartType>('line');

  // 实时数据
  const [displacement, setDisplacement] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [amplitudeHistory, setAmplitudeHistory] = useState<{ freq: number; amp: number }[]>([]);

  // 振荡状态
  const [time, setTime] = useState(0);
  const [velocity, setVelocity] = useState(0);

  const canvasWidth = 600;
  const canvasHeight = 400;
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
  }, [isRunning, naturalFreq, drivingFreq, damping, mass]);

  const saveToHistory = () => {
    const newState = { naturalFreq, drivingFreq, damping, mass };
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
      if (prevState) {
        setNaturalFreq(prevState.naturalFreq);
        setDrivingFreq(prevState.drivingFreq);
        setDamping(prevState.damping);
        setMass(prevState.mass);
        setHistoryIndex(prev => prev - 1);
        setIsRunning(false);
        resetSimulation();
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (nextState) {
        setNaturalFreq(nextState.naturalFreq);
        setDrivingFreq(nextState.drivingFreq);
        setDamping(nextState.damping);
        setMass(nextState.mass);
        setHistoryIndex(prev => prev + 1);
        setIsRunning(false);
        resetSimulation();
      }
    }
  };

  const updateNaturalFreq = (value: number) => {
    setNaturalFreq(value);
    setTimeout(saveToHistory, 0);
  };

  const updateDrivingFreq = (value: number) => {
    setDrivingFreq(value);
    setTimeout(saveToHistory, 0);
  };

  const updateDamping = (value: number) => {
    setDamping(value);
    setTimeout(saveToHistory, 0);
  };

  const updateMass = (value: number) => {
    setMass(value);
    setTimeout(saveToHistory, 0);
  };

  const resetSimulation = () => {
    setTime(0);
    setVelocity(0);
    setDisplacement(0);
    setAmplitude(0);
    setAmplitudeHistory([]);
  };

  const handleReset = () => {
    setNaturalFreq(defaultValues.naturalFreq);
    setDrivingFreq(defaultValues.drivingFreq);
    setDamping(defaultValues.damping);
    setMass(defaultValues.mass);
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
    const omega0 = 2 * Math.PI * naturalFreq; // 固有角频率
    const omegaD = 2 * Math.PI * drivingFreq; // 驱动力角频率

    // 计算驱动力
    const drivingForce = Math.sin(omegaD * time);

    // 简谐运动微分方程：m*x'' + c*x' + k*x = F*cos(ωt)
    // 其中 k = m*ω₀², c = 2*ζ*ω₀*m
    const k = mass * omega0 * omega0;
    const c = 2 * damping * omega0 * mass;

    // 计算加速度
    const acceleration = (drivingForce - c * velocity - k * displacement) / mass;

    // 更新速度和位移
    const newVelocity = velocity + acceleration * dt;
    const newDisplacement = displacement + newVelocity * dt;

    setVelocity(newVelocity);
    setDisplacement(newDisplacement);
    setTime(time + dt);

    // 记录振幅
    if (Math.abs(newDisplacement) > amplitude) {
      setAmplitude(Math.abs(newDisplacement));
    }

    // 记录振幅历史（用于绘制共振曲线）
    if (drivingFreq !== amplitudeHistory[amplitudeHistory.length - 1]?.freq) {
      setAmplitudeHistory(prev => {
        const newHistory = [...prev, { freq: drivingFreq, amp: amplitude }];
        if (newHistory.length > 100) newHistory.shift();
        return newHistory;
      });
    }

    // 绘制
    draw(canvas, ctx, newDisplacement, drivingForce);

    animationRef.current = requestAnimationFrame(animate);
  };

  const draw = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    currentDisplacement: number,
    currentDrivingForce: number
  ) => {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制平衡位置线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();

    // 绘制弹簧
    const springStartX = 100;
    const springEndX = canvasWidth - 100;
    const springLength = springEndX - springStartX;
    const springRestLength = springLength;
    const springCurrentLength = springRestLength + currentDisplacement * 2;

    ctx.beginPath();
    ctx.moveTo(springStartX, centerY);
    const numCoils = 15;
    for (let i = 0; i <= numCoils; i++) {
      const x = springStartX + (springCurrentLength / numCoils) * i;
      const amplitude = i % 2 === 0 ? 0 : (i % 4 === 1 ? 15 : -15);
      ctx.lineTo(x, centerY + amplitude);
    }
    ctx.lineTo(springEndX, centerY);
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制质量块
    const massSize = 40 + mass * 20;
    const massX = springEndX;
    const massY = centerY - massSize / 2;

    // 根据速度改变颜色
    const speedColor = Math.min(255, Math.abs(velocity) * 50);
    ctx.fillStyle = `rgb(${speedColor}, 100, 255 - speedColor})`;
    ctx.fillRect(massX - massSize / 2, massY, massSize, massSize);

    // 质量块边框
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(massX - massSize / 2, massY, massSize, massSize);

    // 驱动力箭头
    const arrowLength = currentDrivingForce * 30;
    if (Math.abs(arrowLength) > 5) {
      ctx.beginPath();
      ctx.moveTo(massX + massSize / 2, centerY);
      ctx.lineTo(massX + massSize / 2 + arrowLength, centerY);
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 箭头头部
      const arrowHead = arrowLength > 0 ? 10 : -10;
      ctx.beginPath();
      ctx.moveTo(massX + massSize / 2 + arrowLength, centerY);
      ctx.lineTo(massX + massSize / 2 + arrowLength - arrowHead, centerY - 5);
      ctx.lineTo(massX + massSize / 2 + arrowLength - arrowHead, centerY + 5);
      ctx.closePath();
      ctx.fillStyle = '#FF4444';
      ctx.fill();

      // 驱动力标签
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('F', massX + massSize / 2 + arrowLength, centerY - 15);
    }

    // 固定点
    ctx.beginPath();
    ctx.arc(springStartX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 显示信息
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`固有频率: ${naturalFreq.toFixed(2)} Hz`, 20, 30);
    ctx.fillText(`驱动力频率: ${drivingFreq.toFixed(2)} Hz`, 20, 55);
    ctx.fillText(`振幅: ${amplitude.toFixed(2)}`, 20, 80);

    // 共振指示
    const isResonance = Math.abs(drivingFreq - naturalFreq) < 0.2;
    if (isResonance) {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 共振！', canvasWidth / 2, 40);
    }
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl animate-float">🎸</div>
        <div>
          <h2 className="text-2xl font-bold">共振模拟</h2>
          <p className="text-sm text-blue-300/80">驱动力频率与系统固有频率匹配时的振幅放大</p>
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
              <div className="text-3xl font-bold text-blue-400">{naturalFreq.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">固有频率 (Hz)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-red-400">{drivingFreq.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">驱动力频率 (Hz)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400">{amplitude.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">振幅</div>
            </div>
          </div>

          {/* 共振曲线图 */}
          <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-300">振幅-频率特性曲线</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2 py-0.5 rounded text-xs transition-all ${
                    chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  折线
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-0.5 rounded text-xs transition-all ${
                    chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  柱状
                </button>
                <button
                  onClick={() => setChartType('scatter')}
                  className={`px-2 py-0.5 rounded text-xs transition-all ${
                    chartType === 'scatter' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  散点
                </button>
              </div>
            </div>
            <div className="h-32 bg-black/30 rounded flex items-center">
              <svg width="100%" height="100%" viewBox="0 0 560 128">
                {/* 理论共振曲线 - 始终显示 */}
                <path
                  d={Array.from({ length: 100 }, (_, i) => {
                    const freq = 0.5 + (i / 100) * 4;
                    const detuning = freq - naturalFreq;
                    const theoreticalAmp = 1 / Math.sqrt(Math.pow(detuning, 2) + Math.pow(damping * naturalFreq, 2));
                    const x = (freq / 5) * 560;
                    const y = 120 - theoreticalAmp * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#4A90E2"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {/* 实际测量点 - 根据图表类型渲染 */}
                {chartType === 'line' && amplitudeHistory.length > 1 && (
                  <polyline
                    points={amplitudeHistory.map((point) => {
                      const x = (point.freq / 5) * 560;
                      const y = 120 - point.amp * 30;
                      return `${x},${Math.max(0, y)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#FFA500"
                    strokeWidth="2"
                  />
                )}
                {chartType === 'bar' && amplitudeHistory.map((point, i) => {
                  const x = (point.freq / 5) * 560 - 3;
                  const barHeight = point.amp * 30;
                  const y = 120 - barHeight;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={Math.max(0, y)}
                      width={6}
                      height={Math.max(barHeight, 1)}
                      fill="#FFA500"
                      opacity={0.8}
                    />
                  );
                })}
                {chartType === 'scatter' && amplitudeHistory.map((point, i) => {
                  const x = (point.freq / 5) * 560;
                  const y = 120 - point.amp * 30;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={Math.max(0, y)}
                      r={5}
                      fill="#FFA500"
                      opacity={0.7}
                    />
                  );
                })}
                {/* 数据点标记 */}
                {amplitudeHistory.map((point, i) => {
                  const x = (point.freq / 5) * 560;
                  const y = 120 - point.amp * 30;
                  return (
                    <circle
                      key={`marker-${i}`}
                      cx={x}
                      cy={Math.max(0, y)}
                      r={3}
                      fill="#FFA500"
                    />
                  );
                })}
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
                  固有频率: {naturalFreq} Hz
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  value={naturalFreq}
                  onChange={(e) => updateNaturalFreq(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  驱动力频率: {drivingFreq} Hz
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  value={drivingFreq}
                  onChange={(e) => updateDrivingFreq(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  阻尼系数: {damping}
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={damping}
                  onChange={(e) => updateDamping(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  质量: {mass} kg
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={mass}
                  onChange={(e) => updateMass(Number(e.target.value))}
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
              <p><strong>共振条件：</strong></p>
              <p>• 驱动力频率 = 固有频率</p>
              <p>• 振幅达到最大值</p>
              <p className="mt-2"><strong>固有频率公式：</strong></p>
              <p className="font-mono text-blue-300">f₀ = ½π·√(k/m)</p>
              <p>• k: 劲度系数, m: 质量</p>
              <p className="mt-2"><strong>应用：</strong></p>
              <p>• 乐器发声</p>
              <p>• 桥梁共振防护</p>
              <p>• 磁共振成像</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 图例说明</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400"></div>
                <span className="text-blue-200/80">弹簧 - 储存弹性势能</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-red-400"></div>
                <span className="text-blue-200/80">质量块 - 颜色表示速度</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500"></div>
                <span className="text-blue-200/80">红色箭头 - 驱动力方向</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 border-2 border-blue-400 border-dashed"></div>
                <span className="text-blue-200/80">蓝色虚线 - 理论共振曲线</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
