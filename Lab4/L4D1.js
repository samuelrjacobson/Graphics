/*
 * L4D1.js
 * Demonstrate Color Swizzeling
 *
 * Adapted for WebGL by Alex Clarke, 2016.
 */


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;
var canvas;



var points = [
	 0, 0, 0, //Triangle 1
	 1, 0, 0,
     0, 1, 0,
  
    -1, 0, 0, //Triangle extension
     0,-1, 0,
     1, 0, 0

];

var colors = [
	 1, 0, 0,
	 0, 1, 0,
     0, 0, 1,
     
     1, 1, 0,
     0, 1, 1,
     1, 0, 1
];

var program;



//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------

window.onload = function init()
{
    // Set up a WebGL Rendering Context in an HTML5 Canvas
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2"); // basic webGL2 context
    if (!gl) {
       canvas.parentNode.innerHTML("Cannot get WebGL2 Rendering Context");
    }
    
    //  Configure WebGL
    //  eg. - set a clear color
    //      - turn on depth testing
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    
    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "Shaders/basic.vert", "Shaders/basic.frag");
    gl.useProgram(program);
    
    // Set up data to draw
    // Done globally in this program...
    
 // Load the data into GPU data buffers
  // The vertex array is copied into one buffer
  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // The colour array is copied into another
  var color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);


  // Associate shader attributes with corresponding data buffers
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);    

    //Draw the scene
    requestAnimationFrame(render);
};




//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
            
    //draw triangle
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);	

    
    requestAnimationFrame(render);
}


