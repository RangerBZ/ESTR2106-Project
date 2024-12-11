// import the following function as 
// import { login, getAdmin } from './path...';
import jwtDecode from 'jwt-decode';
async function login(username, password){
    try{
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password}),
            credentials: 'include'
        });
        if(response.ok)
            console.log(response.text);
        else{
            console.error('Login failed');
        }
    }catch(error){
        console.log(error);
    }
}

function getAdmin(){
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*=\s*([^;]*).*$)|^.*$/, '$1');
    const info = jwtDecode(token);
    if(info && 'admin' in info)
        return info.admin;
}

/*example of writing an request, add credentials.
fetch('https://localhost:3000/protected-route', {
    method: 'GET',
    credentials: 'include', // Include credentials (cookies)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));*/