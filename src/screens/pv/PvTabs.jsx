import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import TopTabs from "../../components/TopTabs";
import PvNonTraite from "./PvNonTraite";
import PvTraite from "./PvTraite";

const TopBar = createMaterialTopTabNavigator()

export default function PvTabs(){
       return(
              <TopBar.Navigator tabBar={props => <TopTabs {...props} />}>
                     <TopBar.Screen name="Sqlite Json" component={PvTraite}/>
                     <TopBar.Screen name="Sqlite form" component={PvNonTraite}/>
              </TopBar.Navigator>
       )
}