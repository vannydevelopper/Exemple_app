import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import HomeScreen from "../homes/HomeScreen";
const Stack = createNativeStackNavigator()

export default function HomeNavigator(){
       return(
              <Stack.Navigator>
                     <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} title="Accueil" />
              </Stack.Navigator>
       )
}