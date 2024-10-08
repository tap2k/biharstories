define([
    "jquery",
    "underscore",
    "handlebars",
    "marionette",
    "text!../../templates/story-detail.html",
    "text!../../templates/story-detail-zoom.html",
    "hammerjs",
    "jquery-hammerjs"
], function ($, _, Handlebars, Marionette, StoryTemplate, StoryZoomTemplate, Hammer) {
    "use strict";
    var StoryDetail = Marionette.ItemView.extend({
        events: {
            'click .zoom': 'zoomToMarker',
            'click .close-btn': 'closeZoom',
            'click .previous-place': 'previous',
            'click .next-place': 'next',
            'click .previous-place-zoom': 'previous',
            'click .next-place-zoom': 'next',
            'click .mobile-panel': 'zoomToStory',
            'click #play': 'toggle',
            'click #progress': 'seek',
            //'click .photo-container': 'toggle',
        },
        template: Handlebars.compile(StoryTemplate),
        initialize: function (opts) {
            _.extend(this, opts);
            Marionette.ItemView.prototype.initialize.call(this);
            if (this.isFullScreen) {
                this.template = Handlebars.compile(StoryZoomTemplate);
            } else {
                this.template = Handlebars.compile(StoryTemplate);
            }
        },
        showSheet: function (e) {
            if ($(document).width() > 700) { return; }
            this.app.vent.trigger('load-panel', this.model.get("id"), true);
            if (e) { e.preventDefault(); }
        },
        hideSheet: function (e) {
            this.app.vent.trigger('load-panel', this.model.get("id"), false);
            this.model.trigger("center-marker");
            if (e) { e.preventDefault(); }
        },
        onRender: function () {
            this.addSwipeHandlers();
            var player = this.$el.find('#player').get(0);
            player.addEventListener("timeupdate", this.onTimeUpdate);
        },
        checkIfIsFullScreen: function () {
            return this.$el.find(".mobile-sheet").length > 0;
        },
        addSwipeHandlers: function () {
            //http://stackoverflow.com/questions/30079136/how-to-get-hammer-js-to-work-with-backbone
            //https://github.com/wookiehangover/backbone.hammer/issues/2
            var that = this, div, hammerMain;
            //idea: if fullscreen, div should be image
            div = this.$el.find('.story-detail').get(0);
            if (this.isFullScreen) {
                div = this.$el.find('.zoom-photo-container').get(0);
            }
            if (div) {
                hammerMain = new Hammer(div, {inputClass: Hammer.TouchInput});
                hammerMain.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
                hammerMain.on('swipeleft', function () {
                    that.next();
                });
                hammerMain.on('swiperight', function () {
                    that.previous();
                });
                hammerMain.on('swipeup', function () {
                    that.showSheet();
                });
                hammerMain.on('swipedown', function () {
                    that.hideSheet();
                });
            }
        },
        navigate: function (url, index) {
            var model = this.model.collection.at(index);
            this.app.router.navigate(url + model.get("id"), {trigger: true});
        },
        previous: function (e) {
            var url = this.isFullScreen ? "places/zoom/" : "places/",
                i = this.model.collection.indexOf(this.model);
            this.navigate(url, (i == 0) ? this.model.collection.length - 1 : i - 1);
            if (e) { e.preventDefault(); }
        },
        next: function (e) {
            var url = this.isFullScreen ? "places/zoom/" : "places/",
                i = this.model.collection.indexOf(this.model);
            this.navigate(url, (i == this.model.collection.length - 1) ? 0 : i + 1);
            if (e) { e.preventDefault(); }
        },
        zoomToStory: function (e) {
            this.app.router.navigate("places/zoom/" + this.model.get("id"), {trigger: true});
            if (e) { e.preventDefault(); }
        },
        closeZoom: function (e) {
            this.app.router.navigate("places/" + this.model.get("id"), {trigger: true});
            if (e) { e.preventDefault(); }
        },
        onShow: function () {
            this.model.trigger("center-marker");
        },
        zoomToMarker: function (e) {
            var zoom = $(e.target).attr("zoom-level");
            if (!zoom) {
                alert("Please give your zoom a \"zoom-level\" attribute.");
            }
            this.model.trigger('zoom-to-marker', zoom);
            if (e) { e.preventDefault(); }
        },
        toggle: function (e) {
            var player = this.$el.find('#player').get(0);
            var play = this.$el.find('#play').get(0);
            if (!player.paused)
            {
                play.classList.remove("pause");
                player.pause();
            }
            else
            {
                play.classList.add("pause");
                player.play();
            }
            if (e) { e.preventDefault(); }
        },
        seek: function (e) {
            var player = this.$el.find('#player').get(0);
            var elem = document.getElementById('progress');
            var percentage = Math.floor((e.offsetX / elem.offsetWidth) * 100);
            player.currentTime  = player.duration*(percentage/100);
            if (e) { e.preventDefault(); }
        },
        onTimeUpdate: function(e){
            var percent = this.currentTime/this.duration*100;
            var elem = document.getElementById('progress').children[0];
            elem.style.width = percent + "%";
            if (e) { e.preventDefault(); }
        }
    });
    return StoryDetail;
});