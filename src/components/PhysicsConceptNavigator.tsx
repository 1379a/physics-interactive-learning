'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false,
  loading: () => <span className="text-blue-400">加载公式...</span>
});

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), {
  ssr: false,
  loading: () => <span className="text-blue-400">加载公式...</span>
});

interface Concept {
  id: string;
  name: string;
  description: string;
  formula: string;
  keyPoints: string[];
}

interface Branch {
  id: string;
  name: string;
  icon: string;
  concepts: Concept[];
}

const physicsBranches: Branch[] = [
  {
    id: 'mechanics',
    name: '力学',
    icon: '⚙️',
    concepts: [
      {
        id: 'newton-laws',
        name: '牛顿运动定律',
        description: '描述物体运动与受力关系的三条基本定律',
        formula: 'F = ma',
        keyPoints: [
          '第一定律：惯性定律，物体保持静止或匀速直线运动',
          '第二定律：加速度与合外力成正比，与质量成反比',
          '第三定律：作用力与反作用力大小相等、方向相反'
        ]
      },
      {
        id: 'momentum',
        name: '动量',
        description: '描述物体运动状态的物理量',
        formula: 'p = mv',
        keyPoints: [
          '动量守恒定律：系统不受外力时总动量守恒',
          '冲量等于动量的变化量',
          '动量是矢量，方向与速度方向相同'
        ]
      },
      {
        id: 'energy',
        name: '能量守恒',
        description: '能量不会凭空产生或消失，只能从一种形式转化为另一种形式',
        formula: 'E = K + U = \\frac{1}{2}mv^2 + mgh',
        keyPoints: [
          '动能：K = ½mv²，与速度平方成正比',
          '势能：U = mgh，与高度成正比',
          '机械能守恒：只有保守力做功时机械能守恒'
        ]
      },
      {
        id: 'weightlessness',
        name: '超重与失重',
        description: '物体在加速运动中视重相对于实重的变化现象',
        formula: 'F_{视} = m(g \\pm a)',
        keyPoints: [
          '超重：加速度方向向上时，视重大于实重（如电梯加速上升）',
          '失重：加速度方向向下时，视重小于实重（如电梯减速上升、自由落体）',
          '完全失重：a = g 时，视重为零（如卫星绕地球飞行）',
          '判断方法：看加速度方向，向上超重，向下失重'
        ]
      }
    ]
  },
  {
    id: 'electromagnetism',
    name: '电磁学',
    icon: '⚡',
    concepts: [
      {
        id: 'coulomb',
        name: '库仑定律',
        description: '描述真空中两点电荷之间的相互作用力',
        formula: 'F = k\\frac{q_1q_2}{r^2}',
        keyPoints: [
          '力的大小与电荷量的乘积成正比',
          '力的大小与距离平方成反比',
          '同种电荷相斥，异种电荷相吸'
        ]
      },
      {
        id: 'ohm',
        name: '欧姆定律',
        description: '描述电流、电压和电阻之间的关系',
        formula: 'I = \\frac{V}{R}',
        keyPoints: [
          '电流与电压成正比',
          '电流与电阻成反比',
          '适用于纯电阻电路'
        ]
      },
      {
        id: 'faraday',
        name: '法拉第电磁感应',
        description: '变化的磁场产生电动势',
        formula: '\\mathcal{E} = -\\frac{d\\Phi}{dt}',
        keyPoints: [
          '磁通量变化产生感应电动势',
          '楞次定律：感应电流方向阻碍磁通量变化',
          '自感现象：电流变化产生自感电动势'
        ]
      }
    ]
  },
  {
    id: 'optics',
    name: '光学',
    icon: '🔍',
    concepts: [
      {
        id: 'reflection',
        name: '光的反射',
        description: '光在两种介质界面上的反射现象',
        formula: '\\theta_i = \\theta_r',
        keyPoints: [
          '入射角等于反射角',
          '反射光线、入射光线、法线在同一平面内',
          '平面镜成像特点是等大、虚像、对称'
        ]
      },
      {
        id: 'refraction',
        name: '光的折射',
        description: '光从一种介质进入另一种介质时的偏折现象',
        formula: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2',
        keyPoints: [
          '斯涅尔定律：入射角正弦与折射角正弦之比等于折射率之比',
          '光从光密介质进入光疏介质时远离法线',
          '全反射现象：入射角大于临界角时发生全反射'
        ]
      }
    ]
  },
  {
    id: 'thermal',
    name: '热学',
    icon: '🌡️',
    concepts: [
      {
        id: 'thermodynamics',
        name: '热力学定律',
        description: '描述热现象的基本定律',
        formula: '\\Delta U = Q - W',
        keyPoints: [
          '第一定律：能量守恒定律在热现象中的应用',
          '第二定律：热不能自发地从低温物体传到高温物体',
          '第三定律：绝对零度不可达到'
        ]
      },
      {
        id: 'ideal-gas',
        name: '理想气体状态方程',
        description: '描述理想气体状态变化的方程',
        formula: 'PV = nRT',
        keyPoints: [
          '压强与体积成反比（波义耳定律）',
          '体积与温度成正比（查理定律）',
          '适用于理想气体，近似用于真实气体'
        ]
      }
    ]
  },
  {
    id: 'modern',
    name: '近代物理',
    icon: '⚛️',
    concepts: [
      {
        id: 'relativity',
        name: '相对论',
        description: '爱因斯坦提出的时空观',
        formula: 'E = mc^2',
        keyPoints: [
          '质能方程：质量与能量可以相互转化',
          '时间膨胀：运动时钟变慢',
          '长度收缩：运动方向长度缩短'
        ]
      },
      {
        id: 'quantum',
        name: '量子力学',
        description: '描述微观粒子运动的物理学理论',
        formula: 'E = hf',
        keyPoints: [
          '光子能量与频率成正比',
          '波粒二象性：微观粒子同时具有波动性和粒子性',
          '测不准原理：无法同时精确测量粒子的位置和动量'
        ]
      }
    ]
  }
];

export default function PhysicsConceptNavigator() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">📚</div>
        <div>
          <h2 className="text-2xl font-bold">智能概念导航器</h2>
          <p className="text-sm text-blue-300/80">点击物理学分支，探索核心概念</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：分支列表 */}
        <div className="lg:col-span-1 space-y-3">
          {physicsBranches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => {
                setSelectedBranch(branch.id);
                setSelectedConcept(null);
              }}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedBranch === branch.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{branch.icon}</span>
                <div>
                  <div className="font-semibold">{branch.name}</div>
                  <div className="text-xs opacity-80">{branch.concepts.length} 个核心概念</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 中间：概念列表 */}
        <div className="lg:col-span-1 space-y-3">
          {selectedBranch ? (
            <>
              <h3 className="text-lg font-semibold mb-4 text-blue-300">
                {physicsBranches.find(b => b.id === selectedBranch)?.name} 概念
              </h3>
              {physicsBranches
                .find(b => b.id === selectedBranch)
                ?.concepts.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => setSelectedConcept(concept)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedConcept?.id === concept.id
                        ? 'bg-blue-600/30 border border-blue-500/50'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="font-medium mb-1">{concept.name}</div>
                    <div className="text-xs text-blue-300/70 line-clamp-2">{concept.description}</div>
                  </button>
                ))}
            </>
          ) : (
            <div className="text-center text-blue-300/60 py-8">
              <div className="text-4xl mb-2">👈</div>
              <p>选择一个物理分支开始探索</p>
            </div>
          )}
        </div>

        {/* 右侧：概念详情 */}
        <div className="lg:col-span-1">
          {selectedConcept ? (
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedConcept.name}</h3>
                <p className="text-sm text-blue-300/80">{selectedConcept.description}</p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-xs text-blue-400 mb-2">核心公式</div>
                <div className="text-center text-lg">
                  <BlockMath math={selectedConcept.formula} />
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2 text-blue-300">关键要点</div>
                <ul className="space-y-2">
                  {selectedConcept.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-blue-100/80">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-3 border border-blue-500/30">
                <div className="text-xs text-blue-300">💡 学习提示</div>
                <div className="text-sm mt-1">建议配合公式演绎器和物理模拟器加深理解</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-blue-300/60 py-8">
              <div className="text-4xl mb-2">👆</div>
              <p>选择一个概念查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
