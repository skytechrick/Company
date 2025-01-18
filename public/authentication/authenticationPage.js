let count = 120;
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

let queryObject = {};

for (let key of params.keys()) {
    queryObject[key] = params.get(key);
};

console.log(queryObject);


const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);


document.getElementById("firstName").addEventListener("input", function() {
    const firstNameBox = document.getElementById("firstNameBox");
    firstNameBox.style.borderBottom = "1px solid #aaa";
});

document.getElementById("lastName").addEventListener("input", function() {
    const firstNameBox = document.getElementById("firstNameBox");
    firstNameBox.style.borderBottom = "1px solid #aaa";
});
document.getElementById("signupEmail").addEventListener("input", function() {
    const firstNameBox = document.getElementById("signupEmailBox");
    firstNameBox.style.borderBottom = "1px solid #aaa";
});
document.getElementById("signupMobileNumber").addEventListener("input", function() {
    const firstNameBox = document.getElementById("signupMobileNumberBox");
    firstNameBox.style.borderBottom = "1px solid #aaa";
});
document.getElementById("createPassword").addEventListener("input", function() {
    const firstNameBox = document.getElementById("signupCreatePasswordBox");
    firstNameBox.style.borderBottom = "1px solid #aaa";
});
document.getElementById("confirmPassword").addEventListener("input", function() {
    const firstNameBox = document.getElementById("signupConfirmPasswordBox");
    firstNameBox.style.borderBottom = "1px solid #aaa";
});


async function signup() {
    const firstName = document.getElementById("firstName").value;

    if(firstName.length < 3) {
        let firstNameBox = document.getElementById("firstNameBox");
        firstNameBox.style.borderBottom = "3px solid red";
        message("Enter a valid first name.");
        return;
    };
    
    
    let lastName = document.getElementById("lastName").value;
    if(lastName.length < 3) {
        lastName = undefined;
    };

    const mobileNumber = document.getElementById("signupMobileNumber").value;
    if(mobileNumber.length != 10) {
        let signupMobileNumberBox = document.getElementById("signupMobileNumberBox");
        signupMobileNumberBox.style.borderBottom = "3px solid red";
        message("Enter a valid mobile number.");
        return;
    };

    
    const email = document.getElementById("signupEmail").value;

    const isValid = isValidEmail(email);
    if(!isValid) {
        let signupEmailBox = document.getElementById("signupEmailBox");
        signupEmailBox.style.borderBottom = "3px solid red";
        message("Enter a valid email address.");
        return;
    };

    const createPassword = document.getElementById("createPassword").value;
    if(createPassword.length < 8) {
        let signupCreatePasswordBox = document.getElementById("signupCreatePasswordBox");
        signupCreatePasswordBox.style.borderBottom = "3px solid red";
        message("Password must be at least 8 characters long.");
        return;
    };

    const confirmPassword = document.getElementById("confirmPassword").value;

    if(createPassword !== confirmPassword) {
        let signupConfirmPasswordBox = document.getElementById("signupConfirmPasswordBox");
        signupConfirmPasswordBox.style.borderBottom = "3px solid red";
        message("Passwords do not match.");
        return;
    };

    if(firstName.length < 3 || mobileNumber.length != 10 || createPassword.length < 8 || createPassword !== confirmPassword) {
        message("Please enter valid details.");
        return;
    };

    const password = confirmPassword;

    const obj = {
        firstName,
        lastName,
        mobileNumber,
        email,
        password,
    };

    document.getElementById("Loading").style.display = "flex";
    await fetch("/api/v1/authentication/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
    }).then((response) => {
        document.getElementById("Loading").style.display = "none";
        return response.json();
    }).then((data) => {
        message(data.message);
        const OTPBtnDiv = document.getElementById("OTPBtnDiv");
        OTPBtnDiv.innerHTML = `
            <button id="signupOTPBtn" onclick="signupOTP()">Verify</button>
        `;
        
        const SignupOtp = document.getElementById("SignupOtp");
        SignupOtp.style.display = "flex";

        const CountDown = document.getElementById("CountDown");
        const Running = setInterval(() => {

            count = count - 1;
            CountDown.innerHTML = count;

            if(count == 0){
                
                count = 120;
                clearInterval(Running);
            };
        }, 1000);

    }).catch((error) => {
        message(error.message);
    });
};


async function login() {

    const email = document.getElementById("loginEmail").value;

    if(!isValidEmail(email)) {
        message("Enter a valid email address.");
        return;
    };


    const password = document.getElementById("loginPassword").value;

    if(password.length < 8) {
        message("Password must be at least 8 characters long.");
        return;
    };


    const obj = {
        email,
        password,
    };

    document.getElementById("Loading").style.display = "flex";
    await fetch("/api/v1/authentication/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
    }).then((response) => {
        document.getElementById("Loading").style.display = "none";
        return response.json()
    }).then((data) => {
        let isOtp = data.message == "OTP sent to your email address.";
        message(data.message);
        if(isOtp) {
            const OTPBtnDiv = document.getElementById("OTPBtnDiv");
            OTPBtnDiv.innerHTML = `
                <button id="signupOTPBtn" onclick="loginOTP()">Verify</button>
            `;
            
            const SignupOtp = document.getElementById("SignupOtp");
            SignupOtp.style.display = "flex";

            const CountDown = document.getElementById("CountDown");
            const Running = setInterval(() => {

                count = count - 1;
                CountDown.innerHTML = count;

                if(count == 0){
                    count = 120;
                    clearInterval(Running);
                };
            }, 1000);
            return;
        }else{
            
            message(data.message);
            setTimeout(() => {
                location.reload();
            }, 1000);
        };
    }).catch((error) => {
        console.log(error);
        alert("Unable to login user.");
    });
}

async function signupOTP() {
    const otp = document.getElementById("otp").value;
    if(otp.length != 6) {
        message("Enter a valid OTP.");
        return;
    };
    const obj = {
        otp,
    };
    
    document.getElementById("Loading").style.display = "flex";

    await fetch("/api/v1/authentication/signup-verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
    }).then((response) => {

        document.getElementById("Loading").style.display = "none";
        return response.json()
    }).then((data) => {
        message(data.message);
        setTimeout(() => {
            location.reload();
        }, 1000);
    }).catch((error) => {
        message(error.message);
    });
}

async function loginOTP() {
    const otp = document.getElementById("otp").value;
    if(otp.length != 6) {
        message("Enter a valid OTP.");
        return;
    };
    const obj = {
        otp,
    };

    document.getElementById("Loading").style.display = "flex";
    await fetch("/api/v1/authentication/login-verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
    }).then((response) => {
        document.getElementById("Loading").style.display = "none";
        return response.json()
    }).then((data) => {
        message(data.message);
        setTimeout(() => {
            location.reload();
        }, 1000);
    }).catch((error) => {
        console.log(error);
        message(error.message);
    });
};



function signupClicked() {

    
    let wid = window.innerWidth;
    if(wid < 670) {
        document.getElementById("afterBoxColor").style.display = "none";
        document.getElementById("afterAfterBoxColor").style.transform = "none";
        
        const main2 = document.getElementsByClassName("main2")[0];
        main2.style.height = "490px";

        return;
    };
    const main2 = document.getElementsByClassName("main2")[0];

    main2.style.height = "460px";


    const afterAfterBoxColor = document.getElementById("afterAfterBoxColor");

    // afterAfterBoxColor.style.display = "block";

    const boxColor = document.getElementById("boxColor");
    boxColor.style.animationName = 'rightToLeft';
    const Getskybuy  = document.getElementById("Getskybuy");
    const GetskybuyP  = document.getElementById("GetskybuyP");
    const afterBoxColor  = document.getElementById("afterBoxColor");
    afterBoxColor.style.animationName = 'upToDown';
    
    setTimeout(() => {
        Getskybuy.style.display = "none";
        GetskybuyP.style.display = "none";
    }, 200);
    
    setTimeout(() => {
        afterBoxColor.style.display = "none";
        afterAfterBoxColor.style.animationName = "downToUp";
        Getskybuy.style.top = "180px";
        GetskybuyP.style.top = "220px";
        Getskybuy.classList.remove("slideRightAni");
        GetskybuyP.classList.remove("slideRightAni");
        Getskybuy.classList.add("slideLeftAni");
        GetskybuyP.classList.add("slideLeftAni");
        Getskybuy.style.opacity = "0";
        Getskybuy.style.display = "block";
        GetskybuyP.style.opacity = "0";
        GetskybuyP.style.display = "block";
        Getskybuy.style.right = "inherit";
        Getskybuy.style.left = "35px";
        GetskybuyP.style.right = "inherit";
        GetskybuyP.style.left = "35px";
        GetskybuyP.style.textAlign = "left";
    }, 800);
    
};


function loginClicked () {

    let wid = window.innerWidth;
    if(wid < 670) {
        document.getElementById("afterBoxColor").style.display = "block";
        
        const main2 = document.getElementsByClassName("main2")[0];
        main2.style.height = "380px";
        
        return;
    };
    const main2 = document.getElementsByClassName("main2")[0];

    main2.style.height = "380px";
    
    const afterAfterBoxColor = document.getElementById("afterAfterBoxColor");
    afterAfterBoxColor.style.animationName = "upToDown";
    
    

    const boxColor = document.getElementById("boxColor");
    boxColor.style.animationName = 'leftToRight';

    const Getskybuy  = document.getElementById("Getskybuy");
    const GetskybuyP  = document.getElementById("GetskybuyP");
    const afterBoxColor  = document.getElementById("afterBoxColor");
    afterBoxColor.style.animationName = 'downToUp';
    
    afterBoxColor.style.display = "block";
    setTimeout(() => {
        Getskybuy.style.display = "none";
        GetskybuyP.style.display = "none";
    }, 200);
    
    setTimeout(() => {
        Getskybuy.style.top = "130px";
        GetskybuyP.style.top = "165px";
        Getskybuy.classList.remove("slideLeftAni");
        GetskybuyP.classList.remove("slideLeftAni");
        Getskybuy.classList.add("slideRightAni");
        GetskybuyP.classList.add("slideRightAni");
        GetskybuyP.style.top = "165px";
        Getskybuy.style.opacity = "1";
        Getskybuy.style.display = "block";
        GetskybuyP.style.opacity = "1";
        GetskybuyP.style.display = "block";
        Getskybuy.style.right = "35px";
        Getskybuy.style.left = "inherit";
        GetskybuyP.style.right = "35px";
        GetskybuyP.style.left = "inherit";
        GetskybuyP.style.textAlign = "right";
    }, 800);
}

document.getElementById("loginViewPassword").addEventListener("click", function() {

    const loginPassword = document.getElementById("loginPassword");
    const loginViewPassword = document.getElementById("loginViewPassword");

    if (loginPassword.type === "password") {
        loginPassword.type = "text";
        loginViewPassword.src = "/files/images/icons/visibleEye.png";
    } else {
        loginPassword.type = "password";
        loginViewPassword.src = "/files/images/icons/invisibleEye.png";
    }
});

document.getElementById("signupViewPassword1").addEventListener("click", function() {

    const loginPassword = document.getElementById("createPassword");
    const loginViewPassword = document.getElementById("signupViewPassword1");

    if (loginPassword.type === "password") {
        loginPassword.type = "text";
        loginViewPassword.src = "/files/images/icons/visibleEye.png";
    } else {
        loginPassword.type = "password";
        loginViewPassword.src = "/files/images/icons/invisibleEye.png";
    }
});

document.getElementById("signupViewPassword2").addEventListener("click", function() {

    const loginPassword = document.getElementById("confirmPassword");
    const loginViewPassword = document.getElementById("signupViewPassword2");

    if (loginPassword.type === "password") {
        loginPassword.type = "text";
        loginViewPassword.src = "/files/images/icons/visibleEye.png";
    } else {
        loginPassword.type = "password";
        loginViewPassword.src = "/files/images/icons/invisibleEye.png";
    }
});


function resendOTP() {
    if(count != 0) {
        message("Please wait for the timer to end.");
        return;
    };

    let loginEmail = document.getElementById("loginEmail").value;
    console.log(loginEmail);
    let signupEmail = document.getElementById("signupEmail").value;
    console.log(signupEmail);
    let email = loginEmail;
    if(loginEmail.length > 3) {
        email = loginEmail;
    }else if(signupEmail.length > 3) {
        email = signupEmail;
    }else{
        message("Enter a valid email address.");
        return;
    };

    document.getElementById("Loading").style.display = "flex";
    fetch("/api/v1/authentication/resend-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email}),
    }).then((response) => {
        document.getElementById("Loading").style.display = "none";
        return response.json();
    }).then((data) => {
        const CountDown = document.getElementById("CountDown");
        const Running = setInterval(() => {

            count = count - 1;
            CountDown.innerHTML = count;

            if(count == 0){
                
                count = 120;
                clearInterval(Running);
            };
        }, 1000);
        message(data.message);
    }).catch((error) => {
        console.error(error);
        message("Unable to resend OTP.");
    });
};


const windowWidth = window.innerWidth;
if (windowWidth < 670) {
    const boxColor = document.getElementById("boxColor");
    boxColor.style.display = "none";
    const Asidd = document.getElementById("Asidd");
    Asidd.style.display = "none";
    const afterBoxColor = document.getElementById("afterBoxColor");
    afterBoxColor.style.width = "calc(100% - 80px)";

    const afterAfterBoxColor = document.getElementById("afterAfterBoxColor");
    afterAfterBoxColor.style.width = "calc(100% - 60px)";
};

window.addEventListener("resize", function() {
    const windowWidth = window.innerWidth;
    if (windowWidth < 670) {
        const boxColor = document.getElementById("boxColor");
        boxColor.style.display = "none";
        const Asidd = document.getElementById("Asidd");
        Asidd.style.display = "none";
        const afterBoxColor = document.getElementById("afterBoxColor");
        afterBoxColor.style.width = "calc(100% - 80px)";

        const afterAfterBoxColor = document.getElementById("afterAfterBoxColor");
        afterAfterBoxColor.style.width = "calc(100% - 60px)";
        
    }else{
        const boxColor = document.getElementById("boxColor");
        boxColor.style.display = "block";
        const Asidd = document.getElementById("Asidd");
        Asidd.style.display = "block";
        const afterBoxColor = document.getElementById("afterBoxColor");
        afterBoxColor.style.width = "60%";

        const afterAfterBoxColor = document.getElementById("afterAfterBoxColor");
        afterAfterBoxColor.style.width = "45%";
    };
}); 