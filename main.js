var points;
var colors;

var NumVertices  = 36;

var gl;

var fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var aspect;       // Viewport aspect ratio
var program;

var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var stack = [];
var alpha = 0.0;

function main() {
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    let gl = WebGLUtils.setupWebGL(canvas, undefined);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width/canvas.height;

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders
    let program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    // Clear <canvas> by clearing the color buffer
    gl.enable(gl.DEPTH_TEST);

    projection = gl.getUniformLocation(program, "projectionMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Get the stop sign
    let stopSign = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.mtl");

    stopSign.onload = function() {
        while (stopSign.objParsed !== true && stopSign.mtlParsed !== true) {
            wait(1);
        }
        drawModel(stopSign);
    }

    // Get the lamp
    let lamp = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.mtl");

    lamp.onload = function() {
        while (lamp.objParsed !== true && lamp.mtlParsed !== true) {
            dwait(1);
        }
        drawModel(lamp);
    }

    // Get the car
    let car = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.mtl");

    car.onload = function() {
        while (car.objParsed !== true && car.mtlParsed !== true) {
            wait(1);
        }
        drawModel(car);
    }

   // Get the street
    let street = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.mtl");
    
    street.onload = function() {
        while (street.objParsed !== true && street.mtlParsed !== true) {
            wait(1);
        }
        drawModel(street);
    }

    // Get the bunny (you will not need this one until Part II)
    let bunny = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.mtl");

    bunny.onload = function() {
        while (bunny.objParsed !== true && bunny.mtlParsed !== true){
            wait(1);
        }
        drawModel(bunny);
        
    }

    //render();
}

//create a tree
function Tree(root) {
    this.root = root;
}

//create a node
function Node(transform, model) {
    this.transform = transform;
    this.model = model;
    this.children = [];
}

function render()
{
    
    pMatrix = perspective(fovy, aspect, .1, 10);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    eye = vec3(0, 0, 4);
    mvMatrix = lookAt(eye, at , up);

    alpha += 0.5;

    var stopSignNode = new Node(rotateZ(alpha), stopSign);
    var lampNode = new Node(translate(1, 1, 1), lamp);
    var carNode = new Node(translate(alpha/100.0, -1, -1), car);
    var streetNode = new Node(rotateZ(alpha), street);
    var bunnyNode = new Node(rotateZ(alpha), bunny);

    carNode.children.push(bunnyNode);
    
    var thisTree = new Tree(carNode);
    hierarchy(mvMatrix, thisTree.root);

   //requestAnimationFrame(render);

}

/**
 * Gets the vertices of a model
 *
 * @param model   model to get vertices of
 * @returns verts an array of vertices of the model
 */
function modelVertices(model) {
    var verts = [];
    //grabs the vertices of each face of the model and stores them in verts
    for(let i = 0; i < model.faces.length; i++) {
        verts.concat(model.faces[i].faceVertices);
    };

    return verts;
}

/**
 * Gets the normals of the vertices of a model
 *
 * @param model   model to get vertices of
 * @returns norms an array of vertices of the model
 */
function modelNormals(model) {
    var normss = [];
    //grabs the normals of the vertices of each face of the model and stores them in verts
    for(let i = 0; i < model.faces.length; i++) {
        verts.concat(model.faces[i].faceNormals);
    };

    return norms;
}

/**
 * Gets the texture coordinates of a model
 *
 * @param model   model to get vertices of
 * @returns texCoords an array of vertices of the model
 */
function modelTexCoords(model) {
    var texCoords = [];
    //grabs the vertices of each face of the model and stores them in verts
    for(let i = 0; i < model.faces.length; i++) {
        verts.concat(model.faces[i].faceTexCoords);
    };

    return texCoords;
}

function drawModel(model) {
    {
        var verts = modelVertices(model);
        var norms = modelNormals(model);
        var texCoords = modelTexCoords(model)
    
        var pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);
    
        var vPosition = gl.getAttribLocation(program,  "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fragColors), gl.STATIC_DRAW);
    
        var vColor= gl.getAttribLocation(program,  "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
    
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    
    }
}


