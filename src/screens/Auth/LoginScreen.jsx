import { Button, Icon, Input, FormControl, WarningOutlineIcon, extendTheme } from 'native-base'
import React, { useState } from "react";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet,StatusBar, Text, View, useWindowDimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserAction } from '../../store/actions/userActions';

export default function LoginScreen(){
       const { height}= useWindowDimensions()
       const [showPassword, setShowPassword] = useState(false)
       const [email, setEmail] = useState("")
       const [password, setPassword] = useState("")
       const navigation = useNavigation()
       const dispatch = useDispatch()

       const connexion = async () =>{
              const user = {
                     email,
                     password
              };
              try{
                     await AsyncStorage.setItem("user",JSON.stringify(user));
                     dispatch(setUserAction(user))
              }
              catch(error){
                     console.log(error)
              }
       }

       return(
              <ScrollView keyboardShouldPersistTaps="handled">
                     <View style={styles.container}>
                            <Image source={require("../../../assets/images/home.png")} style={{...styles.images, resizeMode:"center", height: (40*height-StatusBar.currentHeight)/100}}/>
                     </View>
                     <Text style={styles.title}>Connexion</Text>
                     <View style={styles.inputStyles}>
                     <Input
                     placeholder="Entrez votre email"
                     borderWidth={0}
                     borderBottomWidth={1}
                     borderBottomColor={'#ddd'}
                     onChangeText={(text)=>setEmail(text)}
                     value={email}
                     py={2}
                     mt={2}
                     InputLeftElement={
                            <Icon
                            as={<MaterialIcons name="alternate-email" size={20} color="#777" />}
                            size={6}
                            mr="2"
                            color="muted.400"
                            />
                     }
                     />

                     <Input
                     placeholder='entrez votre not de passe'
                     borderWidth={0}
                     borderBottomWidth={1}
                     borderBottomColor={"#ddd"}
                     onChangeText={(text)=>setPassword(text)}
                     value={password}
                     py={2}
                     mt={2}
                     secureTextEntry={!showPassword}
                     InputLeftElement={
                            <Icon
                                   as={<Ionicons name="lock-closed-outline" size={20} color="#777" />}
                                   size={6}
                                   mr="2"
                                   color="muted.400"
                            />}
                     InputRightElement={
                            <Icon
                                   as={<Ionicons name={!showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#777" />}
                                   size={6}
                                   mr="2"
                                   color="muted.400"
                                   onPress={() => setShowPassword(t => !t)}
                            />}
                     />

                     <Button
                     borderRadius={15}
                     // isDisabled={email == "" || password == ""}
                     onPress={connexion}
                     mt={5}
                     backgroundColor={"#F58424"}
                     py={3.5}
                     _text={{ color: '#fff', fontWeight: 'bold' }}
                     >
                            Connecter
                     </Button>


                     </View>
              </ScrollView>
       )
}

const styles = StyleSheet.create({
       container:{
              flex:1
       },
       images:{
              maxWidth: '80%',
              alignSelf: 'center',    
       },
       inputStyles:{
              marginHorizontal: 10
       },
       title:{
              fontSize: 20,
              marginHorizontal: 10,
              fontWeight:"bold",
              color:"#777"
       }
})