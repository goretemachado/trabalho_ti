let video;
let poseNet;
let pose;

let skeleton;
let pontuation; // Talvez isso deveria ser 'pontuation' (pontuação)?
let score = 0; // Pontuação inicial do jogador

let cow;
let pig;
let ram;
let turkey;

function preload(){
    // Carrega as imagens dos animais
    cow = loadImage("media/cow.png");
    pig = loadImage("media/pig.png");
    ram = loadImage("media/ram.png");
    turkey = loadImage("media/turkey.png");
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
}

function draw () {

    // Desenha o vídeo da webcam no canvas
    image (video, 0, 0);

    if (pose) {
        // Desenha círculos nas posições dos pulsos direito e esquerdo
        fill (0, 0, 255);
        noStroke();
        ellipse (pose.rightWrist.x, pose.rightWrist.y, 70);
        ellipse (pose.leftWrist.x, pose.leftWrist.y, 70);
    }

    // Exibe a pontuação na tela
    textSize(32);
    fill(0);
    text('Pontuação: ', 10, 30);
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