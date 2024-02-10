// This variable will store the WebGL rendering context
var gl;

window.addEventListener("load", init);
function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   // Set up data to draw
   // Here, 2D vertex positions and RGB colours are loaded into arrays.
   var positions = [
        -0.25, 0.6, // triangle point 1
        0.25, 0.6, // point 2
        0.0, 1.0,   // point 3
      
        -0.6, -0.8, // biggest white square
        -0.6,  0.4,
        0.6, 0.4,
        0.6, -0.8,

        -0.5, -0.7, // second square, black
        -0.5,  0.3,
        0.5, 0.3,
        0.5, -0.7,

        -0.4, -0.6, // white square
        -0.4, 0.2,
        0.4, 0.2,
        0.4, -0.6,

        -0.3, -0.5, // black square
        -0.3, 0.1,
        0.3, 0.1,
        0.3, -0.5,

        -0.2, -0.4, // white square
        -0.2, 0.0,
        0.2, 0.0,
        0.2, -0.4,

        -0.1, -0.3, // black square
        -0.1, -0.1,
        0.1, -0.1,
        0.1, -0.3,
   ];
   
   var colors = [
        0, 1, 0, // green
        0, 0, 1, // blue
        1, 0, 0,  // red

        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,

        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,

        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,

        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,

        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,

        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,

   ];

   // circle
   var radius = 0.2;
	var centerX = 0;  // x value of point of origin of circle. Don't change--first, center at (0, 0). Then add actual values at line 111.
	var centerY = 0;  // y value. Since these must be (0, 0), don't really need variables...but makes it easier to understand.
	var realCenterX = 0.6;
   var realCenterY = 0.75;

	positions.push(realCenterX, realCenterY,); // First vertex of triangle fan is the actual center of the circle.
   colors.push(0, 0, 0,);  // Center is black.
	var numVertices = 36;
	for (let i = 0; i <= numVertices; i++) {     // First and last triangle share a vertex.
	   const theta = 2 * Math.PI * (i / numVertices);		// Total angle of circle is 2pi. i/numVertices = fraction of 2pi that this new point is on.
	   const x = centerX + radius * Math.cos(theta);	// cos(theta) = (x dist from center)/hypnotenuse(radius). Multiply by radius to get x dist from center. Add centerX to get point on circumference.
	   const y = centerY + radius * Math.sin(theta);	// Repeat above with sin to find y value of new point
	   positions.push(x + realCenterX, y + realCenterY,);   // Add the x and y coordinates of the circle's origin.
	   colors.push(0.175 * theta, 0, 0,);   // As angle increases, color reddens. Multiply by small number to affect only the perimeter.
	}

   // ellipse
   radius = 0.2;  centerX = 0;   centerY = 0;
   realCenterX = -0.6;
   realCenterY = 0.75;

	positions.push(realCenterX, realCenterY,);
   colors.push(1, 0, 0,);  // Center/origin of ellipse is red.
	numVertices = 36;
	for (let i = 0; i <= numVertices; i++) {     // First and last triangle share a vertex.
	   const theta = 2 * Math.PI * (i / numVertices);		// Total angle of circle is 2pi. i/numVertices = fraction of 2pi that this new point is on.
	   const x = centerX + radius * Math.cos(theta);	// cos(theta) = (x dist from center)/hypnotenuse(radius). Multiply by radius to get x dist from center. Add centerX to get point on circumference.
	   const y = centerY + radius * Math.sin(theta);	// Repeat above with sin to find y value of new point
	   positions.push(x + realCenterX, y * 0.6 + realCenterY,);      // Take 60% of y to squash circle into eliipse. Add the x and y coordinates of the ellipse's origin.
	   colors.push(1, 0, 0,);     // Use red color for entire ellipse
	}
   
   // Load the data into GPU data buffers
   // The vertex positions are copied into one buffer
   var vertex_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

   // The colours are copied into another buffer
   var color_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

   // Associate shader attributes with corresponding data buffers
   // Create a connection manager for the data, a Vertex Array Object
   // These are typically made global so you can swap what you draw in the
   //    render function.
   var triangleVAO = gl.createVertexArray();
   gl.bindVertexArray(triangleVAO);

   //Here we prepare the "vPosition" shader attribute entry point to
   //receive 2D float vertex positions from the vertex buffer
   var vPosition = gl.getAttribLocation(program, "vPosition");
   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
   gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   //Here we prepare the "vColor" shader attribute entry point to
   //receive RGB float colours from the colour buffer
   var vColor = gl.getAttribLocation(program, "vColor");
   gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
   gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vColor);

   // Get addresses of shader uniforms
   // None in this program...

   // Either draw as part of initialization
   render();

   // Or draw just before the next repaint event
   //requestAnimationFrame(render);
};

function render() {
   // draw
   // Draw the data from the buffers currently associated with shader variables
   // Our triangle has three vertices that start at the beginning of the buffer.
   gl.drawArrays(gl.TRIANGLES, 0, 3);  // triangle

   gl.drawArrays(gl.TRIANGLE_FAN, 3, 4);     // rectangles
   gl.drawArrays(gl.TRIANGLE_FAN, 7, 4);
   gl.drawArrays(gl.TRIANGLE_FAN, 11, 4);
   gl.drawArrays(gl.TRIANGLE_FAN, 15, 4);
   gl.drawArrays(gl.TRIANGLE_FAN, 19, 4);
   gl.drawArrays(gl.TRIANGLE_FAN, 23, 4);

   gl.drawArrays(gl.TRIANGLE_FAN, 28, 37);   // circle
   
   gl.drawArrays(gl.TRIANGLE_FAN, 66, 37);   // ellipse
}