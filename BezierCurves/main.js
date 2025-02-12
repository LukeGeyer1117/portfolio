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


	let beziers = [new Bezier(new Point2(Math.random() * -5,Math.random() * -5),new Point2(Math.random() * 2,Math.random() * -2),new Point2(Math.random() * -2,Math.random() * 2),new Point2(Math.random() * 5,Math.random() * 5))];
	let selectedPoint = null;

		// Double click to add a new curve
		canvas.addEventListener("dblclick", function(event) {
			const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
			const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
			let mPs = [];
			mPs.push(new Point2(Math.random() * (xWorld-5), Math.random() * (yWorld-5)));
			mPs.push(new Point2(Math.random() * (xWorld+2), Math.random() * (yWorld-2)));
			mPs.push(new Point2(Math.random() * (xWorld-2), Math.random() * (yWorld+2)));
			mPs.push(new Point2(Math.random() * (xWorld+5), Math.random() * (yWorld+5)));
	
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
	
		// Right click / two-finger tap to delete a curve!
		document.addEventListener("contextmenu", function(event) {
			event.preventDefault();
			const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
			const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
			for (let i = 0; i < beziers.length; i++) {
				let b = beziers[i];
				for (let j = 0; j < b.points.length; j++) {
					let x0 = xWorld, y0 = yWorld, x1 = b.points[j].x, y1 = b.points[j].y;
					let d2 = (x1 - x0)**2 + (y1 - y0)**2;
					if (Math.sqrt(d2) < 0.25) {
						beziers.splice(i, 1);
					}
				}
			}
		}) 
	
		// Convince the selected point to follow the cursor
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

				// Add a snap-to functionality
				for (let i = 0; i < beziers.length; i++) {
					// Check the main points of every curve
					let p1 = beziers[i].points[0]; // The first point
					let p2 = beziers[i].points[beziers[i].points.length -1]; // The last point

					// calculate distance from selected point to the control points
					let x0 = selectedPoint.x, y0 = selectedPoint.y;
					let x1 = p1.x, y1 = p1.y;
					let x2 = p2.x, y2 = p2.y;

					let d2_1 = (x1 - x0)**2 + (y1 - y0)**2;
					let d2_2 = (x2 - x0)**2 + (y2 - y0)**2;

					// If the distance is small enough, snap the points together.
					if (Math.sqrt(d2_1) < 0.5) {
						selectedPoint.x = p1.x;
						selectedPoint.y = p1.y;
					}
					if (Math.sqrt(d2_2) < 0.5) {
						selectedPoint.x = p2.x;
						selectedPoint.y = p2.y;
					}
				}
			}
		}
		
		// Release the selected point
		function onMouseUp() {
			selectedPoint = null;
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		}
	
		// Check if click is near a point
		function onMouseDown(event) {
			const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
			const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
	
			for (let i = 0; i < beziers.length; i++) {
				let bezier = beziers[i];
				for (let j = 0; j < bezier.points.length; j++) {
					let x0 = xWorld, y0 = yWorld, x1 = bezier.points[j].x, y1 = bezier.points[j].y;
					let d2 = (x1 - x0)**2 + (y1 - y0)**2;
					if (Math.sqrt(d2) < 0.7) {
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

