import React from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment'
import CalendarPicker from 'react-native-calendar-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Parse from "parse/react-native.js";
import { concat } from 'react-native-reanimated';
import * as firebase from 'firebase';
import * as Location from 'expo-location';
import _ from 'lodash'

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

class PlanTrip extends React.Component {


    state = {
        selectedRadius: 1,
        showPickDataView: false,
        selectedDate: null,
        showTimePicker: false,
        selectedTime: null,
        location: "",
        locationLat: "",
        locationLong: ""

    }


    componentDidMount() {
        //check if we have any navigation params and check if we are in edit mode 
        if (this.props.route && this.props.route.params && this.props.route.params.edit) {
            //assign the data from the navigation param to our current state
            this.setState({
                selectedDate: this.props.route.params.date,
                selectedRadius: this.props.route.params.radius,
                selectedTime: this.props.route.params.time,

            })
        }

    }

    async saveTrip() {

        //get user location
        if (!await this.getUserLocation()) {
            return
        }


        //these state hold the user selected values/we are destructuring them
        const { selectedRadius, selectedDate, selectedTime, location, locationLat, locationLong } = this.state
        //get loggedin user id from firebase
        const userId = firebase.auth().currentUser.uid



        //create a new instance to save the trip
        var PlanTrip = Parse.Object.extend("PlanTrip");
        var trip = new PlanTrip();
        //save 
        trip.set("radius", selectedRadius);
        trip.set("date", selectedDate);
        trip.set("time", selectedTime);
        trip.set("userId", userId);
        trip.set("location", location);
        trip.set("locationLat", locationLat);
        trip.set("locationLong", `${locationLong}`);



        try {
            let result = await trip.save();
            alert("Trip Added")

            //console.log("RESULT : ", result)
        } catch (error) {
            console.log('ERROR : ', error)

        }
    }

    async getUserLocation() {
        //ask user for location permissions
        var userLocation = null
        try {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
            }
            //request user location
            userLocation = await Location.getCurrentPositionAsync({});
        } catch (e) {
        }

        if (userLocation) {
            return this.setCurrentLocation(userLocation)
        } else {
            let geoOptions = {
                enableHighAccuracy: false,
                timeOut: 10000,
            };
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    return this.setCurrentLocation(position)
                },
                () => {

                },
                geoOptions
            );
        }
    }

    async setCurrentLocation(userLocation) {
        var LocationContext = Parse.Object.extend("Location");
        var query = new Parse.Query(LocationContext);

        query.exists("lat"); //get only objects with latitude
        var results = await query.find(); //wait for query.find() to finish

        var storeCoords = null
        var allLocations = []

        results = results.map((re) => {
            console.log("RESULTS MAP : ", re.id)
            return {
                "createdAt": re.get("createdAt"),
                "curDate": re.get("curDate"),
                "lat": re.get("lat"),
                "long": re.get("long"),
                "objectId": re.id,
                "updatedAt": re.get("updatedAt"),
                "user": re.get("user") || 0
            }
        })

        results = _.orderBy(results, ['user'], ['asc'])
        for (let i = 0; i < results.length; i++) {
            const location = results[i];
            var lat = location.lat;
            var long = location.lat;
            //console.log("USER AND STORE DIFF : OBJECT",location )

            storeCoords = {
                latitude: lat,
                longitude: long,
                objectId: location.objectId,
                users: location.user || 0
            }


            if (this.calcCrow(lat, long, userLocation.coords.latitude, userLocation.coords.longitude) > this.state.selectedRadius) {
                alert("Sorry, no stores near you with that radius")
                return false
            } else {
                break;
            }
            var uniqueID = location.id;
            const pos = { lat: lat, long, id: uniqueID, modalVisible: false }
        }

        try {
            let locationData = await Location.reverseGeocodeAsync(storeCoords)
            console.log("storeCoords longitude: ", storeCoords.longitude)
            this.setState({
                location: `${locationData[0].street}, ${locationData[0].city} ${locationData[0].country}`,
                locationLat: storeCoords.latitude,
                locationLong: storeCoords.longitude,
            })
            this.forceUpdate()

            const query = new Parse.Query("Location");
            console.log("STORE COORDS : ", storeCoords)
            //console.log("STORE COORDS USER: ", storeCoords.user)

            query.get(storeCoords.objectId).then(object => {
                object.set("user", storeCoords.users + 1)//user plus one
                object.save().then(objUpdate => {

                    //console.log("USER SAVED ON LOCATION")
                }).catch((e) => {
                    //console.log("ERROR SAVING USER : ", e)
                });
            });
        } catch (e) {
            //console.log("GEOCODE ERROR : ", e)
        }
        return true
    }

    calcCrow(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = this.toRad(lat2 - lat1);
        var dLon = this.toRad(lon2 - lon1);
        var lat1 = this.toRad(lat1);
        var lat2 = this.toRad(lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    // Converts numeric degrees to radians
    toRad(Value) {
        return Value * Math.PI / 180;
    }

    async editTrip() {
        //get the trip object id from our navigation param
        const { objectId } = this.props.route.params
        //get our new values from state
        const { selectedRadius, selectedDate, selectedTime } = this.state


        const query = new Parse.Query("PlanTrip");
        query.get(objectId).then(object => {
            object.set("radius", selectedRadius);
            object.set("date", selectedDate);
            object.set("time", selectedTime);

            object.save().then(objUpdate => {

                alert("Trip Updated")
            });
        });
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.container}>
                    {
                        //switch between the data picker view and mile picker view 
                        this.state.showPickDataView ? (
                            <View>
                                <Text style={[styles.titleText, { fontSize: 23, marginTop: 50, marginBottom: 30 }]}>I am planing to shop on</Text>
                                <View style={styles.selectedDateContainer}>
                                    <Text>

                                        {
                                            //if there is a selected date display that or else display the text "select date"
                                            this.state.selectedDate || "Select a date"
                                        }
                                    </Text>
                                </View>
                                <CalendarPicker
                                    onDateChange={(date) => {
                                        //get the selected date and assign it to your state in the format mm/dd/yyyy
                                        this.setState({ selectedDate: new Date(date).toLocaleDateString() })
                                    }}
                                    selectedStartDate={this.state.selectedDate}
                                />
                                <Text style={[styles.titleText, { fontSize: 23, marginTop: 50, marginBottom: 30 }]}>I am planing to go to the store at</Text>

                                <Pressable style={[styles.selectedDateContainer, { alignSelf: 'center' }]} onPress={() => {
                                    this.setState({
                                        //open time picker dialog
                                        showTimePicker: true
                                    })
                                }}>
                                    <Text style={{ color: "#000" }}>
                                        {
                                            //if there is a selected time display that or else display the text "select time"
                                            this.state.selectedTime || "Select Time"
                                        }
                                    </Text>
                                </Pressable>


                                <DateTimePickerModal
                                    isVisible={this.state.showTimePicker}
                                    mode="time"
                                    onConfirm={(time) => {
                                        // get the selected time from user and assign to our state using hh:mm format
                                        this.setState({
                                            selectedTime: moment(new Date(time)).format('hh:mm A'),
                                            showTimePicker: false
                                        })
                                    }}
                                    onCancel={() => {
                                        this.setState({
                                            showTimePicker: false
                                        })
                                    }}
                                />
                                {
                                    //if we are in edit mode display an edit button or else display save button
                                    this.props.route && this.props.route.params && this.props.route.params.edit ? (
                                        <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => {
                                            this.editTrip()
                                        }}>
                                            <Text style={styles.buttonText}>Edit</Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => {
                                            this.saveTrip()
                                        }}>
                                            <Text style={styles.buttonText}>Save</Text>
                                        </Pressable>
                                    )
                                }

                            </View>
                        ) : (
                            <View>
                                <Text style={styles.titleText}>Plan Trip</Text>

                                <Text style={[styles.titleText, { fontSize: 23, marginTop: 100 }]}>I am looking for grocery stores within</Text>

                                <DropDownPicker
                                    items={[
                                        { label: '1', value: '1' },
                                        { label: '5', value: '5' },
                                        { label: '10', value: '10' },
                                        { label: '20', value: '20' },
                                        { label: '50', value: '50' },
                                        { label: '100', value: '100' }
                                    ]}
                                    defaultValue={this.state.selectedRadius}
                                    containerStyle={{
                                        height: 40,
                                        marginHorizontal: 40,
                                    }}
                                    dropDownStyle={{
                                        backgroundColor: "#a7a7a7"
                                    }}
                                    style={{ backgroundColor: 'blue' }}
                                    itemStyle={{
                                        justifyContent: 'center',

                                    }}
                                    activeItemStyle={{
                                        color: "blue",
                                    }}
                                    activeLabelStyle={{
                                        color: "blue"

                                    }}
                                    dropDownStyle={{ backgroundColor: '#a7a7a7' }}
                                    onChangeItem={item => this.setState({
                                        selectedRadius: item.value
                                    })}
                                />

                                <Text style={[styles.titleText, { fontSize: 23, marginTop: 50 }]}>miles of my location</Text>

                                <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => {
                                    this.setState({
                                        //change this state to make the calendar visible so user can select a date for their trip
                                        showPickDataView: true
                                    })
                                }}>
                                    <Text style={styles.buttonText}>Next</Text>
                                </Pressable>
                            </View>
                        )
                    }

                </View>
            </ScrollView>
        );
    }
}

export default PlanTrip;