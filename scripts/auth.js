
const KEYAUTH_API = 'YOUR_KEYAUTH_API_ENDPOINT';
const APP_NAME = 'YOUR_APP_NAME';
const APP_OWNERID = 'YOUR_OWNER_ID';

let users = JSON.parse(localStorage.getItem('users')) || [];
let verificationTokens = JSON.parse(localStorage.getItem('tokens')) || {};

function generateToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

async function keyAuthRequest(endpoint, data) {
  try {
    const response = await fetch(`auth.php?action=${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data)
    });
    return await response.json();
  } catch (error) {
    console.error('KeyAuth Error:', error);
    return null;
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  if (users.find(u => u.username === username)) {
    alert('Username already exists!');
    return;
  }

  const token = generateToken();
  const user = {
    username,
    email,
    password,
    isBuyer: false,
    purchases: [],
    verified: false
  };

  const authResponse = await keyAuthRequest('register', {
    username,
    email,
    password,
    token
  });

  if (authResponse && authResponse.success) {
    users.push(user);
    verificationTokens[token] = email;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('tokens', JSON.stringify(verificationTokens));
    alert('Registration successful! Please verify your email.');
    window.location.href = 'Login.html';
  } else {
    alert('Registration failed! Please try again.');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const user = users.find(u => u.username === username && u.password === password);
  if (user && !user.verified) {
    alert('Please verify your email before logging in');
    return;
  }

  const authResponse = await keyAuthRequest('login', {
    username,
    password
  });

  if (authResponse && authResponse.success) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'Dashboard.html';
  } else {
    alert('Invalid credentials!');
  }
}

function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'Login.html';
    return;
  }

  document.getElementById('displayUsername').textContent = currentUser.username;
  document.getElementById('displayEmail').textContent = currentUser.email;
  document.getElementById('buyerStatus').textContent = currentUser.isBuyer ? 'Buyer' : 'Non-Buyer';
  
  if (currentUser.isBuyer) {
    const downloads = `
      <div class="download-item">
        <h3>Omega Menu</h3>
        <button onclick="downloadLoader('omega')">Download</button>
      </div>
      <div class="download-item">
        <h3>Solar Menu</h3>
        <button onclick="downloadLoader('solar')">Download</button>
      </div>
      <div class="download-item">
        <h3>Allah Priv</h3>
        <button onclick="downloadLoader('allah')">Download</button>
      </div>
    `;
    document.getElementById('loaderList').innerHTML = downloads;
  } else {
    document.getElementById('loaderList').innerHTML = '<p>Purchase a product to access downloads</p>';
  }
}

async function downloadLoader(type) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const response = await keyAuthRequest('download', {
    username: currentUser.username,
    product: type
  });

  if (response && response.success) {
    window.location.href = response.download_url;
  } else {
    alert('Download failed! Please try again.');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'Login.html';
}
