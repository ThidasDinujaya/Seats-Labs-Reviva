async function testLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userEmail: 'admin@seatslabs.com',
                userPassword: 'password123'
            })
        });
        const data = await response.json();
        console.log('Login Result:', data);
    } catch (error) {
        console.error('Login Error:', error.message);
    }
}

testLogin();
