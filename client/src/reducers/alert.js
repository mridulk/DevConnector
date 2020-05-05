import {SET_ALERT,REMOVE_ALERT} from '../actions/types'
const initialState=[
    // {
    //     id:1,
    //     msg:'Please Login',
    //     alertType:'success'
    // }
]
export default function(state=initialState,action){
    //destructuring action
    const {payload,type}=action
    switch(type){
        case SET_ALERT:
            return [...state,payload]//it will add a new alert to the array
        case REMOVE_ALERT:
            return state.filter((alert)=>alert.id!==payload)
        default:
            return state
    }
}