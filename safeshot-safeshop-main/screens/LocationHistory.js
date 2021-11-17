import React from "react";
import { Button, Dimensions, FlatList, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Parse from "parse/react-native.js";
import * as Location from 'expo-location';

import {LocationHistoryContext} from '../contexts/LocationHistoryContext';
import { LocationSubscriber } from "expo-location/build/LocationSubscribers";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const buttonImage = require('../assets/button.png');

const DEFAULT_TIMEOUT = 10000;
const LOCATION_HISTORY_INTERVAL = 30000;
const MIN_DISTANCE_FROM_HOME = 0.1;
const RADIUS_FILTER_DISTANCE = 500;

const GEOCODER_KEY = "6g9P3ZQGzH9DnyYKF56yYSbcT6Tl2a5G";

var LOCATION_HISTORY = [];

var geoOptions = {  
  enableHighAccuracy:false,  
  timeOut: DEFAULT_TIMEOUT,
  distanceFilter: RADIUS_FILTER_DISTANCE
};  

const styles = StyleSheet.create({
  container: {
    marginTop:  0,
    width: windowWidth,
    height: windowHeight,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 32,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 12,
  },
  errorMessage: {
    fontSize: 12,
    backgroundColor: '#e01d1d',
    color: '#ffffff',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 12,
    backgroundColor: '#39c46a',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 100
  },
  locationHistoryContainer:{
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  locationHistoryItem:{
    backgroundColor: '#6488f5',
    flex:0.5,
    color: "white",
  },
  separator: {
    flex:0.25,
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    margin: 5,
    elevation: 2,
    width: 100
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textShadowColor: '#000',
  },
  buttonImage:{
    flex: 1,
  },
  removeButton:{
    backgroundColor: '#1b3aa6',
    width: 100,
    height: 50,
    borderRadius: 5,
  },
  removeButtonView:{
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  addReviewButton:{
    backgroundColor: '#1b3aa6',
    width: 100,
    height: 50,
    borderRadius: 5,
  },
});

class LocationHistory extends React.Component {
  state = {  
    ready: false,
    refresh: false,  
    currentLocation: {lat:null, long:null, curDate:null},
    currentHomeLocation: {lat:null, long:null, curDate:null},
    errorText: '',
    successText: '',
    currentHomeText: 'Current Home Location: Not Set',
    currentLocationText: 'Current Location: Not Set',
    distanceFromHomeText: 'Distance From Home: Not Set',
    addressText: 'No address set',
    reviewText: '',
    locationHistory: []
  }
  
  //Executes automatically before render is called
  componentDidMount() {
    setInterval(this.getCurrentLocationOnInterval.bind(this), LOCATION_HISTORY_INTERVAL);
    this.getCurrentLocationFromNavigator();
  }

  requestLocationPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
  }

  getAddressFromCoordinates = async (lat, long) => {
    try{
      var url = 'http://www.mapquestapi.com/geocoding/v1/reverse' +
      '?key=' + GEOCODER_KEY +
      '&location=' + lat + ',' + long;
      console.log('URL: ' + url);
      let res = await fetch(url);
      if(res.json){
        var json =  await res.json();
        for(var x in json.info.messages){
          console.log("Message: " + x);
        }

        console.log('Success: ' + res.status);
        var results = json.results[0];
        console.log("Locations: " + results.locations.length);
        for(var i = 0; i < results.locations.length; ++i){
          var street = results.locations[i].street;
          console.log("Location: " + street);
          this.setState({addressText: "Address: " + street});
        }
      }
      else{
        console.log('Error: res.json does not exist');
      }
    }
    catch(error){
      //this.setState({errorText: 'Unable to get address from coordinates: ' + error.message});
      console.log("Error in getAddressFromCoordinates: " + error.message);
    }
    
  }

  getDistanceFromHomeLocation = () => {
    console.log(this.state.currentHomeLocation);
    if(this.state.currentHomeLocation.lat === null || this.state.currentHomeLocation.long === null){
      console.log("Cannot calculate distance from home location: one or more home location values is null");
      return null;
    }
    if(this.state.currentLocation.lat === null || this.state.currentLocation.long === null){
      console.log("Cannot calculate distance from home location: one or more current location values is null");
      return null;
    }

    var latDifference = Math.abs(this.state.currentHomeLocation.lat - this.state.currentLocation.lat);
    var longDifference = Math.abs(this.state.currentHomeLocation.long - this.state.currentLocation.long);
    return {latDiff: latDifference, longDiff: longDifference};
  }

  getIsAwayFromHome = () => {
    var diff = this.getDistanceFromHomeLocation();
    if(diff !== null){
      console.log("Distance from home: Lat: " + diff.latDiff + " Long: " + diff.longDiff);
      this.setState({distanceFromHomeText: "Distance from home: Lat: " + diff.latDiff + " Long: " + diff.longDiff})
      if(diff.latDiff >= MIN_DISTANCE_FROM_HOME && diff.longDiff >= MIN_DISTANCE_FROM_HOME){
        console.log("Outside home");
      }
    }
  }

  
  
  getCurrentLocationOnInterval = () => {
    var currentPosition, options, success, error;

    success = (position) => {
      if(position){
        var currentCoordinates = position.coords;
        this.setState({currentLocationText:  'Current Location: Lat: ' + currentCoordinates.latitude.toFixed(4) + ' Long: ' + currentCoordinates.longitude.toFixed(4)});
        //this.saveCurrentLocationToDatabase(); //need to be careful with this to not hit rate limits saving
        //if the position changes, AND getIsAwayFromHome is true
      }
      else{
        this.setState({errorText: 'Could not find position'}); 
      }
    }
  
    error = (err) => {
      this.setState({errorText: 'Error getting location on interval: ' + err.message }); 
    }
  
    currentPosition = navigator.geolocation.watchPosition(success, error, geoOptions);

    window.setTimeout( function () {
      navigator.geolocation.clearWatch(currentPosition)
    }, DEFAULT_TIMEOUT 
    );
  }
  
  getCurrentLocationFromNavigator = async () => {
    navigator.geolocation.getCurrentPosition( 
      this.geoSuccess,  
      this.geoFailure,  
      geoOptions
    );  
  }  
  
  geoSuccess = (position) => {  
    const fullDate =  this.getCurrentDate();

    this.setState({  
        currentLocation: {lat: position.coords.latitude, long: position.coords.longitude, curDate: fullDate },
        currentHomeLocation: {lat: position.coords.latitude, long: position.coords.longitude, curDate: fullDate },
        currentHomeText: 'Current Home Location: Lat: ' + position.coords.latitude.toFixed(4) + ' Long: ' + position.coords.longitude.toFixed(4),
        currentLocationText: 'Current Location: Lat: ' + position.coords.latitude.toFixed(4) + ' Long: ' + position.coords.longitude.toFixed(4),
        refresh: !this.state.refresh
    }, function(){
      console.log("Successfully retrieved current location from navigator");
    });
  } 

  geoFailure = (err) => {  
    this.setState({errorText: 'Failed to get current location from navigator: ' + err.message});  
  } 
    
  getCurrentDate = () => {
    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();
    const fullDate =  month.toString() + '/' + date.toString() + '/' + year.toString();
    return(fullDate);
  }
  
  //Retrieves all locations in the database
  getSavedLocationsFromDatabase = async () => {
    var Location = Parse.Object.extend("Location");
    var query = new Parse.Query(Location);

    LOCATION_HISTORY = []; //clear location history local storage to avoid duplicate locations in list

    query.exists("lat"); //get only objects with latitude
    const results = await query.find(); //wait for query.find() to finish

    for (let i = 0; i < results.length; i++) {
      const location = results[i];
      var lat = location.get("lat");
      var long = location.get("long");
      var vDate = location.get("curDate");
      var uniqueID = location.id;
      const pos = {lat: lat, long, curDate: vDate, id: uniqueID};
      LOCATION_HISTORY.push(pos);
      this.setState({locationHistory: LOCATION_HISTORY, refresh: !this.state.refresh});
    }
  }
  
  //removes the location from the database
  removeLocationFromDatabase = async (item) => {
    var Location = Parse.Object.extend("Location");
    var query = new Parse.Query(Location);

    try{
      const itemID = item.id;
      const results = await query.get(item.id);

      //remove item from database
      const destroyed = await results.destroy();
      console.log('Successfully removed ' + itemID);
      //Refresh
      this.setState({ refresh: !this.state.refresh}, function(){
        this.getSavedLocationsFromDatabase();
      });
    }
    catch(error){
      this.setState({errorText: 'Failed to remove location from database: ' + error.message});
      console.log('Failed to remove location from database: ' + error.message);
    }
  }
  
  saveCurrentLocationToDatabase = async () => {
    var Location = Parse.Object.extend("Location");
    var location = new Location();
  
    if(this.state.currentLocation.lat !== null && this.state.currentLocation.long !== null){
      //Set the location object to the component's current location state
      location.set("lat", this.state.currentLocation.lat);
      location.set("long", this.state.currentLocation.long);
      location.set("curDate", this.state.currentLocation.curDate);

      try{
          let result = await location.save();
          this.setState({refresh: !this.state.refresh}, function(){
            console.log("Successfully saved current location to database");
          });
      }catch(error){
          this.setState({errorText: 'Failed to save current location to database ' + error.message});
          console.log('Failed to create new location object: ' + error.message);
      }
    }
    else{
      console.log("Unable to save location to database: currentLocation is null");
    }
  }

  //Rendering

  //renders a location history item in the list
  locationHistoryRenderItem = ({ item }) => {
    return (
      <View>
        <View style={styles.locationHistoryContainer}>
          <Text style={styles.locationHistoryItem}>Latitude: {item.lat} Longitude: {item.long} Date: {item.curDate}</Text>
          <TouchableOpacity
          style={[styles.removeButton]}
          onPress={() => this.removeLocationFromDatabase(item)}>
            <ImageBackground source={buttonImage} style={styles.buttonImage}>
              <View style={styles.removeButtonView}>
                <Text style={styles.buttonText}>Remove</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <TouchableOpacity
          style={[styles.removeButton]}
          onPress={() => this.getAddressFromCoordinates(item.lat, item.long)}>
            <ImageBackground source={buttonImage} style={styles.buttonImage}>
              <View style={styles.removeButtonView}>
                <Text style={styles.buttonText}>Get Address</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => this.props.navigation.navigate('AddReview')}>
            <ImageBackground source={buttonImage} style={styles.buttonImage}>
              <View style={styles.removeButtonView}>
                <Text style={styles.buttonText}>Add Review</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
      </View>
      <View style={styles.separator} /></View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Location History</Text>
      <FlatList
        data={LOCATION_HISTORY}
        renderItem={this.locationHistoryRenderItem}
        extraData={this.state.refresh}
      />
      <Button
      style={styles.button}
      title="Add Current Location To Database"
      onPress={() => this.saveCurrentLocationToDatabase()}
      />
      <Button
      style={styles.button}
      title="Retrieve Locations From Database"
      onPress={() => this.getSavedLocationsFromDatabase()}
      />
      <Button
      style={styles.button}
      title="Set Current Location To Home Location"
      onPress={() => this.getCurrentLocationFromNavigator()}
      />
      <Button
      style={styles.button}
      title="Get Distance From Home"
      onPress={() => this.getIsAwayFromHome()}
      />
      <Text style={styles.subtitleText} id='currentHomeTextID'>{this.state.currentHomeText}</Text>
      <Text style={styles.subtitleText} id='currentLocationTextID'>{this.state.currentLocationText}</Text>
      <Text style={styles.subtitleText} id='distanceFromHomeTextID'>{this.state.distanceFromHomeText}</Text>
      <Text style={styles.subtitleText} id='addressTextID'>{this.state.addressText}</Text>
      <Text style={styles.errorMessage} id='errorTextID'>{this.state.errorText}</Text>
      <Text style={styles.successMessage} id='successTextID'>{this.state.successText}</Text>
    </SafeAreaView>
    );
  }
}

LocationHistory.contextType = LocationHistoryContext;

export default LocationHistory;