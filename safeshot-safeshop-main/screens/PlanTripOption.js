import React from 'react';
import { Dimensions, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
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

class PlannedTrips extends React.Component {

    render() {
        return (

            <View style={{
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Text style={styles.titleText}>Plan Trip</Text>

                <Pressable style={styles.button} onPress={() => { this.props.navigation.navigate('PlanTrip') }}>
                    <Text style={styles.buttonText}>Plan Next Trip</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={() => { this.props.navigation.navigate('PlannedTrips') }}>
                    <Text style={styles.buttonText}>View Planned Trips</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={() => { this.props.navigation.navigate('Heatmap') }}>
                    <Text style={styles.buttonText}>Crowd Heatmap</Text>
                </Pressable>


            </View>

        );
    }
}

export default PlannedTrips;