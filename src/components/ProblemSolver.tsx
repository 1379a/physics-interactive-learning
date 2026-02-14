'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false,
  loading: () => <span className="text-blue-400">加载公式...</span>
});

interface ProblemType {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: {
    step: number;
    title: string;
    content: string;
    formula?: string;
  }[];
}

const problemTypes: ProblemType[] = [
  {
    id: 'incline',
    category: '力学',
    title: '斜面问题',
    description: '分析物体在斜面上的受力和运动',
    steps: [
      { step: 1, title: '确定研究对象', content: '明确要分析的物体，画出受力分析图' },
      { step: 2, title: '分析受力', content: '识别所有作用在物体上的力：重力、支持力、摩擦力等', formula: 'F_{net} = \\sum F' },
      { step: 3, title: '建立坐标系', content: '通常沿斜面方向和垂直斜面方向建立坐标系', formula: 'F_x = mg\\sin\\theta - f, F_y = N - mg\\cos\\theta = 0' },
      { step: 4, title: '应用牛顿定律', content: '根据牛顿第二定律列方程求解', formula: 'ma = mg\\sin\\theta - \\mu mg\\cos\\theta' },
      { step: 5, title: '计算结果', content: '解方程，计算加速度、速度、位移等物理量' }
    ]
  },
  {
    id: 'capacitor',
    category: '电磁学',
    title: '电容充放电',
    description: '分析电容器的充电和放电过程',
    steps: [
      { step: 1, title: '识别电路类型', content: '确定是RC充电还是放电电路' },
      { step: 2, title: '计算时间常数', content: '确定电路的时间常数τ', formula: '\\tau = RC' },
      { step: 3, title: '写出电容电压公式', content: '根据初始条件写出电压表达式', formula: 'V_C(t) = V_0(1 - e^{-t/\\tau}) (充电时)' },
      { step: 4, title: '计算电流', content: '利用I = C(dV/dt)或I = V/R计算电流', formula: 'I(t) = \\frac{V_0}{R}e^{-t/\\tau}' },
      { step: 5, title: '求特定时刻的值', content: '代入时间t，求出特定时刻的电压和电流' }
    ]
  },
  {
    id: 'interference',
    category: '光学',
    title: '干涉计算',
    description: '计算双缝干涉的明暗条纹位置',
    steps: [
      { step: 1, title: '确定实验参数', content: '明确双缝间距d、屏距L、波长λ' },
      { step: 2, title: '计算条纹间距', content: '使用公式计算相邻条纹的间距', formula: '\\Delta x = \\frac{\\lambda L}{d}' },
      { step: 3, title: '判断明暗条件', content: '根据光程差判断明暗条纹', formula: '\\delta = d\\sin\\theta' },
      { step: 4, title: '计算位置', content: '计算第k级明/暗条纹在屏上的位置', formula: 'x_k = \\frac{k\\lambda L}{d}' },
      { step: 5, title: '验证结果', content: '检查结果是否合理，如条纹是否对称分布' }
    ]
  }
];

const constants = [
  { name: '重力加速度', symbol: 'g', value: '9.80665', unit: 'm/s²' },
  { name: '光速', symbol: 'c', value: '299792458', unit: 'm/s' },
  { name: '普朗克常数', symbol: 'h', value: '6.626×10⁻³⁴', unit: 'J·s' },
  { name: '电子电荷', symbol: 'e', value: '1.602×10⁻¹⁹', unit: 'C' },
  { name: '万有引力常数', symbol: 'G', value: '6.674×10⁻¹¹', unit: 'N·m²/kg²' },
  { name: '库仑常数', symbol: 'k', value: '8.988×10⁹', unit: 'N·m²/C²' },
  { name: '真空磁导率', symbol: 'μ₀', value: '4π×10⁻⁷', unit: 'H/m' },
  { name: '玻尔兹曼常数', symbol: 'k', value: '1.381×10⁻²³', unit: 'J/K' }
];

// 常见液体密度
const liquidDensities = [
  { name: '水', value: 1.0, unit: 'g/cm³', value2: 1000, unit2: 'kg/m³', temperature: '4°C' },
  { name: '海水', value: 1.025, unit: 'g/cm³', value2: 1025, unit2: 'kg/m³', temperature: '20°C' },
  { name: '乙醇（酒精）', value: 0.789, unit: 'g/cm³', value2: 789, unit2: 'kg/m³', temperature: '20°C' },
  { name: '丙酮', value: 0.791, unit: 'g/cm³', value2: 791, unit2: 'kg/m³', temperature: '20°C' },
  { name: '汽油', value: 0.72, unit: 'g/cm³', value2: 720, unit2: 'kg/m³', temperature: '20°C' },
  { name: '柴油', value: 0.85, unit: 'g/cm³', value2: 850, unit2: 'kg/m³', temperature: '20°C' },
  { name: '煤油', value: 0.81, unit: 'g/cm³', value2: 810, unit2: 'kg/m³', temperature: '20°C' },
  { name: '甘油', value: 1.26, unit: 'g/cm³', value2: 1260, unit2: 'kg/m³', temperature: '20°C' },
  { name: '水银（汞）', value: 13.6, unit: 'g/cm³', value2: 13600, unit2: 'kg/m³', temperature: '20°C' },
  { name: '食用油', value: 0.92, unit: 'g/cm³', value2: 920, unit2: 'kg/m³', temperature: '20°C' },
  { name: '蜂蜜', value: 1.42, unit: 'g/cm³', value2: 1420, unit2: 'kg/m³', temperature: '20°C' },
  { name: '血液', value: 1.06, unit: 'g/cm³', value2: 1060, unit2: 'kg/m³', temperature: '37°C' },
  { name: '牛奶', value: 1.03, unit: 'g/cm³', value2: 1030, unit2: 'kg/m³', temperature: '20°C' }
];

// 常见固体密度
const solidDensities = [
  { name: '金', value: 19.32, unit: 'g/cm³', value2: 19320, unit2: 'kg/m³' },
  { name: '铂', value: 21.45, unit: 'g/cm³', value2: 21450, unit2: 'kg/m³' },
  { name: '铅', value: 11.34, unit: 'g/cm³', value2: 11340, unit2: 'kg/m³' },
  { name: '银', value: 10.49, unit: 'g/cm³', value2: 10490, unit2: 'kg/m³' },
  { name: '铜', value: 8.96, unit: 'g/cm³', value2: 8960, unit2: 'kg/m³' },
  { name: '铁', value: 7.87, unit: 'g/cm³', value2: 7870, unit2: 'kg/m³' },
  { name: '钢', value: 7.85, unit: 'g/cm³', value2: 7850, unit2: 'kg/m³' },
  { name: '铝', value: 2.70, unit: 'g/cm³', value2: 2700, unit2: 'kg/m³' },
  { name: '镁', value: 1.74, unit: 'g/cm³', value2: 1740, unit2: 'kg/m³' },
  { name: '钛', value: 4.54, unit: 'g/cm³', value2: 4540, unit2: 'kg/m³' },
  { name: '钨', value: 19.30, unit: 'g/cm³', value2: 19300, unit2: 'kg/m³' },
  { name: '金刚石', value: 3.51, unit: 'g/cm³', value2: 3510, unit2: 'kg/m³' },
  { name: '玻璃（普通）', value: 2.5, unit: 'g/cm³', value2: 2500, unit2: 'kg/m³' },
  { name: '混凝土', value: 2.4, unit: 'g/cm³', value2: 2400, unit2: 'kg/m³' },
  { name: '冰', value: 0.92, unit: 'g/cm³', value2: 920, unit2: 'kg/m³', temperature: '0°C' }
];

// 常见气体密度（标准状况下）
const gasDensities = [
  { name: '氢气', value: 0.0899, unit: 'g/L', value2: 0.0899, unit2: 'kg/m³' },
  { name: '氦气', value: 0.1785, unit: 'g/L', value2: 0.1785, unit2: 'kg/m³' },
  { name: '甲烷', value: 0.7168, unit: 'g/L', value2: 0.7168, unit2: 'kg/m³' },
  { name: '氨气', value: 0.771, unit: 'g/L', value2: 0.771, unit2: 'kg/m³' },
  { name: '氮气', value: 1.2506, unit: 'g/L', value2: 1.2506, unit2: 'kg/m³' },
  { name: '一氧化碳', value: 1.2504, unit: 'g/L', value2: 1.2504, unit2: 'kg/m³' },
  { name: '空气', value: 1.293, unit: 'g/L', value2: 1.293, unit2: 'kg/m³' },
  { name: '氧气', value: 1.429, unit: 'g/L', value2: 1.429, unit2: 'kg/m³' },
  { name: '二氧化碳', value: 1.977, unit: 'g/L', value2: 1.977, unit2: 'kg/m³' },
  { name: '氯气', value: 3.214, unit: 'g/L', value2: 3.214, unit2: 'kg/m³' }
];

// 天体数据
const celestialData = [
  {
    name: '太阳',
    mass: '1.989×10³⁰',
    massUnit: 'kg',
    density: '1.408×10³',
    densityUnit: 'kg/m³',
    period: '2.3×10⁸',
    periodUnit: '年（银河系）',
    angularVelocity: '8.7×10⁻⁸',
    angularVelocityUnit: 'rad/h',
    velocity: '220',
    velocityUnit: 'km/s',
    volume: '1.41×10²⁷',
    volumeUnit: 'm³'
  },
  {
    name: '地球',
    mass: '5.972×10²⁴',
    massUnit: 'kg',
    density: '5.514×10³',
    densityUnit: 'kg/m³',
    period: '365.25',
    periodUnit: '天',
    angularVelocity: '7.29×10⁻⁵',
    angularVelocityUnit: 'rad/s',
    velocity: '29.78',
    velocityUnit: 'km/s',
    volume: '1.083×10²¹',
    volumeUnit: 'm³'
  },
  {
    name: '月球',
    mass: '7.342×10²²',
    massUnit: 'kg',
    density: '3.344×10³',
    densityUnit: 'kg/m³',
    period: '27.32',
    periodUnit: '天',
    angularVelocity: '2.66×10⁻⁶',
    angularVelocityUnit: 'rad/s',
    velocity: '1.022',
    velocityUnit: 'km/s',
    volume: '2.196×10¹⁹',
    volumeUnit: 'm³'
  },
  {
    name: '火星',
    mass: '6.39×10²³',
    massUnit: 'kg',
    density: '3.933×10³',
    densityUnit: 'kg/m³',
    period: '687',
    periodUnit: '天',
    angularVelocity: '7.09×10⁻⁵',
    angularVelocityUnit: 'rad/s',
    velocity: '24.07',
    velocityUnit: 'km/s',
    volume: '1.631×10²⁰',
    volumeUnit: 'm³'
  },
  {
    name: '木星',
    mass: '1.898×10²⁷',
    massUnit: 'kg',
    density: '1.326×10³',
    densityUnit: 'kg/m³',
    period: '11.86',
    periodUnit: '年',
    angularVelocity: '1.76×10⁻⁴',
    angularVelocityUnit: 'rad/s',
    velocity: '13.07',
    velocityUnit: 'km/s',
    volume: '1.431×10²⁴',
    volumeUnit: 'm³'
  },
  {
    name: '土星',
    mass: '5.683×10²⁶',
    massUnit: 'kg',
    density: '0.687×10³',
    densityUnit: 'kg/m³',
    period: '29.46',
    periodUnit: '年',
    angularVelocity: '1.638×10⁻⁸',
    angularVelocityUnit: 'rad/s',
    velocity: '9.69',
    velocityUnit: 'km/s',
    volume: '8.27×10²³',
    volumeUnit: 'm³'
  },
  {
    name: '天王星',
    mass: '8.681×10²⁵',
    massUnit: 'kg',
    density: '1.27×10³',
    densityUnit: 'kg/m³',
    period: '84.01',
    periodUnit: '年',
    angularVelocity: '2.37×10⁻⁹',
    angularVelocityUnit: 'rad/s',
    velocity: '6.81',
    velocityUnit: 'km/s',
    volume: '6.83×10²²',
    volumeUnit: 'm³'
  },
  {
    name: '海王星',
    mass: '1.024×10²⁶',
    massUnit: 'kg',
    density: '1.638×10³',
    densityUnit: 'kg/m³',
    period: '164.8',
    periodUnit: '年',
    angularVelocity: '1.21×10⁻⁹',
    angularVelocityUnit: 'rad/s',
    velocity: '5.43',
    velocityUnit: 'km/s',
    volume: '6.25×10²²',
    volumeUnit: 'm³'
  }
];

// 单位转换配置
const conversionCategories: Record<string, {
  name: string;
  units: { name: string; symbol: string; factor: number }[];
  special?: boolean;
}> = {
  length: {
    name: '长度',
    units: [
      { name: '米', symbol: 'm', factor: 1 },
      { name: '千米', symbol: 'km', factor: 1000 },
      { name: '厘米', symbol: 'cm', factor: 0.01 },
      { name: '毫米', symbol: 'mm', factor: 0.001 },
      { name: '微米', symbol: 'μm', factor: 1e-6 },
      { name: '纳米', symbol: 'nm', factor: 1e-9 },
      { name: '分米', symbol: 'dm', factor: 0.1 }
    ]
  },
  mass: {
    name: '质量',
    units: [
      { name: '千克', symbol: 'kg', factor: 1 },
      { name: '克', symbol: 'g', factor: 0.001 },
      { name: '毫克', symbol: 'mg', factor: 1e-6 },
      { name: '吨', symbol: 't', factor: 1000 },
      { name: '微克', symbol: 'μg', factor: 1e-9 }
    ]
  },
  time: {
    name: '时间',
    units: [
      { name: '秒', symbol: 's', factor: 1 },
      { name: '分', symbol: 'min', factor: 60 },
      { name: '时', symbol: 'h', factor: 3600 },
      { name: '天', symbol: 'd', factor: 86400 },
      { name: '毫秒', symbol: 'ms', factor: 0.001 },
      { name: '微秒', symbol: 'μs', factor: 1e-6 }
    ]
  },
  area: {
    name: '面积',
    units: [
      { name: '平方米', symbol: 'm²', factor: 1 },
      { name: '平方千米', symbol: 'km²', factor: 1e6 },
      { name: '平方厘米', symbol: 'cm²', factor: 1e-4 },
      { name: '平方毫米', symbol: 'mm²', factor: 1e-6 },
      { name: '公顷', symbol: 'ha', factor: 1e4 },
      { name: '亩', symbol: '亩', factor: 666.67 }
    ]
  },
  volume: {
    name: '体积',
    units: [
      { name: '立方米', symbol: 'm³', factor: 1 },
      { name: '升', symbol: 'L', factor: 0.001 },
      { name: '毫升', symbol: 'mL', factor: 1e-6 },
      { name: '立方厘米', symbol: 'cm³', factor: 1e-6 },
      { name: '立方毫米', symbol: 'mm³', factor: 1e-9 }
    ]
  },
  speed: {
    name: '速度',
    units: [
      { name: '米/秒', symbol: 'm/s', factor: 1 },
      { name: '千米/时', symbol: 'km/h', factor: 0.27778 },
      { name: '千米/秒', symbol: 'km/s', factor: 1000 },
      { name: '厘米/秒', symbol: 'cm/s', factor: 0.01 }
    ]
  },
  force: {
    name: '力',
    units: [
      { name: '牛顿', symbol: 'N', factor: 1 },
      { name: '千牛', symbol: 'kN', factor: 1000 },
      { name: '毫牛', symbol: 'mN', factor: 0.001 },
      { name: '达因', symbol: 'dyn', factor: 1e-5 }
    ]
  },
  energy: {
    name: '能量',
    units: [
      { name: '焦耳', symbol: 'J', factor: 1 },
      { name: '千焦', symbol: 'kJ', factor: 1000 },
      { name: '兆焦', symbol: 'MJ', factor: 1e6 },
      { name: '卡路里', symbol: 'cal', factor: 4.1868 },
      { name: '千卡', symbol: 'kcal', factor: 4186.8 },
      { name: '千瓦时', symbol: 'kWh', factor: 3.6e6 }
    ]
  },
  power: {
    name: '功率',
    units: [
      { name: '瓦特', symbol: 'W', factor: 1 },
      { name: '千瓦', symbol: 'kW', factor: 1000 },
      { name: '兆瓦', symbol: 'MW', factor: 1e6 },
      { name: '马力', symbol: 'hp', factor: 735.5 }
    ]
  },
  pressure: {
    name: '压力',
    units: [
      { name: '帕斯卡', symbol: 'Pa', factor: 1 },
      { name: '千帕', symbol: 'kPa', factor: 1000 },
      { name: '兆帕', symbol: 'MPa', factor: 1e6 },
      { name: '巴', symbol: 'bar', factor: 1e5 },
      { name: '标准大气压', symbol: 'atm', factor: 101325 }
    ]
  },
  temperature: {
    name: '温度',
    units: [
      { name: '摄氏度', symbol: '°C', factor: 1 },
      { name: '开尔文', symbol: 'K', factor: 1 },
      { name: '华氏度', symbol: '°F', factor: 1 }
    ],
    special: true
  }
};

export default function ProblemSolver() {
  const [activeTab, setActiveTab] = useState<'steps' | 'conversion' | 'constants' | 'materials'>('steps');
  const [selectedProblem, setSelectedProblem] = useState<ProblemType>(problemTypes[0]);
  
  // 单位转换状态
  const [category, setCategory] = useState<keyof typeof conversionCategories>('length');
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [inputValue, setInputValue] = useState('');

  // 常用物理量标签
  const [materialTab, setMaterialTab] = useState<'liquid' | 'solid' | 'gas' | 'celestial'>('liquid');

  // 计算转换结果
  const convert = (value: number) => {
    const categoryData = conversionCategories[category];
    
    if (categoryData.special) {
      // 特殊处理温度转换
      const fromSymbol = categoryData.units[fromUnit].symbol;
      const toSymbol = categoryData.units[toUnit].symbol;
      
      let kelvin: number;
      // 先转换为开尔文
      if (fromSymbol === '°C') {
        kelvin = value + 273.15;
      } else if (fromSymbol === '°F') {
        kelvin = (value - 32) * 5/9 + 273.15;
      } else {
        kelvin = value;
      }
      
      // 从开尔文转换到目标单位
      if (toSymbol === '°C') {
        return kelvin - 273.15;
      } else if (toSymbol === '°F') {
        return (kelvin - 273.15) * 9/5 + 32;
      } else {
        return kelvin;
      }
    } else {
      const fromFactor = categoryData.units[fromUnit].factor;
      const toFactor = categoryData.units[toUnit].factor;
      const baseValue = value * fromFactor;
      return baseValue / toFactor;
    }
  };

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return '';
    return convert(value).toFixed(6);
  };

  const result = inputValue ? handleConvert() : '';

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">💡</div>
        <div>
          <h2 className="text-2xl font-bold">问题求解辅助器</h2>
          <p className="text-sm text-blue-300/80">解题步骤向导、单位转换、常数查询</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setActiveTab('steps')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'steps' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-blue-300'}`}>📋 解题步骤</button>
        <button onClick={() => setActiveTab('conversion')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'conversion' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-blue-300'}`}>🔄 单位转换</button>
        <button onClick={() => setActiveTab('constants')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'constants' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-blue-300'}`}>📊 常数查询</button>
        <button onClick={() => setActiveTab('materials')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'materials' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-blue-300'}`}>🧪 常用物理量</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {activeTab === 'steps' && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-blue-300">题型分类</h3>
              <div className="space-y-2">
                {problemTypes.map((problem) => (
                  <button key={problem.id} onClick={() => setSelectedProblem(problem)} className={`w-full p-3 rounded-lg text-left transition-all ${selectedProblem.id === problem.id ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{problem.title}</div>
                        <div className="text-xs text-blue-300/70 mt-1">{problem.description}</div>
                      </div>
                      <span className="text-xs bg-blue-600/30 px-2 py-1 rounded">{problem.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'conversion' && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-blue-300">单位类别</h3>
              <div className="space-y-2">
                {Object.entries(conversionCategories).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key as keyof typeof conversionCategories)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${category === key ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
                  >
                    <span className="font-medium">{data.name}</span>
                    <span className="text-xs text-blue-300/70 ml-2">({data.units.length} 种单位)</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-5 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">📝</div>
                  <h3 className="text-xl font-bold">{selectedProblem.title}</h3>
                </div>
                <p className="text-sm text-blue-300/80">{selectedProblem.description}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h4 className="text-lg font-semibold mb-4 text-blue-300">解题步骤</h4>
                <div className="space-y-4">
                  {selectedProblem.steps.map((step) => (
                    <div key={step.step} className="relative pl-8">
                      <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{step.step}</div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-blue-200">{step.title}</h5>
                        <p className="text-sm text-blue-100/80">{step.content}</p>
                        {step.formula && (
                          <div className="bg-black/30 rounded-lg p-3 mt-2">
                            <BlockMath math={step.formula} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-sm font-semibold mb-3 text-blue-300">💡 解题提示</div>
                <ul className="space-y-2 text-sm text-blue-100/80">
                  <li>• 仔细审题，明确已知条件和未知量</li>
                  <li>• 画示意图，帮助理解物理情境</li>
                  <li>• 选择合适的坐标系和参考系</li>
                  <li>• 检查单位和量纲是否正确</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'constants' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h4 className="text-lg font-semibold mb-4 text-blue-300">物理常数查询表</h4>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {constants.map((constant, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4 flex justify-between items-center hover:bg-black/40 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-bold">{constant.symbol}</span>
                          <span className="text-sm font-semibold">{constant.name}</span>
                        </div>
                        <div className="text-sm text-blue-300/70 mt-1">{constant.value} {constant.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setMaterialTab('liquid')} className={`px-4 py-2 rounded-lg transition-all ${materialTab === 'liquid' ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>💧 液体</button>
                <button onClick={() => setMaterialTab('solid')} className={`px-4 py-2 rounded-lg transition-all ${materialTab === 'solid' ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>🪨 固体</button>
                <button onClick={() => setMaterialTab('gas')} className={`px-4 py-2 rounded-lg transition-all ${materialTab === 'gas' ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>💨 气体</button>
                <button onClick={() => setMaterialTab('celestial')} className={`px-4 py-2 rounded-lg transition-all ${materialTab === 'celestial' ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>🌌 天体</button>
              </div>

              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-2 text-blue-300">名称</th>
                        {materialTab !== 'celestial' && <th className="text-left py-3 px-2 text-blue-300">密度值</th>}
                        <th className="text-left py-3 px-2 text-blue-300">单位</th>
                        {materialTab !== 'celestial' && <th className="text-left py-3 px-2 text-blue-300">密度值</th>}
                        {materialTab !== 'celestial' && <th className="text-left py-3 px-2 text-blue-300">单位</th>}
                        {materialTab === 'celestial' && <th className="text-left py-3 px-2 text-blue-300">质量</th>}
                        {materialTab === 'celestial' && <th className="text-left py-3 px-2 text-blue-300">密度</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {materialTab === 'liquid' && liquidDensities.map((item, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2 font-medium">{item.name}</td>
                          <td className="py-3 px-2">{item.value}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.unit}</td>
                          <td className="py-3 px-2">{item.value2}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.unit2}</td>
                        </tr>
                      ))}
                      {materialTab === 'solid' && solidDensities.map((item, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2 font-medium">{item.name}</td>
                          <td className="py-3 px-2">{item.value}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.unit}</td>
                          <td className="py-3 px-2">{item.value2}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.unit2}</td>
                        </tr>
                      ))}
                      {materialTab === 'gas' && gasDensities.map((item, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2 font-medium">{item.name}</td>
                          <td className="py-3 px-2">{item.value}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.unit}</td>
                          <td className="py-3 px-2">{item.value2}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.unit2}</td>
                        </tr>
                      ))}
                      {materialTab === 'celestial' && celestialData.map((item, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2 font-medium">{item.name}</td>
                          <td className="py-3 px-2">{item.mass}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.massUnit}</td>
                          <td className="py-3 px-2">{item.density}</td>
                          <td className="py-3 px-2 text-blue-300/70">{item.densityUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {materialTab === 'celestial' && (
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h4 className="text-lg font-semibold mb-4 text-blue-300">天体运动数据</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-2 text-blue-300">名称</th>
                          <th className="text-left py-3 px-2 text-blue-300">周期</th>
                          <th className="text-left py-3 px-2 text-blue-300">角速度</th>
                          <th className="text-left py-3 px-2 text-blue-300">线速度</th>
                          <th className="text-left py-3 px-2 text-blue-300">体积</th>
                        </tr>
                      </thead>
                      <tbody>
                        {celestialData.map((item, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-2 font-medium">{item.name}</td>
                            <td className="py-3 px-2">{item.period} {item.periodUnit}</td>
                            <td className="py-3 px-2">{item.angularVelocity} {item.angularVelocityUnit}</td>
                            <td className="py-3 px-2">{item.velocity} {item.velocityUnit}</td>
                            <td className="py-3 px-2">{item.volume} {item.volumeUnit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'conversion' && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold mb-4 text-blue-300">
                {conversionCategories[category].name}单位转换器
              </h4>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-200">原始数值</label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="输入要转换的数值"
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-blue-200">从</label>
                    <select
                      value={fromUnit}
                      onChange={(e) => setFromUnit(parseInt(e.target.value))}
                      className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    >
                      {conversionCategories[category].units.map((unit, index) => (
                        <option key={index} value={index}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-blue-200">到</label>
                    <select
                      value={toUnit}
                      onChange={(e) => setToUnit(parseInt(e.target.value))}
                      className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    >
                      {conversionCategories[category].units.map((unit, index) => (
                        <option key={index} value={index}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {result && (
                  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-sm text-blue-300/80 mb-1">转换结果</div>
                    <div className="text-2xl font-bold text-white">
                      {result} {conversionCategories[category].units[toUnit].symbol}
                    </div>
                  </div>
                )}

                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-xs text-blue-300/70 mb-2">转换公式</div>
                  <div className="text-sm text-blue-200">
                    {inputValue} {conversionCategories[category].units[fromUnit].symbol} = {result || '-'} {conversionCategories[category].units[toUnit].symbol}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
