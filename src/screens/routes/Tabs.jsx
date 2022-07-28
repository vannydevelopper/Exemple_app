import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Host } from "react-native-portalize";
import BottomTab from "../../components/BottomTab";
import HomeNavigator from "./HomeNavigator";
import HistoriqueNavigator from "./HistoriqueNavigator";
import ProfilNavigator from "./ProfilNavigator";

const Tab = createBottomTabNavigator()

export default function Tabs(){
       return(
              <Host>
                     <Tab.Navigator tabBar={props => <BottomTab {...props} />}>
                            <Tab.Screen name="HomePr" component={HomeNavigator} options={{headerShown:false}}/>
                            <Tab.Screen name="PvHistori" component={HistoriqueNavigator} options={{headerShown:false}}/>
                            <Tab.Screen name="Profi" component={ProfilNavigator} options={{headerShown:false}}/>
                     </Tab.Navigator>
              </Host>
       )
}