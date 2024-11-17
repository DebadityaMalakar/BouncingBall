window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const canvasRadius = Math.min(window.innerWidth, window.innerHeight) / 2.5;
    canvas.width = canvas.height = canvasRadius * 2;

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 4,
        radius: 15,
        speed: 7,
        angle: Math.random() * Math.PI * 2,
        color: getRandomColor(),
        rotation: 0,
        trail: [],
        maxTrailLength: 25
    };

    ball.dx = Math.cos(ball.angle) * ball.speed;
    ball.dy = Math.sin(ball.angle) * ball.speed;

    let animationId;

    function getRandomColor() {
        return `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvasRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
    }

    function drawBall() {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.stroke();

        ctx.restore();
    }

    function drawTrail() {
        ctx.globalCompositeOperation = 'lighter';
        
        ball.trail.forEach((point, index) => {
            const sizeMultiplier = 1.5 + (index / ball.trail.length);
            const opacity = 0.7 * (1 - (index / ball.trail.length));
            const radius = ball.radius * sizeMultiplier;

            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, radius
            );
            gradient.addColorStop(0, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, ${opacity})`);
            gradient.addColorStop(1, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
    }

    function addTrailPoint() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = ball.color;
        tempCtx.fillRect(0, 0, 1, 1);
        const rgb = Array.from(tempCtx.getImageData(0, 0, 1, 1).data.slice(0, 3));

        ball.trail.unshift({
            x: ball.x,
            y: ball.y,
            color: rgb
        });

        if (ball.trail.length > ball.maxTrailLength) {
            ball.trail.pop();
        }
    }

    function calculateNewAngle(collisionAngle) {
        const randomness = (Math.random() - 0.5) * Math.PI / 4;
        const reflectionAngle = collisionAngle + Math.PI + randomness;
        
        const minAngleFromWall = Math.PI / 6;
        let finalAngle = reflectionAngle;
        
        if (Math.abs(reflectionAngle % (Math.PI * 2)) < minAngleFromWall) {
            finalAngle += minAngleFromWall;
        } else if (Math.abs(reflectionAngle % (Math.PI * 2)) > Math.PI * 2 - minAngleFromWall) {
            finalAngle -= minAngleFromWall;
        }

        return finalAngle;
    }

    function update() {
        drawCanvas();
        drawTrail();
        drawBall();

        addTrailPoint();

        ball.x += ball.dx;
        ball.y += ball.dy;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const distFromCenter = Math.sqrt(
            (ball.x - centerX) ** 2 + (ball.y - centerY) ** 2
        );

        if (distFromCenter + ball.radius >= canvasRadius) {
            const collisionAngle = Math.atan2(ball.y - centerY, ball.x - centerX);
            const newAngle = calculateNewAngle(collisionAngle);
            
            ball.dx = Math.cos(newAngle) * ball.speed;
            ball.dy = Math.sin(newAngle) * ball.speed;

            const newX = centerX + (canvasRadius - ball.radius) * Math.cos(collisionAngle);
            const newY = centerY + (canvasRadius - ball.radius) * Math.sin(collisionAngle);
            ball.x = newX;
            ball.y = newY;

            ball.color = getRandomColor();
            ball.rotation += Math.PI / 4;
            
            ball.trail = [];
        }

        ball.dx += (Math.random() - 0.5) * 0.1;
        ball.dy += (Math.random() - 0.5) * 0.1;

        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = (ball.dx / currentSpeed) * ball.speed;
        ball.dy = (ball.dy / currentSpeed) * ball.speed;
    }

    function animate() {
        update();
        animationId = requestAnimationFrame(animate);
    }

    function stop() {
        cancelAnimationFrame(animationId);
    }

    function restart() {
        stop();
        animate();
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "s") stop();
        if (e.key === "a") restart();
    });

    drawCanvas();
    animate();
});