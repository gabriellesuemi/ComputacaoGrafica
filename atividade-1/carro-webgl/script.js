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

function criarElipse(centroX, centroY, raioX, raioY) {
    const vertices = [];

    // Primeiro vértice: centro
    vertices.push(centroX, centroY);

    const segmentos = 40;

    for (let i = 0; i <= segmentos; i++) {
        const angulo =
            (i / segmentos) * Math.PI * 2;

        const x =
            centroX + raioX * Math.cos(angulo);

        const y =
            centroY + raioY * Math.sin(angulo);

        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}
const corpoCarro = new Float32Array([
    -0.50,  0.20,
    -0.50, -0.25,
     0.50,  0.20,
     0.50, -0.25
]);

desenhar(
    corpoCarro,
    gl.TRIANGLE_STRIP,
    [0.7, 0.0, 0.4, 1.0]
);

const portaMalas = criarRetangulo(
    -0.80, -0.20,
    -0.50,  0.12
);

const capo = criarRetangulo(
     0.50, -0.20,
     0.80,  0.12
);

desenhar(
    portaMalas,
    gl.TRIANGLES,
    [0.7, 0.0, 0.4, 1.0]
);

desenhar(
    capo,
    gl.TRIANGLES,
    [0.7, 0.0, 0.4, 1.0]
);

const cabine = new Float32Array([
    -0.42, 0.20, // inferior esquerdo
    -0.25, 0.55, // superior esquerdo
     0.25, 0.55, // superior direito
     0.45, 0.20  // inferior direito
]);

desenhar(
    cabine,
    gl.TRIANGLE_FAN,
    [0.7, 0.0, 0.4, 1.0]
);

const janelaEsquerda = new Float32Array([
    -0.34, 0.24,
    -0.20, 0.49,
    -0.03, 0.49,
    -0.03, 0.24
]);

const janelaDireita = new Float32Array([
     0.03, 0.24,
     0.03, 0.49,
     0.20, 0.49,
     0.36, 0.24
]);

const azulJanela = [0.3, 0.75, 0.9, 1.0];

desenhar(
    janelaEsquerda,
    gl.TRIANGLE_FAN,
    azulJanela
);

desenhar(
    janelaDireita,
    gl.TRIANGLE_FAN,
    azulJanela
);

const rodaEsquerda = criarElipse(
    -0.48, -0.28,
     0.16,  0.21
);

const rodaDireita = criarElipse(
     0.48, -0.28,
     0.16,  0.21
);

const corRoda = [0.05, 0.05, 0.05, 0.7];

desenhar(
    rodaEsquerda,
    gl.TRIANGLE_FAN,
    corRoda
);

desenhar(
    rodaDireita,
    gl.TRIANGLE_FAN,
    corRoda
);

const farolDianteiro = criarRetangulo(
    0.72, -0.01,
    0.80,  0.08
);

desenhar(
    farolDianteiro,
    gl.TRIANGLES,
    [1.0, 0.9, 0.1, 1.0]
);

const lanternaTraseira = criarRetangulo(
    -0.80, -0.01,
    -0.72,  0.08
);

desenhar(
    lanternaTraseira,
    gl.TRIANGLES,
    [1.0, 0.3, 0.0, 1.0]
);

