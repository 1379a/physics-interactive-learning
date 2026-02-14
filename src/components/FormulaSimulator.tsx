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
  },
  {
    id: 'centripetal-force',
    name: '向心力',
    description: '物体做圆周运动所需的力',
    latex: 'F_n = m\\frac{v^2}{r}',
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
        min: 1,
        max: 100,
        default: 10,
        unit: 'm/s',
        description: '线速度'
      },
      {
        name: 'radius',
        symbol: 'r',
        min: 0.1,
        max: 50,
        default: 5,
        unit: 'm',
        description: '轨道半径'
      }
    ],
    calculate: (v) => v.mass * Math.pow(v.velocity, 2) / v.radius,
    resultUnit: 'N'
  },
  {
    id: 'gravitation',
    name: '万有引力',
    description: '两个物体之间的引力',
    latex: 'F = G\\frac{Mm}{r^2}',
    variables: [
      {
        name: 'mass1',
        symbol: 'M',
        min: 1e20,
        max: 1e30,
        default: 5.972e24,
        unit: 'kg',
        description: '质量1'
      },
      {
        name: 'mass2',
        symbol: 'm',
        min: 1,
        max: 1e10,
        default: 1000,
        unit: 'kg',
        description: '质量2'
      },
      {
        name: 'distance',
        symbol: 'r',
        min: 1e6,
        max: 1e9,
        default: 6.371e6,
        unit: 'm',
        description: '距离'
      }
    ],
    calculate: (v) => 6.674e-11 * v.mass1 * v.mass2 / Math.pow(v.distance, 2),
    resultUnit: 'N'
  },
  {
    id: 'escape-velocity',
    name: '第一宇宙速度',
    description: '卫星环绕地球做圆周运动的最小发射速度',
    latex: 'v_1 = \\sqrt{\\frac{GM}{R}} = \\sqrt{gR}',
    variables: [
      {
        name: 'gravity',
        symbol: 'g',
        min: 1.6,
        max: 10,
        default: 9.8,
        unit: 'm/s²',
        description: '重力加速度'
      },
      {
        name: 'radius',
        symbol: 'R',
        min: 1e6,
        max: 1e8,
        default: 6.371e6,
        unit: 'm',
        description: '星球半径'
      }
    ],
    calculate: (v) => Math.sqrt(v.gravity * v.radius),
    resultUnit: 'm/s'
  },
  {
    id: 'electric-field',
    name: '点电荷电场强度',
    description: '点电荷产生的电场强度',
    latex: 'E = k\\frac{Q}{r^2}',
    variables: [
      {
        name: 'charge',
        symbol: 'Q',
        min: -1e-6,
        max: 1e-6,
        default: 1e-9,
        unit: 'C',
        description: '电荷量'
      },
      {
        name: 'distance',
        symbol: 'r',
        min: 0.01,
        max: 10,
        default: 0.1,
        unit: 'm',
        description: '距离'
      }
    ],
    calculate: (v) => 8.99e9 * v.charge / Math.pow(v.distance, 2),
    resultUnit: 'N/C'
  },
  {
    id: 'capacitor',
    name: '平行板电容器电容',
    description: '平行板电容器的电容',
    latex: 'C = \\frac{\\varepsilon S}{4\\pi kd}',
    variables: [
      {
        name: 'area',
        symbol: 'S',
        min: 0.0001,
        max: 1,
        default: 0.01,
        unit: 'm²',
        description: '极板面积'
      },
      {
        name: 'distance',
        symbol: 'd',
        min: 0.0001,
        max: 0.1,
        default: 0.001,
        unit: 'm',
        description: '极板间距'
      },
      {
        name: 'dielectric',
        symbol: 'ε',
        min: 1,
        max: 10,
        default: 4,
        unit: '',
        description: '介电常数'
      }
    ],
    calculate: (v) => v.dielectric * 8.854e-12 * v.area / v.distance,
    resultUnit: 'F'
  },
  {
    id: 'induction-emf',
    name: '切割磁感线感应电动势',
    description: '导体棒切割磁感线产生的感应电动势',
    latex: '\\mathcal{E} = BLv',
    variables: [
      {
        name: 'magnetic-field',
        symbol: 'B',
        min: 0.01,
        max: 10,
        default: 0.5,
        unit: 'T',
        description: '磁感应强度'
      },
      {
        name: 'length',
        symbol: 'L',
        min: 0.1,
        max: 10,
        default: 1,
        unit: 'm',
        description: '导体棒长度'
      },
      {
        name: 'velocity',
        symbol: 'v',
        min: 0,
        max: 100,
        default: 10,
        unit: 'm/s',
        description: '切割速度'
      }
    ],
    calculate: (v) => v.magneticField * v.length * v.velocity,
    resultUnit: 'V'
  },
  {
    id: 'lorentz-force',
    name: '洛伦兹力',
    description: '带电粒子在磁场中受到的力',
    latex: 'F = qvB',
    variables: [
      {
        name: 'charge',
        symbol: 'q',
        min: -1e-6,
        max: 1e-6,
        default: 1.6e-19,
        unit: 'C',
        description: '电荷量'
      },
      {
        name: 'velocity',
        symbol: 'v',
        min: 1,
        max: 1e7,
        default: 1e6,
        unit: 'm/s',
        description: '速度'
      },
      {
        name: 'magnetic-field',
        symbol: 'B',
        min: 0.001,
        max: 10,
        default: 0.1,
        unit: 'T',
        description: '磁感应强度'
      }
    ],
    calculate: (v) => v.charge * v.velocity * v.magneticField,
    resultUnit: 'N'
  },
  {
    id: 'simple-pendulum',
    name: '单摆周期',
    description: '单摆的振动周期',
    latex: 'T = 2\\pi\\sqrt{\\frac{l}{g}}',
    variables: [
      {
        name: 'length',
        symbol: 'l',
        min: 0.1,
        max: 10,
        default: 1,
        unit: 'm',
        description: '摆长'
      },
      {
        name: 'gravity',
        symbol: 'g',
        min: 1.6,
        max: 10,
        default: 9.8,
        unit: 'm/s²',
        description: '重力加速度'
      }
    ],
    calculate: (v) => 2 * Math.PI * Math.sqrt(v.length / v.gravity),
    resultUnit: 's'
  },
  {
    id: 'wave-speed',
    name: '机械波速度',
    description: '机械波的传播速度',
    latex: 'v = \\lambda f',
    variables: [
      {
        name: 'wavelength',
        symbol: 'λ',
        min: 0.1,
        max: 100,
        default: 2,
        unit: 'm',
        description: '波长'
      },
      {
        name: 'frequency',
        symbol: 'f',
        min: 1,
        max: 1000,
        default: 50,
        unit: 'Hz',
        description: '频率'
      }
    ],
    calculate: (v) => v.wavelength * v.frequency,
    resultUnit: 'm/s'
  },
  {
    id: 'photoelectric',
    name: '光电效应方程',
    description: '光电子的最大初动能',
    latex: 'E_k = hf - W_0',
    variables: [
      {
        name: 'frequency',
        symbol: 'f',
        min: 1e14,
        max: 1e16,
        default: 5e14,
        unit: 'Hz',
        description: '入射光频率'
      },
      {
        name: 'work-function',
        symbol: 'W₀',
        min: 1,
        max: 10,
        default: 2,
        unit: 'eV',
        description: '逸出功'
      }
    ],
    calculate: (v) => 4.136e-15 * v.frequency - v.workFunction,
    resultUnit: 'eV'
  },
  {
    id: 'interference-spacing',
    name: '双缝干涉条纹间距',
    description: '双缝干涉实验中相邻亮条纹或暗条纹的间距',
    latex: '\\Delta x = \\frac{L\\lambda}{d}',
    variables: [
      {
        name: 'screen-distance',
        symbol: 'L',
        min: 0.1,
        max: 10,
        default: 1,
        unit: 'm',
        description: '双缝到屏距离'
      },
      {
        name: 'wavelength',
        symbol: 'λ',
        min: 400,
        max: 700,
        default: 600,
        unit: 'nm',
        description: '光波长'
      },
      {
        name: 'slit-distance',
        symbol: 'd',
        min: 0.0001,
        max: 0.01,
        default: 0.001,
        unit: 'm',
        description: '双缝间距'
      }
    ],
    calculate: (v) => (v.screenDistance * v.wavelength * 1e-9) / v.slitDistance,
    resultUnit: 'm'
  },
  {
    id: 'sound-speed',
    name: '空气中声速',
    description: '温度对空气中声速的影响',
    latex: 'v = 331 + 0.6t',
    variables: [
      {
        name: 'temperature',
        symbol: 't',
        min: -40,
        max: 100,
        default: 20,
        unit: '℃',
        description: '温度'
      }
    ],
    calculate: (v) => 331 + 0.6 * v.temperature,
    resultUnit: 'm/s'
  },
  {
    id: 'sound-level',
    name: '声强级',
    description: '声强与声强级的关系',
    latex: 'L = 10\\log_{10}\\frac{I}{I_0}',
    variables: [
      {
        name: 'intensity',
        symbol: 'I',
        min: 1e-12,
        max: 1e-6,
        default: 1e-10,
        unit: 'W/m²',
        description: '声强'
      }
    ],
    calculate: (v) => 10 * Math.log10(v.intensity / 1e-12),
    resultUnit: 'dB'
  },
  {
    id: 'doppler',
    name: '多普勒效应',
    description: '波源接近观察者时的频率变化',
    latex: "f' = f \\cdot \\frac{v}{v - v_s}",
    variables: [
      {
        name: 'source-freq',
        symbol: 'f',
        min: 100,
        max: 20000,
        default: 440,
        unit: 'Hz',
        description: '波源频率'
      },
      {
        name: 'sound-speed',
        symbol: 'v',
        min: 300,
        max: 400,
        default: 340,
        unit: 'm/s',
        description: '声速'
      },
      {
        name: 'source-speed',
        symbol: 'vₛ',
        min: 0,
        max: 100,
        default: 20,
        unit: 'm/s',
        description: '波源速度'
      }
    ],
    calculate: (v) => v.sourceFreq * v.soundSpeed / (v.soundSpeed - v.sourceSpeed),
    resultUnit: 'Hz'
  },
  {
    id: 'standing-wave-string',
    name: '弦的驻波',
    description: '弦上驻波的频率与长度关系',
    latex: 'f = \\frac{nv}{2L}',
    variables: [
      {
        name: 'harmonic',
        symbol: 'n',
        min: 1,
        max: 10,
        default: 1,
        unit: '',
        description: '谐波次数'
      },
      {
        name: 'wave-speed',
        symbol: 'v',
        min: 100,
        max: 1000,
        default: 300,
        unit: 'm/s',
        description: '波速'
      },
      {
        name: 'length',
        symbol: 'L',
        min: 0.1,
        max: 2,
        default: 0.65,
        unit: 'm',
        description: '弦长'
      }
    ],
    calculate: (v) => v.harmonic * v.waveSpeed / (2 * v.length),
    resultUnit: 'Hz'
  },
  {
    id: 'echo-time',
    name: '回声时间',
    description: '声音反射回来的时间',
    latex: 't = \\frac{2d}{v}',
    variables: [
      {
        name: 'distance',
        symbol: 'd',
        min: 10,
        max: 1000,
        default: 170,
        unit: 'm',
        description: '距离'
      },
      {
        name: 'sound-speed',
        symbol: 'v',
        min: 300,
        max: 400,
        default: 340,
        unit: 'm/s',
        description: '声速'
      }
    ],
    calculate: (v) => 2 * v.distance / v.soundSpeed,
    resultUnit: 's'
  },
  {
    id: 'pipe-resonance-open',
    name: '开管共振频率',
    description: '开管乐器的基本频率',
    latex: 'f = \\frac{nv}{2L}',
    variables: [
      {
        name: 'harmonic',
        symbol: 'n',
        min: 1,
        max: 5,
        default: 1,
        unit: '',
        description: '谐波次数'
      },
      {
        name: 'sound-speed',
        symbol: 'v',
        min: 300,
        max: 400,
        default: 340,
        unit: 'm/s',
        description: '声速'
      },
      {
        name: 'length',
        symbol: 'L',
        min: 0.1,
        max: 3,
        default: 0.5,
        unit: 'm',
        description: '管长'
      }
    ],
    calculate: (v) => v.harmonic * v.soundSpeed / (2 * v.length),
    resultUnit: 'Hz'
  },
  {
    id: 'pipe-resonance-closed',
    name: '闭管共振频率',
    description: '闭管乐器的基本频率',
    latex: 'f = \\frac{(2n-1)v}{4L}',
    variables: [
      {
        name: 'harmonic',
        symbol: 'n',
        min: 1,
        max: 5,
        default: 1,
        unit: '',
        description: '谐波次数'
      },
      {
        name: 'sound-speed',
        symbol: 'v',
        min: 300,
        max: 400,
        default: 340,
        unit: 'm/s',
        description: '声速'
      },
      {
        name: 'length',
        symbol: 'L',
        min: 0.1,
        max: 3,
        default: 0.5,
        unit: 'm',
        description: '管长'
      }
    ],
    calculate: (v) => (2 * v.harmonic - 1) * v.soundSpeed / (4 * v.length),
    resultUnit: 'Hz'
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
          <div className="card-tech rounded-xl p-5 border border-white/10">
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
          <div className="card-tech rounded-xl p-4 border border-white/10">
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
            <div className="card-tech rounded-xl p-4 border border-white/10">
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

          <div className="card-tech rounded-xl p-5 border border-white/10">
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
