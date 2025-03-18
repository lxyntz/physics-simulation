// 全局变量
let initialObject; // 初始物体
let fragments = []; // 碎片数组
let isExploded = false; // 爆炸状态
let traces = []; // 轨迹数组
let explosionParticles = []; // 爆炸粒子
let explosionTime = 0; // 爆炸时间计时器
let explosionRadius = 0; // 爆炸半径
let isExploding = false; // 爆炸动画状态

// 配置参数
let config = {
    initialMass: 100, // 初始质量
    fragmentCount: 5, // 碎片数量
    explosionForce: 50, // 爆炸强度
    initialPosition: {x: 400, y: 300}, // 初始位置
    massDistribution: 'equal', // 质量分布方式
    showVelocity: true, // 显示速度矢量
    showMomentum: true, // 显示动量矢量
    showTraces: false, // 显示轨迹
    particleCount: 100, // 粒子数量
    particleLifespan: 60, // 粒子生命周期（帧数）
    explosionDuration: 30 // 爆炸动画持续时间（帧数）
};

// 颜色定义
const COLORS = {
    initialObject: '#5E6AD2',
    fragments: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#D946EF', '#F43F5E'],
    velocity: '#10B981',
    momentum: '#6366F1',
    background: '#FFFFFF',
    trace: 'rgba(94, 106, 210, 0.2)',
    explosion: {
        wave: 'rgba(255, 165, 0, 0.3)',
        particles: ['#FFDD00', '#FF5500', '#FF0000', '#FFAA00']
    }
};

// 物体类
class PhysicalObject {
    constructor(x, y, mass, radius, color) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.rotation = 0; // 旋转角度
        this.rotationSpeed = random(-0.1, 0.1); // 旋转速度
        this.shape = floor(random(0, 3)); // 随机形状：0=圆形，1=多边形，2=不规则形状
        this.vertices = []; // 多边形顶点
        
        // 为多边形生成顶点
        if (this.shape > 0) {
            const vertexCount = floor(random(5, 8));
            for (let i = 0; i < vertexCount; i++) {
                const angle = TWO_PI * i / vertexCount;
                const r = this.radius * (this.shape === 1 ? 1 : random(0.7, 1.3));
                this.vertices.push({
                    x: cos(angle) * r,
                    y: sin(angle) * r
                });
            }
        }
    }
    
    // 计算动量
    getMomentum() {
        return p5.Vector.mult(this.velocity, this.mass);
    }
    
    // 绘制物体
    display() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        
        fill(this.color);
        noStroke();
        
        // 根据形状绘制
        if (this.shape === 0) {
            // 圆形
            ellipse(0, 0, this.radius * 2);
        } else {
            // 多边形或不规则形状
            beginShape();
            for (let vertex of this.vertices) {
                vertex(vertex.x, vertex.y);
            }
            endShape(CLOSE);
        }
        
        pop();
        
        // 显示速度矢量
        if (config.showVelocity) {
            this.displayVector(this.velocity, 3, COLORS.velocity);
        }
        
        // 显示动量矢量
        if (config.showMomentum) {
            this.displayVector(this.getMomentum(), 0.05, COLORS.momentum);
        }
    }
    
    // 绘制矢量箭头
    displayVector(vector, scale, color) {
        if (vector.mag() > 0.1) {
            push();
            stroke(color);
            strokeWeight(2);
            
            // 计算箭头终点
            const end = p5.Vector.add(this.position, p5.Vector.mult(vector, scale));
            line(this.position.x, this.position.y, end.x, end.y);
            
            // 计算箭头指向方向
            const arrowSize = 8;
            const angle = vector.heading();
            
            // 绘制箭头
            translate(end.x, end.y);
            rotate(angle);
            fill(color);
            triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2);
            pop();
        }
    }
    
    // 更新物体位置
    update() {
        this.position.add(this.velocity);
        this.rotation += this.rotationSpeed;
        
        // 简单的边界碰撞检测
        if (this.position.x < this.radius) {
            this.position.x = this.radius;
            this.velocity.x *= -0.9; // 能量损耗
            this.rotationSpeed *= -0.9; // 碰撞后改变旋转方向
        } else if (this.position.x > width - this.radius) {
            this.position.x = width - this.radius;
            this.velocity.x *= -0.9;
            this.rotationSpeed *= -0.9;
        }
        
        if (this.position.y < this.radius) {
            this.position.y = this.radius;
            this.velocity.y *= -0.9;
            this.rotationSpeed *= -0.9;
        } else if (this.position.y > height - this.radius) {
            this.position.y = height - this.radius;
            this.velocity.y *= -0.9;
            this.rotationSpeed *= -0.9;
        }
    }
}

// 爆炸粒子类
class ExplosionParticle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D().mult(random(2, 8));
        this.size = random(3, 8);
        this.color = COLORS.explosion.particles[floor(random(0, COLORS.explosion.particles.length))];
        this.alpha = 255;
        this.lifespan = random(20, config.particleLifespan);
    }
    
    // 更新粒子
    update() {
        this.position.add(this.velocity);
        this.velocity.mult(0.95); // 减速
        this.size *= 0.97; // 缩小
        this.alpha -= 255 / this.lifespan; // 淡出
        return this.alpha > 0;
    }
    
    // 绘制粒子
    display() {
        push();
        noStroke();
        fill(color(this.color + hexAlpha(this.alpha)));
        ellipse(this.position.x, this.position.y, this.size);
        pop();
    }
}

// 将透明度转换为十六进制
function hexAlpha(alpha) {
    const hex = Math.floor(alpha).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

// p5.js 初始化
function setup() {
    // 创建画布并放置到容器中
    const canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    
    // 初始化物体
    resetSimulation();
    
    // 添加事件监听器
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 重置按钮
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    
    // 开始按钮
    document.getElementById('start-btn').addEventListener('click', startExplosion);
    
    // 参数控制
    document.getElementById('initial-mass').addEventListener('input', function() {
        config.initialMass = parseInt(this.value);
        resetSimulation();
    });
    
    document.getElementById('fragment-count').addEventListener('input', function() {
        config.fragmentCount = parseInt(this.value);
        resetSimulation();
    });
    
    document.getElementById('explosion-force').addEventListener('input', function() {
        config.explosionForce = parseInt(this.value);
    });
    
    document.getElementById('initial-x').addEventListener('input', function() {
        config.initialPosition.x = parseInt(this.value);
        resetSimulation();
    });
    
    document.getElementById('initial-y').addEventListener('input', function() {
        config.initialPosition.y = parseInt(this.value);
        resetSimulation();
    });
    
    document.getElementById('mass-distribution').addEventListener('change', function() {
        config.massDistribution = this.value;
    });
    
    document.getElementById('show-velocity').addEventListener('change', function() {
        config.showVelocity = this.checked;
    });
    
    document.getElementById('show-momentum').addEventListener('change', function() {
        config.showMomentum = this.checked;
    });
    
    document.getElementById('show-traces').addEventListener('change', function() {
        config.showTraces = this.checked;
        // 清空轨迹
        if (!this.checked) {
            traces = [];
        }
    });
    
    // 粒子数量控制
    document.getElementById('particle-count').addEventListener('input', function() {
        config.particleCount = parseInt(this.value);
    });
}

// 重置模拟
function resetSimulation() {
    // 初始化物体
    const radius = Math.sqrt(config.initialMass) * 1.5; // 增大初始物体尺寸
    initialObject = new PhysicalObject(
        config.initialPosition.x,
        config.initialPosition.y,
        config.initialMass,
        radius,
        COLORS.initialObject
    );
    
    // 重置状态
    fragments = [];
    isExploded = false;
    isExploding = false;
    explosionTime = 0;
    explosionRadius = 0;
    explosionParticles = [];
    traces = [];
    
    // 更新UI
    updateMomentumDisplay(0, 0, 0);
    updateFragmentsTable([]);
    
    // 更新开始按钮
    const startBtn = document.getElementById('start-btn');
    startBtn.innerHTML = '<i class="fas fa-play mr-2"></i>开始';
}

// 开始爆炸
function startExplosion() {
    if (isExploded) {
        resetSimulation();
        return;
    }
    
    isExploding = true;
    
    // 更新开始按钮
    const startBtn = document.getElementById('start-btn');
    startBtn.innerHTML = '<i class="fas fa-redo-alt mr-2"></i>重置';
    
    // 创建爆炸粒子
    createExplosionParticles();
}

// 创建爆炸粒子
function createExplosionParticles() {
    explosionParticles = [];
    for (let i = 0; i < config.particleCount; i++) {
        explosionParticles.push(new ExplosionParticle(
            initialObject.position.x,
            initialObject.position.y
        ));
    }
}

// 完成爆炸
function completeExplosion() {
    isExploded = true;
    isExploding = false;
    
    // 生成碎片
    generateFragments();
    
    // 计算并显示总动量
    const totalMomentum = calculateTotalMomentum();
    updateMomentumDisplay(0, totalMomentum.mag(), totalMomentum.mag());
    
    // 更新碎片信息表格
    updateFragmentsTable(fragments);
}

// 生成碎片
function generateFragments() {
    fragments = [];
    
    // 根据分布方式分配质量
    const masses = distributeMass(config.initialMass, config.fragmentCount);
    
    // 为每个碎片生成随机方向
    for (let i = 0; i < config.fragmentCount; i++) {
        // 根据质量计算半径
        const radius = Math.sqrt(masses[i]) * 1.5; // 增大碎片尺寸
        
        // 创建碎片
        const fragment = new PhysicalObject(
            initialObject.position.x,
            initialObject.position.y,
            masses[i],
            radius,
            COLORS.fragments[i % COLORS.fragments.length]
        );
        
        // 设置随机速度方向，但使总动量为零
        const angle = TWO_PI * i / config.fragmentCount + random(-0.2, 0.2);
        const speed = (config.explosionForce / masses[i]) * 0.3; // 增加速度系数
        fragment.velocity.x = cos(angle) * speed;
        fragment.velocity.y = sin(angle) * speed;
        
        fragments.push(fragment);
    }
    
    // 调整速度以使总动量为零
    balanceMomentum();
}

// 分配质量
function distributeMass(totalMass, count) {
    const masses = [];
    
    switch (config.massDistribution) {
        case 'equal':
            // 均匀分布
            for (let i = 0; i < count; i++) {
                masses.push(totalMass / count);
            }
            break;
            
        case 'random':
            // 随机分布
            let remainingMass = totalMass;
            for (let i = 0; i < count - 1; i++) {
                const mass = random(0.1, remainingMass * 0.8);
                masses.push(mass);
                remainingMass -= mass;
            }
            masses.push(remainingMass); // 最后一个碎片获得剩余质量
            break;
            
        case 'proportional':
            // 按距离比例分布
            const totalParts = count * (count + 1) / 2;
            for (let i = 1; i <= count; i++) {
                masses.push(totalMass * i / totalParts);
            }
            break;
    }
    
    // 随机打乱顺序
    if (config.massDistribution !== 'equal') {
        masses.sort(() => random(-1, 1));
    }
    
    return masses;
}

// 平衡总动量
function balanceMomentum() {
    // 计算当前总动量
    const totalMomentum = calculateTotalMomentum();
    
    // 总质量
    let totalMass = 0;
    fragments.forEach(fragment => totalMass += fragment.mass);
    
    // 计算每个碎片需要的速度修正
    const correctionPerMass = p5.Vector.div(totalMomentum, -totalMass);
    
    // 应用修正
    fragments.forEach(fragment => {
        fragment.velocity.add(correctionPerMass);
    });
}

// 计算总动量
function calculateTotalMomentum() {
    const totalMomentum = createVector(0, 0);
    
    fragments.forEach(fragment => {
        const momentum = fragment.getMomentum();
        totalMomentum.add(momentum);
    });
    
    return totalMomentum;
}

// 更新动量显示
function updateMomentumDisplay(initialMomentum, finalMomentum, error) {
    document.getElementById('initial-momentum').innerText = `p₀ = ${initialMomentum.toFixed(2)} kg·m/s`;
    document.getElementById('final-momentum').innerText = `p = ${finalMomentum.toFixed(2)} kg·m/s`;
    
    const errorElement = document.getElementById('momentum-error');
    errorElement.innerText = `误差 = ${error.toFixed(2)}%`;
    
    // 根据误差大小更改颜色
    if (error < 1) {
        errorElement.className = 'text-md font-medium text-green-600';
    } else if (error < 5) {
        errorElement.className = 'text-md font-medium text-yellow-600';
    } else {
        errorElement.className = 'text-md font-medium text-red-600';
    }
}

// 更新碎片信息表格
function updateFragmentsTable(fragments) {
    const tableBody = document.getElementById('fragments-table');
    tableBody.innerHTML = '';
    
    fragments.forEach((fragment, index) => {
        const row = document.createElement('tr');
        
        // 碎片编号
        const idCell = document.createElement('td');
        idCell.className = 'px-4 py-2 text-sm';
        idCell.innerText = `碎片 ${index + 1}`;
        
        // 质量
        const massCell = document.createElement('td');
        massCell.className = 'px-4 py-2 text-sm';
        massCell.innerText = fragment.mass.toFixed(2);
        
        // 速度
        const velocityCell = document.createElement('td');
        velocityCell.className = 'px-4 py-2 text-sm';
        velocityCell.innerText = fragment.velocity.mag().toFixed(2);
        
        // 动量
        const momentumCell = document.createElement('td');
        momentumCell.className = 'px-4 py-2 text-sm';
        momentumCell.innerText = fragment.getMomentum().mag().toFixed(2);
        
        // 添加到行
        row.appendChild(idCell);
        row.appendChild(massCell);
        row.appendChild(velocityCell);
        row.appendChild(momentumCell);
        
        // 添加到表格
        tableBody.appendChild(row);
    });
    
    // 如果没有碎片，显示一个空行
    if (fragments.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.className = 'px-4 py-2 text-sm text-center';
        cell.innerText = '暂无数据';
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
}

// p5.js 绘制循环
function draw() {
    // 清空画布
    background(COLORS.background);
    
    // 如果启用了轨迹显示且已爆炸
    if (config.showTraces && isExploded) {
        // 绘制轨迹
        drawTraces();
        
        // 记录当前位置作为轨迹
        recordTraces();
    }
    
    if (!isExploded && !isExploding) {
        // 绘制初始物体
        initialObject.display();
        
        // 添加脉动效果
        const pulseFactor = 1 + sin(frameCount * 0.05) * 0.05;
        initialObject.radius = Math.sqrt(config.initialMass) * 1.5 * pulseFactor;
        
        // 添加闪烁效果
        if (random() < 0.05) {
            push();
            noStroke();
            fill(255, 255, 200, 100);
            ellipse(initialObject.position.x, initialObject.position.y, 
                   initialObject.radius * 2.2);
            pop();
        }
    } else if (isExploding) {
        // 绘制爆炸动画
        drawExplosionAnimation();
    } else {
        // 更新和绘制所有碎片
        fragments.forEach(fragment => {
            fragment.update();
            fragment.display();
        });
        
        // 计算总动量并更新显示
        if (frameCount % 10 === 0) { // 每10帧更新一次，减少计算量
            const totalMomentum = calculateTotalMomentum();
            const error = totalMomentum.mag() / (fragments.length > 0 ? 0.01 : 1); // 避免除以零
            updateMomentumDisplay(0, totalMomentum.mag(), error);
        }
    }
    
    // 更新和绘制爆炸粒子
    updateAndDrawParticles();
}

// 绘制爆炸动画
function drawExplosionAnimation() {
    // 增加爆炸时间
    explosionTime++;
    
    // 计算爆炸波半径
    explosionRadius = map(explosionTime, 0, config.explosionDuration, 0, 200);
    
    // 绘制爆炸波
    push();
    noFill();
    strokeWeight(5);
    stroke(COLORS.explosion.wave);
    ellipse(initialObject.position.x, initialObject.position.y, explosionRadius * 2);
    
    // 绘制内部波
    strokeWeight(3);
    stroke('rgba(255, 255, 200, 0.5)');
    ellipse(initialObject.position.x, initialObject.position.y, explosionRadius * 1.5);
    
    // 绘制中心亮点
    noStroke();
    fill(255, 255, 200, map(explosionTime, 0, config.explosionDuration, 255, 0));
    ellipse(initialObject.position.x, initialObject.position.y, 
           map(explosionTime, 0, config.explosionDuration, 50, 10));
    pop();
    
    // 如果爆炸动画完成，生成碎片
    if (explosionTime >= config.explosionDuration) {
        completeExplosion();
    }
}

// 更新和绘制粒子
function updateAndDrawParticles() {
    // 更新粒子并移除已消失的粒子
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        if (!explosionParticles[i].update()) {
            explosionParticles.splice(i, 1);
        }
    }
    
    // 绘制粒子
    explosionParticles.forEach(particle => {
        particle.display();
    });
}

// 记录轨迹
function recordTraces() {
    if (frameCount % 3 === 0) { // 每3帧记录一次，减少点的数量
        fragments.forEach((fragment, index) => {
            if (!traces[index]) {
                traces[index] = [];
            }
            
            // 添加当前位置到轨迹
            traces[index].push({
                x: fragment.position.x,
                y: fragment.position.y
            });
            
            // 限制轨迹长度
            if (traces[index].length > 150) { // 增加轨迹长度
                traces[index].shift();
            }
        });
    }
}

// 绘制轨迹
function drawTraces() {
    noFill();
    strokeWeight(2);
    
    traces.forEach((trace, index) => {
        if (trace.length > 1) {
            // 使用渐变色轨迹
            beginShape();
            for (let i = 0; i < trace.length; i++) {
                // 计算透明度，越新的点越不透明
                const alpha = map(i, 0, trace.length - 1, 20, 150);
                stroke(COLORS.fragments[index % COLORS.fragments.length] + hexAlpha(alpha));
                vertex(trace[i].x, trace[i].y);
            }
            endShape();
        }
    });
} 