var MATL_RED_PLASTIC = 		1;
var MATL_GRN_PLASTIC = 		2;
var MATL_BLU_PLASTIC = 		3;
var MATL_BLACK_PLASTIC = 	4;
var MATL_BLACK_RUBBER = 	5;
var MATL_BRASS = 					6;
var MATL_BRONZE_DULL = 		7;
var MATL_BRONZE_SHINY = 	8;
var MATL_CHROME = 				9;
var MATL_COPPER_DULL = 	 10;
var MATL_COPPER_SHINY =  11;
var MATL_GOLD_DULL = 		 12;
var MATL_GOLD_SHINY = 	 13;
var MATL_PEWTER = 			 14;
var MATL_SILVER_DULL = 	 15;
var MATL_SILVER_SHINY =  16;
var MATL_EMERALD = 			 17;
var MATL_JADE = 				 18;
var MATL_OBSIDIAN = 		 19;
var MATL_PEARL = 				 20;
var MATL_RUBY = 				 21;
var MATL_TURQUOISE = 		 22;
var MATL_DEFAULT = 			 23;

function Light() {
	this.isLit = 0;
	this.I_pos = [];		// x,y,z,w:   w==1 for local 3D position,
																// w==0 for light at infinity in direction (x,y,z)
	this.I_ambi = [];		// ambient illumination: r,g,b
	this.I_diff = [];		// diffuse illumination: r,g,b.
	this.I_spec = [];		// specular illumination: r,g,b.

	this.uI_pos = false;						//I_pos
	this.uI_ambi = false;						//I_ambi
	this.uI_diff = false;						//I_diff
	this.uI_spec = false;						//I_spec.
}

Light.prototype.setLight = function(optColor, isLit) {
	this.I_ambi = optColor.I_ambi;
	this.I_diff = optColor.I_diff;
	this.I_spec = optColor.I_spec;
	if (isLit == -1) {
		this.I_diff = [];
		this.I_spec = [];
		this.I_diff.push(0.0, 0.0, 0.0, 0.0);
		this.I_spec.push(0.0, 0.0, 0.0, 0.0);
	}
	return this;
}

function Material(opt_Matl) {
	this.K_emit = [];
	this.K_ambi = [];
	this.K_diff = [];
	this.K_spec = [];
	this.K_shiny = 0.0;
	this.K_name = "Undefined Material";
	this.K_matlNum = 	MATL_DEFAULT;

	this.uK_emit = false;
	this.uK_ambi = false;
	this.uK_diff = false;
	this.uK_spec = false;
	this.uK_shiny = false;

	if(opt_Matl && opt_Matl >=0 && opt_Matl < MATL_DEFAULT)	{
		this.setMatl(opt_Matl);
	}
	return this;
}

Material.prototype.setMatl = function(numMatl) {
	// reset
	this.K_emit = [];
	this.K_ambi = [];
	this.K_diff = [];
	this.K_spec = [];
	this.K_name = [];
	this.K_shiny = 0.0;
	switch(numMatl)
	{
		case MATL_RED_PLASTIC: // 1
			this.K_emit.push(0.0,     0.0,    0.0,    1.0);
			this.K_ambi.push(0.1,     0.1,    0.1,    1.0);
			this.K_diff.push(0.6,     0.0,    0.0,    1.0);
			this.K_spec.push(0.6,     0.6,    0.6,    1.0);
			this.K_shiny = 100.0;
			this.K_name = "MATL_RED_PLASTIC";
			break;
		case MATL_GRN_PLASTIC: // 2
			this.K_emit.push(0.0,     0.0,    0.0,    1.0);
			this.K_ambi.push(0.05,    0.05,   0.05,   1.0);
			this.K_diff.push(0.0,     0.6,    0.0,    1.0);
			this.K_spec.push(0.2,     0.2,    0.2,    1.0);
			this.K_shiny = 60.0;
			this.K_name = "MATL_GRN_PLASTIC";
			break;
		case MATL_BLU_PLASTIC: // 3
			this.K_emit.push(0.0,     0.0,    0.0,    1.0);
			this.K_ambi.push(0.05,    0.05,   0.05,   1.0);
			this.K_diff.push(0.0,     0.2,    0.6,    1.0);
			this.K_spec.push(0.1,     0.2,    0.3,    1.0);
			this.K_shiny = 5.0;
			this.K_name = "MATL_BLU_PLASTIC";
			break;
		case MATL_BLACK_PLASTIC:
			this.K_emit.push(0.0,     0.0,    0.0,    1.0);
			this.K_ambi.push(0.0,     0.0,    0.0,    1.0);
			this.K_diff.push(0.01,    0.01,   0.01,   1.0);
			this.K_spec.push(0.5,     0.5,    0.5,    1.0);
			this.K_shiny = 32.0;
			this.K_name = "MATL_BLACK_PLASTIC";
			break;
		case MATL_BLACK_RUBBER:
			this.K_emit.push(0.0,     0.0,    0.0,    1.0);
			this.K_ambi.push(0.02,    0.02,   0.02,   1.0);
			this.K_diff.push(0.01,    0.01,   0.01,   1.0);
			this.K_spec.push(0.4,     0.4,    0.4,    1.0);
			this.K_shiny = 10.0;
			this.K_name = "MATL_BLACK_RUBBER";
			break;
		case MATL_BRASS:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.329412, 0.223529, 0.027451, 1.0);
			this.K_diff.push(0.780392, 0.568627, 0.113725, 1.0);
			this.K_spec.push(0.992157, 0.941176, 0.807843, 1.0);
			this.K_shiny = 27.8974;
			this.K_name = "MATL_BRASS";
			break;
		case MATL_BRONZE_DULL:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.2125,   0.1275,   0.054,    1.0);
			this.K_diff.push(0.714,    0.4284,   0.18144,  1.0);
			this.K_spec.push(0.393548, 0.271906, 0.166721, 1.0);
			this.K_shiny = 25.6;
			this.K_name = "MATL_BRONZE_DULL";
			break;
		case MATL_BRONZE_SHINY:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.25,     0.148,    0.06475,  1.0);
			this.K_diff.push(0.4,      0.2368,   0.1036,   1.0);
			this.K_spec.push(0.774597, 0.458561, 0.200621, 1.0);
			this.K_shiny = 76.8;
			this.K_name = "MATL_BRONZE_SHINY";
			break;
		case MATL_CHROME:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.25,     0.25,     0.25,     1.0);
			this.K_diff.push(0.4,      0.4,      0.4,      1.0);
			this.K_spec.push(0.774597, 0.774597, 0.774597, 1.0);
			this.K_shiny = 76.8;
			this.K_name = "MATL_CHROME";
			break;
		case MATL_COPPER_DULL:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.19125,  0.0735,   0.0225,   1.0);
			this.K_diff.push(0.7038,   0.27048,  0.0828,   1.0);
			this.K_spec.push(0.256777, 0.137622, 0.086014, 1.0);
			this.K_shiny = 12.8;
			this.K_name = "MATL_COPPER_DULL";
			break;
		case MATL_COPPER_SHINY:
			this.K_emit.push(0.0,      0.0,      0.0,       1.0);
			this.K_ambi.push(0.2295,   0.08825,  0.0275,    1.0);
			this.K_diff.push(0.5508,   0.2118,   0.066,     1.0);
			this.K_spec.push(0.580594, 0.223257, 0.0695701, 1.0);
			this.K_shiny = 51.2;
			this.K_name = "MATL_COPPER_SHINY";
			break;
		case MATL_GOLD_DULL:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.24725,  0.1995,   0.0745,   1.0);
			this.K_diff.push(0.75164,  0.60648,  0.22648,  1.0);
			this.K_spec.push(0.628281, 0.555802, 0.366065, 1.0);
			this.K_shiny = 51.2;
			this.K_name = "MATL_GOLD_DULL";
			break;
		case MATL_GOLD_SHINY:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.24725,  0.2245,   0.0645,   1.0);
			this.K_diff.push(0.34615,  0.3143,   0.0903,   1.0);
			this.K_spec.push(0.797357, 0.723991, 0.208006, 1.0);
			this.K_shiny = 83.2;
			this.K_name = "MATL_GOLD_SHINY";
			break;
		case MATL_PEWTER:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.105882, 0.058824, 0.113725, 1.0);
			this.K_diff.push(0.427451, 0.470588, 0.541176, 1.0);
			this.K_spec.push(0.333333, 0.333333, 0.521569, 1.0);
			this.K_shiny = 9.84615;
			this.K_name = "MATL_PEWTER";
			break;
		case MATL_SILVER_DULL:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.19225,  0.19225,  0.19225,  1.0);
			this.K_diff.push(0.50754,  0.50754,  0.50754,  1.0);
			this.K_spec.push(0.508273, 0.508273, 0.508273, 1.0);
			this.K_shiny = 51.2;
			this.K_name = "MATL_SILVER_DULL";
			break;
		case MATL_SILVER_SHINY:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.23125,  0.23125,  0.23125,  1.0);
			this.K_diff.push(0.2775,   0.2775,   0.2775,   1.0);
			this.K_spec.push(0.773911, 0.773911, 0.773911, 1.0);
			this.K_shiny = 89.6;
			this.K_name = "MATL_SILVER_SHINY";
			break;
		case MATL_EMERALD:
			this.K_emit.push(0.0,     0.0,      0.0,     1.0);
			this.K_ambi.push(0.0215,  0.1745,   0.0215,  0.55);
			this.K_diff.push(0.07568, 0.61424,  0.07568, 0.55);
			this.K_spec.push(0.633,   0.727811, 0.633,   0.55);
			this.K_shiny = 76.8;
			this.K_name = "MATL_EMERALD";
			break;
		case MATL_JADE:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.135,    0.2225,   0.1575,   0.95);
			this.K_diff.push(0.54,     0.89,     0.63,     0.95);
			this.K_spec.push(0.316228, 0.316228, 0.316228, 0.95);
			this.K_shiny = 12.8;
			this.K_name = "MATL_JADE";
			break;
		case MATL_OBSIDIAN:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.05375,  0.05,     0.06625,  0.82);
			this.K_diff.push(0.18275,  0.17,     0.22525,  0.82);
			this.K_spec.push(0.332741, 0.328634, 0.346435, 0.82);
			this.K_shiny = 38.4;
			this.K_name = "MATL_OBSIDIAN";
			break;
		case MATL_PEARL:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.25,     0.20725,  0.20725,  0.922);
			this.K_diff.push(1.0,      0.829,    0.829,    0.922);
			this.K_spec.push(0.296648, 0.296648, 0.296648, 0.922);
			this.K_shiny = 11.264;
			this.K_name = "MATL_PEARL";
			break;
		case MATL_RUBY:
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.1745,   0.01175,  0.01175,  0.55);
			this.K_diff.push(0.61424,  0.04136,  0.04136,  0.55);
			this.K_spec.push(0.727811, 0.626959, 0.626959, 0.55);
			this.K_shiny = 76.8;
			this.K_name = "MATL_RUBY";
			break;
		case MATL_TURQUOISE: // 22
			this.K_emit.push(0.0,      0.0,      0.0,      1.0);
			this.K_ambi.push(0.1,      0.18725,  0.1745,   0.8);
			this.K_diff.push(0.396,    0.74151,  0.69102,  0.8);
			this.K_spec.push(0.297254, 0.30829,  0.306678, 0.8);
			this.K_shiny = 12.8;
			this.K_name = "MATL_TURQUOISE";
			break;
		default:
			// ugly featureless (emissive-only) red:
			this.K_emit.push(0.5, 0.0, 0.0, 1.0); // DEFAULT: ugly RED emissive light only
			this.K_ambi.push(0.0, 0.0, 0.0, 1.0); // r,g,b,alpha  ambient reflectance
			this.K_diff.push(0.0, 0.0, 0.0, 1.0); //              diffuse reflectance
			this.K_spec.push(0.0, 0.0, 0.0, 1.0); //              specular reflectance
			this.K_shiny = 1.0;       // Default (don't set specular exponent to zero!)
			this.K_name = "DEFAULT_RED";
			break;
	}
	return this;
}
