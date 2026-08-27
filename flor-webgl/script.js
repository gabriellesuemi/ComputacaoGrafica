const canvas = document.getElementById('meuCanvas');
const gl = canvas.getContext('webgl2');
console.log(gl);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const verticesCaule = new Float32Array([
    //primeiro triangulo
    -0.04, -0.85,
    0.04, -0.85,
    0.04, 0.25,

    //segundo triangulo
    -0.04, -0.85,
    0.04, 0.25,
    -0.04, 0.25
]);

const bufferCaule = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, bufferCaule);

gl.bufferData(
    gl.ARRAY_BUFFER,
    verticesCaule,
    gl.STATIC_DRAW
);

const verticesFolha = new Float32Array([
    //primeiro triangulo
    -0.5, 0.25,
    0.5, 0.25,
    0.0, 0.85,

    //segundo triangulo
    -0.5, 0.25,
    0.0, 0.85,
    -0.5, 0.85
]);

const bufferFolha = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, bufferFolha);    

gl.bufferData(
    gl.ARRAY_BUFFER,
    verticesFolha,
    gl.STATIC_DRAW
);

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
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCaule);

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


function criarElipse(centroX, centroY, raioX, raioY) {
    const vertices = [];
    vertices.push(centroX, centroY); // Centro da elipse
    const segmentos = 40;

    for (let i = 0; i <= segmentos; i++) {
        const angulo = (i / segmentos) * 2 * Math.PI;
        const x = centroX + raioX * Math.cos(angulo);
        const y = centroY + raioY * Math.sin(angulo);
        vertices.push(x, y);
    }
    return new Float32Array(vertices);
}

desenhar(verticesCaule, gl.TRIANGLES, [0.0, 0.5, 0.0, 1.0]);

const petalas = [
    criarElipse( 0.00, 0.68, 0.11, 0.16),
    criarElipse( 0.17, 0.57, 0.12, 0.15),
    criarElipse( 0.17, 0.37, 0.12, 0.15),
    criarElipse( 0.00, 0.27, 0.11, 0.16),
    criarElipse(-0.17, 0.37, 0.12, 0.15),
    criarElipse(-0.17, 0.57, 0.12, 0.15)
];

for (const petala of petalas) {
    desenhar(
        petala,
        gl.TRIANGLE_FAN,
        [0.9, 0.0, 0.5, 1.0]
    );
}

const miolo = criarElipse(
    0.0,
    0.47,
    0.10,
    0.13
);

desenhar(
    miolo,
    gl.TRIANGLE_FAN,
    [1.0, 0.8, 0.0, 1.0]
);