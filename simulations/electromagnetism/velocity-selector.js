// 全局变量
let isPaused = true; // 默认暂停状态
let showTrajectories = true;
let showFieldLines = true;
let showForces = false;
let demoMode = "single";

// 粒子属性
let particleType = "electron";
let particleMass = 9.11e-31; // 电子质量，单位：kg
let particleCharge = -1.60e-19; // 电子电荷，单位：C
let particleVelocity = 1.00e6; // 初始速度，单位：m/s

// 电场属性
let electricField = 5.00e3; // 电场强度，单位：V/m
let electricFieldDirection = "up"; // 电场方向
let plateDistance = 0.08; // 电极间距，单位：m（默认为8厘米）

// 磁场属性
let magneticField = 0.50; // 磁场强度，单位：T
let magneticFieldDirection = "in"; // 磁场方向

// 粒子状态控制
let particleDelay = false; // 粒子延迟消失控制
let particleDelayTimer = null; // 粒子延迟计时器

// 模拟相关变量
let particles = [];
let trajectories = []; // 存储轨迹点
let maxTrajectoryPoints = 150; // 增加轨迹点数量，避免轨迹过早消失
let simulationScale = 1200; // 缩放因子
let simulationWidth, simulationHeight;
let selectorLength = 0.4; // 速度选择器的长度，单位：m
let entryX = 0.15; // 将入口位置向左移动，单位：m

// P5.js 实例
let sketch = function(p) {
    p.setup = function() {
        // 创建Canvas，增加大小
        const container = document.getElementById('canvas-container');
        simulationWidth = container.offsetWidth;
        simulationHeight = 600; // 增加高度到600px
        let canvas = p.createCanvas(simulationWidth, simulationHeight);
        canvas.parent('canvas-container');
        
        // 初始化
        resetSimulation();
        
        // 添加事件监听器
        setupEventListeners();
        
        p.frameRate(60);
        
        // 初始化时更新平衡速度显示
        updateBalanceVelocityDisplay();
    };
    
    p.draw = function() {
        // 清空背景
        p.background(248, 250, 252);
        
        // 更新参数（根据控制面板）
        updateParameters();
        
        // 绘制电场和磁场
        drawFields();
        
        // 绘制速度选择器装置
        drawSelector();
        
        // 如果未暂停，更新粒子位置
        if (!isPaused) {
            updateParticles();
        }
        
        // 绘制粒子和轨迹
        drawParticles();
        
        // 更新理论计算结果
        updateCalculations();
    };
    
    // 重置模拟
    function resetSimulation() {
        // 取消任何正在进行的延迟计时器
        if (particleDelayTimer) {
            clearTimeout(particleDelayTimer);
            particleDelayTimer = null;
        }
        
        particleDelay = false;
        particles = [];
        trajectories = [];
        
        // 根据演示模式创建粒子
        createParticles();
        
        // 更新平衡速度显示
        updateBalanceVelocityDisplay();
    }
    
    // 创建粒子
    function createParticles() {
        particles = [];
        trajectories = [];
        
        // 入射点 - 设置为选择器左侧入口
        let entryPointX = entryX * simulationScale;
        let entryPointY = simulationHeight / 2;
        
        // 根据演示模式创建不同的粒子集合
        switch(demoMode) {
            case "single":
                // 单个粒子，从左向右运动
                particles.push({
                    x: entryPointX,
                    y: entryPointY,
                    vx: particleVelocity,
                    vy: 0,
                    charge: particleCharge,
                    mass: particleMass,
                    radius: 8, // 粒子尺寸
                    color: particleCharge < 0 ? p.color(59, 130, 246) : p.color(239, 68, 68),
                    active: true, // 新增粒子状态标记
                    delaying: false // 是否处于延迟状态
                });
                trajectories.push([]);
                break;
                
            case "multiple":
                // 一批相同粒子（不同入射点）
                let particleCount = 5;
                let spacing = plateDistance * simulationScale / (particleCount + 1);
                
                for (let i = 0; i < particleCount; i++) {
                    let offsetY = spacing * (i + 1) - plateDistance * simulationScale / 2;
                    particles.push({
                        x: entryPointX,
                        y: entryPointY + offsetY,
                        vx: particleVelocity,
                        vy: 0,
                        charge: particleCharge,
                        mass: particleMass,
                        radius: 8,
                        color: particleCharge < 0 ? p.color(59, 130, 246) : p.color(239, 68, 68),
                        active: true,
                        delaying: false
                    });
                    trajectories.push([]);
                }
                break;
                
            case "various":
                // 不同速度的粒子
                let speedCount = 3;
                let speedVariations = [0.5, 1.0, 1.5]; // 速度比例
                
                for (let i = 0; i < speedCount; i++) {
                    particles.push({
                        x: entryPointX,
                        y: entryPointY,
                        vx: particleVelocity * speedVariations[i],
                        vy: 0,
                        charge: particleCharge,
                        mass: particleMass,
                        radius: 8,
                        color: i === 0 ? p.color(239, 68, 68) : // 慢粒子
                               i === 1 ? p.color(59, 130, 246) : // 匹配粒子
                               p.color(16, 185, 129),  // 快粒子
                        active: true,
                        delaying: false
                    });
                    trajectories.push([]);
                }
                break;
                
            case "balance":
                // 速度选择平衡演示
                // 计算理想平衡速度
                let balanceVelocity = Math.abs(electricField / magneticField);
                if (magneticField === 0 || Math.abs(magneticField) < 1e-6) balanceVelocity = particleVelocity; // 避免除以零
                
                // 创建三种粒子：平衡速度、高速度、低速度
                let velocities = [
                    balanceVelocity, // 平衡速度
                    balanceVelocity * 1.5, // 高速度
                    balanceVelocity * 0.5  // 低速度
                ];
                
                for (let i = 0; i < 3; i++) {
                    particles.push({
                        x: entryPointX,
                        y: entryPointY,
                        vx: velocities[i],
                        vy: 0,
                        charge: particleCharge,
                        mass: particleMass,
                        radius: 8,
                        color: i === 0 ? p.color(59, 130, 246) : // 平衡粒子
                               i === 1 ? p.color(16, 185, 129) : // 快粒子
                               p.color(239, 68, 68),  // 慢粒子
                        active: true,
                        delaying: false
                    });
                    trajectories.push([]);
                }
                break;
        }
    }
    
    // 更新粒子位置
    function updateParticles() {
        // 如果处于粒子延迟状态，不进行更新
        if (particleDelay) return;
        
        // 时间步长（模拟的精度）
        let dt = 3e-11; // 30皮秒，进一步减小时间步长以提高精度
        // 每帧更新的迭代次数
        let iterations = 5; // 增加迭代次数，使运动更平滑
        
        // 选择器区域范围
        let selectorStartX = entryX * simulationScale;
        let selectorEndX = (entryX + selectorLength) * simulationScale;
        
        // 检查是否需要创建新粒子
        let needNewParticle = true;
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].active) {
                needNewParticle = false;
                break;
            }
        }
        
        // 如果所有粒子都不活跃，创建新粒子
        if (needNewParticle) {
            resetSimulation();
            return;
        }
        
        // 多次迭代更新位置，提高稳定性
        for (let iter = 0; iter < iterations; iter++) {
            // 更新每个粒子
            for (let i = 0; i < particles.length; i++) {
                let particle = particles[i];
                
                // 如果粒子不活跃或处于延迟状态，跳过更新
                if (!particle.active || particle.delaying) continue;
                
                // 计算电场力和磁场力
                let Fx = 0, Fy = 0;
                
                // 只在选择器区域内应用场力
                if (particle.x >= selectorStartX && particle.x <= selectorEndX) {
                    // 电场力: F = qE
                    let Fe = particle.charge * electricField;
                    Fy += (electricFieldDirection === "up") ? Fe : -Fe;
                    
                    // 磁场力: F = qvB
                    if (magneticField > 0) {
                        let Fm = particle.charge * particle.vx * magneticField;
                        Fy += (magneticFieldDirection === "in") ? Fm : -Fm;
                    }
                }
                
                // 计算加速度: a = F/m
                let ax = Fx / particle.mass;
                let ay = Fy / particle.mass;
                
                // 更新速度: v = v + a*dt
                particle.vx += ax * dt;
                particle.vy += ay * dt;
                
                // 限制垂直速度，避免粒子速度过快导致不稳定
                let maxVy = 0.5 * particleVelocity;
                if (Math.abs(particle.vy) > maxVy) {
                    particle.vy = Math.sign(particle.vy) * maxVy;
                }
                
                // 更新位置: x = x + v*dt
                // 缩放为像素单位
                particle.x += particle.vx * dt * simulationScale;
                particle.y += particle.vy * dt * simulationScale;
                
                // 边界检查 - 当粒子通过出口时进入延迟状态，之后再消失
                if (particle.x > selectorEndX + 10) { // 通过右侧出口
                    // 设置粒子为延迟状态
                    particle.delaying = true;
                    
                    // 设置粒子延迟消失
                    particleDelay = true;
                    
                    // 2秒后执行消失
                    particleDelayTimer = setTimeout(() => {
                        // 设置粒子为不活跃
                        particle.active = false;
                        particle.delaying = false;
                        particleDelay = false;
                    }, 2000);
                }
                
                // 如果粒子从上下边界离开立即设为不活跃
                if (particle.y < 0 || particle.y > simulationHeight) {
                    particle.active = false;
                }
                
                // 如果粒子从左侧离开也设为不活跃
                if (particle.x < 0) {
                    particle.active = false;
                }
            }
        }
        
        // 记录轨迹点，只在每帧结束时进行一次，减少计算量
        if (showTrajectories) {
            for (let i = 0; i < particles.length; i++) {
                let particle = particles[i];
                if (!trajectories[i]) trajectories[i] = [];
                
                // 只记录活跃粒子的轨迹，处于延迟状态的粒子仍然记录轨迹
                if (particle.active) {
                    // 限制相邻轨迹点之间的最小距离，避免过多的点
                    let lastPoint = trajectories[i].length > 0 ? trajectories[i][trajectories[i].length - 1] : null;
                    if (!lastPoint || 
                        Math.sqrt(Math.pow(particle.x - lastPoint.x, 2) + Math.pow(particle.y - lastPoint.y, 2)) > 5) {
                        trajectories[i].push({x: particle.x, y: particle.y});
                    }
                    
                    // 限制轨迹点数
                    if (trajectories[i].length > maxTrajectoryPoints) {
                        trajectories[i].shift();
                    }
                }
            }
        }
    }
    
    // 重置单个粒子到入口
    function resetParticle(index) {
        let entryPointX = entryX * simulationScale;
        let entryPointY = simulationHeight / 2;
        
        // 保留粒子的原始属性，只重置位置和速度
        particles[index].x = entryPointX;
        particles[index].y = entryPointY;
        particles[index].vy = 0; // 重置垂直速度为0
        particles[index].active = true; // 重新激活粒子
        particles[index].delaying = false; // 重置延迟状态
        
        // 保持水平速度原值，但确保方向向右
        if (demoMode === "various" || demoMode === "balance") {
            // 这些模式下保持原有速度大小
            particles[index].vx = Math.abs(particles[index].vx);
        } else {
            // 其他模式重置为标准速度
            particles[index].vx = particleVelocity;
        }
        
        // 根据演示模式调整
        if (demoMode === "multiple") {
            let particleCount = particles.length;
            let spacing = plateDistance * simulationScale / (particleCount + 1);
            let offsetY = spacing * (index + 1) - plateDistance * simulationScale / 2;
            particles[index].y = entryPointY + offsetY;
        }
        
        // 清除轨迹
        trajectories[index] = [];
    }
    
    // 绘制粒子和轨迹
    function drawParticles() {
        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];
            
            // 绘制轨迹
            if (showTrajectories && trajectories[i] && trajectories[i].length > 0) {
                p.noFill();
                p.stroke(particle.color);
                p.strokeWeight(2); // 线宽
                p.beginShape();
                for (let j = 0; j < trajectories[i].length; j++) {
                    p.vertex(trajectories[i][j].x, trajectories[i][j].y);
                }
                p.endShape();
            }
            
            // 只绘制活跃的粒子，包括处于延迟状态的粒子
            if (particle.active) {
                p.fill(particle.color);
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.radius * 2);
                
                // 如果启用力显示，绘制力矢量
                if (showForces && particle.x >= entryX * simulationScale && particle.x <= (entryX + selectorLength) * simulationScale) {
                    // 电场力
                    let Fe = particle.charge * electricField * 5e-16; // 缩放因子使力可见
                    let FeY = (electricFieldDirection === "up") ? -Fe : Fe;
                    
                    p.stroke(239, 68, 68); // 红色
                    p.strokeWeight(2);
                    p.line(particle.x, particle.y, particle.x, particle.y + FeY * simulationScale);
                    
                    // 在力的末端绘制箭头
                    drawArrow(particle.x, particle.y + FeY * simulationScale, FeY > 0);
                    
                    // 磁场力
                    if (magneticField > 0) {
                        let Fm = particle.charge * particle.vx * magneticField * 5e-16;
                        let FmY = (magneticFieldDirection === "in") ? -Fm : Fm;
                        
                        p.stroke(59, 130, 246); // 蓝色
                        p.strokeWeight(2);
                        p.line(particle.x, particle.y, particle.x, particle.y + FmY * simulationScale);
                        
                        // 在力的末端绘制箭头
                        drawArrow(particle.x, particle.y + FmY * simulationScale, FmY > 0);
                        
                        // 合力
                        let Fnet = FeY + FmY;
                        p.stroke(16, 185, 129); // 绿色
                        p.strokeWeight(3);
                        p.line(particle.x, particle.y, particle.x, particle.y + Fnet * simulationScale);
                        
                        // 在力的末端绘制箭头
                        drawArrow(particle.x, particle.y + Fnet * simulationScale, Fnet > 0);
                    }
                }
            }
        }
    }
    
    // 绘制箭头
    function drawArrow(x, y, pointUp) {
        let arrowSize = 5;
        p.noStroke();
        
        // 保存当前填充颜色
        let currentFill = p.drawingContext.fillStyle;
        // 使用当前描边颜色作为填充
        p.fill(p.drawingContext.strokeStyle);
        
        p.beginShape();
        if (pointUp) {
            p.vertex(x, y);
            p.vertex(x - arrowSize, y + arrowSize);
            p.vertex(x + arrowSize, y + arrowSize);
        } else {
            p.vertex(x, y);
            p.vertex(x - arrowSize, y - arrowSize);
            p.vertex(x + arrowSize, y - arrowSize);
        }
        p.endShape(p.CLOSE);
        
        // 恢复填充颜色
        p.fill(currentFill);
    }
    
    // 绘制电场和磁场
    function drawFields() {
        // 选择器区域范围
        let selectorStartX = entryX * simulationScale;
        let selectorEndX = (entryX + selectorLength) * simulationScale;
        let selectorWidth = selectorEndX - selectorStartX;
        
        // 绘制选择器区域背景
        p.noStroke();
        p.fill(243, 244, 246, 150);
        p.rect(selectorStartX, simulationHeight / 2 - plateDistance * simulationScale / 2, 
               selectorWidth, plateDistance * simulationScale);
        
        // 如果启用场线显示
        if (showFieldLines) {
            // 绘制电场线
            p.stroke(239, 68, 68, 100); // 红色半透明
            p.strokeWeight(1);
            
            let lineSpacing = 20; // 增加线间距，适应更大的选择器
            let arrowSize = 5;
            
            for (let x = selectorStartX + lineSpacing; x < selectorEndX; x += lineSpacing) {
                let midY = simulationHeight / 2;
                let halfHeight = plateDistance * simulationScale / 2;
                
                // 垂直电场线
                p.line(x, midY - halfHeight, x, midY + halfHeight);
                
                // 电场方向箭头
                p.fill(239, 68, 68, 100);
                p.noStroke();
                if (electricFieldDirection === "up") {
                    p.triangle(x, midY - halfHeight + arrowSize, 
                              x - arrowSize, midY - halfHeight + arrowSize * 2,
                              x + arrowSize, midY - halfHeight + arrowSize * 2);
                } else {
                    p.triangle(x, midY + halfHeight - arrowSize, 
                              x - arrowSize, midY + halfHeight - arrowSize * 2,
                              x + arrowSize, midY + halfHeight - arrowSize * 2);
                }
                p.stroke(239, 68, 68, 100); // 恢复描边设置
            }
            
            // 绘制磁场符号
            if (magneticField > 0) {
                let dotSpacing = 25; // 增加间距
                let dotSize = 4; // 增大符号尺寸
                
                for (let x = selectorStartX + dotSpacing; x < selectorEndX; x += dotSpacing) {
                    for (let y = simulationHeight / 2 - plateDistance * simulationScale / 2 + dotSpacing; 
                         y < simulationHeight / 2 + plateDistance * simulationScale / 2; y += dotSpacing) {
                        
                        // 修正磁场符号显示
                        if (magneticFieldDirection === "in") {
                            // 使用叉号(×)表示向内的磁场
                            p.stroke(59, 130, 246, 150);
                            p.strokeWeight(2);
                            p.line(x - dotSize, y - dotSize, x + dotSize, y + dotSize);
                            p.line(x + dotSize, y - dotSize, x - dotSize, y + dotSize);
                        } else {
                            // 使用点(⊙)表示向外的磁场
                            p.noStroke();
                            p.fill(59, 130, 246, 150);
                            p.ellipse(x, y, dotSize * 2);
                            
                            // 添加小的内部圆点增强可视效果
                            p.fill(59, 130, 246, 200);
                            p.ellipse(x, y, dotSize);
                        }
                    }
                }
            }
        }
    }
    
    // 绘制速度选择器装置
    function drawSelector() {
        // 选择器区域范围
        let selectorStartX = entryX * simulationScale;
        let selectorEndX = (entryX + selectorLength) * simulationScale;
        let selectorMidY = simulationHeight / 2;
        let halfPlateDistance = plateDistance * simulationScale / 2;
        
        // 绘制电极板
        p.stroke(107, 114, 128);
        p.strokeWeight(2);
        p.fill(209, 213, 219);
        
        // 上电极
        p.rect(selectorStartX, selectorMidY - halfPlateDistance - 5, 
              selectorEndX - selectorStartX, 5);
        
        // 下电极
        p.rect(selectorStartX, selectorMidY + halfPlateDistance, 
              selectorEndX - selectorStartX, 5);
        
        // 绘制入口和出口垂直挡板
        p.fill(158, 163, 175);
        p.noStroke();
        
        // 入口挡板
        p.rect(selectorStartX - 5, selectorMidY - halfPlateDistance - 20, 
              5, plateDistance * simulationScale + 40);
        
        // 出口挡板
        p.rect(selectorEndX, selectorMidY - halfPlateDistance - 20, 
              5, plateDistance * simulationScale + 40);
        
        // 入口和出口的孔洞
        p.fill(0, 0, 0, 50);
        p.ellipse(selectorStartX - 2.5, selectorMidY, 8); // 孔洞尺寸
        p.ellipse(selectorEndX + 2.5, selectorMidY, 8);
        
        // 标记选择器尺寸
        p.fill(107, 114, 128);
        p.noStroke();
        p.textSize(14); // 增大字体
        p.textAlign(p.CENTER);
        
        // 标记电极间距
        p.text(plateDistance * 100 + " cm", 
              selectorStartX + 60, selectorMidY);
        
        // 标记选择器长度
        p.text(selectorLength * 100 + " cm", 
              (selectorStartX + selectorEndX) / 2, selectorMidY - halfPlateDistance - 15);
    }
    
    // 更新参数（从UI控件）
    function updateParameters() {
        // 获取所有控件的当前值
        const newParticleType = document.getElementById('particle-type').value;
        const newElectricFieldDirection = document.getElementById('electric-field-direction').value;
        const newMagneticFieldDirection = document.getElementById('magnetic-field-direction').value;
        const newDemoMode = document.getElementById('demo-mode').value;
        
        const newShowTrajectories = document.getElementById('show-trajectories').checked;
        const newShowFieldLines = document.getElementById('show-field-lines').checked;
        const newShowForces = document.getElementById('show-forces').checked;
        
        // 更新数值参数
        const newParticleVelocity = parseFloat(document.getElementById('particle-velocity').value) * 1e6;
        const newElectricField = parseFloat(document.getElementById('electric-field').value) * 1e3;
        const newMagneticField = parseFloat(document.getElementById('magnetic-field').value);
        const newPlateDistance = parseFloat(document.getElementById('plate-distance').value) / 100; // 从cm转换为m
        
        // 检查演示模式变化
        if (newDemoMode !== demoMode) {
            demoMode = newDemoMode;
            resetSimulation();
            return;
        }
        
        // 更新显示设置
        showTrajectories = newShowTrajectories;
        showFieldLines = newShowFieldLines;
        showForces = newShowForces;
        
        // 检测粒子类型变化
        if (newParticleType !== particleType) {
            particleType = newParticleType;
            updateParticleProperties(particleType);
            return;
        }
        
        // 更新方向参数
        electricFieldDirection = newElectricFieldDirection;
        magneticFieldDirection = newMagneticFieldDirection;
        
        // 检测自定义模式下的粒子属性变化
        if (particleType === "custom") {
            // 自定义模式，从滑块获取值
            particleMass = parseFloat(document.getElementById('particle-mass').value) * 1e-27;
            particleCharge = parseFloat(document.getElementById('particle-charge').value) * 1e-19;
        }
        
        // 检测参数变化需要重置模拟
        let needReset = false;
        
        if (Math.abs(newParticleVelocity - particleVelocity) > 1e-6) {
            particleVelocity = newParticleVelocity;
            needReset = true;
        }
        
        if (Math.abs(newElectricField - electricField) > 1e-6) {
            electricField = newElectricField;
            needReset = true;
        }
        
        if (Math.abs(newMagneticField - magneticField) > 1e-6) {
            magneticField = newMagneticField;
            needReset = true;
        }
        
        if (Math.abs(newPlateDistance - plateDistance) > 1e-6) {
            plateDistance = newPlateDistance;
            needReset = true;
        }
        
        if (needReset) {
            resetSimulation();
        } else {
            // 即使不需要重置，也更新平衡速度显示
            updateBalanceVelocityDisplay();
        }
    }
    
    // 更新平衡速度显示
    function updateBalanceVelocityDisplay() {
        // 计算平衡速度
        let balanceVelocity = Math.abs(electricField / magneticField);
        if (magneticField === 0 || Math.abs(magneticField) < 1e-6) balanceVelocity = Infinity;
        
        // 更新HTML元素
        const balanceVelocityElement = document.getElementById('balance-velocity-value');
        if (balanceVelocityElement) {
            balanceVelocityElement.innerText = isFinite(balanceVelocity) ? 
                (balanceVelocity / 1e6).toFixed(2) + " × 10⁶ m/s" : 
                "∞";
        }
    }
    
    // 根据粒子类型更新属性
    function updateParticleProperties(type) {
        const particleMassSlider = document.getElementById('particle-mass');
        const particleChargeSlider = document.getElementById('particle-charge');
        
        switch(type) {
            case "electron":
                particleMass = 9.11e-31; // kg
                particleCharge = -1.602e-19; // C
                particleMassSlider.value = "9.11";
                document.getElementById('mass-value').textContent = "9.11";
                particleChargeSlider.value = "-1.60";
                document.getElementById('charge-value').textContent = "-1.60";
                break;
                
            case "proton":
                particleMass = 1.673e-27; // kg
                particleCharge = 1.602e-19; // C
                particleMassSlider.value = "1673";
                document.getElementById('mass-value').textContent = "1673";
                particleChargeSlider.value = "1.60";
                document.getElementById('charge-value').textContent = "1.60";
                break;
                
            case "alpha":
                particleMass = 6.644e-27; // kg
                particleCharge = 3.204e-19; // C (2 * proton charge)
                particleMassSlider.value = "6644";
                document.getElementById('mass-value').textContent = "6644";
                particleChargeSlider.value = "3.20";
                document.getElementById('charge-value').textContent = "3.20";
                break;
                
            case "custom":
                // 启用滑块编辑
                particleMassSlider.disabled = false;
                particleChargeSlider.disabled = false;
                return;
        }
        
        // 禁用滑块编辑（非自定义模式）
        particleMassSlider.disabled = true;
        particleChargeSlider.disabled = true;
        
        // 重置模拟
        resetSimulation();
    }
    
    // 更新理论计算结果
    function updateCalculations() {
        // 计算选择速度：v = E/B
        let selectedVelocity = Math.abs(electricField / magneticField);
        if (magneticField === 0 || Math.abs(magneticField) < 1e-6) selectedVelocity = Infinity;
        
        // 计算速度比
        let velocityRatio = particleVelocity / selectedVelocity;
        if (!isFinite(velocityRatio)) velocityRatio = Infinity;
        
        // 更新显示
        document.getElementById('selected-velocity').innerText = 
            isFinite(selectedVelocity) ? 
            (selectedVelocity / 1e6).toFixed(2) + " × 10⁶ m/s" : 
            "∞";
        
        document.getElementById('velocity-ratio').innerText = 
            isFinite(velocityRatio) ? 
            velocityRatio.toFixed(2) : 
            "∞";
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 重置按钮
        document.getElementById('reset-btn').addEventListener('click', function() {
            resetSimulation();
        });
        
        // 暂停按钮
        document.getElementById('pause-btn').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerHTML = isPaused ? 
                '<i class="fas fa-play mr-2"></i>开始' : 
                '<i class="fas fa-pause mr-2"></i>暂停';
        });
        
        // 粒子类型选择
        document.getElementById('particle-type').addEventListener('change', function() {
            updateParticleProperties(this.value);
        });
        
        // 演示模式选择
        document.getElementById('demo-mode').addEventListener('change', function() {
            resetSimulation();
        });
        
        // 电场和磁场参数变化时更新平衡速度
        document.getElementById('electric-field').addEventListener('input', updateBalanceVelocityDisplay);
        document.getElementById('magnetic-field').addEventListener('input', updateBalanceVelocityDisplay);
    }
    
    // 窗口大小调整处理
    p.windowResized = function() {
        const container = document.getElementById('canvas-container');
        simulationWidth = container.offsetWidth;
        p.resizeCanvas(simulationWidth, simulationHeight);
        
        // 重置模拟以适应新尺寸
        resetSimulation();
    };
};

// 创建p5实例
new p5(sketch); 