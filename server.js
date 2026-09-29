import http from "http";
import { WebSocketServer } from "ws";
import crypto from "crypto";

const PORT = process.env.PORT || 3000;

const players = new Map();
const clans = new Map();

const worlds = {
    1: {
        name: "Emerald Swamp",
        enemy: "Swamp Beast"
    },
    2: {
        name: "Volcanic Marsh",
        enemy: "Fire Lizard"
    },
    3: {
        name: "Crystal Ocean",
        enemy: "Electric Eel"
    }
};

function makeId() {
    return crypto.randomBytes(6).toString("hex");
}

function createPlayer(ws) {
    const id = makeId();

    const player = {
        id,
        ws,

        name: "Frog" + Math.floor(Math.random() * 9999),

        x: 0,
        y: 1,
        z: 0,

        world: 1,

        health: 100,
        maxHealth: 100,

        level: 1,
        xp: 0,
        xpNeeded: 100,

        attack: 10,
        speed: 8,

        evolution: "Tiny Frog",

        clanId: null,

        lastAttack: 0
    };

    players.set(id, player);

    return player;
}

function publicPlayer(p) {
    return {
        id: p.id,
        name: p.name,

        x: p.x,
        y: p.y,
        z: p.z,

        world: p.world,

        health: p.health,
        maxHealth: p.maxHealth,

        level: p.level,
        evolution: p.evolution,

        clanId: p.clanId
    };
}

function send(ws, data) {
    if (ws.readyState === 1) {
        ws.send(JSON.stringify(data));
    }
}

function broadcast(data, world = null) {
    for (const player of players.values()) {
        if (!world || player.world === world) {
            send(player.ws, data);
        }
    }
}

function gainXP(player, amount) {
    player.xp += amount;

    while (player.xp >= player.xpNeeded) {
        player.xp -= player.xpNeeded;

        player.level++;

        player.xpNeeded =
            Math.floor(player.xpNeeded * 1.35);

        player.maxHealth += 15;
        player.health = player.maxHealth;

        player.attack += 4;
        player.speed += 0.5;

        if (player.level >= 3) {
            player.evolution = "Jungle Frog";
        }

        if (player.level >= 6) {
            player.evolution = "Mutant Frog";
        }

        if (player.level >= 10) {
            player.evolution = "Titan Frog";
        }
    }
}

function createClan(player, name) {
    if (player.clanId) {
        return false;
    }

    if (!name || name.length < 3 || name.length > 20) {
        return false;
    }

    const id = makeId();

    clans.set(id, {
        id,
        name,

        owner: player.id,

        members: [player.id],

        level: 1,
        xp: 0
    });

    player.clanId = id;

    return true;
}

function joinClan(player, clanId) {
    if (player.clanId) {
        return false;
    }

    const clan = clans.get(clanId);

    if (!clan) {
        return false;
    }

    if (clan.members.length >= 50) {
        return false;
    }

    clan.members.push(player.id);

    player.clanId = clan.id;

    return true;
}

function leaveClan(player) {
    if (!player.clanId) {
        return false;
    }

    const clan = clans.get(player.clanId);

    if (!clan) {
        player.clanId = null;
        return true;
    }

    if (clan.owner === player.id) {
        return false;
    }

    clan.members =
        clan.members.filter(id => id !== player.id);

    player.clanId = null;

    return true;
}

function clanInfo(player) {
    if (!player.clanId) {
        return null;
    }

    const clan = clans.get(player.clanId);

    if (!clan) {
        return null;
    }

    return {
        id: clan.id,
        name: clan.name,
        owner: clan.owner,
        members: clan.members.map(id => {
            const p = players.get(id);

            return {
                id,
                name: p?.name || "Offline"
            };
        }),
        level: clan.level,
        xp: clan.xp
    };
}

function attack(player) {
    const now = Date.now();

    if (now - player.lastAttack < 500) {
        return;
    }

    player.lastAttack = now;

    for (const target of players.values()) {

        if (target.id === player.id)
            continue;

        if (target.world !== player.world)
            continue;

        const dx = target.x - player.x;
        const dz = target.z - player.z;

        const distance =
            Math.sqrt(dx * dx + dz * dz);

        if (distance <= 5) {

            target.health -= player.attack;

            if (target.health <= 0) {

                target.health = target.maxHealth;

                target.x = 0;
                target.y = 1;
                target.z = 0;

                gainXP(player, 50);

                if (player.clanId) {

                    const clan =
                        clans.get(player.clanId);

                    if (clan) {

                        clan.xp += 50;

                        if (
                            clan.xp >=
                            clan.level * 1000
                        ) {
                            clan.xp = 0;
                            clan.level++;
                        }
                    }
                }
            }
        }
    }
}

const server = http.createServer((req, res) => {

    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end("Frog Evolution multiplayer server");
});

const wss = new WebSocketServer({
    server
});

wss.on("connection", ws => {

    const player = createPlayer(ws);

    send(ws, {
        type: "welcome",

        player: publicPlayer(player),

        worlds,

        clans: [...clans.values()].map(c => ({
            id: c.id,
            name: c.name,
            level: c.level,
            members: c.members.length
        }))
    });

    broadcast({
        type: "playerJoined",
        player: publicPlayer(player)
    });

    ws.on("message", raw => {

        let data;

        try {
            data = JSON.parse(raw);
        } catch {
            return;
        }

        const p = players.get(player.id);

        if (!p)
            return;

        switch (data.type) {

            case "name":

                if (
                    typeof data.name === "string" &&
                    data.name.length >= 2 &&
                    data.name.length <= 16
                ) {
                    p.name = data.name;
                }

                break;

            case "move":

                if (
                    typeof data.x === "number" &&
                    typeof data.y === "number" &&
                    typeof data.z === "number"
                ) {
                    p.x = Math.max(
                        -70,
                        Math.min(70, data.x)
                    );

                    p.y = Math.max(
                        0,
                        Math.min(20, data.y)
                    );

                    p.z = Math.max(
                        -70,
                        Math.min(70, data.z)
                    );
                }

                break;

            case "world":

                if (
                    data.world === 1 ||
                    data.world === 2 ||
                    data.world === 3
                ) {
                    p.world = data.world;

                    p.x = 0;
                    p.y = 1;
                    p.z = 0;
                }

                break;

            case "attack":

                attack(p);

                break;

            case "createClan":

                if (createClan(p, data.name)) {

                    send(ws, {
                        type: "clan",
                        clan: clanInfo(p)
                    });
                }

                break;

            case "joinClan":

                if (joinClan(p, data.clanId)) {

                    send(ws, {
                        type: "clan",
                        clan: clanInfo(p)
                    });
                }

                break;

            case "leaveClan":

                if (leaveClan(p)) {

                    send(ws, {
                        type: "clan",
                        clan: null
                    });
                }

                break;

            case "clanChat":

                if (!p.clanId)
                    break;

                const clan =
                    clans.get(p.clanId);

                if (!clan)
                    break;

                for (const memberId of clan.members) {

                    const member =
                        players.get(memberId);

                    if (member) {

                        send(member.ws, {
                            type: "clanChat",

                            name: p.name,

                            message:
                                String(data.message)
                                .slice(0, 200)
                        });
                    }
                }

                break;
        }
    });

    ws.on("close", () => {

        players.delete(player.id);

        broadcast({
            type: "playerLeft",
            id: player.id
        });
    });
});


/*
    Send the complete player list
    10 times per second.
*/

setInterval(() => {

    for (const p of players.values()) {

        const visiblePlayers =
            [...players.values()]
                .filter(other =>
                    other.world === p.world
                )
                .map(publicPlayer);

        send(p.ws, {
            type: "state",

            players: visiblePlayers,

            self: publicPlayer(p),

            clan: clanInfo(p)
        });
    }

}, 100);


server.listen(PORT, () => {
    console.log(
        `Frog Evolution server running on port ${PORT}`
    );
});
