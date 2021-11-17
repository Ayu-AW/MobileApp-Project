import React from "react";
import { Dimensions, StatusBar, StyleSheet } from "react-native";

import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {LocationHistoryContext} from './contexts/LocationHistoryContext';

import Home from './screens/Home';
import Login from './screens/Login';

import AddReview from './screens/AddReview';
import Heatmap from './screens/Heatmap';
import LocationHistory from './screens/LocationHistory';
import Reviews from './screens/Reviews';

import PlanTrip from './screens/PlanTrip';
import PlannedTrips from './screens/PlannedTrips';
import PlanTripOption from './screens/PlanTripOption';

import keys from './constants/Keys';
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(keys.applicationId, keys.javascriptKey);
Parse.serverURL = keys.serverURL;

const windowWidth = Dimensions.get('window').width;

const Stack = createStackNavigator();

//Styles
const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight || 0,
    width: windowWidth,
    justifyContent: 'center',
  },
  errorMessage: {
    fontSize: 24,
    backgroundColor: '#e01d1d',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default class App extends React.Component {
  //class properties
  state = {  
    ready: false,
    locationHistory: [],
    reviewText: 'Default',
    selectedLocation: {lat: null, long: null, curDate: null, locationID: null},  
  } 

  //renders the view
  render(){
    return(
      <LocationHistoryContext.Provider
        value={
          {
            locationHistory: this.state.locationHistory,
            reviewText: this.state.reviewText,
            selectedLocation: this.state.selectedLocation
          }
        }>

        <NavigationContainer>
          <Stack.Navigator>
          <Stack.Screen name="Login" component={Login}/>
          <Stack.Screen name="Home" component={Home}/>
          <Stack.Screen name="AddReview" component={AddReview} options={{ title: 'Add Review' }}/>
          <Stack.Screen name="LocationHistory" component={LocationHistory}/>
          <Stack.Screen name='Heatmap' component={Heatmap}/>
          <Stack.Screen name='PlanTrip' component={PlanTrip}/>
          <Stack.Screen name='PlanTripOption' component={PlanTripOption}/>
          <Stack.Screen name='PlannedTrips' component={PlannedTrips}/>
          <Stack.Screen name='Reviews' component={Reviews}/>

          </Stack.Navigator>
        </NavigationContainer>
    </LocationHistoryContext.Provider>
    );
  }
}