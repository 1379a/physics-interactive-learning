'use client';

import { useState, useEffect, useRef } from 'react';

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function IdealGasSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // 使用 ref 存储分子位置，避免无限循环
  const moleculesRef = useRef<Molecule[]>([]);

  // 历史记录（用于撤销/重做）
  const [history, setHistory] = useState<{ temperature: number; volume: number; moleculeCount: number }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 默认值
  const defaultValues = {
    temperature: 300,
    volume: 50,
    moleculeCount: 100
  };

  // 物理参数
  const [temperature, setTemperature] = useState(defaultValues.temperature); // 温度 K
  const [volume, setVolume] = useState(defaultValues.volume); // 容器大小 %
  const [moleculeCount, setMoleculeCount] = useState(defaultValues.moleculeCount); // 分子数量
  const [pressure, setPressure] = useState(0); // 计算出的压力
  const [isRunning, setIsRunning] = useState(true);

  const containerWidth = 600;
  const containerHeight = 400;

  // 初始化时保存初始状态
  useEffect(() => {
    setIsClient(true);
    initMolecules();
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
  }, [isRunning, volume, temperature, moleculeCount]);

  const initMolecules = () => {
    const newMolecules: Molecule[] = [];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    for (let i = 0; i < moleculeCount; i++) {
      const speed = Math.sqrt(temperature / 300) * (2 + Math.random() * 2);
      const angle = Math.random() * Math.PI * 2;

      newMolecules.push({
        x: 50 + Math.random() * (containerWidth - 100),
        y: 50 + Math.random() * (containerHeight - 100),
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
        radius: 3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    moleculesRef.current = newMolecules;
  };

  const animate = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 计算容器边界
    const rightBoundary = containerWidth - (100 - volume) * 2;

    // 绘制容器
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, rightBoundary - 50, containerHeight - 100);

    // 绘制可移动活塞
    ctx.fillStyle = '#93C5FD';
    ctx.fillRect(rightBoundary - 10, 48, 20, containerHeight - 96);

    // 计算当前体积（比例）
    const currentVolume = (rightBoundary - 50) / (containerWidth - 100);

    // 更新分子位置
    const updatedMolecules = moleculesRef.current.map(mol => {
      let newX = mol.x;
      let newY = mol.y;
      let newVx = mol.vx;
      let newVy = mol.vy;

      // 根据温度调整速度
      const speedFactor = Math.sqrt(temperature / 300);

      // 更新位置
      newX += newVx * speedFactor;
      newY += newVy * speedFactor;

      // 边界碰撞检测
      if (newX - mol.radius <= 50) {
        newX = 50 + mol.radius;
        newVx = -newVx;
      }
      if (newX + mol.radius >= rightBoundary - 10) {
        newX = rightBoundary - 10 - mol.radius;
        newVx = -newVx;
      }
      if (newY - mol.radius <= 50) {
        newY = 50 + mol.radius;
        newVy = -newVy;
      }
      if (newY + mol.radius >= containerHeight - 50) {
        newY = containerHeight - 50 - mol.radius;
        newVy = -newVy;
      }

      // 绘制分子
      ctx.beginPath();
      ctx.arc(newX, newY, mol.radius, 0, Math.PI * 2);
      ctx.fillStyle = mol.color;
      ctx.fill();

      return { ...mol, x: newX, y: newY, vx: newVx, vy: newVy };
    });

    // 计算压力（理想气体状态方程 PV = nRT）
    // P = nRT / V
    const n = moleculeCount; // 假设每个分子代表1mol
    const R = 0.0821; // 气体常数
    const V = currentVolume; // 体积比例
    const calculatedPressure = (n * R * temperature) / (V * 10);
    setPressure(calculatedPressure);

    // 更新 ref 中的分子位置
    moleculesRef.current = updatedMolecules;

    // 显示温度信息
    ctx.fillStyle = '#60A5FA';
    ctx.font = '14px Arial';
    ctx.fillText(`分子速度: ~${(Math.sqrt(temperature / 300) * 3).toFixed(1)}`, 50, 30);

    animationRef.current = requestAnimationFrame(animate);
  };

  // 历史记录管理
  const saveToHistory = () => {
    const newState = {
      temperature,
      volume,
      moleculeCount
    };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // 限制历史记录长度
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
        setTemperature(prevState.temperature);
        setVolume(prevState.volume);
        setMoleculeCount(prevState.moleculeCount);
        setHistoryIndex(prev => prev - 1);
        initMolecules();
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (nextState) {
        setTemperature(nextState.temperature);
        setVolume(nextState.volume);
        setMoleculeCount(nextState.moleculeCount);
        setHistoryIndex(prev => prev + 1);
        initMolecules();
      }
    }
  };

  // 更新参数并保存到历史记录
  const updateTemperature = (value: number) => {
    setTemperature(value);
    setTimeout(saveToHistory, 0);
  };

  const updateVolume = (value: number) => {
    setVolume(value);
    setTimeout(saveToHistory, 0);
  };

  const updateMoleculeCount = (value: number) => {
    setMoleculeCount(value);
    initMolecules();
    setTimeout(saveToHistory, 0);
  };

  const handleReset = () => {
    setTemperature(defaultValues.temperature);
    setVolume(defaultValues.volume);
    setMoleculeCount(defaultValues.moleculeCount);
    initMolecules();
    saveToHistory();
  };

  if (!isClient) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl animate-float">🌡️</div>
        <div>
          <h2 className="text-2xl font-bold">理想气体分子运动</h2>
          <p className="text-sm text-blue-300/80">观察气体分子的布朗运动</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 card-tech">
            <canvas 
              ref={canvasRef} 
              width={containerWidth} 
              height={containerHeight}
              className="w-full rounded-lg bg-black/30"
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center card-tech">
              <div className="text-3xl font-bold text-red-400">{temperature.toFixed(0)}</div>
              <div className="text-sm text-blue-300/80">温度 (K)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center card-tech">
              <div className="text-3xl font-bold text-green-400">{pressure.toFixed(2)}</div>
              <div className="text-sm text-blue-300/80">压力 (atm)</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center card-tech">
              <div className="text-3xl font-bold text-blue-400">{moleculeCount}</div>
              <div className="text-sm text-blue-300/80">分子数</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 card-tech">
            <h3 className="font-semibold mb-4 text-blue-300">控制面板</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  温度: {temperature} K
                </label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  value={temperature}
                  onChange={(e) => updateTemperature(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>100K</span>
                  <span>600K</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  容器体积: {volume}%
                </label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={volume}
                  onChange={(e) => updateVolume(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>30%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200/80 mb-2 block">
                  分子数量: {moleculeCount}
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={moleculeCount}
                  onChange={(e) => updateMoleculeCount(Number(e.target.value))}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                  <span>20</span>
                  <span>200</span>
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
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                🔄 重置
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

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 card-tech">
            <h4 className="font-semibold mb-3 text-blue-300">💡 知识要点</h4>
            <div className="space-y-2 text-sm text-blue-100/80">
              <p><strong>理想气体状态方程：</strong></p>
              <p className="font-mono text-blue-300">PV = nRT</p>
              <p className="mt-2">• 温度升高 → 分子运动加快</p>
              <p>• 体积减小 → 压力增大</p>
              <p>• 分子数增加 → 压力增大</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 card-tech">
            <h4 className="font-semibold mb-3 text-blue-300">📊 实时计算</h4>
            <div className="space-y-2 text-sm text-blue-100/80">
              <div className="flex justify-between">
                <span>动能 (E_k):</span>
                <span className="text-blue-300">{(1.5 * 8.314 * temperature).toFixed(1)} J/mol</span>
              </div>
              <div className="flex justify-between">
                <span>分子均方根速度:</span>
                <span className="text-blue-300">{(Math.sqrt(3 * 8.314 * temperature / 0.029)).toFixed(1)} m/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
