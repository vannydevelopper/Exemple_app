import React, { useEffect, useRef } from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableNativeFeedback, View, Animated, Easing } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const primaryColor = "#F58424"
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

export default function BotomTab({ state, descriptors, navigation }) {
    const focusedRoute = getFocusedRouteNameFromRoute(state.routes[state.index])
    return (
        <View style={{ ...styles.tabBar, display: focusedRoute == 'PermisScan' ? 'none' : undefined }}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;
                const sizeAnim = useRef(new Animated.Value(25)).current

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
                    useEffect(() => {
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
                    }, [])
                    if (route.name === 'HomePr') {
                        // return <Animated.Text style={{fontSize: sizeAnim}}>here</Animated.Text>
                        const AnimatedIcon = Animated.createAnimatedComponent(AntDesign)
                        return <AnimatedIcon name="home" style={{ fontSize: sizeAnim }} color={isFocused ? primaryColor : '#777'} />
                    } else if (route.name === 'PvHistori') {
                        const AnimatedIcon = Animated.createAnimatedComponent(AntDesign)
                        return <AnimatedIcon name="appstore-o" style={{ fontSize: sizeAnim }} color={isFocused ? primaryColor : '#777'} />
                    } else if (route.name === 'CrudTab') {
                        const AnimatedIcon = Animated.createAnimatedComponent(AntDesign)
                        return <AnimatedIcon name="appstore-o" style={{ fontSize: sizeAnim }} color={isFocused ? primaryColor : '#777'} />
                    } 
                    else if (route.name === 'Profi') {
                        const AnimatedIcon = Animated.createAnimatedComponent(Ionicons)
                        return <AnimatedIcon name="md-person-outline" style={{ fontSize: sizeAnim }} color={isFocused ? primaryColor : '#777'} />
                    }
                }
                return (
                    <TouchableNativeFeedback
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        // style={{...styles.tab, backgroundColor: 'red', height: '100%', padding: 10}}
                        background={TouchableNativeFeedback.Ripple('#c9c5c5', true)}
                        key={route.key}
                    >
                        <View style={styles.tab}>
                            <View>
                                <Icon />
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                );
            })}
        </View>
    );
}
const { width } = Dimensions.get('window')
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tabBar: {
        backgroundColor: '#F3F7F7',
        height: 45,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        padding: 0
    },
    tab: {
        flex: 1,
        width: width / 3,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    },
    badge: {
        position: 'absolute',
        right: -15,
        top: -10,
        backgroundColor: '#f53636',
        padding: 5,
        width: 20,
        height: 20,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50
    }
})