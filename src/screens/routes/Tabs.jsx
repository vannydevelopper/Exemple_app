import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Host } from "react-native-portalize";
import BottomTab from "../../components/BottomTab";
import HomeNavigator from "./HomeNavigator";
import NotificationNavigator from "./NotificationNavigator";
import Profilnavigator from "./ProfilNavigator";

const Tab = createBottomTabNavigator()

export default function Tabs(){
       return(
              <Host>
                     <Tab.Navigator tabBar={props => <BottomTab {...props} />}>
                            <Tab.Screen name="HomePr" component={HomeNavigator} options={{headerShown:false}}/>
                            <Tab.Screen name="Profil" component={Profilnavigator} options={{headerShown:false}}/>
                            <Tab.Screen name="Notification" component={NotificationNavigator} options={{headerShown:false}}/>
                     </Tab.Navigator>
              </Host>
       )
}