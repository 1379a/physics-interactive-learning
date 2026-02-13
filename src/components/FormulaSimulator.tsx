'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false,
  loading: () => <span className="text-blue-400">加载公式...</span>
});

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

export default function FormulaSimulator() {
  const [selectedFormula, setSelectedFormula] = useState<Formula>(formulas[0]);
  const [values, setValues] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number>(0);
  const [history, setHistory] = useState<{ time: number; value: number }[]>([]);

  useEffect(() => {
    const initialValues: Record<string, number> = {};
    selectedFormula.variables.forEach(v => {
      initialValues[v.name] = v.default;
    });
    setValues(initialValues);
  }, [selectedFormula]);

  useEffect(() => {
    const newResult = selectedFormula.calculate(values);
    setResult(newResult);

    const now = Date.now();
    setHistory(prev => {
      const newHistory = [...prev, { time: now, value: newResult }];
      if (newHistory.length > 50) {
        return newHistory.slice(-50);
      }
      return newHistory;
    });
  }, [values, selectedFormula]);

  const handleValueChange = (variableName: string, newValue: number) => {
    setValues(prev => ({ ...prev, [variableName]: newValue }));
  };

  const resetValues = () => {
    const initialValues: Record<string, number> = {};
    selectedFormula.variables.forEach(v => {
      initialValues[v.name] = v.default;
    });
    setValues(initialValues);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🧮</div>
        <div>
          <h2 className="text-2xl font-bold">动态公式演绎器</h2>
          <p className="text-sm text-blue-300/80">调整变量参数，观察计算结果的变化</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：公式选择 */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">选择公式</h3>
          {formulas.map((formula) => (
            <button
              key={formula.id}
              onClick={() => setSelectedFormula(formula)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedFormula.id === formula.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <div className="font-semibold mb-1">{formula.name}</div>
              <div className="text-xs opacity-80 line-clamp-1">{formula.description}</div>
            </button>
          ))}
        </div>

        {/* 中间：公式展示和变量控制 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-center mb-4">
              <div className="text-lg mb-2">{selectedFormula.name}</div>
              <div className="text-sm text-blue-300/80 mb-4">{selectedFormula.description}</div>
              <div className="bg-black/30 rounded-lg p-4">
                <BlockMath math={selectedFormula.latex} />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="text-sm font-semibold text-blue-300 mb-3">变量参数</div>
              {selectedFormula.variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{variable.symbol}</span>
                      <span className="text-xs text-blue-300/70">{variable.description}</span>
                    </div>
                    <span className="text-sm font-mono bg-blue-600/30 px-2 py-1 rounded">
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
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-blue-300/60">
                    <span>{variable.min}</span>
                    <span>{variable.max}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetValues}
              className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
            >
              重置为默认值
            </button>
          </div>
        </div>

        {/* 右侧：结果显示和图表 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-5 border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-2">计算结果</div>
            <div className="text-4xl font-bold mb-2">
              {result?.toFixed(4) || '0.0000'} <span className="text-lg text-blue-400">{selectedFormula.resultUnit}</span>
            </div>
            <div className="text-xs text-blue-300/70">
              基于当前变量参数计算得出
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold mb-4 text-blue-300">结果变化趋势</div>
            <div className="h-48 flex items-end gap-1 overflow-hidden">
              {history.map((point, index) => {
                const maxVal = Math.max(...history.map(h => h.value), 0.001);
                const height = (point.value / maxVal) * 100;
                const intensity = (index / history.length);
                return (
                  <div
                    key={index}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor: `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-blue-300/60 mt-2">
              <span>历史</span>
              <span>当前</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold mb-3 text-blue-300">数值说明</div>
            <div className="space-y-2 text-sm">
              {selectedFormula.variables.map((variable) => (
                <div key={variable.name} className="flex justify-between">
                  <span className="text-blue-300/70">{variable.symbol} = </span>
                  <span className="font-mono">
                    {values[variable.name]?.toFixed(2) || variable.default.toFixed(2)} {variable.unit}
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span className="text-blue-400">结果 = </span>
                <span className="font-mono text-blue-400">
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
