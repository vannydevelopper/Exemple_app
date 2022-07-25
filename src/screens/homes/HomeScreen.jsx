import React, { useEffect, useRef, useState } from "react";
import { ScrollView,StyleSheet,BackHandler,Animated, TouchableOpacity,TouchableWithoutFeedback, StatusBar, Text, View } from "react-native";
import { Entypo, FontAwesome5, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Host, Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';

const ExempleModal = ({onClose}) => {
       const [scale] = useState(new Animated.Value(1.1))
       useEffect(()=>{
              const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                     onClose()
                     return true
              }) 
              Animated.spring(scale, {
                     toValue: 1,
                     useNativeDriver: true
              }).start()
              return () => {
                     backHandler.remove()
              }
       },[])
       return(
              <Portal>
                      <TouchableWithoutFeedback onPress={onClose}>
                            <View style={styles.modalContainer}>
                                   <TouchableWithoutFeedback>
                                          <Animated.View style={{...styles.modalContent, transform: [{ scale }]}}>
                                                 <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#F58424' }}>
                                                        <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                               Partenaires
                                                        </Text>
                                                 </View>
                                                 <ScrollView keyboardShouldPersistTaps="handled">
                                                        <View style={styles.modalList}>
                                                               <TouchableWithoutFeedback>
                                                                      <View style={styles.modalItem}>
                                                                             <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" />
                                                                             <Text numberOfLines={1} style={styles.modalText}>Les outils</Text>
                                                                      </View>    
                                                               </TouchableWithoutFeedback>
                                                        </View>
                                                 </ScrollView>
                                          </Animated.View>  
                                   </TouchableWithoutFeedback>
                            </View>
                      </TouchableWithoutFeedback>
              </Portal>
       )
}

const DeclareModal = ({onClose}) => {
       const [scale] = useState(new Animated.Value(1.1))
       useEffect(()=>{
              const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                     onClose()
                     return true
              }) 
              Animated.spring(scale, {
                     toValue: 1,
                     useNativeDriver: true
              }).start()
              return () => {
                     backHandler.remove()
              }
       },[])
       return(
              <Portal>
                     <TouchableWithoutFeedback onPress={onClose}>
                            <View style={styles.modalContainer}>
                                   <TouchableWithoutFeedback>
                                          <Animated.View style={{...styles.modalContent, transform: [{ scale }]}}>
                                                 <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#F58424' }}>
                                                        <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                               Partenaires
                                                        </Text>
                                                 </View>
                                                 <ScrollView keyboardShouldPersistTaps="handled">
                                                        <View style={styles.modalList}>
                                                               <TouchableWithoutFeedback>
                                                                      <View style={styles.modalItem}>
                                                                             <MaterialCommunityIcons name="radiobox-marked" size={24} color="#007bff" />
                                                                             <Text numberOfLines={1} style={styles.modalText}>Test</Text>
                                                                      </View>    
                                                               </TouchableWithoutFeedback>
                                                        </View>
                                                 </ScrollView>
                                          </Animated.View>  
                                   </TouchableWithoutFeedback>
                            </View>
                      </TouchableWithoutFeedback>
              </Portal>
       )
}



export default function HomeScreen(){
       const [showPartenaires, setshowPartenaires] = useState(false)
       const [showDeclarations, setshowDeclarations] = useState(false)
       // const declareRef = useRef(null)
      

       return(
              <>
                     <View style={styles.container}>
                            <StatusBar backgroundColor="#61dafb"/>
                            <View style={styles.header}>
                                   <View style={styles.icone}>
                                          <FontAwesome5 name="user" size={30} color="black" />
                                   </View>
                                   <View style={styles.cardTitle}>
                                          <Text style={styles.title}>Accuiel</Text>
                                   </View>
                                   <View>
                                          <Entypo name="menu" size={24} color="black" />
                                   </View>
                            </View>
                            <View>
                                   <TouchableOpacity style={styles.modelCard} onPress={()=>setshowPartenaires(true)}>
                                          <Text style={styles.inputText}>
                                                 Selectionner
                                          </Text>
                                          <AntDesign name="caretdown" size={16} color="#777" />
                                   </TouchableOpacity>  
                            </View>
                            <View>
                                   <TouchableOpacity style={styles.modelCard} onPress={()=>setshowDeclarations(true)}>
                                          <Text style={styles.inputText}>
                                                 Selectionner
                                          </Text>
                                          <AntDesign name="caretdown" size={16} color="#777" />
                                   </TouchableOpacity>  
                            </View>
                     </View>
                    {showPartenaires && <ExempleModal onClose={() => setshowPartenaires(false)}/>}
                    {/* <Portal>
                            <Modalize ref={declareRef} adjustToContentHeight handleStyle={{ display: 'none' }} modalStyle={{ borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                                   <DeclareModalize/>
                            </Modalize>
                    </Portal> */}
                    {showDeclarations && <DeclareModal onClose={() => setshowDeclarations(false)}/>}
              </>
       )
}

const styles = StyleSheet.create({
       container:{
              flex: 1,
              // backgroundColor:"red"
              
       },
       title:{
              fontSize: 20,
              color :"#777",
              fontWeight:"bold"
       },
       icone:{
              width: 50,
              height: 50,
              backgroundColor:"#ddd",
              borderRadius: 50,
              justifyContent:"center",
              alignItems:"center"
       },
       header:{
              flexDirection:"row",
              justifyContent:"space-between",
              alignItems:"center",
              marginHorizontal: 10,
              marginTop: 10
       },
       cardTitle:{
              width: "40%",
              height: 30,
              backgroundColor:"#ddd",
              justifyContent:"center",
              alignItems:"center",
              borderRadius: 20
       },
       inputText:{
              fontSize: 17,
              color:"#777"
       },
       modelCard:{
              justifyContent:"space-between",
              flexDirection:"row",
              marginHorizontal:10,
              marginTop: 10,
              backgroundColor:"#fff",
              padding: 9,
              borderRadius: 10,
              borderWidth:1,
              borderColor:"#ddd"
       },
       modalContainer:{
              position: 'absolute',
              zIndex: 1,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              justifyContent: 'center',
              alignItems: 'center'
       },
       modalContent:{
              width: '90%',
              maxWidth: 400,
              backgroundColor: '#fff',
              borderRadius: 10,
              overflow: 'hidden',
              maxHeight: '90%'
       },
       modalContent2:{
              paddingBottom: 20
       },
       modalItem: {
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginTop: 5,
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center'
       },
       modalItem2:{
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginTop: 5,
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center'
       },
       modalList2:{},
       modalText: {
              fontWeight: 'bold',
              marginLeft: 10
       },
})