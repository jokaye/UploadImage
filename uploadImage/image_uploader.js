var NS = Y.namespace('com.javcly.designer.utils');

NS.ImageUploader = Y.Base.create('designer_image_uploader', Y.Widget, [], {

    initializer : function() {

        this.set('uploader', new Y.Uploader({
            width : '100px',
            height : '30px',
            multipleFiles : true,
            swfURL : '/javcly/designer/flashuploader.swf',
            retryCount : 1,
            errorAction : Y.Uploader.Queue.RESTART_AFTER
        }));

        var uploader = this.get('uploader');
        uploader.after('fileselect', this.getPreviewImages, this);

        uploader.on('uploadcomplete', function(e) {
            var data = Y.JSON.parse(e.data);
            this.showPreviewImage(e.file.get('id'), data.tempFileKey, data.tempThumbnailFileKey, parseInt(data.width), parseInt(data.height));
        }, this);

        uploader.on('uploaderror', this.onCreatePreviewError, this);

        this.publish('allUploadsComlete');

        this.on('designer_image_uploader_image:destroy', this.removeImage, this);

        this.on('designer_image_uploader_image:uploadStart', this.onImageUploadStart, this);
        this.after('designer_image_uploader_image:uploadComplete', this.onImageUploadComplete, this);

    },

    onImageUploadStart : function() {

        this.set('inProgressUploads', this.get('inProgressUploads') + 1);
    },

    onImageUploadComplete : function(e) {

        var inProgressUploads = this.get('inProgressUploads');

        inProgressUploads--;
        if (inProgressUploads <= 0) {
            if (this.get('uploader').get('fileList').length == 0) {
                this.fire('allUploadsComlete');
            }

            inProgressUploads = 0;
        }
        this.set('inProgressUploads', inProgressUploads);
    },

    removeImage : function(e) {
        var fileList = this.get('uploader').get('fileList');

        var fileToRemove = e.target.get('file');

        var imagePreviewList = this.get('imagePreviewList');

        var fileId = fileToRemove.get('id');
        imagePreviewList[fileId].destroy();
        delete imagePreviewList[fileId];

        for (var key in fileList) {
            if (fileToRemove == fileList[key]) {
                fileList.splice(key, 1);
                this.get('uploader').set('fileList', fileList);
                break;
            }

        }

    },
    clearAllUploads : function() {

        var uploader = this.get('uploader');

        var fileList = uploader.get('fileList');

        var uploadQueue = uploader.queue;
        if (uploadQueue) {
            uploadQueue.cancelUpload();
            uploadQueue.destroy();
        }
        for (var key in fileList) {
            var file = fileList[key];
            file.destroy();
        }

        fileList.splice(0, fileList.length);
        this.get('uploader').set('fileList', fileList);

        var imagePreviewList = this.get('imagePreviewList');
        for (var key in imagePreviewList) {
            imagePreviewList[key].destroy();
            delete imagePreviewList[key];
        }
        imagePreviewList = {};
    },

    renderUI : function() {
        var previewContent = Y.Node.create('<div id="preview"><p id="uploadTitle">'+Translator.get('designer.upload')+'</p><div id="uploadContent"><div id="imageContent"></div><button id="upload">'+Translator.get('designer.upload')+'</button><button id="clearAllUpload">'+Translator.get('designer.clearAll')+'</button></div></div>');

        var srcNode = this.get('srcNode');

        srcNode.append(previewContent);
        this.get('uploader').render('#uploadContent');

        srcNode.one('#upload').on('click', function() {

            var fileListLength = this.get('uploader').get('fileList').length;
            if (fileListLength != 0) {
                this.uploadAll();

            }
        }, this);

        srcNode.one('#clearAllUpload').on('click', function() {
            this.clearAllUploads();
        }, this);

    },

    uploadAll : function() {
        var imagePreviewList = this.get('imagePreviewList');
        for (var key in imagePreviewList) {
            imagePreviewList[key].upload();
        }

    },

    getPreviewImages : function(e) {

        var fileList = e.fileList;
        var container = this.get('srcNode').one('#imageContent');
        for (var key in fileList) {
            this.addPreviewImage(fileList[key]);
        }

        var uploader = this.get('uploader');
        var currentQueue = uploader.queue;

        if (currentQueue) {
            currentQueue.cancelUpload();
            currentQueue.destroy();
        }

        uploader.queue = null;

        uploader.uploadThese(e.fileList, "/javcly/designer/upload/createThumbnailForPreview.jspx");
    },

    onCreatePreviewError : function(e) {

        var fileId = e.file.get('id');

        var image = this.get('imagePreviewList')[fileId];

        image.showInvalid();

    },

    addPreviewImage : function(file) {

        var container = this.get('srcNode').one('#imageContent');
        var image = new NS.Image({
            container : container,
            file : file
        });

        this.get('imagePreviewList')[file.get('id')] = image;
        image.addTarget(this);
        image.render();

    },

    showPreviewImage : function(fileId, tempFileKey, tempThumbnailFileKey, width, height) {
        var image = this.get('imagePreviewList')[fileId];

        image.set('tempFileKey', tempFileKey);
        image.set('tempThumbnailFileKey', tempThumbnailFileKey);
        image.set('imageWidth', width);
        image.set('imageHeight', height);
        image.show();
    },

    destructor : function() {

        var imagePreviewList = this.get('imagePreviewList');

        for (var key in imagePreviewList) {
            imagePreviewList[key].destroy();
            delete imagePreviewList[key];
        }

        this.get('uploader').destroy();
    }
}, {
    ATTRS : {
        uploader : null,
        imagePreviewList : {
            value : {}
        },

        inProgressUploads : {
            value : 0
        }

    }

});

