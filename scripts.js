var wheelDistance = function(evt) {
    if (!evt) evt = event;
    var w = evt.wheelDelta,
        d = evt.detail;
    if (d) {
        if (w) return w / d / 40 * d > 0 ? 1 : -1; // Opera
        else return -d / 3; // Firefox;         TODO: do not /3 for OS X
    } else return w / 120; // IE/Safari/Chrome TODO: /3 for Chrome OS X
};

var app = {

    init: function(e) {
        this.dom = {};
        this.tailsLoaded = [];
        this.dom.div = document.createElement('div');
        this.dom.grid = document.querySelectorAll(".grid").item(0);
        this.bindEvents();
        this.render();
        this.startScrollLeft = document.body.scrollLeft;
    },

    bindEvents: function() {
        // IE9, Chrome, Safari, Opera
        window.addEventListener("mousewheel", this, false);
        // Firefox
        window.addEventListener("DOMMouseScroll", this, false);
        window.addEventListener("scroll", this, false);
        window.addEventListener("resize", this, false);
    },

    toDOMObject: function(html) {
        this.dom.div.innerHTML = html;
        return this.dom.div.removeChild(this.dom.div.firstChild);
    },

    addTailLoaded: function(tail) {
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
            tail.size = {
                width: this.width,
                height: this.height
            };
            fn.call(that, tailImage);
        };
        tailImage.src = tail.img;
    },

    getRatioSize: function(wW, wH, targetWidth, targetHeight) {
        return (wH / wW) > (targetHeight / targetWidth) ? wW / targetWidth : wH / targetHeight;
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

    write: function(data, obj) {
        var that = this;
        var c = -1;

        function onload() {
            var nextCol = data[++c];
            if (nextCol) {

                that.loadTails(nextCol.tails, {
                    readyOne: function() {},
                    end: function() {
                        var col = that.addCol(nextCol);
                        for (var t in nextCol.tails) {
                            if (nextCol.type == "f") {
                                // var scale = that.getRatioSize()
                                var tail = nextCol.tails[t];
                                var r = document.body.offsetHeight / tail.size.height;

                                col.style.height = r * tail.size.height + "px";
                                col.style.width = r * tail.size.width + "px";
                            }
                            col.appendChild(that.createDOMTail(nextCol.tails[t]));
                            that._updateTails();
                        }

                        onload();
                    }
                });
            }
        }

        onload();
    },
    addCol: function(dataCol) {
        var col = this.createDOMCol(dataCol);
        this.dom.grid.appendChild(col);
        return col;
    },

    buildAll: function(tails) {
        var t;
        var tails = [];
        for (t in tails) {
            tails.push(this.createDOMTail(tails[t]));
        }
        return tails;
    },
    createDOMCol: function(data) {
        var li = document.createElement('li');
        li.className = data.type;
        return li;
    },
    createDOMTail: function(data) {
        var tailHTML =
            '<article><a href="' + data.link + '">' +
            '<div class="image" style="background-image:url(' + data.img + ');"></div>' +
            '<div class="bb"><h1 class="title">' + data.title + '</h1>' +
            '<div></div>' +
            '<p class="brand">' + data.brand + '</p>' +
            '</div><span class="price">' + data.price + '</span>' +
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
        var d = wheelDistance(e);
        document.body.scrollLeft -= 100 * d;
        e.preventDefault();
        return false;
    },
    _scroll: function(e) {
        this._updateTails(e);
    },

    _resize: function(e) {
        this._updateTails(e);
    },

    _updateTails: function(e) {
        // document.body.scrollLeft;
        // document.body.offsetWidth;
        // this.dom.grid.offsetWidth;

        var children = this.dom.grid.children,
        	firstTail = cols[0].tails[0],
        	deltaX,
        	r = document.body.offsetHeight / firstTail.size.height;

        for (var i = children.length - 1; i >= 0; i--) {
            deltaX = (children[i].offsetLeft - document.body.scrollLeft);
            if (deltaX < document.documentElement.clientWidth) {
                children[i].classList.add("active");
            } else children[i].classList.remove("active");
        }

        children[0].style.height = r * firstTail.size.height + "px";
        children[0].style.width = r * firstTail.size.width + "px";
    },

    handleEvent: function(e) {
        switch (e.type) {
            case 'scroll':
                this._scroll(e);
                break;
            case 'resize':
                this._resize(e);
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