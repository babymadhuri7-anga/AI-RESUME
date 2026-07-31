const resumeInput = document.getElementById("resumeInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const resultBox = document.getElementById("resultBox");
const score = document.getElementById("score");
const skillList = document.getElementById("skillList");
const suggestionList = document.getElementById("suggestionList");

const skills = [
    "html","css","javascript","java","python","c","c++",
    "sql","mysql","mongodb","react","node","express",
    "flask","django","bootstrap","git","github",
    "aws","azure","linux","machine learning",
    "data science","artificial intelligence",
    "communication","leadership","teamwork",
    "problem solving","excel","power bi"
];

analyzeBtn.addEventListener("click", () => {

    if (resumeInput.files.length === 0) {
        alert("Please upload a PDF or DOCX resume.");
        return;
    }

    const file = resumeInput.files[0];
    const extension = file.name.split(".").pop().toLowerCase();

    if (extension === "pdf") {
        readPDF(file);
    } else if (extension === "docx") {
        readDOCX(file);
    } else {
        alert("Only PDF and DOCX files are supported.");
    }

});

async function readPDF(file){

    const reader = new FileReader();

    reader.onload = async function(){

        const typedarray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        let text="";

        for(let i=1;i<=pdf.numPages;i++){

            const page=await pdf.getPage(i);

            const content=await page.getTextContent();

            content.items.forEach(item=>{
                text += item.str + " ";
            });

        }

        analyzeResume(text);

    };

    reader.readAsArrayBuffer(file);

}

function readDOCX(file){

    const reader=new FileReader();

    reader.onload=function(event){

        mammoth.extractRawText({
            arrayBuffer:event.target.result
        }).then(function(result){

            analyzeResume(result.value);

        });

    };

    reader.readAsArrayBuffer(file);

}

function analyzeResume(text){

    text=text.toLowerCase();

    let found=[];

    skills.forEach(skill=>{

        if(text.includes(skill)){
            found.push(skill);
        }

    });

    const totalSkills = skills.length;
    
    const detectedSkills = found.length;
    let ats= Math.round((detectedSkills / totalSkills) *100);

    ats += found.length*2;

    if(text.includes("education")) ats+=10;
    if(text.includes("experience")) ats+=10;
    if(text.includes("projects")) ats+=10;
    if(text.includes("skills")) ats+=10;
    if(text.includes("certification")) ats+=5;
    if(text.includes("objective")) ats+=5;

    if(ats>100) ats=100;

    score.innerHTML=ats+"%";
    const circle = document.querySelector(".circle");
    circle.style.background = `
    conic-gradient(
        #22c55e 0% ${ats}%,
        #e5e7eb ${ats}% 100%
    )
`;

    skillList.innerHTML="";

    if(found.length===0){

        skillList.innerHTML="<p>No skills detected.</p>";

    }else{

        found.forEach(skill=>{

            skillList.innerHTML+=
            `<div class="skill">${skill}</div>`;

        });

    }

    let suggestions=[];

    if(!text.includes("objective"))
        suggestions.push("Add a Career Objective section.");

    if(!text.includes("projects"))
        suggestions.push("Include Academic or Personal Projects.");

    if(!text.includes("experience"))
        suggestions.push("Mention internships or work experience.");

    if(!text.includes("certification"))
        suggestions.push("Add Certifications to strengthen your resume.");

    if(found.length<8)
        suggestions.push("Include more technical skills relevant to your domain.");

    if(!text.includes("github"))
        suggestions.push("Add your GitHub profile.");

    if(!text.includes("linkedin"))
        suggestions.push("Add your LinkedIn profile.");

    suggestionList.innerHTML="";

    suggestions.forEach(item=>{

        suggestionList.innerHTML+=`<li>${item}</li>`;

    });

    resultBox.style.display="block";

}