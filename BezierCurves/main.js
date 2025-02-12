import { initShaderProgram } from "./shader.js";
import { drawCircle, drawRectangle, drawTriangle, drawLineStrip } from "./shapes2d.js";
import { Point2, Bezier } from "./bezier.js";
import { randomDouble } from "./random.js";

main();
async function main() {
	console.log('This is working');

	//
	// start gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');
	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaders
	// 
	const vertexShaderText = await(await fetch("simple.vs")).text();
	const fragmentShaderText = await(await fetch("simple.fs")).text();
	const shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);

	//
	// load a projection matrix onto the shader
	// 
	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const projectionMatrix = mat4.create();
	let yhigh = 10;
	let ylow = -yhigh;
	let xlow = ylow;
	let xhigh = yhigh;
	if(aspect>=1){
		xlow *= aspect;
		xhigh *= aspect;
	}
	else{
		ylow /= aspect;
		yhigh /= aspect;
	}
	mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

	//
	// load a modelview matrix onto the shader
	// 
	const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
	const modelViewMatrix = mat4.create();
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

	//
	// Create content to display
	//


	//
	// Register Listeners
	//
	// document.addEventListener("click", function (event) {
	// 	console.log("click");
	// 	const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
	// 	const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
	// });


	let beziers = [new Bezier(new Point2(-5,-5),new Point2(2,-2),new Point2(-2,2),new Point2(5,5))];
	let selectedPoint = null;

		canvas.addEventListener("dblclick", function(event) {
			const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
			const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
			let mPs = [];
			mPs.push(new Point2(xWorld-5, yWorld-5));
			mPs.push(new Point2(xWorld+2, yWorld-2));
			mPs.push(new Point2(xWorld-2, yWorld+2));
			mPs.push(new Point2(xWorld+5, yWorld+5));
	
			for (let i = 0; i < mPs.length; i++) {
				if (mPs[i].x > xhigh) {
					mPs[i].x = xhigh - 0.5;
				}
				if (mPs[i].x < xlow) {
					mPs[i].x = xlow + 0.5;
				}
				if (mPs[i].y > yhigh) {
					mPs[i].y = yhigh - 0.5;
				}
				if (mPs[i].y < ylow) {
					mPs[i].y = ylow + 0.5;
				}
			}
	
			let nBezier = new Bezier(mPs[0], mPs[1], mPs[2], mPs[3]);
			beziers.push(nBezier);
		})
	
		document.addEventListener("contextmenu", function(event) {
			event.preventDefault();
			const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
			const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
			for (let i = 0; i < beziers.length; i++) {
				let b = beziers[i];
				for (let j = 0; j < b.points.length; j++) {
					let x0 = xWorld, y0 = yWorld, x1 = b.points[j].x, y1 = b.points[j].y;
					let d2 = (x1 - x0)**2 + (y1 - y0)**2;
					if (d2 < 1) {
						beziers.splice(i, 1);
					}
				}
			}
		}) 
	
	
		function onMouseMove(event) {
			if (selectedPoint) {
				let xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
				if (xWorld > xhigh) {
					xWorld = xhigh - 0.5;
				} else if (xWorld < xlow) {
					xWorld = xlow + 0.5;
				}
				let yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
				if (yWorld > yhigh) {
					yWorld = yhigh - 0.5;
				} else if (yWorld < ylow) {
					yWorld = ylow + 0.5;
				}
				selectedPoint.x = xWorld;
				selectedPoint.y = yWorld;
			}
		}
	
		function onMouseUp() {
			selectedPoint = null;
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		}
	
		function onMouseDown(event) {
			const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
			const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
	
			for (let i = 0; i < beziers.length; i++) {
				let bezier = beziers[i];
				for (let j = 0; j < bezier.points.length; j++) {
					let x0 = xWorld, y0 = yWorld, x1 = bezier.points[j].x, y1 = bezier.points[j].y;
					let d2 = (x1 - x0)**2 + (y1 - y0)**2;
					if (d2 < 1) {
						selectedPoint = bezier.points[j]
						document.addEventListener("mousemove", onMouseMove);
						document.addEventListener("mouseup", onMouseUp);
						break;
					}
				}
			}
		}
	
		document.addEventListener("mousedown", onMouseDown);
	

	//
	// Main render loop
	//
	let previousTime = 0;
	function redraw(currentTime){
		currentTime *= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		if(DT > .1)
			DT = .1;
		previousTime = currentTime;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		for (let i = 0; i < beziers.length; i++) {
			let bezier = beziers[i]
			bezier.drawCurve(gl, shaderProgram);
			bezier.drawControlPoints(gl,shaderProgram);
		}
		requestAnimationFrame(redraw);
	}
	requestAnimationFrame(redraw);
};

