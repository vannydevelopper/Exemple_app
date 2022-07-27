import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LoginScreen from "./screens/Auth/LoginScreen";
import DrawerNavigator from "./screens/routes/DrawerNavigator";
import Tabs from "./screens/routes/Tabs";
import { setUserAction } from "./store/actions/userActions";
import { userSelector } from "./store/selectors/userSelector";

const Stack = createNativeStackNavigator()

export default function AppContainer(){
       const dispatch = useDispatch()
       const user = useSelector(userSelector)

       useEffect(()=>{
              (async function(){
                     const user = await AsyncStorage.getItem("user")
                     //await AsyncStorage.removeItem('user')
                     dispatch(setUserAction(JSON.parse(user)))
                     // setUserLoading(false)
              }) ()
       },[dispatch])

       return(
             <NavigationContainer>
                    {user ? 
              //       <Tabs/>
                    <DrawerNavigator/>
                    :
                     <Stack.Navigator>
                            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
                     </Stack.Navigator>}
             </NavigationContainer>
       )
}