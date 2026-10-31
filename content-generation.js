/* Provider-neutral bridge. Configure a server-backed adapter; never put provider keys here. */
(()=>{
'use strict';
let adapter=null;
function requestFor(d){return {version:1,kind:'project-cover',aspectRatio:'9:16',count:3,project:{title:d.title,pitch:d.pitch,description:d.description,category:d.category,direction:d.direction},creativeNote:String(d.contentPrompt||'').slice(0,1200),constraints:{conceptOnly:true,noText:true,noInventedCertification:true}};}
function configure(value){if(value!==null&&typeof value!=='function')throw Error('이미지 생성 어댑터는 함수여야 합니다.');adapter=value;}
async function generate(request,{signal}={}){
 if(!adapter)throw Error('이미지 생성 기능은 아직 연결 전이에요.');
 const result=await adapter(request,{signal});
 if(signal?.aborted)throw new DOMException('취소됐어요.','AbortError');
 if(!Array.isArray(result?.images)||!result.images.length||result.images.length>3)throw Error('이미지 생성 결과를 확인할 수 없어요.');
 for(const image of result.images)if(!(image.blob instanceof Blob)||!['image/png','image/jpeg','image/webp'].includes(image.blob.type)||!image.blob.size||image.blob.size>15*1024*1024)throw Error('생성 이미지 형식이나 크기를 확인해주세요.');
 return result.images.map(image=>({blob:image.blob,alt:String(image.alt||'기획 콘셉트 참고 이미지').slice(0,250)}));
}
window.N00ContentGeneration={configure,requestFor,generate,get available(){return !!adapter;}};
})();
