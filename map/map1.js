let map = new Object();
map = {"x" : 0, "y" : 0,  "w" : 3000 , "h" : 2000, "bg_img" : "texture_beige.jpg"};

map.blocks = new Object();
/*x & y are xPos and yPos */ 
map.blocks["test_block"] = { id : "test_block", type : "quadra", x : 200 , y : 250 , w : 300 , h : 100 , color : "darkblue" };
map.blocks["test_block2"] = { id : "test_block2", type : "quadra", x : 350 , y : 150 , w : 200 , h : 150 , color : "darkblue" };
map.blocks["test_block3"] = { id : "test_block3", type : "quadra", x : 350 , y : 50 , w : 200 , h : 50 , color : "darkblue" };
map.blocks["test_block4"] = {id : "test_block4", type : "circle", x : 100 ,y : 100 ,w: 100 ,h:100, color : "darkred" };
map.blocks["test_block5"] = {id : "test_block5", type : "circle", x : 800 ,y : 800 ,w: 500 ,h:500, color : "darkred" };
//map.blocks["test_block6"] = { id : "test_block6", type : "quadra", x : 500 , y : 400 , w : 4 , h : 4 , color : "red" };
//map.blocks["test_block7"] = { id : "test_block7", type : "quadra", x : 600 , y : 400 , w : 8 , h : 8 , color : "red" };
