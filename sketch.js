// Variáveis globais para armazenar o vídeo da webcam, o modelo PoseNet e a pose detectada
let video;
let poseNet;
let pose;

// Variáveis para armazenar o esqueleto da pose e a pontuação do jogador
let score = 0; // Pontuação inicial do jogador

// Variável para armazenar a imagem da quinta
let farmImage;

// Variáveis para armazenar as imagens dos animais
let cow;
let pig;
let ram;
let turkey;
let chick;
let duck;
let hen;
let sheep;

let animals = []; // Inicializa o array de animais

function preload(){

    // Carrega a imagem da fazenda
    farmImage = loadImage("media/smart-farm.png");

    // Carrega as imagens dos animais
    cow = loadImage("media/cow.png");
    pig = loadImage("media/pig.png");
    ram = loadImage("media/ram.png");
    turkey = loadImage("media/turkey.png");
    chick = loadImage("media/chick.png");
    duck = loadImage("media/duck.png");
    hen = loadImage("media/hen.png");
    sheep = loadImage("media/sheep.png");
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

    // Redimensiona a imagem da fazenda para 100x100 pixels
    farmImage.resize(100, 100);

    // Adiciona os animais ao array de animais
    for (let i = 0; i < 5; i++) { // Adiciona 5 animais, você pode ajustar esse número conforme necessário
        let randomIndex = int(random(0, 8)); // Escolhe um índice aleatório de 0 a 7
        let animal;
        switch (randomIndex) { // Seleciona uma imagem de animal com base no índice aleatório
            case 0:
                animal = cow;
                break;
            case 1:
                animal = pig;
                break;
            case 2:
                animal = ram;
                break;
            case 3:
                animal = turkey;
                break;
            case 4:
                animal = chick;
                break;
            case 5:
                animal = duck;
                break;
            case 6:
                animal = hen;
                break;
            case 7:
                animal = sheep;
                break;
        }

        // Ajusta a posição aleatória para garantir que o animal fique dentro dos limites do canvas
        let x = random(width - animal.width); // Posição x aleatória dentro dos limites do canvas
        let y = random(height - animal.height); // Posição y aleatória dentro dos limites do canvas
        
        // Verifica se a posição do animal colide com a área da pontuação
        let padding = 60; // Espaço de preenchimento ao redor da pontuação
        if (x < padding && x + animal.width > width - padding && y < padding && y + animal.height > height - padding) {
            // Se a posição colidir com a área da pontuação, reposiciona o animal
            x = random(padding, width - animal.width - padding);
            y = random(padding, height - animal.height - padding);
        }

        let animalObj = {
            image: animal,
            x: x,
            y: y
        };
        animals.push(animalObj);
    }
}

function draw () {

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
        // Desenha círculos nas posições dos pulsos direito e esquerdo
        fill (0, 0, 255);
        noStroke();

        // Ajusta as coordenadas dos pulsos para refletir a espelhação horizontal
        let adjustedRightWristX = width - pose.rightWrist.x;
        let adjustedLeftWristX = width - pose.leftWrist.x;

        // Desenha as bolas nos pulsos ajustadas
        ellipse (adjustedRightWristX, pose.rightWrist.y, 70);
        ellipse (adjustedLeftWristX, pose.leftWrist.y, 70);
    }
    
    /* Desenha um retângulo atrás do texto para destacá-lo*/
    let textSizeVal = 25; // Tamanho do texto
    textSize(textSizeVal); // Define o tamanho do texto
    let textWidthVal = textWidth('Pontuação: ' + score); // Calcula a largura do texto
    fill(255); // Define a cor de preenchimento para o retângulo
    rect(10, 10, textWidthVal + 20, textSizeVal + 10); // Desenha o retângulo
    fill(0); // Define a cor de preenchimento para o texto
    text('Pontuação: ' + score, 20, 40); // Desenha o texto

    // Desenha a imagem da fazenda no canto inferior direito do canvas
    image(farmImage, width - farmImage.width, height - farmImage.height);

    // Desenha os animais na tela
    for (let i = 0; i < animals.length; i++) {
        let animal = animals[i];
        console.log("Desenhando animal", i, "em x:", animal.x, "y:", animal.y);
        console.log("Imagem do animal:", animal.image);
        image(animal.image, animal.x, animal.y);
    }

    checkCollisions();

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
                let collisionDistance = 35; // Ajuste conforme necessário

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