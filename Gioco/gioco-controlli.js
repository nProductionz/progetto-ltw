//tutti i nemici
var enemys = [];
//tutti i colpi
var shoots = [];
//tutte le posizioni dei colpi 
var Bdirection = [];
//tutti i morti 
var deaths = [];
var map = document.querySelector(".map");
var pixelSize = parseInt(
   getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
);

function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomIntInclusive(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
const variance = 1.5 * pixelSize;

function readCookie(name) {
   var nameEQ = name + "=";
   var ca = document.cookie.split(';');
   for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
   }
   return null;
}


// ----------------------------------------------------------------------------------------------------
// - Loading Audio
// ---------------------------------------------------------------------------------------------------- 

var playerHitSound = new Audio();
playerHitSound.src = "audio/se/player_hit.wav";
playerHitSound.volume = 0.8;

var shootSound = new Audio();
shootSound.src = "audio/se/player_shoot.wav";
shootSound.volume = 0.55;

var enemyHitSound = new Audio();
enemyHitSound.src = "audio/se/enemy_hit.wav";
enemyHitSound.volume = 0.55;

var playerDeathSounds = ["audio/se/player_death1.wav", "audio/se/player_death2.wav", "audio/se/player_death3.wav"];
var playerDeathSound = new Audio();

var enemyDeathSounds = ["audio/se/enemy_death1.wav", "audio/se/enemy_death2.wav", "audio/se/enemy_death3.wav"];
var enemyDeathSound = new Audio();
enemyDeathSounds.volume = 0.7;

var bulletHitWallSound = new Audio();
bulletHitWallSound.src = "audio/se/bullet_impact.wav";
bulletHitWallSound.volume = 0.45;

var youDiedSound = new Audio();
youDiedSound.src = "audio/se/you_died.wav";


/// ----------------------------------------------------------------------------------------------------
// - Point Counter & Healt
// ---------------------------------------------------------------------------------------------------- 


let counterDisplayElem = document.querySelector('.counter-display');
let count = 0;
let health = document.getElementById("health") // Var used to control health bar

// ----------------------------------------------------------------------------------------------------
// - Def. Entiità del gioco
// ---------------------------------------------------------------------------------------------------- 

class entity {
   constructor(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 1;
      //lista dei comandi di movimento da eseguire
      this.held_direction = [];
      this.html = null;
      this.health = 100;
      this.damage = 0;
      this.id = 10000;
      //numero a cui associamo uno dei modi di movimento (solo per i nemici (si potevo fare un sotto classe ma non mi andava))
      this.movetype = null;

   }
}

class death {
   constructor(html, time) {
      this.html = html;
      this.time = time;
   }
}


class shooting_dir_time {
   constructor(direction, time) {
      this.direction = direction;
      this.time = time;
   }

}

const limits = {
   left: 10,
   right: 300,
   top: 25,
   bottom: 160,
}

const spawn_point = {
   spawn_1: [1076 / pixelSize, 100 / pixelSize],
   spawn_2: [900 / pixelSize, 100 / pixelSize],
   spawn_3: [696 / pixelSize, 100 / pixelSize],
   spawn_4: [452 / pixelSize, 100 / pixelSize],
   spawn_5: [40 / pixelSize, 100 / pixelSize]

}
var spawns = [spawn_point.spawn_1, spawn_point.spawn_2, spawn_point.spawn_3, spawn_point.spawn_4, spawn_point.spawn_5];

//state of the character
var pg = new entity(150, 64);
pg.html = $(".character");


// ----------------------------------------------------------------------------------------------------
// - Parametri Movimento PG e Muri Invisibili di Limite Mappa 
// ---------------------------------------------------------------------------------------------------- 


const placeCharacter = () => {

   const held_direction = pg.held_direction[0];


   if (held_direction) {

      if (held_direction === directions.right) {
         pg.x += pg.speed;
      }
      if (held_direction === directions.left) {
         pg.x -= pg.speed;
      }
      if (held_direction === directions.down) {
         pg.y += pg.speed;
      }
      if (held_direction === directions.up) {
         pg.y -= pg.speed;
      }
      pg.html.attr("facing", held_direction);
   }
   pg.html.attr("walking", held_direction ? "true" : "false");

   //Limits (gives the illusion of walls)

   if (pg.x < limits.left) {
      pg.x = limits.left;
   }
   if (pg.x > limits.right) {
      pg.x = limits.right;
   }
   if (pg.y < limits.top) {
      pg.y = limits.top;
   }
   if (pg.y > limits.bottom) {
      pg.y = limits.bottom;
   }


   var camera_left = pixelSize * 106;
   var camera_top = pixelSize * 82;

   map.style.transform = `translate3d( ${-pg.x*pixelSize+camera_left}px, ${-pg.y*pixelSize+camera_top}px, 0 )`;
   pg.html.attr("style", `transform : translate3d( ${pg.x*pixelSize}px, ${pg.y*pixelSize}px, 0 )`)

}

// ----------------------------------------------------------------------------------------------------
// - Creazione Nemico
// ---------------------------------------------------------------------------------------------------- 

const placeEnemy = () => {

   var cattivo = new entity(0, 0);
   cattivo.speed = 0.6;
   cattivo.damage = 2;
   var id = Math.floor(Math.random() * 10000);
   var i = getRandomIntInclusive(0, 4);
   var spawn = spawns[i];
   cattivo.x = spawn[0]
   cattivo.y = spawn[1]
   cattivo.id = id;
   cattivo.movetype = getRandomIntInclusive(0, 1);


   var element1 = $("#map");
   var tag = document.createElement("div");
   tag.innerHTML = (`<div class='enemy' id='${id}' facing='down' walking='false' style=''> <div class='shadow pixel-art'></div> <div class='enemy_spritesheet pixel-art'></div></div>`);
   element1.append(tag);


   cattivo.html = $(`#${id}`);

   cattivo.html.attr("style", `transform : translate3d( ${cattivo.x*pixelSize}px, ${cattivo.y*pixelSize}px, 0 )`)
   enemys.unshift(cattivo)

}

// ----------------------------------------------------------------------------------------------------
// - Definizione e Creazione Proiettili 
// ---------------------------------------------------------------------------------------------------- 

class projectiles {
   constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.speed = 3;
      this.damage = 20;
      this.html = null;
      this.hit = false;
      this.dir = null;
      this.id = null;
      this.gravity = 0.1;

   }
}

var Btime = 0;

const createshot = () => {

   var obj = Bdirection[0];

   if (obj) {
      var rateo = obj.time - Btime;

      if (rateo > 300) {
         var proiettile = new projectiles(pg.x, pg.y, 2);

         proiettile.dir = obj.direction;
         Btime = obj.time;



         var id = Math.floor(Math.random() * 10000);
         proiettile.id = id;
         var element1 = $("#map");
         var tag = document.createElement("div");
         tag.innerHTML = (`<div class='bullet' id='${id}' hit='false 'style=''>`);
         element1.append(tag);


         proiettile.html = $(`#${id}`);


         proiettile.html.attr("style", `transform : translate3d( ${proiettile.x*pixelSize}px, ${proiettile.y*pixelSize}px, ${proiettile.z*pixelSize}px )`)

         shoots.unshift(proiettile);

      }
   }
}
async function tornanormale(cattivo) {
   await sleep(200);
   cattivo.html.html("<div class='shadow pixel-art'></div> <div class='enemy_spritesheet pixel-art'></div></div>");
}

// ----------------------------------------------------------------------------------------------------
// - Gestione Sparatorie, Proiettili e Uccisioni
// ---------------------------------------------------------------------------------------------------- 


const School_Shooting = (proiettile) => {

   if (proiettile != undefined) {

      var dir = proiettile.dir;

      if (proiettile.hit) {
         proiettile.html.remove();
         var index = shoots.findIndex(x => x.id == proiettile.id);
         if (index > -1) {

            shoots.splice(index, 1);
         }
      } else {

         if (dir === directions.right) {
            proiettile.x += proiettile.speed;
            proiettile.z -= proiettile.gravity;
         }
         if (dir === directions.left) {
            proiettile.x -= proiettile.speed;
            proiettile.z -= proiettile.gravity;
         }
         if (dir === directions.down) {
            proiettile.y += proiettile.speed;
            proiettile.z -= proiettile.gravity;
         }
         if (dir === directions.up) {
            proiettile.y -= proiettile.speed;
            proiettile.z -= proiettile.gravity;
         }
         pg.html.attr("facing", dir);

         if (proiettile.x < limits.left) {
            proiettile.x = limits.left;
            proiettile.hit = true;
            bulletHitWallSound.play();
         }
         if (proiettile.x > limits.right) {
            proiettile.x = limits.right;
            proiettile.hit = true;
            bulletHitWallSound.play();
         }
         if (proiettile.y < limits.top) {
            proiettile.y = limits.top;
            proiettile.hit = true;
            bulletHitWallSound.play();
         }
         if (proiettile.y > limits.bottom) {
            proiettile.y = limits.bottom;
            proiettile.hit = true;
            bulletHitWallSound.play();
         }
         if (proiettile.z <= 0) {
            proiettile.hit = true;

         }

         proiettile.html.attr("style", `transform : translate3d( ${proiettile.x*pixelSize}px, ${proiettile.y*pixelSize}px,  ${proiettile.z*pixelSize}px )`)

         shootSound.play();

         for (let i = 0; i < enemys.length; i++) {

            var x = enemys[i].x;
            var y = enemys[i].y;
            if ((x + variance >= proiettile.x && x - variance <= proiettile.x) && (y + variance >= proiettile.y && y - variance <= proiettile.y)) {

               //hit sprite and sound 

               enemyHitSound.play();
               enemys[i].health -= proiettile.damage;
               enemys[i].html.html("<div class='shadow pixel-art'></div> <div class='enemy_hit_spritesheet'></div></div>");

               if (enemys[i].health) tornanormale(enemys[i])

               if (!enemys[i].health) {


                  enemys[i].html.html("<div class='shadow pixel-art'></div> <div class='enemy_death_spritesheet'></div></div>");
                  time = Date.now();

                  // loading audio file
                  var s = Math.floor(Math.random() * 3);
                  enemyDeathSound.src = enemyDeathSounds[s];
                  enemyDeathSound.play();

                  // update points
                  count += 100;
                  counterDisplayElem.innerText = count;

                  deaths.unshift(new death(enemys[i].html, time));
                  var index = enemys.findIndex(x => x.id == enemys[i].id);
                  if (index > -1) enemys.splice(index, 1);



               }

               proiettile.hit = true;

               break;
            }
         }

         proiettile.html.attr("hit", proiettile.hit ? "true" : "false");
      }
   }
}


// ----------------------------------------------------------------------------------------------------
// - Listener e Tasti per il Movimento
// ---------------------------------------------------------------------------------------------------- 

const directions = {
   up: "up",
   down: "down",
   left: "left",
   right: "right",
}


const keys = {
   w: directions.up,
   a: directions.left,
   d: directions.right,
   s: directions.down,
   W: directions.up,
   A: directions.left,
   D: directions.right,
   S: directions.down,
}

const Bkeys = {

   ArrowUp: directions.up,
   ArrowLeft: directions.left,
   ArrowRight: directions.right,
   ArrowDown: directions.down,

}


document.addEventListener("keydown", (e) => {
   var dir = keys[e.key];
   var Bdir = Bkeys[e.key];
   if (dir && pg.held_direction.indexOf(dir) === -1) {
      pg.held_direction.unshift(dir);
   }
   if (Bdir && Bdirection.indexOf(Bdir) === -1) {
      var culo = new shooting_dir_time(Bdir, Date.now());
      Bdirection.unshift(culo);

   }
})

document.addEventListener("keyup", (e) => {
   var dir = keys[e.key];
   var Bdir = Bkeys[e.key];
   var index = pg.held_direction.indexOf(dir);
   var Bindex = Bdirection.indexOf(x => x.direction == Bdir);
   if (index > -1) {
      pg.held_direction.splice(index, 1)
   }
   if (Bindex) Bdirection.splice(Bindex, 1)

});


// ----------------------------------------------------------------------------------------------------
// - Movimento Automatico dei Nemici e Danno che Infliggono
// ---------------------------------------------------------------------------------------------------- 


const addMovement = (cattivo) => {

   var x = pg.x;
   var y = pg.y;

   if (cattivo.movetype == 0) {
      //priorità destra sinistra

      if ((x + variance <= cattivo.x || x - variance >= cattivo.x)) {

         if (x - variance > cattivo.x) {
            // 0, pi/2^-
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.right);
         }

         if (x + variance < cattivo.x) {
            // pi/2^+ /pi
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.left);
         }
      } else if ((x + variance >= cattivo.x && x - variance <= cattivo.x) && (y + variance <= cattivo.y || y - variance >= cattivo.y)) {

         if (y + variance > cattivo.y) {
            //pi/2
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.down);
         }

         if (y - variance < cattivo.y) {
            // 3/2 pi
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.up);
         }
      } else {
         cattivo.held_direction = [];
         pg.health -= cattivo.damage;
         playerHitSound.play();
         health.setAttribute("value", pg.health);
      };
   } else {
      //priorità sopra sotto 

      if ((y + variance <= cattivo.y || y - variance >= cattivo.y)) {

         if (y - variance > cattivo.y) {
            // 0+ /pi-
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.down);
         }

         if (y + variance < cattivo.y) {
            // pi+ /0-
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.up);
         }
      } else if ((y + variance >= cattivo.y && y - variance <= cattivo.y) && (x + variance <= cattivo.x || x - variance >= cattivo.x)) {

         if (x + variance > cattivo.x) {
            //0
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.right);
         }

         if (x - variance < cattivo.x) {
            // pi
            cattivo.held_direction = [];
            cattivo.held_direction.unshift(directions.left);
         }
      } else {
         cattivo.held_direction = [];
         pg.health -= cattivo.damage;
         health.setAttribute("value", pg.health);
      }

   }

   // ----------------------------------------------------------------------------------------------------
   // - Gestione Morte Personaggio e Reindirizzamento post Game Over
   // ---------------------------------------------------------------------------------------------------- 

   if (!pg.health) {

      // loading audio file
      var s = Math.floor(Math.random() * 3);
      playerDeathSound.src = playerDeathSounds[s];
      playerDeathSound.play();

      $("#camera").css("opacity", 0);
      $("#hud").css("opacity", 0);
      $("#map").css("opacity", 0);
      $("#frame").css({
         "background-image": "url('../img/you_died.gif')"
      });
      youDiedSound.play();
      manda();


   }
}


async function manda() {
   //send the points to the server 

   var utente = readCookie('Account');

   await sleep(4400);
   $.post("points.php", {
      'punteggio': count,
      'utente': utente
   }).fail(console.log("aaaaaaah errore"))
   window.location.href = "recap_screen.html"

}

// ----------------------------------------------------------------------------------------------------
// - Regole e Parametri Movimento Nemici 
// ---------------------------------------------------------------------------------------------------- 


const moveEnemy = (cattivo) => {
   if (cattivo.html) {

      // cattivo.html.html(`<div class='shadow pixel-art'></div> <div class='enemy_spritesheet'></div></div>`)

      addMovement(cattivo);

      const pippo = cattivo.held_direction[0];

      if (pippo) {


         if (pippo === directions.right) {
            cattivo.x += cattivo.speed;
         }
         if (pippo === directions.left) {
            cattivo.x -= cattivo.speed;
         }
         if (pippo === directions.down) {
            cattivo.y += cattivo.speed;
         }
         if (pippo === directions.up) {
            cattivo.y -= cattivo.speed;
         }
         cattivo.html.attr("facing", pippo);
      }

      cattivo.html.attr("walking", pippo ? "true" : "false");

      if (cattivo.x < limits.left) {
         cattivo.x = limits.left;
      }
      if (cattivo.x > limits.right) {
         cattivo.x = limits.right;
      }
      if (cattivo.y < limits.top) {
         cattivo.y = limits.top;
      }
      if (cattivo.y > limits.bottom) {
         cattivo.y = limits.bottom;
      }


      cattivo.html.attr("style", `transform : translate3d( ${cattivo.x*pixelSize}px, ${cattivo.y*pixelSize}px, 0 )`)


   }
}
var number_of_enemy = 5;

// ----------------------------------------------------------------------------------------------------
// - Funzione Loop del Gioco
// ---------------------------------------------------------------------------------------------------- 

const magic = (start) => {

   var time = Date.now();
   var deltaT = time - start;
   var Tspawn = 3000;

   //fa muovere il giocatore
   placeCharacter();

   //increase difficulty 

   if (count == 1000) {
      number_of_enemy = 7;
      Tspawn = 2000;
   }

   if (count == 2000) {
      number_of_enemy = 10;
      Tspawn = 1000;
   }



   //calcola quanti nemici ci sono e li fa spawnare se sono passsati n secondi e se c'è spazio per altri 
   if (deltaT >= Tspawn && enemys.length < number_of_enemy) {
      placeEnemy();
      start = Date.now();
   }

   //fa muovere i nemici
   for (let i = 0; i < enemys.length; i++) {

      moveEnemy(enemys[i]);
   }
   //crea i proiettili 
   createshot();

   //muove i proiettili 
   for (let i = 0; i < shoots.length; i++) {
      School_Shooting(shoots[i]);
   }

   //fa despawnare i cadaveri in un certo tempo 
   for (let i = 0; i < deaths.length; i++) {
      if (time - deaths[i].time > 5000) {
         deaths[i].html.remove()
         deaths.splice(i, 1);
      }
   }

   window.requestAnimationFrame(() => {
      magic(start);

   })
}
var start = Date.now();

magic(start); 