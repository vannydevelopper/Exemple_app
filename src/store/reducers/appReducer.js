export const SET_ROUTE = "SET_ROUTE"

const initials = {
        route : 'Home'
}

export default function AppReducer(app = initials, action){
       switch(action.type){
                case SET_ROUTE :
                        return{...app, route: action.payload}
                
        default :
                return app
       }
}