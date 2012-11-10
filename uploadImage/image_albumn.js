var NS = Y.namespace('com.javcly.designer.utils');

NS.ImageAlbumn = Y.Base.create('designer_image_albumn', Y.Widget, [], {

    initializer : function() {

        this.publish('needUpload');
        this.publish('confirmSelection');
        this.publish('cancel_upload');
        this.on('designer_albumn_image:confirmRemove', this.removeImage, this);

        this.on('designer_albumn_image:select', this.onImageSelect, this);
        this.on('designer_albumn_image:deselect', this.onImageDeselect, this);
    },

    renderUI : function() {
        var container = Y.Node.create('<div id="albumn_box"><p id="albumnTitle">'+Translator.get('designer.albumn')+'</p><div id="albumnContent"><div id="albumn_image_box"><div id="check_albumn_list"></div></div><button id="image_insert">'+Translator.get('designer.insert')+'</button><button class="albumn_box_cancel">'+Translator.get('designer.cancel')+'</button><div class="albumn_box_paginator"></div></div></div>')
        var srcNode = this.get('srcNode');
        var check_albumn_list = container.one('#check_albumn_list');
        srcNode.append(container);

        this.load();

        srcNode.one('#image_insert').on('click', function() {
            this.confirmSelection();
        }, this);

        srcNode.one('#albumn_image_box').delegate('dblclick', function() {
            this.dbConfirmSelection();
        }, '.img_control_box', this);

        check_albumn_list.on('click', function() {// add the upload icon
            if (check_albumn_list.hasClass('add_image_icon')) {
                this.fire('needUpload');
            }
        }, this);

        srcNode.one('.albumn_box_cancel').on('click', function() {
            this.fire('cancel_upload')
        }, this);
    },

    onImageSelect : function(e) {

        if (this.get('multiSelect')) {
            return;
        }

        var currentSelected = this.get('currentSelected');

        if (currentSelected) {
            if (e.target != currentSelected) {
                currentSelected.deselect();
                this.set('currentSelected', e.target);
            }

        } else {
            this.set('currentSelected', e.target);
        }

    },

    onImageDeselect : function(e) {
        if (this.get('multiSelect')) {
            return;
        }

        if (this.get('currentSelected') == e.target) {
            this.set('currentSelected', null);
        }

    },

    confirmSelection : function() {
        var selected = [];

        if (this.get('multiSelect')) {
            var curImages = this.get('imagesList');
            for (var key in curImages) {
                if (curImages[key].get('selected')) {
                    selected.push(curImages[key]);
                }
            }
        } else {
            selected.push(this.get('currentSelected'));

        }
        this.fire('confirmSelection', {
            selectedImages : selected
        });

    },

    dbConfirmSelection : function(e) {
        var selected = [];
        selected.push(this.get('currentSelected'));
        this.fire('confirmSelection', {
            selectedImages : selected
        });
    },
    removeImage : function(e) {

        var paginator = this.get('paginator'), totalRecords = paginator.get('totalRecords');
        if (totalRecords == 0) {
            this.get('srcNode').one('#check_albumn_list').addClass('add_image_icon').show();
        };
        paginator.set('totalRecords', totalRecords - 1);

        var currentIndex = paginator.getCurrentPage() - 1, itemsPerPage = this.get('imagesPerPage'), shouldLoadPreviousPage = currentIndex > 0 && paginator.get('totalRecords') == itemsPerPage * currentIndex;

        if (shouldLoadPreviousPage) {
            this._load('prev');
        } else {
            this._load('current');
        }

    },

    insertImage : function(identifier, fileName, thumbnailWidth, thumbnailHeight) {
        this.get('srcNode').one('#check_albumn_list').removeClass('add_image_icon').hide()
        this._loadOne(identifier);
        console.log(identifier);
    },

    _load : function(orientation) {

        var url, data, currentImagesList = this.get('imagesList'), imagesSize = currentImagesList.length, page = this.get('currentPage'), imageList = [], imagesPerPage = this.get('imagesPerPage'), srcNode = this.get('srcNode'), check_albumn_list = srcNode.one('#check_albumn_list'), rendered = this.get('rendered');

        if ('next' == orientation) {
            if (imagesSize > 0) {
                url = '/javcly/designer/upload/next.jspx';
                data = {
                    limit : imagesPerPage,
                    toOrder : currentImagesList[imagesSize - 1].get('order')
                };

                page += 1;
            }
        } else if ('prev' == orientation) {
            if (imagesSize > 0) {

                url = '/javcly/designer/upload/prev.jspx';
                data = {
                    limit : imagesPerPage,
                    fromOrder : currentImagesList[0].get('order')
                };

                page -= 1;
            }
        } else if ('current' == orientation) {
            if (imagesSize > 0) {
                url = '/javcly/designer/upload/current.jspx';
                data = {
                    limit : imagesPerPage,
                    fromOrder : currentImagesList[0].get('order')
                }
            }
        } else {
            url = '/javcly/designer/upload/list.jspx';
            data = {
                limit : imagesPerPage
            }
            page = 1;

        }

        Y.io(url, {
            method : 'GET',
            context : this,
            data : data,
            on : {
                start : function() {
                    check_albumn_list.addClass('load_image_list_icon');
                },
                complete : function() {
                    check_albumn_list.removeClass('load_image_list_icon');

                    var response = Y.JSON.parse(arguments[1].responseText), currentImagesList = this.get('imagesList'), boolean
                    initalLoad = !currentImagesList || currentImagesList.length == 0

                    imageList = response.images;

                    this.set('total', response.total);
                    var paginator = this.get('paginator');
                    if (paginator) {
                        paginator.set('totalRecords', response.total);
                    }

                    if (imageList.length == 0) {
                        check_albumn_list.addClass('add_image_icon');
                    } else {
                        check_albumn_list.hide();
                    }

                    var albumnBox = this.get('boundingBox').one('#albumn_image_box');

                    for (var key in imageList) {
                        var data = imageList[key];
                        if (!initalLoad) {
                            var currentImage = currentImagesList[key];
                            if (currentImage) {
                                currentImage.updateAttrs(data);
                            } else {
                                this.addImage({
                                    container : albumnBox,
                                    identifier : data.identifier,
                                    fileName : data.fileName || '',
                                    imageWidth : parseInt(data.thumbnailWidth),
                                    imageHeight : parseInt(data.thumbnailHeight),
                                    realWidth : parseInt(data.width),
                                    realHeight : parseInt(data.height),
                                    order : data.order
                                });

                            }

                        } else {

                            this.addImage({

                                container : albumnBox,
                                identifier : data.identifier,
                                fileName : data.fileName || '',
                                imageWidth : parseInt(data.thumbnailWidth),
                                imageHeight : parseInt(data.thumbnailHeight),
                                realWidth : parseInt(data.width),
                                realHeight : parseInt(data.height),
                                order : data.order
                            });

                            this.setPaginator();

                        }
                        // set current albumn image list
                    }

                    if (rendered && currentImagesList.length > imageList.length) {
                        for (var i = currentImagesList.length - 1; i >= imageList.length; i--) {
                            currentImagesList[i].hide();
                        }

                    }

                    this.get('paginator').setPage(page, true);
                    this.set('currentPage', page);
                }
            }
        });

    },

    addImage : function(config) {

        var image = new NS.AlbumnImage(config);

        image.render();
        image.show();
        image.addTarget(this);

        this.get('imagesList').push(image);

    },

    setPaginator : function() {
        if (this.get('paginator')) {
            return;
        }
        var total = this.get('total');
        var imagesPerPage = this.get('imagesPerPage');

        var p = new Y.Paginator({
            totalRecords : total,
            rowsPerPage : imagesPerPage,
            template : '{PreviousPageLink} {NextPageLink}'
        });

        p.on('changeRequest', function(state) {//set page change in DOM

            var orientation = state.page > this.get('currentPage') ? 'next' : 'prev';
            this._load(orientation);

        }, this);

        p.render(this.get('srcNode').one('.albumn_box_paginator'));
        this.set('paginator', p);

    },

    _loadOne : function(identifier) {

        Y.io('/javcly/designer/upload/' + identifier + '/get.jspx', {
            method : 'GET',
            context : this,
            on : {
                complete : function() {

                    var data = Y.JSON.parse(arguments[1].responseText);

                    var image = new NS.AlbumnImage({

                        container : this.get('boundingBox').one('#albumn_image_box'),
                        identifier : identifier,
                        fileName : data.fileName,
                        imageWidth : parseInt(data.thumbnailWidth),
                        imageHeight : parseInt(data.thumbnailHeight),
                        realWidth : parseInt(data.width),
                        realHeight : parseInt(data.height),
                        order : data.order

                    });
                    image.render();
                    image.show();
                    image.addTarget(this);

                    this.get('imagesList').push(image);
                    var val = this.get('paginator').get('totalRecords');
                    this.get('paginator').set('totalRecords', val + 1);
                }
            }
        });
    },

    load : function(identifier) {
        if (identifier) {
            this._loadOne(identifier);
        } else {
            this._load();
        }

    },

    destructor : function() {
        var imagesList = this.get('imagesList');
        for (var key in imagesList) {
            imagesList[key].destroy();
            delete imagesList[key];
        }
    }
}, {
    ATTRS : {

        imagesList : {
            value : []
        },

        multiSelect : {
            value : true
        },

        currentSelected : null,
        total : {
            value : 0
        },
        paginator : null,
        imagesPerPage : {
            value : 8
        },
        currentPage : {
            value : 1
        }
    }

});

