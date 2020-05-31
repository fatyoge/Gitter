export function get_today(){
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export function json_splice(json, key){
    let json_tmp = {}
    for (let k in json) {
        if (k === key) {
            console.log('remove ' + key)
        } else {
            json_tmp[key] = json[key]
        }
    }
    console.log(json_tmp)
    return json_tmp
}

export function getJsonLength(jsonData){
    var jsonLength = 0;
    for(var item in jsonData){
       jsonLength++;
    }
    return jsonLength;
}  