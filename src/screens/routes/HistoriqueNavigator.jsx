import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import PvTabs from "../pv/PvTabs";

const Stack = createNativeStackNavigator()

export default function HistoriqueNavigator(){
       return(
              <Stack.Navigator>
                     <Stack.Screen name="Pv" component={PvTabs} options ={{ headerShown:false}}/>
              </Stack.Navigator>
       )
}