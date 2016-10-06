
var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
var context: CanvasRenderingContext2D = canvas.getContext('2d');
// draw a circle to get started

function convertWindowCoordsToCanvas(c:HTMLCanvasElement, x:number, y:number) {
    var bbox = c.getBoundingClientRect();
    return {
        x: x - bbox.left * (c.width / bbox.width),
        y: y - bbox.top * (c.height / bbox.height)
    }
}
canvas.onmousedown = function (e){
}