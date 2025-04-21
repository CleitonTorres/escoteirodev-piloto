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

    function drawSnake() {
        ctx.fillStyle = 'green';
        snake.forEach((segment) => {
            //posição x (posição grid * largura do grid) e y (posição grid * altura do grid), largura x e y.
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
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

    loop();

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