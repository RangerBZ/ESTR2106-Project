import React  from 'react';
import './../styles/Events.css';
import { useParams } from 'react-router-dom';

class Others extends React.Component {
    satisfy=(s1,s2)=>{
        let flag=false;
        let count1;
        let count2=0;;

            for(let j=0;j<s1.length;j++){
                count1=0;
                if(s2.charAt(0)==s1.charAt(j).toUpperCase()||s2.charAt(0)==s1.charAt(j).toLowerCase()){
                    for(let i=0;i<s2.length;i++){
                        if(s2.charAt(i)!=s1.charAt(j+i).toUpperCase()&&s2.charAt(i)!=s1.charAt(j+i).toLowerCase()){
                            break;
                        }else{
                            count1++;
                        }
                    }

                    if(count1==s2.length){
                        flag=true;
                        count2+=s2.length;
                    }
                }

                if(flag==true)
                    break;
            }
        
        return count2;
    }

    handlePreference=async ()=>{
        let preference=document.getElementById("preference").value;
        let day=document.getElementById("day").value;

        try{
            const response1=await fetch('http://localhost:3001/events/all',{
                method:"GET",
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const event=await response1.json();

            const response2=await fetch('http://localhost:3001/locations/show',{
                method:"GET",
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const location=await response2.json();

            let max=0;
            let max_index=0;
            let flag=false;
            
            for(let i=0;i<event.length;i++){

                    if(max<this.satisfy(event[i].title,preference)/event[i].title.length&&this.satisfy(event[i].date,day)){
                        max=this.satisfy(event[i].title,preference)/event[i].title.length;
                        max_index=i;
                        flag=true;
                    } 
            }

            if(!flag){
                for(let i=0;i<event.length;i++){

                    if(max<this.satisfy(event[i].title,preference)/event[i].title.length){
                        max=this.satisfy(event[i].title,preference)/event[i].title.length;
                        max_index=i;
                    } 
                }
            }
            
            
                let text=document.createElement("p");
                text.style.backgroundColor="white";
                text.style.borderStyle="solid";
                text.style.borderColor="blue";
                text.style.borderRadius="5px";
                text.style.padding="5px";

                let judge=false;
                let record;

                if(event[max_index].description!=""){
                    for(let i=0;i<location.length;i++){
                        if(location[i].locId==event[max_index].locId){
                            console.log(i);
                            judge=true;
                            record=i;
                            break;
                        }
                    }

                    if(judge)
                    text.innerHTML="Event: "+event[max_index].title+"<br>Location: "+event[max_index].locId+" ("+location[record].name+")<br>Date: "+event[max_index].date+"<br>Presenter: "+event[max_index].presenter+"<br>Description: "+event[max_index].description;
                    else
                    text.innerHTML="Event: "+event[max_index].title+"<br>Location: "+event[max_index].locId+"<br>Date: "+event[max_index].date+"<br>Presenter: "+event[max_index].presenter+"<br>Description: "+event[max_index].description;
                }else{
                    for(let i=0;i<location.length;i++){
                        if(location[i].locId==event[max_index].locId){
                            console.log(i);
                            judge=true;
                            record=i;
                            break;
                        }
                    }

                    if(judge)
                    text.innerHTML="Event: "+event[max_index].title+"<br>Location: "+event[max_index].locId+" ("+location[record].name+")<br>Date: "+event[max_index].date+"<br>Presenter: "+event[max_index].presenter;
                    else
                    text.innerHTML="Event: "+event[max_index].title+"<br>Location: "+event[max_index].locId+"<br>Date: "+event[max_index].date+"<br>Presenter: "+event[max_index].presenter;
                }
                if(document.getElementById("recommendation").firstChild){
                document.getElementById("recommendation").removeChild(document.getElementById("recommendation").firstChild);
                }
                document.getElementById("recommendation").appendChild(text);


        }catch(error){
            console.log(error);
        }

    }

    render(){
        return(
        <div className='Events'>
            <div className='row'>
                <div className='col-1'></div>
                <div className='col-5'>
                <p style={{fontWeight:"bolder",color:"red",fontSize:"x-large"}}>No idea for choosing events?</p>
                <p style={{fontWeight:"bolder",color:"red",fontSize:"x-large"}}>Tell us your preference!</p>
                <form>
                    <label htmlFor="preference">Your preferred event type?</label>{' '}
                    <select name="preference" id="preference">
                    <option value="workshop">Workshop</option>
                    <option value="drama">Drama</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="movie">Movie</option>
                    <option value="cinema">Cinema</option>
                    <option value="opera">Opera</option>
                    <option value="concert">Concert</option>
                    </select>
                    <br/><br/>

                    <label htmlFor="day">Your preferred day?</label>{' '}
                    <select name="day" id="day">
                    <option value="mon">Monday</option>
                    <option value="tue">Tuesday</option>
                    <option value="wed">Wednesday</option>
                    <option value="thu">Thursday</option>
                    <option value="fri">Friday</option>
                    <option value="sat">Saturday</option>
                    <option value="sun">Sunday</option>
                    </select>
                    <br/><br/>

                    <button className="btn btn-success" type="button" onClick={this.handlePreference}>Submit</button>
                </form>
                </div>
                <div className='col-6'>
                    <p style={{color:"orange",fontWeight:"bolder",fontSize:"x-large"}}>Recommendation:</p>
                    <p id="recommendation"></p>
                </div>
                
            </div>

            
        </div>
        );
    }
}


export default Others;