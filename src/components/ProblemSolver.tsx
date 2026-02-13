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

export default function ProblemSolver() {
  const [activeTab, setActiveTab] = useState<'steps' | 'conversion' | 'constants'>('steps');
  const [selectedProblem, setSelectedProblem] = useState<ProblemType>(problemTypes[0]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">💡</div>
        <div>
          <h2 className="text-2xl font-bold">问题求解辅助器</h2>
          <p className="text-sm text-blue-300/80">解题步骤向导、单位转换、常数查询</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('steps')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'steps' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-blue-300'}`}>📋 解题步骤</button>
        <button onClick={() => setActiveTab('conversion')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'conversion' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-blue-300'}`}>🔄 单位转换</button>
        <button onClick={() => setActiveTab('constants')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'constants' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-blue-300'}`}>📊 常数查询</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
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

          {activeTab === 'conversion' && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h4 className="text-lg font-semibold mb-4 text-blue-300">单位转换器</h4>
              <p className="text-sm text-blue-300/80">请使用在线工具进行单位转换，本功能正在开发中...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
