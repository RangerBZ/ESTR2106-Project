import React  from 'react';
import './../styles/Events.css';
import { BrowserRouter, Routes, Route, Link, useLocation,useParams} from 'react-router-dom';

class Locations extends React.Component {
    async loading(text){
        for(let i=0;i<text.length;i++){
            let row=document.createElement("tr");
            row.style.borderBottom="dashed";

            let p1=document.createElement("td");
            p1.textContent=text[i].locId;
            row.appendChild(p1);

            let p2=document.createElement("a");
            p2.textContent=text[i].name;
            row.appendChild(p2);

            let p3=document.createElement("td");
            p3.textContent=await this.getNum(text[i].locId);
            row.appendChild(p3);

            let p4=document.createElement("td");
            let p4_inner=document.createElement("input");
            p4_inner.type="checkbox";
            p4_inner.checked = JSON.parse(localStorage.getItem('favourites') || '[]').includes(text[i].locId);
            p4_inner.addEventListener('change', () => this.handleFavourite(text[i].locId));
            p4.appendChild(p4_inner);
            row.appendChild(p4);

            let table=document.getElementById("table");
            table.appendChild(row);
        }
    }

    async init(){
        
        const response = await fetch('http://localhost:3001/locations/show', { 
            method: 'GET',
            credentials: 'include'
        });

        let text=await response.json();
        this.loading(text);

    }

    async getNum(id){
        let count=0;
        
        const response = await fetch('http://localhost:3001/events/all', { 
            method: 'GET',
        });

        let text=await response.json();

        for(let i=0;i<text.length;i++){
            if(text[i].locId==id){
                count++;               
            }
        }

        return count;
    }

    
    async search(){
        let content=document.getElementById("search").value;
        const response = await fetch('http://localhost:3001/locations/show', { 
            method: 'GET',
        });
        
        let text=await response.json();
        let text_sort=[];
        let index=0;
        for(let i=0;i<text.length;i++){
            if(this.satisfy(text[i].name,content)){
                text_sort[index]=text[i];
                index++;
            }
        }
        
        let table=document.getElementById("table");

        let j=0;
        const length=table.childNodes.length;
        while(j<length-1){
            table.removeChild(table.childNodes[1]);
            j++;
        }
        
        this.loading(text_sort);
    }

    sort(){        
        let table=document.getElementById("table");

        let j=1;
        const length=table.childNodes.length;
        while(j<length){
            for(let k=1;k<length-j;k++){
                if(parseInt(table.childNodes[k].childNodes[2].textContent)>parseInt(table.childNodes[k+1].childNodes[2].textContent)){
                    let tmp=table.childNodes[k+1];
                    table.insertBefore(tmp,table.childNodes[k]);
                }                
            }
            j++;
        }
    }

    satisfy(s1,s2){
        let count=0;
        let record=0;

        for(let i=0;i<s2.length;i++){
            for(let j=record;j<s1.length;j++){
                if(s2.charAt(i)==s1.charAt(j).toUpperCase()||s2.charAt(i)==s1.charAt(j).toLowerCase()){
                    count++;
                    record=j+1;
                    break;
                }
            }
        }

        if(count==s2.length)
            return true;
        else
            return false;
    }
    
    handleFavourite = locId => {
        const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
        const index = favourites.indexOf(locId);

        if (index > -1) {
            favourites.splice(index, 1);
        } else {
            favourites.push(locId);
        }

        localStorage.setItem('favourites', JSON.stringify(favourites));
    }

    render(){
        this.init();

        return(
        <div className='Locations'>
            <p style={{fontSize:"x-large",fontFamily:"-moz-initial"}}>Location list
            <input type="text" placeholder="Search.." style={{marginLeft:"65vw",fontSize:"17px"}} id="search"></input>
            <button onClick={()=>this.search()} style={{fontSize:"middle"}}>search</button>
            </p>
            <table style={{width:"100%"}}>
                <tbody id="table">
                <tr style={{borderBottom:"solid"}}>
                    <th>ID</th>
                    <th>Locations</th>
                    <th>
                        Num of Events
                        <button  onClick={()=>this.sort()}>
                        </button>
                    </th>
                    <th>Add to Favourites</th>
                </tr>           
                </tbody>
            </table>           
        </div>
        );
        
    }
}


export default Locations;