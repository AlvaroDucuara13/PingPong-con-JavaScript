'use strict';
//creación de los objetos: mesa, barras y pelota.
//función anonima auto-ejecutable.
//Esta función se creo con el fin de no contaminar el scope del proyecto.
(function(){

    self.Board = function(width, height){
    //clase que declara la mesa del Ping Pong
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball=null;
        this.playing=false;
    }
    
    self.Board.prototype = {
        get elements(){
            var elements = this.bars.map(function(bar){return bar;});
            elements.push(this.ball);
            return elements;
          
        }
    }
})();

//función para la creación de la pelota de Ping Pong
(function(){
    self.Ball = function(x,y,radius,board){
        //Atributos de la pelota
        this.x=x;
        this.y=y;
        this.radius = radius;

        this.speed_y = 0;
        this.speed_x = 3;
        this.direction = 1;
        this.bounce_angle=0;
        this.max_bounce_angle = Math.PI / 12;
        this.speed = 3;

        this.board = board;
        board.ball = this;
        this.kind = "circle"

    }

    self.Ball.prototype={
            move : function(){
                this.x += (this.speed_x * this.direction);
                this.y += (this.speed_y);

                //si la barra izquierda envia la pelota fuera de la mesa, el jugador#1 pierde.
                if (this.x >= 800){
                    this.speed_x = -this.speed_x;
                    this.bounce_angle = -this.bounce_angle;
                    board.playing = !board.playing;
                    alert("el jugador #1 perdio")
                }  
                //si la barra derecha envia la pelota fuera de la mesa, el jugador#2 pierde.
                if (this.x <= 20 ){
                    this.speed_x = -this.speed_x;
                    this.bounce_angle = -this.bounce_angle;
                    board.playing = !board.playing;
                    alert("el jugador #2 perdio")
                }

            },

            get width(){
                return this.radius*2;
            },
            get height(){
                return this.radius*2;
            },

            //Función de colisiones
            collisions: function(bar){
        
                //reacciona a una colision con una barra que recibe como parametro
                // calcula el angulo en el que va a moverse la pelota
                // modifica la dirección dependiendo de la dirección de la barra
                var relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;

                var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

                this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

                this.speed_y = this.speed * -Math.sin(this.bounce_angle);
                this.speed_x = this.speed * Math.cos(this.bounce_angle);

                if (this.x > (this.board.width / 2)) this.direction = -1;
                else this.direction = 1;
                }
        }
})();

//función para la creación de las barras junto con atributos del canvas
(function(){
    self.Bar = function(x, y, width, height, board){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 10;
    }

    self.Bar.prototype ={
        down: function(){
            this.y += this.speed

        },
        up: function(){

            this.y -= this.speed;
        },
        toString: function(){
            return "x: "+ this.x + "y: "+this.y;
        }
    }

})();

//función que dibuja la mesa del Ping Pong
(function(){
    
    self.BoardView = function(canvas, board){
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");
    }

    self.BoardView.prototype = {
        
        clean: function() {
            this.ctx.clearRect(0,0, this.board.width, this.board.height);
        },

        draw: function(){
            for(var i = this.board.elements.length - 1; i >= 0; i--){
                var el = this.board.elements[i];

                draw(this.ctx, el);
            };
        },

        //revisión de las colisiones entre las barras y la pelota de Ping Pong
        check_collisions: function(){
            for (var i = this.board.bars.length - 1; i >= 0; i--){
                var bar = this.board.bars[i];
                if(hit(bar, this.board.ball)){
                    this.board.ball.collisions(bar);
                }
            };
        },

        play: function(){
            if(this.board.playing){
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();
            }
           
        }
    }

    //creación de las colisiones de la pelota contra las barras
    function hit(a,b){
        //Revisa si a coliciona con b
        var hit = false;
		//Colsiones horizontales
		if (b.x + b.width >= a.x && b.x < a.x + a.width) {
			//Colisiones verticales
			if (b.y + b.height >= a.y && b.y < a.y + a.height)
				hit = true;
		}
		//Colisión de a con b
		if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
			if (b.y <= a.y && b.y + b.height >= a.y + a.height)
				hit = true;
		}
		//Colisión b con a
		if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
			if (a.y <= b.y && a.y + a.height >= b.y + b.height)
				hit = true;
		}
		return hit;

    }

    function draw(ctx, element){
 
        switch(element.kind){
            case "rectangle":
                ctx.fillRect(element.x, element.y, element.width, element.height);
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(element.x,element.y,element.radius,0,7);
                ctx.fill();
                ctx.closePath();
                break;
            
       }

    }
})();

    //valores de entrada para la creación de la mesa Ping Pong
    var board = new Board(800, 400);
    //valores de entrada para la creación de la barra 1 o izquierda
    var bar = new Bar (20,100,40,100,board);
    ////valores de entrada para la creación de la barra 2 o derecha
    var bar_2 = new Bar (735,100,40,100,board);
    //DOM
    var canvas = document.getElementById('canvas');
    //Se carga los valores para la creación de la mesa de Ping Pong
    var board_view = new BoardView(canvas,board);
    //Valores de entrada para la creación de la pelota de Ping Pong
    var ball = new Ball(350, 100, 10, board);

//se guarda los datos de entrada del movimiento de las barras
//teclas: flecha arriba(up), flecha abajo(down), w(up), s(down) y espacio
document.addEventListener("keydown", function(ev){
    
    //flecha arriba
    if(ev.keyCode == 38){
        ev.preventDefault();
        bar.up();
    }
    //flecha abajo
    else if(ev.keyCode == 40){
        ev.preventDefault();
        bar.down();
    }
    //w
    else if(ev.keyCode == 87){
        ev.preventDefault();
        bar_2.up();
    }
    //s
    else if(ev.keyCode == 83){
        ev.preventDefault();
        bar_2.down();
    }
    //tecla espaciadora que pausa el juego o lo incia 
    else if(ev.keyCode == 32){
        ev.preventDefault();
        board.playing = !board.playing;

    }
    

});

board_view.draw();

//Actualizacion del main
window.requestAnimationFrame(main);

//funcion que inicia el juego
function main(){
    board_view.play();
    window.requestAnimationFrame(main); 
}
