import { storeQuad, drawUVVertices, crossProduct, drawColorNormalVertices } from "./shapes2d.js";

const sandColor = [234/255, 208/255, 168/255];  // light brown
const grassColor = [0, 1, 0];   // green 
const snowColor = [1, 1, 1];    // white

// A Terrain Class, which will cover the screen
class Terrain {
    constructor(width, height, elevations, shaderElevations) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.waterHeight = 0;
        this.baseWaterHeight = this.waterHeight;
        this.grassLevel = this.baseWaterHeight + 1;
        this.snowLevel = this.grassLevel + 6;
        this.elevations = elevations;
        this.shaderElevations = shaderElevations;
    } 
    getMaxHeight(x, y) {
        let h = this.elevations.get([x, y]);
        if (this.waterHeight > h) {
            h = this.waterHeight;
        }
        return h;
    }
    // elevation(x, y) {
    //     // Normalize coordinates for terrain scale
    //     let scale = 0.01;
    //     let elevation = 0;
    
    //     // Add multiple "octaves" of noise for detail
    //     elevation += noise.perlin2(x * scale, y * scale) * 1.0;
    //     elevation += noise.perlin2(x * scale * 2, y * scale * 2) * 0.5;
    //     elevation += noise.perlin2(x * scale * 4, y * scale * 4) * 0.25;
    
    //     // Optional: tweak terrain height
    //     return elevation * 10 + 10; // scale and shift
    // }
    waterElevation(x, y, wave_intensity) {
        let z = this.waterHeight;
        z += wave_intensity * Math.sin(x / 5) + wave_intensity * Math.cos(x / 2);
        z += wave_intensity * Math.sin(y / 9 - 2);
        z += wave_intensity * Math.sin(x / 3 + 2) * Math.cos(y / 8);
        return z;
    }
    draw(gl, shaderProgram, currentTime, mouse, render_distance, map_size, wave_intensity, water_quality) {
        let vertices = [];
        let H = 1;
        let u1 = 0, v1 = H;
        let u2 = H, v2 = H;
        let u3 = H, v3 = 0;
        let u4 = 0, v4 = 0;
        for (let x = Math.floor(mouse.x - render_distance); x < Math.floor(mouse.x + render_distance); x++) {
            for (let y = Math.floor(mouse.y - render_distance); y < Math.floor(mouse.y + render_distance); y++) {
                let d_2 = (x - mouse.x)**2 + (y - mouse.y)**2
                if (d_2 > render_distance**2 || x > map_size - 1 || x < 0 || y < 0 || y > map_size - 1) {
                    continue;
                }

                let x1 = x;
                let y1 = y;
                let key = `${x1},${y1}`;
                let z1 = this.elevations.get(key);
                let x2 = x + 1;
                let y2 = y;
                key = `${x2},${y2}`;
                let z2 = this.elevations.get(key);
                let x3 = x + 1;
                let y3 = y + 1;
                key = `${x3},${y3}`;
                let z3 = this.elevations.get(key);
                let x4 = x;
                let y4 = y + 1;
                key = `${x4},${y4}`
                let z4 = this.elevations.get(key);

                let cx = x1;
                let cy = y1;
                key = `${cx},${cy}`;
                let elev =this.elevations.get(key);
                let r, g, b, i;

                if (elev > this.snowLevel) {
                    [r, g, b] = snowColor;
                    i = 1;
                } else if (elev > this.grassLevel) {
                    let t = (elev - this.grassLevel) / (this.snowLevel - this.grassLevel);
                    [r, g, b] = lerpColor(grassColor, snowColor, t);
                    i = 0;
                } else if (elev > this.waterHeight) {
                    let t = (elev - this.waterHeight) / (this.grassLevel - this.waterHeight);
                    [r, g, b] = lerpColor(sandColor, grassColor, t); 
                    i = 2;
                } else {
                    [r, g, b] = sandColor;
                    i = 2;
                }

                // r = Math.sin(x * 3712 + y * 34857 + 1) * .5 + .5;
                // g = Math.sin(x * 9321 + y * 27543 + 2) * .5 + .5;
                // b = Math.sin(x * 1268 + y * 12771 + 7) * .5 + .5;

                // for smooth shading
                let e = .01;
                let key1 = `${x1},${y1}`;
                let key2 = `${x2},${y2}`;
                let key3 = `${x3},${y3}`;
                let key4 = `${x4},${y4}`;

                let [nx1, ny1, nz1] = crossProduct(x1, y1, this.elevations.get(key1),
                    x1 + e, y1, this.shaderElevations.get(`${x1 + e},${y1}`),
                    x1 + e, y1 + e, this.shaderElevations.get(`${x1 + e},${y1 + e}`));
                let [nx2, ny2, nz2] = crossProduct(x2, y2, this.elevations.get(key2),
                    x2 + e, y2, this.shaderElevations.get(`${x2 + e},${y2}`),
                    x2 + e, y2 + e, this.shaderElevations.get(`${x2+e},${y2+e}`));
                let [nx3, ny3, nz3] = crossProduct(x3, y3, this.elevations.get(key3),
                    x3 + e, y3, this.shaderElevations.get(`${x3+e},${y3}`),
                    x3 + e, y3 + e, this.shaderElevations.get(`${x3+e},${y3+e}`));
                let [nx4, ny4, nz4] = crossProduct(x4, y4,this.elevations.get(key4),
                    x4 + e, y4, this.shaderElevations.get(`${x4+e},${y4}`),
                    x4 + e, y4 + e, this.shaderElevations.get(`${x4+e},${y4+e}`));

                storeQuad(vertices, x1, y1, z1, nx1, ny1, nz1, u1, v1,
                    x2, y2, z2, nx2, ny2, nz2, u2, v2,
                    x3, y3, z3, nx3, ny3, nz3, u3, v3,
                    x4, y4, z4, nx4, ny4, nz4, u4, v4,
                    r, g, b, 1, i);
                // Low water quality (no waves)
                if (water_quality == 1) {
                    let e = 0.01;
                    let x1 = x, y1 = y, z1 = this.waterHeight;
                    if (x1 < 0) {
                        x1 = 0;
                    } else if (x1 > map_size) {
                        x1 = map_size;
                    }
                    if (y1 < 0) {
                        y1 = 0;
                    } else if (y1 > map_size) {
                        y1 = map_size;
                    }
                    let x2 = x, y2 = y + 1, z2 = this.waterHeight;
                    if (x2 < 0) {
                        x2 = 0;
                    } else if (x2 > map_size) {
                        x2 = map_size;
                    }
                    if (y2 < 0) {
                        y2 = 0;
                    } else if (y2 > map_size) {
                        y2 = map_size;
                    }
                    let x3 = x+1, y3 = y+1, z3 = this.waterHeight;
                    if (x3 < 0) {
                        x3 = 0;
                    } else if (x3 > map_size) {
                        x3 = map_size;
                    }
                    if (y3 < 0) {
                        y3 = 0;
                    } else if (y3 > map_size) {
                        y3 = map_size;
                    }
                    let x4 = x+1, y4 = y, z4 = this.waterHeight;
                    if (x4 < 0) {
                        x4 = 0;
                    } else if (x4 > map_size) {
                        x4 = map_size;
                    }
                    if (y4 < 0) {
                        y4 = 0;
                    } else if (y4 > map_size) {
                        y4 = map_size;
                    }
                    let key1 = `${x1},${y1}`;
                    let key2 = `${x2},${y2}`;
                    let key3 = `${x3},${y3}`;
                    let key4 = `${x4},${y4}`;

                        let [nx1, ny1, nz1] = crossProduct(x1, y1,this.elevations.get(key1),
                        x1 + e, y1, this.shaderElevations.get(`${x1 + e},${y1}`),
                        x1 + e, y1 + e, this.shaderElevations.get(`${x1 + e},${y1+e}`));
                        let [nx2, ny2, nz2] = crossProduct(x2, y2,this.elevations.get(key2),
                        x2 + e, y2, this.shaderElevations.get(`${x2 + e},${y2}`),
                        x2 + e, y2 + e, this.shaderElevations.get(`${x2 + e},${y2 + e}`));
                        let [nx3, ny3, nz3] = crossProduct(x3, y3,this.elevations.get(key3),
                        x3 + e, y3, this.shaderElevations.get(`${x3 + e},${y3}`),
                        x3 + e, y3 + e, this.shaderElevations.get(`${x3+e},${y3+e}`));
                        let [nx4, ny4, nz4] = crossProduct(x4, y4,this.elevations.get(key4),
                        x4 + e, y4, this.shaderElevations.get(`${x4 + e},${y4}`),
                        x4 + e, y4 + e, this.shaderElevations.get(`${x4+e},${y4+e}`));
                    storeQuad(vertices,
                        x1, y1, z1, nx1, ny1, nz1, u1, v1,
                        x2, y2, z2, nx2, ny2, nz2, u2, v2,
                        x3, y3, z3, nx3, ny3, nz3, u3, v3,
                        x4, y4, z4, nx4, ny4, nz4, u4, v4,
                        0.01, 0.01, 0.8, 0.5, 3
                    )
                }
                // High Quality Water
                if (water_quality == 0) {
                    e = 0.01;
                    x1 = x, y1 = y, z1 = this.waterElevation(x1, y1, wave_intensity);
                    if (x1 < 0) {
                        x1 = 0;
                    } else if (x1 > map_size) {
                        x1 = map_size;
                    }
                    if (y1 < 0) {
                        y1 = 0;
                    } else if (y1 > map_size) {
                        y1 = map_size;
                    }
                    x2 = x, y2 = y+1, z2 = this.waterElevation(x2, y2, wave_intensity);
                    if (x2 < 0) {
                        x2 = 0;
                    } else if (x2 > map_size) {
                        x2 = map_size;
                    }
                    if (y2 < 0) {
                        y2 = 0;
                    } else if (y2 > map_size) {
                        y2 = map_size;
                    }
                    x3 = x+1, y3 = y+1, z3 = this.waterElevation(x3, y3, wave_intensity);
                    if (x3 < 0) {
                        x3 = 0;
                    } else if (x3 > map_size) {
                        x3 = map_size;
                    }
                    if (y3 < 0) {
                        y3 = 0;
                    } else if (y3 > map_size) {
                        y3 = map_size;
                    }
                    x4 = x+1, y4 = y, z4 = this.waterElevation(x4, y4, wave_intensity);
                    if (x4 < 0) {
                        x4 = 0;
                    } else if (x4 > map_size) {
                        x4 = map_size;
                    }
                    if (y4 < 0) {
                        y4 = 0;
                    } else if (y4 > map_size) {
                        y4 = map_size;
                    }
                    let key1 = `${x1},${y1}`;
                    let key2 = `${x2},${y2}`;
                    let key3 = `${x3},${y3}`;
                    let key4 = `${x4},${y4}`;

                        [nx1, ny1, nz1] = crossProduct(x1, y1,this.elevations.get(key1),
                        x1 + e, y1,this.elevations.get(key1),
                        x1 + e, y1 + e,this.elevations.get(key1));
                        [nx2, ny2, nz2] = crossProduct(x2, y2,this.elevations.get(key2),
                        x2 + e, y2,this.elevations.get(key2),
                        x2 + e, y2 + e,this.elevations.get(key2));
                        [nx3, ny3, nz3] = crossProduct(x3, y3,this.elevations.get(key3),
                        x3 + e, y3,this.elevations.get(key3),
                        x3 + e, y3 + e,this.elevations.get(key3));
                        [nx4, ny4, nz4] = crossProduct(x4, y4,this.elevations.get(key4),
                        x4 + e, y4,this.elevations.get(key4),
                        x4 + e, y4 + e,this.elevations.get(key4));
                    storeQuad(vertices,
                        x1, y1, z1, nx1, ny1, nz1, u1, v1,
                        x2, y2, z2, nx2, ny2, nz2, u2, v2,
                        x3, y3, z3, nx3, ny3, nz3, u3, v3,
                        x4, y4, z4, nx4, ny4, nz4, u4, v4,
                        0.01, 0.01, 0.8, 0.5, 3
                    )
                }
            }
        }
        drawColorNormalVertices(gl, shaderProgram, vertices, gl.TRIANGLES);

    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(color1, color2, t) {
    return [
        lerp(color1[0], color2[0], t),
        lerp(color1[1], color2[1], t),
        lerp(color1[2], color2[2], t)
    ];
}

export {Terrain};