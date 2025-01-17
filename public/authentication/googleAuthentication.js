const firebaseConfig = {
    apiKey: "AIzaSyBhxlFddjCC8DFPWFiTgV6j-qu-yFATQ5w",
    authDomain: "getskybuy-7eb61.firebaseapp.com",
    projectId: "getskybuy-7eb61",
    storageBucket: "getskybuy-7eb61.appspot.com",
    messagingSenderId: "774192995710",
    appId: "1:774192995710:web:996cd9a69e35c1801e272f",
    measurementId: "G-KRSD3QS4BS"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();



async function googleSignIn() {

    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider).then((result) => {
        result.user.getIdToken().then(async token => {
            document.getElementById('Loading').style.display = 'flex';
            await fetch('/api/v1/authentication/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            }).then(response => {
                document.getElementById('Loading').style.display = 'none';
                return response.json()
            }).then(data => {
                message(data.message);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }).catch(error => {
                message(error.message);
            });
        });
    }).catch((error) => {
        message("Unable to login using google.");
    });
};