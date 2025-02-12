import { drawCircle, drawRectangle, drawTriangle, drawLineStrip } from "./shapes2d.js";

class Point2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Bezier {
    constructor(point1, point2, point3, point4) {
        this.points = [point1, point2, point3, point4];
        this.red = Math.random() * 1;
        this.green = Math.random() * 1;
        this.blue = Math.random() * 1;
    }
    evaluate(t) {
        let x = 
        (this.points[0].x*((1-t)**3)) + (3*this.points[1].x*((1-t)**2)*t) + 
        (3*this.points[2].x*(1-t)*(t**2)) + (this.points[3].x*(t**3));

        let y = (this.points[0].y*((1-t)**3)) + (3*this.points[1].y*((1-t)**2)*t) + 
        (3*this.points[2].y*(1-t)*(t**2)) + (this.points[3].y*(t**3));

        let p = [x, y];
        return p;
    }
    drawCurve(gl, shaderProgram) {
        let points = []
        let diff = 20;
        for (let i = 0; i <= diff; i++) {
            let t = i / diff;
            let p = this.evaluate(t);
            let np = new Point2(p[0], p[1]);
            points.push(np.x);
            points.push(np.y);
        }
        
        drawLineStrip(gl, shaderProgram, points, [this.red, this.green, this.blue,1]);
    }
    drawControlPoints(gl, shaderProgram) {
        for (let i = 0; i < this.points.length; i++) {
            let p = this.points[i];
            drawCircle(gl, shaderProgram, p.x, p.y, .5, [this.red, this.green, this.blue, 1]);
        }
    }
}

export {Point2, Bezier}