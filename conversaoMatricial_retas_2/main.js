const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const statusTexto = document.getElementById("status");
const corAtualTexto = document.getElementById("corAtual");

// --------------------------------------------------
// SHADERS
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = 2.0;
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;
out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}
`;

function createShader(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }

    return shader;
}

const program = gl.createProgram();

gl.attachShader(
    program,
    createShader(gl.VERTEX_SHADER, vertexShaderSource)
);

gl.attachShader(
    program,
    createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
);

gl.linkProgram(program);
gl.useProgram(program);

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const positionLocation = gl.getAttribLocation(
    program,
    "aPosition"
);

const colorLocation = gl.getUniformLocation(
    program,
    "uColor"
);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// CORES
// --------------------------------------------------

const cores = [
    [0.0, 0.0, 1.0], // 0 - azul
    [1.0, 0.0, 0.0], // 1 - vermelho
    [0.0, 1.0, 0.0], // 2 - verde
    [1.0, 1.0, 0.0], // 3 - amarelo
    [1.0, 0.0, 1.0], // 4 - magenta
    [0.0, 1.0, 1.0], // 5 - ciano
    [1.0, 1.0, 1.0], // 6 - branco
    [1.0, 0.5, 0.0], // 7 - laranja
    [1.0, 0.4, 0.7], // 8 - rosa
    [0.5, 0.0, 1.0]  // 9 - roxo
];

let corAtual = cores[0];
let vertices = [];

// Começa no modo de desenhar retas.
let modo = "reta";

// Guarda os cliques realizados.
let pontos = [];

// --------------------------------------------------
// CONVERTER COORDENADAS PARA WEBGL
// --------------------------------------------------

function paraWebGL(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        1 - (y / canvas.height) * 2
    ];
}

// --------------------------------------------------
// FUNÇÃO 1: DESENHAR RETA COM BRESENHAM
// --------------------------------------------------

function desenharReta(x0, y0, x1, y1, apagarAnterior = true) {
    // Apaga a figura anterior.
    if (apagarAnterior) {
        vertices = [];
    }

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    const passoX = x0 < x1 ? 1 : -1;
    const passoY = y0 < y1 ? 1 : -1;

    let erro = dx - dy;

    while (true) {
        vertices.push(...paraWebGL(x0, y0));

        if (x0 === x1 && y0 === y1) {
            break;
        }

        const erro2 = 2 * erro;

        if (erro2 > -dy) {
            erro -= dy;
            x0 += passoX;
        }

        if (erro2 < dx) {
            erro += dx;
            y0 += passoY;
        }
    }

    atualizarTela();
}

// --------------------------------------------------
// FUNÇÃO 2: ALTERAR COR
// --------------------------------------------------

function alterarCor(indice) {
    corAtual = cores[indice];

    if (corAtualTexto) {
        corAtualTexto.textContent =
            `Cor atual: tecla ${indice}`;
    }

    atualizarTela();
}

// --------------------------------------------------
// FUNÇÃO 3: DESENHAR TRIÂNGULO
// --------------------------------------------------

function desenharTriangulo(p1, p2, p3) {
    // Primeira lateral
    desenharReta(
        p1.x,
        p1.y,
        p2.x,
        p2.y,
        true
    );

    // Segunda lateral
    desenharReta(
        p2.x,
        p2.y,
        p3.x,
        p3.y,
        false
    );

    // Terceira lateral
    desenharReta(
        p3.x,
        p3.y,
        p1.x,
        p1.y,
        false
    );
}

// --------------------------------------------------
// ATUALIZAR A TELA
// --------------------------------------------------

function atualizarTela() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.DYNAMIC_DRAW
    );

    gl.uniform3fv(colorLocation, corAtual);

    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / 2
    );
}

// --------------------------------------------------
// INTERAÇÃO COM O MOUSE
// --------------------------------------------------

canvas.addEventListener("mousedown", function (event) {
    pontos.push({
        x: Math.round(event.offsetX),
        y: Math.round(event.offsetY)
    });

    if (modo === "reta") {
        if (pontos.length === 1) {
            statusTexto.textContent =
                "Ponto inicial escolhido. Clique no ponto final.";
        }

        if (pontos.length === 2) {
            desenharReta(
                pontos[0].x,
                pontos[0].y,
                pontos[1].x,
                pontos[1].y
            );

            pontos = [];

            statusTexto.textContent =
                "Reta desenhada. Faça mais dois cliques.";
        }
    }

    if (modo === "triangulo") {
        statusTexto.textContent =
            `Vértice ${pontos.length} escolhido.`;

        if (pontos.length === 3) {
            desenharTriangulo(
                pontos[0],
                pontos[1],
                pontos[2]
            );

            pontos = [];

            statusTexto.textContent =
                "Triângulo desenhado. Faça mais três cliques.";
        }
    }
});

// --------------------------------------------------
// INTERAÇÃO COM O TECLADO
// --------------------------------------------------

window.addEventListener("keydown", function (event) {
    const tecla = event.key.toLowerCase();

    if (tecla === "r") {
        modo = "reta";
        pontos = [];

        statusTexto.textContent =
            "Modo reta: faça dois cliques.";
    }

    if (tecla === "t") {
        modo = "triangulo";
        pontos = [];

        statusTexto.textContent =
            "Modo triângulo: faça três cliques.";
    }

    if (event.key >= "0" && event.key <= "9") {
        alterarCor(Number(event.key));
    }
});

// --------------------------------------------------
// CONFIGURAÇÃO INICIAL
// --------------------------------------------------

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.1, 0.1, 1.0);

// Linha inicial azul de (0,0) até (0,0).
desenharReta(0, 0, 0, 0);

statusTexto.textContent =
    "Modo reta: faça dois cliques.";