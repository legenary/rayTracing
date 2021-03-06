var g_resolution = 512;

//=============================================================================
//=============================================================================
function VBObox0() {  // (JUST ONE instance: as 'preView' var 
											// that shows webGL preview of ray-traced scene)
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  'attribute vec4 a_Position;\n' +	
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_mvpMat;\n' +
  'varying vec4 v_colr;\n' +
  //
  'void main() {\n' +
  '  gl_Position = u_mvpMat * a_Position;\n' +
//  '  gl_Position = a_Position;\n' +
  '  v_colr = a_Color;\n' +
  '}\n';

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +          // req'd for floats in frag shader
  //
  'varying vec4 v_colr;\n' +
  'void main() {\n' +
  '	 	 gl_FragColor = v_colr; \n' +
  // vec4(1.0, 0.2, 0.2, 1.0); \n' +
  '}\n';

//--------------Draw XYZ axes as unit-length R,G,B lines:
	this.vboContents = 
	new Float32Array ([   
    // Red X axis:
     0.00, 0.00, 0.0, 1.0,		1.0, 0.0, 0.0, 1.0,	// x,y,z,w; r,g,b,a; n1 n2 n3 (RED)
     1.00, 0.00, 0.0, 1.0,		1.0, 0.0, 0.0, 1.0,// x,y,z,w; r,g,b,a; n1 n2 n3 (RED)
    // green Y axis:
     0.00, 0.00, 0.0, 1.0,  	0.0, 1.0, 0.0, 1.0,	
     0.00, 1.00, 0.0, 1.0,  	0.0, 1.0, 0.0, 1.0,
    // blue Z axis:
     0.00, 0.00, 0.0, 1.0,  	0.0, 0.0, 1.0, 1.0,	
     0.00, 0.00, 1.0, 1.0,  	0.0, 0.0, 1.0, 1.0,
     ]); 
  this.vboVerts = 6;
//------------Add more shapes:
// update vbo contents and vbo verts
 this.appendGroundGrid();       // (see fcn below)
 this.appendLineSphere();

	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // total number of bytes stored in vboContents
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts; 
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 

	            //----------------------Attribute sizes
  this.vboFcount_a_Position =  4;// # of floats in the VBO needed to store the
                                // attribute named a_Position (4: x,y,z,w values)
  this.vboFcount_a_Color = 4;   // # of floats for this attrib (r,g,b,a values) 
  console.assert((this.vboFcount_a_Position +     // check the size of each and
                  this.vboFcount_a_Color) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");
                  /* // DIAGNOSTIC:
                  console.log("vboStride in constructor: ", this.vboStride);
                  console.log("FSIZE:    ", this.FSIZE);
                  console.log("vboBytes: ", this.vboBytes)
                  console.log("this.vboVerts: ", this.vboVerts);
                  console.log("vboContents.length: ", this.vboContents.length);
                  */
              //----------------------Attribute offsets  
	this.vboOffset_a_Position = 0;// # of bytes from START of vbo to the START
	                              // of 1st a_Position attrib value in vboContents[]
  this.vboOffset_a_Color = this.vboFcount_a_Position * this.FSIZE;    
                                // (4 floats * bytes/float) 
                                // # of bytes from START of vbo to the START
                                // of 1st a_Colr0 attrib value in vboContents[]
	            //-----------------------GPU memory locations:
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PositionLoc;						// GPU location for 'a_Position' attribute
	this.a_ColorLoc;							// GPU location for 'a_Color' attribute

	            //---------------------- Uniform locations &values in our shaders

  // NEW version using glMatrix.js:
  this.mvpMat = mat4.create();  // Transforms CVV axes to model axes.
  this.mdlMat = mat4.create();
 //  this.normalMat = mat4.create();
	// this.u_mvpMatLoc;							// GPU location
 //  this.u_mdlMatLoc;
 //  this.u_normalMatLoc;

 //  // Lighting:
 //  this.u_PHONG = 1;
 //  this.u_MatlSet = new Material(MATL_GRN_PLASTIC);
 //  this.u_LampHead = new Light();
 //  this.u_LampPoint = new Light();


}

VBObox0.prototype.appendGroundGrid = function() {
  //==============================================================================
  // Create a set of vertices for an x,y grid of colored lines in the z=0 plane
  // centered at x=y=z=0, and store them in local array vertSet[].  
  // THEN:
  // Append the contents of vertSet[] to existing contents of the this.vboContents 
  // array; update this.vboVerts to include these new verts for drawing.
  // NOTE: use gl.drawArrays(gl.GL_LINES,,) to draw these vertices.

  //Set # of lines in grid--------------------------------------
	this.xyMax	= 50.0;			// grid size; extends to cover +/-xyMax in x and y.
	this.xCount = 101;			// # of lines of constant-x to draw to make the grid 
	this.yCount = 101;		  // # of lines of constant-y to draw to make the grid 
	                        // xCount, yCount MUST be >1, and should be odd.
	                        // (why odd#? so that we get lines on the x,y axis)
	//Set # vertices per line-------------------------------------
	// You may wish to break up each line into separate line-segments.
	// Here I've split each line into 4 segments; two above, two below the axis.
	// (why? as of 5/2018, Chrome browser sometimes fails to draw lines whose
	// endpoints are well outside of the view frustum (Firefox works OK, though).
  var vertsPerLine =8;      // # vertices stored in vertSet[] for each line;
  							// (why 8? why not just 2?  Because it lets us
							// vary color (and later, z-value) along the line
	//Set vertex contents:----------------------------------------
	this.floatsPerVertex = 8;  // x,y,z,w;  r,g,b,a values.
	
  //Create (local) vertSet[] array-----------------------------
  gndVertCount = (this.xCount + this.yCount) * vertsPerLine;
  var gndVerts = new Float32Array(gndVertCount * this.floatsPerVertex); 
      // This array will hold (xCount+yCount) lines, kept as
      // (xCount+yCount)*vertsPerLine vertices, kept as
      // (xCount+yCount)*vertsPerLine*floatsPerVertex array elements (floats).
  
	// Set Vertex Colors--------------------------------------
  // Each line's color is constant, but set by the line's position in the grid.
  //  For lines of constant-x, the smallest (or most-negative) x-valued line 
  //    gets color xBgnColr; the greatest x-valued line gets xEndColr, 
  //  Similarly, constant-y lines get yBgnColr for smallest, yEndColr largest y.
 	this.xBgnColr = vec4.fromValues(1.0, 0.0, 0.0, 1.0);	  // Red
 	this.xEndColr = vec4.fromValues(0.0, 1.0, 1.0, 1.0);    // Cyan
 	this.yBgnColr = vec4.fromValues(0.0, 1.0, 0.0, 1.0);	  // Green
 	this.yEndColr = vec4.fromValues(1.0, 0.0, 1.0, 1.0);    // Magenta

  // Compute how much the color changes between 1 line and the next:
  var xColrStep = vec4.create();  // [0,0,0,0]
  var yColrStep = vec4.create();
  vec4.subtract(xColrStep, this.xEndColr, this.xBgnColr); // End - Bgn
  vec4.subtract(yColrStep, this.yEndColr, this.yBgnColr);
  vec4.scale(xColrStep, xColrStep, 1.0/(this.xCount -1)); // scale by # of lines
  vec4.scale(yColrStep, yColrStep, 1.0/(this.yCount -1));

  // Local vars for vertex-making loops-------------------
	var xgap = 2*this.xyMax/(this.xCount-1);		// Spacing between lines in x,y;
	var ygap = 2*this.xyMax/(this.yCount-1);		// (why 2*xyMax? grid spans +/- xyMax).
  var xNow;           // x-value of the current line we're drawing
  var yNow;           // y-value of the current line we're drawing.
  var line = 0;       // line-number (we will draw xCount or yCount lines, each
                      // made of vertsPerLine vertices),
  var v = 0;          // vertex-counter, used for the entire grid;
  var idx = 0;        // vertSet[] array index.
  var colrNow = vec4.create();   // color of the current line we're drawing.

  //----------------------------------------------------------------------------
  // 1st BIG LOOP: makes all lines of constant-x
  for(line=0; line<this.xCount; line++) {   // for every line of constant x,
    colrNow = vec4.scaleAndAdd(             // find the color of this line,
              colrNow, this.xBgnColr, xColrStep, line);	
    xNow = -this.xyMax + (line*xgap);       // find the x-value of this line,    
    for(i=0; i<vertsPerLine; i++, v++, idx += this.floatsPerVertex) 
    { // for every vertex in this line,  find x,y,z,w;  r,g,b,a;
      // and store them sequentially in vertSet[] array.
      // We already know  xNow; find yNow:
      switch(i) { // find y coord value for each vertex in this line:
        case 0: yNow = -this.xyMax;   break;  // start of 1st line-segment;
        case 1:                               // end of 1st line-segment, and
        case 2: yNow = -this.xyMax/2; break;  // start of 2nd line-segment;
        case 3:                               // end of 2nd line-segment, and
        case 4: yNow = 0.0;           break;  // start of 3rd line-segment;
        case 5:                               // end of 3rd line-segment, and
        case 6: yNow = this.xyMax/2;  break;  // start of 4th line-segment;
        case 7: yNow = this.xyMax;    break;  // end of 4th line-segment.
        default: 
          console.log("VBObox0.appendGroundGrid() !ERROR! **X** line out-of-bounds!!\n\n");
        break;
      } // set all values for this vertex:
      gndVerts[idx  ] = xNow;            // x value
      gndVerts[idx+1] = yNow;            // y value
      gndVerts[idx+2] = 0.0;             // z value
      gndVerts[idx+3] = 1.0;             // w;
      gndVerts[idx+4] = colrNow[0];  // r
      gndVerts[idx+5] = colrNow[1];  // g
      gndVerts[idx+6] = colrNow[2];  // b
      gndVerts[idx+7] = colrNow[3];  // a;
    }
  }
  //----------------------------------------------------------------------------
  // 2nd BIG LOOP: makes all lines of constant-y
  for(line=0; line<this.yCount; line++) {   // for every line of constant y,
    colrNow = vec4.scaleAndAdd(             // find the color of this line,
              colrNow, this.yBgnColr, yColrStep, line);	
    yNow = -this.xyMax + (line*ygap);       // find the y-value of this line,    
    for(i=0; i<vertsPerLine; i++, v++, idx += this.floatsPerVertex) 
    { // for every vertex in this line,  find x,y,z,w;  r,g,b,a;
      // and store them sequentially in vertSet[] array.
      // We already know  yNow; find xNow:
      switch(i) { // find y coord value for each vertex in this line:
        case 0: xNow = -this.xyMax;   break;  // start of 1st line-segment;
        case 1:                               // end of 1st line-segment, and
        case 2: xNow = -this.xyMax/2; break;  // start of 2nd line-segment;
        case 3:                               // end of 2nd line-segment, and
        case 4: xNow = 0.0;           break;  // start of 3rd line-segment;
        case 5:                               // end of 3rd line-segment, and
        case 6: xNow = this.xyMax/2;  break;  // start of 4th line-segment;
        case 7: xNow = this.xyMax;    break;  // end of 4th line-segment.
        default: 
          console.log("VBObox0.appendGroundGrid() !ERROR! **Y** line out-of-bounds!!\n\n");
        break;
      } // Set all values for this vertex:
      gndVerts[idx  ] = xNow;            // x value
      gndVerts[idx+1] = yNow;            // y value
      gndVerts[idx+2] = 0.0;             // z value
      gndVerts[idx+3] = 1.0;             // w;
      gndVerts[idx+4] = colrNow[0];  // r
      gndVerts[idx+5] = colrNow[1];  // g
      gndVerts[idx+6] = colrNow[2];  // b
      gndVerts[idx+7] = colrNow[3];  // a;
    }
  }


  /*
   // SIMPLEST-POSSIBLE vertSet[] array:
    var vertSet = new Float32Array([    // a vertSet[] array of just 1 green line:
        -1.00, 0.50, 0.0, 1.0,  	0.0, 1.0, 0.0, 1.0,	// GREEN
         1.00, 0.50, 0.0, 1.0,  	0.0, 1.0, 0.0, 1.0,	// GREEN
       ], this.vboContents.length);
    vertCount = 2;
  */
    // Make a new array (local) big enough to hold BOTH vboContents & vertSet:
  var tmp = new Float32Array(this.vboContents.length + gndVerts.length);
  tmp.set(this.vboContents, 0);     // copy old VBOcontents into tmp, and
  tmp.set(gndVerts,this.vboContents.length); // copy new vertSet just after it.
  this.vboVerts += gndVertCount;       // find number of verts in both.
  this.vboContents = tmp;           // REPLACE old vboContents with tmp
	// (and JS will garbage-collect the old contents)
}

VBObox0.prototype.appendLineCube = function() {
  //==============================================================================
  // Create a set of vertices to draw grid of colored lines that form a unit
  // cube,  centered at x=y=z=0, (vertices at +/- 1 coordinates)
  // and append those vertices to this.vboContents array.
  // Draw these vertices with with gl.GL_LINES primitive.

  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //

}
VBObox0.prototype.appendLineSphere = function() {
  //==============================================================================
  // Create a set of vertices to draw grid of colored lines that form a unit
  // sphere
  // centered at x=y=z=0, and append those vertices to this.vboContents array.
  // Draw these vertices with with gl.GL_LINES primitive.
  this.floatsPerVertex = 8;
  var rr = 1, gg = 0.7, bb = 0.7;
  var n = 20, r = 3, i = 0;

  var sliceAngle = Math.PI/2.0/n;
  var polarAngle = Math.PI*2/n;
  sphVertCount = 2*n*2*(n+1);
  var sphVerts = new Float32Array(sphVertCount*this.floatsPerVertex);
  for (var slice=0; slice<n*2; slice++) {
    var highAngle = Math.PI/2-slice*sliceAngle;
    var lowAngle = highAngle-sliceAngle;
    var highZ = r*Math.sin(highAngle);
    var lowZ = r*Math.sin(lowAngle);
    // side
    for (var v=0; v<2*(n+1); v++,i+=this.floatsPerVertex) {
      if (v%2==0) { //high
        sphVerts[i]   = r*Math.cos(highAngle)*Math.cos(v/2*polarAngle);
        sphVerts[i+1] = r*Math.cos(highAngle)*Math.sin(v/2*polarAngle);
        sphVerts[i+2] = highZ;
        sphVerts[i+3] = 1;
        sphVerts[i+4] = rr;
        sphVerts[i+5] = gg;
        sphVerts[i+6] = bb;
        sphVerts[i+7] = 1;
      } else {  //low
        sphVerts[i]   = r*Math.cos(lowAngle)*Math.cos((v+1)/2*polarAngle);
        sphVerts[i+1] = r*Math.cos(lowAngle)*Math.sin((v+1)/2*polarAngle);
        sphVerts[i+2] = lowZ;
        sphVerts[i+3] = 1;
        sphVerts[i+4] = rr;
        sphVerts[i+5] = gg;
        sphVerts[i+6] = bb;
        sphVerts[i+7] = 1;
      }
    }
  }
  // Make a new array (local) big enough to hold BOTH vboContents & vertSet:
  var tmp = new Float32Array(this.vboContents.length + sphVerts.length);
  tmp.set(this.vboContents, 0);     // copy old VBOcontents into tmp, and
  tmp.set(sphVerts,this.vboContents.length); // copy new vertSet just after it.
  this.vboVerts += sphVertCount;       // find number of verts in both.
  this.vboContents = tmp;           // REPLACE old vboContents with tmp
  // (and JS will garbage-collect the old contents)

}

VBObox0.prototype.init = function() {
  //==============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) If shader uses texture-maps, create and load them and their samplers,
  // d) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // -------------------
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  //--------------------

  // a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //    use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c) Make/Load Texture Maps & Samplers:------------------------------------------
		//  NONE.
		// see VBObox1.prototype.init = function() below for a working example)

  // d1) Find All Attributes and Uniforms:--------------------------------------
  this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
 	this.a_ColorLoc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
	this.u_mvpMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_mvpMat');
  this.u_mdlMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_mdlMat');
  // this.u_normalMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_normalMat');
  // this.u_PHONG = gl.getUniformLocation(this.shaderLoc, 'u_PHONG');
  // this.u_MatlSet.uK_emit = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet.emit');
  // this.u_MatlSet.uK_ambi = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet.ambi');
  // this.u_MatlSet.uK_diff = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet.diff');
  // this.u_MatlSet.uK_spec = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet.spec');
  // this.u_MatlSet.uK_shiny = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet.shiny');
  // this.u_LampHead.uI_pos = gl.getUniformLocation(this.shaderLoc, 'u_LampHead.pos');
  // this.u_LampHead.uI_ambi = gl.getUniformLocation(this.shaderLoc, 'u_LampHead.ambi');
  // this.u_LampHead.uI_diff = gl.getUniformLocation(this.shaderLoc, 'u_LampHead.diff');
  // this.u_LampHead.uI_spec = gl.getUniformLocation(this.shaderLoc, 'u_LampHead.spec');
  // this.u_LampPoint.uI_pos = gl.getUniformLocation(this.shaderLoc, 'u_LampPoint.pos');
  // this.u_LampPoint.uI_ambi = gl.getUniformLocation(this.shaderLoc, 'u_LampPoint.ambi');
  // this.u_LampPoint.uI_diff = gl.getUniformLocation(this.shaderLoc, 'u_LampPoint.diff');
  // this.u_LampPoint.uI_spec = gl.getUniformLocation(this.shaderLoc, 'u_LampPoint.spec');
}

VBObox0.prototype.switchToMe = function() {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.

  // a) select our shader program:
  gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
										this.vboLoc);			    // the ID# the GPU uses for our VBO.

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PositionLoc,//index == ID# for the attribute var in your GLSL shader pgm;
		this.vboFcount_a_Position,// # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,			// type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Position);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with position).
  gl.vertexAttribPointer(this.a_ColorLoc, this.vboFcount_a_Color, 
                        gl.FLOAT, false, 
                        this.vboStride, this.vboOffset_a_Color);
  							
  // --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PositionLoc);
  gl.enableVertexAttribArray(this.a_ColorLoc);
}

VBObox0.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

  var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function() {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  
	// Adjust values for our uniforms:

  // NEW glMatrix version:
  // SURPRISE! the mat4 'perspective()' and 'lookAt()' fcns ignore / overwrite
  //            any previous matrix contents. You have to do your own matrix
  //            multiply to combine the perspective and view matrices:
  var camProj = mat4.create();  
  var camView = mat4.create(); 
  mat4.frustum(camProj, -1.0, 1.0,    // left, right
                        -1.0, 1.0,    // bottom, top
                        1.0, 100.0);   // near, far
  mat4.lookAt(camView, gui.camEyePt, gui.camAimPt, gui.camUpVec);
  mat4.multiply(this.mvpMat, camProj, camView);
  mat4.identity(this.mdlMat);
}

VBObox0.prototype.draw = function() {
  //=============================================================================
  // Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  
  // ----------------------------Draw the contents of the currently-bound VBO:
  
  pushMatrix(this.mdlMat);
  pushMatrix(this.mvpMat);
  // draw axis and ground
  mat4.translate(this.mdlMat, this.mdlMat, vec3.fromValues(0,0,1));
  mat4.multiply(this.mvpMat, this.mvpMat, this.mdlMat);
  // mat4.invert(this.normalMat, this.mdlMat);
  // mat4.transpose(this.normalMat, this.normalMat);
  gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat); 
  gl.uniformMatrix4fv(this.u_mdlMatLoc, false, this.mdlMat); 
  // gl.uniformMatrix4fv(this.u_normalMatLoc, false, this.normalMat); 
  gl.drawArrays(gl.LINES, 	    // select the drawing primitive to draw,
  								0, 								// location of 1st vertex to draw;
  								6);		// number of vertices to draw on-screen.
  gl.drawArrays(gl.LINES, 6, gndVertCount);

  // draw sphere1
  this.mvpMat = popMatrix();
  this.mdlMat = popMatrix();
  pushMatrix(this.mdlMat);
  pushMatrix(this.mvpMat);
  mat4.translate(this.mdlMat, this.mdlMat, vec3.fromValues(-3,1,4));
  mat4.multiply(this.mvpMat, this.mvpMat, this.mdlMat);
  // mat4.invert(this.normalMat, this.mdlMat);
  // mat4.transpose(this.normalMat, this.normalMat);
  gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat); 
  gl.uniformMatrix4fv(this.u_mdlMatLoc, false, this.mdlMat); 
  // gl.uniformMatrix4fv(this.u_normalMatLoc, false, this.normalMat); 
  gl.drawArrays(gl.LINES, 6+gndVertCount, sphVertCount);

  // draw sphere2
  this.mvpMat = popMatrix();
  this.mdlMat = popMatrix();
  pushMatrix(this.mdlMat);
  pushMatrix(this.mvpMat);
  mat4.translate(this.mdlMat, this.mdlMat, vec3.fromValues(-1,-6,4));
  mat4.multiply(this.mvpMat, this.mvpMat, this.mdlMat);
  // mat4.invert(this.normalMat, this.mdlMat);
  // mat4.transpose(this.normalMat, this.normalMat);
  gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat); 
  gl.uniformMatrix4fv(this.u_mdlMatLoc, false, this.mdlMat); 
  // gl.uniformMatrix4fv(this.u_normalMatLoc, false, this.normalMat); 
  gl.drawArrays(gl.LINES, 6+gndVertCount, sphVertCount);

  // draw sphere3
  this.mvpMat = popMatrix();
  this.mdlMat = popMatrix();
  pushMatrix(this.mdlMat);
  pushMatrix(this.mvpMat);
  mat4.translate(this.mdlMat, this.mdlMat, vec3.fromValues(-4.5,-3.5,2));
  mat4.scale(this.mdlMat, this.mdlMat, vec3.fromValues(0.33,0.33,0.33));
  mat4.multiply(this.mvpMat, this.mvpMat, this.mdlMat);
  // mat4.invert(this.normalMat, this.mdlMat);
  // mat4.transpose(this.normalMat, this.normalMat);
  gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat); 
  gl.uniformMatrix4fv(this.u_mdlMatLoc, false, this.mdlMat); 
  // gl.uniformMatrix4fv(this.u_normalMatLoc, false, this.normalMat); 
  gl.drawArrays(gl.LINES, 6+gndVertCount, sphVertCount);

  // draw sphere4
  this.mvpMat = popMatrix();
  this.mdlMat = popMatrix();
  pushMatrix(this.mdlMat);
  pushMatrix(this.mvpMat);
  mat4.translate(this.mdlMat, this.mdlMat, vec3.fromValues(-6,-4.5,1.5));
  mat4.scale(this.mdlMat, this.mdlMat, vec3.fromValues(0.33/2,0.33/2,0.33/2));
  mat4.multiply(this.mvpMat, this.mvpMat, this.mdlMat);
  // mat4.invert(this.normalMat, this.mdlMat);
  // mat4.transpose(this.normalMat, this.normalMat);
  gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat); 
  gl.uniformMatrix4fv(this.u_mdlMatLoc, false, this.mdlMat); 
  // gl.uniformMatrix4fv(this.u_normalMatLoc, false, this.normalMat); 
  gl.drawArrays(gl.LINES, 6+gndVertCount, sphVertCount);

    // draw sphere5
  this.mvpMat = popMatrix();
  this.mdlMat = popMatrix();
  pushMatrix(this.mdlMat);
  pushMatrix(this.mvpMat);
  mat4.translate(this.mdlMat, this.mdlMat, vec3.fromValues(1,0,8.5));
  mat4.scale(this.mdlMat, this.mdlMat, vec3.fromValues(0.66, 0.66, 0.66));
  mat4.multiply(this.mvpMat, this.mvpMat, this.mdlMat);
  // mat4.invert(this.normalMat, this.mdlMat);
  // mat4.transpose(this.normalMat, this.normalMat);
  gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat); 
  gl.uniformMatrix4fv(this.u_mdlMatLoc, false, this.mdlMat); 
  // gl.uniformMatrix4fv(this.u_normalMatLoc, false, this.normalMat); 
  gl.drawArrays(gl.LINES, 6+gndVertCount, sphVertCount);

}

VBObox0.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU inside our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO

}
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox1() { // (JUST ONE instance: as 'rayView' var 
                      // that shows ray-traced image-on-screen as a texture map
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  'attribute vec4 a_Position;\n' +	
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  //
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +							// set default precision
  //
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  //
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

	this.vboContents = //--------------------- 
	new Float32Array ([					// Array of vertex attribute values we will
                              // transfer to GPU's vertex buffer object (VBO);
    // Quad vertex coordinates(x,y in CVV); texture coordinates tx,ty
    -1.00,  1.00,   	0.0, 1.0,			// upper left corner  (borderless)
    -1.00, -1.00,   	0.0, 0.0,			// lower left corner,
     1.00,  1.00,   	1.0, 1.0,			// upper right corner,
     1.00, -1.00,   	1.0, 0.0,			// lower left corner.
		 ]);

	this.vboVerts = 4;							// # of vertices held in 'vboContents' array;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Position = 2;  // # of floats in the VBO needed to store the
                                  // attribute named a_Pos1. (2: x,y values)
  this.vboFcount_a_TexCoord = 2;  // # of floats for this attrib (r,g,b values)
  console.assert((this.vboFcount_a_Position +     // check the size of each and
                  this.vboFcount_a_TexCoord) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Position = 0;  //# of bytes from START of vbo to the START
	                                // of 1st a_Position attrib value in vboContents[]
  this.vboOffset_a_TexCoord = (this.vboFcount_a_Position) * this.FSIZE;  
                                // == 2 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_TexCoord attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PositionLoc;				    // GPU location: shader 'a_Position' attribute
	this.a_TexCoordLoc;						// GPU location: shader 'a_TexCoord' attribute

	            //---------------------- Uniform locations &values in our shaders
/*	// Using glmatrix.js:   ***NOT NEEDED** for this VBObox; 
	//						because it draws a texture-mapped image in the CVV.
	this.mvpMat = mat4.create();	    // Transforms CVV axes to model axes.
	this.u_mvpMatLoc;					// GPU location for u_mvpMat uniform
*/
  this.u_TextureLoc;            // GPU location for texture map (image)
  this.u_SamplerLoc;            // GPU location for texture sampler
};

VBObox1.prototype.init = function() {
  //==============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) If shader uses texture-maps, create and load them and their samplers.
  // d) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // -------------------
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  //--------------------
  // a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.
  											
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c) Make/Load Texture Maps & Samplers:----------------------------------------
  this.u_TextureLoc = gl.createTexture(); // Create object in GPU memory to
                                          // to hold texture image.
  if (!this.u_TextureLoc) {
    console.log(this.constructor.name + 
    						'.init() Failed to create the texture object on the GPU');
    return -1;	// error exit.
  }
  // Get the GPU location for the texture sampler assigned to us (as uniform) 
  var u_SamplerLoc = gl.getUniformLocation(this.shaderLoc, 'u_Sampler');
  if (!u_SamplerLoc) {
    console.log(this.constructor.name + 
    						'.init() Failed to find GPU location for texture u_Sampler');
    return -1;	// error exit.
  }

  // Fill our global floating-point image object 'g_myPic' with a initialized pattern.
  g_myScene.makeRayTracedImage();

  // Enable texture unit0 for our use
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object we made in initTextures() to the target
  gl.bindTexture(gl.TEXTURE_2D, this.u_TextureLoc);
  // allocate memory and load the texture image into the GPU
  gl.texImage2D(gl.TEXTURE_2D,    //  'target'--the use of this texture
				0, 									//  MIP-map level (default: 0)
				gl.RGB, 					  // GPU's data format (RGB? RGBA? etc)
              g_myScene.myPic.xSiz,         // texture image width in pixels
              g_myScene.myPic.ySiz,         // texture image height in pixels.
							0,									// byte offset to start of data
  						gl.RGB, 					  // source/input data format (RGB? RGBA?)
  						gl.UNSIGNED_BYTE,	  // data type for each color channel				
              g_myScene.myPic.iBuf);        // 8-bit RGB image data source.
  // Set the WebGL texture-filtering parameters
  gl.texParameteri(gl.TEXTURE_2D,		// texture-sampling params: 
  						     gl.TEXTURE_MIN_FILTER, 
  						     gl.LINEAR);
  // Set the texture unit 0 to be driven by our texture sampler:
  gl.uniform1i(this.u_SamplerLoc, 0);
 
  // d1) Find All Attributes:-----------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
  this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
  if(this.a_PositionLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Position');
    return -1;	// error exit.
  }
 	this.a_TexCoordLoc = gl.getAttribLocation(this.shaderLoc, 'a_TexCoord');
  if(this.a_TexCoordLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_TexCoord');
    return -1;	// error exit.
  }
  // d2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
  /* NONE yet...
   this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
    if (!this.u_ModelMatrixLoc) { 
      console.log(this.constructor.name + 
      						'.init() failed to get GPU location for u_ModelMatrix uniform');
      return;
    }
  */
}

VBObox1.prototype.switchToMe = function () {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.

  // a) select our shader program:
  gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
  
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PositionLoc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Position, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Position);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).
  gl.vertexAttribPointer(this.a_TexCoordLoc, this.vboFcount_a_TexCoord,
                         gl.FLOAT, false, 
  						           this.vboStride,  this.vboOffset_a_TexCoord);
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_PositionLoc);
  gl.enableVertexAttribArray(this.a_TexCoordLoc);
}

VBObox1.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

  var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox1.prototype.adjust = function() {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }
  /* NONE!
  	// Adjust values for our uniforms,
    this.ModelMatrix.setRotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,
    this.ModelMatrix.translate(0.35, -0.15, 0);						// then translate them.
    //  Transfer new uniforms' values to the GPU:-------------
    // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    										false, 										// use matrix transpose instead?
    										this.ModelMatrix.elements);	// send data from Javascript.
  */
}

VBObox1.prototype.draw = function() {
  //=============================================================================
  // Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
  
  // ----------------------------Draw the contents of the currently-bound VBO:
  gl.drawArrays(gl.TRIANGLE_STRIP, // select the drawing primitive to draw:
                  // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                  //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
  							0, 								// location of 1st vertex to draw;
  							this.vboVerts);		// number of vertices to draw on-screen.
}


VBObox1.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.reload() call you needed to call this.switchToMe()!!');
  }

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO

// Modify/update the contents of the texture map(s) stored in the GPU;
// Copy current contents of CImgBuf object 'g_myPic'  (see initTextures() above)
// into the existing texture-map object stored in the GPU:

  gl.texSubImage2D(gl.TEXTURE_2D, 	//  'target'--the use of this texture
  							0, 							//  MIP-map level (default: 0)
  							0,0,						// xoffset, yoffset (shifts the image)
								g_myScene.myPic.xSiz,			// image width in pixels,
								g_myScene.myPic.ySiz,			// image height in pixels,
  							gl.RGB, 				// source/input data format (RGB? RGBA?)
  							gl.UNSIGNED_BYTE, 	// data type for each color channel				
								g_myScene.myPic.iBuf);	  // texture-image data source.
}


/*
VBObox1.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox1.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
//=============================================================================

var __cuon_matrix_mod_stack = [];
function pushMatrix(mat) {
  var temp = mat4.create();
  __cuon_matrix_mod_stack.push(mat4.copy(temp,mat));
}
function popMatrix() {
  return __cuon_matrix_mod_stack.pop();
}
