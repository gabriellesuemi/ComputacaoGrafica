// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        // Figura que será exibida
        this.helicopterBody = new HelicopterBody();

        this.helicopterTopShaft = new HelicopterTopShaft();

        this.helicopterTail = new HelicopterTail();

        this.helicopterPropellers = new HelicopterPropellers();

        this.helicopterTailPropeller = new HelicopterTailPropeller();

        this.x = -0.3;
        this.y = 0;
        this.topAngle = 0;
        this.tailAngle = 0;
        this.lastTime = null;
        this.keys = {};

        window.addEventListener("keydown", (event) => {
            if (event.key.startsWith("Arrow")) {
                event.preventDefault();
                this.keys[event.key] = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key.startsWith("Arrow")) {
                event.preventDefault();
                this.keys[event.key] = false;
            }
                });

        window.addEventListener("blur", () => {
            this.keys = {};
        });
    }

    update(deltaTime) {
        const speed = 0.5;

        // Permite subir mesmo quando o helicóptero está na base.
        if (this.keys.ArrowUp) {
            this.y += speed * deltaTime;
        }

        // Só permite andar para os lados quando está acima da base.
        if (this.y > -0.9) {
            if (this.keys.ArrowLeft)  this.x -= speed * deltaTime;
            if (this.keys.ArrowRight) this.x += speed * deltaTime;
        }

        if (this.keys.ArrowDown) {
            this.y -= speed * deltaTime;
        }

        this.y = Math.max(this.y, -0.9);

        if (this.y > -0.9) {
            this.topAngle += 5 * deltaTime;
            this.tailAngle += 8 * deltaTime;
        }

        const movement = m4.multiply(
            m4.translation(this.x, this.y, 0),
            m4.scaling(0.5, 0.5, 0.5)
        );

        this.helicopterBody.update(movement);
        this.helicopterTopShaft.update(movement);
        this.helicopterTail.update(movement);

        const topRotation = m4.multiply(
            m4.translation(0, 0.3, 0),
            m4.multiply(
                m4.yRotation(this.topAngle),
                m4.translation(0, -0.3, 0)
            )
        );

        this.helicopterPropellers.update(
            m4.multiply(movement, topRotation)
        );

        const tailRotation = m4.multiply(
            m4.translation(0.7, 0, 0.06),
            m4.multiply(
                m4.zRotation(this.tailAngle),
                m4.translation(-0.7, 0, -0.06)
            )
        );

        this.helicopterTailPropeller.update(
            m4.multiply(movement, tailRotation)
        );
    }

    draw() {

        const gl = this.renderer.gl;

        this.renderer.gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        this.renderer.gl.useProgram(this.renderer.program);

        this.helicopterBody.draw(
            this.renderer
        );

        this.helicopterTopShaft.draw(
            this.renderer
        );

        this.helicopterTail.draw(
            this.renderer
        );

        this.helicopterPropellers.draw(
            this.renderer
        );

        this.helicopterTailPropeller.draw(
            this.renderer
        );
    }

    execute(time) {
        if (this.lastTime === null) this.lastTime = time;

        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.05);
        this.lastTime = time;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(
            (time) => this.execute(time)
        );
    }

    init() {

        requestAnimationFrame(
            (time) => this.execute(time)
        );
    }
}