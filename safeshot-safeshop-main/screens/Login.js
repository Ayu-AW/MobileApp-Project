import React, {useEffect, useState} from 'react';
import { Dimensions, Image, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from '../components/'

import * as firebase from 'firebase';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const facebookButtonImage = require('../assets/facebookButton.png');
const googleButtonImage = require('../assets/googleButton.png');
const logoImage = require('../assets/logo.png');

var firebaseConfig = {
  apiKey: "AIzaSyD88N40xK66jYXLFgEu49_M2gZQXYqJsXU",
  authDomain: "socialauth-36d98.firebaseapp.com",
  projectId: "socialauth-36d98",
  storageBucket: "socialauth-36d98.appspot.com",
  messagingSenderId: "484768175308",
  appId: "1:484768175308:web:c93fc1ffcb039f94025e69",
  measurementId: "G-8F3WLLY1YN"
};

const styles = StyleSheet.create({
  container: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: "#b3e0ff"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  facebookButton: {
    width: 300,
    height: 60
  },
  googleButton: {
    width: 303,
    height: 60
  },
  loginText: {
    fontSize: Theme.typography.medium, 
    marginBottom: Theme.spacing.itemVerticalSpacing
  },
  loginButtonWrapper:{
    marginBottom: Theme.spacing.itemVerticalSpacing
  },
  logoContainer: {
    width: 400,
    height: 300,
    marginBottom: Theme.spacing.itemVerticalSpacing + 50,
    marginRight: 50
  },
  textStyle: {
    fontSize: Theme.typography.large,
    fontWeight: "bold",
    textAlign: 'center',
    color:"#0099ff",
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 2,
    textShadowColor: '#001f33',
  },
  socialAuthContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
  }
});

class Login extends React.Component {
  state = {  
    loggedIn: false
  }

  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    else {
        firebase.app();
    }
    
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.setState({loggedIn: true}); 
      } 
      else {
        this.setState({loggedIn: false}); 
      }
    })
  }

  async onFacebookLoginPressed() {
    try {
        await Facebook.initializeAsync({
            appId: '445608776652097',
        });
        const { type, token } = await Facebook.logInWithReadPermissionsAsync({
            permissions: ['public_profile'],
        });
        if (type === 'success') {
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            const credential = firebase.auth.FacebookAuthProvider.credential(token);
            const facebookProfileData = await firebase.auth().signInWithCredential(credential);
            this.onLoginSuccess.bind(this);
            this.props.navigation.navigate('Home');
        }
    } 
    catch ({ message }) {
        console.log("FACEBOOK ERROR : ", message);
    }
  }

  async onGoogleLoginPressed() {
    try {
        const result = await Google.logInAsync({
            androidClientId: "779472707624-2vgk0b3kfobi107uihe0n7u1er9a3jbn.apps.googleusercontent.com",
            iosClientId: "779472707624-2d8kkjc12lnq05tksqm8u0n8n346gccc.apps.googleusercontent.com",
            scopes: ['profile', 'email']
        });

        if (result.type === 'success') {
            this.onGoogleSignIn(result);
            return result.accessToken;
        } 
        else {
            return { cancelled: true };
        }
      } catch (ex) {
          return { error: true };
      }
  }

  onGoogleSignIn = (googleUser) => {
    try {
      var credential = firebase.auth.GoogleAuthProvider.credential(googleUser.idToken, googleUser.accessToken);
      this.props.navigation.navigate('Home');
      firebase.auth().signInWithCredential(credential).then(function (result) {
          console.log("User signed in with Google successfully");
      }).catch(function (error) {
          console.log("Error signing in with credential: ", error)
      });
    } 
    catch (ex) {
        console.log("Error with Firebase and/or credentials: ", ex)
    }
  }

  render() {
    return (
      <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.textStyle}>ShopSafe</Text>
      <View style={styles.socialAuthContainer}>
          <Text style={styles.loginText}>Sign In</Text>
          <TouchableOpacity style={styles.loginButtonWrapper} onPress={() => this.onFacebookLoginPressed()}>
              <Image source={facebookButtonImage} style={styles.facebookButton}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onGoogleLoginPressed()}>
              <Image source={googleButtonImage} style={styles.googleButton}/>
          </TouchableOpacity>
      </View>
      <Image source={logoImage} style={styles.logoContainer}/>
      </View>
    );
  }
}

export default Login;