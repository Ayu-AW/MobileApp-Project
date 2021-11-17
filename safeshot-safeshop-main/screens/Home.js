import React from 'react';
import { Dimensions, ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import * as firebase from 'firebase';
import Parse from "parse/react-native.js";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const logoImage = require('../assets/logo.png');

const styles = StyleSheet.create({
  container: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: "#b3e0ff"
  },
  titleText: {
    fontSize: 50,
    fontWeight: "bold",
    textAlign: 'center',
    color:"#0099ff",
    marginTop: 0,
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 2,
    textShadowColor: '#001f33',
  },
  logoutText:{
    color:'red',
    textAlign: 'center',
    fontWeight: "bold",
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
  image: {
    flex: 0.2,
    width:150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 105
  },
  logo:{
    borderColor: "black",
    borderRadius: 15,
  },
  
});

class Home extends React.Component {
  componentDidMount() {
    this.createInstallation();
  }
  
  createInstallation = async () => { //async function
    const Installation = Parse.Object.extend(Parse.Installation);
    const installation = new Installation();

    installation.set("deviceType", Platform.OS);

    await installation.save();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>ShopSafe</Text>
        <ImageBackground source={logoImage} style={[styles.image, styles.logo]}></ImageBackground>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={() => { this.props.navigation.navigate('LocationHistory') }}>
            <Text style={styles.buttonText}>Location History</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => { this.props.navigation.navigate('Heatmap') }}>
            <Text style={styles.buttonText}>Heatmap</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => { this.props.navigation.navigate('PlanTripOption') }}>
            <Text style={styles.buttonText}>Plan Trip</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => { this.props.navigation.navigate('Reviews') }}>
            <Text style={styles.buttonText}>Store Reviews</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={async () => {await firebase.auth().signOut(); this.props.navigation.navigate('Login')} }>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

export default Home;