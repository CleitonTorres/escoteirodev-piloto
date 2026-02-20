// Classe para representar o player
class Player {
    // character, initialX, initialY etc. São propriedades (informações) que a class Player
    // espera receber ao ser instanciada.
    constructor(
        character,
        initialX,
        initialY,
        type = "NPC" || "Player",
        showHitBox,
    ) {
        this.character = character; //nome do personagem (maria ou leo).
        this.hp = 100; // vida do personagem.
        this.x = initialX; // posição x inicial.
        this.y = initialY; // posição y inicial.
        this.xVelocity = 0; // velocidade no eixo x (horizontal).
        this.yVelocity = 0; // velocidade no eixo y (vertical).
        this.showHitBox = showHitBox; //se vai mostrar o hitbox ou não.
        this.isJump = false; // estado de salto. Se o personagem esta pulando ou não.
        this.isOnFloor = false; // estado "no chão" ele pode estar caindo ou sob uma plataforma.
        this.direction = false; // false para direita, true para esquerda
        this.currentFrame = 0; // guarda a frame atual da animação.
        this.animationFrame = 0; // velocidade da animação. O tempo que a animação leva para trocar entre sprites.
        this.width = 64; // largura do personagem.
        this.height = 64; // altura do personagem.
        this.gameOver = false; // estado de game over.
        this.lastTime = 0; // variável usada para calcular a velocidade do loop.

        // Prepara os sprites instanciando elementos de imagens para cada frame e para cada animação.
        // cada animação é constituída por 3 sprites (3 frames ou 3 imagens).
        this.sprites =
        type === "Player"
            ? {
                // se o tipo informado for Player carrega todas as animações.
                idle: [new Image(), new Image(), new Image()],
                walk_left: [new Image(), new Image(), new Image()],
                walk_right: [new Image(), new Image(), new Image()],
                jump: [new Image(), new Image(), new Image()],
            }
            : //se for NPC preparar apenas a animação idle (parado).
            { idle: [new Image(), new Image(), new Image()] };

        // variável que vai ser usada para verificar se as imagens foram carregadas completamente.
        let loadedImages = 0;

        // variável que recebe as chaves ou campos de this.sprites (idle, walk_left etc).
        const keysSprites = Object.keys(this.sprites);

        //usa o loop forEch para percorrer os campos de this.sprites (idle, walk_left etc).
        keysSprites.forEach((key) => {
        const firstLetters = key.substring(0, 4); //separa as palavras iniciais usadas no nome da pasta da animação.

        // para cada elemento de imagem da key (idle, walk e jump) carrega a imagem correspondente.
        // para isso funcionar o nome da pasta precisar ser igual ao do character, e o nome da pasta
        // da pasta da animação precisar ser igual ao nome usado nos campos (idle, walk e jump) de this.sprites e cada arquivo de imagem da animação devem estar nomeado de 0 a 3.
        this.sprites[key].forEach((img, idx) => {
            img.src = `./src/assets/scoutPlat/${character}/${firstLetters}/${key}(${idx}).png`;
        });
        });

        // Percorre cada chave do objeto/lista `keysSprites` (ex.: idle, run, jump...) para verificar se as imagens
        // foram carregadas corretamente.
        // isso é uma verificação de segurança para evitar erros.
        keysSprites.forEach((key) => {
        // Para cada chave, percorre todas as imagens daquele grupo de sprites
        this.sprites[key].forEach((img) => {
            // Evento disparado quando a imagem termina de carregar
            img.onload = () => {
            loadedImages++; // Incrementa o contador de imagens carregadas

            // Quando atingir a quantidade esperada, mostra mensagem de sucesso
            if (loadedImages === this.sprites.length) {
                console.log("Imagens do player carregadas com sucesso");
            }
            };

            // Evento disparado se der erro ao carregar a imagem
            img.onerror = () => {
            console.error("Erro ao carregar imagem do player: " + img.src);
            };
        });
        });
    }

    // Função responsável por atualizar o estado do jogador a cada frame:
    // posição, velocidade e estados como "pulando" e "no chão".
    update(currentTime, gravity, speed, floors, tileCount, gridSize, linhas) {
        // Calcula o tempo entre o frame atual e o anterior (deltaTime)
        // Isso deixa o movimento mais estável, independente do FPS.
        const deltaTime = (currentTime - this.lastTime) / 1000; // convertendo para "segundos ajustados"
        this.lastTime = currentTime; // guarda o tempo atual para o próximo cálculo

        //código responsável por atualizar a posição do personagem ------
        // Atualiza a posição horizontal (x) com base na direção horizontal * a velocidade de movimento.
        this.x += this.xVelocity * speed * deltaTime;

        // Atualiza a posição vertical (y) com base na direção vertical * a velocidade de movimento / 2.
        // Aqui a velocidade vertical está com metade do speed para ajustar a sensibilidade
        this.y += this.yVelocity * (speed / 2) * deltaTime;
        // ---------------------------------------------------------------

        // Impede o jogador de sair dos limites horizontais do mapa/canvas
        if (this.x <= 0) {
        this.x = 0; // trava na borda esquerda
        } else if (this.x >= tileCount - 1) {
        this.x = tileCount - 1; // trava na borda direita
        }
        //-----------------------------------------------------------------

        // Assume inicialmente que o jogador NÃO está em uma plataforma/chão
        this.isOnFloor = false;

        // Verifica colisão com cada plataforma/chão da lista
        for (let index = 0; index < floors.length; index++) {
        const floor = floors[index];

        // Só checa colisão de pouso quando o jogador está descendo (yVelocity >= 0)
        if (this.yVelocity >= 0) {
            if (this.isOnfloorCheck(floor, gridSize)) {
            // Ajusta o jogador para ficar exatamente em cima da plataforma
            this.y = floor.y - 1;

            // Zera a velocidade vertical porque ele "pousou"
            this.yVelocity = 0;

            // Ao tocar o chão, não está mais pulando
            this.isJump = false;

            // Marca que está sobre uma superfície
            this.isOnFloor = true;

            // Para o loop, pois já encontrou uma colisão válida
            break;
            }
        }
        }

        // Se não está no chão/plataforma, aplica gravidade (queda)
        if (!this.isOnFloor) {
        this.isJump = true; // está no ar
        this.yVelocity += gravity * deltaTime; // acelera para baixo
        }

        // Verifica colisão com o "chão final" do cenário (limite inferior)
        if (this.y >= linhas - 2) {
        this.yVelocity = 0; // para de cair
        this.isJump = false; // não está pulando
        this.isOnFloor = true; // está no chão
        }
    }

    // Checa se o player está tocando no chão ou em uma plataforma
    isOnfloorCheck(floor, gridSize) {
        // Coordenada Y da parte de baixo do player ("pé"), em pixels
        const playerBottom = this.y * gridSize + this.height;

        // Limite esquerdo do player, em pixels
        const leftPlayer = this.x * gridSize;

        // Limite direito do player, em pixels
        const rightPlayer = (this.x + 1) * gridSize;

        // Ajuste para deixar a colisão horizontal mais "justa"
        const ajusteRaioColision = this.width / 2;

        // Parte de cima da plataforma/chão, em pixels
        const floorTop = floor.y * gridSize;

        // Limite esquerdo da plataforma com ajuste de colisão
        const floorLeft = floor.x * floor.widht + ajusteRaioColision;

        // Limite direito da plataforma com ajuste de colisão
        const floorRight = floor.x * gridSize + floor.widht - ajusteRaioColision;

        // Verifica se o pé do player está na altura da plataforma
        const isAboveFloor =
            playerBottom >= floorTop && playerBottom <= floorTop + floor.height;

        // Verifica se o player está dentro dos limites horizontais da plataforma
        const isWithinHorizontalBounds =
            rightPlayer > floorLeft && leftPlayer < floorRight;

        // Só retorna true se as duas condições forem verdadeiras
        return isAboveFloor && isWithinHorizontalBounds;
    }


    // Função responsável por desenhar o player no canvas
    draw(ctx, gridSize) {
        let spriteArray;

        // Escolhe qual animação usar com base no estado do player
        if (this.isJump) {
            // Se está pulando, usa sprites de pulo
            spriteArray = this.sprites.jump;
        } else if (this.xVelocity === 0) {
            // Se não está se movendo, usa sprites de parado
            spriteArray = this.sprites.idle;
        } else if (this.xVelocity < 0) {
            // Se velocidade X é negativa, está andando para a esquerda
            spriteArray = this.sprites.walk_left;
        } else {
            // Caso contrário, está andando para a direita
            spriteArray = this.sprites.walk_right;
        }

        // Desenha barra de HP (fundo cinza)
        ctx.fillStyle = "grey";
        ctx.fillRect(10, 10, 100, 20);

        // Desenha vida atual (vermelho)
        ctx.fillStyle = "red";
        ctx.fillRect(10, 10, this.hp, 20);

        // Salva o estado atual do contexto antes de transformar
        ctx.save();

        // Se estiver em uma direção específica durante o pulo, espelha o sprite
        // se this.direction for true significa que o personagem está andando para a esquerda e precisa sofrer o flip.
        if (this.direction && this.isJump) {
            ctx.scale(-1, 1); // Espelha horizontalmente
            ctx.drawImage( // desenha a animação no canvas.
                spriteArray[this.currentFrame], // Frame atual da animação
                -(this.x * gridSize + this.width), // Ajuste de posição por causa do espelhamento
                this.y * gridSize, // posição y.
                this.width, // largura do personagem.
                this.height, // altura do personagem.
            );
        } else {
            // Desenho normal (sem espelhamento)
            ctx.drawImage(
            spriteArray[this.currentFrame], // Frame atual da animação
            this.x * gridSize,
            this.y * gridSize,
            this.width,
            this.height,
            );
        }

        // Restaura o contexto original (remove scale e outras transformações)
        ctx.restore();

        // Atualiza os frames da animação
        if (this.isJump) {
            // avança até o último frame e para nele
            if (this.animationFrame % 10 === 0 && this.currentFrame < spriteArray.length - 1) {
                this.currentFrame++;
            } 
        } else {
            // No chão (idle/andar), avança frame mais lentamente
            if (this.animationFrame % 10 === 0) {
            this.currentFrame = (this.currentFrame + 1) % spriteArray.length;
            }
        }

        // Contador geral usado para controlar tempo da animação
        this.animationFrame++;
    }

    //função que controla o salto do personagem.
    jump(jumpForce) {
        if (!this.isJump) {
        this.yVelocity = jumpForce;
        this.isJump = true;
        }
    }

    //função que verifica se o personagem colidiu com algo.
    isCollisionPlayer(collide, gridSize, ctx) {
        if (collide === null) return;

        const toleranceX = this.width / 3;
        const toleranceY = this.height / 3;

        const playerX1 = this.x * gridSize + toleranceX;
        const playerX2 = this.x * gridSize + this.width - toleranceX;
        const playerY1 = this.y * gridSize + toleranceY;
        const playerY2 = this.y * gridSize + this.height - toleranceY;

        // Desenha a hitbox no canvas
        if (this.showHitBox) this.drawHitBox(ctx, playerX1, playerY1, playerX2, playerY2);

        var colidiuX = false;
        var colidiuY = false;

        //verifica a colisão para cada pixel do objeto em X.
        for (let index = 0; index <= collide.width; index++) {
            const currentPixelX = collide.x * gridSize + index;

            if (currentPixelX >= playerX1 && currentPixelX <= playerX2) {
                colidiuX = true;
                break;
            }
        }

        //verifica a colisão para cada pixel do objeto em Y.
        for (let index = 0; index <= collide.height; index++) {
            const currentPixelY = collide.y * gridSize + index;

            if (currentPixelY >= playerY1 && currentPixelY <= playerY2) {
                colidiuY = true;
                break;
            }
        }

        return colidiuY && colidiuX;
    }

    // Função para desenhar o hitbox no canvas
    drawHitBox(ctx, x1, y1, x2, y2) {
        ctx.strokeStyle = "green"; // Define a cor da borda
        ctx.lineWidth = 2; // Define a espessura da borda
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); // Desenha o retângulo sem preenchimento
    }
}

// Classe para representar um inimigo
class Enemy {
  constructor(canvas, gridSize) {
    this.canvas = canvas;
    this.gridSize = gridSize;

    this.x = 1 + Math.random() * ((canvas.width - gridSize) / gridSize); // Posição inicial X aleatória
    this.y = Math.random() * 4; // Posição inicial Y aleatória

    this.speedX = (Math.random() + 0.2) / 13; // Velocidade X aleatória
    this.speedY = (Math.random() + 0.2) / 13; // Velocidade Y aleatória

    this.currentFrame = 0;
    this.animationFrame = 0;

    this.width = 32;
    this.height = 32;

    this.sprites = {
      bola: [new Image(), new Image(), new Image(), new Image()],
    };

    // Carregar as imagens
    for (let i = 0; i < this.sprites.bola.length; i++) {
      this.sprites.bola[i].src = `./src/assets/scoutPlat/bola/bola(${i}).png`;
    }

    // Verificar se as imagens estão carregadas
    let loadedImages = 0;
    this.sprites.bola.forEach((img) => {
      img.onload = () => {
        loadedImages++;
        if (loadedImages === this.sprites.bola.length) {
          console.log("Imagens dos inimigos carregadas com sucesso");
        }
      };
      img.onerror = () => {
        console.error("Erro ao carregar imagem: " + img.src);
      };
    });
  }

  // Atualiza a posição do inimigo
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Verifica se o inimigo saiu da tela e reinicia a posição
    if (this.x < 0 || this.x * this.gridSize > this.canvas.width - this.width) {
      this.speedX *= -1;
      //this.speedY *= -1;
    }
    if (
      this.y < 0 ||
      this.y * this.gridSize > this.canvas.height - this.gridSize - this.height
    ) {
      this.speedY *= -1;
      //this.speedX *= -1;
    }
  }

  // Desenha o inimigo no canvas
  draw(ctx) {
    ctx.drawImage(
      this.sprites.bola[this.currentFrame],
      this.x * this.gridSize,
      this.y * this.gridSize,
      this.width,
      this.height,
    );

    if (this.animationFrame % 10 === 0) {
      // Altere 10 para ajustar a velocidade da animação
      this.currentFrame = (this.currentFrame + 1) % this.sprites.bola.length;
    }
    this.animationFrame++;
  }

  isCollision(collide, gridSize, ctx) {
    if (collide === null) return;

    const toleranceX = this.width / 3;
    const toleranceY = this.height / 3;

    const playerX1 = this.x * gridSize + toleranceX;
    const playerX2 = this.x * gridSize + this.width - toleranceX;
    const playerY1 = this.y * gridSize + toleranceY;
    const playerY2 = this.y * gridSize + this.height - toleranceY;

    // Desenha a hitbox no canvas
    if (this.showHitBox)
      this.drawHitBox(ctx, playerX1, playerY1, playerX2, playerY2);

    var colidiuX = false;
    var colidiuY = false;

    //verifica a colisão para cada pixel do objeto em X.
    for (let index = 0; index <= collide.width; index++) {
      const currentPixelX = collide.x * gridSize + index;

      if (currentPixelX >= playerX1 && currentPixelX <= playerX2) {
        colidiuX = true;
        break;
      }
    }

    //verifica a colisão para cada pixel do objeto em Y.
    for (let index = 0; index <= collide.height; index++) {
      const currentPixelY = collide.y * gridSize + index;

      if (currentPixelY >= playerY1 && currentPixelY <= playerY2) {
        colidiuY = true;
        break;
      }
    }

    return colidiuY && colidiuX;
  }
}

// Classe para representar um projétil
class Projectile {
  constructor(x, y, direction, canvas) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.projectileSpeed = 0.1;
    this.direction = direction; // false para direita, true para esquerda
    this.markedForDeletion = false; // Marca o projétil para remoção quando sair da tela
    this.width = 20;
    this.height = 20;

    this.currentFrame = 0;
    this.animationFrame = 0;
    this.lastTime = 0;
    this.sprites = [new Image(), new Image(), new Image()];
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src =
        `./src/assets/scoutPlat/bola-tenis/bolatenis(${index}).png`;
    }
  }

  // Atualiza a posição do projétil
  update(gridSize) {
    if (this.direction) {
      this.x -= this.projectileSpeed;
    } else {
      this.x += this.projectileSpeed;
    }

    // Se o projétil sair da tela, marque-o para remoção
    if (
      this.x < 0 ||
      this.x * gridSize > this.canvas.width ||
      this.y < 0 ||
      this.y * gridSize > this.canvas.height
    ) {
      this.markedForDeletion = true;
    }
  }

  // Desenha o projétil no canvas
  draw(ctx, gridSize) {
    ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * gridSize,
      this.y * gridSize,
      this.width,
      this.height,
    );

    if (this.animationFrame % 5 === 0) {
      // Altere 10 para ajustar a velocidade da animação
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
    }
    this.animationFrame++;
  }
}

//classe da nuvem
class Cloud {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.currentFrame = 0;
    this.animationFrame = 0;
    this.lastTime = 0;
    this.sprites = [new Image(), new Image(), new Image()];
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src =
        `./src/assets/scoutPlat/clouds/cloud(${index}).png`;
    }
  }

  update(currentTime, canvas, tileCount) {
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convertendo para segundos
    this.lastTime = currentTime;
    this.x -= this.speed * deltaTime;

    // Se a nuvem sair da tela, marque-o para reiniciar
    if (this.x < 0 || this.x > canvas.width) {
      this.x = tileCount + 1;
    }
  }

  draw(ctx, gridSize) {
    ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * gridSize,
      this.y * gridSize,
      this.width,
      this.height,
    );

    if (this.animationFrame % 20 === 0) {
      // Altere 10 para ajustar a velocidade da animação
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
    }
    this.animationFrame++;
  }
}

//classe da nuvem
class Flag {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.currentFrame = 0;
    this.animationFrame = 0;
    this.lastTime = 0;
    this.sprites = [new Image(), new Image(), new Image()];
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src =
        `./src/assets/scoutPlat/flags/flags1(${index}).png`;
    }
  }

  draw(ctx, gridSize) {
    ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * gridSize,
      this.y * gridSize,
      this.width,
      this.height,
    );

    if (this.animationFrame % 20 === 0) {
      // Altere 10 para ajustar a velocidade da animação
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
    }
    this.animationFrame++;
  }
}

//classe da árvore
class Tree {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.currentFrame = 0;
    this.animationFrame = 0;
    this.lastTime = 0;
    this.sprites = [new Image()];
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src = `./src/assets/scoutPlat/arvores/arvore01.png`;
    }
  }

  draw(ctx, gridSize) {
    ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * gridSize,
      this.y * gridSize,
      this.width,
      this.height,
    );

    if (this.animationFrame % 20 === 0) {
      // Altere 10 para ajustar a velocidade da animação
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
    }
    this.animationFrame++;
  }
}

class Item {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.currentFrame = 0;
    this.animationFrame = 0;
    this.width = width;
    this.height = height;
    this.lastTime = 0;
    this.sprites = [
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
    ];
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src =
        `./src/assets/scoutPlat/coin/coin(${index}).png`;
    }
  }
  draw(ctx, gridSize) {
    ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * gridSize,
      this.y * gridSize,
      this.width,
      this.height,
    );

    if (this.animationFrame % 10 === 0) {
      // Altere 10 para ajustar a velocidade da animação
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
    }
    this.animationFrame++;
  }
}

//variáveis globais ----------
let character = ""; //nome do personagem que o jogador vai controlar.
let audioPlayer = null; //elemento de áudio que controla a trilha sonora do jogo.
let audioEfeitos = null; //elemento de áudio que controla os efeitos sonoros.
let currentPlayer = { name: "", score: 0, character: "" }; //objeto que armazena as informações do jogador atual.
let namesPlayers = []; //lista de jogadores no ranking.

// objeto contendo os endereços de todos os efeitos sonoros que vamos usar no jogo.
const efeitos = {
  screenInicial:
    "./src/audios/trilhaSonora/Juhani Junkala [Retro Game Music Pack] Title Screen.wav",
  jump: "./src/audios/efeitos/drop_004.ogg",
  colision: "./src/audios/efeitos/impactWood_medium_001.ogg",
  hit: "./src/audios/efeitos/jingles_NES09.ogg",
  gameOver: "./src/audios/efeitos/gameOver.ogg",
  click: "./src/audios/efeitos/tick_002.ogg",
  ok: "./src/audios/efeitos/confirmation_002.ogg",
  shoot: ".src/audios/efeitos/select_002.ogg",
  winner: "./src/audios/efeitos/BossIntro.wav",
  coin: "./src/audios/efeitos/somcoin.mp3",
};
//------------------------

//elemento de input onde o nome do jogador é digitado.
const inputElement = document.getElementById("namePlayer");

document.addEventListener("DOMContentLoaded", () => {
  // Acessa o elemento <audio>
  audioPlayer = document.getElementById("AudioPlayer");
  audioEfeitos = document.getElementById("efeitos");

  // Controlar o volume (0.0 a 1.0)
  //chamamos essa função dentro do DOMContentLoaded para evitar erros do elemento ainda
  // não estar carregado.
  changeAudioSource(efeitos.screenInicial, true);
});

//funções usadas na UI (seleção de personagem e start do jogo).
//a função select espera receber um id, ou seja, o nome do personagem selecionado maria ou leo.
function select(id) {
  const img1 = document.getElementById("maria"); //captura o elemento que tem id maria.
  const img2 = document.getElementById("leo"); //captura o elemento que tem id leo.

  playEfeitos(efeitos.click); //executa o efeito sonoro de click.

  if (id === "maria") {
    img1.classList.toggle("selected"); //alterna entre os estilos de css que configuramos. Incluindo ou removendo.
    img2.classList.remove("selected");
  } else {
    img2.classList.toggle("selected");
    img1.classList.remove("selected");
  }

  //atribui o valor correspondente ao personagem selecionado ou remove a seleção.
  setCharacter(id);
}
//fecha o modal com a seleção de personagens e inicia o jogo.
function start() {
  const modal = document.getElementById("boxSelector");
  inputElement.value = ""; //limpa o valor do input.

  if (character && currentPlayer.name !== "") {
    //se o nome do jogador foi preenchido segue o código normalmente. Isso evita que o jogo inicie sem um jogador identificado.
    modal.classList.add("hiddenModal");
    playEfeitos(efeitos.ok);
    game();
  } else {
    alert("Falta selecionar um personagem ou fornecer seu nome de player!");
  }
}
//controla a exibição do personagem escolhido na UI (interface do usuário).
function setCharacter(value) {
  if (character === value) {
    character = "";
  } else {
    character = value;
  }
  document.getElementById("nameCharacter").textContent = value
    ? "Você selecionou " + value[0].toUpperCase() + value.slice(1)
    : "";
}
//listener que ouve o evento de input (entrada de texto) do elemento que capturamos como inputElement.
inputElement.addEventListener("input", () => {
  handleNamePlayer(); // ao ocorrer o evento de input ele dispara o handleNamePlayer que recebe os dados de texto e seta na variável currentePlayer.
});
function handleNamePlayer() {
  currentPlayer = {
    id: namesPlayers.length + 1,
    name: inputElement.value, //pega o valor do input (texto digitado pelo jogador).
    score: 0,
    character: character,
  };
}
//---------------------------------

//adiciona o currentPlayer a lista de player ao final da partida.
function setNamePlayer() {
  const verify = namesPlayers.find((item) => item.name === currentPlayer.name);

  if (!verify) {
    namesPlayers.push({
      ...currentPlayer,
      character:
        currentPlayer.character[0].toUpperCase() +
        currentPlayer.character.slice(1),
    });
  } else {
    namesPlayers = namesPlayers.map((item) => {
      if (item.name === currentPlayer.name) {
        return {
          ...currentPlayer,
          character:
            currentPlayer.character[0].toUpperCase() +
            currentPlayer.character.slice(1),
        };
      } else {
        return item;
      }
    });
  }
  currentPlayer = { name: "", score: "" }; //limpa a variável.
  setCharacter(""); //limpa a variável.

  //atualiza a lista de playes do quadro de records.
  renderPlayersList();
}
//pega a lista de players e renderiza (escreve) na tela.
function renderPlayersList() {
  // Obtém a referência ao elemento <ul>
  const playersList = document.getElementById("listPlayers");

  // Itera sobre a lista de jogadores e cria os <li>
  namesPlayers
    .sort((a, b) => a.score < b.score)
    .forEach((player) => {
      const li = document.createElement("li");
      li.textContent = `${player.name} - Score: ${player.score} - Char: ${player.character}`;
      playersList.appendChild(li);
    });
}

// Mudar a trilha sonora
function changeAudioSource(newSource, loop = false) {
  audioPlayer.src = newSource;
  audioPlayer.play(); // Inicia a reprodução automaticamente após a troca de trilha
  audioPlayer.volume = 0.2; // 50% de volume
  audioPlayer.loop = loop;
}

// Para tocar o sons de efeitos como pulo, click, game over etc.
function playEfeitos(newSource, volume = 0.2) {
  audioEfeitos.currentTime = 0; // Recomeça o som caso esteja tocando
  audioEfeitos.src = newSource;
  audioPlayer.volume = volume;
  audioEfeitos.play();
}

//função principal do jogo.
function game() {
    //canvas onde o jogo será "desenhado".
    const canvas = document.getElementById("gameCanvas");
    canvas.style.display = "block"; // alteramos o estado para visível (block).
    const ctx = canvas.getContext("2d"); // contexto que usaremos para "desenhar" o jogo.
    const gridSize = 64; // tamanho do grid (células).
    const tileCount = canvas.width / gridSize; // quantidade de colunas do canvas.
    const linhas = canvas.height / gridSize; // quantidade de linhas do canvas.

    //variáveis de controle de tela.
    const playAgainButton = document.getElementById("playAgainButton");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const finalScoreDisplay = document.getElementById("finalScore");

    //variáveis de estado e física.
    let isGameover = false; //estado de game over.
    let speed = 2; //velocidade de movimento do personagem.
    let jumpForce = -5; //força do pulo.
    let gravity = 15; // força da gravidade sobre o personagem.
    const damage = 10; // dano que os inimigos aplicam no personagem.

    //aqui estamos instanciando (criando uma cópia) da classe Player que Apartir desse momento se tornar um objeto
    //chamado player e está armazenado em uma variável let para podermos acessar e alterar quando for necessário.
    let player = new Player(character, 2, 8, "Player", false);
    let npcBP = new Player("bp", 8, 8, "NPC", false);

  //nuvens
  const nuvens = [
    new Cloud(14, 0.1, gridSize, gridSize, 0.5),
    new Cloud(15, 0.5, gridSize, gridSize, 0.3),
    new Cloud(15, 0.1, gridSize, gridSize, 0.4),
  ];

  //bandeira
  const flag01 = new Flag(7, 0, gridSize, gridSize);

  //arvores
  const trees = [new Tree(2, 7.8, gridSize + 10, gridSize + 20)];
  const treesForeground = [new Tree(9, 7.2, gridSize + 10, gridSize * 2)];

  //moedas
  var itens = [
    new Item(5, 6.5, 32, 32),
    new Item(8, 3.5, 32, 32),
    new Item(1, 4.5, 32, 32),
    new Item(10, 6.5, 32, 32),
    new Item(12, 1.5, 32, 32),
    new Item(13.5, 4.5, 32, 32),
  ];

  //criação dos inimigos
  const enemies = [];
  const numEnemies = 10; // Quantidade de inimigos

  // Criação do array de projéteis
  const projectiles = [];

  //criação do chão e plataformas iniciais
  const floors = [
    {
      x: 7,
      y: 1,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 4,
      y: 8,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 5,
      y: 7,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 6,
      y: 6,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 7,
      y: 5,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 3,
      y: 7,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 3,
      y: 6,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 1,
      y: 6,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 1,
      y: 5,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 4,
      y: 5,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 9,
      y: 8,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 10,
      y: 7,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 11,
      y: 7,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 8,
      y: 4,
      widht: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 10,
      y: 3,
      widht: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 12,
      y: 2,
      widht: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 10,
      y: 2,
      widht: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 8,
      y: 2,
      widht: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 13,
      y: 5,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 12,
      y: 6,
      widht: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
  ];

  //chão
  for (let index = 0; index < tileCount; index++) {
    floors.push({
      x: index,
      y: linhas - 1,
      widht: gridSize,
      height: gridSize,
      color: "green",
    });
  }

  function drawFloor({ x, y, widht, height, color, borderColor = "" }) {
    if (borderColor) {
      ctx.fillStyle = borderColor;
      ctx.strokeRect(x * gridSize, y * gridSize, widht, height);
    }

    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, widht, height);
  }

  function drawBackground(x, y, widht, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, widht, height);
  }

  function drawGrounds() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground(0, 8.5, canvas.width, gridSize / 2, "green");

    for (const floor of floors) {
      drawFloor(floor);
    }

    npcBP.draw(ctx, gridSize);
    flag01.draw(ctx, gridSize);

    trees.forEach((tree) => {
      tree.draw(ctx, gridSize);
    });
  }

  function drawForegrounds() {
    treesForeground.forEach((tree) => {
      tree.draw(ctx, gridSize);
    });
  }

  //verifica se o player perdeu o jogo.
  function gameover() {
    if (player.hp <= 0) {
      showGameOverScreen();
      playEfeitos(efeitos.gameOver);

      //limpa e esconde o canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";

      // exibe o modal de seleção de personagem.
      const modal = document.getElementById("boxSelector");
      modal.classList.remove("hiddenModal");

      //muda o estado para gameover para parar o loop.
      isGameover = true;

      //atualiza a lista de playes do quadro de records.
      setNamePlayer();
    }
  }

  function winner() {
    const chegou =
      flag01.x <= player.x &&
      flag01.x + flag01.width >= player.x &&
      flag01.y === player.y;
    if (chegou && player.yVelocity >= 0) {
      playEfeitos(efeitos.winner);

      alert("Parabéns! Você completou a fase!");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";

      const modal = document.getElementById("boxSelector");
      modal.classList.remove("hiddenModal");
      isGameover = true;
      //atualiza a lista de playes do quadro de records.
      setNamePlayer();
    }
  }

  // Função para mostrar a tela de game over.
  function showGameOverScreen() {
    finalScoreDisplay.textContent = currentPlayer.score;
    gameOverScreen.style.display = "flex";
  }

  // Função para esconder a tela de game over.
  function hideGameOverScreen() {
    gameOverScreen.style.display = "none";
  }

  // Função para disparar um projétil
  function shoot() {
    // Adiciona um projétil a partir do centro do jogador
    projectiles.push(
      new Projectile(player.x + 0.5, player.y + 0.5, player.direction, canvas),
    );
    playEfeitos(efeitos.shoot);
  }

  // Cria inimigos iniciais
  for (let i = 0; i < numEnemies; i++) {
    enemies.push(new Enemy(canvas, gridSize));
  }

  function Console() {
    const logStatus = document.getElementById("logStatus");

    logStatus.innerHTML = `
            Player: ${currentPlayer.name}<br/>
            Score: ${currentPlayer.score || 0}<br/>
            HP: ${player.hp}<br/>
        `;
  }

  function loop(currentTime) {
    if (isGameover) return; //se deu game over para o loop.

    drawGrounds();

    player.update(
      currentTime, //essa variável vem do requestAnimationFrame() e nos repassamos ela para o update.
      gravity, // força da gravidade.
      speed, // velocidade do personagem.
      floors, // plataformas.
      tileCount, // quantidade de tiles no canvas.
      gridSize, // tamanho do grid.
      linhas, // quantidade de linhas do canvas.
    );
    player.draw(ctx, gridSize);

    itens.forEach((i) => {
      if (player.isCollisionPlayer(i, gridSize, ctx)) {
        //se colidiu não desenha o item na tela e remove ele do array.
        playEfeitos(efeitos.coin);
        currentPlayer = { ...currentPlayer, score: currentPlayer.score + 1 };
        itens = itens.filter((item) => item != i); //remove o item do array.
      } else {
        i.draw(ctx, gridSize);
      }
    });

    //verifica se o player chegou no endpoint.
    winner();

    // Atualiza e desenha cada inimigo
    enemies.forEach((enemy) => {
      enemy.update();
      enemy.draw(ctx);

      // Verifica colisão com os projeteis no inimigo.
      projectiles.forEach((projectile) => {
        if (enemy.isCollision(projectile, gridSize, ctx)) {
          // Ajustar a velocidade do inimigo na direção do projétil
          if (projectile.direction) {
            // Projétil disparado para a esquerda
            enemy.speedX = Math.abs(enemy.speedX) * -1;
            enemy.speedY = Math.abs(enemy.speedY) * -1;
          } else {
            // Projétil disparado para a direita
            enemy.speedX = Math.abs(enemy.speedX);
            enemy.speedY = Math.abs(enemy.speedY);
          }

          projectile.markedForDeletion = true;
        }
      });

      //verifica colisão do inimigo no player.
      if (player.isCollisionPlayer(enemy, gridSize, ctx)) {
        player.hp = player.hp - damage;
        enemy.x = Math.random() * 10;
        enemy.y = 1;
        playEfeitos(efeitos.hit, 0.1);
      }
    });

    // Desenha os projéteis
    // Atualiza e desenha projéteis, removendo os que estão fora da tela
    projectiles.forEach((projectile, index) => {
      projectile.update(gridSize);
      if (projectile.markedForDeletion) {
        projectiles.splice(index, 1); // Remove o projétil do array
      } else {
        projectile.draw(ctx, gridSize);
      }
    });

    for (let index = 0; index < nuvens.length; index++) {
      nuvens[index].draw(ctx, gridSize);
      nuvens[index].update(currentTime, canvas, tileCount);
    }

    drawForegrounds();

    gameover();

    Console();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  document.addEventListener("keydown", (e) => {
    //precisamos desligar essa captura de teclas caso o jogador esteja digitando algo em um input.
    if (document.activeElement.tagName === "INPUT") return;

    //aqui estamos evitando um comportamento padrão das teclas para impedir bugs.
    e.preventDefault();

    //aqui estamos pegando o tipo de tecla pressionada e.code.
    const press = e.code;

    if (press === "KeyA") { // se a tecla pressionada for KeyA atribuirmos o valor -1 na variável xVelocity. Isso significa que queremos que o personagem ende para a esquerda.
      player.xVelocity = -1;
      player.direction = true;
    } else if (press === "KeyD") { //nesse caso atribuímos o valor 1 à variável xVelocity, ou seja, queremos que o personagem ande para a direita.
      player.xVelocity = 1;
      player.direction = false;
    }

    //se teclarmos enter estamos estamos chamando o shoot() que diz ao parsonagem para disparar uma bolinha.
    if (press === "Enter") {
      shoot();
    }

    // se precionarmos a Tecla space vamos dizer ao personagem para dar um salto (jump).
    if (press === "Space") {
      player.jump(jumpForce);
    }
  });

  document.addEventListener("keyup", (e) => {
    e.preventDefault();
    const press = e.code;
    if (["KeyA", "ArrowLeft", "KeyD", "ArrowRight"].includes(press)) {
      player.xVelocity = 0; // reseta a velocidade horizontal.
    }
  });

  canvas.addEventListener("click", function (e) {
    shoot();
  });

  playAgainButton.addEventListener("click", () => {
    // Esconde a tela de game over quando o jogador clica no botão de jogar novamente,
    // permitindo que uma nova partida comece.
    hideGameOverScreen();
  });
}
