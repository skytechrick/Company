

const divElement = document.createElement("div");


const insideBody = `
    <div id="messageBoxContentDiv">
    <p id="messageBoxContent">Welcome user.</p>
    </div>

    <div id="Loading">
    <img src="/files/images/Loading.gif" alt="Loading">
    </div>`;

divElement.innerHTML = insideBody;
document.body.append(divElement);



const styleElement = document.createElement("style");


const insideHead = `

    #messageBoxContentDiv {
        width: 100vw;
        display: flex;
        justify-content: center;
        position: fixed;
        top: 10px;
        z-index: 1200;
        display: none;
        animation-name: messageBox;
        animation-duration: 3000ms;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
        animation-timing-function: ease-in-out;
        opacity: 1;
    }

    @keyframes messageBox {
        0% {
            opacity: 1;
        }
        80%{
            opacity: 1;
        }
        100% {
            opacity: 0;
            display: none;
        }
        
    }

    #messageBoxContent {

        font-size: 13px;
        background-color: #2828288e;
        color: white;
        padding: 5px 10px;
        border-radius: 40px; 
        text-align: center;
        display: inline-block;
    }


    #Loading {
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1100;
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0px;
        background-color:rgba(79, 79, 79, 0.52);
        display: none;
    }
    #Loading img{
        width: 120px;
    }
`;

styleElement.innerHTML = insideHead;

document.head.append(styleElement);


function message (message = " ") {
    const messageBoxContent = document.getElementById("messageBoxContent");
    messageBoxContent.innerText = message;
    const messageBoxContentDiv = document.getElementById("messageBoxContentDiv");
    messageBoxContentDiv.style.display = "flex";

    setTimeout(() => {
        messageBoxContentDiv.style.display = "none";
    }, 3000);
    
}