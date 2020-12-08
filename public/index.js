const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

// progress
const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");

//copy to clipboard
const sharingContainer = document.querySelector(".sharing-container");
const fileURL = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyURLBtn");

//Email form submit 
const emailForm = document.querySelector("#emailForm");

//Toast message
const toast = document.querySelector('.toast')

const baseURL = "https://innshare.herokuapp.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();

  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  console.table(files);
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

fileInput.addEventListener("change", (e) => {
  uploadFile();
});

browseBtn.addEventListener("click", (e) => {
  fileInput.click();
});

const uploadFile = () => {
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("myfile", file);

  //show the uploader
  progressContainer.style.display = "block";

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      showLink(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;

  xhr.upload.onerror = () =>{
    fileInput.value = ""
    showToast(`Error in upload : ${xhr.statusText}`)
  }

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = (e) => {
  let percent = Math.round((100 * e.loaded) / e.total);
  console.log(percent);

  progressPercent.innerText = percent;
  const scaleX = `scaleX(${percent / 100})`;
  bgProgress.style.transform = scaleX;
  progressBar.style.transform = scaleX;
};


//copy link
const showLink = ({ file:url }) => {
  console.log(url);

    // remove the disabled attribute from form btn & make text send
    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";

  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURL.value = url
};

copyBtn.addEventListener("click", ()=>{
  fileURL.select();
  document.execCommand('copy')
  showToast("Link coppied successfully")
})

emailForm.addEventListener("submit", (e)=>{
  e.preventDefault()

    // disable the button
    emailForm[2].setAttribute("disabled", "true");
    emailForm[2].innerText = "Sending";

  const url = fileURL.value

  const formData = {
    uuid: url.split("/").splice(-1,1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value
  }

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      showToast("Email sen't successfully")
      sharingContainer.style.display = "none"; // hide the box
    }
  });
})

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  // toast.style.background = "red"
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};

// showToast("hello world")