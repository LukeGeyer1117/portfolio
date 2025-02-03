import {collideParticles} from './collisions.js';

window.addEventListener("deviceorientation", (event) => {
    const alpha = event.alpha; // Rotation around Z-axis (compass direction)
    const beta = event.beta;   // Tilt front-to-back (-180 to 180)
    const gamma = event.gamma; // Tilt left-to-right (-90 to 90)

    // if values are not null
    let betaHolder = document.querySelector('#beta');
    if (beta != null) {
        gravity[0] *= (beta * 0.001);
        betaHolder.innerHTML = beta;
    }
    let gammaHolder = document.querySelector('#gamma');
    if (gamma != null) {
        gravity[1] *= (gamma * 0.001);
        gammaHolder.innerHTML = gamma;
    }

    console.log("Alpha (Z-axis):", alpha);
    console.log("Beta (X-axis):", beta);
    console.log("Gamma (Y-axis):", gamma);
});

class Circle{
    constructor(xlow, xhigh, ylow, yhigh, gravity){ // make the circles inside these World Coordinates

        // max and min world coordinates
        this.xlow = xlow;
        this.xhigh = xhigh;
        this.ylow = ylow;
        this.yhigh = yhigh;
        
        // 2-array with dx and dy based on accelerometer
        this.gravity = gravity;

        // random attrs for circle
        this.color = [Math.random(), Math.random(), Math.random(), 1]
        this.radius = Math.random() * 0.9 + 1;
        this.size = this.radius; // half edge between 1.0 and 2.0

        const minx = xlow+this.size;
        const maxx = xhigh-this.size;
        this.x = minx + Math.random()*(maxx-minx);
        const miny = ylow+this.size;
        const maxy = yhigh-this.size;
        this.y = miny + Math.random()*(maxy-miny);
        this.degrees = Math.random()*90;
        this.dx = Math.random()*2+2; // 2 to 4
        if (Math.random()>.5)
            this.dx = -this.dx;
        this.dy = Math.random()*2+2;
        if (Math.random()>.5)
            this.dy = - this.dy;

        this.sides = 40;
        this.aF = 0.999;
    }
    update0(){
        // subtract for gravity
        this.dx -= (this.gravity[0]);
        this.dy -= (this.gravity[1]);

        // multiply for air friction
        this.dy *= this.aF;
        this.dx *= this.aF;
    }

    update1(DT, circleList, me){
        // ball - wall collisions
        if(this.x+this.dx*DT +this.size > this.xhigh){
            this.dx = -Math.abs(this.dx);
            // add wall collision friction logic here
            this.dx *= 0.8;
        }
        if(this.x+this.dx*DT -this.size < this.xlow){
            this.dx = Math.abs(this.dx);
            // add wall collision friction logic here
            this.dx *= 0.8;
        }
        if(this.y+this.dy*DT +this.size > this.yhigh){
            this.dy = -Math.abs(this.dy);
            // add wall collision friction logic here
            this.dy *= 0.8;
        }
        if(this.y+this.dy*DT -this.size < this.ylow){
            this.dy = Math.abs(this.dy);
            // add wall collision friction logic here
            this.dy *= 0.8;
        }

        // Ball - Ball collisions
        for (let j = me+1; j < circleList.length; j++) {
            const myR = this.size;
            const myX = this.x;
            const myY = this.y;
            const myDX = this.dx;
            const myDY = this.dy;
            const myNextX = myX + myDX*DT;
            const myNextY = myY + myDY*DT;

            const otherR = circleList[j].size;
            const otherX = circleList[j].x;
            const otherY = circleList[j].y;
            const otherDX = circleList[j].dx;
            const otherDY = circleList[j].dy;
            const otherNextX = otherX + otherDX*DT;
            const otherNextY = otherY + otherDY*DT;

            const distance_squared = (otherNextX - myNextX) ** 2 + (otherNextY - myNextY) ** 2;
            if (distance_squared < (myR + otherR) ** 2) {
                const COLLISION_FRICTION = 0.9;
                collideParticles(this, circleList[j], DT, COLLISION_FRICTION);
            }
        }
    }
    update2(DT) {
        // Update position
        this.x += this.dx*DT;
        this.y += this.dy*DT;
    }
    draw(gl, shaderProgram){
        drawCircle(gl, shaderProgram, this.color, this.degrees, this.x, this.y, this.size, this.sides, this.radius);
    }
}

function drawCircle(gl, shaderProgram, color, degrees, x, y, size, sides, radius){
    //
    // Create the vertexBufferObject
    //
    // const vertices = [-1,1, -1,-1, +1,+1, +1,-1];
    const vertices = [];
    const centerX = x;
    const centerY = y;
    vertices.push(x);
    vertices.push(y);
    for (let i = 0; i < sides + 1; i++) {
        const radians = i / sides * 2 * Math.PI;
        const x = Math.cos(radians) * radius + centerX;
        const y = Math.sin(radians) * radius + centerY;
        vertices.push(x);
        vertices.push(y);
    }

	const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	//
	// Set Vertex Attributes
	//
	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	//
	// Set Uniform uColor
	//
	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
    gl.useProgram(shaderProgram);
	gl.uniform4fv(colorUniformLocation, color);

	//
	// Set Uniform uModelViewMatrix
	//
    const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [size, size, 1]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, (degrees* Math.PI / 180), [0, 0, 1]);
    gl.uniformMatrix4fv( modelViewMatrixUniformLocation, false, modelViewMatrix);	  	

    //
    // Starts the Shader Program, which draws the current object to the screen.
    //
    gl.drawArrays(gl.TRIANGLE_FAN, 0, sides + 2);
}

export { Circle, drawCircle };