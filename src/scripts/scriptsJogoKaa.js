document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');


    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let snake = [{ x: 10, y: 10 }];
    let apple = { x: 15, y: 15 };
    let xVelocity = 0;
    let yVelocity = 0;
    let score = 0; // Inicializa a pontuação

    const headImg = new Image();
    const bodyImg = new Image();
    const tailImg = new Image();

    headImg.src = './src/assets/kaa/kaa-head.png';
    bodyImg.src = './src/assets/kaa/kaa-body.png';
    tailImg.src = './src/assets/kaa/kaa-calda.png';

    function drawSnake() {
        ctx.fillStyle = 'green';
        snake.forEach((segment, index) => {
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            //posição x (posição grid * largura do grid) e y (posição grid * altura do grid), largura x e y.
            
            // const { x, y } = segment;
            // const pixelX = x * gridSize;
            // const pixelY = y * gridSize;
            
            // if (index === 0) {
            //     // Cabeça
            //     ctx.drawImage(headImg, pixelX, pixelY, gridSize, gridSize);
            // } 
            // else if (index === snake.length - 1) {
            //     // Calda
            //     ctx.drawImage(tailImg, pixelX, pixelY, gridSize, gridSize);
            // } else {
            //     // Corpo com rotação se estiver na horizontal
            //     ctx.save(); // salva o estado original do canvas

            //     if (xVelocity !== 0) {
            //         // mover o ponto de origem para o centro da célula do corpo
            //         ctx.translate(pixelX + gridSize / 2, pixelY + gridSize / 2);
            //         ctx.rotate(Math.PI / 2); // 90 graus
            //         // desenha a imagem rotacionada de volta com offset de -halfWidth/-halfHeight
            //         ctx.drawImage(bodyImg, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
            //     } else {
            //         ctx.drawImage(bodyImg, pixelX, pixelY, gridSize, gridSize);
            //     }
    
            //     ctx.restore(); // restaura o estado original
            // }
        });
    }

    function drawApple() {
        ctx.fillStyle = 'red';
        ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize, gridSize);
    }

    function update() {
        const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
        
        //quando a cobra atinge uma das bordas, muda a posição da cobra para a borda oposta.
        if (head.x < 0) head.x = tileCount - 1;
        if (head.x >= tileCount) head.x = 0;
        if (head.y < 0) head.y = tileCount - 1;
        if (head.y >= tileCount) head.y = 0;

        //adiciona um novo elemento ao array.
        //simula a movimentação para a frente.
        snake.unshift(head);

        // A cobra pegou a maçã, aumente a pontuação e mude a posição da maçã.
        if (head.x === apple.x && head.y === apple.y) {
            score++;
            // Atualiza a exibição da pontuação
            document.getElementById('score').textContent = score; 

            apple.x = Math.floor(Math.random() * tileCount);
            apple.y = Math.floor(Math.random() * tileCount);
        } else {
             //remove o ultimo elemento do array.
             //simula a movimentação para a frente quando não ha colisão com a maça.
            snake.pop();
        }
    }

    function drawGrid() {
        ctx.strokeStyle = 'gray'; // Cor das bordas
        ctx.lineWidth = 1; // Largura das bordas
    
        // Desenha as bordas de cada célula do grid
        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.strokeRect(x, y, gridSize, gridSize);
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font= "20px Arial";
        ctx.fillText("Jogo da Kaa", 20, 20);

        drawSnake();
        drawApple();
        drawGrid();
    }
    
    //verifica quando a Kaa colide com ela mesmo.
    function checkCollision() {
        const head = snake[0];
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true; // Colisão detectada
            }
        }
        return false; // Sem colisão
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        apple = { x: 15, y: 15 };
        xVelocity = 0;
        yVelocity = 0;
        score= 0;
        // Atualiza a exibição da pontuação
        document.getElementById('score').textContent = score; 
    }

    function loop() {
        update();

        if (checkCollision()) {
            // Game over
            alert('Game over!');
            resetGame();
        }

        draw();
        setTimeout(() => {
            loop();
        }, 100);
    }

    Promise.all([
        new Promise(res => headImg.onload = res),
        new Promise(res => bodyImg.onload = res),
        new Promise(res => tailImg.onload = res)
    ]).then(() => {
        loop(); // inicia o jogo só depois que os sprites estão prontos
    });

    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        switch (e.key) {
            case 'ArrowUp':
                //verifica se a Kaa não está indo para baixo, evita a colisão com sigo mesmo no
                //movimento de "ré"
                if (yVelocity !== 1) {
                    xVelocity = 0;
                    yVelocity = -1;
                }
                break;
            case 'ArrowDown':
                if (yVelocity !== -1) {
                    xVelocity = 0;
                    yVelocity = 1;
                }
                break;
            case 'ArrowLeft':
                if (xVelocity !== 1) {
                    xVelocity = -1;
                    yVelocity = 0;
                }
                break;
            case 'ArrowRight':
                if (xVelocity !== -1) {
                    xVelocity = 1;
                    yVelocity = 0;
                }
                break;
        }
    });
});