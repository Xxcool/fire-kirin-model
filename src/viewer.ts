import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {createCrossFireFireKirinModel} from './createFireKirinModel';
import spec from '../object-sculpt-spec.json';
import headImage from '../textures/head-projected.png';

const canvas=document.querySelector('canvas')!;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
const camera=new THREE.PerspectiveCamera(35,1,.05,100);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=26;controls.target.set(-.8,-.3,0);
scene.add(new THREE.HemisphereLight(0xc4d4ef,0x36251c,.5));
for(const [p,col,intensity] of [[[-3,6,5],0xe7eeff,2.6],[[4,2,5],0xffdca4,1.2],[[1,5,-5],0xadcfff,3.3]] as const){const l=new THREE.DirectionalLight(col,intensity);l.position.set(...p);scene.add(l)}
const model=createCrossFireFireKirinModel({textureSize:256,castShadow:false});scene.add(model);
const runtime=model.userData.sculptRuntime;
const specs=new Map(spec.componentTree.map(c=>[c.id,c]));
const meshes=runtime.meshes as Record<string,THREE.Mesh>;
for(const [id,mesh] of Object.entries(meshes)){
 const c:any=specs.get(id),profile=c?.geometryDescriptor.profile2D;
 if(!profile||id==='root')continue;
 const shape=new THREE.Shape(profile.points.map((p:number[])=>new THREE.Vector2(p[0],p[1])));
 for(const loop of profile.holes||[])shape.holes.push(new THREE.Path(loop.map((p:number[])=>new THREE.Vector2(p[0],p[1]))));
 const bevel=Math.min(c.geometryDescriptor.edgeTreatment?.bevelRadius||.01,profile.depth*.2);
 mesh.geometry.dispose();mesh.geometry=new THREE.ExtrudeGeometry(shape,{depth:profile.depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1});
}
// The root is a hierarchy container, never a visible cube. This is the blockout correction.
if(meshes.root)meshes.root.visible=false;
model.updateMatrixWorld(true);
for(const [id,mesh] of Object.entries(meshes)){
 if(id==='root')continue;
 const c:any=specs.get(id), v=c?.geometryDescriptor.imageMeasuredCorrection;
 if(!v)continue;
 // Fit the observed silhouette in object space, preserving the third dimension.
 const matrix=mesh.matrixWorld.clone();const inverse=matrix.clone().invert();const attr=mesh.geometry.attributes.position;
 const p=new THREE.Vector3();
 for(let i=0;i<attr.count;i++){p.fromBufferAttribute(attr,i).applyMatrix4(matrix);p.x=p.x*v.sx+v.tx;p.y=p.y*v.sy+v.ty;p.applyMatrix4(inverse);attr.setXYZ(i,p.x,p.y,p.z)}
 attr.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
}
// A diagnostic palette preview of the authored specification, not a claim that
// the later material/visual gates have passed. The review route stays map-stripped.
const palette=new Map(spec.materials.map((m:any)=>[m.id,new THREE.MeshPhysicalMaterial({color:m.baseColor,roughness:m.roughness.base,metalness:m.metalness.base,clearcoat:m.id==='wood'?.18:.3,emissive:m.id==='red'?0xff0018:0,emissiveIntensity:m.id==='red'?2:0})]));
for(const [id,mesh] of Object.entries(meshes)){const c:any=specs.get(id);if(c)mesh.material=palette.get(c.material)!;}
// Reference-albedo projection is a draft fitted to the visible head's broadside.
// The mirrored side is explicitly inferred, and its projection is not final QA.
const headTexture=new THREE.TextureLoader().load(headImage);headTexture.colorSpace=THREE.SRGBColorSpace;
const projected=new THREE.MeshStandardMaterial({map:headTexture,metalness:.55,roughness:.38});
for(const id of ['beast-head','cheek-near','cheek-far','jaw-near','jaw-far','brow-near','brow-far']){
 const mesh=meshes[id];if(!mesh)continue;
 const pos=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;const world=mesh.matrixWorld.clone();const p=new THREE.Vector3();
 for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(world);uv.setXY(i,(p.x+1.43)/1.52,(p.y+.536)/1.413)}
 uv.needsUpdate=true;mesh.material=[projected,palette.get('silver')!];
}
const grainCanvas=document.createElement('canvas');grainCanvas.width=512;grainCanvas.height=128;const ctx=grainCanvas.getContext('2d')!;const pixels=ctx.createImageData(512,128);
for(let y=0;y<128;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;const grain=Math.sin(y*.9+Math.sin(x*.013)*3)+.3*Math.sin(y*2.1+x*.017);pixels.data[i]=45+grain*8;pixels.data[i+1]=28+grain*5;pixels.data[i+2]=19+grain*4;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);const woodTexture=new THREE.CanvasTexture(grainCanvas);woodTexture.colorSpace=THREE.SRGBColorSpace;const wood=palette.get('wood')!;wood.map=woodTexture;wood.color.set(0xffffff);wood.needsUpdate=true;
// Keep all source geometry in arbitrary display units, without real-world dimensions.
let interactive=true,spin=false,exploded=0,wire=false;
let selected:THREE.Mesh|undefined;
const partCenters=new Map<string,THREE.Vector3>();
for(const [id,mesh] of Object.entries(meshes)){
 mesh.userData.partId=id;
 if(id==='root')continue;
 const center=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());partCenters.set(id,center);
 mesh.userData.basePosition=mesh.position.clone();
}
function frame(view='hero'){
 model.rotation.set(0,0,0);controls.target.set(-.8,-.28,0);
 const positions:Record<string,number[]>={hero:[-1.8,2,15],side:[-.8,-.28,15],reverse:[-.8,-.28,-15],front:[-15,1,5],top:[-.8,15,.05],detail:[-2.7,1.1,5]};
 camera.position.fromArray(positions[view]||positions.hero);
 if(view==='detail')controls.target.set(-1.5,.15,0);
 controls.update();camera.lookAt(controls.target);
}
frame();
function resize(){const {width,height}=canvas.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);resize();
function draw(){requestAnimationFrame(draw);if(spin)model.rotation.y+=.004;if(interactive)controls.update();renderer.render(scene,camera);(window as any).__IMG2THREEJS_READY__=true}
draw();
function setExplode(value:number){
 exploded=value;
 for(const [id,mesh] of Object.entries(meshes)){
  if(id==='root')continue;
  const c:any=specs.get(id);const assembly=c.assemblyParent!=='root'?c.assemblyParent:id;
  const center=partCenters.get(assembly)||partCenters.get(id)!;
  mesh.position.copy(mesh.userData.basePosition).addScaledVector(new THREE.Vector3((center.x+.8)*.32,center.y*.48,Math.sign(center.z||1)*.38),value);
 }
}
const download=(data:Blob,name:string)=>{const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
async function exportGLB(){
 const angle=model.rotation.clone(),exp=exploded;model.rotation.set(0,0,0);setExplode(0);
 const metadata:Array<[THREE.Object3D,any]>=[];model.traverse(node=>{metadata.push([node,node.userData]);node.userData={partName:node.name,assetStatus:'draft-fan-reconstruction'}});
 try{const result=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});download(new Blob([result as ArrayBuffer],{type:'model/gltf-binary'}),'fire-kirin.glb')}
 finally{for(const [node,data]of metadata)node.userData=data;model.rotation.copy(angle);setExplode(exp)}
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.remove('active'));b.classList.add('active');frame((b as HTMLElement).dataset.view)}));
document.querySelector('#rotate')!.addEventListener('click',e=>{spin=!spin;(e.currentTarget as HTMLElement).classList.toggle('active',spin)});
document.querySelector('#wire')!.addEventListener('click',e=>{wire=!wire;for(const m of Object.values(meshes)){const mats=Array.isArray(m.material)?m.material:[m.material];for(const mat of mats)(mat as THREE.MeshStandardMaterial).wireframe=wire}(e.currentTarget as HTMLElement).classList.toggle('active',wire)});
document.querySelector('#explode')!.addEventListener('input',e=>setExplode(Number((e.target as HTMLInputElement).value)));
document.querySelector('#reset')!.addEventListener('click',()=>{spin=false;setExplode(0);(document.querySelector('#explode') as HTMLInputElement).value='0';frame()});
document.querySelector('#download')!.addEventListener('click',exportGLB);
document.querySelector('#capture')!.addEventListener('click',()=>{renderer.render(scene,camera);canvas.toBlob(b=>b&&download(b,'fire-kirin.png'))});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=[0,0];
canvas.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
canvas.addEventListener('pointerup',e=>{
 if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
 const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(Object.values(meshes).filter(m=>m.visible),false)[0];
 if(hit){selected=hit.object as THREE.Mesh;const id=selected.userData.partId;document.querySelector('#part')!.textContent=id;}
});
const params=new URLSearchParams(location.search);
if(params.has('review')){document.body.classList.add('review');interactive=false;controls.enabled=false;frame(params.get('view')||'side');scene.background=new THREE.Color('#ffffff');for(const mesh of Object.values(meshes))mesh.material=new THREE.MeshStandardMaterial({color:0x757575,roughness:.9,metalness:0});resize()}
(window as any).__IMG2THREEJS_CAPTURE__={setCamera:(c:any)=>{interactive=false;spin=false;controls.enabled=false;if(c.view)frame(c.view);if(c.position){camera.position.fromArray(c.position);camera.lookAt(new THREE.Vector3().fromArray(c.target||[-.8,-.28,0]))}renderer.render(scene,camera)},model,scene,renderer,camera,meshes,exportGLB};
(window as any).__model=model;
setTimeout(()=>{let triangles=0;model.traverse((o:any)=>{if(o.isMesh&&o.visible)triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3});document.querySelector('#triangles')!.textContent=Math.round(triangles).toLocaleString();document.querySelector('#mesh-count')!.textContent=String(Object.values(meshes).filter(m=>m.visible).length)},1000);
