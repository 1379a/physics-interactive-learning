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
        description: '描述物体运动状态的物理量，高考重点考点',
        formula: 'p = mv',
        keyPoints: [
          '动量守恒定律：系统不受外力时总动量守恒',
          '冲量等于动量的变化量：I = Δp = m(v₂ - v₁)',
          '动量是矢量，方向与速度方向相同',
          '碰撞问题：弹性碰撞动量守恒且机械能守恒；非弹性碰撞动量守恒但机械能不守恒',
          '高考题型：碰撞模型、子弹打木块、滑块在木板上的滑动等'
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
          '机械能守恒：只有保守力做功时机械能守恒',
          '动能定理：合外力做的功等于动能的变化量',
          '功能原理：除重力外的力做的功等于机械能的变化量',
          '高考题型：机械能守恒、动能定理应用、变力做功等'
        ]
      },
      {
        id: 'circular-motion',
        name: '圆周运动',
        description: '物体沿圆周轨迹运动的规律，高考高频考点',
        formula: 'F_n = m\\frac{v^2}{r} = m\\omega^2 r',
        keyPoints: [
          '匀速圆周运动：速率不变，速度方向不断改变',
          '向心力：指向圆心，不改变速度大小，只改变方向',
          '向心加速度：aₙ = v²/r = ω²r',
          '线速度与角速度关系：v = ωr',
          '周期与频率关系：T = 1/f',
          '竖直面圆周运动：最高点最小速度 v = √(gr)',
          '高考题型：圆锥摆、汽车过桥、航天器圆周运动等'
        ]
      },
      {
        id: 'gravitation',
        name: '万有引力定律',
        description: '描述天体间相互作用的引力规律',
        formula: 'F = G\\frac{Mm}{r^2}',
        keyPoints: [
          '适用条件：质点间或均匀球体间（r为球心距离）',
          '黄金代换：GM = gR²（天体表面重力近似等于万有引力）',
          '第一宇宙速度：v₁ = √(gR) = √(GM/R) ≈ 7.9 km/s',
          '第二宇宙速度：v₂ = √2 v₁ ≈ 11.2 km/s（脱离地球）',
          '第三宇宙速度：v₃ ≈ 16.7 km/s（脱离太阳系）',
          '开普勒第三定律：T²/r³ = 常量（同一中心天体）',
          '高考题型：天体质量密度计算、卫星轨道参数、双星问题等'
        ]
      },
      {
        id: 'projectile-motion',
        name: '抛体运动',
        description: '物体以初速度抛出后只在重力作用下的运动',
        formula: 'x = v_0 t\\cos\\theta, \\quad y = v_0 t\\sin\\theta - \\frac{1}{2}gt^2',
        keyPoints: [
          '平抛运动：分解为水平匀速运动和竖直自由落体',
          '运动时间：t = √(2h/g)，由下落高度决定',
          '水平射程：x = v₀t = v₀√(2h/g)',
          '速度方向：与水平方向夹角 tanθ = v_y/v_x',
          '斜抛运动：最大高度 H = v₀²sin²θ/(2g)',
          '高考题型：平抛运动、斜抛运动、类平抛运动等'
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
          '判断方法：看加速度方向，向上超重，向下失重',
          '高考题型：电梯问题、航天器问题等'
        ]
      },
      {
        id: 'rods',
        name: '固定杆与活动杆',
        description: '刚体平衡中不同约束条件对力和力矩的影响',
        formula: '\\sum F = 0, \\sum M = 0',
        keyPoints: [
          '固定杆（固定支点）：可产生任意方向的反作用力和力矩，约束全部运动',
          '活动杆（活动支点）：仅能产生垂直于杆的反作用力，不能产生力矩，允许转动',
          '活动铰链（活动支点）：仅能产生任意方向的反作用力，不能产生力矩，允许转动',
          '平衡条件：合力为零、合力矩为零',
          '高考题型：刚体平衡、杠杆平衡、结构受力分析等'
        ]
      },
      {
        id: 'harmonic-motion',
        name: '简谐运动',
        description: '物体在回复力作用下周期性往复运动',
        formula: 'F = -kx, \\quad x = A\\cos(\\omega t + \\phi)',
        keyPoints: [
          '回复力：F = -kx，方向始终指向平衡位置',
          '周期公式：T = 2π√(m/k)（弹簧振子）',
          '单摆周期：T = 2π√(l/g)（小角度近似）',
          '能量关系：机械能守恒，动能与势能相互转化',
          '高考题型：简谐运动特征、周期计算、单摆实验等'
        ]
      },
      {
        id: 'mechanical-waves',
        name: '机械波',
        description: '机械振动在介质中的传播',
        formula: 'v = \\lambda f = \\frac{\\lambda}{T}',
        keyPoints: [
          '波速公式：v = λf = λ/T（波速等于波长乘以频率）',
          '波的干涉：频率相同、相位差恒定、振动方向相同',
          '波的衍射：波长越大、障碍物越小，衍射越明显',
          '驻波：两列振幅、频率、波长相同，方向相反的波叠加',
          '高考题型：波动图像、干涉加强减弱条件、衍射条件等'
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
          '同种电荷相斥，异种电荷相吸',
          '适用条件：真空中的点电荷'
        ]
      },
      {
        id: 'electric-field',
        name: '电场',
        description: '电荷周围存在的一种特殊物质',
        formula: 'E = \\frac{F}{q} = k\\frac{Q}{r^2}',
        keyPoints: [
          '电场强度：描述电场力的性质，矢量',
          '点电荷电场：E = kQ/r²，方向沿径向',
          '匀强电场：E = U/d（d为沿电场线方向的距离）',
          '电场线：从正电荷出发到负电荷终止，切线方向为场强方向',
          '高考题型：电场强度叠加、匀强电场、电场线分析等'
        ]
      },
      {
        id: 'electric-potential',
        name: '电势与电势能',
        description: '描述电场能的性质的物理量',
        formula: '\\varphi = \\frac{W_{\\infty\\to P}}{q} = k\\frac{Q}{r}',
        keyPoints: [
          '电势：单位正电荷在某点的电势能，标量',
          '电势差：U_AB = φ_A - φ_B = W_AB/q',
          '点电荷电势：φ = kQ/r（取无穷远处电势为零）',
          '电势能：E_p = qφ',
          '等势面：电势相等的面，电场线垂直于等势面',
          '高考题型：电势计算、电势差、带电粒子在电场中运动等'
        ]
      },
      {
        id: 'capacitor',
        name: '电容器',
        description: '储存电荷和电能的器件',
        formula: 'C = \\frac{Q}{U} = \\frac{\\varepsilon S}{4\\pi kd}',
        keyPoints: [
          '电容定义：C = Q/U（单位：法拉 F）',
          '平行板电容器：C = εS/(4πkd)',
          '储能公式：E = ½QU = ½CU² = ½Q²/C',
          '电容串联：1/C_total = 1/C₁ + 1/C₂ + ...',
          '电容并联：C_total = C₁ + C₂ + ...',
          '高考题型：平行板电容器电容、电容器充放电、带电粒子在电容器中运动等'
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
          '适用于纯电阻电路',
          '电阻定律：R = ρL/S（ρ为电阻率，L为长度，S为横截面积）',
          '电阻率随温度变化：ρ = ρ₀(1 + αt)'
        ]
      },
      {
        id: 'closed-circuit',
        name: '闭合电路欧姆定律',
        description: '描述整个电路中的电流规律',
        formula: 'I = \\frac{E}{R + r}',
        keyPoints: [
          '闭合电路电流：I = E/(R + r)（E为电动势，r为内阻）',
          '路端电压：U = E - Ir = IR',
          '电源输出功率：P_out = UI = I²R',
          '电源效率：η = P_out/P_total = R/(R + r)',
          '功率最大时：R = r，此时效率为50%',
          '高考题型：动态电路分析、电源输出功率、效率计算等'
        ]
      },
      {
        id: 'magnetic-field',
        name: '磁场',
        description: '电流和磁体周围存在的一种特殊物质',
        formula: 'B = \\frac{F}{IL}',
        keyPoints: [
          '磁感应强度：描述磁场力的性质，矢量',
          '匀强磁场：B = F/IL（定义式）',
          '安培力：F安 = BILsinθ（θ为B与I的夹角）',
          '左手定则：判断安培力方向',
          '洛伦兹力：F洛 = qvBsinθ（θ为v与B的夹角）',
          '高考题型：安培力方向判断、带电粒子在磁场中的圆周运动等'
        ]
      },
      {
        id: 'charged-particle-magnetic',
        name: '带电粒子在磁场中的运动',
        description: '带电粒子在匀强磁场中的运动规律，高考压轴题',
        formula: 'qvB = m\\frac{v^2}{r} \\Rightarrow r = \\frac{mv}{qB}, \\quad T = \\frac{2\\pi m}{qB}',
        keyPoints: [
          '圆周运动：洛伦兹力提供向心力，qvB = mv²/r',
          '轨道半径：r = mv/(qB）',
          '运动周期：T = 2πm/(qB）（与速度无关）',
          '轨迹分析：确定圆心、半径、运动时间',
          '高考题型：速度选择器、回旋加速器、质谱仪等'
        ]
      },
      {
        id: 'faraday',
        name: '法拉第电磁感应',
        description: '变化的磁场产生电动势',
        formula: '\\mathcal{E} = -\\frac{d\\Phi}{dt}',
        keyPoints: [
          '磁通量变化产生感应电动势',
          '法拉第定律：E = n·ΔΦ/Δt（n为线圈匝数）',
          '切割磁感线：E = BLv（B⊥L⊥v）',
          '楞次定律：感应电流方向阻碍磁通量变化',
          '自感现象：电流变化产生自感电动势',
          '高考题型：导体棒切割磁感线、线框进出磁场、电磁感应综合问题等'
        ]
      },
      {
        id: 'electromagnetic-induction-energy',
        name: '电磁感应中的能量问题',
        description: '电磁感应过程中的能量转化，高考高频考点',
        formula: 'Q = W_{安培} = \\Delta E_机械',
        keyPoints: [
          '克服安培力做功等于电路产生的焦耳热',
          '能量守恒：减小的机械能 = 电能 + 其他形式能量',
          '动能定理：W_other + W_Ampere = ΔE_k',
          '高考题型：能量守恒、焦耳热计算、功能关系等'
        ]
      },
      {
        id: 'electromagnetic-induction-momentum',
        name: '电磁感应中的动量问题',
        description: '电磁感应过程中的动量定理和动量守恒，高考高频考点',
        formula: '\\sum F \\cdot \\Delta t = m\\Delta v \\Rightarrow -BLq = m(v_2 - v_1)',
        keyPoints: [
          '动量定理：安培力冲量 = 动量变化，-BLq = m(v₂ - v₁)',
          '电荷量公式：q = ΔΦ/R = BLΔx/R（单杆切割）',
          '双杆模型：等距导轨时系统动量守恒，最终共速',
          '时间公式：q = I·Δt = ΔΦ/R',
          '位移公式：-BLx·B/R = m(v₂ - v₁)',
          '高考题型：导体棒碰撞、双杆问题、动量守恒等'
        ]
      },
      {
        id: 'ac-current',
        name: '交变电流',
        description: '大小和方向随时间周期性变化的电流',
        formula: 'i = I_m\\sin(\\omega t + \\phi), \\quad U_{eff} = \\frac{U_m}{\\sqrt{2}}',
        keyPoints: [
          '正弦交流电：i = I_m sin(ωt + φ)',
          '有效值：U_eff = U_m/√2，I_eff = I_m/√2',
          '周期与频率：T = 2π/ω，f = 1/T',
          '变压器：U₁/U₂ = n₁/n₂，I₁/I₂ = n₂/n₁',
          '远距离输电：减少线路损耗，提高输电电压',
          '高考题型：有效值计算、变压器原理、输电损耗等'
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
          '平面镜成像特点是等大、虚像、对称',
          '反射定律的应用：潜望镜、平面镜成像等'
        ]
      },
      {
        id: 'refraction',
        name: '光的折射',
        description: '光从一种介质进入另一种介质时的偏折现象',
        formula: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2',
        keyPoints: [
          '斯涅尔定律：n₁sinθ₁ = n₂sinθ₂',
          '折射率：n = c/v = sinθ₁/sinθ₂（c为光速，v为介质中光速）',
          '光从光密介质进入光疏介质时远离法线',
          '全反射现象：入射角大于临界角时发生全反射',
          '临界角公式：sinC = 1/n（光从介质进入真空）',
          '高考题型：折射率计算、全反射现象、光路图等'
        ]
      },
      {
        id: 'total-reflection',
        name: '全反射',
        description: '光从光密介质射向光疏介质时发生的特殊折射现象',
        formula: '\\sin C = \\frac{n_2}{n_1} \\quad (n_1 > n_2)',
        keyPoints: [
          '发生条件：光从光密介质射向光疏介质，入射角大于临界角',
          '临界角公式：sinC = n₂/n₁（n₁为光密介质折射率）',
          '应用：光纤通信、全反射棱镜',
          '高考题型：临界角计算、光纤传输、全反射现象分析等'
        ]
      },
      {
        id: 'interference',
        name: '光的干涉',
        description: '两列相干光波叠加形成的干涉条纹，高考实验考点',
        formula: '\\Delta x = \\frac{L}{d}\\lambda',
        keyPoints: [
          '相干光：频率相同、相位差恒定、振动方向相同',
          '双缝干涉：屏上出现明暗相间的等间距条纹',
          '亮条纹条件：Δr = nλ（n = 0, 1, 2, ...）',
          '暗条纹条件：Δr = (n + ½)λ（n = 0, 1, 2, ...）',
          '条纹间距公式：Δx = Lλ/d（L为缝到屏距离，d为双缝间距）',
          '薄膜干涉：前后表面反射光叠加形成彩色条纹',
          '高考题型：双缝干涉实验、薄膜干涉、干涉条件判断等'
        ]
      },
      {
        id: 'diffraction',
        name: '光的衍射',
        description: '光遇到障碍物时偏离直线传播的现象',
        formula: '\\sin\\theta = k\\frac{\\lambda}{a} \\quad (k = 1, 2, 3, ...)',
        keyPoints: [
          '发生条件：障碍物或孔径尺寸与波长相当或更小',
          '单缝衍射：中央亮纹最宽最亮，两侧亮纹渐暗',
          '衍射条纹宽度与波长成正比，与缝宽成反比',
          '圆孔衍射：形成明暗相间的圆环（艾里斑）',
          '高考题型：衍射现象分析、衍射条纹特点、衍射条件等'
        ]
      },
      {
        id: 'polarization',
        name: '光的偏振',
        description: '光波振动方向的特性',
        formula: 'I = I_0\\cos^2\\theta',
        keyPoints: [
          '自然光：各个方向振动都相同的光',
          '偏振光：振动方向单一的光',
          '马吕斯定律：I = I₀cos²θ（θ为振动方向与偏振片透振方向的夹角）',
          '应用：偏振眼镜、3D电影、液晶显示',
          '高考题型：偏振现象、马吕斯定律计算等'
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
          '第一定律：ΔU = Q - W（能量守恒在热现象中的应用）',
          '第二定律：热量自发地从高温物体传到低温物体',
          '第三定律：绝对零度不可达到',
          '内能：分子动能和分子势能的总和',
          '做功：W > 0 系统对外做功，W < 0 外界对系统做功',
          '吸热：Q > 0，放热：Q < 0'
        ]
      },
      {
        id: 'ideal-gas',
        name: '理想气体状态方程',
        description: '描述理想气体状态变化的方程，高考选择题考点',
        formula: 'pV = nRT, \\quad \\frac{pV}{T} = C',
        keyPoints: [
          '理想气体状态方程：pV = nRT（n为物质的量，R为气体常数）',
          '比例形式：p₁V₁/T₁ = p₂V₂/T₂（适用于一定质量的理想气体）',
          '玻意耳定律：pV = C（等温过程）',
          '查理定律：p/T = C（等容过程）',
          '盖·吕萨克定律：V/T = C（等压过程）',
          '高考题型：气体状态变化、p-V图像、p-T图像等'
        ]
      },
      {
        id: 'kinetic-theory',
        name: '分子动理论',
        description: '从分子运动角度解释热现象',
        formula: 'E_k = \\frac{3}{2}kT',
        keyPoints: [
          '物质由大量分子组成，分子永不停息地做无规则运动',
          '分子间有相互作用的引力和斥力',
          '温度越高，分子运动越剧烈',
          '分子平均动能：E_k = 3kT/2（与温度成正比）',
          '阿伏伽德罗常数：N_A = 6.02×10²³ mol⁻¹',
          '高考题型：分子运动特点、温度意义、气体压强微观解释等'
        ]
      },
      {
        id: 'gas-laws',
        name: '气体实验定律',
        description: '理想气体在特定条件下的状态变化规律',
        formula: 'pV = C, \\quad \\frac{p}{T} = C, \\quad \\frac{V}{T} = C',
        keyPoints: [
          '玻意耳定律：等温过程，p₁V₁ = p₂V₂',
          '查理定律：等容过程，p₁/T₁ = p₂/T₂',
          '盖·吕萨克定律：等压过程，V₁/T₁ = V₂/T₂',
          '气体压强微观解释：大量分子碰撞器壁产生',
          '高考题型：p-V图像分析、状态变化过程判断等'
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
          '质能方程：E = mc²（质量与能量可以相互转化）',
          '狭义相对论：高速运动物体时间膨胀、长度收缩',
          '时间膨胀：t = t₀/√(1 - v²/c²)',
          '长度收缩：l = l₀√(1 - v²/c²)',
          '相对论质量：m = m₀/√(1 - v²/c²)',
          '高考题型：质能方程应用、时间膨胀、长度收缩等'
        ]
      },
      {
        id: 'quantum',
        name: '量子力学',
        description: '描述微观粒子运动的物理学理论',
        formula: 'E = hf, \\quad p = \\frac{h}{\\lambda}',
        keyPoints: [
          '普朗克能量子假说：E = hf（h为普朗克常量）',
          '光子能量：E = hf = hc/λ',
          '光电效应方程：hf = W₀ + E_k',
          '德布罗意波：λ = h/p（物质波波长）',
          '波粒二象性：微观粒子同时具有波动性和粒子性',
          '测不准原理：Δx·Δp ≥ h/4π',
          '高考题型：光电效应、德布罗意波、波粒二象性等'
        ]
      },
      {
        id: 'photoelectric-effect',
        name: '光电效应',
        description: '光照射金属表面释放电子的现象，高考必考考点',
        formula: 'hf = W_0 + \\frac{1}{2}mv^2',
        keyPoints: [
          '爱因斯坦光电方程：hf = W₀ + ½mv²',
          '截止频率：f₀ = W₀/h（低于此频率不发生光电效应）',
          '遏止电压：eU₀ = ½mv²（U₀ = (hf - W₀)/e）',
          '极限频率：与金属材料有关，与光强无关',
          '光强：影响光电流大小，不影响光电子最大初动能',
          '高考题型：光电方程计算、遏止电压、截止频率等'
        ]
      },
      {
        id: 'atom',
        name: '原子结构',
        description: '原子的组成和电子排布',
        formula: 'E_n = -\\frac{13.6}{n^2}\\text{eV}',
        keyPoints: [
          '卢瑟福α粒子散射实验：原子核式结构',
          '玻尔原子模型：电子在定态轨道上运动',
          '能级公式：E_n = -13.6/n² eV（氢原子）',
          '轨道半径：r_n = n²a₀（a₀ = 0.53 Å）',
          '能级跃迁：ΔE = hf = hc/λ',
          '高考题型：能级跃迁、光谱分析、原子结构等'
        ]
      },
      {
        id: 'atomic-nucleus',
        name: '原子核',
        description: '原子核的性质和变化',
        formula: 'E = mc^2, \\quad T_{1/2} = \\frac{\\ln 2}{\\lambda}',
        keyPoints: [
          '原子核组成：质子和中子，统称核子',
          '核力：短程强相互作用，只存在于相邻核子间',
          '质量亏损：Δm = Σm反应前 - Σm反应后',
          '质能方程：ΔE = Δmc²',
          '半衰期：T₁/₂ = ln2/λ',
          '核反应：α衰变、β衰变、核裂变、核聚变',
          '高考题型：衰变方程计算、半衰期、核能计算等'
        ]
      },
      {
        id: 'nuclear-reactions',
        name: '核反应',
        description: '原子核的转变过程，高考必考考点',
        formula: '\\Delta E = \\Delta mc^2',
        keyPoints: [
          'α衰变：放出氦核（²⁴He），质量数减4，电荷数减2',
          'β衰变：中子转质子，放出电子（⁰₋₁e），质量数不变，电荷数加1',
          '核反应方程：质量数守恒、电荷数守恒',
          '核裂变：重核分裂成较轻核，释放巨大能量',
          '核聚变：轻核聚合成较重核，释放更大能量',
          '高考题型：核反应方程配平、衰变次数计算、核能计算等'
        ]
      }
    ]
  },
  {
    id: 'acoustics',
    name: '声学',
    icon: '🔊',
    concepts: [
      {
        id: 'sound-wave',
        name: '声波',
        description: '声音在介质中传播的机械波',
        formula: 'v = \\lambda f = \\frac{\\lambda}{T}',
        keyPoints: [
          '声波是纵波，通过介质疏密振动传播',
          '声速公式：v = λf（声速等于波长乘以频率）',
          '声速与介质有关：固体中声速最快，气体中最慢',
          '温度影响声速：空气中声速 v ≈ 331 + 0.6t（t为温度℃）',
          '人耳可听频率范围：20 Hz ~ 20000 Hz',
          '高考题型：声速计算、频率与波长关系、声波传播等'
        ]
      },
      {
        id: 'sound-intensity',
        name: '声强与声级',
        description: '描述声音强弱的物理量',
        formula: 'L = 10\\log_{10}\\frac{I}{I_0}',
        keyPoints: [
          '声强：单位时间内通过垂直于声波传播方向的单位面积的声能',
          '声强级：L = 10·log(I/I₀)，单位：分贝（dB）',
          '基准声强：I₀ = 10⁻¹² W/m²（人耳听阈）',
          '声强与振幅平方成正比',
          '声强级叠加：L_total = 10·log(I₁ + I₂)/I₀',
          '高考题型：声强级计算、声强叠加、分贝计算等'
        ]
      },
      {
        id: 'doppler-effect',
        name: '多普勒效应',
        description: '波源和观察者相对运动时频率变化的现象',
        formula: "f' = f \\cdot \\frac{v \\pm v_o}{v \\mp v_s}",
        keyPoints: [
          '当波源接近观察者时，接收频率升高',
          '当波源远离观察者时，接收频率降低',
          '公式中v₀为观察者速度（接近用+，远离用-）',
          '公式中vₛ为波源速度（接近用-，远离用+）',
          '应用：雷达测速、医学超声、天文学红移',
          '高考题型：多普勒效应计算、频率变化分析等'
        ]
      },
      {
        id: 'sound-reflection',
        name: '声波的反射与回声',
        description: '声波遇到障碍物时的反射现象',
        formula: 't = \\frac{2d}{v}',
        keyPoints: [
          '声波反射遵守反射定律：入射角等于反射角',
          '回声时间：t = 2d/v（d为声源到障碍物距离）',
          '人耳能分辨回声与原声的最短时间差约为0.1秒',
          '对应最短距离：约17米（空气中）',
          '应用：声纳测距、建筑声学设计',
          '高考题型：回声计算、声波反射分析等'
        ]
      },
      {
        id: 'sound-refraction',
        name: '声波的折射',
        description: '声波在不同介质界面的偏折现象',
        formula: '\\frac{\\sin\\theta_1}{\\sin\\theta_2} = \\frac{v_1}{v_2}',
        keyPoints: [
          '声波从低速介质进入高速介质时，折射角大于入射角',
          '声波从高速介质进入低速介质时，折射角小于入射角',
          '大气中声速随温度升高而增大，造成声音弯曲传播',
          '白天声音向上弯曲，夜晚声音向下弯曲',
          '应用：声波传播分析、声学材料设计',
          '高考题型：声波折射分析、声速与温度关系等'
        ]
      },
      {
        id: 'sound-interference',
        name: '声波的干涉',
        description: '两列声波叠加产生的干涉现象',
        formula: '\\Delta r = n\\lambda \\text{（加强）}, \\Delta r = (n+\\frac{1}{2})\\lambda \\text{（减弱）}',
        keyPoints: [
          '相干条件：频率相同、相位差恒定、振动方向相同',
          '加强条件：波程差 Δr = nλ（n = 0, 1, 2, ...）',
          '减弱条件：波程差 Δr = (n + ½)λ（n = 0, 1, 2, ...）',
          '驻波：两列振幅相同、方向相反的波叠加',
          '弦乐器驻波：长度 L = n·λ/2（n为波腹数）',
          '高考题型：声波干涉条件、驻波分析、弦乐器原理等'
        ]
      },
      {
        id: 'sound-diffraction',
        name: '声波的衍射',
        description: '声波绕过障碍物传播的现象',
        formula: '\\sin\\theta = \\frac{k\\lambda}{a}',
        keyPoints: [
          '声波波长较长，容易发生明显的衍射现象',
          '衍射条件：障碍物尺寸与声波波长相当或更小',
          '低频声音衍射更明显，传播距离更远',
          '高频声音衍射较弱，方向性更强',
          '应用：声音的传播、声学探测',
          '高考题型：衍射现象分析、频率与传播关系等'
        ]
      },
      {
        id: 'resonance',
        name: '共振',
        description: '系统在特定频率下振幅最大的现象',
        formula: 'f_0 = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}',
        keyPoints: [
          '固有频率：系统的振动频率',
          '共振条件：驱动力频率等于系统固有频率',
          '弹簧振子固有频率：f₀ = ½π·√(k/m)',
          '单摆固有频率：f₀ = ½π·√(g/l)',
          '管乐器驻波：开管 L = n·λ/2，闭管 L = (2n+1)·λ/4',
          '应用：乐器发声、建筑物抗震、桥梁共振防护',
          '高考题型：共振条件分析、固有频率计算、共振应用等'
        ]
      },
      {
        id: 'ultrasound',
        name: '超声波',
        description: '频率高于人耳听觉上限的声波',
        formula: '\\lambda = \\frac{v}{f}',
        keyPoints: [
          '超声波频率：f > 20000 Hz',
          '波长极短，方向性好，可集中能量',
          '穿透能力强，可透过人体组织',
          '应用：B超医学诊断、工业探伤、声纳探测',
          '多普勒超声：测量血流速度、心率监测',
          '高考题型：超声波特性、超声波应用等'
        ]
      },
      {
        id: 'infrasound',
        name: '次声波',
        description: '频率低于人耳听觉下限的声波',
        formula: 'v = \\lambda f',
        keyPoints: [
          '次声波频率：f < 20 Hz',
          '波长很长，传播距离远，衰减慢',
          '能绕过大型障碍物，传播能量大',
          '应用：地震监测、火山活动探测、核爆炸监测',
          '自然灾害预警：海啸、山体滑坡前会产生次声波',
          '高考题型：次声波特性、次声波应用等'
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
