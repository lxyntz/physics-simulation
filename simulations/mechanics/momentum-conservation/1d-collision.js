// 全局变量
let balls = [];
let wallLeft, wallRight;
let simulationStarted = false;
let collisionHappened = false;
let initialMomentum, finalMomentum;
let initialEnergy, finalEnergy;
let collisionType = 'elastic';
let restitutionCoefficient = 0.5;

// DOM元素引用
const leftMassSlider = document.getElementById('left-mass');
const leftMassValue = document.getElementById('left-mass-value');
const leftVelocitySlider = document.getElementById('left-velocity');
const leftVelocityValue = document.getElementById('left-velocity-value');
const rightMassSlider = document.getElementById('right-mass');
const rightMassValue = document.getElementById('right-mass-value');
const rightVelocitySlider = document.getElementById('right-velocity');
const rightVelocityValue = document.getElementById('right-velocity-value');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const initialMomentumSpan = document.getElementById('initial-momentum');
const finalMomentumSpan = document.getElementById('final-momentum');
const initialEnergySpan = document.getElementById('initial-energy');
const finalEnergySpan = document.getElementById('final-energy');
const momentumConservationSpan = document.getElementById('momentum-conservation');
const energyConservationSpan = document.getElementById('energy-conservation');
const elasticRadio = document.getElementById('elastic');
const inelasticRadio = document.getElementById('inelastic');
const perfectlyInelasticRadio = document.getElementById('perfectly-inelastic');
const coefficientContainer = document.getElementById('coefficient-container');
const coefficientSlider = document.getElementById('coefficient');
const coefficientValue = document.getElementById('coefficient-value');

// 碰撞类型选择事件
elasticRadio.addEventListener('change', function() {
    if (this.checked) {
        collisionType = 'elastic';
        coefficientContainer.classList.add('hidden');
        resetSimulation();
    }
});

inelasticRadio.addEventListener('change', function() {
    if (this.checked) {
        collisionType = 'inelastic';
        coefficientContainer.classList.remove('hidden');
        restitutionCoefficient = parseFloat(coefficientSlider.value);
        resetSimulation();
    }
});

perfectlyInelasticRadio.addEventListener('change', function() {
    if (this.checked) {
        collisionType = 'perfectly-inelastic';
        coefficientContainer.classList.add('hidden');
        resetSimulation();
    }
});

// 恢复系数滑块事件
coefficientSlider.addEventListener('input', function() {
    restitutionCoefficient = parseFloat(this.value);
    coefficientValue.textContent = restitutionCoefficient;
    resetSimulation();
});

// 左侧球质量滑块事件
leftMassSlider.addEventListener('input', function() {
    leftMassValue.textContent = this.value;
    resetSimulation();
});

// 左侧球速度滑块事件
leftVelocitySlider.addEventListener('input', function() {
    leftVelocityValue.textContent = this.value;
    resetSimulation();
});

// 右侧球质量滑块事件
rightMassSlider.addEventListener('input', function() {
    rightMassValue.textContent = this.value;
    resetSimulation();
});

// 右侧球速度滑块事件
rightVelocitySlider.addEventListener('input', function() {
    rightVelocityValue.textContent = this.value;
    resetSimulation();
});

// 开始按钮事件
startBtn.addEventListener('click', function() {
    if (!simulationStarted) {
        simulationStarted = true;
        initialMomentum = calculateTotalMomentum();
        initialEnergy = calculateTotalEnergy();
        
        // 更新初始动量和能量显示
        initialMomentumSpan.textContent = initialMomentum.toFixed(2) + ' kg·m/s';
        initialEnergySpan.textContent = initialEnergy.toFixed(2) + ' J';
        
        // 更改按钮文本
        startBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停模拟';
    } else {
        simulationStarted = false;
        startBtn.innerHTML = '<i class="fas fa-play mr-2"></i>继续模拟';
    }
});

// 重置按钮事件
resetBtn.addEventListener('click', resetSimulation);

// 重置模拟
function resetSimulation() {
    simulationStarted = false;
    collisionHappened = false;
    initialMomentum = null;
    finalMomentum = null;
    initialEnergy = null;
    finalEnergy = null;
    
    // 重置数据显示
    initialMomentumSpan.textContent = '0 kg·m/s';
    finalMomentumSpan.textContent = '0 kg·m/s';
    initialEnergySpan.textContent = '0 J';
    finalEnergySpan.textContent = '0 J';
    momentumConservationSpan.textContent = '是';
    momentumConservationSpan.className = 'text-sm font-medium text-green-600';
    energyConservationSpan.textContent = '是';
    energyConservationSpan.className = 'text-sm font-medium text-green-600';
    
    // 重置按钮文本
    startBtn.innerHTML = '<i class="fas fa-play mr-2"></i>开始模拟';
    
    // 重新创建小球
    createBalls();
}

// 创建小球
function createBalls() {
    balls = [];
    
    // 计算画布尺寸
    const canvasWidth = width;
    const canvasHeight = height;
    
    // 确保有有效的画布尺寸
    if(!canvasWidth || !canvasHeight) {
        console.error("Canvas dimensions not available");
        return;
    }
    
    console.log("Canvas dimensions:", canvasWidth, "x", canvasHeight);
    
    // 设置墙壁位置
    wallLeft = 60;
    wallRight = canvasWidth - 60;
    
    // 减小小球半径计算系数，防止过大
    const radiusScale = 1.5; // 进一步减小半径系数
    
    // 创建左侧小球 - 位置更靠左
    const leftBallMass = parseInt(leftMassSlider.value);
    const leftBallVelocity = parseFloat(leftVelocitySlider.value);
    const leftBallRadius = 12 + radiusScale * leftBallMass; // 进一步减小基础半径
    const leftBall = {
        position: createVector(canvasWidth * 0.25, canvasHeight / 2),
        velocity: createVector(leftBallVelocity, 0),
        mass: leftBallMass,
        radius: leftBallRadius,
        color: color(59, 130, 246), // 蓝色
        isStuck: false
    };
    
    // 创建右侧小球 - 位置更靠右
    const rightBallMass = parseInt(rightMassSlider.value);
    const rightBallVelocity = parseFloat(rightVelocitySlider.value);
    const rightBallRadius = 12 + radiusScale * rightBallMass; // 进一步减小基础半径
    const rightBall = {
        position: createVector(canvasWidth * 0.75, canvasHeight / 2),
        velocity: createVector(rightBallVelocity, 0),
        mass: rightBallMass,
        radius: rightBallRadius,
        color: color(239, 68, 68), // 红色
        isStuck: false
    };
    
    balls.push(leftBall, rightBall);
}

// 计算总动量
function calculateTotalMomentum() {
    let totalMomentum = 0;
    
    for (const ball of balls) {
        totalMomentum += ball.mass * ball.velocity.x;
    }
    
    return totalMomentum;
}

// 计算总动能
function calculateTotalEnergy() {
    let totalEnergy = 0;
    
    for (const ball of balls) {
        totalEnergy += 0.5 * ball.mass * ball.velocity.mag() * ball.velocity.mag();
    }
    
    return totalEnergy;
}

// 检查碰撞并处理
function checkCollisions() {
    const ball1 = balls[0];
    const ball2 = balls[1];
    
    // 如果小球已经粘在一起，按照完全非弹性碰撞规则移动
    if (ball1.isStuck && ball2.isStuck) {
        ball2.position.x = ball1.position.x + ball1.radius;
        ball2.velocity = ball1.velocity.copy();
        return;
    }
    
    // 计算两球距离
    const distance = p5.Vector.dist(ball1.position, ball2.position);
    
    // 检测是否发生碰撞
    if (distance <= ball1.radius + ball2.radius) {
        if (!collisionHappened) {
            // 计算碰撞后速度
            let v1 = ball1.velocity.copy();
            let v2 = ball2.velocity.copy();
            let m1 = ball1.mass;
            let m2 = ball2.mass;
            
            // 根据碰撞类型处理
            if (collisionType === 'elastic') {
                // 弹性碰撞
                ball1.velocity.x = ((m1 - m2) / (m1 + m2)) * v1.x + ((2 * m2) / (m1 + m2)) * v2.x;
                ball2.velocity.x = ((2 * m1) / (m1 + m2)) * v1.x + ((m2 - m1) / (m1 + m2)) * v2.x;
            } else if (collisionType === 'inelastic') {
                // 非弹性碰撞
                let e = restitutionCoefficient; // 恢复系数
                
                let v1Final = ((m1 - e * m2) * v1.x + (1 + e) * m2 * v2.x) / (m1 + m2);
                let v2Final = ((1 + e) * m1 * v1.x + (m2 - e * m1) * v2.x) / (m1 + m2);
                
                ball1.velocity.x = v1Final;
                ball2.velocity.x = v2Final;
            } else if (collisionType === 'perfectly-inelastic') {
                // 完全非弹性碰撞 - 两球粘在一起
                let commonVelocity = (m1 * v1.x + m2 * v2.x) / (m1 + m2);
                ball1.velocity.x = commonVelocity;
                ball2.velocity.x = commonVelocity;
                ball1.isStuck = true;
                ball2.isStuck = true;
            }
            
            // 分离两球以避免重叠
            const overlap = ball1.radius + ball2.radius - distance;
            const separationVector = p5.Vector.sub(ball2.position, ball1.position).normalize().mult(overlap / 2);
            
            // 如果不是完全非弹性碰撞，分离小球；否则保持粘在一起
            if (collisionType !== 'perfectly-inelastic') {
                ball1.position.sub(separationVector);
                ball2.position.add(separationVector);
            } else {
                ball2.position = p5.Vector.add(ball1.position, p5.Vector.mult(separationVector.normalize(), ball1.radius + ball2.radius));
            }
            
            // 标记碰撞已发生，计算碰撞后动量和能量
            collisionHappened = true;
            finalMomentum = calculateTotalMomentum();
            finalEnergy = calculateTotalEnergy();
            
            // 更新显示数据
            finalMomentumSpan.textContent = finalMomentum.toFixed(2) + ' kg·m/s';
            finalEnergySpan.textContent = finalEnergy.toFixed(2) + ' J';
            
            // 检查动量守恒
            const momentumDiff = Math.abs(finalMomentum - initialMomentum);
            if (momentumDiff > 0.01) {
                momentumConservationSpan.textContent = '否';
                momentumConservationSpan.className = 'text-sm font-medium text-red-600';
            }
            
            // 检查能量守恒
            const energyRatio = finalEnergy / initialEnergy;
            if (collisionType === 'elastic') {
                if (Math.abs(energyRatio - 1) > 0.01) {
                    energyConservationSpan.textContent = '否';
                    energyConservationSpan.className = 'text-sm font-medium text-red-600';
                }
            } else {
                // 非弹性碰撞应该损失能量
                energyConservationSpan.textContent = '否（预期）';
                energyConservationSpan.className = 'text-sm font-medium text-amber-600';
            }
        }
    }
    
    // 检测墙壁碰撞
    for (const ball of balls) {
        // 左墙
        if (ball.position.x - ball.radius < wallLeft) {
            ball.position.x = wallLeft + ball.radius;
            ball.velocity.x *= -1;
        }
        
        // 右墙
        if (ball.position.x + ball.radius > wallRight) {
            ball.position.x = wallRight - ball.radius;
            ball.velocity.x *= -1;
        }
    }
}

// 更新小球位置
function updateBalls() {
    for (const ball of balls) {
        ball.position.add(p5.Vector.mult(ball.velocity, deltaTime / 20));
    }
}

// p5.js 设置
function setup() {
    // 获取容器元素
    const container = document.getElementById('simulation-container');
    
    // 创建画布填充整个容器
    const canvas = createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent('canvas-container');
    
    // 设置文本对齐方式
    textAlign(CENTER, CENTER);
    
    // 设置帧率
    frameRate(60);
    
    // 创建小球
    createBalls();
}

// p5.js 窗口调整大小
function windowResized() {
    const container = document.getElementById('simulation-container');
    resizeCanvas(container.offsetWidth, container.offsetHeight);
    resetSimulation();
}

// p5.js 绘制
function draw() {
    background(255);
    
    // 绘制轨道
    strokeWeight(4);
    stroke(200);
    line(wallLeft, height / 2, wallRight, height / 2);
    
    // 绘制墙壁
    strokeWeight(2);
    stroke(100);
    line(wallLeft, height / 6, wallLeft, height * 5 / 6);
    line(wallRight, height / 6, wallRight, height * 5 / 6);
    
    // 如果模拟已经开始，更新小球位置和检查碰撞
    if (simulationStarted) {
        checkCollisions();
        updateBalls();
    }
    
    // 绘制小球
    noStroke();
    for (const ball of balls) {
        fill(ball.color);
        ellipse(ball.position.x, ball.position.y, ball.radius * 2);
        
        // 绘制方向指示箭头
        if (ball.velocity.mag() > 0.1) {
            drawArrow(ball.position, p5.Vector.add(ball.position, p5.Vector.mult(ball.velocity, 3)), ball.color);
        }
        
        // 绘制小球质量标签
        fill(0);
        textSize(12);
        text(ball.mass + 'kg', ball.position.x, ball.position.y - ball.radius - 15);
        
        // 绘制小球速度标签
        text(ball.velocity.x.toFixed(1) + ' m/s', ball.position.x, ball.position.y + ball.radius + 15);
    }
}

// 绘制箭头
function drawArrow(base, vec, arrowColor) {
    push();
    stroke(arrowColor);
    strokeWeight(3);
    fill(arrowColor);
    
    line(base.x, base.y, vec.x, vec.y);
    
    const arrowSize = 8;
    const angle = atan2(vec.y - base.y, vec.x - base.x);
    
    translate(vec.x, vec.y);
    rotate(angle);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    
    pop();
}

// 初始化页面加载完成后
window.addEventListener('load', function() {
    // 初始化滑块显示值
    leftMassValue.textContent = leftMassSlider.value;
    leftVelocityValue.textContent = leftVelocitySlider.value;
    rightMassValue.textContent = rightMassSlider.value;
    rightVelocityValue.textContent = rightVelocitySlider.value;
    coefficientValue.textContent = coefficientSlider.value;
}); 