import { SET_ROUTE } from "../reducers/appReducer"

export const setRouteAction = (route) =>{
        return{
                type : SET_ROUTE,
                payload: route
        }
}