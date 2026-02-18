document.addEventListener('DOMContentLoaded', () => { //isso garante que o código só seja executado depois que o conteúdo da página estiver completamente carregado, evitando erros relacionados a elementos do DOM que ainda não estão disponíveis.
    const canvas = document.getElementById('gameCanvas'); //encontra o elemento canvas no DOM usando seu ID 'gameCanvas' e o armazena na variável 'canvas' para uso posterior no código.
    const ctx = canvas.getContext('2d'); //pega o contexto de renderização 2D do canvas, que é necessário para desenhar gráficos no canvas. O contexto é armazenado na variável 'ctx' para ser usado em funções de desenho e atualização do jogo.
    const scoreDisplay = document.getElementById('score'); //encontra o elemento HTML com o ID 'score' e o armazena na variável 'scoreDisplay'. Este elemento é usado para exibir a pontuação do jogo, permitindo que o código atualize a pontuação dinamicamente durante o jogo.
    
    if(!ctx){ //se o contexto do canvas não for suportado, exibe uma mensagem de erro e para a execução do jogo.
        alert('Seu navegador não suporta o canvas. Por favor, use um navegador moderno para jogar.');
        return; //para a execução para evitar erros posteriores no código que depende do contexto do canvas.
    }

    const gridSize = 20;
    const tileCount = canvas.width / gridSize; //calcula quantos "tiles" (blocos) cabem na largura do canvas dividindo a largura total do canvas pelo tamanho de cada tile. Isso é usado para determinar a posição da cobra e da maçã no grid do jogo.
    const velocity = 100; //define a velocidade do jogo, que é o intervalo de tempo (em milissegundos) entre cada atualização do jogo. Quanto menor o valor, mais rápido o jogo será.
    const eatSound = new Audio("/src/audios/efeitos/som eat.mp3"); //cria um novo objeto de áudio para o som de comer a maçã, usando o caminho especificado para o arquivo de áudio. Este som pode ser reproduzido quando a cobra come a maçã para fornecer feedback sonoro ao jogador.

    //variáveis de controle de tela.
    const startScreen = document.getElementById("startScreen");
    const startGameButton = document.getElementById("startGameButton");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const finalScoreDisplay = document.getElementById("finalScore");
    const playAgainButton = document.getElementById("playAgainButton");
    //-------------------------------

    let snake = [{ x: 10, y: 10 }]; // Posição inicial da cobrinha
    let apple = { x: 15, y: 15 }; // Posição inicial da comida
    let xVelocity = 0; // Velocidade inicial da cobra (parada)
    let yVelocity = 0; // Velocidade inicial da cobra (parada)
    let score = 0; // Inicializa a pontuação
    let isPaused = false;

    // Função para mostrar a tela inicial.
    function showStartScreen() {
        startScreen.style.display = "flex";
        gameOverScreen.style.display = "none";
    }

    // Função para esconder a tela inicial.
    function hideStartScreen() {
        startScreen.style.display = "none";
    }

    // Função para mostrar a tela de game over.
    function showGameOverScreen() {
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = "flex";
    }

    // Função para esconder a tela de game over.
    function hideGameOverScreen() {
        gameOverScreen.style.display = "none";
    }
    
    function startGame() {
        resetGame(); // Reseta o jogo para garantir que a cobra, a maçã, a pontuação e as velocidades estejam na posição inicial.
        gameLoop(); // Inicia o loop do jogo, que é a função principal que atualiza e desenha o jogo continuamente.
    }

    // Função para gerar comida em posição aleatória.
    function drawApple() {
        ctx.fillStyle = 'red';
        ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize, gridSize);
    }

    // Função para desenhar a cobrinha.
    function drawSnake() {
        ctx.fillStyle = 'green';
        snake.forEach((segment) => {            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    // Função principal de atualização do jogo, que é chamada a cada frame para atualizar a posição da cobra, verificar colisões e atualizar a pontuação.
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

            eatSound.play(); // Reproduz o som de comer a maçã

            apple.x = Math.floor(Math.random() * tileCount);
            apple.y = Math.floor(Math.random() * tileCount);
        } else {
             //remove o ultimo elemento do array.
             //simula a movimentação para a frente quando não ha colisão com a maça.
            snake.pop();
        }
    }

    // Função para desenhar o grid do jogo, criando uma grade visual para ajudar o jogador a ver as posições da cobra e da maçã.
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

    // Função principal que desenha os elementos no canvas. Ela é chamada a cada frame do jogo para atualizar a tela com a posição atual da cobra, da maçã e do grid.
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas para redesenhar o próximo frame do jogo, evitando que os gráficos anteriores permaneçam na tela.
        ctx.fillStyle = 'red';
        ctx.font= "20px Arial"; // Define a fonte e o tamanho do texto para a pontuação e o título do jogo.
        ctx.fillText("Jogo da Kaa", 20, 20); // Desenha o título do jogo no canvas na posição (20, 20).

        drawSnake();
        drawApple();
        drawGrid();

        if(isPaused) {
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText("PAUSADO", canvas.width / 2 - 90, canvas.height / 2);
        }
    }
    
    //verifica quando a Kaa colide com ela mesmo.
    function gameOver() {
        const head = snake[0];
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true; // Colisão detectada
            }
        }
        return false; // Sem colisão
    }

    //função para resetar o jogo, reiniciando a posição da cobra, da maçã, as velocidades e a pontuação. Ela é chamada quando o jogo termina (game over) para permitir que o jogador comece uma nova partida.
    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        apple = { x: 15, y: 15 };
        xVelocity = 0;
        yVelocity = 0;
        score= 0;
        // Atualiza a exibição da pontuação
        scoreDisplay.textContent = score; 
    }

    //função para alternar o estado de pausa do jogo. Quando chamada, ela inverte o valor da variável 'isPaused', permitindo que o jogo seja pausado ou retomado. Isso é útil para permitir que o jogador faça uma pausa durante o jogo sem perder o progresso.
    function togglePause() {
        isPaused = !isPaused;
    }

    function gameLoop() {
        if (gameOver()) {
            // Game over
            showGameOverScreen(); // Exibe a tela de game over quando o jogo termina.
            resetGame();
        }

        draw();

        if (isPaused) {
            setTimeout(gameLoop, velocity); // Continua o loop do jogo mesmo quando pausado, para que o estado de pausa seja mantido e o jogo possa ser retomado corretamente.
            return;
        }
        
        update();

        setTimeout(() => {
            gameLoop();
        }, velocity);  //configuramos o valor de velocity nas variáveis. gameLoop é chamado a cada intervalo de tempo definido por velocity, criando um ciclo contínuo de atualização e desenho do jogo.
    }

    showStartScreen(); // Exibe a tela inicial do jogo quando a página é carregada, permitindo que o jogador veja as opções de início do jogo antes de começar a jogar.
    
    startGameButton.addEventListener("click", () => {
        hideStartScreen(); // Esconde a tela inicial quando o jogador clica no botão de iniciar o jogo, permitindo que o jogo comece.
        startGame(); // Inicia o jogo chamando a função startGame, que configura o estado inicial do jogo e inicia o loop do jogo.
    });

    playAgainButton.addEventListener("click", () => {
        hideGameOverScreen(); // Esconde a tela de game over quando o jogador clica no botão de jogar novamente, permitindo que uma nova partida comece.
        startGame(); // Inicia uma nova partida chamando a função startGame, que reseta o estado do jogo e inicia o loop do jogo novamente.
    });
    
    document.addEventListener('keydown', (e) => {
        e.preventDefault(); //impede o comportamento padrão das setas do teclado, como rolar a página, garantindo que as setas sejam usadas apenas para controlar a cobra no jogo.
        // o switch case verifica qual tecla de seta foi pressionada e atualiza as variáveis de velocidade (xVelocity e yVelocity) para controlar a direção da cobra. Ele também inclui verificações para evitar que a cobra se mova na direção oposta imediatamente, o que causaria uma colisão consigo mesma.
        switch (e.code) {
            case 'ArrowUp': //ArrowUp é a tecla de seta para cima. Quando essa tecla é pressionada, o código verifica se a cobra não está atualmente se movendo para baixo (yVelocity !== 1). Se a cobra não estiver indo para baixo, ele define xVelocity para 0 e yVelocity para -1, fazendo com que a cobra se mova para cima. Essa verificação é importante para evitar que a cobra colida consigo mesma ao tentar se mover na direção oposta imediatamente.
                //verifica se a Kaa não está indo para baixo, evita a colisão com sigo mesmo no
                //movimento de "ré"
                if (yVelocity !== 1) {
                    xVelocity = 0;
                    yVelocity = -1;
                }
                break; //o break é usado para sair do switch case após executar o código correspondente à tecla pressionada, garantindo que apenas uma direção seja atualizada por vez.
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
            case 'Space': //quando a barra de espaço é pressionada, o código alterna o estado de pausa do jogo. Se o jogo estiver pausado, ele será despausado, e vice-versa. Isso permite que o jogador pause e retome o jogo conforme necessário.
                togglePause();
                break;
        }
    });
});