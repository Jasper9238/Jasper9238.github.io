
// 1. Import the functions you need from the reusable module
import { signIn, signUp, userSignOut, subscribeToAuthChanges } from './js/firebaseAuth.js'; 

// --- ELEMENT REFERENCES (Must match the IDs in frontend/index.html) ---
const navAuthButton = document.getElementById('nav-auth-btn'); // The main button in the nav bar
const signOutButton = document.getElementById('sign-out-btn-main'); // The sign-out button
const loginForm = document.getElementById('login-form-main'); // The hidden login form (for email/password input)
const emailInput = document.getElementById('auth-email-main');
const passwordInput = document.getElementById('auth-password-main');


let isFormVisible = false; 

// --- AUTHENTICATION STATE HANDLER (Runs on load and on state change) ---
subscribeToAuthChanges((user) => {
        navAuthButton.removeEventListener('click', toggleLoginForm);
    if (user) {
        // USER IS LOGGED IN
        navAuthButton.removeEventListener('click', toggleLoginForm);
        navAuthButton.hidden = true
        navAuthButton.textContent = `Welcome, ${user.email.split('@')[0]}`; // Show truncated email
        navAuthButton.style.cursor = 'default';
        
        // Hide the sign-in form if it was visible
        loginForm.style.display = 'none';
        isFormVisible = false;

        // Show Sign Out button and update Post Section
        signOutButton.style.display = 'inline-block'; 

        navAuthButton.addEventListener('click', () => {
             if (isFormVisible) toggleLoginForm();
        });
        
    } else {
        // USER IS LOGGED OUT
        navAuthButton.hidden = false
        navAuthButton.textContent = 'Log In / Sign Up';
        navAuthButton.style.cursor = 'pointer';
        
        // Hide Sign Out button
        signOutButton.style.display = 'none';


        // Add the click listener to show the form
        navAuthButton.addEventListener('click', toggleLoginForm);
    }
});


// --- AUTHENTICATION LOGIC ---

// Function to show/hide the login form when the navbar button is clicked
function toggleLoginForm() {
    isFormVisible = !isFormVisible;
    loginForm.style.display = isFormVisible ? 'block' : 'none';
}

// Handle form submission for Sign In/Sign Up
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    // Attempt to sign in first
    signIn(email, password)
        .catch(() => {
            // If sign-in fails (user might not exist), attempt to sign up
            return signUp(email, password)
                .catch(error => {
                    alert(`Authentication Error: ${error.message}`);
                });
        })
        .finally(() => {
            // Clear inputs and hide the form after attempt
            emailInput.value = '';
            passwordInput.value = '';
            loginForm.style.display = 'none';
            isFormVisible = false;
        });
});


// Handle Sign Out button click
signOutButton.addEventListener('click', () => {
    userSignOut()
        .catch(error => {
            console.error("Logout failed:", error);
        });
});


// --- EXISTING PAGE LOGIC (Keep these event listeners) ---

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// This needs to be available globally since it's called from the footer HTML
window.scrollToTop = scrollToTop; 

const arrow = document.getElementById('down-arrow');
if (arrow) {
    let isScrolling;
    window.addEventListener('scroll', () => {
        arrow.style.opacity = '0';
        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            if(window.scrollY === 0) arrow.style.opacity = '1';
        }, 1500);
    });

    // Smooth scroll for top arrow
    arrow.addEventListener('click', () => {
        document.getElementById('info').scrollIntoView({ behavior: 'smooth' });
    });
}


const search = document.getElementById('search');
const grade = document.getElementById('grade');
const subject = document.getElementById('subject');

const startQuizBtn = document.getElementById('start-quiz-btn');
const quizGradeSelect = document.getElementById('quiz-grade');
const quizSubjectSelect = document.getElementById('quiz-subject');

if (search && grade && subject) {
    search.addEventListener('click', ()=>{
        if(grade.value && subject.value){
            // Redirect the user to the correct page based on their selection
            // Note: The path depends on your deployment setup!
            window.location.href = `${grade.value}/${subject.value}/index.html`;
        } else {
             alert("Please select both a Grade and a Subject.");
        }
    });
}

if (startQuizBtn && quizGradeSelect && quizSubjectSelect) {
    startQuizBtn.addEventListener('click', () => {
        const grade2 = quizGradeSelect.value;
        const subject2 = quizSubjectSelect.value;

        if (!grade2 || !subject2) {
            alert("Please select both a grade and a subject for the quiz.");
            return;
        }

        window.location.href = `/${grade2}/${subject2}/quizzes.html`;
    });
}
