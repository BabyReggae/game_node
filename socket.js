var express = require('express');
var app = express();
var server = require('http').createServer( app );
console.log("creation server...");



var io = require('socket.io')(server);
console.log("init socket.io...");

/////// stack players data //////
let players = new Object();
//like players[id] = {"id" : id , "posX" : posX , "posY" : posY}; //
////////////////////////////////
process.env.PWD = process.cwd(); // on prépare a dire a express ou est le folder photo



let file = "index.html";
app
.get('/', function (req, res) {
    res.sendFile( file , { root : __dirname});
})
.get('/mapJs', function (req, res) {
    res.sendFile( "map/map1.js" , { root : __dirname});
});
console.log("connected to : " + file);


app.use(express.static(process.env.PWD + '/img')); // on dit a express ou sont les img
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// fct relative au calcul que DOIS faire le server
let Shoots = new Object();

let ex_shot_obj = new Object();
    ex_shot_obj["shoot1"] = {id : "shoot1", owner : "idplayer" ,"fire_time" :  Date.now() ,range : 500, orgX : 300, orgY : 300, angle : 90, speed : 2/*en 100px/sec ou 0.1px/ms*/};
    ex_shot_obj["shoot2"] = {id : "shoot2", owner : "idplayer" ,"fire_time" :  Date.now() ,range : 1000, orgX : 300, orgY : 300, angle : 75, speed : 2/*en 100px/sec ou 0.1px/ms*/};


function get_ShootPos( shoots, now = Date.now() ){
    let curShootsPos = new Object();

    for(var shoot in shoots){
        shoot = shoots[shoot]; //1st 

        //console.log( shoot.fire_time );

        
        let timeElaps = now - shoot.fire_time;

        //console.log(shoots[shoot].fire_time);
        let dist = Math.round( timeElaps * 0.1 * shoot.speed);//100px/ms
        //console.log( val , ex_shot_obj[val]);
        if (dist < shoot.range ) {
            let x = Math.round( Math.cos(shoot.angle*Math.PI/-180) * dist),
                y = Math.round( Math.sin(shoot.angle*Math.PI/-180) * dist);

            shoot.x = shoot.orgX + x;
            shoot.y = shoot.orgY + y;

            
            shoots[shoot.id] = shoot;
            //console.log( x , y);
        }else{
            //console.log(shoot.id + " shoot fade away");
            delete shoots[shoot.id];
        }
    }

    return shoots;// obj container like => {id , owner , x , y , w, h}
}

/*
setInterval( function(){

    ex_shot_obj = get_ShootPos( ex_shot_obj );

} , 200)
*/

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// Quand un client se connecte
io.sockets.on('connection', function (socket) {

    let id = socket.handshake.query['id'],
        posX = 150,
        posY = 150,
        checkConnecCnt = 0;

    // Connection or reconnection
    if (!players[id]) {
        //on ajoute à notre joli object le pti nouveau
        players[id] = {"id" : id, 
                       "posX" : posX ,
                       "posY" : posY ,
                       "Connection" : 1};

        socket
        .emit('message' , 'vous etes bien connecté')
        .broadcast.emit('message', 'Un autre client vient de se connecter !')
        .broadcast.emit('new_player_connected' , {id , posX , posY})

    }else{
        players[id].Connection = 1;
        socket
        .emit('message' , 'Reconnexion réussi !')
        .broadcast.emit('message', 'Reconnexion de '+id+" !")
        .broadcast.emit('new_player_connected' , {id , posX , posY})
    }


    let iter_checkConnection  = setInterval( function(){
        //if no answer from client
        if (checkConnecCnt > 5) {
            clearInterval(iter_checkConnection);
            socket
            .broadcast.emit("message" , "a player disconnected")
            .broadcast.emit("player_disconnected" , id)

            players[id].Connection = 0;
            console.log(id + ' do not response anymore');
        }
        //else send shake request
        socket.emit("check_connection");
        checkConnecCnt++;     
    },250)

    // BASIC SOCKET INTERACTION WHEN GAME IS ON 

    socket
    // check if player still connected
    .on("connection_checked" , function( infos ){
        //on reset le cnt si cnt > 10 /5 >> disconnect
        checkConnecCnt = 0;
    })

    //confirm and broadcast info to player & players
    .on('p_ask_move' , function( infos ){
        //playerName, tmpX, tmpY, targX, targY, time_pEmit
        //console.log(infos.time_pEmit)
        infos.x = infos.tmp_moveX; delete infos.tmp_moveX;
        infos.y = infos.tmp_moveY; delete infos.tmp_moveY;

        Shoots = get_ShootPos( Shoots );
        //let curShoots = get_ShootPos( /*Global var shoots obj*/ );
        
        socket
        .emit( 'server_confirm_own_move', infos, Shoots, Date.now())
        .broadcast.emit( 'server_confirm_ones_move'  , infos.user , infos.x , infos.y, infos.targX, infos.targY )
    })
    .on('p_add_shoot', function( shoot ){

        shoot.fire_time = Date.now();

        let id  = "Shoot_"+shoot.fire_time;//..... no comment 
        shoot.id = id;
        
        Shoots[id] = shoot;
        //console.log(Shoots);
    })
    //send players to player (same room)
    .on("check_present_player" , function( asker ){
        socket.emit('present_player' , players );
    })





});

server.listen(8080);