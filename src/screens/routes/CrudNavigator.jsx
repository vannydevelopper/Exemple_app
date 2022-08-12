import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CrudScreen from "../crud/CrudScreen";

const Stack = createNativeStackNavigator()

export default function CrudNavigator(){
        return(
                <Stack.Navigator>
                        <Stack.Screen name="crud" component={CrudScreen} options={{headerShown:false}}/>
                </Stack.Navigator>
        )
}