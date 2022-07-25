import React, { useEffect,  useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
const primaryColor = "#F58424"
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

export default function BottomTab({ state, descriptors, navigation }){
       const focusedRoute = getFocusedRouteNameFromRoute(state.routes[state.index])
       return (
              <View style={{ ...styles.tabBar, flexDirection: 'row' }}>
                {state.routes.map((route, index) => {
                  const { options } = descriptors[route.key];
                  const isFocused = state.index === index;
              const sizeAnim = useRef(new Animated.Value(25)).current
                  const label =
                    options.tabBarLabel !== undefined
                      ? options.tabBarLabel
                      : options.title !== undefined
                      ? options.title
                      : route.name;
          
          
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

                  const Icon = () => {
                     useEffect(()=>{
                            if (isFocused) {
                                   Animated.timing(sizeAnim, {
                                       toValue: 25,
                                       duration: 80,
                                       useNativeDriver: false
                                   }).start()
                               } else {
                                   Animated.timing(sizeAnim, {
                                       toValue: 20,
                                       duration: 80,
                                       useNativeDriver: false
                                   }).start()
                            }
                     },[])
                     if (route.name === 'HomeTab') {
                            // return <Animated.Text style={{fontSize: sizeAnim}}>here</Animated.Text>
                            const AnimatedIcon = Animated.createAnimatedComponent(AntDesign)
                            return <AnimatedIcon name="home" style={{ fontSize: sizeAnim }} color={isFocused ? primaryColor : '#777'} />
                        } else if (route.name === 'Profil') {
                            const AnimatedIcon = Animated.createAnimatedComponent(AntDesign)
                            return <AnimatedIcon name="appstore-o" style={{ fontSize: sizeAnim }} color={isFocused ? primaryColor : '#777'} />
                        } else if (route.name === 'Notification') {
    
                            const AnimatedIcon = Animated.createAnimatedComponent(Ionicons)
                            return <AnimatedIcon name="md-person-outline" style={{ fontSize: sizeAnim }} color={isFocused ? primaryColor : '#777'} />
                        }
                  }
          
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
                      <Text style={{ color: isFocused ? '#673ab7' : '#222' }}>
                        {label}
                      </Text>

                      {/* <View style={styles.tab}>
                            <View>
                                   <Icon/>
                            </View>
                      </View> */}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
}

const styles = StyleSheet.create({
       tabBar:{
              backgroundColor: '#F3F7F7',
              width:"100%",
              height: 45,
              flexDirection:"row",
              justifyContent:"space-between",
              alignItems:"center",
              justifyContent:"center",
              padding: 0  
       },
       tab:{

       }
})