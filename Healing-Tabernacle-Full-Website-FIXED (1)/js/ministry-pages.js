
const confessionText=document.getElementById("confessionText");
const copyBtn=document.getElementById("copyConfession");
if(copyBtn && confessionText) copyBtn.addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(confessionText.innerText);copyBtn.innerHTML='<i class="fa-solid fa-check"></i> Copied';setTimeout(()=>copyBtn.innerHTML='<i class="fa-regular fa-copy"></i> Copy',1800)}catch(e){}
});

const pdfInput=document.getElementById("pdfUpload");
const pdfList=document.getElementById("pdfList");
if(pdfInput && pdfList){
  pdfInput.addEventListener("change",(e)=>{
    [...e.target.files].forEach(file=>{
      if(file.type!=="application/pdf") return;
      const url=URL.createObjectURL(file);
      const item=document.createElement("div");
      item.className="pdf-item";
      item.innerHTML=`<div class="name"><i class="fa-solid fa-file-pdf"></i><span>${file.name}</span></div>
        <a href="${url}" target="_blank">Open PDF <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
      pdfList.prepend(item);
    });
    pdfInput.value="";
  });
}

const audioInput=document.getElementById("audioUpload");
const audioList=document.getElementById("audioList");
if(audioInput && audioList){
  audioInput.addEventListener("change",(e)=>{
    [...e.target.files].forEach(file=>{
      if(!file.type.startsWith("audio/")) return;
      const url=URL.createObjectURL(file);
      const item=document.createElement("div");
      item.className="audio-item";
      item.innerHTML=`<div class="audio-icon"><i class="fa-solid fa-headphones"></i></div>
      <div><h3>${file.name}</h3><p>Audio sermon uploaded for preview in this browser</p></div>
      <audio controls src="${url}"></audio>`;
      audioList.prepend(item);
    });
    audioInput.value="";
  });
}
