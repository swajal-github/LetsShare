const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileinput");
const browseBtn = document.querySelector(".browsebtn");

const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");

const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#email-form");
const toast = document.querySelector(".toast");

const maxSize = 1024*1024*3;
const host = "https://inshare-sd.herokuapp.com/";
const uploadUrl = `${host}api/files/`;
const emailurl = `${host}api/files/send/`;
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  console.log(files);
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

copyBtn.addEventListener("click", () => {
  fileURLInput.select();
  document.execCommand("copy");
  showToast("Copied to Clipboard");
});

const uploadFile = () => {
  
if(fileInput.files.length>1){
  fileInput.value="";
  showToast('upload 1 file only');
  return;
}

  const file = fileInput.files[0];

  if(file.size> maxSize){
    showToast("can't upload more than 3 MB");
    fileInput.value="";
    return;
  }
  progressContainer.style.display = "block";
  const formData = new FormData();
  formData.append("myfile", file);
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      showLink(JSON.parse(xhr.response));
    }
  };
  xhr.upload.onprogress = uploadProgress;
xhr.upload.onerror = () =>{
  fileInput.value="";
  showToast(`Error in upload: ${xhr.statusText}`)
}

  xhr.open("POST", uploadUrl);
  xhr.send(formData);
};

const uploadProgress = (e) => {
  const percent = Math.round((e.loaded / e.total) * 100);
  //console.log(percent);
  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
  progressBar.style.transform = `scaleX(${percent / 100})`;
};

const showLink = ({ file: url }) => {
  console.log(url);
  fileInput.value ="";
  emailForm[2].removeAttribute("disabled");
  progressContainer.style.display = "none";
  fileURLInput.value = url;
  sharingContainer.style.display = "block";
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = fileURLInput.value;
  const formdata = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  emailForm[2].setAttribute("disabled","true");

  fetch(emailurl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formdata),
  }).then((res) => res.json())
    .then(({success}) => {
      if(success){
        sharingContainer.style.display="none";
        showToast("Email Sent");
      }
    });
});
let toastTimer;
const showToast = (msg) =>{
  toast.innerText = msg;
  toast.style.transform = "translate(-50%,0)"
clearTimeout(toastTimer);
  toastTimer= setTimeout(()=>{
  toast.style.transform = "translate(-50%,60px)"
  },2000)
};