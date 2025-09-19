let character= "";
let speed = 3;
let audioPlayer= null;
let audioEfeitos = null;
let currentPlayer = {name: '', score: 0, character: ''};
let namesPlayers = [];

const efeitos = {
    screenInicial: "./src/audios/trilhaSonora/Juhani Junkala [Retro Game Music Pack] Title Screen.wav",
    jump: "./src/audios/efeitos/drop_004.ogg",
    colision: "./src/audios/efeitos/impactWood_medium_001.ogg",
    hit: "./src/audios/efeitos/jingles_NES09.ogg",
    gameOver: "./src/audios/efeitos/gameOver.ogg",
    click: "./src/audios/efeitos/tick_002.ogg",
    ok: "./src/audios/efeitos/confirmation_002.ogg",
    shoot: ".src/audios/efeitos/select_002.ogg",
    winner: "./src/audios/efeitos/BossIntro.wav",
    coin: "./src/audios/efeitos/somcoin.mp3"
};

document.addEventListener("DOMContentLoaded", ()=>{
    // Acessa o elemento <audio>
    audioPlayer = document.getElementById('AudioPlayer');
    audioEfeitos = document.getElementById('efeitos');

    // Controlar o volume (0.0 a 1.0)
    changeAudioSource(
        efeitos.screenInicial,
        true
    )
})

function Select(id){
    const img1 = document.getElementById('maria');
    const img2 = document.getElementById("leo");

    playEfeitos(efeitos.click);

    if(id === 'maria'){
        img1.classList.toggle("selected");
        img2.classList.remove("selected");
    }else{
        img2.classList.toggle("selected");
        img1.classList.remove("selected");
    }

    //atribui o valor correspondente ao personagem selecionado ou remove a seleção.
    setCharacter(id)
}

function setCharacter(value){
    if(character === value){
        character= "";
    }else{
        character = value;
    }
    document.getElementById('nameCharacter').textContent = value ? "Você selecionou " + value[0].toUpperCase() + value.slice(1) : "";
}


const inputElement = document.getElementById("namePlayer");
function handleNamePlayer(){
    currentPlayer = {
        id: namesPlayers.length + 1,
        name: inputElement.value,
        score: 0,
        character: character
    }
}
inputElement.addEventListener('input',()=>{
    handleNamePlayer();
});


function Start(){
    const modal = document.getElementById("boxSelector");
    inputElement.value= ''; //limpa o valor do input.

    if(character && currentPlayer.name !== ""){
        modal.classList.add("hiddenModal");
        playEfeitos(efeitos.ok)
        Game();
    }else{
        alert("Falta selecionar um personagem ou fornecer seu nome de player!");
    }
    
}

//adiciona o currentPlayer a lista de player ao final da partida.
function setNamePlayer(){
    const verify = namesPlayers.find(item=> item.name === currentPlayer.name);

    if(!verify){
        namesPlayers.push({
            ...currentPlayer,
            character: currentPlayer.character[0].toUpperCase() + currentPlayer.character.slice(1)
        })
    }else{
        namesPlayers = namesPlayers.map(item=> {
            if(item.name === currentPlayer.name){
                return {
                    ...currentPlayer,
                    character: currentPlayer.character[0].toUpperCase() + currentPlayer.character.slice(1)
                }
            }else{
                return item
            }
        })
    }
    currentPlayer= {name: "", score: ""} //limpa a variável.
    setCharacter(""); //limpa a variável.

    //atualiza a lista de playes do quadro de records.
    renderPlayersList();
}

function renderPlayersList() {
    // Obtém a referência ao elemento <ul>
    const playersList = document.getElementById("listPlayers");

    // Limpa a lista antes de renderizar (se necessário)
    playersList.innerHTML = "";

    // Itera sobre a lista de jogadores e cria os <li>
    namesPlayers.sort((a, b) => a.score < b.score).forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name} - Score: ${player.score} - Char: ${player.character}`;
        playersList.appendChild(li);
    });
}

// Mudar a trilha sonora
function changeAudioSource(newSource, loop=false) {
    audioPlayer.src = newSource;
    audioPlayer.play(); // Inicia a reprodução automaticamente após a troca de trilha
    audioPlayer.volume = 0.2; // 50% de volume
    audioPlayer.loop = loop
}

// Para tocar o som de pulo
function playEfeitos(newSource, volume=0.2) {
    audioEfeitos.currentTime = 0; // Recomeça o som caso esteja tocando
    audioEfeitos.src = newSource;
    audioPlayer.volume = volume;
    audioEfeitos.play();
}

// Classe para representar o player
class Player {
    constructor(character, initialX, initialY, type="NPC" || "Player", showHitBox) {
        this.character = character;
        this.hp = 100;
        this.x = initialX;
        this.y = initialY;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.showHitBox = showHitBox;
        this.isJump = false;
        this.isOnFloor = false;
        this.direction = false; // false para direita, true para esquerda
        this.currentFrame = 0;
        this.animationFrame = 0;
        this.width = 64;
        this.height = 64;
        this.gameOver = false;
        this.lastTime = 0;

        // Carregar os sprites
        this.sprites = type === "Player" ? {
            idle: [new Image(), new Image(), new Image()],
            walk_left: [new Image(), new Image(), new Image()],
            walk_right: [new Image(), new Image(), new Image()],
            jump: [new Image(), new Image(), new Image()]
        } : {idle: [new Image(), new Image(), new Image()]};
        
        // Verificar se as imagens estão carregadas
        let loadedImages = 0;
        const keysSprites = Object.keys(this.sprites);

        keysSprites.forEach((key)=>{
            const firstLetters = key.substring(0, 4); //separa as palavras iniciais usadas no nome da pasta da animação.
            
            this.sprites[key].forEach((img, idx)=>{
                img.src = `./src/assets/scoutPlat/${character}/${firstLetters}/${key}(${idx}).png`;
            });
        })

        keysSprites.forEach((key)=>{
            this.sprites[key].forEach(img => {
                img.onload = () => {
                    loadedImages++;
                    if (loadedImages === this.sprites.length) {
                        console.log('Imagens do player carregadas com sucesso');
                    }
                };
                img.onerror = () => {
                    console.error('Erro ao carregar imagem do player: ' + img.src);
                };
            });
        });
    }

    isOnfloorCheck(floor, gridSize){
        const playerBottom = (this.y * gridSize) + this.height; // Posição do "pé" do jogador
        const leftPlayer = this.x * gridSize;
        const rightPlayer = (this.x + 1) * gridSize;

        const ajusteRaioColision = this.width / 2;

        // Verifica se o jogador está colidindo com o chão
        const floorTop = floor.y * gridSize;
        const floorLeft = floor.x * floor.widht + ajusteRaioColision;
        const floorRight = (floor.x * gridSize) + floor.widht - ajusteRaioColision;

        // Verifica se o jogador está sobre o chão
        const isAboveFloor = playerBottom >= floorTop && playerBottom <= floorTop + floor.height;
        const isWithinHorizontalBounds = rightPlayer > floorLeft && leftPlayer < floorRight;

        return isAboveFloor && isWithinHorizontalBounds;
    }

    update(currentTime, gravity, speed, floors, tileCount, gridSize, linhas) {
        const deltaTime = (currentTime - this.lastTime) / 2000; // Convertendo para segundos
        this.lastTime = currentTime;

        // Atualiza a posição do jogador
        this.x += (this.xVelocity * speed) * deltaTime;
        this.y += (this.yVelocity * (speed/2)) * deltaTime;

        // Verifica se o jogador atingiu as bordas do canvas e ajusta sua posição
        if (this.x <= 0) {
            this.x = 0;
        } else if (this.x >= tileCount - 1) {
            this.x = tileCount - 1;
        }

        //verifica colisões com o chão e plataforma.
        this.isOnFloor = false;
        for (let index = 0; index < floors.length; index++) {
            const floor = floors[index];
            //verifica a colisão com a plataforma apenas quando está caindo.
            if(this.yVelocity >=0){      
                if (this.isOnfloorCheck(floor, gridSize)) {
                    this.y = floor.y - 1; // Ajusta a posição do jogador para ficar exatamente sobre o chão
                    this.yVelocity = 0; // Reseta a velocidade vertical
                    this.isJump = false; // Permite pular novamente
                    this.isOnFloor = true;
                    break;
                }
            }
        }

        if(!this.isOnFloor) { // Se não estiver sobre o uma plataforma, o jogador está caindo/pulando
            this.isJump = true;
            this.yVelocity += gravity * deltaTime;
        }

        //detecta quando o player está no chão.
        if(this.y >= linhas-2){
            this.yVelocity = 0;
            this.isJump= false;
            this.isOnFloor = true;
        }
    }

    draw(ctx, gridSize) {
        let spriteArray;

        if (this.isJump) {
            spriteArray = this.sprites.jump;
        } else if (this.xVelocity === 0) {
            spriteArray = this.sprites.idle;
        } else if (this.xVelocity < 0) {
            spriteArray = this.sprites.walk_left;
        } else {
            spriteArray = this.sprites.walk_right;
        }

        //desenha o HP
        ctx.fillStyle = 'grey'; 
        ctx.fillRect(10, 10, 100, 20);

        ctx.fillStyle = 'red'; 
        ctx.fillRect(10, 10, this.hp, 20);

        ctx.save();

        if (this.direction && this.isJump) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                spriteArray[this.currentFrame],
                -(this.x * gridSize + this.width),
                this.y * gridSize,
                this.width,
                this.height
            );
        } else {
            ctx.drawImage(
                spriteArray[this.currentFrame],
                this.x * gridSize,
                this.y * gridSize,
                this.width,
                this.height
            );
        }

        ctx.restore();

        // Atualiza a animação
        if (this.isJump) {
            if (this.currentFrame < spriteArray.length - 1) {
                if (this.animationFrame % 1 === 0) { // Controle a velocidade da animação
                    this.currentFrame++;
                }
            }else if (!this.isJump) {
                // Se o salto terminou, resetar o frame para o início
                this.currentFrame = 0;
            }
        } else {
            if (this.animationFrame % 10 === 0) {
                this.currentFrame = (this.currentFrame + 1) % spriteArray.length;
            }
        }

        this.animationFrame++;
    }

    jump(jumpForce) {
        if (!this.isJump) {
            this.yVelocity = jumpForce;
            this.isJump = true;
        }
    }

    isCollisionPlayer(collide, gridSize, ctx) {
        if(collide === null)return;

        const toleranceX = this.width / 3;
        const toleranceY = this.height / 3;
        
        const playerX1 = (this.x * gridSize)  + toleranceX;
        const playerX2 = (this.x * gridSize) + this.width - toleranceX;
        const playerY1 = (this.y * gridSize) + toleranceY;
        const playerY2 = (this.y * gridSize) + this.height - toleranceY;
    
        // Desenha a hitbox no canvas
        if(this.showHitBox)
        this.drawHitBox(ctx, playerX1, playerY1, playerX2, playerY2);
    
        var colidiuX= false;
        var colidiuY= false;

        //verifica a colisão para cada pixel do objeto em X.
        for (let index = 0; index <= collide.width; index++) {
            const currentPixelX = (collide.x * gridSize) + index;

            if(currentPixelX >= playerX1 && currentPixelX <= playerX2){
                colidiuX = true;
                break;
            }
        }

        //verifica a colisão para cada pixel do objeto em Y.
        for (let index = 0; index <= collide.height; index++) {
            const currentPixelY = (collide.y * gridSize) + index;

            if(currentPixelY >= playerY1 && currentPixelY <= playerY2){
                colidiuY = true;
                break;
            }
        }

        return colidiuY && colidiuX;
    }

    // Função para desenhar o hitbox no canvas
    drawHitBox(ctx, x1, y1, x2, y2) {
       ctx.strokeStyle = 'green'; // Define a cor da borda
       ctx.lineWidth = 2;        // Define a espessura da borda
       ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); // Desenha o retângulo sem preenchimento
    }
}

// Classe para representar um inimigo
class Enemy {
    constructor(canvas, gridSize) {
        this.canvas = canvas;
        this.gridSize= gridSize;
        
        this.x = 1 + (Math.random() * ((canvas.width-gridSize) / gridSize));  // Posição inicial X aleatória
        this.y = Math.random() * 4; // Posição inicial Y aleatória
        
        this.speedX = (Math.random() + 0.2) / 13; // Velocidade X aleatória
        this.speedY = (Math.random() + 0.2)/ 13; // Velocidade Y aleatória
        
        this.currentFrame = 0;
        this.animationFrame = 0;
        
        this.width = 32;
        this.height = 32;

        this.sprites = {
            bola: [
                new Image(),
                new Image(),
                new Image(),
                new Image()
            ]
        };

        // Carregar as imagens
        for (let i = 0; i < this.sprites.bola.length; i++) {
            this.sprites.bola[i].src = `./src/assets/scoutPlat/bola/bola(${i}).png`;
        }
        
        // Verificar se as imagens estão carregadas
        let loadedImages = 0;
        this.sprites.bola.forEach(img => {
            img.onload = () => {
                loadedImages++;
                if (loadedImages === this.sprites.bola.length) {
                    console.log('Imagens dos inimigos carregadas com sucesso');
                }
            };
            img.onerror = () => {
                console.error('Erro ao carregar imagem: ' + img.src);
            };
        });
    }

    // Atualiza a posição do inimigo
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Verifica se o inimigo saiu da tela e reinicia a posição
        if (this.x < 0 || (this.x * this.gridSize) > this.canvas.width - this.width) {
            this.speedX *= -1;
            //this.speedY *= -1;
        }
        if (this.y < 0 || (this.y * this.gridSize) > (this.canvas.height - this.gridSize) - this.height) {
            this.speedY *= -1;
            //this.speedX *= -1;
        }
    }

    // Desenha o inimigo no canvas
    draw(ctx) {
        ctx.drawImage(
            this.sprites.bola[this.currentFrame], 
            this.x * this.gridSize, this.y * this.gridSize, 
            this.width, this.height
        );

        if (this.animationFrame % 10 === 0) { // Altere 10 para ajustar a velocidade da animação
            this.currentFrame = (this.currentFrame + 1) % this.sprites.bola.length;
        }
        this.animationFrame++;
    }

    isCollision(collide, gridSize, ctx) {
        if(collide === null)return;

        const toleranceX = this.width / 3;
        const toleranceY = this.height / 3;
        
        const playerX1 = (this.x * gridSize)  + toleranceX;
        const playerX2 = (this.x * gridSize) + this.width - toleranceX;
        const playerY1 = (this.y * gridSize) + toleranceY;
        const playerY2 = (this.y * gridSize) + this.height - toleranceY;
    
        // Desenha a hitbox no canvas
        if(this.showHitBox)
        this.drawHitBox(ctx, playerX1, playerY1, playerX2, playerY2);
    
        var colidiuX= false;
        var colidiuY= false;

        //verifica a colisão para cada pixel do objeto em X.
        for (let index = 0; index <= collide.width; index++) {
            const currentPixelX = (collide.x * gridSize) + index;

            if(currentPixelX >= playerX1 && currentPixelX <= playerX2){
                colidiuX = true;
                break;
            }
        }

        //verifica a colisão para cada pixel do objeto em Y.
        for (let index = 0; index <= collide.height; index++) {
            const currentPixelY = (collide.y * gridSize) + index;

            if(currentPixelY >= playerY1 && currentPixelY <= playerY2){
                colidiuY = true;
                break;
            }
        }

        return colidiuY && colidiuX;
    }
}   

// Classe para representar um projétil
class Projectile{
    constructor(x, y, direction, canvas) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.projectileSpeed= 0.1;
        this.direction = direction; // false para direita, true para esquerda
        this.markedForDeletion = false; // Marca o projétil para remoção quando sair da tela
        this.width = 20;
        this.height = 20;

        this.currentFrame = 0;
        this.animationFrame = 0;
        this.lastTime = 0;
        this.sprites = [new Image(), new Image(), new Image()];
        for (let index = 0; index < this.sprites.length; index++) {
            this.sprites[index].src = `./src/assets/scoutPlat/bola-tenis/bolatenis(${index}).png`;
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
        if (this.x < 0 || (this.x * gridSize) > this.canvas.width || this.y < 0 || (this.y * gridSize) > this.canvas.height) {
            this.markedForDeletion = true;
        }
    }

    // Desenha o projétil no canvas
    draw(ctx, gridSize) {
        ctx.drawImage(
            this.sprites[this.currentFrame], 
            this.x * gridSize, this.y * gridSize, 
            this.width, this.height
        );

        if (this.animationFrame % 5 === 0) { // Altere 10 para ajustar a velocidade da animação
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
        }
        this.animationFrame++;
    }
}

//classe da nuvem
class Cloud {
    constructor(x, y, width, height, speed){
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
            this.sprites[index].src = `./src/assets/scoutPlat/clouds/cloud(${index}).png`;
        }
    }

    update(currentTime, canvas, tileCount){
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convertendo para segundos
        this.lastTime = currentTime;
        this.x -= this.speed * deltaTime;
        
        // Se a nuvem sair da tela, marque-o para reiniciar
        if (this.x < 0 || this.x > canvas.width) {
            this.x = tileCount + 1;
        }
    }

    draw(ctx, gridSize){
        ctx.drawImage(
            this.sprites[this.currentFrame],
            this.x * gridSize, this.y * gridSize, 
            this.width, this.height
        );

        if (this.animationFrame % 20 === 0) { // Altere 10 para ajustar a velocidade da animação
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
        }
        this.animationFrame++;
    }
}

//classe da nuvem
class Flag {
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.currentFrame = 0;
        this.animationFrame = 0;
        this.lastTime = 0;
        this.sprites = [new Image(), new Image(), new Image()];
        for (let index = 0; index < this.sprites.length; index++) {
            this.sprites[index].src = `./src/assets/scoutPlat/flags/flags1(${index}).png`;
        }
    }

    draw(ctx, gridSize){
        ctx.drawImage(
            this.sprites[this.currentFrame], 
            this.x * gridSize, this.y * gridSize, 
            this.width, this.height
        );

        if (this.animationFrame % 20 === 0) { // Altere 10 para ajustar a velocidade da animação
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
        }
        this.animationFrame++;
    }
}

//classe da árvore
class Tree {
    constructor(x, y, width, height){
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

    draw(ctx, gridSize){
        ctx.drawImage(
            this.sprites[this.currentFrame], 
            this.x * gridSize, this.y * gridSize, 
            this.width, this.height
        );

        if (this.animationFrame % 20 === 0) { // Altere 10 para ajustar a velocidade da animação
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
        }
        this.animationFrame++;
    }
}

class Item {
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.currentFrame = 0;
        this.animationFrame = 0;
        this.width = width;
        this.height = height;
        this.lastTime = 0;
        this.sprites = [new Image(), new Image(), new Image(), new Image(), new Image()];
        for (let index = 0; index < this.sprites.length; index++) {
            this.sprites[index].src = `./src/assets/scoutPlat/coin/coin(${index}).png`;
        }
    }
    draw(ctx, gridSize){
        ctx.drawImage(
            this.sprites[this.currentFrame], 
            this.x * gridSize, 
            this.y * gridSize, 
            this.width, this.height
        );

        if (this.animationFrame % 10 === 0) { // Altere 10 para ajustar a velocidade da animação
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
        }
        this.animationFrame++;
    }
}

function Game(){
    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');    
    const gridSize = 64;
    const tileCount = canvas.width / gridSize;
    const linhas = canvas.height / gridSize;
    
    let isGameover = false;
    
    let jumpForce = -4.5;
    let gravity = 15;
    const damage = 3;
    
    let player = new Player(character, 2, 8, 'Player', false);
    let npcBP = new Player("bp", 8, 8, 'NPC');
    
    const nuvens = [
        new Cloud(14, 0.1, gridSize, gridSize, 0.5),
        new Cloud(15, 0.5, gridSize, gridSize, 0.3),
        new Cloud(15, 0.1, gridSize, gridSize, 0.4),
    ];

    //objeto da bandeira
    const flag01 = new Flag(7, 0, gridSize, gridSize);

    //arvores
    const trees = [
        new Tree(2, 7.8, gridSize+10, gridSize+20),
    ];
    const treesForeground = [
        new Tree(9, 7.2, gridSize+10, gridSize*2)
    ];
    var itens = [
        new Item(5, 6.5, 32, 32),
        new Item(8, 3.5, 32, 32),
        new Item(1, 4.5, 32, 32),
        new Item(10, 6.5, 32, 32),
        new Item(12, 1.5, 32, 32),
        new Item(13.5, 4.5, 32, 32)
    ];

    //criação dos inimigos
    const enemies = [];
    const numEnemies = 10; // Quantidade de inimigos
    
    // Criação do array de projéteis
    const projectiles = [];

    //criação do chão e plataformas iniciais
    const floors = [
        {x: 7, y: 1, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 4, y: 8, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 5, y: 7, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 6, y: 6, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 7, y: 5, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 3, y: 7, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 3, y: 6, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 1, y: 6, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 1, y: 5, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 4, y: 5, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 9, y: 8, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 10, y: 7, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 11, y: 7, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 8, y: 4, widht: gridSize, height: gridSize/2, color: "yellow", borderColor: 'black'},
        {x: 10, y: 3, widht: gridSize, height: gridSize/2, color: "yellow", borderColor: 'black'},
        {x: 12, y: 2, widht: gridSize, height: gridSize/2, color: "yellow", borderColor: 'black'},
        {x: 10, y: 2, widht: gridSize, height: gridSize/2, color: "yellow", borderColor: 'black'},
        {x: 8, y: 2, widht: gridSize, height: gridSize/2, color: "yellow", borderColor: 'black'},
        {x: 13, y: 5, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
        {x: 12, y: 6, widht: gridSize, height: gridSize/2, color: "brown", borderColor: 'black'},
    ];

    //chão
    for (let index = 0; index < tileCount; index++) {
        floors.push({x: index, y: linhas-1, widht: gridSize, height: gridSize, color: "green"})
    }
    
    function drawFloor({x, y, widht, height, color, borderColor=''}) {
        if(borderColor){
            ctx.fillStyle = borderColor;
            ctx.strokeRect(x*gridSize, y*gridSize, widht, height);
        }

        ctx.fillStyle = color; 
        ctx.fillRect(x*gridSize, y*gridSize, widht, height);
    }

    function drawBackground (x, y, widht, height, color){
        ctx.fillStyle = color; 
        ctx.fillRect(x*gridSize, y*gridSize, widht, height);
    }

    function drawGrounds() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground(0, 8.5, canvas.width, gridSize/2, 'green');

        for(const floor of floors){
            drawFloor(floor);
        }      
        
        npcBP.draw(ctx, gridSize);
        flag01.draw(ctx, gridSize);
        
        trees.forEach((tree)=>{
            tree.draw(ctx, gridSize);
        });
    }

    function drawForegrounds(){
        treesForeground.forEach((tree)=>{
            tree.draw(ctx, gridSize);
        });
    }

    function gameover(){
        if(player.hp === 0){
            playEfeitos(efeitos.gameOver);
            alert("Gameover!");
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            
            const modal = document.getElementById("boxSelector");
            modal.classList.remove("hiddenModal");
            isGameover= true;

            //atualiza a lista de playes do quadro de records.
            setNamePlayer();
        }
    }

    function winner(){
        const chegou = flag01.x <= player.x && flag01.x+flag01.width >= player.x && flag01.y === player.y;
        if(chegou && player.yVelocity >= 0){
            playEfeitos(efeitos.winner);            

            alert("Parabéns! Você completou a fase!");
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            
            const modal = document.getElementById("boxSelector");
            modal.classList.remove("hiddenModal");
            isGameover= true;
            //atualiza a lista de playes do quadro de records.
            setNamePlayer();
        }
    }

    // Função para disparar um projétil
    function shoot() {
        // Adiciona um projétil a partir do centro do jogador
        projectiles.push(new Projectile(
            player.x + 0.5,
            player.y + 0.5,
            player.direction,
            canvas
        ));
        playEfeitos(efeitos.shoot)
    }

    // Cria inimigos iniciais
    for (let i = 0; i < numEnemies; i++) {
        enemies.push(new Enemy(canvas, gridSize));
    }

    function Console(){
        const logStatus = document.getElementById("logStatus");

        logStatus.innerHTML= `
            Player: ${currentPlayer.name}<br/>
            Score: ${currentPlayer.score || 0}<br/>
            HP: ${player.hp}<br/>
        `;       
    }

    function loop(currentTime) {
        if(isGameover) return;

        drawGrounds();            

        player.update(currentTime, gravity, speed, floors, tileCount, gridSize, linhas);
        player.draw(ctx, gridSize);
        
        itens.forEach((i)=> {
            if(player.isCollisionPlayer(i, gridSize, ctx)){
                //se colidiu não desenha o item na tela e remove ele do array.
                playEfeitos(efeitos.coin);
                currentPlayer = {...currentPlayer, score: currentPlayer.score + 1};
                itens = itens.filter((item)=> item != i) //remove o item do array.
            }else{
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
            projectiles.forEach(projectile => {
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
            if(player.isCollisionPlayer(enemy, gridSize, ctx)){
                player.hp = player.hp - damage;
                enemy.x = Math.random() * 10;
                enemy.y= 1;
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

    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT')return;

        e.preventDefault();
        const press = e.code;
        if(press === 'KeyA') {
            player.xVelocity = -1;
            player.direction = true;
        }else if(press === 'KeyD'){
            player.xVelocity = 1;
            player.direction = false;
        }

        if(press === 'Enter'){
            shoot();
        }   
        if(press === 'Space'){
            player.jump(jumpForce);
        }
    });

    document.addEventListener('keyup', (e) => {
        e.preventDefault();
        const press = e.code;
        if(['KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'].includes(press)) {
            player.xVelocity = 0; // Corrigido: resetando a velocidade horizontal
        }
    });

    canvas.addEventListener("click", function (e) {
        shoot();
    });
}
