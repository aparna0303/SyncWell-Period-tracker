
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');
const phaseContainer = document.getElementById('phaseContainer');
const greeting = document.getElementById('greeting');
const phase = document.getElementById('phase');
const daysLeft = document.getElementById('daysLeft');
const doList = document.getElementById('doList');
const eatList = document.getElementById('eatList');
const exerciseList = document.getElementById('exerciseList');

const backendURL = 'http://localhost:3000';  // Replace with your backend URL

// Function to check if the token is expired
function isTokenExpired(token) {
    const decoded = jwt_decode(token);
    return decoded.exp < Date.now() / 1000;
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const cycleStartDate = document.getElementById('cycleStartDate').value;
        const cycleLength = document.getElementById('cycleLength').value;

        try {
            const response = await fetch(`${backendURL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, cycleStartDate, cycleLength })
            });
            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Something went wrong');
                return;
            }


            // Redirect to homepage after successful signup
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = 'home.html'; // Redirect to home
            }
        } catch (error) {
            console.error('Signup failed', error);
            alert('An error occurred. Please try again later.');
        }
    });
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert("Email and password are required");
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Login failed');
                return;
            }
            alert("Login Successful");
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = 'home.html';
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Login failed', error);
            alert('An error occurred. Please try again later.');
        }
    });
}

// Handle logout functionality
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

// Ensure the logout button is only visible when the user is logged in
if (localStorage.getItem('token')) {
    logoutButton.style.display = 'block'; // Show logout button
} else {
    logoutButton.style.display = 'none'; // Hide logout button
}

// Load user data and handle the homepage after login
window.addEventListener('load', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        if (isTokenExpired(token)) {
            localStorage.removeItem('token');
            window.location.href = 'login.html'; // Redirect to login if token is expired
            return;
        }

        try {
            const response = await fetch(`${backendURL}/api/auth/me`, {
                method: 'GET',
                headers: { 'Authorization': token }
            });
            const user = await response.json();
            if (user) {
                greeting.textContent = `Hi ${user.name}, it's cycle day ${calculateCycleDay(user.cycleStartDate, user.cycleLength)}`;
                phase.textContent = getCurrentPhase(user.cycleStartDate, user.cycleLength);
                daysLeft.textContent = `Period in ${calculateDaysLeft(user.cycleStartDate, user.cycleLength)} days`;
                populateRecommendations(getCurrentPhase(user.cycleStartDate, user.cycleLength));
            }
        } catch (error) {
            console.error('Error loading user data', error);
            alert('Unable to fetch user data. Please try again later.');
        }
    } else {
        window.location.href = 'login.html';
    }
});

// Calculate the current cycle day
function calculateCycleDay(startDate, cycleLength) {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays % cycleLength) + 1;
}

// Calculate the number of days left in the current cycle
function calculateDaysLeft(startDate, cycleLength) {
    const start = new Date(startDate);
    const today = new Date();
    const cycleDay = calculateCycleDay(startDate, cycleLength);
    return cycleLength - cycleDay;
}

// Get the current phase based on the cycle day
function getCurrentPhase(startDate, cycleLength) {
    const cycleDay = calculateCycleDay(startDate, cycleLength);
    if (cycleDay <= 5) return 'Menstrual Phase';
    if (cycleDay <= 14) return 'Follicular Phase';
    if (cycleDay <= 21) return 'Ovulatory Phase';
    return 'Luteal Phase';
}

// Populate the recommendations based on the current phase
// Phase-wise recommendation data
const phaseRecommendations = {
    'Menstrual Phase': {
        description: 'Low energy, focus on rest and recovery.',
        do: ['Sleep more', 'Use a hot water bag', 'Journal your emotions', 'Rest', 'Deep breathing', 'Track symptoms', 'Watch comfort shows', 'Wear cozy clothes', 'Say no without guilt', 'Drink warm tea'],
        eat: ['Iron-rich foods', 'Beetroot', 'Dark chocolate', 'Warm soups', 'Dates', 'Ginger tea', 'Spinach', 'Walnuts', 'Fennel seeds', 'Coconut water'],
        exercise: ['Gentle yoga', 'Stretching', 'Walking slowly', 'Butterfly pose', 'Foam rolling', 'Yin yoga', 'Breathwork', 'Tai Chi', 'Cat-cow stretch', 'Legs up the wall pose']
    },
    'Follicular Phase': {
        description: 'Energy begins to rise, great for planning and creativity.',
        do: ['Start a new habit', 'Brainstorm ideas', 'Set goals', 'Do skincare routines', 'Socialize', 'Create content', 'Learn something new', 'Plan a trip', 'Do vision board', 'Read nonfiction'],
        eat: ['Eggs', 'Oats', 'Citrus fruits', 'Pumpkin seeds', 'Leafy greens', 'Chicken', 'Greek yogurt', 'Berries', 'Tofu', 'Avocados'],
        exercise: ['Cardio', 'Zumba', 'Strength training', 'Cycling', 'Swimming', 'Jogging', 'Step workouts', 'Hiking', 'Dance cardio', 'Box jumps']
    },
    'Ovulatory Phase': {
        description: 'Peak energy, great for socializing and high output tasks.',
        do: ['Go out', 'Do bold things', 'Give a presentation', 'Film videos', 'Go live', 'Wear favorite outfit', 'Organize a group event', 'Try bold makeup', 'Initiate a project', 'Flirt'],
        eat: ['Salmon', 'Berries', 'Lean meats', 'Zucchini', 'Broccoli', 'Chia seeds', 'Eggs', 'Kimchi', 'Asparagus', 'Green tea'],
        exercise: ['HIIT', 'Running', 'Full-body training', 'Boxing', 'Power yoga', 'Bootcamp', 'Stair climbing', 'Resistance band training', 'Dancing', 'Sprints']
    },
    'Luteal Phase': {
        description: 'Energy slowly decreases, mood dips possible, nurture yourself.',
        do: ['Journal your thoughts', 'Plan next month', 'Do home spa', 'Slow down social activity', 'Organize', 'Practice gratitude', 'Watch calming videos', 'Do breathwork', 'Prep for period', 'Say no often'],
        eat: ['Sweet potatoes', 'Almonds', 'Dark berries', 'Bone broth', 'Bananas', 'Oats', 'Greek yogurt', 'Apple cider vinegar', 'Magnesium-rich foods', 'Peppermint tea'],
        exercise: ['Pilates', 'Light cardio', 'Yoga', 'Walking', 'Stretching', 'Mobility drills', 'Swimming', 'Barre', 'Foam rolling', 'Dance stretching']
    }
};


    // Clear previous recommendations
    doList.innerHTML = '';
    eatList.innerHTML = '';
    exerciseList.innerHTML = '';

    function populateRecommendations(phase) {
    const data = phaseRecommendations[phase];
    if (!data) return;

    // 1. Update Phase Description
    const phaseDescription = document.getElementById('phaseDescription');
    phaseDescription.textContent = data.description;

    // 2. Rotate the recommendation lists daily
    const todayIndex = new Date().getDate() % 10;  // Rotate using day of the month (0–9)

    const rotate = (arr) => {
        const rotated = [];
        for (let i = 0; i < 3; i++) {
            rotated.push(arr[(todayIndex + i) % arr.length]);
        }
        return rotated;
    };

    const doItems = rotate(data.do);
    const eatItems = rotate(data.eat);
    const exerciseItems = rotate(data.exercise);

    // 3. Clear previous items
    doList.innerHTML = '';
    eatList.innerHTML = '';
    exerciseList.innerHTML = '';

    // 4. Add new ones
    doItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        doList.appendChild(li);
    });
    eatItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        eatList.appendChild(li);
    });
    exerciseItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        exerciseList.appendChild(li);
    });
}

