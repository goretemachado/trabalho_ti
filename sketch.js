// Variáveis globais para armazenar o vídeo da webcam, o modelo PoseNet e a pose detectada
let video;
let poseNet;
let pose;

let adjustedRightWristX = 0;
let adjustedLeftWristX = 0;

// Variáveis para armazenar o esqueleto da pose e a pontuação do jogador
let score = 0; // Pontuação inicial do jogador

// Variável para armazenar a imagem da quinta
let farmImage;

// Variáveis para armazenar as imagens dos animais
let cow, pig, ram, turkey, chick, duck, hen, sheep;

// Inicializa o array de animais
let animals = [];

let obstacle;
let obstacleX;
let obstacleY;
//let time = 10000;

let obstacleScale = 0.1; // Fator de escala inicial do obstáculo
let obstacleMaxScale = 1.0; // Fator de escala máximo do obstáculo

let gameOver = false; // Flag for game-over state

let keyword = "esa";
let speechRec;

function preload(){

    // Carrega a imagem da quinta
    farmImage = loadImage("media/smart-farm2.png");

    grass = loadImage("media/grass.png");

    // Carrega as imagens dos animais
    cow = loadImage("media/cow.png");
    pig = loadImage("media/pig.png");
    ram = loadImage("media/ram.png");
    turkey = loadImage("media/turkey.png");
    chick = loadImage("media/chick.png");
    duck = loadImage("media/duck.png");
    hen = loadImage("media/hen.png");
    sheep = loadImage("media/sheep.png");

    obstacle = loadImage("media/fire.png");
}

function setup(){

    // Cria um canvas com largura de 640 e altura de 480 pixels
    createCanvas(640,480);

    // Captura o vídeo da webcam
    video = createCapture(VIDEO);

    // Esconde o vídeo da webcam
    video.hide();

    // Inicializa o modelo PoseNet e chama a função modelReady quando estiver pronto
    poseNet = ml5.poseNet(video, modelReady);

    // Define uma função para ser chamada sempre que uma pose for detectada
    poseNet.on('pose', gotPoses);

    let lang = navigator.language || "pt-PT";
    speechRec = new p5.SpeechRec(lang, gotSpeech);
    let continuous = true;
    let interim = true;
    speechRec.start(continuous, interim);


    // Redimensiona a imagem da quinta para 100x100 pixels
    farmImage.resize(150, 150);

    populateAnimals();

    // Defina a posição inicial do obstáculo
    obstacleX = random(width/2);
    obstacleY = random(height/2);

}

function draw () {

    if (!gameOver) {
    // Limpa o fundo do canvas com a cor branca
    background(255);
    
    // Salva o estado atual do sistema de transformação
    push();

        // Move a origem para o canto superior direito do vídeo da webcam
        translate(video.width, 0);

        // Inverte a direção do vídeo horizontalmente
        scale(-1, 1);

        // Desenha o vídeo da webcam no canvas, agora espelhado horizontalmente
        image (video, 0, 0);

    // Restaura o estado anterior do sistema de transformação
    pop();

    // Se uma pose foi detectada
    if (pose) {
        // Define as novas posições suavizadas dos pulsos
        let targetRightWristX = width - pose.rightWrist.x;
        let targetLeftWristX = width - pose.leftWrist.x;

        // Suaviza as posições dos pulsos em direção às novas posições usando lerp
        adjustedRightWristX = lerp(adjustedRightWristX, targetRightWristX, 0.1);
        adjustedLeftWristX = lerp(adjustedLeftWristX, targetLeftWristX, 0.1);

        // Desenha os círculos suavizados nos pulsos
        fill(0, 0, 255);
        noStroke();
        ellipse(adjustedRightWristX, pose.rightWrist.y, 30);
        ellipse(adjustedLeftWristX, pose.leftWrist.y, 30);
    }
    
    /* Desenha um retângulo atrás do texto para destacá-lo*/
    let textSizeVal = 25; // Tamanho do texto
    textSize(textSizeVal); // Define o tamanho do texto
    let textWidthVal = textWidth('Pontuação: ' + score); // Calcula a largura do texto
    fill(255); // Define a cor de preenchimento para o retângulo
    rect(10, 10, textWidthVal + 20, textSizeVal + 10); // Desenha o retângulo
    fill(0); // Define a cor de preenchimento para o texto
    text('Pontuação: ' + score, 20, 40); // Desenha o texto

    image(grass, width - grass.width, height - grass.height);

    // Desenha a imagem da fazenda no canto inferior direito do canvas
    image(farmImage, width - farmImage.width, height - farmImage.height);

    // Desenha os animais na tela
    for (let i = 0; i < animals.length; i++) {
        let animal = animals[i];
        image(animal.image, animal.x, animal.y);

        // Move the animal
        animal.y += 0.2;

        // Check if the animal has left the screen
        if (animal.y > height) {
            animals.splice(i, 1); // Remove the animal from the array
            i--; // Decrement i to account for the shifted array elements
            console.log("Animal removed. New animals array length:", animals.length);
        }
    }

    checkCollisions();

    let obstacleWidth = obstacle.width * obstacleScale;
    let obstacleHeight = obstacle.height * obstacleScale;

    image(obstacle, obstacleX, obstacleY, obstacleWidth, obstacleHeight);

    if (obstacleScale < obstacleMaxScale) {
        obstacleScale += 0.0001; // Ajuste a velocidade de crescimento conforme necessário
    }

    checkObstacleCollision()

    if (animals.length === 0) {
        gameOver = true;
    }
    } else {
        background(0); // Black background or choose a different color
        fill(255); // White text
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Game Over!", width / 2, height / 2);
        drawRestartButton();
    }
}

function gotSpeech() {
    if (speechRec.resultValue) {
       let spokenWord = speechRec.resultString.toLowerCase();
       console.log(spokenWord); // Converte para minúsculas para facilitar a comparação
       if (spokenWord === keyword) {
         // Se a palavra-chave correspondente for falada, redefine a posição do obstáculo
         obstacleX = -10000; // Mova o obstáculo para fora da tela
         obstacleY = -10000;
       }
     }
}

function gotPoses (poses) {
    // -- console.log (poses);

    // Se detectar poses
    if ( poses.length > 0 ) {

        // Salva a primeira pose detectada
        pose = poses [0].pose;

        // Salva o esqueleto da primeira pose detectada
        skeleton = poses [0].skeleton;
    }
}

function modelReady () {
    // Quando o modelo PoseNet estiver pronto, exibe uma mensagem no console
    console.log ('poseNet ready');
}

function checkCollisions() {
    // Verifica se pose está definido
    if (pose) {
        // Verifica colisão entre os pulsos e os animais
        for (let i = 0; i < animals.length; i++) {
            let animal = animals[i];

            // Verifica se as propriedades rightWrist e leftWrist estão definidas
            if (pose.rightWrist && pose.leftWrist) {
                // Calcula a distância entre os pulsos e o centro do animal
                let distanceRight = dist(width - pose.rightWrist.x, pose.rightWrist.y, animal.x + animal.image.width / 2, animal.y + animal.image.height / 2);
                let distanceLeft = dist(width - pose.leftWrist.x, pose.leftWrist.y, animal.x + animal.image.width / 2, animal.y + animal.image.height / 2);

                // Define a distância de colisão
                let collisionDistance = 35;

                // Verifica se houve colisão com o pulso direito
                if (distanceRight < collisionDistance) {
                    // Se houver colisão, aumenta a pontuação e remove o animal do array
                    score++;
                    animals.splice(i, 1);
                    // Saia do loop para evitar colisões múltiplas em um único quadro
                    break;
                }

                // Verifica se houve colisão com o pulso esquerdo
                if (distanceLeft < collisionDistance) {
                    // Se houver colisão, aumenta a pontuação e remove o animal do array
                    score++;
                    animals.splice(i, 1);
                    // Saia do loop para evitar colisões múltiplas em um único quadro
                    break;
                }
            }
        }
    }
}

function checkObstacleCollision() {
    // Verifica se pose está definido
    if (pose) {
        // Verifica se as propriedades rightWrist e leftWrist estão definidas
        if (pose.rightWrist && pose.leftWrist) {
            // Calcula a distância entre os pulsos e o centro do obstáculo
            let distanceRight = dist(width - pose.rightWrist.x, pose.rightWrist.y, obstacleX + (obstacle.width * obstacleScale) / 2, obstacleY + (obstacle.height * obstacleScale) / 2);
            let distanceLeft = dist(width - pose.leftWrist.x, pose.leftWrist.y, obstacleX + (obstacle.width * obstacleScale) / 2, obstacleY + (obstacle.height * obstacleScale) / 2);

            // Define a distância de colisão
            let collisionDistance = 35;

            // Verifica se houve colisão com o pulso direito
            if (distanceRight < collisionDistance || distanceLeft < collisionDistance) {
                // Se houver colisão, diminui a pontuação
                score--;
                
                // Ajuste aqui para outras ações após a colisão, se necessário
                
                // Saia da função após detectar uma colisão para evitar colisões múltiplas em um único quadro
                return;
            }
        }
    }
}

function drawRestartButton() {
    // Draw a simple restart button
    fill(255, 0, 0); // Red button
    rect(width / 2 - 50, height / 2 + 50, 100, 40); // Adjust size and position as needed
    fill(255); // White text
    textSize(20);
    text("Restart", width / 2, height / 2 + 70);
}

// Add mousePressed function to handle button clicks
function mousePressed() {
    // Check if the mouse is within the restart button bounds
    if (gameOver && mouseX >= width / 2 - 50 && mouseX <= width / 2 + 50 && mouseY >= height / 2 + 50 && mouseY <= height / 2 + 90) {
        restartGame();
    }
}

function restartGame() {
    // Reset game state
    gameOver = false;
    score = 0; // Reset score
    obstacleScale = 0.1; // Reset obstacle scale
    // Reset obstacle position to a new random location
    obstacleX = random(width / 2);
    obstacleY = random(height / 2);

    // Re-populate animals array to restart the game with animals on the screen
    populateAnimals(); // Using a function to populate the animals makes the code more maintainable

    // Optionally, you can reset or reinitialize other components or states specific to your game
    // For example, if you had a timer or a specific game mode, you would reset it here
    // Note: There's no need to reset PoseNet itself as it continuously tracks poses in real-time
}

function populateAnimals() {
    animals = []; // Clear the array before populating
    for (let i = 0; i < 10; i++) {
        let randomIndex = int(random(0, 8)); // Assuming you have 8 different animal images
        let animalImage;
        switch (randomIndex) {
            case 0:
                animalImage = cow;
                break;
            case 1:
                animalImage = pig;
                break;
            case 2:
                animalImage = ram;
                break;
            case 3:
                animalImage = turkey;
                break;
            case 4:
                animalImage = chick;
                break;
            case 5:
                animalImage = duck;
                break;
            case 6:
                animalImage = hen;
                break;
            case 7:
                animalImage = sheep;
                break;
        }
        let x = random(width - animalImage.width); // Ensure animal is placed within canvas
        let y = random(height - animalImage.height);

        let animalObj = {
            image: animalImage,
            x: x,
            y: y
        };
        animals.push(animalObj);
    }
}