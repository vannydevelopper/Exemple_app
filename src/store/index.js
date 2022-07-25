import { combineReducers, createStore } from "redux";
import userReducer from "./reducers/userReducer";

export const store = createStore(
       combineReducers({
              user : userReducer
       })
)