import React from 'react';
import { Dimensions, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, Linking, Platform } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment'
import CalendarPicker from 'react-native-calendar-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Parse from "parse/react-native.js";
import { concat } from 'react-native-reanimated';
import * as firebase from 'firebase';



const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        marginTop: StatusBar.currentHeight || 0,
        width: windowWidth,
        height: windowHeight,
    },
    titleText: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 50,
        marginTop: 50
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1
    },
    button: {
        borderRadius: 15,
        padding: 10,
        margin: 5,
        elevation: 2,
        backgroundColor: "blue",
        width: 110,
        justifyContent: 'center'
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
        height: 400,
        width: 400,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    selectedDateContainer: {
        borderColor: 'blue',
        height: 50,
        width: "60%",
        alignSelf: 'center',
        borderWidth: 1,
        borderRadius: 50,
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

class PlanTripOption extends React.Component {

    async componentDidMount() {
        this.getTrips()

    }


    async getTrips() {
        const userId = firebase.auth().currentUser.uid

        const query = new Parse.Query("PlanTrip");
        //specify the condition to search the data
        query.equalTo('userId', userId);
        const resultQuery = await query.find();
        console.log("RESULT: ", resultQuery)
        if (resultQuery) {
            this.setState({
                trips: resultQuery
            })
        }
    }

    async deleteTrip(objectId) {
        //create an instance of our object
        const query = new Parse.Query("PlanTrip");
        //get the item we want to delete
        const object = await query.get(objectId);
        try {
            //delete the item
            object.destroy();
            //fetch a new list of trips
            alert("Trip Deleted")
            this.getTrips();
        } catch (e) {
            alert(e)
        }
    }

    state = {
        trips: []
    }


    render() {
        return (

            <ScrollView>
                <Text style={styles.titleText}>Planned Trips</Text>


                {
                    //iterate thought the fetched trip one by one and assign them to "trip" variable
                    this.state.trips.reverse().map((trip) => (
                        //item container, we set flexDirection to 'row' which changes the items to a horizontal placement
                        <View style={{
                            backgroundColor: 'blue',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginHorizontal: 20,
                            paddingHorizontal: 20,
                            flexDirection: 'row',
                            paddingVertical: 10,
                            borderRadius: 5,
                            marginBottom: 10
                        }}>
                            {
                                //this will be the first view aligned to the left
                            }
                            <View style={{ width:"50%" }}>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{trip.attributes.date}</Text>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{trip.attributes.time}</Text>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{trip.attributes.location}</Text>
                                <Pressable style={[styles.button, { backgroundColor: '#e7e7e7', paddingVertical: 5 }]} onPress={() => {                                    

                                    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                                    const latLng = `${trip.attributes.locationLat},${trip.attributes.locationLong}`;
                                    const label = 'Custom Label';
                                    const url = Platform.select({
                                    ios: `${scheme}${label}@${latLng}`,
                                    android: `${scheme}${latLng}(${label})`
                                    });


                                    Linking.openURL(url); 
                                    
                                }}>
                                    <Text style={[styles.buttonText, { color: "#000" }]}>Navigate</Text>
                                </Pressable>
                            </View>
                            {
                                // this will be the right side of the content containing the delete and edit buttons
                            }
                            <View>
                                <Pressable style={[styles.button, { backgroundColor: '#e7e7e7' }]} onPress={() => {
                                    //on edit clicked open PlanTrip screen with edit option true and pass the current values
                                    this.props.navigation.push("PlanTrip",{
                                        edit:true,
                                        radius:trip.attributes.radius,
                                        date:trip.attributes.date,
                                        time: trip.attributes.time,
                                        objectId:trip.id
                                    })
                                }}>
                                    <Text style={[styles.buttonText, { color: "#000" }]}>Edit</Text>
                                </Pressable>
                                <Pressable style={[styles.button, { backgroundColor: 'red' }]} onPress={() => {
                                    //pass the trip object id to delete it
                                    this.deleteTrip(trip.id)
                                }}>
                                    <Text style={[styles.buttonText, { color: "#000" }]}>Remove</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))
                }



            </ScrollView>

        );
    }
}

export default PlanTripOption;