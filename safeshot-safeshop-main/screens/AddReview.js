import React from 'react';
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import Parse from "parse/react-native.js";

import {LocationHistoryContext} from '../contexts/LocationHistoryContext';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight || 0,
    width: windowWidth,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 32,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 24,
  },
  errorMessage: {
    fontSize: 24,
    backgroundColor: '#e01d1d',
    color: '#ffffff',
    textAlign: 'center',
  },
  separator: {
    flex:0.25,
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectionView: {
    flexDirection: "row",
  },
  reviewView: {
    margin: 20,
    backgroundColor: "green",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  reviewText: {
    marginBottom: 15,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  safeButton: {
    backgroundColor: "#17e864",
  },
  notSafeButton: {
    backgroundColor: "#eb4034",
  },
  closeButton: {
    borderRadius: 20,
    padding: 10,
    margin: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});

class AddReview extends React.Component {

  state = {
    reviewText: '',
    safe: false
  }
  addReview = async () => {
    var Review = Parse.Object.extend("Review");
    var review = new Review();
  
    review.set("Safe", this.state.safe);
    review.set("Review", this.state.reviewText);

    try{
        let result = await review.save();
        this.setState({reviewText: '', safe: false});
    }catch(error){
        this.setState({errorText: 'Failed to create new review object: ' + error.message});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.reviewView}>
          <Text style={[styles.reviewText, styles.subtitleText]}>Add Review</Text>
          <Text style={styles.reviewText}>My visit was...</Text>
          <View style={styles.selectionView}>
            <TouchableOpacity style={[styles.button, styles.safeButton]} onPress={() => { this.setState({safe: true}) }}>
              <Text style={styles.buttonText}>Safe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.notSafeButton]} onPress={() => { this.setState({safe: false}) }}>
              <Text style={styles.buttonText}>Not Safe</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.reviewText}
            placeholder="Enter your review here"
            onChangeText = {(value) => {this.setState({reviewText: String(value)})}}
          >
          </TextInput>
          <TouchableOpacity style={styles.button} onPress={() => {this.props.navigation.navigate('LocationHistory'); this.addReview();}}>
              <Text style={styles.buttonText}>Submit Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => { this.props.navigation.navigate('LocationHistory') }}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

AddReview.contextType = LocationHistoryContext;

export default AddReview;