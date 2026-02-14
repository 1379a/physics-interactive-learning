'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false,
  loading: () => <span className="text-blue-400">加载公式...</span>
});

interface Theme {
  name: string;
  id: string;
  gradient: string;
  accentColor: string;
  textColor: string;
}

interface FormulaSimulatorProps {
  currentTheme: Theme;
  customColor: string;
}

interface Formula {
  id: string;
  name: string;
  description: string;
  latex: string;
  variables: {
    name: string;
    symbol: string;
    min: number;
    max: number;
    default: number;
    unit: string;
    description: string;
  }[];
  calculate: (values: Record<string, number>) => number;
  resultUnit: string;
}

const formulas: Formula[] = [
  {
    id: 'newton',
    name: '牛顿第二定律',
    description: '描述力、质量和加速度之间的关系',
    latex: 'a = \\frac{F}{m}',
    variables: [
      {
        name: 'force',
        symbol: 'F',
        min: 0,
        max: 1000,
        default: 50,
        unit: 'N',
        description: '合外力'
      },
      {
        name: 'mass',
        symbol: 'm',
        min: 1,
        max: 100,
        default: 10,
        unit: 'kg',
        description: '质量'
      }
    ],
    calculate: (v) => v.force / v.mass,
    resultUnit: 'm/s²'
  },
  {
    id: 'kinetic-energy',
    name: '动能公式',
    description: '物体的动能与质量和速度的关系',
    latex: 'E_k = \\frac{1}{2}mv^2',
    variables: [
      {
        name: 'mass',
        symbol: 'm',
        min: 0.1,
        max: 100,
        default: 5,
        unit: 'kg',
        description: '质量'
      },
      {
        name: 'velocity',
        symbol: 'v',
        min: 0,
        max: 100,
        default: 10,
        unit: 'm/s',
        description: '速度'
      }
    ],
    calculate: (v) => 0.5 * v.mass * Math.pow(v.velocity, 2),
    resultUnit: 'J'
  },
  {
    id: 'potential-energy',
    name: '重力势能',
    description: '物体因高度而具有的能量',
    latex: 'E_p = mgh',
    variables: [
      {
        name: 'mass',
        symbol: 'm',
        min: 0.1,
        max: 100,
        default: 5,
        unit: 'kg',
        description: '质量'
      },
      {
        name: 'gravity',
        symbol: 'g',
        min: 1.6,
        max: 9.8,
        default: 9.8,
        unit: 'm/s²',
        description: '重力加速度'
      },
      {
        name: 'height',
        symbol: 'h',
        min: 0,
        max: 100,
        default: 10,
        unit: 'm',
        description: '高度'
      }
    ],
    calculate: (v) => v.mass * v.gravity * v.height,
    resultUnit: 'J'
  },
  {
    id: 'ohm',
    name: '欧姆定律',
    description: '电流、电压和电阻的关系',
    latex: 'I = \\frac{V}{R}',
    variables: [
      {
        name: 'voltage',
        symbol: 'V',
        min: 0,
        max: 240,
        default: 12,
        unit: 'V',
        description: '电压'
      },
      {
        name: 'resistance',
        symbol: 'R',
        min: 1,
        max: 1000,
        default: 10,
        unit: 'Ω',
        description: '电阻'
      }
    ],
    calculate: (v) => v.voltage / v.resistance,
    resultUnit: 'A'
  },
  {
    id: 'momentum',
    name: '动量',
    description: '物体运动状态的度量',
    latex: 'p = mv',
    variables: [
      {
        name: 'mass',
        symbol: 'm',
        min: 0.1,
        max: 100,
        default: 10,
        unit: 'kg',
        description: '质量'
      },
      {
        name: 'velocity',
        symbol: 'v',
        min: 0,
        max: 50,
        default: 5,
        unit: 'm/s',
        description: '速度'
      }
    ],
    calculate: (v) => v.mass * v.velocity,
    resultUnit: 'kg·m/s'
  },
  {
    id: 'power',
    name: '电功率',
    description: '单位时间内做的功',
    latex: 'P = VI',
    variables: [
      {
        name: 'voltage',
        symbol: 'V',
        min: 0,
        max: 240,
        default: 12,
        unit: 'V',
        description: '电压'
      },
      {
        name: 'current',
        symbol: 'I',
        min: 0,
        max: 20,
        default: 2,
        unit: 'A',
        description: '电流'
      }
    ],
    calculate: (v) => v.voltage * v.current,
    resultUnit: 'W'
  }
];

type ChartType = 'bar' | 'line' | 'scatter';

export default function FormulaSimulator({ currentTheme, customColor }: FormulaSimulatorProps) {
  // 获取主题颜色
  const getThemeColor = (variant: 'primary' | 'secondary' | 'text' | 'bg' = 'primary') => {
    if (currentTheme.id === 'custom') {
      return customColor;
    }
    const colorMap: Record<string, Record<string, string>> = {
      'primary': { blue: '#3b82f6', purple: '#a855f7', green: '#22c55e', red: '#ef4444', zinc: '#71717a' },
      'secondary': { blue: '#60a5fa', purple: '#c084fc', green: '#4ade80', red: '#f87171', zinc: '#a1a1aa' },
      'text': { blue: '#93c5fd', purple: '#d8b4fe', green: '#86efac', red: '#fca5a5', zinc: '#d4d4d8' },
      'bg': { blue: 'rgba(59, 130, 246, 0.3)', purple: 'rgba(168, 85, 247, 0.3)', green: 'rgba(34, 197, 94, 0.3)', red: 'rgba(239, 68, 68, 0.3)', zinc: 'rgba(113, 113, 122, 0.3)' }
    };
    return colorMap[variant][currentTheme.accentColor];
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFormula, setSelectedFormula] = useState<Formula>(formulas[0]);
  const [values, setValues] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number>(0);
  const [history, setHistory] = useState<{ time: number; value: number }[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    const initialValues: Record<string, number> = {};
    selectedFormula.variables.forEach(v => {
      initialValues[v.name] = v.default;
    });
    setValues(initialValues);
    setHistory([]);
  }, [selectedFormula]);

  useEffect(() => {
    const newResult = selectedFormula.calculate(values);
    setResult(newResult);

    const now = Date.now();
    setHistory(prev => {
      const newHistory = [...prev, { time: now, value: newResult }];
      // 保留最近100个数据点
      if (newHistory.length > 100) {
        return newHistory.slice(-100);
      }
      return newHistory;
    });
  }, [values, selectedFormula]);

  // 绘制Canvas图表
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 250;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 20, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i * canvas.width) / 10;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const y = (i * canvas.height) / 5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 计算数据范围
    const values = history.map(h => h.value);
    const maxVal = Math.max(...values, 0.001);
    const minVal = Math.min(...values);
    const range = maxVal - minVal || maxVal;

    // 绘制图表
    if (chartType === 'bar') {
      const barWidth = canvas.width / history.length;
      values.forEach((value, index) => {
        const normalizedHeight = ((value - minVal) / range) * 0.8 + 0.1;
        const height = normalizedHeight * canvas.height;
        const x = index * barWidth;
        const y = canvas.height - height;
        const intensity = index / history.length;

        // 创建渐变
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${0.8 + intensity * 0.2})`);
        gradient.addColorStop(1, `rgba(147, 51, 234, ${0.6 + intensity * 0.2})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);
      });
    } else if (chartType === 'line') {
      if (history.length < 2) return;

      const padding = 20;
      const graphWidth = canvas.width - 2 * padding;
      const graphHeight = canvas.height - 2 * padding;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;

      history.forEach((point, index) => {
        const x = padding + (index / (history.length - 1)) * graphWidth;
        const normalizedY = (point.value - minVal) / range;
        const y = padding + (1 - normalizedY) * graphHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 填充渐变区域
      ctx.lineTo(padding + graphWidth, padding + graphHeight);
      ctx.lineTo(padding, padding + graphHeight);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padding, 0, padding + graphHeight);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // 绘制数据点
      history.forEach((point, index) => {
        const x = padding + (index / (history.length - 1)) * graphWidth;
        const normalizedY = (point.value - minVal) / range;
        const y = padding + (1 - normalizedY) * graphHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      });
    } else if (chartType === 'scatter') {
      const padding = 20;
      const graphWidth = canvas.width - 2 * padding;
      const graphHeight = canvas.height - 2 * padding;

      values.forEach((value, index) => {
        const x = padding + (index / values.length) * graphWidth;
        const normalizedY = (value - minVal) / range;
        const y = padding + (1 - normalizedY) * graphHeight;

        const intensity = index / values.length;
        const size = 4 + (value / maxVal) * 6;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.5 + intensity * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // 绘制Y轴标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(maxVal.toExponential(2), canvas.width - 5, 15);
    ctx.fillText(minVal.toExponential(2), canvas.width - 5, canvas.height - 5);

  }, [history, chartType]);

  const handleValueChange = (variableName: string, newValue: number) => {
    setValues(prev => ({ ...prev, [variableName]: newValue }));
  };

  const resetValues = () => {
    const initialValues: Record<string, number> = {};
    selectedFormula.variables.forEach(v => {
      initialValues[v.name] = v.default;
    });
    setValues(initialValues);
    setHistory([]);
  };

  // 计算统计信息
  const stats = history.length > 0 ? {
    current: history[history.length - 1].value,
    max: Math.max(...history.map(h => h.value)),
    min: Math.min(...history.map(h => h.value)),
    avg: history.reduce((sum, h) => sum + h.value, 0) / history.length,
    count: history.length
  } : null;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🧮</div>
        <div>
          <h2 className="text-2xl font-bold">动态公式演绎器</h2>
          <p className="text-sm" style={{ color: `${getThemeColor('text')}CC` }}>调整变量参数，观察计算结果的变化趋势</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：公式选择 */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold mb-4" style={{ color: getThemeColor('text') }}>选择公式</h3>
          {formulas.map((formula) => (
            <button
              key={formula.id}
              onClick={() => setSelectedFormula(formula)}
              className={`w-full p-4 rounded-xl text-left transition-all relative overflow-hidden ${
                selectedFormula.id === formula.id
                  ? 'text-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
              style={selectedFormula.id === formula.id ? {
                background: currentTheme.id === 'custom' 
                  ? customColor 
                  : `linear-gradient(to right, ${getThemeColor('primary')}, ${getThemeColor('secondary')})`,
                boxShadow: currentTheme.id === 'custom' 
                  ? `0 10px 15px -3px ${customColor}4D`
                  : `0 10px 15px -3px ${getThemeColor('primary')}4D`
              } : {}}
            >
              {/* 毛玻璃动画效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10">
                <div className="font-semibold mb-1">{formula.name}</div>
                <div className="text-xs opacity-80 line-clamp-1">{formula.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* 中间：公式展示和变量控制 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-center mb-4">
              <div className="text-lg mb-2">{selectedFormula.name}</div>
              <div className="text-sm" style={{ color: `${getThemeColor('text')}CC`, marginBottom: '1rem' }}>{selectedFormula.description}</div>
              <div className="bg-black/30 rounded-lg p-4">
                <BlockMath math={selectedFormula.latex} />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="text-sm font-semibold mb-3" style={{ color: getThemeColor('text') }}>变量参数</div>
              {selectedFormula.variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: getThemeColor('secondary') }}>{variable.symbol}</span>
                      <span className="text-xs" style={{ color: `${getThemeColor('text')}B3` }}>{variable.description}</span>
                    </div>
                    <span className="text-sm font-mono px-2 py-1 rounded" style={{ background: getThemeColor('bg') }}>
                      {values[variable.name]?.toFixed(2) || variable.default.toFixed(2)} {variable.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={variable.min}
                    max={variable.max}
                    step={(variable.max - variable.min) / 100}
                    value={values[variable.name] ?? variable.default}
                    onChange={(e) => handleValueChange(variable.name, parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: getThemeColor('primary') }}
                  />
                  <div className="flex justify-between text-xs" style={{ color: `${getThemeColor('text')}99` }}>
                    <span>{variable.min}</span>
                    <span>{variable.max}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetValues}
              className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <span className="relative z-10">🔄 重置为默认值</span>
            </button>
          </div>
        </div>

        {/* 右侧：结果显示和图表 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl p-5 border" style={{
            background: currentTheme.id === 'custom' 
              ? `${customColor}33` 
              : `linear-gradient(to bottom right, ${getThemeColor('bg')}, ${getThemeColor('bg')})`,
            borderColor: currentTheme.id === 'custom'
              ? `${customColor}4D`
              : `${getThemeColor('primary')}4D`
          }}>
            <div className="text-sm mb-2" style={{ color: getThemeColor('text') }}>计算结果</div>
            <div className="text-4xl font-bold mb-2">
              {result?.toFixed(4) || '0.0000'} <span className="text-lg" style={{ color: getThemeColor('secondary') }}>{selectedFormula.resultUnit}</span>
            </div>
            <div className="text-xs" style={{ color: `${getThemeColor('text')}B3` }}>
              基于当前变量参数计算得出
            </div>
          </div>

          {/* 图表类型切换 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-semibold" style={{ color: getThemeColor('text') }}>结果变化趋势</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-1 rounded text-xs transition-all ${chartType === 'bar' ? 'text-white' : 'bg-white/10 hover:bg-white/20'}`}
                  style={chartType === 'bar' ? { background: getThemeColor('primary') } : {}}
                >
                  柱状
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2 py-1 rounded text-xs transition-all ${chartType === 'line' ? 'text-white' : 'bg-white/10 hover:bg-white/20'}`}
                  style={chartType === 'line' ? { background: getThemeColor('primary') } : {}}
                >
                  折线
                </button>
                <button
                  onClick={() => setChartType('scatter')}
                  className={`px-2 py-1 rounded text-xs transition-all ${chartType === 'scatter' ? 'text-white' : 'bg-white/10 hover:bg-white/20'}`}
                  style={chartType === 'scatter' ? { background: getThemeColor('primary') } : {}}
                >
                  散点
                </button>
              </div>
            </div>
            <div className="bg-black/20 rounded-lg overflow-hidden">
              <canvas ref={canvasRef} className="w-full" />
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: `${getThemeColor('text')}99` }}>
              <span>历史记录</span>
              <span>数据点: {history.length}</span>
            </div>
          </div>

          {/* 统计信息 */}
          {showStats && stats && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-semibold" style={{ color: getThemeColor('text') }}>统计信息</div>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="text-xs transition-colors"
                  style={{ color: `${getThemeColor('text')}99` }}
                  onMouseEnter={(e) => e.currentTarget.style.color = getThemeColor('text')}
                  onMouseLeave={(e) => e.currentTarget.style.color = `${getThemeColor('text')}99`}
                >
                  {showStats ? '隐藏' : '显示'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs" style={{ color: `${getThemeColor('text')}99` }}>当前值</div>
                  <div className="font-mono" style={{ color: getThemeColor('secondary') }}>{stats.current.toExponential(3)}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs" style={{ color: `${getThemeColor('text')}99` }}>最大值</div>
                  <div className="font-mono text-green-400">{stats.max.toExponential(3)}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs" style={{ color: `${getThemeColor('text')}99` }}>最小值</div>
                  <div className="font-mono text-red-400">{stats.min.toExponential(3)}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-xs" style={{ color: `${getThemeColor('text')}99` }}>平均值</div>
                  <div className="font-mono text-purple-400">{stats.avg.toExponential(3)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold mb-3" style={{ color: getThemeColor('text') }}>数值说明</div>
            <div className="space-y-2 text-sm">
              {selectedFormula.variables.map((variable) => (
                <div key={variable.name} className="flex justify-between">
                  <span style={{ color: `${getThemeColor('text')}B3` }}>{variable.symbol} = </span>
                  <span className="font-mono">
                    {values[variable.name]?.toFixed(2) || variable.default.toFixed(2)} {variable.unit}
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span style={{ color: getThemeColor('secondary') }}>结果 = </span>
                <span className="font-mono" style={{ color: getThemeColor('secondary') }}>
                  {result?.toFixed(4) || '0.0000'} {selectedFormula.resultUnit}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
