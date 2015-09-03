var app = {


    init: function(e) {
        this.dom = {};
        this.tailsLoaded = [];
        this.dom.div = document.createElement('div');
        this.dom.grid = document.querySelectorAll(".grid").item(0);
        this.bindEvents();
        this.render();
    },

    bindEvents: function() {
        // IE9, Chrome, Safari, Opera
        document.body.addEventListener("mousewheel", this, false);
        // Firefox
        document.body.addEventListener("DOMMouseScroll", this, false);
        window.addEventListener("scroll", this, false);
    },

    toDOMObject: function(html) {
        this.dom.div.innerHTML = html;
        return this.dom.div.removeChild(this.dom.div.firstChild);
    },

    addTailLoaded: function(tail){
    	this.tailsLoaded.push(tail);
    },

    loadTail: function(tail, fn) {
        if (!tail) {
            fn.call(this, null)
            return;
        }
        var that = this;
        var tailImage = new Image();
        tailImage.onload = function() {
            tailImage.onload = null;
            fn.call(that, tailImage);
        };
        tailImage.src = tail.img;
    },

    loadTails: function(tails, obj) {
        var that = this;
        var c = 0;

        function onload() {
            that.addTailLoaded(tails[c]);
            obj.readyOne(tails[c]);
            var nextTail = tails[++c];
            if (nextTail) {
                that.loadTail(nextTail, onload);
            } else {
                obj.end(that);
            }
        }
        this.loadTail(tails[c], onload);
    },

    write: function(data, obj){
    	var that = this;
    	var c = -1;


        function onload() {
            var nextBlock = data[++c];
            if (nextBlock) {
 
                that.loadTails(nextBlock.tails, {
                	readyOne: function(){},
                	end: function(){
                		var col = that.createDOMCol(nextBlock);
    					that.dom.grid.appendChild(col);
                		for (var t in nextBlock.tails){
                			col.appendChild(that.createDOMTail(nextBlock.tails[t]));	
                		}

                		onload();
                	}
                });
            }
        }
        
        onload();
    },


    buildAll: function(tails) {
        var t;
        var tails = [];
        for (t in tails) {
            tails.push(this.createDOMTail(tails[t]));
        }
        return tails;
    },
    createDOMCol: function(data){
    	var li = document.createElement('li');
    	li.className = data.type;
    	return li;
    },
    createDOMTail: function(data) {
		var tailHTML = 
	              '<article><a href="'+data.link+'">'+
	                  '<img src="'+data.img+'" />'+
	                  '<div class="bb"><h1 class="title">'+data.title+'</h1>'+
	                  '<div></div>'+
	                  '<p class="brand">'+data.brand+'</p>'+
	                  '</div><span class="price">'+data.price+'</span>'+
	              '</a></article>';
	            
		return this.toDOMObject(tailHTML);
    },

    fetch: function(fn) {
        fn.call(this, cols);
    },

    render: function() {
    	var that = this;
        this.fetch(function(data) {
            that.write(data);
            // tailDoms.map(function(el) {
            //     el.style.backgroundColor = "#" + Math.random().toString(16).slice(2, 8);
            // });
        });
    },

    _wheel: function(e) {
        if (document.body.doScroll)
            document.body.doScroll(e.wheelDelta > 0 ? "left" : "right");
        else if ((e.wheelDelta || e.detail) > 0)
            document.body.scrollLeft -= 30;
        else
            document.body.scrollLeft += 30;

        e.preventDefault();

        return false;
    },

    _scroll: function(e) {
        console.log("scroll", document.body.scrollLeft);
        this._updateTails();
    },

    _updateTails: function() {
        document.body.scrollLeft;
        document.body.offsetWidth;
        this.dom.grid.offsetWidth;
    },

    handleEvent: function(e) {
        switch (e.type) {
            case 'scroll':
                this._scroll(e);
                break;
            case 'wheel':
            case 'DOMMouseScroll':
            case 'mousewheel':
                this._wheel(e);
                break;
        }
    }
};

document.addEventListener("DOMContentLoaded", app.init.bind(app));