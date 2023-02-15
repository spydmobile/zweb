export const pad = function (n:any, width:any, z?:any) {
    z = z || ' '
    n = n + ''
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
  }
  
 export const cut = function (n:string, width:number) {
    return n.slice(0,width);
  }



export const formatTimestampToDate= function (unix_timestamp:number) {


    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();
    
    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime
    //console.log(formattedTime);
}

export const timestampToDate= function (unix_timestamp:number) {


    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();
    
    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return date.toLocaleString(); //.split(", ")[1];
    //console.log(formattedTime);
}

export const tentSensorMap = (nid:number) => {
  switch (nid) {
    case 14:
      return "Main Tent"
      break;
      case 8:
      return "Drying Tent"
      break;

      case 9:
      return "Nursery Tent"
      break;

      case 15:
      return "Underdawg Mother Tent"
      break;

      case 16:
      return "Durban Poison Mother Tent"
      break;

      case 11:
      return "Garden Tent"
      break;

    default:
      return false
      break;
  }
}
export const houseSensorMap = (nid:number) => {
  switch (nid) {
    case 7:
      return "Wood Plenum"
      break;
      case 13:
      return "Franco's Lab"
      break;

      case 5:
      return "Wood Thermostat"
      break;

      case 2:
      return "Laundry Room"
      break;

      case 4:
        return "Lab (Spare)"
        break;

    default:
      return false
      break;
  }
}