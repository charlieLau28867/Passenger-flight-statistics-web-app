const dateControl = document.querySelector('input[type="date"]');
var selectDay = document.getElementsByTagName("input")[0]
var today = new Date(Date.now())
var mindate = new Date(today.getTime());
var maxdate = new Date(today.getTime());
var prevday = "";
var nextday = "";

mindate.setDate(today.getDate() - 91);
maxdate.setDate(today.getDate() - 1);

dateControl.setAttribute("min", mindate.toISOString().split('T')[0])
dateControl.setAttribute("max", maxdate.toISOString().split('T')[0])


// reset the statistic when user click the input field
function ResetStat(){
    document.querySelectorAll('p')[1].innerHTML = "";
    document.querySelectorAll('p')[2].innerHTML = "";
    document.querySelectorAll('p')[3].innerHTML = "";
    document.querySelectorAll('p')[4].innerHTML = "";
    document.querySelectorAll('p')[5].innerHTML = "";
    document.querySelectorAll('p')[6].innerHTML = "";
    document.querySelectorAll('p')[7].innerHTML = "";
    document.querySelectorAll('p')[8].innerHTML = "";
    document.querySelectorAll('p')[9].innerHTML = "";
    document.querySelectorAll('p')[10].innerHTML = "";
    document.querySelectorAll('p')[11].innerHTML = "";
    document.querySelectorAll('p')[12].innerHTML = "";
    document.querySelectorAll('p')[13].innerHTML = "";
    document.querySelectorAll('p')[14].innerHTML = "";
    document.querySelectorAll('.bar')[0].innerHTML = "";
    document.querySelectorAll('.bar')[1].innerHTML = "";
}



// user selects the day
function DayPick(){
    var input = this.value;
    dateControl.setAttribute("selectDay",input)
    var dateEntered = new Date(input);

    pickDay = new Date(selectDay.value);

    var prev = new Date(pickDay.getTime());
    var next = new Date(pickDay.getTime());

    prev.setDate(pickDay.getDate() - 1);
    next.setDate(pickDay.getDate() + 1);
    prevday = prev.toISOString().split('T')[0].split('-')[2];
    nextday = next.toISOString().split('T')[0].split('-')[2];
};


document.getElementById("DateOfFlight").addEventListener("change", DayPick);


//function for clicking search button
function clicktest(){
    if(selectDay.value === ""){
        document.querySelectorAll('p')[0].innerHTML = "please enter a day for the search ";
        document.querySelector('p').style.color = "black";
        document.querySelector('p').style['background-color'] = "rgb(41, 105, 176, 0.7)";
        document.querySelector('p').style['border-radius'] = "50px";
        document.querySelector('p').style['text-align'] = "center";
        document.querySelector('p').style['font-size'] = "20px";
    }else{
        document.querySelectorAll('p')[0].innerHTML = "";
        var StartDay = Date.parse(mindate);
        var EndDay = Date.parse(maxdate);
        var SelectedDay = Date.parse(document.getElementsByTagName("input")[0].value);
        if(SelectedDay > EndDay){
            document.querySelectorAll('p')[0].innerHTML = "Select any day before today";
            document.querySelector('p').style.color = "black";
            document.querySelector('p').style['background-color'] = "rgb(41, 105, 176, 0.7)";
            document.querySelector('p').style['border-radius'] = "50px";
            document.querySelector('p').style['text-align'] = "center";
            document.querySelector('p').style['font-size'] = "20px";
        }
        if(SelectedDay < StartDay){
            document.querySelectorAll('p')[0].innerHTML = "Select any day after " + document.getElementsByTagName("input")[0].min;
            document.querySelector('p').style.color = "black";
            document.querySelector('p').style['background-color'] = "rgb(41, 105, 176, 0.7)";
            document.querySelector('p').style['border-radius'] = "50px";
            document.querySelector('p').style['text-align'] = "center";
            document.querySelector('p').style['font-size'] = "20px";
        }
        
        if (SelectedDay > StartDay && SelectedDay< EndDay){
            searching("false");
            searching("true");

        }
        
    }
};


function sort_object(obj) {
    items = Object.keys(obj).map(function(key) {
        return [key, obj[key]];
    });
    items.sort(function(first, second) {
        return second[0] - first[0];
    });
    sorted_obj={}
    $.each(items, function(k, v) {
        use_key = v[0]
        use_value = v[1]
        sorted_obj[use_key] = use_value
    })
    return(sorted_obj)
} 



//clicking search button
let bttn = document.getElementById('bttn');
bttn.addEventListener("click",clicktest);


// show a box of alert msg
document.getElementById("DateOfFlight").addEventListener("mouseover", (evt) => {
    if (selectDay.value === ""){
        dateControl.setAttribute("title","please enter a day for the search");
    }else{
        dateControl.setAttribute("title","");
    }
});
var iataToAirport = {};
var Airport = [];
var iataCode = [];
var i = 0;


async function getCode(){
    try{
        let response = await fetch("iata.json");
        if (response.status == 200) { 
            let data = await response.text();
            let dataset = JSON.parse(data)

            for (var i=0;i<9195;i++){
                Airport[i] = dataset[i].name
                iataCode[i] = dataset[i].iata_code
                iataToAirport[iataCode[i]] = Airport[i]
            }
        }
    }catch(err) {
        console.log("Fetch Error!");
    }
}


getCode();


var sortListOrigin = [];
function arrSort(arr) {
    
   arr.sort((a,b)=>a-b);
    arr.reverse();
    return arr;
}




async function searching(des){
    let SearchDay = selectDay.value;


    try{
        let response = await fetch(`flight.php?date=${SearchDay}&lang=en&cargo=false&arrival=${des}`);
        if (response.status == 200) {
            console.log("success fetch");

            let data = await response.text();
            let dataset = JSON.parse(data)[0]
            let flightDate = dataset.date;
            let totalFlight = dataset.list.length; 
            let cancelledFlight = 0;
            let delayFlight = 0;
            let origin = 0;

            let countFlight = [];
            let countFlightEachHR = {}; 
            var sortFlight =["prev","00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","next"];
            let countOrigin = [];
            let countOriginUnique = [];
            let countOriginSort= [];

            
            if (dataset.arrival == true){
                var direction = "Arrival";
                var direction2 = "Origin"
            }else{
                var direction = "Departure"
                var direction2 = "Destinations"
            }
            
            dataset.list.forEach(flight =>{
                if (direction2 == "Origin"){
                    countOrigin.push(flight.origin[0]);
                }else{
                    countOrigin.push(flight.destination[0]);
                }

                
                if (flight.status == "Cancelled"){
                    cancelledFlight ++;
                }
                if (flight.status == "Delayed"){
                    delayFlight ++;
                }
                if (flight.status != "Delayed" && flight.status != "Cancelled" ){
                    if (direction == "Arrival"){
                        if (flight.status.length < 15){
                            countFlight.push(flight.status.slice(8,10))
                        }
                        if (flight.status.length > 15){
                            if(flight.status.slice(15,17) == prevday){
                                countFlight.push("prev")
                            }
                            if(flight.status.slice(15,17) == nextday){
                                countFlight.push("next")
                            }
                        }
                    }
                    if (direction == "Departure"){
                        if (flight.status.length < 11){
                            countFlight.push(flight.status.slice(4,6))
                        }
                        if (flight.status.length > 11){
                            if(flight.status.slice(11,13) == prevday){
                                countFlight.push("prev")
                            }
                            if(flight.status.slice(11,13) == nextday){
                                countFlight.push("next")
                            }
                        }
                    }
                }
            });
            

            for (var i=0; i < countOrigin.length; i++) {
                countOriginUnique[countOrigin[i]] = (countOriginUnique[countOrigin[i]] || 0 ) +1;
            }
            

            for (var code in countOriginUnique){
                countOriginSort.push([code,countOriginUnique[code]]);
            }

            

            countOriginSort.sort(function(a, b) {
                return b[1] - a[1];
            });


            origin = Object.keys(countOriginUnique).length

            
            for (var i=0; i < Object.keys(countFlightEachHR).length; i++) {

                for (var j = 0; j < sortFlight.length; j++){
                    if (Object.keys(countFlightEachHR)[i] == sortFlight[j]){
                        sortFlight[Object.keys(countFlightEachHR)[i]] = countFlightEachHR[Object.values(countFlightEachHR)[i]]
                    }
                }  
            }

            

            if (cancelledFlight > 0){
                var CancelledFlightCount = "Cancelled: " + cancelledFlight
            }else{
                var CancelledFlightCount =""
            }

            if (delayFlight > 0){
                var delayFlightCount = "Delayed: " + delayFlight
            }else{
                var delayFlightCount =""
            }
            
            
            if (direction == "Departure"){
                document.querySelectorAll('p')[1].innerHTML = "<b>Flight Statistics on " + flightDate + "</b>";
                document.querySelectorAll('p')[2].innerHTML = direction;
                document.querySelectorAll('p')[3].innerHTML = "<b>Total Flights</b> &nbsp &nbsp   " + totalFlight+ "<br> <b>"+direction2+"</b>&nbsp &nbsp &nbsp &nbsp" +  
                origin + "<br><b>Special Cases</b> &nbsp &nbsp"+ CancelledFlightCount + delayFlightCount + "<br><br><b>" + direction + " Time</b>";
                document.querySelectorAll('p')[1].style['font-size'] = "30px";
                document.querySelectorAll('p')[3].style['font-size'] = "20px";
                document.querySelectorAll('p')[4].innerHTML = "<b>Top Ten Destinations</b>"
                document.querySelectorAll('p')[4].style['font-size'] = "20px";
                document.querySelectorAll('#code')[0].innerHTML="IataCode"
                document.querySelectorAll('#Airport')[0].innerHTML="Airport"
                document.querySelectorAll('#NoOfFlights')[0].innerHTML="No of Flights"
                
                for (var i=0; i < sortFlight.length; i++) {

                    var count = 0;
                    for (var j=0; j < countFlight.length; j++){
                        if (sortFlight[i] == countFlight[j]){
                            count+=1;
                        }
                    }

                    //set histogram
                    var child = document.createElement("div");
                    child.setAttribute("class","bar-inner" );

                    if (count >0) {
                        child.setAttribute("data-percent", count);
                    }

                    var text = document.createTextNode( sortFlight[i]   )
                    var textPx = count * 13
                    document.querySelectorAll('.bar')[0].appendChild(child).appendChild(text)
                    document.querySelectorAll('.bar-inner')[i].style['width'] = (`${textPx}px`);
                    count = 0;
                }



                //set Top ten
                console.log("start to generate the Top Ten Destination")
                for (var countTop = 0; countTop < 10; countTop++){
                    var childTop = document.createElement("div");
                    var childTop2 = document.createElement("div");
                    var childTop3 = document.createElement("div");
                    for (var findName = 0; findName < Airport.length; findName++){
                        if (countOriginSort[countTop][0] == Object.keys(iataToAirport)[findName]){
                            var textCode = document.createTextNode(countOriginSort[countTop][0])
                            var textName = document.createTextNode(Object.values(iataToAirport)[findName])
                            var textNo = document.createTextNode(countOriginSort[countTop][1])
                            document.querySelectorAll('#code')[0].appendChild(childTop).appendChild(textCode)
                            document.querySelectorAll('#Airport')[0].appendChild(childTop2).appendChild(textName)
                            document.querySelectorAll('#NoOfFlights')[0].appendChild(childTop3).appendChild(textNo)
                        }       
                    }   
                }
            }
            
            
            if (direction == "Arrival"){
                document.querySelectorAll('p')[9].innerHTML = direction;
                document.querySelectorAll('p')[10].innerHTML = "<b>Total Flights</b> &nbsp &nbsp   " + totalFlight+ "<br> <b>"+direction2+"</b>&nbsp &nbsp &nbsp &nbsp" +  
                origin + "<br><b>Special Cases</b> &nbsp &nbsp"+ CancelledFlightCount + delayFlightCount + "<br><br><b>" + direction + " Time</b>";
                document.querySelectorAll('p')[10].style['font-size'] = "20px";
                document.querySelectorAll('p')[11].innerHTML = "<b>Top Ten Origins</b>"
                document.querySelectorAll('p')[11].style['font-size'] = "20px";
                document.querySelectorAll('#code')[1].innerHTML="IataCode"
                document.querySelectorAll('#Airport')[1].innerHTML="Airport"
                document.querySelectorAll('#NoOfFlights')[1].innerHTML="No of Flights"
                
                
                for (var i=0; i < sortFlight.length; i++) {
                    var count = 0;
                    for (var j=0; j < countFlight.length; j++){
                        if (sortFlight[i] == countFlight[j]){
                            count+=1;
                        }
                    }

                    var child = document.createElement("div");
                    child.setAttribute("class","bar-inner" );
                    
                    if (count >0) {
                        child.setAttribute("data-percent",count );
                    }
                    
                    var text = document.createTextNode( sortFlight[i] )
                    var textPx = count * 13
                    document.querySelectorAll('.bar')[1].appendChild(child).appendChild(text)
                    document.querySelectorAll('.bar-inner')[i].style['width'] = (`${textPx}px`);
                    count = 0;
                }
                var blank = document.createElement("div");
                document.querySelectorAll('.bar')[1].appendChild(blank)



                console.log("start to generate the Top Ten Origin")
                for (var countTop = 0; countTop < 10; countTop++){
                    var childTop = document.createElement("div");
                    var childTop2 = document.createElement("div");
                    var childTop3 = document.createElement("div");
                    for (var findName = 0; findName < Airport.length; findName++){
                        if (countOriginSort[countTop][0] == Object.keys(iataToAirport)[findName]){
                            var textCode = document.createTextNode(countOriginSort[countTop][0])
                            var textName = document.createTextNode(Object.values(iataToAirport)[findName])
                            var textNo = document.createTextNode(countOriginSort[countTop][1])
                            document.querySelectorAll('#code')[1].appendChild(childTop).appendChild(textCode)
                            document.querySelectorAll('#Airport')[1].appendChild(childTop2).appendChild(textName)
                            document.querySelectorAll('#NoOfFlights')[1].appendChild(childTop3).appendChild(textNo)
                        }       
                    }   
                }

            }
            
        }
        
    }catch(err) {
        console.log("Fetch Error!");
    }
    document.getElementById("DateOfFlight").value = "";
};



document.getElementById("DateOfFlight").addEventListener("click", ResetStat);

