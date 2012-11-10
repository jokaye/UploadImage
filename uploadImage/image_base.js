var NS = Y.namespace('com.javcly.designer.utils');

var MAX_WIDTH = 100, MAX_HEIGHT = 100;

NS.ImageBase = Y.Base.create('designer_image_base', Y.Widget, [], {

    initializer : function() {
        this.publish('removeImage');
        this.publish('select');

    },

    renderUI : function() {

        var template = '<div class="imgBox" title="{fileName}"><div class="removeImageIcon"></div><div class="img_control_box"><img width="{width}" height="{height}" src="../../images/throbber.gif" tempFileKey="" /></div><p>{fileName}</p></div>'
        var imgNode = Y.Node.create(Y.substitute(template, {
            width : MAX_WIDTH,
            height : MAX_HEIGHT,
            fileName : this.get('fileName') || this.get('file').get('name') || ''
        }));
        this.get('srcNode').append(imgNode);
        var container = this.get('container')
        if (container) {
            container.append(this.get('boundingBox'));
        }

        if (this.get('showRemoveIconOnHover')) {
            imgNode.on('mouseover', this.onImgMouseover, this);
            imgNode.on('mouseout', this.onImgMouseout, this);
        }
        imgNode.one('.removeImageIcon').on('click', function(e) {
            this.fire('removeImage');
        }, this);

        imgNode.one('.img_control_box').on('click', function() {
            this.fire('select');
        }, this);

    },

    onImgMouseover : function(e) {
        this.get('srcNode').one('.removeImageIcon').setStyle('display', 'block');
    },

    onImgMouseout : function(e) {
        this.get('srcNode').one('.removeImageIcon').hide();
    },

    showInvalid : function() {
        var imageBox = this.get('srcNode').one('img');
        imageBox.set('src', 'images/clipping_picture.png');
    },

    show : function() {

        var width = this.get('imageWidth');
        var height = this.get('imageHeight');

        var image = this.generateImage(width, height);

        var node = this.get('srcNode');
        var throbber = node.one('img');
        var imgControlBox = node.one('.img_control_box');

        var instance = this;

        image.onload = function() {
            instance.onImageLoad();
            imgControlBox.replaceChild(image, throbber);
            image.onload = null;
        }
    },

    generateImage : function() {

    },

    onImageLoad : function() {

    }
}, {
    ATTRS : {
        container : null,
        fileName : null,
        imageWidth : null,
        imageHeight : null,
        showRemoveIconOnHover : {
            value : true
        }

    }

});

