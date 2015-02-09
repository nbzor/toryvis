
function saveImage(d,dim,name) {
    dim = dim || { w: 500, h: 500 };
    name = name || 'chart.png';    
    var html =$($(d)[0]).clone(true);
    $(html).attr('version', 1.1) 
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink'); 
  
    var canvas = $(document.createElement('canvas'))
        .attr('width', dim.w)
        .attr('height', dim.h)[0];
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent($(html)[0].outerHTML)));   
    img.src = imgsrc;

    ctx.drawImage(img, 0, 0);
    var png = canvas.toDataURL('image/png');  
    var a = document.createElement('a');
    a.download = name;
    a.href = png;
    a.click();
}