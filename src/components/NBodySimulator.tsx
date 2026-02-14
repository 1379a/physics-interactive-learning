'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CelestialBody {
  id: string;
  name: string;
  mass: number; // 相对质量（用于演示）
  radius: number; // 显示半径
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  isFixed?: boolean;
  realMass?: number; // 真实质量（用于显示）
}

interface TrajectoryPoint {
  x: number;
  y: number;
}

interface BodyInfo {
  position?: { x: number; y: number };
  velocity?: number;
  angularVelocity?: number;
  period?: number;
  mass?: number;
  density?: number;
}

// 将颜色转换为带透明度的格式
const getColorWithAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('hsl')) {
    // 将 hsl(120, 70%, 60%) 转换为 hsla(120, 70%, 60%, 0.5)
    return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
  } else if (color.startsWith('#')) {
    // 将十六进制颜色转换为带alpha的格式
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

export default function NBodySimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const trajectoriesRef = useRef<Record<string, TrajectoryPoint[]>>({});
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [hoveredBody, setHoveredBody] = useState<string | null>(null);
  const [bodyCount, setBodyCount] = useState(2);
  const [showInfo, setShowInfo] = useState<BodyInfo>({ position: undefined, velocity: undefined, angularVelocity: undefined, period: undefined, mass: undefined, density: undefined });
  const [preset, setPreset] = useState<'custom' | 'earth-moon' | 'solar'>('custom');
  const [viewScale, setViewScale] = useState(1);
  const [viewOffsetX, setViewOffsetX] = useState(0);
  const [viewOffsetY, setViewOffsetY] = useState(0);
  const [canvasDragMode, setCanvasDragMode] = useState(false); // 画布拖动模式
  const [draggingView, setDraggingView] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null); // 触摸起始位置，用于区分点击和拖动
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [trajectories, setTrajectories] = useState<Record<string, TrajectoryPoint[]>>({});

  // 天体数据（使用更适合演示的参数）
  const [bodies, setBodies] = useState<CelestialBody[]>([
    {
      id: '1',
      name: '中心天体',
      mass: 1000,
      radius: 25,
      x: 400,
      y: 250,
      vx: 0,
      vy: 0,
      color: '#FFD700',
      isFixed: true,
      realMass: 5.972e24
    },
    {
      id: '2',
      name: '天体2',
      mass: 100,
      radius: 12,
      x: 550,
      y: 250,
      vx: 0,
      vy: 2,
      color: '#00BFFF',
      realMass: 7.342e22
    }
  ]);

  // 调整天体数量
  const adjustBodyCount = (count: number) => {
    if (preset !== 'custom') return;

    try {
      // 先停止动画，避免状态更新冲突
      setIsAnimating(false);
      
      const newBodies = [...bodies];
      if (count > bodies.length) {
        // 添加天体
        for (let i = bodies.length; i < count; i++) {
          const angle = (i * Math.PI * 2) / count;
          const distance = 120 + i * 40;
          newBodies.push({
            id: String(i + 1),
            name: `天体${i + 1}`,
            mass: 50 + Math.random() * 100,
            radius: 8 + Math.random() * 8,
            x: 400 + Math.cos(angle) * distance,
            y: 250 + Math.sin(angle) * distance,
            vx: -Math.sin(angle) * 1.5,
            vy: Math.cos(angle) * 1.5,
            color: `hsl(${(i * 60) % 360}, 70%, 60%)`,
            isFixed: false,
            realMass: (50 + Math.random() * 100) * 1e22
          });
        }
      } else if (count < bodies.length) {
        // 删除天体
        newBodies.length = count;
      }
      setBodies(newBodies);
      setBodyCount(count);
      resetTrajectories();
    } catch (error) {
      console.error('调整天体数量时出错:', error);
    }
  };

  // 重置轨迹
  const resetTrajectories = () => {
    trajectoriesRef.current = {};
    setTrajectories({});
  };

  // 切换天体固定状态（中心天体）
  const toggleBodyFixed = (bodyId: string) => {
    setIsAnimating(false);
    setBodies(prevBodies => {
      // 首先找出需要修改的天体
      const targetBody = prevBodies.find(b => b.id === bodyId);
      if (!targetBody) return prevBodies;

      const newIsFixed = !targetBody.isFixed;
      let newName = targetBody.name;

      // 如果原来是固定的（中心天体），现在变为自由运动，则根据天体数量重新排序命名
      if (targetBody.isFixed && !newIsFixed) {
        // 计算该天体在数组中的索引位置
        const index = prevBodies.findIndex(b => b.id === bodyId);
        newName = `天体${index + 1}`;
      }

      return prevBodies.map(body =>
        body.id === bodyId ? { ...body, isFixed: newIsFixed, name: newName } : body
      );
    });
    resetTrajectories();
  };

  // 预设场景
  const loadPreset = (preset: 'custom' | 'earth-moon' | 'solar') => {
    setPreset(preset);
    setIsAnimating(false);
    resetTrajectories();
    
    if (preset === 'earth-moon') {
      setBodies([
        {
          id: 'earth',
          name: '地球',
          mass: 1000,
          radius: 30,
          x: 400,
          y: 250,
          vx: 0,
          vy: 0,
          color: '#2E8B57',
          isFixed: true,
          realMass: 5.972e24
        },
        {
          id: 'moon',
          name: '月球',
          mass: 100,
          radius: 10,
          x: 580,
          y: 250,
          vx: 0,
          vy: 1.8,
          color: '#C0C0C0',
          realMass: 7.342e22
        }
      ]);
      setBodyCount(2);
      setViewScale(1);
      setViewOffsetX(0);
      setViewOffsetY(0);
    } else if (preset === 'solar') {
      setBodies([
        {
          id: 'sun',
          name: '太阳',
          mass: 5000,
          radius: 40,
          x: 400,
          y: 250,
          vx: 0,
          vy: 0,
          color: '#FFA500',
          isFixed: true,
          realMass: 1.989e30
        },
        {
          id: 'mercury',
          name: '水星',
          mass: 20,
          radius: 6,
          x: 480,
          y: 250,
          vx: 0,
          vy: 3,
          color: '#A9A9A9',
          realMass: 3.285e23
        },
        {
          id: 'venus',
          name: '金星',
          mass: 80,
          radius: 10,
          x: 550,
          y: 250,
          vx: 0,
          vy: 2.3,
          color: '#FFC0CB',
          realMass: 4.867e24
        },
        {
          id: 'earth',
          name: '地球',
          mass: 100,
          radius: 11,
          x: 650,
          y: 250,
          vx: 0,
          vy: 1.9,
          color: '#2E8B57',
          realMass: 5.972e24
        }
      ]);
      setBodyCount(4);
      setViewScale(1);
      setViewOffsetX(0);
      setViewOffsetY(0);
    }
  };

  // 物理模拟
  const updatePhysics = useCallback(() => {
    const G = 0.5; // 引力常数（调整以适应演示）
    const dt = 0.1 * simulationSpeed; // 时间步长，受速度控制

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

          // 避免除以零和过近时的极大力
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

    // 记录轨迹（移到 setBodies 外部，避免状态更新冲突）
    setTrajectories(prev => {
      const newTrajectories = { ...prev };
      bodies.forEach(body => {
        if (!body.isFixed) {
          if (!newTrajectories[body.id]) {
            newTrajectories[body.id] = [];
          }
          newTrajectories[body.id].push({ x: body.x, y: body.y });
          // 限制轨迹长度
          if (newTrajectories[body.id].length > 10000) {
            newTrajectories[body.id] = newTrajectories[body.id].slice(-10000);
          }
        }
      });
      return newTrajectories;
    });
  }, [simulationSpeed, bodies]);

  // 计算天体信息
  const calculateBodyInfo = (body: CelestialBody) => {
    const velocity = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
    
    // 计算万有引力（所有其他天体对该天体的引力总和）
    let totalGravitationalForce = 0;
    const G = 0.5; // 引力常数（与模拟中使用的一致）
    
    for (const other of bodies) {
      if (other.id === body.id) continue;
      
      const dx = other.x - body.x;
      const dy = other.y - body.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        // 万有引力公式：F = G * m1 * m2 / r^2
        const force = (G * body.mass * other.mass) / (distance * distance);
        totalGravitationalForce += force;
      }
    }
    
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
      mass: body.realMass || body.mass,
      density,
      gravitationalForce: totalGravitationalForce
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

    // 应用变换（平移+缩放）
    ctx.save();
    ctx.translate(viewOffsetX, viewOffsetY);
    ctx.scale(viewScale, viewScale);

    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 20, 0.3)';
    ctx.fillRect(-viewOffsetX, -viewOffsetY, canvas.width / viewScale, canvas.height / viewScale);

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

    // 绘制轨迹
    if (showTrajectories) {
      Object.entries(trajectories).forEach(([bodyId, points]) => {
        if (points.length < 2) return;
        
        const body = bodies.find(b => b.id === bodyId);
        if (!body) return;

        ctx.beginPath();
        ctx.strokeStyle = getColorWithAlpha(body.color, 0.4); // 半透明
        ctx.lineWidth = 2;
        
        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        
        ctx.stroke();
      });
    }

    // 绘制轨道线（仅显示选中天体相对于固定天体的理想轨道）
    if (selectedBody) {
      const fixedBody = bodies.find(b => b.isFixed);
      const selectedBodyObj = bodies.find(b => b.id === selectedBody);
      if (fixedBody && selectedBodyObj && selectedBody !== fixedBody.id) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.setLineDash([5, 5]);
        const distance = Math.sqrt(
          Math.pow(selectedBodyObj.x - fixedBody.x, 2) + 
          Math.pow(selectedBodyObj.y - fixedBody.y, 2)
        );
        ctx.arc(fixedBody.x, fixedBody.y, distance, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 绘制天体
    bodies.forEach(body => {
      // 绘制光晕
      const gradient = ctx.createRadialGradient(body.x, body.y, 0, body.x, body.y, body.radius * 2);
      gradient.addColorStop(0, getColorWithAlpha(body.color, 0.5));
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

    // 绘制力的示意图（当有选中或悬停的天体时）
    if (selectedBody || hoveredBody) {
      const bodyId = selectedBody || hoveredBody;
      const body = bodies.find(b => b.id === bodyId);
      if (body) {
        const G = 0.5; // 引力常数
        const forceScale = 30; // 力的显示缩放比例
        const velocityScale = 40; // 速度的显示缩放比例

        // 绘制箭头的辅助函数
        const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, label: string, lineWidth: number = 2) => {
          const headLength = 8;
          const dx = toX - fromX;
          const dy = toY - fromY;
          const angle = Math.atan2(dy, dx);
          const length = Math.sqrt(dx * dx + dy * dy);

          if (length < 5) return; // 太短的箭头不绘制

          // 绘制箭头线
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          // 绘制箭头头部
          ctx.beginPath();
          ctx.moveTo(toX, toY);
          ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
          ctx.lineTo(toX, toY);
          ctx.fillStyle = color;
          ctx.fill();

          // 绘制标签
          if (label) {
            ctx.fillStyle = color;
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(label, toX + 5, toY - 5);
          }
        };

        // 1. 绘制速度矢量（绿色）
        const velocityMag = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
        if (velocityMag > 0.01) {
          const velEndX = body.x + body.vx * velocityScale;
          const velEndY = body.y + body.vy * velocityScale;
          drawArrow(body.x, body.y, velEndX, velEndY, '#4ade80', `v: ${velocityMag.toFixed(2)}`, 3);
        }

        // 2. 计算合力并绘制（橙色）
        let totalFx = 0;
        let totalFy = 0;
        const forces: { fromX: number; fromY: number; toX: number; toY: number; color: string; label: string }[] = [];

        // 计算每个天体对当前天体的引力
        for (const other of bodies) {
          if (other.id === body.id) continue;

          const dx = other.x - body.x;
          const dy = other.y - body.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            // 万有引力公式：F = G * m1 * m2 / r^2
            const force = (G * body.mass * other.mass) / (distance * distance);
            const fx = force * (dx / distance);
            const fy = force * (dy / distance);

            totalFx += fx;
            totalFy += fy;

            // 绘制各个引力（淡蓝色虚线）
            const forceEndX = body.x + fx * forceScale;
            const forceEndY = body.y + fy * forceScale;

            ctx.setLineDash([3, 3]);
            drawArrow(body.x, body.y, forceEndX, forceEndY, `rgba(147, 197, 253, 0.6)`, `F${other.id}: ${force.toFixed(2)}`, 1);
            ctx.setLineDash([]);

            // 绘制从其他天体到当前天体的连接线
            ctx.beginPath();
            ctx.moveTo(other.x, other.y);
            ctx.lineTo(body.x, body.y);
            ctx.strokeStyle = `rgba(147, 197, 253, 0.3)`;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // 3. 绘制合力（橙色粗箭头）
        const totalForceMag = Math.sqrt(totalFx * totalFx + totalFy * totalFy);
        if (totalForceMag > 0.01) {
          const totalForceEndX = body.x + totalFx * forceScale;
          const totalForceEndY = body.y + totalFy * forceScale;
          drawArrow(body.x, body.y, totalForceEndX, totalForceEndY, '#f97316', `F合: ${totalForceMag.toFixed(2)}`, 4);
        }

        // 4. 绘制加速度方向（红色，与合力方向相同）
        if (totalForceMag > 0.01) {
          // 加速度 a = F / m
          const ax = totalFx / body.mass;
          const ay = totalFy / body.mass;
          const accelMag = Math.sqrt(ax * ax + ay * ay);
          const accelScale = 800; // 加速度显示的缩放比例
          
          const accelEndX = body.x + ax * accelScale;
          const accelEndY = body.y + ay * accelScale;
          drawArrow(body.x, body.y, accelEndX, accelEndY, '#ef4444', `a: ${accelMag.toFixed(4)}`, 3);
        }

        // 5. 绘制图例
        const legendX = 10;
        const legendY = canvas.height - 130;
        const legendWidth = 160;
        const legendHeight = 120;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('力的示意图', legendX + 10, legendY + 20);

        ctx.font = '11px Arial';
        let legendYPos = legendY + 40;

        // 速度图例
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(legendX + 10, legendYPos - 4, 20, 2);
        ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
        ctx.fillText('速度 (v)', legendX + 35, legendYPos);

        // 各个引力图例
        legendYPos += 18;
        ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
        ctx.fillRect(legendX + 10, legendYPos - 4, 20, 2);
        ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
        ctx.fillText('各个引力 (F)', legendX + 35, legendYPos);

        // 合力图例
        legendYPos += 18;
        ctx.fillStyle = '#f97316';
        ctx.fillRect(legendX + 10, legendYPos - 4, 20, 4);
        ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
        ctx.fillText('合力 (F合)', legendX + 35, legendYPos);

        // 加速度图例
        legendYPos += 18;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(legendX + 10, legendYPos - 4, 20, 2);
        ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
        ctx.fillText('加速度 (a)', legendX + 35, legendYPos);
      }
    }

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
        ctx.fillRect(infoX, infoY, 240, 260);
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(infoX, infoY, 240, 260);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(body.name, infoX + 10, infoY + 25);

        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
        let yPos = infoY + 50;
        ctx.fillText(`位置: (${info.position?.x?.toFixed(1) || '0'}, ${info.position?.y?.toFixed(1) || '0'})`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`速度: ${(info.velocity || 0).toFixed(3)} 单位/帧`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`角速度: ${(info.angularVelocity || 0).toFixed(4)} rad/帧`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`周期: ${(info.period || 0).toFixed(1)} 帧`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`质量: ${(info.mass || 0).toExponential(2)} kg`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`密度: ${(info.density || 0).toFixed(4)} 单位³`, infoX + 10, yPos);
        yPos += 20;
        ctx.fillText(`万有引力: ${(info.gravitationalForce || 0).toFixed(3)} 单位`, infoX + 10, yPos);
        yPos += 20;
        if (trajectories[body.id]) {
          ctx.fillText(`轨迹点: ${trajectories[body.id].length}`, infoX + 10, yPos);
        }
      }
    }

    ctx.restore();
  }, [bodies, selectedBody, hoveredBody, trajectories, showTrajectories, isClient, viewOffsetX, viewOffsetY, viewScale]);

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

    // 转换到世界坐标
    const worldX = (x - viewOffsetX) / viewScale;
    const worldY = (y - viewOffsetY) / viewScale;

    // 检查是否点击了天体
    for (const body of bodies) {
      const dx = worldX - body.x;
      const dy = worldY - body.y;
      if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
        setSelectedBody(body.id);
        return;
      }
    }

    // 如果点击空白处，取消选择
    setSelectedBody(null);
  };

  // 处理滚轮缩放（通过 ref 阻止默认行为）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 计算鼠标在当前视图中的世界坐标
      const worldX = (mouseX - viewOffsetX) / viewScale;
      const worldY = (mouseY - viewOffsetY) / viewScale;

      // 更新缩放比例
      const newScale = e.deltaY < 0
        ? Math.min(viewScale * 1.1, 3.0)  // 最大放大3倍
        : Math.max(viewScale * 0.9, 0.2); // 最小缩小到0.2倍

      // 调整视图偏移，使缩放中心保持不变
      setViewOffsetX(mouseX - worldX * newScale);
      setViewOffsetY(mouseY - worldY * newScale);
      setViewScale(newScale);
    };

    // 添加被动事件监听器以允许 preventDefault
    canvas.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [viewOffsetX, viewOffsetY, viewScale]);

  // 处理滑块缩放
  const handleSliderZoom = (value: number) => {
    const newScale = value;
    setViewScale(newScale);
  };

  // 处理双击切换画布拖动模式
  const handleCanvasDoubleClick = () => {
    setCanvasDragMode(prev => !prev);
  };

  // 处理鼠标按下（用于拖动视图或天体）
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 转换到世界坐标
    const worldX = (x - viewOffsetX) / viewScale;
    const worldY = (y - viewOffsetY) / viewScale;

    // 检查是否点击了天体
    let clickedOnBody = false;
    for (const body of bodies) {
      const dx = worldX - body.x;
      const dy = worldY - body.y;
      if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
        clickedOnBody = true;
        break;
      }
    }

    // 如果在画布拖动模式（双击激活）或按住 Shift，并且没有点击天体，则拖动视图
    if ((canvasDragMode || e.shiftKey) && !clickedOnBody) {
      setDraggingView(true);
      setDragStartX(e.clientX - viewOffsetX);
      setDragStartY(e.clientY - viewOffsetY);
    }
  };

  // 处理触摸开始（手机端拖动画布和点击天体）
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas || !touch) return;

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // 记录触摸起始位置
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });

    // 转换到世界坐标
    const worldX = (x - viewOffsetX) / viewScale;
    const worldY = (y - viewOffsetY) / viewScale;

    // 检查是否触摸到了天体
    let touchedBody = false;
    for (const body of bodies) {
      const dx = worldX - body.x;
      const dy = worldY - body.y;
      if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
        touchedBody = true;
        break;
      }
    }

    // 如果没有触摸到天体，则拖动视图
    if (!touchedBody) {
      setDraggingView(true);
      setDragStartX(touch.clientX - viewOffsetX);
      setDragStartY(touch.clientY - viewOffsetY);
    }
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!draggingView) return;

    const touch = e.touches[0];
    if (!touch) return;

    setViewOffsetX(touch.clientX - dragStartX);
    setViewOffsetY(touch.clientY - dragStartY);
  };

  // 处理触摸结束（用于处理点击选择）
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setDraggingView(false);

    // 检查是否是点击操作（移动距离很小）
    if (!touchStartPos) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果移动距离小于 10 像素，认为是点击操作
    if (distance < 10) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // 转换到世界坐标
      const worldX = (x - viewOffsetX) / viewScale;
      const worldY = (y - viewOffsetY) / viewScale;

      // 检查是否点击了天体
      let clickedBody = false;
      for (const body of bodies) {
        const bodyDx = worldX - body.x;
        const bodyDy = worldY - body.y;
        if (Math.sqrt(bodyDx * bodyDx + bodyDy * bodyDy) < body.radius) {
          setSelectedBody(body.id);
          clickedBody = true;
          break;
        }
      }

      // 如果点击空白处，取消选择
      if (!clickedBody) {
        setSelectedBody(null);
      }
    }

    // 清除触摸起始位置
    setTouchStartPos(null);
  };

  // 处理鼠标抬起
  const handleMouseUp = () => {
    setDraggingView(false);
  };

  // 处理鼠标移动
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 如果正在拖动视图
    if (draggingView) {
      setViewOffsetX(e.clientX - dragStartX);
      setViewOffsetY(e.clientY - dragStartY);
      return;
    }

    // 转换到世界坐标
    const worldX = (x - viewOffsetX) / viewScale;
    const worldY = (y - viewOffsetY) / viewScale;

    // 检查是否悬停在天体上
    let hovered: string | null = null;
    for (const body of bodies) {
      const dx = worldX - body.x;
      const dy = worldY - body.y;
      if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
        hovered = body.id;
        break;
      }
    }

    setHoveredBody(hovered);

    // 如果正在拖动选中的天体
    if (selectedBody && e.buttons === 1 && !e.shiftKey) {
      setBodies(prevBodies =>
        prevBodies.map(body =>
          body.id === selectedBody ? { ...body, x: worldX, y: worldY } : body
        )
      );
      resetTrajectories();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🌌</div>
        <div>
          <h2 className="text-2xl font-bold">多体运动模拟</h2>
          <p className="text-sm text-blue-300/80">天体轨道运动模拟与数据可视化</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 预设场景 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
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
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
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
            {preset !== 'custom' && (
              <p className="text-xs text-blue-300/60 mt-2">自定义模式可用</p>
            )}
          </div>

          {/* 天体列表和中心天体设置 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">🌟 天体设置</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bodies.map((body) => (
                <div
                  key={body.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: body.color }}
                    />
                    <span className="text-sm">{body.name}</span>
                  </div>
                  <button
                    onClick={() => toggleBodyFixed(body.id)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      body.isFixed
                        ? 'bg-yellow-600/80 text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {body.isFixed ? '🔒 固定' : '🚀 自由'}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-300/60 mt-2">
              {bodies.some(b => b.isFixed)
                ? '固定天体作为中心，其他天体围绕运动'
                : '所有天体自由运动，相互吸引'}
            </p>
          </div>

          {/* 模拟控制 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
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
                🔄 重置位置
              </button>
              <button
                onClick={resetTrajectories}
                className="w-full p-2 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 transition-all"
              >
                📍 清除轨迹
              </button>
            </div>
          </div>

          {/* 速度控制 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">⚡ 运动速度</h3>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold">{simulationSpeed.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between text-xs text-blue-300/60 mt-1">
              <span>慢</span>
              <span>快</span>
            </div>
          </div>

          {/* 轨迹显示控制 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-300">📍 显示轨迹</h3>
              <button
                onClick={() => setShowTrajectories(!showTrajectories)}
                className={`w-12 h-6 rounded-full transition-all ${
                  showTrajectories ? 'bg-blue-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-all ${
                    showTrajectories ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 视图缩放控制 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">🔍 视图缩放</h3>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={viewScale}
                onChange={(e) => handleSliderZoom(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold">{viewScale.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between text-xs text-blue-300/60 mt-1">
              <span>缩小</span>
              <span>放大</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleSliderZoom(1)}
                className="flex-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                🎯 重置
              </button>
              <button
                onClick={() => {
                  setViewOffsetX(0);
                  setViewOffsetY(0);
                  handleSliderZoom(1);
                }}
                className="flex-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                📍 居中
              </button>
            </div>
          </div>

          {/* 画布拖动模式 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-300">🖐️ 画布拖动</h3>
              <button
                onClick={() => setCanvasDragMode(!canvasDragMode)}
                className={`w-12 h-6 rounded-full transition-all ${
                  canvasDragMode ? 'bg-green-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-all ${
                    canvasDragMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-blue-300/60 mt-2">
              {canvasDragMode
                ? '拖动模式已开启：拖动空白处移动视图'
                : '拖动模式已关闭：双击画布或使用切换按钮开启'}
            </p>
          </div>

          {/* 操作说明 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">💡 操作说明</h3>
            <ul className="text-sm text-blue-100/80 space-y-1">
              <li>• 点击或悬停天体查看信息与力的示意图</li>
              <li>• 拖动天体调整位置</li>
              <li>• 滚轮或滑块缩放视图（0.2x - 3x）</li>
              <li>• 按住 Shift + 拖动空白处移动视图</li>
              <li>• 双击画布开启拖动模式，手机端直接触摸拖动</li>
              <li>• 点击"视角重置"按钮恢复初始视角</li>
              <li>• 选择预设场景快速开始</li>
              <li>• 调整速度控制模拟快慢</li>
              <li>• 设置天体为"固定"作为中心，无固定天体时进行相对运动</li>
            </ul>
          </div>
        </div>

        {/* 模拟画布 */}
        <div className="lg:col-span-3">
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all relative">
            {/* 视角重置浮动按钮 */}
            <button
              onClick={() => {
                setViewOffsetX(0);
                setViewOffsetY(0);
                setViewScale(1);
              }}
              className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600/90 hover:bg-blue-700/90 text-white rounded-lg shadow-lg backdrop-blur-sm transition-all flex items-center gap-2 z-10"
              title="重置视角到初始状态"
            >
              <span className="text-lg">🔄</span>
              <span className="text-sm font-medium">视角重置</span>
            </button>

            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onDoubleClick={handleCanvasDoubleClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`w-full ${canvasDragMode ? 'cursor-move' : 'cursor-pointer'}`}
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
