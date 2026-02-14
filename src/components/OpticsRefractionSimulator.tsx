'use client';

import { useState, useEffect, useRef } from 'react';

interface Ray {
  x: number;
  y: number;
  angle: number;
  intensity: number;
}

export default function OpticsRefractionSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);

  // 历史记录（用于撤销/重做）
  const [history, setHistory] = useState<{ n1: number; n2: number; incidentAngle: number }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 默认值
  const defaultValues = {
    n1: 1.0,
    n2: 1.5,
    incidentAngle: 30
  };

  // 物理参数
  const [n1, setN1] = useState(defaultValues.n1); // 入射介质折射率
  const [n2, setN2] = useState(defaultValues.n2); // 折射介质折射率
  const [incidentAngle, setIncidentAngle] = useState(defaultValues.incidentAngle); // 入射角度

  const canvasWidth = 600;
  const canvasHeight = 400;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  useEffect(() => {
    setIsClient(true);
    saveToHistory();
  }, []);

  useEffect(() => {
    if (isClient) {
      draw();
    }
  }, [n1, n2, incidentAngle, isClient]);

  const calculateRefraction = () => {
    const theta1 = (incidentAngle * Math.PI) / 180;
    
    // 斯涅尔定律: n1 * sin(θ1) = n2 * sin(θ2)
    // sin(θ2) = (n1 / n2) * sin(θ1)
    const sinTheta2 = (n1 / n2) * Math.sin(theta1);
    
    // 检查是否发生全反射
    const isTotalReflection = Math.abs(sinTheta2) > 1;

    let refractionAngle = 0;
    if (!isTotalReflection) {
      refractionAngle = Math.asin(sinTheta2);
    }

    return {
      theta1,
      theta2: refractionAngle,
      isTotalReflection,
      criticalAngle: n1 > n2 ? Math.asin(n2 / n1) * (180 / Math.PI) : null
    };
  };

  const draw = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { theta1, theta2, isTotalReflection, criticalAngle } = calculateRefraction();

    // 绘制介质背景
    // 上方介质（n1）
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(0, 0, canvasWidth, centerY);
    
    // 下方介质（n2）
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.fillRect(0, centerY, canvasWidth, centerY);

    // 绘制界面
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制法线
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvasHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // 计算光线长度
    const rayLength = 180;

    // 入射光
    const incidentX = centerX - rayLength * Math.sin(theta1);
    const incidentY = centerY - rayLength * Math.cos(theta1);

    ctx.beginPath();
    ctx.moveTo(incidentX, incidentY);
    ctx.lineTo(centerX, centerY);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制箭头（入射光）
    const arrowX = centerX - (rayLength / 2) * Math.sin(theta1);
    const arrowY = centerY - (rayLength / 2) * Math.cos(theta1);
    drawArrow(ctx, incidentX, incidentY, arrowX, arrowY, '#FBBF24');

    // 折射光或反射光
    if (isTotalReflection) {
      // 全反射 - 绘制反射光
      const reflectX = centerX + rayLength * Math.sin(theta1);
      const reflectY = centerY - rayLength * Math.cos(theta1);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(reflectX, reflectY);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 反射箭头
      const reflectArrowX = centerX + (rayLength / 2) * Math.sin(theta1);
      const reflectArrowY = centerY - (rayLength / 2) * Math.cos(theta1);
      drawArrow(ctx, centerX, centerY, reflectArrowX, reflectArrowY, '#EF4444');
    } else {
      // 折射光
      const refractX = centerX + rayLength * Math.sin(theta2);
      const refractY = centerY + rayLength * Math.cos(theta2);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(refractX, refractY);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 折射箭头
      const refractArrowX = centerX + (rayLength / 2) * Math.sin(theta2);
      const refractArrowY = centerY + (rayLength / 2) * Math.cos(theta2);
      drawArrow(ctx, centerX, centerY, refractArrowX, refractArrowY, '#10B981');
    }

    // 绘制角度标注
    drawAngleArc(ctx, centerX, centerY, -theta1, 0, 50, 'θ₁', '#FBBF24');
    if (!isTotalReflection) {
      drawAngleArc(ctx, centerX, centerY, Math.PI - theta2, Math.PI, 50, 'θ₂', '#10B981');
    }

    // 绘制介质标签
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`介质1 (n₁ = ${n1.toFixed(2)})`, 10, 30);
    
    ctx.fillStyle = '#10B981';
    ctx.fillText(`介质2 (n₂ = ${n2.toFixed(2)})`, 10, centerY + 30);

    // 全反射警告
    if (isTotalReflection) {
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('⚠️ 全反射!', centerX - 50, centerY - 30);
    }

    // 临界角提示
    if (criticalAngle !== null && n1 > n2) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = '14px Arial';
      ctx.fillText(`临界角 = ${criticalAngle.toFixed(1)}°`, centerX - 60, centerY + 100);
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawAngleArc = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    startAngle: number,
    endAngle: number,
    radius: number,
    label: string,
    color: string
  ) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 标签
    const midAngle = (startAngle + endAngle) / 2;
    const labelX = x + (radius + 20) * Math.cos(midAngle);
    const labelY = y + (radius + 20) * Math.sin(midAngle);
    
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, labelX, labelY);
  };

  // 历史记录管理
  const saveToHistory = () => {
    const newState = { n1, n2, incidentAngle };
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
      setN1(prevState.n1);
      setN2(prevState.n2);
      setIncidentAngle(prevState.incidentAngle);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setN1(nextState.n1);
      setN2(nextState.n2);
      setIncidentAngle(nextState.incidentAngle);
      setHistoryIndex(prev => prev + 1);
    }
  };

  // 更新参数并保存到历史记录
  const updateN1 = (value: number) => {
    setN1(value);
    setTimeout(saveToHistory, 0);
  };

  const updateN2 = (value: number) => {
    setN2(value);
    setTimeout(saveToHistory, 0);
  };

  const updateIncidentAngle = (value: number) => {
    setIncidentAngle(value);
    setTimeout(saveToHistory, 0);
  };

  const handleReset = () => {
    setN1(defaultValues.n1);
    setN2(defaultValues.n2);
    setIncidentAngle(defaultValues.incidentAngle);
    saveToHistory();
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  const { theta2, criticalAngle, isTotalReflection } = calculateRefraction();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">💡</div>
        <div>
          <h2 className="text-2xl font-bold">光的折射与全反射</h2>
          <p className="text-sm text-blue-300/80">斯涅尔定律与全反射现象</p>
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

          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <div className="text-2xl font-bold text-yellow-400">{incidentAngle.toFixed(1)}°</div>
              <div className="text-xs text-blue-300/80">入射角 θ₁</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <div className="text-2xl font-bold text-green-400">
                {isTotalReflection ? '-' : (theta2 * 180 / Math.PI).toFixed(1)}°
              </div>
              <div className="text-xs text-blue-300/80">折射角 θ₂</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <div className="text-2xl font-bold text-blue-400">{n1.toFixed(2)}</div>
              <div className="text-xs text-blue-300/80">折射率 n₁</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <div className="text-2xl font-bold text-green-400">{n2.toFixed(2)}</div>
              <div className="text-xs text-blue-300/80">折射率 n₂</div>
            </div>
          </div>

          {criticalAngle && (
            <div className="mt-4 bg-orange-900/30 rounded-lg p-4 border border-orange-500/30">
              <div className="flex items-center gap-2 text-orange-400">
                <span className="text-xl">📐</span>
                <span className="font-semibold">临界角 = {criticalAngle.toFixed(2)}°</span>
              </div>
              <p className="text-sm text-orange-300/80 mt-2">
                当入射角大于 {criticalAngle.toFixed(2)}° 时，发生全反射
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold mb-4 text-blue-300">控制面板</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  入射介质折射率 (n₁): {n1.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.05"
                  value={n1}
                  onChange={(e) => updateN1(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>1.0 (空气)</span>
                  <span>2.5 (钻石)</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  折射介质折射率 (n₂): {n2.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.05"
                  value={n2}
                  onChange={(e) => updateN2(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>1.0 (空气)</span>
                  <span>2.5 (钻石)</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  入射角度: {incidentAngle}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={incidentAngle}
                  onChange={(e) => updateIncidentAngle(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>0°</span>
                  <span>90°</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => { setN1(1.0); setN2(1.5); setIncidentAngle(30); }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors text-sm"
              >
                🌊 空气 → 玻璃
              </button>
              <button
                onClick={() => { setN1(1.5); setN2(1.33); setIncidentAngle(30); }}
                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors text-sm"
              >
                💧 玻璃 → 水
              </button>
              <button
                onClick={() => { setN1(1.5); setN2(1.0); setIncidentAngle(45); }}
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors text-sm"
              >
                ✨ 玻璃 → 空气（全反射）
              </button>
            </div>

            {/* 撤销/重做/重置 */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleReset}
                className="w-full py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors text-sm"
              >
                🔄 重置为默认值
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-sm"
                >
                  ↩️ 撤回
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-sm"
                >
                  ↪️ 回撤
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">💡 知识要点</h4>
            <div className="space-y-2 text-sm text-blue-100/80">
              <p><strong>斯涅尔定律：</strong></p>
              <p className="font-mono text-blue-300">n₁sinθ₁ = n₂sinθ₂</p>
              <p className="mt-2"><strong>全反射条件：</strong></p>
              <ul className="list-disc list-inside text-blue-200/80">
                <li>光从光密介质射向光疏介质</li>
                <li>入射角 ≥ 临界角</li>
                <li>临界角: C = arcsin(n₂/n₁)</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">📊 常见折射率</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-blue-200/80">
                <span>空气</span>
                <span className="text-blue-300">1.0003</span>
              </div>
              <div className="flex justify-between text-blue-200/80">
                <span>水</span>
                <span className="text-blue-300">1.33</span>
              </div>
              <div className="flex justify-between text-blue-200/80">
                <span>玻璃</span>
                <span className="text-blue-300">1.5</span>
              </div>
              <div className="flex justify-between text-blue-200/80">
                <span>钻石</span>
                <span className="text-blue-300">2.42</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
