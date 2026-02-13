'use client';

import { useState } from 'react';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  relatedConcepts: string[];
}

const quizQuestions: Question[] = [
  {
    id: 'newton-1',
    category: '力学',
    question: '根据牛顿第二定律，如果一个物体受到的合外力为0，则该物体的加速度为',
    options: ['0', '恒定值', '无限大', '无法确定'],
    correctAnswer: 0,
    explanation: '根据牛顿第二定律 F = ma，当合外力 F = 0 时，加速度 a = 0，物体保持静止或匀速直线运动（惯性定律）。',
    relatedConcepts: ['牛顿第二定律', '惯性']
  },
  {
    id: 'kinetic-1',
    category: '力学',
    question: '一个质量为2kg的物体，速度从5m/s增加到10m/s，其动能增加了',
    options: ['25J', '50J', '75J', '100J'],
    correctAnswer: 2,
    explanation: '动能 E_k = ½mv²。初动能 = 0.5×2×5² = 25J，末动能 = 0.5×2×10² = 100J。动能增量 = 100J - 25J = 75J。',
    relatedConcepts: ['动能', '能量守恒']
  },
  {
    id: 'projectile-1',
    category: '力学',
    question: '在忽略空气阻力的情况下，抛体运动中物体的',
    options: ['水平分速度保持不变', '竖直分速度保持不变', '加速度不断变化', '速度保持不变'],
    correctAnswer: 0,
    explanation: '在抛体运动中，水平方向不受力，水平分速度保持不变；竖直方向受重力作用，竖直分速度不断变化，加速度恒为g。',
    relatedConcepts: ['抛体运动', '运动的合成与分解']
  },
  {
    id: 'momentum-1',
    category: '力学',
    question: '两个物体发生完全弹性碰撞，碰撞前后',
    options: ['动量守恒，动能守恒', '动量守恒，动能不守恒', '动量不守恒，动能守恒', '动量不守恒，动能不守恒'],
    correctAnswer: 0,
    explanation: '在完全弹性碰撞中，系统不受外力，动量守恒；且由于是弹性碰撞，机械能（动能）也守恒。',
    relatedConcepts: ['动量守恒', '弹性碰撞', '能量守恒']
  },
  {
    id: 'work-1',
    category: '力学',
    question: '一个人将10kg的物体匀速提升2m，他对物体做的功为（g=10m/s²）',
    options: ['0J', '20J', '100J', '200J'],
    correctAnswer: 3,
    explanation: '匀速提升时，人对物体的拉力等于重力，F = mg = 10×10 = 100N。做功 W = F×h = 100×2 = 200J。',
    relatedConcepts: ['功', '重力', '力的平衡']
  },
  {
    id: 'ohm-1',
    category: '电磁学',
    question: '一个10Ω的电阻两端加20V电压，通过它的电流为',
    options: ['0.5A', '2A', '200A', '10A'],
    correctAnswer: 1,
    explanation: '根据欧姆定律 I = V/R = 20V/10Ω = 2A。',
    relatedConcepts: ['欧姆定律', '电阻', '电流']
  },
  {
    id: 'coulomb-1',
    category: '电磁学',
    question: '真空中两个点电荷，电量分别为+1μC和-1μC，相距1m，它们之间的静电力为',
    options: ['9×10³N', '9N', '9×10⁻³N', '0.9N'],
    correctAnswer: 0,
    explanation: '根据库仑定律 F = k(q₁q₂)/r² = 9×10⁹×(1×10⁻⁶×1×10⁻⁶)/1² = 9×10⁻³N。由于是异种电荷，互相吸引。',
    relatedConcepts: ['库仑定律', '静电力', '点电荷']
  },
  {
    id: 'refraction-1',
    category: '光学',
    question: '光从空气射入水中时，折射角',
    options: ['大于入射角', '小于入射角', '等于入射角', '无法确定'],
    correctAnswer: 1,
    explanation: '水是光密介质，空气是光疏介质。光从光疏介质进入光密介质时，折射角小于入射角。',
    relatedConcepts: ['光的折射', '折射率', '斯涅尔定律']
  },
  {
    id: 'interference-1',
    category: '光学',
    question: '在双缝干涉实验中，若将双缝间距增大，相邻明条纹的间距将',
    options: ['增大', '减小', '不变', '先增大后减小'],
    correctAnswer: 1,
    explanation: '双缝干涉的条纹间距 Δx = λL/d，其中d是双缝间距。当d增大时，Δx减小，条纹变密。',
    relatedConcepts: ['双缝干涉', '光的波动性', '波长']
  },
  {
    id: 'thermo-1',
    category: '热学',
    question: '理想气体在等温过程中',
    options: ['压强与体积成正比', '压强与体积成反比', '压强保持不变', '体积保持不变'],
    correctAnswer: 1,
    explanation: '理想气体在等温过程中，温度T保持不变。根据理想气体状态方程 PV = nRT，当T恒定时，P与V成反比。',
    relatedConcepts: ['理想气体状态方程', '等温过程', '玻意耳定律']
  }
];

export default function QuizSection() {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);

  const categories = ['all', '力学', '电磁学', '光学', '热学'];
  
  const filteredQuestions = currentCategory === 'all' 
    ? quizQuestions 
    : quizQuestions.filter(q => q.category === currentCategory);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowExplanation(true);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions([]);
    setQuizStarted(false);
  };

  const progress = ((currentQuestionIndex + 1) / filteredQuestions.length) * 100;

  if (!quizStarted) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">📝</div>
          <div>
            <h2 className="text-2xl font-bold">自测与挑战区</h2>
            <p className="text-sm text-blue-300/80">测试你的物理知识，巩固学习成果</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
            <h3 className="text-xl font-bold mb-4 text-center">物理知识自测</h3>
            <div className="text-center text-blue-300/80 mb-6">
              <p>共 {quizQuestions.length} 道题目</p>
              <p>涵盖力学、电磁学、光学、热学等主要领域</p>
            </div>

            <div className="space-y-3 mb-6">
              {categories.slice(1).map((cat) => {
                const count = quizQuestions.filter(q => q.category === cat).length;
                return (
                  <div key={cat} className="flex justify-between bg-black/30 rounded-lg p-3">
                    <span className="text-blue-200">{cat}</span>
                    <span className="text-blue-400">{count} 题</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setQuizStarted(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-blue-600/30 transition-all"
            >
              开始测试
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="font-semibold mb-3 text-blue-300">💡 测试说明</h4>
            <ul className="space-y-2 text-sm text-blue-100/80">
              <li>• 每道题有4个选项，只有1个正确答案</li>
              <li>• 提交后可查看详细解析和相关知识点</li>
              <li>• 测试完成后可查看总分和正确率</li>
              <li>• 建议完成后复习相关概念加深理解</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">📝</div>
        <div>
          <h2 className="text-2xl font-bold">自测与挑战区</h2>
          <p className="text-sm text-blue-300/80">测试你的物理知识</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-600/30 rounded-full text-sm">{currentQuestion.category}</span>
                <span className="text-sm text-blue-300/80">
                  {currentQuestionIndex + 1} / {filteredQuestions.length}
                </span>
              </div>
              <div className="text-sm text-blue-300/80">
                得分: {score} / {answeredQuestions.length}
              </div>
            </div>

            <div className="mb-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = 'bg-white/5 hover:bg-white/10 border border-white/10';
                
                if (showExplanation) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass = 'bg-green-600/30 border-green-500/50';
                  } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                    buttonClass = 'bg-red-600/30 border-red-500/50';
                  }
                } else if (selectedAnswer === index) {
                  buttonClass = 'bg-blue-600/30 border-blue-500/50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-lg text-left transition-all ${buttonClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        showExplanation && index === currentQuestion.correctAnswer
                          ? 'bg-green-500'
                          : showExplanation && index === selectedAnswer && index !== currentQuestion.correctAnswer
                          ? 'bg-red-500'
                          : 'bg-blue-600/30'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-blue-100">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="bg-black/30 rounded-xl p-5 mb-6 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{selectedAnswer === currentQuestion.correctAnswer ? '✓' : '✗'}</span>
                  <span className="font-semibold text-blue-300">
                    {selectedAnswer === currentQuestion.correctAnswer ? '回答正确！' : '回答错误'}
                  </span>
                </div>
                <p className="text-sm text-blue-100/80 mb-4">{currentQuestion.explanation}</p>
                <div>
                  <div className="text-sm font-semibold text-blue-300 mb-2">相关知识点：</div>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.relatedConcepts.map((concept, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-600/20 rounded-full text-xs text-blue-200">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-lg transition-all ${
                  currentQuestionIndex === 0
                    ? 'bg-white/10 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                ← 上一题
              </button>
              
              {!showExplanation ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    selectedAnswer === null
                      ? 'bg-white/10 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-600/30'
                  }`}
                >
                  提交答案
                </button>
              ) : (
                currentQuestionIndex < filteredQuestions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-600/30 transition-all"
                  >
                    下一题 →
                  </button>
                ) : (
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-lg hover:shadow-green-600/30 transition-all"
                  >
                    重新测试
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
            <h4 className="font-semibold mb-3 text-blue-300">当前进度</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-300/70">已完成</span>
                <span className="text-blue-200">{answeredQuestions.length} / {filteredQuestions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-300/70">正确数</span>
                <span className="text-green-400">{score}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-300/70">正确率</span>
                <span className="text-blue-200">
                  {answeredQuestions.length > 0 
                    ? ((score / answeredQuestions.length) * 100).toFixed(1)
                    : '0'}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
            <h4 className="font-semibold mb-3 text-blue-300">题目导航</h4>
            <div className="grid grid-cols-5 gap-2">
              {filteredQuestions.map((_, index) => {
                const isAnswered = answeredQuestions.includes(index);
                const isCorrect = isAnswered && 
                  quizQuestions.findIndex(q => q.id === filteredQuestions[index].id) !== -1;
                
                let bgColor = 'bg-white/10';
                if (isAnswered) {
                  bgColor = 'bg-blue-600/30';
                }
                if (index === currentQuestionIndex) {
                  bgColor = 'bg-purple-600/50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setSelectedAnswer(null);
                      setShowExplanation(answeredQuestions.includes(index));
                    }}
                    className={`w-10 h-10 rounded-lg ${bgColor} hover:opacity-80 transition-all flex items-center justify-center text-sm font-semibold`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
          >
            退出测试
          </button>
        </div>
      </div>
    </div>
  );
}
