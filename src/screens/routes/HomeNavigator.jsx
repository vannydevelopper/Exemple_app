import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import HistoDisign from "../homes/HistoDisign";
import HomeScreen from "../homes/HomeScreen";
import MenuRestoScreen from "../homes/MenuRestoScreen";
import SliderScreen from "../homes/SliderScreen";
import TestScreen from "../homes/TestScreen";
const Stack = createNativeStackNavigator()

export default function HomeNavigator(){
       return(
              <Stack.Navigator>
                     <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} title="Accueil" />
                     <Stack.Screen name="Test" component={TestScreen} options={{headerShown:false}} title="Test"/>
                     <Stack.Screen name="Disign" component={HistoDisign} options={{headerShown:false}} title="Histo"/>
                     <Stack.Screen name="Slider" component={SliderScreen} options={{headerShown:false}} title="Slider"/>
                     <Stack.Screen name="Menu" component={MenuRestoScreen} options={{headerShown:false}} title="Menu"/>
              </Stack.Navigator>
       )
}