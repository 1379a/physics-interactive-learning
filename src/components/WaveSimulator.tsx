'use client';

import { useState, useEffect, useRef } from 'react';

export default function WaveSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 物理参数
  const [amplitude, setAmplitude] = useState(50); // 振幅
  const [wavelength, setWavelength] = useState(100); // 波长
  const [frequency, setFrequency] = useState(1); // 频率
  const [waveType, setWaveType] = useState<'transverse' | 'longitudinal'>('transverse');
  const [isRunning, setIsRunning] = useState(true);
  const [phase, setPhase] = useState(0);

  const canvasWidth = 600;
  const canvasHeight = 400;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isRunning) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient, isRunning, amplitude, wavelength, frequency, waveType]);

  const animate = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 更新相位
    setPhase(prev => (prev + frequency * 0.05) % (2 * Math.PI));

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (waveType === 'transverse') {
      drawTransverseWave(ctx, phase);
    } else {
      drawLongitudinalWave(ctx, phase);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawTransverseWave = (ctx: CanvasRenderingContext2D, currentPhase: number) => {
    const centerY = canvasHeight / 2;

    // 绘制参考线
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制波形
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x++) {
      const k = (2 * Math.PI) / wavelength; // 波数
      const y = centerY + amplitude * Math.sin(k * x - currentPhase);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制粒子
    const particleCount = 20;
    const spacing = canvasWidth / particleCount;
    
    for (let i = 0; i <= particleCount; i++) {
      const x = i * spacing;
      const k = (2 * Math.PI) / wavelength;
      const y = centerY + amplitude * Math.sin(k * x - currentPhase);

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制平衡位置
      ctx.beginPath();
      ctx.arc(x, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }

    // 标注波长
    ctx.fillStyle = '#60A5FA';
    ctx.font = '14px Arial';
    ctx.fillText(`波长 λ = ${wavelength}px`, 10, 30);
    ctx.fillText(`振幅 A = ${amplitude}px`, 10, 50);
  };

  const drawLongitudinalWave = (ctx: CanvasRenderingContext2D, currentPhase: number) => {
    const centerY = canvasHeight / 2;
    const particleCount = 30;
    const spacing = canvasWidth / particleCount;
    
    // 绘制参考线
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制纵波粒子
    for (let i = 0; i <= particleCount; i++) {
      const equilibriumX = i * spacing;
      const k = (2 * Math.PI) / wavelength;
      const displacement = amplitude * Math.sin(k * equilibriumX - currentPhase);
      const x = equilibriumX + displacement;

      // 绘制粒子（用竖线表示）
      ctx.beginPath();
      ctx.moveTo(x, centerY - 20);
      ctx.lineTo(x, centerY + 20);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 绘制平衡位置
      ctx.beginPath();
      ctx.moveTo(equilibriumX, centerY - 5);
      ctx.lineTo(equilibriumX, centerY + 5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 标注密部和疏部
    ctx.fillStyle = '#60A5FA';
    ctx.font = '14px Arial';
    ctx.fillText(`波长 λ = ${wavelength}px`, 10, 30);
    ctx.fillText(`振幅 A = ${amplitude}px`, 10, 50);
    ctx.fillText('纵波：粒子沿波传播方向振动', 10, 70);

    // 标注密部
    ctx.fillStyle = '#EF4444';
    ctx.font = '12px Arial';
    ctx.fillText('密部', 10, canvasHeight - 30);
    
    // 标注疏部
    ctx.fillStyle = '#10B981';
    ctx.fillText('疏部', canvasWidth - 40, canvasHeight - 30);
  };

  const waveSpeed = wavelength * frequency;

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🌊</div>
        <div>
          <h2 className="text-2xl font-bold">机械波传播</h2>
          <p className="text-sm text-blue-300/80">横波与纵波的传播特性</p>
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
              <div className="text-3xl font-bold text-purple-400">{waveSpeed.toFixed(1)}</div>
              <div className="text-sm text-blue-300/80">波速 (px/s)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-blue-400">{wavelength}</div>
              <div className="text-sm text-blue-300/80">波长 (λ)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400">{frequency}</div>
              <div className="text-sm text-blue-300/80">频率 (Hz)</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold mb-4 text-blue-300">控制面板</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">波形类型</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWaveType('transverse')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      waveType === 'transverse' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    ↕️ 横波
                  </button>
                  <button
                    onClick={() => setWaveType('longitudinal')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      waveType === 'longitudinal' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    ↔️ 纵波
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  振幅: {amplitude} px
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={amplitude}
                  onChange={(e) => setAmplitude(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  波长: {wavelength} px
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={wavelength}
                  onChange={(e) => setWavelength(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  频率: {frequency} Hz
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                {isRunning ? '⏸️ 暂停' : '▶️ 开始'}
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">💡 知识要点</h4>
            <div className="space-y-2 text-sm text-blue-100/80">
              <p><strong>波速公式：</strong></p>
              <p className="font-mono text-blue-300">v = λf</p>
              <p className="mt-2"><strong>横波：</strong></p>
              <ul className="list-disc list-inside text-blue-200/80">
                <li>粒子振动方向与波传播方向垂直</li>
                <li>形成波峰和波谷</li>
                <li>如：绳波、电磁波</li>
              </ul>
              <p className="mt-2"><strong>纵波：</strong></p>
              <ul className="list-disc list-inside text-blue-200/80">
                <li>粒子振动方向与波传播方向平行</li>
                <li>形成密部和疏部</li>
                <li>如：声波</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 物理量说明</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-blue-200/80">
                <span>λ (波长)</span>
                <span className="text-blue-300">相邻波峰间距</span>
              </div>
              <div className="flex justify-between text-blue-200/80">
                <span>f (频率)</span>
                <span className="text-blue-300">每秒振动次数</span>
              </div>
              <div className="flex justify-between text-blue-200/80">
                <span>A (振幅)</span>
                <span className="text-blue-300">最大位移</span>
              </div>
              <div className="flex justify-between text-blue-200/80">
                <span>v (波速)</span>
                <span className="text-blue-300">波的传播速度</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
