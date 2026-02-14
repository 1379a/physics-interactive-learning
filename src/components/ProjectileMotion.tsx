'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CelestialBody {
  id: string;
  name: string;
  mass: number; // kg
  radius: number; // 显示半径
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  isFixed?: boolean;
}

interface BodyInfo {
  position?: { x: number; y: number };
  velocity?: number;
  angularVelocity?: number;
  period?: number;
  mass?: number;
  density?: number;
}

export default function ProjectileMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [hoveredBody, setHoveredBody] = useState<string | null>(null);
  const [bodyCount, setBodyCount] = useState(2);
  const [showInfo, setShowInfo] = useState<BodyInfo>({ position: undefined, velocity: undefined, angularVelocity: undefined, period: undefined, mass: undefined, density: undefined });
  const [preset, setPreset] = useState<'custom' | 'earth-moon' | 'solar'>('custom');

  // 天体数据
  const [bodies, setBodies] = useState<CelestialBody[]>([
    {
      id: '1',
      name: '天体1',
      mass: 100,
      radius: 20,
      x: 300,
      y: 250,
      vx: 0,
      vy: 0,
      color: '#FFD700',
      isFixed: true
    },
    {
      id: '2',
      name: '天体2',
      mass: 10,
      radius: 10,
      x: 450,
      y: 250,
      vx: 0,
      vy: 3,
      color: '#00BFFF'
    }
  ]);

  // 调整天体数量
  const adjustBodyCount = (count: number) => {
    const newBodies = [...bodies];
    if (count > bodies.length) {
      // 添加天体
      for (let i = bodies.length; i < count; i++) {
        const angle = (i * Math.PI * 2) / count;
        const distance = 150 + i * 50;
        newBodies.push({
          id: String(i + 1),
          name: `天体${i + 1}`,
          mass: 10,
          radius: 10,
          x: 300 + Math.cos(angle) * distance,
          y: 250 + Math.sin(angle) * distance,
          vx: -Math.sin(angle) * 2,
          vy: Math.cos(angle) * 2,
          color: `hsl(${(i * 60) % 360}, 70%, 60%)`
        });
      }
    } else if (count < bodies.length) {
      // 删除天体
      newBodies.length = count;
    }
    setBodies(newBodies);
    setBodyCount(count);
  };

  // 预设场景
  const loadPreset = (preset: 'custom' | 'earth-moon' | 'solar') => {
    setPreset(preset);
    if (preset === 'earth-moon') {
      setBodies([
        {
          id: 'earth',
          name: '地球',
          mass: 5.972e24,
          radius: 40,
          x: 400,
          y: 300,
          vx: 0,
          vy: 0,
          color: '#2E8B57',
          isFixed: true
        },
        {
          id: 'moon',
          name: '月球',
          mass: 7.342e22,
          radius: 12,
          x: 600,
          y: 300,
          vx: 0,
          vy: 1022,
          color: '#C0C0C0'
        }
      ]);
      setBodyCount(2);
    } else if (preset === 'solar') {
      setBodies([
        {
          id: 'sun',
          name: '太阳',
          mass: 1.989e30,
          radius: 60,
          x: 400,
          y: 300,
          vx: 0,
          vy: 0,
          color: '#FFA500',
          isFixed: true
        },
        {
          id: 'mercury',
          name: '水星',
          mass: 3.285e23,
          radius: 6,
          x: 480,
          y: 300,
          vx: 0,
          vy: 47.87,
          color: '#A9A9A9'
        },
        {
          id: 'venus',
          name: '金星',
          mass: 4.867e24,
          radius: 10,
          x: 550,
          y: 300,
          vx: 0,
          vy: 35.02,
          color: '#FFC0CB'
        },
        {
          id: 'earth',
          name: '地球',
          mass: 5.972e24,
          radius: 11,
          x: 650,
          y: 300,
          vx: 0,
          vy: 29.78,
          color: '#2E8B57'
        }
      ]);
      setBodyCount(4);
    }
  };

  // 物理模拟
  const updatePhysics = useCallback(() => {
    const G = 6.674e-11; // 万有引力常数
    const dt = 0.1; // 时间步长

    setBodies(prevBodies => {
      const newBodies = prevBodies.map(body => ({
        ...body
      }));

      // 计算引力
      for (let i = 0; i < newBodies.length; i++) {
        if (newBodies[i].isFixed) continue;

        let fx = 0;
        let fy = 0;

        for (let j = 0; j < newBodies.length; j++) {
          if (i === j) continue;

          const dx = newBodies[j].x - newBodies[i].x;
          const dy = newBodies[j].y - newBodies[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < newBodies[i].radius + newBodies[j].radius) continue;

          const force = (G * newBodies[i].mass * newBodies[j].mass) / (dist * dist);
          fx += force * (dx / dist);
          fy += force * (dy / dist);
        }

        // 更新速度
        newBodies[i].vx += (fx / newBodies[i].mass) * dt;
        newBodies[i].vy += (fy / newBodies[i].mass) * dt;
      }

      // 更新位置
      for (let i = 0; i < newBodies.length; i++) {
        if (newBodies[i].isFixed) continue;
        newBodies[i].x += newBodies[i].vx * dt;
        newBodies[i].y += newBodies[i].vy * dt;
      }

      return newBodies;
    });
  }, []);

  // 计算天体信息
  const calculateBodyInfo = (body: CelestialBody) => {
    const velocity = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
    
    // 计算角速度和周期（相对于固定天体）
    const fixedBody = bodies.find(b => b.isFixed);
    let angularVelocity = 0;
    let period = 0;
    
    if (fixedBody && body.id !== fixedBody.id) {
      const dx = body.x - fixedBody.x;
      const dy = body.y - fixedBody.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 角速度 = v / r
      angularVelocity = velocity / distance;
      
      // 周期 = 2π / ω
      if (angularVelocity > 0) {
        period = (2 * Math.PI) / angularVelocity;
      }
    }
    
    // 估算密度 (假设球体，使用显示半径)
    const volume = (4 / 3) * Math.PI * Math.pow(body.radius, 3);
    const density = body.mass / volume;

    return {
      position: { x: body.x, y: body.y },
      velocity,
      angularVelocity,
      period,
      mass: body.mass,
      density
    };
  };

  // 动画循环
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        updatePhysics();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, updatePhysics]);

  // 绘制Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isClient) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 500;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 20, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const x = (i * canvas.width) / 20;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const y = (i * canvas.height) / 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 绘制轨道线（仅显示选中天体相对于固定天体的轨道）
    if (selectedBody) {
      const fixedBody = bodies.find(b => b.isFixed);
      const selectedBodyObj = bodies.find(b => b.id === selectedBody);
      if (fixedBody && selectedBodyObj && selectedBody !== fixedBody.id) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.arc(fixedBody.x, fixedBody.y, 
                Math.sqrt(Math.pow(selectedBodyObj.x - fixedBody.x, 2) + 
                         Math.pow(selectedBodyObj.y - fixedBody.y, 2)), 
                0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 绘制天体
    bodies.forEach(body => {
      // 绘制光晕
      const gradient = ctx.createRadialGradient(body.x, body.y, 0, body.x, body.y, body.radius * 2);
      gradient.addColorStop(0, body.color + '80');
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 绘制天体本体
      const isSelected = body.id === selectedBody;
      const isHovered = body.id === hoveredBody;

      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
      ctx.fillStyle = body.color;
      ctx.fill();

      // 选中/悬停效果
      if (isSelected || isHovered) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 绘制名称
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(body.name, body.x, body.y - body.radius - 8);
    });

    // 绘制信息面板
    if (selectedBody || hoveredBody) {
      const bodyId = selectedBody || hoveredBody;
      const body = bodies.find(b => b.id === bodyId);
      if (body) {
        const info = calculateBodyInfo(body);
        setShowInfo(info);

        const infoX = 10;
        const infoY = 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(infoX, infoY, 200, 200);
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(infoX, infoY, 200, 200);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(body.name, infoX + 10, infoY + 25);

        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
        let yPos = infoY + 50;
        ctx.fillText(`位置: (${info.position?.x?.toFixed(1) || '0'}, ${info.position?.y?.toFixed(1) || '0'})`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`速度: ${(info.velocity || 0).toFixed(2)} m/s`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`角速度: ${(info.angularVelocity || 0).toExponential(2)} rad/s`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`周期: ${(info.period || 0).toExponential(2)} s`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`质量: ${info.mass?.toExponential(2)} kg`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`密度: ${info.density?.toExponential(2)} kg/m³`, infoX + 10, yPos);
      }
    }
  }, [bodies, selectedBody, hoveredBody, isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 处理鼠标点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击了天体
    for (const body of bodies) {
      const dx = x - body.x;
      const dy = y - body.y;
      if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
        setSelectedBody(body.id);
        return;
      }
    }

    // 如果点击空白处，取消选择
    setSelectedBody(null);
  };

  // 处理鼠标移动
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否悬停在天体上
    let hovered: string | null = null;
    for (const body of bodies) {
      const dx = x - body.x;
      const dy = y - body.y;
      if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
        hovered = body.id;
        break;
      }
    }

    setHoveredBody(hovered);

    // 如果正在拖动选中的天体
    if (selectedBody && e.buttons === 1) {
      setBodies(prevBodies =>
        prevBodies.map(body =>
          body.id === selectedBody ? { ...body, x, y } : body
        )
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🎯</div>
        <div>
          <h2 className="text-2xl font-bold">多体运动模拟</h2>
          <p className="text-sm text-blue-300/80">天体轨道运动模拟与数据可视化</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 预设场景 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">🌌 预设场景</h3>
            <div className="space-y-2">
              <button
                onClick={() => loadPreset('custom')}
                className={`w-full p-2 rounded-lg text-left transition-all ${preset === 'custom' ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
              >
                自定义场景
              </button>
              <button
                onClick={() => loadPreset('earth-moon')}
                className={`w-full p-2 rounded-lg text-left transition-all ${preset === 'earth-moon' ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
              >
                🌍 地月系
              </button>
              <button
                onClick={() => loadPreset('solar')}
                className={`w-full p-2 rounded-lg text-left transition-all ${preset === 'solar' ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
              >
                ☀️ 太阳系内行星
              </button>
            </div>
          </div>

          {/* 天体数量控制 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">📊 天体数量</h3>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="8"
                value={bodyCount}
                onChange={(e) => adjustBodyCount(parseInt(e.target.value))}
                disabled={preset !== 'custom'}
                className="flex-1"
              />
              <span className="w-8 text-center font-bold">{bodyCount}</span>
            </div>
          </div>

          {/* 模拟控制 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">⚙️ 模拟控制</h3>
            <div className="space-y-2">
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className={`w-full p-2 rounded-lg font-medium transition-all ${isAnimating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isAnimating ? '⏸️ 暂停' : '▶️ 开始'}
              </button>
              <button
                onClick={() => {
                  setIsAnimating(false);
                  loadPreset(preset);
                }}
                className="w-full p-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 transition-all"
              >
                🔄 重置
              </button>
            </div>
          </div>

          {/* 操作说明 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">💡 操作说明</h3>
            <ul className="text-sm text-blue-100/80 space-y-1">
              <li>• 点击天体查看详细信息</li>
              <li>• 拖动天体调整位置</li>
              <li>• 悬停天体显示数据</li>
              <li>• 选择预设场景快速开始</li>
            </ul>
          </div>
        </div>

        {/* 模拟画布 */}
        <div className="lg:col-span-3">
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              className="w-full cursor-pointer"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
