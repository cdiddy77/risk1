
var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
var context: CanvasRenderingContext2D = canvas.getContext('2d');
// draw a circle to get started
class Country{
    location;
    units;
    team;
}
var heldUnits;
function convertWindowCoordsToCanvas(c, x, y) {
    var bbox = c.getBoundingClientRect();
    return {
        x: x - bbox.left * (c.width / bbox.width),
        y: y - bbox.top * (c.height / bbox.height)
    }
}
canvas.onmousedown = function (e){
    //check if the mouse is inside a country
    //check if that country belongs to the current player
    if (heldUnits == 0){
    if (e.which === 1){
        //subtract 1 from that country's units
        heldUnits++;
    }
    if (e.which === 3){
        //subtract all but 1 from that country's units
        //and add them to heldUnits
    }
    }
    if (heldUnits > 0){
        if (e.which === 1){
             //add heldUnits to that country's units
        }
       if (e.which === 3){
           //add 1 unit from heldUnits to that country's units
       }
    }
}