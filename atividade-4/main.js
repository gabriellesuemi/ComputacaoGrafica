const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// ==================================================
// SHADERS
// ==================================================

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {
    vec3 position =
        u_viewTransform *
        u_modelTransform *
        vec3(aPosition, 1.0);

    gl_Position = vec4(position.xy, 0.0, 1.0);
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


function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }

    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader =
        createShader(gl, gl.VERTEX_SHADER, vertexSource);

    const fragmentShader =
        createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

const program =
    createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    );


// ==================================================
// RENDERER
// ==================================================

class Renderer {
    constructor(gl, program) {
        this.gl = gl;

        this.positionLocation =
            gl.getAttribLocation(program, "aPosition");

        this.colorLocation =
            gl.getUniformLocation(program, "uColor");

        this.viewLocation =
            gl.getUniformLocation(program, "u_viewTransform");

        this.modelLocation =
            gl.getUniformLocation(program, "u_modelTransform");

        this.viewTransform = m3.identity();
        this.buffer = gl.createBuffer();
    }

    defineViewTransform(transform) {
        this.viewTransform = transform;
    }

    draw(object) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(this.positionLocation);

        gl.vertexAttribPointer(
            this.positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.uniform3fv(this.colorLocation, object.color);

        gl.uniformMatrix3fv(
            this.modelLocation,
            false,
            object.modelTransform
        );

        gl.uniformMatrix3fv(
            this.viewLocation,
            false,
            this.viewTransform
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            object.vertices.length / 2
        );
    }
}


// ==================================================
// OBJETOS
// ==================================================

function rectangleVertices(width, height) {
    return new Float32Array([
        -width / 2, 0,
         width / 2, -height,
        -width / 2, -height,

        -width / 2, 0,
         width / 2, 0,
         width / 2, -height
    ]);
}

class SceneObject {
    constructor(width, height, color) {
        this.vertices = rectangleVertices(width, height);
        this.color = color;
        this.modelTransform = m3.identity();
    }

    updateModelTransform(robotTransform, x, y, angle) {
        const localTransform =
            m3.multiply(
                m3.translation(x, y),
                m3.rotation(angle)
            );

        this.modelTransform =
            m3.multiply(
                robotTransform,
                localTransform
            );
    }
}


// ==================================================
// ROBÔ
// ==================================================

class Robot {
    constructor() {
        this.x = -1.5;
        this.speed = 0.005;

        this.armAngle = 0;
        this.armSpeed = 0.012;

        this.legAngle = 0;
        this.legSpeed = 0.015;

        const blue =
            new Float32Array([0.1, 0.5, 1.0]);

        const gray =
            new Float32Array([0.7, 0.7, 0.7]);

        this.head = new SceneObject(0.35, 0.30, gray);
        this.body = new SceneObject(0.50, 0.60, blue);

        this.leftArm = new SceneObject(0.12, 0.50, gray);
        this.rightArm = new SceneObject(0.12, 0.50, gray);

        this.leftLeg = new SceneObject(0.15, 0.50, blue);
        this.rightLeg = new SceneObject(0.15, 0.50, blue);
    }

    move() {
        // Movimento do robô inteiro
        this.x += this.speed;

        if (this.x > 1.5 || this.x < -1.5) {
            this.speed = -this.speed;
        }

        // Movimento dos braços
        this.armAngle += this.armSpeed;

        if (this.armAngle > 0.35 || this.armAngle < -0.35) {
            this.armSpeed = -this.armSpeed;
        }

        // Movimento das pernas
        this.legAngle += this.legSpeed;

        if (this.legAngle > 0.25 || this.legAngle < -0.25) {
            this.legSpeed = -this.legSpeed;
        }

        const robotTransform =
            m3.translation(this.x, 0);

        this.head.updateModelTransform(
            robotTransform,
            0,
            0.85,
            0
        );

        this.body.updateModelTransform(
            robotTransform,
            0,
            0.50,
            0
        );

        this.leftArm.updateModelTransform(
            robotTransform,
            -0.32,
            0.45,
            this.armAngle
        );

        this.rightArm.updateModelTransform(
            robotTransform,
            0.32,
            0.45,
            -this.armAngle
        );

        this.leftLeg.updateModelTransform(
            robotTransform,
            -0.14,
            -0.10,
            -this.legAngle
        );

        this.rightLeg.updateModelTransform(
            robotTransform,
            0.14,
            -0.10,
            this.legAngle
        );
    }

    draw(renderer) {
        renderer.draw(this.leftArm);
        renderer.draw(this.rightArm);

        renderer.draw(this.leftLeg);
        renderer.draw(this.rightLeg);

        renderer.draw(this.body);
        renderer.draw(this.head);
    }
}


// ==================================================
// CENA
// ==================================================

class Scene {
    constructor(gl, program) {
        this.renderer = new Renderer(gl, program);

        this.viewTransform =
            m3.setClippingWindow(
                -2,
                -1,
                2,
                1
            );

        this.renderer.defineViewTransform(
            this.viewTransform
        );

        this.robot = new Robot();
    }

    update() {
        this.robot.move();
    }

    draw() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        this.robot.draw(this.renderer);
    }

    execute() {
        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {
        requestAnimationFrame(
            () => this.execute()
        );
    }
}


// ==================================================
// INICIAR
// ==================================================

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);

const scene = new Scene(gl, program);

scene.init();