class Rectangle{
    constructor(xlow, xhigh, ylow, yhigh){ // make the rectangles inside these World Coordinates
        this.xlow = xlow;
        this.xhigh = xhigh;
        this.ylow = ylow;
        this.yhigh = yhigh;
        this.color = [Math.random(), Math.random(), Math.random(), 1]
        this.size = 1.0 + Math.random(); // half edge between 1.0 and 2.0
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
    }
    update(DT){
        const degreesPerSecond = 45;
        this.degrees += degreesPerSecond*DT;
        this.degrees = 0.0; // turn off the rotation, for now

        if(this.x+this.dx*DT +this.size > this.xhigh){
            this.dx = -Math.abs(this.dx);
        }
        if(this.x+this.dx*DT -this.size < this.xlow){
            this.dx = Math.abs(this.dx);
        }
        if(this.y+this.dy*DT +this.size > this.yhigh){
            this.dy = -Math.abs(this.dy);
        }
        if(this.y+this.dy*DT -this.size < this.ylow){
            this.dy = Math.abs(this.dy);
        }


        this.x += this.dx*DT;
        this.y += this.dy*DT;
    }
    draw(gl, shaderProgram){
        drawRectangle(gl, shaderProgram, this.color, this.degrees, this.x, this.y, this.size);
    }
}

function drawRectangle(gl, shaderProgram, color, degrees, x, y, size){
    //
    // Create the vertexBufferObject
    //
    const vertices = [-1,1, -1,-1, +1,+1, +1,-1];

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
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export { Rectangle, drawRectangle };