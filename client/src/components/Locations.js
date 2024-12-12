import React from 'react';
import './../styles/Events.css';
import { Link } from 'react-router-dom';

class Locations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allLocations_last:[],
            allLocations: [],
            allEvents: [], 
            isLoading: true, 
            error: null,
            checked:false,
        };
    }

    async componentDidMount() {
        try {
            const [locationsResponse, eventsResponse] = await Promise.all([
                fetch('http://localhost:3001/locations/show'),
                fetch('http://localhost:3001/events/all'),
            ]);

            if (!locationsResponse.ok) {
                throw new Error('Failed to fetch locations');
            }

            if (!eventsResponse.ok) {
                throw new Error('Failed to fetch events');
            }

            const allLocations = await locationsResponse.json();
            const allEvents = await eventsResponse.json();
            let allLocations_last=[];
            for(let i=0;i<allLocations.length;i++){
                allLocations_last[i]=allLocations[i];
            }

            this.setState({
                allLocations_last,
                allLocations,
                allEvents,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error loading favourites:', error);
            this.setState({ error: error.message, isLoading: false });
        }
    }

    search(text){
        let content=document.getElementById("search").value;
        console.log(content);

        let text_sort=[];
        let index=0;
        for(let i=0;i<text.length;i++){
            if(this.satisfy(text[i].name,content)){
                text_sort[index]=text[i];
                index++;
            }
        }

        this.setState({allLocations:text_sort});
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

    getNum(text2,id){
        let count=0;

        for(let i=0;i<text2.length;i++){
            if(text2[i].locId==id){
                count++;               
            }
        }

        return count;
    }

    sort(text,text2){        
        
        const length=text.length;
        let j=0;
        while(j<length){
            for(let k=0;k<length-j-1;k++){
                if(this.getNum(text2,text[k].locId)>this.getNum(text2,text[k+1].locId)){
                    let tmp=text[k];
                    text[k]=text[k+1];
                    text[k+1]=tmp;
                }                
            }
            j++;
        }
        console.log(text);

        this.setState({allLocations:text});
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
        this.setState({checked:this.state.checked==false?true:false});
    }

    render() {
        const { allLocations_last,allLocations, allEvents, isLoading, error } = this.state;

        if (isLoading) {
            return <div className='Favourites'><p>Loading...</p></div>;
        }

        if (error) {
            return <div className='Favourites'><p>Error: {error}</p></div>;
        }

        return (
            <div className='Locations'>
                <h2 style={{fontSize:"x-large",fontFamily:"-moz-initial"}}>Location list
                <input type="text" placeholder="Search.." style={{marginLeft:"75vw",fontSize:"17px"}} id="search"></input>
                <button onClick={()=>this.search(allLocations_last)} style={{fontSize:"middle"}} className='btn btn-info'>search</button>
                </h2>
                {allLocations.length > 0 ? (
                    <table style={{ width: "100%" }}>
                        <thead>
                            <tr style={{ borderBottom: "solid" }}>
                                <th>ID</th>
                                <th>Location</th>
                                <th>Num of Events
                                    <button  onClick={()=>this.sort(allLocations,allEvents)} className='btn btn-secondary'></button>
                                </th>
                                <th>Add to Favourites</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allLocations.map(favourite => 
                                (
                                <tr key={favourite.locId} style={{ borderBottom: "dashed" }}>
                                    <td>{favourite.locId}</td>
                                    <td>
                                        <Link to={`/locations/${favourite.locId}`}>{favourite.name}</Link>
                                    </td>
                                    <td>{this.getNum(allEvents,favourite.locId)}</td>       
                                    <td>
                                        <input
                                            type="checkbox"
                                            onChange={()=>this.handleFavourite(favourite.locId)}
                                            checked ={JSON.parse(localStorage.getItem('favourites') || '[]').includes(favourite.locId)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No such location!</p>
                )}
            </div>
        );
    }
}

export default Locations;