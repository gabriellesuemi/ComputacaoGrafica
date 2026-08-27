const canvas = document.getElementById('meuCanvas');
const gl = canvas.getContext('webgl2');
console.log(gl);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const buffer = gl.createBuffer();

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uColor;

out vec4 outColor;

void main() {
    outColor = uColor;
}
`;

function criarShader(tipo, codigo){
    const shader = gl.createShader(tipo);
    gl.shaderSource(shader, codigo);
    gl.compileShader(shader);
    console.log(gl.getShaderInfoLog(shader));
    return shader;
}

const vertexShader = criarShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = criarShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
console.log(gl.getProgramInfoLog(program));
gl.useProgram(program);

const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getUniformLocation(program, "uColor");

function desenhar(vertices, modo, cor){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(positionLocation);
    gl.uniform4fv(colorLocation, cor);

    gl.drawArrays(modo, 0, vertices.length / 2);

}

function criarRetangulo(xMin, yMin, xMax, yMax) {
    return new Float32Array([
        // Primeiro triângulo
        xMin, yMin,
        xMax, yMin,
        xMin, yMax,

        // Segundo triângulo
        xMin, yMax,
        xMax, yMin,
        xMax, yMax
    ]);
}

const pernaEsquerda = criarRetangulo(
    -0.25, -0.75,
    -0.05, -0.25
)

const pernaDireita = criarRetangulo(
    0.05, -0.75,
    0.25, -0.25
)

const bracoEsquerdo = criarRetangulo(
    -0.5, -0.2,
    -0.32, 0.25
)

const bracoDireito = criarRetangulo(
    0.32, -0.2,
    0.5, 0.25
)

const cinza = [0.35, 0.35, 0.4, 1.0];

desenhar(pernaEsquerda, gl.TRIANGLES, cinza);
desenhar(pernaDireita, gl.TRIANGLES, cinza);
desenhar(bracoEsquerdo, gl.TRIANGLES, cinza);
desenhar(bracoDireito, gl.TRIANGLES, cinza);

const corpo = criarRetangulo(
    -0.32, -0.25,
    0.32, 0.35
);

const cabeca = criarRetangulo(
    -0.25, 0.35,
    0.25, 0.75
);

desenhar(
    corpo,
    gl.TRIANGLES,
    [0.5, 0.5, 0.5, 1.0]
);

desenhar(
    cabeca,
    gl.TRIANGLES,
    [0.7, 0.7, 0.75, 1.0]
);

const olhoEsquerdo = criarRetangulo(
    -0.16, 0.58,
    -0.08, 0.66
);

const olhoDireito = criarRetangulo(
    0.08, 0.58,
    0.16, 0.66
);

desenhar(
    olhoEsquerdo,
    gl.TRIANGLES,
    [0.0, 0.0, 0.0, 1.0]
);

desenhar(
    olhoDireito,
    gl.TRIANGLES,
    [0.0, 0.0, 0.0, 1.0]
);

const boca = criarRetangulo(
    -0.12, 0.44,
    0.12, 0.48
);

desenhar(
    boca,
    gl.TRIANGLES,
    [0.1, 0.1, 0.1, 1.0]
);

const antena = criarRetangulo(
    -0.02, 0.75,
    0.02, 0.95
);

desenhar(
    antena,
    gl.TRIANGLES,
    [0.5, 0.5, 0.5, 1.0]
);

const antenaBola = criarRetangulo(
    -0.05, 0.95,
    0.05, 1.05
);

desenhar(
    antenaBola,
    gl.TRIANGLES,
    [0.7, 0.7, 0.75, 1.0]
);

const botao1 = criarRetangulo(
    -0.05, 0.1,
    0.05, 0.2
);

desenhar(
    botao1,
    gl.TRIANGLES,
    [1.0, 0.0, 0.0, 1.0]
);

const botao2 = criarRetangulo(
    -0.05, -0.05,
    0.05, 0.05
);

desenhar(
    botao2,
    gl.TRIANGLES,
    [0.0, 0.0, 1.0, 1.0]
);
