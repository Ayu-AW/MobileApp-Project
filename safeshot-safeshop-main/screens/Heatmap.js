import React from 'react';
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Parse from "parse/react-native.js";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const defaultLat = 47.7;
const defaultLong = -122.2125;
const defaultDelta = 0.01;

const defaultLocation = [{latitude: 0, longitude: 0}];

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    width: windowWidth,
    height: windowHeight,
  },
  titleText: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 50,
    marginTop: 0
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1
  },
  button: {
    borderRadius: 15,
    padding: 10,
    margin: 10,
    elevation: 2,
    backgroundColor: "blue",
    width: 150,
    justifyContent: 'center'
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    height: windowHeight,
    width: windowWidth,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

class Heatmap extends React.Component {
  state = {
    locationHistory: defaultLocation,
    refresh: false
  }

  componentDidMount() {
    this.getSavedLocationsFromDatabase();
  }

  getSavedLocationsFromDatabase = async () => {
    var Location = Parse.Object.extend("Location");
    var query = new Parse.Query(Location);

    query.exists("lat"); 
    const results = await query.find(); 

    var locations = [];

    for (let i = 0; i < results.length; i++) {
      const location = results[i];
      var lat = location.get("lat");
      var long = location.get("long");
      var vDate = location.get("curDate");
      var uniqueID = location.id;
      if(lat !== null && long !== null){
        const pos = {
          latitude: lat, 
          longitude: long, 
          curDate: vDate, 
          id: uniqueID
        }
  
        locations.push(pos);
        this.setState({locationHistory: locations});
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Heatmap</Text>
        <MapView
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: defaultLat,
          longitude: defaultLong,
          latitudeDelta: defaultDelta,
          longitudeDelta: defaultDelta,
        }}
        showsUserLocation={true}
        style={styles.mapContainer}>
        <MapView.Heatmap points={this.state.locationHistory} /></MapView>
      </View>
    );
  }
}

export default Heatmap;