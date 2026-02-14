'use client';

import { useState, useEffect, useRef } from 'react';

export default function WaveInterferenceSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 物理参数
  const [wavelength, setWavelength] = useState(60); // 波长
  const [sourceDistance, setSourceDistance] = useState(150); // 源间距
  const [frequency, setFrequency] = useState(1); // 频率
  const [phaseDifference, setPhaseDifference] = useState(0); // 相位差
  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(0);

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
  }, [isClient, isRunning, wavelength, sourceDistance, frequency, phaseDifference]);

  const animate = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 更新时间
    setTime(prev => prev + frequency * 0.05);

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // 计算两个波源位置
    const source1X = centerX - sourceDistance / 2;
    const source1Y = centerY;
    const source2X = centerX + sourceDistance / 2;
    const source2Y = centerY;

    // 计算波的参数
    const k = (2 * Math.PI) / wavelength; // 波数
    const omega = 2 * Math.PI * frequency; // 角频率

    // 绘制波干涉图样
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imageData.data;

    for (let x = 0; x < canvasWidth; x++) {
      for (let y = 0; y < canvasHeight; y++) {
        // 计算点到两个波源的距离
        const r1 = Math.sqrt(Math.pow(x - source1X, 2) + Math.pow(y - source1Y, 2));
        const r2 = Math.sqrt(Math.pow(x - source2X, 2) + Math.pow(y - source2Y, 2));

        // 计算两个波在该点的位移
        const displacement1 = Math.sin(k * r1 - omega * time);
        const displacement2 = Math.sin(k * r2 - omega * time + phaseDifference * Math.PI / 180);

        // 叠加
        const totalDisplacement = displacement1 + displacement2;

        // 根据叠加结果确定颜色
        const index = (y * canvasWidth + x) * 4;
        const intensity = (totalDisplacement + 2) / 4; // 归一化到 [0, 1]

        if (totalDisplacement > 0.5) {
          // 相长干涉（红色）
          data[index] = 239;     // R
          data[index + 1] = 68;  // G
          data[index + 2] = 68;  // B
          data[index + 3] = Math.floor(intensity * 255); // A
        } else if (totalDisplacement < -0.5) {
          // 相消干涉（蓝色）
          data[index] = 59;      // R
          data[index + 1] = 130; // G
          data[index + 2] = 246; // B
          data[index + 3] = Math.floor((1 - intensity) * 255); // A
        } else {
          // 中间状态（紫色）
          data[index] = 139;     // R
          data[index + 1] = 92;  // G
          data[index + 2] = 246; // B
          data[index + 3] = Math.floor(Math.abs(totalDisplacement) * 100); // A
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // 绘制波源
    drawSource(ctx, source1X, source1Y, 'S₁');
    drawSource(ctx, source2X, source2Y, 'S₂');

    // 绘制说明
    drawLegend(ctx);

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawSource = (ctx: CanvasRenderingContext2D, x: number, y: number, label: string) => {
    // 绘制波源
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制标签
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 15);
  };

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    // 绘制图例
    const legendX = 10;
    const legendY = 20;

    // 相长干涉
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(legendX, legendY, 20, 15);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('相长干涉（波峰+波峰）', legendX + 25, legendY + 12);

    // 相消干涉
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(legendX, legendY + 25, 20, 15);
    ctx.fillStyle = 'white';
    ctx.fillText('相消干涉（波峰+波谷）', legendX + 25, legendY + 37);

    // 中间状态
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(legendX, legendY + 50, 20, 15);
    ctx.fillStyle = 'white';
    ctx.fillText('中间状态', legendX + 25, legendY + 62);
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🔮</div>
        <div>
          <h2 className="text-2xl font-bold">波的干涉</h2>
          <p className="text-sm text-blue-300/80">双缝干涉与相干波叠加</p>
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
              <div className="text-3xl font-bold text-purple-400">{wavelength}</div>
              <div className="text-sm text-blue-300/80">波长 λ (px)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-blue-400">{sourceDistance}</div>
              <div className="text-sm text-blue-300/80">源间距 d (px)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400">{phaseDifference}°</div>
              <div className="text-sm text-blue-300/80">相位差 Δφ</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold mb-4 text-blue-300">控制面板</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  波长: {wavelength} px
                </label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={wavelength}
                  onChange={(e) => setWavelength(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>30px</span>
                  <span>100px</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  源间距: {sourceDistance} px
                </label>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={sourceDistance}
                  onChange={(e) => setSourceDistance(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>50px</span>
                  <span>250px</span>
                </div>
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

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  相位差: {phaseDifference}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={phaseDifference}
                  onChange={(e) => setPhaseDifference(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>0°</span>
                  <span>360°</span>
                </div>
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
              <p><strong>相长干涉条件：</strong></p>
              <p className="font-mono text-blue-300">Δr = nλ (n = 0, 1, 2, ...)</p>
              <p className="mt-2"><strong>相消干涉条件：</strong></p>
              <p className="font-mono text-blue-300">Δr = (n + ½)λ</p>
              <p className="mt-2"><strong>双缝干涉条纹间距：</strong></p>
              <p className="font-mono text-blue-300">Δx = Lλ/d</p>
              <p className="mt-2 text-blue-200/80">
                L: 屏到双缝距离<br/>
                d: 双缝间距<br/>
                λ: 波长
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 干涉现象</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-blue-200/80">红色区域：相长干涉（振幅最大）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-blue-200/80">蓝色区域：相消干涉（振幅最小）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-blue-200/80">紫色区域：中间状态</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
