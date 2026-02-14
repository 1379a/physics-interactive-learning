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
    id: 'momentum-conservation',
    category: '力学',
    title: '动量守恒定律',
    description: '分析碰撞或爆炸等过程中的动量守恒问题',
    steps: [
      { step: 1, title: '确定系统', content: '明确研究的系统，判断系统是否满足动量守恒条件（合外力为零或合外力冲量可忽略）' },
      { step: 2, title: '判断守恒', content: '分析系统所受外力，若合外力为零或内力远大于外力，则动量守恒', formula: '\\Delta p = 0 \\Rightarrow p_{初} = p_{末}' },
      { step: 3, title: '规定正方向', content: '选定正方向，通常以初速度方向为正方向' },
      { step: 4, title: '列方程', content: '根据动量守恒定律列方程。注意动量是矢量', formula: 'm_1v_1 + m_2v_2 = m_1v_1\' + m_2v_2\'' },
      { step: 5, title: '求解', content: '解方程求出未知量。若涉及碰撞，需判断碰撞类型（弹性/非弹性）' }
    ]
  },
  {
    id: 'collision',
    category: '力学',
    title: '碰撞问题',
    description: '分析弹性碰撞、非弹性碰撞和完全非弹性碰撞',
    steps: [
      { step: 1, title: '判断碰撞类型', content: '判断是弹性碰撞、非弹性碰撞还是完全非弹性碰撞（共速）' },
      { step: 2, title: '应用动量守恒', content: '所有碰撞过程动量都守恒（若合外力为零）', formula: 'm_1v_1 + m_2v_2 = m_1v_1\' + m_2v_2\'' },
      { step: 3, title: '弹性碰撞补充能量守恒', content: '弹性碰撞需补充机械能守恒方程', formula: '\\frac{1}{2}m_1v_1^2 + \\frac{1}{2}m_2v_2^2 = \\frac{1}{2}m_1v_1\'^2 + \\frac{1}{2}m_2v_2\'^2' },
      { step: 4, title: '非弹性碰撞能量损失', content: '非弹性碰撞有能量损失，计算损失的机械能', formula: '\\Delta E = E_{k初} - E_{k末}' },
      { step: 5, title: '完全非弹性碰撞', content: '完全非弹性碰撞后两物体速度相同', formula: 'v\' = \\frac{m_1v_1 + m_2v_2}{m_1 + m_2}' }
    ]
  },
  {
    id: 'mechanical-energy',
    category: '力学',
    title: '机械能守恒定律',
    description: '分析只有保守力做功的系统的机械能守恒问题',
    steps: [
      { step: 1, title: '确定研究对象', content: '明确研究的系统，通常是一个或多个物体与地球组成的系统' },
      { step: 2, title: '分析受力做功', content: '分析系统所受各力的做功情况。若只有重力、弹簧弹力等保守力做功，则机械能守恒', formula: 'W_{非保力} = 0' },
      { step: 3, title: '确定初末状态', content: '明确系统的初状态和末状态，确定各状态的动能和势能' },
      { step: 4, title: '列守恒方程', content: '根据机械能守恒定律列方程', formula: 'E_{k1} + E_{p1} = E_{k2} + E_{p2}' },
      { step: 5, title: '求解', content: '解方程求出未知物理量。注意参考面的选择影响势能值但不影响守恒关系' }
    ]
  },
  {
    id: 'circular-motion',
    category: '力学',
    title: '圆周运动',
    description: '分析匀速圆周运动或竖直面圆周运动问题',
    steps: [
      { step: 1, title: '确定圆周运动类型', content: '判断是匀速圆周运动、水平面圆周运动还是竖直面圆周运动' },
      { step: 2, title: '受力分析', content: '对物体进行受力分析，确定向心力来源（重力、支持力、绳拉力等）', formula: 'F_n = F_{向心}' },
      { step: 3, title: '应用向心力公式', content: '根据向心力公式列方程', formula: 'F_n = m\\frac{v^2}{r} = m\\omega^2 r' },
      { step: 4, title: '竖直面圆周运动', content: '竖直面圆周运动需分析最高点和最低点。最高点最小速度：v ≥ √(gr)', formula: 'mg + N = m\\frac{v^2}{r}' },
      { step: 5, title: '求解', content: '解方程求出速度、角速度、周期、向心力等物理量' }
    ]
  },
  {
    id: 'gravitation',
    category: '力学',
    title: '万有引力定律应用',
    description: '分析天体运动、卫星轨道等问题',
    steps: [
      { step: 1, title: '确定研究对象', content: '明确研究的中心天体和环绕天体' },
      { step: 2, title: '应用万有引力公式', content: '计算天体间的万有引力', formula: 'F = G\\frac{Mm}{r^2}' },
      { step: 3, title: '圆周运动分析', content: '卫星做圆周运动时，万有引力提供向心力', formula: 'G\\frac{Mm}{r^2} = m\\frac{v^2}{r} = m\\omega^2 r' },
      { step: 4, title: '计算轨道参数', content: '计算卫星的线速度、角速度、周期', formula: 'v = \\sqrt{\\frac{GM}{r}}, \\omega = \\sqrt{\\frac{GM}{r^3}}, T = 2\\pi\\sqrt{\\frac{r^3}{GM}}' },
      { step: 5, title: '黄金代换', content: '在天体表面：GM = gR²，可用于简化计算', formula: 'v_1 = \\sqrt{gR} ≈ 7.9 \\text{ km/s}' }
    ]
  },
  {
    id: 'difference-method',
    category: '力学',
    title: '逐差法求加速度',
    description: '利用打点计时器数据，用逐差法计算物体的加速度',
    steps: [
      { step: 1, title: '理解逐差法原理', content: '逐差法用于处理等时间间隔的位移数据，可以有效减小偶然误差', formula: 'a = \\frac{\\Delta x}{T^2}' },
      { step: 2, title: '整理数据', content: '将位移数据分成相等的两组，确保每组数据点数相同。例如：x₁, x₂, x₃ 和 x₄, x₅, x₆' },
      { step: 3, title: '应用逐差公式', content: '计算两组对应项的位移差，然后求平均值', formula: 'a = \\frac{(x_4-x_1)+(x_5-x_2)+(x_6-x_3)}{3 \\times 3T^2} = \\frac{x_4+x_5+x_6-(x_1+x_2+x_3)}{9T^2}' },
      { step: 4, title: '简化计算', content: '如果相邻计数点的时间间隔为 T，则加速度为', formula: 'a = \\frac{(s_m+s_{m-1}+...)-(s_n+s_{n-1}+...)}{mT^2}' },
      { step: 5, title: '验证结果', content: '检查计算结果是否合理，加速度的方向是否与运动方向一致' }
    ]
  },
  {
    id: 'weight-change',
    category: '力学',
    title: '失重与超重',
    description: '分析物体在加速运动中的视重变化',
    steps: [
      { step: 1, title: '认识视重与实重', content: '实重 G = mg 是物体受到的重力，视重是弹簧测力计或台秤的示数', formula: 'F_{视} = m(g ± a)' },
      { step: 2, title: '判断运动状态', content: '分析物体的加速度方向和加速度大小' },
      { step: 3, title: '应用牛顿定律', content: '根据牛顿第二定律计算视重', formula: 'N - mg = ma \\Rightarrow N = m(g + a)' },
      { step: 4, title: '判断失重/超重', content: '若 a 方向向下（包括减速上升、加速下降），物体失重；若 a 方向向上，物体超重' },
      { step: 5, title: '计算实例', content: '电梯加速上升时：视重 > 实重（超重）；电梯减速下降时：视重 < 实重（失重）' }
    ]
  },
  {
    id: 'rods-constraint',
    category: '力学',
    title: '固定杆与活动杆',
    description: '分析刚体平衡中不同约束条件下的受力',
    steps: [
      { step: 1, title: '识别约束类型', content: '判断支点是固定杆（固定支点）、活动杆（活动支点）还是活动铰链（活动支点）。固定杆约束全部运动，活动杆和活动铰链允许转动' },
      { step: 2, title: '确定未知反力', content: '固定杆：反作用力方向和大小都未知（Fx, Fy, Mz）；活动杆：反作用力垂直于杆；活动铰链：反作用力方向和大小未知（Fx, Fy）', formula: '固定杆：\\sum F_x = 0, \\sum F_y = 0, \\sum M = 0' },
      { step: 3, title: '建立平衡方程', content: '对刚体建立力平衡方程和力矩平衡方程。通常对未知力较多的点列力矩方程', formula: '\\sum F_x = 0, \\sum F_y = 0, \\sum M_O = 0' },
      { step: 4, title: '计算约束反力', content: '根据平衡条件求解支点处的反作用力。对于活动杆，注意反力方向垂直于杆' },
      { step: 5, title: '验证结果', content: '检查所有平衡条件是否满足，反力方向是否合理。若某支点为活动杆，则该支点处的反力应垂直于杆' }
    ]
  },
  {
    id: 'simple-pendulum',
    category: '力学',
    title: '单摆问题',
    description: '分析单摆的周期、摆长和重力加速度的关系',
    steps: [
      { step: 1, title: '理解单摆模型', content: '单摆由不可伸长的轻绳和小球组成，在小角度摆动时做简谐运动' },
      { step: 2, title: '应用周期公式', content: '单摆的周期与摆长的平方根成正比，与重力加速度的平方根成反比', formula: 'T = 2\\pi\\sqrt{\\frac{l}{g}}' },
      { step: 3, title: '等效摆长', content: '对于复杂的单摆系统，需先确定等效摆长', formula: 'l_{等效} = \\frac{\\sum m_i l_i}{\\sum m_i}' },
      { step: 4, title: '等效重力加速度', content: '在非竖直平面或加速系统中，需确定等效重力加速度', formula: 'g_{等效} = \\sqrt{g^2 + a^2}' },
      { step: 5, title: '求解应用', content: '利用单摆测重力加速度：g = 4π²l/T²。需多次测量求平均值减小误差' }
    ]
  },
  {
    id: 'kinetic-energy-theorem',
    category: '力学',
    title: '动能定理',
    description: '应用动能定理解决变力做功问题',
    steps: [
      { step: 1, title: '确定研究对象', content: '明确要研究的物体或系统' },
      { step: 2, title: '分析受力做功', content: '分析物体受到的所有力，计算各力所做的功。注意正功和负功', formula: 'W = \\int F\\cdot dr' },
      { step: 3, title: '确定初末速度', content: '明确物体的初速度和末速度' },
      { step: 4, title: '列动能定理方程', content: '所有外力做功的代数和等于动能的变化量', formula: 'W_合 = \\Delta E_k = \\frac{1}{2}mv_2^2 - \\frac{1}{2}mv_1^2' },
      { step: 5, title: '求解', content: '解方程求出未知量。动能定理适用于恒力做功，也适用于变力做功' }
    ]
  },
  {
    id: 'closed-circuit',
    category: '电磁学',
    title: '闭合电路欧姆定律',
    description: '分析含电源电路的电流、电压和功率分配',
    steps: [
      { step: 1, title: '识别电路结构', content: '识别电源、电阻、开关等元件，明确电路连接方式（串联/并联）' },
      { step: 2, title: '计算外电路总电阻', content: '根据串并联规律计算外电路的总电阻 R' },
      { step: 3, title: '应用闭合电路欧姆定律', content: '根据闭合电路欧姆定律计算电路总电流', formula: 'I = \\frac{E}{R + r}' },
      { step: 4, title: '计算路端电压', content: '计算电源的路端电压（外电路电压）', formula: 'U = E - Ir = IR' },
      { step: 5, title: '功率分析', content: '计算电源输出功率、内电路消耗功率等。当 R = r 时输出功率最大', formula: 'P_{out} = UI, P_{max} = \\frac{E^2}{4r}' }
    ]
  },
  {
    id: 'electromagnetic-induction',
    category: '电磁学',
    title: '电磁感应问题',
    description: '分析导体切割磁感线或磁通量变化产生的感应电动势和电流',
    steps: [
      { step: 1, title: '确定感应方式', content: '判断是导体切割磁感线还是磁通量变化产生感应电动势' },
      { step: 2, title: '切割磁感线模型', content: '导体棒切割磁感线，计算感应电动势', formula: '\\mathcal{E} = BLv\\sin\\theta' },
      { step: 3, title: '磁通量变化模型', content: '根据法拉第电磁感应定律计算感应电动势', formula: '\\mathcal{E} = n\\frac{\\Delta\\Phi}{\\Delta t}' },
      { step: 4, title: '判断电流方向', content: '应用楞次定律或右手定则判断感应电流方向' },
      { step: 5, title: '综合分析', content: '结合闭合电路欧姆定律求电流，结合能量守恒或动量定理分析运动' }
    ]
  },
  {
    id: 'charged-particle-magnetic',
    category: '电磁学',
    title: '带电粒子在磁场中的运动',
    description: '分析带电粒子在匀强磁场中的圆周运动',
    steps: [
      { step: 1, title: '受力分析', content: '带电粒子在磁场中只受洛伦兹力（忽略重力时）' },
      { step: 2, title: '洛伦兹力提供向心力', content: '洛伦兹力提供粒子做圆周运动的向心力', formula: 'qvB = m\\frac{v^2}{r}' },
      { step: 3, title: '计算轨道半径', content: '计算粒子的轨道半径', formula: 'r = \\frac{mv}{qB}' },
      { step: 4, title: '计算运动周期', content: '计算粒子的运动周期', formula: 'T = \\frac{2\\pi r}{v} = \\frac{2\\pi m}{qB}' },
      { step: 5, title: '轨迹分析', content: '确定圆心位置、偏转角度、运动时间等。应用于回旋加速器、质谱仪等' }
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
    id: 'ideal-gas',
    category: '热学',
    title: '理想气体状态方程',
    description: '分析理想气体状态变化问题',
    steps: [
      { step: 1, title: '确定研究对象', content: '明确研究的气体，确定气体的质量（或物质的量）' },
      { step: 2, title: '确定初末状态', content: '明确气体的初状态和末状态，记录各状态的压强、体积、温度', formula: 'p_1V_1 = nRT_1, p_2V_2 = nRT_2' },
      { step: 3, title: '判断过程类型', content: '判断是等温、等压、等容还是一般状态变化过程' },
      { step: 4, title: '应用状态方程', content: '根据理想气体状态方程列方程', formula: '\\frac{p_1V_1}{T_1} = \\frac{p_2V_2}{T_2}' },
      { step: 5, title: '求解', content: '解方程求出未知量。注意温度要用热力学温度（K）' }
    ]
  },
  {
    id: 'thermodynamics',
    category: '热学',
    title: '热力学第一定律',
    description: '分析内能变化与做功、热量的关系',
    steps: [
      { step: 1, title: '理解符号规则', content: '内能增加 ΔU > 0，吸热 Q > 0，系统对外做功 W > 0' },
      { step: 2, title: '确定初末状态', content: '明确系统的初状态和末状态，确定内能变化' },
      { step: 3, title: '分析做功', content: '分析系统是否对外做功或外界对系统做功', formula: 'W = \\int p dV' },
      { step: 4, title: '分析吸放热', content: '确定系统是吸热还是放热' },
      { step: 5, title: '列方程求解', content: '根据热力学第一定律列方程', formula: '\\Delta U = Q - W' }
    ]
  },
  {
    id: 'refraction',
    category: '光学',
    title: '光的折射',
    description: '分析光从一种介质进入另一种介质时的偏折现象',
    steps: [
      { step: 1, title: '确定折射率', content: '明确两种介质的折射率 n₁ 和 n₂' },
      { step: 2, title: '确定入射角', content: '确定入射角 θ₁（光线与法线的夹角）' },
      { step: 3, title: '应用斯涅尔定律', content: '根据折射定律计算折射角', formula: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2' },
      { step: 4, title: '判断偏折方向', content: '从光密进入光疏时远离法线，从光疏进入光密时靠近法线' },
      { step: 5, title: '计算实例', content: '水射入空气时（n₁=1.33, n₂≈1），入射角30°时折射角约为41°' }
    ]
  },
  {
    id: 'total-reflection',
    category: '光学',
    title: '全反射现象',
    description: '分析光从光密介质进入光疏介质时的全反射',
    steps: [
      { step: 1, title: '判断发生条件', content: '光从光密介质进入光疏介质，且入射角大于临界角' },
      { step: 2, title: '计算临界角', content: '根据折射率计算全反射临界角', formula: '\\sin C = \\frac{n_2}{n_1} (n_1 > n_2)' },
      { step: 3, title: '判断是否全反射', content: '比较入射角与临界角，若 θ > C 则发生全反射' },
      { step: 4, title: '应用实例', content: '光纤通信、全反射棱镜等应用' },
      { step: 5, title: '计算', content: '光从玻璃（n₁=1.5）射入空气（n₂≈1）时，临界角 C ≈ 41.8°' }
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
  },
  {
    id: 'photoelectric-effect',
    category: '近代物理',
    title: '光电效应',
    description: '分析光电效应中光电子的发射',
    steps: [
      { step: 1, title: '理解爱因斯坦光电方程', content: '光子能量 = 逸出功 + 光电子最大初动能', formula: 'hf = W_0 + E_{k}' },
      { step: 2, title: '计算截止频率', content: '计算发生光电效应的最小频率', formula: 'f_0 = \\frac{W_0}{h}' },
      { step: 3, title: '计算遏止电压', content: '计算使光电流为零的反向电压', formula: 'eU_0 = E_{k} = hf - W_0' },
      { step: 4, title: '分析影响因素', content: '光强影响光电流大小但不影响光电子最大初动能；频率影响光电子最大初动能' },
      { step: 5, title: '计算实例', content: '用波长400nm光照射金属（逸出功2.0eV），计算光电子最大初动能和遏止电压' }
    ]
  },
  {
    id: 'energy-level',
    category: '近代物理',
    title: '能级跃迁',
    description: '分析原子能级跃迁发射或吸收光子',
    steps: [
      { step: 1, title: '理解能级概念', content: '原子只能处于特定的能量状态（能级）' },
      { step: 2, title: '能级跃迁', content: '原子从高能级跃迁到低能级发射光子，从低能级跃迁到高能级吸收光子', formula: '\\Delta E = E_{高} - E_{低} = hf = \\frac{hc}{\\lambda}' },
      { step: 3, title: '计算光子能量', content: '计算跃迁过程中发射或吸收的光子能量' },
      { step: 4, title: '计算波长/频率', content: '根据光子能量计算波长或频率' },
      { step: 5, title: '氢原子能级', content: '氢原子能级公式：E_n = -13.6/n² eV' }
    ]
  },
  {
    id: 'nuclear-reaction',
    category: '近代物理',
    title: '核反应方程',
    description: '分析核反应中的质量亏损和能量释放',
    steps: [
      { step: 1, title: '理解核反应类型', content: '包括α衰变、β衰变、核裂变、核聚变等' },
      { step: 2, title: '配平核反应方程', content: '根据质量数守恒和电荷数守恒配平方程' },
      { step: 3, title: '计算质量亏损', content: '计算反应前后质量差', formula: '\\Delta m = \\sum m_{前} - \\sum m_{后}' },
      { step: 4, title: '计算释放能量', content: '根据质能方程计算释放的能量', formula: '\\Delta E = \\Delta m c^2' },
      { step: 5, title: '应用实例', content: '235U + 1n → 141Ba + 92Kr + 3·1n + 能量' }
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

// 宇宙速度
const cosmicVelocities = [
  { 
    name: '第一宇宙速度', 
    symbol: 'v₁', 
    value: '7.9', 
    unit: 'km/s',
    description: '环绕速度，卫星在地球表面附近绕地球做圆周运动的速度',
    formula: 'v₁ = \\sqrt{\\frac{GM}{R}} ≈ 7.9 \\text{ km/s}'
  },
  { 
    name: '第二宇宙速度', 
    symbol: 'v₂', 
    value: '11.2', 
    unit: 'km/s',
    description: '脱离速度，航天器脱离地球引力进入太阳系的最小速度',
    formula: 'v₂ = \\sqrt{\\frac{2GM}{R}} ≈ 11.2 \\text{ km/s}'
  },
  { 
    name: '第三宇宙速度', 
    symbol: 'v₃', 
    value: '16.7', 
    unit: 'km/s',
    description: '逃逸速度，航天器脱离太阳系引力进入星际空间的最小速度',
    formula: 'v₃ = \\sqrt{(\\sqrt{2}-1)^2 v_1^2 + v_2^2} ≈ 16.7 \\text{ km/s}'
  }
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // 单位转换状态
  const [category, setCategory] = useState<keyof typeof conversionCategories>('length');
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [inputValue, setInputValue] = useState('');

  // 常用物理量标签
  const [materialTab, setMaterialTab] = useState<'liquid' | 'solid' | 'gas' | 'celestial'>('liquid');

  // 根据搜索关键词过滤题目
  const filteredProblems = problemTypes.filter(problem => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      problem.title.toLowerCase().includes(query) ||
      problem.category.toLowerCase().includes(query) ||
      problem.description.toLowerCase().includes(query)
    );
  });

  // 高亮匹配文本
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={index} className="bg-yellow-500/40 text-white font-bold">{part}</span>
        : part
    );
  };

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
              
              {/* 搜索框 */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索题目、类别或描述..."
                  className="w-full p-3 pl-10 pr-4 rounded-lg bg-black/30 border border-white/10 text-white placeholder-blue-300/50 focus:border-blue-500 focus:outline-none text-sm"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 搜索结果统计 */}
              {searchQuery && (
                <div className="text-xs text-blue-300/60 mb-3">
                  找到 {filteredProblems.length} 个结果
                </div>
              )}

              <div className="space-y-2">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <button 
                      key={problem.id} 
                      onClick={() => setSelectedProblem(problem)} 
                      className={`w-full p-3 rounded-lg text-left transition-all ${selectedProblem.id === problem.id ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <div className="font-medium">{highlightText(problem.title, searchQuery)}</div>
                          <div className="text-xs text-blue-300/70 mt-1">{highlightText(problem.description, searchQuery)}</div>
                        </div>
                        <span className="text-xs bg-blue-600/30 px-2 py-1 rounded whitespace-nowrap">{highlightText(problem.category, searchQuery)}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-blue-300/50">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-sm">没有找到匹配的题目</p>
                    <p className="text-xs mt-1">尝试使用不同的关键词</p>
                  </div>
                )}
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

              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h4 className="text-lg font-semibold mb-4 text-purple-300">🚀 宇宙速度</h4>
                <div className="space-y-3">
                  {cosmicVelocities.map((velocity, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-400 font-bold">{velocity.symbol}</span>
                        <span className="font-semibold">{velocity.name}</span>
                        <span className="text-sm bg-purple-600/30 px-2 py-1 rounded">{velocity.value} {velocity.unit}</span>
                      </div>
                      <div className="text-sm text-blue-300/80 mb-2">{velocity.description}</div>
                      {velocity.formula && (
                        <div className="text-sm">
                          <span className="text-blue-400/70">公式：</span>
                          <BlockMath math={velocity.formula} />
                        </div>
                      )}
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
