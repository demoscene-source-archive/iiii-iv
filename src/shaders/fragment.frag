// clocksplosion
// way of the exploding clock
//

/*
just ticking
clock is shown but is out of focus
some blackness
clock is shown in-focus, low-pitch metallic noises start
a few shots of the clock
spinning wheels are shown, bass beat starts at same time
back to clock and to wheels again
high-pitch metallic noises start along with flowing colours seen in reflections of wheels
music stops, reverberates as hands and wheels are stopped
a brief silence
the clock explodes in a shower of cycling colours
camera shows clock front-on, goes in to it
the inside of the clock is revealed to be a warping mass of colour
the audio is bitcrushed away as the swarm of colour is blown away like wisps of smoke
end
*/


/*
some clocks have their fourth numeral written "IIII", while
other have it written "IV".

no-one knows why.
*/


#version 130

uniform sampler2D tex1;

float pi=3.1416;
float iTime=gl_TexCoord[0].x/44100-12.5;

vec2 intersectSphere(vec3 ro, vec3 rd)
{
    float a = dot(rd, rd), b = 2 * dot(rd, ro),
        c = dot(ro, ro) - 1, desc = b * b - 4 * a * c;

    c = sqrt(desc);

    return desc < 0 ? vec2(-1) : (-b + vec2(-c, c)) / (2 * a);
}

vec3 envmap(vec3 p)
{
    vec3 nc=vec3(.1);
    for(int i=0;++i<7;)
        nc=mix(nc,vec3(.5+.5*cos(i/3.))*1.3,max((dot(normalize(vec3(cos(i*7.5),sin(i*2.),cos(i*3.)+.5)),
                                                                 p/length(p))-
                                                             (.8+.2*pow(.5+.5*cos(i*5.),.5)))/.01,0));

    p=cos(p*10);return nc+dot(p,p)*.1;
}

float noise(vec2 p)
{
	return fract(sin(float((int(p.x)*13496^int(p.y)*8499)%89))*43.);
}

float smoothNoise2(vec2 p)
{
    return mix( mix(noise(p), noise(p + vec2(1, 0)), fract(p.x)), 
               mix(noise(p + vec2(0, 1)), noise(p + vec2(1, 1)), fract(p.x)), fract(p.y));
}

mat2 rotmat(float a)
{
    return mat2(cos(a),sin(a),-sin(a),cos(a));
}


float numeralI(vec2 p)
{
    p=abs(p);
    return max(.12-length(vec2(max(0,.15-p.x),max(0,p.y-.4))),p.y-.49);
}






float handsSDF(vec2 p5)
{
	p5*=rotmat(2.5);
	float d=max(-p5.x-2.1,max(p5.x-.5,abs(p5.y)-.02-abs(p5.x)*.1*(1-abs(cos(p5.x*3)))));
	
	p5*=rotmat(-2.3);
	d=min(d,max(-p5.x-2.8,max(p5.x-.5,abs(p5.y)-.03-abs(p5.x)*.05*(1-abs(cos(p5.x*3.4))))));

	p5=rotmat(-floor(min(iTime,63.))/60*pi*2)*p5;

	return min(min(d,max(-p5.x-3.3,max(p5.x-.5,abs(p5.y)-.015))),length(p5)-.12);
}

void main()
{
		//for(int x=0;x<4;++x)
		for(int x=0;x++<4;)
		{
			// anti-aliasing loop
			vec2 t=gl_FragCoord.xy/960-vec2(1,.5625);
			vec2 p=t.xy+vec2(x&1,x/2)/1500;
			vec2 b=p.xy;
			if(abs(t.y)<.45)
			{
                float otime=iTime+x*.01;
				float exptime=otime-69.5;
				float exptime2=mod(exptime,2.4);
				float expcell=floor(max(exptime,0)/2.4);
				float tcell=floor(otime/12);
				float t0=0,t1=0;
				float nearT=20;

				if(exptime>=4.8)
					exptime2=exptime-4.8;
				
				vec3 res=vec3(0);
				vec3 ro=vec3(mod(otime,12)/12-1,-2,22.5),rd=normalize(vec3(p.yx,cos(tcell)-3));
				vec3 bn=res,pbn=res;

				mat2 m=mat2(1);

				  if(exptime >= 4.8)
				  {

					// colourwarp

						for(int i=0,j;i++<100&&length(p.xy)<(exptime-2.4)/4.5;)
						{
						   t0=exptime-4.4-i*.02;

							j=int(b.y*18+floor(t0*3)*.5);
							
							bn=vec3(0,.4,1);
							bn=(abs(b.y)>1.-(t0-16)/10)?pbn:((j%3)==0?bn.yzx:(j%3)==1?bn.zxy:bn)*.01;

							res+=bn*pow(.995,i);
							b+=(vec2(smoothNoise2(b*5+t0), smoothNoise2(b*4-t0))*2-1)*.015;
						}

					  
					  rd=normalize(vec3(p.y,-1.5,-p.x));
						ro=vec3(0,22.5-3.1*exptime2,0);
				}
				else if(exptime > -2.4)
				  {
				   ro=vec3(-.5,-2*expcell,28.5+exptime/3.);
				   rd=normalize(vec3(p.yx,-2));
				   m=rotmat(pi/2+.5+.5*expcell);

					ro.yz*=m;
					rd.yz*=m;

				   m=rotmat(expcell/2-.5);

				}
				else
				{
					m=rotmat(sin(tcell)*.6+pi/2-.25);

					ro.xz*=m;
					rd.xz*=m;

					m=rotmat(cos(tcell)*.4-pi/2-.5+mod(otime,12)/40);
				}
				
					ro.xy*=m;
					rd.xy*=m;
				
				vec3 oro=ro,ord=rd;

					if(otime>44&&mod(otime,12.)>6.&& exptime<-2.4)
					{
						ro/=2;
						// cogs / gears
						for(int j=0,i;j++<2;)
						{
							t1=1;
							for(i=0;i++<20;)
							{
								pbn=ro-vec3(cos(i/3)*7,i/20.1,sin(i/7*.4)*8-1);
								t0=-pbn.y/rd.y;
								if(t0<nearT)
								{
									t1*=.5+.5*min(length(rd*nearT+pbn)-4,1); // shadows
									pbn+=rd*t0;
									if(length(pbn.xz)<4)
									{
										res=.5*envmap(reflect(rd,vec3(step(abs(length(pbn)-2),1.6)* .4*normalize(pbn.xz)*sin(length(pbn.xz*80)),1).yzx)) // reflection
											*(.5+.5*step(smoothNoise2(rotmat(min(otime,63.)*2)*pbn.xz*50),.9)) // dirt
											; // colours
										nearT=t0;
									}
								}
							}
						}
						res*=t1;
				}
				else
				{
				
					pbn=vec3(10,15,10);
					ro = (pbn * -sign(rd) - ro) / rd,
					rd = ro + pbn * sign(rd) / rd * 2;
					b = vec2(max(ro.x, max(ro.y, ro.z)), min(rd.x, min(rd.y, rd.z)));
	
					t1=max(0,b.x);


					// voxelised clock
					
					for(int j = 0; j++ < 35 && t1<b.y;)
					{
						vec2 cp = floor(oro.xz+ord.xz*t1 + ord.xz * .01),
							t = (cp + max(sign(ord.xz), 0) - oro.xz) / ord.xz;

						pbn=bn;
						bn.xz=step(t.yx,t)*-sign(ord.xz);
						t0=t1;
						t1=min(t.x, t.y);


						ro=oro;
						rd=ord;

						if(exptime>0)
						{
							// voxel movement
							ro.y-=(noise(cp)-.5+.1)*8*exptime2*pow(max(0,2.5-length(cp)/(2+min(expcell,2))),2)*1.2;
						}

						rd.y*=8;
						ro.y*=8;

						// outer clock surface
						
						t=intersectSphere(ro*=.1, rd*=.1);

						if(t.x<t.y && t.x<t1 && t.y>t0)
						{
							t.x=max(t.x,t0);

							oro=ro+rd*t.x; // oro is reused here (for rp)
							bn=oro; // bn is reused here (for n)
							bn.y*=8;
							bn/=length(bn);

							// bevelled rim thing
							bn.xz+=normalize(oro.xz)*sin(abs(length(oro.xz)-.85)*100)*clamp(1-abs(length(oro.xz)-.85)*25,0,1);

							if(t0>=t.x)
							{
								res=abs(pbn.z)>abs(pbn.x)?vec3(1,0,0):vec3(0,1,1);
								if(mod(floor(oro.y*2+otime*20),2)>.5)
									res=res.yzx;
								break;
							}

							// cylindrical inner edge
							cp=intersectSphere(ro*vec3(1,0,1)/.85,rd*vec3(1,0,1)/.85); // cp re-purposed here

							// env reflection
							res=envmap(reflect(rd/=length(rd),bn))*(.15+.85*max(1+dot(bn,ord),0));

							if(cp.x<t.x && cp.y>t.x && cp.x<t1)
							{
								oro=ro+rd*-ro.y/rd.y;

								// env reflection
								
								cp=p=oro.xz*vec2(-1,1)*4.758; // cp re-purposed here

								// clockface starts here
								
								t0=max(1-dot(bn,-ord),0); // fr
								t1=atan(p.y,p.x)/(pi*.167)+6; // num
								tcell=6; // d
								// ys -> expcell
								

								// fractalish clockface pattern
								for(int i=0;i++<6;)
								{
									expcell=(abs(fract(dot(p,cos(vec2(0,1.6)+pi/6*i))*1.5)-.5)-.25)/1.5;
									tcell=max(min(tcell,expcell), min(-tcell,-expcell));
								}
								
								tcell=min(min(min(min(length(p)-.02,abs(length(p)-3.54)-.01),abs(length(p)-3.75)-.01),
											max(abs((rotmat(-floor(t1*5+.5)/30*pi)*p).y)-.01,abs(length(p)-3.45)-.05)),
											max(.0013,max(tcell,length(p)-1.08)));

								p*=rotmat(floor(t1+.5)/6*pi);
								
								// roman numerals
								
								p.x+=2.73;

								t1=floor(mod(t1+11.5,12));

								p.y-=.2;

								if(t1==8)
								{
									tcell=min(tcell,numeralI(p.yx)); // the I of the IX
									p.y+=.29;
								}

								if(t1>7.5)
								{
									t=abs(p.yx);
									t.x=abs(t.x-t.y/3.5);

									tcell=min(tcell,numeralI(t)); // all X shapes

									p.y+=.23;
								}

								if(t1>3&&t1<8)
								{
									t=p.yx;
									t.y=-t.y;
									t.x=abs(abs(abs(t.x)-(t.y+.4)/6))+step(0,t.x)*.01;
									tcell=min(tcell,numeralI(t)); // all V shapes
									p.y+=.2;
								}

								if(mod(t1,5)>-.5 && t1!=8)
									tcell=min(tcell,max(max(p.y,numeralI(vec2(mod(p.y,.15)-.075,p.x))),-p.y-.15*mod(t1+1,5))); // all I shapes (except for the I in IX)

								res=min(envmap(reflect(rd,bn))*(.1+.6*t0),.5) + 
									(clamp(min(tcell,handsSDF(cp))/.001,0,1.5)*(.6+.4*smoothstep(-.1,.1,handsSDF(cp-.15)))) * // numerals dist pattern
									(.35+.65*smoothstep(.15,0,length(oro.xz+vec2(.2,-.2))-.8))*(.5-.5*t0)*
									.65*
									sqrt(min(1,length(oro-vec3(normalize(oro.xz)*.855,0).xzy)/.1))+sin(otime*40)*max(0,(otime-78)/8);

							}

							break;
						}

					}
				}
				gl_FragColor+=vec4((res+.01)*1.7*(1-(pow(abs(t.x),4)+pow(abs(t.y*2),4))*.2)*pow(min(otime/6,1),.75), texture(tex1, t*vec2(.5,.8)+.5, x+5.4-floor(otime/10)).a)/4; // +vignet
            }
			
    }
	
	gl_FragColor=vec4(iTime<20?gl_FragColor.aaa*step(3,abs(iTime-12)):sqrt(gl_FragColor.rgb*min(iTime-22,1)),gl_FragColor.r);
}

