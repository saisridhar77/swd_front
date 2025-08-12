// This script helps you get the correct Firebase configuration
// Run this in the browser console on your Firebase project page

console.log('=== FIREBASE CONFIG HELPER ===');
console.log('');
console.log('1. Go to: https://console.firebase.google.com/project/swd-store/overview');
console.log('2. Click the gear icon (⚙️) next to "Project Overview"');
console.log('3. Select "Project settings"');
console.log('4. Scroll down to "Your apps" section');
console.log('5. If you don\'t see a web app, click the web icon (</>) to add one');
console.log('6. Copy the configuration object');
console.log('');
console.log('Your config should look like this:');
console.log('const firebaseConfig = {');
console.log('  apiKey: "AIzaSyC...",');
console.log('  authDomain: "swd-store.firebaseapp.com",');
console.log('  projectId: "swd-store",');
console.log('  storageBucket: "swd-store.appspot.com",');
console.log('  messagingSenderId: "885364532961",');
console.log('  appId: "1:885364532961:web:..."');
console.log('};');
console.log('');
console.log('Then update src/config/firebase.js with these values');

