import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAyKFLs3H6kATCYb7_zRihgInK4qjilu9c",
    authDomain: "sadu-study.firebaseapp.com",
    projectId: "sadu-study",
    storageBucket: "sadu-study.firebasestorage.app",
    messagingSenderId: "936799993435",
    appId: "1:936799993435:web:e8d8b13bba2c52bd4d097e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
lucide.createIcons();

let toastTimeoutId = null;
let isLoginMode = true; 

const showToast = (message, type = 'error') => {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIconBg = document.getElementById('toast-icon-bg');
    const toastIcon = document.getElementById('toast-icon');

    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastMessage.innerText = message;

    if (type === 'success') {
        toastIconBg.className = "p-2 rounded-xl bg-green-100 text-green-600";
        toastIcon.setAttribute('data-lucide', 'check-circle');
    } else {
        toastIconBg.className = "p-2 rounded-xl bg-red-100 text-red-600";
        toastIcon.setAttribute('data-lucide', 'alert-circle');
    }
    
    lucide.createIcons();
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('flex', 'opacity-100');

    toastTimeoutId = setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('hidden');
    }, 4000);
};

const showSection = (id) => {
    ['loginSection', 'resetSection', 'successSection'].forEach(s => {
        document.getElementById(s).classList.toggle('hidden', s !== id);
    });
    document.getElementById('login-error-msg').classList.add('hidden');
    document.getElementById('reset-error-msg').classList.add('hidden');
};

document.getElementById('toggleAuthModeBtn').onclick = () => {
    isLoginMode = !isLoginMode;
    const btn = document.getElementById('loginBtn');
    const subtitle = document.getElementById('authSubTitle');
    const prompt = document.getElementById('toggleFormPrompt');
    const toggleBtn = document.getElementById('toggleAuthModeBtn');
    document.getElementById('login-error-msg').classList.add('hidden');

    if (isLoginMode) {
        btn.innerText = "Login";
        subtitle.innerText = "Secure Management Infrastructure Portal";
        prompt.innerText = "Don't have an account?";
        toggleBtn.innerText = "Sign Up here";
    } else {
        btn.innerText = "Create Account";
        subtitle.innerText = "Register your credentials to gain database access";
        prompt.innerText = "Already registered?";
        toggleBtn.innerText = "Login here";
    }
};

document.getElementById('forgotPassBtn').onclick = () => showSection('resetSection');
document.getElementById('backBtn').onclick = () => { isLoginMode = true; showSection('loginSection'); };
document.getElementById('okBtn').onclick = () => { isLoginMode = true; showSection('loginSection'); };

// HANDLE LOGIN AND SIGN UP
document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const errorBox = document.getElementById('login-error-msg');
    const errorText = document.getElementById('error-text-content');

    errorBox.classList.add('hidden');
    btn.disabled = true;

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (isLoginMode) {
        btn.innerText = "Verifying Credentials...";
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "/home.html";
        } catch (error) {
            btn.disabled = false;
            btn.innerText = "Login";
            console.error("Login Error:", error.code);
            
            let msg = "Authentication Failed: Account may not exist yet.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                msg = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/user-not-found') {
                msg = "This email address is not registered.";
            } else if (error.code === 'auth/invalid-email') {
                msg = "Please enter a valid email structure.";
            }
            
            errorText.innerText = msg;
            errorBox.classList.remove('hidden');
            errorBox.classList.add('flex');
            lucide.createIcons();
        }
    } else {
        btn.innerText = "Registering Account...";
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            btn.disabled = false;
            isLoginMode = true;
            showToast("Account created successfully! You can now log in.", "success");
            btn.innerText = "Login";
            document.getElementById('loginForm').reset();
        } catch (error) {
            btn.disabled = false;
            btn.innerText = "Create Account";
            console.error("Sign Up Error:", error.code);
            let msg = "Failed to complete registration metrics.";
            if (error.code === 'auth/email-already-in-use') {
                msg = "This email is already registered.";
            } else if (error.code === 'auth/weak-password') {
                msg = "Password too weak. Use at least 6 characters.";
            }
            errorText.innerText = msg;
            errorBox.classList.remove('hidden');
            errorBox.classList.add('flex');
            lucide.createIcons();
        }
    }
};

// HANDLE PASSWORD RESET ALERTS EXCLUSIVELY
document.getElementById('resetForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('resetBtn');
    const errorBox = document.getElementById('reset-error-msg');
    const errorText = document.getElementById('reset-error-text');
    const email = document.getElementById('resetEmail').value.trim();
    
    errorBox.classList.add('hidden');
    btn.disabled = true;
    btn.innerText = "Sending Link...";

    try {
        await sendPasswordResetEmail(auth, email);
        btn.disabled = false;
        btn.innerText = "Send Link";
        document.getElementById('resetForm').reset();
        showSection('successSection');
    } catch (error) {
        btn.disabled = false;
        btn.innerText = "Send Link";
        console.error("Actual Password Reset Server Error:", error.code);
        
        let msg = "Failed to send reset link. Try again later.";
        if (error.code === 'auth/user-not-found') {
            msg = "This email is not registered in our database system.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "Please enter a properly formatted email layout.";
        } else if (error.code === 'auth/invalid-credential') {
            msg = "Firebase key block error. Ensure Email/Password provider is enabled in Firebase Console.";
        }

        errorText.innerText = msg;
        errorBox.classList.remove('hidden');
        errorBox.classList.add('flex');
        lucide.createIcons();
    }
};
