// import the following function as 
// import { login, getAdmin } from './path...';
import { jwtDecode } from 'jwt-decode';
async function login(username, password){
    try{
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password}),
            credentials: 'include'
        });
        //console.log(response);
        if(response.ok)
        {
            console.log(response.text);
            return true;
        }
        else{
            alert('Login failed');
            return false;
        }
    }catch(error){
        console.log(error);
        return false;
    }
}

function getAdmin(){
    //console.log(document.cookie);
    const match = document.cookie.match(new RegExp('(^| )' + 'jwt' + '=([^;]+)'));
    //console.log(match);
    const token =  match ? match[2] : null;
    const info = jwtDecode(token);
    if(info && 'admin' in info)
        return info.admin;
}

/*example of writing an request, add credentials.
fetch('https://localhost:3001/protected-route', {
    method: 'GET',
    credentials: 'include', // Include credentials (cookies)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));*/

export {login, getAdmin};