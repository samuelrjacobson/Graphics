/*
* boxes.cpp
* An exercise in positioning simple boxes using projection/modelview
* matrices and standard transforms.
*
* Adapted for WebGL by Alex Clarke, 2016.
* Adapted for WebGL2 by Alex Clarke, 2020.
*/


//----------------------------------------------------------------------------
// State Variable Setup 
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;

//Collect shape information into neat package
var shapes = {
   wireCube: {points:[], colors:[], start:0, size:0, type: 0},
    blueWireCube: {points:[], colors:[], start:0, size:0, type: 0},
   solidCube: {points:[], colors:[], start:0, size:0, type: 0},
   axes: {points:[], colors:[], start:0, size:0, type: 0},
};

//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;

//Model state variables
var shoulder = 0, elbow = 0;


//----------------------------------------------------------------------------
// Define Shape Data 
//----------------------------------------------------------------------------

//Some colours
var red = 		   	vec4(1.0, 0.0, 0.0, 1.0);
var green = 	   	vec4(0.0, 1.0, 0.0, 1.0);
var blue = 		   	vec4(0.0, 0.0, 1.0, 1.0);
var lightred =		vec4(1.0, 0.5, 0.5, 1.0);
var lightgreen =	vec4(0.5, 1.0, 0.5, 1.0);
var lightblue =   	vec4(0.5, 0.5, 1.0, 1.0);
var white = 	   	vec4(1.0, 1.0, 1.0, 1.0);


//Generate Axis Data: use LINES to draw. Three axes in red, green and blue
shapes.axes.points = 
[ 
	vec4(  2.0,  0.0,  0.0, 1.0), //x axis, will be green
	vec4( -2.0,  0.0,  0.0, 1.0),
	vec4(  0.0,  2.0,  0.0, 1.0), //y axis, will be red
	vec4(  0.0, -2.0,  0.0, 1.0),
	vec4(  0.0,  0.0,  2.0, 1.0), //z axis, will be blue
	vec4(  0.0,  0.0, -2.0, 1.0)
];

shapes.axes.colors = 
[
	green,green,
	red,  red,
	blue, blue
];

//Define points for a unit cube
var cubeVerts = [
    vec4( 0.5,  0.5,  0.5, 1), //0
    vec4( 0.5,  0.5, -0.5, 1), //1
    vec4( 0.5, -0.5,  0.5, 1), //2
    vec4( 0.5, -0.5, -0.5, 1), //3
    vec4(-0.5,  0.5,  0.5, 1), //4
    vec4(-0.5,  0.5, -0.5, 1), //5
    vec4(-0.5, -0.5,  0.5, 1), //6
    vec4(-0.5, -0.5, -0.5, 1), //7
];

//Look up patterns from cubeVerts for different primitive types
//Wire Cube - draw with LINE_STRIP
var wireCubeLookups = [
	0,4,6,2,0, //front
	1,0,2,3,1, //right
	5,1,3,7,5, //back
	4,5,7,6,4, //right
	4,0,1,5,4, //top
	6,7,3,2,6, //bottom
];

//Solid Cube - draw with TRIANGLES, 2 triangles per face
var solidCubeLookups = [
	0,4,6,   0,6,2, //front
	1,0,2,   1,2,3, //right
	5,1,3,   5,3,7,//back
	4,5,7,   4,7,6,//left
	4,0,1,   4,1,5,//top
	6,7,3,   6,3,2,//bottom
];

//Expand Wire Cube data:
var wCubePoints
for (var i =0; i < wireCubeLookups.length; i++)
{
   wCubePoints = shapes.wireCube.points.push(cubeVerts[wireCubeLookups[i]]);
   shapes.wireCube.colors.push(white);
}
for (var i =0; i < wireCubeLookups.length; i++)
{
    wCubePoints = shapes.blueWireCube.points.push(cubeVerts[wireCubeLookups[i]]);
    shapes.blueWireCube.colors.push(blue);
}

//Expand Solid Cube data: each face will be a different color so you can see
//    the 3D shape better without lighting.
var colorNum = 0;
var colorList = [lightblue, lightgreen, lightred, blue, red, green];
for (var i = 0; i < solidCubeLookups.length; i++)
{
   shapes.solidCube.points.push(cubeVerts[solidCubeLookups[i]]);
   shapes.solidCube.colors.push(colorList[colorNum]);
   if (i % 6 == 5) colorNum++; //Switch color for every face. 6 vertices/face
}

//load data into points and colors arrays - runs once as page loads.
var points = [];
var colors = [];

//Convenience function:
//  - adds shape data to points and colors arrays
//  - adds primitive type to a shape
function loadShape(myShape, type)
{
   myShape.start = points.length;
   points = points.concat(myShape.points);
   colors = colors.concat(myShape.colors);
   //colors = c;
   myShape.size = points.length - myShape.start;
   myShape.type = type;
}

//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------

window.onload = function init() {
  // Set up a WebGL Rendering Context in an HTML5 Canvas
  var canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
   canvas.parentNode.innerHTML("Cannot get WebGL2 Rendering Context");
  }

  //  Configure WebGL
  //  eg. - set a clear color
  //      - turn on depth testing
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.CULL_FACE);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "shader.vert", "shader.frag");
  gl.useProgram(program);

  // Set up data to draw
  // Mostly done globally in this program...
  loadShape(shapes.wireCube, gl.LINE_STRIP);
  loadShape(shapes.blueWireCube, gl.LINE_STRIP);
  loadShape(shapes.solidCube, gl.TRIANGLES);
  loadShape(shapes.axes, gl.LINES);
  
  // Load the data into GPU data buffers and
  // Associate shader attributes with corresponding data buffers
  //***Vertices***
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
  program.vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vPosition );
 
  //***Colors***
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors), gl.STATIC_DRAW );
  program.vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer( program.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vColor );

  // Get addresses of shader uniforms
  projLoc = gl.getUniformLocation(program, "p");
  mvLoc = gl.getUniformLocation(program, "mv");

  //Set up projection matrix
  var aspect = canvas.clientWidth/canvas.clientHeight;
  //perspective(mv, 0, aspect, 0, -5);
  // p = perspective(45.0, aspect, 0.1, 100.0); //Answer to 4c
  //p = ortho(-width/2, width/2, -height/2, height/2);
  //p = ortho(-1.0, 1.0, -1.0, 1.0, 5, -100);
  //p = ortho(-1, 2, -1, 2, -1, 1);
  p = ortho(-3.4*aspect, 3.4*aspect, -3.4, 3.4, 1.0, 20.0);
  //p = ortho(100, -100, -100, 100, 100, 100);
  //p = perspective(45.0, 1.0, 0.1, 100.0); //original setting
  gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(transpose(p)));

  //Set initial view
  var eye = vec3(0.0, 1.0, 10.0);
  var at = vec3(0.0, 0.0, 0.0);
  var up = vec3(0.0, 1.0, 0.0);

  mv = lookAt(eye, at, up);
  /*p = ortho(-1, 2, -1, 2, -1, 1);
  gl.uniformMatrix4fv(projLoc, false, flatten(projectionMatrix));*/

  //Set up viewport - see WebGL Anti-Patterns link
  //gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  //Set up projection matrix
  //p = perspective(45.0, 1.0, 0.1, 100.0);
  //gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(transpose(p)));
 
  requestAnimationFrame(render);

};

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function render() {

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    var whiteCube = shapes.wireCube;
    var blueCube = shapes.blueWireCube;
    var matStack = [];  //matrix stack

    mv = mult(mv,rotate(6, vec3(0,0,1)));
    //mv = mult(mv,rotate(6, vec3(0,1,0)));
    mv = mult(mv,rotate(6, vec3(1,0,0))); // for step 9
    //mv = mult(mv,rotate(90, vec3(1,0,0))); // answer to step 10
    //mv = mult(mv,rotate(45, vec3(1,0,0)));   // answers to...
    //mv = mult(mv,rotate(30, vec3(0,1,0)));   // ...step 11

    //Save view transform
    matStack.push(mv);

        gl.uniformMatrix4fv(mvLoc, gl.TRUE, flatten(transpose(mv)));

        gl.drawArrays(shapes.axes.type, shapes.axes.start, shapes.axes.size);

        mv = matStack.pop();

        //White Cube
        mv = mult(mv,translate(1.0, 0.0, 0.0));
        //rotation
        //mv = mult(mv,rotate(90, vec3(1,0,0)));
        //mv = mult(mv,rotate(shoulder, vec3(0,0,1)));
        //translation
        mv = mult(mv,translate(0.0, 0.0, 0.0));
        //Scale and Draw
        matStack.push(mv);
        mv = mult(mv,scale(1.0, 1.0, 1.0));
        gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(mv)));
        gl.drawArrays(whiteCube.type, whiteCube.start, whiteCube.size);
        //Undo Scale
        mv = matStack.pop();

        //Blue Cube
        mv = mult(mv,translate(0.0, 1.0, 0.0));
        //rotation
        mv = mult(mv,rotate(45, vec3(0,1,0)));
        //translation
        mv = mult(mv,translate(0.0, 0.0, 0.0));
        //Scale and Draw
        matStack.push(mv);
        mv = mult(mv,scale(1.0, 1.0, 1.0));
        gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(mv)));
        gl.drawArrays(blueCube.type, blueCube.start, blueCube.size);
        //Undo Scale
        mv = matStack.pop();

    //Restore mv to initial state
    mv = matStack.pop();

}