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
      ctx,
      gridSize,
      tileCount, 
      linhas,
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
      this.type = type; // tipo do personagem, pode ser NPC ou Player. Isso é usado para carregar os sprites corretos.
      this.ctx = ctx; // referência ao contexto do canvas para desenhar o personagem.
      this.gridSize = gridSize; //tamanho de cada tile do cenário, usado para calcular a posição do personagem em pixels.
      this.tileCount = tileCount; //quantidade de tiles no cenário, usado para limitar o movimento do personagem.
      this.linhas = linhas; //quantidade de linhas do cenário, usado para limitar o movimento do personagem.
      this.gameOver = false; // estado de game over.
      this.lastTime = 0; // variável usada para calcular a velocidade do loop.

      // Prepara os sprites instanciando elementos de imagens para cada frame e para cada animação.
      // cada animação é constituída por 3 sprites (3 frames ou 3 imagens).
      this.sprites ={
        // se o tipo informado for Player carrega todas as animações.
        idle: [new Image(), new Image(), new Image()],
        walk_left: [new Image(), new Image(), new Image()],
        walk_right: [new Image(), new Image(), new Image()],
        jump: [new Image(), new Image(), new Image()],
      }

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
  update(currentTime, gravity, speed, floors) {
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
    } else if (this.x >= this.tileCount - 1) {
      this.x = this.tileCount - 1; // trava na borda direita
    }
    //-----------------------------------------------------------------

    // Assume inicialmente que o jogador NÃO está em uma plataforma/chão
    this.isOnFloor = false;

    // Verifica colisão com cada plataforma/chão da lista
    for (let index = 0; index < floors.length; index++) {
      const floor = floors[index];

      // Só checa colisão de pouso quando o jogador está descendo (yVelocity >= 0)
      if (this.yVelocity >= 0) {
        if (this.isOnfloorCheck(floor, this.gridSize)) {
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
    if (this.y >= this.linhas - 2) {
      this.yVelocity = 0; // para de cair
      this.isJump = false; // não está pulando
      this.isOnFloor = true; // está no chão
    }
  }

  // Checa se o player está tocando no chão ou em uma plataforma
  isOnfloorCheck(floor) {
      // Coordenada Y da parte de baixo do player ("pé"), em pixels
      const playerBottom = (this.y * this.gridSize) + this.height;

      // Limite esquerdo do player, em pixels
      const leftPlayer = this.x * this.gridSize;

      // Limite direito do player, em pixels
      const rightPlayer = (this.x + 1) * this.gridSize;

      // Ajuste para deixar a colisão horizontal mais "justa"
      const ajusteRaioColision = this.width / 2;

      // Parte de cima da plataforma/chão, em pixels
      const floorTop = floor.y * this.gridSize;

      // Limite esquerdo da plataforma com ajuste de colisão
      const floorLeft = (floor.x * floor.width) + ajusteRaioColision;

      // Limite direito da plataforma com ajuste de colisão
      const floorRight = floor.x * this.gridSize + floor.width - ajusteRaioColision;

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
  draw() {
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
      this.ctx.fillStyle = "grey";
      this.ctx.fillRect(10, 10, 100, 20);

      // Desenha barra atual de hp (vermelho)
      this.ctx.fillStyle = "red";

      // a largura da barra de vida é proporcional à vida atual (hp).
      this.ctx.fillRect(10, 10, this.hp, 20); 

      // Salva o estado atual do contexto antes de transformar
      this.ctx.save();

      // Se estiver em uma direção específica durante o pulo, espelha o sprite
      // se this.direction for true significa que o personagem está andando para a esquerda e precisa sofrer o flip.
      if (this.direction && this.isJump) {
          this.ctx.scale(-1, 1); // Espelha horizontalmente
          this.ctx.drawImage( // desenha a animação no canvas.
              spriteArray[this.currentFrame], // Frame atual da animação
              -(this.x * this.gridSize + this.width), // Ajuste de posição por causa do espelhamento
              this.y * this.gridSize, // posição y.
              this.width, // largura do personagem.
              this.height, // altura do personagem.
          );
      } else {
        // Desenho normal (sem espelhamento)
        this.ctx.drawImage(
        spriteArray[this.currentFrame], // Frame atual da animação
        this.x * this.gridSize,
        this.y * this.gridSize,
        this.width,
        this.height,
        );
      }

      // Restaura o contexto original (remove scale e outras transformações)
      this.ctx.restore();

      // Atualiza os frames da animação
      if (this.isJump) {
          // avança até o último frame e para nele
          if (this.animationFrame % 10 === 0 && this.currentFrame < spriteArray.length - 1) {
            this.currentFrame++;
          } 
      } else {
          // No chão (idle/andar), avança normalmente e loopa a animação
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
  isCollisionPlayer(collide) {
    if (collide === null) return; //collide é o objeto com o qual queremos verificar a colisão. Se ele for nulo, não tem como verificar a colisão, então retornamos.

    const toleranceX = this.width / 3; //tolerância para a colisão no eixo x. Isso deixa a colisão mais "justa" e evita que o player colida quando estiver quase tocando o objeto.
    const toleranceY = this.height / 3; //tolerância para a colisão no eixo y. Isso deixa a colisão mais "justa" e evita que o player colida quando estiver quase tocando o objeto.

    const playerX1 = this.x * this.width + toleranceX;
    const playerX2 = this.x * this.width + this.width - toleranceX;
    const playerY1 = this.y * this.height + toleranceY;
    const playerY2 = this.y * this.height + this.height - toleranceY;

    // Desenha a hitbox no canvas
    if (this.showHitBox) this.drawHitBox(playerX1, playerY1, playerX2, playerY2);

    var colidiuX = false;
    var colidiuY = false;

    //verifica a colisão para cada pixel do objeto em X.
    for (let index = 0; index <= collide.width; index++) {
        const currentPixelX = collide.x * this.width + index;

        if (currentPixelX >= playerX1 && currentPixelX <= playerX2) {
            colidiuX = true;
            break;
        }
    }

    //verifica a colisão para cada pixel do objeto em Y.
    for (let index = 0; index <= collide.height; index++) {
        const currentPixelY = collide.y * this.height + index;

        if (currentPixelY >= playerY1 && currentPixelY <= playerY2) {
            colidiuY = true;
            break;
        }
    }

    return colidiuY && colidiuX;
  }

  // Função para desenhar o hitbox no canvas
  drawHitBox(x1, y1, x2, y2) {
    this.ctx.strokeStyle = "green"; // Define a cor da borda
      this.ctx.lineWidth = 2; // Define a espessura da borda
      this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); // Desenha o retângulo sem preenchimento
  }
}

// Classe para representar o chão e as plataformas do jogo.
class Floor {
  constructor(floor) { //recebe um objeto com as propriedades da plataforma.
    this.x = floor.x; //posição x da plataforma.
    this.y = floor.y; //posição y da plataforma.
    this.width = floor.width; //largura da plataforma (em número de tiles).
    this.height = floor.height; //altura da plataforma (em número de tiles).
    this.color = floor.color; // cor da plataforma. No futuro você pode alterar por um sprite.
    this.borderColor = floor.borderColor;  //cor da borda, caso você queira adiciona-la.
  }

  //função para desenhar a plataforma no canvas.
  draw(ctx, gridSize) {
    ctx.fillStyle = this.color; //cor da plataforma.
    ctx.fillRect(this.x * gridSize, this.y * gridSize, this.width, this.height); //desenha um retângulo representando a plataforma.
    
    // Se a cor da borda for fornecida, desenha a borda ao redor da plataforma
    if (this.borderColor) {
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x * gridSize, this.y * gridSize, this.width, this.height);
    }
  }
}

//classe do item coletável (moeda)
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

    this.width = gridSize / 2;
    this.height = gridSize / 2;

    // Prepara os sprites do inimigo (bola)
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

  // Verifica colisão com o projetil do player.
  isCollision(collide) {
    if (collide === null) return false; //collide é o objeto com o qual queremos verificar a colisão. Se ele for nulo, não tem como verificar a colisão, então retornamos false.

    const toleranceX = this.width / 3; //tolerância para a colisão no eixo x. Isso deixa a colisão mais "justa" e evita que o player colida quando estiver quase tocando o objeto.
    const toleranceY = this.height / 3; //tolerância para a colisão no eixo y. Isso deixa a colisão mais "justa" e evita que o player colida quando estiver quase tocando o objeto.

    const enemyX1 = this.x * this.gridSize + toleranceX; //limite esquerdo do inimigo com a tolerância aplicada.
    const enemyX2 = this.x * this.gridSize + this.width - toleranceX; //limite direito do inimigo com a tolerância aplicada.
    const enemyY1 = this.y * this.gridSize + toleranceY; //limite superior do inimigo com a tolerância aplicada.
    const enemyY2 = this.y * this.gridSize + this.height - toleranceY; //limite inferior do inimigo com a tolerância aplicada.

    var colidiuX = false;
    var colidiuY = false;

    //verifica a colisão para cada pixel do objeto em X.
    for (let index = 0; index <= collide.width; index++) {
      const currentPixelX = collide.x * this.gridSize + index;

      //sobrepõe a hitbox do inimigo com a hitbox do projétil para verificar se houve colisão.
      if (currentPixelX >= enemyX1 && currentPixelX <= enemyX2) {
        colidiuX = true;
        break;
      }
    }

    //verifica a colisão para cada pixel do objeto em Y.
    for (let index = 0; index <= collide.height; index++) {
      const currentPixelY = collide.y * this.gridSize + index;

      //sobrepõe a hitbox do inimigo com a hitbox do projétil para verificar se houve colisão.
      if (currentPixelY >= enemyY1 && currentPixelY <= enemyY2) {
        colidiuY = true;
        break;
      }
    }

    // Só retorna true se as duas condições forem verdadeiras, ou seja, se houve colisão tanto no eixo X quanto no eixo Y.
    return colidiuY && colidiuX;
  }
}

// Classe para representar um projétil
class Projectile {
  constructor(x, y, direction, canvas) {
    this.canvas = canvas; //referência ao canvas para verificar os limites da tela.
    this.x = x; //posição x inicial do projétil, geralmente a posição do player.
    this.y = y; //posição y inicial do projétil, geralmente a posição do player.
    this.projectileSpeed = 0.1; //velocidade do projétil. Você pode ajustar esse valor para deixar o projétil mais rápido ou mais lento.
    this.direction = direction; // false para direita, true para esquerda
    this.markedForDeletion = false; // Marca o projétil para remoção quando sair da tela
    this.width = 20; //largura do projétil. Você pode ajustar esse valor para deixar o projétil maior ou menor.
    this.height = 20; //altura do projétil. Você pode ajustar esse valor para deixar o projétil maior ou menor.

    this.currentFrame = 0; //guarda a frame atual da animação do projétil.
    this.animationFrame = 0; //velocidade da animação do projétil. O tempo que a animação leva para trocar entre sprites.
    this.lastTime = 0; //variável usada para calcular a velocidade do loop da animação do projétil.
    
    // Prepara os sprites do projétil (bola de tênis)
    this.sprites = [new Image(), new Image(), new Image()];
    
    // Carregar as imagens dos projeteis
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src =
        `./src/assets/scoutPlat/bola-tenis/bolatenis(${index}).png`;
    }
  }

  // Atualiza a posição do projétil
  update(gridSize) {
    if (this.direction) {
      this.x -= this.projectileSpeed; // Se a direção for true, o projétil se move para a esquerda
    } else {
      this.x += this.projectileSpeed; // Se a direção for false, o projétil se move para a direita
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
      this.sprites[this.currentFrame], // Desenha a animação do projétil
      this.x * gridSize, // posição x do projétil
      this.y * gridSize, // posição y do projétil
      this.width, // largura do projétil
      this.height, // tamanho do projétil
    );

    // Atualiza os frames da animação do projétil
    // A cada 5 frames, avança para o próximo frame da animação
    // Altere para 10 ajustar a velocidade da animação do projétil
    if (this.animationFrame % 5 === 0) {
      // Avança para o próximo frame da animação, voltando ao início quando chegar ao final 
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length; 
    }

    // Contador geral usado para controlar o tempo da animação do projétil
    this.animationFrame++;
  }
}

//classe da Bandeirola (flag) que fica tremulando no topo do mastro.
class Flag {
  constructor(x, y, width, height, gridSize) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;

    this.currentFrame = 0; //guarda a frame atual da animação da bandeira.
    this.animationFrame = 0; //velocidade da animação da bandeira. O tempo que a animação leva para trocar entre sprites.
    this.lastTime = 0; //variável usada para calcular a velocidade do loop da animação da bandeira.
    
    // Prepara os sprites da bandeira
    this.sprites = [new Image(), new Image(), new Image()];

    // Carregar as imagens da bandeira
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src =
        `./src/assets/scoutPlat/flags/flags1(${index}).png`;
    }
  }

  //função para desenhar a bandeira no canvas.
  draw(ctx) {
    ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * this.gridSize,
      this.y * this.gridSize,
      this.width,
      this.height,
    );

    // Altere o 20 para ajustar a velocidade da animação
    if (this.animationFrame % 20 === 0) {
      // Avança para o próximo frame da animação, voltando ao início quando chegar ao final
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
    }
    this.animationFrame++;
  }
}

//classe da árvore
class Tree {
  constructor(x, y, width, height, gridSize, ctx) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.ctx = ctx;
    this.currentFrame = 0;
    this.animationFrame = 0;
    this.lastTime = 0;

    this.sprites = [new Image()];
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src = `./src/assets/scoutPlat/arvores/arvore01.png`;
    }
  }

  draw() {
    this.ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * this.gridSize,
      this.y * this.gridSize,
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
class Cloud {
  constructor(x, y, width, height, speed, canvas, ctx, gridSize, tileCount) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.canvas = canvas;
    this.ctx = ctx;
    this.gridSize = gridSize;
    this.tileCount = tileCount;

    this.currentFrame = 0;
    this.animationFrame = 0;
    this.lastTime = 0;

    this.sprites = [new Image(), new Image(), new Image()];
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].src =
        `./src/assets/scoutPlat/clouds/cloud(${index}).png`;
    }
  }

  //função para atualizar a posição da nuvem no cenário, fazendo com que ela se mova lentamente de um lado para o outro.
  update(currentTime) {
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convertendo para segundos
    this.lastTime = currentTime;
    this.x -= this.speed * deltaTime;

    // Se a nuvem sair da tela, marque-o para reiniciar
    if (this.x < 0 || this.x > this.canvas.width) {
      this.x = this.tileCount + 1;
    }
  }

  draw() {
    this.ctx.drawImage(
      this.sprites[this.currentFrame],
      this.x * this.gridSize,
      this.y * this.gridSize,
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

//variáveis globais ----------
let character = ""; //nome do personagem que o jogador vai controlar.
let audioPlayer = null; //elemento de áudio que controla a trilha sonora do jogo.
let audioEfeitos = null; //elemento de áudio que controla os efeitos sonoros.
let currentPlayer = { name: "", score: 0, character: "" }; //objeto que armazena as informações do jogador atual.
let namesPlayers = []; //lista de jogadores no ranking.
let charMaria  = undefined; //será usada para capturar o elemento que tem id maria.
let charLeo  = document.getElementById("leo"); //será usada para capturar o elemento que tem id leo.

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
  shoot: "./src/audios/efeitos/select_002.ogg",
  winner: "./src/audios/efeitos/BossIntro.wav",
  coin: "./src/audios/efeitos/somcoin.mp3",
};
//------------------------

//elemento de input onde o nome do jogador é digitado.
const inputElement = document.getElementById("namePlayer");

document.addEventListener("DOMContentLoaded", () => {
  // Acessa o elemento <audio>
  audioPlayer = document.getElementById("AudioPlayer"); //captura o elemento que tem id AudioPlayer e atribui a variável audioPlayer.
  audioEfeitos = document.getElementById("efeitos"); //captura o elemento que tem id efeitos e atribui a variável audioEfeitos.
  charMaria = document.getElementById('maria'); //captura o elemento que tem id maria e atribui a variável charMaria.
  charLeo = document.getElementById('leo'); //captura o elemento que tem id leo e atribui a variável charLeo.

  // Controlar o volume (0.0 a 1.0)
  //chamamos essa função dentro do DOMContentLoaded para evitar erros do elemento ainda
  // não estar carregado.
  changeAudioSource(efeitos.screenInicial, true);
});

// Mudar a trilha sonora
function changeAudioSource(newSource, loop = false) {
  audioPlayer.src = newSource; // recebe o som que queremos tocar.
  audioPlayer.play(); // inicia a reprodução automaticamente após a troca de trilha.
  audioPlayer.volume = 0.2; // 20% de volume.
  audioPlayer.loop = loop; // recebe o comando para executar ou não em loop.
}
//aula 22 ----------------
//a função select espera receber um id, ou seja, o nome do personagem selecionado maria ou leo.
function select(id){
  playEfeitos(efeitos.click); //executa o efeito sonoro de click.

  if(id === 'maria'){
      charMaria.classList.toggle("selected"); //alterna entre os estilos de css que configuramos. Incluindo ou removendo.
      charLeo.classList.remove("selected");
  }else{
      charLeo.classList.toggle("selected");
      charMaria.classList.remove("selected");
  }
  //atribui o valor correspondente ao personagem selecionado ou remove a seleção.
  setCharacter(id)
}

//fecha o modal com a seleção de personagens e inicia o jogo.
function start(){
  const modal = document.getElementById("boxSelector");
  inputElement.value= ''; //limpa o valor do input com o nome do personagem.

  if(character && currentPlayer.name !== ""){ //se o nome do jogador foi preenchido segue o código normalmente. Isso evita que o jogo inicie sem um jogador identificado.
    charMaria.classList.remove("selected"); //remove a classe de seleção do personagem maria.
    charLeo.classList.remove("selected"); //remove a classe de seleção do personagem leo.
    
    //adiciona a classe hiddenModal para esconder o modal de seleção de personagem.
    modal.classList.add("hiddenModal");
    playEfeitos(efeitos.ok); //dispara um efeito sonoro.
    game(); //inicia o jogo.
  }else{
      alert("Falta selecionar um personagem ou fornecer seu nome de player!");
  }    
}

//listener que ouve o evento de input do elemento que capturamos como inputElement.
inputElement.addEventListener('input', ()=>{
  handleNamePlayer(); // ao ocorrer o evento de input ele dispara o handleNamePlayer que recebe os dados de texto e seta na variável currentePlayer.
});
function handleNamePlayer(){
    currentPlayer = {
        id: namesPlayers.length + 1,
        name: inputElement.value, //pega o valor do input (texto digitado pelo jogador).
        score: 0,
        character: character
    }
}

// funções auxiliares para o jogo, como tocar efeitos sonoros, controlar a seleção de personagens e iniciar o jogo. 
// Essas funções são chamadas em resposta a eventos do usuário, como cliques ou digitação, e ajudam a criar uma experiência interativa para o jogador.
// Para tocar os sons de efeitos como pulo, click, game over etc.
function playEfeitos(newSource, volume=0.2) {
    audioEfeitos.currentTime = 0; // recomeça o som caso esteja tocando
    audioEfeitos.src = newSource;
    audioPlayer.volume = volume;
    audioEfeitos.play();
}

//controla a exibição do personagem escolhido na UI (interface do usuário).
function setCharacter(value){
    if(character === value){
        character= "";
    }else{
        character = value;
    }
    document.getElementById('nameCharacter').textContent = value ? "Você selecionou " + value[0]?.toUpperCase() + value.slice(1) : "";
}

// Para tocar o sons de efeitos como pulo, click, game over etc.
function playEfeitos(newSource, volume = 0.2) {
  audioEfeitos.currentTime = 0; // Recomeça o som caso esteja tocando
  audioEfeitos.src = newSource;
  audioPlayer.volume = volume;
  audioEfeitos.play().catch(()=>{}); //o catch nesse caso é apenas para evitar erros caso o áudio seja disparado no console.
}
// fim aula 22 ----------------


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
  const gameScreen = document.getElementById("game-screen");
  const gameScreenTitle = document.getElementById("game-screen-title");
  const finalScoreDisplay = document.getElementById("finalScore");

  //variáveis de estado e física.
  let isGameover = false; //estado de game over.
  let speed = 3; //velocidade de movimento do personagem.
  let jumpForce = -5; //força do pulo.
  let gravity = 15; // força da gravidade sobre o personagem.
  const damage = 10; // dano que os inimigos aplicam no personagem.

  //criação do chão e plataformas iniciais
  const floors = [
    {
      x: 7,
      y: 1,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 4,
      y: 8,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 5,
      y: 7,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 6,
      y: 6,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 7,
      y: 5,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 3,
      y: 7,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 3,
      y: 6,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 1,
      y: 6,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 1,
      y: 5,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 4,
      y: 5,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 9,
      y: 8,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 10,
      y: 7,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 11,
      y: 7,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 8,
      y: 4,
      width: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 10,
      y: 3,
      width: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 12,
      y: 2,
      width: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 10,
      y: 2,
      width: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 8,
      y: 2,
      width: gridSize,
      height: gridSize / 2,
      color: "yellow",
      borderColor: "black",
    },
    {
      x: 13,
      y: 5,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
    {
      x: 12,
      y: 6,
      width: gridSize,
      height: gridSize / 2,
      color: "brown",
      borderColor: "black",
    },
  ];

  //carrega os dados para desenhar o chão.
  // aqui estamos usando um loop para criar o chão do cenário, ele percorre a quantidade de tiles que temos no canvas e para cada tile ele adiciona um objeto representando uma parte do chão no array de floors. Dessa forma, o chão é criado dinamicamente com base na configuração do canvas e do gridSize, facilitando ajustes futuros caso seja necessário mudar o tamanho do grid ou do canvas.
  for (let index = 0; index < tileCount; index++) {
    floors.unshift({
      x: index, //posição x baseada no índice do loop.
      y: linhas - 1, //posição y fixa para o chão (última linha do canvas).
      width: gridSize, //largura de um tile.
      height: gridSize, //altura de um tile.
      color: "green", //cor do chão, você pode alterar para um sprite ou outra cor se preferir.
      borderColor: "", //cor da borda do chão, caso queira adicionar uma borda.
    });
  }

  //aqui estamos instanciando (criando uma cópia) da classe Player que Apartir desse momento se tornar um objeto
  //chamado player e está armazenado em uma variável let para podermos acessar e alterar quando for necessário.
  let player = new Player(character, 2, floors[0].y-1, "Player", false, ctx, gridSize, tileCount, linhas);
  
  //lista de NPCs (personagens não jogáveis), nesse caso o BP (bandido pirata).
  let npcs = [
    new Player("bp", 8, floors[0].y-1, "NPC", false, ctx, gridSize, tileCount, linhas),
    new Player("bp", 10, floors[0].y-3, "NPC", false, ctx, gridSize, tileCount, linhas)
  ]; 	

  var itens = [
    new Item(5, 6.5, gridSize / 2, gridSize / 2), //instanciação de itens usando a classe Item, cada item tem uma posição (x, y) e um tamanho (width, height).
    new Item(8, 3.5, gridSize / 2, gridSize / 2),
    new Item(1, 4.5, gridSize / 2, gridSize / 2),
    new Item(10, 6.5, gridSize / 2, gridSize / 2),
    new Item(12, 1.5, gridSize / 2, gridSize / 2),
    new Item(13.5, 4.5, gridSize / 2, gridSize / 2),
  ];

  //criação dos inimigos
  const enemies = []; // array para armazenar os inimigos que serão criados dinamicamente.
  const numEnemies = 10; // Quantidade de inimigos

  // Cria inimigos iniciais
  for (let i = 0; i < numEnemies; i++) {
    enemies.push(new Enemy(canvas, gridSize));
  }

  //array para armazenar os projéteis disparados pelo player.
  const projectiles = [];  

  //bandeira
  // você pode definir uma posição personalizada para a bandeirola.
  const flag01 = new Flag(7, 0, gridSize, gridSize, gridSize);
  
  //nuvens
  const nuvens = [
    new Cloud(14, 0.1, gridSize, gridSize, 0.5, canvas, ctx, gridSize, tileCount),
    new Cloud(15, 0.5, gridSize, gridSize, 0.3, canvas, ctx, gridSize, tileCount),
    new Cloud(15, 0.1, gridSize, gridSize, 0.4, canvas, ctx, gridSize, tileCount),
  ];

  //árvores que ficam no fundo do cenário, para dar um efeito de profundidade.
  const trees = [
    new Tree(2, floors[0].y - 1.2, gridSize + 10, gridSize + 20, gridSize, ctx),
  ];

  // árvores que ficam na frente do cenário, para dar um efeito de profundidade.
  const treesForeground = [
    new Tree(9, floors[0].y - 1.5, gridSize + 10, gridSize * 2, gridSize, ctx)
  ];

  function drawBackground(x, y, width, height, color) {
    //define a cor de preenchimento para o fundo.
    ctx.fillStyle = color; 

    //desenha um retângulo preenchido que serve como o fundo do cenário, usando as coordenadas (x, y) e as dimensões (width, height) fornecidas.
    ctx.fillRect(x * gridSize, y * gridSize, width, height);
  }

  //função para desenhar o cenário do jogo, incluindo o chão, plataformas, inimigos, projéteis, player, NPCs e outros elementos visuais.
  function draw() {
    //desenha as nuvens no cenário.
    nuvens.forEach((cloud) => {
      cloud.draw();
    });

    //desenha o fundo do cenário, nesse caso um retângulo verde que representa a grama. O chão e as plataformas serão desenhados por cima desse fundo.
    drawBackground(0, floors[0].y - 1, canvas.width, gridSize, "green");

    //aqui estamos usando o método forEach para percorrer a lista de plataformas (floors) e desenhar cada uma delas no canvas usando o método draw da classe Floor.
    floors.forEach(floor => {
      const newFloor = new Floor(floor);
      newFloor.draw(ctx, gridSize)
    });

    //desenha os itens coletáveis (moedas).
    itens.forEach(item => {
      item.draw(ctx, gridSize);
    });

    //desenha as as bolas (inimigos).
    enemies.forEach((enemy) => {
      enemy.draw(ctx, gridSize);
    });

    // desenha projéteis, removendo os que estão fora da tela
    projectiles.forEach((projectile, index) => {
      projectile.update(gridSize);
      if (projectile.markedForDeletion) {
        projectiles.splice(index, 1); // Remove o projétil do array
      } else {
        projectile.draw(ctx, gridSize); // Desenha o projétil apenas se ele não estiver marcado para remoção
      }
    });

    //atualiza score e outros dados do jogador no canto superior esquerdo do canvas.
    setLogInf();

    //desenha os projeteis disparados pelo jogador.
    projectiles.forEach((projectile) => {
      projectile.draw(ctx, gridSize);
    });

    //desenha a bandeirola no cenário.
    flag01.draw(ctx);

    //desenha cada uma das árvores do background.
    trees.forEach((tree) => { 
      tree.draw();
    });

    //desenha os NPCs (personagens não jogáveis) no cenário.
    npcs.forEach((npc) => { 
      npc.draw();
    });

    //desenha o player por último para que ele fique na frente de todos os outros elementos do cenário.
    player.draw();

    treesForeground.forEach((tree) => { //desenha cada uma das árvores que ficam na frente do cenário.
      tree.draw();
    });
  }

  //função para atualizar o estado do jogo, como a posição do player, inimigos, projéteis e verificar colisões.
  function update(currentTime) {
    //verifica se o player colidiu com algum item coletável (moeda).
    itens.forEach((moeda) => {
      if (player.isCollisionPlayer(moeda)) {
        //toca o efeito sonoro de coleta de moeda.
        playEfeitos(efeitos.coin);

        // aqui estamos atualizando o score do jogador, criando um novo objeto com as mesmas propriedades 
        // do currentPlayer e atualizando apenas a propriedade score, somando 1 ponto para cada moeda coletada.
        currentPlayer = { ...currentPlayer, score: currentPlayer.score + 1 };

        // removemos a moeda do cenário, filtrando o array de itens para criar um novo array que inclui 
        // apenas os itens que não são a moeda coletada. Dessa forma, a moeda coletada é removida do array e não será mais desenhada no canvas.
        itens = itens.filter((item) => item != moeda); //remove o item do array.
      }
    });

    // Atualiza cada inimigo
    enemies.forEach((enemy) => {
      enemy.update();
      
      // Verifica colisão com os projeteis no inimigo.
      projectiles.forEach((projectile) => {
        if (enemy.isCollision(projectile)) {
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
      if (player.isCollisionPlayer(enemy)) {
        getHit(); //função que reduz o HP e dispara o efeito sonoro.
        enemy.x = Math.random() * 10; //reinicia a posição do inimigo para um local aleatório no eixo X.
        enemy.y = 1; //reinicia a posição do inimigo de cima para baixo no eixo Y.
      }
    });

    // atualiza o array de projéteis, removendo os que estão fora da tela
    projectiles.forEach((projectile, index) => {
      projectile.update(gridSize);
      if (projectile.markedForDeletion) {
        projectiles.splice(index, 1); // Remove o projétil do array
      }
    });

    //atualiza a posição das nuvens.
    nuvens.forEach((cloud) => {
      cloud.update(currentTime);
    });

    //atualiza os NPCs (personagens não jogáveis) do cenário.
    npcs.forEach((npc) => { 
      npc.update(currentTime, gravity, speed, floors);
    });

    //atualiza as informações relativas ao player.
    player.update(
      currentTime, //essa variável vem do requestAnimationFrame() e nos repassamos ela para o update.
      gravity, // força da gravidade.
      speed, // velocidade do personagem.
      floors, // plataformas.
      tileCount, // quantidade de tiles no canvas.
      gridSize, // tamanho do grid.
      linhas, // quantidade de linhas do canvas.
    );    
  }

  // Função para lidar com o dano ao jogador.
  function getHit() {
    player.hp = player.hp - damage;
    playEfeitos(efeitos.hit, 0.1);
  }

  // Função para atualizar o console de informações do jogador.
  function setLogInf() {
    //pega o elemento HTML onde as informações do jogador serão exibidas.
    const logStatus = document.getElementById("logStatus");

    //atualiza o conteúdo do elemento com as informações do jogador atual, como nome, score e HP.
    logStatus.innerHTML = `
      Player: ${currentPlayer.name}<br/>
      Chacacter: ${currentPlayer.character[0]?.toUpperCase() + currentPlayer.character.slice(1)}<br/>
      Score: ${currentPlayer.score || 0}<br/>
      HP: ${player.hp}<br/>
    `;
  }

  // Função para disparar um projétil
  function shoot() {
    // Adiciona um projétil a partir do centro do jogador
    projectiles.push(
      new Projectile(player.x + 0.5, player.y + 0.5, player.direction, canvas),
    );

    // Toca o efeito sonoro de disparo
    playEfeitos(efeitos.shoot);
  }

  //verifica se o player perdeu o jogo.
  function gameover() {
    //se o HP do player for menor ou igual a 0, significa que ele perdeu o jogo.
    if (player.hp <= 0) {
      showGameScreen("Game Over"); //exibe a tela de game over.
      playEfeitos(efeitos.gameOver); //toca o efeito sonoro de game over.

      //limpa e esconde o canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";

      // exibe o modal de seleção de personagem.
      const modal = document.getElementById("boxSelector");
      modal.classList.remove("hiddenModal"); //remove a classe que esconde o modal, tornando-o visível para o jogador.

      //muda o estado para gameover para parar o loop.
      isGameover = true;

      //atualiza a lista de playes do quadro de records.
      setNamePlayer();
    }
  }

  function winner() {
    //verifica se o player chegou na bandeira (endpoint) para vencer a fase. A condição de vitória é que o player esteja dentro da área da bandeira (flag01) e esteja no chão (yVelocity >= 0).
    const chegou =
      flag01.x <= player.x &&
      flag01.x + flag01.width >= player.x &&
      flag01.y === player.y;
    
    if (chegou && player.yVelocity >= 0) {//se o player chegou na bandeira e está no chão, ele vence a fase.
      playEfeitos(efeitos.winner); //toca o efeito sonoro de vitória.

      //atualiza o score do jogador, somando 10 pontos para a vitória.
      showGameScreen("Parabéns, você completou a fase!");

      //limpa e esconde o canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";

      const modal = document.getElementById("boxSelector");
      modal.classList.remove("hiddenModal");

      //muda o estado para gameover para parar o loop.
      isGameover = true;

      //atualiza a lista de playes do quadro de records.
      setNamePlayer();
    }
  }

  // Função para mostrar a tela de game over.
  function showGameScreen(title = "") {
    gameScreenTitle.textContent = title; //atualiza o título da tela de game screen com o título fornecido.
    finalScoreDisplay.textContent = currentPlayer.score; //atualiza o display de score final com a pontuação do jogador atual.
    gameScreen.style.display = "flex"; //altera o estilo de exibição da tela de game screen para "flex", tornando-a visível na tela. A tela de game over deve estar configurada com display: none no CSS para que ela fique oculta inicialmente e só seja exibida quando essa função for chamada.
  }

  // Função para esconder a tela de game screen.
  function hideGameScreen() {
    gameScreen.style.display = "none"; //altera o estilo de exibição da tela de game over para "none", tornando-a invisível na tela.
  }

  // ao final do jogo adiciona o currentPlayer a lista de player ao final da partida.
  function setNamePlayer() {
    //verifica se o jogador atual já existe na lista de jogadores (namesPlayers) comparando o nome do jogador atual com os nomes dos jogadores na lista. Se encontrar um jogador com o mesmo nome, a variável verify receberá esse jogador, caso contrário, receberá undefined.
    const verify = namesPlayers.find((item) => item.name === currentPlayer.name);

    if (!verify) {
      // se o jogador não existir na lista, adiciona o jogador atual à lista de jogadores (namesPlayers) usando o método push. O objeto do jogador é criado com as mesmas propriedades do currentPlayer, mas a propriedade character é formatada para ter a primeira letra maiúscula e o restante em minúscula.
      namesPlayers.push({
        ...currentPlayer,
        character:
          currentPlayer.character[0]?.toUpperCase() +
          currentPlayer.character.slice(1),
      });
    } else { // se o jogador já existir na lista, atualiza as informações do jogador existente na lista (namesPlayers) usando o método map para criar um novo array. Para cada item na lista de jogadores, verifica se o nome do item é igual ao nome do jogador atual. Se for igual, retorna um novo objeto com as mesmas propriedades do currentPlayer, mas com a propriedade character formatada para ter a primeira letra maiúscula e o restante em minúscula. Se não for igual, retorna o item original sem alterações.
      namesPlayers = namesPlayers.map((item) => {
        if (item.name === currentPlayer.name) {
          return {
            ...currentPlayer,
            character:
              currentPlayer.character[0]?.toUpperCase() +
              currentPlayer.character.slice(1),
          };
        } else {
          return item;
        }
      });
    }

    //limpa a variável currentPlayer para preparar para uma nova partida, atribuindo um objeto vazio com as mesmas propriedades (name, score e character) mas sem valores. Isso é importante para garantir que as informações do jogador atual sejam resetadas e não interfiram em futuras partidas.
    currentPlayer = { name: "", score: "" }; //limpa a variável.
    setCharacter(""); //limpa a variável character.

    //atualiza a lista de playes do quadro de records.
    renderPlayersList();
  }

  // ao final do jogo pega a lista de players e renderiza (escreve) na tela.
  function renderPlayersList() {
    // Obtém a referência ao elemento <ul>
    const playersList = document.getElementById("listPlayers");

    // Itera sobre a lista de jogadores e cria os <li>
    namesPlayers
      .sort((a, b) => a.score < b.score) //ordena a lista de jogadores com base no score, do maior para o menor.
      .forEach((player) => {
        const li = document.createElement("li");
        li.textContent = `${player.name} - Score: ${player.score} - Char: ${player.character}`;
        playersList.appendChild(li);
      });
  }

  function loop(currentTime) {
    if (isGameover) return; //se deu game over para o loop.

    //limpa o canvas a cada frame para redesenhar o jogo.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //atualiza a posição dos inimigos e verifica colisões.
    update(currentTime);

    //desenha o cenário, player, inimigos e itens.
    draw();

    //verifica se o player perdeu o jogo.
    gameover();

    //verifica se o player chegou no endpoint.
    winner();    

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

    //se teclarmos enter estamos estamos chamando o shoot() que diz ao personagem para disparar uma bolinha.
    if (press === "Enter") {
      shoot();
    }

    // se pressionarmos a Tecla space vamos dizer ao personagem para dar um salto (jump).
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

  //adiciona um listener para o evento de clique no canvas, que chama a função shoot() para disparar um projétil quando o jogador clica na tela.
  canvas.addEventListener("click", function (e) {
    shoot();
  });

  playAgainButton.addEventListener("click", () => {
    // Esconde a tela de game over quando o jogador clica no botão de jogar novamente,
    // permitindo que uma nova partida comece.
    hideGameScreen();
  });
}
