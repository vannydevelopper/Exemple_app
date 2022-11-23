import { useRoute } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import React from "react";
import MenuDetailScreen from "../screens/restaurant/MenuDetailScreen";
import NewMenuDetailScreen from "../screens/restaurant/NewMenuDetailScreen";
import NewMenuScreen from "../screens/restaurant/NewMenuScreen";
import RestaurantHomeScreen from "../screens/restaurant/RestaurantHomeScreen";

export default function PasserDonnerNavigator(){
        const route= useRoute()
        const partenaire=route.params
        const Stack = createStackNavigator()
        return(
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="RestaurantHomeScreen" initialParams={partenaire} component={RestaurantHomeScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid}}/>
                        <Stack.Screen name="MenuDetailScreen" initialParams={partenaire} component={MenuDetailScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid}}/>
                        <Stack.Screen name="NewMenuScreen"  initialParams={partenaire} component={NewMenuScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid}}/>
                        <Stack.Screen name="NewMenuDetailScreen" initialParams={partenaire} component={NewMenuDetailScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid}}/>
                </Stack.Navigator>
        )
}