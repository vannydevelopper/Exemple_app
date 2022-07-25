import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import NotificationScreen from "../notification/NotificationScreen";

const Stack = createNativeStackNavigator()

export default function NotificationNavigator(){
       return(
              <Stack.Navigator>
                     <Stack.Screen name="Notification" component={NotificationScreen} options={{headerShown:false}}/>
              </Stack.Navigator>
       )
}