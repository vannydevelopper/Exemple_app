import React from "react"

export default function ContextDonnerScree() {
        const contextValues = {
                products,
                menus,
                firstLoadingProducts,
                loadingProducts,
                firstLoadingMenus,
                loadingMenus
        }
        return (
                <SearchContext.Provider value={contextValues}>
                        <View style={styles.container}>
                                <View style={styles.cardHeader}>
                                        <TouchableOpacity style={styles.menuOpener} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                                                <View style={styles.menuOpenerLine} />
                                                <View style={[styles.menuOpenerLine, { width: 15 }]} />
                                                <View style={[styles.menuOpenerLine, { width: 25 }]} />
                                        </TouchableOpacity>
                                        <EcommerceBadge />
                                </View>
                                <Text style={styles.titlePrincipal}>Liste des produits</Text>
                                <TopBar.Navigator
                                        screenOptions={{
                                                tabBarStyle: styles.tabBar,
                                                tabBarLabelStyle: {
                                                        color: COLORS.ecommercePrimaryColor,
                                                        textTransform: 'none',
                                                        fontSize: 15
                                                },
                                                tabBarIndicatorStyle: {
                                                        height: 3,
                                                        backgroundColor: COLORS.ecommercePrimaryColor,
                                                }
                                        }}
                                >
                                        <TopBar.Screen name='EcommerceResearchScreen' component={EcommerceResearchScreen} initialParams={search} options={{ title: "E-commerce" }} />
                                        <TopBar.Screen name='RestaurantResearchScreen' component={RestaurantResearchScreen} initialParams={search} options={{ title: "Restauration" }} />
                                </TopBar.Navigator>
                        </View>
                </SearchContext.Provider>
        )
}