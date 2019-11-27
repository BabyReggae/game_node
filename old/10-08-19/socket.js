var express = require('express');
var app = express();
var server = require('http').createServer( app );
console.log("creation server...");


var io = require('socket.io')(server);
console.log("init socket.io...");


/////// stack players data //////
let players = new Object();
////////////////////////////////


process.env.PWD = process.cwd(); // on prépare a dire a express ou est le folder photo

// Chargement du fichier index.html affiché au client
/*var server = http.createServer(function(req, res) {
    fs.readFile('./moteur_0.3.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});*/
let file = "index.html";
app.get('/', function (req, res) {
    res.sendFile( file , { root : __dirname});
});
console.log("connected to : " + file);


app.use(express.static(process.env.PWD + '/img')); // on dit a express ou sont les img
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// Chargement de socket.io
//var io = require('socket.io').listen(app);


// Quand un client se connecte
io.sockets.on('connection', function (socket) {

    let id = socket.handshake.query['id'], posX = 150 , posY = 150;
    //on ajoute à notre joli object le pti nouveau
    players[id] = {"id" : id , "posX" : posX , "posY" : posY};

    socket
    .emit('message' , 'vous etes bien connecté')
    .broadcast.emit('message', 'Un autre client vient de se connecter !')
    .broadcast.emit('new_player_connected' , {id , posX , posY} )

    .on('p_ask_move' , function( infos ){
        //console.log( infos );
        let nodeX = infos.tmp_avatarX, 
            nodeY = infos.tmp_avatarY,
            player = infos.user,
            time_pEmit = infos.time_pEmit;

        socket
        .emit( 'server_confirm_own_move', player, nodeX, nodeY, time_pEmit, Date.now())
        .broadcast.emit( 'server_confirm_ones_move'  , player , nodeX , nodeY )
    })

    .on("check_present_player" , function( asker ){
        socket.emit('present_player' , players );
    })

    //.broadcast.emit('message', 'Un autre client vient de se connecter !');


});


server.listen(8080);