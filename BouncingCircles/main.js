import { Circle } from "./circle.js";
import {initShaderProgram} from "./shader.js";

let gravityHolder = document.querySelector("#gravity-holder");
let gravityFloat = Number(gravityHolder.innerHTML);
console.log(`gravityFloat: ${gravityFloat}`);

// Modify gravity with buttons
let gravMinus = document.querySelector('#grav-minus');
gravMinus.addEventListener('click', function () {
	gravityFloat -= 0.01;
	gravityFloat = Math.round(gravityFloat * 100) / 100;
	gravityHolder.innerHTML = gravityFloat;
})
let gravPlus = document.querySelector('#grav-plus');
gravPlus.addEventListener('click', function () {
	gravityFloat += 0.01;
	gravityFloat = Math.round(gravityFloat * 100) / 100;
	gravityHolder.innerHTML = gravityFloat;
})

// Restart the simulation
let simButton = document.querySelector('#sim-button');
simButton.addEventListener('click', function () {
	main();
})

async function main() {
	console.log('This is working');

	let gravity = [0, gravityFloat];
	console.log(`gravity: ${gravity}`);

	window.addEventListener("deviceorientation", (event) => {
		const alpha = event.alpha; // Rotation around Z-axis (compass direction)
		const beta = event.beta;   // Tilt front-to-back (-180 to 180)
		const gamma = event.gamma; // Tilt left-to-right (-90 to 90)

		// if values are not null
		let betaHolder = document.querySelector('#beta');
		if (beta != null) {
			// gravity[0] *= beta;
			betaHolder.innerHTML = beta;
		}
		let gammaHolder = document.querySelector('#gamma');
		if (gamma != null) {
			// gravity[1] *= gamma;
			gammaHolder.innerHTML = gamma;
		}
	
		console.log("Alpha (Z-axis):", alpha);
		console.log("Beta (X-axis):", beta);
		console.log("Gamma (Y-axis):", gamma);
	});	

	//
	// Init gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaderProgram
	// 
	const vertexShaderText = await (await fetch("simple.vs")).text();
    const fragmentShaderText = await (await fetch("simple.fs")).text();
	let shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
	gl.useProgram(shaderProgram);


	//
	// Set Uniform uProjectionMatrix
	//	
	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const projectionMatrix = mat4.create();
	const yhigh = 10;
	const ylow = -yhigh;
	const xlow = ylow * aspect;
	const xhigh = yhigh * aspect;
	mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	gl.uniformMatrix4fv(
		projectionMatrixUniformLocation,
		false,
		projectionMatrix
	);

	//
	// Create the objects in the scene:
	//
	const NUM_CIRCLES = 5;
	const tempCircleList = []
	for (let i = 0; i < NUM_CIRCLES; i++) {
		let c = new Circle(xlow, xhigh, ylow, yhigh, gravity);
		tempCircleList.push(c);
	}

	for (let i = 0; i < tempCircleList.length; i++) {
		for (let j=i+1; j < tempCircleList.length; j++) {
			const mX = tempCircleList[i].x;
			const mY = tempCircleList[i].y;
			const mR = tempCircleList[i].radius;

			const nX = tempCircleList[j].x;
			const nY = tempCircleList[j].y;
			const nR = tempCircleList[j].radius;

			const dSquared = (mX - nX) ** 2 + (mY - nY) ** 2;
			if ((mR + nR) ** 2 > dSquared) {
				tempCircleList.splice(j, 1);
			}
		}
	}

	const circleList = tempCircleList;
	for (let i = 0; i < circleList.length; i++) {
		console.log(circleList[i]);
	}

	//
	// Main render loop
	//
	let previousTime = 0;
	function redraw(currentTime) {
		currentTime*= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		previousTime = currentTime;
		if(DT > .1){
			DT = .1;
		}
	
		// Clear the canvas before we start drawing on it.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Update the scene
		for (let i = 0; i < circleList.length; i++) {
			circleList[i].update0();
		}

		for (let i = 0; i < circleList.length; i++) {
			for (let reps = 0; reps < circleList.length; reps++) {
				circleList[i].update1(DT, circleList, i);
			}
		}

		for (let i = 0; i < circleList.length; i++) {
			circleList[i].update2(DT, circleList, i);
		}

		// Draw the scene
		for (let i = 0; i < circleList.length; i++) {
			circleList[i].draw(gl, shaderProgram);
		}
	  
		requestAnimationFrame(redraw);
	  }	
	  requestAnimationFrame(redraw);
};

