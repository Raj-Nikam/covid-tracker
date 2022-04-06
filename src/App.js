
import './App.css';
import 'leaflet/dist/leaflet.css'
import InfoBox from './components/InfoBox'
import Map from './components/Map'
import Table from './components/Table'
import LineGraph from './components/LineGraph'
import {sortData,prettyPrintStat} from './util';
import {FormControl, Select, MenuItem, Card, CardContent} from '@material-ui/core';
import React,{useState,useEffect} from 'react';


function App() {
  
const[countries,setCountries] = useState([]);
const[country,setCountry] = useState("worldwide");
const[tableData,setTableData] = useState([]);
const[countryInfo,setCountryInfo] = useState({});
const[mapCenter,setMapCenter] = useState({lat: 34.80746, lng: -40.4796});
const[mapZoom, setMapZoom] = useState(3);
const[mapCountries,setMapCountries] = useState([]);
const[casesType,setCasesType] = useState("cases");

useEffect(() => {
   fetch("https://disease.sh/v3/covid-19/all")
  .then(response => response.json())
  .then(data => {
      setCountryInfo(data);
  });

},[]);

const onCountryChange = async(event) => {
  const countryCode = event.target.value;
  
  
  const url = countryCode === "worldwide" 
            ? "https://disease.sh/v3/covid-19/all" 
            : `https://disease.sh/v3/covid-19/countries/${countryCode}`; 

      
  await fetch(url)
  .then(response => response.json())
  .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      if(countryCode === 'worldwide')
      {
        setMapCenter({lat: 34.80746, lng: -40.4796});
      }
      else{
        console.log( data.countryInfo.lat, data.countryInfo.long);
        setMapCenter({lat : data.countryInfo.lat, lng : data.countryInfo.long});
        setMapZoom(4);
      }
      // setMapCenter([data.countryInfo.lat, data.countryInfo.lng]);
     
  });

}

useEffect(() => {
   const getCountriesData = async () => {
     await fetch("https://disease.sh/v3/covid-19/countries")
     .then((response) => response.json())
     .then((data) => {
       const countries = data.map((country) => (
         {
           name:country.country,
           value:country.countryInfo.iso2
         }
       ));
       const sortedData = sortData(data);
       setMapCountries(data); 
       setTableData(sortedData);
       setCountries(countries);
      // console.log(data);
     })
   }
   getCountriesData();
},[]);

  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
       <h1>COVID-19 TRACKER</h1>
       
       <FormControl className="app__dropdown">
         <Select 
         variant="outlined" 
         value={country} 
         onChange = {onCountryChange}
         >
           <MenuItem value="worldwide">Worldwide</MenuItem>
           {
             countries.map((country) => (
              <MenuItem value={country.value}>{country.name}</MenuItem>  
  ))
           }
{/*          
         <MenuItem value="worldwide">Worldwide</MenuItem>
         <MenuItem value="worldwide">Option 1</MenuItem>
         <MenuItem value="worldwide">Option 2</MenuItem>
         <MenuItem value="worldwide">Oyooo</MenuItem> */}

         </Select>
       </FormControl>
       </div>
     
     <div className="app__stats"> 
     <InfoBox isRed active = {casesType === "cases"} onClick={(ecd ) => setCasesType("cases")} title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
     <InfoBox active = {casesType === "recovered"} onClick={(e) => setCasesType("recovered")} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
     <InfoBox isRed active = {casesType === "deaths"} onClick={(e) => setCasesType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
     </div>

        <Map 
        // casesType={casesType}
        countries ={mapCountries}
        casesType={casesType}
        center={mapCenter} 
        zoom={mapZoom}
        />
       
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by country</h3>
          <Table countries={tableData}/>
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>

      </Card>
      
    </div>
  );
}

export default App;
