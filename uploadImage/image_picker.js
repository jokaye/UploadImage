var NS = Y.namespace('com.javcly.designer.utils');

NS.ImagePicker = Y.Base.create('designer_image_picker', Y.Widget, [], {

    initializer : function() {
        var uploader = new NS.ImageUploader();
        var albumn = new NS.ImageAlbumn({
            multiSelect : this.get('multiSelect')
        });

        this.set('uploader', uploader);
        this.set('albumn', albumn);
        uploader.addTarget(this);
        albumn.addTarget(this);

        this.on('designer_image_uploader:allUploadsComlete', function() {

            this.switchView('albumn');
            this.get('albumn').load();
        }, this);

        this.on('designer_image_albumn:needUpload', function() {
            this.switchView('preview');
        }, this);

    },

    renderUI : function() {
        var imagePicker = Y.Node.create('<div id="imagePicker"></div>')

        var uploader = this.get('uploader');
        uploader.render();

        var albumn = this.get('albumn');
        albumn.render();

        this.get('srcNode').append(imagePicker);
        imagePicker.append(uploader.get('boundingBox'));
        imagePicker.append(albumn.get('boundingBox'));

        uploader.get('srcNode').one('#preview').addClass('darkLayer');
        var switchHeight = this.set('switchHeight', (this.get('srcNode').one('#albumnContent').getStyle('height')));
        this.selectAlbumView();
        // change the view between albumn and uploader
    },

    switchView : function(view) {

        var albumnBox = this.get('srcNode').one('#albumn_box');
        var previewBox = this.get('srcNode').one('#preview');

        var anim = this.get('anim');

        if (view == 'albumn') {

            anim.set('to', {
                height : 0
            });

            this.set('animStatus', false);
        } else {

            anim.set('to', {
                height : this.get('switchHeight')
            });

            this.set('animStatus', true);
        }

        anim.on('end', function() {//set style after animation run
            if (view == 'preview') {

                albumnBox.addClass('darkLayer');
                if (previewBox.hasClass('darkLayer')) {
                    previewBox.removeClass('darkLayer');
                };
            } else if (view == 'albumn') {

                previewBox.addClass('darkLayer');
                if (albumnBox.hasClass('darkLayer')) {
                    albumnBox.removeClass('darkLayer');
                };
            }
            ;

        });

        anim.run();

    },

    selectAlbumView : function() {

        var anim = new Y.Anim({
            node : '#uploadContent',
            to : {
                height : 0
            },
            easing : 'backIn',
            duration : 0.4
        });

        this.set('anim', anim);
        var srcNode = this.get('srcNode');

        srcNode.one('#uploadTitle').on('click', function() {
            this.switchView('preview');
        }, this);

        srcNode.one('#albumnTitle').on('click', function() {

            if (this.get('animStatus')) {
                this.switchView('albumn');
            }
        }, this);

    },

    destructor : function() {
        this.get('uploader').destroy();
        this.get('albumn').destroy();
        this.get('anim').destroy();
    }
}, {
    ATTRS : {
        uploader : null,
        albumn : null,
        animStatus : {
            value : false
        },
        multiSelect : {
            value : true
        },
        anim : null,
        switchHeight : null
    }

});

