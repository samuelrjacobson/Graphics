#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord.xy / iResolution.xy;    // range 0 to 1

    uv -= 0.5;  // range -0.5 to 0.5
    uv.x *= iResolution.x / iResolution.y;

    float d = length(uv); // distance
    //float c = d;
    float r = 0.3;
    float c = smoothstep(r, r-0.05, d);

    //if(d < 0.3) c = 1.0; else c = 0.0;


    // Output to screen
    fragColor = vec4(vec3(c), 1.0);
}

// main - just calls the ShaderToy mainImage to help with code compatibility
void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}


/*
#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}

// main - just calls the ShaderToy mainImage to help with code compatibility
void main() 
{ 
    mainImage(fragColor, gl_FragCoord.xy);
}*/