import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { Text, View } from "react-native";
import NotificationScreen from "../notification/NotificationScreen";
import ProfilScreen from "../profil/ProfilScreen";

const Drawer = createDrawerNavigator()

export default function DrawerNavigator(){
       return(
              <Drawer.Navigator>
                     <Drawer.Screen name="Notification" component={NotificationScreen}/>
                     <Drawer.Screen name="Profil" component={ProfilScreen}/>
              </Drawer.Navigator>
       )
}