import React, { useEffect, useState } from "react";
import { Animated, View,Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

export default function TopTabs({ state, descriptors, navigation, position }) {
       const [translateX] = useState(new Animated.Value(0))
       const {width} = useWindowDimensions()
       const MARGIN = 20
       const TAB_BAR_WIDTH = width - 2 * MARGIN
       const TAB_WIDTH = (width / 2) - MARGIN

       const translateTab = (index) => {
              const sub = index == 0 ? 3 : -3
              Animated.spring(translateX, {
                        toValue: index * TAB_WIDTH + sub,
                        useNativeDriver: true
              }).start()
       }

       useEffect(()=>{
              translateTab(state.index)
       },[state.index])
       
       return (
              <View style={{...styles.tabBar, width: TAB_BAR_WIDTH }}>
                     <View style={{...styles.slidingContainer, width: TAB_WIDTH}}>
                            <Animated.View style={{
                                   ...styles.slidingTab,
                                   transform: [{ translateX }]
                                   }}
                            />
                     </View>
                     {state.routes.map((route, index) => {
                            const { options } = descriptors[route.key];
                            const label =
                                   options.tabBarLabel !== undefined
                                          ? options.tabBarLabel
                                          : options.title !== undefined
                                                 ? options.title
                                                 : route.name;

                            const isFocused = state.index === index;

                            const onPress = () => {
                                   const event = navigation.emit({
                                          type: 'tabPress',
                                          target: route.key,
                                          canPreventDefault: true,
                                   });

                                   if (!isFocused && !event.defaultPrevented) {
                                          // The `merge: true` option makes sure that the params inside the tab screen are preserved
                                          navigation.navigate({ name: route.name, merge: true });
                                   }
                            };

                            const onLongPress = () => {
                                   navigation.emit({
                                          type: 'tabLongPress',
                                          target: route.key,
                                   });
                            };

                            const inputRange = state.routes.map((_, i) => i);
                            const opacity = position.interpolate({
                                   inputRange,
                                   outputRange: inputRange.map(i => (i === index ? 1 : 0)),
                            });

                            return (
                                   <TouchableOpacity
                                          accessibilityRole="button"
                                          accessibilityState={isFocused ? { selected: true } : {}}
                                          accessibilityLabel={options.tabBarAccessibilityLabel}
                                          testID={options.tabBarTestID}
                                          onPress={onPress}
                                          onLongPress={onLongPress}
                                          style={{ flex: 1 }}
                                   >
                                          <View style={styles.badge}>
                                                 <Text style={styles.labelText}>
                                                        {label}
                                                 </Text>
                                          </View>
                                          
                                   </TouchableOpacity>
                            );
                     })}
              </View>
       )
}

const styles = StyleSheet.create({
       tabBar:{
              backgroundColor:"#F58424",
              height:50,
              borderRadius:10,
              padding:3,
              alignSelf:"center",
              flexDirection:"row",
              justifyContent:"space-around",
              alignItems:"center",
              alignContent:"center",
              paddingVertical:0,
              elevation:10,
              shadowColor:"#c4c4c4",
              marginTop:3,
       },
       badge:{
              height:"100%",
              alignItems:"center",
              justifyContent:"center",
              flexDirection:"row",
              
       },
       labelText:{
              color: '#000',
              fontWeight: 'bold',
              opacity: 0.7,
              fontSize: 13
       },
       slidingContainer:{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
       },
       slidingTab: {
              height: 44,
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 30
       },
})