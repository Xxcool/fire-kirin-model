import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
const result=await build({entryPoints:['src/viewer.ts'],bundle:true,minify:true,target:'es2020',loader:{'.png':'dataurl'},write:false});
const js=result.outputFiles[0].text.replaceAll('</script','<\\/script');
const html=(await readFile('viewer-template.html','utf8')).replace('<script src="./app.js"></script>','<script>'+js+'</script>');
await writeFile('dist/index.html',html);
console.log('Open dist/index.html');
