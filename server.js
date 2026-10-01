const WebSocket = require("ws");

const PORT =
    process.env.PORT || 3000;

const server =
    new WebSocket.Server({
        port: PORT
    });

console.log(
    "🐸 Frog Evolution multiplayer server running on port " +
    PORT
);


/*
============================================================
WORLD
============================================================
*/

const WORLD = {
    width: 3000,
    height: 3000
};


/*
============================================================
PLAYERS
============================================================
*/

const players = {};


/*
============================================================
FOOD
============================================================
*/

let foods = [];

let foodID = 1;


function createFood() {

    const types = [
        {
            emoji: "🍎",
            value: 10,
            coins: 1
        },

        {
            emoji: "🍓",
            value: 20,
            coins: 2
        },

        {
            emoji: "🍇",
            value: 35,
            coins: 3
        },

        {
            emoji: "🍉",
            value: 60,
            coins: 5
        }
    ];


    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];


    return {

        id: foodID++,

        x:
            Math.random() *
            WORLD.width,

        y:
            Math.random() *
            WORLD.height,

        type:
            type.emoji,

        value:
            type.value,

        coins:
            type.coins
    };
}


function refillFood() {

    while (
        foods.length < 120
    ) {

        foods.push(
            createFood()
        );
    }
}


refillFood();


/*
============================================================
PLAYER ID
============================================================
*/

let nextPlayerID = 1;


/*
============================================================
NEW PLAYER
============================================================
*/

function createPlayer(ws) {

    const id =
        String(nextPlayerID++);


    players[id] = {

        id: id,

        name:
            "Frog " + id,

        x:
            300 +
            Math.random() *
            2400,

        y:
            300 +
            Math.random() *
            2400,

        xp: 0,

        coins: 0,

        evolution: 0,

        ws: ws
    };


    return players[id];
}


/*
============================================================
SEND
============================================================
*/

function send(ws, data) {

    if (
        ws.readyState ===
        WebSocket.OPEN
    ) {

        ws.send(
            JSON.stringify(data)
        );
    }
}


/*
============================================================
BROADCAST
============================================================
*/

function broadcast(data) {

    for (
        const id in players
    ) {

        send(
            players[id].ws,
            data
        );
    }
}


/*
============================================================
CLEAN PLAYER DATA
============================================================
*/

function publicPlayers() {

    const result = {};


    for (
        const id in players
    ) {

        const p =
            players[id];

        result[id] = {

            id: p.id,

            name: p.name,

            x: p.x,

            y: p.y,

            xp: p.xp,

            coins: p.coins,

            evolution:
                p.evolution
        };
    }


    return result;
}


/*
============================================================
PLAYER CONNECT
============================================================
*/

server.on(
    "connection",
    ws => {

        const player =
            createPlayer(ws);


        console.log(
            "🐸 Player joined: " +
            player.id
        );


        send(
            ws,
            {

                type: "welcome",

                id:
                    player.id,

                world:
                    WORLD
            }
        );


        /*
            Disconnect
        */

        ws.on(
            "close",
            () => {

                console.log(
                    "Player left: " +
                    player.id
                );

                delete players[
                    player.id
                ];
            }
        );


        /*
            Errors
        */

        ws.on(
            "error",
            error => {

                console.log(
                    "Socket error:",
                    error.message
                );
            }
        );


        /*
            Messages
        */

        ws.on(
            "message",
            message => {

                let data;


                try {

                    data =
                        JSON.parse(
                            message
                        );

                } catch {

                    return;
                }


                /*
                    Movement
                */

                if (
                    data.type ===
                    "move"
                ) {

                    /*
                        Server validates
                        the position.
                    */

                    player.x =
                        clamp(
                            Number(
                                data.x
                            ),
                            0,
                            WORLD.width
                        );

                    player.y =
                        clamp(
                            Number(
                                data.y
                            ),
                            0,
                            WORLD.height
                        );


                    player.xp =
                        clamp(
                            Number(
                                data.xp
                            ),
                            0,
                            1000000
                        );


                    player.coins =
                        clamp(
                            Number(
                                data.coins
                            ),
                            0,
                            1000000
                        );


                    player.evolution =
                        clamp(
                            Number(
                                data.evolution
                            ),
                            0,
                            9
                        );
                }


                /*
                    Food collection
                */

                if (
                    data.type ===
                    "collect"
                ) {

                    collectFood(
                        player,
                        data.foodId
                    );
                }
            }
        );
    }
);


/*
============================================================
CLAMP
============================================================
*/

function clamp(
    value,
    min,
    max
) {

    if (
        !Number.isFinite(value)
    ) {
        return min;
    }

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}


/*
============================================================
COLLECT FOOD
============================================================
*/

function collectFood(
    player,
    foodID
) {

    const index =
        foods.findIndex(
            food =>
                food.id ===
                foodID
        );


    if (index === -1)
        return;


    const food =
        foods[index];


    /*
        Server-side distance check
    */

    const dx =
        player.x -
        food.x;

    const dy =
        player.y -
        food.y;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance > 100
    ) {

        return;
    }


    /*
        Remove food
    */

    foods.splice(
        index,
        1
    );


    /*
        Give rewards
    */

    player.xp +=
        food.value;

    player.coins +=
        food.coins;


    /*
        Evolution thresholds
    */

    const evolutionXP = [
        0,
        100,
        250,
        500,
        900,
        1500,
        2500,
        4000,
        6500,
        10000
    ];


    for (
        let i =
            evolutionXP.length - 1;
        i >= 0;
        i--
    ) {

        if (
            player.xp >=
            evolutionXP[i]
        ) {

            player.evolution =
                i;

            break;
        }
    }
}


/*
============================================================
GAME STATE
============================================================
*/

setInterval(
    () => {

        refillFood();


        broadcast({

            type: "state",

            players:
                publicPlayers(),

            foods:
                foods,

            world:
                WORLD
        });

    },
    50
);
