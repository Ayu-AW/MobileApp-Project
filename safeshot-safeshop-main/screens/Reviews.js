import React from 'react';
import { Dimensions, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Parse from "parse/react-native.js";

var reviews = []

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    width: windowWidth,
    justifyContent: 'center',
    backgroundColor: "#b3e0ff"
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
    backgroundColor: "#4db8ff",
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
  reviewLabel: {
    marginBottom: 15,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  reviewText: {
    marginBottom: 5,
    textAlign: "center",
    color: "white",
  },
  reviewSeparator: {
    flex:1,
    marginVertical: 4,
    borderBottomColor: '#000000',
    borderBottomWidth: StyleSheet.hairlineWidth,
    width:200
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
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

class Reviews extends React.Component {
  state = {
    reviews: [], 
    refresh: false
  }

  componentDidMount() {
    this.getReviewsFromDatabase();
  }

  getReviewsFromDatabase = async () => {
    var Review = Parse.Object.extend("Review");
    var query = new Parse.Query(Review);

    reviews = [];

    try{
        query.exists("Safe"); 
        const results = await query.find(); 

        for (let i = 0; i < results.length; i++) {
          const review = results[i];
          var safe = review.get("Safe").toString();
          var reviewText = review.get("Review");
          var id = review.id;
          const rev = {safe: safe, review: reviewText, id: id};
          reviews.push(rev);
        }
        this.setState({reviews: reviews, refresh: !this.state.refresh});
    }catch(error){
        console.log("Error getting reviews from database: " + error);
    }
  }

  reviewRenderItem = ({ item }) => {
    return (
      <View>
        <View>
          <Text style={styles.reviewLabel}>Safe: {item.safe}</Text>
          <Text style={styles.reviewText}>{item.review}</Text>
        </View>
        <View style={styles.separator} />
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.reviewView}>
          <Text style={[styles.reviewText, styles.subtitleText]}>Reviews</Text>
          <FlatList
            data={reviews}
            renderItem={this.reviewRenderItem}
            extraData={this.state.refresh}
          />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => { this.props.navigation.navigate('Home') }}>
            <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default Reviews;