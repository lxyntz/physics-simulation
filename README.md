# 初中物理可视化教学平台


这是一个专为初中物理教学设计的交互式可视化模拟平台。通过直观的动画和交互控制，帮助学生更好地理解物理概念和原理，培养科学思维和探究能力。

## 作者信息

- 物理教育工作室
- 专注于初中物理教育创新，致力于科学素养培养
- 个人公众号：物理可视化教学

## 项目特点

- 📊 **交互式模拟**：学生可以通过调整参数，观察物理现象的变化
-🎯 **直观可视化**：将抽象的物理概念转化为直观的视觉效果
- 📱 **响应式设计**：适配各种设备，从平板到电脑都有良好体验（推荐电脑学习）
- 🧠 **探究式学习**：鼓励学生通过观察和实验发现物理规律
- 🔍 **全站搜索功能**：快速查找感兴趣的物理实验，支持模糊搜索
- 🏫 **基于新课标**：严格按照2022年初中物理新课标设计内容，紧贴教学需求

## 六大领域

本平台涵盖初中物理的六大核心领域：

1. **力与运动**：研究物体运动与力的相互关系，包括牛顿定律、力的合成分解、压强与浮力等
2. **能量与转化**：探索能量的形式、转化与守恒，包括功、机械能、简单机械等
3. **电与磁**：研究电路、电流、电压及磁场，包括欧姆定律、电磁感应等
4. **光与声**：探索光的传播、反射与折射，以及声音的产生与传播特性
5. **热学**：研究热现象、分子热运动和热传递方式等
6. **科学探究与应用**：培养科学方法、实验设计与数据分析能力

各领域已添加详细分类页面，可访问对应页面查看更多内容：
- 力与运动：<a href="./modules/force-motion/index.html" target="_blank">/modules/force-motion/index.html</a>
- 能量与转化：<a href="./modules/energy/index.html" target="_blank">/modules/energy/index.html</a>
- 电与磁：<a href="./modules/electromagnetism/index.html" target="_blank">/modules/electromagnetism/index.html</a>
- 光与声：<a href="./modules/optics-acoustics/index.html" target="_blank">/modules/optics-acoustics/index.html</a>
- 热学：<a href="./modules/thermodynamics/index.html" target="_blank">/modules/thermodynamics/index.html</a>
- 科学探究与应用：<a href="./modules/scientific-inquiry/index.html" target="_blank">/modules/scientific-inquiry/index.html</a>

## 热门模拟实验

1. **牛顿运动定律交互实验**：
   - 通过可调节的力矢量，观察物体运动状态变化
   - 直观理解力、质量与加速度的关系
2. **电路实验室**：
   - 自由搭建电路，观察电流流动
   - 体验串并联电路的不同特性
3. **光的反射与折射**：
   - 调节光源角度和介质，观察光路变化
   - 探索全反射现象及其应用
4. **浮力原理探究**：
   - 调节物体密度和体积，观察浮沉状态
   - 理解阿基米德原理的应用条件
5. **分子热运动模拟**：
   - 可视化微观粒子运动状态
   - 探索温度与分子运动的关系

六大领域，更多模块开发中...

## 站点功能

1. **全站搜索**：在任意页面点击导航栏的搜索图标，快速查找实验- 支持模糊搜索和知识点搜索
   - 提供热门推荐实验- 搜索结果高亮显示匹配文本
2. **直观导航**：通过分类卡片和导航菜单快速访问不同领域
3. **实验过滤**：在子页面中按难度和分类筛选实验
4. **学习路径**：推荐合理的知识点学习顺序，从简单到复杂
5. **同步教材**：与主流教材版本知识点同步，支持按教材版本筛选

## 社交媒体

- GitHub: <a href="https://github.com/physics-interactive" target="_blank">https://github.com/physics-interactive</a>
- 微信公众号:物理可视化教学（关注开发最新动态）
- B站: <a href="https://space.bilibili.com/physics-interactive" target="_blank">物理可视化教学</a>
- 教师交流群: 扫描网站底部二维码加入

## 使用方法

方法一：打开链接直接使用 <a href="https://physics-interactive.edu.cn" target="_blank">https://physics-interactive.edu.cn</a>

方法二：
1. 克隆或下载本仓库
2. 打开 `index.html` 文件即可开始使用
3. 点击任意模拟实验卡片，进入对应的模拟页面
4. 根据页面指引，调整参数，观察物理现象变化
5. 使用搜索功能快速查找需要的实验

## 项目结构

```
physics-interactive/
├── index.html                     # 主页面
├── README.md                      # 项目说明文档
├── assets/                        # 静态资源目录
│   ├── images/                    # 图片资源
│   ├── models/                    # 3D模型
│   ├── audio/                     # 音效资源
│   └── fonts/                     # 字体文件
│
├── styles/                        # 样式文件目录
│   ├── main.css                   # 主样式
│   ├── theme.css                  # 主题设置
│   └── animations.css             # 动画效果
│
├── scripts/                       # 脚本目录
│   ├── core/                      # 核心功能
│   │   ├── app.js                 # 应用主体
│   │   ├── physics-engine.js      # 物理引擎
│   │   ├── interaction-manager.js # 交互管理
│   │   └── ui-controller.js       # 界面控制
│   │
│   ├── utils/                     # 工具函数
│   │   ├── math.js                # 数学计算
│   │   ├── vector.js              # 向量运算
│   │   └── data-visualizer.js     # 数据可视化
│   │
│   └── modules/                   # 模块脚本
│       ├── force-motion/          # 力与运动模块脚本
│       ├── energy/                # 能量模块脚本
│       ├── electromagnetism/      # 电磁模块脚本
│       ├── optics-acoustics/      # 光声模块脚本
│       ├── thermodynamics/        # 热学模块脚本
│       └── scientific-inquiry/    # 科学探究模块脚本
│
├── lib/                           # 第三方库
│   ├── matter.js                  # 2D物理引擎
│   ├── three.js                   # 3D渲染
│   ├── chart.js                   # 图表库
│   └── p5.js                      # 创意编程库
│
├── modules/                       # 模块页面
│   ├── force-motion/              # 力与运动模块
│   │   ├── index.html             # 模块首页
│   │   ├── newton-laws.html       # 牛顿定律
│   │   ├── force-composition.html # 力的合成与分解
│   │   ├── pressure.html          # 压强
│   │   └── buoyancy.html          # 浮力
│   │
│   ├── energy/                    # 能量与转化模块
│   │   ├── index.html             # 模块首页
│   │   ├── energy-forms.html      # 能量形式
│   │   ├── energy-conversion.html # 能量转化
│   │   └── simple-machines.html   # 简单机械
│   │
│   ├── electromagnetism/          # 电与磁模块
│   │   ├── index.html             # 模块首页
│   │   ├── circuits.html          # 电路
│   │   ├── ohms-law.html          # 欧姆定律
│   │   └── electromagnetic.html   # 电磁感应
│   │
│   ├── optics-acoustics/          # 光与声模块
│   │   ├── index.html             # 模块首页
│   │   ├── reflection.html        # 光的反射
│   │   ├── refraction.html        # 光的折射
│   │   ├── lenses.html            # 透镜成像
│   │   └── sound-waves.html       # 声波特性
│   │
│   ├── thermodynamics/            # 热学模块
│   │   ├── index.html             # 模块首页
│   │   ├── molecular-motion.html  # 分子运动
│   │   ├── heat-transfer.html     # 热传递
│   │   └── phase-changes.html     # 相变
│   │
│   └── scientific-inquiry/        # 科学探究模块
│       ├── index.html             # 模块首页
│       ├── virtual-lab.html       # 虚拟实验室
│       └── applications.html      # 现代技术应用
│
└── docs/                          # 文档和教学资源
    ├── teacher-guide/# 教师指南
    ├── student-worksheets/        # 学生工作单
    └── curriculum-standards/      # 课程标准参考
```

## 版本历史

当前版本：1.0.0 (2025年4月)
- 基于2022年新课标全新设计的初中物理可视化教学平台
- 推出六大核心领域的基础模拟实验
- 优化用户界面和交互体验，适配多种设备
- 提供全站搜索和教材同步功能

计划更新：1.1.0 (2025年7月)
- 增加更多交互实验，完善各模块内容
- 添加学生成就系统和进度跟踪
- 优化移动端体验
- 增加教师定制功能，允许教师调整实验参数范围

## 教育理念

本平台基于"做中学"的教育理念，通过交互式可视化帮助学生:
- 将抽象概念具象化，降低物理学习难度
- 培养科学探究精神和实验设计能力
- 建立物理现象与数学模型之间的联系
- 激发对科学的兴趣和好奇心

## 许可证

© 2025 初中物理可视化教学平台. 保留所有权利.
